require('dotenv').config()

const http = require('http')
const app = require('./app')

const port = process.env.PORT || 8080
const host = process.env.HOST || 'localhost'

const server = http.createServer(app)

server.listen(port, () => {
    console.log(`Server started at ${host}:${port}`)
})
