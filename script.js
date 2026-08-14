// ====== Gestionare cheie HIBP ======
const HIBP_KEY_STORAGE = 'cyberscan_hibp_key';

function getHibpKey() {
    return localStorage.getItem(HIBP_KEY_STORAGE) || '';
}

function setHibpKey(key) {
    localStorage.setItem(HIBP_KEY_STORAGE, key);
}

// Inițializare modal
document.getElementById('saveHibpKey').addEventListener('click', () => {
    const key = document.getElementById('hibpKey').value.trim();
    setHibpKey(key);
    alert('Cheia a fost salvată local.');
    bootstrap.Modal.getInstance(document.getElementById('settingsModal')).hide();
});

// La încărcare, completăm câmpul cu cheia existentă
window.addEventListener('load', () => {
    const savedKey = getHibpKey();
    if (savedKey) {
        document.getElementById('hibpKey').value = savedKey;
    }
});

// ====== Funcții API ======
async function fetchIpGeolocation(ip) {
    const response = await fetch(`https://ip-api.com/json/${ip}?fields=status,message,country,countryCode,region,regionName,city,zip,lat,lon,timezone,isp,org,as,query`);
    if (!response.ok) throw new Error('Eroare la interogarea ip-api.com');
    const data = await response.json();
    if (data.status === 'fail') throw new Error(data.message || 'IP invalid');
    return data;
}

async function fetchUrlReputation(url) {
    const formData = new FormData();
    formData.append('url', url);
    const response = await fetch('https://urlhaus-api.abuse.ch/v1/url/', {
        method: 'POST',
        body: formData
    });
    if (!response.ok) throw new Error('Eroare la interogarea URLhaus');
    return await response.json();
}

async function fetchHashReputation(hash) {
    const response = await fetch('https://threatfox-api.abuse.ch/api/v1/', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            query: 'search_hash',
            hash: hash
        })
    });
    if (!response.ok) throw new Error('Eroare la interogarea ThreatFox');
    return await response.json();
}

async function fetchDomainReputation(domain) {
    const response = await fetch('https://threatfox-api.abuse.ch/api/v1/', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            query: 'search_ioc',
            search_term: domain
        })
    });
    if (!response.ok) throw new Error('Eroare la interogarea ThreatFox');
    return await response.json();
}

async function fetchEmailBreaches(email) {
    const apiKey = getHibpKey();
    if (!apiKey) {
        throw new Error('Este necesară o cheie API Have I Been Pwned. Adăugați-o în setări.');
    }
    const response = await fetch(`https://haveibeenpwned.com/api/v3/breachedaccount/${encodeURIComponent(email)}`, {
        headers: {
            'hibp-api-key': apiKey,
            'Accept': 'application/json'
        }
    });
    if (response.status === 404) return []; // nicio breșă
    if (!response.ok) throw new Error('Eroare la interogarea HIBP');
    return await response.json();
}

// ====== Afișare rezultate ======
function displayIpResults(data) {
    const container = document.getElementById('resultsContainer');
    container.innerHTML = '';

    const repCard = document.createElement('div');
    repCard.className = 'result-card';
    repCard.innerHTML = `
        <h5><i class="fas fa-map-marker-alt me-2"></i>Geolocație IP</h5>
        <div class="detail-item"><span class="detail-label">IP</span><span class="detail-value">${data.query}</span></div>
        <div class="detail-item"><span class="detail-label">Țară</span><span class="detail-value">${data.country} (${data.countryCode})</span></div>
        <div class="detail-item"><span class="detail-label">Regiune</span><span class="detail-value">${data.regionName || 'N/A'}</span></div>
        <div class="detail-item"><span class="detail-label">Oraș</span><span class="detail-value">${data.city || 'N/A'}</span></div>
        <div class="detail-item"><span class="detail-label">ISP</span><span class="detail-value">${data.isp}</span></div>
        <div class="detail-item"><span class="detail-label">Organizație</span><span class="detail-value">${data.org || 'N/A'}</span></div>
        <div class="detail-item"><span class="detail-label">AS</span><span class="detail-value">${data.as || 'N/A'}</span></div>
        <div class="detail-item"><span class="detail-label">Coordonate</span><span class="detail-value">${data.lat}, ${data.lon}</span></div>
    `;
    container.appendChild(repCard);
}

function displayUrlResults(data) {
    const container = document.getElementById('resultsContainer');
    container.innerHTML = '';

    if (data.query_status === 'no_results') {
        container.innerHTML = `<div class="alert alert-success">URL-ul nu a fost găsit în baza de date URLhaus.</div>`;
        return;
    }

    const repCard = document.createElement('div');
    repCard.className = 'result-card';
    repCard.innerHTML = `
        <h5><i class="fas fa-link me-2"></i>Reputație URL</h5>
        <div class="detail-item"><span class="detail-label">URL</span><span class="detail-value">${data.url}</span></div>
        <div class="detail-item"><span class="detail-label">Status</span><span class="detail-value">${data.url_status || 'N/A'}</span></div>
        <div class="detail-item"><span class="detail-label">Amenințare</span><span class="detail-value">${data.threat || 'N/A'}</span></div>
        <div class="detail-item"><span class="detail-label">Tag-uri</span><span class="detail-value">${data.tags ? data.tags.join(', ') : 'N/A'}</span></div>
        <div class="detail-item"><span class="detail-label">Prima vedere</span><span class="detail-value">${data.firstseen || 'N/A'}</span></div>
        <div class="detail-item"><span class="detail-label">Ultima vedere</span><span class="detail-value">${data.lastseen || 'N/A'}</span></div>
        <div class="detail-item"><span class="detail-label">Raportat de</span><span class="detail-value">${data.reporter || 'N/A'}</span></div>
    `;
    container.appendChild(repCard);
}

function displayHashResults(data) {
    const container = document.getElementById('resultsContainer');
    container.innerHTML = '';

    if (data.query_status === 'no_results') {
        container.innerHTML = `<div class="alert alert-success">Hash-ul nu a fost găsit în ThreatFox.</div>`;
        return;
    }

    const hashData = data.data[0];
    const repCard = document.createElement('div');
    repCard.className = 'result-card';
    repCard.innerHTML = `
        <h5><i class="fas fa-file-code me-2"></i>Reputație hash</h5>
        <div class="detail-item"><span class="detail-label">Hash</span><span class="detail-value">${hashData.sha256_hash}</span></div>
        <div class="detail-item"><span class="detail-label">Tip fișier</span><span class="detail-value">${hashData.file_type || 'N/A'}</span></div>
        <div class="detail-item"><span class="detail-label">Malițios</span><span class="detail-value">${hashData.malware ? 'Da' : 'Nu'}</span></div>
        <div class="detail-item"><span class="detail-label">Familie malware</span><span class="detail-value">${hashData.malware_family || 'N/A'}</span></div>
        <div class="detail-item"><span class="detail-label">Prima vedere</span><span class="detail-value">${hashData.first_seen || 'N/A'}</span></div>
        <div class="detail-item"><span class="detail-label">Ultima vedere</span><span class="detail-value">${hashData.last_seen || 'N/A'}</span></div>
    `;
    container.appendChild(repCard);
}

function displayDomainResults(data) {
    const container = document.getElementById('resultsContainer');
    container.innerHTML = '';

    if (data.query_status === 'no_results') {
        container.innerHTML = `<div class="alert alert-success">Nu s-au găsit IOCs asociate acestui domeniu în ThreatFox.</div>`;
        return;
    }

    const iocs = data.data;
    const repCard = document.createElement('div');
    repCard.className = 'result-card';
    let html = `
        <h5><i class="fas fa-globe me-2"></i>IOCs asociate domeniului</h5>
        <p class="text-muted">Număr IOCs găsite: ${iocs.length}</p>
    `;
    if (iocs.length > 0) {
        html += `<div class="table-responsive"><table class="table table-dark table-striped">
            <thead><tr><th>IOC</th><th>Tip</th><th>Malware</th><th>Prima vedere</th></tr></thead><tbody>`;
        iocs.forEach(ioc => {
            const iocValue = ioc.ioc || ioc.domain || ioc.url || ioc.ip || ioc.sha256_hash || 'N/A';
            const iocType = ioc.ioc_type || 'N/A';
            const malware = ioc.malware || 'N/A';
            const firstSeen = ioc.first_seen || 'N/A';
            html += `<tr><td>${iocValue}</td><td>${iocType}</td><td>${malware}</td><td>${firstSeen}</td></tr>`;
        });
        html += `</tbody></table></div>`;
    } else {
        html += `<p class="text-muted">Nu există IOCs.</p>`;
    }
    repCard.innerHTML = html;
    container.appendChild(repCard);
}

function displayEmailResults(breaches) {
    const container = document.getElementById('resultsContainer');
    container.innerHTML = '';

    if (breaches.length === 0) {
        container.innerHTML = `<div class="alert alert-success">Adresa de email nu a fost găsită în breșe cunoscute.</div>`;
        return;
    }

    const repCard = document.createElement('div');
    repCard.className = 'result-card';
    repCard.innerHTML = `<h5><i class="fas fa-envelope me-2"></i>Breșe de securitate pentru email</h5>`;
    const list = document.createElement('ul');
    list.className = 'list-group';
    breaches.forEach(breach => {
        const item = document.createElement('li');
        item.className = 'list-group-item bg-dark text-light border-secondary';
        item.innerHTML = `
            <strong>${breach.Name}</strong><br>
            Domeniu: ${breach.Domain} | Data: ${breach.BreachDate}<br>
            Date compromise: ${breach.DataClasses.join(', ')}
        `;
        list.appendChild(item);
    });
    repCard.appendChild(list);
    container.appendChild(repCard);
}

// ====== Gestionare formular ======
document.getElementById('scanForm').addEventListener('submit', async function(e) {
    e.preventDefault();
    const type = document.getElementById('typeSelect').value;
    const query = document.getElementById('queryInput').value.trim();
    const errorDiv = document.getElementById('errorMessage');
    errorDiv.style.display = 'none';
    errorDiv.textContent = '';

    if (!query) {
        errorDiv.textContent = 'Vă rugăm introduceți o valoare.';
        errorDiv.style.display = 'block';
        return;
    }

    const spinner = document.getElementById('loadingSpinner');
    const results = document.getElementById('resultsContainer');
    spinner.style.display = 'block';
    results.style.display = 'none';

    try {
        let data;
        switch (type) {
            case 'ip':
                data = await fetchIpGeolocation(query);
                displayIpResults(data);
                break;
            case 'url':
                data = await fetchUrlReputation(query);
                displayUrlResults(data);
                break;
            case 'hash':
                data = await fetchHashReputation(query);
                displayHashResults(data);
                break;
            case 'domain':
                data = await fetchDomainReputation(query);
                displayDomainResults(data);
                break;
            case 'email':
                data = await fetchEmailBreaches(query);
                displayEmailResults(data);
                break;
            default:
                throw new Error('Tip necunoscut');
        }
        results.style.display = 'block';
    } catch (err) {
        results.innerHTML = `<div class="alert alert-danger">${err.message}</div>`;
        results.style.display = 'block';
    } finally {
        spinner.style.display = 'none';
    }
});