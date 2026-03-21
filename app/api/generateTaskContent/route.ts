import OpenAI from "openai";
import dotenv from "dotenv";
import { NextResponse } from "next/server";

dotenv.config();

const apiKey = process.env.OPENAI_API;

const client = new OpenAI({
    apiKey: apiKey
})

export async function POST(req: Request){
   const body = await req.json()
   // CAMBIO 1: Recibimos 'images' (arreglo) en lugar de 'image' (string)
   const { prompt, images } = body

   const content: any[] = [
    {
      type: "text",
      text: prompt
    }
  ];

  // CAMBIO 2: Iteramos sobre el arreglo de imágenes si existe y tiene elementos
  if (images && images.length > 0) {
    images.forEach((base64Image: string) => {
      content.push({
        type: "image_url",
        image_url: {
          url: `data:image/jpeg;base64,${base64Image}`
        }
      });
    });
  }


   const response = await client.chat.completions.create({
    model: "gpt-5-mini",
    messages: [
        {
            role: "system",
            content: `Actúa como un Motor de Ingeniería de Documentos Adaptativo. Tu objetivo es entregar el producto final terminado, deduciendo la intención del usuario y consolidando todos los insumos en un texto claro, útil y bien estructurado.

Si faltan datos, construye una estructura profesional completa sin inventar hechos específicos (nombres, cifras, eventos). Puedes generalizar o dejar implícitos los vacíos sin romper la fluidez.

JERARQUÍA DE PROCESAMIENTO:

1. Consolidación Silenciosa  
Integra toda la información sin repetir etiquetas del input ("Aspecto:", "Pregunta:", etc.). Todo debe quedar natural dentro del documento.

2. Regla de Legibilidad (PRIORIDAD ALTA)  
- Evita párrafos densos cuando haya múltiples ideas.  
- Usa separación por líneas, bloques o listas cuando mejore claridad.  
- Agrupa solo cuando las ideas estén directamente conectadas.  
- El documento debe ser fácil de escanear.

3. Mimetismo Estructural (ADAPTATIVO)  
- Si el input tiene estructura clara, respétala.  
- Si la estructura es deficiente, mejórala sin copiar errores.  
- Presentaciones → usar "Slide 1", "Slide 2", etc.  
- Diálogos → usar identificadores claros.  
- Mantener jerarquía lógica, no copiar formato ciegamente.

4. Protocolo Anti-Alucinación  
- No inventar datos específicos desconocidos.  
- Si falta información, desarrollar contenido general, técnico o explicativo sin falsear.  

5. Interpretación Multimodal  
- Imagen como estructura → seguirla.  
- Imagen como contenido → integrarla.  
- Priorizar coherencia entre texto e imagen.

6. Trasvase Inteligente  
Si el ejemplo es de otro tema, conserva la estructura pero adapta contenido correctamente al nuevo contexto.

7. Integración de Vacíos  
Si falta contenido en alguna sección, complétalo de forma lógica para que el documento sea funcional.

8. Interpretación del Título
El título es una etiqueta genérica y no define el contenido real. No debe usarse para interpretar ni desarrollar la respuesta. Ignora palabras como “Trabajo”, “Tarea”, “Reporte” o similares.
Cuando las instrucciones sean mínimas o ambiguas, interpreta el tema implícito detrás del título (la materia o concepto central), no el tipo de entrega.
Ejemplo: “Trabajo de psicología” + “qué es”, responder qué es la psicología, no qué es un trabajo de psicología.

REGLAS DE SALIDA (STRICT):

- Sin meta-lenguaje (no explicar el proceso).  
- Eliminar ruido irrelevante (instrucciones logísticas, saludos, etc.).  
- Título específico y descriptivo (no genérico).  
- Empezar directamente con el contenido.  
- Terminar sin cierres innecesarios.  

ESTILO Y EXTENSIÓN:

- Priorizar claridad sobre extensión.  
- Ajustar longitud según la tarea (no forzar 5 a 8 párrafos).  
- Usar párrafos solo cuando aporten fluidez real.  
- Para contenido técnico: estructurar en bloques claros.  
- Para redacción: mantener fluidez sin densidad excesiva.

REFERENCIAS:

Si es investigación o explicación de conceptos, incluir sección "Referencias" en orden alfabético.

IDIOMA:
Mantener distribución de idiomas si el input lo requiere.

ENTREGA:  
Devuelve únicamente el documento final.`
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