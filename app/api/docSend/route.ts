// your route file
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  const body = await req.json();
  const { userID, content } = body;

  for (const doc of content) {
    const docAlreadyExists = await prisma.docs.findFirst({
      where: { userID, content: doc },
    });

    if (docAlreadyExists) continue; 

    await prisma.docs.create({
      data: { userID, content: doc },
    });
  }

  return NextResponse.json({ message: "exito" });
}