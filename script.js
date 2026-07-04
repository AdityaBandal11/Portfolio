(function () {
    document.documentElement.classList.add('has-js');

    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    function setupNavigation() {
        const toggle = document.querySelector('.nav-toggle');
        const nav = document.querySelector('.nav-links');
        const page = document.body.dataset.page;

        document.querySelectorAll('[data-nav]').forEach((link) => {
            if (link.dataset.nav === page) {
                link.classList.add('is-active');
                link.setAttribute('aria-current', 'page');
            }
        });

        if (!toggle || !nav) return;

        const closeMenu = () => {
            toggle.classList.remove('is-open');
            nav.classList.remove('is-open');
            toggle.setAttribute('aria-expanded', 'false');
        };

        toggle.addEventListener('click', () => {
            const isOpen = nav.classList.toggle('is-open');
            toggle.classList.toggle('is-open', isOpen);
            toggle.setAttribute('aria-expanded', String(isOpen));
        });

        nav.addEventListener('click', (event) => {
            if (event.target.closest('a')) {
                closeMenu();
            }
        });

        document.addEventListener('keydown', (event) => {
            if (event.key === 'Escape') {
                closeMenu();
            }
        });
    }

    function setupReveal() {
        const items = document.querySelectorAll('.reveal');
        if (!items.length) return;

        if (prefersReducedMotion || !('IntersectionObserver' in window)) {
            items.forEach((item) => item.classList.add('is-visible'));
            return;
        }

        const observer = new IntersectionObserver((entries) => {
            entries.forEach((entry) => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('is-visible');
                    observer.unobserve(entry.target);
                }
            });
        }, {
            threshold: 0.14,
            rootMargin: '0px 0px -60px 0px'
        });

        items.forEach((item) => observer.observe(item));
    }

    function setupCounters() {
        const counters = document.querySelectorAll('.count-up');
        if (!counters.length) return;

        const animateCounter = (counter) => {
            const target = Number(counter.dataset.target || 0);
            const decimals = Number(counter.dataset.decimals || 0);
            const duration = 1100;
            const start = performance.now();

            const tick = (now) => {
                const progress = Math.min((now - start) / duration, 1);
                const eased = 1 - Math.pow(1 - progress, 3);
                counter.textContent = (target * eased).toFixed(decimals);

                if (progress < 1) {
                    requestAnimationFrame(tick);
                } else {
                    counter.textContent = target.toFixed(decimals);
                }
            };

            requestAnimationFrame(tick);
        };

        if (prefersReducedMotion || !('IntersectionObserver' in window)) {
            counters.forEach((counter) => {
                const target = Number(counter.dataset.target || 0);
                const decimals = Number(counter.dataset.decimals || 0);
                counter.textContent = target.toFixed(decimals);
            });
            return;
        }

        const observer = new IntersectionObserver((entries) => {
            entries.forEach((entry) => {
                if (entry.isIntersecting) {
                    animateCounter(entry.target);
                    observer.unobserve(entry.target);
                }
            });
        }, { threshold: 0.7 });

        counters.forEach((counter) => observer.observe(counter));
    }

    function setupTilt() {
        if (prefersReducedMotion || !window.matchMedia('(pointer: fine)').matches) return;

        document.querySelectorAll('.tilt').forEach((card) => {
            card.addEventListener('mousemove', (event) => {
                const rect = card.getBoundingClientRect();
                const x = event.clientX - rect.left;
                const y = event.clientY - rect.top;
                const rotateY = ((x / rect.width) - 0.5) * 7;
                const rotateX = ((0.5 - (y / rect.height)) * 7);

                card.style.transform = `perspective(900px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) translateY(-4px)`;
            });

            card.addEventListener('mouseleave', () => {
                card.style.transform = '';
            });
        });
    }

    function setupContactForm() {
        const form = document.querySelector('[data-contact-form]');
        if (!form) return;

        form.addEventListener('submit', (event) => {
            event.preventDefault();
            const formData = new FormData(form);
            const name = String(formData.get('name') || '').trim();
            const email = String(formData.get('email') || '').trim();
            const message = String(formData.get('message') || '').trim();
            const note = form.querySelector('[data-form-note]');

            const subject = encodeURIComponent(`Portfolio message from ${name || 'visitor'}`);
            const body = encodeURIComponent(`${message}\n\nFrom: ${name}\nEmail: ${email}`);
            window.location.href = `mailto:adityabandal120@gmail.com?subject=${subject}&body=${body}`;

            if (note) {
                note.textContent = 'Opening your email app with the message ready.';
            }
        });
    }

    function setupAmbientCanvas() {
        if (prefersReducedMotion) return;

        const canvas = document.getElementById('ambient-canvas');
        if (!canvas) return;

        const ctx = canvas.getContext('2d');
        const pointer = { x: -1000, y: -1000 };
        let width = 0;
        let height = 0;
        let particles = [];
        let animationFrame = 0;

        function resize() {
            const dpr = Math.min(window.devicePixelRatio || 1, 2);
            width = window.innerWidth;
            height = window.innerHeight;
            canvas.width = Math.floor(width * dpr);
            canvas.height = Math.floor(height * dpr);
            canvas.style.width = `${width}px`;
            canvas.style.height = `${height}px`;
            ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

            const count = Math.min(86, Math.max(36, Math.floor((width * height) / 19000)));
            particles = Array.from({ length: count }, () => ({
                x: Math.random() * width,
                y: Math.random() * height,
                vx: (Math.random() - 0.5) * 0.38,
                vy: (Math.random() - 0.5) * 0.38,
                size: Math.random() * 1.8 + 0.8,
                tone: Math.random()
            }));
        }

        function drawParticle(particle) {
            const color = particle.tone > 0.66 ? '79, 224, 181' : particle.tone > 0.33 ? '97, 182, 255' : '240, 196, 90';
            ctx.beginPath();
            ctx.fillStyle = `rgba(${color}, 0.62)`;
            ctx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2);
            ctx.fill();
        }

        function step() {
            ctx.clearRect(0, 0, width, height);

            for (let i = 0; i < particles.length; i += 1) {
                const particle = particles[i];
                particle.x += particle.vx;
                particle.y += particle.vy;

                const dx = particle.x - pointer.x;
                const dy = particle.y - pointer.y;
                const distance = Math.sqrt(dx * dx + dy * dy);
                if (distance < 130) {
                    const push = (130 - distance) / 130;
                    particle.x += (dx / Math.max(distance, 1)) * push * 1.8;
                    particle.y += (dy / Math.max(distance, 1)) * push * 1.8;
                }

                if (particle.x < -20) particle.x = width + 20;
                if (particle.x > width + 20) particle.x = -20;
                if (particle.y < -20) particle.y = height + 20;
                if (particle.y > height + 20) particle.y = -20;

                drawParticle(particle);
            }

            for (let i = 0; i < particles.length; i += 1) {
                for (let j = i + 1; j < particles.length; j += 1) {
                    const a = particles[i];
                    const b = particles[j];
                    const dx = a.x - b.x;
                    const dy = a.y - b.y;
                    const distance = Math.sqrt(dx * dx + dy * dy);

                    if (distance < 118) {
                        ctx.beginPath();
                        ctx.strokeStyle = `rgba(151, 177, 205, ${(1 - distance / 118) * 0.18})`;
                        ctx.lineWidth = 1;
                        ctx.moveTo(a.x, a.y);
                        ctx.lineTo(b.x, b.y);
                        ctx.stroke();
                    }
                }
            }

            animationFrame = requestAnimationFrame(step);
        }

        resize();
        step();

        window.addEventListener('resize', resize);
        window.addEventListener('mousemove', (event) => {
            pointer.x = event.clientX;
            pointer.y = event.clientY;
        });
        window.addEventListener('mouseleave', () => {
            pointer.x = -1000;
            pointer.y = -1000;
        });
        window.addEventListener('beforeunload', () => cancelAnimationFrame(animationFrame));
    }

    setupNavigation();
    setupReveal();
    setupCounters();
    setupTilt();
    setupContactForm();
    setupAmbientCanvas();
}());
