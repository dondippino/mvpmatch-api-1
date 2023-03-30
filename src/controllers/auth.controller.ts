import { Request, Response } from "express";
import { assert, pick } from "superstruct";
import { prisma } from "../../prisma";
import { comparePassword, createJwtToken, handleError } from "../utils";
import { UserValidator } from "../validation";

export const signIn = async (req: Request, res: Response) => {
  try {
    const body = req.body;
    assert(body, pick(UserValidator, ["username", "password"]));
    const user = await prisma.user.findUnique({
      where: {
        username: body.username,
      },
    });

    if (!user) {
      return res.status(404).send({});
    }

    const { password, ...userObject } = user;
    const isUserAuthenticated = await comparePassword(
      body.password,
      user.password
    );

    if (!isUserAuthenticated) {
      return res.status(401).send();
    }

    const token = createJwtToken(userObject);
    res.send({ access_token: token });
  } catch (error) {
    handleError(error, res);
  }
};
