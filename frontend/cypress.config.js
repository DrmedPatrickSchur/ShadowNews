const { defineConfig } = require('cypress')

module.exports = defineConfig({
 e2e: {
   baseUrl: 'http://localhost:3000',
   specPattern: 'cypress/e2e/**/*.{js,jsx,ts,tsx}',
   supportFile: 'cypress/support/e2e.js',
   fixturesFolder: 'cypress/fixtures',
   screenshotsFolder: 'cypress/screenshots',
   videosFolder: 'cypress/videos',
   viewportWidth: 1280,
   viewportHeight: 720,
   video: true,
   screenshotOnRunFailure: true,
   defaultCommandTimeout: 10000,
   requestTimeout: 10000,
   responseTimeout: 10000,
   pageLoadTimeout: 30000,
   retries: {
     runMode: 2,
     openMode: 0
   },
   env: {
     apiUrl: 'http://localhost:5000/api',
     coverage: false,
     codeCoverage: {
       url: 'http://localhost:5000/__coverage__'
     }
   },
   experimentalStudio: true,
   experimentalWebKitSupport: true,
   chromeWebSecurity: false,
   modifyObstructiveCode: false,
   setupNodeEvents(on, config) {
     require('@cypress/code-coverage/task')(on, config)
     
     on('task', {
       log(message) {
         console.log(message)
         return null
       },
       table(message) {
         console.table(message)
         return null
       },
       seedDatabase() {
         return require('./cypress/tasks/seedDatabase')()
       },
       clearDatabase() {
         return require('./cypress/tasks/clearDatabase')()
       },
       createUser(userData) {
         return require('./cypress/tasks/createUser')(userData)
       },
       createPost(postData) {
         return require('./cypress/tasks/createPost')(postData)
       },
       createRepository(repoData) {
         return require('./cypress/tasks/createRepository')(repoData)
       }
     })
     
     on('before:browser:launch', (browser = {}, launchOptions) => {
       if (browser.family === 'chromium' && browser.name !== 'electron') {
         launchOptions.args.push('--disable-dev-shm-usage')
         launchOptions.args.push('--disable-gpu')
         launchOptions.args.push('--no-sandbox')
         launchOptions.args.push('--disable-setuid-sandbox')
         launchOptions.args.push('--disable-web-security')
         launchOptions.args.push('--disable-features=IsolateOrigins,site-per-process')
       }
       
       if (browser.family === 'firefox') {
         launchOptions.preferences['network.cookie.sameSite.laxByDefault'] = false
       }
       
       return launchOptions
     })
     
     return config
   }
 },
 
 component: {
   devServer: {
     framework: 'react',
     bundler: 'webpack',
     webpackConfig: require('./webpack.config.js')
   },
   specPattern: 'src/**/*.cy.{js,jsx,ts,tsx}',
   supportFile: 'cypress/support/component.js',
   indexHtmlFile: 'cypress/support/component-index.html',
   viewportWidth: 1280,
   viewportHeight: 720,
   video: false
 }
})