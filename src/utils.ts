import { compare, hash } from "bcrypt";
import { Response } from "express";
import { sign } from "jsonwebtoken";
import { StructError, coerce, create, number, string } from "superstruct";
import { BaseError } from "./errors";

export const TOKEN_EXPIRY_IN_HOURS = 24;
export const isObject = (obj: unknown): obj is Object =>
  typeof obj === "object" && obj !== null && !Array.isArray(obj);

export const handleError = (error: unknown, res: Response) => {
  if (error instanceof StructError) {
    return res.status(400).send({
      message: error.message ?? "Invalid Parameters",
    });
  }

  if (error instanceof BaseError) {
    return res.status(error.status).send({
      message: error.message,
    });
  }

  return res.status(500).send({
    message: "Server Error",
  });
};

export const hashPassword = async (plain: string) => {
  const hashed = await hash(plain, 10);
  return hashed;
};

export const comparePassword = async (plain: string, hash: string) => {
  const result = await compare(plain, hash);
  return result;
};

export const createJwtToken = (payload: unknown) => {
  if (!isObject(payload)) {
    throw new Error("payload is not a valid object");
  }

  const privateKey = process.env.AUTH_PRIVATE_KEY;
  const expiryInHours = `${TOKEN_EXPIRY_IN_HOURS ?? 24}h`;
  return (
    privateKey &&
    sign(payload, privateKey, {
      algorithm: "RS256",
      expiresIn: expiryInHours,
    })
  );
};

const IdInteger = coerce(number(), string(), (value) => parseInt(value));

export const coerceInteger = (unknownNumber: string) =>
  create(unknownNumber, IdInteger);

export const prepareBalance = (
  balance: number,
  denomination: number[] = [5, 10, 20, 50, 100]
) => {
  const coins = [];
  while (balance > 0) {
    const value = denomination.pop();
    if (!value) {
      break;
    }
    if (value > balance) {
      continue;
    }
    const frequency = Math.floor(balance / value);
    for (let i = 0; i < frequency; i++) {
      coins.push(value);
    }
    balance = balance % value;
  }
  return coins;
};
