import { google } from "googleapis";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";

const oauth2Client = new google.auth.OAuth2(
  process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID,
  process.env.GOOGLE_CLIENT_SECRET,
  "postmessage"
);

export async function POST(req: Request) {
  try {
    const { code, title, content, activeUser } = await req.json();

    console.log(content)

    const email = activeUser?.email;
    if (!email) {
      return NextResponse.json({ error: "No user email provided" }, { status: 400 });
    }

    const cookieStore = await cookies();

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
    }

    const refreshToken = cookieStore.get(`google_refresh_token_${email}`)?.value;

    if (!refreshToken) {
      return NextResponse.json({ needsLogin: true, reason: "no_token" }, { status: 401 });
    }

    // ── 3. Validar que el token pertenece a la cuenta correcta ────────────────
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

    // ── 4. Autenticar y crear la presentación ────────────────────────────────
    oauth2Client.setCredentials({ refresh_token: refreshToken });
    const slides = google.slides({ version: "v1", auth: oauth2Client });

    const presentation = await slides.presentations.create({
      requestBody: { title },
    });

    const presentationId = presentation.data.presentationId;

    if (!presentationId){
      throw new Error("No se pudo crear la presentación")
    }

    if (content && Array.isArray(content) && presentationId) {

      // PASO 1: Crear las diapositivas restantes (la 0 usa la diapositiva por defecto)
      const createSlidesRequests: any[] = [];
      for (let i = 1; i < content.length; i++) {
        createSlidesRequests.push({
          createSlide: {
            objectId: `generated_slide_${i}`,
            slideLayoutReference: { predefinedLayout: "TITLE_AND_BODY" },
          },
        });
      }

      if (createSlidesRequests.length > 0) {
        await slides.presentations.batchUpdate({
          presentationId,
          requestBody: { requests: createSlidesRequests },
        });
      }

      // PASO 2: Obtener la presentación actualizada para leer los IDs de los cuadros de texto
      const updatedPresentation = await slides.presentations.get({ presentationId });

      const insertTextRequests: any[] = [];

      content.forEach((item, index) => {
        const currentSlide = updatedPresentation.data.slides?.[index];

        if (currentSlide && currentSlide.pageElements) {
          const titleShape = currentSlide.pageElements.find(
            (el) => el.shape?.placeholder?.type === "TITLE" || el.shape?.placeholder?.type === "CENTERED_TITLE"
          );

          const bodyShape = currentSlide.pageElements.find(
            (el) => el.shape?.placeholder?.type === "BODY" || el.shape?.placeholder?.type === "SUBTITLE"
          );

          if (titleShape?.objectId) {
            insertTextRequests.push({
              insertText: {
                objectId: titleShape.objectId,
                text: item.title,
              },
            });
          }

          if (bodyShape?.objectId) {
            insertTextRequests.push({
              insertText: {
                objectId: bodyShape.objectId,
                text: item.content,
              },
            });
          }
        }
      });

      // PASO 3: Ejecutar la inserción de texto
      if (insertTextRequests.length > 0) {
        await slides.presentations.batchUpdate({
          presentationId,
          requestBody: { requests: insertTextRequests },
        });
      }
    }

    return NextResponse.json({
      url: `https://docs.google.com/presentation/d/${presentationId}/edit`,
    });
  } catch (error: any) {
    console.error("Error creating slides:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}