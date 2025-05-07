import { Router } from 'express';

import { validarJWT } from '../middlewares/validar-JWT.js';
import { validarAdmin } from '../middlewares/validar-admin.js';

import {
    saveHotel,
    getHotels,
    searchHotel,
    upgradeHotel,
    deleteHotel
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

router.get(
    "/search/:id",
    [
        validarJWT,
    ],
    searchHotel
)

router.put(
    "/upgrade/:id",
    [
        validarJWT,
        validarAdmin
    ],
    upgradeHotel
)

router.delete(
    "/delete/:id",
    [
        validarJWT,
        validarAdmin
    ],
    deleteHotel
)

export default router