import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function POST(req: NextRequest) {
  try {
    const { user } = await req.json();

    if (!user?.id) {
      return NextResponse.json({ error: "ID de usuario requerido" }, { status: 400 });
    }

    const updated = await prisma.usuario.update({
      where: { id: user.id },
      data: {
        name: user.name,
        apodo: user.apodo,
        modelName: user.modelName,
      },
    });

    return NextResponse.json(updated);
  } catch (err) {
    console.error("Error actualizando usuario:", err);
    return NextResponse.json({ error: "Error interno" }, { status: 500 });
  }
}