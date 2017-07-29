// Vendor Dependencies
const fetch = require('isomorphic-fetch')

const urlHead = "https://translation.googleapis.com/language/translate/v2?key=AIzaSyBKO65TgERUuR8Njhp1JHckjaHOWKFVz78&q="

const translate = (req, res, message, target="en") => {
  return fetch(urlHead+message+"&target="+target).then((response) => {
    return response.json()
  }).then((resData) => {
    const data = resData.data.translations[0]

    const text = data.translatedText
    const lang = data.detectedSourceLanguage
    return { text, lang }
  })
}

module.exports = {
  translate
}
