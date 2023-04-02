// Import required modules and dependencies
import { Request, Response } from "express";
import { assert, number, object, partial, pick } from "superstruct";
import { prisma } from "../../prisma";
import {
  BadRequestError,
  NoAccessError,
  NotFoundError,
  ServerError,
} from "../errors";
import { coerceInteger, handleError, prepareBalance } from "../utils";
import { ProductValidator } from "../validation";

// Create a new product
export const create = async (req: Request, res: Response) => {
  try {
    const { body } = req;

    // Validate that the request body contains required properties
    assert(
      body,
      pick(ProductValidator, ["amountAvailable", "cost", "productName"]),
      "Invalid paramaters to create a product"
    );

    // Retrieve user session
    const session = res.locals.decoded;

    // Create a new product in the database
    const product = await prisma.product.create({
      data: {
        amountAvailable: body.amountAvailable,
        cost: body.cost,
        productName: body.productName,
        sellerId: session.id,
      },
    });

    res.send(product);
  } catch (error) {
    handleError(error, res);
  }
};

// Buy  product
export const buy = async (req: Request, res: Response) => {
  try {
    const { body } = req;

    // Retrieve user session
    const session = res.locals.decoded;

    // Validate that the request body contains the required properties
    assert(
      body,
      object({ productId: number(), amount: number() }),
      "Invalid parameters, kindly check the productId and the amount"
    );

    // Implement a transaction to ensure atomicity and data consistency
    const { change, coinsSpent, product } = await prisma
      .$transaction(async (tx) => {
        // Fetch the buyer's account
        const user = await tx.user.findUnique({
          where: {
            id: session.id,
          },
        });

        // If the user is not found, throw an error
        if (!user) {
          throw new NotFoundError("User not found");
        }

        // If the user has no deposit, throw an error
        if (user.deposit === 0) {
          throw new ServerError("User has no deposit");
        }

        // Find the product to buy
        const product = await tx.product.findUnique({
          where: {
            id: body.productId,
          },
        });

        // If the product is not found, throw an error
        if (!product) {
          throw new NotFoundError(
            `Product with id ${body.productId} does not exist`
          );
        }

        // If the product is out of stock, throw an error
        if (product.amountAvailable === 0) {
          throw new NotFoundError("Product is out of stock");
        }

        // Calculate the cost of the product the buyer wants to purchase
        const costOfProductNeededByBuyer = body.amount * product.cost;

        // Calculate the total cost of the product available
        const costOfProductAvailable = product.amountAvailable * product.cost;

        // If the buyer's deposit is insufficient, throw an error
        if (user.deposit < costOfProductNeededByBuyer) {
          throw new ServerError("Insufficient coins to purchase product");
        }

        // Calculate the remaining balance after purchase
        const balance = costOfProductAvailable - costOfProductNeededByBuyer;
        const productSold = balance < 0 ? product.amountAvailable : body.amount;
        const coinsSpent =
          balance < 0 ? costOfProductAvailable : costOfProductNeededByBuyer;

        // Update the product with the amount left
        await tx.product.update({
          where: {
            id: body.productId,
          },
          data: {
            amountAvailable: { decrement: productSold },
          },
        });

        // Update the user deposit
        await tx.user.update({
          where: {
            id: session.id,
          },
          data: {
            deposit: {
              decrement: coinsSpent,
            },
          },
        });

        // Format the balance, if any, into an array of 5, 10, 20, 50 and 100
        const change = balance < 0 ? prepareBalance(Math.abs(balance)) : 0;

        return {
          coinsSpent,
          product,
          change,
        };
      })
      .catch((err) => {
        throw err;
      });

    res.send({
      total: coinsSpent,
      product: product.productName,
      productId: product.id,
      change: change,
    });
  } catch (error) {
    handleError(error, res);
  }
};

// Retrieves multiple products from the database.
export const getMany = async (req: Request, res: Response) => {
  try {
    const products = await prisma.product.findMany({
      take: 50,
    });

    res.send(products);
  } catch (error) {
    handleError(error, res);
  }
};

// Retrieves a single product from the database with the given ID.
export const getSingle = async (req: Request, res: Response) => {
  try {
    const { params } = req;
    const coercedId = coerceInteger(params.id);

    const product = await prisma.product.findUnique({
      where: {
        id: coercedId,
      },
    });

    res.send(product);
  } catch (error) {
    handleError(error, res);
  }
};

// Updates a product in the database with the given ID.
export const update = async (req: Request, res: Response) => {
  try {
    const { body, params } = req;

    const coercedId = coerceInteger(params.id);

    // Ensures that only valid properties are updated.
    assert(
      body,
      partial(
        pick(ProductValidator, ["amountAvailable", "cost", "productName"])
      ),
      "Invalid parameters to update product"
    );

    // Throws an error if the request body is empty.
    if (Object.keys(body).length === 0) {
      throw new BadRequestError("Invalid Parameters");
    }

    // Retrieves the product from the database and checks if the user has access to update it.
    const session = res.locals.decoded;
    const productView = await prisma.product.findUnique({
      where: { id: coercedId },
    });

    if (!productView || session.id !== productView.sellerId) {
      throw new NoAccessError("You do not have access to this resource");
    }

    // Updates the product in the database.
    const product = await prisma.product.update({
      where: { id: coercedId },
      data: {
        ...body,
      },
    });

    res.send(product);
  } catch (error) {
    handleError(error, res);
  }
};

// Deletes a product from the database with the given ID.
export const remove = async (req: Request, res: Response) => {
  try {
    const { params } = req;
    const coercedId = coerceInteger(params.id);

    // Retrieves the product from the database and checks if the user has access to delete it.
    const session = res.locals.decoded;
    const productView = await prisma.product.findUnique({
      where: {
        id: coercedId,
      },
    });

    if (!productView || productView.sellerId !== session.id) {
      throw new NoAccessError("You do not have access to this resource");
    }

    // Deletes the product from the database.
    const product = await prisma.product.delete({
      where: { id: coercedId },
    });

    res.status(204).send();
  } catch (error) {
    handleError(error, res);
  }
};
