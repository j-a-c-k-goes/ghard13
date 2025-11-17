/**
 * puzzle_validator: validate puzzle solutions and behavioral data
 * context: verifies human-like puzzle completion
 * impact: determines if puzzle solution is valid for site access
 */

class puzzle_validator {
  constructor() {}
  
  /**
   * validate puzzle solution against parameters
   */
  validate_solution(solution, parameters) {
    const { slider_target, target_word, wait_time } = parameters;
    
    const slider_valid = Math.abs(solution.slider_value - slider_target) <= 2;
    const word_valid   = solution.target_word && solution.target_word.toUpperCase() === target_word;
    const timing_valid = solution.total_time >= (wait_time * 1000);
    
    return {
      slider_valid,
      word_valid,
      timing_valid
    };
  }
  
  /**
   * validate behavioral data for human-like patterns
   */
  validate_behavioral_data(behavioral_data) {
    if (!behavioral_data || behavioral_data.length === 0) {
      return { behavioral_valid: false, reason: 'no_data' };
    }
    
    const has_mouse_movement = behavioral_data.some(d => d.type === 'slider_move');
    const has_keystrokes     = behavioral_data.some(d => d.type === 'keystroke');
    
    return {
      behavioral_valid: has_mouse_movement && has_keystrokes,
      has_mouse_movement,
      has_keystrokes
    };
  }
  
  /**
   * comprehensive validation of puzzle completion
   */
  validate_complete(puzzle_data, solution, behavioral_data) {
    if (!puzzle_data) {
      return { valid: false, reason: 'puzzle_not_found' };
    }
    
    if (puzzle_data.status !== 'active') {
      return { valid: false, reason: 'puzzle_expired' };
    }
    
    if (Date.now() > puzzle_data.timeout_at) {
      return { valid: false, reason: 'timeout' };
    }
    
    const solution_validation   = this.validate_solution(solution, puzzle_data.parameters);
    const behavioral_validation = this.validate_behavioral_data(behavioral_data);
    
    const is_valid = solution_validation.slider_valid && 
                    solution_validation.word_valid && 
                    solution_validation.timing_valid && 
                    behavioral_validation.behavioral_valid;
    
    return {
      valid: is_valid,
      validation_details: {
        ...solution_validation,
        ...behavioral_validation
      }
    };
  }
}

module.exports = { puzzle_validator };