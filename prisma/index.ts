// import { PrismaClient } from "@prisma/client";
// import { DeepMockProxy, mockDeep, mockReset } from "jest-mock-extended";

// const isTestEnvironment = process.env.NODE_ENV === "test";

// let prismaInstance: PrismaClient | undefined;
// let prismaMockInstance: DeepMockProxy<PrismaClient>;

// prismaMockInstance =
//   mockDeep<PrismaClient>() as unknown as DeepMockProxy<PrismaClient>;

// export const prisma = (() => {
//   return isTestEnvironment
//     ? prismaMockInstance
//     : prismaInstance || new PrismaClient();
// })();

import { PrismaClient } from "@prisma/client";
import { DeepMockProxy, mockDeep } from "jest-mock-extended";

const isTestEnvironment = process.env.NODE_ENV === "test";

let prismaInstance: PrismaClient | undefined;
let prismaMockInstance: DeepMockProxy<PrismaClient>;

prismaMockInstance =
  mockDeep<PrismaClient>() as unknown as DeepMockProxy<PrismaClient>;

export const prisma = (() => {
  return isTestEnvironment
    ? prismaMockInstance
    : prismaInstance || new PrismaClient();
})();

export { prismaMockInstance };
