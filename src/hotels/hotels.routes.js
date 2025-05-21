import { Router } from 'express';

import { validarJWT } from '../middlewares/validar-JWT.js';
import { validarAdmin } from '../middlewares/validar-admin.js';
import {
    saveHotel,
    getHotels,
    getHotelById,
    updateHotel,
    deleteHotel,
    getHotelByAdmin,
    getHotelOccupancyStats,
    getReservationsForMonths,
    busyAndAvailableRooms
} from "./hotels.controller.js"
import { saveRoom, getRooms } from '../rooms/room.controller.js';
import { hotelExists, validateUpdateHotel, validateSaveHotel } from '../middlewares/validator-hotel.js';
import { validateRoomCreation } from '../middlewares/validator-rooms.js';
import { validarCampos } from '../middlewares/validar-campos.js';
import { uploadHotelImages } from '../middlewares/uploadImages.js';
import { parseJsonFields } from '../middlewares/parseJsonFields.js';
const router = Router()

router.post(
    "/save",
    [
        validarJWT,
        uploadHotelImages,
        parseJsonFields(['facilities', 'rangeOfPrices', 'services']),
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

router.get(
    "/admin",
    [
        validarJWT
    ],
    getHotelByAdmin
)   

router.put(
    "/upgrade/:id",
    [
        validarJWT,
        hotelExists,
        uploadHotelImages,
        parseJsonFields(['facilities', 'rangeOfPrices', 'services']),
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

// FILTERS
router.get(
    "/occupancy-stats",
    [
        validarJWT,
        validarAdmin
    ],
    getHotelOccupancyStats
)

router.get(
    "/month-stats",
    [
        validarJWT
    ],
    getReservationsForMonths
)

router.get(
    "/busy-available-rooms",
    [
        validarJWT
    ],
    busyAndAvailableRooms
)


export default router