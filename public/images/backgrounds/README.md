# Arkaplanlar (Backgrounds) — Nasıl değiştirilir?

Arkaplan resmini buraya at → her yerde otomatik görünür. **Kod değiştirmene gerek yok.**

---

## Tek resim her yerde görünsün istiyorsan (önerilen)

Dosyanı **`bg.png`** (veya `bg.jpg`, `bg.webp`) adıyla buraya at:

```
public/images/backgrounds/bg.png
```

`bg.png`, **menü, karakter yaratma, lobi, town, dungeon, taverna — yani TÜM
ekranlarda** en arkada görünür. Büyük kısmını yapmak istediğin tek dosyalık çözüm budur.

> Alternatif: Sadece `menu.png` koyarsan o da her ekranda fallback olarak kullanılır
> (eski sistem davranışı korunur).

## Ekrana özel resimler istiyorsan (opsiyonel)

| Dosya adı | Nerede görünür |
|---|---|
| `bg.png` | **Global** — her yerde (önceliği en düşüktür) |
| `setup.png` | Karakter yaratma ekranı |
| `lobby.png` | Lobi / salon listesi |
| `town.png` | Town ekranı |
| `dungeon.png` | Zindan / savaş ekranı (overlay açıkken) |
| `tavern.png` | Taverna ekranı (overlay açıkken) |
| `menu.png` | Ana menü (ayrıca her yerde fallback) |

**Öncelik sırası:** Ekrana özel resim → `bg.png` (global) → `menu.png` (fallback).
Yani `town.png` atarsan town'da o görünür, diğer ekranlarda `bg.png` (veya `menu.png`).

---

## Kurallar

- **Uzantı:** PNG, JPG, JPEG, WEBP hepsi otomatik bulunur. `bg.jpg` koyman yeterli,
  `.png` şart değil (oyun sırayla `png → jpg → jpeg → webp` dener).
- **Önerilen boyut:** `1920×1080`. Resim ekranı kaplar (`cover`), sıkıştırılmaz.
- **Resim yoksa:** sıcak parşömen degrade gösterilir, oyun bozulmaz.
- **Opaklık / bulanıklık:** `public/style.css` içinde
  `--bg-photo-opacity` (varsayılan 0.55) ve `--bg-photo-blur` değerlerini değiştir.
- Town'da resim otomatik olarak biraz daha soluk gösterilir (panel okunurluğu için).

## Örnek

```
public/images/backgrounds/bg.png     →  her ekranda görünür
public/images/backgrounds/town.png   →  town'da bg.png'nin üstüne biner
public/images/backgrounds/dungeon.png → dungeon/savaş açıkken görünür
```

## Deploy

`git add` + `git commit` + `git push` → Render `public/` klasörünü doğrudan servis
eder. Sunucu restartı gerekmez (statik dosya).