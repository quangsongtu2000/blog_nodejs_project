module.exports = {
    preset: "ts-jest",
    testEnvironment: "node",
    transform: {
        '^.+\\.ts$': 'ts-jest'
    },
    testMatch: ["**/tests/**/*.test.[jt]s", "**/?(*.)+(spec|test).[jt]s"],
    moduleFileExtensions: ["ts", "js"],
    roots: ["<rootDir>/src"],
    setupFilesAfterEnv: ["<rootDir>/jest.setup.ts"]
};