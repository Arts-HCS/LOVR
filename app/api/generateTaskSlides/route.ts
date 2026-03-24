import { NextResponse } from "next/server";
import OpenAI from "openai";

export const runtime = 'edge';

const apiKey = process.env.OPENAI_API;

const client = new OpenAI({
  apiKey: apiKey,
});

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { id, generated, nombre} = body;

    if (!generated) {
      return NextResponse.json({ error: "No se proporcionó contenido" }, { status: 400 });
    }


    const response = await client.chat.completions.create({
      model: "gpt-5.4-mini",
      messages: [
        {
          role: "system",
          content: `
           Tu objetivo es transformar textos largos en una estructura de diapositivas lógica, natural y visualmente ligera, evitando la saturación de información.

REGLAS DE DISEÑO DE CONTENIDO:

DIAPOSITIVA INICIAL: La primera diapositiva debe ser la carátula. "title" será el título general del tema y "content" el nombre del usuario: ${nombre}. "title" debe ser solo el tema, por ejemplo, en vez de "Trabajo de Biología: La fotosíntesis", solo "La fotosíntesis".
TÍTULOS DIRECTOS: Usa nombres de temas simples (ej. "La biodiversidad") o preguntas (ej. "¿Cómo nos afecta?"). Prohibido el uso de adjetivos como "central", "operativa", "concreta" o "integral".
RITMO Y VARIEDAD: Intercala el formato de "content":
Párrafos cortos: Máximo 2 o 3 líneas.
Listas: Máximo 3 o 4 puntos breves.
COHESIÓN NARRATIVA: El contenido debe ser fluido. Usa oraciones completas que conecten ideas.
CONTROL DE DENSIDAD: Divide ideas largas en varias diapositivas. Evita bloques densos.

REGLA CRÍTICA DE FORMATO (OBLIGATORIA):

"content" SIEMPRE debe ser un STRING.
NUNCA uses arrays, listas JSON ni estructuras como:
content: [ "texto1", "texto2" ]
Cuando haya múltiples líneas o puntos, debes usar un SOLO string concatenado con saltos de línea (\n) y el operador "+".

Formato obligatorio en listas:

content: '• Punto uno.\n' +
'• Punto dos.\n' +
'• Punto tres.'

Esta regla es estricta y se debe cumplir en TODOS los casos sin excepción.

REGLAS DE SALIDA:

Devuelve ÚNICAMENTE un objeto JSON con una propiedad "slides" que sea un array.
Cada objeto debe tener:
"title": título corto.
"content": SIEMPRE string (nunca array).
Idioma igual al texto de entrada.
Máximo 12 diapositivas.
Todas las referencias en una sola slide.
No usar la palabra "clave" ni "fundamental".

EJEMPLO DE FORMATO:
{
"slides": [
{ "title": "Título de la Presentación", "content": "Nombre del Usuario" },
{ "title": "¿Por qué es importante?", "content": "La biodiversidad sostiene la vida en la Tierra. Sin ecosistemas sanos, la economía y la salud colapsan." },
{ "title": "Principales Riesgos", "content": "• Pérdida de hábitats.\n" +
"• Cambio climático.\n" +
"• Sobreexplotación de recursos." }
]
}
          `,
        },
        {
          role: "user",
          content: `Convierte el siguiente texto en el formato JSON de diapositivas solicitado: ${generated}`,
        },
      ],
      response_format: { type: "json_object" },
    });

    const answer = response.choices[0].message.content;
    
    const parsedData = JSON.parse(answer || "{}");

    return NextResponse.json(parsedData);
    
  } catch (error: any) {
    console.error("Error en generateTaskSlides:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}