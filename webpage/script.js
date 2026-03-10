// Form validation and submission handling
(function() {
    'use strict';

    const form = document.getElementById('intakeForm');
    const clearButton = document.getElementById('clearButton');
    const messageContainer = document.getElementById('messageContainer');
    const aiFeedbackPanel = document.getElementById('aiFeedbackPanel');
    const closeFeedbackPanel = document.getElementById('closeFeedbackPanel');
    const aiFeedbackContent = document.getElementById('aiFeedbackContent');

    let geminiAvailable = false;

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
     * Check if Gemini AI is available
     */
    async function checkGeminiStatus() {
        try {
            const response = await fetch('/api/gemini-status');
            const result = await response.json();
            geminiAvailable = result.available;

            if (!geminiAvailable) {
                // Hide all AI feedback buttons if Gemini is not available
                document.querySelectorAll('.ai-feedback-btn').forEach(btn => {
                    btn.classList.add('hidden');
                });
            }
        } catch (error) {
            console.error('Error checking Gemini status:', error);
            geminiAvailable = false;
        }
    }

    /**
     * Initialize example text for all fields
     */
    function initializeExampleText() {
        requiredFields.forEach(fieldId => {
            const field = document.getElementById(fieldId);
            const exampleText = field.getAttribute('data-example');

            if (exampleText && !field.value) {
                // Set example text
                field.value = exampleText;
                field.classList.add('has-example');
            }

            // Add focus handler to clear example text
            field.addEventListener('focus', function() {
                if (this.classList.contains('has-example')) {
                    this.value = '';
                    this.classList.remove('has-example');
                }
            });

            // Add blur handler to restore example text if empty
            field.addEventListener('blur', function() {
                if (!this.value.trim()) {
                    const example = this.getAttribute('data-example');
                    if (example) {
                        this.value = example;
                        this.classList.add('has-example');
                    }
                }
            });
        });
    }

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
        const hasExample = field.classList.contains('has-example');

        // Field is invalid if empty or still contains example text
        if (!value || hasExample) {
            field.classList.add('error');
            return false;
        } else {
            field.classList.remove('error');
            return true;
        }
    }

    /**
     * Get AI feedback for a field
     */
    async function getAIFeedback(fieldId) {
        const field = document.getElementById(fieldId);
        const fieldValue = field.value.trim();
        const hasExample = field.classList.contains('has-example');

        // Don't get feedback for empty or example text
        if (!fieldValue || hasExample) {
            showAIFeedback('Please enter your own content before requesting AI feedback.', null, true);
            return;
        }

        // Get field label for context
        const label = document.querySelector(`label[for="${fieldId}"]`);
        const section = field.closest('.form-section');
        const sectionTitle = section ? section.querySelector('h2').textContent : '';
        const fieldName = label ? label.textContent : (sectionTitle || fieldId);
        const helpText = field.closest('.form-section')?.querySelector('.help-text')?.textContent || '';

        // Show loading state
        showAIFeedback('Loading AI feedback...', fieldName, false, true);

        try {
            const response = await fetch('/api/gemini-feedback', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    fieldName: fieldName,
                    fieldValue: fieldValue,
                    fieldDescription: helpText
                })
            });

            const result = await response.json();

            if (response.ok && result.success) {
                showAIFeedback(result.feedback, fieldName, false, false);
            } else {
                showAIFeedback(result.message || 'Error getting AI feedback', fieldName, true, false);
            }
        } catch (error) {
            console.error('AI feedback error:', error);
            showAIFeedback('Network error: Unable to get AI feedback', fieldName, true, false);
        }
    }

    /**
     * Display AI feedback in the panel
     */
    function showAIFeedback(feedback, fieldName, isError, isLoading) {
        // Open the panel
        aiFeedbackPanel.classList.add('open');

        if (isLoading) {
            aiFeedbackContent.innerHTML = '<div class="ai-feedback-loading">Analyzing your input...</div>';
        } else if (isError) {
            aiFeedbackContent.innerHTML = `<div class="ai-feedback-error">${feedback}</div>`;
        } else if (fieldName) {
            aiFeedbackContent.innerHTML = `
                <div class="ai-feedback-field-name">${fieldName}</div>
                <div class="ai-feedback-text">${feedback}</div>
            `;
        } else {
            aiFeedbackContent.innerHTML = `<p class="ai-feedback-placeholder">${feedback}</p>`;
        }
    }

    /**
     * Close AI feedback panel
     */
    function closeAIPanel() {
        aiFeedbackPanel.classList.remove('open');
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
            // Don't include example text in form data
            if (!field.classList.contains('has-example')) {
                formData[fieldId] = field.value.trim();
            } else {
                formData[fieldId] = '';
            }
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

            // Remove any error classes and restore example text
            requiredFields.forEach(fieldId => {
                const field = document.getElementById(fieldId);
                field.classList.remove('error');

                // Restore example text
                const exampleText = field.getAttribute('data-example');
                if (exampleText) {
                    field.value = exampleText;
                    field.classList.add('has-example');
                }
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
                // Restore example text after reset
                requiredFields.forEach(fieldId => {
                    const field = document.getElementById(fieldId);
                    const exampleText = field.getAttribute('data-example');
                    if (exampleText) {
                        field.value = exampleText;
                        field.classList.add('has-example');
                    }
                });
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
     * Setup AI feedback button handlers
     */
    function setupAIFeedbackHandlers() {
        // Add click handlers to all AI feedback buttons
        document.querySelectorAll('.ai-feedback-btn').forEach(btn => {
            btn.addEventListener('click', function() {
                const fieldId = this.getAttribute('data-field');
                getAIFeedback(fieldId);
            });
        });

        // Close panel button
        closeFeedbackPanel.addEventListener('click', closeAIPanel);

        // Close panel when clicking outside
        document.addEventListener('click', function(e) {
            if (aiFeedbackPanel.classList.contains('open') &&
                !aiFeedbackPanel.contains(e.target) &&
                !e.target.classList.contains('ai-feedback-btn')) {
                closeAIPanel();
            }
        });
    }

    /**
     * Initialize form handlers
     */
    async function init() {
        // Check if Gemini is available
        await checkGeminiStatus();

        // Initialize example text
        initializeExampleText();

        // Setup form handlers
        form.addEventListener('submit', handleSubmit);
        clearButton.addEventListener('click', clearForm);
        setupRealtimeValidation();
        setupAIFeedbackHandlers();
    }

    // Initialize when DOM is ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
})();
