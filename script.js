// Date fictive pentru demonstrație
const mockData = {
    ip: {
        reputation: 85,
        country: 'România',
        isp: 'Vodafone Romania',
        asn: 'AS12302',
        reports: 12,
        lastReported: '2025-03-15',
        tags: ['ssh', 'brute-force', 'scanning']
    },
    domain: {
        reputation: 42,
        registrar: 'Namecheap',
        creationDate: '2024-01-10',
        resolvedIp: '104.21.23.45',
        malicious: true,
        threatType: 'phishing'
    },
    url: {
        reputation: 15,
        detectionRatio: '7/64',
        scanDate: '2025-04-01',
        categories: ['phishing', 'malware'],
        finalUrl: 'https://example.com/login'
    },
    hash: {
        reputation: 0,
        detectionRatio: '56/70',
        firstSeen: '2025-02-20',
        lastSeen: '2025-03-30',
        fileType: 'Win32 EXE',
        tags: ['trojan', 'emotet']
    },
    email: {
        breaches: 5,
        pwned: true,
        lastBreach: '2024-11-12',
        sources: ['LinkedIn', 'Adobe', 'Canva']
    }
};

// Funcție pentru a afișa rezultate în funcție de tip
function displayResults(type) {
    const data = mockData[type];
    if (!data) return;

    const container = document.getElementById('resultsContainer');
    container.innerHTML = ''; // clear

    // Card principal: Reputație
    const repCard = document.createElement('div');
    repCard.className = 'result-card';
    repCard.innerHTML = `
        <h5><i class="fas fa-gavel me-2"></i>Reputație generală</h5>
        <div class="d-flex align-items-center flex-wrap">
            <span class="badge badge-reputation ${
                data.reputation > 70 ? 'rep-high' : data.reputation > 30 ? 'rep-medium' : 'rep-low'
            }">Scor: ${data.reputation}/100</span>
            <span class="ms-3 text-muted">${
                data.reputation > 70 ? 'Curat' : data.reputation > 30 ? 'Suspect' : 'Malițios'
            }</span>
        </div>
    `;
    container.appendChild(repCard);

    // Card secundar: Detalii specifice tipului
    const detailCard = document.createElement('div');
    detailCard.className = 'result-card';
    let detailsHtml = '<h5><i class="fas fa-info-circle me-2"></i>Detalii tehnice</h5>';

    if (type === 'ip') {
        detailsHtml += `
            <div class="detail-item"><span class="detail-label">Țară</span><span class="detail-value">${data.country}</span></div>
            <div class="detail-item"><span class="detail-label">ISP</span><span class="detail-value">${data.isp}</span></div>
            <div class="detail-item"><span class="detail-label">ASN</span><span class="detail-value">${data.asn}</span></div>
            <div class="detail-item"><span class="detail-label">Număr rapoarte</span><span class="detail-value">${data.reports}</span></div>
            <div class="detail-item"><span class="detail-label">Ultimul raport</span><span class="detail-value">${data.lastReported}</span></div>
            <div class="detail-item"><span class="detail-label">Tag-uri</span><span class="detail-value">${data.tags.join(', ')}</span></div>
        `;
    } else if (type === 'domain') {
        detailsHtml += `
            <div class="detail-item"><span class="detail-label">Registrar</span><span class="detail-value">${data.registrar}</span></div>
            <div class="detail-item"><span class="detail-label">Data creării</span><span class="detail-value">${data.creationDate}</span></div>
            <div class="detail-item"><span class="detail-label">IP rezolvat</span><span class="detail-value">${data.resolvedIp}</span></div>
            <div class="detail-item"><span class="detail-label">Malițios</span><span class="detail-value">${data.malicious ? 'Da' : 'Nu'}</span></div>
            <div class="detail-item"><span class="detail-label">Tip amenințare</span><span class="detail-value">${data.threatType}</span></div>
        `;
    } else if (type === 'url') {
        detailsHtml += `
            <div class="detail-item"><span class="detail-label">Rată detecție</span><span class="detail-value">${data.detectionRatio}</span></div>
            <div class="detail-item"><span class="detail-label">Data scanării</span><span class="detail-value">${data.scanDate}</span></div>
            <div class="detail-item"><span class="detail-label">Categorii</span><span class="detail-value">${data.categories.join(', ')}</span></div>
            <div class="detail-item"><span class="detail-label">URL final</span><span class="detail-value">${data.finalUrl}</span></div>
        `;
    } else if (type === 'hash') {
        detailsHtml += `
            <div class="detail-item"><span class="detail-label">Rată detecție</span><span class="detail-value">${data.detectionRatio}</span></div>
            <div class="detail-item"><span class="detail-label">Prima vedere</span><span class="detail-value">${data.firstSeen}</span></div>
            <div class="detail-item"><span class="detail-label">Ultima vedere</span><span class="detail-value">${data.lastSeen}</span></div>
            <div class="detail-item"><span class="detail-label">Tip fișier</span><span class="detail-value">${data.fileType}</span></div>
            <div class="detail-item"><span class="detail-label">Tag-uri</span><span class="detail-value">${data.tags.join(', ')}</span></div>
        `;
    } else if (type === 'email') {
        detailsHtml += `
            <div class="detail-item"><span class="detail-label">Număr breșe</span><span class="detail-value">${data.breaches}</span></div>
            <div class="detail-item"><span class="detail-label">Compromis</span><span class="detail-value">${data.pwned ? 'Da' : 'Nu'}</span></div>
            <div class="detail-item"><span class="detail-label">Ultima breșă</span><span class="detail-value">${data.lastBreach}</span></div>
            <div class="detail-item"><span class="detail-label">Surse</span><span class="detail-value">${data.sources.join(', ')}</span></div>
        `;
    }
    detailCard.innerHTML += detailsHtml;
    container.appendChild(detailCard);

    // Card pentru istoric/rapoarte (placeholder)
    const historyCard = document.createElement('div');
    historyCard.className = 'result-card';
    historyCard.innerHTML = `
        <h5><i class="fas fa-chart-line me-2"></i>Istoric rapoarte</h5>
        <p class="text-muted">Graficul va fi integrat aici folosind Chart.js.</p>
        <div class="chart-placeholder">
            <span>[Placeholder pentru grafic]</span>
        </div>
    `;
    container.appendChild(historyCard);

    // Afișăm containerul
    container.style.display = 'block';
}

// Gestionăm trimiterea formularului
document.getElementById('scanForm').addEventListener('submit', function(e) {
    e.preventDefault();
    const type = document.getElementById('typeSelect').value;
    const query = document.getElementById('queryInput').value.trim();
    const errorDiv = document.getElementById('errorMessage');

    // Ascundem eventuale erori
    errorDiv.style.display = 'none';
    errorDiv.textContent = '';

    if (!query) {
        errorDiv.textContent = 'Vă rugăm introduceți o valoare.';
        errorDiv.style.display = 'block';
        return;
    }

    // Simulăm încărcarea
    const spinner = document.getElementById('loadingSpinner');
    const results = document.getElementById('resultsContainer');
    spinner.style.display = 'block';
    results.style.display = 'none';

    setTimeout(() => {
        spinner.style.display = 'none';
        displayResults(type);
    }, 1500); // simulăm delay de rețea
});