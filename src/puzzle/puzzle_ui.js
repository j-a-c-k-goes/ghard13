/**
 * puzzle_ui: generate html interface for puzzles
 * context: creates interactive puzzle interface with behavioral tracking
 * impact: provides user interface for human verification
 */

const pasteMeNot = require('paste-me-not');

class puzzle_ui {
  constructor() {}
  
  /**
   * generate html for puzzle interface
   */
  generate_html(puzzle_data) {
    const { wait_time, slider_target, target_word } = puzzle_data.parameters;
    
    return `
    <div id="ghard13-puzzle" style="max-width: 400px; margin: 50px auto; padding: 20px; border: 1px solid #ccc; font-family: Arial, sans-serif;">
      <h3>Site Access Verification</h3>
      <div id="puzzle-status">Please complete the following steps:</div>
      
      <div id="step-1" style="margin: 20px 0; padding: 10px; background: #f5f5f5;">
        <strong>Step 1:</strong> Wait for countdown to reach zero
        <div id="countdown-timer" style="font-size: 24px; font-weight: bold; color: #333; margin: 10px 0;">
          ${Math.ceil(wait_time)}
        </div>
      </div>
      
      <div id="step-2" style="margin: 20px 0; padding: 10px; background: #f5f5f5; opacity: 0.5;">
        <strong>Step 2:</strong> Drag slider to ${slider_target}%
        <div style="margin: 10px 0;">
          <input type="range" id="puzzle-slider" min="0" max="100" value="0" disabled style="width: 100%;">
          <div id="slider-value">0%</div>
        </div>
      </div>
      
      <div id="step-3" style="margin: 20px 0; padding: 10px; background: #f5f5f5; opacity: 0.5;">
        <strong>Step 3:</strong> Type the word: <strong>${target_word}</strong>
        <div style="margin: 10px 0;">
          <input type="text" id="puzzle-input" placeholder="Type here..." disabled style="width: 100%; padding: 5px;">
        </div>
      </div>
      
      <button id="puzzle-submit" disabled style="width: 100%; padding: 10px; background: #ccc; border: none; cursor: not-allowed;">
        Complete Verification
      </button>
      
      <div id="puzzle-error" style="color: red; margin-top: 10px; display: none;"></div>
    </div>
    
    ${this.generate_script(puzzle_data)}`;
  }
  
  /**
   * generate javascript for puzzle interaction
   */
  generate_script(puzzle_data) {
    const { wait_time, slider_target, target_word, timeout_duration } = puzzle_data.parameters;
    
    return `<script>
      (function() {
        const puzzleId = '${puzzle_data.id}';
        let currentStep = 1;
        let startTime = Date.now();
        let behavioralData = [];
        
        // countdown timer
        let countdown = ${Math.ceil(wait_time)};
        const timer = setInterval(() => {
          countdown -= 0.1;
          document.getElementById('countdown-timer').textContent = Math.max(0, countdown).toFixed(1);
          
          if (countdown <= 0) {
            clearInterval(timer);
            enableStep2();
          }
        }, 100);
        
        function enableStep2() {
          document.getElementById('step-2').style.opacity = '1';
          document.getElementById('puzzle-slider').disabled = false;
          currentStep = 2;
          
          const slider = document.getElementById('puzzle-slider');
          const valueDisplay = document.getElementById('slider-value');
          
          slider.addEventListener('input', function(e) {
            valueDisplay.textContent = e.target.value + '%';
            behavioralData.push({
              type: 'slider_move',
              value: parseInt(e.target.value),
              timestamp: Date.now() - startTime
            });
            
            if (Math.abs(parseInt(e.target.value) - ${slider_target}) <= 2) {
              enableStep3();
            }
          });
        }
        
        function enableStep3() {
          if (currentStep < 3) {
            document.getElementById('step-3').style.opacity = '1';
            document.getElementById('puzzle-input').disabled = false;
            currentStep = 3;
            
            const input = document.getElementById('puzzle-input');
            
            // enable paste-me-not protection
            if (typeof pasteMeNot !== 'undefined') {
              pasteMeNot.protect('#puzzle-input');
            }
            
            input.addEventListener('input', function(e) {
              behavioralData.push({
                type: 'keystroke',
                value: e.target.value,
                timestamp: Date.now() - startTime
              });
              
              if (e.target.value.toUpperCase() === '${target_word}') {
                enableSubmit();
              }
            });
          }
        }
        
        function enableSubmit() {
          const submitBtn = document.getElementById('puzzle-submit');
          submitBtn.disabled = false;
          submitBtn.style.background = '#007cba';
          submitBtn.style.cursor = 'pointer';
          
          submitBtn.addEventListener('click', function() {
            submitPuzzle();
          });
        }
        
        function submitPuzzle() {
          const totalTime = Date.now() - startTime;
          const solution = {
            puzzle_id: puzzleId,
            total_time: totalTime,
            behavioral_data: behavioralData
          };
          
          // in real implementation, this would be sent to server
          console.log('puzzle solution:', solution);
          document.getElementById('puzzle-status').textContent = 'Verification complete!';
          document.getElementById('ghard13-puzzle').style.background = '#e8f5e8';
        }
        
        // timeout handler
        setTimeout(() => {
          if (currentStep < 4) {
            document.getElementById('puzzle-error').style.display = 'block';
            document.getElementById('puzzle-error').textContent = 'Verification timed out. Please refresh to try again.';
          }
        }, ${timeout_duration});
      })();
    </script>`;
  }
}

module.exports = { puzzle_ui };