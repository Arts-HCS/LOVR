import { PrismaClient } from "@prisma/client";
import { NextResponse } from "next/server";

const prisma = new PrismaClient();

export async function POST(req:Request){
    const data = await req.json()
    const {id} = data

    const task = await prisma.tarea.findUnique({
        where: { baseID: id }
    });
      
    if (!task) {
        return NextResponse.json({ error: "No task found" }, { status: 404 });
    }

    if (task.lovrGenerated === null){
        return NextResponse.json({ error: "nolovr" });
    }
      
    return NextResponse.json(task.lovrGenerated)
}