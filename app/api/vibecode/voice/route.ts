import { NextRequest, NextResponse } from "next/server"

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()
    const audioFile = formData.get("audio") as File
    const language = formData.get("language") as string || "en-US"
    const context = formData.get("context") as string || "coding"

    if (!audioFile) {
      return NextResponse.json(
        { error: "No audio file provided" },
        { status: 400 }
      )
    }

    // Enhanced transcription with context-aware processing
    const transcriptionResponse = await fetch("https://api.deepgram.com/v1/listen", {
      method: "POST",
      headers: {
        "Authorization": `Token ${process.env.DEEPGRAM_API_KEY}`,
        "Content-Type": audioFile.type
      },
      body: audioFile,
    })

    if (!transcriptionResponse.ok) {
      console.error("Deepgram API error:", transcriptionResponse.status)
      return NextResponse.json(
        { error: "Transcription service unavailable" },
        { status: 503 }
      )
    }

    const transcriptionData = await transcriptionResponse.json()
    const transcript = transcriptionData.results?.channels?.[0]?.alternatives?.[0]?.transcript

    if (!transcript) {
      return NextResponse.json(
        { error: "No speech detected" },
        { status: 400 }
      )
    }

    // Enhanced post-processing for coding context
    let enhancedTranscript = transcript
    
    // Coding-specific replacements
    const codingReplacements = {
      "function": "function",
      "variable": "variable", 
      "const": "const",
      "let": "let",
      "return": "return",
      "import": "import",
      "export": "export",
      "class": "class",
      "interface": "interface",
      "component": "component",
      "react": "React",
      "next": "Next.js",
      "javascript": "JavaScript",
      "typescript": "TypeScript",
      "tailwind": "Tailwind CSS",
      "div": "div",
      "span": "span",
      "button": "button",
      "input": "input",
      "form": "form"
    }

    // Apply coding context replacements
    for (const [spoken, written] of Object.entries(codingReplacements)) {
      const regex = new RegExp(`\\b${spoken}\\b`, "gi")
      enhancedTranscript = enhancedTranscript.replace(regex, written)
    }

    // Clean up common transcription errors
    enhancedTranscript = enhancedTranscript
      .replace(/\s+/g, " ") // Multiple spaces to single space
      .trim()

    return NextResponse.json({
      transcript: enhancedTranscript,
      confidence: transcriptionData.results?.channels?.[0]?.alternatives?.[0]?.confidence || 0,
      language: language,
      duration: transcriptionData.metadata?.duration || 0
    })

  } catch (error) {
    console.error("Voice transcription error:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}