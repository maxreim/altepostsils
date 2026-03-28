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

    window.addEventListener('scroll', () => {
        updateScrollProgress();
        if (window.scrollY > 50) {
            navbar.classList.add('scrolled');
        } else {
            navbar.classList.remove('scrolled');
        }

        // Back to top button visibility
        if (backToTop) {
            if (window.scrollY > 500) {
                backToTop.classList.add('visible');
            } else {
                backToTop.classList.remove('visible');
            }
        }

        // Active Section Tracking
        const sections = document.querySelectorAll('section, header');
        let current = "";
        sections.forEach(section => {
            const sectionTop = section.offsetTop;
            if (window.scrollY >= sectionTop - 150) {
                current = section.getAttribute('id');
            }
        });

        document.querySelectorAll('.nav-links a').forEach(link => {
            link.classList.remove('active');
            if (link.getAttribute('href') === `#${current}`) {
                link.classList.add('active');
            }
        });
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

    // Scroll Reveal Animation
    const reveals = document.querySelectorAll('.reveal');
    const revealOnScroll = () => {
        reveals.forEach(reveal => {
            const elementTop = reveal.getBoundingClientRect().top;
            if (elementTop < window.innerHeight - 100) {
                reveal.classList.add('active');
            }
        });
    };
    window.addEventListener('scroll', revealOnScroll, { passive: true });
    revealOnScroll();

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


    // Form Submission (Decoupled from Modals)
    const form = document.querySelector('#kontakt form');
    if (form) {
        form.onsubmit = (e) => {
            e.preventDefault();
            const btn = form.querySelector('button');
            const originalBtnText = btn.innerHTML;
            btn.disabled = true;
            btn.innerHTML = '<span class="loader"></span>';

            const formData = new FormData(form);

            fetch(form.action, {
                method: "POST",
                headers: {
                    'Accept': 'application/json'
                },
                body: formData
            })
                .then(r => {
                    if (r.ok) {
                        const successMsg = window.translations?.[window.i18n?.getLang()]?.form_success || "Danke!";
                        form.innerHTML = `<div class="form-feedback success">${successMsg}</div>`;
                    } else {
                        return r.json().then(errData => {
                            console.error('FormSubmit Error Response:', errData);
                            throw new Error(errData.message || 'Submission failed');
                        }).catch(() => {
                            throw new Error('Submission failed');
                        });
                    }
                })
                .catch((err) => {
                    console.error('Form Submission Error:', err);
                    const errorMsg = window.translations?.[window.i18n?.getLang()]?.form_error || "Error";

                    // Remove existing error if any
                    const existingError = form.querySelector('.form-feedback.error');
                    if (existingError) existingError.remove();

                    // Create and insert new error
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

