module.exports = {
    clearMocks: true,
    preset: 'ts-jest',
    testEnvironment: 'node',
    setupFilesAfterEnv: ['./prisma/index.ts'],
}