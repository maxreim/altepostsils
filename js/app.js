document.addEventListener('DOMContentLoaded', () => {
    // Navbar scroll effect
    const navbar = document.querySelector('.navbar');
    window.addEventListener('scroll', () => {
        if (window.scrollY > 50) {
            navbar.classList.add('scrolled');
        } else {
            navbar.classList.remove('scrolled');
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

        // Close mobile menu on click
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
        const windowHeight = window.innerHeight;
        const elementVisible = 100;

        reveals.forEach(reveal => {
            const elementTop = reveal.getBoundingClientRect().top;
            if (elementTop < windowHeight - elementVisible) {
                reveal.classList.add('active');
            }
        });
    };

    window.addEventListener('scroll', revealOnScroll, { passive: true });
    revealOnScroll(); // Trigger on load

    // Setup Modals
    const roomCards = document.querySelectorAll('.room-card');
    const modalOverlay = document.querySelector('.modal-overlay');
    const modalClose = document.querySelector('.modal-close');
    const modalBody = document.querySelector('.modal-body');

    if (modalOverlay && modalClose && modalBody) {
        // Store original room content templates safely
        const roomContents = {
            wohnzimmer: document.getElementById('content-wohnzimmer') ? document.getElementById('content-wohnzimmer').innerHTML : '',
            schlafzimmer: document.getElementById('content-schlafzimmer') ? document.getElementById('content-schlafzimmer').innerHTML : '',
            bad: document.getElementById('content-bad') ? document.getElementById('content-bad').innerHTML : '',
            kueche: document.getElementById('content-kueche') ? document.getElementById('content-kueche').innerHTML : '',
            gang: document.getElementById('content-gang') ? document.getElementById('content-gang').innerHTML : '',
            allgemein: document.getElementById('content-allgemein') ? document.getElementById('content-allgemein').innerHTML : ''
        };

        roomCards.forEach(card => {
            card.addEventListener('click', () => {
                const roomKey = card.getAttribute('data-room');
                if (roomContents[roomKey]) {
                    modalBody.innerHTML = roomContents[roomKey];
                    modalOverlay.classList.add('active');
                    document.body.style.overflow = 'hidden'; // Prevent background scrolling
                    attachLightboxEvents();
                }
            });
        });

        const closeModal = () => {
            modalOverlay.classList.remove('active');
            document.body.style.overflow = '';
        };

        modalClose.addEventListener('click', closeModal);
        modalOverlay.addEventListener('click', (e) => {
            if (e.target === modalOverlay) closeModal();
        });

        // Custom Lightbox for modal images
        const lightbox = document.createElement('div');
        lightbox.className = 'lightbox';
        lightbox.innerHTML = '<img>';
        document.body.appendChild(lightbox);
        const lightboxImg = lightbox.querySelector('img');

        const attachLightboxEvents = () => {
            const modalImages = modalBody.querySelectorAll('.modal-gallery img');
            modalImages.forEach(img => {
                img.addEventListener('click', () => {
                    lightboxImg.src = img.src;
                    lightbox.classList.add('active');
                });
            });
        };

        lightbox.addEventListener('click', () => {
            lightbox.classList.remove('active');
        });

        // Close on Escape key
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') {
                if (lightbox.classList.contains('active')) {
                    lightbox.classList.remove('active');
                } else if (modalOverlay.classList.contains('active')) {
                    closeModal();
                }
            }
        });
    }
});
