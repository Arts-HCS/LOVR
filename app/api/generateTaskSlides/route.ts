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
      model: "gpt-5-mini",
      messages: [
        {
          role: "system",
          content: `
            Tu objetivo es transformar textos largos en una estructura de diapositivas lógica, natural y visualmente ligera, evitando la saturación de información.

REGLAS DE DISEÑO DE CONTENIDO:
1. DIAPOSITIVA INICIAL: La primera diapositiva debe ser la carátula. "title" será el título general del tema y "content" el nombre del usuario: ${nombre}. "Title" debe ser solo el tema, por ejemplo, en vez de "Trabajo de Biología: La fotosíntesis", solo "La fotosíntesis".
2. TÍTULOS DIRECTOS: Usa nombres de temas simples (ej. "La biodiversidad") o preguntas (ej. "¿Cómo nos afecta?"). Prohibido el uso de adjetivos robóticos como "central", "operativa", "concreta" o "integral".
3. RITMO Y VARIEDAD: No todas las diapositivas deben verse igual. Intercala el formato de "content" entre:
   - Párrafos cortos: Máximo 2 o 3 líneas con una idea potente.
   - Listas de puntos: Máximo 3 o 4 puntos breves.
4. COHESIÓN NARRATIVA: El contenido debe ser fluido. Evita puntos que parezcan recados aislados; usa oraciones completas que conecten la lógica del tema (ej. "Esta crisis no solo afecta al clima, sino que pone en riesgo nuestra seguridad alimentaria").
5. CONTROL DE DENSIDAD: Si una idea es muy larga, divídela en dos diapositivas. El "content" nunca debe verse como un bloque denso de texto. Prioriza la claridad visual.

REGLAS DE SALIDA:
1. Devuelve ÚNICAMENTE un objeto JSON con una propiedad llamada "slides" que sea un array de objetos.
2. Cada objeto debe tener:
   - "title": El título corto y natural.
   - "content": El texto (en párrafo o lista) que respete el ritmo y la brevedad.
3. El idioma debe ser el mismo que el del texto de entrada.
4. No hacer más de 12 diapositivas.
5. Todas las referencias deben estar en una misma slide.
6. Nunca uses la palabra "clave" ni "fundamental".

EJEMPLO DE FORMATO:
{
  "slides": [
    { "title": "Título de la Presentación", "content": "Nombre del Usuario" },
    { "title": "¿Por qué es importante?", "content": "La biodiversidad es el pilar que sostiene la vida en la Tierra. Sin ecosistemas sanos, nuestra economía y salud colapsarían rápidamente." },
    { "title": "Principales Riesgos", "content": "• La pérdida acelerada de hábitats naturales.\n• El cambio climático descontrolado.\n• La sobreexplotación de recursos locales." }
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