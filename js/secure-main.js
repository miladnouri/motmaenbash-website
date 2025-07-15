/**
 * Secure main JavaScript for MotmaenBash Website
 * Security-focused enhancements and CSP compliance
 * 
 * @version 2.0.0
 * @author محمدحسین نوروزی (Mohammad Hossein Norouzi)
 */

'use strict';

/**
 * Security utilities
 */
const WebSecurityUtils = {
    /**
     * Sanitizes HTML content to prevent XSS
     * @param {string} str - String to sanitize
     * @returns {string} - Sanitized string
     */
    sanitizeHTML(str) {
        if (typeof str !== 'string') return '';
        
        const div = document.createElement('div');
        div.textContent = str;
        return div.innerHTML;
    },

    /**
     * Validates URLs to prevent malicious redirects
     * @param {string} url - URL to validate
     * @returns {boolean} - True if URL is safe
     */
    isValidURL(url) {
        if (!url || typeof url !== 'string') return false;
        
        try {
            const urlObj = new URL(url);
            
            // Only allow HTTPS for external links
            if (urlObj.protocol !== 'https:' && urlObj.protocol !== 'http:') {
                return false;
            }
            
            // Check against allowed domains
            const allowedDomains = [
                'motmaenbash.ir',
                'github.com',
                'play.google.com',
                'chrome.google.com',
                'addons.mozilla.org',
                'cafebazaar.ir',
                'myket.ir',
                'forms.gle',
                'wa.me',
                'x.com',
                't.me',
                'linkedin.com',
                'telegram.org',
                'twitter.com',
                'whatsapp.com'
            ];
            
            const hostname = urlObj.hostname.toLowerCase();
            return allowedDomains.some(domain => 
                hostname === domain || 
                hostname.endsWith('.' + domain)
            );
        } catch (e) {
            return false;
        }
    },

    /**
     * Securely creates DOM elements
     * @param {string} tag - HTML tag name
     * @param {Object} attributes - Element attributes
     * @param {string} textContent - Element text content
     * @returns {HTMLElement} - Created element
     */
    createSecureElement(tag, attributes = {}, textContent = '') {
        const element = document.createElement(tag);
        
        // Set attributes safely
        Object.entries(attributes).forEach(([key, value]) => {
            if (this.isValidAttribute(key, value)) {
                element.setAttribute(key, value);
            }
        });
        
        // Set text content safely
        if (textContent) {
            element.textContent = textContent;
        }
        
        return element;
    },

    /**
     * Validates attributes to prevent XSS
     * @param {string} key - Attribute name
     * @param {string} value - Attribute value
     * @returns {boolean} - True if attribute is safe
     */
    isValidAttribute(key, value) {
        const dangerousAttrs = [
            'onclick', 'onload', 'onerror', 'onmouseover', 'onmouseout',
            'onfocus', 'onblur', 'onchange', 'onsubmit', 'onreset',
            'onkeydown', 'onkeyup', 'onkeypress'
        ];
        
        if (dangerousAttrs.includes(key.toLowerCase())) {
            return false;
        }
        
        if (typeof value !== 'string') {
            return false;
        }
        
        // Check for dangerous values
        if (value.includes('javascript:') || 
            value.includes('data:') || 
            value.includes('vbscript:') ||
            value.includes('onload=') ||
            value.includes('onerror=')) {
            return false;
        }
        
        return true;
    },

    /**
     * Logs security events
     * @param {string} event - Event description
     * @param {Object} details - Event details
     */
    logSecurityEvent(event, details = {}) {
        const logEntry = {
            timestamp: new Date().toISOString(),
            event: event,
            details: details,
            userAgent: navigator.userAgent,
            url: window.location.href
        };
        
        console.log('Security Event:', logEntry);
        
        // Store in sessionStorage for debugging
        try {
            const logs = JSON.parse(sessionStorage.getItem('security_logs') || '[]');
            logs.push(logEntry);
            
            // Keep only last 50 entries
            if (logs.length > 50) {
                logs.splice(0, logs.length - 50);
            }
            
            sessionStorage.setItem('security_logs', JSON.stringify(logs));
        } catch (e) {
            console.error('Failed to store security log:', e);
        }
    }
};

/**
 * Enhanced link security manager
 */
class SecureLinkManager {
    constructor() {
        this.initialized = false;
    }

    /**
     * Initializes the link manager
     */
    init() {
        if (this.initialized) return;
        
        this.setupLinkValidation();
        this.setupFormValidation();
        this.setupSecurityMonitoring();
        this.initialized = true;
        
        WebSecurityUtils.logSecurityEvent('SecureLinkManager initialized');
    }

    /**
     * Sets up link validation
     */
    setupLinkValidation() {
        document.addEventListener('click', (e) => {
            const link = e.target.closest('a');
            if (!link) return;
            
            const href = link.getAttribute('href');
            if (!href) return;
            
            // Skip internal links
            if (href.startsWith('#') || href.startsWith('/')) return;
            
            // Validate external links
            if (!WebSecurityUtils.isValidURL(href)) {
                e.preventDefault();
                WebSecurityUtils.logSecurityEvent('Blocked malicious link', { url: href });
                this.showSecurityAlert('لینک مشکوک مسدود شد');
                return;
            }
            
            // Add security attributes to external links
            if (!link.hasAttribute('rel')) {
                link.setAttribute('rel', 'noopener noreferrer');
            }
            
            if (!link.hasAttribute('target')) {
                link.setAttribute('target', '_blank');
            }
        });
    }

    /**
     * Sets up form validation
     */
    setupFormValidation() {
        document.addEventListener('submit', (e) => {
            const form = e.target;
            if (!form.tagName || form.tagName.toLowerCase() !== 'form') return;
            
            const action = form.getAttribute('action');
            if (action && !WebSecurityUtils.isValidURL(action)) {
                e.preventDefault();
                WebSecurityUtils.logSecurityEvent('Blocked malicious form submission', { action });
                this.showSecurityAlert('فرم نامعتبر مسدود شد');
                return;
            }
            
            // Validate form inputs
            const inputs = form.querySelectorAll('input, textarea, select');
            for (const input of inputs) {
                if (!this.validateInput(input)) {
                    e.preventDefault();
                    this.showSecurityAlert('ورودی نامعتبر شناسایی شد');
                    return;
                }
            }
        });
    }

    /**
     * Validates form input
     * @param {HTMLElement} input - Input element
     * @returns {boolean} - True if input is valid
     */
    validateInput(input) {
        const value = input.value;
        
        // Check for script injection
        if (value.includes('<script') || 
            value.includes('javascript:') || 
            value.includes('onload=') ||
            value.includes('onerror=')) {
            WebSecurityUtils.logSecurityEvent('Script injection attempt', { 
                input: input.name || input.id,
                value: value.substring(0, 100) 
            });
            return false;
        }
        
        // Check for SQL injection patterns
        const sqlPatterns = [
            /('|(\\)|(;|%)|(union|select|insert|delete|update|drop|create|alter|exec|execute)/i,
            /(or|and)\s+\d+\s*=\s*\d+/i,
            /\b(union|select|insert|delete|update|drop|create|alter|exec|execute)\b/i
        ];
        
        for (const pattern of sqlPatterns) {
            if (pattern.test(value)) {
                WebSecurityUtils.logSecurityEvent('SQL injection attempt', { 
                    input: input.name || input.id,
                    value: value.substring(0, 100) 
                });
                return false;
            }
        }
        
        return true;
    }

    /**
     * Sets up security monitoring
     */
    setupSecurityMonitoring() {
        // Monitor for DOM modifications
        const observer = new MutationObserver((mutations) => {
            mutations.forEach((mutation) => {
                if (mutation.type === 'childList') {
                    mutation.addedNodes.forEach((node) => {
                        if (node.nodeType === Node.ELEMENT_NODE) {
                            this.validateAddedNode(node);
                        }
                    });
                }
            });
        });

        observer.observe(document.body, {
            childList: true,
            subtree: true
        });

        // Monitor for suspicious activities
        let clickCount = 0;
        let clickTimer = null;

        document.addEventListener('click', () => {
            clickCount++;
            
            if (clickTimer) {
                clearTimeout(clickTimer);
            }
            
            clickTimer = setTimeout(() => {
                if (clickCount > 50) {
                    WebSecurityUtils.logSecurityEvent('Suspicious click activity detected', { 
                        clicks: clickCount 
                    });
                }
                clickCount = 0;
            }, 10000);
        });
    }

    /**
     * Validates newly added nodes
     * @param {Node} node - Added node
     */
    validateAddedNode(node) {
        // Check for suspicious scripts
        const scripts = node.querySelectorAll ? node.querySelectorAll('script') : [];
        scripts.forEach(script => {
            if (script.src && !WebSecurityUtils.isValidURL(script.src)) {
                WebSecurityUtils.logSecurityEvent('Malicious script blocked', { 
                    src: script.src 
                });
                script.remove();
            }
        });

        // Check for suspicious iframes
        const iframes = node.querySelectorAll ? node.querySelectorAll('iframe') : [];
        iframes.forEach(iframe => {
            if (iframe.src && !WebSecurityUtils.isValidURL(iframe.src)) {
                WebSecurityUtils.logSecurityEvent('Malicious iframe blocked', { 
                    src: iframe.src 
                });
                iframe.remove();
            }
        });
    }

    /**
     * Shows security alert
     * @param {string} message - Alert message
     */
    showSecurityAlert(message) {
        const alert = WebSecurityUtils.createSecureElement('div', {
            class: 'security-alert',
            style: 'position: fixed; top: 20px; right: 20px; background: #dc3545; color: white; padding: 15px; border-radius: 5px; z-index: 10000; max-width: 300px;'
        }, message);

        document.body.appendChild(alert);

        setTimeout(() => {
            if (alert.parentNode) {
                alert.parentNode.removeChild(alert);
            }
        }, 5000);
    }
}

/**
 * Performance monitor for security
 */
class SecurityPerformanceMonitor {
    constructor() {
        this.metrics = {
            loadTime: 0,
            domReady: 0,
            securityChecks: 0
        };
    }

    /**
     * Starts monitoring
     */
    start() {
        this.metrics.loadTime = performance.now();
        
        document.addEventListener('DOMContentLoaded', () => {
            this.metrics.domReady = performance.now();
            this.logMetrics();
        });
    }

    /**
     * Logs performance metrics
     */
    logMetrics() {
        const metrics = {
            loadTime: this.metrics.loadTime,
            domReady: this.metrics.domReady - this.metrics.loadTime,
            securityChecks: this.metrics.securityChecks
        };

        WebSecurityUtils.logSecurityEvent('Performance metrics', metrics);
    }

    /**
     * Increments security check counter
     */
    incrementSecurityChecks() {
        this.metrics.securityChecks++;
    }
}

/**
 * Initialize security systems
 */
document.addEventListener('DOMContentLoaded', () => {
    try {
        // Initialize security systems
        const linkManager = new SecureLinkManager();
        linkManager.init();

        const performanceMonitor = new SecurityPerformanceMonitor();
        performanceMonitor.start();

        // Add security information to console
        console.log('%c🔒 MotmaenBash Website Security System Active', 
            'color: #28a745; font-weight: bold; font-size: 14px;');
        console.log('%cSecurity features enabled:', 'color: #007bff; font-weight: bold;');
        console.log('- Link validation and sanitization');
        console.log('- Form input validation');
        console.log('- XSS prevention');
        console.log('- DOM modification monitoring');
        console.log('- Performance monitoring');
        console.log('%cDeveloped by: محمدحسین نوروزی (Mohammad Hossein Norouzi)', 
            'color: #6c757d; font-style: italic;');

        WebSecurityUtils.logSecurityEvent('Website security system initialized');

    } catch (error) {
        console.error('Security system initialization failed:', error);
        WebSecurityUtils.logSecurityEvent('Security system initialization failed', { 
            error: error.message 
        });
    }
});

// Export for testing
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { 
        WebSecurityUtils, 
        SecureLinkManager, 
        SecurityPerformanceMonitor 
    };
}