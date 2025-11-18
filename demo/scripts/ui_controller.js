/**
 * ui controller module
 * handles display updates and user interactions
 */
class UIController {
    constructor(session_manager, fallback_handler) {
        this.session_manager = session_manager;
        this.fallback_handler = fallback_handler;
        this.logger = new Logger();
    }
    
    init_event_listeners() {
        // session actions
        document.getElementById('create-session').addEventListener('click', () => this.handle_create_session());
        document.getElementById('validate-session').addEventListener('click', () => this.handle_validate_session());
        document.getElementById('update-session').addEventListener('click', () => this.handle_update_session());
        document.getElementById('expire-session').addEventListener('click', () => this.handle_expire_session());
        document.getElementById('clear-session').addEventListener('click', () => this.handle_clear_session());
        
        // fallback simulation
        document.getElementById('trigger-timeout').addEventListener('click', () => this.handle_trigger_fallback('timeout'));
        document.getElementById('trigger-invalid').addEventListener('click', () => this.handle_trigger_fallback('invalid'));
        document.getElementById('trigger-behavioral').addEventListener('click', () => this.handle_trigger_fallback('behavioral'));
        document.getElementById('reset-fallbacks').addEventListener('click', () => this.handle_reset_fallbacks());
        
        // configuration
        document.getElementById('update-config').addEventListener('click', () => this.handle_update_config());
        
        // log management
        document.getElementById('clear-log').addEventListener('click', () => this.logger.clear_log());
    }
    
    handle_create_session() {
        const session = this.session_manager.create_session();
        this.logger.log(`created session: ${session.id}`);
        this.update_display();
    }
    
    handle_validate_session() {
        const result = this.session_manager.validate_session();
        this.logger.log(`session validation: ${result.valid ? 'valid' : 'invalid'} ${result.expired ? '(expired)' : ''}`);
        this.update_display();
    }
    
    handle_update_session() {
        const success = this.session_manager.update_session();
        if (success) {
            const session = this.session_manager.get_session();
            this.logger.log(`updated session: attempts = ${session.puzzle_attempts}`);
        } else {
            this.logger.log('no session to update');
        }
        this.update_display();
    }
    
    handle_expire_session() {
        const success = this.session_manager.expire_session();
        if (success) {
            this.logger.log('session manually expired');
        } else {
            this.logger.log('no session to expire');
        }
        this.update_display();
    }
    
    handle_clear_session() {
        this.session_manager.clear_session();
        this.fallback_handler.reset_fallbacks();
        this.logger.log('session cleared');
        this.update_display();
    }
    
    handle_trigger_fallback(type) {
        if (!this.session_manager.get_session()) {
            this.logger.log('no session - creating one first');
            this.session_manager.create_session();
        }
        
        this.fallback_handler.trigger_fallback(type);
        const counters = this.fallback_handler.get_counters();
        this.logger.log(`triggered ${type} fallback (count: ${counters[type]})`);
        this.update_display();
    }
    
    handle_reset_fallbacks() {
        this.fallback_handler.reset_fallbacks();
        this.logger.log('fallback counters reset');
        this.update_display();
    }
    
    handle_update_config() {
        const new_config = {
            session_timeout: parseInt(document.getElementById('session-timeout').value),
            fallback_limits: {
                timeout_limit: parseInt(document.getElementById('timeout-limit').value),
                invalid_solution_limit: parseInt(document.getElementById('invalid-limit').value),
                max_total_attempts: parseInt(document.getElementById('max-attempts').value)
            }
        };
        
        this.session_manager.update_config(new_config);
        this.logger.log('configuration updated');
        this.update_display();
    }
    
    update_display() {
        this.update_session_status();
        this.update_fallback_status();
        this.update_config_display();
    }
    
    update_session_status() {
        const session = this.session_manager.get_session();
        
        if (session) {
            document.getElementById('session-id').textContent = session.id;
            document.getElementById('session-state').textContent = session.state;
            document.getElementById('puzzle-attempts').textContent = session.puzzle_attempts;
            
            const triggers = session.fallback_triggers.map(t => t.type).join(', ');
            document.getElementById('fallback-triggers').textContent = triggers || 'none';
        } else {
            document.getElementById('session-id').textContent = 'not initialized';
            document.getElementById('session-state').textContent = 'none';
            document.getElementById('puzzle-attempts').textContent = '0';
            document.getElementById('fallback-triggers').textContent = 'none';
        }
    }
    
    update_fallback_status() {
        const counters = this.fallback_handler.get_counters();
        
        document.getElementById('timeout-count').textContent = counters.timeout;
        document.getElementById('invalid-count').textContent = counters.invalid;
        document.getElementById('behavioral-count').textContent = counters.behavioral;
        document.getElementById('should-fallback').textContent = this.fallback_handler.should_fallback();
    }
    
    update_config_display() {
        const config = this.session_manager.get_config();
        
        document.getElementById('session-timeout').value = config.session_timeout;
        document.getElementById('timeout-limit').value = config.fallback_limits.timeout_limit;
        document.getElementById('invalid-limit').value = config.fallback_limits.invalid_solution_limit;
        document.getElementById('max-attempts').value = config.fallback_limits.max_total_attempts;
    }
}