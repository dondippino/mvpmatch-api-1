import { Request, Response } from "express";
import { assert, enums, pick } from "superstruct";
import { prisma } from "../../prisma";
import { NoAccessError, NotFoundError } from "../errors";
import { coerceInteger, handleError, hashPassword } from "../utils";
import { UserValidator } from "../validation";

export const create = async (req: Request, res: Response) => {
  try {
    const { body } = req;
    assert(
      body,
      pick(UserValidator, ["username", "password", "role"]),
      "Invalid parmaters to create a user"
    );
    const hashedPassword = await hashPassword(body.password);
    const user = await prisma.user.create({
      data: {
        username: body.username,
        password: hashedPassword,
        role: body.role,
      },
      select: {
        id: true,
        username: true,
        deposit: true,
        role: true,
      },
    });
    res.send(user);
  } catch (error) {
    handleError(error, res);
  }
};

export const deposit = async (req: Request, res: Response) => {
  try {
    const { body } = req;
    assert(
      body,
      pick(UserValidator, ["deposit"]),
      "Deposit is required and must be a number"
    );

    const { deposit } = body;
    assert(
      deposit,
      enums([5, 10, 20, 50, 100]),
      "Invalid amount, value should be 5, 10, 20, 50 or 100"
    );

    const session = res.locals.decoded;

    const user = await prisma.user.update({
      where: {
        id: session.id,
      },
      data: {
        deposit: { increment: deposit },
      },
      select: {
        id: true,
        username: true,
        deposit: true,
        role: true,
      },
    });
    res.send(user);
  } catch (error) {
    handleError(error, res);
  }
};

export const getMany = async (req: Request, res: Response) => {
  try {
    const session = res.locals.decoded;
    const users = await prisma.user.findMany({
      where: {
        id: session.id,
      },
      select: {
        id: true,
        username: true,
        deposit: true,
        role: true,
      },
      take: 10,
    });
    res.send(users);
  } catch (error) {
    handleError(error, res);
  }
};

export const getSingle = async (req: Request, res: Response) => {
  try {
    const { params } = req;
    const coercedId = coerceInteger(params.id);
    const session = res.locals.decoded;

    if (session.id !== coercedId) {
      throw new NoAccessError("You do not have access to this resource");
    }

    const user = await prisma.user.findUnique({
      where: {
        id: coercedId,
      },
      select: {
        id: true,
        username: true,
        deposit: true,
        role: true,
      },
    });

    if (!user) {
      throw new NotFoundError("User not found");
    }

    res.send(user);
  } catch (error) {
    handleError(error, res);
  }
};

export const update = async (req: Request, res: Response) => {
  try {
    const { params, body } = req;
    const coercedId = coerceInteger(params.id);
    const session = res.locals.decoded;

    if (session.id !== coercedId) {
      throw new NoAccessError("You do not have access to this resource");
    }

    assert(
      body,
      pick(UserValidator, ["role"]),
      "Role is required and must be either 'BUYER' or 'SELLER'"
    );
    const user = await prisma.user.update({
      where: {
        id: coercedId,
      },
      data: {
        role: body.role,
      },
      select: {
        id: true,
        username: true,
        deposit: true,
        role: true,
      },
    });

    res.send(user);
  } catch (error) {
    handleError(error, res);
  }
};

export const remove = async (req: Request, res: Response) => {
  try {
    const { params } = req;
    const coercedId = coerceInteger(params.id);
    const session = res.locals.decoded;

    if (session.id !== coercedId) {
      throw new NoAccessError("You do not have permission to this resource");
    }

    const user = await prisma.user.delete({
      where: {
        id: coercedId,
      },
      select: {
        id: true,
        username: true,
      },
    });

    res.status(204).send();
  } catch (error) {
    handleError(error, res);
  }
};

export const reset = async (req: Request, res: Response) => {
  try {
    const session = res.locals.decoded;

    const user = await prisma.user.update({
      where: {
        id: session.id,
      },
      data: {
        deposit: 0,
      },
      select: {
        id: true,
        username: true,
        deposit: true,
        role: true,
      },
    });

    res.send(user);
  } catch (error) {
    handleError(error, res);
  }
};
