import { Router } from "express";
import { getUsers, getUserById, updateUser, deleteUser } from "./user.controller.js";
import { checkOwnAccount, checkRoleChange, validateCurrentPassword } from "../middlewares/validator-user.js";

const router = Router();

router.get("/", getUsers);
router.get("/:userId", getUserById);
router.put(
    "/:id",
    [
        checkOwnAccount,
        validateCurrentPassword,
        checkRoleChange
    ],
    updateUser
)

router.delete(
    "/:id",
    [
        checkOwnAccount,
    ],
    deleteUser
)

export default router;
