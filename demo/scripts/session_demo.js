/**
 * session demo main module
 * coordinates all session demo components
 */
class SessionDemo {
    constructor() {
        this.session_manager = new SessionManager();
        this.fallback_handler = new FallbackHandler(this.session_manager);
        this.ui_controller = new UIController(this.session_manager, this.fallback_handler);
        this.logger = new Logger();
        
        this.init();
    }
    
    init() {
        this.ui_controller.init_event_listeners();
        this.ui_controller.update_display();
        this.logger.log('session demo initialized');
    }
}

// initialize demo when page loads
document.addEventListener('DOMContentLoaded', () => {
    window.sessionDemo = new SessionDemo();
});