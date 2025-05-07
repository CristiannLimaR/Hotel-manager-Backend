import express from "express";
import {
  saveInvoice,
  getInvoices,
  getInvoiceById,
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
import { invoiceExists } from "../middlewares/validator-invoice.js";

const router = express.Router();


router.post(
  "/",
  [validarJWT, validateInvoiceInput],
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


router.get(
  "/:id",
  [validarJWT, validarAdmin],
  validarCampos,
  getInvoiceById
);


router.put(
  "/:id",
  [validarJWT, invoiceExists, validarAdmin,validateInvoiceUpdate],
  validarCampos,
  updateInvoice
);


router.delete(
  "/:id",
  [validarJWT, validarAdmin, invoiceExists],
  validarCampos,
  deleteInvoice
);

export default router;