import { Router } from 'express';

import { generarJWT } from "../helpers/generar-JWT.js"

import {
    saveHotel
} from "./hotels.controller.js"

const router = Router()

router.post(
    "/save",
    saveHotel
)

export default router