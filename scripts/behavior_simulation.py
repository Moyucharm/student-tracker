import sys
import json
import base64
from io import BytesIO
from PIL import Image, ImageDraw, ImageFont


# Simulated detections: [x_min, y_min, x_max, y_max], label, color, description
SIMULATED_DATA = [
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

def process_image(base64_image_string):
    try:
        image_data = base64.b64decode(base64_image_string)
        image = Image.open(BytesIO(image_data)).convert("RGB")
        draw = ImageDraw.Draw(image)
        
        # Attempt to load a font, fallback to default if not found
        try:
            font = ImageFont.truetype("simhei.ttf", 15)
        except IOError:
            font = ImageFont.load_default()

        output_detections = []

        for item in SIMULATED_DATA:
            box = item["box"]
            label = item["label"]
            color = item["color"]
            confidence = item["confidence"]
            description = item["description"]

            draw.rectangle(box, outline=color, width=3)
            
            text_position_y = box[1] - 20 if box[1] - 20 > 0 else box[1] + 5
            draw.text((box[0], text_position_y), f"{label} ({confidence*100:.0f}%)", fill=color, font=font)
            
            output_detections.append({
                "label": label,
                "confidence": confidence,
                "description": description,
                "box": box # Optionally return box coordinates
            })

        buffered = BytesIO()
        image.save(buffered, format="JPEG")
        processed_image_base64 = base64.b64encode(buffered.getvalue()).decode('utf-8')
        
        return {
            "processed_image_base64": processed_image_base64,
            "detections": output_detections
        }
    except Exception as e:
        # If there's an error, print it to stderr for debugging and return an error structure
        print(f"Python script error: {str(e)}", file=sys.stderr)
        return {
            "error": str(e),
            "processed_image_base64": None, # Or original image base64
            "detections": []
        }

if __name__ == "__main__":
    

    # Read base64 image string from stdin
    base64_input = sys.stdin.read()
    result = process_image(base64_input)
    # Print JSON result to stdout
    print(json.dumps(result))
