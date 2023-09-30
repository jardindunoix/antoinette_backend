const { leerExcel } = require('../services/excelService/excelFunc');
const { insertExcelData } = require('../services/excelService/excel');

/* load excell in */
const uploadInvoiceDoc = async (req, res) => {
  const requestList = JSON.parse(JSON.stringify(req.body))
  const respInsert = await insertExcelData(requestList)



  res.status(200).json({ response: `ok` });

  /*
    try {
      if (req.files) {
        if (req.files.doc.name.includes('.xlsx')) {
          await req.files.doc.mv(`./uploads/doc.xslx`);
          const responseExcel = await leerExcel(`./uploads/doc.xslx`);
          res.status(200).send(responseExcel);
        } else { res.status(200).send(`no_extension`); }
      } else { res.status(200).send(`no_file`); }
    } catch (error) {
      console.log(`error uploading`, error);
      res.status(200).send(`ERROR UPLOADING`);
    }
   */
}

module.exports = {
  uploadInvoiceDoc,
};
