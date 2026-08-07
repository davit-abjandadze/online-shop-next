const nextJest = require("next/jest");

const createJestConfig = nextJest({
  // Next.js აპის root, საიდანაც next.config.js და .env ფაილები ჩაიტვირთება
  dir: "./",
});

/** @type {import('jest').Config} */
const customJestConfig = {
  setupFilesAfterEnv: ["<rootDir>/jest.setup.js"],
  testEnvironment: "jest-environment-jsdom",
  moduleNameMapper: {
    "^@/(.*)$": "<rootDir>/$1",
  },
  testPathIgnorePatterns: ["<rootDir>/node_modules/", "<rootDir>/.next/"],
};

// next/jest ასინქრონულად აბრუნებს კონფიგურაციას, რომელიც Next.js-ის
// babel/swc პარამეტრებს ავტომატურად ტვირთავს
module.exports = createJestConfig(customJestConfig);
