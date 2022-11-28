/* eslint-disable unicorn/prefer-module */
module.exports = {
  transform: {
    '^.+\\.(tsx|jsx|ts|js|mjs)?$': [
      '@swc-node/jest',
      {
        dynamicImport: true,
        experimentalDecorators: true,
        emitDecoratorMetadata: true,
      },
    ],
  },
  testEnvironment: 'jsdom',
  setupFilesAfterEnv: ['<rootDir>/test/setupReactTests.ts'],
  moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx', 'json', 'node'],
  moduleNameMapper: {
    '^@tldr/(.*)$': '<rootDir>/src/components/Tldraw/$1',
  },
};
