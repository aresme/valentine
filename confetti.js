// Confetti Animation Library - Valentine Edition
class Confetti {
    constructor() {
        this.canvas = null;
        this.ctx = null;
        this.particles = [];
        this.animationId = null;
        this.colors = ['#E91E63', '#FF69B4', '#FFD700', '#FF1493', '#F8BBD9', '#AD1457'];
    }

    init() {
        this.canvas = document.createElement('canvas');
        this.canvas.id = 'confetti-canvas';
        this.canvas.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            pointer-events: none;
            z-index: 99998;
        `;
        document.body.appendChild(this.canvas);
        this.ctx = this.canvas.getContext('2d');
        this.resize();
        window.addEventListener('resize', () => this.resize());
    }

    resize() {
        this.canvas.width = window.innerWidth;
        this.canvas.height = window.innerHeight;
    }

    createParticle(x, y) {
        const shapes = ['heart', 'circle', 'rect'];
        return {
            x: x || Math.random() * this.canvas.width,
            y: y || -10,
            size: Math.random() * 10 + 5,
            color: this.colors[Math.floor(Math.random() * this.colors.length)],
            speedX: (Math.random() - 0.5) * 8,
            speedY: Math.random() * 3 + 2,
            rotation: Math.random() * 360,
            rotationSpeed: (Math.random() - 0.5) * 10,
            shape: shapes[Math.floor(Math.random() * shapes.length)],
            opacity: 1
        };
    }

    drawHeart(x, y, size) {
        this.ctx.beginPath();
        const topCurveHeight = size * 0.3;
        this.ctx.moveTo(x, y + topCurveHeight);
        this.ctx.bezierCurveTo(x, y, x - size / 2, y, x - size / 2, y + topCurveHeight);
        this.ctx.bezierCurveTo(x - size / 2, y + (size + topCurveHeight) / 2, x, y + (size + topCurveHeight) / 2, x, y + size);
        this.ctx.bezierCurveTo(x, y + (size + topCurveHeight) / 2, x + size / 2, y + (size + topCurveHeight) / 2, x + size / 2, y + topCurveHeight);
        this.ctx.bezierCurveTo(x + size / 2, y, x, y, x, y + topCurveHeight);
        this.ctx.fill();
    }

    burst(x, y, count = 100) {
        if (!this.canvas) this.init();

        for (let i = 0; i < count; i++) {
            const particle = this.createParticle(x, y);
            particle.speedX = (Math.random() - 0.5) * 15;
            particle.speedY = (Math.random() - 0.5) * 15 - 5;
            this.particles.push(particle);
        }

        if (!this.animationId) {
            this.animate();
        }
    }

    rain(duration = 3000, intensity = 5) {
        if (!this.canvas) this.init();

        const startTime = Date.now();
        const addParticles = () => {
            if (Date.now() - startTime < duration) {
                for (let i = 0; i < intensity; i++) {
                    this.particles.push(this.createParticle());
                }
                setTimeout(addParticles, 50);
            }
        };

        addParticles();

        if (!this.animationId) {
            this.animate();
        }
    }

    animate() {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

        this.particles = this.particles.filter(p => {
            p.x += p.speedX;
            p.y += p.speedY;
            p.speedY += 0.1;
            p.rotation += p.rotationSpeed;
            p.speedX *= 0.99;

            if (p.y > this.canvas.height - 100) {
                p.opacity -= 0.02;
            }

            if (p.opacity > 0) {
                this.ctx.save();
                this.ctx.translate(p.x, p.y);
                this.ctx.rotate(p.rotation * Math.PI / 180);
                this.ctx.globalAlpha = p.opacity;
                this.ctx.fillStyle = p.color;

                if (p.shape === 'heart') {
                    this.drawHeart(0, 0, p.size);
                } else if (p.shape === 'rect') {
                    this.ctx.fillRect(-p.size / 2, -p.size / 4, p.size, p.size / 2);
                } else {
                    this.ctx.beginPath();
                    this.ctx.arc(0, 0, p.size / 2, 0, Math.PI * 2);
                    this.ctx.fill();
                }

                this.ctx.restore();
            }

            return p.y < this.canvas.height + 50 && p.opacity > 0;
        });

        if (this.particles.length > 0) {
            this.animationId = requestAnimationFrame(() => this.animate());
        } else {
            this.animationId = null;
        }
    }

    setColors(themeColors) {
        if (themeColors && themeColors.length > 0) {
            this.colors = themeColors;
        }
    }
}

// Create global instance
window.confetti = new Confetti();

window.triggerConfetti = function (x, y, count) {
    window.confetti.burst(x || window.innerWidth / 2, y || window.innerHeight / 3, count || 80);
};

window.startConfettiRain = function (duration, intensity) {
    window.confetti.rain(duration || 3000, intensity || 5);
};
