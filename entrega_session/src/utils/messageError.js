import passport from "passport";

//Funcion general para retornar errores en las estrategias de Passport
export const passportError = (strategy) => {
  return async (req, res, next) => {
    passport.authenticate(strategy, (error, user, info) => {
      if (error) {
        return next(error);
      }
      if (!user) {
        //Si no existe mi usuario
        //return done(null, false, { message: "User not found" }); //Retorno el error
        return res
          .status(401)
          .send({ error: info ? info.message : "User not found" }); //Si existe una propiedad message en info, la envio sino envio un mensaje por defecto
          //.send({ error: info.messages ? info.messages : info.toString() }); //Si existe una propiedad messages en info, la envio sino envio pasado a String el objeto info
      }

      req.user = user;
      next();
    })(req, res, next);
  };
};

export const authorization = () => {
  return async (req, res, next) => {
    if (!req.user) {
      //No hay un usuario
      return res.status(401).send({ error: "Unauthorized user" });
    }
    // console.log(req.user.user.isadmin); //Acceso a las propiedades del user en JWT
    if (!req.user.isadmin) {
      return res
        .status(403)
        .send({ error: "You do not have permission to access" });
    }
    next();
  };
};

export const authorizationUser = () => { // Middleware para validar que el usuario este logueado
  return async (req, res, next) => {
    if (!req.user) {
      //No hay un usuario
      return res.status(401).send({ error: "Unauthorized user" });
    }
    next();
  };
}
