//para los end point de los productos

import { Router } from 'express'
import * as authCtrl from '../controllers/auth.controllers'
import { verifySignup } from '../middlewares'

const router = Router()

router.post('/signin', authCtrl.signIn)
router.post('/signup', [verifySignup.checkDuplicatedUsernameOrEmail, verifySignup.checkRolesExisted], authCtrl.signUp)

export default router