import { Request, Response } from "express";
import { assert, enums, pick } from "superstruct";
import { prisma } from "../../prisma";
import { NoAccessError, NotFoundError } from "../errors";
import { coerceInteger, handleError, hashPassword } from "../utils";
import { UserValidator } from "../validation";

// Create a new user
export const create = async (req: Request, res: Response) => {
  try {
    const { body } = req;

    // Validate the request body
    assert(
      body,
      pick(UserValidator, ["username", "password", "role"]),
      "Invalid parameters to create a user"
    );

    // Hash the password
    const hashedPassword = await hashPassword(body.password);

    // Create the new user in the database
    const user = await prisma.user.create({
      data: {
        username: body.username,
        password: hashedPassword,
        role: body.role,
      },
      // Select only specific fields to be returned in the response
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

// Add deposit to a user's account
export const deposit = async (req: Request, res: Response) => {
  try {
    const { body } = req;

    // Validate the request body to ensure it contains a 'deposit' field and the value is valid
    assert(
      body,
      pick(UserValidator, ["deposit"]),
      "Deposit is required and must be a number"
    );

    const { deposit } = body;

    // Validate the deposit amount to ensure it's a valid value
    assert(
      deposit,
      enums([5, 10, 20, 50, 100]),
      "Invalid amount, value should be 5, 10, 20, 50 or 100"
    );

    const session = res.locals.decoded;

    // Update the user's deposit amount in the database
    const user = await prisma.user.update({
      where: {
        id: session.id,
      },
      data: {
        deposit: { increment: deposit },
      },
      // Select only specific fields to be returned in the response
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

// Get a list of users
export const getMany = async (req: Request, res: Response) => {
  try {
    const session = res.locals.decoded;

    // Get a list of users from the database
    const users = await prisma.user.findMany({
      where: {
        id: session.id,
      },
      // Select only specific fields to be returned in the response
      select: {
        id: true,
        username: true,
        deposit: true,
        role: true,
      },
      take: 50,
    });
    res.send(users);
  } catch (error) {
    handleError(error, res);
  }
};

// Get single use by ID
export const getSingle = async (req: Request, res: Response) => {
  try {
    const { params } = req;
    const coercedId = coerceInteger(params.id);
    const session = res.locals.decoded;

    // Compare the id in the session to the id in the request
    // and throw an error if they do not match
    if (session.id !== coercedId) {
      throw new NoAccessError("You do not have access to this resource");
    }

    // Fetch user from database
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

    // If user is not found throw an error
    if (!user) {
      throw new NotFoundError("User not found");
    }

    res.send(user);
  } catch (error) {
    handleError(error, res);
  }
};

// Update user
export const update = async (req: Request, res: Response) => {
  try {
    const { params, body } = req;
    const coercedId = coerceInteger(params.id);
    const session = res.locals.decoded;

    // Compare the id in the session to the id in the request
    // and throw an error if they do not match
    if (session.id !== coercedId) {
      throw new NoAccessError("You do not have access to this resource");
    }

    // Validate the body of the request to match the required parameters
    assert(
      body,
      pick(UserValidator, ["role"]),
      "Role is required and must be either 'BUYER' or 'SELLER'"
    );

    // Update user in the database
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

// Delete a user
export const remove = async (req: Request, res: Response) => {
  try {
    const { params } = req;
    const coercedId = coerceInteger(params.id);
    const session = res.locals.decoded;

    // Compare the id in the session to the id in the request
    // and throw an error if they do not match
    if (session.id !== coercedId) {
      throw new NoAccessError("You do not have permission to this resource");
    }

    // Delete user in the dataase
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

// Reset user deposit to zero
export const reset = async (req: Request, res: Response) => {
  try {
    // Fetch session
    const session = res.locals.decoded;

    // Reset the deposit of user to zero in the database
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
