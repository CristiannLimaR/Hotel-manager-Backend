import User from './user.model.js';
import { hash, verify } from 'argon2';
import { response, request } from 'express';

export const getUsers = async (req = request, res = response) => {
    try {
      const { limit = 10, offset = 0 } = req.query;
      const query = { estado: true };
  
      const [total, users] = await Promise.all([
        User.countDocuments(query),
        User.find(query).skip(Number(offset)).limit(Number(limit)),
      ]);
  
      res.status(200).json({
        success: true,
        total,
        users,
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        msg: "error when searching for users",
        error: error.message,
      });
    }
  };
  
  
  export const getUserById = async (req = request, res) => {
    try {
      const { userId } = req.params;
      const user = await User.findById(userId);
  
      if (!user) {
        return res.status(400).json({
          success: false,
          msg: "User not found",
        });
      }
  
      res.status(200).json({
        success: true,
        user,
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        msg: "error when searching for user",
        error: error.message,
      });
    }
  };
  
  export const updateUser = async (req, res = response) => {
    try {
      const { userId } = req.params;
      const { currentPassword, password, role, ...data } = req.body;
  
      if (password) {
        data.password = await hash(password);
      }
  
      if (role) {
        data.role = role;
      }
  
      const updatedUser = await User.findByIdAndUpdate(userId, data, { new: true });
  
      res.status(200).json({
        success: true,
        msg: "User successfully updated",
        user: updatedUser,
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        msg: "Error updating user",
        error: error.message,
      });
    }
  };
  
  
  export const deleteUser = async (req, res) => {
    try {
      const { userId } = req.params;
      await User.findByIdAndUpdate(userId, { state: false }, { new: true });
  
      res.status(200).json({
        success: true,
        msg: "User deactivated successfully",
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        msg: "Error deactivating user",
        error: error.message,
      });
    }
  };