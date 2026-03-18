param location string
param envName string
param acrLoginServer string
param acrName string
param apiImageTag string
param webImageTag string
@secure()
param databaseUrl string
@secure()
param blobEndpoint string
@secure()
param blobAccessKey string
@secure()
param blobSecretKey string
param blobBucket string
param githubClientId string
@secure()
param githubClientSecret string
@secure()
param sessionSecret string

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
        {
          name: 'acr-password'
          value: acr.listCredentials().passwords[0].value
        }
        {
          name: 'database-url'
          value: databaseUrl
        }
        {
          name: 'blob-endpoint'
          value: blobEndpoint
        }
        {
          name: 'blob-access-key'
          value: blobAccessKey
        }
        {
          name: 'blob-secret-key'
          value: blobSecretKey
        }
        {
          name: 'github-client-secret'
          value: githubClientSecret
        }
        {
          name: 'session-secret'
          value: sessionSecret
        }
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
            { name: 'BLOB_ENDPOINT', secretRef: 'blob-endpoint' }
            { name: 'BLOB_ACCESS_KEY', secretRef: 'blob-access-key' }
            { name: 'BLOB_SECRET_KEY', secretRef: 'blob-secret-key' }
            { name: 'BLOB_BUCKET', value: blobBucket }
            { name: 'GITHUB_CLIENT_ID', value: githubClientId }
            { name: 'GITHUB_CLIENT_SECRET', secretRef: 'github-client-secret' }
            { name: 'SESSION_SECRET', secretRef: 'session-secret' }
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

resource webApp 'Microsoft.App/containerApps@2024-03-01' = {
  name: 'birddex-${envName}-web'
  location: location
  properties: {
    managedEnvironmentId: managedEnv.id
    configuration: {
      ingress: {
        external: true
        targetPort: 80
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
        {
          name: 'acr-password'
          value: acr.listCredentials().passwords[0].value
        }
      ]
    }
    template: {
      containers: [
        {
          name: 'web'
          image: '${acrLoginServer}/web:${webImageTag}'
          resources: {
            cpu: json('0.25')
            memory: '0.5Gi'
          }
        }
      ]
      scale: {
        minReplicas: 0
        maxReplicas: 3
      }
    }
  }
}

output apiFqdn string = apiApp.properties.configuration.ingress.fqdn
output webFqdn string = webApp.properties.configuration.ingress.fqdn
