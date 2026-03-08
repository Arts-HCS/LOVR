import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import OpenAI from "openai";
import dotenv from "dotenv";
dotenv.config();

const apiKey = process.env.OPENAI_API;

const client = new OpenAI({
  apiKey: apiKey,
});

export async function POST(req: Request) {

  const now = new Date();
  const today = now.toLocaleDateString("en-CA", {
    timeZone: "America/Mexico_City",
  });

  const time = now.toLocaleTimeString("es-MX", {
    timeZone: "America/Mexico_City",
    hour12: false,
  });

  const body = await req.json();
  const { content } = body;

  const response = await client.chat.completions.create({
    model: "gpt-5-nano",
    messages: [
      {
        role: "system",
        content: `
                Hoy es ${today}.
                Hora actual ${time}.
                
                Sistema para extraer tareas desde texto en español.

SALIDA:
Devuelve exactamente una sola línea con cinco campos separados por comas en este orden:
fecha (YYYY-MM-DD), hora (HH:MM 24h), descripción, título, contexto

No agregues texto extra.
No agregues explicaciones.
No agregues saltos de línea.

REGLAS DE ERROR:

- Si el input contiene contenido sexual explícito: responde exactamente Error
- Si el texto no tiene sentido o contiene caracteres sin coherencia: responde exactamente Error
- Las respuestas Error no deben contener puntos, comas ni texto adicional

Las groserías están permitidas si el mensaje tiene sentido.

REGLAS DE FECHA Y HORA:

- "mediodía" = 12:00
- "medianoche" = 00:00
- Sin hora explícita = 12:00
- Si no se especifica mañana o tarde, asumir tarde
- Si no se menciona día:
- Si la hora detectada es posterior a 17:00, usar mañana
- Si se dice "mañana", usar el día siguiente al actual
- No inventar fechas
- Si la hora mencionada está entre "la una", "las dos", "las tres" o "las cuatro", debe considerarse como hora de la tarde, no de la mañana. A menos que se especifique lo contrario.

REGLAS DE TÍTULO:

- Corrige errores ortográficos leves
- Si solo se menciona una materia (ej. "Computación"), responde como: "Trabajo de Computación"
- Si se menciona únicamente un nombre propio (ej. "Patrick"), responde como: "Tarea de Patrick"
- Si no hay título claro, créalo breve y coherente
- Si se usan expresiones como "este", "mi este", "mi esta", "la cosa esta" refiriéndose a una tarea cuyo nombre no se recuerda, usar únicamente la materia como título (ej. "Mi este de programación" → "Trabajo de Programación") (ej. "La cosa esta de francés" → "Trabajo/Actividad de Francés")
- Si se usan verbos como "Terminar", "Acabar" o similares, ignóralos y devuelve solo la tarea. (ej. "Terminar lo de estadística" → "Trabajo/Actividad de Estadística").
- No inventar datos faltantes que no puedan inferirse razonablemente
- Conserva las palabras del usuario al momento de crear la tarea. Por ejemplo, si el usuario escribe "Reporte de física", no cambiarlo a "Trabajo de física", sino mantenrlo como "Reporte".

REGLAS DE DESCRIPCIÓN:

- Si no hay descripción clara, dejar el campo vacío
- Si hay información adicional relevante, incluirla como descripción breve.
- Las características de la tarea como el tema o detalles se deben tomar como descripción, no fechas ni horas ni el títuloo de la tarea en sí.

REGLAS DE CONTEXTO:

- Siempre devolver el campo contexto como ""

FORMATO FINAL:
Una sola línea:
fecha,hora,descripción,título,contexto
                    `,
      },
      {
        role: "user",
        content,
      },
    ],
  });

  const { choices } = response;
  const answer = choices[0].message.content;

  return NextResponse.json({ answer });
}
