# Using PowerBi to see results from Intelligent Edge AI Void Detection


### Prerequisites
An Edge-based Machine Learning Solution with one of the following setups:
- [Data Box Edge](../edgedevice/data-box-edge.md)
- [Azure Stack](../edgedevice./azure-stack.md)
- [Microsoft Power BI Desktop](https://powerbi.microsoft.com/en-us/desktop/)

### Create a Shared Access Signature (SAS) token from your Azure Storage Account

1. Open the storage account created in the DBE or Azure Stack Setup
1. Under **Settings** select **Shared Access signature**
1. Change the **End** date to a future date and click **Generate SAS and connection string**
1. From the results, save the Blob service SAS URL, you will need it later.


### Create a Service Principal to access Azure resources
1. In the Azure Portal, go to **Azure Active Directory**, under **Manage** select **App registrations**
1. Create a new registration, by selecting the New registration button at the top of the page
1. In the **Register an application** page, give a name and leave the **Supported account type** as **Single tenant**.  Click the **Register** button
1. In the results, make note of the Application (client) ID and Directory (tenant) ID.  You'll need these values again later.

#### Create a client secret for the Service Principal
1. In the settings for the Service Principal, under **Manage** click **Certificates and secrets**
1. click the **+ New client secret** button
1. Give a Description and a Time Frame, click **Add**
1. Make a copy of the value, you'll need it later

#### Give the Service Principal API permissions
1. In the settings for the Service Principal, under **Manage** click **Certificates and secrets**
1. Click the **+ Add a permission button** 
1. In the subsequent dialog, select **APIs my organization uses**
1. Type *Azure Time Series Insights* in the search bar and select it in the results
1. Turn on **user_impersonation** and click the **Add permission** button to save

#### Give the Service Principal access to the TSI instance
1. Open the Times Series Insights Environment in the Azure Portal
1. In the **Overview** section, make note of the **Data Access FQDN**, you'll need this later
1. Under **Settings**, click **Data Access Policies**
1. Give the Service Principal you created earlier **Reader** access


## View the results in Power BI
1. Open this [PBIX](./IntelligentEdge.pbix) file in PowerBi for Desktop
1. Under the list of **Fields**, right click the query called TSI, select edit query
1. Click Advanced Editor in the ribbon on the subsequent page

Replace these values with what you copied above
* clientId -> Application (client) ID from the Service Principal
* tenantId -> Directory (tenant) ID from the Service Principal
* clientSecret -> Client secret from the Service Principal
* tsiFQDN -> Data Access FQDN for the TSI instance

4. click **Done**, click **Close and Apply** in the ribbon

Note sometimes Power Bi will prompt for for how to connect, use Anonymous

1. In the report, click the **All Events** tab
1. Select the visual in the top right corner
1. Under **Visualizations** column select the **Format icon** (it looks like a paint roller) and expand **Settings**
1. Update **Blob SAS URL** with the Blob Service SAS URL you copied when you generated the SAS token for the storage account