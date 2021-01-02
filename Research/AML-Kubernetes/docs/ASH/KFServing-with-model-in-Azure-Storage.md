# KFServing with Azure Storage Blob

In this article, you will create a KFServing InferenceService resource on a kubernetes cluster with KFserving installed. 
The machine learning model used is in tensorflow saved model format. It is saved as Azure Storage blob. 

## Prerequisites

*   Make sure you have access to a kubernetes cluster with KFserving installed. 
    
    Please refer [KFserving installation guide](KFServing-setup.md) for details of installing KFServing.
    
*   A machine learn model is stored as Azure Storage Blobs.

    For this guide, a tensorflow saved model used because tensorflow predictor is used in inferenceService definition.
    Please see <a href="#storageUri">storageUri format</a> for details about how to organize the blob structure.

    One can perform a distributed training using Azure Machine Service and register the trained model with the AML 
    workspace as documented [here](notebooks/distributed-tf2-cifar10/distributed-tf2-cifar10.ipynb);
    The registered model can then be downloaded/uploaded to azure storage blobs as shown in this 
    [notebook](notebooks/AML-model-download-upload.ipynb).
    
    For KFServing to securely download the blobs to the kubernetes cluster, the blobs are granted to a service principal with 
    "Storage Blob Data Owner" role. For how to create a service principal in azure active directory, please refer to 
    [here](https://docs.microsoft.com/en-us/azure/active-directory/develop/howto-create-service-principal-portal). For 
    azure storage access with role assignment, please refer to this [document](https://docs.microsoft.com/en-us/azure/storage/common/storage-auth-aad-rbac-portal)
    

## Deploy KFserving InferenceService

*  Create a kubernetes secret for client credentials(use kubectl apply -f ):

   The data in Secret is encoded in base64. Here is a simple way to encode a plain string in base64 in Linux:

<pre> $ echo -n "mystring" | base64 </pre>

   please make sure the "-n" option is used. To decode:

<pre> $ echo -n "base64-string" | base64 -d </pre>


   The manifesto for the secret is:

<pre>
apiVersion: v1
kind: Secret
metadata:
  name: azcreds
type: Opaque
data:
  AZ_CLIENT_ID: "ZDQ5NzAyNTUtNDc3YS00ZDczLWE3YWQtNzNhOTNmMzBiZDUx"
  AZ_CLIENT_SECRET: "ckZ+Y3VScmEwfnhjTHZhSC04NDVMaS1FQzhhOFYzfmtHWg=="
  AZ_SUBSCRIPTION_ID: "NmI3MzZkYTYtMzI0Ni00NGRkLWEwYjgtYjVlOTU0ODQ2MzNk"
  AZ_TENANT_ID: "NzJmOTg4YmYtODZmMS00MWFmLTkxYWItMmQ3Y2QwMTFkYjQ3"
</pre>


*  Create a kubernetes service account with Secret created above (use kubectl apply -f ):

    InferenceService created below will use this service account to retrieve client credentials.

<pre>
apiVersion: v1
kind: ServiceAccount
metadata:
  name: azuresa
secrets:
- name: azcreds
</pre>


*  Create KFServing InferenceService (use kubectl apply -f ):

    Note the ServiceAccount created above is referenced under "predictor"

<pre>
apiVersion: "serving.kubeflow.org/v1alpha2"
kind: "InferenceService"
metadata:
  name: "cifar10"
spec:
  default:
    predictor:
      tensorflow:
        storageUri: "https://backupsli.blob.core.windows.net/tfmodel/cifar10model"
      serviceAccountName: azuresa
</pre>

<a name="storageUri"></a>
### Note on StorageUri format

Please pay special attention to storageUri here. Internally, this inferenceService uses Tensorflow Serving which requires
a version folder as parent folder of the model files. Specifically for this particular storageUri, "tfmodel" is the 
container name, "cifar10model" is a "folder" blob, under cifar10model is version folder such as "001". The saved_model.pb is 
immediately under 001. the variable folder is immediately under 001. Finally, the data and index files are immediately 
under variable folder. Please see [this screen captures](video/kfserving_tf_blob_structure.mp4) for an example.

You can read more about tensorflow saved model [here](https://www.tensorflow.org/guide/saved_model)
and [tensorflow serving](https://www.tensorflow.org/tfx/tutorials/serving/rest_simple).

Check if the inferenceService is ready or not by running:

<pre>kubectl get inferenceService -n default </pre>

##  Get xip.io url for Testing:

If you configured DNS with xip.io as mentioned in [KFserving installation guide](KFServing-setup.md), you can get the
xip.io url and use a web test tool like Insomnia or Postman to test your service.

*  Get host url:

<pre>
$ kubectl get ksvc
NAME                        URL                                                             LATESTCREATED                     LATESTREADY                                          READY   REASON
cifar10-predictor-default   http://cifar10-predictor-default.default.38.102.181.86.xip.io   cifar10-predictor-default-l9f6s   cifar10-predict                   or-default-l9f6s   True
</pre>

As displayed, host url is http://cifar10-predictor-default.default.38.102.181.86.xip.io
*  The whole url:

    The whole url is composed as host_url + /v1/models/inferenceService-name:predict
    For this particular example, it is:

    http://cifar10-predictor-default.default.38.102.181.86.xip.io/v1/models/cifar10:predict

*  Test the inference service:
   
    The predictor used here is tensorflow serving. Here is the 
   [instruction](https://www.tensorflow.org/tfx/tutorials/serving/rest_simple) about how to generate test input. 
   
    An example of Cifar10 is given at [cifar10_test_input](test-data/cifar10_test_input.json). You can test the service
    using web testing tools such as Postman or Insomnia, or you can use the following python code:

<pre>
import requests

def post_kfservice(predit_uri, input_path):
    with open(input_path, "r") as ftp:
        test_input = ftp.read()
    resp = requests.post(predit_uri, test_input, headers={'Content-Type': 'application/json'})
    print(f"{resp.text}")
    return resp.text

if __name__ == "__main__":
    predit_uri = "http://cifar10-predictor-default.default.38.102.181.86.xip.io/v1/models/cifar10:predict"
    input_path = "test-data/cifar10_test_input.json"
    post_kfservice(predit_uri, input_path)
</pre>
   