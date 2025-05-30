import { Router } from "express";
import { getUsers, getUserById, updateUser, deleteUser, getEmailsAndNames, getManagers, updatePassword } from "./user.controller.js";
import { checkOwnAccount, checkRoleChange, validateCurrentPassword } from "../middlewares/validator-user.js";
import { validarAdmin } from "../middlewares/validar-admin.js";
import { validarJWT } from "../middlewares/validar-JWT.js";

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
        validarJWT,
        checkRoleChange, 
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

router.patch("/password",
    validateCurrentPassword,
    updatePassword
  )



export default router;
