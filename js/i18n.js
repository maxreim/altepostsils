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
            const response = await fetch(`./locales/${lang}.json?v=${Date.now()}`);
            if (!response.ok) throw new Error(`Could not load ${lang} translations`);
            translations[lang] = await response.json();
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

        // Update JSON-LD
        const jsonLdScript = document.getElementById('json-ld');
        if (jsonLdScript && translations[lang]) {
            try {
                let data = JSON.parse(jsonLdScript.textContent);
                data.description = translations[lang].seo_description || data.description;
                data.name = translations[lang].haus_title || data.name;
                // Also update availability aggregate description if needed
                if (data.offers && data.offers.description) {
                    // This one isn't clearly indexed in locales, 
                    // maybe just the description is enough for now
                }
                jsonLdScript.textContent = JSON.stringify(data, null, 4);
            } catch (e) {
                console.error("Error updating JSON-LD", e);
            }
        }

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
            if (!success) {
                // If loading fails, ensure we still signal that a process finished
                // and fallback to a default if necessary (currentLang stays what it was)
                document.dispatchEvent(new CustomEvent('langChanged', { detail: { lang: currentLang, error: true } }));
                return;
            }
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
        try {
            await loadTranslations(currentLang);
            applyTranslations(currentLang);
        } catch (e) {
            console.error("Initial translation failed", e);
            // Ensure we at least remove any loading overlays
            document.dispatchEvent(new CustomEvent('langChanged', { detail: { lang: currentLang, error: true } }));
        }
    })();
});