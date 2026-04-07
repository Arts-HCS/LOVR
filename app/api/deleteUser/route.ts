import { PrismaClient } from "@prisma/client";
import { NextResponse } from "next/server";

const prisma = new PrismaClient();

export async function DELETE(req:Request){
    const body = await req.json()
    const {userId} = body;

    await prisma.usuario.delete({
        where: {id: userId}
    })

    return NextResponse.json({
        message: "exito"
    })
}