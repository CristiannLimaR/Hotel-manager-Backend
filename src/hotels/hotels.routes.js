import { Router } from 'express';

import { validarJWT } from '../middlewares/validar-JWT.js';
import { validarAdmin } from '../middlewares/validar-admin.js';
import {
    saveHotel,
    getHotels,
    getHotelById,
    updateHotel,
    deleteHotel
} from "./hotels.controller.js"
import { saveRoom, getRooms } from '../rooms/room.controller.js';
import { hotelExists, validateUpdateHotel, validateSaveHotel } from '../middlewares/validator-hotel.js';
import { validateRoomCreation } from '../middlewares/validator-rooms.js';
import { validarCampos } from '../middlewares/validar-campos.js';


const router = Router()

router.post(
    "/save",
    [
        validarJWT,
        validateSaveHotel,
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
    getHotelById
)

router.put(
    "/upgrade/:id",
    [
        validarJWT,
        hotelExists,
        validateUpdateHotel,
        validarAdmin
    ],
    updateHotel
)

router.delete(
    "/delete/:id",
    [
        validarJWT,
        hotelExists,
        validarAdmin
    ],
    deleteHotel
)

router.post("/:hotelId/rooms",[validarJWT,validateRoomCreation], validarCampos, saveRoom);
router.get("/:hotelId/rooms", getRooms);
export default router