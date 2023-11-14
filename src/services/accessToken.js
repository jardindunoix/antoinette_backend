const fetch = require('axios')
const { pool_pg } = require('../database');

module.exports.returnAccessTokenForItemId = async (urlAcTok) => {
  try {
    const accessToken = await fetch
      .post(`https://api.mercadolibre.com/oauth/token?grant_type=refresh_token&client_id=3698739416306050&client_secret=LwgOJm33WigcfXp8AL2OyKZN6FS4YoME&refresh_token=${urlAcTok.trim()}&limit=200`, {
        headers: { "Content-Type": "application/json" }
      })
      .then(data => data).catch(err => console.log(`Error en el catch del return access toekn`, err['response']['data']['message']));
    return accessToken
  } catch (error) {
    console.log(`Error en el return module.exports.returnAccessTokenForItemId`)
  }
}

module.exports.getRefreshToken = async (id) => {
  return await pool_pg.query(`select refresh_token from refresh_tokens where refresh_token ilike '%${id}%'`);
}

module.exports.vRT = async (refreshToken) => {
  try {
    const URL_BASE = `https://api.mercadolibre.com/oauth/token`;
    const AUTH_CODE = `authorization_code`;
    const CLIENT_ID = `3698739416306050`;
    const CLIENT_SECRET = `LwgOJm33WigcfXp8AL2OyKZN6FS4YoME`;
    const URL_REDIRECT = `https://auth.sellers-info.cl`;
    const URL_FETCH =
      `${URL_BASE}?grant_type=${AUTH_CODE}&client_id=${CLIENT_ID}&client_secret=${CLIENT_SECRET}&code=${refreshToken}&redirect_uri=${URL_REDIRECT}`
    const accessToken = await fetch
      .post(URL_FETCH, { headers: { "Content-Type": "application/json" } })
      .then(data => data)
      .catch(err =>
        console.log(`Error en FETCH 
        (data null pk es no se puede usar dos veces, probablemente e actualizo la pagina)`,
          err['message']));
    return accessToken;
  } catch (error) { console.log(`Error grave en CATCH ACCES TOKEN , REVISAR`) }
}


