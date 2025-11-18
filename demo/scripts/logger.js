/**
 * logger module
 * handles session activity logging
 */
class Logger {
    constructor() {
        this.log_container = null;
    }
    
    init() {
        this.log_container = document.getElementById('session-log');
    }
    
    log(message) {
        if (!this.log_container) {
            this.init();
        }
        
        const timestamp = new Date().toLocaleTimeString();
        const log_entry = `[${timestamp}] ${message}`;
        
        const log_line = document.createElement('div');
        log_line.className = 'log-line';
        log_line.textContent = log_entry;
        
        this.log_container.appendChild(log_line);
        this.log_container.scrollTop = this.log_container.scrollHeight;
    }
    
    clear_log() {
        if (!this.log_container) {
            this.init();
        }
        
        this.log_container.innerHTML = '';
    }
}