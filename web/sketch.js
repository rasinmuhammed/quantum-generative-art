/**
 * ╔══════════════════════════════════════════════════════════════════════════╗
 * ║                         THE QUANTUM CANVAS                               ║
 * ║                                                                          ║
 * ║   Where quantum probability meets visual poetry.                         ║
 * ║   Each measurement becomes a celestial body; each bitstring, a world.    ║
 * ╚══════════════════════════════════════════════════════════════════════════╝
 * 
 * This visualization transforms quantum measurement data into an interactive
 * cosmic display. Every visual property—color, size, orbit, glow—derives from
 * the underlying quantum physics.
 * 
 * Author: Muhammed Rasin
 * License: MIT
 */

// ═══════════════════════════════════════════════════════════════════════════
// Global State
// ═══════════════════════════════════════════════════════════════════════════

let quantumData = null;
let loadError = false;
let particles = [];
let stars = [];
let nebulaClouds = [];
let time = 0;
let hoveredParticle = null;
let draggedParticle = null;
let totalShots = 0;
let numQubits = 5;
let globalMaxCount = 0;
let speedMultiplier = 1;

let SHELL_RADII = {};

const CONFIG = {
    minParticleSize: 14,
    maxParticleSize: 70,
    springStrength: 0.06,
    dragDamping: 0.9,
    starCount: 400
};

// A palette inspired by deep space and quantum phenomena
const PALETTE = [
    { h: 200, s: 90, b: 100 },  // Electric cyan
    { h: 220, s: 85, b: 100 },  // Deep azure
    { h: 260, s: 80, b: 100 },  // Violet shimmer
    { h: 280, s: 75, b: 100 },  // Orchid glow
    { h: 320, s: 80, b: 100 },  // Magenta pulse
    { h: 340, s: 85, b: 100 },  // Rose nebula
    { h: 10, s: 80, b: 100 },   // Stellar orange
    { h: 30, s: 85, b: 100 },   // Golden corona
    { h: 175, s: 85, b: 95 },   // Teal horizon
    { h: 190, s: 90, b: 100 }   // Aqua radiance
];

/** Set the orbital speed multiplier (called from UI buttons) */
function setSpeedMultiplier(speed) {
    speedMultiplier = speed;
}


// ═══════════════════════════════════════════════════════════════════════════
// Star: A distant point of light in the cosmic background
// ═══════════════════════════════════════════════════════════════════════════

class Star {
    constructor(w, h) {
        this.x = random(w);
        this.y = random(h);
        this.z = random(0.1, 1);  // Depth for parallax effect
        this.baseSize = random(0.3, 2.8) * this.z;
        this.twinkleSpeed = random(0.01, 0.04);
        this.twinklePhase = random(TWO_PI);

        // Stellar color temperature: blue (hot) to orange (cool)
        const temp = random(1);
        if (temp < 0.3) this.color = color(180, 200, 255);      // Blue giant
        else if (temp < 0.7) this.color = color(255, 255, 255); // White dwarf
        else if (temp < 0.9) this.color = color(255, 240, 200); // Yellow sun
        else this.color = color(255, 200, 150);                  // Red giant
    }

    draw(time) {
        const twinkle = 0.4 + 0.6 * (0.5 + 0.5 * sin(time * this.twinkleSpeed + this.twinklePhase));
        const size = this.baseSize * twinkle;

        push();
        noStroke();

        // Soft glow layers
        for (let i = 3; i >= 1; i--) {
            const glowAlpha = (30 / i) * twinkle * this.z;
            fill(red(this.color), green(this.color), blue(this.color), glowAlpha);
            circle(this.x, this.y, size * (1 + i * 0.8));
        }

        fill(this.color);
        circle(this.x, this.y, size);

        // Bright stars get cross-shaped lens flare
        if (this.baseSize > 1.8) {
            stroke(red(this.color), green(this.color), blue(this.color), 35 * twinkle);
            strokeWeight(0.5);
            const spikeLen = size * 3.5;
            line(this.x - spikeLen, this.y, this.x + spikeLen, this.y);
            line(this.x, this.y - spikeLen, this.x, this.y + spikeLen);
        }
        pop();
    }
}


// ═══════════════════════════════════════════════════════════════════════════
// NebulaCloud: Ethereal wisps of cosmic gas
// ═══════════════════════════════════════════════════════════════════════════

class NebulaCloud {
    constructor(x, y, hue, size) {
        this.x = x;
        this.y = y;
        this.hue = hue;
        this.size = size;
        this.noiseOffset = random(1000);
        this.alpha = random(10, 22);
    }

    draw(time) {
        push();
        colorMode(HSB, 360, 100, 100, 1);
        noStroke();
        blendMode(ADD);

        const drift = noise(this.noiseOffset + time * 0.0005) * 40 - 20;

        for (let i = 5; i >= 1; i--) {
            const layerSize = this.size * (i / 5);
            const layerAlpha = this.alpha / (i * 1.5) / 255;
            fill(this.hue, 55, 35, layerAlpha);
            circle(this.x + drift, this.y + drift * 0.4, layerSize);
        }

        blendMode(BLEND);
        pop();
    }
}


// ═══════════════════════════════════════════════════════════════════════════
// QuantumOrb: A quantum state made visible
// ═══════════════════════════════════════════════════════════════════════════

class QuantumOrb {
    /**
     * Each orb represents a measured quantum state.
     * Its visual properties are derived directly from quantum mechanics.
     */
    constructor(bitstring, count, statesInShell, indexInShell, maxCount, totalShots, shellMaxCount) {
        this.bitstring = bitstring;
        this.count = count;
        this.totalShots = totalShots;
        this.maxCount = maxCount;
        this.shellMaxCount = shellMaxCount;

        // Quantum properties
        this.hammingWeight = (bitstring.match(/1/g) || []).length;  // Energy level
        this.numQubits = bitstring.length;
        this.stateValue = parseInt(bitstring, 2);
        this.maxStateValue = Math.pow(2, this.numQubits) - 1;
        this.probability = count / totalShots;
        this.amplitude = Math.sqrt(this.probability);  // |ψ| = √P
        this.parity = this.hammingWeight % 2;          // Even/odd symmetry
        this.shellRelativeProbability = count / shellMaxCount;
        this.statesInShell = statesInShell;
        this.indexInShell = indexInShell;

        // Orbital mechanics
        this.baseAngle = statesInShell === 1 ? 0 :
            (indexInShell / statesInShell) * TWO_PI + (this.stateValue / this.maxStateValue) * 0.2;

        // Visual size: amplitude determines magnitude
        this.baseSize = map(
            this.amplitude, 0, Math.sqrt(maxCount / totalShots),
            CONFIG.minParticleSize, CONFIG.maxParticleSize
        );

        // Color: derived from state position in Hilbert space
        const paletteIndex = Math.floor((this.stateValue / this.maxStateValue) * PALETTE.length);
        const baseColor = PALETTE[paletteIndex % PALETTE.length];
        this.hue = baseColor.h + (this.stateValue % 15) - 7;
        this.saturation = baseColor.s - (this.parity * 15);  // Parity affects saturation
        this.brightness = map(this.shellRelativeProbability, 0, 1, 75, 100);

        // Glow: probability determines luminosity
        this.glowIntensity = map(this.probability, 0, maxCount / totalShots, 0.7, 2.5);

        // Orbital speed: Kepler-like (higher energy = faster)
        this.baseOrbitSpeed = 0.0006 / (this.hammingWeight + 1);

        this.pulseSpeed = 0.015;
        this.phase = this.stateValue * 0.15;

        // Motion trail
        this.trail = [];
        this.maxTrail = Math.floor(15 + this.probability * 30);

        // Physics state
        this.x = 0; this.y = 0;
        this.vx = 0; this.vy = 0;
        this.targetX = 0; this.targetY = 0;
        this.isDragging = false;
        this.isHovered = false;
    }

    getShellRadius() {
        return SHELL_RADII[this.hammingWeight] || SHELL_RADII[5];
    }

    updateTargetPosition(time) {
        const angle = this.baseAngle + time * this.baseOrbitSpeed * speedMultiplier;
        const breathe = sin(time * 0.005 + this.phase) * 4;
        const radius = this.getShellRadius() + breathe;
        this.targetX = radius * cos(angle);
        this.targetY = radius * sin(angle);
    }

    updatePhysics() {
        if (this.isDragging) {
            this.trail.push({ x: this.x, y: this.y });
            if (this.trail.length > this.maxTrail) this.trail.shift();
            return;
        }

        // Spring dynamics toward orbital target
        const dx = this.targetX - this.x;
        const dy = this.targetY - this.y;
        this.vx += dx * CONFIG.springStrength;
        this.vy += dy * CONFIG.springStrength;
        this.vx *= CONFIG.dragDamping;
        this.vy *= CONFIG.dragDamping;
        this.x += this.vx;
        this.y += this.vy;

        if (frameCount % 2 === 0) {
            this.trail.push({ x: this.x, y: this.y });
            if (this.trail.length > this.maxTrail) this.trail.shift();
        }
    }

    checkHover(mx, my) {
        const d = dist(mx, my, this.x, this.y);
        this.isHovered = d < this.getCurrentSize() / 2 + 15;
        return this.isHovered;
    }

    getCurrentSize() {
        const pulse = 1 + sin(time * this.pulseSpeed + this.phase) * 0.06;
        let scale = pulse;
        if (this.isHovered) scale *= 1.15;
        if (this.isDragging) scale *= 1.25;
        return this.baseSize * scale;
    }

    draw(time) {
        push();
        colorMode(HSB, 360, 100, 100, 1.0);
        const size = this.getCurrentSize();

        this.drawTrail();

        const ctx = drawingContext;
        colorMode(RGB);

        colorMode(HSB, 360, 100, 100);
        const mainColor = color(this.hue, this.saturation, this.brightness);
        const highlightColor = color(this.hue, this.saturation * 0.3, 100);
        const shadowColor = color(this.hue, this.saturation, this.brightness * 0.4);
        colorMode(RGB);

        const r = red(mainColor), g = green(mainColor), b = blue(mainColor);
        const hr = red(highlightColor), hg = green(highlightColor), hb = blue(highlightColor);
        const sr = red(shadowColor), sg = green(shadowColor), sb = blue(shadowColor);

        noStroke();
        const glowMult = (this.isHovered || this.isDragging) ? 1.8 : 1;

        // Multi-layer glow for ethereal effect
        for (let i = 8; i >= 1; i--) {
            const glowSize = size * (1 + i * 0.45 * this.glowIntensity) * glowMult;
            const alpha = (25 / (i * 1.2)) * this.glowIntensity * glowMult;
            fill(r, g, b, alpha);
            circle(this.x, this.y, glowSize);
        }

        // Glass-like orb with gradient
        const orbGrd = ctx.createRadialGradient(
            this.x - size * 0.2, this.y - size * 0.3, 0,
            this.x, this.y, size / 2
        );
        orbGrd.addColorStop(0, `rgba(${hr}, ${hg}, ${hb}, 0.95)`);
        orbGrd.addColorStop(0.2, `rgba(${r}, ${g}, ${b}, 0.92)`);
        orbGrd.addColorStop(0.7, `rgba(${r * 0.7}, ${g * 0.7}, ${b * 0.7}, 0.85)`);
        orbGrd.addColorStop(1, `rgba(${sr * 0.5}, ${sg * 0.5}, ${sb * 0.5}, 0.9)`);

        ctx.fillStyle = orbGrd;
        ctx.beginPath();
        ctx.arc(this.x, this.y, size / 2, 0, TWO_PI);
        ctx.fill();

        // Specular highlight for 3D effect
        const reflectSize = size * 0.7;
        const reflectGrd = ctx.createRadialGradient(
            this.x - size * 0.15, this.y - size * 0.2, 0,
            this.x - size * 0.1, this.y - size * 0.15, reflectSize / 2
        );
        reflectGrd.addColorStop(0, `rgba(255, 255, 255, 0.5)`);
        reflectGrd.addColorStop(0.3, `rgba(255, 255, 255, 0.15)`);
        reflectGrd.addColorStop(1, `rgba(255, 255, 255, 0)`);

        ctx.fillStyle = reflectGrd;
        ctx.beginPath();
        ctx.arc(this.x - size * 0.1, this.y - size * 0.15, reflectSize / 2, 0, TWO_PI);
        ctx.fill();

        // Bright point highlight
        fill(255, 255, 255, (this.isHovered || this.isDragging) ? 255 : 200);
        circle(this.x - size * 0.15, this.y - size * 0.2, size * 0.08);

        // Subtle rim light
        noFill();
        stroke(255, 255, 255, 30);
        strokeWeight(1.5);
        arc(this.x, this.y, size * 0.85, size * 0.85, PI + 0.3, TWO_PI - 0.3);

        pop();
    }

    drawTrail() {
        if (this.trail.length < 2) return;
        colorMode(HSB, 360, 100, 100, 1.0);
        noFill();
        beginShape();
        for (let i = 0; i < this.trail.length; i++) {
            const alpha = map(i, 0, this.trail.length, 0, 0.5 * this.glowIntensity);
            stroke(this.hue, this.saturation * 0.4, this.brightness, alpha);
            strokeWeight(map(i, 0, this.trail.length, 0.5, 3));
            vertex(this.trail[i].x, this.trail[i].y);
        }
        endShape();
        colorMode(RGB);
    }

    getBraKet() { return `|${this.bitstring}⟩`; }

    getEnergyLabel() {
        if (this.hammingWeight === 0) return "Ground State (n=0)";
        if (this.hammingWeight === this.numQubits) return "Max Excitation (n=" + this.numQubits + ")";
        return "Energy Level n=" + this.hammingWeight;
    }
}


// ═══════════════════════════════════════════════════════════════════════════
// p5.js Lifecycle
// ═══════════════════════════════════════════════════════════════════════════

function preload() {
    quantumData = loadJSON('quantum_data.json',
        (data) => {
            if (data.counts) { quantumData = data.counts; totalShots = data.total_shots || 100; }
            else { totalShots = Object.values(data).reduce((a, b) => a + b, 0); }
        },
        () => { loadError = true; }
    );
}

function setup() {
    const canvas = createCanvas(windowWidth, windowHeight);
    canvas.parent(document.querySelector('main') || document.body);

    if (loadError || !quantumData || Object.keys(quantumData).length === 0) {
        noLoop(); displayError(); return;
    }

    const counts = quantumData.counts || quantumData;
    if (totalShots === 0) totalShots = Object.values(counts).reduce((a, b) => a + b, 0);
    quantumData = counts;

    calculateShellRadii();
    createStarsAndNebula();
    initializeParticles();
    updateStatsBar();
    frameRate(60);
}

function calculateShellRadii() {
    const maxRadius = min(width, height) * 0.42;
    const minRadius = 60;
    SHELL_RADII = {
        0: minRadius,
        1: minRadius + (maxRadius - minRadius) * 0.2,
        2: minRadius + (maxRadius - minRadius) * 0.4,
        3: minRadius + (maxRadius - minRadius) * 0.6,
        4: minRadius + (maxRadius - minRadius) * 0.8,
        5: maxRadius
    };
}

function createStarsAndNebula() {
    stars = [];
    for (let i = 0; i < CONFIG.starCount; i++) {
        stars.push(new Star(width, height));
    }

    nebulaClouds = [];
    const nebulaData = [
        { x: 0.15, y: 0.25, hue: 260, size: 350 },
        { x: 0.85, y: 0.75, hue: 320, size: 400 },
        { x: 0.7, y: 0.15, hue: 200, size: 300 },
        { x: 0.25, y: 0.8, hue: 280, size: 350 }
    ];
    for (const n of nebulaData) {
        nebulaClouds.push(new NebulaCloud(width * n.x, height * n.y, n.hue, n.size));
    }
}

function initializeParticles() {
    const states = Object.keys(quantumData);
    numQubits = states[0]?.length || 5;
    globalMaxCount = Math.max(...Object.values(quantumData));

    // Group states by Hamming weight (energy level)
    const energyShells = {};
    const shellMaxCounts = {};
    for (const bitstring of states) {
        const hw = (bitstring.match(/1/g) || []).length;
        if (!energyShells[hw]) { energyShells[hw] = []; shellMaxCounts[hw] = 0; }
        energyShells[hw].push(bitstring);
        if (quantumData[bitstring] > shellMaxCounts[hw]) shellMaxCounts[hw] = quantumData[bitstring];
    }

    particles = [];
    for (const hw in energyShells) {
        const shellStates = energyShells[hw];
        shellStates.sort((a, b) => parseInt(a, 2) - parseInt(b, 2));
        for (let i = 0; i < shellStates.length; i++) {
            const bitstring = shellStates[i];
            particles.push(new QuantumOrb(
                bitstring, quantumData[bitstring], shellStates.length, i,
                globalMaxCount, totalShots, shellMaxCounts[hw]
            ));
        }
    }
    particles.sort((a, b) => b.baseSize - a.baseSize);

    // Set initial positions
    for (const p of particles) {
        p.updateTargetPosition(0);
        p.x = p.targetX;
        p.y = p.targetY;
    }
}

function updateStatsBar() {
    const statsEl = document.getElementById('stats-text');
    if (statsEl) {
        statsEl.textContent = `${particles.length} states | ${numQubits} qubits | ${totalShots} shots | EfficientSU2`;
    }
}

function draw() {
    time += 1;

    drawSpaceBackground();

    push();
    translate(width / 2, height / 2);

    drawOrbitalCircles();

    for (const p of particles) p.updateTargetPosition(time);

    const mx = mouseX - width / 2;
    const my = mouseY - height / 2;
    hoveredParticle = null;
    if (!draggedParticle) {
        for (let i = particles.length - 1; i >= 0; i--) {
            if (particles[i].checkHover(mx, my)) { hoveredParticle = particles[i]; break; }
        }
    }
    for (const p of particles) if (p !== hoveredParticle && p !== draggedParticle) p.isHovered = false;

    drawQuantumConnections();

    for (const p of particles) p.updatePhysics();
    for (const p of particles) p.draw(time);

    drawNucleus();

    pop();

    drawTitle();

    if (hoveredParticle && !draggedParticle) drawTooltip(hoveredParticle);
}

function drawSpaceBackground() {
    const ctx = drawingContext;
    const grd = ctx.createRadialGradient(width / 2, height / 2, 0, width / 2, height / 2, max(width, height) * 0.7);
    grd.addColorStop(0, 'rgb(12, 8, 25)');
    grd.addColorStop(0.3, 'rgb(8, 5, 18)');
    grd.addColorStop(0.6, 'rgb(5, 3, 12)');
    grd.addColorStop(1, 'rgb(2, 1, 5)');
    ctx.fillStyle = grd;
    ctx.fillRect(0, 0, width, height);

    for (const cloud of nebulaClouds) cloud.draw(time);
    for (const star of stars) star.draw(time);
}

/** Draw orbital paths as ethereal rings */
function drawOrbitalCircles() {
    push();

    for (let hw = 0; hw <= numQubits; hw++) {
        const radius = SHELL_RADII[hw];
        if (!radius) continue;

        const hasParticles = particles.some(p => p.hammingWeight === hw);
        if (hasParticles) {
            // Outer glow layers
            noFill();
            for (let i = 4; i >= 1; i--) {
                stroke(100, 150, 255, 15 / i);
                strokeWeight(2 + i * 3);
                circle(0, 0, radius * 2);
            }

            // Main visible orbit ring
            noFill();
            stroke(140, 180, 255, 80);
            strokeWeight(1.5);
            circle(0, 0, radius * 2);

            // Inner bright ring
            noFill();
            stroke(180, 200, 255, 40);
            strokeWeight(0.5);
            circle(0, 0, radius * 2);

            // Energy level label
            noStroke();
            fill(140, 170, 220, 180);
            textSize(12);
            textAlign(LEFT, CENTER);
            textFont('monospace');
            text(`n=${hw}`, radius + 15, 0);
        }
    }
    pop();
}

/** Draw quantum connections: lines between states differing by one qubit flip */
function drawQuantumConnections() {
    if (particles.length < 2) return;
    push();
    blendMode(ADD);
    for (let i = 0; i < particles.length; i++) {
        for (let j = i + 1; j < particles.length; j++) {
            const p1 = particles[i], p2 = particles[j];
            let diffBits = 0;
            for (let k = 0; k < p1.bitstring.length; k++) if (p1.bitstring[k] !== p2.bitstring[k]) diffBits++;
            if (diffBits === 1) {
                const d = dist(p1.x, p1.y, p2.x, p2.y);
                if (d < 280) {
                    const alpha = map(d, 0, 280, 55, 5);
                    colorMode(HSB, 360, 100, 100);
                    stroke((p1.hue + p2.hue) / 2, 40, 85, alpha / 255);
                    strokeWeight(map(d, 0, 280, 2.5, 0.5));
                    line(p1.x, p1.y, p2.x, p2.y);
                    colorMode(RGB);
                }
            }
        }
    }
    blendMode(BLEND);
    pop();
}

/** Draw the central nucleus: the origin of probability */
function drawNucleus() {
    const pulse = 1 + sin(time * 0.008) * 0.1;
    const size = 32 * pulse;

    const ctx = drawingContext;
    const grd = ctx.createRadialGradient(0, 0, 0, 0, 0, size);
    grd.addColorStop(0, 'rgba(255, 255, 255, 1)');
    grd.addColorStop(0.2, 'rgba(220, 200, 255, 0.9)');
    grd.addColorStop(0.5, 'rgba(150, 120, 220, 0.5)');
    grd.addColorStop(1, 'rgba(80, 50, 160, 0)');

    noStroke();
    ctx.fillStyle = grd;
    ctx.beginPath();
    ctx.arc(0, 0, size, 0, TWO_PI);
    ctx.fill();
}

function drawTitle() {
    push();
    textAlign(CENTER, TOP);

    drawingContext.shadowBlur = 45;
    drawingContext.shadowColor = 'rgba(180, 140, 255, 0.5)';

    fill(255, 255, 255);
    textSize(36);
    textStyle(ITALIC);
    textFont('Georgia, serif');
    text("THE QUANTUM CANVAS", width / 2, 24);

    drawingContext.shadowBlur = 0;

    fill(180, 170, 220);
    textSize(13);
    textStyle(NORMAL);
    text("Your Name → Quantum Fingerprint → Unique Universe", width / 2, 68);

    pop();
}


// ═══════════════════════════════════════════════════════════════════════════
// Tooltip: Revealing quantum properties on hover
// ═══════════════════════════════════════════════════════════════════════════

function drawTooltip(p) {
    const w = 210, h = 160;
    let tx = mouseX + 25, ty = mouseY - h / 2;
    if (tx + w > width - 15) tx = mouseX - w - 25;
    if (ty < 15) ty = 15;
    if (ty + h > height - 15) ty = height - h - 15;

    push();
    colorMode(HSB, 360, 100, 100);
    const c = color(p.hue, p.saturation, p.brightness);
    colorMode(RGB);

    drawingContext.shadowBlur = 25;
    drawingContext.shadowColor = `rgba(${red(c)}, ${green(c)}, ${blue(c)}, 0.5)`;

    fill(10, 10, 20, 250);
    stroke(red(c) * 0.4, green(c) * 0.4, blue(c) * 0.4, 180);
    strokeWeight(1.5);
    rect(tx, ty, w, h, 10);

    drawingContext.shadowBlur = 0;

    noStroke();
    fill(red(c), green(c), blue(c), 40);
    rect(tx, ty, w, 46, 10, 10, 0, 0);

    textFont('monospace');
    fill(255);
    textSize(24);
    textAlign(CENTER, TOP);
    text(p.getBraKet(), tx + w / 2, ty + 14);

    let y = ty + 56;
    const lineH = 22;
    textSize(11);
    textAlign(LEFT, TOP);

    const rows = [
        ["ENERGY", p.getEnergyLabel()],
        ["PROBABILITY", `${(p.probability * 100).toFixed(1)}%`],
        ["AMPLITUDE |ψ|", p.amplitude.toFixed(4)],
        ["PARITY", p.parity === 0 ? "Even" : "Odd"]
    ];

    for (const [label, val] of rows) {
        fill(130, 150, 200);
        text(label, tx + 14, y);
        fill(255);
        textAlign(RIGHT, TOP);
        text(val, tx + w - 14, y);
        textAlign(LEFT, TOP);
        y += lineH;
    }

    pop();
}


// ═══════════════════════════════════════════════════════════════════════════
// Interaction: Drag orbs to perturb their quantum states
// ═══════════════════════════════════════════════════════════════════════════

function mousePressed() {
    if (mouseButton !== LEFT) return;
    const mx = mouseX - width / 2, my = mouseY - height / 2;
    for (let i = particles.length - 1; i >= 0; i--) {
        const p = particles[i];
        if (dist(mx, my, p.x, p.y) < p.getCurrentSize() / 2 + 12) {
            draggedParticle = p;
            p.isDragging = true;
            break;
        }
    }
}

function mouseDragged() {
    if (draggedParticle) {
        draggedParticle.x = mouseX - width / 2;
        draggedParticle.y = mouseY - height / 2;
        draggedParticle.vx = 0;
        draggedParticle.vy = 0;
    }
}

function mouseReleased() {
    if (draggedParticle) {
        draggedParticle.isDragging = false;
        draggedParticle.vx = (mouseX - pmouseX) * 0.25;
        draggedParticle.vy = (mouseY - pmouseY) * 0.25;
        draggedParticle = null;
    }
}

function windowResized() {
    resizeCanvas(windowWidth, windowHeight);
    calculateShellRadii();
    createStarsAndNebula();

    for (const p of particles) {
        p.updateTargetPosition(time);
    }
}

function displayError() {
    background(8, 5, 15);
    fill(255, 100, 100);
    textAlign(CENTER, CENTER);
    textSize(20);
    text("⚛️ No Quantum Data", width / 2, height / 2 - 20);
    fill(150);
    textSize(14);
    text("Run: python -m src.quantum_canvas \"Your Name\"", width / 2, height / 2 + 20);
}