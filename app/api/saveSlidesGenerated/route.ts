import { PrismaClient } from "@prisma/client";
import { NextResponse } from "next/server";

const prisma = new PrismaClient();

export async function PUT(req: Request) {
  try {
    const { baseID, slidesGenerated } = await req.json();

    const updatedTask = await prisma.tarea.update({
      where: { baseID: baseID },
      data: {
        slidesGenerated: slidesGenerated,
      },
    });

    return NextResponse.json(updatedTask);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}