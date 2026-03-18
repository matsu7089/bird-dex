param location string
param envName string
@secure()
param adminPassword string

var serverName = 'birddex-${envName}-pg'
var adminUser = 'birdlog'
var dbName = 'birdlog'

resource pgServer 'Microsoft.DBforPostgreSQL/flexibleServers@2023-06-01-preview' = {
  name: serverName
  location: location
  sku: {
    name: 'Standard_B1ms'
    tier: 'Burstable'
  }
  properties: {
    administratorLogin: adminUser
    administratorLoginPassword: adminPassword
    version: '16'
    storage: {
      storageSizeGB: 32
    }
    backup: {
      backupRetentionDays: 7
      geoRedundantBackup: 'Disabled'
    }
    highAvailability: {
      mode: 'Disabled'
    }
  }
}

resource database 'Microsoft.DBforPostgreSQL/flexibleServers/databases@2023-06-01-preview' = {
  parent: pgServer
  name: dbName
  properties: {
    charset: 'UTF8'
    collation: 'en_US.UTF8'
  }
}

// Allow Azure services to connect
resource firewallRule 'Microsoft.DBforPostgreSQL/flexibleServers/firewallRules@2023-06-01-preview' = {
  parent: pgServer
  name: 'AllowAzureServices'
  properties: {
    startIpAddress: '0.0.0.0'
    endIpAddress: '0.0.0.0'
  }
}

output fqdn string = pgServer.properties.fullyQualifiedDomainName
output connectionString string = 'postgres://${adminUser}:${adminPassword}@${pgServer.properties.fullyQualifiedDomainName}:5432/${dbName}?sslmode=require'
