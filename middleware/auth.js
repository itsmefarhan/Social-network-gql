const jwt = require("jsonwebtoken");
// const config = require("config");

module.exports = (req, res, next) => {
  // Get token from header
  const token = req.header("x-auth-token");
// console.log('token', token)
  // Check if token exists or not
  if (!token) {
    throw new Error("No token, authorization denied");
  }

  // Verify token
  try {
    const decoded = jwt.verify(token, "mysecret");
    req.user = decoded;

    // console.log('decoded', decoded)
    // console.log('req.user', req.user)
    return req.user
    // next();
  } catch (error) {
    // throw new Error("Invalid token");
    console.log(error)
  }
};
