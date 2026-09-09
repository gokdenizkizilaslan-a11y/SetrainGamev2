# Beceriler — Görsel Ekleme

Her beceri `id`'si ile yüklenir:

```
public/images/skills/<skill_id>.png     →  örnek: slash.png
```

> Yol: `skills[].image = "/images/skills/<id>.png"` ve sınıfların temel saldırısı
> `classes[].basicAttack.image` aynı klasörü kullanır.

## Örnek id'ler

Temel: `slash, quick_shot, arcane_bolt, stab, smite, lunge, sanct_bolt,
shield_bash, tame_hit, beast_strike, alpha_strike`
Sınıf becerileri: `heavy_strike, defend, battle_fury, arcane_barrage, mana_shield,
aimed_shot, piercing_shot, vampiric_strike, shadow_meld, holy_strike, mend, execute,
shadow_step, greater_mend, spirit_surge, cleave, shield_wall, war_cry, volley,
meteor, shadow_veil, holy_judgement, death_mark, divine_blessing, bastion,
cataclysm...`
Monster/patron becerileri: `monster_physical_attack, monster_heavy_blow,
boss_ember_king_skill1...`

> Ayrıca element becerileri var: `vine_lash, thorn_volley, forest_renewal` (nature)
> ve editörde **Skills** sayfasında görülen diğerleri.

## Kurallar

- Format: PNG veya JPG.
- Önerilen boyut: `128×128` veya `256×256`.
- **Dosya yoksa:** bronz degrade kare fallback'i görünür, oyun çökmez.

## Yeni beceri eklerken

1. `/editor` → **Skills** → **Add**: `id`, `name`, `target`, `mana`, `power`,
   `element` gir.
2. **Image path**'teki **"Default: ..."** butonuna bas.
3. Beceriyi bir sınıfa eklemek istersen **Classes** → `startingSkills` alanına
   id'yi ekle.
4. Kaydet → `public/images/skills/<id>.png` dosyasını at → restart.