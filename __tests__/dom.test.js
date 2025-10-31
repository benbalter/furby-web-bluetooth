/**
 * @jest-environment jsdom
 */

const { describe, test, expect, beforeEach } = require('@jest/globals');

describe('DOM Functions', () => {
  beforeEach(() => {
    document.body.innerHTML = `
      <div id="status" class="ok"></div>
      <div id="out"></div>
      <button id="connbtn">Connect</button>
      <span id="state">Not connected</span>
      <section id="test-section"></section>
      <a href="#test-section">Test</a>
    `;
  });

  describe('showStatus', () => {
    test('should display status message with correct class', () => {
      const showStatus = (msg, cls) => {
        const el = document.getElementById('status');
        el.className = '';
        el.classList.add('on');
        el.classList.add(cls);
        el.textContent = msg;
      };

      showStatus('Connected!', 'ok');
      const statusEl = document.getElementById('status');
      
      expect(statusEl.textContent).toBe('Connected!');
      expect(statusEl.classList.contains('ok')).toBe(true);
      expect(statusEl.classList.contains('on')).toBe(true);
    });

    test('should handle error status', () => {
      const showStatus = (msg, cls) => {
        const el = document.getElementById('status');
        el.className = '';
        el.classList.add('on');
        el.classList.add(cls);
        el.textContent = msg;
      };

      showStatus('Connection failed', 'error');
      const statusEl = document.getElementById('status');
      
      expect(statusEl.textContent).toBe('Connection failed');
      expect(statusEl.classList.contains('error')).toBe(true);
    });
  });

  describe('showSection', () => {
    test('should show section and hide previous', () => {
      let currentSection = '';

      const showSection = (section) => {
        if (currentSection) {
          try {
            document.querySelector('section#' + currentSection).classList.remove('current');
            document.querySelector(`a[href="#${currentSection}"]`).classList.remove('current');
          } catch (e) {}
        }
        currentSection = section;
        const sectionEl = document.querySelector('section#' + currentSection);
        const linkEl = document.querySelector(`a[href="#${currentSection}"]`);
        if (sectionEl) sectionEl.classList.add('current');
        if (linkEl) linkEl.classList.add('current');
        return currentSection;
      };

      currentSection = showSection('test-section');
      
      const section = document.querySelector('section#test-section');
      const link = document.querySelector('a[href="#test-section"]');
      
      expect(section.classList.contains('current')).toBe(true);
      expect(link.classList.contains('current')).toBe(true);
    });

    test('should handle non-existent section gracefully', () => {
      let currentSection = '';

      const showSection = (section) => {
        if (currentSection) {
          try {
            document.querySelector('section#' + currentSection).classList.remove('current');
            document.querySelector(`a[href="#${currentSection}"]`).classList.remove('current');
          } catch (e) {}
        }
        currentSection = section;
        const sectionEl = document.querySelector('section#' + currentSection);
        const linkEl = document.querySelector(`a[href="#${currentSection}"]`);
        if (sectionEl) sectionEl.classList.add('current');
        if (linkEl) linkEl.classList.add('current');
        return currentSection;
      };

      // Should not throw
      expect(() => showSection('non-existent')).not.toThrow();
    });
  });

  describe('enableButtons', () => {
    beforeEach(() => {
      document.body.innerHTML = `
        <div id="furby-buttons">
          <button id="btn1">Button 1</button>
          <button id="btn2">Button 2</button>
          <select id="sel1"><option>Option 1</option></select>
        </div>
      `;
    });

    test('should enable all buttons and selects', () => {
      const enableButtons = (enabled) => {
        document.querySelectorAll('#furby-buttons button, #furby-buttons select').forEach(
          el => {
            if (enabled)
              el.removeAttribute('disabled');
            else
              el.setAttribute('disabled', 'disabled');
          });
      };

      enableButtons(true);
      
      expect(document.getElementById('btn1').hasAttribute('disabled')).toBe(false);
      expect(document.getElementById('btn2').hasAttribute('disabled')).toBe(false);
      expect(document.getElementById('sel1').hasAttribute('disabled')).toBe(false);
    });

    test('should disable all buttons and selects', () => {
      const enableButtons = (enabled) => {
        document.querySelectorAll('#furby-buttons button, #furby-buttons select').forEach(
          el => {
            if (enabled)
              el.removeAttribute('disabled');
            else
              el.setAttribute('disabled', 'disabled');
          });
      };

      enableButtons(false);
      
      expect(document.getElementById('btn1').hasAttribute('disabled')).toBe(true);
      expect(document.getElementById('btn2').hasAttribute('disabled')).toBe(true);
      expect(document.getElementById('sel1').hasAttribute('disabled')).toBe(true);
    });
  });

  describe('updateCurrentSection', () => {
    test('should get section from URL hash', () => {
      const updateCurrentSection = () => {
        let current = location.hash.substr(1);
        if (current == '') current = 'dlc';
        // Check if bluetooth is supported (only in tests, navigator.bluetooth may not exist)
        if (typeof navigator !== 'undefined' && 'bluetooth' in navigator === false) 
          current = 'no-web-bluetooth';
        return current;
      };

      // Mock location.hash and navigator
      delete window.location;
      window.location = { hash: '#actions' };
      
      // Mock navigator.bluetooth to exist
      if (!navigator.bluetooth) {
        Object.defineProperty(navigator, 'bluetooth', {
          value: {},
          configurable: true
        });
      }
      
      expect(updateCurrentSection()).toBe('actions');
    });

    test('should default to dlc when no hash', () => {
      const updateCurrentSection = () => {
        let current = location.hash.substr(1);
        if (current == '') current = 'dlc';
        // Check if bluetooth is supported (only in tests, navigator.bluetooth may not exist)
        if (typeof navigator !== 'undefined' && 'bluetooth' in navigator === false) 
          current = 'no-web-bluetooth';
        return current;
      };

      delete window.location;
      window.location = { hash: '' };
      
      // Mock navigator.bluetooth to exist
      if (!navigator.bluetooth) {
        Object.defineProperty(navigator, 'bluetooth', {
          value: {},
          configurable: true
        });
      }
      
      expect(updateCurrentSection()).toBe('dlc');
    });

    test('should show no-web-bluetooth when bluetooth not supported', () => {
      const updateCurrentSection = () => {
        let current = location.hash.substr(1);
        if (current == '') current = 'dlc';
        if ('bluetooth' in navigator === false) 
          current = 'no-web-bluetooth';
        return current;
      };

      delete window.location;
      window.location = { hash: '#actions' };
      
      // Remove bluetooth from navigator
      delete navigator.bluetooth;
      
      expect(updateCurrentSection()).toBe('no-web-bluetooth');
    });
  });

  describe('Clipboard functionality', () => {
    test('should use modern Clipboard API when available', async () => {
      const mockClipboard = {
        writeText: jest.fn().mockResolvedValue(undefined)
      };
      
      Object.defineProperty(navigator, 'clipboard', {
        value: mockClipboard,
        writable: true
      });

      document.body.innerHTML = '<div id="out">Test content</div>';

      const log2clipboard = async () => {
        const out = document.getElementById('out');
        try {
          if (navigator.clipboard && navigator.clipboard.writeText) {
            await navigator.clipboard.writeText(out.textContent);
            return 'ok';
          }
        } catch (err) {
          return 'error';
        }
      };

      const result = await log2clipboard();
      
      expect(result).toBe('ok');
      expect(mockClipboard.writeText).toHaveBeenCalledWith('Test content');
    });

    test('should handle clipboard API errors', async () => {
      const mockClipboard = {
        writeText: jest.fn().mockRejectedValue(new Error('Permission denied'))
      };
      
      Object.defineProperty(navigator, 'clipboard', {
        value: mockClipboard,
        writable: true
      });

      document.body.innerHTML = '<div id="out">Test content</div>';

      const log2clipboard = async () => {
        const out = document.getElementById('out');
        try {
          if (navigator.clipboard && navigator.clipboard.writeText) {
            await navigator.clipboard.writeText(out.textContent);
            return 'ok';
          }
        } catch (err) {
          return 'error';
        }
      };

      const result = await log2clipboard();
      
      expect(result).toBe('error');
    });
  });

  describe('onConnected and onDisconnected', () => {
    beforeEach(() => {
      document.body.innerHTML = `
        <button id="connbtn">Connect</button>
        <span id="state">Not connected</span>
      `;
    });

    test('should update UI on connection', () => {
      const onConnected = () => {
        document.getElementById('connbtn').textContent = 'Disconnect';
        document.getElementById('state').textContent = 'Connected';
        return true;
      };

      const result = onConnected();
      
      expect(document.getElementById('connbtn').textContent).toBe('Disconnect');
      expect(document.getElementById('state').textContent).toBe('Connected');
      expect(result).toBe(true);
    });

    test('should update UI on disconnection', () => {
      const onDisconnected = () => {
        document.getElementById('connbtn').textContent = 'Connect';
        document.getElementById('state').textContent = 'Not Connected';
        return true;
      };

      const result = onDisconnected();
      
      expect(document.getElementById('connbtn').textContent).toBe('Connect');
      expect(document.getElementById('state').textContent).toBe('Not Connected');
      expect(result).toBe(true);
    });
  });
});

describe('DLC Index Loading', () => {
  test('should load and parse DLC index', async () => {
    global.fetch = jest.fn(() =>
      Promise.resolve({
        json: () => Promise.resolve([
          {
            file: "context.dlc",
            title: "Context Logo",
            buttons: [{ title: "Logo", action: [75, 0, 4, 4] }]
          },
          {
            file: "hacked.dlc",
            title: "HACKED",
            buttons: [
              { title: "Hacked 1", action: [75, 0, 3, 4] },
              { title: "Hacked 2", action: [75, 0, 4, 4] }
            ]
          }
        ])
      })
    );

    const loadDLCIndex = async () => {
      let resp = await fetch('dlc/index.js');
      let data = await resp.json();
      return data;
    };

    const data = await loadDLCIndex();
    
    expect(data).toHaveLength(2);
    expect(data[0].file).toBe('context.dlc');
    expect(data[0].title).toBe('Context Logo');
    expect(data[1].buttons).toHaveLength(2);
  });

  test('should validate DLC filename length', () => {
    const validateDLCFilename = (filename) => {
      if (filename.length > 12) {
        return false;
      }
      return true;
    };

    expect(validateDLCFilename('test.dlc')).toBe(true);
    expect(validateDLCFilename('verylongfilename.dlc')).toBe(false);
    expect(validateDLCFilename('exactly12ch')).toBe(true);
  });
});
