"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ACCESS_CONTROL_LIST = void 0;
exports.ACCESS_CONTROL_LIST = {
    "GET_/users": { BUYER: true, SELLER: true },
    "GET_/users/:id": { BUYER: true, SELLER: true },
    "POST_/users": { BUYER: true, SELLER: true },
    "POST_/users/deposit": { BUYER: true, SELLER: false },
    "PUT_/users/:id": { BUYER: true, SELLER: true },
    "PUT_/users/reset": { BUYER: true, SELLER: false },
    "DELETE_/users/:id": { BUYER: true, SELLER: true },
};
