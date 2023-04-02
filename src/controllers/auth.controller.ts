import { Request, Response } from "express";
import { verify } from "jsonwebtoken";
import { assert, pick } from "superstruct";
import { prisma } from "../../prisma";
import { Cache } from "../cache";
import { NoAccessError, UnauthorizedError } from "../errors";
import { comparePassword, createJwtToken, handleError } from "../utils";
import { UserValidator } from "../validation";

// This function handles user sign-in
export const signIn = async (req: Request, res: Response) => {
  try {
    // Extract the body of the request
    const body = req.body;

    // Validate the body of the request
    // and assert that it contains the required fields
    assert(
      body,
      pick(UserValidator, ["username", "password"]),
      "Invalid credentials"
    );

    // Check if there is already an active session using the user's account
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

    // If the user doesn't exist, throw an error
    if (!user) {
      throw new UnauthorizedError("Invalid credentials");
    }

    const { password, ...userObject } = user;

    // Compare the password provided by the user with the password hash
    // stored in the database to determine if the user is authenticated
    const isUserAuthenticated = await comparePassword(
      body.password,
      user.password
    );

    // If the user is not authenticated, throw an error
    if (!isUserAuthenticated) {
      throw new UnauthorizedError("Invalid credentials");
    }

    // Create a JWT token for the user
    const token = createJwtToken(userObject);

    // Cache the token in the live session cache
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

// This function handles logging out all sessions for a user
export const logoutAll = async (req: Request, res: Response) => {
  try {
    const body = req.body;

    // Validate the body of the request
    // and assert that it contains the required fields
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

    // If the user doesn't exist, throw an error
    if (!user) {
      throw new UnauthorizedError("Not Authorized");
    }

    // Compare the password provided by the user with the password hash
    // stored in the database to determine if the user is authenticated

    if (!(await comparePassword(body.password, user.password))) {
      throw new UnauthorizedError("Not Authorized");
    }

    // if there is a valid live session in the cache, add the session to the
    // logged out session cache and remove it from the live session cache
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
