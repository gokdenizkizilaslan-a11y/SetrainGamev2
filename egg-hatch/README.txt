THE SETRA GAME - EGG HATCHING & PET ANIMATION SYSTEM
=====================================================
Bu paket sadece yumurta kirilma efektleri, pariltilar, beyaz ekran flasi,
fizik motoru ve pet reveal sistemini icerir.

Dosyalar:
- egg_animation.js       : Standalone JS animasyon motoru (Fizik, ses, pariltilar)
- egg_animation.css      : Orta cag temali stil dosyalari
- eggs_data.json         : 10 adet yumurtanin ozellikleri, renkleri ve temalari
- pets_data.json         : Pet listesi ve statlari
- egg_standalone_demo.html: Tarayicida cift tiklayip hemen test edebileceginiz demo
- AI_INSTRUCTIONS_PROMPT.md : Baska bir AI'ya (ChatGPT/Claude/Cursor) direkt kopyalayip yapistirabileceginiz talimat metni

Kullanim:
index.html'e ekleyin:
  <link rel="stylesheet" href="/egg_animation.css" />
  <script src="/egg_animation.js"></script>

screens.js icinde:
  await window.playEggAnimation(eggId);
