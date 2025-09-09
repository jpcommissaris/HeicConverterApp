module.exports = {
  testEnvironment: "jsdom",
  setupFilesAfterEnv: ["<rootDir>/jest.setup.js"],
  moduleNameMapper: {
    "^@/(.*)$": "<rootDir>/$1",
    heic2any: "<rootDir>/__mocks__/heic2any.js",
    jszip: "<rootDir>/__mocks__/jszip.js",
    "file-saver": "<rootDir>/__mocks__/file-saver.js",
    sonner: "<rootDir>/__mocks__/sonner.js",
    "next-themes": "<rootDir>/__mocks__/next-themes.js",
    "^@radix-ui/(.*)$": "<rootDir>/__mocks__/radix-ui.js",
    "lucide-react": "<rootDir>/__mocks__/lucide-react.js",
    "react-dropzone": "<rootDir>/__mocks__/react-dropzone.js",
  },
  transform: {
    "^.+\\.(ts|tsx)$": [
      "ts-jest",
      {
        tsconfig: {
          jsx: "react-jsx",
          esModuleInterop: true,
          allowSyntheticDefaultImports: true,
          moduleResolution: "node",
          types: ["jest", "@testing-library/jest-dom"],
        },
      },
    ],
    "^.+\\.(js|jsx)$": "babel-jest",
  },
  transformIgnorePatterns: ["node_modules/(?!(heic2any|jszip|file-saver|sonner)/)"],
  testMatch: ["**/__tests__/**/*.(js|jsx|ts|tsx)", "**/*.(test|spec).(js|jsx|ts|tsx)"],
  moduleFileExtensions: ["ts", "tsx", "js", "jsx", "json"],
  collectCoverageFrom: ["components/**/*.{ts,tsx}", "!components/**/*.d.ts"],
};
