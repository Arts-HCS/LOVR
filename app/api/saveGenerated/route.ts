import { PrismaClient } from "@prisma/client";
import { NextResponse } from "next/server";
import { Prisma } from "@prisma/client";

const prisma = new PrismaClient();

export async function POST(req:Request){
    const body = await req.json()
    const {baseID, generated} = body;


    await prisma.tarea.update({
        where: {baseID},
        data: {generated}
    })

    return NextResponse.json({
        message: "exito"
    })
}