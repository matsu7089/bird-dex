param location string
param envName string

resource acr 'Microsoft.ContainerRegistry/registries@2023-07-01' = {
  name: 'birddex${envName}acr'
  location: location
  sku: {
    name: 'Basic'
  }
  properties: {
    adminUserEnabled: true
  }
}

output loginServer string = acr.properties.loginServer
output name string = acr.name
