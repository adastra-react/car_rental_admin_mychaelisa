// jest-dom adds custom jest matchers for asserting on DOM nodes.
// allows you to do things like:
// expect(element).toHaveTextContent(/react/i)
// learn more: https://github.com/testing-library/jest-dom
import '@testing-library/jest-dom';
import { TextDecoder, TextEncoder } from 'node:util';

// jsdom's test environment doesn't expose these Web APIs; react-router
// needs them at import time.
Object.assign(global, { TextEncoder, TextDecoder });
