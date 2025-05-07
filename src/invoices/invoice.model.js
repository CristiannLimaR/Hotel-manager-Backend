import { Schema, model } from "mongoose";
import mongooseAutoPopulate from "mongoose-autopopulate";

const InvoiceSchema = Schema ({
    huesped_id:{
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        requerid: true,
        autoPopulate: { select: "nombre email -_id"}
    },
    hotel: {
        type: Schema.Types.ObjectId,
        ref: "Hotel",
        required: [true, "El hotel es obligatorio"],
        autopopulate: { select: "nombre direccion -_id" },
    },
    total_pagar: {
        type: Number,
        required: true
    },
    servicios_adicionales: {
        type: [String],
        ref: "Service",
        default: [],
    },
    date: {
        type: Date,
        default: Date.now
    }
});

InvoiceSchema.plugin(mongooseAutoPopulate);

export default model("Invoice", InvoiceSchema)