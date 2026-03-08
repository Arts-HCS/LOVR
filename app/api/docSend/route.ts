import { PrismaClient } from "@prisma/client";
import { NextResponse } from "next/server";

const prisma = new PrismaClient();

export async function POST(req:Request){
    const body = await req.json()
    const {userID, content} = body;

    content.forEach(async (doc:any)=>{

        const docAlreadyExists = await prisma.docs.findFirst({
            where: {userID, content: doc}
        })
        if (docAlreadyExists) return

        await prisma.docs.create({
            data: {
                userID,
                content: doc
            }
        })
    })

    return NextResponse.json({
        message: "exito"
    })
}