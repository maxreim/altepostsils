(function () {
    var defaultLang = 'de';
    var urlLang = new URLSearchParams(window.location.search).get('lang');
    var storageLang = localStorage.getItem('lang');
    var currentLang = urlLang || storageLang || defaultLang;

    if (urlLang && urlLang !== defaultLang) {
        localStorage.setItem('lang', urlLang);
    }

    var applyTranslations = function (lang, root) {
        root = root || document;
        if (!window.translations || !window.translations[lang]) return;
        root.querySelectorAll('[data-i18n]').forEach(function (el) {
            var key = el.getAttribute('data-i18n');
            var val = window.translations[lang][key];
            if (!val) return;
            if (el.tagName === 'META') {
                el.setAttribute('content', val);
            } else if (el.tagName === 'TITLE') {
                if (document.title !== val) document.title = val;
            } else if (el.tagName === 'INPUT' || el.tagName === 'TEXTAREA') {
                if (el.hasAttribute('placeholder') && el.placeholder !== val) el.placeholder = val;
                else if ((el.type === 'submit' || el.type === 'button') && el.value !== val) el.value = val;
            } else {
                if (val.indexOf('<') === -1) el.textContent = val;
                else el.innerHTML = val;
            }
        });
        if (root === document) {
            document.documentElement.lang = lang;
            document.querySelectorAll('.lang-switcher button').forEach(function (btn) {
                var active = btn.getAttribute('data-lang') === lang;
                btn.classList.toggle('active', active);
                if (active) btn.setAttribute('aria-current', 'true');
                else btn.removeAttribute('aria-current');
            });
        }
    };

    window.i18n = {
        apply: applyTranslations,
        getLang: function () { return currentLang; }
    };

    // Lazy loader for translations.js
    var translationsLoaded = false;
    var translationsLoading = false;
    var loadQueue = [];

    var loadTranslations = function (cb) {
        if (translationsLoaded) { if (cb) cb(); return; }
        if (cb) loadQueue.push(cb);
        if (translationsLoading) return;
        translationsLoading = true;
        var s = document.createElement('script');
        s.src = 'js/translations.js';
        s.onload = function () {
            translationsLoaded = true;
            translationsLoading = false;
            loadQueue.forEach(function (fn) { fn && fn(); });
            loadQueue = [];
        };
        s.onerror = function () {
            console.warn('translations.js konnte nicht geladen werden');
        };
        document.head.appendChild(s);
    };

    // Expose so app.js can use it too
    window.i18n.loadTranslations = loadTranslations;

    var setActiveLangButton = function (lang) {
        document.querySelectorAll('.lang-switcher button').forEach(function (btn) {
            var active = btn.getAttribute('data-lang') === lang;
            btn.classList.toggle('active', active);
            if (active) btn.setAttribute('aria-current', 'true');
            else btn.removeAttribute('aria-current');
        });
    };

    var setupLangSwitcher = function () {
        document.querySelectorAll('.lang-switcher button').forEach(function (btn) {
            btn.addEventListener('click', function (e) {
                var lang = e.currentTarget.getAttribute('data-lang');
                if (!lang || lang === currentLang) return;

                if (lang === defaultLang) {
                    // Switching back to German: remove param and reload (restores default HTML text)
                    currentLang = lang;
                    localStorage.removeItem('lang');
                    var url = new URL(window.location.href);
                    url.searchParams.delete('lang');
                    window.location.href = url.href;
                    return;
                }

                loadTranslations(function () {
                    currentLang = lang;
                    localStorage.setItem('lang', lang);
                    var url = new URL(window.location.href);
                    url.searchParams.set('lang', lang);
                    window.history.pushState({ lang: lang }, '', url);
                    applyTranslations(lang);
                });
            });
        });
    };

    document.addEventListener('DOMContentLoaded', function () {
        setupLangSwitcher();

        if (currentLang === defaultLang && !urlLang && !storageLang) {
            // German visitor: no translations needed, just set active button
            document.documentElement.lang = 'de';
            setActiveLangButton('de');
        } else {
            // Non-German or stored preference: load then apply
            loadTranslations(function () {
                applyTranslations(currentLang);
            });
        }
    });
})();