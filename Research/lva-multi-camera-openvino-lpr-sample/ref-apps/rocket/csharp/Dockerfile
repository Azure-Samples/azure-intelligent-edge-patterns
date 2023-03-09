FROM ycshu086/ubuntu1804-dotnetcore2231-aspnetcore31-opencv34-opencvsharp-cuda100-cudnn76:0.1 AS build-env

WORKDIR /app

# Copy csproj and restore as distinct layers
COPY ./src/VAP/Directory.Build.props .
COPY ./src/VAP/Directory.Build.targets .
COPY ./src/VAP/Versions.props .
COPY ./src/VAP/BGSObjectDetector/*.csproj ./BGSObjectDetector/
COPY ./src/VAP/Decoder/*.csproj ./Decoder/
COPY ./src/VAP/DNNDetector/*.csproj ./DNNDetector/
COPY ./src/VAP/FramePreProcessor/*.csproj ./FramePreProcessor/
COPY ./src/VAP/LineDetector/*.csproj ./LineDetector/
COPY ./src/VAP/ORTWrapper/*.csproj ./ORTWrapper/
COPY ./src/VAP/PostProcessor/*.csproj ./PostProcessor/
COPY ./src/VAP/TFWrapper/*.csproj ./TFWrapper/
COPY ./src/VAP/Utils/*.csproj ./Utils/
COPY ./src/VAP/VideoPipelineCore/*.csproj ./VideoPipelineCore/
COPY ./src/VAP/VAPManagerService/*.csproj ./VAPManagerService/

RUN dotnet restore ./BGSObjectDetector/
RUN dotnet restore ./Decoder/
RUN dotnet restore ./DNNDetector/
RUN dotnet restore ./FramePreProcessor/
RUN dotnet restore ./LineDetector/
RUN dotnet restore ./ORTWrapper/
RUN dotnet restore ./PostProcessor/
RUN dotnet restore ./TFWrapper/
RUN dotnet restore ./Utils/
RUN dotnet restore ./VideoPipelineCore/
RUN dotnet restore ./VAPManagerService/

# Copy everything else and build
COPY ./src/VAP/BGSObjectDetector/ ./BGSObjectDetector/
COPY ./src/VAP/Decoder/ ./Decoder/
COPY ./src/VAP/DNNDetector/ ./DNNDetector/
COPY ./src/VAP/FramePreProcessor/ ./FramePreProcessor/
COPY ./src/VAP/LineDetector/ ./LineDetector/
COPY ./src/VAP/ORTWrapper/ ./ORTWrapper/
COPY ./src/VAP/PostProcessor/ ./PostProcessor/
COPY ./src/VAP/TFWrapper/ ./TFWrapper/
COPY ./src/VAP/Utils/ ./Utils/
COPY ./src/VAP/VideoPipelineCore/ ./VideoPipelineCore/
COPY ./src/VAP/VAPManagerService/ ./VAPManagerService/

RUN dotnet publish ./Utils/ -c Release -o out
RUN dotnet publish ./TFWrapper/ -c Release -o out
RUN dotnet publish ./ORTWrapper/ -c Release -o out
RUN dotnet publish ./BGSObjectDetector/ -c Release -o out
RUN dotnet publish ./DNNDetector/ -c Release -o out
RUN dotnet publish ./Decoder/ -c Release -o out
RUN dotnet publish ./LineDetector/ -c Release -o out
RUN dotnet publish ./FramePreProcessor/ -c Release -o out
RUN dotnet publish ./PostProcessor/ -c Release -o out
RUN dotnet publish ./VideoPipelineCore/ -c Release -o out
RUN dotnet publish ./VAPManagerService/ -c Release -o out


# Build runtime image
FROM ycshu086/ubuntu1804-dotnetcore2231-aspnetcore31-opencv34-opencvsharp-cuda100-cudnn76:0.1 AS final

WORKDIR /app
EXPOSE 7788

COPY --from=build-env /app/out .

COPY ./cfg ./cfg
COPY ./media ./media
COPY ./modelOnnx ./modelOnnx 
RUN wget --output-document="./modelOnnx/yolov3ort.onnx" https://aka.ms/Microsoft-Rocket-Video-Analytics-Platform-yolov3ort.onnx
RUN wget --output-document="./modelOnnx/yolov3tinyort.onnx" https://aka.ms/Microsoft-Rocket-Video-Analytics-Platform-yolov3tinyort.onnx
RUN wget --output-document="libtensorflow.so" https://aka.ms/Microsoft-Rocket-Video-Analytics-Platform-libtensorflow.so
RUN wget --output-document="libtensorflow_framework.so" https://aka.ms/Microsoft-Rocket-Video-Analytics-Platform-libtensorflow_framework.so
RUN cp libtensorflow.so /usr/local/lib
RUN cp libtensorflow_framework.so /usr/local/lib
RUN cp /opencvsharp/make/OpenCvSharpExtern/libOpenCvSharpExtern.so /usr/local/lib
RUN cp /opencvsharp/make/OpenCvSharpExtern/libOpenCvSharpExtern.so .
RUN apt-get update && apt-get install -y libgdiplus
RUN cd /usr/lib
RUN ln -s libgdiplus.so gdiplus.dll
RUN export LD_LIBRARY_PATH="/lib:/usr/lib:/usr/local/lib"

ENTRYPOINT ["dotnet", "VAPManagerService.dll"]
