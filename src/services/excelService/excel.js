const { pool_pg } = require('../../database');

async function insertExcelData(requestList) {
  try {
    let values = ''
    const inventoryColumn = requestList[0].invoice_number
    requestList.forEach((el, index) => {
      values += `('${el.invoice_number}', '${el.invoice_date}', '${el.invoice_terms}', '${el.costumer_code}', '${el.description}', '${el.sku}', '${el.quantity}', '${el.materials}', '${el.hs_code}', '${el.selling_value}', '${el.unit_value}', '${el.divisa}', '${el.total_value}', '${el.mlc}')`
      values += index < requestList.length - 1 ? ', ' + "\n" : ''
    })
    const queryDelete = `DELETE FROM invoice WHERE invoice_number = '${inventoryColumn}';`
    const queryInsert = `INSERT INTO invoice (invoice_number, invoice_date, invoice_terms, costumer_code, description, sku, quantity, materials, hs_code, selling_value, unit_value, divisa, total_value, mlc) VALUES
          ${values};`;
    await pool_pg.query(queryDelete);
    await pool_pg.query(queryInsert);
    return 'ok'
  } catch (error) {
    console.log('error inserting', error)
    return 'error inserting'
  }
}

module.exports = {
  insertExcelData
};
