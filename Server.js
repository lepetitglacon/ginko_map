const express = require('express')
const app = express()
const port = 3000
const cors = require('cors')
app.use(cors())
app.use(express.json())

const MongoClient = require('mongodb').MongoClient;
const url = 'mongodb://127.0.0.1:27017'
const dbName = 'ginko_map';
let db
MongoClient.connect(url, function(err, client) {
    console.log("Connected successfully to server");
    db = client.db(dbName);
});

const axios = require('axios')
const fs = require('fs')
const {json} = require("express");





app.get('/', (req, res) => {
    res.send('running')
})

app.get('/importLines', async (req, res) => {

    let gtfsLines = getGtfsLines()
    let ginkoLines = getGinkoLines()


    console.log(gtfsLines, ginkoLines)
    ginkoLines.map((ginkoLine) => {
        console.log(ginkoLine)
    })

    async function getGtfsLines() {
        fs.readFile('./Server/gtfs-ginko.zip.geojson', "utf8", ((err, data) => {
            return data
        }))
    }

    async function getGinkoLines() {
        return axios.get('https://api.ginko.voyage/DR/getLignes.do?apiKey=XXX')
    }
})

app.get('/importStops', (req, res) => {
    let dataArray = []
    fetch('https://api.ginko.voyage/DR/getLignes.do?apiKey=XXX')
        .then(res => {res.json()})
        .then(json => {
            console.log(json)
        })
})

app.get('/lines', (req, res) => {
    db.collection('lines').find({"geometry.type": "LineString"}).toArray((err, docs) => {
        if (err) {
            console.log(err)
            throw err
        }
        res.status(200).json(docs)
    })
})

app.get('/stops', (req, res) => {
    db.collection('lines').find({"geometry.type": "Point"}).toArray((err, docs) => {
        if (err) {
            console.log(err)
            throw err
        }
        res.status(200).json(docs)
    })
})

app.listen(port, () => {
    console.log('----------------------------------------------- START')
    console.log(`Example app listening at http://localhost:${port}`)
})
