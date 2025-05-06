import express from "express";
import {
  createService,
  getServices,
  getServiceById,
  updateService,
  deleteService,
} from "./service.controller.js";

import {
  validateServiceBody,
  ServiceExists,
} from "../middlewares/validator-service.js";
import { validarJWT } from "../middlewares/validar-JWT.js";
import { validarAdmin } from "../middlewares/validar-admin.js";
import { validarCampos } from "../middlewares/validar-campos.js";

const router = express.Router();

router.post(
  "/",
  [validarJWT, validarAdmin, validateServiceBody, validarCampos],
  createService
);

router.get("/", getServices);

router.get("/:id", [validarJWT, ServiceExists, validarCampos], getServiceById);

router.put(
  "/:id",
  [validarJWT, validarAdmin, ServiceExists, validateServiceBody, validarCampos],
  updateService
);

router.delete(
  "/:id",
  [validarJWT, validarAdmin, ServiceExists, validarCampos],
  deleteService
);

export default router;
