const { pool_pg } = require('../../database');

async function insertExcelData(requestList) {
  let invoice_number = '-'
  let invoice_date = '-'
  let invoice_terms = '-'
  let invoiceRows = []
  requestList.forEach((elem) => {
    // INVOICE NUMBER, DATE, TERMS
    if (Object.entries(elem).length < 5) {
      Object.entries(elem).forEach((ele) => {
        ele.forEach((el) => {
          if (String(el).toLowerCase().includes('cl')) { invoice_number = String(el) }
          if (String(el).toLowerCase().includes('date')) { invoice_date = String(Object.entries(elem)[1][1]) }
          if (String(el).toLowerCase().includes('terms')) { invoice_terms = String(Object.entries(elem)[1][1]) }
        })
      })
    }

    // BODY OF EXCEL
    if (Object.entries(elem).length > 9) {
      invoiceRows.push({
        invoice_number,
        invoice_date,
        invoice_terms,
        costumer_code: Object.entries(elem)[0] ? Object.entries(elem)[0].length > 1 ? String(Object.entries(elem)[0][1]).replaceAll("'", "") : '-' : '-', // Invoice: 1338893,  
        description: Object.entries(elem)[1] ? Object.entries(elem)[1].length > 1 ? String(Object.entries(elem)[1][1]).replaceAll("'", "") : '-' : '-', // __EMPTY_1: 'watch',  
        sku: Object.entries(elem)[2] ? Object.entries(elem)[2].length > 1 ? String(Object.entries(elem)[2][1]).replaceAll("'", "") : '-' : '-', // __EMPTY_2: 'NNTQ79237',  
        quantity: Object.entries(elem)[3] ? Object.entries(elem)[3].length > 1 ? String(Object.entries(elem)[3][1]).replaceAll("'", "") : '-' : '-', // __EMPTY_3: 20, 
        materials: Object.entries(elem)[4] ? Object.entries(elem)[4].length > 1 ? String(Object.entries(elem)[4][1]).replaceAll("'", "") : '-' : '-', // __EMPTY_4: 'Metal + plastic',  
        hs_code: Object.entries(elem)[5] ? Object.entries(elem)[5].length > 1 ? String(Object.entries(elem)[5][1]).replaceAll("'", "") : '-' : '-', // __EMPTY_5: 9102120000,  
        selling_value: Object.entries(elem)[6] ? Object.entries(elem)[6].length > 1 ? String(Object.entries(elem)[6][1]).replaceAll("'", "") : '-' : '-', // __EMPTY_6: 82.348,   
        unit_value: Object.entries(elem)[7] ? Object.entries(elem)[7].length > 1 ? String(Object.entries(elem)[7][1]).replaceAll("'", "") : '-' : '-', // __EMPTY_7: 69.2,  
        divisa: Object.entries(elem)[8] ? Object.entries(elem)[8].length > 1 ? String(Object.entries(elem)[8][1]).replaceAll("'", "") : '-' : '-', // __EMPTY_8: 'USD', 
        total_value: Object.entries(elem)[9] ? Object.entries(elem)[9].length > 1 ? String(Object.entries(elem)[9][1]).replaceAll("'", "") : '-' : '-', // __EMPTY_9: 1384,  
        mlc: Object.entries(elem)[10] ? Object.entries(elem)[10].length > 1 ? String(Object.entries(elem)[10][1]).replaceAll("'", "") : '-' : '-', // __EMPTY_10: 'MLC546055202'  
      })
    }
  });

  const listLast = invoiceRows.splice(1, invoiceRows.length - 1)
  let values = ''
  let coma = ', '
  listLast.forEach((el, index) => {
    // console.log(index + 1)
    values += `('${el.invoice_number}', '${el.invoice_date}', '${el.invoice_terms}', '${el.costumer_code}', '${el.description}', '${el.sku}', '${el.quantity}', '${el.materials}', '${el.hs_code}', '${el.selling_value}', '${el.unit_value}', '${el.divisa}', '${el.total_value}', '${el.mlc})'`
    values += index < listLast.length - 1 ? coma + "\n" : ' \n'
  })

  
  const queryInsert = `INSERT INTO invoice (invoice_number, invoice_date, invoice_terms, costumer_code, description, sku, quantity, materials, hs_code, selling_value, unit_value, divisa, total_value, mlc) VALUES
  ${values};`;
  
  console.log(queryInsert)

  await pool_pg.query(queryInsert);

  // await pool_pg.query(`delete from invoice_data where invoice_num = '${invoiceNo[0]['value']}';`);
}

module.exports = {
  insertExcelData
};
