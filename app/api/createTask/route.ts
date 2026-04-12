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
  const today = now.toLocaleDateString("en-CA", {
    timeZone: "America/Mexico_City",
  });

  const time = now.toLocaleTimeString("es-MX", {
    timeZone: "America/Mexico_City",
    hour12: false,
  });

  const response = await client.chat.completions.create({
    model: "gpt-5.4-nano",
    messages: [
      {
        role: "system",
        content: `
                Hoy es ${today}.
                Hora actual ${time}.

                ${STYLE_PROMPT}
                    `,
      },
      {
        role: "user",
        content,
      },
    ]
  });

  const { choices } = response;
  const answer = choices[0].message.content;

  return NextResponse.json({ answer });
}
