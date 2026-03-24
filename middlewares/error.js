class ErrorHandler extends Error {
  constructor(message, statusCode) {
    super(message);
    this.statusCode = statusCode;
  }
}

export const errorMiddleware = (err, req, res, next) => {
  // FIX 1: Prioritize err.message, default to "Internal Server Error"
  err.message = err.message || "Internal Server Error";

  // FIX 2: Determine Status Code
  // If err.statusCode exists (from ErrorHandler), use it.
  // If not, check if the controller set a status (like 401).
  // If neither, default to 500.
  if (!err.statusCode) {
      if (res.statusCode && res.statusCode !== 200) {
          err.statusCode = res.statusCode;
      } else {
          err.statusCode = 500;
      }
  }

  // --- Specific Database Errors ---
  if (err.code === 11000) {
    err.message = `${Object.keys(err.keyValue)} already exists`;
    err.statusCode = 400;
  }
  if (err.name === "JsonWebTokenError") { // Note: capitalization "Json" often matters
    err.message = "JSON Web Token is invalid, try again";
    err.statusCode = 400;
  }
  if (err.name === "TokenExpiredError") {
    err.message = "JSON Web Token is expired, try again";
    err.statusCode = 400;
  }
  if (err.name === "CastError") {
    err.message = `Resource not found. Invalid: ${err.path}`;
    err.statusCode = 400;
  }

  // FIX 3: Fixed typo 'err.erros' to 'err.errors'
  const errorMessage = err.errors
    ? Object.values(err.errors)
        .map((el) => el.message)
        .join(", ")
    : err.message;

  res.status(err.statusCode).json({
    success: false,
    message: errorMessage,
  });
};

export default ErrorHandler;