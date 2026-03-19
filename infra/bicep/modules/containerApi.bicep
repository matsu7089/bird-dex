param location string
param envName string
param acrLoginServer string
param acrName string
param apiImageTag string
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

resource logAnalytics 'Microsoft.OperationalInsights/workspaces@2023-09-01' = {
  name: 'birddex-${envName}-logs'
  location: location
  properties: {
    sku: {
      name: 'PerGB2018'
    }
    retentionInDays: 30
  }
}

resource acr 'Microsoft.ContainerRegistry/registries@2023-07-01' existing = {
  name: acrName
}

resource managedEnv 'Microsoft.App/managedEnvironments@2024-03-01' = {
  name: 'birddex-${envName}-env'
  location: location
  properties: {
    appLogsConfiguration: {
      destination: 'log-analytics'
      logAnalyticsConfiguration: {
        customerId: logAnalytics.properties.customerId
        sharedKey: logAnalytics.listKeys().primarySharedKey
      }
    }
  }
}

resource apiApp 'Microsoft.App/containerApps@2024-03-01' = {
  name: 'birddex-${envName}-api'
  location: location
  properties: {
    managedEnvironmentId: managedEnv.id
    configuration: {
      ingress: {
        external: true
        targetPort: 3000
        transport: 'auto'
      }
      registries: [
        {
          server: acrLoginServer
          username: acr.listCredentials().username
          passwordSecretRef: 'acr-password'
        }
      ]
      secrets: [
        { name: 'acr-password', value: acr.listCredentials().passwords[0].value }
        { name: 'database-url', value: databaseUrl }
        { name: 'blob-secret-key', value: blobSecretKey }
        { name: 'github-client-secret', value: githubClientSecret }
        { name: 'session-secret', value: sessionSecret }
      ]
    }
    template: {
      containers: [
        {
          name: 'api'
          image: '${acrLoginServer}/api:${apiImageTag}'
          resources: {
            cpu: json('0.5')
            memory: '1Gi'
          }
          env: [
            { name: 'NODE_ENV', value: 'production' }
            { name: 'PORT', value: '3000' }
            { name: 'DATABASE_URL', secretRef: 'database-url' }
            { name: 'BLOB_ENDPOINT', value: blobEndpoint }
            { name: 'BLOB_ACCESS_KEY', value: blobAccessKey }
            { name: 'BLOB_SECRET_KEY', secretRef: 'blob-secret-key' }
            { name: 'BLOB_BUCKET', value: blobBucket }
            { name: 'GITHUB_CLIENT_ID', value: githubClientId }
            { name: 'GITHUB_CLIENT_SECRET', secretRef: 'github-client-secret' }
            { name: 'SESSION_SECRET', secretRef: 'session-secret' }
            { name: 'GITHUB_REDIRECT_URL', value: githubRedirectUrl }
            { name: 'FRONTEND_URL', value: frontendUrl }
          ]
        }
      ]
      scale: {
        minReplicas: 0
        maxReplicas: 3
      }
    }
  }
}

output apiUrl string = 'https://${apiApp.properties.configuration.ingress.fqdn}'
output apiName string = apiApp.name
