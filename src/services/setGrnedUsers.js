const fetch = require('axios');
const { returnAccessTokenForItemId } = require('./accessToken.js');
const { pool_pg } = require('../database.js');


const setGrnedUsers = async () => {
  try {
    const at = await pool_pg.query(`select refresh_token from refresh_tokens where refresh_token ilike '%731199549%' limit 1;`);
    const atRow = at['rows'][0]['refresh_token'].trim();
    const accessToken = await returnAccessTokenForItemId(atRow);
    const acsTok = accessToken['data']['access_token'];
    const urlUno = 'https://api.mercadolibre.com/applications/3698739416306050/grants?limit=200';
    const urlDos = 'https://api.mercadolibre.com/users/';
    const headers = { headers: { "Content-Type": "application/json", Authorization: `Bearer ${acsTok}` } };
    const usersGranted = await fetch.get(urlUno, headers)
      .then(rsp => {
        const arrSalida = []
        rsp['data']['grants'].forEach(el => arrSalida.push(el['user_id']))
        const arrResp = []
        arrSalida.forEach(el => {
          const urlUsers = `${urlDos}${el}`
          arrResp.push(fetch.get(urlUsers, headers)
            .then(rsp => rsp['data'])
            .catch(err => console.log(`ERROR EN AXIOS GRAND USERS DOS`)))
        })
        return arrResp
      }).catch(err => console.log(`ERROR EN AXIOS GRAND USERS`))
    if (usersGranted) return usersGranted
  } catch (error) { console.log(`ERROR EN SET GRNATED USERS`, error) }
}

const setGrnedUsersDB = async () => {
  try {
    return await pool_pg.query(`select refresh_token from refresh_tokens;`);
  } catch (error) { console.log(`erorroree`) }
}

module.exports = { setGrnedUsers, setGrnedUsersDB }
