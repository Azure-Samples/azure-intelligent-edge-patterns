# FHIR Server

This is a containerized Docker solution for an FHIR server and MSSQL database. Deployment is configured via `helm`.

# Software Prerequisites

- [Helm](https://helm.sh/docs/intro/install/)

# Docker Images

The Docker images being used are Microsoft's published images.

- **FHIR Server Image** sourced from `mcr.microsoft.com/healthcareapis/r4-fhir-server`
- **FHIR MSSQL DB Image** sourced from `mcr.microsoft.com/mssql/server`

## Deployment via Helm

### TODO: Required setup for kubectl and ~.kube/config to run this deploy

To deploy to configured cluster:
  ```
  helm upgrade --install fhir helm
  ```

To generate templates locally (Optional):
  ```
  helm template fhir helm --dry-run
  ```

## Local Deployment (for developers)

- Use docker-compose for running FHIR locally:
  - Run the following command from the root directory of the project. You will need to set a password for local development (you can choose your password for development).
    
    `env SAPASSWORD=<password> docker-compose up -d --build`
    
    Note: wrap password in `'` single quotes if it contains special characters.
  - You can then send requests to the FHIR Server running locally at `http://localhost:8080`.

# TODOs

![REMOVE ME](https://freedom1coffee.com/wp-content/uploads/2018/08/remove-before-flight.png)

_**[Remove this section before release]**_

- change password in fhir connection string "ThisshouldW0rk1!"
    - should this be at a higher level in values.yml?
    - the password has very particular requirements that are not well documented
    - variable exists twice in values.yml. should it be templatized?

- is the storage class name ase-node-local default? Can it be hard coded? Or should we get that name programmatically?
