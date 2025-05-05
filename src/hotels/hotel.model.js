import { Schema, model } from "mongoose";
import mongooseAutoPopulate from "mongoose-autopopulate";

const HotelSchema = new Schema({
  name: {
    type: String,
    required: true,
    unique: true,
  },
  direction: {
    type: String,
    required: true,
  },
  category: {
    type: String,
    enum: [
      "1 Estrella",
      "2 Estrellas",
      "3 Estrellas",
      "4 Estrellas",
      "5 Estrellas",
    ],
    required: true,
  },
  facilities: {
    type: [String],
    required: true,
  },
  rangeOfPrices: {
    min: Number,
    max: Number,
  },
  rooms: [
    {
      type: Schema.Types.ObjectId,
      ref: "Room",
    },
  ],
  services: [
    {
      type: Schema.Types.ObjectId,
      ref: "Service",
    },
  ],
  state: {
    type: Boolean,
    default: true,
  },
});

HotelSchema.methods.toJSON = function () {
  const { __v, _id, ...hotel } = this.toObject();
  hotel.uid = _id;
  return hotel;
};

HotelSchema.plugin(mongooseAutoPopulate);

export default model("Hotel", HotelSchema);
