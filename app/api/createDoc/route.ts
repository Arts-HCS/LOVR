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
    const { code, title, content, format } = await req.json();
    
    const cookieStore = await cookies(); 
    let refreshToken = cookieStore.get("google_refresh_token")?.value;

    if (code) {
      const { tokens } = await oauth2Client.getToken(code);
      if (tokens.refresh_token) {
        refreshToken = tokens.refresh_token;
        
        // Guardar el refresh_token de forma asíncrona
        cookieStore.set("google_refresh_token", refreshToken, {
          httpOnly: true,
          secure: process.env.NODE_ENV === "production",
          maxAge: 60 * 60 * 24 * 30,
          path: "/",
        });
      }
    }

    // 2. Verificar si tenemos el token para proceder
    if (!refreshToken) {
      return NextResponse.json({ needsLogin: true }, { status: 401 });
    }

    // 3. Autenticar y llamar a la API de Docs
    oauth2Client.setCredentials({ refresh_token: refreshToken });
    const docs = google.docs({ version: "v1", auth: oauth2Client });

    const createRes = await docs.documents.create({
      requestBody: { title },
    });
    
    const documentId = createRes.data.documentId;
    
    if (content) {
      if (format === "apa"){
        const response = await docs.documents.batchUpdate({
          documentId: documentId,
          requestBody: {
            requests: [{
              createHeader: {
                type: 'DEFAULT'
              }
            }]
          }
        });

        const headerId = response.data.replies[0].createHeader.headerId;

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
                    segmentId: headerId 
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
                    segmentId: headerId 
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
                    lineSpacing: 200,    // Doble espacio (200%)
                    indentFirstLine: {   // Sangría de primera línea (0.5 pulgadas = 36pt)
                      magnitude: 36,
                      unit: "PT",
                    },
                    spaceAbove: { magnitude: 0, unit: "PT" },
                    spaceBelow: { magnitude: 0, unit: "PT" },
                  },
                  fields: "alignment,lineSpacing,indentFirstLine,spaceAbove,spaceBelow",
                },
              },
            ],
          },
        });

      } 
      else if (format === "mla") {
        const response = await docs.documents.batchUpdate({
          documentId: documentId,
          requestBody: {
            requests: [{
              createHeader: {
                type: 'DEFAULT'
              }
            }]
          }
        });
        
        // Obtener el ID del encabezado creado
        const headerId = response.data.replies[0].createHeader.headerId;
      
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
                    segmentId: headerId 
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
                    segmentId: headerId 
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
      if (format === null){
        await docs.documents.batchUpdate({
          documentId: documentId,
          requestBody: {
            requests: [
              {
                insertText: {
                  location: {index: 1},
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
                    weightedFontFamily:{
                      fontFamily: "Arial"
                    }
                  },
                  fields: "weightedFontFamily,fontSize"
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
                  },
                  fields: "alignment"
                }
              },
            ]
          }
        })
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