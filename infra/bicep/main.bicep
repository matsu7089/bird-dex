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

// ─── Container Apps Environment ───────────────────────────────────────────────

module containerApi 'modules/containerApi.bicep' = {
  name: 'containerApi'
  params: {
    location: location
    envName: envName
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

output acrLoginServer string = acr.outputs.loginServer
output webHostname string = staticWebApp.outputs.defaultHostName
output swaDeploymentToken string = staticWebApp.outputs.deploymentToken
