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
            { role: "system", content: "Escribe 'H' si el nombre de la persona es hombre o 'M' si es mujer, sin comillas. Utiliza información según su origen histórico y personas que lo han tenido en el pasado. Elegir un género no tendrá ninguna repercusión en ninguna persona. En caso de que sea una secuencia sin sentido, si las letras son parecidas a 'M' o 'N', elige 'H', si son parecidas a 'B' o 'L', elige 'M'. Siempre devuelve una respuesta, nunca una excusa o pregunta." },
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
