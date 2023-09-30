const { pool_pg } = require('../../database');

async function insertExcelData(requestList) {
  try {
    await pool_pg.query(queryInsert);
    return 'ok'
  } catch (error) {
    console.log('error ionserting in invoice table', error)
    return 'error inserting in invoice table'
  }
}

module.exports = {
  insertExcelData
};
