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

})

/**
 * Récupère les lignes depuis la BDD
 */
async function createGeojsonLines() {
    fetch(config.serverURL+"get/lines", config.headers)
        .then(res => res.json())
        .then(features => {
            createGeojsonLinesBulk(features)
        })
    const lines = await doAjax(config.serverURL+"get/lines")

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
async function addLineToLinesForm(line, layer) {
    const markers = await createMarkers(line, layer)
    const group = L.layerGroup([markers, layer]);

    const container = $('#controls_destination')
        .on('change', function handleCLick() {
            if (!map.hasLayer(group)) {
                group.addTo(map)
            } else {
                map.removeLayer(group)
            }
        })

    const select = $('#controls_destination_select')
    const option = $('<option class="line_item" value="'+line.properties.route_id+'_'+line.properties.route_variante_id+'"></option>')

    const lineIcon = $('<span class="line_icon">'+line.properties.route_short_name+'</span>')
        .css('background-color', line.properties.route_color)
        .css('color', line.properties.route_text_color)

    const lineDirection = $('<div class="line_direction">'+line.properties.route_destination+'</div>')

    option
        .append(lineIcon)
        .append(lineDirection)
    select.append(option)
}

/**
 *
 *
 * @param line
 * @param layer
 */
async function createMarkers(line, layer) {
    const stops = await doAjax('get/stopsByVariant', {id: line.properties.route_variante_id})
    let markers = L.layerGroup()
    stops.map(stop => {
        const marker = L.marker([stop.geometry.coordinates[1],stop.geometry.coordinates[0]])
        marker.bindPopup(stop.properties.name+" direction "+line.properties.route_destination)
        markers.addLayer(marker)
    })
    return markers
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



