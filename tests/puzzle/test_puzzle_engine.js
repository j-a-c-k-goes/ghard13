/**
 * test suite for puzzle_engine component
 * context: validates puzzle generation and validation functionality
 * impact: ensures ai-bot resistant puzzles work correctly
 */

const { puzzle_engine } = require('../../src/puzzle/puzzle_engine');

function test_puzzle_generation() {
  const engine = new puzzle_engine();
  const puzzle = engine.generate();
  
  const has_puzzle_id = puzzle.puzzle_id && puzzle.puzzle_id.startsWith('puzzle_');
  const has_instructions = puzzle.instructions && 
    puzzle.instructions.wait_time && 
    puzzle.instructions.slider_target && 
    puzzle.instructions.target_word;
  const has_html = puzzle.html && puzzle.html.includes('ghard13-puzzle');
  
  const wait_time_valid = puzzle.instructions.wait_time >= 2.0 && puzzle.instructions.wait_time <= 5.0;
  const slider_valid = puzzle.instructions.slider_target >= 11 && puzzle.instructions.slider_target <= 87;
  const word_valid = puzzle.instructions.target_word && puzzle.instructions.target_word.length > 2;
  
  const is_valid = has_puzzle_id && has_instructions && has_html && 
                  wait_time_valid && slider_valid && word_valid;
  
  console.log(`test_puzzle_generation: ${is_valid ? 'PASS' : 'FAIL'}`);
  if (!is_valid) {
    console.log(`  puzzle_id: ${has_puzzle_id}, instructions: ${has_instructions}, html: ${has_html}`);
    console.log(`  wait_time: ${wait_time_valid}, slider: ${slider_valid}, word: ${word_valid}`);
    console.log(`  instructions:`, puzzle.instructions);
  }
  
  return is_valid;
}

function test_puzzle_uniqueness() {
  const engine = new puzzle_engine();
  const puzzle1 = engine.generate();
  const puzzle2 = engine.generate();
  
  const different_ids = puzzle1.puzzle_id !== puzzle2.puzzle_id;
  const different_wait_times = puzzle1.instructions.wait_time !== puzzle2.instructions.wait_time;
  const different_targets = puzzle1.instructions.slider_target !== puzzle2.instructions.slider_target;
  const different_words = puzzle1.instructions.target_word !== puzzle2.instructions.target_word;
  
  // at least some parameters should be different
  const has_variation = different_wait_times || different_targets || different_words;
  
  const is_valid = different_ids && has_variation;
  
  console.log(`test_puzzle_uniqueness: ${is_valid ? 'PASS' : 'FAIL'}`);
  if (!is_valid) {
    console.log(`  different_ids: ${different_ids}, has_variation: ${has_variation}`);
    console.log(`  puzzle1:`, puzzle1.instructions);
    console.log(`  puzzle2:`, puzzle2.instructions);
  }
  
  return is_valid;
}

function test_puzzle_validation_success() {
  const engine = new puzzle_engine();
  const puzzle = engine.generate();
  
  const solution = {
    slider_value: puzzle.instructions.slider_target,
    target_word: puzzle.instructions.target_word,
    total_time: puzzle.instructions.wait_time * 1000 + 1000 // wait time + extra
  };
  
  const behavioral_data = [
    { type: 'slider_move', value: puzzle.instructions.slider_target, timestamp: 3000 },
    { type: 'keystroke', value: puzzle.instructions.target_word, timestamp: 4000 }
  ];
  
  const validation = engine.validate(puzzle.puzzle_id, solution, behavioral_data);
  
  const is_valid = validation.valid === true && 
                  validation.validation_details.slider_valid &&
                  validation.validation_details.word_valid &&
                  validation.validation_details.timing_valid &&
                  validation.validation_details.behavioral_valid;
  
  console.log(`test_puzzle_validation_success: ${is_valid ? 'PASS' : 'FAIL'}`);
  if (!is_valid) {
    console.log(`  validation:`, validation);
  }
  
  return is_valid;
}

function test_puzzle_validation_failure() {
  const engine = new puzzle_engine();
  const puzzle = engine.generate();
  
  // wrong solution
  const bad_solution = {
    slider_value: 50, // wrong value
    target_word: 'WRONG',
    total_time: 1000 // too fast
  };
  
  const behavioral_data = []; // no behavioral data
  
  const validation = engine.validate(puzzle.puzzle_id, bad_solution, behavioral_data);
  
  const is_invalid = validation.valid === false;
  
  console.log(`test_puzzle_validation_failure: ${is_invalid ? 'PASS' : 'FAIL'}`);
  if (!is_invalid) {
    console.log(`  validation:`, validation);
  }
  
  return is_invalid;
}

function test_puzzle_timeout() {
  const engine = new puzzle_engine();
  const puzzle = engine.generate();
  
  // manually expire the puzzle
  const puzzle_data = engine.active_puzzles.get(puzzle.puzzle_id);
  puzzle_data.timeout_at = Date.now() - 1000; // expired 1 second ago
  
  const solution = {
    slider_value: puzzle.instructions.slider_target,
    target_word: puzzle.instructions.target_word,
    total_time: 5000
  };
  
  const validation = engine.validate(puzzle.puzzle_id, solution, []);
  
  const is_timeout = validation.valid === false && validation.reason === 'timeout';
  
  console.log(`test_puzzle_timeout: ${is_timeout ? 'PASS' : 'FAIL'}`);
  if (!is_timeout) {
    console.log(`  validation:`, validation);
  }
  
  return is_timeout;
}

function test_puzzle_cleanup() {
  const engine = new puzzle_engine();
  const puzzle1 = engine.generate();
  const puzzle2 = engine.generate();
  
  // expire one puzzle
  const puzzle_data = engine.active_puzzles.get(puzzle1.puzzle_id);
  puzzle_data.timeout_at = Date.now() - 1000;
  
  const initial_count = engine.get_active_count();
  engine.cleanup_expired();
  const final_count = engine.get_active_count();
  
  const cleaned_up = final_count < initial_count;
  const puzzle1_gone = !engine.active_puzzles.has(puzzle1.puzzle_id);
  const puzzle2_remains = engine.active_puzzles.has(puzzle2.puzzle_id);
  
  const is_valid = cleaned_up && puzzle1_gone && puzzle2_remains;
  
  console.log(`test_puzzle_cleanup: ${is_valid ? 'PASS' : 'FAIL'}`);
  if (!is_valid) {
    console.log(`  cleaned_up: ${cleaned_up}, puzzle1_gone: ${puzzle1_gone}, puzzle2_remains: ${puzzle2_remains}`);
    console.log(`  initial_count: ${initial_count}, final_count: ${final_count}`);
  }
  
  return is_valid;
}

function run_puzzle_engine_tests() {
  console.log('running puzzle_engine tests...');
  
  const results = [
    test_puzzle_generation(),
    test_puzzle_uniqueness(),
    test_puzzle_validation_success(),
    test_puzzle_validation_failure(),
    test_puzzle_timeout(),
    test_puzzle_cleanup()
  ];
  
  const passed = results.filter(Boolean).length;
  const total = results.length;
  
  console.log(`puzzle_engine tests: ${passed}/${total} passed`);
  return passed === total;
}

// run if called directly
if (require.main === module) {
  run_puzzle_engine_tests();
}

module.exports = { run_puzzle_engine_tests };