/**
 * obfuscator: core hex value generation and mapping logic
 * context: converts human-readable selectors to hexadecimal values
 * impact: provides anti-automation protection via selector obfuscation
 */

const crypto = require('crypto');

class obfuscator {
  constructor(config = {}) {
    this.config = {
      hex_length:        config.hex_length || 8,
      site_salt:         config.site_salt || 'ghard13_default',
      pool_size:         config.pool_size || 100,
      use_non_hex_chars: config.use_non_hex_chars || true,
      ...config
    };
    
    this.mappings         = new Map();
    this.reverse_mappings = new Map();
    this.used_values      = new Set();
    this.hex_pool         = [];
    this.pool_index       = 0;
  }
  
  /**
   * generate deterministic seed from selector
   */
  generate_seed(selector) {
    const hash = crypto.createHash('sha256');
    hash.update(this.config.site_salt + selector);
    return hash.digest('hex').substring(0, 8);
  }
  
  /**
   * generate hex string with crypto randomness and optional non-hex chars
   */
  generate_hex_string(length = null, seed = null) {
    length = length || this.config.hex_length;
    const hex_chars     = '0123456789abcdef';
    const non_hex_chars = '_-';
    let result          = '';
    
    // ensure first character is a letter
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
  
  /**
   * get crypto-secure random integer
   */
  get_random_int(max, seed = null) {
    if (seed) {
      // deterministic based on seed
      const hash = crypto.createHash('sha256');
      hash.update(seed + this.pool_index.toString());
      const hex = hash.digest('hex');
      return parseInt(hex.substring(0, 2), 16) % max;
    }
    return crypto.randomInt(max);
  }
  
  /**
   * pre-generate hex pool for performance
   */
  populate_hex_pool() {
    if (this.hex_pool.length < this.config.pool_size) {
      const needed = this.config.pool_size - this.hex_pool.length;
      for (let i = 0; i < needed; i++) {
        let hex_value;
        do {
          hex_value = this.generate_hex_string();
        } while (this.used_values.has(hex_value));
        
        this.hex_pool.push(hex_value);
        this.used_values.add(hex_value);
      }
    }
  }
  
  /**
   * get hex from pool or generate deterministically
   */
  get_hex_value(selector = null) {
    if (selector) {
      // deterministic generation based on selector
      const seed    = this.generate_seed(selector);
      let hex_value = this.generate_hex_string(null, seed);
      
      // ensure uniqueness
      let counter = 0;
      while (this.used_values.has(hex_value)) {
        hex_value = this.generate_hex_string(null, seed + counter.toString());
        counter++;
      }
      
      this.used_values.add(hex_value);
      return hex_value;
    }
    
    // lazy pool population
    if (this.pool_index >= this.hex_pool.length) {
      this.populate_hex_pool();
    }
    
    return this.hex_pool[this.pool_index++];
  }
  
  /**
   * obfuscate single selector with deterministic generation
   */
  obfuscate_selector(selector) {
    if (this.mappings.has(selector)) {
      return this.mappings.get(selector);
    }
    
    const prefix = selector.charAt(0);
    const name   = selector.slice(1);
    
    // use deterministic generation for consistency
    const obfuscated_name     = this.get_hex_value(name);
    const obfuscated_selector = prefix + obfuscated_name;
    
    this.mappings.set(selector, obfuscated_selector);
    this.reverse_mappings.set(obfuscated_selector, selector);
    
    return obfuscated_selector;
  }
  
  /**
   * generate mappings for array of selectors
   */
  generate_mappings(selectors) {
    const mappings = {};
    
    selectors.forEach(selector => {
      mappings[selector] = this.obfuscate_selector(selector);
    });
    
    return mappings;
  }
  
  /**
   * get obfuscated value for selector
   */
  get_obfuscated(selector) {
    return this.mappings.get(selector);
  }
  
  /**
   * get original selector from obfuscated value
   */
  get_original(obfuscated_selector) {
    return this.reverse_mappings.get(obfuscated_selector);
  }
  
  /**
   * get all mappings
   */
  get_all_mappings() {
    return Object.fromEntries(this.mappings);
  }
  
  /**
   * check if selector is already obfuscated
   */
  is_obfuscated(selector) {
    return this.mappings.has(selector);
  }
  
  /**
   * clear all mappings and reset state
   */
  clear() {
    this.mappings.clear();
    this.reverse_mappings.clear();
    this.used_values.clear();
  }
  
  /**
   * get statistics about obfuscation
   */
  get_stats() {
    return {
      total_mappings:          this.mappings.size,
      unique_values_generated: this.used_values.size,
      collision_rate:          this.used_values.size > 0 ? 
        (this.used_values.size - this.mappings.size) / this.used_values.size : 0
    };
  }
}

module.exports = { obfuscator };