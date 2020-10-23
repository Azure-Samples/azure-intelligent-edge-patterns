WEB_MODULE_VERSION=0.3.533
GPU_INFERENCE_MODULE_VERSION=0.1.548
CPU_INFERENCE_MODULE_VERSION=0.1.548
WEBDB_MODULE_VERSION=0.0.1
RTSPSIM_MODULE_VERSION=0.0.7
CAMERA_MODULE_VERSION=0.0.31
NGINX_MODULE_VERSION=0.0.9

DEV_REGISTRY=factoryairegistry

DEPLOY_VERSION=0.1.34

# ===================
# Tag new version
# ===================
docker tag $DEV_REGISTRY.azurecr.io/intelligentedge/webmodule:$WEB_MODULE_VERSION-amd64     intelligentedge/webmodule:$DEPLOY_VERSION-amd64  
docker tag $DEV_REGISTRY.azurecr.io/intelligentedge/webdbmodule:$WEBDB_MODULE_VERSION-amd64     intelligentedge/webdbmodule:$DEPLOY_VERSION-amd64  
docker tag $DEV_REGISTRY.azurecr.io/intelligentedge/inferencemodule:$GPU_INFERENCE_MODULE_VERSION-gpuamd64  intelligentedge/inferencemodule:$DEPLOY_VERSION-gpuamd64
docker tag $DEV_REGISTRY.azurecr.io/intelligentedge/inferencemodule:$CPU_INFERENCE_MODULE_VERSION-cpuamd64  intelligentedge/inferencemodule:$DEPLOY_VERSION-cpuamd64
docker tag $DEV_REGISTRY.azurecr.io/intelligentedge/rtspsimmodule:$RTSPSIM_MODULE_VERSION-amd64  intelligentedge/rtspsimmodule:$DEPLOY_VERSION-amd64
docker tag $DEV_REGISTRY.azurecr.io/intelligentedge/nginxmodule:$NGINX_MODULE_VERSION-amd64  intelligentedge/nginxmodule:$DEPLOY_VERSION-amd64
docker tag $DEV_REGISTRY.azurecr.io/intelligentedge/cameramodule:$CAMERA_MODULE_VERSION-amd64  intelligentedge/cameramodule:$DEPLOY_VERSION-amd64


# ===================
# Push images
# ===================
docker push intelligentedge/webmodule:$DEPLOY_VERSION-amd64
docker push intelligentedge/webdbmodule:$DEPLOY_VERSION-amd64
docker push intelligentedge/inferencemodule:$DEPLOY_VERSION-gpuamd64
docker push intelligentedge/inferencemodule:$DEPLOY_VERSION-cpuamd64
docker push intelligentedge/rtspsimmodule:$DEPLOY_VERSION-amd64
docker push intelligentedge/nginxmodule:$DEPLOY_VERSION-amd64
docker push intelligentedge/cameramodule:$DEPLOY_VERSION-amd64


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

cd Installer
rm acs.zip
zip acs.zip deploy-custom-vision-arm.json factory-ai-vision-install.sh deployment.amd64.json deployment.opencv.amd64.json

#rm acs-ase.zip
#zip acs-ase.zip deploy-custom-vision-arm.json factory-ai-vision-install-ase.sh deployment.ase.amd64.json

