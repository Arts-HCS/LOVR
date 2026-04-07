import { PrismaClient } from "@prisma/client";
import { NextResponse } from "next/server";

const prisma = new PrismaClient();


export async function PUT(req:Request){
    const body = await req.json();
    const {id, password} = body;

    await prisma.usuario.update({
        where: {id},
        data: {password}
    })

    return NextResponse.json({
        message: "exito"
    })
}