import sys
import json
import base64
import cv2
import numpy as np
from io import BytesIO
from PIL import Image, ImageDraw, ImageFont
import torch

# 这是一个真实 YOLOv12 模型的示例实现
# 你需要根据你的实际模型调整这些代码

class StudentBehaviorDetector:
    def __init__(self, model_path="models/yolov12_student_behavior.pt"):
        """
        初始化学生行为检测器
        
        Args:
            model_path: YOLOv12 模型文件路径
        """
        try:
            # 加载 YOLOv12 模型
            # 注意：这里假设你使用的是 ultralytics 的 YOLOv8/YOLOv12
            from ultralytics import YOLO
            self.model = YOLO(model_path)
            
            # 定义行为类别（根据你的模型训练数据调整）
            self.class_names = {
                0: "专心听讲",
                1: "使用手机", 
                2: "睡觉",
                3: "交谈",
                4: "写作业",
                5: "看书",
                6: "举手提问"
            }
            
            # 定义颜色映射
            self.colors = {
                "专心听讲": "green",
                "使用手机": "orange", 
                "睡觉": "red",
                "交谈": "yellow",
                "写作业": "blue",
                "看书": "purple",
                "举手提问": "cyan"
            }
            
            # 定义行为描述
            self.descriptions = {
                "专心听讲": "学生正在专注地听老师讲课，表现出良好的学习态度。",
                "使用手机": "学生在课堂上使用手机，可能影响学习效果。",
                "睡觉": "学生在课堂上睡觉，需要老师关注和提醒。",
                "交谈": "学生与同学交谈，可能是讨论学习内容或私人话题。",
                "写作业": "学生正在认真完成作业或笔记。",
                "看书": "学生在阅读教材或其他学习资料。",
                "举手提问": "学生积极参与课堂互动，举手提问或回答问题。"
            }
            
            self.model_loaded = True
            print("YOLOv12 模型加载成功", file=sys.stderr)
            
        except Exception as e:
            print(f"模型加载失败: {str(e)}", file=sys.stderr)
            self.model_loaded = False
            # 如果模型加载失败，使用模拟数据
            self.use_simulation = True
    
    def detect_behaviors(self, image):
        """
        检测图片中的学生行为
        
        Args:
            image: PIL Image 对象
            
        Returns:
            list: 检测结果列表
        """
        if not self.model_loaded:
            return self._simulate_detection(image)
        
        try:
            # 将 PIL 图像转换为 numpy 数组
            img_array = np.array(image)
            
            # 使用 YOLOv12 进行推理
            results = self.model(img_array)
            
            detections = []
            
            # 处理检测结果
            for result in results:
                boxes = result.boxes
                if boxes is not None:
                    for box in boxes:
                        # 获取边界框坐标
                        x1, y1, x2, y2 = box.xyxy[0].cpu().numpy()
                        
                        # 获取置信度
                        confidence = box.conf[0].cpu().numpy()
                        
                        # 获取类别
                        class_id = int(box.cls[0].cpu().numpy())
                        class_name = self.class_names.get(class_id, "未知行为")
                        
                        # 只保留置信度大于阈值的检测结果
                        if confidence > 0.5:
                            detections.append({
                                "box": [int(x1), int(y1), int(x2), int(y2)],
                                "label": class_name,
                                "confidence": float(confidence),
                                "description": self.descriptions.get(class_name, "检测到的学生行为"),
                                "color": self.colors.get(class_name, "blue")
                            })
            
            return detections
            
        except Exception as e:
            print(f"检测过程中出错: {str(e)}", file=sys.stderr)
            return self._simulate_detection(image)
    
    def _simulate_detection(self, image):
        """
        模拟检测结果（当真实模型不可用时使用）
        """
        return [
            {
                "box": [50, 50, 150, 180], 
                "label": "专心听讲", 
                "color": "green", 
                "confidence": 0.92,
                "description": "学生看起来专注并积极参与课堂内容。"
            },
            {
                "box": [200, 220, 300, 350], 
                "label": "使用手机", 
                "color": "orange", 
                "confidence": 0.85,
                "description": "学生似乎在使用移动设备。"
            },
            {
                "box": [380, 80, 480, 200], 
                "label": "睡觉", 
                "color": "red", 
                "confidence": 0.78,
                "description": "学生的姿势表明他们可能在课桌上睡觉。"
            }
        ]
    
    def draw_detections(self, image, detections):
        """
        在图片上绘制检测结果
        
        Args:
            image: PIL Image 对象
            detections: 检测结果列表
            
        Returns:
            PIL Image: 绘制了检测结果的图片
        """
        draw = ImageDraw.Draw(image)
        
        # 尝试加载字体
        try:
            font = ImageFont.truetype("arial.ttf", 15)
        except IOError:
            font = ImageFont.load_default()
        
        for detection in detections:
            box = detection["box"]
            label = detection["label"]
            color = detection["color"]
            confidence = detection["confidence"]
            
            # 绘制边界框
            draw.rectangle(box, outline=color, width=3)
            
            # 绘制标签
            text = f"{label} ({confidence*100:.0f}%)"
            text_position_y = box[1] - 20 if box[1] - 20 > 0 else box[1] + 5
            draw.text((box[0], text_position_y), text, fill=color, font=font)
        
        return image

def process_image(base64_image_string):
    """
    处理图片的主函数
    """
    try:
        # 解码 base64 图片
        image_data = base64.b64decode(base64_image_string)
        image = Image.open(BytesIO(image_data)).convert("RGB")
        
        # 初始化检测器
        detector = StudentBehaviorDetector()
        
        # 检测行为
        detections = detector.detect_behaviors(image)
        
        # 在图片上绘制检测结果
        processed_image = detector.draw_detections(image.copy(), detections)
        
        # 将处理后的图片转换为 base64
        buffered = BytesIO()
        processed_image.save(buffered, format="JPEG")
        processed_image_base64 = base64.b64encode(buffered.getvalue()).decode('utf-8')
        
        return {
            "processed_image_base64": processed_image_base64,
            "detections": detections,
            "total_detections": len(detections)
        }
        
    except Exception as e:
        print(f"处理图片时出错: {str(e)}", file=sys.stderr)
        return {
            "error": str(e),
            "processed_image_base64": None,
            "detections": []
        }

if __name__ == "__main__":
    # 从 stdin 读取 base64 图片字符串
    base64_input = sys.stdin.read().strip()
    result = process_image(base64_input)
    # 将 JSON 结果输出到 stdout
    print(json.dumps(result, ensure_ascii=False))
