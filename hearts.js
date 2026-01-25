// ===== Floating Hearts Background =====
(function () {
    const hearts = ['❤️', '💕', '💗', '💖', '💝', '🤍', '💘', '💓'];

    function createFloatingHeart() {
        const container = document.getElementById('heartsContainer');
        if (!container) return;

        const heart = document.createElement('div');
        heart.className = 'floating-heart';
        heart.textContent = hearts[Math.floor(Math.random() * hearts.length)];
        heart.style.left = Math.random() * 100 + '%';
        heart.style.fontSize = (Math.random() * 20 + 15) + 'px';
        heart.style.animationDuration = (Math.random() * 5 + 8) + 's';
        heart.style.opacity = Math.random() * 0.3 + 0.2;

        container.appendChild(heart);

        setTimeout(() => heart.remove(), 13000);
    }

    // Start creating hearts
    function init() {
        setInterval(createFloatingHeart, 600);
        // Create initial batch
        for (let i = 0; i < 10; i++) {
            setTimeout(createFloatingHeart, i * 200);
        }
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
})();
