/**
 * puzzle_test: test puzzle generation and validation
 * context: validates puzzle parameters and behavioral tracking
 * impact: ensures puzzle system works correctly
 */

const { ghard13 } = require('../../src/ghard13');

class puzzle_test {
  async run_tests() {
    const results = [];
    
    try {
      await this.test_puzzle_generation(results);
      await this.test_parameter_ranges(results);
      await this.test_puzzle_uniqueness(results);
      
    } catch (error) {
      results.push({ status: 'fail', test: 'puzzle_test', error: error.message });
    }
    
    return results;
  }
  
  async test_puzzle_generation(results) {
    const ghard13_instance = new ghard13();
    const puzzle = ghard13_instance.generate_puzzle();
    
    this.assert(puzzle.puzzle_id, 'puzzle should have puzzle_id');
    this.assert(puzzle.instructions, 'puzzle should have instructions');
    this.assert(puzzle.instructions.wait_time, 'puzzle should have wait_time');
    this.assert(puzzle.instructions.slider_target, 'puzzle should have slider_target');
    this.assert(puzzle.instructions.target_word, 'puzzle should have target_word');
    this.assert(puzzle.instructions.timeout_seconds, 'puzzle should have timeout_seconds');
    
    results.push({ status: 'pass', test: 'puzzle_generation' });
  }
  
  async test_parameter_ranges(results) {
    const ghard13_instance = new ghard13();
    const puzzle = ghard13_instance.generate_puzzle();
    
    this.assert(
      puzzle.instructions.wait_time >= 2 && puzzle.instructions.wait_time <= 5,
      'wait_time should be between 2-5 seconds'
    );
    this.assert(
      puzzle.instructions.slider_target >= 11 && puzzle.instructions.slider_target <= 87,
      'slider_target should be between 11-87%'
    );
    this.assert(
      puzzle.instructions.target_word.length >= 4,
      'target_word should be at least 4 characters'
    );
    
    results.push({ status: 'pass', test: 'parameter_ranges' });
  }
  
  async test_puzzle_uniqueness(results) {
    const ghard13_instance = new ghard13();
    const puzzle1 = ghard13_instance.generate_puzzle();
    const puzzle2 = ghard13_instance.generate_puzzle();
    
    this.assert(puzzle1.puzzle_id !== puzzle2.puzzle_id, 'puzzles should have unique ids');
    
    results.push({ status: 'pass', test: 'puzzle_uniqueness' });
  }
  
  assert(condition, message) {
    if (!condition) {
      throw new Error(`assertion failed: ${message}`);
    }
  }
}

module.exports = { puzzle_test };