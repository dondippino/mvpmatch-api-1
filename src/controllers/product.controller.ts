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

export const create = async (req: Request, res: Response) => {
  try {
    const { body } = req;
    assert(
      body,
      pick(ProductValidator, ["amountAvailable", "cost", "productName"]),
      "Invalid paramaters to create a product"
    );
    const session = res.locals.decoded;

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

export const buy = async (req: Request, res: Response) => {
  try {
    const { body } = req;
    const session = res.locals.decoded;
    assert(
      body,
      object({ productId: number(), amount: number() }),
      "Invalid parameters, kindly check the productId and the amount"
    );

    const { change, coinsSpent, product } = await prisma
      .$transaction(async (tx) => {
        const user = await tx.user.findUnique({
          where: {
            id: session.id,
          },
        });

        if (!user) {
          throw new NotFoundError("User not found");
        }

        if (user.deposit === 0) {
          throw new ServerError("User has no deposit");
        }

        const product = await tx.product.findUnique({
          where: {
            id: body.productId,
          },
        });

        if (!product) {
          throw new NotFoundError(
            `Product with id ${body.productId} does not exist`
          );
        }

        if (product.amountAvailable === 0) {
          throw new NotFoundError("Product is out of stock");
        }

        const costOfProductNeededByBuyer = body.amount * product.cost;
        const costOfProductAvailable = product.amountAvailable * product.cost;

        if (user.deposit < costOfProductNeededByBuyer) {
          throw new ServerError("Insufficient coins to purchase product");
        }

        const balance = costOfProductAvailable - costOfProductNeededByBuyer;
        const productSold = balance < 0 ? product.amountAvailable : body.amount;
        const coinsSpent =
          balance < 0 ? costOfProductAvailable : costOfProductNeededByBuyer;

        await tx.product.update({
          where: {
            id: body.productId,
          },
          data: {
            amountAvailable: { decrement: productSold },
          },
        });

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

export const update = async (req: Request, res: Response) => {
  try {
    const { body, params } = req;

    const coercedId = coerceInteger(params.id);
    assert(
      body,
      partial(
        pick(ProductValidator, ["amountAvailable", "cost", "productName"])
      ),
      "Invalid parameters to update product "
    );

    if (Object.keys(body).length === 0) {
      throw new BadRequestError("Invalid Parameters");
    }

    const session = res.locals.decoded;
    const productView = await prisma.product.findUnique({
      where: { id: coercedId },
    });

    if (!productView || session.id !== productView.sellerId) {
      throw new NoAccessError("You do not have access to this resource");
    }

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

export const remove = async (req: Request, res: Response) => {
  try {
    const { params } = req;
    const coercedId = coerceInteger(params.id);
    const session = res.locals.decoded;
    const productView = await prisma.product.findUnique({
      where: {
        id: coercedId,
      },
    });

    if (!productView || productView.sellerId !== session.id) {
      throw new NoAccessError("You do not have access to this resource");
    }

    const product = await prisma.product.delete({
      where: { id: coercedId },
    });

    res.status(204).send();
  } catch (error) {
    handleError(error, res);
  }
};
