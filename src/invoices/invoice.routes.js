import express from "express";
import {
  saveInvoice,
  getInvoices,
  getInvoicesForUser,
  updateInvoice,
  deleteInvoice,
} from "./invoice.controller.js";

import { validarJWT } from "../middlewares/validar-JWT.js";
import { validarAdmin } from "../middlewares/validar-admin.js";
import { validarCampos } from "../middlewares/validar-campos.js";
import { 
  validateInvoiceInput, 
  validateInvoiceUpdate, 
  validateInvoiceFilters 
} from "../middlewares/validator-invoice.js";
import { checkInvoiceExists } from "../middlewares/validator-invoice.js";

const router = express.Router();


router.post(
  "/",
  [validarJWT, validateInvoiceInput, checkInvoiceExists],
  validarCampos,
  saveInvoice
);


router.get(
  "/",
  [validarJWT, validarAdmin, validateInvoiceFilters],
  validarCampos,
  getInvoices
);

router.get(
    "/me",
    [validarJWT],
    validarCampos,
    getInvoicesForUser
  );




router.put(
  "/:id",
  [validarJWT, checkInvoiceExists, validarAdmin,validateInvoiceUpdate],
  validarCampos,
  updateInvoice
);


router.delete(
  "/:id",
  [validarJWT, validarAdmin, checkInvoiceExists],
  validarCampos,
  deleteInvoice
);

export default router;