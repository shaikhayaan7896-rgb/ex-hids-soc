// Initialize Icons
document.addEventListener("DOMContentLoaded", () => {
    lucide.createIcons();
    initChart();
    startTelemetryLoop();
});

// Real-Time Clock
setInterval(() => {
    const clock = document.getElementById('liveClock');
    if (clock) {
        clock.textContent = new Date().toISOString().substring(11, 19) + ' UTC';
    }
}, 1000);

// Attack States
let currentVector = 'NOMINAL'; // 'NOMINAL', 'SYN_FLOOD', 'PORT_SCAN'

// Metric State Baselines
let state = {
    pktRate: 45,
    synRatio: 0.03,
    dstCount: 8,
    shapScores: {
        syn_flag_ratio: 0.05,
        pkt_rate_1s: 0.12,
        unique_dst_ports: 0.08,
        dst_host_count: 0.04
    }
};

// UI Element Bindings
const btnSynFlood = document.getElementById('btnSynFlood');
const btnPortScan = document.getElementById('btnPortScan');
const btnResetNominal = document.getElementById('btnResetNominal');

btnSynFlood.addEventListener('click', () => triggerAttack('SYN_FLOOD'));
btnPortScan.addEventListener('click', () => triggerAttack('PORT_SCAN'));
btnResetNominal.addEventListener('click', () => triggerAttack('NOMINAL'));

function triggerAttack(type) {
    currentVector = type;
    logEvent(`[ACTION] Vector transitioned to: ${type}`);
    updateTelemetryState();
}

function updateTelemetryState() {
    const alertBanner = document.getElementById('alertBanner');
    const alertTitle = document.getElementById('alertTitle');
    const alertDesc = document.getElementById('alertDesc');
    const alertConfidence = document.getElementById('alertConfidence');
    const alertIcon = document.getElementById('alertIcon');

    if (currentVector === 'SYN_FLOOD') {
        state.pktRate = Math.floor(850 + Math.random() * 150);
        state.synRatio = 0.94;
        state.dstCount = 4;
        state.shapScores = {
            syn_flag_ratio: 0.88,
            pkt_rate_1s: 0.62,
            unique_dst_ports: 0.11,
            dst_host_count: 0.05
        };

        alertBanner.className = "border border-red-500/50 bg-red-950/30 rounded-xl p-4 flex items-center justify-between glow-red";
        alertTitle.textContent = "THREAT DETECTED: SYN FLOOD (DoS)";
        alertDesc.textContent = "Abnormal TCP handshake ratio without ACK completion. High drop rule engaged.";
        alertConfidence.className = "text-xs font-semibold px-2.5 py-1 bg-red-900/40 text-red-400 rounded border border-red-500/40";
        alertConfidence.textContent = "98.7% Confidence";
        alertIcon.setAttribute('data-lucide', 'alert-triangle');
        alertIcon.className = "w-6 h-6 text-dangerRed";
    } else if (currentVector === 'PORT_SCAN') {
        state.pktRate = Math.floor(320 + Math.random() * 80);
        state.synRatio = 0.28;
        state.dstCount = 180;
        state.shapScores = {
            unique_dst_ports: 0.91,
            dst_host_count: 0.65,
            syn_flag_ratio: 0.18,
            pkt_rate_1s: 0.22
        };

        alertBanner.className = "border border-yellow-500/50 bg-yellow-950/30 rounded-xl p-4 flex items-center justify-between glow-yellow";
        alertTitle.textContent = "THREAT DETECTED: HORIZONTAL RECONNAISSANCE";
        alertDesc.textContent = "Sequential probing across wide range of destination ports and IPs.";
        alertConfidence.className = "text-xs font-semibold px-2.5 py-1 bg-yellow-900/40 text-yellow-400 rounded border border-yellow-500/40";
        alertConfidence.textContent = "94.2% Confidence";
        alertIcon.setAttribute('data-lucide', 'shield-alert');
        alertIcon.className = "w-6 h-6 text-alertYellow";
    } else {
        state.pktRate = Math.floor(35 + Math.random() * 20);
        state.synRatio = 0.04;
        state.dstCount = 10;
        state.shapScores = {
            pkt_rate_1s: 0.10,
            syn_flag_ratio: 0.06,
            unique_dst_ports: 0.05,
            dst_host_count: 0.02
        };

        alertBanner.className = "border border-safeGreen/40 bg-safeGreen/10 rounded-xl p-4 flex items-center justify-between glow-green";
        alertTitle.textContent = "STATUS: NOMINAL TRAFFIC";
        alertDesc.textContent = "Statistical anomalies within standard baseline confidence intervals.";
        alertConfidence.className = "text-xs font-semibold px-2.5 py-1 bg-safeGreen/20 text-safeGreen rounded border border-safeGreen/40";
        alertConfidence.textContent = "99.4% Benign";
        alertIcon.setAttribute('data-lucide', 'shield-check');
        alertIcon.className = "w-6 h-6 text-safeGreen";
    }

    lucide.createIcons();
    renderShapBars();
}

function renderShapBars() {
    const container = document.getElementById('shapBarsContainer');
    container.innerHTML = '';

    const labels = {
        syn_flag_ratio: 'TCP SYN Flag Ratio (Anomaly Indicator)',
        unique_dst_ports: 'Unique Destination Port Entropy',
        pkt_rate_1s: '1s Ingestion Packet Frequency',
        dst_host_count: 'Active Destination Host Cardinality'
    };

    for (const [key, score] of Object.entries(state.shapScores)) {
        const percent = Math.min(100, Math.round(score * 100));
        const isMalicious = score > 0.4;
        const color = isMalicious ? 'bg-dangerRed' : 'bg-cyan-500';

        const row = document.createElement('div');
        row.className = "space-y-1";
        row.innerHTML = `
            <div class="flex justify-between text-xs">
                <span class="text-slate-300 font-medium">${labels[key]}</span>
                <span class="${isMalicious ? 'text-red-400 font-bold' : 'text-slate-400'}">+${score.toFixed(2)} SHAP</span>
            </div>
            <div class="w-full bg-slate-800 rounded-full h-2 overflow-hidden border border-slate-700">
                <div class="${color} h-2 rounded-full transition-all duration-500" style="width: ${percent}%"></div>
            </div>
        `;
        container.appendChild(row);
    }
}

// Chart.js Telemetry Graph
let chart;
function initChart() {
    const ctx = document.getElementById('telemetryChart').getContext('2d');
    chart = new Chart(ctx, {
        type: 'line',
        data: {
            labels: Array(15).fill(''),
            datasets: [{
                label: 'Flow Ingestion Rate (pkts/s)',
                data: Array(15).fill(40),
                borderColor: '#38bdf8',
                backgroundColor: 'rgba(56, 189, 248, 0.08)',
                fill: true,
                tension: 0.35,
                borderWidth: 2,
                pointRadius: 0
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: { legend: { display: false } },
            scales: {
                x: { display: false },
                y: {
                    grid: { color: '#1f2937' },
                    ticks: { color: '#64748b', font: { family: 'monospace', size: 10 } }
                }
            }
        }
    });
}

function startTelemetryLoop() {
    setInterval(() => {
        let jitter = Math.floor(Math.random() * 8) - 4;
        let currentPkt = Math.max(10, state.pktRate + jitter);

        document.getElementById('metricPktRate').textContent = `${currentPkt} pkts/s`;
        document.getElementById('metricSynRatio').textContent = state.synRatio.toFixed(2);
        document.getElementById('metricDstCount').textContent = `${state.dstCount} hosts`;

        // Update Chart
        if (chart) {
            chart.data.datasets[0].data.shift();
            chart.data.datasets[0].data.push(currentPkt);
            chart.data.datasets[0].borderColor = currentVector === 'NOMINAL' ? '#38bdf8' : (currentVector === 'SYN_FLOOD' ? '#ef4444' : '#f59e0b');
            chart.update();
        }
    }, 1000);
}

function logEvent(msg) {
    const container = document.getElementById('flowLogContainer');
    const time = new Date().toTimeString().split(' ')[0];
    const item = document.createElement('div');
    item.textContent = `[${time}] ${msg}`;
    container.prepend(item);
}