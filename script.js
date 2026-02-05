const API_BASE = 'http://192.168.1.138:5001';

// --- SWIPER ---
const swiper = new Swiper('.main-swiper', {
    pagination: { el: '.swiper-pagination', clickable: true },
    keyboard: { enabled: true },
    mousewheel: true
});

document.querySelectorAll('[data-goto]').forEach(card => {
    card.addEventListener('click', () => {
        swiper.slideTo(parseInt(card.dataset.goto) - 1);
    });
});

// --- KLOKKE ---
function updateClock() {
    const now = new Date();
    document.getElementById('clock').textContent = now.toLocaleTimeString('no-NO', { 
        hour: '2-digit', 
        minute: '2-digit' 
    });
    document.getElementById('date').textContent = now.toLocaleDateString('no-NO', { 
        weekday: 'long', 
        day: 'numeric', 
        month: 'long' 
    });
    document.getElementById('calendar-month').textContent = now.toLocaleDateString('no-NO', { 
        month: 'long', 
        year: 'numeric' 
    });
}
setInterval(updateClock, 1000);
updateClock();

// --- VÆR ---
let weatherData = [];
const CONDITIONS = {
    'clearsky': 'Klarvær', 'fair': 'Lettskyet', 'partlycloudy': 'Delvis skyet',
    'cloudy': 'Skyet', 'rain': 'Regn', 'lightrain': 'Lett regn',
    'heavyrain': 'Kraftig regn', 'snow': 'Snø', 'sleet': 'Sludd', 'fog': 'Tåke',
    'rainshowers': 'Regnbyger', 'lightsnow': 'Lett snø', 'heavysnow': 'Kraftig snø',
    'lightrainshowers': 'Lette regnbyger', 'heavyrainshowers': 'Kraftige regnbyger',
    'snowshowers': 'Snøbyger', 'sleetshowers': 'Sluddbyger'
};

// Håndtegnede SVG-ikoner (Remarkable-stil)
const WEATHER_ICONS = {
    // Sol
    clearsky: `<svg viewBox="0 0 64 64" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round">
        <circle cx="32" cy="32" r="12"/>
        <path d="M32 8v8M32 48v8M8 32h8M48 32h8M15 15l6 6M43 43l6 6M15 49l6-6M43 21l6-6"/>
    </svg>`,
    
    // Sol med sky
    fair: `<svg viewBox="0 0 64 64" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round">
        <circle cx="38" cy="20" r="10"/>
        <path d="M38 4v5M38 31v3M52 20h5M24 20h5M48 10l3-3M28 30l-3 3M48 30l3 3M28 10l-3-3"/>
        <path d="M18 56h32c6 0 10-4 10-10s-4-10-10-10h-2c-1-8-8-14-16-14-9 0-16 7-16 16 0 1 0 2 .2 3C10 42 6 47 6 52c0 6 5 10 12 10z"/>
    </svg>`,
    
    // Delvis skyet
    partlycloudy: `<svg viewBox="0 0 64 64" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round">
        <circle cx="42" cy="18" r="8"/>
        <path d="M42 6v4M42 26v2M52 18h4M32 18h4M49 11l3-3M35 25l-2 2M49 25l3 3M35 11l-2-2"/>
        <path d="M14 54h36c5 0 8-3 8-8s-3-8-8-8h-1c-1-7-7-12-14-12-8 0-14 6-14 14v2c-5 1-8 5-8 10 0 5 4 8 9 8z"/>
    </svg>`,
    
    // Skyet
    cloudy: `<svg viewBox="0 0 64 64" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round">
        <path d="M16 52h36c6 0 10-4 10-10s-4-10-10-10h-2c-1-8-8-14-16-14-9 0-16 7-16 16v2c-6 1-10 5-10 11 0 6 5 10 12 10z"/>
    </svg>`,
    
    // Regn
    rain: `<svg viewBox="0 0 64 64" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round">
        <path d="M14 40h36c5 0 8-3 8-8s-3-8-8-8h-1c-1-7-7-12-14-12-8 0-14 6-14 14v2c-5 1-8 4-8 9 0 5 4 8 9 8z"/>
        <path d="M22 48v10M32 46v12M42 48v10"/>
    </svg>`,
    
    // Lett regn
    lightrain: `<svg viewBox="0 0 64 64" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round">
        <path d="M14 40h36c5 0 8-3 8-8s-3-8-8-8h-1c-1-7-7-12-14-12-8 0-14 6-14 14v2c-5 1-8 4-8 9 0 5 4 8 9 8z"/>
        <path d="M24 48v6M40 48v6"/>
    </svg>`,
    
    // Kraftig regn
    heavyrain: `<svg viewBox="0 0 64 64" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round">
        <path d="M14 36h36c5 0 8-3 8-8s-3-8-8-8h-1c-1-7-7-12-14-12-8 0-14 6-14 14v2c-5 1-8 4-8 9 0 5 4 8 9 8z"/>
        <path d="M18 44v12M27 42v14M36 44v12M45 42v14"/>
    </svg>`,
    
    // Snø
    snow: `<svg viewBox="0 0 64 64" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round">
        <path d="M14 40h36c5 0 8-3 8-8s-3-8-8-8h-1c-1-7-7-12-14-12-8 0-14 6-14 14v2c-5 1-8 4-8 9 0 5 4 8 9 8z"/>
        <circle cx="22" cy="52" r="2"/><circle cx="32" cy="56" r="2"/><circle cx="42" cy="52" r="2"/>
    </svg>`,
    
    // Sludd
    sleet: `<svg viewBox="0 0 64 64" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round">
        <path d="M14 40h36c5 0 8-3 8-8s-3-8-8-8h-1c-1-7-7-12-14-12-8 0-14 6-14 14v2c-5 1-8 4-8 9 0 5 4 8 9 8z"/>
        <path d="M24 46v8"/><circle cx="36" cy="52" r="2"/><path d="M44 46v8"/>
    </svg>`,
    
    // Tåke
    fog: `<svg viewBox="0 0 64 64" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round">
        <path d="M12 28h40M8 38h48M12 48h40M16 58h32"/>
    </svg>`,
    
    // Regnbyger
    rainshowers: `<svg viewBox="0 0 64 64" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round">
        <circle cx="44" cy="16" r="7"/>
        <path d="M44 6v3M44 23v2M52 16h3M38 16h3"/>
        <path d="M12 48h32c4 0 7-3 7-7s-3-7-7-7h-1c-1-6-6-10-12-10-7 0-12 5-12 12v2c-4 1-7 4-7 8s4 7 8 7z"/>
        <path d="M20 54v6M32 54v6"/>
    </svg>`,
    
    // Natt-varianter (samme som dag, men med måne)
    clearsky_night: `<svg viewBox="0 0 64 64" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round">
        <path d="M36 12c-10 0-18 8-18 18s8 18 18 18c2 0 4-.3 6-.8-3-3-5-8-5-13 0-10 7-18 16-20-4-2-9-2-14-2z"/>
        <circle cx="24" cy="14" r="1.5"/><circle cx="16" cy="24" r="1"/><circle cx="46" cy="36" r="1.5"/>
    </svg>`,
    
    partlycloudy_night: `<svg viewBox="0 0 64 64" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round">
        <path d="M44 8c-5 0-9 3-11 7 5 1 9 6 9 11 0 3-1 5-3 7h3c6 0 10-4 10-10 0-8-6-15-14-15z"/>
        <path d="M14 54h36c5 0 8-3 8-8s-3-8-8-8h-1c-1-7-7-12-14-12-8 0-14 6-14 14v2c-5 1-8 5-8 10 0 5 4 8 9 8z"/>
    </svg>`,
    
    fair_night: `<svg viewBox="0 0 64 64" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round">
        <path d="M42 6c-4 0-7 2-9 5 4 1 7 5 7 9 0 2-1 4-2 6h2c5 0 9-4 9-9 0-6-5-11-11-11z"/>
        <path d="M16 54h32c5 0 8-3 8-8s-3-8-8-8h-1c-1-7-7-12-14-12-7 0-13 5-13 12v2c-5 1-8 4-8 9 0 5 4 8 9 8z"/>
    </svg>`
};

function getWeatherIcon(symbolCode) {
    // Fjern dag/natt-suffix for å finne basis-ikon
    const base = symbolCode.replace(/_day|_night|_polartwilight/g, '');
    const isNight = symbolCode.includes('_night');
    
    // Sjekk om vi har natt-variant
    if (isNight && WEATHER_ICONS[symbolCode]) {
        return WEATHER_ICONS[symbolCode];
    }
    if (isNight && WEATHER_ICONS[base + '_night']) {
        return WEATHER_ICONS[base + '_night'];
    }
    
    // Bruk basis-ikon eller fallback til skyet
    return WEATHER_ICONS[base] || WEATHER_ICONS['cloudy'];
}

async function fetchWeather() {
    try {
        const response = await fetch(`${API_BASE}/weather`);
        const data = await response.json();
        weatherData = data.properties.timeseries;
        renderWeather();
    } catch (error) {
        console.error('Weather error:', error);
    }
}

function renderWeather() {
    if (!weatherData.length) return;

    const current = weatherData[0];
    const temp = Math.round(current.data.instant.details.air_temperature);
    const symbol = current.data.next_1_hours?.summary?.symbol_code || 'cloudy';
    const desc = CONDITIONS[symbol.split('_')[0]] || symbol.split('_')[0];
    const wind = current.data.instant.details.wind_speed;
    const humidity = current.data.instant.details.relative_humidity;

    // Overview card
    document.getElementById('overview-temp').textContent = `${temp}°`;
    document.getElementById('overview-condition').textContent = desc;
    document.getElementById('overview-weather-icon').innerHTML = getWeatherIcon(symbol);

    // Weather page
    document.getElementById('weather-icon-container').innerHTML = getWeatherIcon(symbol);
    document.getElementById('weather-temp').textContent = `${temp}°`;
    document.getElementById('weather-desc').textContent = desc;
    document.getElementById('weather-details').innerHTML = `
        <span>Vind ${wind} m/s</span>
        <span>Fuktighet ${Math.round(humidity)}%</span>
    `;

    // Hourly forecast
    const hours = weatherData.slice(1, 7);
    document.getElementById('forecast-hours').innerHTML = hours.map(item => {
        const time = new Date(item.time).getHours();
        const t = Math.round(item.data.instant.details.air_temperature);
        const sym = item.data.next_1_hours?.summary?.symbol_code || 'cloudy';
        const cond = CONDITIONS[sym.split('_')[0]] || '';
        return `<div class="forecast-item">
            <span class="forecast-time">${String(time).padStart(2, '0')}:00</span>
            <span class="forecast-condition">${cond}</span>
            <span class="forecast-temp">${t}°</span>
        </div>`;
    }).join('');

    // Daily forecast
    const dailyData = {};
    weatherData.forEach(item => {
        const date = item.time.split('T')[0];
        if (!dailyData[date]) dailyData[date] = { temps: [], symbols: [] };
        dailyData[date].temps.push(item.data.instant.details.air_temperature);
        const sym = (item.data.next_1_hours || item.data.next_6_hours)?.summary?.symbol_code;
        if (sym) dailyData[date].symbols.push(sym);
    });

    const days = Object.entries(dailyData).slice(1, 6);
    document.getElementById('forecast-days').innerHTML = days.map(([date, info]) => {
        const min = Math.round(Math.min(...info.temps));
        const max = Math.round(Math.max(...info.temps));
        const dayName = new Date(date).toLocaleDateString('no-NO', { weekday: 'long' });
        return `<div class="forecast-item">
            <span class="forecast-time">${dayName}</span>
            <span class="forecast-condition"></span>
            <span class="forecast-temp">${max}° / ${min}°</span>
        </div>`;
    }).join('');
}

setInterval(fetchWeather, 600000);
fetchWeather();

// --- KALENDER ---
let calendarEvents = [];
let selectedDate = new Date();

async function fetchCalendar() {
    try {
        const response = await fetch(`${API_BASE}/events`);
        calendarEvents = await response.json();
        renderCalendar();
    } catch (error) {
        console.error('Calendar error:', error);
    }
}

function renderCalendar() {
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    
    // Date buttons
    const datesContainer = document.getElementById('calendar-dates');
    const datesHtml = [];
    
    for (let i = 0; i < 14; i++) {
        const d = new Date(today);
        d.setDate(d.getDate() + i);
        const dateStr = d.toISOString().split('T')[0];
        const isSelected = d.getTime() === selectedDate.getTime();
        const hasEvents = calendarEvents.some(e => e.start.split('T')[0] === dateStr);
        
        datesHtml.push(`<button class="date-btn${isSelected ? ' active' : ''}${hasEvents ? ' has-events' : ''}" data-date="${dateStr}">
            <span class="day-num">${d.getDate()}</span>
            <span class="day-name">${d.toLocaleDateString('no-NO', { weekday: 'short' })}</span>
        </button>`);
    }
    datesContainer.innerHTML = datesHtml.join('');
    
    // Date button clicks
    datesContainer.querySelectorAll('.date-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            selectedDate = new Date(btn.dataset.date);
            renderCalendar();
        });
    });

    // Filter events for selected date
    const selectedDateStr = selectedDate.toISOString().split('T')[0];
    const dayEvents = calendarEvents.filter(e => e.start.split('T')[0] === selectedDateStr);
    
    // Overview card - next event today
    const todayStr = today.toISOString().split('T')[0];
    const todayEvents = calendarEvents.filter(e => e.start.split('T')[0] === todayStr);
    const upcomingToday = todayEvents.filter(e => new Date(e.start) > now);
    
    const nextEvent = upcomingToday[0] || todayEvents[0];
    if (nextEvent) {
        const time = new Date(nextEvent.start).toLocaleTimeString('no-NO', { hour: '2-digit', minute: '2-digit' });
        document.getElementById('overview-event').innerHTML = `
            <strong>${time}</strong><br>${nextEvent.oppsummering}
        `;
    } else {
        document.getElementById('overview-event').innerHTML = 'Ingen flere<br>hendelser i dag';
    }

    // Timeline view
    renderTimeline(dayEvents);
}

function renderTimeline(events) {
    const container = document.getElementById('timeline-events');
    
    if (!events.length) {
        container.innerHTML = `<div class="no-events">Ingen hendelser denne dagen</div>`;
        return;
    }
    
    // Sort by start time
    events.sort((a, b) => new Date(a.start) - new Date(b.start));
    
    container.innerHTML = events.map(e => {
        const start = new Date(e.start);
        const end = e.end ? new Date(e.end) : null;
        const startTime = start.toLocaleTimeString('no-NO', { hour: '2-digit', minute: '2-digit' });
        const endTime = end ? end.toLocaleTimeString('no-NO', { hour: '2-digit', minute: '2-digit' }) : '';
        const isIda = e.organizer_email === 'ida-jonber@hotmail.com';
        
        return `<div class="timeline-event${isIda ? ' ida' : ''}">
            <div class="event-time-block">
                <span class="event-time-start">${startTime}</span>
                ${endTime ? `<span class="event-time-end">→ ${endTime}</span>` : ''}
            </div>
            <div class="event-details">
                <div class="event-title">${e.oppsummering}</div>
                ${e.sted ? `<div class="event-location">${e.sted}</div>` : ''}
            </div>
        </div>`;
    }).join('');
}

setInterval(fetchCalendar, 300000);
fetchCalendar();

// --- BUSS ---
const STOPS = [
    { id: 'NSR:StopPlace:6372', name: 'Advokat Dehlis plass', short: 'Adv. Dehlis pl.' },
    { id: 'NSR:StopPlace:6366', name: 'Voldsløkka', short: 'Voldsløkka' }
];

async function fetchBus() {
    const stopQueries = STOPS.map((s, i) => `
        stop${i}: stopPlace(id: "${s.id}") {
            name
            estimatedCalls(timeRange: 7200, numberOfDepartures: 20) {
                expectedDepartureTime
                destinationDisplay { frontText }
                serviceJourney { journeyPattern { line { publicCode } } }
            }
        }
    `).join('');
    
    const query = `{ ${stopQueries} }`;

    try {
        const response = await fetch('https://api.entur.io/journey-planner/v3/graphql', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', 'ET-Client-Name': 'hjemme-dashboard' },
            body: JSON.stringify({ query })
        });
        const data = await response.json();
        
        let allDepartures = [];
        STOPS.forEach((s, i) => {
            const stopData = data.data[`stop${i}`];
            if (stopData?.estimatedCalls) {
                stopData.estimatedCalls.forEach(d => {
                    d.stopName = stopData.name;
                    d.stopShort = s.short;
                    allDepartures.push(d);
                });
            }
        });
        
        renderBus(allDepartures);
    } catch (error) {
        console.error('Bus error:', error);
    }
}

function renderBus(departures) {
    const filtered = departures.filter(d => {
        const line = d.serviceJourney.journeyPattern.line.publicCode;
        const dest = d.destinationDisplay.frontText;
        return (line === '54' && dest === 'Kværnerbyen') || 
               (line === '37' && dest === 'Helsfyr') ||
               (line === '34' && dest === 'Ekeberg hageby');
    });

    filtered.sort((a, b) => new Date(a.expectedDepartureTime) - new Date(b.expectedDepartureTime));
    const items = filtered.slice(0, 8);

    // Overview card
    if (items.length > 0) {
        const first = items[0];
        const line = first.serviceJourney.journeyPattern.line.publicCode;
        const mins = Math.round((new Date(first.expectedDepartureTime) - new Date()) / 60000);
        const timeStr = mins <= 0 ? 'Nå' : `${mins} min`;
        document.getElementById('overview-bus').innerHTML = `
            <strong>${line}</strong> → ${first.destinationDisplay.frontText}<br>${timeStr}
        `;
    } else {
        document.getElementById('overview-bus').textContent = 'Ingen avganger';
    }

    // Bus page
    if (!items.length) {
        document.getElementById('bus-list').innerHTML = '<div class="no-events">Ingen avganger funnet</div>';
        return;
    }

    document.getElementById('bus-list').innerHTML = items.map(d => {
        const line = d.serviceJourney.journeyPattern.line.publicCode;
        const dest = d.destinationDisplay.frontText;
        const time = new Date(d.expectedDepartureTime);
        const mins = Math.round((time - new Date()) / 60000);
        const timeStr = mins <= 0 ? 'Nå' : mins < 10 ? `${mins}` : time.toLocaleTimeString('no-NO', { hour: '2-digit', minute: '2-digit' });
        const timeLabel = mins > 0 && mins < 10 ? 'min' : '';
        const soonClass = mins <= 5 ? ' soon' : '';
        
        return `<div class="bus-item">
            <span class="bus-line">${line}</span>
            <div class="bus-info">
                <div class="bus-dest">${dest}</div>
                <div class="bus-stop">Fra ${d.stopShort}</div>
            </div>
            <span class="bus-time${soonClass}">${timeStr}${timeLabel ? `<small>${timeLabel}</small>` : ''}</span>
        </div>`;
    }).join('');
}

setInterval(fetchBus, 30000);
fetchBus();

// --- SPOTIFY ---
let isPlaying = false;

async function checkSpotify() {
    try {
        const response = await fetch(`${API_BASE}/spotify/status`);
        const data = await response.json();
        if (data.authenticated) {
            document.getElementById('spotify-login').classList.add('hidden');
            document.getElementById('spotify-player').classList.remove('hidden');
            fetchNowPlaying();
        }
    } catch (error) {
        console.error('Spotify auth error:', error);
    }
}

async function fetchNowPlaying() {
    try {
        const response = await fetch(`${API_BASE}/spotify/now-playing`);
        if (response.status === 401) {
            document.getElementById('spotify-login').classList.remove('hidden');
            document.getElementById('spotify-player').classList.add('hidden');
            return;
        }
        const data = await response.json();
        if (data.item) {
            const track = data.item.name;
            const artist = data.item.artists.map(a => a.name).join(', ');
            
            document.getElementById('track-name').textContent = track;
            document.getElementById('track-artist').textContent = artist;
            
            const albumArt = document.getElementById('album-art');
            const newSrc = data.item.album?.images?.[0]?.url || '';
            if (albumArt.src !== newSrc) {
                albumArt.src = newSrc;
            }
            
            // Overview card
            document.getElementById('overview-spotify').innerHTML = `<strong>${track}</strong><br>${artist}`;
            
            // Mini album art in overview
            const overviewAlbum = document.getElementById('overview-album');
            if (newSrc && overviewAlbum) {
                overviewAlbum.innerHTML = `<img src="${newSrc}" alt="">`;
            }
            
            isPlaying = data.is_playing;
            document.getElementById('btn-play').classList.toggle('playing', isPlaying);
            
            // Spin vinyl when playing
            document.querySelector('.vinyl')?.classList.toggle('spinning', isPlaying);
        } else {
            document.getElementById('track-name').textContent = 'Ingen sang';
            document.getElementById('track-artist').textContent = 'Start Spotify på en enhet';
            document.getElementById('overview-spotify').textContent = 'Ikke aktiv';
            document.getElementById('overview-album').innerHTML = '<img src="icons/music.png" alt="" class="album-placeholder">';
            document.querySelector('.vinyl')?.classList.remove('spinning');
        }
    } catch (error) {
        console.error('Now playing error:', error);
    }
}

async function spotifyControl(action) {
    try {
        await fetch(`${API_BASE}/spotify/${action}`, { method: 'POST' });
        if (action === 'play' || action === 'pause') {
            isPlaying = action === 'play';
            document.getElementById('btn-play').classList.toggle('playing', isPlaying);
            document.querySelector('.vinyl')?.classList.toggle('spinning', isPlaying);
        }
        setTimeout(fetchNowPlaying, 500);
    } catch (error) {
        console.error('Spotify control error:', error);
    }
}

document.getElementById('btn-play')?.addEventListener('click', () => spotifyControl(isPlaying ? 'pause' : 'play'));
document.getElementById('btn-prev')?.addEventListener('click', () => spotifyControl('previous'));
document.getElementById('btn-next')?.addEventListener('click', () => spotifyControl('next'));

checkSpotify();
setInterval(fetchNowPlaying, 5000);
