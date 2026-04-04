document.addEventListener('DOMContentLoaded', () => {
    const defaultLang = 'de';
    let translations = {};

    const getLangFromURL = () => {
        const urlParams = new URLSearchParams(window.location.search);
        return urlParams.get('lang');
    };

    const urlLang = getLangFromURL();
    const storageLang = localStorage.getItem('lang');
    let currentLang = urlLang || storageLang || defaultLang;

    const loadTranslations = async (lang) => {
        try {
            const response = await fetch(`./locales/${lang}.json`);
            if (!response.ok) throw new Error(`Could not load ${lang} translations`);
            translations[lang] = await response.ok ? await response.json() : null;
            return true;
        } catch (error) {
            console.error('Error loading translations:', error);
            return false;
        }
    };

    const applyTranslations = (lang, root = document) => {
        if (!translations[lang]) return;

        root.querySelectorAll('[data-i18n]').forEach((el) => {
            const key = el.getAttribute('data-i18n');
            const translation = translations[lang][key];

            if (translation) {
                // Special handling for META and TITLE tags
                if (el.tagName === 'META') {
                    if (el.getAttribute('content') !== translation) {
                        el.setAttribute('content', translation);
                    }
                } else if (el.tagName === 'TITLE') {
                    if (document.title !== translation) {
                        document.title = translation;
                    }
                } else {
                    // Standard elements: If it looks like HTML, use innerHTML
                    if (translation.indexOf('<') !== -1) {
                        if (el.innerHTML !== translation) {
                            el.innerHTML = translation;
                        }
                    } else {
                        if (el.textContent !== translation) {
                            el.textContent = translation;
                        }
                    }
                }
            }
        });

        root.querySelectorAll('[data-i18n-alt]').forEach((el) => {
            const key = el.getAttribute('data-i18n-alt');
            const translation = translations[lang][key];
            if (translation) {
                el.alt = translation;
            }
        });

        // Update active state in language switchers
        if (root === document) {
            document.documentElement.lang = lang;
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

    const switchLanguage = async (lang) => {
        if (!translations[lang]) {
            const success = await loadTranslations(lang);
            if (!success) return;
        }

        currentLang = lang;
        localStorage.setItem('lang', lang);

        // Update URL without reloading
        const newUrl = new URL(window.location.href);
        if (lang === defaultLang) {
            newUrl.searchParams.delete('lang');
        } else {
            newUrl.searchParams.set('lang', lang);
        }
        window.history.pushState({ lang }, "", newUrl);

        applyTranslations(lang);
        document.dispatchEvent(new CustomEvent('langChanged', { detail: { lang } }));
    };

    const setupLangSwitcher = () => {
        const switchers = document.querySelectorAll('.lang-switcher button');
        switchers.forEach(btn => {
            btn.addEventListener('click', (e) => {
                const lang = e.currentTarget.getAttribute('data-lang');
                if (lang) {
                    switchLanguage(lang);
                }
            });
        });
    };

    // Initialize
    (async () => {
        // Expose i18n to global scope early
        window.i18n = {
            apply: applyTranslations,
            getLang: () => currentLang,
            switch: switchLanguage
        };
        window.translations = translations; // Backwards compatibility for app.js

        setupLangSwitcher();

        // Load and apply initial language
        await loadTranslations(currentLang);
        applyTranslations(currentLang);
    })();
});