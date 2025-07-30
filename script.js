// --- GENERELL INITIALISERING ---
const swiper = new Swiper('.swiper', { pagination: { el: '.swiper-pagination', clickable: true }, keyboard: { enabled: true } });
// VIKTIG: Sett inn IP-adressen til din Home Assistant her
const HA_IP_ADDRESS = "192.168.1.138"; // Bytt ut med din faktiske IP-adresse

// --- SCRIPT FOR KALENDER (Listeversjon) ---
const dateScroller = document.getElementById('date-scroller');
const eventsContainer = document.getElementById('events-container');
const monthNameEl = document.getElementById('month-name');
const CALENDAR_API_URL = `http://${HA_IP_ADDRESS}:5001/events`;

async function fetchCalendar() {
    try {
        const response = await fetch(CALENDAR_API_URL);
        if (!response.ok) throw new Error(`Klarte ikke hente kalender: ${response.statusText}`);
        const allEvents = await response.json();
        
        renderDateScroller();
        renderUpcomingEventsList(allEvents);
        updateMonthHeader();

    } catch (error) {
        console.error("Feil ved henting av hendelser:", error);
        if(eventsContainer) eventsContainer.innerHTML = `<div class="text-center text-gray-400 p-4">Kunne ikke laste kalenderdata.</div>`;
    }
}
function updateMonthHeader() { 
    if(monthNameEl) monthNameEl.textContent = new Date().toLocaleDateString('no-NO', { month: 'long' }).toUpperCase(); 
}
function renderDateScroller() {
    if(!dateScroller) return;
    dateScroller.innerHTML = '';
    const today = new Date();
    const todayDateString = today.toISOString().split('T')[0];
    for (let i = 0; i < 14; i++) {
        const date = new Date();
        date.setDate(today.getDate() + i);
        const btn = document.createElement('button');
        btn.className = `date-btn flex-shrink-0 flex flex-col items-center p-3 rounded-lg ${date.toISOString().split('T')[0] === todayDateString ? 'active' : ''}`;
        btn.innerHTML = `<span class="text-2xl font-bold">${date.getDate()}</span><span class="text-xs font-semibold text-gray-400">${date.toLocaleDateString('no-NO', { weekday: 'short' }).toUpperCase()}</span>`;
        dateScroller.appendChild(btn);
    }
}
function renderUpcomingEventsList(allEvents) {
    if(!eventsContainer) return;
    const upcomingEvents = allEvents.slice(0, 7);
    
    if (upcomingEvents.length > 0) {
        let html = '<div class="space-y-4">';
        upcomingEvents.forEach(event => {
            const eventDate = new Date(event.start);
            const dateDisplay = eventDate.toLocaleDateString('no-NO', { weekday: 'short', day: 'numeric', month: 'short' });
            const timeString = eventDate.toLocaleTimeString('no-NO', { hour: '2-digit', minute: '2-digit' });
            
            const email = event.organizer_email || '';
            let ownerInitial = '';
            if (email === 'ida-jonber@hotmail.com') ownerInitial = 'I: ';
            if (email === 'cornikase@gmail.com') ownerInitial = 'C: ';

            html += `
                <div class="flex items-center space-x-4">
                    <div class="w-24 text-right font-semibold text-gray-300">
                        <p>${dateDisplay}</p>
                        <p class="text-xs">${timeString}</p>
                    </div>
                    <div class="flex-shrink-0 w-2 h-10 ${event.farge} rounded-full"></div>
                    <div class="flex-grow">
                        <p class="font-bold text-white">${ownerInitial}${event.oppsummering}</p>
                    </div>
                </div>
            `;
        });
        eventsContainer.innerHTML = html + '</div>';
    } else {
        eventsContainer.innerHTML = `<div class="text-center text-gray-400 p-8">Ingen kommende hendelser funnet.</div>`;
    }
}

// --- SCRIPTS FOR BUSS OG VÆR ---
(function() {
    const departuresList = document.getElementById('departures-list');
    const clockElement = document.getElementById('clock');
    const mainWeatherDisplay = document.getElementById('main-weather-display');
    const forecastDetails = document.getElementById('forecast-details');
    const hourlyBtn = document.getElementById('hourly-btn');
    const dailyBtn = document.getElementById('daily-btn');
    let fullForecast = [];
    const STOP_PLACE_ID = "NSR:StopPlace:6372", BUS_API_URL = "https://api.entur.io/journey-planner/v3/graphql", CLIENT_NAME = "ditt-prosjekt-hjemmestasjon";
    
    async function fetchDepartures() {
        const query = `{ stopPlace(id: "${STOP_PLACE_ID}") { name estimatedCalls(timeRange: 7200, numberOfDepartures: 20) { realtime expectedDepartureTime destinationDisplay { frontText } serviceJourney { journeyPattern { line { publicCode transportMode } } } } } }`;
        try {
            const response = await fetch(BUS_API_URL, { method: 'POST', headers: { 'Content-Type': 'application/json', 'ET-Client-Name': CLIENT_NAME }, body: JSON.stringify({ query }) });
            if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
            const data = await response.json(); updateBusDisplay(data.data.stopPlace.estimatedCalls);
        } catch (error) { console.error("Could not fetch departures:", error); }
    }
    function updateBusDisplay(departures) {
        if(!departuresList) return; departuresList.innerHTML = '';
        const filteredDepartures = departures.filter(call => { const lineCode = call.serviceJourney.journeyPattern.line.publicCode, destination = call.destinationDisplay.frontText; return (lineCode === '54' && destination === 'Kværnerbyen') || (lineCode === '37' && destination === 'Helsfyr'); });
        if (!filteredDepartures || filteredDepartures.length === 0) { departuresList.innerHTML = `<div class="text-center text-gray-400 p-8">Ingen avganger funnet.</div>`; return; }
        const departuresToShow = filteredDepartures.slice(0, 3);
        departuresToShow.forEach(call => {
            const departureTime = new Date(call.expectedDepartureTime), diffMinutes = Math.round((departureTime - new Date()) / 60000);
            let timeText = diffMinutes <= 0 ? "Nå" : (diffMinutes < 15 ? `${diffMinutes} min` : departureTime.toLocaleTimeString('no-NO', { hour: '2-digit', minute: '2-digit' }));
            const line = call.serviceJourney.journeyPattern.line, departureElement = document.createElement('div');
            departureElement.className = "flex items-center justify-between bg-gray-700 p-4 rounded-lg";
            departureElement.innerHTML = `<div class="flex items-center space-x-4"><span class="line-box bg-red-600 text-white font-bold text-xl p-2 rounded-md">${line.publicCode}</span><span class="text-xl font-medium">${call.destinationDisplay.frontText}</span></div><div class="text-xl font-bold text-right">${timeText}</div>`;
            departuresList.appendChild(departureElement);
        });
    }
    function updateClock() { if(clockElement) clockElement.textContent = new Date().toLocaleTimeString('no-NO', { hour: '2-digit', minute: '2-digit', second: '2-digit' }); }

    async function fetchWeather() {
        try {
            // VIKTIG: Sett inn din Long-Lived Access Token her
            const HA_TOKEN = "LIM-INN-DIN-TOKEN-HER";
            const ENTITY_ID = "sensor.vaerdata_fra_met";
            const response = await fetch(`/api/states/${ENTITY_ID}`, { headers: { 'Authorization': `Bearer ${HA_TOKEN}` } });
            if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
            const data = await response.json();
            fullForecast = data.attributes.timeseries;
            if (fullForecast && fullForecast.length > 0) {
                updateMainWeatherDisplay(data.state, fullForecast[0].data.next_1_hours.summary.symbol_code);
                displayHourlyForecast();
            }
        } catch (error) { console.error("Could not fetch weather data from Home Assistant:", error); if(mainWeatherDisplay) mainWeatherDisplay.innerHTML = `<div class="text-center text-red-400 p-4">Kunne ikke hente værdata.</div>`; }
    }
    function updateMainWeatherDisplay(temperature, symbolCode) {
        if(!mainWeatherDisplay) return;
        const condition = symbolCode.split('_')[0];
        mainWeatherDisplay.innerHTML = `<h1 class="text-3xl font-bold text-white">Været i Oslo</h1><p class="text-lg text-gray-300 mb-4">${condition.charAt(0).toUpperCase() + condition.slice(1)}</p><div class="flex items-center justify-center w-full"><img src="https://api.met.no/images/weathericons/svg/${symbolCode}.svg" alt="${condition}" class="w-28 h-28"><span class="text-7xl md:text-8xl font-bold">${Math.round(temperature)}<span class="text-5xl align-top">&deg;C</span></span></div>`;
    }
    function displayHourlyForecast() {
        if(!forecastDetails || !fullForecast || fullForecast.length === 0) return;
        const next6Hours = fullForecast.slice(0, 6);
        let content = '<div class="flex justify-between space-x-2 text-center">';
        next6Hours.forEach(item => {
            const time = new Date(item.time).getHours(), symbolCode = item.data.next_1_hours.summary.symbol_code, temperature = Math.round(item.data.instant.details.air_temperature);
            content += `<div class="flex flex-col items-center p-2 bg-gray-700 rounded-lg w-1/6"><span class="font-bold text-sm">${String(time).padStart(2, '0')}:00</span><img src="https://api.met.no/images/weathericons/svg/${symbolCode}.svg" class="w-12 h-12 my-1"><span class="font-semibold text-lg">${temperature}&deg;</span></div>`;
        });
        forecastDetails.innerHTML = content + '</div>';
    }
    function displayDailyForecast() {
        if(!forecastDetails || !fullForecast || fullForecast.length === 0) return;
        const dailyData = {};
        fullForecast.forEach(item => {
            const date = item.time.split('T')[0];
            if (!dailyData[date]) dailyData[date] = { temps: [], symbols: {} };
            dailyData[date].temps.push(item.data.instant.details.air_temperature);
            const symbol = (item.data.next_1_hours || item.data.next_6_hours || item.data.next_12_hours)?.summary.symbol_code || 'default';
            if(symbol) dailyData[date].symbols[symbol] = (dailyData[date].symbols[symbol] || 0) + 1;
        });
        let content = '<div class="space-y-3">';
        Object.keys(dailyData).slice(0, 5).forEach(date => {
            const dayInfo = dailyData[date], minTemp = Math.round(Math.min(...dayInfo.temps)), maxTemp = Math.round(Math.max(...dayInfo.temps));
            const mostCommonSymbol = Object.keys(dayInfo.symbols).length > 0 ? Object.keys(dayInfo.symbols).reduce((a, b) => dayInfo.symbols[a] > dayInfo.symbols[b] ? a : b) : 'default';
            const dayName = new Date(date).toLocaleDateString('no-NO', { weekday: 'long' });
            content += `<div class="flex items-center justify-between bg-gray-700 p-3 rounded-lg"><span class="font-bold w-1/3">${dayName.charAt(0).toUpperCase() + dayName.slice(1)}</span><img src="https://api.met.no/images/weathericons/svg/${mostCommonSymbol}.svg" class="w-10 h-10"><div class="w-1/3 text-right"><span class="font-semibold">${maxTemp}&deg;</span><span class="text-gray-400 ml-2">${minTemp}&deg;</span></div></div>`;
        });
        forecastDetails.innerHTML = content + '</div>';
    }
    if(hourlyBtn) hourlyBtn.addEventListener('click', () => { hourlyBtn.classList.add('btn-active'); dailyBtn.classList.remove('btn-active'); displayHourlyForecast(); });
    if(dailyBtn) dailyBtn.addEventListener('click', () => { dailyBtn.classList.add('btn-active'); hourlyBtn.classList.remove('btn-active'); displayDailyForecast(); });

    // KJØR MODULER
    fetchCalendar(); setInterval(fetchCalendar, 900000);
    if (document.getElementById('departures-list')) { fetchDepartures(); updateClock(); setInterval(fetchDepartures, 30000); setInterval(updateClock, 1000); }
    if (document.getElementById('main-weather-display')) { fetchWeather(); setInterval(fetchWeather, 900000); }
})();
