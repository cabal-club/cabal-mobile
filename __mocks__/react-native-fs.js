/* eslint-env jest/globals */
const mockedRNFS = {
  unlink: jest.fn()
};

Object.defineProperty(mockedRNFS, "ExternalDirectoryPath", {
  get: jest.fn(() => "__ExternalDirectoryPath__")
});

Object.defineProperty(mockedRNFS, "DocumentDirectoryPath", {
  get: jest.fn(() => "__DocumentDirectoryPath__")
});

module.exports = mockedRNFS;
