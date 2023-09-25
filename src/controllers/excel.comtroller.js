const { leerExcel } = require('../services/excelService/excelFunc');


/* load excell in */
const uploadInvoiceDoc = async (req, res) => {
  try {

    console.log('ENTRINEN');

    if (req.files) {
      if (req.files.doc.name.includes('.xlsx')) {
        await req.files.doc.mv(`./uploads/doc.xslx`);
        res.status(200).send(await leerExcel(`./uploads/doc.xslx`));
      } else { res.status(200).send(`no_extension`); }
    } else { res.status(200).send(`no_file`); }

  } catch (error) {
    console.log(`error uploading`, error);
    res.status(200).send(`ERROR UPLOADING`);
  }
}

module.exports = {
  uploadInvoiceDoc,
};
