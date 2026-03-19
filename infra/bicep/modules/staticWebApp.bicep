param location string
param envName string

resource staticWebApp 'Microsoft.Web/staticSites@2022-09-01' = {
  name: 'birddex-${envName}-web'
  location: location
  sku: {
    name: 'Free'
    tier: 'Free'
  }
  properties: {}
}

output deploymentToken string = staticWebApp.listSecrets().properties.apiKey
output defaultHostName string = staticWebApp.properties.defaultHostname
