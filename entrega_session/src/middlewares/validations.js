export const validateProduct = (req, res, next) => {
  const requiredFields = [
    "productName",
    "description",
    "code",
    "price",
    "stock",
    "category",
  ];
  const missingFields = [];

  for (const field of requiredFields) {
    if (!req.body[field]) {
      missingFields.push(field);
    }
  }

  // si hay algun capmpo faltante, retorno 400 con un mensaje de error
  if (missingFields.length > 0) {
    const errorMessage = `Missing fields: ${missingFields.join(", ")}`;
    return res.status(400).json({ message: errorMessage });
  }

  next();
};
