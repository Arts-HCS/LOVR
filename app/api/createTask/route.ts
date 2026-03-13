import { NextResponse } from "next/server";
import OpenAI from "openai";

export const runtime = 'edge';

const apiKey = process.env.OPENAI_API;

const client = new OpenAI({
  apiKey: apiKey,
});

export async function POST(req: Request) {

  const body = await req.json();
  const { content } = body;

  const now = new Date();
  const today = now.toLocaleDateString("en-CA", {
    timeZone: "America/Mexico_City",
  });

  const time = now.toLocaleTimeString("es-MX", {
    timeZone: "America/Mexico_City",
    hour12: false,
  });

  const response = await client.chat.completions.create({
    model: "gpt-5-mini",
    messages: [
      {
        role: "system",
        content: `
                Hoy es ${today}.
                Hora actual ${time}.
                

REGLAS DE ERROR (Responde únicamente "Error"):

Contenido sexual, saludos o incoherencias (caracteres sin sentido). 

Sin acción/tarea clara.

REGLAS DE TIEMPO:

Sin día: Si es antes de 14:00 usa hoy; si es después, mañana.

Sin hora: 12:00. Mediodía: 12:00, Medianoche: 00:00.

Horas 1 a 4 sin contexto: asumirlas como tarde (13:00-16:00).

"Mañana": día siguiente. Prohibido fechas pasadas.

REGLAS DE TEXTO:

Título: Breve. Materia sola → "Trabajo de [Materia]". Nombre solo → "Tarea de [Nombre]". Objetos → "Llevar [Objeto]". Si el título es específico (ej. "Reporte de física"), mantenlo exacto. No cambies sustantivos por palabras por "trabajo" o "tarea" (ej. "Ensayo de fisica" → "Ensayo de Física").
Materia/Nombre solo o con "lo de/mi este/la cosa" → "Trabajo de [Materia/Nombre]".
Ignora insultos o quejas (ej. "tonto de francés" → "Trabajo de Francés").

Abreviaturas: Expandir (mate, bio, lite, admin, geo).

Descripción: Solo datos extra relevantes. Si no hay, campo vacío.

Contexto: Siempre "".

Formato: Sin texto extra, sin puntos finales, sin saltos de línea.

SALIDA:
YYYY-MM-DD,HH:MM,descripción,título
                    `,
      },
      {
        role: "user",
        content,
      },
    ]
  });

  const { choices } = response;
  const answer = choices[0].message.content;

  return NextResponse.json({ answer });
}
