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

async function listInvoiceInfoDetail(invnumb) {
  try {
    const invData = await pool_pg.query(`
                    SELECT
invoice.invoice_number,
invoice.invoice_date,
invoice.invoice_terms,
invoice.inbound,
invoice.inbound_meli,
upper(users.username),
invoice.owner_id,
invoice.seller_id,
invoice.mlc,
invoice.sku, 
invoice.items,
trunc(cast(invoice.selling as decimal), 2) as selling,
invoice.price_meli,
invoice.price_meli_date,
invoice.currency,
invoice.title,
invoice.permalink
FROM invoice 
LEFT JOIN
users
ON trim(invoice.owner_id) = trim(users.owner_id)
WHERE invoice.invoice_number = '${invnumb}'
ORDER BY invoice.mlc DESC, invoice.sku, invoice.inbound
;

                        `)
                        

    return invData.rows
  } catch (error) {
    error
  }
}

module.exports = {
  insertExcelData,
  listInvoicesData,
  listInvoiceInfoDetail
};
