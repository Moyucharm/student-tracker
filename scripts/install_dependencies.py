import subprocess
import sys

def install_package(package):
    """安装 Python 包"""
    try:
        subprocess.check_call([sys.executable, "-m", "pip", "install", package])
        print(f"✅ 成功安装 {package}")
    except subprocess.CalledProcessError:
        print(f"❌ 安装 {package} 失败")

def main():
    """安装所需的 Python 依赖"""
    packages = [
        "torch",  # PyTorch
        "torchvision",  # PyTorch Vision
        "ultralytics",  # YOLOv8/YOLOv12
        "opencv-python",  # OpenCV
        "Pillow",  # PIL
        "numpy",  # NumPy
    ]
    
    print("开始安装 Python 依赖...")
    
    for package in packages:
        install_package(package)
    
    print("依赖安装完成！")

if __name__ == "__main__":
    main()
