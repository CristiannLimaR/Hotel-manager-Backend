import { Schema, model } from "mongoose";
import autopopulate from "mongoose-autopopulate";

const roomSchema = new Schema(
  {
    type: {
      type: String,
      required: true,
    },
    capacity: {
      type: Number,
      required: true,
    },
    price_per_night: {
      type: Number,
      required: true,
      min: 0,
    },
    availability: [
      {
        start: {
          type: Date,
          required: true,
        },
        end: {
          type: Date,
          required: true,
        },
      },
    ],
    hotel_id: {
      type: Schema.Types.ObjectId,
      ref: "Hotel",
      required: true,
      autopopulate: true,
    },
    available: {
      type: Boolean,
      default: true,
    },
    state: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true }
);

roomSchema.plugin(autopopulate);

const Room = model("Room", roomSchema);

export default Room;
