import { PrismaClient } from "@prisma/client";
import { NextResponse } from "next/server";

const prisma = new PrismaClient();

export async function POST(req:Request){
    const body = await req.json()
    const {userId, modelID} = body

    const chosenModel = await prisma.styleRulebook.findUnique({
        where: {modelID: modelID}
    })

    if (!chosenModel){
        return NextResponse.json({
            message: "notfound"
        })
    }

    const modelRules = chosenModel.rules

    await prisma.usuario.update({
        where: {id: userId},
        data: {modelID: modelID, modelRules: modelRules}
    })
    
    return NextResponse.json({
        message: "exito"
    })

}