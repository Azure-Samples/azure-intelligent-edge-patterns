#WEBDB_MODULE_VERSION=0.0.1
WEB_MODULE_VERSION=0.27.2
INFERENCE_MODULE_VERSION=0.27.2
RTSPSIM_MODULE_VERSION=0.27.2
CAMERA_MODULE_VERSION=0.27.2
NGINX_MODULE_VERSION=0.27.2
UPLOAD_MODULE_VERSION=0.27.2
PREDICT_MODULE_VERSION=0.27.2

DEV_REGISTRY=factoryairegistry

#DEV_VERSION=0.8.0
RELEASE_VERSION=0.27.2


# ===================
# Tag new version
# ===================
docker tag $DEV_REGISTRY.azurecr.io/intelligentedge/webmodule:$WEB_MODULE_VERSION-amd64     intelligentedge/webmodule:$RELEASE_VERSION-amd64  
#docker tag $DEV_REGISTRY.azurecr.io/intelligentedge/webdbmodule:$WEBDB_MODULE_VERSION-amd64     intelligentedge/webdbmodule:$RELEASE_VERSION-amd64  
docker tag $DEV_REGISTRY.azurecr.io/intelligentedge/inferencemodule:$INFERENCE_MODULE_VERSION-amd64  intelligentedge/inferencemodule:$RELEASE_VERSION-amd64

docker tag $DEV_REGISTRY.azurecr.io/intelligentedge/predictmodule:$PREDICT_MODULE_VERSION-gpuamd64  intelligentedge/predictmodule:$RELEASE_VERSION-gpuamd64
docker tag $DEV_REGISTRY.azurecr.io/intelligentedge/predictmodule:$PREDICT_MODULE_VERSION-cpuamd64  intelligentedge/predictmodule:$RELEASE_VERSION-cpuamd64
docker tag $DEV_REGISTRY.azurecr.io/intelligentedge/predictmodule:$PREDICT_MODULE_VERSION-vpuamd64  intelligentedge/predictmodule:$RELEASE_VERSION-vpuamd64

docker tag $DEV_REGISTRY.azurecr.io/intelligentedge/rtspsimmodule:$RTSPSIM_MODULE_VERSION-amd64  intelligentedge/rtspsimmodule:$RELEASE_VERSION-amd64
docker tag $DEV_REGISTRY.azurecr.io/intelligentedge/nginxmodule:$NGINX_MODULE_VERSION-amd64  intelligentedge/nginxmodule:$RELEASE_VERSION-amd64
docker tag $DEV_REGISTRY.azurecr.io/intelligentedge/cameramodule:$CAMERA_MODULE_VERSION-amd64  intelligentedge/cameramodule:$RELEASE_VERSION-amd64
docker tag $DEV_REGISTRY.azurecr.io/intelligentedge/uploadmodule:$UPLOAD_MODULE_VERSION-amd64  intelligentedge/uploadmodule:$RELEASE_VERSION-amd64


# ===================
# Push images
# ===================
docker push intelligentedge/webmodule:$RELEASE_VERSION-amd64
#docker push intelligentedge/webdbmodule:$RELEASE_VERSION-amd64

docker push intelligentedge/inferencemodule:$RELEASE_VERSION-amd64

docker push intelligentedge/predictmodule:$RELEASE_VERSION-gpuamd64
docker push intelligentedge/predictmodule:$RELEASE_VERSION-cpuamd64
docker push intelligentedge/predictmodule:$RELEASE_VERSION-vpuamd64

docker push intelligentedge/rtspsimmodule:$RELEASE_VERSION-amd64
docker push intelligentedge/nginxmodule:$RELEASE_VERSION-amd64
docker push intelligentedge/cameramodule:$RELEASE_VERSION-amd64
docker push intelligentedge/uploadmodule:$RELEASE_VERSION-amd64

exit

#== ARM ==

# ===================
# Tag new version
# ===================
docker tag $DEV_REGISTRY.azurecr.io/intelligentedge/webmodule:$WEB_MODULE_VERSION-arm64v8     intelligentedge/webmodule:$RELEASE_VERSION-arm64v8  
#docker tag $DEV_REGISTRY.azurecr.io/intelligentedge/webdbmodule:$WEBDB_MODULE_VERSION-arm64v8     intelligentedge/webdbmodule:$RELEASE_VERSION-arm64v8  
docker tag $DEV_REGISTRY.azurecr.io/intelligentedge/inferencemodule:$INFERENCE_MODULE_VERSION-arm64v8  intelligentedge/inferencemodule:$RELEASE_VERSION-arm64v8

docker tag $DEV_REGISTRY.azurecr.io/intelligentedge/predictmodule:$PREDICT_MODULE_VERSION-jetsonarm64v8  intelligentedge/predictmodule:$RELEASE_VERSION-jetsonarm64v8
docker tag $DEV_REGISTRY.azurecr.io/intelligentedge/predictmodule:$PREDICT_MODULE_VERSION-cpuarm64v8  intelligentedge/predictmodule:$RELEASE_VERSION-cpuarm64v8

docker tag $DEV_REGISTRY.azurecr.io/intelligentedge/rtspsimmodule:$RTSPSIM_MODULE_VERSION-arm64v8  intelligentedge/rtspsimmodule:$RELEASE_VERSION-arm64v8
docker tag $DEV_REGISTRY.azurecr.io/intelligentedge/nginxmodule:$NGINX_MODULE_VERSION-arm64v8  intelligentedge/nginxmodule:$RELEASE_VERSION-arm64v8
docker tag $DEV_REGISTRY.azurecr.io/intelligentedge/cameramodule:$CAMERA_MODULE_VERSION-arm64v8  intelligentedge/cameramodule:$RELEASE_VERSION-arm64v8
docker tag $DEV_REGISTRY.azurecr.io/intelligentedge/uploadmodule:$UPLOAD_MODULE_VERSION-arm64v8  intelligentedge/uploadmodule:$RELEASE_VERSION-arm64v8


# ===================
# Push images
# ===================
docker push intelligentedge/webmodule:$RELEASE_VERSION-arm64v8
#docker push intelligentedge/webdbmodule:$RELEASE_VERSION-arm64v8

docker push intelligentedge/inferencemodule:$RELEASE_VERSION-arm64v8

docker push intelligentedge/predictmodule:$RELEASE_VERSION-jetsonarm64v8
docker push intelligentedge/predictmodule:$RELEASE_VERSION-cpuarm64v8

docker push intelligentedge/rtspsimmodule:$RELEASE_VERSION-arm64v8
docker push intelligentedge/nginxmodule:$RELEASE_VERSION-arm64v8
docker push intelligentedge/cameramodule:$RELEASE_VERSION-arm64v8
docker push intelligentedge/uploadmodule:$RELEASE_VERSION-arm64v8


# ===================
# Update Installers
# ===================

#rm Windows.zip
#cd Windows
#zip ../Windows.zip deploy-custom-vision-arm.json factory-ai-vision-install.cmd deployment.amd64.json deployment.arm64v8.json
#cd ..
#
#rm Windows.arm64v8.zip
#cd Windows
#zip ../Windows.arm64v8.zip deploy-custom-vision-arm.json factory-ai-vision-install.cmd deployment.arm64v8.json
#cd ..

#rm bash.zip
#cd bash
#zip ../bash.zip deploy-custom-vision-arm.json factory-ai-vision-install.sh deployment.amd64.json deployment.arm64v8.json
#cd ..

#rm bash.arm64v8.zip
#cd bash.arm64v8
#zip ../bash.arm64v8.zip deploy-custom-vision-arm.json factory-ai-vision-install.sh deployment.arm64v8.json
#cd ..

#cd Installer
#rm acs.zip
#zip acs.zip deploy-custom-vision-arm.json factory-ai-vision-install.sh deployment.amd64.json deployment.opencv.amd64.json
#
#rm acs-ase.zip
#zip acs-ase.zip deploy-custom-vision-arm.json factory-ai-vision-install-ase.sh deployment.ase.amd64.json

