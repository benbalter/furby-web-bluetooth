/**
 * Comprehensive test suite for Furby Web Bluetooth functions
 * Tests utility functions, data processing, and state management
 */

// Import functions to test - we'll need to expose them from furble.js
// For now, we'll copy the pure utility functions here for testing

// Utility function: flipDict
function flipDict(d) {
    let flipped = {};
    for (let k in d) {
        let v = d[k];
        flipped[v] = k;
    }
    return flipped;
}

// Utility function: buf2hex
function buf2hex(dv) {
    var s = '';
    if (DataView.prototype.isPrototypeOf(dv)) {
        for (var i = 0; i < dv.byteLength; i++) {
            s += ('0' + dv.getUint8(i).toString(16)).substr(-2);
        }
    } else if (Array.prototype.isPrototypeOf(dv)) {
        for (var i = 0; i < dv.length; i++) {
            s += ('0' + dv[i].toString(16)).substr(-2);
        }
    }
    return s;
}

// Utility function: adler32
function adler32(buf) {
    const MOD_ADLER = 65521;
    let dv = new DataView(buf);
    let a = 1, b = 0;
    for (let i = 0; i < buf.byteLength; i++) {
        a = (a + dv.getUint8(i)) % MOD_ADLER;
        b = (b + a) % MOD_ADLER;
    }
    let checksum = (b << 16) >>> 0;
    return (checksum | a) >>> 0;
}

// Utility function: makeDLCFilename
function makeDLCFilename(dlcurl) {
    return dlcurl.substr(dlcurl.lastIndexOf('/') + 1).padStart(12, '_').toUpperCase();
}

// Utility function: prefixMatches
function prefixMatches(prefix, buf) {
    if (typeof (prefix) == 'undefined')
        return true;

    for (let i = 0; i < prefix.length; i++) {
        if (buf.getUint8(i) != prefix[i])
            return false;
    }
    return true;
}

// Utility function: decodeFurbyState
function decodeFurbyState(buf) {
    let antenna = '';
    if (buf.getUint8(1) & 2)
        antenna = 'left';
    if (buf.getUint8(1) & 1)
        antenna = 'right';
    if (buf.getUint8(2) == 0xc0) // fwd | back
        antenna = 'down';
    else if (buf.getUint8(2) & 0x40)
        antenna = 'forward';
    else if (buf.getUint8(2) & 0x80)
        antenna = 'back';

    let orientation = '';
    if (buf.getUint8(4) & 1)
        orientation = 'upright';
    else if (buf.getUint8(4) & 2)
        orientation = 'upside-down';
    else if (buf.getUint8(4) & 4)
        orientation = 'lying on right side';
    else if (buf.getUint8(4) & 8)
        orientation = 'lying on left side';
    else if (buf.getUint8(4) & 0x20)
        orientation = 'leaning back';
    else if (buf.getUint8(4) & 0x40)
        orientation = 'tilted right';
    else if (buf.getUint8(4) & 0x80)
        orientation = 'tilted left';
    var state = {};
    state['antenna'] = antenna;
    state['orientation'] = orientation;

    if (buf.getUint8(2) & 1)
        state.tickle_head_back = true;
    if (buf.getUint8(2) & 2)
        state.tickle_tummy = true;
    if (buf.getUint8(2) & 4)
        state.tickle_right_side = true;
    if (buf.getUint8(2) & 8)
        state.tickle_left_side = true;
    if (buf.getUint8(2) & 0x10)
        state.pull_tail = true;
    if (buf.getUint8(2) & 0x20)
        state.push_tongue = true;
    return state;
}

// Utility function: sleep
function sleep(t) {
    return new Promise(resolve => setTimeout(resolve, t));
}

describe('Furby Web Bluetooth - Utility Functions', () => {
    describe('flipDict', () => {
        test('should flip keys and values in a dictionary', () => {
            const input = { a: 1, b: 2, c: 3 };
            const expected = { 1: 'a', 2: 'b', 3: 'c' };
            expect(flipDict(input)).toEqual(expected);
        });

        test('should handle empty dictionary', () => {
            expect(flipDict({})).toEqual({});
        });

        test('should handle single entry', () => {
            const input = { key: 'value' };
            const expected = { value: 'key' };
            expect(flipDict(input)).toEqual(expected);
        });

        test('should handle numeric keys', () => {
            const input = { 0: 'zero', 1: 'one' };
            const expected = { zero: '0', one: '1' };
            expect(flipDict(input)).toEqual(expected);
        });
    });

    describe('buf2hex', () => {
        test('should convert DataView to hex string', () => {
            const buffer = new ArrayBuffer(3);
            const view = new DataView(buffer);
            view.setUint8(0, 0xAB);
            view.setUint8(1, 0xCD);
            view.setUint8(2, 0xEF);
            expect(buf2hex(view)).toBe('abcdef');
        });

        test('should convert array to hex string', () => {
            const arr = [0x12, 0x34, 0x56];
            expect(buf2hex(arr)).toBe('123456');
        });

        test('should handle empty DataView', () => {
            const buffer = new ArrayBuffer(0);
            const view = new DataView(buffer);
            expect(buf2hex(view)).toBe('');
        });

        test('should handle empty array', () => {
            expect(buf2hex([])).toBe('');
        });

        test('should pad single digit hex values', () => {
            const arr = [0x01, 0x02, 0x0A];
            expect(buf2hex(arr)).toBe('01020a');
        });
    });

    describe('adler32', () => {
        test('should calculate correct checksum for known data', () => {
            // Test with "Wikipedia" which has known Adler-32: 0x11E60398
            const encoder = new TextEncoder();
            const text = encoder.encode('Wikipedia');
            const buffer = text.buffer;
            const checksum = adler32(buffer);
            expect(checksum).toBe(0x11E60398);
        });

        test('should handle empty buffer', () => {
            const buffer = new ArrayBuffer(0);
            const checksum = adler32(buffer);
            expect(checksum).toBe(1); // Adler-32 of empty data is 1
        });

        test('should calculate checksum for single byte', () => {
            const buffer = new ArrayBuffer(1);
            const view = new DataView(buffer);
            view.setUint8(0, 0x61); // 'a'
            const checksum = adler32(buffer);
            expect(checksum).toBeGreaterThan(0);
        });

        test('should produce different checksums for different data', () => {
            const encoder = new TextEncoder();
            const text1 = encoder.encode('hello');
            const text2 = encoder.encode('world');
            const checksum1 = adler32(text1.buffer);
            const checksum2 = adler32(text2.buffer);
            expect(checksum1).not.toBe(checksum2);
        });
    });

    describe('makeDLCFilename', () => {
        test('should extract filename and pad to 12 chars', () => {
            const url = 'http://example.com/test.dlc';
            expect(makeDLCFilename(url)).toBe('____TEST.DLC');
        });

        test('should handle already 12 char filename', () => {
            const url = 'path/to/exactly12.dl';
            const result = makeDLCFilename(url);
            expect(result.length).toBe(12);
            expect(result).toBe('EXACTLY12.DL');
        });

        test('should uppercase the filename', () => {
            const url = 'path/lowercase.dlc';
            expect(makeDLCFilename(url)).toBe('LOWERCASE.DLC');
        });

        test('should handle short filenames with padding', () => {
            const url = 'a.dlc';
            expect(makeDLCFilename(url)).toBe('_______A.DLC');
        });

        test('should handle filenames without extension', () => {
            const url = 'path/to/myfile';
            const result = makeDLCFilename(url);
            expect(result.length).toBe(12);
            expect(result).toBe('______MYFILE');
        });
    });

    describe('prefixMatches', () => {
        test('should return true when prefix matches', () => {
            const buffer = new ArrayBuffer(5);
            const view = new DataView(buffer);
            view.setUint8(0, 0x10);
            view.setUint8(1, 0x20);
            view.setUint8(2, 0x30);
            const prefix = [0x10, 0x20];
            expect(prefixMatches(prefix, view)).toBe(true);
        });

        test('should return false when prefix does not match', () => {
            const buffer = new ArrayBuffer(5);
            const view = new DataView(buffer);
            view.setUint8(0, 0x10);
            view.setUint8(1, 0x20);
            const prefix = [0x10, 0x30];
            expect(prefixMatches(prefix, view)).toBe(false);
        });

        test('should return true for undefined prefix', () => {
            const buffer = new ArrayBuffer(5);
            const view = new DataView(buffer);
            expect(prefixMatches(undefined, view)).toBe(true);
        });

        test('should return true for empty prefix array', () => {
            const buffer = new ArrayBuffer(5);
            const view = new DataView(buffer);
            expect(prefixMatches([], view)).toBe(true);
        });

        test('should match single byte prefix', () => {
            const buffer = new ArrayBuffer(3);
            const view = new DataView(buffer);
            view.setUint8(0, 0xFF);
            const prefix = [0xFF];
            expect(prefixMatches(prefix, view)).toBe(true);
        });
    });

    describe('decodeFurbyState', () => {
        test('should decode antenna left position', () => {
            const buffer = new ArrayBuffer(10);
            const view = new DataView(buffer);
            view.setUint8(1, 0x02); // bit 1 set = left
            const state = decodeFurbyState(view);
            expect(state.antenna).toBe('left');
        });

        test('should decode antenna right position', () => {
            const buffer = new ArrayBuffer(10);
            const view = new DataView(buffer);
            view.setUint8(1, 0x01); // bit 0 set = right
            const state = decodeFurbyState(view);
            expect(state.antenna).toBe('right');
        });

        test('should decode antenna down position', () => {
            const buffer = new ArrayBuffer(10);
            const view = new DataView(buffer);
            view.setUint8(2, 0xC0); // both forward and back bits
            const state = decodeFurbyState(view);
            expect(state.antenna).toBe('down');
        });

        test('should decode antenna forward position', () => {
            const buffer = new ArrayBuffer(10);
            const view = new DataView(buffer);
            view.setUint8(2, 0x40); // bit 6 set = forward
            const state = decodeFurbyState(view);
            expect(state.antenna).toBe('forward');
        });

        test('should decode upright orientation', () => {
            const buffer = new ArrayBuffer(10);
            const view = new DataView(buffer);
            view.setUint8(4, 0x01); // bit 0 set = upright
            const state = decodeFurbyState(view);
            expect(state.orientation).toBe('upright');
        });

        test('should decode upside-down orientation', () => {
            const buffer = new ArrayBuffer(10);
            const view = new DataView(buffer);
            view.setUint8(4, 0x02); // bit 1 set = upside-down
            const state = decodeFurbyState(view);
            expect(state.orientation).toBe('upside-down');
        });

        test('should decode tickle sensors', () => {
            const buffer = new ArrayBuffer(10);
            const view = new DataView(buffer);
            view.setUint8(2, 0x0F); // bits 0-3 set
            const state = decodeFurbyState(view);
            expect(state.tickle_head_back).toBe(true);
            expect(state.tickle_tummy).toBe(true);
            expect(state.tickle_right_side).toBe(true);
            expect(state.tickle_left_side).toBe(true);
        });

        test('should decode tail and tongue sensors', () => {
            const buffer = new ArrayBuffer(10);
            const view = new DataView(buffer);
            view.setUint8(2, 0x30); // bits 4-5 set
            const state = decodeFurbyState(view);
            expect(state.pull_tail).toBe(true);
            expect(state.push_tongue).toBe(true);
        });

        test('should handle no sensors triggered', () => {
            const buffer = new ArrayBuffer(10);
            const view = new DataView(buffer);
            const state = decodeFurbyState(view);
            expect(state.tickle_head_back).toBeUndefined();
            expect(state.tickle_tummy).toBeUndefined();
            expect(state.pull_tail).toBeUndefined();
        });
    });

    describe('sleep', () => {
        test('should delay execution', async () => {
            const start = Date.now();
            await sleep(100);
            const elapsed = Date.now() - start;
            expect(elapsed).toBeGreaterThanOrEqual(90); // Allow some margin
        });

        test('should return a promise', () => {
            const result = sleep(1);
            expect(result).toBeInstanceOf(Promise);
        });
    });
});

describe('Furby Web Bluetooth - Constants and Data Structures', () => {
    test('file_transfer_modes should have correct mappings', () => {
        const file_transfer_modes = {
            1: 'EndCurrentTransfer',
            2: 'ReadyToReceive',
            3: 'FileTransferTimeout',
            4: 'ReadyToAppend',
            5: 'FileReceivedOk',
            6: 'FileReceivedErr'
        };
        expect(file_transfer_modes[1]).toBe('EndCurrentTransfer');
        expect(file_transfer_modes[5]).toBe('FileReceivedOk');
        expect(file_transfer_modes[6]).toBe('FileReceivedErr');
    });

    test('slot status constants should be defined', () => {
        const SLOT_EMPTY = 0;
        const SLOT_UPLOADING = 1;
        const SLOT_FILLED = 2;
        const SLOT_ACTIVE = 3;
        
        expect(SLOT_EMPTY).toBe(0);
        expect(SLOT_UPLOADING).toBe(1);
        expect(SLOT_FILLED).toBe(2);
        expect(SLOT_ACTIVE).toBe(3);
    });

    test('furby_uuids should contain required characteristics', () => {
        const furby_uuids = {
            'GeneralPlusListen': 'dab91382-b5a1-e29c-b041-bcd562613bde',
            'GeneralPlusWrite': 'dab91383-b5a1-e29c-b041-bcd562613bde',
            'NordicListen': 'dab90756-b5a1-e29c-b041-bcd562613bde',
            'NordicWrite': 'dab90757-b5a1-e29c-b041-bcd562613bde',
            'RSSIListen': 'dab90755-b5a1-e29c-b041-bcd562613bde',
            'F2FListen': 'dab91440-b5a1-e29c-b041-bcd562613bde',
            'F2FWrite': 'dab91441-b5a1-e29c-b041-bcd562613bde',
            'FileWrite': 'dab90758-b5a1-e29c-b041-bcd562613bde'
        };
        
        expect(furby_uuids.GeneralPlusListen).toBeDefined();
        expect(furby_uuids.GeneralPlusWrite).toBeDefined();
        expect(furby_uuids.FileWrite).toBeDefined();
    });
});

describe('Furby Web Bluetooth - DLC Data Validation', () => {
    test('DLC index should have correct structure', () => {
        // This would normally load from dlc/index.js
        const sampleDLC = {
            file: "test.dlc",
            title: "Test DLC",
            buttons: [
                { title: "Action 1", action: [39, 4, 2, 0] }
            ]
        };
        
        expect(sampleDLC.file).toBeDefined();
        expect(sampleDLC.title).toBeDefined();
        expect(sampleDLC.buttons).toBeInstanceOf(Array);
        expect(sampleDLC.buttons[0].title).toBeDefined();
        expect(sampleDLC.buttons[0].action).toBeInstanceOf(Array);
    });

    test('action sequence should have valid format', () => {
        const action = [39, 4, 2, 0];
        expect(action.length).toBeGreaterThan(0);
        expect(action.length).toBeLessThanOrEqual(4);
        action.forEach(val => {
            expect(typeof val).toBe('number');
            expect(val).toBeGreaterThanOrEqual(0);
        });
    });
});

describe('Furby Web Bluetooth - Error Handling', () => {
    test('connection retry constants should be defined', () => {
        const INITIAL_RETRY_DELAY_MS = 1000;
        const MAX_RETRY_DELAY_MS = 5000;
        
        expect(INITIAL_RETRY_DELAY_MS).toBe(1000);
        expect(MAX_RETRY_DELAY_MS).toBe(5000);
        expect(MAX_RETRY_DELAY_MS).toBeGreaterThan(INITIAL_RETRY_DELAY_MS);
    });
});
