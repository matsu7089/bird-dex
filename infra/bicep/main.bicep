param envName string
param location string = resourceGroup().location

@secure()
param dbAdminPassword string

param githubClientId string

@secure()
param githubClientSecret string

@secure()
param sessionSecret string

param apiImageTag string = 'latest'
param webImageTag string = 'latest'

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

// ─── Container Apps ───────────────────────────────────────────────────────────

module containerApps 'modules/containerApps.bicep' = {
  name: 'containerApps'
  params: {
    location: location
    envName: envName
    acrLoginServer: acr.outputs.loginServer
    acrName: acr.outputs.name
    apiImageTag: apiImageTag
    webImageTag: webImageTag
    databaseUrl: postgres.outputs.connectionString
    blobEndpoint: storage.outputs.endpoint
    blobAccessKey: storage.outputs.accountName
    blobSecretKey: storage.outputs.accountKey
    blobBucket: storage.outputs.containerName
    githubClientId: githubClientId
    githubClientSecret: githubClientSecret
    sessionSecret: sessionSecret
  }
}

// ─── Outputs ──────────────────────────────────────────────────────────────────

output apiFqdn string = containerApps.outputs.apiFqdn
output webFqdn string = containerApps.outputs.webFqdn
output acrLoginServer string = acr.outputs.loginServer
