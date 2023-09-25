const { Router } = require('express')
const router = Router();
const ctrl = require('../controllers/excel.controller');


router.post('/uploadInvoiceDoc', async (req, res) => { await ctrl.uploadInvoiceDoc(req, res); });

module.exports = router;
