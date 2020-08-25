# Creating a Service Principal

If you have the permissions, you can navigate to your Portal (1) that handles the proper Active Directory space (2). Look in the search bar
`app registrations`(3) and click it. You may also have a shortcut in your dashboard.

![pics/creating_service_principal_01.png](pics/creating_service_principal_01.png)

Click `New Registrations`.

Add the user-facing display name for the application. For this demo, `azure-stack-spn-demo`.

Click `Create`.

After doing so, you will create your Application ID (2) and Tenant ID(3):

![pics/creating_service_principal_02.png](pics/creating_service_principal_02.png)

You will need to create a Secret, press button `Certificates and Secrets`(4 on the screenshot above) to do so.

Then click `New Client Secret`, create a secret and copy it's value to a secure place.

[Back](Readme.md)
