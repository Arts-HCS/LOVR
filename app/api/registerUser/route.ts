import { PrismaClient } from "@prisma/client";
import { NextResponse } from "next/server";
import OpenAI from "openai";
import dotenv from "dotenv"
dotenv.config()

const apiKey = process.env.OPENAI_API;  

const client = new OpenAI({
    apiKey: apiKey
});

const prisma = new PrismaClient();

function quitarAcentos(texto: string) {
    return texto
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "");
}

export async function POST(req: Request) {
    const body = await req.json();
    const { name, email, password} = body;


    const usuarioExiste = await prisma.usuario.findUnique({
        where: { email }
    });

    if (usuarioExiste) {
        return NextResponse.json({ message: 'existente' });
    }

    const nameLimpio = quitarAcentos(name);
    const emailLimpio = quitarAcentos(email);

    const nuevoUsuario = await prisma.usuario.create({
        data: {
            name: nameLimpio,
            email: emailLimpio,
            password,
            gender: null
        }
    });

    client.chat.completions.create({
        model: "gpt-5-nano",
        messages: [
            { role: "system", content: `Escribe únicamente H o M según el género asociado al nombre.

H si es masculino
M si es femenino

Determina el género usando referencias históricas y uso común del nombre.
Si el nombre es ambiguo o no tiene sentido, AUN ASÍ DEBES ELEGIR:

* Letras similares a M o N → H
* Letras similares a B o L → M

Nunca omitas la respuesta. Nunca hagas preguntas. Siempre devuelve solo una letra: H o M.
` },
            { role: "user", content: name }
        ]
    })
    .then(async (response) => {
        const gender = response.choices[0].message.content;

        await prisma.usuario.update({
            where: { id: nuevoUsuario.id },
            data: { gender }
        });
    })
    .catch((err) => {
        console.error("Error obteniendo género:", err);
    });

    return NextResponse.json({ message: 'exito' });
}
