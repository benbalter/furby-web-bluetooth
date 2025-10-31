# FurBLE Tests

This directory contains automated tests for the FurBLE Web Bluetooth application.

## Running Tests

### Install Dependencies

```bash
npm install
```

### Run Tests

```bash
# Run all tests
npm test

# Run tests in watch mode
npm run test:watch

# Run tests with coverage
npm run test:coverage
```

## Test Coverage

The test suite covers:

- **Utility Functions**: `flipDict`, `buf2hex`, `adler32`, `makeDLCFilename`
- **State Decoding**: Furby state decoder for antenna, orientation, and sensors
- **UUID Mappings**: Bluetooth service UUIDs and file transfer modes
- **DOM Functions**: Status display, section navigation, button state management
- **Clipboard API**: Modern clipboard functionality with fallback
- **DLC Loading**: DLC index parsing and validation

## Test Files

- `furble.test.js` - Tests for core utility functions and Furby protocol logic
- `dom.test.js` - Tests for DOM manipulation and UI functions

## Notes

- Tests use Jest with jsdom environment to simulate browser APIs
- Web Bluetooth API is not mocked in current tests (requires actual device connection)
- Tests focus on pure functions and DOM manipulation that can be tested without hardware
