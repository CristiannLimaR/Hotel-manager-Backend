import { Router } from 'express';

import { validarJWT } from '../middlewares/validar-JWT.js';
import { validarAdmin } from '../middlewares/validar-admin.js';

import {
    saveHotel
} from "./hotels.controller.js"

const router = Router()

router.post(
    "/save",
    [
        validarJWT,
        validarAdmin
    ],
    saveHotel
)

export default router