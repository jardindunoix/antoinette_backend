const { leerExcel } = require('../services/excelService/excelFunc');

/* load excell in */
const uploadInvoiceDoc = async (req, res) => {

  // console.log(Object.entries(req.body)[0])
  const request = JSON.parse(JSON.stringify(req.body))
  // console.table(JSON.parse(JSON.stringify(req.body)))

  let invoiceNumber = '-'
  let invoiceDate = '-'
  let invoiceTerms = '-'
  let invoiceRows = []
  request.forEach((elem, index) => {
    // INVOICE NUMBER, DATE, TERMS
    if (Object.entries(elem).length < 5 && index < 50) {
      Object.entries(elem).forEach((ele) => {
        ele.forEach((el) => {
          if (String(el).toLowerCase().includes('cl')) { invoiceNumber = String(el) }
          if (String(el).toLowerCase().includes('date')) { invoiceDate = String(Object.entries(elem)[1][1]) }
          if (String(el).toLowerCase().includes('terms')) { invoiceTerms = String(Object.entries(elem)[1][1]) }
        })
      })
    }

    // BODY OF EXCEL
    if (Object.entries(elem).length > 9 && index < 50) {
      invoiceRows.push({
        costumer_code: Object.entries(elem)[0][1], // Invoice: 1338893,  
        description: Object.entries(elem)[1][1], // __EMPTY_1: 'watch',  
        sku: Object.entries(elem)[2][1], // __EMPTY_2: 'NNTQ79237',  
        quantity: Object.entries(elem)[3][1], // __EMPTY_3: 20, 
        materials: Object.entries(elem)[4][1], // __EMPTY_4: 'Metal + plastic',  
        hs_code: Object.entries(elem)[5][1], // __EMPTY_5: 9102120000,  
        selling_value: Object.entries(elem)[6][1], // __EMPTY_6: 82.348,   
        unit_value: Object.entries(elem)[7][1], // __EMPTY_7: 69.2,  
        divi: Object.entries(elem)[8][1], // __EMPTY_8: 'USD', 
        total_value: Object.entries(elem)[9][1], // __EMPTY_9: 1384,  
        mlc: Object.entries(elem)[10][1], // __EMPTY_10: 'MLC546055202'  
      })
    }
  });

  console.log(
    invoiceNumber,
    invoiceDate,
    invoiceTerms,
  )

  console.log(invoiceRows.length)

  res.status(200).json({ response: `OK` });
  // try {
  //   if (req.files) {
  //     if (req.files.doc.name.includes('.xlsx')) {
  //       await req.files.doc.mv(`./uploads/doc.xslx`);
  //       const responseExcel = await leerExcel(`./uploads/doc.xslx`);
  //       res.status(200).send(responseExcel);
  //     } else { res.status(200).send(`no_extension`); }
  //   } else { res.status(200).send(`no_file`); }
  // } catch (error) {
  //   console.log(`error uploading`, error);
  //   res.status(200).send(`ERROR UPLOADING`);
  // }
}

module.exports = {
  uploadInvoiceDoc,
};
