import { PrismaClient } from "@prisma/client";
import { NextResponse } from "next/server";

const prisma = new PrismaClient();

export async function POST(req:Request){
    const data = await req.json()
    const {userID} = data

    const docs = await prisma.docs.findMany({
        where: {userID}
    })

    return NextResponse.json(docs)

}