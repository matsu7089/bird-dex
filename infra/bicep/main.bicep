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

// ─── App Service ──────────────────────────────────────────────────────────────

module appService 'modules/appService.bicep' = {
  name: 'appService'
  params: {
    location: location
    envName: envName
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

// ─── Static Web App ───────────────────────────────────────────────────────────

module staticWebApp 'modules/staticWebApp.bicep' = {
  name: 'staticWebApp'
  params: {
    envName: envName
  }
}

// ─── Outputs ──────────────────────────────────────────────────────────────────

output apiUrl string = appService.outputs.apiUrl
output webHostname string = staticWebApp.outputs.defaultHostName
output swaDeploymentToken string = staticWebApp.outputs.deploymentToken
