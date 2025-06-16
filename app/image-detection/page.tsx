"use client"

import { useState, type ChangeEvent, type FormEvent } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Upload, Loader2, Sparkles, ListChecks } from "lucide-react"
import Image from "next/image"

interface DetectionResult {
  label: string
  confidence: number
  description: string
}

export default function ImageDetectionPage() {
  const [file, setFile] = useState<File | null>(null)
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)
  const [processedImageUrl, setProcessedImageUrl] = useState<string | null>(null)
  const [detections, setDetections] = useState<DetectionResult[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleFileChange = (event: ChangeEvent<HTMLInputElement>) => {
    const selectedFile = event.target.files?.[0]
    if (selectedFile) {
      setFile(selectedFile)
      setPreviewUrl(URL.createObjectURL(selectedFile))
      setProcessedImageUrl(null)
      setDetections([])
      setError(null)
    }
  }

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    if (!file) {
      setError("请选择一个图片文件。")
      return
    }

    setIsLoading(true)
    setError(null)
    setProcessedImageUrl(null)
    setDetections([])

    const formData = new FormData()
    formData.append("image", file)

    try {
      const response = await fetch("/api/detect", {
        method: "POST",
        body: formData,
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || `Error: ${response.statusText}`)
      }

      const result = await response.json()
      setProcessedImageUrl(`data:image/jpeg;base64,${result.processed_image_base64}`)
      setDetections(result.detections)
    } catch (err: any) {
      setError(err.message || "An unknown error occurred.")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Upload className="mr-2 h-6 w-6 text-primary" />
            上传图片进行行为检测
          </CardTitle>
          <CardDescription>选择图片文件（JPEG、PNG）来分析学生行为</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid w-full max-w-sm items-center gap-1.5">
              <Label htmlFor="picture">选择图片</Label>
              <Input id="picture" type="file" accept="image/jpeg, image/png" onChange={handleFileChange} />
            </div>
            {previewUrl && (
              <div>
                <Label>预览：</Label>
                <Image
                  src={previewUrl || "/placeholder.svg"}
                  alt="Preview"
                  width={300}
                  height={200}
                  className="rounded-md border object-contain aspect-video"
                />
              </div>
            )}
            <Button type="submit" disabled={isLoading || !file}>
              {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Sparkles className="mr-2 h-4 w-4" />}
              检测行为
            </Button>
          </form>
        </CardContent>
      </Card>

      {error && (
        <Alert variant="destructive">
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {processedImageUrl && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <ListChecks className="mr-2 h-6 w-6 text-primary" />
              检测结果
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label>处理后的图片：</Label>
              <Image
                src={processedImageUrl || "/placeholder.svg"}
                alt="Processed image with detections"
                width={600}
                height={400}
                className="rounded-md border object-contain aspect-video"
              />
            </div>
            {detections.length > 0 && (
              <div>
                <h3 className="font-semibold text-lg mb-2">检测到的行为：</h3>
                <ul className="space-y-2">
                  {detections.map((detection, index) => (
                    <li key={index} className="p-3 border rounded-md bg-muted/50">
                      <p className="font-medium text-primary">{detection.label}</p>
                      <p className="text-sm text-muted-foreground">
                        置信度: {(detection.confidence * 100).toFixed(2)}%
                      </p>
                      <p className="text-sm">{detection.description}</p>
                    </li>
                  ))}
                </ul>
              </div>
            )}
            {detections.length === 0 && !isLoading && (
              <p className="text-muted-foreground">模拟系统未检测到特定行为，或图片中可能不包含系统预设的识别元素。</p>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  )
}
