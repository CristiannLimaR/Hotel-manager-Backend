import mongoose from "mongoose";

const serviceSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, "Service name is required"],
    trim: true,
  },
  description: {
    type: String,
    default: "",
  },
  price: {
    type: Number,
    required: [true, "Service price is required"],
    min: [0, "Price must be non-negative"],
  },
  category: {
    type: String,
    required: [true, "Service category is required"],
    enum: ["room", "event", "restaurant", "spa", "other"],
  },
  available: {
    type: Boolean,
    default: true,
  },
}, {
  timestamps: true,
});

const Service = mongoose.model("Service", serviceSchema);
export default Service;
