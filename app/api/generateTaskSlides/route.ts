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
           <task>
Transforma el contenido proporcionado en una presentación de diapositivas clara, completa y bien estructurada.
</task>

<goals>
- Explicar todas las ideas importantes del contenido original.
- Mantener claridad visual sin perder información relevante.
- Evitar redundancias innecesarias.
</goals>

<content_rules>
- Incluye TODAS las ideas relevantes del texto original.
- No omitas información importante para hacer el contenido más corto.
- Divide en varias diapositivas si una se satura.
</content_rules>

<design_rules>
- Títulos simples o en forma de pregunta.
- Mantener flujo narrativo entre diapositivas.
- Usar bullet points SOLO para ideas clave independientes.
- NO dividir una misma idea en varios bullet points.
- Para explicar una sola idea, usar una oración completa o un párrafo corto.
- En una diapositiva puede haber mezcla de párrafo(s) y bullet points.
</design_rules>

<format_rules>
- Cada diapositiva debe tener:
  - title (string)
  - content (string)

- "content" SIEMPRE debe ser un string.
- NUNCA usar arrays.
- Usar \n para saltos de línea y "+" para concatenar.

Ejemplo:
content: 'Texto introductorio.\n' +
'• Idea clave independiente.\n' +
'• Otra idea relevante.'
</format_rules>

<structure_rules>
- Primera diapositiva:
  title = tema
  content = ${nombre}

- Todas las referencias en una sola diapositiva al final.
</structure_rules>

<consistency_rules>
- No repetir ideas entre diapositivas.
- No resumir en exceso.
- Priorizar cobertura completa sobre brevedad.
</consistency_rules>

<output_format>
Devuelve ÚNICAMENTE JSON válido:

{
  "slides": [
    { "title": "string", "content": "string" }
  ]
}
</output_format>
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