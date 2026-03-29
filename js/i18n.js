document.addEventListener('DOMContentLoaded', () => {
    const defaultLang = 'de';
    
    // Get language from URL parameters
    const getLangFromURL = () => {
        const urlParams = new URLSearchParams(window.location.search);
        return urlParams.get('lang');
    };

    const urlLang = getLangFromURL();
    const storageLang = localStorage.getItem('lang');
    let currentLang = urlLang || storageLang || defaultLang;

    // Optimization: Skip initial translation if we're already in 'de' and it's the target
    const skipInitialTranslation = (currentLang === 'de' && !urlLang && !storageLang);


    // If urlLang is set, save it to localStorage for future visits
    if (urlLang && translations[urlLang]) {
        localStorage.setItem('lang', urlLang);
    }

    // Apply translations
    const applyTranslations = (lang, root = document) => {
        if (!translations[lang]) return;

        root.querySelectorAll('[data-i18n]').forEach((el) => {
            const key = el.getAttribute('data-i18n');
            const translation = translations[lang][key];
            if (translation) {
                // If the element already has this exact content, skip (avoids layout thrashing)
                if (el.innerHTML === translation || el.textContent === translation) return;

                // Handle different element types
                if (el.tagName === 'META') {
                    el.setAttribute('content', translation);
                } else if (el.tagName === 'TITLE') {
                    if (document.title !== translation) document.title = translation;
                } else if (el.tagName === 'INPUT' || el.tagName === 'TEXTAREA') {
                    if (el.hasAttribute('placeholder')) {
                        if (el.placeholder !== translation) el.placeholder = translation;
                    } else if (el.type === 'submit' || el.type === 'button') {
                        if (el.value !== translation) el.value = translation;
                    }
                } else {
                    // Use textContent if no HTML tags are present for better performance
                    if (translation.indexOf('<') === -1) {
                        el.textContent = translation;
                    } else {
                        el.innerHTML = translation;
                    }
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
                    
                    // Update URL with selected language without reloading
                    const newUrl = new URL(window.location.href);
                    if (lang === defaultLang) {
                        newUrl.searchParams.delete('lang');
                    } else {
                        newUrl.searchParams.set('lang', lang);
                    }
                    window.history.pushState({ lang }, "", newUrl);
                    
                    applyTranslations(lang);
                }
            });
        });
    };

    // Initialize
    if (typeof translations !== 'undefined') {
        setupLangSwitcher();
        if (!skipInitialTranslation) {
            applyTranslations(currentLang);
        } else {
            // Even if we skip translation, we should ensure HTML lang and button states are correct
            document.documentElement.lang = 'de';
            document.querySelectorAll('.lang-switcher button[data-lang="de"]').forEach(btn => {
                btn.classList.add('active');
                btn.setAttribute('aria-current', 'true');
            });
        }
    }
});
