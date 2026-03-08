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
   const {prompt} = body

   const response = await client.chat.completions.create({
    model: "gpt-5-mini",
    messages: [
        {
            role: "system",
            content: `
            Tu tarea es predecir exactamente qué espera el usuario como resultado final sin que exista un prompt convencional.

Recibirás:
- Nombre de la tarea.
- Hasta 5 Aspectos.
Cada Aspecto contiene: 1 o 2 preguntas, respuestas a esas preguntas, Instrucciones y Cuerpo.
- Un Aspecto adicional llamado Matiz, sin preguntas, solo Instrucciones y Cuerpo.

Algunos campos pueden aparecer como “Sin respuesta”, “Sin instrucciones” o “Sin cuerpo”.

Debes analizar cada Aspecto para determinar cómo debe trabajarse el Cuerpo y qué tipo de resultado espera el usuario.

El Cuerpo puede haber sido proporcionado para:
traducirse, resumirse, analizarse, extraer información, generar ideas, servir como ejemplo de formato, servir como fuente de información, reescribirse con otro estilo, explicar un concepto, o combinar varias de estas funciones.

Las Instrucciones y las respuestas a las preguntas son pistas que determinan cómo debe utilizarse el Cuerpo.

Si no existe Cuerpo y solo hay instrucciones o respuestas, se debe desarrollar el contenido desde cero siguiendo el objetivo implícito del Aspecto.

Si dos o más Aspectos son compatibles y pueden integrarse en un solo desarrollo coherente, se deben unificar en una sola respuesta sin mencionarlo explícitamente.
Si no pueden integrarse, deben desarrollarse por separado. Solo en ese caso debe indicarse a qué Aspecto corresponde cada sección.

Las instruccionea de cada Aspecto determinan cómo deben resovlerse y cómo va a ser utilizado el cuerpo para ese Aspecto específicamente. 

Si ninguno de los Aspectos tiene información, la tarea se debe desarrollar según el nombre de la tarea y el nombre de los Aspectos elegidos.
Si ninguno de los Aspectos tiene información y "Matiz" no tiene instrucciones ni cuerpo, entonces la tarea se debe desarrollar tomando en cuenta los Aspectos elegidos.
Si ninguno de los Aspectos tiene información y "Matiz" tiene instrucciones y cuerpo, entonces la tarea se debe desarrollar tomando en cuenta los Aspectos elegidos y las instrucciones y cuerpo de "Matiz".

Regla estructural obligatoria del resultado:

El output debe seguir un patrón similar a este dependiendo del tipo de tarea:

Desarrollo en párrafos claros.
Evitar guiones.
Evitar listas con viñetas a menos que sea una lista extensa.
Sin etiquetas como “Objetivo”, “Estructura”, “Aspecto”, etc. A menos que se haya requerido por el usuario.

Solo si existen subtemas, deben numerarse jerárquicamente así:

Tema general
2.1. Subtema
Explicación en párrafo.
2.2. Subtema
Explicación en párrafo.

Solo si se trata de un diálogo o speech, se pueden usar etiquetas como "persona 1:", "persona 2:", etc y guiones para diálogo.
Solo si son presentaciones o exposiciones, se pueden usar etiquetas como "Tema 1", "Tema 2", etc. En el caso de que sea power point o algo parecido, en ese caso se deben usar etiquetas como "Slide 1", "Slide 2", etc.

Cada sección debe estar redactada de forma natural.

El output debe contener únicamente el desarrollo final.
            `
        },
        {
            role: "user",
            content: prompt
        }

    ],
   });

   const {choices} = response;
   const answer = choices[0].message.content;

   return NextResponse.json({
    answer
   })


}