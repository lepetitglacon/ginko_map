// configuration générale
let config = {}
config.afficherToutesLesLignesFormulaire = false
config.afficherToutesLesLignesMap = false
config.serverURL = 'http://127.0.0.1:3000/'
config.headers = new Headers()

// configuration de la carte
let map = L.map('map').setView([47.236009, 6.025174], 13);
L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
}).addTo(map);
map.preferCanvas = true
map.lastLine = undefined

$(window).on('load',async function initialize(e) {
    const lines = await getLines()
    const select = $("#controls_destination_select")
    select.on('change',async e => {
        console.log(geojson)
        if (map.hasLayer(geojson)) {
            map.removeLayer(geojson)
        }
        if (map.hasLayer(map.lastLine)) {
            map.removeLayer(map.lastLine)
        }
        map.lastLine = await displayLine(e.target.value)
    })

    createSelectOption(lines, select)
    const geojson = await displayLines(lines)
    console.log(geojson)
})

function createSelectOption(lines, select) {
    lines.forEach(line => {
        const id = line.properties.route_id+'_'+line.properties.route_variante_id
        const text = line.properties.route_short_name+' destination '+line.properties.route_destination
        const option = $('<option value="'+id+'">'+text+'</option>')
        select.append(option)
    })
}

async function displayLines(lines) {
    const geojson = L.geoJSON(lines,{
        style: (line) => {
            return {color: line.properties.route_color}
        },
        onEachFeature: (line) => {
            displayStops(line.properties.route_variante_id)
        }
    })
    geojson.addTo(map)
    return geojson
}

async function displayLine(ids) {
    const idArray = ids.split("_")
    const geojsonLine = await doAjax('get/line', {id: idArray[1]})
    const line = L.geoJSON(geojsonLine, {
        style: line => {
            return {color: line.properties.route_color}
        }
    })
    line.addTo(map)
    return line
}

function displayStops(varianteId) {

}

function displayStop() {

}

async function getLines() {
    if (config.afficherToutesLesLignesFormulaire){
        return doAjax('get/lines')
    } else {
        return doAjax('get/lines', {
            "filter": {
                "properties.route_variante_id": {"$exists": 1}
            },

        })
    }

}

/**
 *
 * @param url
 * @param params
 * @returns {Promise<*>}
 */
async function doAjax(url, params = {}) {
    return $.ajax({
        url: config.serverURL + url,
        data: params
    });
}



