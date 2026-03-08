import { PrismaClient } from "@prisma/client";
import { NextResponse } from "next/server";

const prisma = new PrismaClient();

export async function POST(req:Request){
    const data = await req.json()
    const {tasks} = data

    for (const task of tasks) {
        const { id, date, time, desc, title, userID, context } = task
    
        if (await prisma.tarea.findFirst({
            where: { baseID: id }
        })) continue
    
        const [year, month, day] = date.split("-").map(Number)
    
        await prisma.tarea.create({
            data: {
                userId: String(userID),
                title,
                hour: time,
                day,
                month,
                year,
                desc,
                context,
                baseID: id
            }
        })
    }
    
    return NextResponse.json({
        message: "exito"
    })

}