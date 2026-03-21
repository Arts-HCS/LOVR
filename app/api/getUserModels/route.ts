import { PrismaClient } from "@prisma/client";
import { NextResponse } from "next/server";

const prisma = new PrismaClient();

export async function POST(req:Request){
    const body = await req.json()
    const {userId} = body
    
    const usersModels = await prisma.styleRulebook.findMany({
        where: {userId: userId}
    })

    if (!usersModels){
        return NextResponse.json({
            message: "Not found"
        })
    }

    return NextResponse.json(
        usersModels
    )
}