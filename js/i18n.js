document.addEventListener('DOMContentLoaded', () => {
    const defaultLang = 'de';

    const getLangFromURL = () => {
        const urlParams = new URLSearchParams(window.location.search);
        return urlParams.get('lang');
    };

    const urlLang = getLangFromURL();
    const storageLang = localStorage.getItem('lang');
    let currentLang = urlLang || storageLang || defaultLang;

    // Save language if provided in URL
    if (urlLang && translations[urlLang]) {
        localStorage.setItem('lang', urlLang);
    }

    const applyTranslations = (lang, root = document) => {
        if (!translations[lang]) return;

        root.querySelectorAll('[data-i18n]').forEach((el) => {
            const key = el.getAttribute('data-i18n');
            const translation = translations[lang][key];

            if (translation) {
                // If it looks like HTML (contains <), use innerHTML
                if (translation.indexOf('<') !== -1) {
                    el.innerHTML = translation;
                } else {
                    el.textContent = translation;
                }

                // Special handling for some tags
                if (el.tagName === 'META') {
                    el.setAttribute('content', translation);
                } else if (el.tagName === 'TITLE') {
                    document.title = translation;
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

    window.i18n = {
        apply: applyTranslations,
        getLang: () => currentLang
    };

    const setupLangSwitcher = () => {
        const switchers = document.querySelectorAll('.lang-switcher button');
        switchers.forEach(btn => {
            btn.addEventListener('click', (e) => {
                const lang = e.currentTarget.getAttribute('data-lang');
                if (lang && translations[lang]) {
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
                }
            });
        });
    };

    if (typeof translations !== 'undefined') {
        setupLangSwitcher();
        // ALWAYS apply translations on load to ensure dynamic content is filled
        applyTranslations(currentLang);
    }
});