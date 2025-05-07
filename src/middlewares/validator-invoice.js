import { check, validationResult } from "express-validator";
import Invoice from "../invoices/invoice.model.js";
import Reservation from "../reservations/reservation.model.js";


export const validateInvoiceInput = [
  check("reservationId", "Reservation ID is required").not().isEmpty(),
  check("reservationId")
    .custom(async (reservationId) => {
      const reservation = await Reservation.findById(reservationId);
      if (!reservation) {
        throw new Error("Reservation not found");
      }
      return true;
    })
    .withMessage("Invalid reservation ID")
];


export const validateInvoiceUpdate = [
  check("statusInvoice")
    .optional()
    .isIn(["PAID", "PENDING"])
    .withMessage("Invalid invoice status"),
  check("status").optional().isBoolean().withMessage("Status must be a boolean"),
];


export const validateInvoiceFilters = [
  check("userId").optional().isMongoId().withMessage("Invalid user ID"),
  check("hotelId").optional().isMongoId().withMessage("Invalid hotel ID"),
  check("statusInvoice")
    .optional()
    .isIn(["PAID", "PENDING"])
    .withMessage("Invalid invoice status"),
  check("startDate").optional().isISO8601().withMessage("Invalid start date"),
  check("endDate").optional().isISO8601().withMessage("Invalid end date"),
];


export const invoiceExists = async (req, res, next) => {
    try {
      const invoice = await Invoice.findById(req.params.id);
      if (!invoice || !invoice.state) {
        return res
          .status(404)
          .json({ message: "Factura no encontrada o no disponible" });
      }
      next();
    } catch (error) {
      res.status(500).json({ message: "Error al verificar la factura", error });
    }
  };