import OpenAI from "openai";
import { NextResponse } from "next/server";
import { readFileSync } from "fs";
import { join } from "path";
import { prisma } from "@/lib/prisma";

const apiKey = process.env.OPENAI_API;

const client = new OpenAI({
    apiKey: apiKey
});

const STYLE_PROMPT = readFileSync(
    join(process.cwd(), "prompts", "lovr.txt"),
    "utf-8"
);

export async function POST(req: Request) {
    const body = await req.json();
    const { samples, userId, label } = body;

    if (!samples || !userId) {
        return NextResponse.json(
            { error: "samples y userId son requeridos" },
            { status: 400 }
        );
    }

    const response = await client.chat.completions.create({
        model: "gpt-5.4-mini",
        messages: [
            {
                role: "system",
                content: STYLE_PROMPT,
            },
            {
                role: "user",
                content: `<entrada>\n${samples}\n</entrada>`,
            },
        ],
        max_completion_tokens: 4000,
    });

    const rulebook = response.choices[0].message.content;

    if (!rulebook) {
        return NextResponse.json(
            { error: "El modelo no devolvió respuesta" },
            { status: 500 }
        );
    }

    const summaryMatch = rulebook.match(/<style_summary>([\s\S]*?)<\/style_summary>/);
    const desc = summaryMatch ? summaryMatch[1].trim() : null;

    const saved = await prisma.styleRulebook.create({
        data: {
            userId,
            label: label ?? `Rulebook ${new Date().toLocaleDateString("es-MX")}`,
            modelUsed: "gpt-5.4-mini",
            rules: rulebook,
            desc: desc,
        },
    });

    return NextResponse.json({
        id: saved.id,
        label: saved.label,
        desc: saved.desc,
        createdAt: saved.createdAt,
        rulebook,
    });
}