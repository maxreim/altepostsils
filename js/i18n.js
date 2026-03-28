document.addEventListener('DOMContentLoaded', () => {
    const defaultLang = 'de';
    let currentLang = localStorage.getItem('lang') || defaultLang;

    // Apply translations
    const applyTranslations = (lang, root = document) => {
        if (!translations[lang]) return;

        root.querySelectorAll('[data-i18n]').forEach((el) => {
            const key = el.getAttribute('data-i18n');
            if (translations[lang][key]) {
                // If it's an input or textarea with placeholder, update placeholder
                if (el.tagName === 'INPUT' || el.tagName === 'TEXTAREA') {
                    if (el.hasAttribute('placeholder')) {
                        el.placeholder = translations[lang][key];
                    } else if (el.type === 'submit' || el.type === 'button') {
                        el.value = translations[lang][key];
                    }
                } else {
                    el.innerHTML = translations[lang][key];
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
                } else {
                    btn.classList.remove('active');
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
