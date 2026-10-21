# Запасные картинки эмодзи

SVG-копии эмодзи из словаря. `WordImage` показывает их, если шрифт устройства не умеет рисовать эмодзи (на старых Android вместо него выводится квадрат с крестиком).

Файлы называются по кодовым точкам без `FE0F`, например `1fa91.svg` для 🪑. Чтобы скачать недостающие: `node scripts/fetch-emoji.mjs`.

Источник: [Twemoji](https://github.com/jdecked/twemoji), © Twitter, Inc и другие участники, лицензия [CC-BY 4.0](https://creativecommons.org/licenses/by/4.0/).
