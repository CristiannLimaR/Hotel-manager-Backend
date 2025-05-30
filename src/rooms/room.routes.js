import express from "express";
import { 
  saveRoom,
  getRoomById,
  updateRoom, 
  deleteRoom,
  disableRoom,
  enableRoom
} from "./room.controller.js"; 
import { validateRoomId, validateRoomUpdate } from "../middlewares/validator-rooms.js";
import { validarAdmin } from "../middlewares/validar-admin.js";
import { validarJWT } from "../middlewares/validar-JWT.js";
import { validarCampos } from "../middlewares/validar-campos.js";
import { uploadRoomImages } from "../middlewares/uploadImages.js";

const router = express.Router();

router.post("/", [validarJWT, validarAdmin, uploadRoomImages], validarCampos, saveRoom);

router.get("/:id",[validarJWT, validarAdmin, validateRoomId], validarCampos, getRoomById);

router.put("/:id",[validarJWT, validarAdmin, validateRoomUpdate, uploadRoomImages], validarCampos, updateRoom);

router.patch("/:id", [validateRoomId, validarAdmin, validarJWT], validarCampos, disableRoom);

router.patch("/:id/enable", [validateRoomId, validarAdmin, validarJWT], validarCampos, enableRoom);

router.delete("/:id", [validateRoomId, validarAdmin, validarJWT], validarCampos, deleteRoom);

export default router;
