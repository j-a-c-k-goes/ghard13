/**
 * ghard13 browser-compatible version
 * simplified implementation for demo purposes
 */

// Browser crypto polyfill
const crypto = window.crypto || window.msCrypto;

class BrowserObfuscator {
  constructor(config = {}) {
    this.config = {
      hex_length: config.hex_length || 8,
      site_salt: config.site_salt || 'ghard13_default',
      use_non_hex_chars: config.use_non_hex_chars || true,
      ...config
    };
    
    this.mappings = new Map();
    this.reverse_mappings = new Map();
    this.used_values = new Set();
  }
  
  generate_seed(selector) {
    // Simple hash function for browser
    let hash = 0;
    const str = this.config.site_salt + selector;
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convert to 32bit integer
    }
    return Math.abs(hash).toString(16).substring(0, 8);
  }
  
  get_random_int(max, seed = null) {
    if (seed) {
      // Deterministic based on seed
      let hash = 0;
      const str = seed + this.used_values.size.toString();
      for (let i = 0; i < str.length; i++) {
        const char = str.charCodeAt(i);
        hash = ((hash << 5) - hash) + char;
        hash = hash & hash;
      }
      return Math.abs(hash) % max;
    }
    
    // Use crypto.getRandomValues for better randomness
    const array = new Uint32Array(1);
    crypto.getRandomValues(array);
    return array[0] % max;
  }
  
  generate_hex_string(length = null, seed = null) {
    length = length || this.config.hex_length;
    const hex_chars = '0123456789abcdef';
    const non_hex_chars = '_-';
    let result = '';
    
    // Ensure first character is a letter
    result += 'abcdef'[this.get_random_int(6, seed)];
    
    for (let i = 1; i < length; i++) {
      if (this.config.use_non_hex_chars && i > 2 && Math.random() < 0.1) {
        result += non_hex_chars[this.get_random_int(non_hex_chars.length)];
      } else {
        result += hex_chars[this.get_random_int(hex_chars.length, seed)];
      }
    }
    
    return result;
  }
  
  get_hex_value(selector = null) {
    if (selector) {
      const seed = this.generate_seed(selector);
      let hex_value = this.generate_hex_string(null, seed);
      
      let counter = 0;
      while (this.used_values.has(hex_value)) {
        hex_value = this.generate_hex_string(null, seed + counter.toString());
        counter++;
      }
      
      this.used_values.add(hex_value);
      return hex_value;
    }
    
    let hex_value;
    do {
      hex_value = this.generate_hex_string();
    } while (this.used_values.has(hex_value));
    
    this.used_values.add(hex_value);
    return hex_value;
  }
  
  obfuscate_selector(selector) {
    if (this.mappings.has(selector)) {
      return this.mappings.get(selector);
    }
    
    const prefix = selector.charAt(0);
    const name = selector.slice(1);
    
    const obfuscated_name = this.get_hex_value(name);
    const obfuscated_selector = prefix + obfuscated_name;
    
    this.mappings.set(selector, obfuscated_selector);
    this.reverse_mappings.set(obfuscated_selector, selector);
    
    return obfuscated_selector;
  }
  
  generate_mappings(selectors) {
    const mappings = {};
    selectors.forEach(selector => {
      mappings[selector] = this.obfuscate_selector(selector);
    });
    return mappings;
  }
  
  get_stats() {
    return {
      total_mappings: this.mappings.size,
      collision_rate: 0
    };
  }
}

class BrowserPuzzleEngine {
  generate() {
    const wait_time = Math.random() * 3 + 2;
    const slider_target = Math.floor(Math.random() * 76 + 11);
    const words = ['DONE', 'READY', 'START', 'GO'];
    const target_word = words[Math.floor(Math.random() * words.length)] + 
                       Math.floor(Math.random() * 100).toString().padStart(2, '0');
    
    return {
      id: 'puzzle_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9),
      parameters: {
        wait_time,
        slider_target,
        target_word,
        timeout_duration: 60000
      }
    };
  }
}

class BrowserGhard13 {
  constructor(config = {}) {
    this.config = {
      obfuscator: {
        hex_length: 8,
        site_salt: 'ghard13_default',
        use_non_hex_chars: true,
        ...config.obfuscator
      },
      ...config
    };
    
    this.obfuscator = new BrowserObfuscator(this.config.obfuscator);
    this.puzzle_engine = new BrowserPuzzleEngine();
  }
  
  generate_puzzle() {
    return this.puzzle_engine.generate();
  }
}

// Export for browser use
window.ghard13 = BrowserGhard13;