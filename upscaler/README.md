# Soubory pro AI zvětšení obrázků

Modely a knihovna TensorFlow.js pro stránku `upscaler.html`, hostované přes GitHub Pages.

## Obsah

| Složka | Co to je | Licence |
|---|---|---|
| `lib/tf.min.js`, `lib/tf-backend-webgpu.min.js` | TensorFlow.js 4.22.0 | Apache 2.0 (`lib/LICENSE-tfjs`) |
| `models/realesrgan/anime_fast-64` | Real-ESRGAN animevideov3 (Kresba 4×) | BSD-3 (`models/realesrgan/LICENSE`) |
| `models/realesrgan/general_fast-64` | Real-ESRGAN general x4v3 (Fotka 4×) | BSD-3 |
| `models/realcugan/2x-conservative-64` | Real-CUGAN 2× (Kresba 2×) | MIT (`models/realcugan/LICENSE`) |

Modely převedené do formátu TF.js pocházejí z npm balíčku `@plotdb/upscaler@0.0.5`.

## Zprovoznění

1. Obsah této složky nahraj do kořene repozitáře na GitHubu.
2. V repozitáři otevři **Settings → Pages**, jako zdroj zvol větev `main` a složku `/ (root)`.
3. Po minutě bude web na adrese `https://UZIVATEL.github.io/REPOZITAR/`.
4. Ověř v prohlížeči, že se otevře `https://UZIVATEL.github.io/REPOZITAR/lib/tf.min.js`.
5. V `upscaler.html` nastav tuto adresu do `MY_ASSETS` (s lomítkem na konci).
