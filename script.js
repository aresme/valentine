// ===== Page Navigation =====
function goToPage(pageId) {
    document.querySelectorAll('.page').forEach(page => {
        page.classList.remove('active');
    });

    const targetPage = document.getElementById(pageId);
    if (targetPage) {
        targetPage.classList.add('active');

        // Re-trigger animations
        const fadeElements = targetPage.querySelectorAll('.fade-in');
        fadeElements.forEach(el => {
            el.style.animation = 'none';
            el.offsetHeight;
            el.style.animation = null;
        });

        // Initialize specific page features
        if (pageId === 'page10') {
            initCountdowns();
        }
    }
}

// ===== Sparkle Effect on Click =====
function createSparkle(e) {
    const sparkle = document.createElement('div');
    sparkle.style.cssText = `
        position: fixed;
        pointer-events: none;
        font-size: 20px;
        z-index: 9999;
        left: ${e.clientX}px;
        top: ${e.clientY}px;
        animation: sparkle 0.6s ease forwards;
    `;
    sparkle.textContent = '✨';
    document.body.appendChild(sparkle);
    setTimeout(() => sparkle.remove(), 600);
}

const sparkleStyle = document.createElement('style');
sparkleStyle.textContent = `
    @keyframes sparkle {
        0% { transform: scale(0) rotate(0deg); opacity: 1; }
        100% { transform: scale(1.5) rotate(180deg); opacity: 0; }
    }
`;
document.head.appendChild(sparkleStyle);

// ===== Memory Lane Gallery =====
function initializeGallery() {
    const polaroids = document.querySelectorAll('.polaroid');
    polaroids.forEach(card => {
        const rotation = Math.random() * 4 - 2;
        card.dataset.rotation = rotation;
        card.style.transform = `rotate(${rotation}deg)`;
    });
}

window.togglePolaroid = function(card) {
    document.querySelectorAll('.polaroid.active').forEach(c => {
        if (c !== card) c.classList.remove('active');
    });
    card.classList.toggle('active');
};

// ===== Love Coupons =====
window.redeemCoupon = function(card) {
    if (card.classList.contains('redeemed')) return;
    
    // Add animation
    card.style.transform = 'scale(1.1)';
    setTimeout(() => {
        card.classList.add('redeemed');
        card.style.transform = '';
        
        // Trigger confetti
        if (window.triggerConfetti) {
            const rect = card.getBoundingClientRect();
            window.triggerConfetti(rect.left + rect.width/2, rect.top + rect.height/2, 40);
        }
    }, 200);
};

// ===== Rose Counter Animation =====
let roseAnimationRunning = false;

window.startRoseAnimation = function() {
    if (roseAnimationRunning) return;
    roseAnimationRunning = true;

    const countElement = document.getElementById('roseCount');
    const messageElement = document.getElementById('roseMessage');
    const button = document.getElementById('sendRosesBtn');
    
    button.disabled = true;
    button.style.opacity = '0.5';
    
    let count = 0;
    const target = 100;
    const duration = 5000;
    const interval = duration / target;

    const messages = [
        'Watch the roses bloom...',
        'Each rose carries my love...',
        'Feeling the love yet? 💕',
        'Almost there...',
        'So much love for you! 💖'
    ];

    const animate = () => {
        if (count < target) {
            count++;
            countElement.textContent = count;
            
            // Update message at intervals
            if (count % 20 === 0) {
                const msgIndex = Math.floor(count / 20) - 1;
                if (messages[msgIndex]) {
                    messageElement.textContent = messages[msgIndex];
                }
            }
            
            // Create floating rose at intervals
            if (count % 5 === 0) {
                createFloatingRose();
            }
            
            setTimeout(animate, interval);
        } else {
            messageElement.textContent = '100 roses, all for you! 🌹💕';
            if (window.triggerConfetti) {
                window.triggerConfetti(window.innerWidth / 2, window.innerHeight / 2, 100);
            }
            button.textContent = 'SENT WITH LOVE 💝';
        }
    };
    
    animate();
};

function createFloatingRose() {
    const rose = document.createElement('div');
    rose.textContent = '🌹';
    rose.style.cssText = `
        position: fixed;
        font-size: ${Math.random() * 20 + 20}px;
        left: ${Math.random() * 100}%;
        bottom: -50px;
        z-index: 1000;
        animation: floatRose 3s ease-out forwards;
        pointer-events: none;
    `;
    document.body.appendChild(rose);
    setTimeout(() => rose.remove(), 3000);
}

// Add floating rose animation
const roseStyle = document.createElement('style');
roseStyle.textContent = `
    @keyframes floatRose {
        0% { transform: translateY(0) rotate(0deg); opacity: 1; }
        100% { transform: translateY(-100vh) rotate(360deg); opacity: 0; }
    }
`;
document.head.appendChild(roseStyle);

// ===== Countdown Timer =====
window.relationshipStartDate = null;

function initCountdowns() {
    updateValentineCountdown();
    updateTogetherCountdown();
    
    setInterval(updateValentineCountdown, 1000);
    setInterval(updateTogetherCountdown, 1000);
}

function updateValentineCountdown() {
    const now = new Date();
    let valentineDate = new Date(now.getFullYear(), 1, 14); // Feb 14
    
    // If Valentine's has passed this year, count to next year
    if (now > valentineDate) {
        valentineDate = new Date(now.getFullYear() + 1, 1, 14);
    }
    
    const diff = valentineDate - now;
    
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((diff % (1000 * 60)) / 1000);
    
    document.getElementById('vDays').textContent = String(days).padStart(2, '0');
    document.getElementById('vHours').textContent = String(hours).padStart(2, '0');
    document.getElementById('vMinutes').textContent = String(minutes).padStart(2, '0');
    document.getElementById('vSeconds').textContent = String(seconds).padStart(2, '0');
}

function updateTogetherCountdown() {
    const startDate = window.relationshipStartDate || new Date('2024-01-01');
    const now = new Date();
    const diff = now - startDate;
    
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    
    document.getElementById('daysTogether').textContent = days;
    
    const messages = [
        'Every day with you is a blessing',
        'And counting... 💕',
        `${days} days of pure happiness`,
        'Forever isn\'t long enough with you'
    ];
    
    document.getElementById('togetherMessage').textContent = messages[days % messages.length];
}

// ===== Keyboard Navigation =====
document.addEventListener('keydown', (e) => {
    if (e.key === 'ArrowRight') {
        const currentPage = document.querySelector('.page.active');
        const nextPage = currentPage.nextElementSibling;
        if (nextPage && nextPage.classList.contains('page')) {
            goToPage(nextPage.id);
        }
    }
    if (e.key === 'ArrowLeft') {
        const currentPage = document.querySelector('.page.active');
        const prevPage = currentPage.previousElementSibling;
        if (prevPage && prevPage.classList.contains('page')) {
            goToPage(prevPage.id);
        }
    }
});

// ===== Initialize =====
document.addEventListener('DOMContentLoaded', () => {
    initializeGallery();
    
    document.querySelectorAll('.btn, .gift-card').forEach(btn => {
        btn.addEventListener('click', createSparkle);
    });
});
