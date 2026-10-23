/*
 * Klient pro AI upscaler v novém okně.
 *
 *   openUpscaler(obrazek, volby) → Promise<{ blob, width, height, model, name }>
 *
 * obrazek: File/Blob, <canvas>, <img>, data: URL nebo běžná URL obrázku
 * volby:
 *   model       'anime4' (Kresba 4×, výchozí) | 'anime2' (Kresba 2×) | 'photo4' (Fotka 4×)
 *   autostart   true = zvětšit hned po otevření okna
 *   autoReturn  true = výsledek poslat zpět hned po dokončení (jinak tlačítkem v okně)
 *   close       true = po odeslání výsledku okno zavřít
 *   lang        'cs' | 'en'
 *   name        název souboru (jen pro zobrazení a pojmenování výsledku)
 *   onProgress  funkce(0–1) volaná během zvětšování
 *
 * Funkci volejte přímo v obsluze kliknutí, jinak prohlížeč okno zablokuje.
 * Chyby: 'popup-blocked' (okno zablokováno), 'closed' (uživatel okno zavřel).
 */
var UPSCALER_URL = 'https://luboshort.github.io/images/upscaler/';

function openUpscaler(image, opts) {
  opts = opts || {};
  var id = Math.random().toString(36).slice(2);
  var url = new URL(UPSCALER_URL);
  url.searchParams.set('mode', 'window');
  if (opts.lang) url.searchParams.set('lang', opts.lang);

  // okno musí vzniknout hned při kliknutí, obrázek se připraví až potom
  var win = window.open(url.href, 'ai-upscaler', 'width=1000,height=900');
  if (!win) return Promise.reject(new Error('popup-blocked'));
  var payload = upscalerPayload(image);

  return new Promise(function (resolve, reject) {
    var sent = false, settled = false;
    function done(fn, val) { if (settled) return; settled = true; cleanup(); fn(val); }
    function cleanup() { window.removeEventListener('message', onMsg); clearInterval(watch); }

    function onMsg(e) {
      if (e.source !== win || e.origin !== url.origin || !e.data) return;
      var d = e.data;
      if (d.type === 'upscaler-ready' && !sent) {
        sent = true;
        payload.then(function (img) {
          win.postMessage({
            type: 'upscaler-input', id: id, image: img, name: opts.name || (img && img.name) || '',
            options: { model: opts.model, autostart: !!opts.autostart, autoReturn: !!opts.autoReturn, close: !!opts.close }
          }, url.origin);
        }, function (err) { try { win.close(); } catch (x) {} done(reject, err); });
      } else if (d.type === 'upscaler-progress' && d.id === id) {
        if (opts.onProgress) opts.onProgress(d.progress);
      } else if (d.type === 'upscaler-result' && d.id === id) {
        done(resolve, { blob: d.blob, width: d.width, height: d.height, model: d.model, name: d.name });
      }
    }
    window.addEventListener('message', onMsg);
    var watch = setInterval(function () {
      if (win.closed) setTimeout(function () { done(reject, new Error('closed')); }, 400);
    }, 700);
  });
}

function upscalerPayload(img) {
  if (img instanceof Blob) return Promise.resolve(img);
  if (window.HTMLCanvasElement && img instanceof HTMLCanvasElement)
    return new Promise(function (r) { img.toBlob(r, 'image/png'); });
  if (window.HTMLImageElement && img instanceof HTMLImageElement) img = img.currentSrc || img.src;
  if (typeof img === 'string') {
    if (/^(data|blob):/.test(img)) return fetch(img).then(function (r) { return r.blob(); });
    // zkusíme stáhnout sami; když to server nedovolí, pošleme adresu a zkusí to okno
    return fetch(img, { mode: 'cors' })
      .then(function (r) { if (!r.ok) throw 0; return r.blob(); })
      .then(function (b) { var n = decodeURIComponent(new URL(img, location.href).pathname.split('/').pop() || 'obrazek'); return new File([b], n, { type: b.type }); })
      .catch(function () { return new URL(img, location.href).href; });
  }
  return Promise.reject(new Error('Nepodporovaný typ obrázku'));
}
