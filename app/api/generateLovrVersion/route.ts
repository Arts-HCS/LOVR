import OpenAI from "openai";
import { NextResponse } from "next/server";

const apiKey = process.env.OPENAI_API;

const client = new OpenAI({
    apiKey: apiKey
})

export async function POST(req:Request){
    try{
        const body = await req.json()
        const {generated} = body

        const response = await client.chat.completions.create({
            model: "gpt-5-mini",
            messages: [
                {
                    role: "system",
                    content: `
                    Tu tarea es recibir un texto técnico o estructurado y reescribirlo para que suene natural, fluido y humano, aplicando estrictamente las siguientes capas de procesamiento:
                    Mantenimiento de Moldes: Prohibido modificar el formato, los espacios, las listas o las divisiones jerárquicas del texto original.
                    Etiquetas de Segmentación: Si el texto contiene divisiones como "Slide 1", "Persona 1", "Infografía 1" o subtítulos específicos, deben permanecer exactamente en el mismo lugar. Solo se modifica el contenido narrativo dentro de esas secciones.
                    Cero Meta-lenguaje: No incluyas introducciones ("Aquí tienes la versión humana...", "He ajustado el texto...") ni cierres. Entrega directamente el documento procesado. Sin recomendaciones.

                    Sigue las siguientes reglas de humanización: 
                    Priorizar claridad inmediata. Expresar ideas de forma directa, explícita y fácil de interpretar. Favorecer vocabulario común y construcciones cotidianas. Reducir tecnicismos, abstracciones y nominalizaciones innecesarias. Mantener estructuras centradas en verbos y acciones. Sintaxis controlada. Usar oraciones de longitud media como base. Permitir oraciones largas solo si la lectura sigue siendo lineal y sin ambigüedades. Evitar tanto la fragmentación excesiva como las cadenas saturadas de cláusulas. Progresión lineal. Desarrollar una idea principal por oración. Añadir contexto o consecuencia de forma simple. Minimizar incisos, desvíos argumentativos y jerarquías lógicas complejas. Presentar relaciones causa-efecto de manera visible y directa. Uso moderado de conectores. Evitar la acumulación constante de enlaces lógicos. Cuando la idea ya esté conectada, cerrarla con un punto. Reiniciar con una oración clara que comience con un sujeto o un verbo definido. Favorecer conectores simples y naturales, omitiendo los innecesarios o retóricos. Integración estructural. Unir definiciones, condiciones y consecuencias cuando exista dependencia directa. Evitar separaciones artificiales entre ideas estrechamente relacionadas. Incorporar resultados dentro de la oración en lugar de añadir frases finales redundantes. Densidad informativa moderada. Limitar la cantidad de ideas por párrafo. Omitir detalles especializados, marcos teóricos amplios y precisión terminológica excesiva. Priorizar información general, comprensible y funcional. Variación natural. Evitar patrones mecánicos como enumeraciones rígidas o secuencias temporales previsibles. Variar la longitud y estructura de los enunciados para mantener fluidez y ritmo natural. Ejemplificación integrada. Incluir ejemplos solo cuando aporten claridad inmediata y siempre dentro del mismo flujo del párrafo. Evitar ejemplos aislados o innecesarios. Puntuación sencilla. Usar pausas convencionales y estructuras limpias. Evitar oraciones dependientes de múltiples comas estratégicas. Si la oración crece demasiado, dividirla y reiniciar con una construcción clara. Tono explicativo-narrativo. Mantener una voz didáctica, natural y directa. Usar verbos comunes y formulaciones transparentes. Permitir redundancias leves solo si mejoran la comprensión. Cierre natural. Terminar sin conclusiones formales ni recapitulaciones explícitas. Finalizar cuando la idea haya quedado clara. No digas que algo es desde una perspectiva o desde un marco en específico.



                    
`
                },
                {
                    role: "user",
                    content: generated
                },

            ]
        });

        const {choices} = response
        const answer = choices[0].message.content

        return NextResponse.json({answer})

    } catch (error){
        return NextResponse.json({error})
    }

    
    
}