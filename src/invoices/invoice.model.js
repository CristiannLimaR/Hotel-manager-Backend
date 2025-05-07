import { Schema, model } from "mongoose";
import mongooseAutoPopulate from "mongoose-autopopulate";

const InvoiceSchema = new Schema(
  {
    reservation: {
      type: Schema.Types.ObjectId,
      ref: "Reservation",
      required: true,
      autopopulate: true,
    },
    nights: {
      type: Number,
      required: true,
    },
    roomPricePerNight: {
      type: Schema.Types.Decimal128,
      required: true,
    },
    roomTotal: {
      type: Schema.Types.Decimal128,
      required: true,
    },
    services: [
      {
        name: { type: String, required: true },
        price: { type: Schema.Types.Decimal128, required: true },
        quantity: { type: Number, required: true, min: 1 },
        total: { type: Schema.Types.Decimal128, required: true },
      },
    ],
    total_pagar: {
      type: Schema.Types.Decimal128,
      required: true,
    },
    statusInvoice: {
      type: String,
      enum: ["PAID", "PENDING"],
      default: "PENDING",
    },
    status: {
      type: Boolean,
      default: true,
    },
    Date: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
    versionKey: false,
  }
);

InvoiceSchema.plugin(mongooseAutoPopulate);

export default model("Invoice", InvoiceSchema);
