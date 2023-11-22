const { Router } = require('express')
const router = Router();
const ctrl = require('../controllers/charger.controller');

router.get('/auth/exists/:company/:email/', async (req, res) => { await ctrl.emailExists(req, res); });
router.post('/auth/login/', async (req, res) => { await ctrl.authLogin(req, res); });
router.get('/pools/', async (req, res) => { await ctrl.getPools(req, res); });
module.exports = router;
