// Vendor Dependencies
import fetch from "isomorphic-fetch"

export const translate = async (req, res, message, target="en") => {
  const response = await fetch("https://translation.googleapis.com/language/translate/v2?key=AIzaSyBKO65TgERUuR8Njhp1JHckjaHOWKFVz78&q="+message+"&target="+target);
  const resData = await response.json();
  const data = resData.data.translations[0]

  const text = data.translatedText
  const lang = data.detectedSourceLanguage
  return { text, lang }
}
