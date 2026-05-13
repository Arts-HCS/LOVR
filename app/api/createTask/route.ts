import { NextResponse } from "next/server";
import OpenAI from "openai";
import { readFileSync } from "fs";
import { join } from "path";

const apiKey = process.env.OPENAI_API;

const client = new OpenAI({
  apiKey: apiKey,
});

const STYLE_PROMPT = readFileSync(
  join(process.cwd(), "prompts", "createTask.txt"),
  "utf-8"
);

export async function POST(req: Request) {
  const body = await req.json();
  const { content } = body;

  const now = new Date();

  const formatterDate = new Intl.DateTimeFormat("en-CA", {
    timeZone: "America/Mexico_City",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  });

  const formatterHour = new Intl.DateTimeFormat("es-MX", {
    timeZone: "America/Mexico_City",
    hour: "2-digit",
    hour12: false,
  });

  const today = formatterDate.format(now);
  const currentHour = Number(formatterHour.format(now));

  const defaultDate =
    currentHour < 14
      ? today
      : formatterDate.format(new Date(now.getTime() + 24 * 60 * 60 * 1000));

  const response = await client.chat.completions.create({
    model: "gpt-5.4-nano",
    messages: [
      {
        role: "system",
        content: `
                Hoy es ${today}.
                Hora actual ${currentHour}:00.
                Si el usuario no menciona día ni fecha, usa obligatoriamente ${defaultDate}.

                ${STYLE_PROMPT}
                    `,
      },
      {
        role: "user",
        content,
      },
    ],
  });

  const { choices } = response;
  const answer = choices[0].message.content;

  return NextResponse.json({ answer });
}
