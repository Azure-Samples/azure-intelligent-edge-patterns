# FHIR Server

This is a containerized Docker solution for an FHIR server and MSSQL database. Deployment is configured via `helm`.

# Software Prerequisites

- [Helm](https://helm.sh/docs/intro/install/)

# Docker Images

The Docker images being used are Microsoft's published images.

- **FHIR Server Image** sourced from `mcr.microsoft.com/healthcareapis/r4-fhir-server`
- **FHIR MSSQL DB Image** sourced from `mcr.microsoft.com/mssql/server`

## Deploy via Helm

The **recommended** approach is to deploy all containers at once with the Helm chart in the parent directory. (see [README](./../README.md#get-started))

But, if you want to deploy this single container you can do so by setting the empty values in [`values.helm`](./helm/values.yaml) and then running

_NOTE: This approach will not work if you previously deployed with the parent chart. Running this command creates a new release, but cannot be used to modify an existing release._

``` bash
helm upgrade --install fhir helm
```

## Local Deployment (for developers)

- Use docker-compose for running FHIR locally:
  - Run the following command from the root directory of the project. You will need to set a password for local development (you can choose your password for development).
    
    `env SAPASSWORD=<password> docker-compose up -d --build`
    
    Note: wrap password in `'` single quotes if it contains special characters.
  - You can then send requests to the FHIR Server running locally at `http://localhost:8080`.


