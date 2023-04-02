import { NextFunction, Request, Response } from "express";
import { verify } from "jsonwebtoken";
import { assert, number, object, omit } from "superstruct";
import { Cache } from "../cache";
import { NoAccessError, UnauthorizedError } from "../errors";
import { handleError } from "../utils";
import { UserValidator } from "../validation";
import { ACCESS_CONTROL_LIST } from "./access-control-listl";

export const middlewares = {
  verifyToken: (req: Request, res: Response, next: NextFunction) => {
    try {
      const authHeader = req.headers["authorization"];
      const token = authHeader && authHeader.split(" ")[1];
      if (!token || !process.env.AUTH_PUBLIC_KEY) {
        throw new UnauthorizedError("You are not authorized");
      }

      const decoded = verify(token, process.env.AUTH_PUBLIC_KEY);

      if (typeof decoded === "string" || !decoded.exp) {
        throw new UnauthorizedError("Invalid session");
      }

      const checkExpiry = Math.floor(Date.now() / 1000) - decoded.exp;
      if (checkExpiry >= 0) {
        throw new UnauthorizedError("Session token is expired");
      }

      if (
        Cache.loggedOutSessionCache.has(`${decoded.username}_${decoded.iat}`)
      ) {
        throw new UnauthorizedError("Session token is expired");
      }
      res.locals.decoded = decoded;
      next();
    } catch (error) {
      handleError(new UnauthorizedError(error.message), res);
    }
  },
  hasAccess: (req: Request, res: Response, next: NextFunction) => {
    try {
      const { method, baseUrl, route } = req;
      const u1 = baseUrl
        .split("/")
        .filter((v) => v.length > 0)
        .join("/");
      const u2 = (route.path as string)
        .split("/")
        .filter((v) => v.length > 0)
        .join("/");

      const u = [];
      if (u1.length > 0) u.push(`/${u1}`);
      if (u2.length > 0) u.push(`/${u2}`);
      const key = `${method}_${u.join("")}`;

      assert(
        res.locals.decoded,
        object({
          ...omit(UserValidator, ["password"]).schema,
          iat: number(),
          exp: number(),
        })
      );

      const role = res.locals.decoded.role;
      const access = ACCESS_CONTROL_LIST[key][role];

      if (!access) {
        throw new NoAccessError("You do not have permission to this resource");
      }

      next();
    } catch (error) {
      handleError(error, res);
    }
  },
};
