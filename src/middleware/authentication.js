// require("dotenv").config();
// const jwt = require("jsonwebtoken");
// const UnauthenticatedError = require("../errors/unauthenticated");

// const auth = async (req, res, next) => {
//   const authHeader = req.cookies.token;
//   console.log("authHeader", authHeader);

//   if (!authHeader) {
//     throw new UnauthenticatedError("Authentication invalid");
//   }

//   try {
//     const payload = jwt.verify(authHeader, process.env.JWT_SECRET);
//     console.log("JWT Payload:", payload);
//     req.user = {
//       userId: payload.userId,
//       name: `${payload.firstName} ${payload.lastName}`,
//     };
//     console.log(`middleware check user`, req.user);
//     next();
//   } catch (error) {
//     throw new UnauthenticatedError("Authentication invalid");
//   }
// };


// module.exports = auth;

require("dotenv").config();
const jwt = require("jsonwebtoken");
const UnauthenticatedError = require("../errors/unauthenticated");

const auth = async (req, res, next) => {
  const authHeader = req.headers.authorization;
  console.log(authHeader);

  if (!authHeader || !authHeader.startsWith("Bearer")) {
    throw new UnauthenticatedError("Authentication invalid");
  }
  const token = authHeader.split(" ")[1];

  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET);
    console.log("JWT Payload:", payload);
    req.user = {
      userId: payload.userId,
      name: `${payload.firstName} ${payload.lastName}`,
    };
    console.log(`middleware check user`, req.user);
    next();
  } catch (error) {
    throw new UnauthenticatedError("Authentication invalid");
  }
};
module.exports = auth