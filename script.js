/**
 * ACA Health Insurance Landing Page - JavaScript
 * Optimized for conversion tracking and user experience
 */

(function() {
    'use strict';

    // Configuration
    const CONFIG = {
        phoneNumber: '1-800-555-1234',
        zipCodePattern: /^\d{5}$/,
        phonePattern: /^[\d\s\(\)\-]+$/,
        animationDelay: 100,
        scrollOffset: 100,
        countdownDays: 30 // Days for countdown timer
    };

    // Device detection
    const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) || window.innerWidth <= 768;

    // Initialize all functionality when DOM is ready
    document.addEventListener('DOMContentLoaded', function() {
        initDeviceDetection();
        initCountdownTimer();
        initFormHandling();
        initPhoneTracking();
        initScrollAnimations();
        initHeaderBehavior();
        initSmoothScrolling();
        initInputFormatting();
        initAnalytics();
    });

    /**
     * Device Detection - Show/hide form vs direct click-to-call
     */
    function initDeviceDetection() {
        const desktopForm = document.getElementById('desktopFormContainer');
        const mobileCta = document.querySelector('.mobile-cta-container');
        const postFormCta = document.getElementById('postFormCta');

        if (isMobile) {
            // Mobile: Show direct click-to-call, hide form
            if (desktopForm) desktopForm.style.display = 'none';
            if (mobileCta) mobileCta.style.display = 'block';
        } else {
            // Desktop: Show form, hide mobile CTA
            if (desktopForm) desktopForm.style.display = 'block';
            if (mobileCta) mobileCta.style.display = 'none';
        }

        // Handle window resize
        let resizeTimer;
        window.addEventListener('resize', function() {
            clearTimeout(resizeTimer);
            resizeTimer = setTimeout(function() {
                const nowMobile = window.innerWidth <= 768;
                if (nowMobile !== isMobile) {
                    location.reload(); // Reload on significant size change
                }
            }, 250);
        });
    }

    /**
     * Countdown Timer
     */
    function initCountdownTimer() {
        const daysEl = document.getElementById('countdownDays');
        const hoursEl = document.getElementById('countdownHours');
        const minutesEl = document.getElementById('countdownMinutes');
        const secondsEl = document.getElementById('countdownSeconds');

        if (!daysEl || !hoursEl || !minutesEl || !secondsEl) return;

        // Set countdown end time (30 days from now)
        let endTime = new Date().getTime() + (CONFIG.countdownDays * 24 * 60 * 60 * 1000);

        function updateCountdown() {
            const now = new Date().getTime();
            let distance = endTime - now;

            if (distance < 0) {
                // Timer expired, reset to 30 days
                endTime = new Date().getTime() + (CONFIG.countdownDays * 24 * 60 * 60 * 1000);
                distance = endTime - now;
            }

            const days = Math.floor(distance / (1000 * 60 * 60 * 24));
            const hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
            const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
            const seconds = Math.floor((distance % (1000 * 60)) / 1000);

            daysEl.textContent = String(days).padStart(2, '0');
            hoursEl.textContent = String(hours).padStart(2, '0');
            minutesEl.textContent = String(minutes).padStart(2, '0');
            secondsEl.textContent = String(seconds).padStart(2, '0');
        }

        // Update immediately and then every second
        updateCountdown();
        setInterval(updateCountdown, 1000);
    }

    /**
     * Form Handling - Full lead form validation and submission
     */
    function initFormHandling() {
        const leadForm = document.getElementById('leadForm');
        if (!leadForm) return;

        const zipInput = document.getElementById('zipCode');
        const phoneInput = document.getElementById('phone');

        // ZIP code validation
        if (zipInput) {
            zipInput.addEventListener('input', function(e) {
                const value = e.target.value.replace(/\D/g, '');
                e.target.value = value.slice(0, 5);
                
                if (value.length === 5 && CONFIG.zipCodePattern.test(value)) {
                    e.target.classList.remove('error');
                    e.target.classList.add('valid');
                } else if (value.length > 0) {
                    e.target.classList.remove('valid');
                    e.target.classList.add('error');
                } else {
                    e.target.classList.remove('error', 'valid');
                }
            });
        }

        // Phone number formatting
        if (phoneInput) {
            phoneInput.addEventListener('input', function(e) {
                let value = e.target.value.replace(/\D/g, '');
                
                if (value.length > 0) {
                    if (value.length <= 3) {
                        value = `(${value}`;
                    } else if (value.length <= 6) {
                        value = `(${value.slice(0, 3)}) ${value.slice(3)}`;
                    } else {
                        value = `(${value.slice(0, 3)}) ${value.slice(3, 6)}-${value.slice(6, 10)}`;
                    }
                }
                
                e.target.value = value;
            });
        }

        // Form submission
        leadForm.addEventListener('submit', function(e) {
            e.preventDefault();

            // Get form data
            const formData = {
                firstName: document.getElementById('firstName')?.value.trim(),
                lastName: document.getElementById('lastName')?.value.trim(),
                email: document.getElementById('email')?.value.trim(),
                phone: document.getElementById('phone')?.value.trim(),
                zipCode: document.getElementById('zipCode')?.value.trim(),
                householdSize: document.getElementById('householdSize')?.value,
                consent: document.getElementById('consent')?.checked
            };

            // Validation
            if (!formData.firstName || !formData.lastName) {
                showFormError('Please enter your full name.');
                return;
            }

            if (!formData.email || !isValidEmail(formData.email)) {
                showFormError('Please enter a valid email address.');
                return;
            }

            if (!formData.phone || formData.phone.replace(/\D/g, '').length < 10) {
                showFormError('Please enter a valid phone number.');
                return;
            }

            if (!formData.zipCode || !CONFIG.zipCodePattern.test(formData.zipCode)) {
                showFormError('Please enter a valid 5-digit ZIP code.');
                return;
            }

            if (!formData.householdSize) {
                showFormError('Please select your household size.');
                return;
            }

            if (!formData.consent) {
                showFormError('Please check the consent box to continue.');
                return;
            }

            // Show loading state
            const submitButton = leadForm.querySelector('.btn-submit');
            const originalText = submitButton.textContent;
            submitButton.disabled = true;
            submitButton.textContent = 'Processing...';

            // Track form submission
            trackEvent('form_submit', {
                zip_code: formData.zipCode,
                household_size: formData.householdSize
            });

            // Simulate API call (replace with actual implementation)
            setTimeout(function() {
                // Generate claim number
                const claimId = Math.floor(100000 + Math.random() * 900000);
                
                // Hide form, show click-to-call
                const desktopForm = document.getElementById('desktopFormContainer');
                const postFormCta = document.getElementById('postFormCta');
                const claimIdEl = document.getElementById('claimId');

                if (desktopForm) desktopForm.style.display = 'none';
                if (postFormCta) {
                    postFormCta.style.display = 'block';
                    postFormCta.scrollIntoView({ behavior: 'smooth', block: 'center' });
                }
                if (claimIdEl) claimIdEl.textContent = claimId;

                // Track qualification
                trackEvent('qualified', {
                    claim_id: claimId,
                    zip_code: formData.zipCode
                });

                // Reset button (though form is hidden)
                submitButton.disabled = false;
                submitButton.textContent = originalText;

                // In production, send data to server:
                // fetch('/api/leads', {
                //     method: 'POST',
                //     headers: { 'Content-Type': 'application/json' },
                //     body: JSON.stringify(formData)
                // });
            }, 1500);
        });
    }

    /**
     * Email validation
     */
    function isValidEmail(email) {
        return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
    }

    /**
     * Show form error message
     */
    function showFormError(message) {
        const form = document.getElementById('leadForm');
        if (!form) return;

        // Remove existing error
        const existingError = form.querySelector('.form-error-message');
        if (existingError) existingError.remove();

        // Create error message
        const errorDiv = document.createElement('div');
        errorDiv.className = 'form-error-message';
        errorDiv.textContent = message;
        form.insertBefore(errorDiv, form.firstChild);

        // Scroll to error
        errorDiv.scrollIntoView({ behavior: 'smooth', block: 'center' });

        // Remove after 5 seconds
        setTimeout(function() {
            errorDiv.style.animation = 'fadeOut 0.3s';
            setTimeout(() => errorDiv.remove(), 300);
        }, 5000);
    }

    /**
     * Phone Number Click Tracking
     */
    function initPhoneTracking() {
        const phoneLinks = document.querySelectorAll('a[href^="tel:"]');
        
        phoneLinks.forEach(function(link) {
            link.addEventListener('click', function(e) {
                const phoneNumber = this.getAttribute('href').replace('tel:', '');
                const location = this.closest('section')?.className || 'unknown';
                
                trackEvent('phone_click', {
                    phone_number: phoneNumber,
                    location: location,
                    timestamp: new Date().toISOString()
                });

                // Optional: Add visual feedback
                this.style.transform = 'scale(0.95)';
                setTimeout(() => {
                    this.style.transform = '';
                }, 150);
            });

            // Track hover on phone links (intent to call)
            link.addEventListener('mouseenter', function() {
                trackEvent('phone_hover', {
                    location: this.closest('section')?.className || 'unknown'
                });
            });
        });
    }

    /**
     * Scroll Animations - Fade in elements on scroll
     */
    function initScrollAnimations() {
        const animatedElements = document.querySelectorAll(
            '.benefit-card, .step, .testimonial, .section-title'
        );

        if (!animatedElements.length) return;

        const observerOptions = {
            threshold: 0.1,
            rootMargin: '0px 0px -50px 0px'
        };

        const observer = new IntersectionObserver(function(entries) {
            entries.forEach(function(entry, index) {
                if (entry.isIntersecting) {
                    setTimeout(function() {
                        entry.target.style.opacity = '1';
                        entry.target.style.transform = 'translateY(0)';
                    }, index * CONFIG.animationDelay);
                    observer.unobserve(entry.target);
                }
            });
        }, observerOptions);

        // Initialize elements with hidden state
        animatedElements.forEach(function(element) {
            element.style.opacity = '0';
            element.style.transform = 'translateY(20px)';
            element.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
            observer.observe(element);
        });
    }

    /**
     * Header Behavior - Add shadow on scroll
     */
    function initHeaderBehavior() {
        const header = document.querySelector('.header');
        if (!header) return;

        let lastScroll = 0;
        
        window.addEventListener('scroll', function() {
            const currentScroll = window.pageYOffset;
            
            if (currentScroll > 50) {
                header.classList.add('scrolled');
            } else {
                header.classList.remove('scrolled');
            }

            lastScroll = currentScroll;
        });
    }

    /**
     * Smooth Scrolling for anchor links
     */
    function initSmoothScrolling() {
        document.querySelectorAll('a[href^="#"]').forEach(function(anchor) {
            anchor.addEventListener('click', function(e) {
                const href = this.getAttribute('href');
                if (href === '#') return;
                
                e.preventDefault();
                const target = document.querySelector(href);
                
                if (target) {
                    const headerHeight = document.querySelector('.header')?.offsetHeight || 0;
                    const targetPosition = target.offsetTop - headerHeight;
                    
                    window.scrollTo({
                        top: targetPosition,
                        behavior: 'smooth'
                    });
                }
            });
        });
    }

    /**
     * Input Formatting - Auto-format inputs
     */
    function initInputFormatting() {
        const zipInput = document.getElementById('zipCode');
        if (zipInput) {
            // Prevent non-numeric input
            zipInput.addEventListener('keypress', function(e) {
                const char = String.fromCharCode(e.which);
                if (!/[0-9]/.test(char)) {
                    e.preventDefault();
                }
            });

            // Paste handling
            zipInput.addEventListener('paste', function(e) {
                e.preventDefault();
                const pastedText = (e.clipboardData || window.clipboardData).getData('text');
                const numbersOnly = pastedText.replace(/\D/g, '').slice(0, 5);
                this.value = numbersOnly;
                this.dispatchEvent(new Event('input'));
            });
        }

        // Name inputs - capitalize first letter
        const nameInputs = document.querySelectorAll('#firstName, #lastName');
        nameInputs.forEach(function(input) {
            input.addEventListener('blur', function() {
                if (this.value) {
                    this.value = this.value.charAt(0).toUpperCase() + this.value.slice(1).toLowerCase();
                }
            });
        });
    }

    /**
     * Analytics and Event Tracking
     */
    function initAnalytics() {
        // Track page view
        trackEvent('page_view', {
            page: window.location.pathname,
            referrer: document.referrer || 'direct'
        });

        // Track scroll depth
        let maxScroll = 0;
        const scrollThresholds = [25, 50, 75, 100];
        const trackedThresholds = new Set();

        window.addEventListener('scroll', function() {
            const scrollPercent = Math.round(
                (window.scrollY / (document.documentElement.scrollHeight - window.innerHeight)) * 100
            );
            
            if (scrollPercent > maxScroll) {
                maxScroll = scrollPercent;
                
                scrollThresholds.forEach(function(threshold) {
                    if (scrollPercent >= threshold && !trackedThresholds.has(threshold)) {
                        trackedThresholds.add(threshold);
                        trackEvent('scroll_depth', { percent: threshold });
                    }
                });
            }
        });

        // Track time on page
        const startTime = Date.now();
        window.addEventListener('beforeunload', function() {
            const timeOnPage = Math.round((Date.now() - startTime) / 1000);
            trackEvent('time_on_page', { seconds: timeOnPage });
        });
    }

    /**
     * Track Events (Analytics)
     * Replace with your actual analytics implementation (Google Analytics, etc.)
     */
    function trackEvent(eventName, eventData) {
        // Console log for development
        if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
            console.log('Event:', eventName, eventData);
        }

        // Google Analytics 4 example:
        // if (typeof gtag !== 'undefined') {
        //     gtag('event', eventName, eventData);
        // }

        // Google Analytics Universal example:
        // if (typeof ga !== 'undefined') {
        //     ga('send', 'event', 'Landing Page', eventName, JSON.stringify(eventData));
        // }

        // Facebook Pixel example:
        // if (typeof fbq !== 'undefined') {
        //     fbq('track', eventName, eventData);
        // }

        // Custom analytics endpoint:
        // fetch('/api/analytics', {
        //     method: 'POST',
        //     headers: { 'Content-Type': 'application/json' },
        //     body: JSON.stringify({ event: eventName, data: eventData })
        // }).catch(err => console.error('Analytics error:', err));
    }

    /**
     * Show Error Message
     */
    function showError(message) {
        const zipInput = document.getElementById('zipCode');
        if (!zipInput) return;

        // Remove existing error message
        const existingError = zipInput.parentElement.querySelector('.error-message');
        if (existingError) {
            existingError.remove();
        }

        // Create error message
        const errorDiv = document.createElement('div');
        errorDiv.className = 'error-message';
        errorDiv.textContent = message;
        errorDiv.style.cssText = 'color: #dc3545; font-size: 0.875rem; margin-top: 0.5rem; animation: fadeIn 0.3s;';
        
        zipInput.parentElement.appendChild(errorDiv);

        // Remove after 5 seconds
        setTimeout(function() {
            errorDiv.style.animation = 'fadeOut 0.3s';
            setTimeout(() => errorDiv.remove(), 300);
        }, 5000);
    }

    /**
     * Show Success Message
     */
    function showSuccess(message) {
        // Create success notification
        const successDiv = document.createElement('div');
        successDiv.className = 'success-message';
        successDiv.innerHTML = `
            <div style="
                position: fixed;
                top: 20px;
                right: 20px;
                background: #00a86b;
                color: white;
                padding: 1rem 1.5rem;
                border-radius: 8px;
                box-shadow: 0 4px 12px rgba(0,0,0,0.15);
                z-index: 1000;
                max-width: 400px;
                animation: slideIn 0.3s ease;
            ">
                <strong>✓ Success!</strong><br>
                ${message}
            </div>
        `;
        
        document.body.appendChild(successDiv);

        // Remove after 5 seconds
        setTimeout(function() {
            successDiv.style.animation = 'slideOut 0.3s ease';
            setTimeout(() => successDiv.remove(), 300);
        }, 5000);
    }

    /**
     * Add CSS animations dynamically
     */
    function addAnimations() {
        const style = document.createElement('style');
        style.textContent = `
            @keyframes fadeIn {
                from { opacity: 0; transform: translateY(-10px); }
                to { opacity: 1; transform: translateY(0); }
            }
            @keyframes fadeOut {
                from { opacity: 1; transform: translateY(0); }
                to { opacity: 0; transform: translateY(-10px); }
            }
            @keyframes slideIn {
                from { transform: translateX(400px); opacity: 0; }
                to { transform: translateX(0); opacity: 1; }
            }
            @keyframes slideOut {
                from { transform: translateX(0); opacity: 1; }
                to { transform: translateX(400px); opacity: 0; }
            }
            .zip-form input.error {
                border-color: #dc3545 !important;
            }
            .zip-form input.valid {
                border-color: #00a86b !important;
            }
            .header.scrolled {
                box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
            }
        `;
        document.head.appendChild(style);
    }

    // Add animations on load
    addAnimations();

    // Expose utility functions globally if needed
    window.ACALanding = {
        trackEvent: trackEvent,
        showError: showError,
        showSuccess: showSuccess
    };

})();

