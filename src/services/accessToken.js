const fetch = require('axios')
const { pool_pg } = require('../database');

module.exports.returnAccessTokenForItemId = async (urlAcTok) => {
  try {
    const accessToken = await fetch.post(`https://api.mercadolibre.com/oauth/token?grant_type=refresh_token&client_id=3698739416306050&client_secret=LwgOJm33WigcfXp8AL2OyKZN6FS4YoME&refresh_token=${urlAcTok.trim()}&limit=200`, {
      headers: { "Content-Type": "application/json" }
    })
      .then(data => data).catch(err => console.log(`Error en el catch del return access toekn`, err['response']['data']['message']));
    return accessToken
  } catch (error) {
    console.log(`Error en el return acces toekene`)
  }
}

module.exports.getRefreshToken = async (id) => {
  return await pool_pg.query(`select refresh_token from refresh_tokens where refresh_token ilike '%${id}%'`);
}

module.exports.vRT = async (urlActok) => {
  try {
    const accessToken = await fetch.post(`https://api.mercadolibre.com/oauth/token?grant_type=authorization_code&client_id=3698739416306050&client_secret=LwgOJm33WigcfXp8AL2OyKZN6FS4YoME&code=${urlActok}&redirect_uri=https://auth.sellers-info.cl`, {
      headers: { "Content-Type": "application/json" }
    })
      .then(data => data).catch(err => console.log(`Error en FETCH (data null pk es no se puede usar dos veces)`, err['message']));

    return accessToken;

  } catch (error) { console.log(`Error grave en CATCH ACCES TOKEN , REVISAR`) }
}
