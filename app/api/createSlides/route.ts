import { google } from "googleapis";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";

type SlideItem = {
  title: string;
  content: string;
};

const oauth2Client = new google.auth.OAuth2(
  process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID,
  process.env.GOOGLE_CLIENT_SECRET,
  "postmessage"
);


function normalizeSlidesContent(raw: unknown): SlideItem[] {
  let parsed: any = raw;

  if (typeof parsed === "string") {
    try {
      parsed = JSON.parse(parsed);
    } catch {
      return [];
    }
  }

  const slides = Array.isArray(parsed) ? parsed : parsed?.slides;

  if (!Array.isArray(slides)) return [];

  return slides
    .map((slide: any) => ({
      title: String(slide?.title ?? "").trim(),
      content: String(slide?.content ?? "").trim(),
    }))
    .filter((slide: SlideItem) => slide.title.length > 0 || slide.content.length > 0);
}

function chunkArray<T>(arr: T[], size: number): T[][] {
  const chunks: T[][] = [];
  for (let i = 0; i < arr.length; i += size) {
    chunks.push(arr.slice(i, i + size));
  }
  return chunks;
}

function getPlaceholderShapeId(
  slide: any,
  types: string[]
): string | undefined {
  return slide?.pageElements?.find(
    (el: any) => types.includes(el?.shape?.placeholder?.type)
  )?.objectId;
}

export async function POST(req: Request) {
  try {
    const { code, title, content, activeUser } = await req.json();

    const email = activeUser?.email;
    if (!email) {
      return NextResponse.json({ error: "No user email provided" }, { status: 400 });
    }

    const cookieStore = await cookies();
    let credentialsReady = false;

    if (code) {
      const { tokens } = await oauth2Client.getToken(code);
      oauth2Client.setCredentials(tokens);

      const oauth2 = google.oauth2({ version: "v2", auth: oauth2Client });
      const { data: userInfo } = await oauth2.userinfo.get();

      if (userInfo.email !== email) {
        return NextResponse.json(
          { needsLogin: true, reason: "account_mismatch" },
          { status: 401 }
        );
      }

      if (tokens.refresh_token) {
        cookieStore.set(`google_refresh_token_${email}`, tokens.refresh_token, {
          httpOnly: true,
          secure: process.env.NODE_ENV === "production",
          maxAge: 60 * 60 * 24 * 30,
          path: "/",
          sameSite: "lax",
        });
      }

      credentialsReady = true;
    }

    if (!credentialsReady) {
      const refreshToken = cookieStore.get(
        `google_refresh_token_${email}`
      )?.value;

      if (!refreshToken) {
        return NextResponse.json(
          { needsLogin: true, reason: "no_token" },
          { status: 401 }
        );
      }

      try {
        oauth2Client.setCredentials({ refresh_token: refreshToken });
        const accessTokenRes = await oauth2Client.getAccessToken();
        if (!accessTokenRes.token) throw new Error("No access token");

        const oauth2 = google.oauth2({ version: "v2", auth: oauth2Client });
        const { data: userInfo } = await oauth2.userinfo.get();

        if (userInfo.email !== email) {
          cookieStore.delete(`google_refresh_token_${email}`);
          return NextResponse.json(
            { needsLogin: true, reason: "account_mismatch" },
            { status: 401 }
          );
        }
      } catch {
        cookieStore.delete(`google_refresh_token_${email}`);
        return NextResponse.json(
          { needsLogin: true, reason: "invalid_token" },
          { status: 401 }
        );
      }
    }

    const slidesApi = google.slides({ version: "v1", auth: oauth2Client });

    const presentation = await slidesApi.presentations.create({
      requestBody: { title },
    });

    const presentationId = presentation.data.presentationId;
    if (!presentationId) {
      throw new Error("No se pudo crear la presentación");
    }

    const slidesData = normalizeSlidesContent(content);

    if (!slidesData.length) {
      return NextResponse.json({
        url: `https://docs.google.com/presentation/d/${presentationId}/edit`,
      });
    }

    // Leer la presentación inicial para obtener el ID de la primera diapositiva
    const initialPresentation = await slidesApi.presentations.get({ presentationId });
    const defaultSlideId = initialPresentation.data.slides?.[0]?.objectId;

    if (!defaultSlideId) {
      throw new Error("No se pudo obtener la diapositiva inicial");
    }

    const createSlideRequests: any[] = [];
    for (let i = 1; i < slidesData.length; i++) {
      createSlideRequests.push({
        createSlide: {
          objectId: `generated_slide_${i}`,
          slideLayoutReference: { predefinedLayout: "TITLE_AND_BODY" },
        },
      });
    }

    if (createSlideRequests.length > 0) {
      await slidesApi.presentations.batchUpdate({
        presentationId,
        requestBody: { requests: createSlideRequests },
      });
    }

    const updatedPresentation = await slidesApi.presentations.get({ presentationId });

    const slidesById = new Map<string, any>(
      (updatedPresentation.data.slides ?? []).map((slide: any) => [slide.objectId, slide])
    );

    const insertRequests: any[] = [];

    slidesData.forEach((item, index) => {
      const slideId = index === 0 ? defaultSlideId : `generated_slide_${index}`;
      const currentSlide = slidesById.get(slideId);

      if (!currentSlide) return;

      const titleShapeId = getPlaceholderShapeId(currentSlide, [
        "TITLE",
        "CENTERED_TITLE",
      ]);

      const bodyShapeId = getPlaceholderShapeId(currentSlide, [
        "BODY",
        "SUBTITLE",
      ]);

      if (titleShapeId && item.title) {
        insertRequests.push({
          deleteText: {
            objectId: titleShapeId,
            textRange: { type: "ALL" },
          },
        });

        insertRequests.push({
          insertText: {
            objectId: titleShapeId,
            insertionIndex: 0,
            text: item.title,
          },
        });
      }

      if (bodyShapeId && item.content) {
        insertRequests.push({
          deleteText: {
            objectId: bodyShapeId,
            textRange: { type: "ALL" },
          },
        });

        insertRequests.push({
          insertText: {
            objectId: bodyShapeId,
            insertionIndex: 0,
            text: item.title,
          },
        });
      }
    });

    for (const chunk of chunkArray(insertRequests, 50)) {
      await slidesApi.presentations.batchUpdate({
        presentationId,
        requestBody: { requests: chunk },
      });
    }

    return NextResponse.json({
      url: `https://docs.google.com/presentation/d/${presentationId}/edit`,
    });
  } catch (error: any) {
    console.error("Error creating slides:", error);
    return NextResponse.json(
      { error: error.message ?? "Unknown error" },
      { status: 500 }
    );
  }
}