import { PrismaClient } from "@prisma/client";
import { NextResponse } from "next/server";

const prisma = new PrismaClient();

export async function DELETE(req: Request) {
    const body = await req.json();
    const { modelID } = body;
    const deletedModel = await prisma.styleRulebook.delete({
        where: { modelID },
    });
    
    return NextResponse.json(deletedModel);
}