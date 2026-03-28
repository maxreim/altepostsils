document.addEventListener('DOMContentLoaded', () => {
    const defaultLang = 'de';
    let currentLang = localStorage.getItem('lang') || defaultLang;

    // Apply translations
    const applyTranslations = (lang, root = document) => {
        if (!translations[lang]) return;

        root.querySelectorAll('[data-i18n]').forEach((el) => {
            const key = el.getAttribute('data-i18n');
            if (translations[lang][key]) {
                const translation = translations[lang][key];

                // Handle different element types
                if (el.tagName === 'META') {
                    el.setAttribute('content', translation);
                } else if (el.tagName === 'TITLE') {
                    document.title = translation;
                } else if (el.tagName === 'INPUT' || el.tagName === 'TEXTAREA') {
                    if (el.hasAttribute('placeholder')) {
                        el.placeholder = translation;
                    } else if (el.type === 'submit' || el.type === 'button') {
                        el.value = translation;
                    }
                } else {
                    el.innerHTML = translation;
                }
            }
        });

        if (root === document) {
            // Update HTML lang attribute
            document.documentElement.lang = lang;

            // Update active state of language switcher buttons
            document.querySelectorAll('.lang-switcher button').forEach(btn => {
                if (btn.getAttribute('data-lang') === lang) {
                    btn.classList.add('active');
                    btn.setAttribute('aria-current', 'true');
                } else {
                    btn.classList.remove('active');
                    btn.removeAttribute('aria-current');
                }
            });
        }
    };

    // Expose to window for app.js
    window.i18n = {
        apply: applyTranslations,
        getLang: () => currentLang
    };

    // Setup Language Switcher
    const setupLangSwitcher = () => {
        const switchers = document.querySelectorAll('.lang-switcher button');
        switchers.forEach(btn => {
            btn.addEventListener('click', (e) => {
                const lang = e.target.getAttribute('data-lang');
                if (lang && translations[lang]) {
                    currentLang = lang;
                    localStorage.setItem('lang', lang);
                    applyTranslations(lang);
                }
            });
        });
    };

    // Initialize
    if (typeof translations !== 'undefined') {
        setupLangSwitcher();
        applyTranslations(currentLang);
    }
});
