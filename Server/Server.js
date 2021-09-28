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





app.get('/', (req, res) => {
    res.send('running')
})

app.get('/importDB', (req, res) => {
    let dataArray = []
    fs.readFile('gtfs-ginko.zip.geojson', "utf8", ((err, data) => {
        data = JSON.parse(data)
        data.features.forEach((feature) => {
            dataArray.push(feature)
        })
        insertManyLines(dataArray).then(r => res.send(r))
    }))
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

app.listen(port, () => {
    console.log('----------------------------------------------- START')
    console.log(`Example app listening at http://localhost:${port}`)
})
