const jobListingsContainer = document.getElementById('jobListings');
const filterBarContainer = document.getElementById('filterBarContainer');
const filterTagsList = document.getElementById('filterTagsList');
const clearFiltersBtn = document.getElementById('clearFiltersBtn');

let allJobs = []; // Stores the original, unfiltered list of jobs
let activeFilters = []; // Stores the tags currently selected as filters

function renderFilterBar() {
    filterTagsList.innerHTML = ''; // Clear existing filter tags

    if (activeFilters.length === 0) {
        filterBarContainer.classList.remove('active'); // Hide filter bar if no active filters
    } else {
        filterBarContainer.classList.add('active'); // Show filter bar
        activeFilters.forEach(filterTag => {
            const filterItem = document.createElement('div');
            filterItem.classList.add('filter-tag-item');
            filterItem.innerHTML = `
                <span class="filter-tag-text">${filterTag}</span>
                <button class="remove-filter-btn" data-filter="${filterTag}">X</button>
            `;
            filterTagsList.appendChild(filterItem);
        });
    }

    // Attach event listeners to the new 'X' buttons
    document.querySelectorAll('.remove-filter-btn').forEach(button => {
        button.addEventListener('click', handleRemoveFilter);
    });
}

/**
 * Filters the job listings based on the active filters and renders them.
 */
function filterAndRenderJobs() {
    let filteredJobs = allJobs;

    if (activeFilters.length > 0) {
        filteredJobs = allJobs.filter(job => {
            // Combine all relevant tags for the job into a single array
            const jobTags = [job.role, job.level, ...job.languages, ...job.tools];

            // Check if ALL active filters are present in the job's tags
            return activeFilters.every(filter => jobTags.includes(filter));
        });
    }

    // Render the filtered jobs
    jobListingsContainer.innerHTML = ''; // Clear existing job cards
    filteredJobs.forEach(job => {
        const jobCard = document.createElement('div');
        jobCard.classList.add('job-card');

        if (job.featured) {
            jobCard.classList.add('job-card-featured');
        }

        jobCard.innerHTML = `
            <div class="job-card-left">
                <img src="${job.logo}" alt="${job.company} logo" class="company-logo">
                <div class="job-details">
                    <div class="company-info">
                        <span class="company-name">${job.company}</span>
                        ${job.new ? '<span class="tag new-tag">NEW!</span>' : ''}
                        ${job.featured ? '<span class="tag featured-tag">FEATURED</span>' : ''}
                    </div>
                    <h2 class="job-position">${job.position}</h2>
                    <div class="job-meta">
                        <span>${job.postedAt}</span>
                        <span>&bull;</span>
                        <span>${job.contract}</span>
                        <span>&bull;</span>
                        <span>${job.location}</span>
                    </div>
                </div>
            </div>
            <div class="job-card-right">
                <div class="job-tags">
                    <span class="job-tag" data-tag="${job.role}">${job.role}</span>
                    <span class="job-tag" data-tag="${job.level}">${job.level}</span>
                    ${job.languages.map(lang => `<span class="job-tag" data-tag="${lang}">${lang}</span>`).join('')}
                    ${job.tools.map(tool => `<span class="job-tag" data-tag="${tool}">${tool}</span>`).join('')}
                </div>
            </div>
        `;
        jobListingsContainer.appendChild(jobCard);
    });

    // Re-attach event listeners to all job tags in the newly rendered cards
    document.querySelectorAll('.job-tag').forEach(tag => {
        tag.addEventListener('click', handleJobTagClick);
    });
}

/**
 * Adds a filter tag to the active filters list.
 * @param {string} tag - The tag to add.
 */
function addFilter(tag) {
    if (!activeFilters.includes(tag)) {
        activeFilters.push(tag);
        renderFilterBar();
        filterAndRenderJobs();
    }
}

/**
 * Removes a filter tag from the active filters list.
 * @param {string} tag - The tag to remove.
 */
function removeFilter(tag) {
    activeFilters = activeFilters.filter(filter => filter !== tag);
    renderFilterBar();
    filterAndRenderJobs();
}

/**
 * Clears all active filters.
 */
function clearAllFilters() {
    activeFilters = [];
    renderFilterBar();
    filterAndRenderJobs();
}

// --- Event Handlers ---

/**
 * Handles clicks on job tags within the job cards.
 * @param {Event} event - The click event object.
 */
function handleJobTagClick(event) {
    const clickedTag = event.currentTarget.dataset.tag;
    addFilter(clickedTag);
}

/**
 * Handles clicks on the 'X' button in the filter bar to remove a filter.
 * @param {Event} event - The click event object.
 */
function handleRemoveFilter(event) {
    const filterToRemove = event.currentTarget.dataset.filter;
    removeFilter(filterToRemove);
}

/**
 * Handles clicks on the "Clear" button in the filter bar.
 */
function handleClearFiltersClick() {
    clearAllFilters();
}

// --- Initial Setup ---

/**
 * Fetches job data from a JSON file, stores it, and renders initial listings.
 */
async function initializeJobs() {
    try {
        const response = await fetch('jobs.json'); // Path to your JSON file
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        allJobs = await response.json(); // Store all jobs

        // Initial render of jobs and filter bar
        filterAndRenderJobs(); // Render all jobs initially
        renderFilterBar(); // Render empty filter bar
    } catch (error) {
        console.error('Error fetching or rendering jobs:', error);
        jobListingsContainer.innerHTML = '<p>Failed to load job listings. Please try again later.</p>';
    }
}

// Attach event listener for the "Clear" button
clearFiltersBtn.addEventListener('click', handleClearFiltersClick);

// Call the function to initialize jobs when the page loads
document.addEventListener('DOMContentLoaded', initializeJobs);
