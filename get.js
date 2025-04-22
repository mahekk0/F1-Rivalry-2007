document.addEventListener('DOMContentLoaded', function () {
    // Smooth scroll for navigation links
    document.querySelectorAll('nav a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();

            const targetId = this.getAttribute('href');
            const targetElement = document.querySelector(targetId);

            if (targetElement) {
                window.scrollTo({
                    top: targetElement.offsetTop,
                    behavior: 'smooth'
                });
            }
        });
    });

    // Initialize typed.js
    var typed = new Typed('#element', {
        strings: ['1 Team', '1 title', '2 world champions'],
        typeSpeed: 50,
    });

    // Scroll fade effect
    window.addEventListener('scroll', () => {
        const image = document.querySelector('.scroll-fade-image');
        const maxScroll = window.innerHeight;
        const scrollY = window.scrollY;
        let opacity = 1 - (scrollY / maxScroll);
        image.style.opacity = opacity < 0 ? 0 : opacity;
    });

    // F1 Race Results functionality
    const yearSelect = document.getElementById('year-select');
    const trackSelect = document.getElementById('track-select');
    const getResultsBtn = document.getElementById('get-results');
    const resultsContainer = document.getElementById('results-container');
    const loadingSpinner = document.getElementById('loading');
    const raceTitle = document.getElementById('race-title');

    // Hide loading spinner initially
    loadingSpinner.style.display = 'none';

    // Populate year dropdown (from 1950 to current year)
    const currentYear = new Date().getFullYear();
    for (let year = currentYear; year >= 1950; year--) {
        const option = document.createElement('option');
        option.value = year;
        option.textContent = year;
        yearSelect.appendChild(option);
    }

    // Event listener for year selection
    yearSelect.addEventListener('change', async function () {
        if (this.value) {
            trackSelect.innerHTML = '<option value="">Loading tracks...</option>';
            trackSelect.disabled = true;

            try {
                const tracks = await getTracksForYear(this.value);
                populateTrackDropdown(tracks);
                trackSelect.disabled = false;
            } catch (error) {
                console.error('Error fetching tracks:', error);
                trackSelect.innerHTML = '<option value="">Error loading tracks</option>';
            }
        } else {
            trackSelect.innerHTML = '<option value="">First select a year</option>';
            trackSelect.disabled = true;
        }
    });

    // Event listener for get results button
    getResultsBtn.addEventListener('click', async function () {
        const year = yearSelect.value;
        const round = trackSelect.value;

        if (!year || !round) {
            alert('Please select both a year and a track');
            return;
        }

        // Show loading spinner
        loadingSpinner.style.display = 'flex';
        resultsContainer.innerHTML = '';

        try {
            const raceResults = await getRaceResults(year, round);
            displayRaceResults(raceResults);
        } catch (error) {
            console.error('Error fetching race results:', error);
            resultsContainer.innerHTML = '<p class="error">Sorry, there was an error fetching the race results. Please try again.</p>';
        } finally {
            // Hide loading spinner
            loadingSpinner.style.display = 'none';
        }
    });

    // Function to get tracks for a specific year
    async function getTracksForYear(year) {
        const response = await fetch(`https://ergast.com/api/f1/${year}.json`);
        if (!response.ok) {
            throw new Error('Failed to fetch tracks');
        }

        const data = await response.json();
        return data.MRData.RaceTable.Races;
    }

    // Function to populate track dropdown
    function populateTrackDropdown(tracks) {
        trackSelect.innerHTML = '<option value="">Select a track</option>';

        tracks.forEach(race => {
            const option = document.createElement('option');
            option.value = race.round;
            option.textContent = race.raceName;
            trackSelect.appendChild(option);
        });
    }

    // Function to get race results
    async function getRaceResults(year, round) {
        const response = await fetch(`https://ergast.com/api/f1/${year}/${round}/results.json`);
        if (!response.ok) {
            throw new Error('Failed to fetch race results');
        }

        const data = await response.json();
        return data.MRData.RaceTable.Races[0];
    }

    // Function to display race results
    function displayRaceResults(raceData) {
        if (!raceData || !raceData.Results) {
            resultsContainer.innerHTML = '<p>No results found for this race.</p>';
            return;
        }

        // Update race title
        raceTitle.textContent = `${raceData.season} ${raceData.raceName} Results`;

        // Create results table
        const table = document.createElement('table');
        table.className = 'results-table';

        // Create table header
        const thead = document.createElement('thead');
        const headerRow = document.createElement('tr');
        ['Pos', 'Driver', 'Constructor', 'Time/Status', 'Points'].forEach(headerText => {
            const th = document.createElement('th');
            th.textContent = headerText;
            headerRow.appendChild(th);
        });
        thead.appendChild(headerRow);
        table.appendChild(thead);

        // Create table body
        const tbody = document.createElement('tbody');

        raceData.Results.forEach(result => {
            const row = document.createElement('tr');

            // Position
            const posCell = document.createElement('td');
            posCell.textContent = result.position;
            row.appendChild(posCell);

            // Driver
            const driverCell = document.createElement('td');
            driverCell.textContent = `${result.Driver.givenName} ${result.Driver.familyName}`;
            row.appendChild(driverCell);

            // Constructor
            const constructorCell = document.createElement('td');
            constructorCell.textContent = result.Constructor.name;
            row.appendChild(constructorCell);

            // Time/Status
            const timeCell = document.createElement('td');
            if (result.Time) {
                timeCell.textContent = result.Time.time;
            } else {
                timeCell.textContent = result.status;
            }
            row.appendChild(timeCell);

            // Points
            const pointsCell = document.createElement('td');
            pointsCell.textContent = result.points;
            row.appendChild(pointsCell);

            tbody.appendChild(row);
        });

        table.appendChild(tbody);
        resultsContainer.appendChild(table);

        // Add race info
        const raceInfo = document.createElement('div');
        raceInfo.className = 'race-info';
        raceInfo.innerHTML = `
            <p><strong>Circuit:</strong> ${raceData.Circuit.circuitName}</p>
            <p><strong>Date:</strong> ${raceData.date}</p>
            <p><strong>Location:</strong> ${raceData.Circuit.Location.locality}, ${raceData.Circuit.Location.country}</p>
        `;
        resultsContainer.appendChild(raceInfo);

        // After adding all content, scroll to ensure visibility
        setTimeout(scrollToResults, 100); // Small delay to ensure DOM update
    }

    // Function to scroll to race results after they load
    function scrollToResults() {
        // Get the results container element
        const resultsContainer = document.getElementById('results-container');

        // Scroll the container to the top
        resultsContainer.scrollTop = 0;
    }

    // Add drivers stat comparison functionality
    // This could be expanded in the future to compare Hamilton vs Alonso stats
    function addDriversComparisonListener() {
        const driverBoxes = document.querySelectorAll('.driver-box');

        driverBoxes.forEach(box => {
            box.addEventListener('click', function () {
                // Add subtle highlight effect when clicked
                this.style.boxShadow = '0 0 30px rgba(255, 255, 255, 0.3)';

                // Reset after animation
                setTimeout(() => {
                    this.style.boxShadow = '';
                }, 500);
            });
        });
    }

    // Initialize drivers comparison functionality
    addDriversComparisonListener();

    // Handle page visibility for performance
    document.addEventListener('visibilitychange', function () {
        if (document.hidden) {
            // Pause animations or heavy operations when tab is not visible
            if (typed) {
                typed.stop();
            }
        } else {
            // Resume animations when tab becomes visible again
            if (typed) {
                typed.start();
            }
        }
    });

    // Enhance hero section with parallax effect
    function enhanceHeroSection() {
        const heroSection = document.querySelector('.hero-section');

        window.addEventListener('scroll', () => {
            const scrollPosition = window.scrollY;
            if (heroSection) {
                // Create parallax effect by moving the background slightly slower than scroll
                heroSection.style.backgroundPositionY = `${scrollPosition * 0.3}px`;
            }
        });
    }

    // Initialize enhanced hero section
    enhanceHeroSection();
});