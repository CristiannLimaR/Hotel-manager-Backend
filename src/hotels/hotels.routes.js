import { Router } from 'express';
import {
    saveHotel,
    getHotels,
    getHotelById,
    updateHotel,
    deleteHotel
} from "./hotels.controller.js";
import { getRooms, saveRoom } from '../rooms/room.controller.js';
import { hotelExists, validateSaveHotel, validateUpdateHotel } from '../middlewares/validator-hotel.js';
import { validarAdmin } from '../middlewares/validar-admin.js';
import { validarJWT } from '../middlewares/validar-JWT.js';
import { validateRoomCreation } from '../middlewares/validator-rooms.js';
import { validarCampos } from '../middlewares/validar-campos.js';

const router = Router();


router.post("/save", [validarJWT, validateSaveHotel, validarAdmin], validarCampos, saveHotel);
router.get("/", getHotels);
router.get("/:id", getHotelById);
router.put("/:id", [validarJWT, validarAdmin, hotelExists, validateUpdateHotel], validarCampos, updateHotel);
router.delete("/:id",[validarJWT, validarAdmin, hotelExists] , validarCampos, deleteHotel);

//habitaciones
router.post("/:hotelId/rooms",[validarJWT,validateRoomCreation], validarCampos, saveRoom);
router.get("/:hotelId/rooms", getRooms);
export default router;
