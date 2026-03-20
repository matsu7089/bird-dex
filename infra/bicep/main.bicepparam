using 'main.bicep'


param envName = 'prod'
param location = 'japaneast'
param dbAdminPassword = readEnvironmentVariable('DB_ADMIN_PASSWORD')
param githubClientId = readEnvironmentVariable('GITHUB_CLIENT_ID')
param githubClientSecret = readEnvironmentVariable('GITHUB_CLIENT_SECRET')
param sessionSecret = readEnvironmentVariable('SESSION_SECRET')

