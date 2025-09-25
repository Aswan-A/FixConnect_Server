import type {
  Request,
  Response,
  NextFunction,
  ErrorRequestHandler,
} from "express";

const errorHandler: ErrorRequestHandler = (err: Error, req, res, next) => {
  console.error(" Error:", err.stack);
  res.status(500).json({ error: "Something went wrong!" });
};

export default errorHandler;
