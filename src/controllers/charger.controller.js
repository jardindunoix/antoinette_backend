const { insertExcelData, listInvoicesData } = require('../services/excelService/excel');

/* call excel */
const emailExists = async (req, res) => {
  try {
    const list = await listInvoicesData()
    res.status(200).json({ response: list });
  } catch (error) {
    res.status(200).json({ response: [] });
  }
}

module.exports = {
  emailExists,
};


