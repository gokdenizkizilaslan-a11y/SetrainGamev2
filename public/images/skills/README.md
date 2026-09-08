# Skills — How to replace

Each skill icon is loaded by its `id`.

| Filename | Skill example | Content.js key |
|---|---|---|
| `<skill_id>.png` | `slash.png` | `classes[].basicAttack.image` or `skills[].image` |
| `heavy_strike.png` | Warrior skill | `skills[].id` |
| `fireball.png` | Mage skill | same |

Current skill ids (example): `slash, quick_shot, arcane_bolt, stab, smite, lunge, sanct_bolt, shield_bash, heavy_strike, defend, battle_fury, arcane_barrage, mana_shield, aimed_shot, piercing_shot, vampiric_strike, shadow_meld, holy_strike, mend, execute, shadow_step, greater_mend, spirit_surge, cleave, shield_wall, war_cry, volley, meteor, shadow_veil, holy_judgement, death_mark, divine_blessing, bastion, cataclysm...` plus monster skills: `monster_physical_attack, monster_heavy_blow, boss_ember_king_skill1` etc.

- Path: `skills[].image = "/images/skills/<id>.png"` and `classes[].basicAttack.image`
- Format: PNG or JPG both work.
- Recommended: 128x128 or 256x256.
- Missing → warm bronze gradient square fallback.

Add new skill: add to `skills` array with `id: "my_skill"` and `image: "/images/skills/my_skill.png"` then add id to `classes[].startingSkills`, drop `my_skill.png` here.
