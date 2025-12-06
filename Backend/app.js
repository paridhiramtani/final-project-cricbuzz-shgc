require('dotenv').config(); // Ensure this is at the top
const mongoose = require('mongoose');
const bodyParser = require('body-parser')
const express = require('express')
const cors = require('cors')
const app = express()
const Router_players = require('./Api/Routes/players')
const LiveScore_router = require('./Api/Routes/liveScore')
const pointTable = require('./Api/Routes/pointTable')
const t20_rank = require('./Api/Routes/t20_rank')
const odi_rank = require('./Api/Routes/odi_rank')
const test_rank = require('./Api/Routes/test_rank')
const matches = require('./Api/Routes/matches')
const userLogin = require('./Api/Routes/userLogin')

const { default: mongoose } = require('mongoose')

const db = process.env.MONGODB_URI
mongoose.connect(process.env.MONGO_URI)
    .then(() => console.log('Database Connected'))
    .catch(err => console.log(err));

// CORS configuration with environment variable
const allowedOrigins = process.env.ALLOWED_ORIGINS 
    ? process.env.ALLOWED_ORIGINS.split(',') 
    : ['http://localhost:4200']

app.use(cors({
    origin: function(origin, callback) {
        if (!origin || allowedOrigins.indexOf(origin) !== -1) {
            callback(null, true)
        } else {
            callback(new Error('Not allowed by CORS'))
        }
    },
    credentials: true
}))

app.use(bodyParser.urlencoded({extended: true}))
app.use(bodyParser.json({extended: true}))

app.use('/players', Router_players)
app.use('/livescores', LiveScore_router)
app.use('/pointtable', pointTable)
app.use('/t20', t20_rank)
app.use('/odi', odi_rank)
app.use('/test', test_rank)
app.use('/matches', matches)
app.use('/', userLogin)

// Error handling middleware
app.use((err, req, res, next) => {
    console.error(err.stack)
    res.status(500).json({ message: 'Something went wrong!', error: err.message })
})

module.exports = app
