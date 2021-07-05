powershell -Command "New-Item -ItemType directory -Path ./src/VAP/TFWrapper/packages/TensorFlowSharp.1.12.0/runtimes/win7-x64/native/"

powershell -Command "(New-Object Net.WebClient).DownloadFile('https://aka.ms/Microsoft-Rocket-Video-Analytics-Platform-libtensorflow.dll', './src/VAP/TFWrapper/packages/TensorFlowSharp.1.12.0/runtimes/win7-x64/native/libtensorflow.dll')"

powershell -Command "(New-Object Net.WebClient).DownloadFile('https://aka.ms/Microsoft-Rocket-Video-Analytics-Platform-yolov3ort.onnx', './modelOnnx/yolov3ort.onnx')"

powershell -Command "(New-Object Net.WebClient).DownloadFile('https://aka.ms/Microsoft-Rocket-Video-Analytics-Platform-yolov3tinyort.onnx', './modelOnnx/yolov3tinyort.onnx')"