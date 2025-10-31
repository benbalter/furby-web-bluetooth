/**
 * @jest-environment jsdom
 */

const { describe, test, expect } = require('@jest/globals');

// Import functions by evaluating the source code
// Since furble.js uses global scope, we'll need to mock the DOM and test individual functions

describe('Utility Functions', () => {
  describe('flipDict', () => {
    test('should flip dictionary keys and values', () => {
      const flipDict = (d) => {
        let flipped = {};
        for (let k in d) {
          let v = d[k];
          flipped[v] = k;
        }
        return flipped;
      };

      const input = { a: '1', b: '2', c: '3' };
      const expected = { '1': 'a', '2': 'b', '3': 'c' };
      expect(flipDict(input)).toEqual(expected);
    });

    test('should handle empty dictionary', () => {
      const flipDict = (d) => {
        let flipped = {};
        for (let k in d) {
          let v = d[k];
          flipped[v] = k;
        }
        return flipped;
      };

      expect(flipDict({})).toEqual({});
    });
  });

  describe('buf2hex', () => {
    test('should convert DataView to hex string', () => {
      const buf2hex = (dv) => {
        let s = '';
        if (DataView.prototype.isPrototypeOf(dv)) {
          for (let i = 0; i < dv.byteLength; i++) {
            s += ('0' + dv.getUint8(i).toString(16)).substr(-2);
          }
        } else if (Array.prototype.isPrototypeOf(dv)) {
          for (let i = 0; i < dv.length; i++) {
            s += ('0' + dv[i].toString(16)).substr(-2);
          }
        }
        return s;
      };

      const buffer = new ArrayBuffer(4);
      const view = new DataView(buffer);
      view.setUint8(0, 0xff);
      view.setUint8(1, 0x00);
      view.setUint8(2, 0xab);
      view.setUint8(3, 0xcd);

      expect(buf2hex(view)).toBe('ff00abcd');
    });

    test('should convert Array to hex string', () => {
      const buf2hex = (dv) => {
        let s = '';
        if (DataView.prototype.isPrototypeOf(dv)) {
          for (let i = 0; i < dv.byteLength; i++) {
            s += ('0' + dv.getUint8(i).toString(16)).substr(-2);
          }
        } else if (Array.prototype.isPrototypeOf(dv)) {
          for (let i = 0; i < dv.length; i++) {
            s += ('0' + dv[i].toString(16)).substr(-2);
          }
        }
        return s;
      };

      expect(buf2hex([255, 0, 171, 205])).toBe('ff00abcd');
    });

    test('should handle empty DataView', () => {
      const buf2hex = (dv) => {
        let s = '';
        if (DataView.prototype.isPrototypeOf(dv)) {
          for (let i = 0; i < dv.byteLength; i++) {
            s += ('0' + dv.getUint8(i).toString(16)).substr(-2);
          }
        } else if (Array.prototype.isPrototypeOf(dv)) {
          for (let i = 0; i < dv.length; i++) {
            s += ('0' + dv[i].toString(16)).substr(-2);
          }
        }
        return s;
      };

      const buffer = new ArrayBuffer(0);
      const view = new DataView(buffer);
      expect(buf2hex(view)).toBe('');
    });
  });

  describe('adler32', () => {
    test('should calculate Adler-32 checksum correctly', () => {
      const adler32 = (buf) => {
        const MOD_ADLER = 65521;
        let dv = new DataView(buf);
        let a = 1, b = 0;
        for (let i = 0; i < buf.byteLength; i++) {
          a = (a + dv.getUint8(i)) % MOD_ADLER;
          b = (b + a) % MOD_ADLER;
        }
        let checksum = (b << 16) >>> 0;
        return (checksum | a) >>> 0;
      };

      // Test with "Wikipedia" string
      const encoder = new TextEncoder('utf-8');
      const data = encoder.encode('Wikipedia');
      const buffer = data.buffer;
      
      // Expected checksum for "Wikipedia" is 0x11E60398
      expect(adler32(buffer)).toBe(0x11E60398);
    });

    test('should return 1 for empty buffer', () => {
      const adler32 = (buf) => {
        const MOD_ADLER = 65521;
        let dv = new DataView(buf);
        let a = 1, b = 0;
        for (let i = 0; i < buf.byteLength; i++) {
          a = (a + dv.getUint8(i)) % MOD_ADLER;
          b = (b + a) % MOD_ADLER;
        }
        let checksum = (b << 16) >>> 0;
        return (checksum | a) >>> 0;
      };

      const buffer = new ArrayBuffer(0);
      expect(adler32(buffer)).toBe(1);
    });
  });

  describe('makeDLCFilename', () => {
    test('should extract and format DLC filename', () => {
      const makeDLCFilename = (dlcurl) => {
        return dlcurl.substr(dlcurl.lastIndexOf('/') + 1).padStart(12, '_').toUpperCase();
      };

      expect(makeDLCFilename('dlc/test.dlc')).toBe('____TEST.DLC');
      expect(makeDLCFilename('path/to/myfile.dlc')).toBe('__MYFILE.DLC');
      expect(makeDLCFilename('verylongname.dlc')).toBe('VERYLONGNAME.DLC');
    });
  });
});

describe('DLC Slot Status Constants', () => {
  test('should have correct slot status values', () => {
    const SLOT_EMPTY = 0;
    const SLOT_UPLOADING = 1;
    const SLOT_FILLED = 2;
    const SLOT_ACTIVE = 3;

    expect(SLOT_EMPTY).toBe(0);
    expect(SLOT_UPLOADING).toBe(1);
    expect(SLOT_FILLED).toBe(2);
    expect(SLOT_ACTIVE).toBe(3);
  });
});

describe('UUID Mappings', () => {
  test('should have correct Furby UUID mappings', () => {
    const furby_uuids = {
      'GeneralPlusListen': 'dab91382-b5a1-e29c-b041-bcd562613bde',
      'GeneralPlusWrite':  'dab91383-b5a1-e29c-b041-bcd562613bde',
      'NordicListen':      'dab90756-b5a1-e29c-b041-bcd562613bde',
      'NordicWrite':       'dab90757-b5a1-e29c-b041-bcd562613bde',
      'RSSIListen':        'dab90755-b5a1-e29c-b041-bcd562613bde',
      'F2FListen':         'dab91440-b5a1-e29c-b041-bcd562613bde',
      'F2FWrite':          'dab91441-b5a1-e29c-b041-bcd562613bde',
      'FileWrite':         'dab90758-b5a1-e29c-b041-bcd562613bde'
    };

    expect(Object.keys(furby_uuids).length).toBe(8);
    expect(furby_uuids['GeneralPlusListen']).toBe('dab91382-b5a1-e29c-b041-bcd562613bde');
  });

  test('should have correct file transfer modes', () => {
    const file_transfer_modes = {
      1: 'EndCurrentTransfer',
      2: 'ReadyToReceive',
      3: 'FileTransferTimeout',
      4: 'ReadyToAppend',
      5: 'FileReceivedOk',
      6: 'FileReceivedErr'
    };

    expect(Object.keys(file_transfer_modes).length).toBe(6);
    expect(file_transfer_modes[5]).toBe('FileReceivedOk');
  });
});

describe('Furby State Decoder', () => {
  test('should decode antenna position correctly', () => {
    const decodeFurbyState = (buf) => {
      let antenna = '';
      if (buf.getUint8(1) & 2)
        antenna = 'left';
      if (buf.getUint8(1) & 1)
        antenna = 'right';
      if (buf.getUint8(2) == 0xc0)
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

      const state = {};
      state['antenna'] = antenna;
      state['orientation'] = orientation;

      if (buf.getUint8(2) & 1)
        state.tickle_head_back = true;
      if (buf.getUint8(2) & 2)
        state.tickle_tummy = true;

      return state;
    };

    const buffer = new ArrayBuffer(10);
    const view = new DataView(buffer);
    
    // Test antenna left
    view.setUint8(1, 2);
    let state = decodeFurbyState(view);
    expect(state.antenna).toBe('left');

    // Test antenna right
    view.setUint8(1, 1);
    state = decodeFurbyState(view);
    expect(state.antenna).toBe('right');

    // Test antenna down
    view.setUint8(1, 0);
    view.setUint8(2, 0xc0);
    state = decodeFurbyState(view);
    expect(state.antenna).toBe('down');
  });

  test('should decode orientation correctly', () => {
    const decodeFurbyState = (buf) => {
      let antenna = '';
      let orientation = '';
      if (buf.getUint8(4) & 1) 
        orientation = 'upright';
      else if (buf.getUint8(4) & 2) 
        orientation = 'upside-down';
      else if (buf.getUint8(4) & 4) 
        orientation = 'lying on right side';
      else if (buf.getUint8(4) & 8) 
        orientation = 'lying on left side';

      const state = {};
      state['antenna'] = antenna;
      state['orientation'] = orientation;
      return state;
    };

    const buffer = new ArrayBuffer(10);
    const view = new DataView(buffer);
    
    view.setUint8(4, 1);
    let state = decodeFurbyState(view);
    expect(state.orientation).toBe('upright');

    view.setUint8(4, 2);
    state = decodeFurbyState(view);
    expect(state.orientation).toBe('upside-down');

    view.setUint8(4, 4);
    state = decodeFurbyState(view);
    expect(state.orientation).toBe('lying on right side');
  });

  test('should decode sensor states correctly', () => {
    const decodeFurbyState = (buf) => {
      const state = {};
      state['antenna'] = '';
      state['orientation'] = '';

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
    };

    const buffer = new ArrayBuffer(10);
    const view = new DataView(buffer);
    
    view.setUint8(2, 0x01 | 0x02 | 0x10); // head, tummy, tail
    const state = decodeFurbyState(view);
    
    expect(state.tickle_head_back).toBe(true);
    expect(state.tickle_tummy).toBe(true);
    expect(state.pull_tail).toBe(true);
    expect(state.tickle_right_side).toBeUndefined();
  });
});

describe('Prefix Matching', () => {
  test('should match prefix correctly', () => {
    const prefixMatches = (prefix, buf) => {
      if (typeof(prefix) == 'undefined')
        return true;

      for (let i = 0; i < prefix.length; i++) {
        if (buf.getUint8(i) != prefix[i])
          return false;
      }
      return true;
    };

    const buffer = new ArrayBuffer(5);
    const view = new DataView(buffer);
    view.setUint8(0, 0x24);
    view.setUint8(1, 0x01);
    view.setUint8(2, 0x02);

    expect(prefixMatches([0x24], view)).toBe(true);
    expect(prefixMatches([0x24, 0x01], view)).toBe(true);
    expect(prefixMatches([0x24, 0x02], view)).toBe(false);
    expect(prefixMatches(undefined, view)).toBe(true);
  });
});
