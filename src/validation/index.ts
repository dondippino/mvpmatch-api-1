import { Product, Role, User } from "@prisma/client";
import { Describe, define, enums, number, object, string } from "superstruct";

export const RoleValidator: Describe<Role> = enums(Object.values(Role));
export const UserValidator: Describe<User> = object({
  id: number(),
  username: string(),
  deposit: number(),
  password: string(),
  role: RoleValidator,
});
export const MultipleOfFive = define<number>(
  "MultipleOfFive",
  (value) => typeof value === "number" && value % 5 === 0
);
export const ProductValidator: Describe<Product> = object({
  id: number(),
  amountAvailable: number(),
  cost: MultipleOfFive,
  productName: string(),
  sellerId: number(),
});
