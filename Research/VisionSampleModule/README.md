## Azure ML Training and Deployement on Intel Edge device (RRK)



##Folders:
 #models (models.onnx, labesl.txt)
   - ONNX pre-trained models for Image_classificaiton
   - ONNX pre-trained models for object_detection
 #src
   - Python Application code for Image Classification and object detection
   - objdet/model.config - Model configuration file

##Testing
 # Image-classifcation
   - Folder "models/image_classification" has few pre-trained onnx models
   - Execute command: src/imgcls$ python3 onnx_image_classifciation.py  model.config
   - Expected Output: Predicted image classification result with label 
   -
     ##Example:model.config (for Image Classification)  
  {
  "DomainType": "Classification",
  "Platform": "ONNX",
  "Flavor": "ONNX12",
  "ExporterVersion": "2.0",
  "ExportedDate": "2019-10-09T22:15:46.2994596Z",
  "IterationId": "1206e4db-9a1f-4da0-8f06-06ed2ea07240",
  "ModelFileName": "model.onnx",
  "LabelFileName": null,
  "ModelFileSHA1": "264fec21bdb4b0125966c9a51dbec7e35b5cd3d5",
  "SchemaVersion": "1.0"
  "InputStream":"source",
  "SourcePath":"./video/video.mp4",
  "Anchors": [[1.08, 1.19], [3.42, 4.41],  [6.63, 11.38],  [9.42, 5.11],  [16.62, 10.52]],
  "ScaleWidth":416,
  "ScaleHeight":416,
  "InputFormat":"RGB",
  "ConfThreshold":0.5,
  "IouThreshold":0.45,
  "Runtime":1,
  "RenderFlag":0
}
   Classification results  

   ![](/output/cat.png) 

 # Object Detection
   - Folder "models/object_detect/" has face detection pre-trained onnx model
   - Execute command: src/objdet$ python3 onnxruntime_predict.py model.config
   - Expected Output: Renders webcam video frames with inference results (bounding box, detection label and score)
   -
     ##Example:model.config (for Object detection)  
  {
    "DomainType": "ObjectDetection",
    "Platform": "ONNX",
    "Flavor": null,
    "ExporterVersion": "2.0",
    "ExportedDate": "2019-11-01T22:38:49.2810568Z",
    "IterationId": "ba339713-9c60-4cab-b10b-f776628e9dda",
    "ModelFileName": "model.onnx",
    "LabelFileName": "labels.txt",
    "ModelFileSHA1": "4fc28728414d5031f46bf149d14e79a13fcd3120",
    "SchemaVersion": "1.0",
    "InputStream":"source",
    "SourcePath":"./video/video.mp4",
    "Anchors": [[1.08, 1.19], [3.42, 4.41],  [6.63, 11.38],  [9.42, 5.11],  [16.62, 10.52]],
    "ScaleWidth":416,
    "ScaleHeight":416,
    "InputFormat":"RGB",
    "ConfThreshold":0.5,
    "IouThreshold":0.45,
    "Runtime":1,
    "RenderFlag":0
  }

   Face Detection output 

   ![](/output/objDet-FaceDetection.png) 

   Car and Traffic Light Detection

   ![](/output/ObjDet-CarNTrafficLight.png)  

