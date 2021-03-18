# Setup Azure Stack Hub's Blob Storage as a Datastore on Azure Machine Learning Workspace and Run a Training Workload

In this article, you:
*	Create storage account on Azure Stack Hub
*	Configure the storage account to work with Azure Machine Learning and Azure Stack Hub’s Kubernetes Cluster
*	Connect the storage account to Azure Machine Learning as a datastore (where you hold all your training data) 
*	Run your first Azure Machine Learning training job on Azure Stack Hub using AzureML Python SDK (example notebooks)




## Prerequisites

Make sure you have access to Azure and your Azure Stack Hub is ready for use. In addition, this article assumes you have already:

1. Deployed a Kubernetes cluster in you Azure Stack Hub
2. Connected the Kubernetes cluster to Azure via Azure ARC

If you have not completed any of the two above, please do so using [instructions given here](AML-ARC-Compute.md). Furthermore, please verify that you have already created an Azure Machine learning workspace. If not, please [create your Machine learning workspace](https://docs.microsoft.com/en-us/azure/machine-learning/concept-workspace#-create-a-workspace). It is also strongly recommended to learn more about the innerworkings and concepts in Azure Machine Learning before continuing with the rest of this article (optional). Lastly, make sure both Python and AzureML Python SDK are installed on the device that you will be using to communicate with Azure Machine Learning. 


## Create and Configure Azure Stack Hub’s Storage Account

We first start by creating a storage account on Azure Stack Hub’s Portal:

1. Select **Create a resource > Data + Storage**. Select **Storage account**. If you do not see the **Storage account**, contact your Azure Stack Hub cloud operator and ask for the image to be added to the Azure Stack Hub Marketplace.

<p align="center">
  <img src="imgs/Cstorage.png" />
</p>

2. Fill project details and click on **Review + create**. Make sure to select the same subscription and resource group used for already deployed Kubernetes cluster.

3.	Select **Create** after the validation process has passed. Wait until the resource creation process is complete. 

We can now start configuring our storage account to work with Azure Machine Learning and Azure storage:

1.	Select **CORS** under settings section of the storage’s overview page. 
2.	Under **Blob service** fill the following information:
    
        Allowed origins: https://mlworkspace.azure.ai,https://ml.azure.com,https://*.ml.azure.com,https://mlworkspacecanary.azure.ai,https://mlworkspace.azureml-test.net
    
        Allowed methods: GET, HEAD, PUT (PUT is only needed if you are planning on using Azure Machine Learning tools to add data to your storage)
    
        Allowed headers: *
    
        Exposed headers: *
    
        Max age: 1800

3.	Click on **Save**.

    <p align="center">
      <img src="imgs/cors.png" />
    </p>
    
4.	Select **Shared access signature** under settings section of the storage’s overview page. 
5.	Fill the form as shown in the image below and click on **Generate SAS and connection string**. Fill the **Start and expiry date/time** based on your workload’s needs.

    <p align="center">
      <img src="imgs/sas.png" />
    </p>

6.	Copy the SAS token generated to clipboard. You will use this in the next section when connecting your storage account to Azure Machine Learning as a datastore.

    <p align="center">
      <img src="imgs/sas-token.png" />
    </p>
    
7.	Select **Containers** under Blob service section of the storage’s overview page. Select **+ Container**  to create a new container.

    <p align="center">
      <img src="imgs/container.png" />
    </p>
    
8.	Choose a name for your storage container and leave the public access level to Private. Select Create and then enter the newly created container by clicking on it.
9.	Click on **Properties** under the settings section. Copy the URL to clipboard. You will use the URL when setting up your Azure Machine Learning datastore.

    <p align="center">
      <img src="imgs/url.png" />
    </p>
    

## Connect the storage account to Azure Machine Learning as a datastore

Now we will connect Azure Stack Hub’s storage account to Azure Machine Learning:

1. Go to your Azure Machine Learning workspace studio and select **Datastore > New datastore**:

    <p align="center">
      <img src="imgs/datastore.png" />
    </p>
    
2.	Fill the form as shown in the image below. Paste both the container URL and SAS token copied earlier in the designated area and click on **Create**.


    <p align="center">
      <img src="imgs/datastore-set.png" />
    </p>

Congratulations! you successfully have setup our Azure Stack Hub’s storage blob container as a datastore in Azure Machine Learning. The datastore can be used in conjunction with our Arc Cluster (from Azure Stack Hub) to train machine learning workloads.

**IMPORTANT: Only FileDataset is currently supported for training purposes. Please use mounting to access your files during training since downloading is not yet stable. For more information on ways you can access your Azure Machine Learning Datasets please review [FileDataset class](https://docs.microsoft.com/en-us/python/api/azureml-core/azureml.data.filedataset?view=azure-ml-py).**

## Run your first Azure Machine Learning training job on Azure Stack Hub using AzureML Python SDK (example notebooks)

In this section we will go over couple of image classifications training using various libraries on MNIST and CIFAR10 dataset stored on your Azure Stack Hub’s Blob container as a datastore. 

Check [the following video](https://msit.microsoftstream.com/video/51f7a3ff-0400-b9eb-2703-f1eb38bc6232) that goes through a simple training examples using scikit-learn library on MNIST dataset:


<a href="https://msit.microsoftstream.com/video/51f7a3ff-0400-b9eb-2703-f1eb38bc6232" target="_blank"><p align="center"><img src="imgs/vid-img.png" alt="Video Tutorial" class="center" width="700"></p></a>

## Next Steps:

Check out our [Sample Notebooks](index.md#sample-notebooks) to get a better understanding of how the process works and the possibilities it can unlock.

