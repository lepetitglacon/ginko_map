let map = L.map('map').setView([47.236009, 6.025174], 13);
map.preferCanvas = true

L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
}).addTo(map);

const server = 'http://127.0.0.1:3000/'
const headers = new Headers()

fetch(server+"lines", headers)
    .then(res => res.json())
    .then(json => {
        console.log(json)
        L.geoJSON(json,{
            style: (line) => {
                return {
                    color: line.properties.route_color,
                    weight: 5
                }
            }}).addTo(map)
    })

fetch(server+"stops", headers)
    .then(res => res.json())
    .then(json => {
        console.log(json)

    })




