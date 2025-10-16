import { NextRequest, NextResponse } from "next/server"

export const runtime = "edge"

interface VibecodeRequest {
  prompt: string
  conversationId?: string
  userId: string
  model: string
  language?: string
  framework?: string
  context?: string
}

export async function POST(request: NextRequest) {
  try {
    const body: VibecodeRequest = await request.json()
    const { prompt, conversationId, userId, model, language, framework, context } = body

    // Enhanced prompt engineering for vibecoding
    const systemPrompt = `You are EBURON Coder, an expert AI coding assistant in a vibecoding environment.

CRITICAL INSTRUCTIONS:
1. Always provide complete, working code that can be executed immediately
2. Format ALL code in proper markdown code blocks with language specification
3. Use modern best practices and clean, readable code
4. Include comments explaining key functionality
5. Ensure responsive design for web applications
6. Test your code mentally before providing it

PREFERRED TECHNOLOGIES:
- React 19, Next.js 15, TypeScript
- Tailwind CSS for styling (no external CSS files)
- Modern JavaScript/TypeScript patterns
- Functional components with hooks
- Clean, semantic HTML

OUTPUT FORMAT:
- Start with a brief explanation (1-2 sentences)
- Provide complete, executable code in markdown blocks
- End with usage instructions or next steps
- Keep explanations concise and focused

CONTEXT: ${context || "General web development"}
TARGET LANGUAGE: ${language || "JavaScript/React"}
FRAMEWORK: ${framework || "React/Next.js"}`

    const userPrompt = `${prompt}

Please provide complete, working code that I can immediately use in my ${framework || "React"} project.`

    // Enhanced message payload for coding agent
    const messages = [
      { role: "system", content: systemPrompt },
      { role: "user", content: userPrompt }
    ]

    console.log("[VibeCoding] Enhanced streaming request:", {
      model,
      userId,
      conversationId,
      language,
      framework
    })

    // Stream to Ollama Cloud with enhanced parameters
    const response = await fetch("https://cloud.ollamafamily.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${process.env.EMILIOAI_API_KEY}`
      },
      body: JSON.stringify({
        model: model,
        messages: messages,
        stream: true,
        temperature: 0.7,
        max_tokens: 4000,
        top_p: 0.9,
        frequency_penalty: 0.1,
        presence_penalty: 0.1
      })
    })

    if (!response.ok) {
      console.error("[VibeCoding] Ollama API error:", response.status, response.statusText)
      return NextResponse.json(
        { error: "Failed to communicate with AI service" },
        { status: response.status }
      )
    }

    // Create enhanced streaming response with proper headers
    return new NextResponse(response.body, {
      headers: {
        "Content-Type": "text/event-stream",
        "Cache-Control": "no-cache",
        "Connection": "keep-alive",
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "POST",
        "Access-Control-Allow-Headers": "Content-Type"
      }
    })

  } catch (error) {
    console.error("[VibeCoding] Error:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}