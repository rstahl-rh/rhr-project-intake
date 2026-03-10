// Form validation and submission handling
(function() {
    'use strict';

    const form = document.getElementById('intakeForm');
    const clearButton = document.getElementById('clearButton');
    const messageContainer = document.getElementById('messageContainer');

    // Field IDs for validation
    const requiredFields = [
        'project_name',
        'project_overview',
        'requestor',
        'funding',
        'oversight',
        'timeline_start',
        'timeline_duration',
        'timeline_constraints',
        'runtime_environment',
        'hardware_requirements',
        'network_requirements',
        'storage_requirements',
        'externalities',
        'user_accounts',
        'additional_notes',
        'attachments_info'
    ];

    /**
     * Display a message to the user
     */
    function showMessage(message, type = 'info') {
        messageContainer.textContent = message;
        messageContainer.className = 'message-container show ' + type;

        // Scroll to message
        messageContainer.scrollIntoView({ behavior: 'smooth', block: 'nearest' });

        // Auto-hide after 5 seconds for success messages
        if (type === 'success') {
            setTimeout(() => {
                hideMessage();
            }, 5000);
        }
    }

    /**
     * Hide the message container
     */
    function hideMessage() {
        messageContainer.className = 'message-container';
    }

    /**
     * Validate a single field
     */
    function validateField(fieldId) {
        const field = document.getElementById(fieldId);
        const value = field.value.trim();

        if (!value) {
            field.classList.add('error');
            return false;
        } else {
            field.classList.remove('error');
            return true;
        }
    }

    /**
     * Validate all required fields
     */
    function validateForm() {
        let isValid = true;
        const invalidFields = [];

        requiredFields.forEach(fieldId => {
            if (!validateField(fieldId)) {
                isValid = false;
                const field = document.getElementById(fieldId);
                const label = document.querySelector(`label[for="${fieldId}"]`);
                const fieldName = label ? label.textContent : fieldId;
                invalidFields.push(fieldName);
            }
        });

        if (!isValid) {
            showMessage(
                `Please fill in all required fields. Missing: ${invalidFields.join(', ')}`,
                'error'
            );
        }

        return isValid;
    }

    /**
     * Collect form data
     */
    function getFormData() {
        const formData = {};

        requiredFields.forEach(fieldId => {
            const field = document.getElementById(fieldId);
            formData[fieldId] = field.value.trim();
        });

        return formData;
    }

    /**
     * Submit form data to server
     */
    async function submitForm(formData) {
        try {
            const response = await fetch('/api/submit-form', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(formData)
            });

            const result = await response.json();

            if (response.ok && result.success) {
                showMessage(
                    `Form submitted successfully! Submission ID: ${result.id}`,
                    'success'
                );
                return true;
            } else {
                showMessage(
                    `Error: ${result.message || 'Failed to submit form'}`,
                    'error'
                );
                return false;
            }
        } catch (error) {
            console.error('Submission error:', error);
            showMessage(
                'Network error: Unable to submit form. Please check your connection and try again.',
                'error'
            );
            return false;
        }
    }

    /**
     * Clear all form fields
     */
    function clearForm() {
        if (confirm('Are you sure you want to clear all fields?')) {
            form.reset();

            // Remove any error classes
            requiredFields.forEach(fieldId => {
                const field = document.getElementById(fieldId);
                field.classList.remove('error');
            });

            hideMessage();
            showMessage('Form cleared', 'info');
        }
    }

    /**
     * Handle form submission
     */
    async function handleSubmit(event) {
        event.preventDefault();
        hideMessage();

        // Validate form
        if (!validateForm()) {
            return;
        }

        // Get form data
        const formData = getFormData();

        // Disable submit button during submission
        const submitButton = form.querySelector('button[type="submit"]');
        submitButton.disabled = true;
        submitButton.textContent = 'Submitting...';

        // Submit form
        const success = await submitForm(formData);

        // Re-enable submit button
        submitButton.disabled = false;
        submitButton.textContent = 'Submit Form';

        // Clear form on success
        if (success) {
            setTimeout(() => {
                form.reset();
            }, 2000);
        }
    }

    /**
     * Add real-time validation on blur
     */
    function setupRealtimeValidation() {
        requiredFields.forEach(fieldId => {
            const field = document.getElementById(fieldId);
            field.addEventListener('blur', () => {
                validateField(fieldId);
            });

            // Remove error class on input
            field.addEventListener('input', () => {
                if (field.classList.contains('error') && field.value.trim()) {
                    field.classList.remove('error');
                }
            });
        });
    }

    /**
     * Initialize form handlers
     */
    function init() {
        form.addEventListener('submit', handleSubmit);
        clearButton.addEventListener('click', clearForm);
        setupRealtimeValidation();
    }

    // Initialize when DOM is ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
})();
