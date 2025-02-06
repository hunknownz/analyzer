import type { Request, Response } from 'express'
import process from 'node:process'
import axios from 'axios'
import cors from 'cors'
import dotenv from 'dotenv'
import express from 'express'
import jwt from 'jsonwebtoken'
import { Octokit } from 'octokit'
import OpenAI from 'openai'
import { TagStream } from './tagStream'

dotenv.config()

const app = express()
const PORT = 5099

const tagStream = new TagStream(process.env.PRIVATE_KEY)

app.use(express.json())
app.use(express.urlencoded({ extended: true }))

app.use(
  cors({
    origin: 'http://localhost:3000',
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: true,
  }),
)

const DEEPSEEK_API_KEY = process.env.DEEPSEEK_API_KEY
const GITHUB_TOKEN = process.env.GITHUB_TOKEN
const AUTH_SERVICE_TARGET = process.env.AUTH_SERVICE_TARGET
if (!DEEPSEEK_API_KEY) {
  throw new Error('Missing DEEPSEEK_API_KEY in environment variables.')
}

const openai = new OpenAI({
  baseURL: 'https://api.deepseek.com',
  apiKey: DEEPSEEK_API_KEY,
})

async function analyze(githubUrl: string): Promise<string> {
  console.log(githubUrl)
  const prompt = `Please provide a concise analysis of this GitHub repository: ${githubUrl}.`
  const completion = await openai.chat.completions.create({
    messages: [{ role: 'user', content: prompt }],
    model: 'deepseek-chat',
  })

  const content = completion.choices[0].message.content
  if (!content) {
    throw new Error('Message content is null')
  }
  console.log(content)
  return content
}

app.get('/api/analyze', async (req: Request, res: Response) => {
  try {
    const githubUrl = req.query.githubUrl as string
    const result = await analyze(req.query.githubUrl as string)
    res.json({ success: true, data: result })
  }
  catch (error: any) {
    console.error(error)
    res.status(500).json({ success: false, error: error.message })
  }
})

// fetch github contributors
app.get('/api/contributors', async (req: Request, res: Response) => {
  const githubUrl = req.query.githubUrl as string
  const octokit = new Octokit({ auth: GITHUB_TOKEN })
  const owner = githubUrl.split('/')[3]
  const repo = githubUrl.split('/')[4].replace('.git', '')
  try {
    const response = await octokit.rest.repos.listContributors({
      owner,
      repo,
      per_page: 10,
      page: 1,
    })
    res.json({ success: true, data: response.data })
  }
  catch (error: any) {
    res.status(500).json({ success: false, error: error.message })
  }
})

app.get('/api/auth/github/callback', async (req: Request, res: Response) => {
  try {
    const code = req.query.code as string
    if (!code) {
      throw new Error('No authorization code provided')
    }
    const callbackUrl = `${AUTH_SERVICE_TARGET}/auth/github/callback?code=${code}`

    const response = await axios.get(callbackUrl, {
      headers: {
        Accept: 'application/json',
      },
    })

    res.json({
      success: true,
      data: response.data,
    })
  }
  catch (error: any) {
    console.error('Error details:', error.response?.data || error.message)
    res.status(500).json({
      success: false,
      error: error.response?.data || error.message,
    })
  }
})

// TODO: make sure after oauth check
app.post('/api/setReceiver', async (req: Request, res: Response) => {
  const token = req.headers.authorization?.split(' ')[1]
  if (!token) {
    res.status(401).json({ success: false, error: 'Unauthorized' })
    return
  }
  const decoded = jwt.verify(token, process.env.JWT_SECRET!)
  if (!decoded) {
    res.status(401).json({ success: false, error: 'Unauthorized' })
    return
  }
  const { username } = decoded as { username: string }
  try {
    const { receiverAddress } = req.body
    await tagStream.setReceiverForContract(username, receiverAddress)
    res.json({ success: true })
  }
  catch (error: any) {
    console.error(error)
    res.status(500).json({ success: false, error: error.message })
  }
})

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`)
})
