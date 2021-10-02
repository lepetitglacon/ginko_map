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

$(window).on('load', function initialize(e) {
    createGeojsonLines()
})

/**
 * Récupère les lignes depuis la BDD
 */
function createGeojsonLines() {
    fetch(config.serverURL+"get/lines", config.headers)
        .then(res => res.json())
        .then(features => {
            createGeojsonLinesBulk(features)
        })
}

/**
 * Crée les objets GeoJSON des lignes
 *
 * @param features
 */
function createGeojsonLinesBulk(features) {
    L.geoJSON(features,{
        style: (line) => {
            return {
                color: line.properties.route_color,
                weight: 5
            }
        },
        onEachFeature: (line, layer) => displayLinesForm(line, layer)
    })
}

/**
 * Affiche la liste des lignes
 *
 * @param line
 * @param layer
 */
function displayLinesForm(line, layer) {
    if (config.afficherToutesLesLignesFormulaire){
        addLineToLinesForm(line, layer)
    } else {
        if (line.properties.route_variante_id){
            addLineToLinesForm(line, layer)
        }
    }
}

/**
 * Ajoute une ligne de Bus/Tram dans la liste des lignes
 *
 * @param line
 * @param layer
 */
function addLineToLinesForm(line, layer) {
    const linesContainer = $('#lines_container')

    let itemContainer = $('#line_container_'+line.properties.route_id+'')
    if (itemContainer.length === 0) {
        itemContainer = $('<div id="line_container_'+line.properties.route_id+'" class="line_container"></div>')
    }

    const item = $('<div class="line_item"></div>')
        .click(async function handleCLick(e) {
            const markers = await createMarkers(line, layer)
            const layerGroup = L.layerGroup();
            layerGroup.addTo(map)

            if (!layerGroup.hasLayer(layer)) {
                console.log('yes')
                layerGroup.addLayer(layer)
                layerGroup.addLayer(markers)
            } else {
                layerGroup.removeLayer(markers)
                layerGroup.removeLayer(layer)
            }
        })

    const lineIcon = $('<span class="line_icon">'+line.properties.route_short_name+'</span>')
        .css('background-color', line.properties.route_color)
        .css('color', line.properties.route_text_color)

    const lineDirection = $('<div class="line_direction">'+line.properties.route_destination+'</div>')

    item
        .append(lineIcon)
        .append(lineDirection)
    itemContainer.append(item)
    linesContainer.append(itemContainer)
}

/**
 *
 *
 * @param line
 * @param layer
 */
async function createMarkers(line, layer) {
    const stops = await doAjax('get/stops', {id: line.properties.route_id})
    let markers = L.layerGroup()
    stops.map(stop => {
        const marker = L.marker([stop.geometry.coordinates[1],stop.geometry.coordinates[0]])
        markers.addLayer(marker)
    })
    return markers
}

/**
 *
 * @param url backend call url ex. "get/lines"
 * @param params params object ex {id: id}
 * @returns {Promise<*>}
 */
async function doAjax(url, params) {
    return $.ajax({
        url: config.serverURL + url,
        data: params
    });
}



