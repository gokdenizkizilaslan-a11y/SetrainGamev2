# NPC Portreleri — Nasıl Eklenir?

Kasaba Merkezi ve giriş hikayesindeki konuşmacıların resimleri buraya atılır.
Dosya adı, `content.js` → `npcs[]` içindeki `image` yoluyla eşleşmeli:

```
public/images/npcs/blacksmith.png      (Blacksmith)
public/images/npcs/merchant.png        (Merchant)
public/images/npcs/tavernkeeper.png    (Tavernkeeper)
public/images/npcs/mira.png            (Giriş hikayesi — Mira)
```

## Kurallar

- Format: PNG veya JPG (`.png` önerilir).
- Önerilen boyut: `512×512` (yuvarlak + kart görünümü CSS'ten gelir).
- **Dosya yoksa:** renkli degrade + boş portre görünür, oyun kırılmaz.
- Yeni NPC: `content.js` → `npcs` listesine ekle (`id`, `name`, `title`,
  `image`, `location`) ve en az bir `start` düğümü yaz. Kaydet →
  `public/images/npcs/<id>.png` dosyasını at → restart.
- Diyalog düğümleri: `{ id, text, options: [{ label, to }] }`.
  `to` başka bir düğümün id'si olmalı, `end: true` konuşmayı bitirir.
