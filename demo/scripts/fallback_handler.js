/**
 * fallback handler module
 * manages fallback simulation and tracking
 */
class FallbackHandler {
    constructor(session_manager) {
        this.session_manager = session_manager;
        this.fallback_counters = {
            timeout: 0,
            invalid: 0,
            behavioral: 0
        };
    }
    
    trigger_fallback(type) {
        if (!this.session_manager.get_session()) {
            return false;
        }
        
        this.fallback_counters[type] += 1;
        
        const session = this.session_manager.get_session();
        session.fallback_triggers.push({
            type: type,
            timestamp: Date.now()
        });
        
        if (this.should_fallback()) {
            session.state = 'fallback';
        }
        
        return true;
    }
    
    should_fallback() {
        const limits = this.session_manager.get_config().fallback_limits;
        const counters = this.fallback_counters;
        
        const timeout_exceeded = counters.timeout >= limits.timeout_limit;
        const invalid_exceeded = counters.invalid >= limits.invalid_solution_limit;
        const total_exceeded = (counters.timeout + counters.invalid + counters.behavioral) >= limits.max_total_attempts;
        
        return timeout_exceeded || invalid_exceeded || total_exceeded;
    }
    
    reset_fallbacks() {
        this.fallback_counters = { timeout: 0, invalid: 0, behavioral: 0 };
        
        const session = this.session_manager.get_session();
        if (session) {
            session.fallback_triggers = [];
            if (session.state === 'fallback') {
                session.state = 'new';
            }
        }
        
        return true;
    }
    
    get_counters() {
        return this.fallback_counters;
    }
}