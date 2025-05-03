document.addEventListener('DOMContentLoaded', function() {
    const searchBtn = document.getElementById('searchBtn');
    const randomBtn = document.getElementById('randomBtn');
    const languageSelect = document.getElementById('languageSelect');
    const sortSelect = document.getElementById('sortSelect');
    const showStars = document.getElementById('showStars');
    const resultsDiv = document.getElementById('results');
    const loadingDiv = document.getElementById('loading');
    const noResultsDiv = document.getElementById('noResults');

    // Event listeners
    searchBtn.addEventListener('click', searchRepositories);
    randomBtn.addEventListener('click', getRandomRepositories);

    // Initial load - get random repositories
    getRandomRepositories();

    // Search repositories by selected language
    function searchRepositories() {
        const language = languageSelect.value;
        const sort = sortSelect.value;
        const order = sort === 'updated' ? 'desc' : 'desc'; // Always desc for updated, stars, forks

        showLoading(true);
        resultsDiv.innerHTML = '';

        let query = 'stars:>10';
        if (language) {
            query += ` language:${language}`;
        }

        const url = `https://api.github.com/search/repositories?q=${encodeURIComponent(query)}&sort=${sort}&order=${order}&per_page=9`;

        fetch(url)
            .then(response => {
                if (!response.ok) {
                    throw new Error('GitHub API rate limit exceeded or error occurred');
                }
                return response.json();
            })
            .then(data => {
                showLoading(false);
                if (data.items && data.items.length > 0) {
                    displayRepositories(data.items);
                } else {
                    showNoResults(true);
                }
            })
            .catch(error => {
                showLoading(false);
                showNoResults(true);
                console.error('Error:', error);
            });
    }

    // Get random repositories (still filtered by language if selected)
    function getRandomRepositories() {
        const language = languageSelect.value;
        showLoading(true);
        resultsDiv.innerHTML = '';

        // Generate a random date within the last year to get "random" repositories
        const randomDate = new Date();
        randomDate.setDate(randomDate.getDate() - Math.floor(Math.random() * 365));
        const formattedDate = randomDate.toISOString().split('T')[0];

        let query = `created:>${formattedDate}`;
        if (language) {
            query += ` language:${language}`;
        }

        const url = `https://api.github.com/search/repositories?q=${encodeURIComponent(query)}&sort=stars&order=desc&per_page=9`;

        fetch(url)
            .then(response => {
                if (!response.ok) {
                    throw new Error('GitHub API rate limit exceeded or error occurred');
                }
                return response.json();
            })
            .then(data => {
                showLoading(false);
                if (data.items && data.items.length > 0) {
                    displayRepositories(data.items);
                } else {
                    showNoResults(true);
                }
            })
            .catch(error => {
                showLoading(false);
                showNoResults(true);
                console.error('Error:', error);
            });
    }

    // Display repositories
    function displayRepositories(repositories) {
        showNoResults(false);
        resultsDiv.innerHTML = '';

        repositories.forEach(repo => {
            const repoCard = document.createElement('div');
            repoCard.className = 'col-md-4 mb-4';

            const description = repo.description ? 
                (repo.description.length > 100 ? 
                    repo.description.substring(0, 100) + '...' : 
                    repo.description) : 
                'No description provided';

            const starsVisible = showStars.checked ? '' : 'd-none';
            const language = repo.language || 'Unknown';

            repoCard.innerHTML = `
                <div class="card repository-card h-100">
                    <div class="card-body">
                        <h5 class="card-title">
                            <a href="${repo.html_url}" target="_blank">${repo.full_name}</a>
                        </h5>
                        <p class="card-text">${description}</p>
                        <div class="mt-auto">
                            <span class="language">${language}</span>
                            <span class="stars-badge float-end ${starsVisible}">
                                <i class="fas fa-star star-icon"></i> ${repo.stargazers_count.toLocaleString()}
                            </span>
                            <span class="forks-badge float-end me-2 ${starsVisible}">
                                <i class="fas fa-code-branch"></i> ${repo.forks_count.toLocaleString()}
                            </span>
                        </div>
                    </div>
                </div>
            `;

            resultsDiv.appendChild(repoCard);
        });
    }

    // Toggle loading state
    function showLoading(show) {
        if (show) {
            loadingDiv.classList.remove('d-none');
            noResultsDiv.classList.add('d-none');
        } else {
            loadingDiv.classList.add('d-none');
        }
    }

    // Toggle no results message
    function showNoResults(show) {
        if (show) {
            noResultsDiv.classList.remove('d-none');
        } else {
            noResultsDiv.classList.add('d-none');
        }
    }

    // Toggle star visibility
    showStars.addEventListener('change', function() {
        const starBadges = document.querySelectorAll('.stars-badge, .forks-badge');
        starBadges.forEach(badge => {
            if (showStars.checked) {
                badge.classList.remove('d-none');
            } else {
                badge.classList.add('d-none');
            }
        });
    });
});