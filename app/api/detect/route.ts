import { type NextRequest, NextResponse } from "next/server"
import { spawn } from "child_process"
import path from "path"

// Helper to stream data from child process
function streamToString(stream: NodeJS.ReadableStream): Promise<string> {
  const chunks: Buffer[] = []
  return new Promise((resolve, reject) => {
    stream.on("data", (chunk) => chunks.push(Buffer.from(chunk)))
    stream.on("error", (err) => reject(err))
    stream.on("end", () => resolve(Buffer.concat(chunks).toString("utf8")))
  })
}

export async function POST(request: NextRequest) {
  let imageBase64: string

  const contentType = request.headers.get("content-type")

  if (contentType?.includes("multipart/form-data")) {
    const formData = await request.formData()
    const imageFile = formData.get("image") as File | null

    if (!imageFile) {
      return NextResponse.json({ error: "No image file provided" }, { status: 400 })
    }
    const imageBuffer = await imageFile.arrayBuffer()
    imageBase64 = Buffer.from(imageBuffer).toString("base64")
  } else if (contentType?.includes("application/json")) {
    const body = await request.json()
    if (!body.image_base64) {
      return NextResponse.json({ error: "No image_base64 provided in JSON body" }, { status: 400 })
    }
    imageBase64 = body.image_base64
  } else {
    return NextResponse.json({ error: "Unsupported content type" }, { status: 415 })
  }

  try {
    // Path to the Python script. In Next.js, scripts are typically in a 'scripts' folder.
    // The exact path might need adjustment based on how Next.js deploys/runs scripts.
    // Assuming 'scripts' is at the root of the project.
    const scriptPath = path.join(process.cwd(), "scripts", "behavior_simulation.py")

    // Using 'python3' explicitly. Ensure it's available in the environment.
    // For Next.js, the environment should handle Python execution for `type="script"` files.
    // Here, we are invoking it as a child process.
    const pythonPath = path.join(process.cwd(), ".venv", "Scripts", "python.exe")
const pythonProcess = spawn(pythonPath, [scriptPath])


    let stdoutData = ""
    let stderrData = ""

    // Write base64 image data to Python script's stdin
    pythonProcess.stdin.write(imageBase64)
    pythonProcess.stdin.end()

    // Collect stdout
    for await (const chunk of pythonProcess.stdout) {
      stdoutData += chunk
    }

    // Collect stderr
    for await (const chunk of pythonProcess.stderr) {
      stderrData += chunk
    }

    const exitCode = await new Promise<number | null>((resolve) => {
      pythonProcess.on("close", resolve)
    })

    if (exitCode !== 0) {
      console.error(`Python script error: ${stderrData}`)
      return NextResponse.json(
        { error: "Error processing image with Python script", details: stderrData },
        { status: 500 },
      )
    }

    const result = JSON.parse(stdoutData)
    return NextResponse.json(result)
  } catch (error: any) {
    console.error("API error:", error)
    return NextResponse.json({ error: "Internal server error", details: error.message }, { status: 500 })
  }
}
