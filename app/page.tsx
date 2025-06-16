import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { ImageIcon, Camera, Zap } from "lucide-react"
import Link from "next/link"

export default function HomePage() {
  return (
    <div className="flex flex-col items-center justify-center space-y-8">
      <div className="text-center space-y-2">
        <h1 className="text-4xl font-bold tracking-tight">学生行为检测系统</h1>
        <p className="text-xl text-muted-foreground">利用人工智能技术分析学生在图片和实时视频中的行为表现</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full max-w-2xl">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <ImageIcon className="mr-2 h-6 w-6 text-primary" />
              图片行为检测
            </CardTitle>
            <CardDescription>上传图片来检测和分析学生行为</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="mb-4 text-sm">从单张图片中获取详细的行为分析。系统将识别行为并提供标注说明。</p>
            <Button asChild className="w-full">
              <Link href="/image-detection">
                <Zap className="mr-2 h-4 w-4" /> 开始图片检测
              </Link>
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Camera className="mr-2 h-6 w-6 text-primary" />
              实时行为检测
            </CardTitle>
            <CardDescription>使用设备摄像头进行实时行为监测</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="mb-4 text-sm">实时观察和分析行为变化。（需要摄像头权限）</p>
            <Button asChild className="w-full">
              <Link href="/realtime-detection">
                <Zap className="mr-2 h-4 w-4" /> 开始实时检测
              </Link>
            </Button>
          </CardContent>
        </Card>
      </div>
      <Card className="w-full max-w-2xl">
        <CardHeader>
          <CardTitle>关于模型</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            本系统使用模拟的YOLOv12模型进行演示。在实际应用中，需要将其替换为部署在合适后端或边缘设备上的真实训练模型。
            当前模拟系统可以识别预定义的行为，如"专心听讲"、"使用手机"和"睡觉"等。
          </p>
        </CardContent>
      </Card>
    </div>
  )
}
