/**
 * config manager module
 * handles configuration state and generation
 */
class ConfigManager {
    constructor() {
        this.defaults = {
            build_time: true,
            puzzle_enabled: true,
            session_timeout: 3600000,
            debug: false,
            log_level: 'info',
            fallback_limits: {
                timeout_limit: 2,
                invalid_solution_limit: 3,
                max_total_attempts: 5
            },
            obfuscator: {
                hex_length: 8,
                site_salt: 'ghard13_default',
                pool_size: 100,
                use_non_hex_chars: true
            },
            puzzle: {
                timeout: 60000,
                wait_time_range: [2000, 5000]
            }
        };
    }
    
    get_current_config() {
        return {
            build_time: document.getElementById('build-time').checked,
            puzzle_enabled: document.getElementById('puzzle-enabled').checked,
            session_timeout: parseInt(document.getElementById('session-timeout-config').value),
            debug: document.getElementById('debug-mode').checked,
            log_level: document.getElementById('log-level').value,
            fallback_limits: {
                timeout_limit: parseInt(document.getElementById('timeout-limit-config').value),
                invalid_solution_limit: parseInt(document.getElementById('invalid-limit-config').value),
                max_total_attempts: parseInt(document.getElementById('max-attempts-config').value)
            },
            obfuscator: {
                hex_length: parseInt(document.getElementById('hex-length').value),
                site_salt: document.getElementById('site-salt').value,
                pool_size: parseInt(document.getElementById('pool-size').value),
                use_non_hex_chars: document.getElementById('non-hex-chars').checked
            },
            puzzle: {
                timeout: parseInt(document.getElementById('puzzle-timeout').value),
                wait_time_range: [
                    parseInt(document.getElementById('wait-min').value),
                    parseInt(document.getElementById('wait-max').value)
                ]
            }
        };
    }
    
    generate_config_output() {
        const config = this.get_current_config();
        return `// ghard13 configuration\nconst config = ${JSON.stringify(config, null, 2)};`;
    }
    
    reset_to_defaults() {
        document.getElementById('hex-length').value = this.defaults.obfuscator.hex_length;
        document.getElementById('site-salt').value = this.defaults.obfuscator.site_salt;
        document.getElementById('pool-size').value = this.defaults.obfuscator.pool_size;
        document.getElementById('non-hex-chars').checked = this.defaults.obfuscator.use_non_hex_chars;
        document.getElementById('puzzle-enabled').checked = this.defaults.puzzle_enabled;
        document.getElementById('puzzle-timeout').value = this.defaults.puzzle.timeout;
        document.getElementById('wait-min').value = this.defaults.puzzle.wait_time_range[0];
        document.getElementById('wait-max').value = this.defaults.puzzle.wait_time_range[1];
        document.getElementById('session-timeout-config').value = this.defaults.session_timeout;
        document.getElementById('timeout-limit-config').value = this.defaults.fallback_limits.timeout_limit;
        document.getElementById('invalid-limit-config').value = this.defaults.fallback_limits.invalid_solution_limit;
        document.getElementById('max-attempts-config').value = this.defaults.fallback_limits.max_total_attempts;
        document.getElementById('build-time').checked = this.defaults.build_time;
        document.getElementById('debug-mode').checked = this.defaults.debug;
        document.getElementById('log-level').value = this.defaults.log_level;
    }
}