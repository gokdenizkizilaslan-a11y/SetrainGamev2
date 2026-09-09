# UI — Görsel Ekleme

| Dosya | Nerede görünür | content.js anahtarı |
|---|---|---|
| `panel.png` | Altın çerçeveli panel dokusu (opsiyonel) | `images.ui.panel` |

- **Opsiyonel** bir overlay dokusudur. Yoksa CSS cam (glass) efekti kullanılır,
  oyun yine güzel çalışır.
- Format: PNG veya JPG. `panel.jpg` kullanmak için `content.js` içindeki yolu
  `/images/ui/panel.jpg` yap.
- Önerilen: `1024×1024` dikişsiz (tileable) parşömen/altın dokusu, yarı-şeffaf.
- Butonlar ve barlar tamamen CSS'tir — resim gerekmez.
- Panel dokusunu `/editor` → yok, doğrudan `content.js` `images.ui.panel` alanından
  değiştirebilirsin.

Ek UI dokusu eklemek istersen: dosyayı buraya at ve `public/style.css` içinde
`url('/images/ui/<ad>.png')` ile referans ver.