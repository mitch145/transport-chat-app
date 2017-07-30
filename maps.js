// Vendor Dependencies
const fetch = require('isomorphic-fetch')



const findRoute = (origin, destination) => {
  const url = "https://maps.googleapis.com/maps/api/directions/json?origin="+origin+"&destination="+destination+"&key=AIzaSyCqtw00-eflkY-AKPzmyl281c2x4K56pUQ"
  return fetch(url).then((response) => {
    return response.json()
  }).then((data) => {
    const routes = []
    data.routes[0].legs[0].steps.forEach((val) => {
      routes.push(val.html_instructions.replace(/(<([^>]+)>)/ig, ""))
    })
    return(routes)
  })
}

module.exports = {
  findRoute
}
