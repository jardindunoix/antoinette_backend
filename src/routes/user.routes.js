//para especificar por ej los end poinrt de los user, para que se creen y regisntren user//para los end point de los productos
const { Router } = require('express')
const router = Router();
const ctrl = require('../controllers/users.controller');
// import { authJwt, verifySignup } from '../middlewares'

/* login */
router.post('/', async (req, res) => { await ctrl.loginUser(req, res); });

/* save seller */
router.post('/save', async (req, res) => { await ctrl.saveUser(req, res); });

/* list sellers */
router.post('/list', async (req, res) => { await ctrl.listUsers(req, res); });


router.post('/allGrantedUsers', async (req, res) => { await ctrl.listGrantedUsers(req, res); });


router.post('/allGrantedUsersAdmin', async (req, res) => { await ctrl.listGrantedUsersAdmin(req, res); });


//router.get('/auth', async (req, res) => { await ctrl.setAuth(req, res); });
router.post('/singleMkpl', async (req, res) => { await ctrl.singleMkpl(req, res); });

module.exports = router;
