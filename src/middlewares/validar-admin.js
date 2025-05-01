import jwt from 'jsonwebtoken';
import User from '../users/user.model.js';

export const validarAdmin = async (req, res, next) => {
  const token = req.header('x-token');

  if (!token) {
    return res.status(401).json({
      msg: 'No hay token en la petición'
    });
  }

  try {
    const { uid } = jwt.verify(token, process.env.SECRETORPRIVATEKEY);

    // Buscar al usuario por el ID del token
    const usuario = await User.findById(uid);

    if (!usuario) {
      return res.status(401).json({
        msg: 'Token no válido - usuario no existe en DB'
      });
    }

    // Verificar si es admin
    if (usuario.role !== 'admin') {
      return res.status(403).json({
        msg: 'No tiene privilegios de administrador'
      });
    }

    // Todo bien, guardar el usuario en la request y continuar
    req.usuario = usuario;
    next();

  } catch (error) {
    console.error(error);
    res.status(401).json({
      msg: 'Token no válido'
    });
  }
};
