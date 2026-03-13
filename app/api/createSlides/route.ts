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
    const { code, title, content } = await req.json();
    const cookieStore = await cookies();
    let refreshToken = cookieStore.get("google_refresh_token")?.value;

    if (code) {
      const { tokens } = await oauth2Client.getToken(code);
      if (tokens.refresh_token) {
        refreshToken = tokens.refresh_token;
        cookieStore.set("google_refresh_token", refreshToken, {
          httpOnly: true,
          secure: process.env.NODE_ENV === "production",
          maxAge: 60 * 60 * 24 * 30,
          path: "/",
        });
      }
    }

    if (!refreshToken) return NextResponse.json({ needsLogin: true }, { status: 401 });

    oauth2Client.setCredentials({ refresh_token: refreshToken });
    const slides = google.slides({ version: "v1", auth: oauth2Client });

    // 1. Crear la presentación
    const presentation = await slides.presentations.create({
      requestBody: { title },
    });

    const presentationId = presentation.data.presentationId;

    if (content && presentationId) {
        
      const getPres = await slides.presentations.get({ presentationId });
        const firstSlide = getPres.data.slides?.[0];
  // Buscamos el primer elemento que acepte texto (normalmente el título)
        const elementId = firstSlide?.pageElements?.find(el => el.shape)?.objectId;

      if (elementId) {
        await slides.presentations.batchUpdate({
          presentationId,
          requestBody: {
            requests: [
              {
                insertText: {
                  objectId: elementId,
                  text: content,
                },
              },
            ],
          },
        });
      }
    }

    return NextResponse.json({
      url: `https://docs.google.com/presentation/d/${presentationId}/edit`,
    });
  } catch (error: any) {
    console.error(error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}