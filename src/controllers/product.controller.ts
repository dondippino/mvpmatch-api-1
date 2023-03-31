import { Request, Response } from "express";
import { assert, number, object, partial, pick } from "superstruct";
import { prisma } from "../../prisma";
import {
  BadRequestError,
  NoAceessError,
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
      pick(ProductValidator, ["amountAvailable", "cost", "productName"])
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
    assert(body, object({ productId: number(), amount: number() }));
    await prisma.$transaction(async (tx) => {
      const user = await tx.user.findUnique({
        where: {
          id: session.id,
        },
      });

      if (!user) {
        NotFoundError("User not found");
        return;
      }

      if (user.deposit === 0) {
        ServerError("User has no deposit");
        return;
      }

      const product = await tx.product.findUnique({
        where: {
          id: body.productId,
        },
      });

      if (!product) {
        ServerError(`Product with id ${body.productId} does not exist`);
        return;
      }

      if (product.amountAvailable === 0) {
        NotFoundError("Product is out of stock");
        return;
      }

      const costOfProductNeededByBuyer = body.amount * product.cost;
      const costOfProductAvailable = product.amountAvailable * product.cost;

      if (user.deposit < costOfProductNeededByBuyer) {
        ServerError("Insufficient coins to purchase product");
        return;
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
      res.send({
        total: coinsSpent,
        product: product.productName,
        productId: product.id,
        change: change,
      });
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
      )
    );

    if (Object.keys(body).length === 0) {
      BadRequestError("Invalid Parameters");
      return;
    }

    const session = res.locals.decoded;
    const productView = await prisma.product.findUnique({
      where: { id: coercedId },
    });

    if (!productView || session.id !== productView.sellerId) {
      NoAceessError("You do not have access to this resource");
      return;
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
      NoAceessError("You do not have access to this resource");
      return;
    }

    const product = await prisma.product.delete({
      where: { id: coercedId },
    });

    res.status(204).send();
  } catch (error) {
    handleError(error, res);
  }
};
