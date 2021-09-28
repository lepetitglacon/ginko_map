let map = L.map('map').setView([47.236009, 6.025174], 13);
map.preferCanvas = true

L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
}).addTo(map);

const server = 'http://127.0.0.1:3000/'
const headers = new Headers()
let lines = []
let lineDisplayed = null

let form = $("#form_lines").on('change',(e) => {
    if (lineDisplayed !== null){
        lineDisplayed.remove()
    }
    lineDisplayed = lines[e.target.value].addTo(map)
    chargeStops(e.target.dataset.line)
})

// fetch(server+"mongoLine", headers)
//     .then(res => res.json())
//     .then(json => {
//         console.log(json)
//
//         L.geoJSON(json[0].variants.comming.geometry).addTo(map)
//         L.marker([json[0].variants.comming.stops[0].geometry.coordinates[1],json[0].variants.comming.stops[0].geometry.coordinates[0]]).addTo(map)
//     })

// fetch(server+"shapes", headers)
//     .then(res => res.json())
//     .then(json => {
//         Object.entries(json.features).forEach(([key, line]) => {
//
//             geojsonLine = L.geoJSON(line,{
//                 style: (line) => {
//                     return {
//                         color: "#"+line.properties.color,
//                         weight: 5
//                     }
//                 },
//                 onEachFeature: (line, layer) => {
//                     if (line.properties.line_name){
//                         layer.bindPopup(line.properties.line_name)
//                     }
//                 }
//             })
//             lines[geojsonLine._leaflet_id] = geojsonLine
//
//             if (!$("#line_"+line.properties.ginko_route_id).length && line.properties.ginko_route_id !== 0){
//                 div = $('<div id="line_'+line.properties.ginko_route_id+'_container" class="line_container"></div>')
//                     .append("<input id='line_"+line.properties.ginko_route_id+"' data-line='"+line.properties.ginko_route_id+"' type='radio' name='lines_selector' value='"+geojsonLine._leaflet_id+"'>")
//                     .append("<label for='line_"+line.properties.ginko_route_id+"'>ligne ["+line.properties.route_name+"] - "+line.properties.line_name+"</label>")
//                 form.append(div)
//             }
//         })
//     })

// function chargeStops(lineId) {
//     fetch(server+"stops", headers)
//         .then(res => res.json())
//         .then(json => {
//             console.log(json)
//
//         })
// }

fetch(server+"gtfsjson", headers)
    .then(res => res.json())
    .then(json => {
        console.log(json)

    })




