document.addEventListener('DOMContentLoaded', () => {
    // Scroll progress bar
    const progressBar = document.createElement('div');
    progressBar.className = 'scroll-progress';
    document.body.appendChild(progressBar);

    const updateScrollProgress = () => {
        const winScroll = document.body.scrollTop || document.documentElement.scrollTop;
        const height = document.documentElement.scrollHeight - document.documentElement.clientHeight;
        const scrolled = (winScroll / height) * 100;
        progressBar.style.width = scrolled + "%";
    };

    // Dynamisches Jahr im Footer setzen
    const yearSpan = document.getElementById('current-year');
    if (yearSpan) yearSpan.textContent = new Date().getFullYear();

    // Navbar scroll effect
    const navbar = document.querySelector('.navbar');
    const backToTop = document.querySelector('.back-to-top');

    let scrollTicking = false;
    window.addEventListener('scroll', () => {
        if (!scrollTicking) {
            window.requestAnimationFrame(() => {
                updateScrollProgress();
                const scrollY = window.scrollY;

                if (scrollY > 50) {
                    navbar.classList.add('scrolled');
                } else {
                    navbar.classList.remove('scrolled');
                }

                if (backToTop) {
                    if (scrollY > 500) {
                        backToTop.classList.add('visible');
                    } else {
                        backToTop.classList.remove('visible');
                    }
                }

                scrollTicking = false;
            });
            scrollTicking = true;
        }
    }, { passive: true });

    // Mobile menu toggle
    const mobileToggle = document.querySelector('.mobile-toggle');
    const navLinks = document.querySelector('.nav-links');

    if (mobileToggle && navLinks) {
        mobileToggle.addEventListener('click', () => {
            const isActive = navLinks.classList.toggle('active');
            mobileToggle.setAttribute('aria-expanded', isActive);
            mobileToggle.innerHTML = isActive ? '✕' : '☰';
        });

        document.querySelectorAll('.nav-links a').forEach(link => {
            link.addEventListener('click', () => {
                navLinks.classList.remove('active');
                mobileToggle.setAttribute('aria-expanded', 'false');
                mobileToggle.innerHTML = '☰';
            });
        });
    }

    // Performance Optimized Observers
    const sections = document.querySelectorAll('section, header');
    const navLinksItems = document.querySelectorAll('.nav-links a');
    const reveals = document.querySelectorAll('.reveal');

    // 1. Reveal on Scroll Observer
    const revealObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('active');
                revealObserver.unobserve(entry.target); // Reveal only once
            }
        });
    }, { threshold: 0.1, rootMargin: '0px 0px -50px 0px' });
    reveals.forEach(r => revealObserver.observe(r));

    // 2. Active Section Highlight Observer
    const sectionObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const id = entry.target.getAttribute('id');
                if (id) {
                    navLinksItems.forEach(link => {
                        link.classList.toggle('active', link.getAttribute('href') === `#${id}`);
                    });
                }
            }
        });
    }, { threshold: 0.5 }); // High threshold to ensure it's the main section
    sections.forEach(s => sectionObserver.observe(s));

    // Setup Modals
    const roomCards = document.querySelectorAll('.room-card');
    const modalOverlay = document.querySelector('.modal-overlay');
    const modalClose = document.querySelector('.modal-close');
    const modalBody = document.querySelector('.modal-body');

    if (modalOverlay && modalClose && modalBody) {
        const roomKeys = ['wohnzimmer', 'kueche', 'schlafzimmer', 'bad', 'gang', 'allgemein'];
        const roomContents = {};
        roomKeys.forEach(key => {
            const tmpl = document.getElementById(`content-${key}`);
            roomContents[key] = tmpl ? tmpl.innerHTML : '';
        });

        const openRoomModal = (roomKey) => {
            if (!roomContents[roomKey]) return;

            modalBody.innerHTML = roomContents[roomKey];

            // Modal Navigation
            const currentIndex = roomKeys.indexOf(roomKey);
            const prevIndex = (currentIndex - 1 + roomKeys.length) % roomKeys.length;
            const nextIndex = (currentIndex + 1) % roomKeys.length;

            const navDiv = document.createElement('div');
            navDiv.className = 'modal-nav';

            /** @type {string} */
            const lang = window.i18n ? window.i18n.getLang() : 'de';
            /** @type {object} */
            const currentTranslations = window.translations?.[lang] || {};

            const prevBtn = document.createElement('button');
            prevBtn.className = 'modal-nav-btn';
            prevBtn.innerHTML = `← ${currentTranslations['room_' + roomKeys[prevIndex]] || 'Back'}`;
            prevBtn.onclick = () => openRoomModal(roomKeys[prevIndex]);

            const nextBtn = document.createElement('button');
            nextBtn.className = 'modal-nav-btn';
            nextBtn.innerHTML = `${currentTranslations['room_' + roomKeys[nextIndex]] || 'Next'} →`;
            nextBtn.onclick = () => openRoomModal(roomKeys[nextIndex]);

            navDiv.appendChild(prevBtn);
            navDiv.appendChild(nextBtn);
            modalBody.appendChild(navDiv);

            if (window.i18n) window.i18n.apply(window.i18n.getLang(), modalBody);

            modalOverlay.classList.add('active');
            document.body.style.overflow = 'hidden';
            attachLightboxEvents();
            modalClose.focus();
        };

        roomCards.forEach(card => {
            card.addEventListener('click', () => openRoomModal(card.getAttribute('data-room')));
        });

        const closeModal = () => {
            modalOverlay.classList.remove('active');
            document.body.style.overflow = '';
        };

        modalClose.addEventListener('click', closeModal);
        modalOverlay.addEventListener('click', (e) => { if (e.target === modalOverlay) closeModal(); });

        // Lightbox
        const lightbox = document.createElement('div');
        lightbox.className = 'lightbox';
        lightbox.innerHTML = `
            <div class="lightbox-close">✕</div>
            <div class="lightbox-arrow lb-prev" style="position:absolute; left:20px; color:#fff; font-size:3rem; cursor:pointer;">←</div>
            <img src="" style="max-width:90%; max-height:90vh;">
            <div class="lightbox-arrow lb-next" style="position:absolute; right:20px; color:#fff; font-size:3rem; cursor:pointer;">→</div>
        `;
        document.body.appendChild(lightbox);
        const lImg = lightbox.querySelector('img');

        const attachLightboxEvents = () => {
            const imgs = Array.from(modalBody.querySelectorAll('.modal-gallery img'));
            imgs.forEach((img, i) => {
                img.onclick = () => { lImg.src = img.src; lImg.dataset.index = i; lightbox.classList.add('active'); };
            });

            lightbox.querySelector('.lb-prev').onclick = (e) => {
                e.stopPropagation();
                let i = (parseInt(lImg.dataset.index) - 1 + imgs.length) % imgs.length;
                lImg.src = imgs[i].src; lImg.dataset.index = i;
            };
            lightbox.querySelector('.lb-next').onclick = (e) => {
                e.stopPropagation();
                let i = (parseInt(lImg.dataset.index) + 1) % imgs.length;
                lImg.src = imgs[i].src; lImg.dataset.index = i;
            };
        };

        lightbox.onclick = () => lightbox.classList.remove('active');

        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') { lightbox.classList.remove('active'); closeModal(); }
            if (lightbox.classList.contains('active')) {
                const imgs = Array.from(modalBody.querySelectorAll('.modal-gallery img'));
                let i = parseInt(lImg.dataset.index);
                if (e.key === 'ArrowRight') { i = (i + 1) % imgs.length; lImg.src = imgs[i].src; lImg.dataset.index = i; }
                if (e.key === 'ArrowLeft') { i = (i - 1 + imgs.length) % imgs.length; lImg.src = imgs[i].src; lImg.dataset.index = i; }
            }
        });
    }

    // Lazy Load Iframes (Decoupled from Modals)
    const lazyIframes = document.querySelectorAll('.iframe-container[data-src]');
    const loadIframe = (container) => {
        const src = container.getAttribute('data-src');
        const title = container.getAttribute('data-title');
        const height = container.getAttribute('data-height') || '500';
        const allow = container.getAttribute('data-allow') || '';

        container.innerHTML = `
            <iframe 
                title="${title}" 
                src="${src}" 
                width="100%" 
                height="${height}" 
                style="border:0;" 
                allowfullscreen="" 
                loading="lazy" 
                allow="${allow}">
            </iframe>
        `;

        container.classList.add('loaded');
    };

    const iframeObserver = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                // For very heavy iframes, we could also wait for a mousemove/touchstart 
                // but IntersectionObserver with a small margin is usually balanced enough.
                // We'll use 100px instead of 200px to be slightly more conservative.
                loadIframe(entry.target);
                observer.unobserve(entry.target);
            }
        });
    }, { rootMargin: '100px' });
    lazyIframes.forEach(c => iframeObserver.observe(c));


    // Price & Season Logic
    const getEaster = (year) => {
        const f = Math.floor, G = year % 19, C = f(year / 100),
            H = (C - f(C / 4) - f((8 * C + 13) / 25) + 19 * G + 15) % 30,
            I = H - f(H / 28) * (1 - f(H / 28) * f(29 / (H + 1)) * f((21 - G) / 11)),
            J = (year + f(year / 4) + I + 2 - C + f(C / 4)) % 7,
            L = I - J, month = 3 + f((L + 40) / 44), day = L + 28 - 31 * f(month / 4);
        return new Date(year, month - 1, day);
    };

    const getSeason = (date) => {
        const year = date.getFullYear();
        const month = date.getMonth(); // 0-11
        const day = date.getDate();
        const easter = getEaster(year);
        const dayOfYear = (Date.UTC(year, month, day) - Date.UTC(year, 0, 0)) / 86400000;
        const easterDayOfYear = (Date.UTC(year, easter.getMonth(), easter.getDate()) - Date.UTC(year, 0, 0)) / 86400000;

        // Simplified season logic based on the house rules
        if (dayOfYear <= 7 || dayOfYear >= 355 || (dayOfYear >= 32 && month < 3 && date.getTime() < easter.getTime())) return 'S1W'; // KW 1, 5-Ostern, 51-53
        if (dayOfYear > 7 && dayOfYear < 32) return 'S2W'; // KW 2-4
        if (date >= easter && month <= 4) return 'S4'; // Ostern bis Ende Mai (~KW 22)
        if (month === 5) return 'S3'; // Juni (KW 23-26)
        if (month >= 6 && month <= 7) return 'S1S'; // Juli/August
        if (month === 8 && day <= 15) return 'S1S'; // Bis Mitte Sep (KW 27-37)
        if ((month === 8 && day > 15) || (month === 9 && day <= 20)) return 'S2S'; // Mitte Sep - 20. Okt (KW 38-42)
        if ((month === 9 && day > 20) || (month === 10) || (month === 11 && day < 21)) return 'S4'; // 20. Okt - Weihnachten (KW 43-50)
        return 'S4';
    };

    const seasonRates = { S1W: 2030, S1S: 1950, S2W: 1830, S2S: 1790, S3: 1640, S4: 1440 };

    // Highlight Current Season
    const currentSeason = getSeason(new Date());
    document.querySelectorAll(`[data-season="${currentSeason}"]`).forEach(el => el.classList.add('current-season'));


    // Form Submission (Enhanced Anti-Spam)
    const form = document.querySelector('#kontakt form');
    if (form) {
        // --- 0. Initial JS Check ---
        const jsCheckField = form.querySelector('input[name="_js_check"]');
        if (jsCheckField) jsCheckField.value = 'verified_' + Math.random().toString(36).substring(7);

        // --- 1. Dynamic Form Activation ---
        // Bots often scrape the HTML for the 'action' attribute. 
        // We set it only after a human interacts with the form.
        const activateForm = () => {
            if (form.dataset.activated) return;
            form.action = 'https://formsubmit.co/ajax/info@altepostsils.ch';
            form.method = 'POST';
            const mathInput = document.getElementById('math-answer');
            if (mathInput) mathInput.setAttribute('name', 'math_answer');
            form.dataset.activated = 'true';
        };

        // Activate on any real user interaction
        ['focusin', 'click', 'touchstart'].forEach(evt => {
            form.addEventListener(evt, activateForm, { once: true });
        });

        // --- 2. Math Challenge Setup ---
        // Use a function that gets translations dynamically in case they aren't loaded yet
        const getTranslation = (key, lang) => {
            return window.translations?.[lang]?.[key] || window.translations?.['de']?.[key] || key;
        };

        const generateMathChallenge = () => {
            mathA = Math.floor(Math.random() * 9) + 1;
            mathB = Math.floor(Math.random() * 9) + 1;
            mathAnswer = mathA + mathB;

            const lang = window.i18n ? window.i18n.getLang() : 'de';
            const label = document.getElementById('math-label');
            if (label) {
                const labelText = getTranslation('verify_label', lang);
                label.textContent = labelText.replace('{a}', mathA).replace('{b}', mathB);
            }
            const input = document.getElementById('math-answer');
            if (input) input.value = '';
        };

        // If translations are still loading, wait for them
        if (Object.keys(window.translations || {}).length === 0) {
            document.addEventListener('langChanged', generateMathChallenge, { once: true });
        } else {
            generateMathChallenge();
        }
        
        document.addEventListener('langChanged', generateMathChallenge);

        // --- 3. Submission Handler ---
        const formLoadTime = Date.now();

        form.onsubmit = (e) => {
            e.preventDefault();
            const lang = window.i18n ? window.i18n.getLang() : 'de';
            const t = (window.translations?.[lang] || window.translations?.['de']) || {};

            // A. Enhanced Honeypot check (multiple bait fields)
            const hpFields = ['website', 'url', 'company', '_honeypot'];
            const isSpam = hpFields.some(name => {
                const field = form.querySelector(`[name="${name}"]`);
                return field && field.value.trim() !== '';
            });

            if (isSpam) {
                // Silent fail for bots
                console.warn('Spam detected via honeypot.');
                form.innerHTML = `<div class="form-feedback success">${t.form_success || 'Danke!'}</div>`;
                return;
            }

            // B. Time-based check (bots submit too fast)
            const elapsed = Date.now() - formLoadTime;
            if (elapsed < 3000) {
                showFormError(form, t.spam_error || 'Spam-Verdacht.');
                generateMathChallenge();
                return;
            }

            // C. Math challenge validation
            const mathInput = document.getElementById('math-answer');
            if (!mathInput || parseInt(mathInput.value, 10) !== mathAnswer) {
                showFormError(form, t.verify_error || 'Falsches Ergebnis.');
                generateMathChallenge();
                return;
            }

            // D. JS Verification Check
            if (!jsCheckField || !jsCheckField.value.startsWith('verified_')) {
                showFormError(form, 'Validation Error (JS).');
                return;
            }

            // E. Date validation
            const dateIn = form.querySelector('input[name="Anreise"]');
            const dateOut = form.querySelector('input[name="Abreise"]');
            if (dateIn && dateOut && dateIn.value && dateOut.value) {
                if (new Date(dateOut.value) <= new Date(dateIn.value)) {
                    showFormError(form, t.date_error);
                    return;
                }
            }

            // F. Actual Submission
            const btn = form.querySelector('#submit-btn');
            const originalBtnText = btn ? btn.innerHTML : '';
            if (btn) { btn.disabled = true; btn.innerHTML = '<span class="loader"></span>'; }

            // Build clean FormData (exclude internal/spam fields)
            const rawData = new FormData(form);
            const finalData = new FormData();

            // Define fields to exclude from the email
            const exclude = [...hpFields, 'math_answer', '_js_check'];

            for (let [key, value] of rawData.entries()) {
                if (!exclude.includes(key)) {
                    finalData.append(key, value);
                }
            }

            fetch(form.action || 'https://formsubmit.co/ajax/info@altepostsils.ch', {
                method: 'POST',
                headers: { 'Accept': 'application/json' },
                body: finalData
            })
                .then(r => {
                    if (r.ok) {
                        form.innerHTML = `<div class="form-feedback success">${t.form_success || 'Danke!'}</div>`;
                    } else {
                        throw new Error('Submission failed');
                    }
                })
                .catch((err) => {
                    console.error('Form Submission Error:', err);
                    showFormError(form, t.form_error || 'Error');
                    if (btn) { btn.disabled = false; btn.innerHTML = originalBtnText; }
                    generateMathChallenge();
                });
        };
    }

    // Helper: show form error
    function showFormError(form, msg) {
        const existingError = form.querySelector('.form-feedback.error');
        if (existingError) existingError.remove();
        const errorDiv = document.createElement('div');
        errorDiv.className = 'form-feedback error';
        errorDiv.textContent = msg;
        form.prepend(errorDiv);
    }
});

