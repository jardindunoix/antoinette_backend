const { Router } = require('express')
const router = Router();
const ctrl = require('../controllers/charger.controller');

router.get('auth/exists/:company&:email', async (req, res) => { await ctrl.emailExists(req, res); });

module.exports = router;
