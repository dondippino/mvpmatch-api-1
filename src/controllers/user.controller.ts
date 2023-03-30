import { Request, Response } from "express";
import { assert, enums, pick } from "superstruct";
import { prisma } from "../../prisma";
import { coerceInteger, handleError, hashPassword } from "../utils";
import { UserValidator } from "../validation";

export const create = async (req: Request, res: Response) => {
  try {
    const { body } = req;
    assert(body, pick(UserValidator, ["username", "password", "role"]));
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
    const { body, params } = req;
    assert(body, pick(UserValidator, ["deposit"]));

    const { deposit } = body;
    assert(deposit, enums([5, 10, 20, 50, 100]));

    const session = res.locals.decoded;
    const coercedId = coerceInteger(params.id);

    if (session.id !== coercedId) {
      return res.status(403).send();
    }

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
      return res.status(403).send();
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
      return res.status(404).send();
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
      return res.status(403).send();
    }

    assert(body, pick(UserValidator, ["role"]));
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
      return res.status(403).send();
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
    const { params } = req;
    const coercedId = coerceInteger(params.id);
    const session = res.locals.decoded;

    if (session.id !== coercedId) {
      return res.status(403).send();
    }

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
