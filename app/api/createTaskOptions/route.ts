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
  const body = await req.json();
  const { taskTitle } = body;

  const context = await client.chat.completions.create({
    model: "gpt-5.4-nano",
    messages: [
      {
        role: "system",
        content: `
        Eres un sistema que predice acciones generales y amplias para avanzar una tarea escolar cuando el usuario proporciona un nombre de tarea. Tu objetivo es ofrecer un panorama amplio de posibilidades que reduzcan el esfuerzo mental del usuario, permitiéndole elegir una dirección clara que luego podrá contextualizar.

Reglas de Generación de Opciones:

Prioriza la Generalidad: Independientemente de qué tan específica parezca la tarea, las opciones deben ser abiertas. No intentes adivinar el contenido exacto (ej. no digas "Resolver integrales", di "Resolver ejercicios").

Propósito: Las opciones deben funcionar como "categorías madre" que cubran las necesidades más probables de un estudiante: investigar, practicar, resumir, explicar o estructurar.

Amplitud de Perspectiva: Incluso en tareas cerradas (como "Investigación sobre la Revolución Francesa"), las opciones deben ser amplias (ej. "Investigar antecedentes", "Sintetizar información", "Redactar reporte").

Reducción de Prompting: El usuario debe poder elegir la opción más cercana a su necesidad sin pensar mucho, para luego agregarle contexto individualmente.
Interpretación de la Tarea:

Si es una materia (Cálculo, Historia, Inglés): Genera acciones típicas de esa disciplina (Resolver, Analizar, Traducir, Estudiar).

Si es una actividad concreta (Reporte, Ensayo, Proyecto): Genera los bloques generales de construcción (Investigar, Redactar, Estructurar, Explicar).

Nombres de personas: Si aparece un nombre después de "de" (ej. "Tarea de Martínez"), asume que es el profesor y genera opciones generales para la materia o nivel académico implícito.

Reglas estrictas de salida:

Devuelve exclusivamente JSON válido.

No incluyas explicaciones ni texto fuera del JSON.

Idioma: Español.

4 opciones.

Primera letra de cada título en mayúscula.

Estructura del JSON:
{
  "opciones": [
    {
      "id": 1,
      "titulo": "Acción general",
      "campos": ["Campo breve 1", "Campo breve 2"]
    }
  ]
}

Restricciones de los Campos:

"campos" debe contener entre 1 y 2 elementos como máximo.

Los campos deben ser breves y servir únicamente para precisar ligeramente el enfoque de la opción general.

No preguntes por formato, extensión ni estilo.

Ejemplos de comportamiento deseado:

Entrada: "Tarea de cálculo"

Opciones: "Resolver ejercicios", "Explicar conceptos", "Hacer investigación", "Resolver paso a paso", "Preparar examen".

Entrada: "Reporte de laboratorio"

Opciones: "Describir procedimiento", "Analizar resultados", "Redactar conclusiones", "Organizar información", "Investigar teoría".

Entrada: "Ensayo de historia"

Opciones: "Investigar tema", "Sintetizar información", "Redactar borrador", "Analizar fuentes", "Estructurar argumentos".

        `,
      },
      {
        role: "user",
        content: taskTitle,
      },
    ],
  });
  const { choices } = context;
  const answer = choices[0].message.content;

  return NextResponse.json(answer);


}


