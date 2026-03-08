import { PrismaClient } from "@prisma/client";
import { NextResponse } from "next/server";

const prisma = new PrismaClient();

export async function PATCH(req: Request){
    const body = await req.json()
    const {modelName, userID} = body;

    await prisma.usuario.update({
        where: {id: userID},
        data: {modelName}
    })
    
    return NextResponse.json({
        message: "exito"
    })
}