import User from './user.model.js';
import { hash, verify } from 'argon2';
import { response, request } from 'express';
import Hotel from '../hotels/hotel.schema.js';

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

  export const updateUser = async (req, res) => {
    try {
      const {id} = req.params;
      const {password, ...data} = req.body; 
      const user = await User.findById(id);

      if (!user) {
        return res.status(404).json({
          success: false,
          msg: "User not found",
        });
      }

      if (password) {
        user.password = await hash(password);
      }

      Object.keys(data).forEach(key => {
          user[key] = data[key];
      });

      await user.save();

      const userResponse = user.toObject(); 
      delete userResponse.password; 

      res.status(200).json({
        success: true,
        msg: "User updated successfully",
        user: userResponse,
      });

    } catch (error) {
      console.error("Error updating user:", error);
      res.status(500).json({
        message: "An error occurred while updating the user.", 
        error: error.message 
      });
    }
};
  
  
export const deleteUser = async (req, res) => {
  try {
    const { id } = req.params;
    console.log("Attempting to deactivate user with ID:", id);

    const updatedUser = await User.findByIdAndUpdate(
      id,
      { estado: false },
      { new: true }
    );

    if (!updatedUser) {
      console.log("User not found for ID:", id);
      return res.status(404).json({
        success: false,
        msg: "User not found or already deactivated",
      });
    }

    res.status(200).json({
      success: true,
      msg: "User deactivated successfully",
      user: {
         _id: updatedUser._id,
         estado: updatedUser.estado,
      }
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      msg: "An error occurred while deactivating the user.",
      error: error.message,
    });
  }
};

export const getEmailsAndNames = async (req, res) => {
    try {
        const users = await User.find().select('nombre email');

        res.status(200).json({
            success: true,
            message: "Emails and names fetched successfully",
            data: users,
        });

    } catch (error) {
        console.error("Error fetching emails and names:", error);
        res.status(500).json({
            success: false,
            message: "An error occurred while fetching user emails and names.",
            error: error.message,
        });
    }
};

export const getManagers = async (req, res) => {
  try {
    const managers = await User.find({ role: 'MANAGER_ROLE', estado: true });
    
    const hotels = await Hotel.find({ state: true }).select('admin');
    
   
    const assignedManagerIds = new Set(hotels.map(hotel => hotel.admin.toString()));
    
    const availableManagers = managers.filter(manager => !assignedManagerIds.has(manager._id.toString()));

    res.status(200).json({
      success: true,
      managers: availableManagers,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      msg: "An error occurred while fetching managers.",
      error: error.message,
    });
  }
};
