import { PrismaClient } from "@prisma/client";
import OpenAI from "openai";
import { NextResponse } from "next/server";
import { readFileSync } from "fs";
import { join } from "path";

const prisma = new PrismaClient();

const client = new OpenAI({
    apiKey: process.env.OPENAI_API
});

const STYLE_PROMPT = readFileSync(
    join(process.cwd(), "prompts", "generateLovrVersion.txt"),
    "utf-8"
);

export async function POST(req: Request) {
    try {
        const body = await req.json();
        const { userId, generated } = body;

        const usuario = await prisma.usuario.findUnique({
            where: { id: userId }
        });

        const userRules = usuario?.modelRules;

        if (!userRules) {
            return NextResponse.json({ error: "No se encontraron reglas de estilo para este usuario." }, { status: 404 });
        }

        const filledPrompt = STYLE_PROMPT
            .replace("{{STYLE_RULEBOOK}}", userRules)
            .replace("{{SOURCE_TEXT}}", generated);

        const response = await client.chat.completions.create({
            model: "gpt-5.4-mini",
            messages: [
                {
                    role: "system",
                    content: filledPrompt
                }
            ]
        });

        const answer = response.choices[0].message.content;

        return NextResponse.json({ result: answer });

    } catch (error) {
        console.error(error);
        return NextResponse.json({ error: "Error al procesar la solicitud." }, { status: 500 });
    }
}