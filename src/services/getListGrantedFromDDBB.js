const { pool_pg } = require('../database');
const { fetchSellersDDBB, fetchSellersActive, fetchSellersActiveAgent } = require('../constants');

const getListGrantedFromDDBB = async () => {
    const resp = await pool_pg.query(fetchSellersDDBB);
    return resp['rows'];
}

const getListGrantedFromActive = async () => {
    const resp = await pool_pg.query(fetchSellersActive);
    return resp['rows'];
}

const getListGrantedFromActiveAgent = async () => {
    const resp = await pool_pg.query(fetchSellersActiveAgent);
    return resp['rows'];
}


module.exports = { getListGrantedFromDDBB, getListGrantedFromActive, getListGrantedFromActiveAgent };