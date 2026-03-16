/**
 * Project Intake Form JavaScript
 * Handles form submission and validation
 */

(function() {
    'use strict';

    const form = document.getElementById('intakeForm');
    const messageDiv = document.getElementById('message');
    const API_BASE = '/api';

    // Initialize FormField instances for all form fields
    const formFields = [];
    const fieldIds = [
        'project_name',
        'project_overview',
        'administrative_info',
        'timeline',
        'technical_requirements',
        'user_accounts',
        'notes',
        'attachments'
    ];

    fieldIds.forEach(fieldId => {
        const input = document.getElementById(fieldId);
        if (input && typeof FormField !== 'undefined') {
            const field = new FormField(input, input.placeholder);
            field.init();
            formFields.push(field);
        }
    });

    /**
     * Display a message to the user
     */
    function showMessage(text, type) {
        messageDiv.textContent = text;
        messageDiv.className = `message ${type}`;
        messageDiv.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }

    /**
     * Hide the message
     */
    function hideMessage() {
        messageDiv.className = 'message hidden';
    }

    /**
     * Validate form data before submission
     */
    function validateForm(formData) {
        const requiredFields = [
            'project_name',
            'project_overview',
            'administrative_info',
            'timeline',
            'technical_requirements',
            'user_accounts'
        ];

        const missing = [];
        for (const field of requiredFields) {
            if (!formData[field] || formData[field].trim() === '') {
                missing.push(field.replace(/_/g, ' '));
            }
        }

        if (missing.length > 0) {
            return {
                valid: false,
                error: `Missing required fields: ${missing.join(', ')}`
            };
        }

        return { valid: true };
    }

    /**
     * Submit form data to API
     */
    async function submitForm(event) {
        event.preventDefault();
        hideMessage();

        // Disable submit button
        const submitBtn = form.querySelector('.submit-btn');
        submitBtn.disabled = true;
        submitBtn.textContent = 'Submitting...';

        try {
            // Gather form data
            const formData = {};
            const inputs = form.querySelectorAll('input, textarea');
            inputs.forEach(input => {
                const value = input.value.trim();
                formData[input.name] = value || null;
            });

            // Validate
            const validation = validateForm(formData);
            if (!validation.valid) {
                showMessage(validation.error, 'error');
                return;
            }

            // Submit to API
            const response = await fetch(`${API_BASE}/submissions`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(formData)
            });

            const data = await response.json();

            if (response.ok) {
                showMessage(
                    `Success! Your submission (ID: ${data.id}) has been received. Thank you!`,
                    'success'
                );
                form.reset();
            } else {
                // Handle validation errors
                if (data.detail && Array.isArray(data.detail)) {
                    const errors = data.detail.map(err => {
                        const field = err.loc[err.loc.length - 1];
                        return `${field}: ${err.msg}`;
                    }).join('; ');
                    showMessage(`Validation error: ${errors}`, 'error');
                } else {
                    showMessage(
                        data.detail || 'Submission failed. Please try again.',
                        'error'
                    );
                }
            }
        } catch (error) {
            showMessage(
                'Network error. Please check your connection and try again.',
                'error'
            );
            console.error('Submission error:', error);
        } finally {
            // Re-enable submit button
            submitBtn.disabled = false;
            submitBtn.textContent = 'Submit Request';
        }
    }

    // Attach event listeners
    form.addEventListener('submit', submitForm);

    // Clear message when form is reset
    form.addEventListener('reset', () => {
        hideMessage();
        // Reset all FormField instances to show examples again
        formFields.forEach(field => field.reset());
    });
})();
