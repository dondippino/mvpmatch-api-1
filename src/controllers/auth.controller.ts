import { Request, Response } from "express";
import { verify } from "jsonwebtoken";
import { assert, pick } from "superstruct";
import { prisma } from "../../prisma";
import { Cache } from "../cache";
import { NoAccessError, UnauthorizedError } from "../errors";
import { comparePassword, createJwtToken, handleError } from "../utils";
import { UserValidator } from "../validation";

export const signIn = async (req: Request, res: Response) => {
  try {
    const body = req.body;
    assert(
      body,
      pick(UserValidator, ["username", "password"]),
      "Invalid credentials"
    );
    if (Cache.liveSessionCache.has(body.username)) {
      throw new NoAccessError(
        "There is already an active session using your account"
      );
    }

    const user = await prisma.user.findUnique({
      where: {
        username: body.username,
      },
    });

    if (!user) {
      throw new UnauthorizedError("Invalid credentials");
    }

    const { password, ...userObject } = user;
    const isUserAuthenticated = await comparePassword(
      body.password,
      user.password
    );

    if (!isUserAuthenticated) {
      throw new UnauthorizedError("Invalid credentials");
    }

    const token = createJwtToken(userObject);

    // Set Cache
    if (token && process.env.AUTH_PUBLIC_KEY) {
      const t = token && verify(token, process.env.AUTH_PUBLIC_KEY);
      if (typeof t !== "string") {
        t.iat && Cache.liveSessionCache.set(body.username, { iat: t.iat });
      }
    }

    res.send({ access_token: token });
  } catch (error) {
    handleError(error, res);
  }
};

export const logoutAll = async (req: Request, res: Response) => {
  try {
    const body = req.body;
    assert(
      body,
      pick(UserValidator, ["username", "password"]),
      "Invalid credentials"
    );

    const user = await prisma.user.findUnique({
      where: {
        username: body.username,
      },
    });

    if (!user) {
      throw new UnauthorizedError("Not Authorized");
    }

    if (!(await comparePassword(body.password, user.password))) {
      throw new UnauthorizedError("Not Authorized");
    }

    if (Cache.liveSessionCache.has(user.username, { updateAgeOnHas: false })) {
      const u = Cache.liveSessionCache.get(user.username, {
        updateAgeOnGet: false,
      });
      Cache.loggedOutSessionCache.set(`${user.username}_${u?.iat}`, 1);
      Cache.liveSessionCache.delete(user.username);
      return res.send();
    }
    throw new NoAccessError("All sessions have already been logged out");
  } catch (error) {
    handleError(error, res);
  }
};
