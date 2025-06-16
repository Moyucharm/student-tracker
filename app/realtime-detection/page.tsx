"use client"

import { cn } from "@/lib/utils"

import { useState, useRef, useEffect, useCallback } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Camera, Video, VideoOff, Loader2, ListChecks } from "lucide-react"

interface DetectionResult {
  label: string
  confidence: number
  description: string
}

const FRAME_INTERVAL = 1000 // Send a frame every 1 second for detection

export default function RealtimeDetectionPage() {
  const videoRef = useRef<HTMLVideoElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null) // For drawing processed frames
  const [isCameraOn, setIsCameraOn] = useState(false)
  const [stream, setStream] = useState<MediaStream | null>(null)
  const [detections, setDetections] = useState<DetectionResult[]>([])
  const [isLoading, setIsLoading] = useState(false) // For individual frame processing
  const [error, setError] = useState<string | null>(null)
  const [processedFrameUrl, setProcessedFrameUrl] = useState<string | null>(null)

  const requestIntervalRef = useRef<NodeJS.Timeout | null>(null)

  const startCamera = async () => {
    setError(null)
    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({ video: true })
      setStream(mediaStream)
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream
      }
      setIsCameraOn(true)
    } catch (err) {
      console.error("Error accessing camera:", err)
      setError("无法访问摄像头。请确保已授予摄像头权限。")
      setIsCameraOn(false)
    }
  }

  const stopCamera = useCallback(() => {
    if (stream) {
      stream.getTracks().forEach((track) => track.stop())
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null
    }
    if (requestIntervalRef.current) {
      clearInterval(requestIntervalRef.current)
      requestIntervalRef.current = null
    }
    setStream(null)
    setIsCameraOn(false)
    setDetections([])
    setProcessedFrameUrl(null)
    setIsLoading(false)
  }, [stream])

  const captureAndProcessFrame = useCallback(async () => {
    if (!videoRef.current || !isCameraOn || isLoading) return

    setIsLoading(true)
    const video = videoRef.current
    const tempCanvas = document.createElement("canvas")
    tempCanvas.width = video.videoWidth
    tempCanvas.height = video.videoHeight
    const context = tempCanvas.getContext("2d")
    if (!context) {
      setIsLoading(false)
      return
    }
    context.drawImage(video, 0, 0, tempCanvas.width, tempCanvas.height)
    const frameDataUrl = tempCanvas.toDataURL("image/jpeg")

    try {
      const response = await fetch("/api/detect", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ image_base64: frameDataUrl.split(",")[1] }), // Send only base64 part
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || `Error: ${response.statusText}`)
      }

      const result = await response.json()
      setProcessedFrameUrl(`data:image/jpeg;base64,${result.processed_image_base64}`)
      setDetections(result.detections)
      setError(null)
    } catch (err: any) {
      console.error("Frame processing error:", err)
      setError(err.message || "Error processing frame.")
      // Don't stop camera on single frame error, but clear detections
      setDetections([])
      setProcessedFrameUrl(null)
    } finally {
      setIsLoading(false)
    }
  }, [isCameraOn, isLoading])

  useEffect(() => {
    if (isCameraOn) {
      requestIntervalRef.current = setInterval(captureAndProcessFrame, FRAME_INTERVAL)
    } else {
      if (requestIntervalRef.current) {
        clearInterval(requestIntervalRef.current)
        requestIntervalRef.current = null
      }
    }
    return () => {
      if (requestIntervalRef.current) {
        clearInterval(requestIntervalRef.current)
      }
      // Ensure camera is stopped if component unmounts while active
      if (isCameraOn) stopCamera()
    }
  }, [isCameraOn, captureAndProcessFrame, stopCamera])

  // Cleanup stream on unmount
  useEffect(() => {
    return () => {
      if (stream) {
        stream.getTracks().forEach((track) => track.stop())
      }
    }
  }, [stream])

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Camera className="mr-2 h-6 w-6 text-primary" />
            实时行为检测
          </CardTitle>
          <CardDescription>使用设备摄像头进行实时分析。结果基于模拟演示。</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex space-x-2">
            {!isCameraOn ? (
              <Button onClick={startCamera}>
                <Video className="mr-2 h-4 w-4" /> 开启摄像头
              </Button>
            ) : (
              <Button onClick={stopCamera} variant="destructive">
                <VideoOff className="mr-2 h-4 w-4" /> 关闭摄像头
              </Button>
            )}
          </div>

          {error && (
            <Alert variant="destructive">
              <AlertTitle>Error</AlertTitle>
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <div className="relative w-full aspect-video bg-muted rounded-md overflow-hidden">
            <video
              ref={videoRef}
              autoPlay
              playsInline
              muted
              className={cn("w-full h-full object-contain", processedFrameUrl ? "opacity-50" : "")}
            />
            {processedFrameUrl && (
              <img
                src={processedFrameUrl || "/placeholder.svg"}
                alt="Processed Frame"
                className="absolute top-0 left-0 w-full h-full object-contain"
              />
            )}
            {!isCameraOn && (
              <div className="absolute inset-0 flex items-center justify-center">
                <Camera className="h-16 w-16 text-muted-foreground" />
              </div>
            )}
            {isLoading && isCameraOn && (
              <div className="absolute inset-0 flex items-center justify-center bg-black/30">
                <Loader2 className="h-12 w-12 text-white animate-spin" />
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {isCameraOn && (detections.length > 0 || isLoading) && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <ListChecks className="mr-2 h-6 w-6 text-primary" />
              当前检测结果
            </CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading && detections.length === 0 && <p className="text-muted-foreground">正在处理画面...</p>}
            {detections.length > 0 && (
              <ul className="space-y-2">
                {detections.map((detection, index) => (
                  <li key={index} className="p-3 border rounded-md bg-muted/50">
                    <p className="font-medium text-primary">{detection.label}</p>
                    <p className="text-sm text-muted-foreground">置信度: {(detection.confidence * 100).toFixed(2)}%</p>
                    <p className="text-sm">{detection.description}</p>
                  </li>
                ))}
              </ul>
            )}
            {detections.length === 0 && !isLoading && (
              <p className="text-muted-foreground">模拟系统在当前画面中未检测到特定行为。</p>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  )
}
