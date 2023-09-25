const { Router } = require('express')
const router = Router();
const ctrl = require('../controllers/documentation.controller');

router.post('/loginDocs', async (req, res) => { await ctrl.loginDocs(req, res); });

module.exports = router;
