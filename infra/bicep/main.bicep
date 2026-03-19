param envName string
param location string = resourceGroup().location

@secure()
param dbAdminPassword string

param githubClientId string

@secure()
param githubClientSecret string

@secure()
param sessionSecret string

param githubRedirectUrl string
param frontendUrl string

param apiImageTag string = 'latest'

// ─── ACR ──────────────────────────────────────────────────────────────────────

module acr 'modules/acr.bicep' = {
  name: 'acr'
  params: {
    location: location
    envName: envName
  }
}

// ─── PostgreSQL ───────────────────────────────────────────────────────────────

module postgres 'modules/postgres.bicep' = {
  name: 'postgres'
  params: {
    location: location
    envName: envName
    adminPassword: dbAdminPassword
  }
}

// ─── Storage ──────────────────────────────────────────────────────────────────

module storage 'modules/storage.bicep' = {
  name: 'storage'
  params: {
    location: location
    envName: envName
  }
}

// ─── Container App (API) ──────────────────────────────────────────────────────

module containerApi 'modules/containerApi.bicep' = {
  name: 'containerApi'
  params: {
    location: location
    envName: envName
    acrLoginServer: acr.outputs.loginServer
    acrName: acr.outputs.name
    apiImageTag: apiImageTag
    databaseUrl: postgres.outputs.connectionString
    blobEndpoint: storage.outputs.endpoint
    blobAccessKey: storage.outputs.accountName
    blobSecretKey: storage.outputs.accountKey
    blobBucket: storage.outputs.containerName
    githubClientId: githubClientId
    githubClientSecret: githubClientSecret
    sessionSecret: sessionSecret
    githubRedirectUrl: githubRedirectUrl
    frontendUrl: frontendUrl
  }
}

// ─── Static Web App (Web) ─────────────────────────────────────────────────────

module staticWebApp 'modules/staticWebApp.bicep' = {
  name: 'staticWebApp'
  params: {
    envName: envName
  }
}

// ─── Outputs ──────────────────────────────────────────────────────────────────

output apiUrl string = containerApi.outputs.apiUrl
output acrLoginServer string = acr.outputs.loginServer
output webHostname string = staticWebApp.outputs.defaultHostName
output swaDeploymentToken string = staticWebApp.outputs.deploymentToken
