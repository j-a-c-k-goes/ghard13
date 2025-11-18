/**
 * puzzles demo module
 * handles puzzle generation and interactive UI
 */
class PuzzlesDemo {
    constructor() {
        this.stats = {
            generated: 0,
            solved: 0,
            failed: 0
        };
        
        this.current_puzzle = null;
        this.init_event_listeners();
        this.update_stats();
    }
    
    init_event_listeners() {
        document.getElementById('generate-puzzle').addEventListener('click', () => this.generate_puzzle());
        document.getElementById('simulate-solve').addEventListener('click', () => this.simulate_solve());
        document.getElementById('simulate-fail').addEventListener('click', () => this.simulate_fail());
    }
    
    generate_puzzle() {
        this.current_puzzle = {
            id: 'puzzle_' + Date.now(),
            wait_time: Math.floor(Math.random() * 3000) + 2000, // 2-5 seconds
            slider_target: Math.floor(Math.random() * 76) + 11, // 11-87%
            input_word: this.get_random_word(),
            timeout: 60000
        };
        
        this.stats.generated++;
        this.update_stats();
        this.display_puzzle();
        this.update_output();
    }
    
    get_random_word() {
        const base_words = ['DONE', 'READY', 'HARD', 'OK', 'START', 'GO'];
        const base_word = base_words[Math.floor(Math.random() * base_words.length)];
        const alphanumeric = Math.floor(Math.random() * 99) + 1; // 1-99
        return base_word + alphanumeric;
    }
    
    display_puzzle() {
        const container = document.getElementById('puzzle-container');
        container.style.display = 'block';
        
        container.innerHTML = `
            <div class="demo-section">
                <h2>puzzle: ${this.current_puzzle.id}</h2>
                <div class="puzzle-ui">
                    <div class="puzzle-instruction">
                        <p>wait ${(this.current_puzzle.wait_time / 1000).toFixed(1)} seconds, then:</p>
                        <p>1. drag slider to ${this.current_puzzle.slider_target}%</p>
                        <p>2. type "${this.current_puzzle.input_word}"</p>
                    </div>
                    
                    <div class="puzzle-timer">
                        <div id="countdown">wait...</div>
                    </div>
                    
                    <div class="puzzle-controls">
                        <div class="slider-container">
                            <label>slider position: <span id="slider-value">50</span>%</label>
                            <input type="range" id="puzzle-slider" min="0" max="100" value="50" disabled>
                        </div>
                        
                        <div class="input-container">
                            <label>enter word:</label>
                            <input type="text" id="puzzle-input" placeholder="type here..." disabled>
                        </div>
                        
                        <button id="submit-puzzle" disabled>submit solution</button>
                    </div>
                    
                    <div class="puzzle-status" id="puzzle-status">waiting for timer...</div>
                </div>
            </div>
        `;
        
        this.start_puzzle_timer();
        this.setup_puzzle_controls();
    }
    
    start_puzzle_timer() {
        const countdown = document.getElementById('countdown');
        let remaining = this.current_puzzle.wait_time;
        
        const timer = setInterval(() => {
            remaining -= 100;
            countdown.textContent = `wait ${(remaining / 1000).toFixed(1)}s`;
            
            if (remaining <= 0) {
                clearInterval(timer);
                countdown.textContent = 'go!';
                this.enable_puzzle_controls();
            }
        }, 100);
    }
    
    enable_puzzle_controls() {
        document.getElementById('puzzle-slider').disabled = false;
        document.getElementById('puzzle-input').disabled = false;
        document.getElementById('submit-puzzle').disabled = false;
        document.getElementById('puzzle-status').textContent = 'puzzle active - complete the tasks';
    }
    
    setup_puzzle_controls() {
        const slider = document.getElementById('puzzle-slider');
        const sliderValue = document.getElementById('slider-value');
        const input = document.getElementById('puzzle-input');
        const submit = document.getElementById('submit-puzzle');
        
        slider.addEventListener('input', () => {
            sliderValue.textContent = slider.value;
        });
        
        submit.addEventListener('click', () => {
            this.validate_puzzle_solution();
        });
    }
    
    validate_puzzle_solution() {
        const sliderValue = parseInt(document.getElementById('puzzle-slider').value);
        const inputValue = document.getElementById('puzzle-input').value.toUpperCase();
        const status = document.getElementById('puzzle-status');
        
        const sliderCorrect = Math.abs(sliderValue - this.current_puzzle.slider_target) <= 2;
        const inputCorrect = inputValue === this.current_puzzle.input_word;
        
        if (sliderCorrect && inputCorrect) {
            this.stats.solved++;
            status.textContent = '✓ puzzle solved! human verification successful';
            status.style.color = '#28a745';
        } else {
            this.stats.failed++;
            status.textContent = '✗ puzzle failed - try again or generate new puzzle';
            status.style.color = '#dc3545';
        }
        
        this.update_stats();
        
        // disable controls after submission
        document.getElementById('puzzle-slider').disabled = true;
        document.getElementById('puzzle-input').disabled = true;
        document.getElementById('submit-puzzle').disabled = true;
    }
    
    simulate_solve() {
        if (!this.current_puzzle) {
            this.generate_puzzle();
            return;
        }
        
        // auto-solve the current puzzle
        setTimeout(() => {
            document.getElementById('puzzle-slider').value = this.current_puzzle.slider_target;
            document.getElementById('slider-value').textContent = this.current_puzzle.slider_target;
            document.getElementById('puzzle-input').value = this.current_puzzle.input_word;
            
            setTimeout(() => {
                this.validate_puzzle_solution();
            }, 500);
        }, 100);
    }
    
    simulate_fail() {
        if (!this.current_puzzle) {
            this.generate_puzzle();
            return;
        }
        
        // auto-fail the current puzzle with wrong values
        setTimeout(() => {
            const wrongSlider = Math.floor(Math.random() * 50) + (this.current_puzzle.slider_target > 50 ? 0 : 50);
            const wrongWords = ['WRONG', 'FAIL', 'BAD', 'NO'];
            const wrongWord = wrongWords[Math.floor(Math.random() * wrongWords.length)];
            
            document.getElementById('puzzle-slider').value = wrongSlider;
            document.getElementById('slider-value').textContent = wrongSlider;
            document.getElementById('puzzle-input').value = wrongWord;
            
            setTimeout(() => {
                this.validate_puzzle_solution();
            }, 500);
        }, 100);
    }
    
    update_output() {
        const output = `puzzle generated: ${this.current_puzzle.id}

target: ${this.current_puzzle.slider_target}% slider, "${this.current_puzzle.input_word}" input
wait time: ${(this.current_puzzle.wait_time / 1000).toFixed(1)} seconds

use the interactive puzzle below or simulate with buttons`;
        
        document.getElementById('output').textContent = output;
    }
    
    update_stats() {
        document.getElementById('puzzles-generated').textContent = this.stats.generated;
        document.getElementById('puzzles-solved').textContent = this.stats.solved;
        
        const total_attempts = this.stats.solved + this.stats.failed;
        const success_rate = total_attempts > 0 ? Math.round((this.stats.solved / total_attempts) * 100) : 0;
        document.getElementById('success-rate').textContent = success_rate + '%';
    }
}

// initialize demo when page loads
document.addEventListener('DOMContentLoaded', () => {
    window.puzzlesDemo = new PuzzlesDemo();
});