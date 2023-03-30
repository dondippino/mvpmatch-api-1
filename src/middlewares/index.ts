import { NextFunction, Request, Response } from "express";
import { verify } from "jsonwebtoken";
import { assert, number, object, omit } from "superstruct";
import { UserValidator } from "../validation";
import { ACCESS_CONTROL_LIST } from "./access-control-listl";

export const middlewares = {
  verifyToken: (req: Request, res: Response, next: NextFunction) => {
    try {
      const authHeader = req.headers["authorization"];
      const token = authHeader && authHeader.split(" ")[1];
      if (!token || !process.env.AUTH_PUBLIC_KEY) {
        return res.sendStatus(401);
      }

      const decoded = verify(token, process.env.AUTH_PUBLIC_KEY);

      if (typeof decoded === "string" || !decoded.exp) {
        return res.status(401).send({ message: "Invalid session" });
      }

      const checkExpiry = Math.floor(Date.now() / 1000) - decoded.exp;
      if (checkExpiry >= 0) {
        return res.status(401).send({ message: "Expired token" });
      }

      res.locals.decoded = decoded;
      next();
    } catch (error) {
      return res.status(401).send();
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
      console.log(key, u1, u2);
      const role = res.locals.decoded.role;
      const access = ACCESS_CONTROL_LIST[key][role];

      if (!access) {
        return res.status(403).send({ message: "Forbidden Access" });
      }

      next();
    } catch (error) {
      console.error(error);
      return res.status(403).send({});
    }
  },
};
