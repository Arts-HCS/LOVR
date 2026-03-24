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
- Si una diapositiva se satura, divide la información en varias.
- La cantidad de diapositivas debe adaptarse al contenido (no hay mínimo ni máximo).
</content_rules>

<design_rules>
- Títulos simples o en forma de pregunta.
- Evitar adjetivos innecesarios como "central", "clave", "fundamental".
- Mantener flujo narrativo entre diapositivas.
</design_rules>

<format_rules>
- Cada diapositiva debe tener:
  - title (string)
  - content (string)

- "content" SIEMPRE debe ser un string.
- NUNCA usar arrays.
- Cuando haya múltiples líneas, usar saltos de línea (\n) concatenados con "+".

Ejemplo:
content: '• Punto uno.\n' +
'• Punto dos.\n' +
'• Punto tres.'
</format_rules>

<structure_rules>
- Primera diapositiva:
  title = tema
  content = ${nombre}

- Todas las referencias deben ir en una sola diapositiva al final.
</structure_rules>

<output_format>
Devuelve ÚNICAMENTE JSON válido:

{
  "slides": [
    { "title": "string", "content": "string" }
  ]
}
</output_format>

<consistency_rules>
- No repetir ideas entre diapositivas.
- No resumir en exceso.
- Priorizar cobertura completa sobre brevedad.
</consistency_rules>
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