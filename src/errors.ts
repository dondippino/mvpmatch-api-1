import { Response } from "express";

export class BaseError implements Error {
  name: string;
  message: string;
  status: number;
}

export const NotFoundError = (message?: string, res?: Response) => {
  const err = new BaseError();
  err.status = 404;
  err.message = message ?? "Not Found";
  if (res) {
    return res.status(err.status).send({ message: err.message });
  }
  throw err;
};

export const UnauthorizedError = (message?: string, res?: Response) => {
  const err = new BaseError();
  err.status = 401;
  err.message = message ?? "Unauthorized";
  if (res) {
    return res.status(err.status).send({ message: err.message });
  }
  throw err;
};

export const NoAceessError = (message?: string, res?: Response) => {
  const err = new BaseError();
  err.status = 403;
  err.message = message ?? "Forbidden";
  if (res) {
    return res.status(err.status).send({ message: err.message });
  }
  throw err;
};

export const BadRequestError = (message?: string, res?: Response) => {
  const err = new BaseError();
  err.status = 400;
  err.message = message ?? "Bad Request";
  if (res) {
    return res.status(err.status).send({ message: err.message });
  }
  throw err;
};

export const ServerError = (message?: string, res?: Response) => {
  const err = new BaseError();
  err.status = 500;
  err.message = message ?? "Server Error";
  if (res) {
    return res.status(err.status).send({ message: err.message });
  }
  throw err;
};
