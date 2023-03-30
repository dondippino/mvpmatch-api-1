import { Role } from "@prisma/client";

interface ACLType {
  [key: string]: Record<Role, boolean>;
}
export const ACCESS_CONTROL_LIST: ACLType = {
  "GET_/users": { BUYER: true, SELLER: true },
  "GET_/users/:id": { BUYER: true, SELLER: true },
  "POST_/users": { BUYER: true, SELLER: true },
  "PUT_/users/:id/deposit": { BUYER: true, SELLER: false },
  "PUT_/users/:id": { BUYER: true, SELLER: true },
  "PUT_/users/:id/reset": { BUYER: true, SELLER: false },
  "DELETE_/users/:id": { BUYER: true, SELLER: true },
  "POST_/products": { BUYER: false, SELLER: true },
  "POST_/products/buy": { BUYER: true, SELLER: false },
  "PUT_/products/:id": { BUYER: false, SELLER: true },
  "DELETE_/products/:id": { BUYER: false, SELLER: true },
};
