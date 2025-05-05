import express from "express";
import { 
  getRoomById, 
  updateRoom, 
  deleteRoom 
} from "./room.controller.js"; 
import { validateRoomId, validateRoomUpdate } from "../middlewares/validator-rooms.js";
import { validarAdmin } from "../middlewares/validar-admin.js";
import { validarJWT } from "../middlewares/validar-JWT.js";
import { validarCampos } from "../middlewares/validar-campos.js";
import { disableRoom } from "./room.controller.js";

const router = express.Router();


router.get("/:id",[validarJWT, validarAdmin, validateRoomId], validarCampos, getRoomById);

router.put("/:id",[validarJWT, validarAdmin, validateRoomUpdate], validarCampos, updateRoom);

router.patch("/:id", [validateRoomId, validarAdmin, validarJWT], validarCampos, disableRoom);

router.delete("/:id", [validateRoomId, validarAdmin, validarJWT], validarCampos, deleteRoom);

export default router;
