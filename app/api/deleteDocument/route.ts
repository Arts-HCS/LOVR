import { PrismaClient } from "@prisma/client";
import { NextResponse } from "next/server";

const prisma = new PrismaClient();

export async function DELETE(req:Request){
    const data = await req.json()
    const {userID, id} = data

    await prisma.docs.deleteMany({
        where: {userID, id}
    })

    return NextResponse.json({
        message: "exito"
    })
}