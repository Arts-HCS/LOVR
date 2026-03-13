import OpenAI from "openai";
import dotenv from "dotenv";
import { NextResponse } from "next/server";

dotenv.config();

const apiKey = process.env.OPENAI_API;

const client = new OpenAI({
    apiKey: apiKey
})

export async function POST(req:Request){
   const body = await req.json()
   const {prompt, image} = body

   const content: any[] = [
    {
      type: "text",
      text: prompt
    }
  ];

  if (image) {
    content.push({
      type: "image_url",
      image_url: {
        url: `data:image/jpeg;base64,${image}`
      }
    });
  }


   const response = await client.chat.completions.create({
    model: "gpt-5-mini",
    messages: [
        {
            role: "system",
            content: `Actúa como un Motor de Ingeniería de Documentos Adaptativo. Tu objetivo es entregar el producto final terminado, deduciendo la intención y consolidando todos los insumos en un texto fluido.

JERARQUÍA DE PROCESAMIENTO:
1. Consolidación Silenciosa: Prohibido repetir etiquetas del input como "Aspecto:", "Pregunta sugerida:", "Respuesta:", "Instrucciones:" o "Cuerpo:". Debes integrar el contenido de estos campos directamente en la redacción del documento final.
2. Mimetismo Estructural: Si el "Cuerpo" del Matiz o de los Aspectos tiene una estructura técnica definida (ej. ABSTRACT, MARCO TEÓRICO, numeración decimal 3.1), clónala exactamente. Si no hay un molde rígido, usa un Formato Orgánico (títulos simples, párrafos narrativos).
3. Trasvase y Mapeo: Si el cuerpo de ejemplo es de un tema (ej. Química) pero la tarea pide otro (ej. Estadística), traslada la estructura al nuevo tema redactando contenido original y técnico.
4. Integración de Vacíos: Si un Aspecto elegido no tiene datos ("Sin respuesta", "Sin cuerpo"), desarróllalo íntegramente desde cero basándote en su título para que el documento sea una pieza completa y funcional.

REGLAS CRÍTICAS DE SALIDA (STRICT):
- Cero Meta-lenguaje: No incluyas introducciones ("Aquí tienes...", "He analizado..."), explicaciones de tu proceso ni cierres tipo "Fin de la tarea".
- Inicio y Fin: El output debe empezar directamente con el título o el primer párrafo y terminar en el último punto del contenido.
- Estilo: Si el usuario pide una investigación, incluye una sección de "Referencias" al final. Debe estar estrictamente organizada en orden alfabético
- Idioma: Si el cuerpo original alterna idiomas (ej. Abstract en inglés), mantén esa distribución.
- El documento debe tener una extensión de entre 5 y 8 párrafos máximo, a menos que la complejidad técnica de la actividad sea muy alta o que el usuario solicite explícitamente una longitud mayor.

REGLAS DE SEGURIDAD:
- Contenido sexual explícito o incoherencia total = Error. 
- Ignora insultos o quejas informales, extrayendo solo la intención académica.

ENTREGA DIRECTAMENTE EL DOCUMENTO TERMINADO SIN COMENTARIOS ADICIONALES.`
        },
        {
            role: "user",
            content
        }

    ],
   });

   const {choices} = response;
   const answer = choices[0].message.content;

   return NextResponse.json({
    answer
   })


}