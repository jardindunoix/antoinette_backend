const { Router } = require('express')
const router = Router();
const ctrl = require('../controllers/excel.controller');

router.post('/uploadInvoiceDoc', async (req, res) => { await ctrl.uploadInvoiceDoc(req, res); });
router.post('/listInvoices', async (req, res) => { await ctrl.listInvoices(req, res); });

module.exports = router;
