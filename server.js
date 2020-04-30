const express = require('express')
const chalk = require('chalk')
const path = require('path')
const ServerChat = require('./src/ServerChat')

const config = require('./app/config')

const app = express()
app.use(express.static(path.join(__dirname, 'public')))

const serverHttp = app.listen(process.env.PORT || process.argv[2] || config.port, () => {
  console.log(chalk.blueBright(`Server listening at http://localhost:${chalk.green(config.port)}`))
  // console.log(`Connected to ${config.database}`)
  console.log('App is running ...')
  console.log('Press CTRL + C to stop the process.')
})

const serverChat = new ServerChat(serverHttp)