import { Router } from "express";
import { getUsers, getUserById, updateUser, deleteUser, getEmailsAndNames, getManagers } from "./user.controller.js";
import { checkOwnAccount, checkRoleChange } from "../middlewares/validator-user.js";
import { validarAdmin } from "../middlewares/validar-admin.js";

const router = Router();

router.get("/emails-and-names",
    [
        
    ],
    getEmailsAndNames
);

router.get("/", getUsers);
router.get("/managers", getManagers);
router.get("/:userId", getUserById);
router.put(
    "/:id",
    [
        validarAdmin,
        checkOwnAccount,
        checkRoleChange,
        validarAdmin
        
    ],
    updateUser
)

router.delete(
    "/:id",
    [
        validarAdmin,
        checkOwnAccount,
    ],
    deleteUser
)



export default router;
