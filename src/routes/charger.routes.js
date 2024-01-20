const { Router } = require('express')
const router = Router();
const charger = require('../controllers/charger.controller');
const user = require('../controllers/users.controller');

// charger
router.get('/auth/exists/:company/:email/', async (req, res) => { await charger.emailExists(req, res); });
router.post('/auth/login/', async (req, res) => { await charger.authLogin(req, res); });
router.get('/pools/', async (req, res) => { await charger.getPools(req, res); });
// user
router.get('/', async (req, res) => { await user.loginUser(req, res); });


module.exports = router;


