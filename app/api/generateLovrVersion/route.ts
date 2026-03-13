import OpenAI from "openai";

const apiKey = process.env.OPENAI_API;

const client = new OpenAI({
    apiKey: apiKey
})

export async function POST(req:Request){
    
}