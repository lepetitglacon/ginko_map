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
const fs = require('fs').promises
const {json} = require("express");

app.listen(port, () => {
    console.log('----------------------------------------------- START')
    console.log(`Example app listening at http://localhost:${port}`)
})

app.get('/get/lines',async  (req, res) => {
    const lines = await getLines(req)
    res.status(200).json(lines)
})

app.get('/get/line',async  (req, res) => {
    const lines = await getLine(req.query.id)
    res.status(200).json(lines)
})

app.get('/get/stop',async  (req, res) => {
    const stops = await getStops(req.query.id)
    res.status(200).json(stops)
})

app.get('/get/stops',async  (req, res) => {
    const lines = await getStops(req.query.id)
    res.status(200).json(lines)
})


app.get('/back/importDataFromGtfsFile',async (req, res) => {
    const resArray = []
    let lines = await getGtfsLines()

    await lines.map(line => {
        if (line.geometry.type === 'LineString'){
            db.collection('lines').insertOne(line).then((res, id) => {
                resArray.push(id)
            })
        } else if (line.geometry.type === 'Point'){
            db.collection('stops').insertOne(line).then((res, id) => {
                resArray.push(id)
            })
        }
    })
    res.status(200).json({"objectsInsertedCount": resArray.length, "objectsInserted": resArray})
})
app.get('/back/assignVariantToStops', async (req, res) => {
    const lines = await getLines()
    lines.map(async line => {
        const stops = await getGinkoStopsBy(line)
        stops.map(async stop => {
            const mongoStop = await getStop(stop.id)
            const newDoc = await db.collection('stops').updateOne({"_id": mongoStop._id},
                {
                    $set:{
                        "properties.route_id": line.properties.route_id,
                        "properties.route_variante_id": line.properties.route_variante_id
                    }
                })
            console.log(mongoStop.properties.id, newDoc)
        })
    })
    res.status(200).json()
})


/**
 * Returns lines Collection
 *
 * @returns {*}
 */
function getAllLines() {
    let cursor = db.collection('lines').find({}).sort({"properties.route_id": 1}).collation({
        "locale": "fr",
        "numericOrdering": true
    })
    return cursor.toArray()
}

function getLines(req) {
    if (req.query.filter) {
        let cursor = db.collection('lines').find(req.query.filter).sort({"properties.route_id": 1}).collation({
            "locale": "fr",
            "numericOrdering": true
        })
        return cursor.toArray()
    } else {
        let cursor = db.collection('lines').find({}).sort({"properties.route_id": 1}).collation({
            "locale": "fr",
            "numericOrdering": true
        })
        return cursor.toArray()
    }
}

function getLine(variantId) {
    return db.collection('lines').findOne({"properties.route_variante_id": variantId})

}

/**
 * Returns lines Collection
 *
 * @returns {*}
 */
function getStop(stopId) {
    return db.collection('stops').findOne({"properties.id": stopId})
}

/**
 * Returns lines Collection
 *
 * @returns {*}
 */
function getStops(variantId) {
    const cursor = db.collection('stops').find({"properties.route_variante_id": variantId})
    return cursor.toArray()
}

/**
 * BACK
 * Returns lines data as JSON
 * @returns {Promise<any>}
 */
async function getGtfsLines() {
    const data = await fs.readFile('./Server/gtfs-ginko.zip.geojson', "utf8")
    return JSON.parse(data.features)
}

/**
 * BACK
 * Returns every line's stops as JSON
 * @returns {Promise<any>}
 */
async function getGinkoStopsBy(line) {
    const url = 'https://api.ginko.voyage/DR/getDetailsVariante.do?apiKey=XXX&idLigne='+line.properties.route_id+'&idVariante='+line.properties.route_variante_id
    const data = await axios.get(url)
    return data.data.objets
}
