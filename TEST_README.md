# Furby Web Bluetooth - Test Suite

This directory contains comprehensive tests for the Furby Web Bluetooth application.

## Overview

The test suite provides comprehensive coverage of the utility functions, data processing logic, and state management functionality used in the Furby Web Bluetooth application. The tests are written using Jest, a popular JavaScript testing framework.

## Test Coverage

The test suite includes 40 tests covering:

### Utility Functions
- **flipDict**: Dictionary key-value flipping functionality
- **buf2hex**: Binary data to hexadecimal string conversion
- **adler32**: Checksum calculation algorithm
- **makeDLCFilename**: DLC filename formatting and validation
- **prefixMatches**: Binary prefix matching for protocol messages
- **decodeFurbyState**: Sensor state decoding from binary data
- **sleep**: Asynchronous delay utility

### Constants and Data Structures
- File transfer mode mappings
- Slot status constants
- Furby BLE characteristic UUIDs

### DLC Data Validation
- DLC file structure validation
- Action sequence format validation

### Error Handling
- Connection retry configuration

## Running Tests

### Run all tests
```bash
npm test
```

### Run tests in watch mode (for development)
```bash
npm run test:watch
```

### Generate coverage report
```bash
npm run test:coverage
```

## Test Structure

Tests are organized into descriptive test suites using Jest's `describe` blocks:

```javascript
describe('Furby Web Bluetooth - Utility Functions', () => {
    describe('flipDict', () => {
        test('should flip keys and values in a dictionary', () => {
            // Test implementation
        });
    });
});
```

## Key Testing Areas

### Binary Data Handling
Tests verify correct handling of:
- DataView objects for binary data
- Byte arrays
- Hex string conversions
- Checksum calculations

### Sensor State Decoding
Tests verify accurate decoding of:
- Antenna position (left, right, forward, back, down)
- Furby orientation (upright, upside-down, tilted, etc.)
- Sensor states (tickle sensors, tail pull, tongue push)

### DLC File Management
Tests verify:
- Filename formatting (12 character requirement)
- Uppercase conversion
- Padding for short names

### Protocol Message Handling
Tests verify:
- Prefix matching for message identification
- Correct parsing of binary protocol messages

## Adding New Tests

When adding new functionality to the Furby Web Bluetooth application:

1. Add corresponding tests to `furble.test.js`
2. Follow the existing test structure and naming conventions
3. Ensure tests are descriptive and cover edge cases
4. Run `npm test` to verify all tests pass
5. Check coverage with `npm run test:coverage`

## Test Dependencies

- **jest**: Testing framework (^30.2.0)
- **@types/web-bluetooth**: TypeScript definitions for Web Bluetooth API (^0.0.21)

## Notes

- Tests for Web Bluetooth API functionality would require mocking the browser's Bluetooth API, which is beyond the scope of pure utility function testing
- The current test suite focuses on deterministic, pure functions that don't require browser APIs
- Integration tests for Bluetooth connectivity would need to be run in a browser environment with Web Bluetooth support

## Continuous Integration

These tests can be integrated into CI/CD pipelines:

```yaml
# Example GitHub Actions workflow
- name: Install dependencies
  run: npm install
  
- name: Run tests
  run: npm test
```

## Contributing

When contributing to this project:
1. Write tests for new features
2. Ensure all existing tests pass
3. Aim for high test coverage
4. Document complex test scenarios

## License

Tests are part of the Furby Web Bluetooth project and follow the same license.
