export default {
  testEnvironment: "jsdom",
  transform: {
    "^.+\\.[jt]sx?$": "babel-jest"
  },
  setupFilesAfterEnv: ["<rootDir>/src/test/setup.js"],
  testMatch: [
    "**/src/test/**/*.test.js",
    "**/src/test/**/*.test.jsx"
  ],
  moduleFileExtensions: ["js", "jsx", "json"],
  moduleNameMapper: {
    "\\.(css)$": "identity-obj-proxy"
  }
};
