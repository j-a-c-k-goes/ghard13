/**
 * config demo main module
 * coordinates configuration demo components
 */
class ConfigDemo {
    constructor() {
        this.config_manager = new ConfigManager();
        this.config_ui = new ConfigUI(this.config_manager);
        
        this.init();
    }
    
    init() {
        this.config_ui.init_event_listeners();
        this.config_ui.update_output();
    }
}

// initialize demo when page loads
document.addEventListener('DOMContentLoaded', () => {
    window.configDemo = new ConfigDemo();
});