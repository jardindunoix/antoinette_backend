const { leerExcel } = require('../services/excelService/excelFunc');

/* load excell in */
const uploadInvoiceDoc = async (req, res) => {

  // console.log(Object.entries(req.body)[0])
  const request = JSON.parse(JSON.stringify(req.body))
  // console.table(JSON.parse(JSON.stringify(req.body)))

  request.forEach((el, index) => {
    console.log(Object.entries(index, el))
  });

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
