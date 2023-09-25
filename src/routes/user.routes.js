//para especificar por ej los end poinrt de los user, para que se creen y regisntren user//para los end point de los productos
const { Router } = require('express')
const router = Router();
const ctrl = require('../controllers/users.controller');
// import { authJwt, verifySignup } from '../middlewares'

/* login */
router.post('/', async (req, res) => { await ctrl.loginUser(req, res); });

/* save seller */
router.post('/save', async (req, res) => { await ctrl.saveUser(req, res); });

/* statistics */
router.post('/statistics', async (req, res) => { await ctrl.statistics(req, res); });

/* list sellers */
router.post('/list', async (req, res) => { await ctrl.listUsers(req, res); });

/* list sellers granted and active */
router.post('/listGrantedActive', async (req, res) => { await ctrl.listGrantedActive(req, res); });

/* list of granted for admin and agent */
router.post('/allGrantedUsers', async (req, res) => { await ctrl.listGrantedUsers(req, res); });
router.post('/allGrantedUsersAdmin', async (req, res) => { await ctrl.listGrantedUsersAdmin(req, res); });

/* accounts process analisis */
router.post('/sellersInvoiceList', async (req, res) => { await ctrl.sellersInvoiceList(req, res); });
router.post('/sellerInvoiceDetails', async (req, res) => { await ctrl.sellerInvoiceDetails(req, res); });

//router.get('/auth', async (req, res) => { await ctrl.setAuth(req, res); });
router.post('/singleMkpl', async (req, res) => { await ctrl.singleMkpl(req, res); });

/* responds for operation  */
router.post('/getOperaciones', async (req, res) => { await ctrl.getOperaciones(req, res); });
router.post('/getOperacionesItems', async (req, res) => { await ctrl.getOperacionesItems(req, res); });

router.post('/codeRT', async (req, res) => { await ctrl.codeRT(req, res); });

router.post('/getInvoiceErrorList', async (req, res) => { await ctrl.getInvoiceErrorList(req, res); });
router.post('/getInvoiceOperations', async (req, res) => { await ctrl.getInvoiceOperations(req, res); });
router.post('/getSellerInfo', async (req, res) => { await ctrl.getSellerInfo(req, res); });
// MAIL FOR CODE ACCESS
router.post('/mailcode', async (req, res) => { await ctrl.mailcode(req, res); });
router.post('/saveNewPasswordFirstEntrance', async (req, res) => { await ctrl.saveNewPasswordFirstEntrance(req, res); });
router.post('/newreload', async (req, res) => { await ctrl.newreload(req, res); });

module.exports = router;


