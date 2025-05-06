import { Router } from 'express';

import { validarJWT } from '../middlewares/validar-JWT.js';
import { validarAdmin } from '../middlewares/validar-admin.js';

import {
    saveHotel,
    getHotels
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

router.get(
    "/get",
    getHotels
)

export default router