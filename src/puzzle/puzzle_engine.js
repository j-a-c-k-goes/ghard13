/**
 * puzzle_engine: orchestrate puzzle generation and validation
 * context: coordinates puzzle components for human verification
 * impact: provides main interface for puzzle system
 */

const { puzzle_generator } = require('./puzzle_generator');
const { puzzle_validator } = require('./puzzle_validator');
const { puzzle_ui }        = require('./puzzle_ui');

class puzzle_engine {
  constructor() {
    this.generator      = new puzzle_generator();
    this.validator      = new puzzle_validator();
    this.ui             = new puzzle_ui();
    this.active_puzzles = new Map(); // puzzle_id -> puzzle_data
  }
  
  /**
   * generate new puzzle with dynamic parameters
   */
  generate() {
    const puzzle_id  = this.generator.generate_puzzle_id();
    const parameters = this.generator.generate_parameters();
    
    const puzzle_data = {
      id: puzzle_id,
      created_at:      Date.now(),
      timeout_at:      Date.now() + parameters.timeout_duration,
      parameters:      parameters,
      status:          'active',
      attempts:        0,
      behavioral_data: []
    };
    
    this.active_puzzles.set(puzzle_id, puzzle_data);
    
    return {
      puzzle_id: puzzle_id,
      instructions: {
        wait_time:       Math.round(parameters.wait_time * 10) / 10, // round to 1 decimal
        slider_target:   parameters.slider_target,
        target_word:     parameters.target_word,
        timeout_seconds: 60
      },
      html: this.ui.generate_html(puzzle_data)
    };
  }
  
  /**
   * validate puzzle solution
   */
  validate(puzzle_id, solution, behavioral_data = []) {
    const puzzle_data = this.active_puzzles.get(puzzle_id);
    
    if (puzzle_data) {
      puzzle_data.attempts++;
    }
    
    const validation = this.validator.validate_complete(puzzle_data, solution, behavioral_data);
    
    if (validation.valid && puzzle_data) {
      puzzle_data.status = 'solved';
      puzzle_data.solved_at = Date.now();
    }
    
    return {
      ...validation,
      puzzle_id: puzzle_id
    };
  }
  
  /**
   * get puzzle status
   */
  get_puzzle_status(puzzle_id) {
    const puzzle = this.active_puzzles.get(puzzle_id);
    return puzzle ? puzzle.status : 'not_found';
  }
  
  /**
   * cleanup expired puzzles
   */
  cleanup_expired() {
    const now = Date.now();
    for (const [puzzle_id, puzzle] of this.active_puzzles.entries()) {
      if (now > puzzle.timeout_at) {
        puzzle.status = 'expired';
        this.active_puzzles.delete(puzzle_id);
      }
    }
  }
  
  /**
   * get active puzzle count
   */
  get_active_count() {
    return Array.from(this.active_puzzles.values()).filter(p => p.status === 'active').length;
  }
}

module.exports = { puzzle_engine };