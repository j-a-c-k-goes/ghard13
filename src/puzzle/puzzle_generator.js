/**
 * puzzle_generator: create puzzle parameters and ids
 * context: generates dynamic puzzle configurations
 * impact: provides randomized puzzle parameters for ai-bot resistance
 */

class puzzle_generator {
  constructor() {
    this.word_sets          = ['DONE', 'READY', 'START', 'GO', 'NEXT', 'CONTINUE'];
    this.alphanumeric_chars = '0123456789ABCDEF';
  }
  
  /**
   * generate random value within range
   */
  random_between(min, max) {
    return Math.random() * (max - min) + min;
  }
  
  /**
   * generate random word from set + alphanumeric
   */
  generate_random_word() {
    const base_word      = this.word_sets[Math.floor(Math.random() * this.word_sets.length)];
    const numeric_suffix = Math.floor(Math.random() * 100).toString().padStart(2, '0');
    return base_word + numeric_suffix;
  }
  
  /**
   * generate unique puzzle id
   */
  generate_puzzle_id() {
    return 'puzzle_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
  }
  
  /**
   * generate puzzle parameters
   */
  generate_parameters() {
    const wait_time        = this.random_between(2.0, 5.0);
    const slider_target    = Math.floor(this.random_between(11, 87));
    const target_word      = this.generate_random_word();
    const timeout_duration = 60000; // 60 seconds
    
    return {
      wait_time,
      slider_target,
      target_word,
      timeout_duration
    };
  }
}

module.exports = { puzzle_generator };