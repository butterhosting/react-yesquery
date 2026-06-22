/** @type {import('jest').Config} **/
module.exports = {
  clearMocks: true,
  testEnvironment: "jsdom",
  transform: {
    "^.+.tsx?$": ["ts-jest"],
  },
};
