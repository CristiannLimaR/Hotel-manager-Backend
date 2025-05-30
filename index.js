import { config } from "dotenv";
import { initServer } from "./configs/server.js";
import './src/utils/scheduler.js';
config();

initServer();