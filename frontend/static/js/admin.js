/**
 * Admin panel JavaScript - View and manage submissions
 */

(function() {
    'use strict';

    const API_BASE = '/api';
    const loadingMsg = document.getElementById('loadingMessage');
    const noDataMsg = document.getElementById('noSubmissionsMessage');
    const submissionsList = document.getElementById('submissionsList');
    const errorMsg = document.getElementById('errorMessage');
    const refreshBtn = document.getElementById('refreshBtn');

    /**
     * Format date for display
     */
    function formatDate(dateString) {
        const date = new Date(dateString);
        return date.toLocaleString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    }

    /**
     * Create a submission card element
     */
    function createSubmissionCard(submission) {
        const card = document.createElement('div');
        card.className = 'submission-card';
        card.dataset.id = submission.id;

        const header = document.createElement('div');
        header.className = 'submission-header';

        const headerInfo = document.createElement('div');
        headerInfo.innerHTML = `
            <div class="submission-title">${escapeHtml(submission.project_name)}</div>
            <div class="submission-meta">
                <span class="submission-id">ID: ${submission.id}</span>
                <span class="submission-date">Submitted: ${formatDate(submission.created_at)}</span>
            </div>
        `;

        const expandIndicator = document.createElement('span');
        expandIndicator.className = 'expand-indicator';
        expandIndicator.textContent = '▼';

        header.appendChild(headerInfo);
        header.appendChild(expandIndicator);

        const details = document.createElement('div');
        details.className = 'submission-details';
        details.innerHTML = createDetailsHTML(submission);

        card.appendChild(header);
        card.appendChild(details);

        // Toggle expand/collapse on click
        header.addEventListener('click', () => {
            card.classList.toggle('expanded');
        });

        return card;
    }

    /**
     * Create HTML for submission details
     */
    function createDetailsHTML(submission) {
        const fields = [
            { label: 'Project Overview', value: submission.project_overview },
            { label: 'Administrative Information', value: submission.administrative_info },
            { label: 'Timeline', value: submission.timeline },
            { label: 'Technical Requirements', value: submission.technical_requirements },
            { label: 'User Accounts', value: submission.user_accounts },
            { label: 'Additional Notes', value: submission.notes },
            { label: 'Attachments', value: submission.attachments }
        ];

        return fields.map(field => {
            const value = field.value || '';
            const isEmpty = !value.trim();
            const valueClass = isEmpty ? 'detail-value empty' : 'detail-value';
            const displayValue = isEmpty ? '(Not provided)' : escapeHtml(value);

            return `
                <div class="detail-section">
                    <span class="detail-label">${field.label}:</span>
                    <div class="${valueClass}">${displayValue}</div>
                </div>
            `;
        }).join('');
    }

    /**
     * Escape HTML to prevent XSS
     */
    function escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }

    /**
     * Show error message
     */
    function showError(message) {
        errorMsg.textContent = message;
        errorMsg.classList.remove('hidden');
    }

    /**
     * Hide error message
     */
    function hideError() {
        errorMsg.classList.add('hidden');
    }

    /**
     * Load submissions from API
     */
    async function loadSubmissions() {
        hideError();
        loadingMsg.classList.remove('hidden');
        noDataMsg.classList.add('hidden');
        submissionsList.classList.add('hidden');
        submissionsList.innerHTML = '';

        try {
            const response = await fetch(`${API_BASE}/submissions?limit=100`);

            if (!response.ok) {
                throw new Error(`HTTP ${response.status}: ${response.statusText}`);
            }

            const data = await response.json();
            const submissions = data.submissions || [];

            loadingMsg.classList.add('hidden');

            if (submissions.length === 0) {
                noDataMsg.classList.remove('hidden');
            } else {
                submissions.forEach(submission => {
                    const card = createSubmissionCard(submission);
                    submissionsList.appendChild(card);
                });
                submissionsList.classList.remove('hidden');
            }
        } catch (error) {
            loadingMsg.classList.add('hidden');
            showError(
                `Failed to load submissions: ${error.message}. Please try again.`
            );
            console.error('Error loading submissions:', error);
        }
    }

    /**
     * Load specific submission by ID
     */
    async function loadSubmission(id) {
        try {
            const response = await fetch(`${API_BASE}/submissions/${id}`);

            if (!response.ok) {
                if (response.status === 404) {
                    throw new Error('Submission not found');
                }
                throw new Error(`HTTP ${response.status}: ${response.statusText}`);
            }

            return await response.json();
        } catch (error) {
            showError(`Failed to load submission: ${error.message}`);
            console.error('Error loading submission:', error);
            return null;
        }
    }

    // Event listeners
    refreshBtn.addEventListener('click', () => {
        loadSubmissions();
    });

    // Load submissions on page load
    loadSubmissions();
})();
