/**
 * config ui module
 * handles ui interactions and display updates
 */
class ConfigUI {
    constructor(config_manager) {
        this.config_manager = config_manager;
    }
    
    init_event_listeners() {
        // update config on any input change
        const inputs = document.querySelectorAll('input, select');
        inputs.forEach(input => {
            input.addEventListener('change', () => this.update_output());
            input.addEventListener('input', () => this.update_output());
        });
        
        // button actions
        document.getElementById('generate-config').addEventListener('click', () => this.update_output());
        document.getElementById('copy-config').addEventListener('click', () => this.copy_to_clipboard());
        document.getElementById('reset-config').addEventListener('click', () => this.reset_config());
    }
    
    update_output() {
        const output = this.config_manager.generate_config_output();
        document.getElementById('config-output').textContent = output;
    }
    
    copy_to_clipboard() {
        const output = document.getElementById('config-output').textContent;
        navigator.clipboard.writeText(output).then(() => {
            alert('configuration copied to clipboard');
        });
    }
    
    reset_config() {
        this.config_manager.reset_to_defaults();
        this.update_output();
    }
}