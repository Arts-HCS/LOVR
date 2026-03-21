import { PrismaClient } from "@prisma/client";
import { NextResponse } from "next/server";

const prisma = new PrismaClient();

export async function PUT(req:Request){
    const body = await req.json()
    const {baseID, lovrGenerated} = body;

    await prisma.tarea.update({
        where: {baseID},
        data: {lovrGenerated}
    })

    return NextResponse.json({
        message: "exito"
    })

}