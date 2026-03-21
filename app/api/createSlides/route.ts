import { google } from "googleapis";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";

const oauth2Client = new google.auth.OAuth2(
  process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID,
  process.env.GOOGLE_CLIENT_SECRET,
  process.env.GOOGLE_REDIRECT_URI,
);

export async function POST(req: Request) {
  try {
    const { code, title, content } = await req.json();

    const cookieStore = await cookies();
    let refreshToken = process.env.GOOGLE_REFRESH_TOKEN || cookieStore.get("google_refresh_token")?.value;

    if (!refreshToken && code) {
      const { tokens } = await oauth2Client.getToken(code);
      if (tokens.refresh_token) {
        refreshToken = tokens.refresh_token;
        
        cookieStore.set("google_refresh_token", refreshToken, {
          httpOnly: true,
          secure: process.env.NODE_ENV === "production",
          maxAge: 60 * 60 * 24 * 30, // 30 días
          path: "/",
        });
      }
    }

    if (!refreshToken) {
      return NextResponse.json({ needsLogin: true }, { status: 401 });
    }

    // 4. Autenticar silenciosamente
    oauth2Client.setCredentials({ refresh_token: refreshToken });
    const slides = google.slides({ version: "v1", auth: oauth2Client });

    // 5. Crear la presentación directamente
    const presentation = await slides.presentations.create({
      requestBody: { title },
    });

    const presentationId = presentation.data.presentationId;

    if (content && Array.isArray(content) && presentationId) {
      
      // PASO 1: Crear las diapositivas RESTANTES. 
      // Empezamos desde el índice 1, porque el índice 0 usará la diapositiva por defecto.
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

      // Iteramos sobre todo el contenido del JSON
      content.forEach((item, index) => {
        // Obtenemos la diapositiva correspondiente (la 0 es la de por defecto, de la 1 en adelante son las nuevas)
        const currentSlide = updatedPresentation.data.slides?.[index]; 
        
        if (currentSlide && currentSlide.pageElements) { 
          // Buscamos el cuadro de texto del TÍTULO (CENTERED_TITLE para la primera, TITLE para el resto)
          const titleShape = currentSlide.pageElements.find(
            (el) => el.shape?.placeholder?.type === "TITLE" || el.shape?.placeholder?.type === "CENTERED_TITLE"
          );
          
          // Buscamos el cuadro de texto del CUERPO (SUBTITLE para la primera, BODY para el resto)
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

      // PASO 3: Ejecutar la inserción de texto en los IDs correctos
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