import { Schema, model } from "mongoose";
import mongooseAutoPopulate from "mongoose-autopopulate";

const EventSchema = Schema(
  {
    nombre_evento: {
      type: String,
      required: [true, "El nombre del evento es obligatorio"],
    },
    descripcion: {
      type: String,
    },
    fecha: {
      type: Date,
      required: [true, "La fecha del evento es obligatoria"],
      validate: {
        validator: function (value) {
          return value > new Date();
        },
        message: "La fecha debe ser futura",
      },
    },
    hotel_id: {
      type: Schema.Types.ObjectId,
      ref: "Hotel",
      required: [true, "El hotel es obligatorio"],
      autopopulate: { select: "nombre direccion" },
    },
    recursos_asignados: {
      type: [String],
      default: [],
    },
    servicios_adicionales: [
      {
        type: Schema.Types.ObjectId,
        ref: "Service",
        autopopulate: true,
      },
    ],
    tipo_evento: {
      type: String,
    },
    estado: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
    versionKey: false,
  }
);

EventSchema.plugin(mongooseAutoPopulate);

export default model("event", EventSchema);
