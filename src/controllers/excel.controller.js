// const { leerExcel } = require('../services/excelService/excelFunc');
const { insertExcelData, listInvoicesData } = require('../services/excelService/excel');

/* call excel */
const listInvoices = async (req, res) => {
  try {
    const list = await listInvoicesData()
    res.status(200).json({ response: list });
  } catch (error) {
    res.status(200).json({ response: [] });
  }
}

/* save data form excel invoice */
const uploadInvoiceDoc = async (req, res) => {
  try {
    const requestList = JSON.parse(JSON.stringify(req.body))
    const respInsert = await insertExcelData(requestList)
    res.status(200).json({ response: respInsert });
  } catch (error) {
    res.status(200).json({ response: "error" });
  }
}

module.exports = {
  listInvoices,
  uploadInvoiceDoc,
};


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