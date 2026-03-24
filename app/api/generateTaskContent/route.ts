import OpenAI from "openai";
import dotenv from "dotenv";
import { NextResponse } from "next/server";
import { join } from "path";
import { readFileSync } from "fs";

dotenv.config();

const apiKey = process.env.OPENAI_API;

const client = new OpenAI({
    apiKey: apiKey
})

const STYLE_PROMPT = readFileSync(
  join(process.cwd(), "prompts", "generateTaskContent.txt"),
  "utf-8"
);

export async function POST(req: Request){
   const body = await req.json()
   const { prompt, images } = body

   const content: any[] = [
    {
      type: "text",
      text: prompt
    }
  ];

  if (images && images.length > 0) {
    images.forEach((base64Image: string) => {
      content.push({
        type: "image_url",
        image_url: {
          url: `data:image/jpeg;base64,${base64Image}`
        }
      });
    });
  }

   const response = await client.chat.completions.create({
    model: "gpt-5.4-mini",
    messages: [
        {
            role: "system",
            content: STYLE_PROMPT
        },
        {
            role: "user",
            content
        }

    ],
   });

   const {choices} = response;
   const answer = choices[0].message.content;

   return NextResponse.json({
    answer
   })
}