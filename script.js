document.addEventListener('DOMContentLoaded', () => {

    /* ---------- Footer year ---------- */
    const yearEl = document.getElementById('year');
    if (yearEl) yearEl.textContent = new Date().getFullYear();

    /* ---------- Loading Screen ---------- */
    const loader = document.getElementById('loadingScreen');
    window.addEventListener('load', () => {
        setTimeout(() => loader && loader.classList.add('hidden'), 500);
    });
    setTimeout(() => loader && loader.classList.add('hidden'), 2500);

    /* ---------- AOS ---------- */
    if (window.AOS) {
        AOS.init({ duration: 800, easing: 'ease-out-cubic', once: true, offset: 80 });
    }

    /* ---------- Smooth scrolling (Lenis) ---------- */
    let lenis;
    if (window.Lenis) {
        lenis = new Lenis({
            duration: 1.1,
            easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
            smoothWheel: true,
            wheelMultiplier: 1,
            touchMultiplier: 1.4
        });
        function raf(time) {
            lenis.raf(time);
            requestAnimationFrame(raf);
        }
        requestAnimationFrame(raf);
        lenis.on('scroll', () => { if (window.AOS) AOS.refreshHard && AOS.refreshHard(); });
    }

    document.querySelectorAll('a[href^="#"]').forEach(link => {
        link.addEventListener('click', (e) => {
            const targetId = link.getAttribute('href');
            if (targetId.length < 2) return;
            const target = document.querySelector(targetId);
            if (!target) return;
            e.preventDefault();
            if (lenis) {
                lenis.scrollTo(target, { offset: -80 });
            } else {
                window.scrollTo({ top: target.getBoundingClientRect().top + window.scrollY - 80, behavior: 'smooth' });
            }
            const nav = document.getElementById('navbarNav');
            if (nav && nav.classList.contains('show')) {
                bootstrap.Collapse.getOrCreateInstance(nav).hide();
            }
        });
    });

    /* ---------- Scroll UI States ---------- */
    const navbar = document.getElementById('navbar');
    const progressBar = document.getElementById('scrollProgress');
    const backToTop = document.getElementById('backToTop');

    function onScroll() {
        const scrollY = window.scrollY;
        if (navbar) navbar.classList.toggle('scrolled', scrollY > 40);
        if (backToTop) backToTop.classList.toggle('visible', scrollY > 500);
        if (progressBar) {
            const docHeight = document.documentElement.scrollHeight - window.innerHeight;
            const pct = docHeight > 0 ? (scrollY / docHeight) * 100 : 0;
            progressBar.style.width = pct + '%';
        }
    }
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();

    if (backToTop) {
        backToTop.addEventListener('click', () => {
            if (lenis) lenis.scrollTo(0); else window.scrollTo({ top: 0, behavior: 'smooth' });
        });
    }

    /* ---------- Counter animation ---------- */
    const counters = document.querySelectorAll('.counter-number');
    const counterObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (!entry.isIntersecting) return;
            const el = entry.target;
            const target = parseFloat(el.dataset.target);
            const suffix = el.dataset.suffix || '';
            const isFloat = String(target).includes('.');
            const duration = 1600;
            const start = performance.now();
            function tick(now) {
                const progress = Math.min((now - start) / duration, 1);
                const eased = 1 - Math.pow(1 - progress, 3);
                const value = target * eased;
                el.textContent = (isFloat ? value.toFixed(1) : Math.round(value)) + suffix;
                if (progress < 1) requestAnimationFrame(tick);
            }
            requestAnimationFrame(tick);
            counterObserver.unobserve(el);
        });
    }, { threshold: 0.5 });
    counters.forEach(c => counterObserver.observe(c));

    /* ---------- FAQ Accordion ---------- */
    const faqItems = document.querySelectorAll('.faq-item');
    faqItems.forEach(item => {
        const btn = item.querySelector('.faq-q');
        const answer = item.querySelector('.faq-a');
        const inner = item.querySelector('.faq-a-inner');
        if (item.classList.contains('active')) {
            answer.style.maxHeight = inner.scrollHeight + 'px';
        }
        btn.addEventListener('click', () => {
            const isActive = item.classList.contains('active');
            faqItems.forEach(other => {
                other.classList.remove('active');
                other.querySelector('.faq-a').style.maxHeight = null;
            });
            if (!isActive) {
                item.classList.add('active');
                answer.style.maxHeight = inner.scrollHeight + 'px';
            }
        });
    });
    window.addEventListener('resize', () => {
        const active = document.querySelector('.faq-item.active');
        if (active) {
            const inner = active.querySelector('.faq-a-inner');
            active.querySelector('.faq-a').style.maxHeight = inner.scrollHeight + 'px';
        }
    });

    /* ---------- Booking form ---------- */
    const bookingForm = document.getElementById('bookingForm');
    if (bookingForm) {
        bookingForm.addEventListener('submit', (e) => {
            e.preventDefault();
            if (!bookingForm.checkValidity()) {
                bookingForm.classList.add('was-validated');
                bookingForm.reportValidity();
                return;
            }
            const name = document.getElementById('fullName').value.trim();
            const email = document.getElementById('email').value.trim();
            const mobile = document.getElementById('mobile').value.trim();
            const guests = document.getElementById('guests').value;
            const checkin = document.getElementById('checkin').value;
            const checkout = document.getElementById('checkout').value;
            const message = document.getElementById('message').value.trim();

            const lines = [
                'Hello Astra Azul Goa! I would like to enquire about a booking.',
                '',
                `Name: ${name}`,
                `Email: ${email}`,
                `Mobile: ${mobile}`,
                `Guests: ${guests}`,
                `Check-in: ${checkin}`,
                `Check-out: ${checkout}`
            ];
            if (message) lines.push(`Special Requests: ${message}`);

            const text = encodeURIComponent(lines.join('\n'));
            window.open(`https://wa.me/917798294303?text=${text}`, '_blank');
        });
    }

    /* ---------- Reviews marquee ---------- */
    const track = document.getElementById('reviewsTrack');
    if (track) {
        track.addEventListener('touchstart', () => track.style.animationPlayState = 'paused');
        track.addEventListener('touchend', () => track.style.animationPlayState = 'running');
    }

    /* ---------- Experience Tracker Panel Tabs ---------- */
    const trackerItems = document.querySelectorAll(".tracker-item");
    const panels = document.querySelectorAll(".experience-panel");
    const progress = document.querySelector(".tracker-progress-fill");

    // Initialize initial bar status on load
    if (progress && trackerItems.length > 0) {
        progress.style.width = (1 / trackerItems.length) * 100 + "%";
    }

    trackerItems.forEach((item, index) => {
        item.addEventListener("click", () => {
            trackerItems.forEach(btn => btn.classList.remove("active"));
            panels.forEach(panel => panel.classList.remove("active"));

            item.classList.add("active");
            const targetPanel = document.getElementById(item.dataset.target);
            if (targetPanel) targetPanel.classList.add("active");

            if (progress && trackerItems.length > 0) {
                const percentage = ((index + 1) / trackerItems.length) * 100;
                progress.style.width = percentage + "%";
            }
        });
    });

    /* ---------- Static hero copy for fading backgrounds ---------- */
    const heroCarousel = document.getElementById('hero-carousel');
    const heroBadge = document.getElementById('heroBadge');
    const heroTitle = document.getElementById('heroTitle');
    const heroCta = document.getElementById('heroCta');

    if (heroCarousel && heroBadge && heroTitle && heroCta) {
        let heroTextTimer;
        const updateHeroContent = (slide) => {
            heroBadge.textContent = slide.dataset.heroBadge || '';
            heroTitle.replaceChildren(
                Object.assign(document.createElement('span'), {
                    className: 'hero-line hero-line-first',
                    textContent: slide.dataset.heroBefore || ''
                }),
                Object.assign(document.createElement('span'), {
                    className: 'accent-text hero-line hero-line-accent',
                    textContent: slide.dataset.heroAccent || ''
                }),
                Object.assign(document.createElement('span'), {
                    className: 'hero-line hero-line-last',
                    textContent: slide.dataset.heroAfter || ''
                })
            );
            heroCta.textContent = slide.dataset.heroCta || 'Discover More';
            heroCta.href = slide.dataset.heroHref || '#booking';
        };

        heroCarousel.addEventListener('slide.bs.carousel', (event) => {
            const slide = event.relatedTarget;
            const content = heroCarousel.querySelector('.hero-content');
            if (!slide || !content) return;

            clearTimeout(heroTextTimer);
            content.classList.add('is-changing');

            heroTextTimer = window.setTimeout(() => {
                updateHeroContent(slide);
                requestAnimationFrame(() => {
                    requestAnimationFrame(() => content.classList.remove('is-changing'));
                });
            }, 260);
        });
    }
});
