import express, { Request, Response } from "express";
import OpenAI from "openai";
import dotenv from "dotenv";
import cors from "cors";

dotenv.config();

const app = express();
const PORT = 5099;

app.use(
  cors({
    origin: "http://localhost:3000",
    methods: ["GET", "POST"],
    allowedHeaders: ["Content-Type"],
  })
);

const DEEPSEEK_API_KEY = process.env.DEEPSEEK_API_KEY;

if (!DEEPSEEK_API_KEY) {
  throw new Error("Missing DEEPSEEK_API_KEY in environment variables.");
}

const openai = new OpenAI({
  baseURL: "https://api.deepseek.com",
  apiKey: DEEPSEEK_API_KEY,
});

async function analyze(githubUrl: string): Promise<string> {
  console.log(githubUrl);
  const prompt = `Please provide a concise analysis of this GitHub repository: ${githubUrl}.`;
  const completion = await openai.chat.completions.create({
    messages: [{ role: "user", content: prompt }],
    model: "deepseek-chat",
  });

  const content = completion.choices[0].message.content;
  if (!content) {
    throw new Error("Message content is null");
  }
  console.log(content);
  return content;
}

app.get("/api/analyze", async (req: Request, res: Response) => {
  try {
    const githubUrl = req.query.githubUrl as string;
    const result = await analyze(req.query.githubUrl as string);
    res.json({ success: true, data: result });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
