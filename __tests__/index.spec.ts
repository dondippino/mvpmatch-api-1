import { mockReset } from "jest-mock-extended";

import request from "supertest";
import { prismaMockInstance } from "../prisma";
import { App } from "../src/app";
import { NotFoundError, ServerError } from "../src/errors";

describe("MVPMatch Test API V1", () => {
  let sellerToken: Promise<string>;
  let buyerToken: Promise<string>;
  beforeAll(async () => {
    prismaMockInstance.user.findUnique
      .mockResolvedValueOnce({
        id: 1,
        username: "franz",
        password:
          "$2b$10$zJHqNJdjAoeKNcXtpOyE/uLodaIVhUfL6skp6Tw//8mq1Kp7hfaNG",
        deposit: 100,
        role: "BUYER",
      })
      .mockResolvedValueOnce({
        id: 2,
        username: "mary",
        password:
          "$2b$10$NRLj3g0Hu4VA/FFFfEbb3.KgxYSyCA8cuQCQ382ttMC1yFWCSKSHm",
        deposit: 0,
        role: "SELLER",
      });

    const r1 = await request(App).post("/auth/sign-in").send({
      username: "franz",
      password: "password",
    });
    const { access_token: b } = r1.body;
    buyerToken = Promise.resolve(b);

    const r2 = await request(App).post("/auth/sign-in").send({
      username: "mary",
      password: "password",
    });
    const { access_token: s } = r2.body;
    sellerToken = Promise.resolve(s);
  });
  describe("POST /deposit", () => {
    describe("", () => {
      test("it should throw an error 401, when user is not logged in", async () => {
        const response = await request(App).put("/users/deposit").send({
          deposit: 100,
        });
        expect(response.statusCode).toBe(401);
      });
    });

    describe("", () => {
      test("it should throw an error 403, when user attempts to make a deposit and does not have 'BUYER' role", async () => {
        const response = await request(App)
          .put("/users/deposit")
          .auth(await sellerToken, { type: "bearer" })
          .send({
            deposit: 100,
          });
        expect(response.statusCode).toBe(403);
      });
    });

    describe("", () => {
      beforeEach(() => {
        mockReset(prismaMockInstance);
        prismaMockInstance.user.findUnique.mockResolvedValue({
          id: 1,
          username: "franz",
          password:
            "$2b$10$zJHqNJdjAoeKNcXtpOyE/uLodaIVhUfL6skp6Tw//8mq1Kp7hfaNG",
          deposit: 100,
          role: "BUYER",
        });
      });
      test("it should return 200 OK, when a 'BUYER' deposits successfully", async () => {
        const response = await request(App)
          .put("/users/deposit")
          .auth(await buyerToken, { type: "bearer" })
          .send({
            deposit: 100,
          });
        expect(response.statusCode).toBe(200);
      });
    });

    describe("", () => {
      test("it should throw an error 400, when a buyer wants to buy in amounts other than 5, 10, 20, 50 and 100 ", async () => {
        const response = await request(App)
          .put("/users/deposit")
          .auth(await buyerToken, { type: "bearer" })
          .send({
            deposit: 200,
          });
        expect(response.statusCode).toBe(400);
        expect(response.body).toMatchObject({
          message: "Invalid amount, value should be 5, 10, 20, 50 or 100",
        });
      });
    });
  });

  describe("POST /buy", () => {
    describe("", () => {
      test("it should throw an error 401, when user is not logged in", async () => {
        const response = await request(App).post("/products/buy").send({
          productId: 1,
          amount: 1,
        });
        expect(response.statusCode).toBe(401);
      });
    });
    describe("", () => {
      test("it should throw an error 403, when user does not have 'BUYER' role", async () => {
        const response = await request(App)
          .post("/products/buy")
          .auth(await sellerToken, { type: "bearer" })
          .send({
            productId: 1,
            amount: 1,
          });
        expect(response.statusCode).toBe(403);
      });
    });

    describe("", () => {
      beforeEach(async () => {
        prismaMockInstance.$transaction.mockReturnValue(
          Promise.resolve({
            total: 50,
            product: "Book",
            productId: 1,
            change: 0,
          })
        );
      });
      test("it should return 200 OK, when a user buys a product successfully", async () => {
        const response = await request(App)
          .post("/products/buy")
          .auth(await buyerToken, { type: "bearer" })
          .send({
            productId: 1,
            amount: 1,
          });
        expect(response.statusCode).toBe(200);
      });
    });

    describe("", () => {
      beforeEach(async () => {
        prismaMockInstance.$transaction.mockRejectedValue(
          new ServerError("Insufficient coins to purchase product")
        );
      });
      test("it should return 500 error, when a user attempts to maka a purchase with insufficient deposit", async () => {
        const response = await request(App)
          .post("/products/buy")
          .auth(await buyerToken, { type: "bearer" })
          .send({
            productId: 1,
            amount: 10000,
          });
        expect(response.statusCode).toBe(500);
        expect(response.body).toMatchObject({
          message: "Insufficient coins to purchase product",
        });
      });
    });

    describe("", () => {
      beforeEach(async () => {
        prismaMockInstance.$transaction.mockRejectedValue(
          new NotFoundError("Product is out of stock")
        );
      });
      test("it should return 404 error, when a user attempts to purchase a product which is out of stock", async () => {
        const response = await request(App)
          .post("/products/buy")
          .auth(await buyerToken, { type: "bearer" })
          .send({
            productId: 1,
            amount: 1,
          });
        expect(response.statusCode).toBe(404);
        expect(response.body).toMatchObject({
          message: "Product is out of stock",
        });
      });
    });
  });

  describe("GET /users/:id", () => {
    describe("", () => {
      beforeEach(() => {});
      test("it should throw a 403 error, if a user attempts to get user by id, different from the logged in user", async () => {
        const response = await request(App)
          .get("/users/2")
          .auth(await buyerToken, { type: "bearer" });

        expect(response.statusCode).toBe(403);
        expect(response.body).toMatchObject({
          message: "You do not have access to this resource",
        });
      });
    });

    describe("", () => {
      beforeEach(() => {
        mockReset(prismaMockInstance);
        prismaMockInstance.user.findUnique.mockResolvedValue({
          id: 1,
          username: "franz",
          password:
            "$2b$10$zJHqNJdjAoeKNcXtpOyE/uLodaIVhUfL6skp6Tw//8mq1Kp7hfaNG",
          deposit: 100,
          role: "BUYER",
        });
      });
      test("it should return 200 OK with the user object, if the id of the request matches the id of user in session", async () => {
        const response = await request(App)
          .get("/users/1")
          .auth(await buyerToken, { type: "bearer" });
        expect(response.statusCode).toBe(200);
        expect(response.body).toMatchObject({
          id: 1,
          username: "franz",
          password:
            "$2b$10$zJHqNJdjAoeKNcXtpOyE/uLodaIVhUfL6skp6Tw//8mq1Kp7hfaNG",
          deposit: 100,
          role: "BUYER",
        });
      });
    });
  });
});
