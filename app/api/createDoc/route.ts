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
    const { code, title, content, format, activeUser } = await req.json();

    const email = activeUser?.email;
    if (!email) {
      return NextResponse.json(
        { error: "No user email provided" },
        { status: 400 }
      );
    }

    const cookieStore = await cookies();

    // ── 1. Si viene un code de OAuth, intercambiarlo por tokens ──────────────
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
          sameSite: "lax", // ← añade esto para evitar problemas con cookies en redirects
        });
      }

      // ← Si ya tenemos credenciales válidas desde el code, continúa directo
      //   sin pasar por la validación de refresh_token de abajo
      const existingRefresh = cookieStore.get(
        `google_refresh_token_${email}`
      )?.value;
      if (!tokens.refresh_token && !existingRefresh) {
        return NextResponse.json(
          { needsLogin: true, reason: "no_token_after_code" },
          { status: 401 }
        );
      }
    }

    // ── 2. Obtener el refresh token de este usuario específico ────────────────
    const refreshToken = cookieStore.get(
      `google_refresh_token_${email}`
    )?.value;

    // ── 3. Validar que el token pertenece a la cuenta correcta ────────────────
    try {
      oauth2Client.setCredentials({ refresh_token: refreshToken });
      const accessTokenRes = await oauth2Client.getAccessToken();

      if (!accessTokenRes.token) throw new Error("No access token");

      const oauth2 = google.oauth2({ version: "v2", auth: oauth2Client });
      const { data: userInfo } = await oauth2.userinfo.get();

      if (userInfo.email !== email) {
        // El token guardado es de otra cuenta → pedir re-auth
        cookieStore.delete(`google_refresh_token_${email}`);
        return NextResponse.json(
          { needsLogin: true, reason: "account_mismatch" },
          { status: 401 }
        );
      }
    } catch {
      // Token inválido o expirado → pedir re-auth
      cookieStore.delete(`google_refresh_token_${email}`);
      return NextResponse.json(
        { needsLogin: true, reason: "invalid_token" },
        { status: 401 }
      );
    }

    // 4. CONFIGURAR CREDENCIALES
    oauth2Client.setCredentials({ refresh_token: refreshToken });

    const docs = google.docs({ version: "v1", auth: oauth2Client });

    // 5. CREAR DOCUMENTO
    const createRes = await docs.documents.create({
      requestBody: { title },
    });

    const documentId = createRes.data.documentId;

    if (!documentId) {
      throw new Error("No documentId returned from Google Docs API");
    }

    if (content) {
      if (format === "apa") {
        const response = await docs.documents.batchUpdate({
          documentId: documentId,
          requestBody: {
            requests: [
              {
                createHeader: {
                  type: "DEFAULT",
                },
              },
            ],
          },
        });

        const replies = response.data.replies;

        if (!replies || replies.length === 0) {
          throw new Error("No replies returned");
        }

        const headerId = replies[0]?.createHeader?.headerId;

        if (!headerId) {
          throw new Error("No headerId returned");
        }

        await docs.documents.batchUpdate({
          documentId: documentId,
          requestBody: {
            requests: [
              // 1. Insertar el texto base
              {
                insertText: {
                  location: { index: 1 },
                  text: content,
                },
              },
              {
                insertText: {
                  location: {
                    index: 0,
                    segmentId: headerId,
                  },
                  text: "1", // Reemplaza con el apellido real
                },
              },
              {
                updateParagraphStyle: {
                  range: {
                    startIndex: 0,
                    endIndex: 1,
                    segmentId: headerId,
                  },
                  paragraphStyle: {
                    alignment: "END", // "END" alinea a la derecha
                  },
                  fields: "alignment",
                },
              },
              {
                updateTextStyle: {
                  range: {
                    startIndex: 0,
                    endIndex: 1, // Cubre el apellido y cualquier espacio extra
                    segmentId: headerId,
                  },
                  textStyle: {
                    fontSize: {
                      magnitude: 12,
                      unit: "PT",
                    },
                    weightedFontFamily: {
                      fontFamily: "Times New Roman",
                    },
                  },
                  fields: "weightedFontFamily,fontSize",
                },
              },
              // 2. Formato de Texto APA: Times New Roman, 12pt
              {
                updateTextStyle: {
                  range: {
                    startIndex: 1,
                    endIndex: content.length + 1,
                  },
                  textStyle: {
                    fontSize: {
                      magnitude: 12,
                      unit: "PT",
                    },
                    weightedFontFamily: {
                      fontFamily: "Times New Roman",
                    },
                  },
                  fields: "weightedFontFamily,fontSize",
                },
              },
              // 3. Formato de Párrafo APA: Alineado a la izquierda, Doble espacio y Sangría
              {
                updateParagraphStyle: {
                  range: {
                    startIndex: 1,
                    endIndex: content.length + 1,
                  },
                  paragraphStyle: {
                    alignment: "START", // APA prohíbe el justificado; debe ser a la izquierda
                    lineSpacing: 200, // Doble espacio (200%)
                    indentFirstLine: {
                      // Sangría de primera línea (0.5 pulgadas = 36pt)
                      magnitude: 36,
                      unit: "PT",
                    },
                    spaceAbove: { magnitude: 0, unit: "PT" },
                    spaceBelow: { magnitude: 0, unit: "PT" },
                  },
                  fields:
                    "alignment,lineSpacing,indentFirstLine,spaceAbove,spaceBelow",
                },
              },
            ],
          },
        });
      } else if (format === "mla") {
        const response = await docs.documents.batchUpdate({
          documentId: documentId,
          requestBody: {
            requests: [
              {
                createHeader: {
                  type: "DEFAULT",
                },
              },
            ],
          },
        });

        // Obtener el ID del encabezado creado
        const replies = response.data.replies;

        if (!replies || replies.length === 0) {
          throw new Error("No replies returned");
        }

        const headerId = replies[0]?.createHeader?.headerId;

        if (!headerId) {
          throw new Error("No headerId returned");
        }

        await docs.documents.batchUpdate({
          documentId: documentId,
          requestBody: {
            requests: [
              // Insertar contenido del documento
              {
                insertText: {
                  location: { index: 1 },
                  text: content,
                },
              },
              {
                insertText: {
                  location: {
                    index: 0,
                    segmentId: headerId,
                  },
                  text: "Apellido 1", // Reemplaza con el apellido real
                },
              },
              {
                updateParagraphStyle: {
                  range: {
                    startIndex: 0,
                    endIndex: 1,
                    segmentId: headerId,
                  },
                  paragraphStyle: {
                    alignment: "END", // "END" alinea a la derecha
                  },
                  fields: "alignment",
                },
              },
              {
                updateTextStyle: {
                  range: {
                    startIndex: 0,
                    endIndex: 11, // Cubre el apellido y cualquier espacio extra
                    segmentId: headerId,
                  },
                  textStyle: {
                    fontSize: {
                      magnitude: 12,
                      unit: "PT",
                    },
                    weightedFontFamily: {
                      fontFamily: "Times New Roman",
                    },
                  },
                  fields: "weightedFontFamily,fontSize",
                },
              },
              {
                updateTextStyle: {
                  range: {
                    startIndex: 1,
                    endIndex: 1 + content.length,
                  },
                  textStyle: {
                    fontSize: { magnitude: 12, unit: "PT" },
                    weightedFontFamily: { fontFamily: "Times New Roman" },
                  },
                  fields: "weightedFontFamily,fontSize",
                },
              },

              // Estilo de párrafo MLA
              {
                updateParagraphStyle: {
                  range: {
                    startIndex: 1,
                    endIndex: 1 + content.length,
                  },
                  paragraphStyle: {
                    alignment: "START",
                    lineSpacing: 200,
                    spaceAbove: { magnitude: 0, unit: "PT" },
                    spaceBelow: { magnitude: 0, unit: "PT" },
                  },
                  fields: "alignment,lineSpacing,spaceAbove,spaceBelow",
                },
              },

              // Márgenes
              {
                updateDocumentStyle: {
                  documentStyle: {
                    marginTop: { magnitude: 72, unit: "PT" },
                    marginBottom: { magnitude: 72, unit: "PT" },
                    marginLeft: { magnitude: 72, unit: "PT" },
                    marginRight: { magnitude: 72, unit: "PT" },
                    marginHeader: { magnitude: 36, unit: "PT" },
                  },
                  fields:
                    "marginTop,marginBottom,marginLeft,marginRight,marginHeader",
                },
              },

              // Sangría primera línea
              {
                updateParagraphStyle: {
                  range: {
                    startIndex: 1,
                    endIndex: 1 + content.length,
                  },
                  paragraphStyle: {
                    indentFirstLine: { magnitude: 36, unit: "PT" },
                  },
                  fields: "indentFirstLine",
                },
              },
            ],
          },
        });
      }
      if (format === null) {
        await docs.documents.batchUpdate({
          documentId: documentId,
          requestBody: {
            requests: [
              {
                insertText: {
                  location: { index: 1 },
                  text: content,
                },
              },
              {
                updateTextStyle: {
                  range: {
                    startIndex: 1,
                    endIndex: content.length + 1,
                  },
                  textStyle: {
                    fontSize: {
                      magnitude: 11,
                      unit: "PT",
                    },
                    weightedFontFamily: {
                      fontFamily: "Arial",
                    },
                  },
                  fields: "weightedFontFamily,fontSize",
                },
              },
              {
                updateParagraphStyle: {
                  range: {
                    startIndex: 1,
                    endIndex: content.length + 1,
                  },
                  paragraphStyle: {
                    alignment: "JUSTIFIED",
                    lineSpacing: 150,
                  },
                  fields: "alignment,lineSpacing",
                },
              },
            ],
          },
        });
      }
    }

    return NextResponse.json({
      documentId,
      url: `https://docs.google.com/document/d/${documentId}/edit`,
    });
  } catch (error: any) {
    console.error("Error:", error);

    // Si el refresh_token es revocado o inválido
    if (error.message?.includes("invalid_grant")) {
      return NextResponse.json({ needsLogin: true }, { status: 401 });
    }

    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
