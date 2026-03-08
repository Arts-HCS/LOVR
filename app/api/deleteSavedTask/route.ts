import { PrismaClient } from "@prisma/client"
import { NextResponse } from "next/server";

const prisma = new PrismaClient();

export async function POST(req:Request){
    const data = await req.json()
    const {baseID} = data

    const task = await prisma.tarea.findUnique({
        where: { baseID }
    });
      
    if (!task) {
        return NextResponse.json({ error: "Task not found" }, { status: 404 });
    }
      
    await prisma.tarea.delete({
        where: { baseID }
    });

    return NextResponse.json({
        message: "exito"
    })
}