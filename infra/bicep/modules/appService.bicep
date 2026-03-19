param location string
param envName string
@secure()
param databaseUrl string
param blobEndpoint string
param blobAccessKey string
@secure()
param blobSecretKey string
param blobBucket string
param githubClientId string
@secure()
param githubClientSecret string
@secure()
param sessionSecret string
param githubRedirectUrl string
param frontendUrl string

resource appServicePlan 'Microsoft.Web/serverfarms@2022-09-01' = {
  name: 'birddex-${envName}-plan'
  location: location
  kind: 'linux'
  sku: {
    name: 'B1'
    tier: 'Basic'
  }
  properties: {
    reserved: true
  }
}

resource appService 'Microsoft.Web/sites@2022-09-01' = {
  name: 'birddex-${envName}-api'
  location: location
  properties: {
    serverFarmId: appServicePlan.id
    httpsOnly: true
    siteConfig: {
      linuxFxVersion: 'NODE|20-lts'
      appCommandLine: 'node dist/index.js'
      appSettings: [
        { name: 'NODE_ENV', value: 'production' }
        { name: 'DATABASE_URL', value: databaseUrl }
        { name: 'BLOB_ENDPOINT', value: blobEndpoint }
        { name: 'BLOB_ACCESS_KEY', value: blobAccessKey }
        { name: 'BLOB_SECRET_KEY', value: blobSecretKey }
        { name: 'BLOB_BUCKET', value: blobBucket }
        { name: 'GITHUB_CLIENT_ID', value: githubClientId }
        { name: 'GITHUB_CLIENT_SECRET', value: githubClientSecret }
        { name: 'SESSION_SECRET', value: sessionSecret }
        { name: 'GITHUB_REDIRECT_URL', value: githubRedirectUrl }
        { name: 'FRONTEND_URL', value: frontendUrl }
        { name: 'WEBSITE_RUN_FROM_PACKAGE', value: '1' }
      ]
    }
  }
}

output apiUrl string = 'https://${appService.properties.defaultHostName}'
output appServiceName string = appService.name
