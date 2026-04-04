export default async (request, context) => {
  const url = new URL(request.url);
  const cookieLangs = context.cookies.get("nf_lang");
  const acceptLangs = request.headers.get("accept-language");
  const queryLang = url.searchParams.get("lang");

  const supportedLangs = ["de", "en", "fr", "it", "rm"];
  let lang = queryLang || cookieLangs || (acceptLangs ? acceptLangs.split(",")[0].split("-")[0] : "de");

  if (!supportedLangs.includes(lang)) {
    lang = "de";
  }

  // Persist language in cookie if it changed or was from query
  if (queryLang || !cookieLangs) {
    context.cookies.set("nf_lang", lang, { path: "/", maxAge: 31536000 });
  }

  const response = await context.next();
  const contentType = response.headers.get("content-type");

  // Only process HTML files
  if (contentType && contentType.includes("text/html")) {
    let text = await response.text();
    // Inject detected language into HTML tag
    text = text.replace(/<html lang="[^"]*"/, `<html lang="${lang}"`);
    
    // Optional: Inject a small script to avoid FOUT by hiding body until translations are ready
    // This is more aggressive than i18n.js
    const foutFix = `
      <script>
        document.documentElement.classList.add('is-translating');
        var style = document.createElement('style');
        style.innerHTML = '.is-translating body { opacity: 0; } .is-translating body.translated { opacity: 1; transition: opacity 0.3s; }';
        document.head.appendChild(style);
        document.addEventListener('langChanged', function() {
          document.body.classList.add('translated');
          document.documentElement.classList.remove('is-translating');
        }, { once: true });
        // Fallback for timeout
        setTimeout(function() {
          document.body.classList.add('translated');
          document.documentElement.classList.remove('is-translating');
        }, 1000);
      </script>
    `;
    text = text.replace('</head>', foutFix + '</head>');
    
    return new Response(text, response);
  }

  return response;
};
