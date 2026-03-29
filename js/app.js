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
            navLinks.classList.toggle('active');
            mobileToggle.innerHTML = navLinks.classList.contains('active') ? '✕' : '☰';
        });

        document.querySelectorAll('.nav-links a').forEach(link => {
            link.addEventListener('click', () => {
                navLinks.classList.remove('active');
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

            const prevBtn = document.createElement('button');
            prevBtn.className = 'modal-nav-btn';
            prevBtn.innerHTML = `← ${window.translations?.[window.i18n?.getLang()]?.['room_' + roomKeys[prevIndex]] || 'Back'}`;
            prevBtn.onclick = () => openRoomModal(roomKeys[prevIndex]);

            const nextBtn = document.createElement('button');
            nextBtn.className = 'modal-nav-btn';
            nextBtn.innerHTML = `${window.translations?.[window.i18n?.getLang()]?.['room_' + roomKeys[nextIndex]] || 'Next'} →`;
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
            <iframe title="${title}" src="${src}" width="100%" height="${height}" style="border:0;" allowfullscreen="" loading="lazy" allow="${allow}"></iframe>
        `;

        container.classList.add('loaded');
    };

    const iframeObserver = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                loadIframe(entry.target);
                observer.unobserve(entry.target);
            }
        });
    }, { rootMargin: '200px' });
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


    // Form Submission (Decoupled from Modals)
    const form = document.querySelector('#kontakt form');
    if (form) {
        const dateIn = form.querySelector('input[name="Anreise"]');
        const dateOut = form.querySelector('input[name="Abreise"]');

        form.onsubmit = (e) => {
            const lang = window.i18n ? window.i18n.getLang() : 'de';
            const t = window.translations?.[lang] || window.translations?.['de'];
            // Date Validation
            if (dateIn && dateOut && dateIn.value && dateOut.value) {
                if (new Date(dateOut.value) <= new Date(dateIn.value)) {
                    e.preventDefault();
                    alert(t?.date_error || 'Das Abreisedatum muss nach dem Anreisedatum liegen.');
                    return;
                }
            }

            e.preventDefault();
            const btn = form.querySelector('button');
            const originalBtnText = btn.innerHTML;
            btn.disabled = true;
            btn.innerHTML = '<span class="loader"></span>';

            const formData = new FormData(form);

            fetch(form.action, {
                method: "POST",
                headers: { 'Accept': 'application/json' },
                body: formData
            })
                .then(r => {
                    if (r.ok) {
                        const successMsg = window.translations?.[window.i18n?.getLang()]?.form_success || 'Vielen Dank! Wir melden uns in Kürze.';
                        form.innerHTML = `<div class="form-feedback success">${successMsg}</div>`;
                    } else {
                        return r.json().then(errData => {
                            console.error('FormSubmit Error Response:', errData);
                            throw new Error(errData.message || 'Submission failed');
                        }).catch(() => { throw new Error('Submission failed'); });
                    }
                })
                .catch((err) => {
                    console.error('Form Submission Error:', err);
                    const errorMsg = window.translations?.[window.i18n?.getLang()]?.form_error || 'Ein Fehler ist aufgetreten. Bitte versuchen Sie es erneut.';
                    const existingError = form.querySelector('.form-feedback.error');
                    if (existingError) existingError.remove();
                    const errorDiv = document.createElement('div');
                    errorDiv.className = 'form-feedback error';
                    errorDiv.innerHTML = errorMsg;
                    form.prepend(errorDiv);
                    btn.disabled = false;
                    btn.innerHTML = originalBtnText;
                });
        };
    }
});

