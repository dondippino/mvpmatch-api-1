export class BaseError extends Error {
  status: number;

  constructor(message: string) {
    super(message);
    Object.setPrototypeOf(this, BaseError.prototype);
  }
}

export class NotFoundError extends BaseError {
  status = 404;
  constructor(message?: string) {
    super(message ?? "NotFoundError");
  }
}

export class UnauthorizedError extends BaseError {
  status = 401;
  constructor(message?: string) {
    super(message ?? "UnauthorizedError");
  }
}

export class NoAccessError extends BaseError {
  status = 403;
  constructor(message?: string) {
    super(message ?? "NoAccessError");
  }
}

export class BadRequestError extends BaseError {
  status = 400;
  constructor(message?: string) {
    super(message ?? "BadRequestError");
  }
}

export class ServerError extends BaseError {
  status = 500;
  constructor(message?: string) {
    super(message ?? "ServerError");
  }
}
