import '@testing-library/jest-dom/extend-expect';
import '@testing-library/jest-dom';

if (!process.env.DEBUG) {
  jest.mock('../logger');
}
