const { pool_pg } = require('../../database');

async function insertExcelData(requestList) {
  try {
    let values = ''
    const inventoryColumn = requestList[0].invoice_number

    requestList.forEach((el, index) => {
      values += `
      (
        '${el.invoice_number}',
        '${el.invoice_date}',
        '${el.invoice_terms}',
        '${el.inbound}',
        '${el.sku} ',
        '${el.items}',
        '${el.selling}',
        '${el.currency}'
        )`
      values += index < requestList.length - 1 ? ', ' + "\n" : ''
    })
    const queryDelete = `DELETE FROM invoice WHERE invoice_number = '${inventoryColumn}';`
    const queryInsert = `INSERT INTO invoice 
    (
      invoice_number,
      invoice_date,
      invoice_terms,
      inbound,
      sku,
      items,
      selling,
      currency
    ) VALUES
          ${values};`;
    await pool_pg.query(queryDelete);
    await pool_pg.query(queryInsert);
    return 'ok'
  } catch (error) {
    console.log('error inserting', error)
    return 'error inserting'
  }
}


async function listInvoicesData() {
  try {
    const list = await pool_pg.query(`
                      SELECT
                      invoice_number,
                      count(invoice_number) AS item_quant,
                      sum(trunc(cast(selling as decimal), 2) * cast(items as int)) as sell_value
                      FROM invoice
                      GROUP BY
                      invoice_number
                      ORDER BY 
                      invoice_number desc
                      ;
              `)

    return list.rows
  } catch (error) {
    return []
  }

}

module.exports = {
  insertExcelData,
  listInvoicesData
};
