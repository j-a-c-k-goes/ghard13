/**
 * fallback_content: generate fallback content pages
 * context: creates html content for access denial and error pages
 * impact: provides user-friendly fallback interfaces
 */

class fallback_content {
  constructor() {}
  
  /**
   * generate access denied page
   */
  generate_access_denied_page(reason = 'verification_failed') {
    return `
    <!DOCTYPE html>
    <html>
    <head>
      <title>Access Verification Required</title>
      <style>
        body { font-family: Arial, sans-serif; text-align: center; margin: 50px; }
        .container { max-width: 500px; margin: 0 auto; padding: 20px; border: 1px solid #ccc; }
        .error { color: #d32f2f; margin: 20px 0; }
        .info { color: #666; margin: 20px 0; }
        button { padding: 10px 20px; background: #007cba; color: white; border: none; cursor: pointer; }
        button:hover { background: #005a8b; }
      </style>
    </head>
    <body>
      <div class="container">
        <h2>Access Verification Required</h2>
        <div class="error">Verification failed: ${reason}</div>
        <div class="info">
          This site requires human verification to access content.
          Please refresh the page to try again or contact the site administrator.
        </div>
        <button onclick="window.location.reload()">Try Again</button>
      </div>
    </body>
    </html>`;
  }
  
  /**
   * generate timeout page
   */
  generate_timeout_page() {
    return `
    <!DOCTYPE html>
    <html>
    <head>
      <title>Verification Timeout</title>
      <style>
        body { font-family: Arial, sans-serif; text-align: center; margin: 50px; }
        .container { max-width: 500px; margin: 0 auto; padding: 20px; border: 1px solid #ccc; }
        .warning { color: #f57c00; margin: 20px 0; }
        .info { color: #666; margin: 20px 0; }
        button { padding: 10px 20px; background: #007cba; color: white; border: none; cursor: pointer; }
      </style>
    </head>
    <body>
      <div class="container">
        <h2>Verification Timeout</h2>
        <div class="warning">The verification process timed out.</div>
        <div class="info">
          Please refresh the page to start a new verification process.
        </div>
        <button onclick="window.location.reload()">Start New Verification</button>
      </div>
    </body>
    </html>`;
  }
  
  /**
   * generate error page
   */
  generate_error_page(error_message = 'An error occurred') {
    return `
    <!DOCTYPE html>
    <html>
    <head>
      <title>Verification Error</title>
      <style>
        body { font-family: Arial, sans-serif; text-align: center; margin: 50px; }
        .container { max-width: 500px; margin: 0 auto; padding: 20px; border: 1px solid #ccc; }
        .error { color: #d32f2f; margin: 20px 0; }
        .info { color: #666; margin: 20px 0; }
        button { padding: 10px 20px; background: #007cba; color: white; border: none; cursor: pointer; }
      </style>
    </head>
    <body>
      <div class="container">
        <h2>Verification Error</h2>
        <div class="error">${error_message}</div>
        <div class="info">
          Please refresh the page to try again.
        </div>
        <button onclick="window.location.reload()">Refresh Page</button>
      </div>
    </body>
    </html>`;
  }
  
  /**
   * get content for specific failure reason
   */
  get_content_for_reason(reason) {
    switch (reason) {
      case 'timeout':
        return this.generate_timeout_page();
      case 'too_many_attempts':
        return this.generate_access_denied_page('Too many failed attempts');
      case 'invalid_solution':
        return this.generate_access_denied_page('Invalid verification response');
      case 'no_behavioral_data':
        return this.generate_access_denied_page('Verification data missing');
      default:
        return this.generate_access_denied_page(reason);
    }
  }
}

module.exports = { fallback_content };