# Items — How to replace

Each item is loaded by its `id`.

| Filename | Example | Slot |
|---|---|---|
| `<item_id>.png` | `rusty_sword.png` | weapon |
| `leather_helm.png` | head | head |
| `void_crown.png` | legendary head | head |

Full pattern: `items[].image = "/images/items/<id>.png"`

Current items (100+): `rusty_sword, leather_helm, leather_chest, leather_pants, leather_boots, iron_amulet, iron_ring, mana_talisman, battle_axe, war_hammer, longbow, shortbow, apprentice_staff, archon_staff, dagger, poison_dagger, mace, holy_sword, kris_blade, whisper_blade, scepter, cleric_staff, maul, bulwark_hammer, stone_ash_sword, hearth_tea, field_rations, fire_essence, frost_essence, arcane_essence, shadow_essence, heart_of_fire, golem_heart, ancient_relic, fire_ash_sword, molten_cleaver, frost_gladius, arcane_rod, shadow_knife, ember_sword, phoenix_staff, void_cleaver, iron_greatsword, steel_blade, ranger_bow, arcane_scepter, shadow_dagger, dragon_spear, titan_hammer, storm_bow, void_blade, world_breaker, bronze_helm...` (see content.js items array for full list)

- Format: PNG or JPG both work.
- Recommended: 256x256 transparent PNG.
- Missing → brown gradient circle fallback with icon.
- Chests (`wooden_chest, iron_chest, gold_chest`) have no image by default — they render as colored chest icon. Drop an image to override: `wooden_chest.png`.

Add new item: push to `items` array in content.js with `id: "my_item"` and `image: "/images/items/my_item.png"` then drop `my_item.png` here.
