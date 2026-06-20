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

    // Typed.js animation
    const typed = new Typed('#element', {
        strings: ['1 Team', '1 title', '2 world champions'],
        typeSpeed: 50,
        loop: true
    });

    // Scroll fade effect
    window.addEventListener('scroll', () => {
        const image = document.querySelector('.scroll-fade-image');

        if (image) {
            const maxScroll = window.innerHeight;
            const scrollY = window.scrollY;
            let opacity = 1 - (scrollY / maxScroll);

            image.style.opacity = opacity < 0 ? 0 : opacity;
        }
    });

    // DOM Elements
    const yearSelect = document.getElementById('year-select');
    const trackSelect = document.getElementById('track-select');
    const getResultsBtn = document.getElementById('get-results');
    const resultsContainer = document.getElementById('results-container');
    const loadingSpinner = document.getElementById('loading');
    const raceTitle = document.getElementById('race-title');

    // Hide spinner initially
    loadingSpinner.style.display = 'none';

    // Populate years
    const currentYear = new Date().getFullYear();

    for (let year = currentYear; year >= 1950; year--) {
        const option = document.createElement('option');
        option.value = year;
        option.textContent = year;
        yearSelect.appendChild(option);
    }

    // Year selection event
    yearSelect.addEventListener('change', async function () {

        const year = this.value;

        if (!year) {
            trackSelect.innerHTML =
                '<option value="">First select a year</option>';
            trackSelect.disabled = true;
            return;
        }

        trackSelect.innerHTML =
            '<option value="">Loading races...</option>';

        trackSelect.disabled = true;

        try {
            const races = await getTracksForYear(year);

            populateTrackDropdown(races);

            trackSelect.disabled = false;

        } catch (error) {

            console.error(error);

            trackSelect.innerHTML =
                '<option value="">Failed to load races</option>';
        }
    });

    // Get Results button
    getResultsBtn.addEventListener('click', async () => {

        const year = yearSelect.value;
        const round = trackSelect.value;

        if (!year || !round) {
            alert('Please select both a year and a track.');
            return;
        }

        loadingSpinner.style.display = 'flex';
        resultsContainer.innerHTML = '';

        try {

            const raceData = await getRaceResults(year, round);

            displayRaceResults(raceData);

        } catch (error) {

            console.error(error);

            resultsContainer.innerHTML =
                `<p class="error">
                    Failed to fetch race results.
                </p>`;

        } finally {

            loadingSpinner.style.display = 'none';
        }
    });

    // Get races for selected year
    async function getTracksForYear(year) {

        const response = await fetch(
            `https://api.jolpi.ca/ergast/f1/${year}.json`
        );

        if (!response.ok) {
            throw new Error(`HTTP Error ${response.status}`);
        }

        const data = await response.json();

        return data.MRData.RaceTable.Races;
    }

    // Populate race dropdown
    function populateTrackDropdown(races) {

        trackSelect.innerHTML =
            '<option value="">Select a race</option>';

        races.forEach(race => {

            const option = document.createElement('option');

            option.value = race.round;
            option.textContent = race.raceName;

            trackSelect.appendChild(option);
        });
    }

    // Get race results
    async function getRaceResults(year, round) {

        const response = await fetch(
            `https://api.jolpi.ca/ergast/f1/${year}/${round}/results.json`
        );

        if (!response.ok) {
            throw new Error(`HTTP Error ${response.status}`);
        }

        const data = await response.json();

        return data.MRData.RaceTable.Races[0];
    }

    // Display race results
    function displayRaceResults(raceData) {

        if (!raceData || !raceData.Results) {

            resultsContainer.innerHTML =
                '<p>No results found.</p>';

            return;
        }

        raceTitle.textContent =
            `${raceData.season} ${raceData.raceName} Results`;

        const table = document.createElement('table');
        table.className = 'results-table';

        table.innerHTML = `
            <thead>
                <tr>
                    <th>Pos</th>
                    <th>Driver</th>
                    <th>Constructor</th>
                    <th>Time / Status</th>
                    <th>Points</th>
                </tr>
            </thead>
        `;

        const tbody = document.createElement('tbody');

        raceData.Results.forEach(result => {

            const row = document.createElement('tr');

            row.innerHTML = `
                <td>${result.position}</td>
                <td>
                    ${result.Driver.givenName}
                    ${result.Driver.familyName}
                </td>
                <td>${result.Constructor.name}</td>
                <td>
                    ${result.Time
                        ? result.Time.time
                        : result.status}
                </td>
                <td>${result.points}</td>
            `;

            tbody.appendChild(row);
        });

        table.appendChild(tbody);

        resultsContainer.appendChild(table);

        const raceInfo = document.createElement('div');

        raceInfo.className = 'race-info';

        raceInfo.innerHTML = `
            <p>
                <strong>Circuit:</strong>
                ${raceData.Circuit.circuitName}
            </p>

            <p>
                <strong>Date:</strong>
                ${raceData.date}
            </p>

            <p>
                <strong>Location:</strong>
                ${raceData.Circuit.Location.locality},
                ${raceData.Circuit.Location.country}
            </p>
        `;

        resultsContainer.appendChild(raceInfo);
    }

    // Driver box click effect
    document.querySelectorAll('.driver-box').forEach(box => {

        box.addEventListener('click', function () {

            this.style.boxShadow =
                '0 0 30px rgba(255,255,255,0.4)';

            setTimeout(() => {
                this.style.boxShadow = '';
            }, 500);
        });
    });

    // Pause typed animation when tab hidden
    document.addEventListener('visibilitychange', () => {

        if (document.hidden) {
            typed.stop();
        } else {
            typed.start();
        }
    });

    // Hero parallax effect
    const heroSection =
        document.querySelector('.hero-section');

    if (heroSection) {

        window.addEventListener('scroll', () => {

            heroSection.style.backgroundPositionY =
                `${window.scrollY * 0.3}px`;
        });
    }
});
