/**
 * FormField class - Handles example text show/hide behavior
 */

class FormField {
    constructor(inputElement, exampleText) {
        this.input = inputElement;
        this.exampleText = exampleText;
        this.originalPlaceholder = inputElement.placeholder;

        // Set initial state
        this.input.classList.add('has-example');

        // Bind event listeners
        this.input.addEventListener('input', () => this.handleInput());
        this.input.addEventListener('change', () => this.handleInput());
    }

    /**
     * Handle input changes - show/hide example text
     */
    handleInput() {
        if (this.input.value.trim().length > 0) {
            // User has entered text - hide example
            this.input.classList.remove('empty');
            this.input.classList.add('has-content');
        } else {
            // Field is empty - show example
            this.input.classList.remove('has-content');
            this.input.classList.add('empty');
        }
    }

    /**
     * Reset field to show example text
     */
    reset() {
        this.input.value = '';
        this.input.classList.remove('has-content');
        this.input.classList.add('empty');
    }

    /**
     * Initialize field state
     */
    init() {
        // Set initial state based on current value
        if (this.input.value.trim().length > 0) {
            this.input.classList.add('has-content');
        } else {
            this.input.classList.add('empty');
        }
    }
}

// Export for use in other scripts
if (typeof module !== 'undefined' && module.exports) {
    module.exports = FormField;
}
