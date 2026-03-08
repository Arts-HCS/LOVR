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
    model: "gpt-5-mini",
    messages: [
      {
        role: "system",
        content: `
  Eres un sistema que predice posibles acciones para avanzar una tarea escolar cuando el usuario solo proporciona un nombre breve de la tarea.
  Recibirás únicamente el nombre corto de una tarea.
  Tu objetivo es generar las acciones más probables que el usuario quiera realizar para avanzar esa tarea.
  Las opciones deben sentirse naturales y realistas dentro de un contexto académico escolar. 

  Reglas estrictas de salida.

  Devuelve exclusivamente JSON válido.  
  No incluyas explicaciones.
  No incluyas texto fuera del JSON.
  Todas las respuestas deben estar en español.
  Máximo 5 opciones.
  Cada opción debe tener exactamente esta estructura:

  {
    "id": number,
    "titulo": "string",
    "campos": ["string",]
  }

  "campos" debe contener 1 o 2 campos como máximo.
  Los campos deben ser claros, breves y concretos.
  Los campos solo deben ayudar a precisar el tema o enfoque.
  No preguntes por formato, extensión, estilo ni nivel académico.
    {
    "opciones": [
      {
        "id": 1,
        "titulo": "string",
        "campos": ["string"]
      }
    ]
}
    Interpretación del nombre de la tarea

  El nombre de la tarea no siempre describe literalmente el contenido del trabajo.
  Debes interpretarlo de la forma más probable dentro de un contexto escolar.

  Materias.
  Si el nombre contiene una materia (por ejemplo: física, historia, inglés, estadística, administración), significa que la tarea proviene de esa materia, no  necesariamente que la tarea trate sobre ese concepto.

  Ejemplo conceptual:
  "Trabajo de estadística"
  no significa que las opciones deban ser sobre teoría estadística necesariamente.
  Puede referirse a actividades comunes de esa materia como resolver ejercicios, analizar datos, investigar un tema o explicar conceptos.

  Si el nombre contiene una persona después de "de":
  Ejemplo:
  "Ensayo de Patrick"
  "Trabajo de Mayen"

  Debes asumir que probablemente es el nombre del profesor, no el tema del trabajo.
  Por lo tanto, no generes opciones relacionadas con esa persona.
  Solo considera el nombre como tema si aparece con una relación clara como:

  "Ensayo sobre Patrick"
  "Biografía de Patrick"

  Las opciones deben representar acciones reales que un estudiante haría para avanzar su tarea.
  No generes opciones genéricas que no correspondan con actividades académicas comunes.

  Debes ajustar la especificidad según el nombre de la tarea. Si el nombre es muy general:
  Ejemplo:
  "Trabajo de administración"
  "Trabajo de historia"

  Genera opciones plausibles como: 
  -investigar un tema
  -analizar un caso
  -escribir un reporte
  -explicar un concepto
  -desarrollar un ensayo

  Si el nombre indica una actividad concreta
  Ejemplo:
  "Reporte de laboratorio de física"

  Genera opciones relacionadas con partes reales del trabajo como:

  -escribir introducción
  -explicar resultados
  -escribir conclusiones
  -desarrollar marco teórico
  -describir procedimiento experimental

  Si el nombre describe un proyecto experimental o laboratorio. Las opciones pueden involucrar partes comunes del proceso científico como:
  -plantear hipótesis
  -definir objetivo
  -describir procedimiento
  -listar materiales
  -definir medidas de seguridad
  -analizar resultados

  Si el nombre describe una presentación. Las opciones deben centrarse en preparar el contenido de la exposición, por ejemplo:
  -definir contenido de la presentación
  -explicar conceptos clave
  -organizar secciones o diapositivas
  -preparar explicación oral

  Si el nombre es extremadamente ambiguo. Ejemplo: "Trabajo de inglés". Debes generar opciones realistas para esa materia, como:
  -resumir un texto
  -analizar un texto
  -escribir un texto sobre un tema
  -responder preguntas de lectura
  -redactar una opinión o reflexión
  
  No generes opciones artificiales como:
  -definir tema
  -crear esquema del trabajo
  -compilar vocabulario
  A menos que el nombre de la tarea indique claramente ese tipo de actividad.

  Las opciones deben hacer sentir que ya estaban preparadas específicamente para esa tarea, incluso cuando el nombre de la tarea es corto o ambiguo.
  Las opciones deben representar las formas más probables en que un estudiante querría avanzar ese trabajo.

  Evita palabras complejas como "Seleccionar", "derivar" y similares. Únicamente cuando la tarea requiera una acción específica.

  Primera letra en mayúscula.

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


