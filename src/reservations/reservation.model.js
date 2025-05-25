import { Schema, model } from "mongoose";
import autopopulate from "mongoose-autopopulate";

const reservationSchema = new Schema(
  {
    user: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      autopopulate: true,
    },
    hotel: {
      type: Schema.Types.ObjectId,
      ref: "Hotel",
      required: true,
      autopopulate: true,
    },
    room: {
      type: Schema.Types.ObjectId,
      ref: "Room",
      required: true,
      autopopulate: true,
    },
    checkInDate: {
      type: Date,
      required: true,
    },
    checkOutDate: {
      type: Date,
      required: true,
    },
    status: {
      type: String,
      enum: ["active", "cancelled", "completed"],
      default: "active",
    },
    services: [
      {
        service: {
          type: Schema.Types.ObjectId,
          ref: "Service",
          autopopulate: true,
        }
      }
    ],
    guests: {
      type: Number,
      required: true,
    }
  },
  { timestamps: true }
);

reservationSchema.plugin(autopopulate);

const Reservation = model("Reservation", reservationSchema);

export default Reservation;
