import jwt from "jsonwebtoken";

export const generateToken = (payload) => {
  return jwt.sign(payload, process.env.PRIVATE_KEY_JWT, { expiresIn: "3h" });
};

export const verifyToken = (token) => {
  return jwt.verify(token, process.env.PRIVATE_KEY_JWT);
};

export const decodeToken = (token) => {
  return jwt.decode(token, { complete: true });
};

export const getToken = (req) => {
  const token = req.headers.authorization;
  return token.replace("Bearer ", ""); // only return the token 
};

export const validateToken = (req, res, next) => {
  const token = getToken(req); // req.headers.authorization
  console.log(token);
  if (!token) {
    res.status(401).send({ status: "error", message: "No token provided" });
    return;
  }

  try {
    const decoded = verifyToken(token);
    req.user = decoded;
    next();
  } catch (e) {
    res.status(401).send({ status: "error", message: "Unauthorized" });
  }
};

export const validateAdmin = (req, res, next) => {
  if (req.user.role !== "admin") {
    res.status(401).send({ status: "error", message: "Unauthorized" });
    return;
  }
  next();
};
