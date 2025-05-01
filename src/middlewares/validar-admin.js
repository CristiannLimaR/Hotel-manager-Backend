import jwt from 'jsonwebtoken';
import User from '../users/user.model.js';

export const validarAdmin = async (req, res, next) => {
  const token = req.header('x-token');
  console.log("token", token);

  if (!token) {
    return res.status(401).json({
      msg: 'No hay token en la petición'
    });
  }

  try {
    const { uid } = jwt.verify(token, process.env.SECRETORPRIVATEKEY);

    const usuario = await User.findById(uid);

    if (!usuario) {
      return res.status(401).json({
        msg: 'Token no válido - usuario no existe en DB'
      });
    }

    if (usuario.role !== 'ADMIN_ROLE') {
      return res.status(403).json({
        msg: 'No tiene privilegios de administrador'
      });
    }

    req.usuario = usuario;
    next();

  } catch (error) {
    console.error(error);
    res.status(401).json({
      msg: 'Token no válido'
    });
  }
};
