// js/sound.js
const AudioContext = window.AudioContext || window.webkitAudioContext;
let audioCtx = null;
window.soundEnabled = false;

document.addEventListener("DOMContentLoaded", () => {
    const navLeft = document.querySelector('.nav-left');
    if (navLeft) {
        const soundToggle = document.createElement('div');
        soundToggle.className = 'nav-status sound-toggle';
        soundToggle.style.cursor = 'pointer';
        soundToggle.innerHTML = '<span class="status-dot" style="background: red; animation: none;"></span><span class="status-text" style="color: red;">SND.OFF</span>';
        navLeft.appendChild(soundToggle);

        soundToggle.addEventListener('click', () => {
            if (!audioCtx) {
                audioCtx = new AudioContext();
            }
            if (audioCtx.state === 'suspended') {
                audioCtx.resume();
            }
            
            window.soundEnabled = !window.soundEnabled;
            const dot = soundToggle.querySelector('.status-dot');
            const text = soundToggle.querySelector('.status-text');
            
            if (window.soundEnabled) {
                dot.style.background = '#00ff00';
                dot.style.animation = 'blink 1.5s infinite';
                text.style.color = '#00ff00';
                text.innerText = 'SND.ON';
                playBootSound();
            } else {
                dot.style.background = 'red';
                dot.style.animation = 'none';
                text.style.color = 'red';
                text.innerText = 'SND.OFF';
            }
        });
    }
});

function playTick(type = 'hover') {
    if (!window.soundEnabled || !audioCtx) return;

    const osc = audioCtx.createOscillator();
    const gainNode = audioCtx.createGain();

    osc.connect(gainNode);
    gainNode.connect(audioCtx.destination);

    if (type === 'hover') {
        // High pitched short mechanical tick
        osc.type = 'sine';
        osc.frequency.setValueAtTime(800 + Math.random() * 200, audioCtx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(100, audioCtx.currentTime + 0.05);
        gainNode.gain.setValueAtTime(0.03, audioCtx.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.05);
        osc.start();
        osc.stop(audioCtx.currentTime + 0.05);
    } else if (type === 'type') {
        // Mechanical clack for typing
        osc.type = 'square';
        osc.frequency.setValueAtTime(150 + Math.random() * 50, audioCtx.currentTime);
        gainNode.gain.setValueAtTime(0.015, audioCtx.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.03);
        osc.start();
        osc.stop(audioCtx.currentTime + 0.03);
    }
}

function playBootSound() {
    if (!window.soundEnabled || !audioCtx) return;
    const osc = audioCtx.createOscillator();
    const gainNode = audioCtx.createGain();
    osc.connect(gainNode);
    gainNode.connect(audioCtx.destination);
    
    osc.type = 'square';
    osc.frequency.setValueAtTime(440, audioCtx.currentTime);
    osc.frequency.setValueAtTime(880, audioCtx.currentTime + 0.1);
    
    gainNode.gain.setValueAtTime(0.03, audioCtx.currentTime);
    gainNode.gain.linearRampToValueAtTime(0, audioCtx.currentTime + 0.2);
    
    osc.start();
    osc.stop(audioCtx.currentTime + 0.2);
}

// Bind hover events to interactive elements
document.addEventListener("mouseover", (e) => {
    if (e.target.closest('a') || e.target.closest('.sidebar-item') || e.target.closest('.faq-header') || e.target.closest('button') || e.target.closest('.btn-cta-nav')) {
        playTick('hover');
    }
});

// Export typing sound globally
window.playTypingSound = () => playTick('type');
