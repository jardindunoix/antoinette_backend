//para especificar por ej los end poinrt de los user, para que se creen y regisntren user//para los end point de los productos
const { Router } = require('express')
const router = Router();
const ctrl = require('../controllers/notifications.controller');
// import { authJwt, verifySignup } from '../middlewares'

/* norification 1 */
router.post('/callback', async (req, res) => { await ctrl.receipOneNotification(req, res); });

router.post('/codeRT', async (req, res) => { await ctrl.codeRT(req, res); });

module.exports = router;
