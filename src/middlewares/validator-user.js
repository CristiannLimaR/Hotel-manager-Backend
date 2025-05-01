import { verify } from "argon2";
import User from "../users/user.model.js";


export const checkOwnAccount = async (req, res, next) => {
  const { userId } = req.params;
  const authenticatedUser = req.user;

  if (authenticatedUser.role !== "ADMIN_ROLE" && authenticatedUser.id !== userId) {
    return res.status(403).json({
      success: false,
      msg: "You can only update or delete your own account",
    });
  }

  next();
};


export const checkRoleChange = (req, res, next) => {
  const { role } = req.body;
  const authenticatedUser = req.user;

  if (authenticatedUser.role !== "ADMIN_ROLE" && role) {
    return res.status(403).json({
      success: false,
      msg: "You are not allowed to change your role",
    });
  }

  next();
};


export const validateCurrentPassword = async (req, res, next) => {
  const { userId } = req.params;
  const { currentPassword, password } = req.body;

  if (password && !currentPassword) {
    return res.status(400).json({
      success: false,
      msg: "Current password is required to update the password",
    });
  }

  if (password) {
    const user = await User.findById(userId);
    const validPassword = await verify(user.password, currentPassword);

    if (!validPassword) {
      return res.status(400).json({
        success: false,
        msg: "Current password is incorrect",
      });
    }
  }

  next();
};


export const validatePasswordOnDelete = async (req, res, next) => {
  const { userId } = req.params;
  const { password } = req.body;

  const user = await User.findById(userId);

  if (!user) {
    return res.status(404).json({
      success: false,
      msg: "User not found",
    });
  }

  const validPassword = await verify(user.password, password);

  if (!validPassword) {
    return res.status(400).json({
      success: false,
      msg: "Password is incorrect",
    });
  }

  next();
};
