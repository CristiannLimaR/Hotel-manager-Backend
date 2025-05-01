import express from "express";
import cors from "cors";
import morgan from "morgan";
import helmet from "helmet";
import { dbConection } from "./mongo.js";
import { hash, verify } from "argon2";


import authRoutes from "../src/auth/auth.routes.js";
import userRoutes from "../src/users/user.routes.js";

import User from "../src/users/user.model.js";


export const middlewares = (app) => {
  app.use(express.urlencoded({ extended: false }));
  app.use(express.json());
  app.use(cors());
  app.use(morgan("dev"));
  app.use(helmet());
};

const routes = (app) => {
  app.use("/HotelManager/v1/auth", authRoutes);
  app.use("/HotelManager/v1/user", userRoutes);
};

const connectDB = async () => {
  try {
    await dbConection();
    console.log("Successful connection");
  } catch (error) {
    console.log("Error connecting to the database", error);
  }
};

export const initServer = () => {
  const app = express();
  const port = process.env.PORT || 3000;

  try {
    middlewares(app);
    connectDB();
    routes(app);
    app.listen(port);
    crearAdmin();
    console.log(`Server running on port ${port}`);
  } catch (err) {
    console.log(`Server init failed: ${err}`);
  }
};

export const crearAdmin = async () => {
  try {
    const existeAdmin = await User.findOne({ email: 'admin@admin.com' });

    if (!existeAdmin) {
      const hashedPass = await hash('1234567');

      const adminUser = new User({
        nombre: 'Admin',
        email: 'admin@admin.com',
        password: hashedPass,
        role: 'ADMIN_ROLE' 
      });

      await adminUser.save();
      console.log('Admin creado correctamente');
    } else {
      console.log('Admin ya existe');
    }
  } catch (error) {
    console.log(`Error al crear admin: ${error}`);
  }
};

