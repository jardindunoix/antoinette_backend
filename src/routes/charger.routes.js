const { Router } = require('express')
const router = Router();
const ctrl = require('../controllers/charger.controller');

router.get('auth/exists/:email', async (req, res) => { await ctrl.emailExists(req, res); });

module.exports = router;
