import jwt from 'jsonwebtoken'
import config from '../config'
import User from '../models/user'
import Role from '../models/roles'
// permite confirmar si el user envia el token
// este es el primer middleware 
export const verifyToken = async (req, res, next) => {
   //   es un intermediario, si pasa la funcion continua, sino 
   //puede devolver un error etc
   try {
      const token = req.headers['x-access-token']
      if (!token) return res.status(403).json({ message: 'no token provided' })
      const decoded = jwt.verify(token, config.SECRET)
      req.userId = decoded.id
      
      const user = await User.findById(req.userId, { password: 0 })
      
      if (!user) return res.status(404).json({ message: 'no user found ' })
      next()
   } catch (error) {
      console.log(`ERROR ${error}`);
      return res.status(401).json({ message: 'Unauthorized' });
   }
}
export const isModerator = async (req, res, next) => {
   const user = await User.findById(req.userId)
   //comprobar lo roles  
   const roles = await Role.find({ _id: { $in: user.roles } })

   for (let i = 0; i < roles.length; i++) {
      if (roles[i].name === 'moderator') {
         next();
         return;
      }
   }
   return res.status(403).json({ message: 'require moderator role' });
}
export const isAdmin = async (req, res, next) => {
   const user = await User.findById(req.userId)
   //comprobar lo roles  
   const roles = await Role.find({ _id: { $in: user.roles } })

   for (let i = 0; i < roles.length; i++) {
      if (roles[i].name === 'admin') {
         next()
         return
      }
   }
   return res.status(403).json({ message: 'require admin role' })
}