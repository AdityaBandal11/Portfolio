// ===================================
// PARTICLE ANIMATION BACKGROUND
// ===================================

const canvas = document.getElementById('particle-canvas');
const ctx = canvas.getContext('2d');

// Set canvas size
function resizeCanvas() {
    canvas.width = window.innerWidth;
    canvas.height = document.documentElement.scrollHeight;
}
resizeCanvas();
window.addEventListener('resize', resizeCanvas);

// Particle system
const particles = [];
const particleCount = 100;
const mouse = { x: null, y: null, radius: 150 };

class Particle {
    constructor() {
        this.x = Math.random() * canvas.width;
        this.y = Math.random() * canvas.height;
        this.size = Math.random() * 3 + 1;
        this.speedX = Math.random() * 0.4 - 0.2; // Slower (was 1 - 0.5)
        this.speedY = Math.random() * 0.4 - 0.2; // Slower (was 1 - 0.5)
        const colors = [
            `rgba(0, 255, 255, ${Math.random() * 0.4 + 0.2})`, // Cyan
            `rgba(255, 0, 255, ${Math.random() * 0.4 + 0.2})`, // Magenta
            `rgba(0, 136, 255, ${Math.random() * 0.4 + 0.2})`  // Blue
        ];
        this.color = colors[Math.floor(Math.random() * colors.length)];
    }

    update() {
        this.x += this.speedX;
        this.y += this.speedY;

        // Mouse interaction - particles move away from cursor (smoother)
        const dx = mouse.x - this.x;
        const dy = mouse.y - this.y;
        const distance = Math.sqrt(dx * dx + dy * dy);

        if (distance < mouse.radius) {
            const force = (mouse.radius - distance) / mouse.radius;
            const angle = Math.atan2(dy, dx);
            this.x -= Math.cos(angle) * force * 2; // Gentler force (was 3)
            this.y -= Math.sin(angle) * force * 2; // Gentler force (was 3)
        }

        // Wrap around edges
        if (this.x > canvas.width) this.x = 0;
        if (this.x < 0) this.x = canvas.width;
        if (this.y > canvas.height) this.y = 0;
        if (this.y < 0) this.y = canvas.height;
    }

    draw() {
        ctx.fillStyle = this.color;
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
        ctx.fill();
    }
}

// Initialize particles
for (let i = 0; i < particleCount; i++) {
    particles.push(new Particle());
}

// Connect particles with lines
function connectParticles() {
    for (let i = 0; i < particles.length; i++) {
        for (let j = i + 1; j < particles.length; j++) {
            const dx = particles[i].x - particles[j].x;
            const dy = particles[i].y - particles[j].y;
            const distance = Math.sqrt(dx * dx + dy * dy);

            if (distance < 120) {
                const opacity = (120 - distance) / 120;
                ctx.strokeStyle = `rgba(0, 255, 255, ${opacity * 0.3})`; // Cyan neon lines
                ctx.lineWidth = 1;
                ctx.beginPath();
                ctx.moveTo(particles[i].x, particles[i].y);
                ctx.lineTo(particles[j].x, particles[j].y);
                ctx.stroke();
            }
        }
    }
}

// Animation loop
function animateParticles() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    particles.forEach(particle => {
        particle.update();
        particle.draw();
    });

    connectParticles();
    requestAnimationFrame(animateParticles);
}

animateParticles();

// Mouse move event
window.addEventListener('mousemove', (e) => {
    mouse.x = e.x;
    mouse.y = e.y + window.scrollY;
});

// Mouse leave event
window.addEventListener('mouseout', () => {
    mouse.x = null;
    mouse.y = null;
});

// Update canvas height on scroll
let scrollTimeout;
window.addEventListener('scroll', () => {
    clearTimeout(scrollTimeout);
    scrollTimeout = setTimeout(() => {
        canvas.height = document.documentElement.scrollHeight;
    }, 100);
});

// ===================================
// DOTTED WAVE BACKGROUND (HERO SECTION)
// ===================================

const dottedCanvas = document.getElementById('dotted-wave-canvas');
if (dottedCanvas) {
    const dottedCtx = dottedCanvas.getContext('2d');

    // Set canvas size for hero section
    function resizeDottedCanvas() {
        const hero = document.querySelector('.hero');
        if (hero) {
            dottedCanvas.width = hero.offsetWidth;
            dottedCanvas.height = hero.offsetHeight;
        }
    }
    resizeDottedCanvas();
    window.addEventListener('resize', resizeDottedCanvas);

    // Dot grid configuration
    const dotSpacing = 10; // Increased density (was 30)
    const dotSize = 3;
    const waveRadius = 250; // Even larger radius for very smooth effect (was 180)
    const waveHeight = 2; // Even smaller height for ultra-subtle wave (was 15)
    const dots = [];

    // Create dot grid
    for (let x = 0; x < dottedCanvas.width; x += dotSpacing) {
        for (let y = 0; y < dottedCanvas.height; y += dotSpacing) {
            dots.push({
                x: x,
                y: y,
                baseY: y,
                currentY: y,
                velocity: 0
            });
        }
    }

    // Mouse position for hero section
    const heroMouse = { x: null, y: null };

    // Track mouse in hero section
    const heroSection = document.querySelector('.hero');
    if (heroSection) {
        heroSection.addEventListener('mousemove', (e) => {
            const rect = heroSection.getBoundingClientRect();
            heroMouse.x = e.clientX - rect.left;
            heroMouse.y = e.clientY - rect.top;
        });

        heroSection.addEventListener('mouseleave', () => {
            heroMouse.x = null;
            heroMouse.y = null;
        });
    }

    // Animate dotted wave
    function animateDottedWave() {
        dottedCtx.clearRect(0, 0, dottedCanvas.width, dottedCanvas.height);

        dots.forEach(dot => {
            // Calculate distance from mouse
            if (heroMouse.x !== null && heroMouse.y !== null) {
                const dx = dot.x - heroMouse.x;
                const dy = dot.baseY - heroMouse.y;
                const distance = Math.sqrt(dx * dx + dy * dy);

                // Create smooth wave effect
                if (distance < waveRadius) {
                    const force = (waveRadius - distance) / waveRadius;
                    const targetY = dot.baseY - (Math.sin(force * Math.PI) * waveHeight);

                    // Spring physics for very smooth movement
                    const diff = targetY - dot.currentY;
                    dot.velocity += diff * 0.12; // Much gentler spring (was 0.2)
                    dot.velocity *= 0.92; // More damping for smoothness (was 0.9)
                } else {
                    // Return to base position
                    const diff = dot.baseY - dot.currentY;
                    dot.velocity += diff * 0.06; // Even slower return (was 0.08)
                    dot.velocity *= 0.92;
                }
            } else {
                // No mouse - return to base
                const diff = dot.baseY - dot.currentY;
                dot.velocity += diff * 0.06;
                dot.velocity *= 0.92;
            }

            // Update position
            dot.currentY += dot.velocity;

            // Calculate opacity and glow based on distance from mouse
            let opacity = 0.25; // More subtle base opacity
            let glowRadius = 0;
            if (heroMouse.x !== null && heroMouse.y !== null) {
                const dx = dot.x - heroMouse.x;
                const dy = dot.currentY - heroMouse.y;
                const distance = Math.sqrt(dx * dx + dy * dy);
                if (distance < waveRadius) {
                    const proximity = 1 - distance / waveRadius;
                    opacity = 0.25 + proximity * 0.5; // Subtle opacity change
                    glowRadius = proximity * 3; // Light glow effect
                }
            }

            // Draw dot with glow
            if (glowRadius > 0) {
                dottedCtx.shadowBlur = glowRadius * 4;
                dottedCtx.shadowColor = `rgba(0, 255, 255, ${opacity * 1.2})`;
            } else {
                dottedCtx.shadowBlur = 0;
            }

            // Cyberpunk neon color scheme - alternating cyan and magenta
            const colorIndex = (Math.floor(dot.x / 40) + Math.floor(dot.baseY / 40)) % 2;
            const color = colorIndex === 0
                ? `rgba(0, 255, 255, ${opacity})`  // Cyan
                : `rgba(255, 0, 255, ${opacity * 0.7})`; // Magenta (slightly dimmer)

            dottedCtx.fillStyle = color;
            dottedCtx.beginPath();
            dottedCtx.arc(dot.x, dot.currentY, dotSize, 0, Math.PI * 2);
            dottedCtx.fill();
        });

        requestAnimationFrame(animateDottedWave);
    }

    animateDottedWave();
}

// ===================================
// SMOOTH SCROLLING & NAVIGATION
// ===================================

// Smooth scrolling for navigation links
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        const target = document.querySelector(this.getAttribute('href'));
        if (target) {
            target.scrollIntoView({
                behavior: 'smooth',
                block: 'start'
            });
        }
    });
});

// Add scroll reveal animation for sections
const observerOptions = {
    threshold: 0.1,
    rootMargin: '0px 0px -100px 0px'
};

const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.style.opacity = '1';
            entry.target.style.transform = 'translateY(0)';
        }
    });
}, observerOptions);

// Observe all sections
document.querySelectorAll('section').forEach(section => {
    section.style.opacity = '0';
    section.style.transform = 'translateY(30px)';
    section.style.transition = 'opacity 0.8s ease, transform 0.8s ease';
    observer.observe(section);
});

// Hero section is always visible (no animation delay)
const heroSection = document.querySelector('.hero');
if (heroSection) {
    heroSection.style.opacity = '1';
    heroSection.style.transform = 'translateY(0)';
}

// Parallax effect for hero section
window.addEventListener('scroll', () => {
    const scrolled = window.pageYOffset;
    const heroContent = document.querySelector('.hero-content');
    if (heroContent) {
        heroContent.style.transform = `translateY(${scrolled * 0.5}px)`;
        heroContent.style.opacity = 1 - scrolled / 600;
    }
});

// Enhanced hover effect for cards
const cards = document.querySelectorAll('.skill, .project, .publication, .achievement');
cards.forEach(card => {
    card.addEventListener('mousemove', (e) => {
        const rect = card.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;

        const centerX = rect.width / 2;
        const centerY = rect.height / 2;

        const rotateX = (y - centerY) / 20;
        const rotateY = (centerX - x) / 20;

        card.style.transform = `perspective(1000px) rotateX(${-rotateX}deg) rotateY(${rotateY}deg) translateY(-10px)`;
    });

    card.addEventListener('mouseleave', () => {
        card.style.transform = '';
    });
});

// Form submission handler
const form = document.querySelector('form');
if (form) {
    form.addEventListener('submit', function (e) {
        e.preventDefault();

        const button = this.querySelector('button[type="submit"]');
        const originalText = button.innerHTML;

        // Animate button
        button.innerHTML = '<span>Sending...</span>';
        button.style.background = 'linear-gradient(135deg, #10b981 0%, #059669 100%)';

        // Simulate sending (replace with actual form submission logic)
        setTimeout(() => {
            button.innerHTML = '<span>Sent! ✓</span>';

            setTimeout(() => {
                button.innerHTML = originalText;
                button.style.background = '';
                form.reset();
            }, 2000);
        }, 1500);
    });
}

// Add dynamic gradient to hero text
const gradientText = document.querySelector('.gradient-text');
if (gradientText) {
    let hue = 0;
    setInterval(() => {
        hue = (hue + 1) % 360;
        // Keep the shimmer animation natural, no need for dynamic changes
    }, 50);
}

// Cursor trail effect
const createTrail = (e) => {
    const trail = document.createElement('div');
    trail.className = 'cursor-trail';
    trail.style.left = e.pageX + 'px';
    trail.style.top = e.pageY + 'px';
    document.body.appendChild(trail);

    setTimeout(() => {
        trail.remove();
    }, 1000);
};

// Throttle cursor trail to avoid performance issues
let lastTrail = 0;
document.addEventListener('mousemove', (e) => {
    const now = Date.now();
    if (now - lastTrail > 50) {
        lastTrail = now;
        // Uncomment below line if you want cursor trail effect
        // createTrail(e);
    }
});

// Active navigation link highlighting
const sections = document.querySelectorAll('section[id]');
const navLinks = document.querySelectorAll('.nav-links a');

window.addEventListener('scroll', () => {
    let current = '';

    sections.forEach(section => {
        const sectionTop = section.offsetTop;
        const sectionHeight = section.clientHeight;
        if (pageYOffset >= sectionTop - 200) {
            current = section.getAttribute('id');
        }
    });

    navLinks.forEach(link => {
        link.style.color = '';
        link.style.background = '';
        if (link.getAttribute('href') === `#${current}`) {
            link.style.color = '#667eea';
            link.style.background = 'rgba(102, 126, 234, 0.1)';
        }
    });
});

console.log('Portfolio loaded successfully! 🚀');