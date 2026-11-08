# DeepSeek İçin Talimat — Görsel Eklenti Entegrasyonu

Bu dosyayı DeepSeek'e **olduğu gibi** ver. Amaç: oyunun mekaniğini bozmadan görselleri entegre etmek.

## 1) Kesin kurallar
1. `travel.js` ve `travel_visuals.js` dosyalarını **yeniden yazma, kısaltma, özetleme, "temizleme"**. Olduğu gibi kullan.
2. Yükleme sırası **önemli**: önce `travel.js`, sonra `travel_visuals.js`.
3. Hasar, can, cooldown, hız gibi **mekanik değerlere dokunma**. Eklenti sadece çizim yapar.
4. Yeni skill yazarken **mekanik kısmı** (hasar, alan, süre) sen yaz; **görsel kısmı** hazır efektten çağır (aşağıda).
5. Hata görürsen önce tarayıcı konsoluna bak. `[TravelVisuals]` ile başlayan uyarılar bilinmeyen isim yazıldığını söyler.

## 2) Kurulum (2 satır)
```html
<script src="travel.js"></script>
<script src="travel_visuals.js"></script>
```
Bölge, `zoneName` içindeki isimden **otomatik** seçilir (Verdant Wilds / Ashen Wastes / Frozen Tundra / Mirefen Marsh / Cursed Reach). Ek kod gerekmez. Bölgeyi sonradan değiştirmek için: `engine.setZone('Frozen Tundra - Normal')`.

## 3) Skill görseli çağırma
Skill'in mekaniği çalıştığı anda, hedef noktada **tek satır**:
```js
engine.castVisual('Meteor Storm', hedefX, hedefY);          // hazır listeden ada göre
engine.playFx('spinSlash', x, y, { color:'#ffd54f', follow:true }); // doğrudan efekt
engine.playFx('holyBeam', x, y, { scale: 1.3 });            // 1.3 kat büyük
```
- `x, y` = **dünya** koordinatı (ekran değil). Oyuncunun kendisi için `engine.player.x, engine.player.y`.
- `follow:true` = efekt oyuncuyu takip eder (spinSlash, bladeStorm gibi oyuncu etrafındakiler için).
- `scale` = boyut çarpanı. `radius` = efekt yarıçapı (piksel). Varsayılanlar 55–95 px.
- `angle` = yön (radyan), sadece `iceWall` için.
- Hazır skill listesi: `TravelVisuals.skills` (isim, efekt, renk, önerilen sınıflar). 21 adet.

| Efekt | Ne yapar | Önerilen kullanım |
|---|---|---|
| spinSlash | kılıç 2 tur döner | oyuncu etrafı (follow:true) |
| groundSlam | yer çatlar, şok dalgası | hedef nokta |
| frostNova / emberBurst | buz / ateş patlaması | oyuncu veya hedef |
| poisonCloud | zehir bulutu (1.6 sn) | alan skill |
| lightningChain | zincir yıldırım | `points:[{x,y}...]` ekran noktaları |
| healPulse | iyileştirme halkaları | oyuncu |
| arcaneCircle | rün çemberi | alan / buff |
| bloodScythe | büyük çapraz kesik | melee |
| meteorStrike | gökten meteor + krater | hedef nokta |
| holyBeam | ışık sütunu | hedef nokta |
| firePillar | alev kolonu | hedef nokta |
| tornado | hortum (2 sn) | alan skill |
| thunderStrike | gökten şimşek | hedef nokta |
| shadowTendrils | gölge kolları | hedef nokta |
| vineGrasp | dikenli sarmaşık | kök/hareketsiz bırakma |
| iceWall | buz duvarı, sonda kırılır | `angle` ile yön |
| bladeStorm | dönen bıçaklar | oyuncu etrafı (follow:true) |
| starfall | yıldız yağmuru | hedef alan |
| gravityWell | karadelik, sonda çöker | hedef nokta |
| soulHarvest | ruhlar yükselir | ölüm/can çalma |

## 4) RENK GEÇİŞLERİ — nasıl yapılır
**Kural:** renkler asla ani değişmez. Her zaman iki ya da üç renk arasında **yumuşak karışım** vardır.
Formül: `t = smoothstep(start, end, konum)` → `renk = lerp(renk[i], renk[i+1], t)`

### A) Haritada bir uçtan diğerine (mekânsal)
```js
engine.setTransition('verdantToAshen');    // hazır
engine.setTransition({                      // veya kendin
  stops: ['#5da24a', '#8a6a3a', '#5a4a40'], // yeşil → toprak → kül (soldan sağa)
  axis: 'x',            // 'x' | 'y' | 'radial' | derece (0-360)
  start: 0.1, end: 0.9, // geçişin başladığı / bittiği yer (0..1)
  alpha: [0, 0.6]       // başta görünmez, sonda %60 opak
});
engine.setTransition(null);                 // kapat
```
Hazır geçişler (`TravelVisuals.transitionPresets`):

| Ad | Renk akışı (başlangıç → orta → son) | Yön |
|---|---|---|
| verdantToAshen | `#5da24a` çimen → `#8a6a3a` toprak → `#5a4a40` kül | x |
| verdantToFrozen | `#5da24a` → `#9ccfd8` buz mavisi → `#e8f4ff` kar | y |
| verdantToMire | `#5da24a` → `#4a7a3a` → `#3a5a3a` bataklık | 135° |
| verdantToCursed | `#5da24a` → `#6a5a8a` → `#3a2a5a` mor | merkezden dışa |
| ashenToCursed | `#8a3c1e` kor → `#6a2a5a` → `#3a2a5a` | x |
| frozenToMire | `#dff2ff` → `#8fbfae` → `#4a6a3a` | y |

### B) Zamanla ekran rengi (gün döngüsü)
```js
engine.setColorCycle('dayCycle');   // gün doğumu → gündüz → akşam → gece, 90 sn
engine.setColorCycle({ period: 60, stops: [
  { c:'#ffb36b', a:0.14 },   // şafak turuncusu
  { c:'#ffffff', a:0    },   // gündüz: renk yok
  { c:'#7a4dff', a:0.16 },   // akşam moru
  { c:'#0a1a4a', a:0.30 }    // gece mavisi
]});
```
Hazırlar: `dayCycle`, `bloodMoon` (kırmızıya dönüp söner), `aurora` (yeşil → mavi → mor).

### Bölge renk paleti (referans)
| Bölge | Çimen zemin | Yol zemin | Kaya | Hava |
|---|---|---|---|---|
| Ashen Wastes | `#5a4a40` kül | `#8a3c1e` kor çatlak | `#2c2832` obsidyen | kül + kıvılcım |
| Frozen Tundra | `#c4dcec` kar | `#6fb4da` buz | `#9cc0d8` | kar |
| Mirefen Marsh | `#46662e` yosun | `#5a4c2c` çamur | `#4a5e50` | sis + ateş böceği + çise |
| Cursed Reach | `#4a3a64` mor | `#30243e` rünlü | `#2c1c48` | mor ruh + şimşek |

## 5) Canavar görünümü
Spawn sonrası eklenti canavarların `kind`, `name`, `radius` alanlarını bölgeye göre değiştirir (can/hasar aynı kalır).
Yeni canavar çizmek için `TravelVisuals.mobs` tablosuna `{ name, radius, paint(g, m, t, face, atkT) }` ekle.
Kapatmak için: `TravelVisuals.options.mobs = false`.

## 6) Hızlı test
```js
TravelVisuals.installDemoKeys(engine);   // 1..9 tuşları ilk 9 efekti oyuncunun üstünde dener
```

## 7) DeepSeek'e verilecek hazır prompt
> `travel.js` ve `travel_visuals.js` dosyalarını değiştirmeden projeye ekle (önce travel.js). Oyunun mekaniğine dokunma. Mevcut skill'lerin çalıştığı noktaya `engine.castVisual(skillAdı, x, y)` veya `engine.playFx(efektAdı, x, y, {color, scale})` çağrısı ekle. Dünya haritası için `engine.setTransition('verdantToAshen')` gibi bir renk geçişi, atmosfer için `engine.setColorCycle('dayCycle')` çağır. Yeni skill yazarsan hasar/alan mekaniğini sen yaz, görsel için hazır efektlerden birini kullan.

## 8) YENİ: 10 epik skill + sınıf eşleşmesi
`TravelVisuals.skillsFor('Archmage')` o sınıfa uygun tüm görselleri döner. Her skill `engine.castVisual(ad, x, y)` ile çağrılır.

| Skill (castVisual adı) | Efekt | Sınıflar | Not |
|---|---|---|---|
| Dragon Breath | dragonBreath | War Emperor, War Lord, Bloodlord | koni alev, `angle` ile yön (ekran radyanı) |
| Phoenix Rebirth | phoenixRise | Divine Saint, High Priest, Lightbringer | diriliş / buff |
| Tree of Life | treeOfLife | Lifeweaver, Gardener, Healer | alan iyileştirme |
| Dimension Rift | dimensionRift | Archmage, Archon, Shade King, Ultra Moderator | çekim / ışınlanma |
| Divine Judgement | judgementSwords | Paladin, Crusader, Lightbringer, Archon | büyük alan hasarı |
| Blood Ritual | bloodRitual | Bloodlord, Sanguine Lord, Bloodspawn | ultimate |
| Blizzard | blizzard | Archmage, Warden, Storm Warden | uzun süreli alan |
| Spirit Pack | spiritWolves | Beastmaster, Alpha Tamer, Tamer | çağırma |
| Titan Fist | titanFist | Colossus, Juggernaut, Tank | ağır tek vuruş |
| Bone Cage | boneCage | Death Lord, Reaper, Gloomspawn | kapan / hapsetme |

## 9) KENDİ EFEKTİNİ ÜRET (DeepSeek buradan ilham alsın)
Yeni efekt için sıfırdan çizim yazmaya gerek yok. **Yapı taşlarını** (`TravelVisuals.kit`) zamana dizerek birleştir:

```js
TravelVisuals.defineFx('meteorRain', {
  duration: 2, radius: 90, color: '#ff7a1a',      // süre (sn), referans yarıçap, ana renk
  layers: [                                        // her katman: kind + at (başlangıç 0..1) + len (süre 0..1)
    { kind: 'glowGround', at: 0,   len: 1 },
    { kind: 'fall',       at: 0,   len: 0.7, n: 7, h: 320 },
    { kind: 'ring',       at: 0.5, len: 0.5, w: 7 },
    { kind: 'burst',      at: 0.5, len: 0.5, n: 22, up: 40, col2: '#ffd54f' }
  ]
});
TravelVisuals.defineSkill({ name: 'Meteor Rain', fx: 'meteorRain', opts: { radius: 90 }, classes: ['Mage'] });
engine.castVisual('Meteor Rain', x, y);
```
`radius` verilince tüm katmanlar orantılı büyür/küçülür. Katmanlar üst üste binebilir.

| Yapı taşı | Çizdiği | Ana ayarlar |
|---|---|---|
| ring | genişleyen zemin halkası | r, w, from |
| glowGround | zeminde ışıma | r, a |
| pillar | dikey ışık/ateş sütunu | h, w |
| burst | dışa saçılan parçacık | n, r, size, up, col2 |
| rise | yukarı süzülen parçacık | n, r, h, size, col2 |
| orbit | etrafta dönen nesneler | n, r, h, turns, shape: orb/blade/star |
| flash | parlama | r, a |
| bolt | gökten şimşek | from:[dx,dy] |
| slash | yarım ay kesik | r, ang |
| fall | gökten düşen cisimler + çarpma | n, h, dx, r |
| shards | yerden çıkan kristal | n, r, h |
| cracks | yer çatlakları | n, r |
| streaks | rüzgar çizgileri | n, r |
| spikes | halka dizili dikenler | n, r, h, lean |
| star | dönen pentagram | r, turn |

**Örnek fikirler (DeepSeek yapsın):** Meteor Rain (fall+ring+burst), Holy Prison (spikes+pillar+ring), Soul Storm (orbit+rise+flash), Ice Prison (shards+ring+glowGround), Thunder Dome (bolt×3 farklı at + ring), Blood Moon (star+pillar+rise).
Karmaşık, tek parça bir efekt gerekiyorsa `TravelVisuals.fx.isim = (ctx, sx, sy, p, o) => {...}` olarak elle yazılabilir. `dragonBreath`, `phoenixRise`, `titanFist` kaynak kodu örnek.

## 10) Boyut ve kalite kuralları
- Tipik skill yarıçapı 55–95 px; ultimate 90–130 px. Dev efektlerde `scale` yerine `radius` büyüt, daha iyi durur.
- Parıltı için `glow()` yeterli, çok sayıda `shadowBlur` kullanma (yavaşlatır).
- Süre: hızlı vuruş 0.5–0.9 sn, alan skill 1.5–2.4 sn.
- Renk: ana renk + açık ton (`col2`) + beyaz çekirdek. Sade 2–3 renk, karmaşa yapma.
