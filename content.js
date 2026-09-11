/**
 * THE SETRA GAME — all tunable data lives here.
 * Easy editing: run `npm run edit` (node edit-content.js) for a guided editor.
 * Manual editing: see HOW_TO_EDIT_CONTENT.md
 */

const CONTENT = {
  "nameMin": 2,
  "nameMax": 20,
  "maxPlayersMultiplayer": 8,
  "maxPlayersSingleplayer": 1,
  "roomCodeLength": 5,
  "roomCodeChars": "ABCDEFGHJKLMNPQRSTUVWXYZ23456789",
  "starting": {
    "lives": 3,
    "wood": 0,
    "gold": 50,
    "stamina": 10,
    "maxStamina": 10
  },
  "leveling": {
    "maxLevel": 50,
    "xpBase": 500,
    "xpExponent": 1.45,
    "growthScale": 0.02
  },
  "combos": [
    {
      "id": "overcharge",
      "name": "Overcharge",
      "when": "wet",
      "ifElement": "lightning",
      "mult": 1.5,
      "desc": "Lightning surges through soaked foes, dealing +50% damage to wet targets."
    },
    {
      "id": "deep_freeze",
      "name": "Deep Freeze",
      "when": "wet",
      "ifElement": "frost",
      "mult": 1.4,
      "desc": "Frost latches onto moisture, dealing +40% damage to wet targets."
    },
    {
      "id": "shatter",
      "name": "Shatter",
      "when": "frozen",
      "ifElement": "physical",
      "mult": 1.6,
      "desc": "Physical blows shatter frozen enemies, dealing +60% damage."
    },
    {
      "id": "burning",
      "name": "Burning Blaze",
      "when": "dot",
      "ifElement": "fire",
      "mult": 1.6,
      "desc": "Fire erupts on burning foes, dealing +60% damage to poisoned targets."
    },
    {
      "id": "break_guard",
      "name": "Break Guard",
      "when": "expose",
      "ifElement": "physical",
      "mult": 1.35,
      "desc": "Exposed enemies take +35% physical damage."
    },
    {
      "id": "overwhelm",
      "name": "Overwhelm",
      "when": "weaken",
      "ifElement": "physical",
      "mult": 1.2,
      "desc": "Weakened enemies crumble, taking +20% physical damage."
    }
  ],
  "elements": [
    {
      "id": "physical",
      "name": "Physical",
      "palette": [
        "#ffffff",
        "#fde047",
        "#94a3b8"
      ],
      "gravity": 0.16,
      "sound": "slash1",
      "effect": "rising_katana_slash",
      "travel": "piercing_rapier_thrust",
      "description": "Plain weapon strikes and brute force."
    },
    {
      "id": "arcane",
      "name": "Arcane",
      "palette": [
        "#a78bfa",
        "#7c3aed",
        "#e0e7ff"
      ],
      "gravity": 0.02,
      "sound": "normalmagic",
      "effect": "frost_crystal_spear",
      "travel": "ball_lightning_plasma",
      "description": "Raw magical energy and eldritch plasma."
    },
    {
      "id": "shadow",
      "name": "Shadow",
      "palette": [
        "#6b7280",
        "#4b5563",
        "#374151"
      ],
      "gravity": -0.05,
      "sound": "bloodmagic1",
      "effect": "shadow_scythe_reap",
      "travel": "dark_matter_orb",
      "description": "Darkness and cold moonlight arts."
    },
    {
      "id": "holy",
      "name": "Holy",
      "palette": [
        "#facc15",
        "#ffffff",
        "#fde047"
      ],
      "gravity": -0.04,
      "sound": "normalmagic",
      "effect": "holy_pillar_smite",
      "travel": "holy_lance_projectile",
      "description": "Divine light and radiant judgement."
    },
    {
      "id": "frost",
      "name": "Frost",
      "palette": [
        "#38bdf8",
        "#7dd3fc",
        "#0ea5e9",
        "#e0f2fe"
      ],
      "gravity": 0.13,
      "sound": "frostmagic",
      "effect": "frost_crystal_spear",
      "travel": "frost_crystal_spear",
      "description": "Ice, cold and glacial shards."
    },
    {
      "id": "fire",
      "name": "Fire",
      "palette": [
        "#f97316",
        "#ef4444",
        "#fde047"
      ],
      "gravity": -0.08,
      "sound": "firemagic",
      "effect": "fire_meteor_crash",
      "travel": "fireball_streak",
      "description": "Burning flame and searing heat."
    },
    {
      "id": "water",
      "name": "Water",
      "palette": [
        "#3b82f6",
        "#2563eb",
        "#0ea5e9"
      ],
      "gravity": 0.1,
      "sound": "frostmagic",
      "effect": "tidal_wave_water",
      "travel": "frost_crystal_spear",
      "description": "Flowing currents and crushing waves."
    },
    {
      "id": "earth",
      "name": "Earth",
      "palette": [
        "#854d0e",
        "#a16207",
        "#713f12",
        "#57534e"
      ],
      "gravity": 0.25,
      "sound": "battleaxe",
      "effect": "earth_fissure_rupture",
      "travel": "rock_avalanche_barrage",
      "description": "Stone, soil and bedrock."
    },
    {
      "id": "nature",
      "name": "Nature",
      "palette": [
        "#4ade80",
        "#22c55e",
        "#15803d",
        "#bef264"
      ],
      "gravity": 0.08,
      "sound": "normalmagic",
      "effect": "nature_vine_burst",
      "travel": "nature_vine_projectile",
      "description": "Growth, vines, thorns and the living forest."
    },
    {
      "id": "lightning",
      "name": "Lightning",
      "palette": [
        "#facc15",
        "#fef08a",
        "#ffffff"
      ],
      "gravity": 0.06,
      "sound": "normalmagic",
      "effect": "lightning_strike_heavy",
      "travel": "storm_spear_throw",
      "description": "Storms, thunder and electric surges."
    },
    {
      "id": "blood",
      "name": "Blood",
      "palette": [
        "#dc2626",
        "#b91c1c",
        "#7f1d1d"
      ],
      "gravity": 0.22,
      "sound": "bloodmagic1",
      "effect": "blood_scythe",
      "travel": "blood_drain",
      "description": "Crimson hemomancy and life-stealing arts."
    },
    {
      "id": "dark",
      "name": "Dark",
      "palette": [
        "#a855f7",
        "#7c3aed",
        "#4c1d95"
      ],
      "gravity": -0.05,
      "sound": "bloodmagic2",
      "effect": "shadow_scythe_reap",
      "travel": "dark_matter_orb",
      "description": "Void, abyss and forbidden power."
    }
  ],
  "affinity": {
    "physical": {
      "physical": 1,
      "arcane": 1,
      "shadow": 1,
      "holy": 1,
      "frost": 1,
      "fire": 1,
      "water": 1,
      "earth": 1,
      "nature": 1,
      "lightning": 1,
      "blood": 1,
      "dark": 1
    },
    "arcane": {
      "physical": 1,
      "arcane": 0.8,
      "shadow": 1.2,
      "holy": 0.8,
      "frost": 1,
      "fire": 1,
      "water": 1,
      "earth": 1,
      "nature": 1,
      "lightning": 1,
      "blood": 1,
      "dark": 1.2
    },
    "shadow": {
      "physical": 1,
      "arcane": 1.2,
      "shadow": 0.8,
      "holy": 1.3,
      "frost": 1,
      "fire": 1,
      "water": 1,
      "earth": 1,
      "nature": 1,
      "lightning": 1,
      "blood": 1,
      "dark": 0.8
    },
    "holy": {
      "physical": 1,
      "arcane": 0.8,
      "shadow": 1.3,
      "holy": 0.8,
      "frost": 1,
      "fire": 1,
      "water": 1,
      "earth": 1,
      "nature": 1,
      "lightning": 1,
      "blood": 1.2,
      "dark": 1.3
    },
    "frost": {
      "physical": 1,
      "arcane": 1,
      "shadow": 1,
      "holy": 1,
      "frost": 0.7,
      "fire": 1.3,
      "water": 1,
      "earth": 1,
      "nature": 1,
      "lightning": 1,
      "blood": 1,
      "dark": 1
    },
    "fire": {
      "physical": 1,
      "arcane": 1,
      "shadow": 1,
      "holy": 1,
      "frost": 1.3,
      "fire": 0.7,
      "water": 1.3,
      "earth": 1,
      "nature": 1.2,
      "lightning": 1,
      "blood": 1,
      "dark": 1
    },
    "water": {
      "physical": 1,
      "arcane": 1,
      "shadow": 1,
      "holy": 1,
      "frost": 1,
      "fire": 1.3,
      "water": 0.7,
      "earth": 1.2,
      "nature": 1,
      "lightning": 1.4,
      "blood": 1,
      "dark": 1
    },
    "earth": {
      "physical": 1,
      "arcane": 1,
      "shadow": 1,
      "holy": 1,
      "frost": 1,
      "fire": 1,
      "water": 1.2,
      "earth": 0.7,
      "nature": 1.2,
      "lightning": 1,
      "blood": 1,
      "dark": 1
    },
    "nature": {
      "physical": 1,
      "arcane": 1,
      "shadow": 1,
      "holy": 1,
      "frost": 1,
      "fire": 1.2,
      "water": 1,
      "earth": 1.2,
      "nature": 0.7,
      "lightning": 1,
      "blood": 1,
      "dark": 1
    },
    "lightning": {
      "physical": 1,
      "arcane": 1,
      "shadow": 1,
      "holy": 1,
      "frost": 1,
      "fire": 1,
      "water": 1.4,
      "earth": 0.8,
      "nature": 1,
      "lightning": 0.7,
      "blood": 1,
      "dark": 1
    },
    "blood": {
      "physical": 1,
      "arcane": 1,
      "shadow": 1,
      "holy": 1.2,
      "frost": 1,
      "fire": 1,
      "water": 1,
      "earth": 1,
      "nature": 1,
      "lightning": 1,
      "blood": 0.7,
      "dark": 1.2
    },
    "dark": {
      "physical": 1,
      "arcane": 1.2,
      "shadow": 0.8,
      "holy": 1.3,
      "frost": 1,
      "fire": 1,
      "water": 1,
      "earth": 1,
      "nature": 1,
      "lightning": 1,
      "blood": 1.2,
      "dark": 0.7
    }
  },
  "skillTree": {
    "pointsPerLevel": 3,
    "startingPoints": 3,
    "maxLoadout": 5,
    "global": [
      {
        "id": "g_def_divine_guard",
        "skillId": "divine_guard",
        "cost": 2,
        "group": "defense",
        "desc": "A holy ward turns aside a heavy blow."
      },
      {
        "id": "g_def_fortify",
        "skillId": "fortify",
        "cost": 3,
        "group": "defense",
        "desc": "Steady yourself against damage."
      },
      {
        "id": "g_def_war_banner",
        "skillId": "war_banner",
        "cost": 4,
        "group": "combat",
        "desc": "Raise morale; allies strike true."
      },
      {
        "id": "g_def_dark_veil",
        "skillId": "dark_veil",
        "cost": 6,
        "group": "defense",
        "desc": "Wraiths of shadow guard you and sap the foe."
      },
      {
        "id": "g_def_aegis",
        "skillId": "aegis",
        "cost": 3,
        "group": "defense",
        "desc": "A mighty ward shields body and spirit."
      },
      {
        "id": "g_def_barrier",
        "skillId": "barrier",
        "cost": 4,
        "group": "defense",
        "desc": "A resilient bulwark of pure will."
      },
      {
        "id": "g_def_stone_skin",
        "skillId": "stone_skin",
        "cost": 4,
        "group": "defense",
        "desc": "Your hide hardens into living stone."
      },
      {
        "id": "g_def_iron_wall",
        "skillId": "iron_wall",
        "cost": 6,
        "group": "defense",
        "desc": "Become an unyielding wall of iron."
      },
      {
        "id": "g_def_group_guard",
        "skillId": "group_guard",
        "cost": 7,
        "group": "defense",
        "desc": "Guard the whole party with armored grace."
      },
      {
        "id": "g_def_holy_ward",
        "skillId": "holy_ward",
        "cost": 6,
        "group": "defense",
        "desc": "A radiant barrier blessed against harm."
      },
      {
        "id": "g_def_rejuvenate",
        "skillId": "rejuvenate",
        "cost": 3,
        "group": "heal",
        "desc": "Renew vitality, round after round."
      },
      {
        "id": "g_def_magic_mend",
        "skillId": "magic_mend",
        "cost": 5,
        "group": "heal",
        "desc": "Mend wounds with pure channeled magic."
      },
      {
        "id": "g_elem_water_splash",
        "skillId": "water_splash",
        "cost": 2,
        "group": "frost",
        "desc": "Soak the foe - wet makes lightning and frost bite harder."
      },
      {
        "id": "g_elem_lightning_bolt",
        "skillId": "lightning_bolt",
        "cost": 4,
        "group": "lightning",
        "desc": "Overcharge: +50% vs wet."
      },
      {
        "id": "g_elem_static_overload",
        "skillId": "static_overload",
        "cost": 10,
        "group": "lightning",
        "desc": "Mighty lightning; still +50% vs wet."
      },
      {
        "id": "g_elem_volt_conduit",
        "skillId": "volt_conduit",
        "cost": 4,
        "group": "lightning",
        "desc": "Electrify the foe while wet."
      },
      {
        "id": "g_elem_frost_bolt",
        "skillId": "frost_bolt",
        "cost": 2,
        "group": "frost",
        "desc": "A chill that lingers."
      },
      {
        "id": "g_elem_cold_snap",
        "skillId": "cold_snap",
        "cost": 4,
        "group": "frost",
        "desc": "Freeze the foe solid."
      },
      {
        "id": "g_elem_frost_nova",
        "skillId": "frost_nova",
        "cost": 5,
        "group": "frost",
        "desc": "A burst of frost; freezes, then Shatter for +60%."
      },
      {
        "id": "g_elem_glacial_shatter",
        "skillId": "glacial_shatter",
        "cost": 10,
        "group": "frost",
        "desc": "Shatter the ice for huge frost damage."
      },
      {
        "id": "g_elem_scorch_mark",
        "skillId": "scorch_mark",
        "cost": 2,
        "group": "fire",
        "desc": "Set the foe alight."
      },
      {
        "id": "g_elem_ember_storm",
        "skillId": "ember_storm",
        "cost": 4,
        "group": "fire",
        "desc": "Whirling cinders that keep burning."
      },
      {
        "id": "g_elem_blaze_rupture",
        "skillId": "blaze_rupture",
        "cost": 7,
        "group": "fire",
        "desc": "Burning Blaze: +60% vs poisoned foes."
      },
      {
        "id": "g_brk_venom_strike",
        "skillId": "venom_strike",
        "cost": 2,
        "group": "poison",
        "desc": "Lace your weapon with venom."
      },
      {
        "id": "g_brk_toxin_drench",
        "skillId": "toxin_drench",
        "cost": 4,
        "group": "poison",
        "desc": "Heavy poison for 6% max HP / round."
      },
      {
        "id": "g_brk_venom_burst",
        "skillId": "venom_burst",
        "cost": 6,
        "group": "poison",
        "desc": "Poisoned targets take +50%."
      },
      {
        "id": "g_brk_cripple",
        "skillId": "cripple",
        "cost": 2,
        "group": "break",
        "desc": "Weaken and expose the foe in one blow."
      },
      {
        "id": "g_brk_broken_guard",
        "skillId": "broken_guard",
        "cost": 4,
        "group": "break",
        "desc": "Shatter guard: expose + weaken."
      },
      {
        "id": "g_brk_shatter_point",
        "skillId": "shatter_point",
        "cost": 7,
        "group": "break",
        "desc": "Break Guard: +80% vs exposed."
      },
      {
        "id": "g_brk_devastate",
        "skillId": "devastate",
        "cost": 10,
        "group": "break",
        "desc": "Overwhelm: +35% vs weakened."
      },
      {
        "id": "g_nat_vine_lash",
        "skillId": "vine_lash",
        "cost": 3,
        "group": "poison",
        "desc": "Whipping vines for 1.4× magic - first link of the nature chain."
      },
      {
        "id": "g_nat_thorn_volley",
        "skillId": "thorn_volley",
        "cost": 5,
        "group": "poison",
        "desc": "Thorny barrage for 1.9× magic that bleeds. Requires Vine Lash.",
        "prereqs": [
          "g_nat_vine_lash"
        ]
      },
      {
        "id": "g_nat_forest_renewal",
        "skillId": "forest_renewal",
        "cost": 4,
        "group": "heal",
        "desc": "Bloom restores 30% of your max HP."
      }
    ],
    "lineages": {
      "warrior": {
        "label": "Warrior Path",
        "nodes": [
          {
            "id": "w_heavy_strike",
            "skillId": "heavy_strike",
            "owned": true,
            "cost": 0
          },
          {
            "id": "w_defend",
            "skillId": "defend",
            "owned": true,
            "cost": 0
          },
          {
            "id": "w_battle_fury",
            "skillId": "battle_fury",
            "owned": true,
            "cost": 0
          },
          {
            "id": "w_war_cry",
            "skillId": "war_cry",
            "ownerClass": "warlord",
            "cost": 4,
            "minLevel": 20
          },
          {
            "id": "w_cataclysm",
            "skillId": "cataclysm",
            "ownerClass": "war_emperor",
            "cost": 8,
            "minLevel": 40
          }
        ]
      },
      "ranger": {
        "label": "Ranger Path",
        "nodes": [
          {
            "id": "r_aimed_shot",
            "skillId": "aimed_shot",
            "owned": true,
            "cost": 0
          },
          {
            "id": "r_piercing_shot",
            "skillId": "piercing_shot",
            "owned": true,
            "cost": 0
          },
          {
            "id": "r_volley",
            "skillId": "volley",
            "ownerClass": "warden",
            "cost": 4,
            "minLevel": 20
          },
          {
            "id": "r_storm_barrage",
            "skillId": "storm_barrage",
            "ownerClass": "storm_warden",
            "cost": 8,
            "minLevel": 40
          }
        ]
      },
      "mage": {
        "label": "Mage Path",
        "nodes": [
          {
            "id": "m_arcane_barrage",
            "skillId": "arcane_barrage",
            "owned": true,
            "cost": 0
          },
          {
            "id": "m_mana_shield",
            "skillId": "mana_shield",
            "owned": true,
            "cost": 0
          },
          {
            "id": "m_meteor",
            "skillId": "meteor",
            "ownerClass": "archmage",
            "cost": 4,
            "minLevel": 20
          },
          {
            "id": "m_comet",
            "skillId": "comet",
            "ownerClass": "archon",
            "cost": 8,
            "minLevel": 40
          }
        ]
      },
      "rogue": {
        "label": "Rogue Path",
        "nodes": [
          {
            "id": "rg_vampiric_strike",
            "skillId": "vampiric_strike",
            "owned": true,
            "cost": 0
          },
          {
            "id": "rg_shadow_meld",
            "skillId": "shadow_meld",
            "owned": true,
            "cost": 0
          },
          {
            "id": "rg_shadow_veil",
            "skillId": "shadow_veil",
            "ownerClass": "nightblade",
            "cost": 4,
            "minLevel": 20
          },
          {
            "id": "rg_soul_thief",
            "skillId": "soul_thief",
            "ownerClass": "shade_king",
            "cost": 8,
            "minLevel": 40
          }
        ]
      },
      "paladin": {
        "label": "Paladin Path",
        "nodes": [
          {
            "id": "p_holy_strike",
            "skillId": "holy_strike",
            "owned": true,
            "cost": 0
          },
          {
            "id": "p_mend",
            "skillId": "mend",
            "owned": true,
            "cost": 0
          },
          {
            "id": "p_holy_judgement",
            "skillId": "holy_judgement",
            "ownerClass": "crusader",
            "cost": 4,
            "minLevel": 20
          },
          {
            "id": "p_radiance",
            "skillId": "radiance",
            "ownerClass": "lightbringer",
            "cost": 8,
            "minLevel": 40
          }
        ]
      },
      "assassin": {
        "label": "Assassin Path",
        "nodes": [
          {
            "id": "a_execute",
            "skillId": "execute",
            "owned": true,
            "cost": 0
          },
          {
            "id": "a_shadow_step",
            "skillId": "shadow_step",
            "owned": true,
            "cost": 0
          },
          {
            "id": "a_death_mark",
            "skillId": "death_mark",
            "ownerClass": "reaper",
            "cost": 4,
            "minLevel": 20
          },
          {
            "id": "a_soul_reap",
            "skillId": "soul_reap",
            "ownerClass": "death_lord",
            "cost": 8,
            "minLevel": 40
          }
        ]
      },
      "support": {
        "label": "Support Path",
        "nodes": [
          {
            "id": "s_mend",
            "skillId": "mend",
            "owned": true,
            "cost": 0
          },
          {
            "id": "s_greater_mend",
            "skillId": "greater_mend",
            "owned": true,
            "cost": 0
          },
          {
            "id": "s_spirit_surge",
            "skillId": "spirit_surge",
            "owned": true,
            "cost": 0
          },
          {
            "id": "s_divine_blessing",
            "skillId": "divine_blessing",
            "ownerClass": "high_priest",
            "cost": 4,
            "minLevel": 20
          },
          {
            "id": "s_resurgence",
            "skillId": "resurgence",
            "ownerClass": "divine_saint",
            "cost": 8,
            "minLevel": 40
          }
        ]
      },
      "tank": {
        "label": "Tank Path",
        "nodes": [
          {
            "id": "t_cleave",
            "skillId": "cleave",
            "owned": true,
            "cost": 0
          },
          {
            "id": "t_shield_wall",
            "skillId": "shield_wall",
            "owned": true,
            "cost": 0
          },
          {
            "id": "t_bastion",
            "skillId": "bastion",
            "ownerClass": "juggernaut",
            "cost": 4,
            "minLevel": 20
          },
          {
            "id": "t_immovable",
            "skillId": "immovable",
            "ownerClass": "colossus",
            "cost": 8,
            "minLevel": 40
          }
        ]
      },
      "tamer": {
        "label": "Tamer Path",
        "nodes": [
          {
            "id": "tm_war_heal",
            "skillId": "war_heal",
            "owned": true,
            "cost": 0
          },
          {
            "id": "tm_defend",
            "skillId": "defend",
            "owned": true,
            "cost": 0
          },
          {
            "id": "tm_battle_fury",
            "skillId": "battle_fury",
            "ownerClass": "beastmaster",
            "cost": 4,
            "minLevel": 20
          },
          {
            "id": "tm_war_cry",
            "skillId": "war_cry",
            "ownerClass": "alpha_tamer",
            "cost": 8,
            "minLevel": 40
          }
        ]
      },
      "gardener": {
        "label": "Gardener Path",
        "nodes": [
          {
            "id": "gd_vine_lash",
            "skillId": "vine_lash",
            "owned": true,
            "cost": 0
          },
          {
            "id": "gd_forest_renewal",
            "skillId": "forest_renewal",
            "owned": true,
            "cost": 0
          },
          {
            "id": "gd_thorn_volley",
            "skillId": "thorn_volley",
            "ownerClass": "rootbinder",
            "cost": 4,
            "minLevel": 20
          },
          {
            "id": "gd_rejuvenate",
            "skillId": "rejuvenate",
            "ownerClass": "lifeweaver",
            "cost": 8,
            "minLevel": 40
          }
        ]
      }
    }
  },
  "story": {
    "title": "The Setra Game",
    "paragraphs": [
      "The realm of Setra stirs. Old roads vanish into mist, and the town square hums with whispered tales of the fallen.",
      "Gather what you can, delve the ruins, and grow strong enough to face what waits beyond the hills.",
      "They say the Ancient Temple remembers a purpose older than the kingdom. If you find its relic, it may remember you too."
    ],
    "cta": "Set Forth"
  },
  "food": {
    "healBase": 10,
    "healPct": 0.02
  },
  "anomalies": {
    "anomalyChance": 0.06,
    "pureBloodChance": 0.02,
    "traits": [
      {
        "id": "sanguine_thirst",
        "name": "Sanguine Thirst",
        "pureBlood": false,
        "rarity": "rare",
        "frameColor": "#c45c6a",
        "description": "Heal for 10% of all damage dealt.",
        "effect": {
          "type": "lifesteal",
          "percent": 0.1
        }
      },
      {
        "id": "iron_bark",
        "name": "Iron Bark",
        "pureBlood": false,
        "rarity": "uncommon",
        "frameColor": "#7a9e6a",
        "description": "Gain a little extra resistance.",
        "effect": {
          "type": "resistanceBonus",
          "amount": 8
        }
      },
      {
        "id": "ember_well",
        "name": "Ember Well",
        "pureBlood": false,
        "rarity": "rare",
        "frameColor": "#d4893a",
        "description": "Mana recovers more generously in town rest.",
        "effect": {
          "type": "manaOnDay",
          "amount": 12
        }
      },
      {
        "id": "arcane_reservoir",
        "name": "Arcane Reservoir",
        "pureBlood": false,
        "rarity": "rare",
        "frameColor": "#7a9ec4",
        "description": "Mana regenerates a little faster each round.",
        "effect": {
          "type": "manaRegenBonus",
          "amount": 1
        }
      },
      {
        "id": "primeval_bloodlust",
        "name": "Primeval Bloodlust",
        "pureBlood": true,
        "rarity": "pureblood",
        "frameColor": "#e8c547",
        "description": "Heal for 20% of all damage dealt.",
        "effect": {
          "type": "lifesteal",
          "percent": 0.2
        }
      },
      {
        "id": "first_dawn",
        "name": "First Dawn",
        "pureBlood": true,
        "rarity": "pureblood",
        "frameColor": "#f4e6a8",
        "description": "Start each day with bonus stamina.",
        "effect": {
          "type": "staminaOnDay",
          "amount": 1
        }
      }
    ]
  },
  "classes": [
    {
      "slug": "warrior",
      "label": "Warrior",
      "image": "/images/characters/warrior.png",
      "basicAttack": {
        "id": "slash",
        "name": "Slash",
        "power": 1,
        "element": "physical",
        "image": "/images/skills/slash.png",
        "description": "Deals 1× attack damage."
      },
      "startingSkills": [
        "heavy_strike",
        "defend",
        "battle_fury"
      ],
      "evolution": {
        "level": 20,
        "to": "warlord"
      },
      "speed": 8,
      "hp": {
        "min": 520,
        "max": 600
      },
      "attack": {
        "min": 42,
        "max": 52
      },
      "mana": {
        "min": 20,
        "max": 35
      },
      "resistance": {
        "min": 28,
        "max": 38
      },
      "magicPower": {
        "min": 8,
        "max": 16
      },
      "healPower": {
        "min": 2,
        "max": 6
      },
      "growth": {
        "hp": 18,
        "attack": 4,
        "mana": 1,
        "resistance": 3,
        "magicPower": 1,
        "healPower": 0,
        "critChance": 1,
        "critDamage": 2
      },
      "critChance": {
        "min": 8,
        "max": 14
      },
      "critDamage": {
        "min": 40,
        "max": 80
      }
    },
    {
      "slug": "ranger",
      "label": "Ranger",
      "image": "/images/characters/ranger.png",
      "basicAttack": {
        "id": "quick_shot",
        "name": "Quick Shot",
        "power": 0.9,
        "element": "physical",
        "image": "/images/skills/quick_shot.png",
        "description": "Deals 0.9× attack damage."
      },
      "startingSkills": [
        "aimed_shot",
        "piercing_shot"
      ],
      "evolution": {
        "level": 20,
        "to": "warden"
      },
      "speed": 12,
      "hp": {
        "min": 430,
        "max": 500
      },
      "attack": {
        "min": 40,
        "max": 50
      },
      "mana": {
        "min": 30,
        "max": 45
      },
      "resistance": {
        "min": 18,
        "max": 28
      },
      "magicPower": {
        "min": 12,
        "max": 22
      },
      "healPower": {
        "min": 2,
        "max": 6
      },
      "growth": {
        "hp": 12,
        "attack": 4,
        "mana": 2,
        "resistance": 2,
        "magicPower": 2,
        "healPower": 0,
        "critChance": 1,
        "critDamage": 2
      },
      "critChance": {
        "min": 8,
        "max": 14
      },
      "critDamage": {
        "min": 40,
        "max": 80
      }
    },
    {
      "slug": "mage",
      "label": "Mage",
      "image": "/images/characters/mage.png",
      "basicAttack": {
        "id": "arcane_bolt",
        "name": "Arcane Bolt",
        "power": 0.95,
        "element": "arcane",
        "image": "/images/skills/arcane_bolt.png",
        "description": "Deals 0.95× magic damage."
      },
      "startingSkills": [
        "arcane_barrage",
        "mana_shield"
      ],
      "evolution": {
        "level": 20,
        "to": "archmage"
      },
      "speed": 7,
      "manaRegen": 2,
      "hp": {
        "min": 340,
        "max": 410
      },
      "attack": {
        "min": 16,
        "max": 24
      },
      "mana": {
        "min": 70,
        "max": 90
      },
      "resistance": {
        "min": 12,
        "max": 20
      },
      "magicPower": {
        "min": 48,
        "max": 62
      },
      "healPower": {
        "min": 4,
        "max": 10
      },
      "growth": {
        "hp": 8,
        "attack": 1,
        "mana": 5,
        "resistance": 1,
        "magicPower": 6,
        "healPower": 1,
        "critChance": 1,
        "critDamage": 2
      },
      "critChance": {
        "min": 8,
        "max": 14
      },
      "critDamage": {
        "min": 40,
        "max": 80
      }
    },
    {
      "slug": "rogue",
      "label": "Rogue",
      "image": "/images/characters/rogue.png",
      "basicAttack": {
        "id": "stab",
        "name": "Stab",
        "power": 1,
        "element": "physical",
        "image": "/images/skills/stab.png",
        "description": "Deals 1× attack damage."
      },
      "startingSkills": [
        "vampiric_strike",
        "shadow_meld"
      ],
      "evolution": {
        "level": 20,
        "to": "nightblade"
      },
      "speed": 14,
      "hp": {
        "min": 380,
        "max": 450
      },
      "attack": {
        "min": 46,
        "max": 58
      },
      "mana": {
        "min": 25,
        "max": 40
      },
      "resistance": {
        "min": 14,
        "max": 22
      },
      "magicPower": {
        "min": 10,
        "max": 18
      },
      "healPower": {
        "min": 2,
        "max": 5
      },
      "growth": {
        "hp": 10,
        "attack": 5,
        "mana": 2,
        "resistance": 1,
        "magicPower": 1,
        "healPower": 0,
        "critChance": 1,
        "critDamage": 2
      },
      "critChance": {
        "min": 8,
        "max": 14
      },
      "critDamage": {
        "min": 40,
        "max": 80
      }
    },
    {
      "slug": "paladin",
      "label": "Paladin",
      "image": "/images/characters/paladin.png",
      "basicAttack": {
        "id": "smite",
        "name": "Smite",
        "power": 0.95,
        "element": "holy",
        "image": "/images/skills/smite.png",
        "description": "Deals 0.95× attack damage."
      },
      "startingSkills": [
        "holy_strike",
        "mend"
      ],
      "evolution": {
        "level": 20,
        "to": "crusader"
      },
      "speed": 7,
      "hp": {
        "min": 560,
        "max": 640
      },
      "attack": {
        "min": 34,
        "max": 44
      },
      "mana": {
        "min": 40,
        "max": 55
      },
      "resistance": {
        "min": 32,
        "max": 44
      },
      "magicPower": {
        "min": 22,
        "max": 32
      },
      "healPower": {
        "min": 8,
        "max": 12
      },
      "growth": {
        "hp": 16,
        "attack": 3,
        "mana": 3,
        "resistance": 4,
        "magicPower": 3,
        "healPower": 1,
        "critChance": 1,
        "critDamage": 2
      },
      "critChance": {
        "min": 8,
        "max": 14
      },
      "critDamage": {
        "min": 40,
        "max": 80
      }
    },
    {
      "slug": "assassin",
      "label": "Assassin",
      "image": "/images/characters/assassin.png",
      "basicAttack": {
        "id": "lunge",
        "name": "Lunge",
        "power": 1.05,
        "element": "physical",
        "image": "/images/skills/lunge.png",
        "description": "Deals 1.05× attack damage."
      },
      "startingSkills": [
        "execute",
        "shadow_step"
      ],
      "evolution": {
        "level": 20,
        "to": "reaper"
      },
      "speed": 15,
      "hp": {
        "min": 360,
        "max": 430
      },
      "attack": {
        "min": 50,
        "max": 64
      },
      "mana": {
        "min": 22,
        "max": 36
      },
      "resistance": {
        "min": 12,
        "max": 20
      },
      "magicPower": {
        "min": 8,
        "max": 16
      },
      "healPower": {
        "min": 2,
        "max": 5
      },
      "growth": {
        "hp": 9,
        "attack": 6,
        "mana": 1,
        "resistance": 1,
        "magicPower": 1,
        "healPower": 0,
        "critChance": 1,
        "critDamage": 2
      },
      "critChance": {
        "min": 8,
        "max": 14
      },
      "critDamage": {
        "min": 40,
        "max": 80
      }
    },
    {
      "slug": "support",
      "label": "Support Mage",
      "image": "/images/characters/support.png",
      "basicAttack": {
        "id": "sanct_bolt",
        "name": "Sanct Bolt",
        "power": 0.9,
        "element": "holy",
        "image": "/images/skills/sanct_bolt.png",
        "description": "Deals 0.9× magic damage."
      },
      "startingSkills": [
        "mend",
        "greater_mend",
        "spirit_surge"
      ],
      "evolution": {
        "level": 20,
        "to": "high_priest"
      },
      "speed": 9,
      "manaRegen": 1,
      "hp": {
        "min": 390,
        "max": 460
      },
      "attack": {
        "min": 18,
        "max": 28
      },
      "mana": {
        "min": 70,
        "max": 90
      },
      "resistance": {
        "min": 18,
        "max": 28
      },
      "magicPower": {
        "min": 40,
        "max": 54
      },
      "healPower": {
        "min": 10,
        "max": 16
      },
      "growth": {
        "hp": 11,
        "attack": 2,
        "mana": 5,
        "resistance": 2,
        "magicPower": 5,
        "healPower": 1,
        "critChance": 1,
        "critDamage": 2
      },
      "critChance": {
        "min": 8,
        "max": 14
      },
      "critDamage": {
        "min": 40,
        "max": 80
      }
    },
    {
      "slug": "tank",
      "label": "Tank",
      "image": "/images/characters/tank.png",
      "basicAttack": {
        "id": "shield_bash",
        "name": "Shield Bash",
        "power": 0.85,
        "element": "physical",
        "effect": "heavy_hammer_slam",
        "image": "/images/skills/shield_bash.png",
        "description": "Deals 0.85× attack damage."
      },
      "startingSkills": [
        "cleave",
        "shield_wall"
      ],
      "evolution": {
        "level": 20,
        "to": "juggernaut"
      },
      "speed": 6,
      "hp": {
        "min": 650,
        "max": 750
      },
      "attack": {
        "min": 28,
        "max": 38
      },
      "mana": {
        "min": 18,
        "max": 30
      },
      "resistance": {
        "min": 40,
        "max": 55
      },
      "magicPower": {
        "min": 6,
        "max": 14
      },
      "healPower": {
        "min": 3,
        "max": 7
      },
      "growth": {
        "hp": 22,
        "attack": 2,
        "mana": 1,
        "resistance": 5,
        "magicPower": 1,
        "healPower": 1,
        "critChance": 1,
        "critDamage": 2
      },
      "critChance": {
        "min": 8,
        "max": 14
      },
      "critDamage": {
        "min": 40,
        "max": 80
      }
    },
    {
      "slug": "tamer",
      "label": "Tamer",
      "image": "/images/characters/tamer.png",
      "basicAttack": {
        "id": "tame_hit",
        "name": "Tame Hit",
        "power": 1,
        "element": "physical",
        "image": "/images/skills/tame_hit.png",
        "description": "Deals 1× attack damage."
      },
      "startingSkills": [
        "war_heal",
        "defend"
      ],
      "evolution": {
        "level": 20,
        "to": "beastmaster"
      },
      "speed": 10,
      "hp": {
        "min": 450,
        "max": 520
      },
      "attack": {
        "min": 36,
        "max": 46
      },
      "mana": {
        "min": 30,
        "max": 45
      },
      "resistance": {
        "min": 20,
        "max": 30
      },
      "magicPower": {
        "min": 18,
        "max": 28
      },
      "healPower": {
        "min": 4,
        "max": 8
      },
      "growth": {
        "hp": 14,
        "attack": 3,
        "mana": 3,
        "resistance": 2,
        "magicPower": 3,
        "healPower": 1,
        "critChance": 1,
        "critDamage": 2
      },
      "critChance": {
        "min": 8,
        "max": 14
      },
      "critDamage": {
        "min": 40,
        "max": 80
      }
    },
    {
      "slug": "beastmaster",
      "label": "Beastmaster",
      "baseClass": "tamer",
      "evolution": {
        "level": 40,
        "to": "alpha_tamer"
      },
      "image": "/images/characters/beastmaster.png",
      "basicAttack": {
        "id": "beast_strike",
        "name": "Beast Strike",
        "power": 1.15,
        "element": "physical",
        "image": "/images/skills/beast_strike.png",
        "description": "Deals 1.15× attack damage."
      },
      "startingSkills": [
        "battle_fury"
      ],
      "speed": 11,
      "hp": {
        "min": 480,
        "max": 560
      },
      "attack": {
        "min": 38,
        "max": 50
      },
      "mana": {
        "min": 32,
        "max": 48
      },
      "resistance": {
        "min": 22,
        "max": 32
      },
      "magicPower": {
        "min": 20,
        "max": 30
      },
      "healPower": {
        "min": 5,
        "max": 9
      },
      "growth": {
        "hp": 16,
        "attack": 4,
        "mana": 3,
        "resistance": 3,
        "magicPower": 3,
        "healPower": 1,
        "critChance": 1,
        "critDamage": 2
      },
      "evolveBonus": {
        "hp": 40,
        "attack": 6,
        "mana": 8,
        "resistance": 4,
        "magicPower": 4
      }
    },
    {
      "slug": "alpha_tamer",
      "label": "Alpha Tamer",
      "baseClass": "beastmaster",
      "image": "/images/characters/alpha_tamer.png",
      "basicAttack": {
        "id": "alpha_strike",
        "name": "Alpha Strike",
        "power": 1.25,
        "element": "physical",
        "image": "/images/skills/alpha_strike.png",
        "description": "Deals 1.25× attack damage."
      },
      "startingSkills": [
        "war_cry"
      ],
      "speed": 12,
      "hp": {
        "min": 500,
        "max": 580
      },
      "attack": {
        "min": 42,
        "max": 54
      },
      "mana": {
        "min": 35,
        "max": 50
      },
      "resistance": {
        "min": 24,
        "max": 34
      },
      "magicPower": {
        "min": 22,
        "max": 32
      },
      "healPower": {
        "min": 6,
        "max": 10
      },
      "growth": {
        "hp": 18,
        "attack": 5,
        "mana": 4,
        "resistance": 3,
        "magicPower": 4,
        "healPower": 1,
        "critChance": 1,
        "critDamage": 2
      },
      "evolveBonus": {
        "hp": 50,
        "attack": 8,
        "mana": 10,
        "resistance": 5,
        "magicPower": 5
      }
    },
    {
      "slug": "gardener",
      "label": "Gardener",
      "image": "/images/characters/gardener.png",
      "basicAttack": {
        "id": "garden_swipe",
        "name": "Garden Swipe",
        "power": 0.9,
        "element": "nature",
        "image": "/images/skills/vine_lash.png",
        "description": "Deals 0.9× magic damage."
      },
      "startingSkills": [
        "vine_lash",
        "forest_renewal"
      ],
      "evolution": {
        "level": 20,
        "to": "rootbinder",
        "ascendTitle": "You have ascended to Rootbinder!",
        "ascendColor": "#4ade80",
        "ascendSound": "neutralascension"
      },
      "speed": 9,
      "manaRegen": 1,
      "hp": {
        "min": 400,
        "max": 470
      },
      "attack": {
        "min": 20,
        "max": 30
      },
      "mana": {
        "min": 60,
        "max": 80
      },
      "resistance": {
        "min": 20,
        "max": 30
      },
      "magicPower": {
        "min": 42,
        "max": 56
      },
      "healPower": {
        "min": 8,
        "max": 14
      },
      "growth": {
        "hp": 11,
        "attack": 2,
        "mana": 5,
        "resistance": 2,
        "magicPower": 5,
        "healPower": 1,
        "critChance": 1,
        "critDamage": 2
      },
      "critChance": {
        "min": 8,
        "max": 14
      },
      "critDamage": {
        "min": 40,
        "max": 80
      }
    },
    {
      "slug": "rootbinder",
      "label": "Rootbinder",
      "baseClass": "gardener",
      "evolution": {
        "level": 40,
        "to": "lifeweaver",
        "ascendTitle": "You have ascended to Lifeweaver!",
        "ascendColor": "#bef264",
        "ascendSound": "holy-ascensionsound"
      },
      "image": "/images/characters/rootbinder.png",
      "basicAttack": {
        "id": "root_lash",
        "name": "Root Lash",
        "power": 1.1,
        "element": "nature",
        "image": "/images/skills/thorn_volley.png",
        "description": "Deals 1.1× magic damage."
      },
      "startingSkills": [
        "thorn_volley"
      ],
      "speed": 9,
      "manaRegen": 2,
      "hp": {
        "min": 440,
        "max": 510
      },
      "attack": {
        "min": 24,
        "max": 34
      },
      "mana": {
        "min": 65,
        "max": 85
      },
      "resistance": {
        "min": 24,
        "max": 34
      },
      "magicPower": {
        "min": 48,
        "max": 62
      },
      "healPower": {
        "min": 10,
        "max": 16
      },
      "growth": {
        "hp": 13,
        "attack": 3,
        "mana": 5,
        "resistance": 3,
        "magicPower": 6,
        "healPower": 1,
        "critChance": 1,
        "critDamage": 2
      },
      "critChance": {
        "min": 8,
        "max": 14
      },
      "critDamage": {
        "min": 40,
        "max": 80
      },
      "evolveBonus": {
        "hp": 45,
        "attack": 5,
        "mana": 20,
        "resistance": 5,
        "magicPower": 8,
        "healPower": 2
      }
    },
    {
      "slug": "lifeweaver",
      "label": "Lifeweaver",
      "baseClass": "rootbinder",
      "image": "/images/characters/lifeweaver.png",
      "basicAttack": {
        "id": "bloom_burst",
        "name": "Bloom Burst",
        "power": 1.2,
        "element": "nature",
        "image": "/images/skills/forest_renewal.png",
        "description": "Deals 1.2× magic damage."
      },
      "startingSkills": [
        "rejuvenate"
      ],
      "speed": 10,
      "manaRegen": 3,
      "hp": {
        "min": 470,
        "max": 540
      },
      "attack": {
        "min": 26,
        "max": 36
      },
      "mana": {
        "min": 70,
        "max": 90
      },
      "resistance": {
        "min": 28,
        "max": 38
      },
      "magicPower": {
        "min": 54,
        "max": 68
      },
      "healPower": {
        "min": 14,
        "max": 20
      },
      "growth": {
        "hp": 15,
        "attack": 3,
        "mana": 6,
        "resistance": 3,
        "magicPower": 7,
        "healPower": 2,
        "critChance": 1,
        "critDamage": 2
      },
      "critChance": {
        "min": 8,
        "max": 14
      },
      "critDamage": {
        "min": 40,
        "max": 80
      },
      "evolveBonus": {
        "hp": 55,
        "attack": 6,
        "mana": 25,
        "resistance": 6,
        "magicPower": 10,
        "healPower": 3
      }
    },
    {
      "slug": "moderator",
      "label": "Moderator",
      "secret": "xx0mod0xx",
      "startLevel": 45,
      "image": "/images/characters/moderator.png",
      "basicAttack": {
        "id": "mod_strike",
        "name": "Mod Strike",
        "power": 1.5,
        "element": "arcane",
        "image": "/images/skills/meteor.png",
        "description": "Deals 1.5× magic damage."
      },
      "startingSkills": [
        "meteor",
        "static_overload",
        "glacial_shatter",
        "soul_reap",
        "radiance",
        "cataclysm"
      ],
      "evolution": {
        "level": 45,
        "to": "ultra_moderator",
        "ascendTitle": "You have ascended to ULTRA MODERATOR!",
        "ascendColor": "#ff2d78",
        "ascendSound": ""
      },
      "speed": 14,
      "manaRegen": 3,
      "hp": {
        "min": 900,
        "max": 1000
      },
      "attack": {
        "min": 80,
        "max": 95
      },
      "mana": {
        "min": 120,
        "max": 140
      },
      "resistance": {
        "min": 45,
        "max": 55
      },
      "magicPower": {
        "min": 80,
        "max": 95
      },
      "healPower": {
        "min": 12,
        "max": 18
      },
      "growth": {
        "hp": 25,
        "attack": 7,
        "mana": 6,
        "resistance": 5,
        "magicPower": 7,
        "healPower": 2,
        "critChance": 1,
        "critDamage": 2
      },
      "critChance": {
        "min": 8,
        "max": 14
      },
      "critDamage": {
        "min": 40,
        "max": 80
      }
    },
    {
      "slug": "ultra_moderator",
      "label": "Ultra Moderator",
      "baseClass": "moderator",
      "image": "/images/characters/ultra_moderator.png",
      "basicAttack": {
        "id": "mod_obliterate",
        "name": "Mod Obliterate",
        "power": 1.8,
        "element": "arcane",
        "image": "/images/skills/cataclysm.png",
        "description": "Deals 1.8× magic damage."
      },
      "startingSkills": [
        "meteor",
        "static_overload",
        "glacial_shatter",
        "soul_reap",
        "radiance",
        "cataclysm"
      ],
      "speed": 16,
      "manaRegen": 4,
      "hp": {
        "min": 1200,
        "max": 1350
      },
      "attack": {
        "min": 105,
        "max": 125
      },
      "mana": {
        "min": 150,
        "max": 170
      },
      "resistance": {
        "min": 60,
        "max": 70
      },
      "magicPower": {
        "min": 105,
        "max": 125
      },
      "healPower": {
        "min": 16,
        "max": 22
      },
      "growth": {
        "hp": 30,
        "attack": 8,
        "mana": 7,
        "resistance": 6,
        "magicPower": 8,
        "healPower": 2,
        "critChance": 1,
        "critDamage": 2
      },
      "critChance": {
        "min": 8,
        "max": 14
      },
      "critDamage": {
        "min": 40,
        "max": 80
      },
      "evolveBonus": {
        "hp": 200,
        "attack": 20,
        "mana": 40,
        "resistance": 15,
        "magicPower": 20,
        "healPower": 5
      }
    },
    {
      "slug": "warlord",
      "label": "War Lord",
      "baseClass": "warrior",
      "evolution": {
        "level": 40,
        "to": "war_emperor"
      },
      "image": "/images/characters/warlord.png",
      "basicAttack": {
        "id": "great_slash",
        "name": "Great Slash",
        "power": 1.2,
        "element": "physical",
        "image": "/images/skills/great_slash.png",
        "description": "Deals 1.2× attack damage."
      },
      "startingSkills": [
        "war_cry"
      ],
      "speed": 9,
      "hp": {
        "min": 520,
        "max": 600
      },
      "attack": {
        "min": 42,
        "max": 52
      },
      "mana": {
        "min": 20,
        "max": 35
      },
      "resistance": {
        "min": 28,
        "max": 38
      },
      "magicPower": {
        "min": 8,
        "max": 16
      },
      "healPower": {
        "min": 2,
        "max": 6
      },
      "growth": {
        "hp": 22,
        "attack": 5,
        "mana": 2,
        "resistance": 4,
        "magicPower": 1,
        "healPower": 0,
        "critChance": 1,
        "critDamage": 2
      },
      "evolveBonus": {
        "hp": 60,
        "attack": 8,
        "mana": 10,
        "resistance": 6,
        "magicPower": 3
      }
    },
    {
      "slug": "warden",
      "label": "Warden",
      "baseClass": "ranger",
      "evolution": {
        "level": 40,
        "to": "storm_warden"
      },
      "image": "/images/characters/warden.png",
      "basicAttack": {
        "id": "hunter_shot",
        "name": "Hunter Shot",
        "power": 1.05,
        "element": "physical",
        "image": "/images/skills/hunter_shot.png",
        "description": "Deals 1.05× attack damage."
      },
      "startingSkills": [
        "volley"
      ],
      "speed": 13,
      "hp": {
        "min": 430,
        "max": 500
      },
      "attack": {
        "min": 40,
        "max": 50
      },
      "mana": {
        "min": 30,
        "max": 45
      },
      "resistance": {
        "min": 18,
        "max": 28
      },
      "magicPower": {
        "min": 12,
        "max": 22
      },
      "healPower": {
        "min": 2,
        "max": 6
      },
      "growth": {
        "hp": 15,
        "attack": 5,
        "mana": 3,
        "resistance": 2,
        "magicPower": 2,
        "healPower": 0,
        "critChance": 1,
        "critDamage": 2
      },
      "evolveBonus": {
        "hp": 40,
        "attack": 9,
        "mana": 12,
        "resistance": 4,
        "magicPower": 4
      }
    },
    {
      "slug": "archmage",
      "label": "Archmage",
      "baseClass": "mage",
      "evolution": {
        "level": 40,
        "to": "archon"
      },
      "image": "/images/characters/archmage.png",
      "basicAttack": {
        "id": "arcane_blast",
        "name": "Arcane Blast",
        "power": 1.1,
        "element": "arcane",
        "image": "/images/skills/arcane_blast.png",
        "description": "Deals 1.1× magic damage."
      },
      "startingSkills": [
        "meteor"
      ],
      "speed": 8,
      "manaRegen": 3,
      "hp": {
        "min": 340,
        "max": 410
      },
      "attack": {
        "min": 16,
        "max": 24
      },
      "mana": {
        "min": 70,
        "max": 90
      },
      "resistance": {
        "min": 12,
        "max": 20
      },
      "magicPower": {
        "min": 48,
        "max": 62
      },
      "healPower": {
        "min": 4,
        "max": 10
      },
      "growth": {
        "hp": 10,
        "attack": 1,
        "mana": 6,
        "resistance": 1,
        "magicPower": 7,
        "healPower": 1,
        "critChance": 1,
        "critDamage": 2
      },
      "evolveBonus": {
        "hp": 30,
        "attack": 3,
        "mana": 25,
        "resistance": 3,
        "magicPower": 10
      }
    },
    {
      "slug": "nightblade",
      "label": "Nightblade",
      "baseClass": "rogue",
      "evolution": {
        "level": 40,
        "to": "shade_king"
      },
      "image": "/images/characters/nightblade.png",
      "basicAttack": {
        "id": "shadow_stab",
        "name": "Shadow Stab",
        "power": 1.1,
        "element": "shadow",
        "image": "/images/skills/shadow_stab.png",
        "description": "Deals 1.1× attack damage."
      },
      "startingSkills": [
        "shadow_veil"
      ],
      "speed": 15,
      "hp": {
        "min": 380,
        "max": 450
      },
      "attack": {
        "min": 46,
        "max": 58
      },
      "mana": {
        "min": 25,
        "max": 40
      },
      "resistance": {
        "min": 14,
        "max": 22
      },
      "magicPower": {
        "min": 10,
        "max": 18
      },
      "healPower": {
        "min": 2,
        "max": 5
      },
      "growth": {
        "hp": 12,
        "attack": 6,
        "mana": 3,
        "resistance": 1,
        "magicPower": 1,
        "healPower": 0,
        "critChance": 1,
        "critDamage": 2
      },
      "evolveBonus": {
        "hp": 35,
        "attack": 10,
        "mana": 10,
        "resistance": 3,
        "magicPower": 3
      }
    },
    {
      "slug": "crusader",
      "label": "Crusader",
      "baseClass": "paladin",
      "evolution": {
        "level": 40,
        "to": "lightbringer"
      },
      "image": "/images/characters/crusader.png",
      "basicAttack": {
        "id": "blessed_blade",
        "name": "Blessed Blade",
        "power": 1.1,
        "element": "holy",
        "image": "/images/skills/blessed_blade.png",
        "description": "Deals 1.1× attack damage."
      },
      "startingSkills": [
        "holy_judgement"
      ],
      "speed": 8,
      "hp": {
        "min": 560,
        "max": 640
      },
      "attack": {
        "min": 34,
        "max": 44
      },
      "mana": {
        "min": 40,
        "max": 55
      },
      "resistance": {
        "min": 32,
        "max": 44
      },
      "magicPower": {
        "min": 22,
        "max": 32
      },
      "healPower": {
        "min": 8,
        "max": 12
      },
      "growth": {
        "hp": 19,
        "attack": 4,
        "mana": 4,
        "resistance": 5,
        "magicPower": 4,
        "healPower": 1,
        "critChance": 1,
        "critDamage": 2
      },
      "evolveBonus": {
        "hp": 55,
        "attack": 6,
        "mana": 15,
        "resistance": 7,
        "magicPower": 5,
        "healPower": 1
      }
    },
    {
      "slug": "reaper",
      "label": "Reaper",
      "baseClass": "assassin",
      "evolution": {
        "level": 40,
        "to": "death_lord"
      },
      "image": "/images/characters/reaper.png",
      "basicAttack": {
        "id": "reap",
        "name": "Reap",
        "power": 1.2,
        "element": "shadow",
        "image": "/images/skills/reap.png",
        "description": "Deals 1.2× attack damage."
      },
      "startingSkills": [
        "death_mark"
      ],
      "speed": 16,
      "hp": {
        "min": 360,
        "max": 430
      },
      "attack": {
        "min": 50,
        "max": 64
      },
      "mana": {
        "min": 22,
        "max": 36
      },
      "resistance": {
        "min": 12,
        "max": 20
      },
      "magicPower": {
        "min": 8,
        "max": 16
      },
      "healPower": {
        "min": 2,
        "max": 5
      },
      "growth": {
        "hp": 11,
        "attack": 7,
        "mana": 2,
        "resistance": 1,
        "magicPower": 1,
        "healPower": 0,
        "critChance": 1,
        "critDamage": 2
      },
      "evolveBonus": {
        "hp": 30,
        "attack": 12,
        "mana": 8,
        "resistance": 3,
        "magicPower": 3
      }
    },
    {
      "slug": "high_priest",
      "label": "High Priest",
      "baseClass": "support",
      "evolution": {
        "level": 40,
        "to": "divine_saint"
      },
      "image": "/images/characters/high_priest.png",
      "basicAttack": {
        "id": "hallowed_bolt",
        "name": "Hallowed Bolt",
        "power": 1,
        "element": "holy",
        "image": "/images/skills/hallowed_bolt.png",
        "description": "Deals 1× magic damage."
      },
      "startingSkills": [
        "divine_blessing"
      ],
      "speed": 9,
      "manaRegen": 2,
      "hp": {
        "min": 390,
        "max": 460
      },
      "attack": {
        "min": 18,
        "max": 28
      },
      "mana": {
        "min": 70,
        "max": 90
      },
      "resistance": {
        "min": 18,
        "max": 28
      },
      "magicPower": {
        "min": 40,
        "max": 54
      },
      "healPower": {
        "min": 10,
        "max": 16
      },
      "growth": {
        "hp": 13,
        "attack": 2,
        "mana": 6,
        "resistance": 2,
        "magicPower": 6,
        "healPower": 2,
        "critChance": 1,
        "critDamage": 2
      },
      "evolveBonus": {
        "hp": 35,
        "attack": 4,
        "mana": 20,
        "resistance": 4,
        "magicPower": 7,
        "healPower": 3
      }
    },
    {
      "slug": "juggernaut",
      "label": "Juggernaut",
      "baseClass": "tank",
      "evolution": {
        "level": 40,
        "to": "colossus"
      },
      "image": "/images/characters/juggernaut.png",
      "basicAttack": {
        "id": "adamant_bash",
        "name": "Adamant Bash",
        "power": 0.95,
        "element": "physical",
        "effect": "heavy_hammer_slam",
        "image": "/images/skills/adamant_bash.png",
        "description": "Deals 0.95× attack damage."
      },
      "startingSkills": [
        "bastion"
      ],
      "speed": 6,
      "hp": {
        "min": 650,
        "max": 750
      },
      "attack": {
        "min": 28,
        "max": 38
      },
      "mana": {
        "min": 18,
        "max": 30
      },
      "resistance": {
        "min": 40,
        "max": 55
      },
      "magicPower": {
        "min": 6,
        "max": 14
      },
      "healPower": {
        "min": 3,
        "max": 7
      },
      "growth": {
        "hp": 26,
        "attack": 3,
        "mana": 1,
        "resistance": 6,
        "magicPower": 1,
        "healPower": 1,
        "critChance": 1,
        "critDamage": 2
      },
      "evolveBonus": {
        "hp": 90,
        "attack": 5,
        "mana": 8,
        "resistance": 9,
        "magicPower": 2
      }
    },
    {
      "slug": "war_emperor",
      "label": "War Emperor",
      "baseClass": "warlord",
      "image": "/images/characters/war_emperor.png",
      "basicAttack": {
        "id": "colossal_slash",
        "name": "Colossal Slash",
        "power": 1.3,
        "element": "physical",
        "image": "/images/skills/colossal_slash.png",
        "description": "Deals 1.3× attack damage."
      },
      "startingSkills": [
        "cataclysm"
      ],
      "speed": 10,
      "hp": {
        "min": 520,
        "max": 600
      },
      "attack": {
        "min": 42,
        "max": 52
      },
      "mana": {
        "min": 20,
        "max": 35
      },
      "resistance": {
        "min": 28,
        "max": 38
      },
      "magicPower": {
        "min": 8,
        "max": 16
      },
      "healPower": {
        "min": 2,
        "max": 6
      },
      "growth": {
        "hp": 24,
        "attack": 6,
        "mana": 2,
        "resistance": 5,
        "magicPower": 1,
        "healPower": 0,
        "critChance": 1,
        "critDamage": 2
      },
      "evolveBonus": {
        "hp": 80,
        "attack": 10,
        "mana": 12,
        "resistance": 8,
        "magicPower": 4
      }
    },
    {
      "slug": "storm_warden",
      "label": "Storm Warden",
      "baseClass": "warden",
      "image": "/images/characters/storm_warden.png",
      "basicAttack": {
        "id": "storm_shot",
        "name": "Storm Shot",
        "power": 1.15,
        "element": "physical",
        "image": "/images/skills/storm_shot.png",
        "description": "Deals 1.15× attack damage."
      },
      "startingSkills": [
        "storm_barrage"
      ],
      "speed": 15,
      "hp": {
        "min": 430,
        "max": 500
      },
      "attack": {
        "min": 40,
        "max": 50
      },
      "mana": {
        "min": 30,
        "max": 45
      },
      "resistance": {
        "min": 18,
        "max": 28
      },
      "magicPower": {
        "min": 12,
        "max": 22
      },
      "healPower": {
        "min": 2,
        "max": 6
      },
      "growth": {
        "hp": 16,
        "attack": 6,
        "mana": 3,
        "resistance": 2,
        "magicPower": 3,
        "healPower": 0,
        "critChance": 1,
        "critDamage": 2
      },
      "evolveBonus": {
        "hp": 50,
        "attack": 11,
        "mana": 15,
        "resistance": 5,
        "magicPower": 5
      }
    },
    {
      "slug": "archon",
      "label": "Archon",
      "baseClass": "archmage",
      "image": "/images/characters/archon.png",
      "basicAttack": {
        "id": "primordial_bolt",
        "name": "Primordial Bolt",
        "power": 1.2,
        "element": "arcane",
        "image": "/images/skills/primordial_bolt.png",
        "description": "Deals 1.2× magic damage."
      },
      "startingSkills": [
        "comet"
      ],
      "speed": 9,
      "manaRegen": 4,
      "hp": {
        "min": 340,
        "max": 410
      },
      "attack": {
        "min": 16,
        "max": 24
      },
      "mana": {
        "min": 70,
        "max": 90
      },
      "resistance": {
        "min": 12,
        "max": 20
      },
      "magicPower": {
        "min": 48,
        "max": 62
      },
      "healPower": {
        "min": 4,
        "max": 10
      },
      "growth": {
        "hp": 10,
        "attack": 1,
        "mana": 7,
        "resistance": 1,
        "magicPower": 8,
        "healPower": 1,
        "critChance": 1,
        "critDamage": 2
      },
      "evolveBonus": {
        "hp": 35,
        "attack": 4,
        "mana": 30,
        "resistance": 4,
        "magicPower": 13
      }
    },
    {
      "slug": "shade_king",
      "label": "Shade King",
      "baseClass": "nightblade",
      "image": "/images/characters/shade_king.png",
      "basicAttack": {
        "id": "eclipse_strike",
        "name": "Eclipse Strike",
        "power": 1.2,
        "element": "shadow",
        "image": "/images/skills/eclipse_strike.png",
        "description": "Deals 1.2× attack damage."
      },
      "startingSkills": [
        "soul_thief"
      ],
      "speed": 16,
      "hp": {
        "min": 380,
        "max": 450
      },
      "attack": {
        "min": 46,
        "max": 58
      },
      "mana": {
        "min": 25,
        "max": 40
      },
      "resistance": {
        "min": 14,
        "max": 22
      },
      "magicPower": {
        "min": 10,
        "max": 18
      },
      "healPower": {
        "min": 2,
        "max": 5
      },
      "growth": {
        "hp": 12,
        "attack": 7,
        "mana": 3,
        "resistance": 1,
        "magicPower": 2,
        "healPower": 0,
        "critChance": 1,
        "critDamage": 2
      },
      "evolveBonus": {
        "hp": 45,
        "attack": 13,
        "mana": 12,
        "resistance": 4,
        "magicPower": 4
      }
    },
    {
      "slug": "lightbringer",
      "label": "Lightbringer",
      "baseClass": "crusader",
      "image": "/images/characters/lightbringer.png",
      "basicAttack": {
        "id": "radiant_edge",
        "name": "Radiant Edge",
        "power": 1.2,
        "element": "holy",
        "image": "/images/skills/radiant_edge.png",
        "description": "Deals 1.2× attack damage."
      },
      "startingSkills": [
        "radiance"
      ],
      "speed": 9,
      "hp": {
        "min": 560,
        "max": 640
      },
      "attack": {
        "min": 34,
        "max": 44
      },
      "mana": {
        "min": 40,
        "max": 55
      },
      "resistance": {
        "min": 32,
        "max": 44
      },
      "magicPower": {
        "min": 22,
        "max": 32
      },
      "healPower": {
        "min": 8,
        "max": 12
      },
      "growth": {
        "hp": 20,
        "attack": 5,
        "mana": 4,
        "resistance": 6,
        "magicPower": 4,
        "healPower": 1,
        "critChance": 1,
        "critDamage": 2
      },
      "evolveBonus": {
        "hp": 70,
        "attack": 7,
        "mana": 18,
        "resistance": 9,
        "magicPower": 6,
        "healPower": 1
      }
    },
    {
      "slug": "death_lord",
      "label": "Death Lord",
      "baseClass": "reaper",
      "image": "/images/characters/death_lord.png",
      "basicAttack": {
        "id": "scythe_sweep",
        "name": "Scythe Sweep",
        "power": 1.3,
        "element": "shadow",
        "image": "/images/skills/scythe_sweep.png",
        "description": "Deals 1.3× attack damage."
      },
      "startingSkills": [
        "soul_reap"
      ],
      "speed": 17,
      "hp": {
        "min": 360,
        "max": 430
      },
      "attack": {
        "min": 50,
        "max": 64
      },
      "mana": {
        "min": 22,
        "max": 36
      },
      "resistance": {
        "min": 12,
        "max": 20
      },
      "magicPower": {
        "min": 8,
        "max": 16
      },
      "healPower": {
        "min": 2,
        "max": 5
      },
      "growth": {
        "hp": 11,
        "attack": 8,
        "mana": 2,
        "resistance": 1,
        "magicPower": 2,
        "healPower": 0,
        "critChance": 1,
        "critDamage": 2
      },
      "evolveBonus": {
        "hp": 38,
        "attack": 15,
        "mana": 10,
        "resistance": 4,
        "magicPower": 4
      }
    },
    {
      "slug": "divine_saint",
      "label": "Divine Saint",
      "baseClass": "high_priest",
      "image": "/images/characters/divine_saint.png",
      "basicAttack": {
        "id": "divine_light",
        "name": "Divine Light",
        "power": 1.1,
        "element": "holy",
        "image": "/images/skills/divine_light.png",
        "description": "Deals 1.1× magic damage."
      },
      "startingSkills": [
        "resurgence"
      ],
      "speed": 10,
      "manaRegen": 3,
      "hp": {
        "min": 390,
        "max": 460
      },
      "attack": {
        "min": 18,
        "max": 28
      },
      "mana": {
        "min": 70,
        "max": 90
      },
      "resistance": {
        "min": 18,
        "max": 28
      },
      "magicPower": {
        "min": 40,
        "max": 54
      },
      "healPower": {
        "min": 10,
        "max": 16
      },
      "growth": {
        "hp": 14,
        "attack": 2,
        "mana": 7,
        "resistance": 3,
        "magicPower": 7,
        "healPower": 2,
        "critChance": 1,
        "critDamage": 2
      },
      "evolveBonus": {
        "hp": 45,
        "attack": 5,
        "mana": 25,
        "resistance": 5,
        "magicPower": 9,
        "healPower": 4
      }
    },
    {
      "slug": "colossus",
      "label": "Colossus",
      "baseClass": "juggernaut",
      "image": "/images/characters/colossus.png",
      "basicAttack": {
        "id": "titan_slam",
        "name": "Titan Slam",
        "power": 1.05,
        "element": "physical",
        "effect": "heavy_hammer_slam",
        "image": "/images/skills/titan_slam.png",
        "description": "Deals 1.05× attack damage."
      },
      "startingSkills": [
        "immovable"
      ],
      "speed": 7,
      "hp": {
        "min": 650,
        "max": 750
      },
      "attack": {
        "min": 28,
        "max": 38
      },
      "mana": {
        "min": 18,
        "max": 30
      },
      "resistance": {
        "min": 40,
        "max": 55
      },
      "magicPower": {
        "min": 6,
        "max": 14
      },
      "healPower": {
        "min": 3,
        "max": 7
      },
      "growth": {
        "hp": 28,
        "attack": 4,
        "mana": 1,
        "resistance": 7,
        "magicPower": 1,
        "healPower": 1,
        "critChance": 1,
        "critDamage": 2
      },
      "evolveBonus": {
        "hp": 110,
        "attack": 6,
        "mana": 10,
        "resistance": 11,
        "magicPower": 3
      }
    }
  ],
  "images": {
    "backgrounds": {
      "menu": "/images/backgrounds/menu.png",
      "setup": "/images/backgrounds/setup.png",
      "lobby": "/images/backgrounds/lobby.png",
      "town": "/images/backgrounds/town.png",
      "dungeon": "/images/backgrounds/dungeon.png",
      "tavern": "/images/backgrounds/tavern.png",
      "blacksmith": "/images/backgrounds/blacksmith.png",
      "merchant": "/images/backgrounds/merchant.png",
      "temple": "/images/backgrounds/temple.png"
    },
    "combat": {
      "enemy": "",
      "party": ""
    },
    "ui": {
      "panel": "/images/ui/panel.png"
    }
  },
  "town": {
    "search": {
      "stamina": 2,
      "xp": 0,
      "outcomes": [
        {
          "weight": 30,
          "gold": [
            8,
            16
          ],
          "wood": [
            0,
            2
          ],
          "text": "You find a pouch of coins in the grass."
        },
        {
          "weight": 25,
          "gold": [
            0,
            6
          ],
          "wood": [
            3,
            7
          ],
          "text": "A fallen branch yields useful timber."
        },
        {
          "weight": 15,
          "gold": [
            12,
            22
          ],
          "wood": [
            0,
            0
          ],
          "text": "You push through thorns and find a glint of gold."
        },
        {
          "weight": 15,
          "gold": [
            0,
            4
          ],
          "wood": [
            0,
            1
          ],
          "text": "A passing shade leads you to forgotten coin."
        },
        {
          "weight": 15,
          "gold": [
            0,
            2
          ],
          "wood": [
            0,
            1
          ],
          "food": [
            1,
            2
          ],
          "text": "You forage and find edible roots."
        }
      ]
    },
    "blacksmith": {
      "stamina": 2
    },
    "merchant": {
      "stamina": 1
    },
    "tavern": {
      "stamina": 1,
      "bets": [
        5,
        10,
        25
      ],
      "provisions": {
        "foodPrice": 10,
        "foodAmount": 2
      }
    },
    "rest": {
      "stamina": 6
    },
    "temple": {
      "stamina": 2
    },
    "endDay": {},
    "dungeon": {
      "rankedStamina": 4,
      "fastStamina": 2
    }
  },
  "temple": {
    "restore": {
      "item": "golem_heart",
      "itemName": "Heart of Golem",
      "text": "Offer a Heart of Golem to mend a lost heart."
    },
    "recipes": [
      {
        "id": "fire_ash_sword",
        "name": "Fire Ash Sword",
        "inputs": [
          {
            "item": "stone_ash_sword",
            "qty": 1
          },
          {
            "item": "fire_essence",
            "qty": 1
          }
        ],
        "output": {
          "item": "fire_ash_sword",
          "qty": 1
        },
        "cost": {
          "gold": 25,
          "wood": 0
        },
        "description": "Forge a sword that still smoulders."
      },
      {
        "id": "molten_cleaver",
        "name": "Molten Cleaver",
        "inputs": [
          {
            "item": "fire_ash_sword",
            "qty": 1
          },
          {
            "item": "heart_of_fire",
            "qty": 1
          }
        ],
        "output": {
          "item": "molten_cleaver",
          "qty": 1
        },
        "cost": {
          "gold": 60,
          "wood": 10
        },
        "description": "Bond the heart of a fire spirit to the blade."
      },
      {
        "id": "frost_gladius",
        "name": "Frost Gladius",
        "inputs": [
          {
            "item": "stone_ash_sword",
            "qty": 1
          },
          {
            "item": "frost_essence",
            "qty": 1
          }
        ],
        "output": {
          "item": "frost_gladius",
          "qty": 1
        },
        "cost": {
          "gold": 25,
          "wood": 0
        },
        "description": "Temper the blade in hoarfrost."
      },
      {
        "id": "arcane_rod",
        "name": "Arcane Rod",
        "inputs": [
          {
            "item": "apprentice_staff",
            "qty": 1
          },
          {
            "item": "arcane_essence",
            "qty": 1
          }
        ],
        "output": {
          "item": "arcane_rod",
          "qty": 1
        },
        "cost": {
          "gold": 30,
          "wood": 0
        },
        "description": "Weave raw magic into the staff."
      },
      {
        "id": "shadow_knife",
        "name": "Shadow Knife",
        "inputs": [
          {
            "item": "poison_dagger",
            "qty": 1
          },
          {
            "item": "shadow_essence",
            "qty": 1
          }
        ],
        "output": {
          "item": "shadow_knife",
          "qty": 1
        },
        "cost": {
          "gold": 30,
          "wood": 0
        },
        "description": "Fold shadow itself into the edge."
      },
      {
        "id": "stone_blood",
        "name": "Stone of Blood",
        "inputs": [
          {
            "item": "heart_of_fire",
            "qty": 1
          },
          {
            "item": "shadow_essence",
            "qty": 2
          },
          {
            "item": "golem_heart",
            "qty": 1
          }
        ],
        "output": {
          "item": "stone_blood",
          "qty": 1
        },
        "cost": {
          "gold": 120,
          "wood": 30
        },
        "description": "Forge a stone that drinks blood - 10% omnivamp."
      }
    ]
  },
  "baseSkills": [
    "heavy_strike",
    "defend",
    "arcane_barrage",
    "mana_shield",
    "aimed_shot",
    "piercing_shot",
    "vampiric_strike",
    "shadow_meld",
    "holy_strike",
    "divine_guard",
    "execute",
    "shadow_step",
    "mend",
    "greater_mend",
    "fortify",
    "war_banner",
    "cleave",
    "shield_wall",
    "spirit_surge",
    "battle_fury",
    "iron_wall",
    "group_guard",
    "cripple",
    "venom_strike",
    "rejuvenate",
    "vine_lash",
    "thorn_volley",
    "forest_renewal"
  ],
  "combat": {
    "damageVariance": 0.2,
    "resistanceMitigation": 0.25,
    "manaRegenPerRound": 3,
    "turnTimeoutMs": 15000,
    "critChance": 0.12,
    "critMult": 1.6,
    "monsterScale": 5,
    "monsterAttackDelayMs": 900
  },
  "darkTrait": {
    "deal": 1.3,
    "taken": 1.5
  },
  "loot": {
    "buyable": [
      "common",
      "uncommon",
      "rare"
    ],
    "rarityOrder": [
      "common",
      "uncommon",
      "rare",
      "epic",
      "legendary",
      "mythic",
      "ancient_relic"
    ],
    "rarityMeta": {
      "common": {
        "label": "Common",
        "color": "#9aa7b5"
      },
      "uncommon": {
        "label": "Uncommon",
        "color": "#6fbf6a"
      },
      "rare": {
        "label": "Rare",
        "color": "#4aa3d6"
      },
      "epic": {
        "label": "Epic",
        "color": "#b07fe8"
      },
      "legendary": {
        "label": "Legendary",
        "color": "#ffb347"
      },
      "mythic": {
        "label": "Mythic",
        "color": "#ff5c8a"
      },
      "ancient_relic": {
        "label": "Ancient Relic",
        "color": "#ffe14d"
      }
    },
    "dropChance": {
      "common": 0.2,
      "uncommon": 0.28,
      "rare": 0.36,
      "epic": 0.45,
      "legendary": 0.55,
      "mythic": 0.65,
      "ancient_relic": 0.75
    },
    "gradeWeights": {
      "f": {
        "common": 100,
        "uncommon": 35,
        "rare": 10,
        "epic": 2,
        "legendary": 0.4,
        "mythic": 0,
        "ancient_relic": 0
      },
      "d": {
        "common": 90,
        "uncommon": 45,
        "rare": 15,
        "epic": 4,
        "legendary": 0.8,
        "mythic": 0.1,
        "ancient_relic": 0
      },
      "c": {
        "common": 70,
        "uncommon": 50,
        "rare": 22,
        "epic": 8,
        "legendary": 1.5,
        "mythic": 0.3,
        "ancient_relic": 0.02
      },
      "b": {
        "common": 50,
        "uncommon": 55,
        "rare": 30,
        "epic": 14,
        "legendary": 3,
        "mythic": 0.8,
        "ancient_relic": 0.05
      },
      "a": {
        "common": 30,
        "uncommon": 50,
        "rare": 38,
        "epic": 22,
        "legendary": 6,
        "mythic": 1.6,
        "ancient_relic": 0.12
      },
      "s": {
        "common": 15,
        "uncommon": 40,
        "rare": 45,
        "epic": 32,
        "legendary": 10,
        "mythic": 3,
        "ancient_relic": 0.25
      },
      "ss": {
        "common": 8,
        "uncommon": 30,
        "rare": 48,
        "epic": 42,
        "legendary": 15,
        "mythic": 5,
        "ancient_relic": 0.5
      },
      "ssplus": {
        "common": 5,
        "uncommon": 22,
        "rare": 50,
        "epic": 55,
        "legendary": 22,
        "mythic": 8,
        "ancient_relic": 1
      },
      "special1": {
        "common": 10,
        "uncommon": 30,
        "rare": 35,
        "epic": 25,
        "legendary": 12,
        "mythic": 4,
        "ancient_relic": 0.3
      },
      "special2": {
        "common": 10,
        "uncommon": 30,
        "rare": 35,
        "epic": 25,
        "legendary": 12,
        "mythic": 4,
        "ancient_relic": 0.3
      },
      "special3": {
        "common": 10,
        "uncommon": 30,
        "rare": 35,
        "epic": 25,
        "legendary": 12,
        "mythic": 4,
        "ancient_relic": 0.3
      },
      "special4": {
        "common": 8,
        "uncommon": 28,
        "rare": 35,
        "epic": 28,
        "legendary": 14,
        "mythic": 5,
        "ancient_relic": 0.4
      },
      "special5": {
        "common": 5,
        "uncommon": 25,
        "rare": 32,
        "epic": 30,
        "legendary": 16,
        "mythic": 6,
        "ancient_relic": 0.5
      },
      "special6": {
        "common": 5,
        "uncommon": 22,
        "rare": 30,
        "epic": 32,
        "legendary": 18,
        "mythic": 7,
        "ancient_relic": 0.6
      },
      "special7": {
        "common": 4,
        "uncommon": 20,
        "rare": 28,
        "epic": 34,
        "legendary": 20,
        "mythic": 8,
        "ancient_relic": 0.7
      },
      "boss_ember_king": {
        "common": 0,
        "uncommon": 5,
        "rare": 20,
        "epic": 35,
        "legendary": 30,
        "mythic": 10,
        "ancient_relic": 0.5
      },
      "boss_frost_titan": {
        "common": 0,
        "uncommon": 3,
        "rare": 15,
        "epic": 32,
        "legendary": 35,
        "mythic": 15,
        "ancient_relic": 0.7
      },
      "boss_void_herald": {
        "common": 0,
        "uncommon": 2,
        "rare": 10,
        "epic": 28,
        "legendary": 40,
        "mythic": 20,
        "ancient_relic": 0.9
      },
      "boss_storm_colossus": {
        "common": 0,
        "uncommon": 1,
        "rare": 8,
        "epic": 25,
        "legendary": 42,
        "mythic": 24,
        "ancient_relic": 1
      },
      "boss_world_eater": {
        "common": 0,
        "uncommon": 0,
        "rare": 5,
        "epic": 20,
        "legendary": 45,
        "mythic": 30,
        "ancient_relic": 1.2
      },
      "fast": {
        "common": 100,
        "uncommon": 30,
        "rare": 8,
        "epic": 2,
        "legendary": 0.5,
        "mythic": 0,
        "ancient_relic": 0
      }
    },
    "categoryWeights": {
      "material": 60,
      "gear": 40
    }
  },
  "effects": {
    "blood_scythe": {
      "animation": "hit",
      "color": "#dc2626",
      "particles": "slash",
      "sound": [
        "blood_scythe"
      ]
    },
    "blood_splatter": {
      "animation": "hit",
      "color": "#b91c1c",
      "particles": "burst",
      "sound": [
        "blood_splatter"
      ]
    },
    "blood_eruption": {
      "animation": "hit",
      "color": "#e11d48",
      "particles": "burst",
      "sound": [
        "blood_eruption"
      ]
    },
    "blood_vortex": {
      "animation": "hit-shadow",
      "color": "#ef4444",
      "particles": "vortex",
      "sound": [
        "blood_vortex"
      ]
    },
    "blood_needles": {
      "animation": "hit",
      "color": "#f43f5e",
      "particles": "slash",
      "sound": [
        "blood_needles"
      ]
    },
    "blood_drain": {
      "animation": "hit-shadow",
      "color": "#be123c",
      "particles": "slash",
      "sound": [
        "blood_drain"
      ]
    },
    "blood_scythe_cross": {
      "animation": "hit-crit",
      "color": "#991b1b",
      "particles": "slash",
      "sound": [
        "blood_scythe_cross"
      ]
    },
    "blood_curse_mist": {
      "animation": "hit",
      "color": "#881337",
      "particles": "burst",
      "sound": [
        "blood_curse_mist"
      ]
    },
    "blood_cleave": {
      "animation": "hit",
      "color": "#b91c1c",
      "particles": "slash",
      "sound": [
        "blood_cleave"
      ]
    },
    "blood_nova": {
      "animation": "hit-crit",
      "color": "#dc2626",
      "particles": "burst",
      "sound": [
        "blood_nova"
      ]
    },
    "shadow_scythe_reap": {
      "animation": "hit-shadow",
      "color": "#9333ea",
      "particles": "slash",
      "sound": [
        "shadow_scythe_reap"
      ]
    },
    "void_rift_tear": {
      "animation": "hit-shadow",
      "color": "#7e22ce",
      "particles": "burst",
      "sound": [
        "void_rift_tear"
      ]
    },
    "shadow_spikes_rise": {
      "animation": "hit",
      "color": "#581c87",
      "particles": "burst",
      "sound": [
        "shadow_spikes_rise"
      ]
    },
    "dark_matter_orb": {
      "animation": "hit-arcane",
      "color": "#a855f7",
      "particles": "orb",
      "sound": [
        "dark_matter_orb"
      ]
    },
    "soul_harvest_wisps": {
      "animation": "hit",
      "color": "#c084fc",
      "particles": "burst",
      "sound": [
        "soul_harvest_wisps"
      ]
    },
    "dark_cross_execution": {
      "animation": "hit-crit",
      "color": "#6b21a8",
      "particles": "slash",
      "sound": [
        "dark_cross_execution"
      ]
    },
    "eclipse_wave": {
      "animation": "hit-shadow",
      "color": "#4c1d95",
      "particles": "burst",
      "sound": [
        "eclipse_wave"
      ]
    },
    "shadow_tendrils": {
      "animation": "hit-shadow",
      "color": "#3b0764",
      "particles": "vortex",
      "sound": [
        "shadow_tendrils"
      ]
    },
    "phantom_dagger_barrage": {
      "animation": "hit",
      "color": "#7c3aed",
      "particles": "slash",
      "sound": [
        "phantom_dagger_barrage"
      ]
    },
    "black_hole_implosion": {
      "animation": "hit",
      "color": "#2e1065",
      "particles": "burst",
      "sound": [
        "black_hole_implosion"
      ]
    },
    "fire_meteor_crash": {
      "animation": "hit-crit",
      "color": "#ea580c",
      "particles": "burst",
      "sound": [
        "fire_meteor_crash"
      ]
    },
    "flame_pillar_inferno": {
      "animation": "hit",
      "color": "#f97316",
      "particles": "burst",
      "sound": [
        "flame_pillar_inferno"
      ]
    },
    "fire_slash_arc": {
      "animation": "hit",
      "color": "#ff5722",
      "particles": "slash",
      "sound": [
        "fire_slash_arc"
      ]
    },
    "dragon_breath_cone": {
      "animation": "hit",
      "color": "#dc2626",
      "particles": "burst",
      "sound": [
        "dragon_breath_cone"
      ]
    },
    "magma_eruption_burst": {
      "animation": "hit",
      "color": "#c2410c",
      "particles": "burst",
      "sound": [
        "magma_eruption_burst"
      ]
    },
    "phoenix_wings_sweep": {
      "animation": "hit",
      "color": "#f97316",
      "particles": "burst",
      "sound": [
        "phoenix_wings_sweep"
      ]
    },
    "ember_whirlwind": {
      "animation": "hit-shadow",
      "color": "#fb923c",
      "particles": "vortex",
      "sound": [
        "ember_whirlwind"
      ]
    },
    "scorch_wave_ring": {
      "animation": "hit",
      "color": "#ef4444",
      "particles": "burst",
      "sound": [
        "scorch_wave_ring"
      ]
    },
    "fireball_streak": {
      "animation": "hit-arcane",
      "color": "#ea580c",
      "particles": "slash",
      "sound": [
        "fireball_streak"
      ]
    },
    "supernova_blast": {
      "animation": "hit-crit",
      "color": "#f59e0b",
      "particles": "burst",
      "sound": [
        "supernova_blast"
      ]
    },
    "earth_fissure_rupture": {
      "animation": "hit",
      "color": "#854d0e",
      "particles": "burst",
      "sound": [
        "earth_fissure_rupture"
      ]
    },
    "boulder_crush_drop": {
      "animation": "hit",
      "color": "#713f12",
      "particles": "burst",
      "sound": [
        "boulder_crush_drop"
      ]
    },
    "seismic_shockwave_ring": {
      "animation": "hit",
      "color": "#a16207",
      "particles": "burst",
      "sound": [
        "seismic_shockwave_ring"
      ]
    },
    "sandstorm_vortex_spin": {
      "animation": "hit-shadow",
      "color": "#d97706",
      "particles": "vortex",
      "sound": [
        "sandstorm_vortex_spin"
      ]
    },
    "stone_spikes_impale": {
      "animation": "hit",
      "color": "#65a30d",
      "particles": "burst",
      "sound": [
        "stone_spikes_impale"
      ]
    },
    "rock_avalanche_barrage": {
      "animation": "hit",
      "color": "#78716c",
      "particles": "slash",
      "sound": [
        "rock_avalanche_barrage"
      ]
    },
    "earth_hammer_quake": {
      "animation": "hit-crit",
      "color": "#b45309",
      "particles": "slash",
      "sound": [
        "earth_hammer_quake"
      ]
    },
    "crystal_earth_shards": {
      "animation": "hit",
      "color": "#65a30d",
      "particles": "burst",
      "sound": [
        "crystal_earth_shards"
      ]
    },
    "mud_splash_entangle": {
      "animation": "hit",
      "color": "#451a03",
      "particles": "burst",
      "sound": [
        "mud_splash_entangle"
      ]
    },
    "granite_armor_shatter": {
      "animation": "hit",
      "color": "#57534e",
      "particles": "burst",
      "sound": [
        "granite_armor_shatter"
      ]
    },
    "frost_crystal_spear": {
      "animation": "hit-arcane",
      "color": "#38bdf8",
      "particles": "slash",
      "sound": [
        "frost_crystal_spear"
      ]
    },
    "frost_nova_freeze": {
      "animation": "hit",
      "color": "#0284c7",
      "particles": "burst",
      "sound": [
        "frost_nova_freeze"
      ]
    },
    "ice_sword_uppercut": {
      "animation": "hit",
      "color": "#7dd3fc",
      "particles": "slash",
      "sound": [
        "ice_sword_uppercut"
      ]
    },
    "blizzard_cyclone_vortex": {
      "animation": "hit-shadow",
      "color": "#0ea5e9",
      "particles": "vortex",
      "sound": [
        "blizzard_cyclone_vortex"
      ]
    },
    "ice_spikes_ground": {
      "animation": "hit",
      "color": "#38bdf8",
      "particles": "burst",
      "sound": [
        "ice_spikes_ground"
      ]
    },
    "tidal_wave_water": {
      "animation": "hit",
      "color": "#2563eb",
      "particles": "burst",
      "sound": [
        "tidal_wave_water"
      ]
    },
    "frozen_orb_shatter": {
      "animation": "hit-arcane",
      "color": "#06b6d4",
      "particles": "burst",
      "sound": [
        "frozen_orb_shatter"
      ]
    },
    "icicle_rain_barrage": {
      "animation": "hit",
      "color": "#0284c7",
      "particles": "burst",
      "sound": [
        "icicle_rain_barrage"
      ]
    },
    "water_whip_lash": {
      "animation": "hit",
      "color": "#3b82f6",
      "particles": "slash",
      "sound": [
        "water_whip_lash"
      ]
    },
    "frost_prison_dome": {
      "animation": "hit",
      "color": "#0369a1",
      "particles": "burst",
      "sound": [
        "frost_prison_dome"
      ]
    },
    "lightning_strike_heavy": {
      "animation": "hit-arcane",
      "color": "#facc15",
      "particles": "slash",
      "sound": [
        "lightning_strike_heavy"
      ]
    },
    "chain_lightning_arc": {
      "animation": "hit-arcane",
      "color": "#eab308",
      "particles": "slash",
      "sound": [
        "chain_lightning_arc"
      ]
    },
    "ball_lightning_plasma": {
      "animation": "hit-arcane",
      "color": "#ca8a04",
      "particles": "burst",
      "sound": [
        "ball_lightning_plasma"
      ]
    },
    "lightning_slash_blade": {
      "animation": "hit",
      "color": "#fde047",
      "particles": "slash",
      "sound": [
        "lightning_slash_blade"
      ]
    },
    "electric_field_discharge": {
      "animation": "hit",
      "color": "#eab308",
      "particles": "burst",
      "sound": [
        "electric_field_discharge"
      ]
    },
    "storm_tornado_vortex": {
      "animation": "hit-shadow",
      "color": "#fbbf24",
      "particles": "vortex",
      "sound": [
        "storm_tornado_vortex"
      ]
    },
    "emp_shockwave_ring": {
      "animation": "hit",
      "color": "#facc15",
      "particles": "burst",
      "sound": [
        "emp_shockwave_ring"
      ]
    },
    "triple_thunder_judgement": {
      "animation": "hit-arcane",
      "color": "#fef08a",
      "particles": "burst",
      "sound": [
        "triple_thunder_judgement"
      ]
    },
    "electric_sparks_shower": {
      "animation": "hit",
      "color": "#fde047",
      "particles": "burst",
      "sound": [
        "electric_sparks_shower"
      ]
    },
    "storm_spear_throw": {
      "animation": "hit-arcane",
      "color": "#eab308",
      "particles": "slash",
      "sound": [
        "storm_spear_throw"
      ]
    },
    "holy_pillar_smite": {
      "animation": "hit",
      "color": "#facc15",
      "particles": "burst",
      "sound": [
        "holy_pillar_smite"
      ]
    },
    "radiance_sword_slash": {
      "animation": "hit",
      "color": "#fef08a",
      "particles": "slash",
      "sound": [
        "radiance_sword_slash"
      ]
    },
    "holy_cross_burst": {
      "animation": "hit",
      "color": "#fde047",
      "particles": "burst",
      "sound": [
        "holy_cross_burst"
      ]
    },
    "heal_aura_fountain": {
      "animation": "heal",
      "color": "#4ade80",
      "particles": "glow",
      "sound": [
        "heal_aura_fountain"
      ]
    },
    "radiant_halo_shield": {
      "animation": "defend",
      "color": "#f59e0b",
      "particles": "ring",
      "sound": [
        "radiant_halo_shield"
      ]
    },
    "angel_feathers_scatter": {
      "animation": "hit",
      "color": "#ffffff",
      "particles": "burst",
      "sound": [
        "angel_feathers_scatter"
      ]
    },
    "judgement_solar_flare": {
      "animation": "hit",
      "color": "#facc15",
      "particles": "burst",
      "sound": [
        "judgement_solar_flare"
      ]
    },
    "holy_lance_projectile": {
      "animation": "hit-arcane",
      "color": "#fef08a",
      "particles": "slash",
      "sound": [
        "holy_lance_projectile"
      ]
    },
    "divine_retribution_ring": {
      "animation": "hit",
      "color": "#eab308",
      "particles": "burst",
      "sound": [
        "divine_retribution_ring"
      ]
    },
    "dawn_star_explosion": {
      "animation": "hit",
      "color": "#ffffff",
      "particles": "burst",
      "sound": [
        "dawn_star_explosion"
      ]
    },
    "rising_katana_slash": {
      "animation": "hit",
      "color": "#ffffff",
      "particles": "slash",
      "sound": [
        "slash1"
      ]
    },
    "cross_cut_x_slash": {
      "animation": "hit-crit",
      "color": "#f87171",
      "particles": "slash",
      "sound": [
        "slash2"
      ]
    },
    "heavy_hammer_slam": {
      "animation": "hit-crit",
      "color": "#fb923c",
      "particles": "slash",
      "sound": [
        "heavy_hammer_slam"
      ]
    },
    "whirlwind_blade_spin": {
      "animation": "hit-shadow",
      "color": "#cbd5e1",
      "particles": "vortex",
      "sound": [
        "whirlwind_blade_spin"
      ]
    },
    "piercing_rapier_thrust": {
      "animation": "hit",
      "color": "#ffffff",
      "particles": "slash",
      "sound": [
        "piercing_rapier_thrust"
      ]
    },
    "axe_cleave_horizontal": {
      "animation": "hit",
      "color": "#ea580c",
      "particles": "slash",
      "sound": [
        "axe_cleave_horizontal"
      ]
    },
    "sonic_air_blade": {
      "animation": "hit-arcane",
      "color": "#94a3b8",
      "particles": "slash",
      "sound": [
        "sonic_air_blade"
      ]
    },
    "shield_bash_shock": {
      "animation": "hit",
      "color": "#64748b",
      "particles": "burst",
      "sound": [
        "shield_bash_shock"
      ]
    },
    "triple_dagger_slash": {
      "animation": "hit",
      "color": "#e2e8f0",
      "particles": "slash",
      "sound": [
        "triple_dagger_slash"
      ]
    },
    "guillotine_fall": {
      "animation": "hit-crit",
      "color": "#dc2626",
      "particles": "slash",
      "sound": [
        "guillotine_fall"
      ]
    }
  },
  "dungeonSizes": [
    {
      "id": "small",
      "label": "Small",
      "stamina": 3,
      "count": 0.6,
      "fewerCount": 1.5,
      "power": 0.85,
      "goldScale": 0.8,
      "woodScale": 0.8,
      "xpScale": 0.8
    },
    {
      "id": "normal",
      "label": "Normal",
      "stamina": 3,
      "count": 1,
      "fewerCount": 1,
      "power": 1,
      "goldScale": 1,
      "woodScale": 1,
      "xpScale": 1
    },
    {
      "id": "big",
      "label": "Big",
      "stamina": 3,
      "count": 1.6,
      "fewerCount": 0.7,
      "power": 1.15,
      "goldScale": 1.2,
      "woodScale": 1.2,
      "xpScale": 1.2
    },
    {
      "id": "huge",
      "label": "Huge",
      "stamina": 3,
      "count": 2.2,
      "fewerCount": 0.5,
      "power": 1.3,
      "goldScale": 1.5,
      "woodScale": 1.5,
      "xpScale": 1.5
    }
  ],
  "dungeons": [
    {
      "rank": "f",
      "label": "F-Rank",
      "image": "/images/dungeons/f.png",
      "stamina": 4,
      "xpReward": 40,
      "goldScale": 0.4,
      "woodScale": 0.4,
      "goldBase": 30,
      "woodBase": 20,
      "monsterPool": [
        "slime",
        "goblin",
        "giant_rat",
        "cave_bat",
        "wolf",
        "kobold",
        "forest_mite",
        "grove_sprite",
        "ember_sprite",
        "vine_lurker",
        "vine_wraith",
        "thornback_boar"
      ],
      "monsterCount": 2,
      "monsterPower": 1,
      "sizeProfile": "more",
      "loot": {
        "legendary": 0.5,
        "epic": 1.5,
        "mythic": 0.2,
        "remnant": 0.05
      }
    },
    {
      "rank": "d",
      "label": "D-Rank",
      "image": "/images/dungeons/d.png",
      "stamina": 4,
      "xpReward": 70,
      "goldScale": 0.6,
      "woodScale": 0.55,
      "goldBase": 45,
      "woodBase": 30,
      "monsterPool": [
        "iron_goblin",
        "bone_archer",
        "frost_wolf",
        "ash_spider",
        "brigand_captain",
        "marsh_crawler",
        "ember_sprite",
        "abyss_wraith",
        "storm_harpy",
        "flame_witch"
      ],
      "monsterCount": 2,
      "monsterPower": 1.3,
      "sizeProfile": "more",
      "loot": {
        "legendary": 1,
        "epic": 3,
        "mythic": 0.4,
        "remnant": 0.08
      }
    },
    {
      "rank": "c",
      "label": "C-Rank",
      "image": "/images/dungeons/c.png",
      "stamina": 4,
      "xpReward": 110,
      "goldScale": 0.8,
      "woodScale": 0.7,
      "goldBase": 70,
      "woodBase": 45,
      "monsterPool": [
        "goblin_warrior",
        "skeleton",
        "dire_wolf",
        "crystal_golem",
        "cursed_knight",
        "iron_ogre",
        "golem",
        "wraith",
        "manticore",
        "harpy"
      ],
      "monsterCount": 3,
      "monsterPower": 1.6,
      "sizeProfile": "more",
      "loot": {
        "legendary": 2,
        "epic": 5,
        "mythic": 0.8,
        "remnant": 0.12
      }
    },
    {
      "rank": "b",
      "label": "B-Rank",
      "image": "/images/dungeons/b.png",
      "stamina": 4,
      "xpReward": 160,
      "goldScale": 1,
      "woodScale": 0.9,
      "goldBase": 100,
      "woodBase": 60,
      "monsterPool": [
        "stone_warden",
        "manticore",
        "ogre",
        "dark_knight",
        "witch",
        "iron_ogre",
        "crystal_golem",
        "wyvern",
        "frost_wyvern",
        "void_golem",
        "elder_treant"
      ],
      "monsterCount": 3,
      "monsterPower": 2,
      "sizeProfile": "more",
      "loot": {
        "legendary": 3.5,
        "epic": 8,
        "mythic": 1.5,
        "remnant": 0.2
      }
    },
    {
      "rank": "a",
      "label": "A-Rank",
      "image": "/images/dungeons/a.png",
      "stamina": 4,
      "xpReward": 230,
      "goldScale": 1.3,
      "woodScale": 1.1,
      "goldBase": 150,
      "woodBase": 85,
      "monsterPool": [
        "crystal_golem",
        "cursed_knight",
        "stone_titan",
        "wyvern",
        "ancient_golem",
        "frost_wyvern",
        "void_golem",
        "storm_lich",
        "nether_hydra",
        "dusk_manticore"
      ],
      "monsterCount": 3,
      "monsterPower": 2.6,
      "sizeProfile": "more",
      "loot": {
        "legendary": 6,
        "epic": 12,
        "mythic": 3,
        "remnant": 0.4
      }
    },
    {
      "rank": "s",
      "label": "S-Rank",
      "image": "/images/dungeons/s.png",
      "stamina": 4,
      "xpReward": 320,
      "goldScale": 1.7,
      "woodScale": 1.3,
      "goldBase": 220,
      "woodBase": 110,
      "monsterPool": [
        "wyvern",
        "frost_wyvern",
        "void_golem",
        "storm_lich",
        "nether_hydra",
        "ancient_golem",
        "lich",
        "doom_lord",
        "abyss_wraith",
        "flame_witch"
      ],
      "monsterCount": 4,
      "monsterPower": 3.3,
      "sizeProfile": "fewerStronger",
      "loot": {
        "legendary": 10,
        "epic": 18,
        "mythic": 6,
        "remnant": 0.8
      }
    },
    {
      "rank": "ss",
      "label": "SS-Rank",
      "image": "/images/dungeons/ss.png",
      "stamina": 4,
      "xpReward": 430,
      "goldScale": 2.1,
      "woodScale": 1.6,
      "goldBase": 320,
      "woodBase": 150,
      "monsterPool": [
        "ancient_golem",
        "wyvern",
        "storm_lich",
        "void_golem",
        "lich",
        "doom_lord",
        "world_eater",
        "hydra",
        "frost_wyvern",
        "nether_hydra"
      ],
      "monsterCount": 4,
      "monsterPower": 4.2,
      "sizeProfile": "fewerStronger",
      "loot": {
        "legendary": 14,
        "epic": 24,
        "mythic": 10,
        "remnant": 1.4
      }
    },
    {
      "rank": "ssplus",
      "label": "SS+",
      "image": "/images/dungeons/ssplus.png",
      "stamina": 4,
      "xpReward": 560,
      "goldScale": 2.6,
      "woodScale": 1.9,
      "goldBase": 460,
      "woodBase": 200,
      "monsterPool": [
        "lich",
        "hydra",
        "doom_lord",
        "world_eater",
        "void_golem",
        "storm_lich",
        "nether_hydra",
        "ancient_golem",
        "frost_wyvern",
        "world_eater"
      ],
      "monsterCount": 5,
      "monsterPower": 5.5,
      "sizeProfile": "fewerStronger",
      "loot": {
        "legendary": 18,
        "epic": 30,
        "mythic": 14,
        "remnant": 2.2
      }
    },
    {
      "rank": "fast",
      "label": "Fast Dungeon",
      "image": "/images/dungeons/fast.png",
      "stamina": 2,
      "xpReward": 55,
      "goldScale": 0.5,
      "woodScale": 0.45,
      "goldBase": 25,
      "woodBase": 15,
      "monsterPool": [
        "slime",
        "goblin",
        "goblin_archer",
        "kobold",
        "forest_mite"
      ],
      "monsterCount": 1,
      "monsterPower": 1,
      "sizeProfile": "more",
      "loot": {
        "legendary": 0.8,
        "epic": 2,
        "mythic": 0.3,
        "remnant": 0.06
      }
    },
    {
      "rank": "special1",
      "label": "Ember Hollow",
      "image": "/images/dungeons/ember_hollow.png",
      "stamina": 4,
      "xpReward": 180,
      "goldScale": 1.2,
      "woodScale": 1,
      "goldBase": 120,
      "woodBase": 70,
      "monsterPool": [
        "molten_behemoth",
        "flame_witch",
        "ember_sprite"
      ],
      "monsterCount": 1,
      "monsterPower": 3.5,
      "sizeProfile": "fewerStronger",
      "isSpecial": true,
      "materialPool": [
        "fire_essence",
        "heart_of_fire"
      ]
    },
    {
      "rank": "special2",
      "label": "Frost Crypt",
      "image": "/images/dungeons/frost_crypt.png",
      "stamina": 4,
      "xpReward": 180,
      "goldScale": 1.2,
      "woodScale": 1,
      "goldBase": 120,
      "woodBase": 70,
      "monsterPool": [
        "frost_titan",
        "frost_wolf",
        "stone_titan"
      ],
      "monsterCount": 1,
      "monsterPower": 3.5,
      "sizeProfile": "fewerStronger",
      "isSpecial": true,
      "materialPool": [
        "frost_essence"
      ]
    },
    {
      "rank": "special3",
      "label": "Shadow Sanctum",
      "image": "/images/dungeons/shadow_sanctum.png",
      "stamina": 4,
      "xpReward": 180,
      "goldScale": 1.2,
      "woodScale": 1,
      "goldBase": 120,
      "woodBase": 70,
      "monsterPool": [
        "void_herald",
        "abyss_wraith",
        "cursed_knight"
      ],
      "monsterCount": 1,
      "monsterPower": 3.5,
      "sizeProfile": "fewerStronger",
      "isSpecial": true,
      "materialPool": [
        "shadow_essence"
      ]
    },
    {
      "rank": "special4",
      "label": "Storm Bastion",
      "image": "/images/dungeons/storm_bastion.png",
      "stamina": 4,
      "xpReward": 180,
      "goldScale": 1.2,
      "woodScale": 1,
      "goldBase": 120,
      "woodBase": 70,
      "monsterPool": [
        "storm_colossus",
        "storm_harpy",
        "griffin"
      ],
      "monsterCount": 1,
      "monsterPower": 3.5,
      "sizeProfile": "fewerStronger",
      "isSpecial": true,
      "materialPool": [
        "arcane_essence"
      ]
    },
    {
      "rank": "special5",
      "label": "Void Maw",
      "image": "/images/dungeons/void_maw.png",
      "stamina": 5,
      "xpReward": 220,
      "goldScale": 1.5,
      "woodScale": 1.2,
      "goldBase": 150,
      "woodBase": 90,
      "monsterPool": [
        "void_golem",
        "world_eater",
        "abyss_wraith"
      ],
      "monsterCount": 1,
      "monsterPower": 4,
      "sizeProfile": "fewerStronger",
      "isSpecial": true,
      "materialPool": [
        "shadow_essence",
        "arcane_essence"
      ]
    },
    {
      "rank": "special6",
      "label": "Ancient Foundry",
      "image": "/images/dungeons/ancient_foundry.png",
      "stamina": 5,
      "xpReward": 220,
      "goldScale": 1.5,
      "woodScale": 1.2,
      "goldBase": 150,
      "woodBase": 90,
      "monsterPool": [
        "ancient_golem",
        "stone_titan",
        "crystal_golem"
      ],
      "monsterCount": 1,
      "monsterPower": 4,
      "sizeProfile": "fewerStronger",
      "isSpecial": true,
      "materialPool": [
        "golem_heart",
        "fire_essence",
        "arcane_essence"
      ]
    },
    {
      "rank": "special7",
      "label": "Phoenix Sanctum",
      "image": "/images/dungeons/phoenix_sanctum.png",
      "stamina": 5,
      "xpReward": 250,
      "goldScale": 1.6,
      "woodScale": 1.3,
      "goldBase": 180,
      "woodBase": 110,
      "monsterPool": [
        "phoenix_canary",
        "molten_behemoth",
        "frost_titan"
      ],
      "monsterCount": 1,
      "monsterPower": 4.5,
      "sizeProfile": "fewerStronger",
      "isSpecial": true,
      "materialPool": [
        "the_essence_of_life",
        "fire_essence"
      ]
    },
    {
      "rank": "boss_ember_king",
      "label": "Ember King",
      "image": "/images/dungeons/boss_ember_king.png",
      "stamina": 4,
      "xpReward": 300,
      "goldScale": 1.4,
      "woodScale": 1.1,
      "goldBase": 150,
      "woodBase": 90,
      "monsterPool": [
        "boss_ember_king"
      ],
      "monsterCount": 1,
      "monsterPower": 0.22,
      "sizeProfile": "fewerStronger",
      "unlockAfter": null,
      "isBoss": true,
      "isSpecial": true,
      "materialPool": [
        "the_essence_of_life"
      ]
    },
    {
      "rank": "boss_frost_titan",
      "label": "Frost Titan",
      "image": "/images/dungeons/boss_frost_titan.png",
      "stamina": 5,
      "xpReward": 400,
      "goldScale": 1.5,
      "woodScale": 1.2,
      "goldBase": 180,
      "woodBase": 110,
      "monsterPool": [
        "boss_frost_titan"
      ],
      "monsterCount": 1,
      "monsterPower": 0.22,
      "sizeProfile": "fewerStronger",
      "unlockAfter": "boss_ember_king",
      "isBoss": true,
      "isSpecial": true,
      "materialPool": [
        "the_essence_of_life"
      ]
    },
    {
      "rank": "boss_void_herald",
      "label": "Void Herald",
      "image": "/images/dungeons/boss_void_herald.png",
      "stamina": 5,
      "xpReward": 500,
      "goldScale": 1.6,
      "woodScale": 1.3,
      "goldBase": 220,
      "woodBase": 130,
      "monsterPool": [
        "boss_void_herald"
      ],
      "monsterCount": 1,
      "monsterPower": 0.22,
      "sizeProfile": "fewerStronger",
      "unlockAfter": "boss_frost_titan",
      "isBoss": true,
      "isSpecial": true,
      "materialPool": [
        "the_essence_of_life"
      ]
    },
    {
      "rank": "boss_storm_colossus",
      "label": "Storm Colossus",
      "image": "/images/dungeons/boss_storm_colossus.png",
      "stamina": 6,
      "xpReward": 600,
      "goldScale": 1.7,
      "woodScale": 1.4,
      "goldBase": 260,
      "woodBase": 150,
      "monsterPool": [
        "boss_storm_colossus"
      ],
      "monsterCount": 1,
      "monsterPower": 0.22,
      "sizeProfile": "fewerStronger",
      "unlockAfter": "boss_void_herald",
      "isBoss": true,
      "isSpecial": true,
      "materialPool": [
        "the_essence_of_life"
      ]
    },
    {
      "rank": "boss_world_eater",
      "label": "World Eater",
      "image": "/images/dungeons/boss_world_eater.png",
      "stamina": 6,
      "xpReward": 800,
      "goldScale": 1.8,
      "woodScale": 1.5,
      "goldBase": 320,
      "woodBase": 180,
      "monsterPool": [
        "boss_world_eater"
      ],
      "monsterCount": 1,
      "monsterPower": 0.22,
      "sizeProfile": "fewerStronger",
      "unlockAfter": "boss_storm_colossus",
      "isBoss": true,
      "isSpecial": true,
      "materialPool": [
        "the_essence_of_life"
      ]
    }
  ],
  "bosses": [
    {
      "id": "boss_ember_king",
      "label": "Ember King",
      "image": "/images/bosses/ember_king.png",
      "hp": 9000,
      "attack": 42,
      "speed": 6,
      "element": "fire",
      "rarity": "mythic",
      "weaponId": "boss_weapon_ember",
      "chestId": "boss_chest_ember",
      "unlockAfter": null
    },
    {
      "id": "boss_frost_titan",
      "label": "Frost Titan",
      "image": "/images/bosses/frost_titan.png",
      "hp": 16000,
      "attack": 52,
      "speed": 5,
      "element": "frost",
      "rarity": "mythic",
      "weaponId": "boss_weapon_frost",
      "chestId": "boss_chest_frost",
      "unlockAfter": "boss_ember_king"
    },
    {
      "id": "boss_void_herald",
      "label": "Void Herald",
      "image": "/images/bosses/void_herald.png",
      "hp": 26000,
      "attack": 62,
      "speed": 7,
      "element": "shadow",
      "rarity": "mythic",
      "weaponId": "boss_weapon_void",
      "chestId": "boss_chest_void",
      "unlockAfter": "boss_frost_titan"
    },
    {
      "id": "boss_storm_colossus",
      "label": "Storm Colossus",
      "image": "/images/bosses/storm_colossus.png",
      "hp": 40000,
      "attack": 72,
      "speed": 6,
      "element": "arcane",
      "rarity": "mythic",
      "weaponId": "boss_weapon_storm",
      "chestId": "boss_chest_storm",
      "unlockAfter": "boss_void_herald"
    },
    {
      "id": "boss_world_eater",
      "label": "World Eater",
      "image": "/images/bosses/world_eater.png",
      "hp": 55000,
      "attack": 85,
      "speed": 5,
      "element": "physical",
      "rarity": "mythic",
      "weaponId": "boss_weapon_world",
      "chestId": "boss_chest_world",
      "unlockAfter": "boss_storm_colossus"
    }
  ],
  "pets": [
    {
      "id": "fire_wolf",
      "name": "Fire Wolf",
      "image": "/images/pets/fire_wolf.png",
      "element": "fire",
      "stats": {
        "attack": 5
      },
      "description": "A loyal ember pup. +5 Attack.",
      "egg": ""
    },
    {
      "id": "water_sprite",
      "name": "Water Sprite",
      "image": "/images/pets/water_sprite.png",
      "element": "water",
      "stats": {
        "magicPower": 6
      },
      "description": "A bubbling companion. +6 Magic Power.",
      "egg": ""
    },
    {
      "id": "pet_direwolf",
      "name": "Direwolf",
      "image": "/images/pets/pet_direwolf.png",
      "element": "fire",
      "stats": {
        "attack": 4,
        "magicPower": 7
      },
      "description": "Direwolf from Red Egg",
      "egg": "egg_red"
    },
    {
      "id": "pet_ember_pup",
      "name": "Ember Pup",
      "image": "/images/pets/pet_ember_pup.png",
      "element": "fire",
      "stats": {
        "attack": 7,
        "magicPower": 5
      },
      "description": "Ember Pup from Red Egg",
      "egg": "egg_red"
    },
    {
      "id": "pet_cinder_cub",
      "name": "Cinder Cub",
      "image": "/images/pets/pet_cinder_cub.png",
      "element": "fire",
      "stats": {
        "attack": 6,
        "magicPower": 5
      },
      "description": "Cinder Cub from Red Egg",
      "egg": "egg_red"
    },
    {
      "id": "pet_slime",
      "name": "Slime",
      "image": "/images/pets/pet_slime.png",
      "element": "fire",
      "stats": {
        "attack": 3,
        "magicPower": 7
      },
      "description": "Slime from Red Egg",
      "egg": "egg_red"
    },
    {
      "id": "pet_sprout",
      "name": "Sprout",
      "image": "/images/pets/pet_sprout.png",
      "element": "nature",
      "stats": {
        "attack": 3,
        "magicPower": 7
      },
      "description": "Sprout from Red Egg",
      "egg": "egg_red"
    },
    {
      "id": "pet_flame_sprite",
      "name": "Flame Sprite",
      "image": "/images/pets/pet_flame_sprite.png",
      "element": "fire",
      "stats": {
        "attack": 3,
        "magicPower": 4
      },
      "description": "Flame Sprite from Red Egg",
      "egg": "egg_red"
    },
    {
      "id": "pet_mossling",
      "name": "Mossling",
      "image": "/images/pets/pet_mossling.png",
      "element": "earth",
      "stats": {
        "attack": 4,
        "magicPower": 6
      },
      "description": "Mossling from Green Egg",
      "egg": "egg_green"
    },
    {
      "id": "pet_vine_pup",
      "name": "Vine Pup",
      "image": "/images/pets/pet_vine_pup.png",
      "element": "earth",
      "stats": {
        "attack": 5,
        "magicPower": 5
      },
      "description": "Vine Pup from Green Egg",
      "egg": "egg_green"
    },
    {
      "id": "pet_thorn_whelp",
      "name": "Thorn Whelp",
      "image": "/images/pets/pet_thorn_whelp.png",
      "element": "earth",
      "stats": {
        "attack": 4,
        "magicPower": 3
      },
      "description": "Thorn Whelp from Green Egg",
      "egg": "egg_green"
    },
    {
      "id": "pet_grove_sprite",
      "name": "Grove Sprite",
      "image": "/images/pets/pet_grove_sprite.png",
      "element": "earth",
      "stats": {
        "attack": 4,
        "magicPower": 3
      },
      "description": "Grove Sprite from Green Egg",
      "egg": "egg_green"
    },
    {
      "id": "pet_slime_king",
      "name": "Slime King",
      "image": "/images/pets/pet_slime_king.png",
      "element": "earth",
      "stats": {
        "attack": 6,
        "magicPower": 6
      },
      "description": "Slime King from Green Egg",
      "egg": "egg_green"
    },
    {
      "id": "pet_forest_cub",
      "name": "Forest Cub",
      "image": "/images/pets/pet_forest_cub.png",
      "element": "earth",
      "stats": {
        "attack": 5,
        "magicPower": 3
      },
      "description": "Forest Cub from Green Egg",
      "egg": "egg_green"
    },
    {
      "id": "pet_natureling",
      "name": "Natureling",
      "image": "/images/pets/pet_natureling.png",
      "element": "nature",
      "stats": {
        "attack": 3,
        "magicPower": 7
      },
      "description": "A budding nature spirit from the Green Egg.",
      "egg": "egg_green"
    },
    {
      "id": "pet_frost_pup",
      "name": "Frost Pup",
      "image": "/images/pets/pet_frost_pup.png",
      "element": "water",
      "stats": {
        "attack": 7,
        "magicPower": 3
      },
      "description": "Frost Pup from Blue Egg",
      "egg": "egg_blue"
    },
    {
      "id": "pet_ice_whelp",
      "name": "Ice Whelp",
      "image": "/images/pets/pet_ice_whelp.png",
      "element": "water",
      "stats": {
        "attack": 3,
        "magicPower": 3
      },
      "description": "Ice Whelp from Blue Egg",
      "egg": "egg_blue"
    },
    {
      "id": "pet_snow_cub",
      "name": "Snow Cub",
      "image": "/images/pets/pet_snow_cub.png",
      "element": "water",
      "stats": {
        "attack": 5,
        "magicPower": 7
      },
      "description": "Snow Cub from Blue Egg",
      "egg": "egg_blue"
    },
    {
      "id": "pet_glacierling",
      "name": "Glacierling",
      "image": "/images/pets/pet_glacierling.png",
      "element": "water",
      "stats": {
        "attack": 5,
        "magicPower": 6
      },
      "description": "Glacierling from Blue Egg",
      "egg": "egg_blue"
    },
    {
      "id": "pet_chill_sprite",
      "name": "Chill Sprite",
      "image": "/images/pets/pet_chill_sprite.png",
      "element": "water",
      "stats": {
        "attack": 3,
        "magicPower": 7
      },
      "description": "Chill Sprite from Blue Egg",
      "egg": "egg_blue"
    },
    {
      "id": "pet_frost_drake",
      "name": "Frost Drake",
      "image": "/images/pets/pet_frost_drake.png",
      "element": "water",
      "stats": {
        "attack": 5,
        "magicPower": 7
      },
      "description": "Frost Drake from Blue Egg",
      "egg": "egg_blue"
    },
    {
      "id": "pet_stone_pup",
      "name": "Stone Pup",
      "image": "/images/pets/pet_stone_pup.png",
      "element": "earth",
      "stats": {
        "attack": 5,
        "magicPower": 7
      },
      "description": "Stone Pup from Brown Egg",
      "egg": "egg_brown"
    },
    {
      "id": "pet_rockling",
      "name": "Rockling",
      "image": "/images/pets/pet_rockling.png",
      "element": "earth",
      "stats": {
        "attack": 4,
        "magicPower": 6
      },
      "description": "Rockling from Brown Egg",
      "egg": "egg_brown"
    },
    {
      "id": "pet_boulder_cub",
      "name": "Boulder Cub",
      "image": "/images/pets/pet_boulder_cub.png",
      "element": "earth",
      "stats": {
        "attack": 7,
        "magicPower": 6
      },
      "description": "Boulder Cub from Brown Egg",
      "egg": "egg_brown"
    },
    {
      "id": "pet_crystal_sprite",
      "name": "Crystal Sprite",
      "image": "/images/pets/pet_crystal_sprite.png",
      "element": "earth",
      "stats": {
        "attack": 5,
        "magicPower": 4
      },
      "description": "Crystal Sprite from Brown Egg",
      "egg": "egg_brown"
    },
    {
      "id": "pet_golem_whelp",
      "name": "Golem Whelp",
      "image": "/images/pets/pet_golem_whelp.png",
      "element": "earth",
      "stats": {
        "attack": 6,
        "magicPower": 6
      },
      "description": "Golem Whelp from Brown Egg",
      "egg": "egg_brown"
    },
    {
      "id": "pet_granite_pup",
      "name": "Granite Pup",
      "image": "/images/pets/pet_granite_pup.png",
      "element": "earth",
      "stats": {
        "attack": 7,
        "magicPower": 3
      },
      "description": "Granite Pup from Brown Egg",
      "egg": "egg_brown"
    },
    {
      "id": "pet_storm_pup",
      "name": "Storm Pup",
      "image": "/images/pets/pet_storm_pup.png",
      "element": "lightning",
      "stats": {
        "attack": 3,
        "magicPower": 4
      },
      "description": "Storm Pup from Yellow Egg",
      "egg": "egg_yellow"
    },
    {
      "id": "pet_thunder_cub",
      "name": "Thunder Cub",
      "image": "/images/pets/pet_thunder_cub.png",
      "element": "lightning",
      "stats": {
        "attack": 7,
        "magicPower": 4
      },
      "description": "Thunder Cub from Yellow Egg",
      "egg": "egg_yellow"
    },
    {
      "id": "pet_lightning_drake",
      "name": "Lightning Drake",
      "image": "/images/pets/pet_lightning_drake.png",
      "element": "lightning",
      "stats": {
        "attack": 5,
        "magicPower": 4
      },
      "description": "Lightning Drake from Yellow Egg",
      "egg": "egg_yellow"
    },
    {
      "id": "pet_wind_sprite",
      "name": "Wind Sprite",
      "image": "/images/pets/pet_wind_sprite.png",
      "element": "lightning",
      "stats": {
        "attack": 3,
        "magicPower": 3
      },
      "description": "Wind Sprite from Yellow Egg",
      "egg": "egg_yellow"
    },
    {
      "id": "pet_gale_whelp",
      "name": "Gale Whelp",
      "image": "/images/pets/pet_gale_whelp.png",
      "element": "lightning",
      "stats": {
        "attack": 7,
        "magicPower": 6
      },
      "description": "Gale Whelp from Yellow Egg",
      "egg": "egg_yellow"
    },
    {
      "id": "pet_storm_hatchling",
      "name": "Storm Hatchling",
      "image": "/images/pets/pet_storm_hatchling.png",
      "element": "lightning",
      "stats": {
        "attack": 6,
        "magicPower": 5
      },
      "description": "Storm Hatchling from Yellow Egg",
      "egg": "egg_yellow"
    },
    {
      "id": "pet_shadow_pup",
      "name": "Shadow Pup",
      "image": "/images/pets/pet_shadow_pup.png",
      "element": "dark",
      "stats": {
        "attack": 4,
        "magicPower": 3
      },
      "description": "Shadow Pup from Purple Egg",
      "egg": "egg_purple"
    },
    {
      "id": "pet_voidling",
      "name": "Voidling",
      "image": "/images/pets/pet_voidling.png",
      "element": "dark",
      "stats": {
        "attack": 6,
        "magicPower": 3
      },
      "description": "Voidling from Purple Egg",
      "egg": "egg_purple"
    },
    {
      "id": "pet_dusk_whelp",
      "name": "Dusk Whelp",
      "image": "/images/pets/pet_dusk_whelp.png",
      "element": "dark",
      "stats": {
        "attack": 7,
        "magicPower": 5
      },
      "description": "Dusk Whelp from Purple Egg",
      "egg": "egg_purple"
    },
    {
      "id": "pet_night_cub",
      "name": "Night Cub",
      "image": "/images/pets/pet_night_cub.png",
      "element": "dark",
      "stats": {
        "attack": 6,
        "magicPower": 7
      },
      "description": "Night Cub from Purple Egg",
      "egg": "egg_purple"
    },
    {
      "id": "pet_shade_sprite",
      "name": "Shade Sprite",
      "image": "/images/pets/pet_shade_sprite.png",
      "element": "dark",
      "stats": {
        "attack": 4,
        "magicPower": 4
      },
      "description": "Shade Sprite from Purple Egg",
      "egg": "egg_purple"
    },
    {
      "id": "pet_umbra_drake",
      "name": "Umbra Drake",
      "image": "/images/pets/pet_umbra_drake.png",
      "element": "dark",
      "stats": {
        "attack": 7,
        "magicPower": 3
      },
      "description": "Umbra Drake from Purple Egg",
      "egg": "egg_purple"
    },
    {
      "id": "pet_crystal_drake",
      "name": "Crystal Drake",
      "image": "/images/pets/pet_crystal_drake.png",
      "element": "water",
      "stats": {
        "attack": 5,
        "magicPower": 4
      },
      "description": "Crystal Drake from Cyan Egg",
      "egg": "egg_cyan"
    },
    {
      "id": "pet_arcane_pup",
      "name": "Arcane Pup",
      "image": "/images/pets/pet_arcane_pup.png",
      "element": "water",
      "stats": {
        "attack": 5,
        "magicPower": 6
      },
      "description": "Arcane Pup from Cyan Egg",
      "egg": "egg_cyan"
    },
    {
      "id": "pet_mana_sprite",
      "name": "Mana Sprite",
      "image": "/images/pets/pet_mana_sprite.png",
      "element": "water",
      "stats": {
        "attack": 5,
        "magicPower": 7
      },
      "description": "Mana Sprite from Cyan Egg",
      "egg": "egg_cyan"
    },
    {
      "id": "pet_spell_whelp",
      "name": "Spell Whelp",
      "image": "/images/pets/pet_spell_whelp.png",
      "element": "water",
      "stats": {
        "attack": 6,
        "magicPower": 7
      },
      "description": "Spell Whelp from Cyan Egg",
      "egg": "egg_cyan"
    },
    {
      "id": "pet_runeling",
      "name": "Runeling",
      "image": "/images/pets/pet_runeling.png",
      "element": "water",
      "stats": {
        "attack": 4,
        "magicPower": 4
      },
      "description": "Runeling from Cyan Egg",
      "egg": "egg_cyan"
    },
    {
      "id": "pet_crystal_hound",
      "name": "Crystal Hound",
      "image": "/images/pets/pet_crystal_hound.png",
      "element": "water",
      "stats": {
        "attack": 4,
        "magicPower": 6
      },
      "description": "Crystal Hound from Cyan Egg",
      "egg": "egg_cyan"
    },
    {
      "id": "pet_void_pup",
      "name": "Void Pup",
      "image": "/images/pets/pet_void_pup.png",
      "element": "dark",
      "stats": {
        "attack": 5,
        "magicPower": 7
      },
      "description": "Void Pup from Dark Egg",
      "egg": "egg_dark"
    },
    {
      "id": "pet_abyssling",
      "name": "Abyssling",
      "image": "/images/pets/pet_abyssling.png",
      "element": "dark",
      "stats": {
        "attack": 6,
        "magicPower": 3
      },
      "description": "Abyssling from Dark Egg",
      "egg": "egg_dark"
    },
    {
      "id": "pet_nether_cub",
      "name": "Nether Cub",
      "image": "/images/pets/pet_nether_cub.png",
      "element": "dark",
      "stats": {
        "attack": 4,
        "magicPower": 4
      },
      "description": "Nether Cub from Dark Egg",
      "egg": "egg_dark"
    },
    {
      "id": "pet_shadow_drake",
      "name": "Shadow Drake",
      "image": "/images/pets/pet_shadow_drake.png",
      "element": "dark",
      "stats": {
        "attack": 4,
        "magicPower": 4
      },
      "description": "Shadow Drake from Dark Egg",
      "egg": "egg_dark"
    },
    {
      "id": "pet_dark_hound",
      "name": "Dark Hound",
      "image": "/images/pets/pet_dark_hound.png",
      "element": "dark",
      "stats": {
        "attack": 4,
        "magicPower": 6
      },
      "description": "Dark Hound from Dark Egg",
      "egg": "egg_dark"
    },
    {
      "id": "pet_void_sprite",
      "name": "Void Sprite",
      "image": "/images/pets/pet_void_sprite.png",
      "element": "dark",
      "stats": {
        "attack": 6,
        "magicPower": 5
      },
      "description": "Void Sprite from Dark Egg",
      "egg": "egg_dark"
    },
    {
      "id": "pet_phoenix_hatchling",
      "name": "Phoenix Hatchling",
      "image": "/images/pets/pet_phoenix_hatchling.png",
      "element": "fire",
      "stats": {
        "attack": 5,
        "magicPower": 7
      },
      "description": "Phoenix Hatchling from Orange Egg",
      "egg": "egg_orange"
    },
    {
      "id": "pet_ember_drake",
      "name": "Ember Drake",
      "image": "/images/pets/pet_ember_drake.png",
      "element": "fire",
      "stats": {
        "attack": 4,
        "magicPower": 4
      },
      "description": "Ember Drake from Orange Egg",
      "egg": "egg_orange"
    },
    {
      "id": "pet_flame_hound",
      "name": "Flame Hound",
      "image": "/images/pets/pet_flame_hound.png",
      "element": "fire",
      "stats": {
        "attack": 4,
        "magicPower": 7
      },
      "description": "Flame Hound from Orange Egg",
      "egg": "egg_orange"
    },
    {
      "id": "pet_inferno_pup",
      "name": "Inferno Pup",
      "image": "/images/pets/pet_inferno_pup.png",
      "element": "fire",
      "stats": {
        "attack": 5,
        "magicPower": 3
      },
      "description": "Inferno Pup from Orange Egg",
      "egg": "egg_orange"
    },
    {
      "id": "pet_blaze_drake",
      "name": "Blaze Drake",
      "image": "/images/pets/pet_blaze_drake.png",
      "element": "fire",
      "stats": {
        "attack": 4,
        "magicPower": 3
      },
      "description": "Blaze Drake from Orange Egg",
      "egg": "egg_orange"
    },
    {
      "id": "pet_phoenix_chick",
      "name": "Phoenix Chick",
      "image": "/images/pets/pet_phoenix_chick.png",
      "element": "fire",
      "stats": {
        "attack": 3,
        "magicPower": 5
      },
      "description": "Phoenix Chick from Orange Egg",
      "egg": "egg_orange"
    },
    {
      "id": "pet_mythic_drake",
      "name": "Mythic Drake",
      "image": "/images/pets/pet_mythic_drake.png",
      "element": "physical",
      "stats": {
        "attack": 7,
        "magicPower": 7
      },
      "description": "Mythic Drake from Gold Egg",
      "egg": "egg_gold"
    },
    {
      "id": "pet_gold_pup",
      "name": "Gold Pup",
      "image": "/images/pets/pet_gold_pup.png",
      "element": "physical",
      "stats": {
        "attack": 7,
        "magicPower": 7
      },
      "description": "Gold Pup from Gold Egg",
      "egg": "egg_gold"
    },
    {
      "id": "pet_radiant_cub",
      "name": "Radiant Cub",
      "image": "/images/pets/pet_radiant_cub.png",
      "element": "physical",
      "stats": {
        "attack": 3,
        "magicPower": 6
      },
      "description": "Radiant Cub from Gold Egg",
      "egg": "egg_gold"
    },
    {
      "id": "pet_divine_whelp",
      "name": "Divine Whelp",
      "image": "/images/pets/pet_divine_whelp.png",
      "element": "physical",
      "stats": {
        "attack": 3,
        "magicPower": 5
      },
      "description": "Divine Whelp from Gold Egg",
      "egg": "egg_gold"
    },
    {
      "id": "pet_light_sprite",
      "name": "Light Sprite",
      "image": "/images/pets/pet_light_sprite.png",
      "element": "physical",
      "stats": {
        "attack": 4,
        "magicPower": 7
      },
      "description": "Light Sprite from Gold Egg",
      "egg": "egg_gold"
    },
    {
      "id": "pet_mythic_hound",
      "name": "Mythic Hound",
      "image": "/images/pets/pet_mythic_hound.png",
      "element": "physical",
      "stats": {
        "attack": 6,
        "magicPower": 5
      },
      "description": "Mythic Hound from Gold Egg",
      "egg": "egg_gold"
    },
    {
      "id": "pet_rage_pup_100",
      "name": "Rage Pup",
      "image": "/images/pets/pet_rage_pup_100.png",
      "element": "fire",
      "stats": {
        "attack": 5
      },
      "description": "Rage Pup - grants attack buff. From egg_red",
      "egg": "egg_red",
      "buffKind": "attack"
    },
    {
      "id": "pet_fury_cub_101",
      "name": "Fury Cub",
      "image": "/images/pets/pet_fury_cub_101.png",
      "element": "water",
      "stats": {
        "magicPower": 6
      },
      "description": "Fury Cub - grants magicBoost buff. From egg_green",
      "egg": "egg_green",
      "buffKind": "magicBoost"
    },
    {
      "id": "pet_berserk_whelp_102",
      "name": "Berserk Whelp",
      "image": "/images/pets/pet_berserk_whelp_102.png",
      "element": "earth",
      "stats": {
        "resistance": 5
      },
      "description": "Berserk Whelp - grants defense buff. From egg_blue",
      "egg": "egg_blue",
      "buffKind": "defense"
    },
    {
      "id": "pet_war_hound_103",
      "name": "War Hound",
      "image": "/images/pets/pet_war_hound_103.png",
      "element": "lightning",
      "stats": {
        "attack": 4
      },
      "description": "War Hound - grants attack buff. From egg_brown",
      "egg": "egg_brown",
      "buffKind": "attack"
    },
    {
      "id": "pet_battle_pup_104",
      "name": "Battle Pup",
      "image": "/images/pets/pet_battle_pup_104.png",
      "element": "dark",
      "stats": {
        "magicPower": 6
      },
      "description": "Battle Pup - grants magicBoost buff. From egg_yellow",
      "egg": "egg_yellow",
      "buffKind": "magicBoost"
    },
    {
      "id": "pet_might_cub_105",
      "name": "Might Cub",
      "image": "/images/pets/pet_might_cub_105.png",
      "element": "physical",
      "stats": {
        "resistance": 5
      },
      "description": "Might Cub - grants defense buff. From egg_purple",
      "egg": "egg_purple",
      "buffKind": "defense"
    },
    {
      "id": "pet_arcane_pup_106",
      "name": "Arcane Pup",
      "image": "/images/pets/pet_arcane_pup_106.png",
      "element": "frost",
      "stats": {
        "attack": 6
      },
      "description": "Arcane Pup - grants attack buff. From egg_cyan",
      "egg": "egg_cyan",
      "buffKind": "attack"
    },
    {
      "id": "pet_mana_sprite_107",
      "name": "Mana Sprite",
      "image": "/images/pets/pet_mana_sprite_107.png",
      "element": "arcane",
      "stats": {
        "magicPower": 5
      },
      "description": "Mana Sprite - grants magicBoost buff. From egg_dark",
      "egg": "egg_dark",
      "buffKind": "magicBoost"
    },
    {
      "id": "pet_spell_whelp_108",
      "name": "Spell Whelp",
      "image": "/images/pets/pet_spell_whelp_108.png",
      "element": "holy",
      "stats": {
        "resistance": 4
      },
      "description": "Spell Whelp - grants defense buff. From egg_orange",
      "egg": "egg_orange",
      "buffKind": "defense"
    },
    {
      "id": "pet_mystic_cub_109",
      "name": "Mystic Cub",
      "image": "/images/pets/pet_mystic_cub_109.png",
      "element": "shadow",
      "stats": {
        "attack": 5
      },
      "description": "Mystic Cub - grants attack buff. From egg_gold",
      "egg": "egg_gold",
      "buffKind": "attack"
    },
    {
      "id": "pet_rune_pup_110",
      "name": "Rune Pup",
      "image": "/images/pets/pet_rune_pup_110.png",
      "element": "fire",
      "stats": {
        "magicPower": 4
      },
      "description": "Rune Pup - grants magicBoost buff. From egg_red",
      "egg": "egg_red",
      "buffKind": "magicBoost"
    },
    {
      "id": "pet_gale_sprite_111",
      "name": "Gale Sprite",
      "image": "/images/pets/pet_gale_sprite_111.png",
      "element": "water",
      "stats": {
        "resistance": 4
      },
      "description": "Gale Sprite - grants defense buff. From egg_green",
      "egg": "egg_green",
      "buffKind": "defense"
    },
    {
      "id": "pet_stone_guardian_112",
      "name": "Stone Guardian",
      "image": "/images/pets/pet_stone_guardian_112.png",
      "element": "earth",
      "stats": {
        "attack": 6
      },
      "description": "Stone Guardian - grants attack buff. From egg_blue",
      "egg": "egg_blue",
      "buffKind": "attack"
    },
    {
      "id": "pet_iron_pup_113",
      "name": "Iron Pup",
      "image": "/images/pets/pet_iron_pup_113.png",
      "element": "lightning",
      "stats": {
        "magicPower": 5
      },
      "description": "Iron Pup - grants magicBoost buff. From egg_brown",
      "egg": "egg_brown",
      "buffKind": "magicBoost"
    },
    {
      "id": "pet_granite_whelp_114",
      "name": "Granite Whelp",
      "image": "/images/pets/pet_granite_whelp_114.png",
      "element": "dark",
      "stats": {
        "resistance": 5
      },
      "description": "Granite Whelp - grants defense buff. From egg_yellow",
      "egg": "egg_yellow",
      "buffKind": "defense"
    },
    {
      "id": "pet_crystal_pup_115",
      "name": "Crystal Pup",
      "image": "/images/pets/pet_crystal_pup_115.png",
      "element": "physical",
      "stats": {
        "attack": 4
      },
      "description": "Crystal Pup - grants attack buff. From egg_purple",
      "egg": "egg_purple",
      "buffKind": "attack"
    },
    {
      "id": "pet_boulder_cub_116",
      "name": "Boulder Cub",
      "image": "/images/pets/pet_boulder_cub_116.png",
      "element": "frost",
      "stats": {
        "magicPower": 5
      },
      "description": "Boulder Cub - grants magicBoost buff. From egg_cyan",
      "egg": "egg_cyan",
      "buffKind": "magicBoost"
    },
    {
      "id": "pet_rock_sprite_117",
      "name": "Rock Sprite",
      "image": "/images/pets/pet_rock_sprite_117.png",
      "element": "arcane",
      "stats": {
        "resistance": 3
      },
      "description": "Rock Sprite - grants defense buff. From egg_dark",
      "egg": "egg_dark",
      "buffKind": "defense"
    },
    {
      "id": "pet_frost_lynx_118",
      "name": "Frost Lynx",
      "image": "/images/pets/pet_frost_lynx_118.png",
      "element": "holy",
      "stats": {
        "attack": 4
      },
      "description": "Frost Lynx - grants attack buff. From egg_orange",
      "egg": "egg_orange",
      "buffKind": "attack"
    },
    {
      "id": "pet_glacier_pup_119",
      "name": "Glacier Pup",
      "image": "/images/pets/pet_glacier_pup_119.png",
      "element": "shadow",
      "stats": {
        "magicPower": 6
      },
      "description": "Glacier Pup - grants magicBoost buff. From egg_gold",
      "egg": "egg_gold",
      "buffKind": "magicBoost"
    },
    {
      "id": "pet_snow_hound_120",
      "name": "Snow Hound",
      "image": "/images/pets/pet_snow_hound_120.png",
      "element": "fire",
      "stats": {
        "resistance": 3
      },
      "description": "Snow Hound - grants defense buff. From egg_red",
      "egg": "egg_red",
      "buffKind": "defense"
    },
    {
      "id": "pet_ice_cub_121",
      "name": "Ice Cub",
      "image": "/images/pets/pet_ice_cub_121.png",
      "element": "water",
      "stats": {
        "attack": 6
      },
      "description": "Ice Cub - grants attack buff. From egg_green",
      "egg": "egg_green",
      "buffKind": "attack"
    },
    {
      "id": "pet_chill_whelp_122",
      "name": "Chill Whelp",
      "image": "/images/pets/pet_chill_whelp_122.png",
      "element": "earth",
      "stats": {
        "magicPower": 6
      },
      "description": "Chill Whelp - grants magicBoost buff. From egg_blue",
      "egg": "egg_blue",
      "buffKind": "magicBoost"
    },
    {
      "id": "pet_frost_kit_123",
      "name": "Frost Kit",
      "image": "/images/pets/pet_frost_kit_123.png",
      "element": "lightning",
      "stats": {
        "resistance": 4
      },
      "description": "Frost Kit - grants defense buff. From egg_brown",
      "egg": "egg_brown",
      "buffKind": "defense"
    },
    {
      "id": "pet_ember_lynx_124",
      "name": "Ember Lynx",
      "image": "/images/pets/pet_ember_lynx_124.png",
      "element": "dark",
      "stats": {
        "attack": 6
      },
      "description": "Ember Lynx - grants attack buff. From egg_yellow",
      "egg": "egg_yellow",
      "buffKind": "attack"
    },
    {
      "id": "pet_flame_hound_125",
      "name": "Flame Hound",
      "image": "/images/pets/pet_flame_hound_125.png",
      "element": "physical",
      "stats": {
        "magicPower": 6
      },
      "description": "Flame Hound - grants magicBoost buff. From egg_purple",
      "egg": "egg_purple",
      "buffKind": "magicBoost"
    },
    {
      "id": "pet_cinder_pup_126",
      "name": "Cinder Pup",
      "image": "/images/pets/pet_cinder_pup_126.png",
      "element": "frost",
      "stats": {
        "resistance": 3
      },
      "description": "Cinder Pup - grants defense buff. From egg_cyan",
      "egg": "egg_cyan",
      "buffKind": "defense"
    },
    {
      "id": "pet_blaze_cub_127",
      "name": "Blaze Cub",
      "image": "/images/pets/pet_blaze_cub_127.png",
      "element": "arcane",
      "stats": {
        "attack": 5
      },
      "description": "Blaze Cub - grants attack buff. From egg_dark",
      "egg": "egg_dark",
      "buffKind": "attack"
    },
    {
      "id": "pet_inferno_whelp_128",
      "name": "Inferno Whelp",
      "image": "/images/pets/pet_inferno_whelp_128.png",
      "element": "holy",
      "stats": {
        "magicPower": 6
      },
      "description": "Inferno Whelp - grants magicBoost buff. From egg_orange",
      "egg": "egg_orange",
      "buffKind": "magicBoost"
    },
    {
      "id": "pet_fire_sprite_129",
      "name": "Fire Sprite",
      "image": "/images/pets/pet_fire_sprite_129.png",
      "element": "shadow",
      "stats": {
        "resistance": 5
      },
      "description": "Fire Sprite - grants defense buff. From egg_gold",
      "egg": "egg_gold",
      "buffKind": "defense"
    },
    {
      "id": "pet_storm_hawk_130",
      "name": "Storm Hawk",
      "image": "/images/pets/pet_storm_hawk_130.png",
      "element": "fire",
      "stats": {
        "attack": 5
      },
      "description": "Storm Hawk - grants attack buff. From egg_red",
      "egg": "egg_red",
      "buffKind": "attack"
    },
    {
      "id": "pet_thunder_pup_131",
      "name": "Thunder Pup",
      "image": "/images/pets/pet_thunder_pup_131.png",
      "element": "water",
      "stats": {
        "magicPower": 6
      },
      "description": "Thunder Pup - grants magicBoost buff. From egg_green",
      "egg": "egg_green",
      "buffKind": "magicBoost"
    },
    {
      "id": "pet_gale_cub_132",
      "name": "Gale Cub",
      "image": "/images/pets/pet_gale_cub_132.png",
      "element": "earth",
      "stats": {
        "resistance": 3
      },
      "description": "Gale Cub - grants defense buff. From egg_blue",
      "egg": "egg_blue",
      "buffKind": "defense"
    },
    {
      "id": "pet_wind_sprite_133",
      "name": "Wind Sprite",
      "image": "/images/pets/pet_wind_sprite_133.png",
      "element": "lightning",
      "stats": {
        "attack": 4
      },
      "description": "Wind Sprite - grants attack buff. From egg_brown",
      "egg": "egg_brown",
      "buffKind": "attack"
    },
    {
      "id": "pet_lightning_pup_134",
      "name": "Lightning Pup",
      "image": "/images/pets/pet_lightning_pup_134.png",
      "element": "dark",
      "stats": {
        "magicPower": 5
      },
      "description": "Lightning Pup - grants magicBoost buff. From egg_yellow",
      "egg": "egg_yellow",
      "buffKind": "magicBoost"
    },
    {
      "id": "pet_tempest_whelp_135",
      "name": "Tempest Whelp",
      "image": "/images/pets/pet_tempest_whelp_135.png",
      "element": "physical",
      "stats": {
        "resistance": 3
      },
      "description": "Tempest Whelp - grants defense buff. From egg_purple",
      "egg": "egg_purple",
      "buffKind": "defense"
    },
    {
      "id": "pet_shadow_cat_136",
      "name": "Shadow Cat",
      "image": "/images/pets/pet_shadow_cat_136.png",
      "element": "frost",
      "stats": {
        "attack": 6
      },
      "description": "Shadow Cat - grants attack buff. From egg_cyan",
      "egg": "egg_cyan",
      "buffKind": "attack"
    },
    {
      "id": "pet_void_pup_137",
      "name": "Void Pup",
      "image": "/images/pets/pet_void_pup_137.png",
      "element": "arcane",
      "stats": {
        "magicPower": 5
      },
      "description": "Void Pup - grants magicBoost buff. From egg_dark",
      "egg": "egg_dark",
      "buffKind": "magicBoost"
    }
  ],
  "eggs": [
    {
      "id": "egg_red",
      "label": "Red Egg",
      "rarity": "common",
      "dropRate": 0.1,
      "dungeons": [
        "f",
        "fast"
      ],
      "pets": [
        "pet_direwolf",
        "pet_ember_pup",
        "pet_cinder_cub",
        "pet_slime",
        "pet_sprout",
        "pet_flame_sprite"
      ]
    },
    {
      "id": "egg_green",
      "label": "Green Egg",
      "rarity": "common",
      "dropRate": 0.05,
      "dungeons": [
        "f",
        "d"
      ],
      "pets": [
        "pet_mossling",
        "pet_vine_pup",
        "pet_thorn_whelp",
        "pet_grove_sprite",
        "pet_slime_king",
        "pet_forest_cub",
        "pet_natureling"
      ]
    },
    {
      "id": "egg_blue",
      "label": "Blue Egg",
      "rarity": "uncommon",
      "dropRate": 0.03,
      "dungeons": [
        "d",
        "c"
      ],
      "pets": [
        "pet_frost_pup",
        "pet_ice_whelp",
        "pet_snow_cub",
        "pet_glacierling",
        "pet_chill_sprite",
        "pet_frost_drake"
      ]
    },
    {
      "id": "egg_brown",
      "label": "Brown Egg",
      "rarity": "uncommon",
      "dropRate": 0.02,
      "dungeons": [
        "c",
        "b"
      ],
      "pets": [
        "pet_stone_pup",
        "pet_rockling",
        "pet_boulder_cub",
        "pet_crystal_sprite",
        "pet_golem_whelp",
        "pet_granite_pup"
      ]
    },
    {
      "id": "egg_yellow",
      "label": "Yellow Egg",
      "rarity": "rare",
      "dropRate": 0.015,
      "dungeons": [
        "b",
        "a"
      ],
      "pets": [
        "pet_storm_pup",
        "pet_thunder_cub",
        "pet_lightning_drake",
        "pet_wind_sprite",
        "pet_gale_whelp",
        "pet_storm_hatchling"
      ]
    },
    {
      "id": "egg_purple",
      "label": "Purple Egg",
      "rarity": "rare",
      "dropRate": 0.01,
      "dungeons": [
        "a",
        "s"
      ],
      "pets": [
        "pet_shadow_pup",
        "pet_voidling",
        "pet_dusk_whelp",
        "pet_night_cub",
        "pet_shade_sprite",
        "pet_umbra_drake"
      ]
    },
    {
      "id": "egg_cyan",
      "label": "Cyan Egg",
      "rarity": "epic",
      "dropRate": 0.008,
      "dungeons": [
        "s",
        "ss"
      ],
      "pets": [
        "pet_crystal_drake",
        "pet_arcane_pup",
        "pet_mana_sprite",
        "pet_spell_whelp",
        "pet_runeling",
        "pet_crystal_hound"
      ]
    },
    {
      "id": "egg_dark",
      "label": "Dark Egg",
      "rarity": "epic",
      "dropRate": 0.006,
      "dungeons": [
        "ss",
        "ssplus"
      ],
      "pets": [
        "pet_void_pup",
        "pet_abyssling",
        "pet_nether_cub",
        "pet_shadow_drake",
        "pet_dark_hound",
        "pet_void_sprite"
      ]
    },
    {
      "id": "egg_orange",
      "label": "Orange Egg",
      "rarity": "legendary",
      "dropRate": 0.004,
      "dungeons": [
        "special7"
      ],
      "pets": [
        "pet_phoenix_hatchling",
        "pet_ember_drake",
        "pet_flame_hound",
        "pet_inferno_pup",
        "pet_blaze_drake",
        "pet_phoenix_chick"
      ]
    },
    {
      "id": "egg_gold",
      "label": "Gold Egg",
      "rarity": "mythic",
      "dropRate": 0.002,
      "dungeons": [
        "ssplus"
      ],
      "pets": [
        "pet_mythic_drake",
        "pet_gold_pup",
        "pet_radiant_cub",
        "pet_divine_whelp",
        "pet_light_sprite",
        "pet_mythic_hound"
      ]
    }
  ],
  "items": [
    {
      "id": "egg_red",
      "name": "Red Egg",
      "slot": "egg",
      "rarity": "common",
      "price": {
        "gold": 0,
        "wood": 0
      },
      "image": "/images/items/egg_red.png",
      "description": "Red Egg - hatch to get a random pet. Drops in specific dungeons."
    },
    {
      "id": "egg_green",
      "name": "Green Egg",
      "slot": "egg",
      "rarity": "common",
      "price": {
        "gold": 0,
        "wood": 0
      },
      "image": "/images/items/egg_green.png",
      "description": "Green Egg - hatch to get a random pet. Drops in specific dungeons."
    },
    {
      "id": "egg_blue",
      "name": "Blue Egg",
      "slot": "egg",
      "rarity": "uncommon",
      "price": {
        "gold": 0,
        "wood": 0
      },
      "image": "/images/items/egg_blue.png",
      "description": "Blue Egg - hatch to get a random pet. Drops in specific dungeons."
    },
    {
      "id": "egg_brown",
      "name": "Brown Egg",
      "slot": "egg",
      "rarity": "uncommon",
      "price": {
        "gold": 0,
        "wood": 0
      },
      "image": "/images/items/egg_brown.png",
      "description": "Brown Egg - hatch to get a random pet. Drops in specific dungeons."
    },
    {
      "id": "egg_yellow",
      "name": "Yellow Egg",
      "slot": "egg",
      "rarity": "rare",
      "price": {
        "gold": 0,
        "wood": 0
      },
      "image": "/images/items/egg_yellow.png",
      "description": "Yellow Egg - hatch to get a random pet. Drops in specific dungeons."
    },
    {
      "id": "egg_purple",
      "name": "Purple Egg",
      "slot": "egg",
      "rarity": "rare",
      "price": {
        "gold": 0,
        "wood": 0
      },
      "image": "/images/items/egg_purple.png",
      "description": "Purple Egg - hatch to get a random pet. Drops in specific dungeons."
    },
    {
      "id": "egg_cyan",
      "name": "Cyan Egg",
      "slot": "egg",
      "rarity": "epic",
      "price": {
        "gold": 0,
        "wood": 0
      },
      "image": "/images/items/egg_cyan.png",
      "description": "Cyan Egg - hatch to get a random pet. Drops in specific dungeons."
    },
    {
      "id": "egg_dark",
      "name": "Dark Egg",
      "slot": "egg",
      "rarity": "epic",
      "price": {
        "gold": 0,
        "wood": 0
      },
      "image": "/images/items/egg_dark.png",
      "description": "Dark Egg - hatch to get a random pet. Drops in specific dungeons."
    },
    {
      "id": "egg_orange",
      "name": "Orange Egg",
      "slot": "egg",
      "rarity": "legendary",
      "price": {
        "gold": 0,
        "wood": 0
      },
      "image": "/images/items/egg_orange.png",
      "description": "Orange Egg - hatch to get a random pet. Drops in specific dungeons."
    },
    {
      "id": "egg_gold",
      "name": "Gold Egg",
      "slot": "egg",
      "rarity": "mythic",
      "price": {
        "gold": 0,
        "wood": 0
      },
      "image": "/images/items/egg_gold.png",
      "description": "Gold Egg - hatch to get a random pet. Drops in specific dungeons."
    },
    {
      "id": "rusty_sword",
      "name": "Rusty Sword",
      "slot": "weapon",
      "rarity": "common",
      "price": {
        "gold": 30,
        "wood": 5
      },
      "stats": {
        "attack": 18,
        "speed": 3
      },
      "image": "/images/items/rusty_sword.png",
      "description": "+4 Attack"
    },
    {
      "id": "leather_helm",
      "name": "Leather Helm",
      "slot": "head",
      "rarity": "common",
      "price": {
        "gold": 35,
        "wood": 8
      },
      "stats": {
        "maxHp": 30,
        "resistance": 4
      },
      "image": "/images/items/leather_helm.png",
      "description": "+30 Max HP, +4 Resistance"
    },
    {
      "id": "leather_chest",
      "name": "Leather Chest",
      "slot": "armor",
      "rarity": "common",
      "price": {
        "gold": 50,
        "wood": 12
      },
      "stats": {
        "maxHp": 50,
        "resistance": 6
      },
      "image": "/images/items/leather_chest.png",
      "description": "+50 Max HP, +6 Resistance"
    },
    {
      "id": "leather_pants",
      "name": "Leather Pants",
      "slot": "legs",
      "rarity": "common",
      "price": {
        "gold": 40,
        "wood": 10
      },
      "stats": {
        "maxHp": 35,
        "resistance": 5
      },
      "image": "/images/items/leather_pants.png",
      "description": "+35 Max HP, +5 Resistance"
    },
    {
      "id": "leather_boots",
      "name": "Leather Boots",
      "slot": "boots",
      "rarity": "common",
      "price": {
        "gold": 30,
        "wood": 8
      },
      "stats": {
        "speed": 1
      },
      "image": "/images/items/leather_boots.png",
      "description": "+1 Speed"
    },
    {
      "id": "iron_amulet",
      "name": "Iron Amulet",
      "slot": "amulet",
      "rarity": "uncommon",
      "price": {
        "gold": 45,
        "wood": 10
      },
      "stats": {
        "mana": 10,
        "magicPower": 3
      },
      "image": "/images/items/iron_amulet.png",
      "description": "+10 Mana, +3 Magic Power"
    },
    {
      "id": "iron_ring",
      "name": "Iron Ring",
      "slot": "ring",
      "rarity": "common",
      "price": {
        "gold": 40,
        "wood": 9
      },
      "stats": {
        "attack": 2,
        "mana": 5
      },
      "image": "/images/items/iron_ring.png",
      "description": "+2 Attack, +5 Mana"
    },
    {
      "id": "mana_talisman",
      "name": "Mana Talisman",
      "slot": "amulet",
      "rarity": "rare",
      "price": {
        "gold": 160,
        "wood": 30
      },
      "stats": {
        "mana": 20,
        "manaRegen": 1
      },
      "image": "/images/items/mana_talisman.png",
      "description": "+20 Mana, +1 Mana Regen"
    },
    {
      "id": "battle_axe",
      "name": "Battle Axe",
      "slot": "weapon",
      "rarity": "common",
      "price": {
        "gold": 75,
        "wood": 15
      },
      "stats": {
        "attack": 8
      },
      "image": "/images/items/battle_axe.png",
      "description": "+8 Attack"
    },
    {
      "id": "war_hammer",
      "name": "War Hammer",
      "slot": "weapon",
      "rarity": "common",
      "price": {
        "gold": 90,
        "wood": 20
      },
      "stats": {
        "attack": 12
      },
      "image": "/images/items/war_hammer.png",
      "description": "+12 Attack"
    },
    {
      "id": "longbow",
      "name": "Longbow",
      "slot": "weapon",
      "rarity": "common",
      "price": {
        "gold": 80,
        "wood": 18
      },
      "stats": {
        "attack": 7,
        "speed": 1
      },
      "image": "/images/items/longbow.png",
      "description": "+7 Attack, +1 Speed"
    },
    {
      "id": "shortbow",
      "name": "Shortbow",
      "slot": "weapon",
      "rarity": "common",
      "price": {
        "gold": 60,
        "wood": 12
      },
      "stats": {
        "attack": 5,
        "speed": 2
      },
      "image": "/images/items/shortbow.png",
      "description": "+5 Attack, +2 Speed"
    },
    {
      "id": "apprentice_staff",
      "name": "Apprentice Staff",
      "slot": "weapon",
      "rarity": "common",
      "price": {
        "gold": 70,
        "wood": 15
      },
      "stats": {
        "magicPower": 8
      },
      "image": "/images/items/apprentice_staff.png",
      "description": "+8 Magic Power"
    },
    {
      "id": "archon_staff",
      "name": "Archon Staff",
      "slot": "weapon",
      "rarity": "uncommon",
      "price": {
        "gold": 130,
        "wood": 30
      },
      "stats": {
        "magicPower": 14,
        "mana": 10
      },
      "image": "/images/items/archon_staff.png",
      "description": "+14 Magic Power, +10 Mana"
    },
    {
      "id": "dagger",
      "name": "Dagger",
      "slot": "weapon",
      "rarity": "common",
      "price": {
        "gold": 55,
        "wood": 10
      },
      "stats": {
        "attack": 5,
        "speed": 2
      },
      "image": "/images/items/dagger.png",
      "description": "+5 Attack, +2 Speed"
    },
    {
      "id": "poison_dagger",
      "name": "Poison Dagger",
      "slot": "weapon",
      "rarity": "common",
      "price": {
        "gold": 65,
        "wood": 12
      },
      "stats": {
        "attack": 7
      },
      "image": "/images/items/poison_dagger.png",
      "description": "+7 Attack"
    },
    {
      "id": "mace",
      "name": "Mace",
      "slot": "weapon",
      "rarity": "common",
      "price": {
        "gold": 70,
        "wood": 15
      },
      "stats": {
        "attack": 6,
        "magicPower": 3
      },
      "image": "/images/items/mace.png",
      "description": "+6 Attack, +3 Magic Power"
    },
    {
      "id": "holy_sword",
      "name": "Holy Sword",
      "slot": "weapon",
      "rarity": "uncommon",
      "price": {
        "gold": 120,
        "wood": 25
      },
      "stats": {
        "attack": 8,
        "magicPower": 5
      },
      "image": "/images/items/holy_sword.png",
      "description": "+8 Attack, +5 Magic Power"
    },
    {
      "id": "kris_blade",
      "name": "Kris Blade",
      "slot": "weapon",
      "rarity": "uncommon",
      "price": {
        "gold": 115,
        "wood": 22
      },
      "stats": {
        "attack": 10
      },
      "image": "/images/items/kris_blade.png",
      "description": "+10 Attack"
    },
    {
      "id": "whisper_blade",
      "name": "Whisper Blade",
      "slot": "weapon",
      "rarity": "uncommon",
      "price": {
        "gold": 125,
        "wood": 25
      },
      "stats": {
        "attack": 8,
        "speed": 2
      },
      "image": "/images/items/whisper_blade.png",
      "description": "+8 Attack, +2 Speed"
    },
    {
      "id": "scepter",
      "name": "Scepter",
      "slot": "weapon",
      "rarity": "uncommon",
      "price": {
        "gold": 110,
        "wood": 20
      },
      "stats": {
        "magicPower": 10,
        "healPower": 2
      },
      "image": "/images/items/scepter.png",
      "description": "+10 Magic Power, +2 Heal Power"
    },
    {
      "id": "cleric_staff",
      "name": "Cleric Staff",
      "slot": "weapon",
      "rarity": "rare",
      "price": {
        "gold": 190,
        "wood": 40
      },
      "stats": {
        "magicPower": 12,
        "healPower": 4
      },
      "image": "/images/items/cleric_staff.png",
      "description": "+12 Magic Power, +4 Heal Power"
    },
    {
      "id": "maul",
      "name": "Maul",
      "slot": "weapon",
      "rarity": "common",
      "price": {
        "gold": 85,
        "wood": 18
      },
      "stats": {
        "attack": 11,
        "maxHp": 20
      },
      "image": "/images/items/maul.png",
      "description": "+11 Attack, +20 Max HP"
    },
    {
      "id": "bulwark_hammer",
      "name": "Bulwark Hammer",
      "slot": "weapon",
      "rarity": "uncommon",
      "price": {
        "gold": 130,
        "wood": 28
      },
      "stats": {
        "attack": 8,
        "resistance": 5
      },
      "image": "/images/items/bulwark_hammer.png",
      "description": "+8 Attack, +5 Resistance"
    },
    {
      "id": "stone_ash_sword",
      "name": "Stone Ash Sword",
      "slot": "weapon",
      "rarity": "common",
      "price": {
        "gold": 60,
        "wood": 10
      },
      "stats": {
        "attack": 8
      },
      "image": "/images/items/stone_ash_sword.png",
      "description": "+8 Attack. A base for temple crafting."
    },
    {
      "id": "hearth_tea",
      "name": "Hearth Tea",
      "slot": "consumable",
      "rarity": "common",
      "price": {
        "gold": 8,
        "wood": 0
      },
      "heal": 40,
      "image": "/images/items/hearth_tea.png",
      "description": "Heals 40 HP when used."
    },
    {
      "id": "field_rations",
      "name": "Field Rations",
      "slot": "consumable",
      "rarity": "common",
      "price": {
        "gold": 10,
        "wood": 0
      },
      "food": 2,
      "image": "/images/items/field_rations.png",
      "description": "+2 Food."
    },
    {
      "id": "fire_essence",
      "name": "Fire Essence",
      "slot": "material",
      "rarity": "common",
      "price": {
        "gold": 40,
        "wood": 0
      },
      "image": "/images/items/fire_essence.png",
      "description": "A spark of bottled flame. Used in crafting."
    },
    {
      "id": "frost_essence",
      "name": "Frost Essence",
      "slot": "material",
      "rarity": "common",
      "price": {
        "gold": 40,
        "wood": 0
      },
      "image": "/images/items/frost_essence.png",
      "description": "Cold condensed to a droplet. Used in crafting."
    },
    {
      "id": "arcane_essence",
      "name": "Arcane Essence",
      "slot": "material",
      "rarity": "common",
      "price": {
        "gold": 40,
        "wood": 0
      },
      "image": "/images/items/arcane_essence.png",
      "description": "Raw magic held in a vial. Used in crafting."
    },
    {
      "id": "shadow_essence",
      "name": "Shadow Essence",
      "slot": "material",
      "rarity": "common",
      "price": {
        "gold": 40,
        "wood": 0
      },
      "image": "/images/items/shadow_essence.png",
      "description": "Light that never arrives. Used in crafting."
    },
    {
      "id": "heart_of_fire",
      "name": "Heart of Fire",
      "slot": "material",
      "rarity": "rare",
      "price": {
        "gold": 150,
        "wood": 0
      },
      "image": "/images/items/heart_of_fire.png",
      "description": "The still-burning heart of a fire spirit."
    },
    {
      "id": "golem_heart",
      "name": "Heart of Golem",
      "slot": "material",
      "rarity": "rare",
      "price": {
        "gold": 200,
        "wood": 0
      },
      "image": "/images/items/golem_heart.png",
      "description": "Offer it at the Ancient Temple to mend a lost heart."
    },
    {
      "id": "ancient_relic",
      "name": "Ancient Relic",
      "slot": "material",
      "rarity": "ancient_relic",
      "price": {
        "gold": 0,
        "wood": 0
      },
      "image": "/images/items/ancient_relic.png",
      "description": "An artifact older than the kingdom. The temple remembers."
    },
    {
      "id": "fire_ash_sword",
      "name": "Fire Ash Sword",
      "slot": "weapon",
      "rarity": "uncommon",
      "price": {
        "gold": 0,
        "wood": 0
      },
      "stats": {
        "attack": 16
      },
      "image": "/images/items/fire_ash_sword.png",
      "craftOnly": true,
      "description": "+12 Attack. Still warm to the touch."
    },
    {
      "id": "molten_cleaver",
      "name": "Molten Cleaver",
      "slot": "weapon",
      "rarity": "rare",
      "price": {
        "gold": 0,
        "wood": 0
      },
      "stats": {
        "attack": 28
      },
      "image": "/images/items/molten_cleaver.png",
      "craftOnly": true,
      "description": "+20 Attack. It hums with fire."
    },
    {
      "id": "frost_gladius",
      "name": "Frost Gladius",
      "slot": "weapon",
      "rarity": "uncommon",
      "price": {
        "gold": 0,
        "wood": 0
      },
      "stats": {
        "attack": 18,
        "resistance": 6
      },
      "image": "/images/items/frost_gladius.png",
      "craftOnly": true,
      "description": "+12 Attack, +3 Resistance."
    },
    {
      "id": "arcane_rod",
      "name": "Arcane Rod",
      "slot": "weapon",
      "rarity": "uncommon",
      "price": {
        "gold": 0,
        "wood": 0
      },
      "stats": {
        "magicPower": 20,
        "mana": 15
      },
      "image": "/images/items/arcane_rod.png",
      "craftOnly": true,
      "description": "+14 Magic Power, +10 Mana."
    },
    {
      "id": "shadow_knife",
      "name": "Shadow Knife",
      "slot": "weapon",
      "rarity": "uncommon",
      "price": {
        "gold": 0,
        "wood": 0
      },
      "stats": {
        "attack": 18,
        "speed": 3
      },
      "image": "/images/items/shadow_knife.png",
      "craftOnly": true,
      "description": "+11 Attack, +2 Speed."
    },
    {
      "id": "ember_sword",
      "name": "Ember Sword",
      "slot": "weapon",
      "rarity": "epic",
      "price": {
        "gold": 0,
        "wood": 0
      },
      "stats": {
        "attack": 18
      },
      "image": "/images/items/ember_sword.png",
      "description": "+18 Attack. Found only in the deep ruins."
    },
    {
      "id": "phoenix_staff",
      "name": "Phoenix Staff",
      "slot": "weapon",
      "rarity": "legendary",
      "price": {
        "gold": 0,
        "wood": 0
      },
      "stats": {
        "magicPower": 22,
        "healPower": 6
      },
      "image": "/images/items/phoenix_staff.png",
      "description": "+22 Magic Power, +6 Heal Power."
    },
    {
      "id": "void_cleaver",
      "name": "Void Cleaver",
      "slot": "weapon",
      "rarity": "mythic",
      "price": {
        "gold": 0,
        "wood": 0
      },
      "stats": {
        "attack": 30
      },
      "image": "/images/items/void_cleaver.png",
      "description": "+30 Attack. The edge drinks the dark."
    },
    {
      "id": "wooden_chest",
      "name": "Wooden Chest",
      "slot": "chest",
      "rarity": "common",
      "price": {
        "gold": 60,
        "wood": 0
      },
      "chestTier": "f",
      "image": "",
      "description": "A simple chest. Common odds of decent loot."
    },
    {
      "id": "iron_chest",
      "name": "Iron Chest",
      "slot": "chest",
      "rarity": "uncommon",
      "price": {
        "gold": 150,
        "wood": 0
      },
      "chestTier": "d",
      "image": "",
      "description": "A sturdy chest. Better odds of uncommon loot."
    },
    {
      "id": "gold_chest",
      "name": "Gold Chest",
      "slot": "chest",
      "rarity": "rare",
      "price": {
        "gold": 320,
        "wood": 0
      },
      "chestTier": "c",
      "image": "",
      "description": "A gilded chest. Decent odds of rare loot."
    },
    {
      "id": "emerald_chest",
      "name": "Emerald Chest",
      "slot": "chest",
      "rarity": "epic",
      "price": {
        "gold": 0,
        "wood": 0
      },
      "chestTier": "b",
      "image": "",
      "description": "A gem-studded chest. Strong odds of epic loot."
    },
    {
      "id": "obsidian_chest",
      "name": "Obsidian Chest",
      "slot": "chest",
      "rarity": "legendary",
      "price": {
        "gold": 0,
        "wood": 0
      },
      "chestTier": "a",
      "image": "",
      "description": "A black-glass chest. Fine odds of legendary loot."
    },
    {
      "id": "iron_greatsword",
      "name": "Iron Greatsword",
      "slot": "weapon",
      "rarity": "common",
      "price": {
        "gold": 60,
        "wood": 10
      },
      "stats": {
        "attack": 12
      },
      "image": "/images/items/iron_greatsword.png",
      "description": "+12 attack"
    },
    {
      "id": "steel_blade",
      "name": "Steel Blade",
      "slot": "weapon",
      "rarity": "common",
      "price": {
        "gold": 60,
        "wood": 10
      },
      "stats": {
        "attack": 14
      },
      "image": "/images/items/steel_blade.png",
      "description": "+14 attack"
    },
    {
      "id": "ranger_bow",
      "name": "Ranger Bow",
      "slot": "weapon",
      "rarity": "uncommon",
      "price": {
        "gold": 120,
        "wood": 20
      },
      "stats": {
        "attack": 16,
        "speed": 1
      },
      "image": "/images/items/ranger_bow.png",
      "description": "+16 attack, +1 speed"
    },
    {
      "id": "arcane_scepter",
      "name": "Arcane Scepter",
      "slot": "weapon",
      "rarity": "uncommon",
      "price": {
        "gold": 120,
        "wood": 20
      },
      "stats": {
        "magicPower": 16,
        "mana": 12
      },
      "image": "/images/items/arcane_scepter.png",
      "description": "+16 magicPower, +12 mana"
    },
    {
      "id": "shadow_dagger",
      "name": "Shadow Dagger",
      "slot": "weapon",
      "rarity": "rare",
      "price": {
        "gold": 220,
        "wood": 35
      },
      "stats": {
        "attack": 20,
        "speed": 2
      },
      "image": "/images/items/shadow_dagger.png",
      "description": "+20 attack, +2 speed"
    },
    {
      "id": "dragon_spear",
      "name": "Dragon Spear",
      "slot": "weapon",
      "rarity": "rare",
      "price": {
        "gold": 220,
        "wood": 35
      },
      "stats": {
        "attack": 22,
        "speed": 1
      },
      "image": "/images/items/dragon_spear.png",
      "description": "+22 attack, +1 speed"
    },
    {
      "id": "titan_hammer",
      "name": "Titan Hammer",
      "slot": "weapon",
      "rarity": "epic",
      "price": {
        "gold": 400,
        "wood": 60
      },
      "stats": {
        "attack": 26
      },
      "image": "/images/items/titan_hammer.png",
      "description": "+26 attack"
    },
    {
      "id": "storm_bow",
      "name": "Storm Bow",
      "slot": "weapon",
      "rarity": "epic",
      "price": {
        "gold": 400,
        "wood": 60
      },
      "stats": {
        "attack": 24,
        "speed": 2
      },
      "image": "/images/items/storm_bow.png",
      "description": "+24 attack, +2 speed"
    },
    {
      "id": "void_blade",
      "name": "Void Blade",
      "slot": "weapon",
      "rarity": "legendary",
      "price": {
        "gold": 650,
        "wood": 90
      },
      "stats": {
        "attack": 32,
        "speed": 1
      },
      "image": "/images/items/void_blade.png",
      "description": "+32 attack, +1 speed"
    },
    {
      "id": "world_breaker",
      "name": "World Breaker",
      "slot": "weapon",
      "rarity": "mythic",
      "price": {
        "gold": 900,
        "wood": 120
      },
      "stats": {
        "attack": 38
      },
      "image": "/images/items/world_breaker.png",
      "description": "+38 attack"
    },
    {
      "id": "bronze_helm",
      "name": "Bronze Helm",
      "slot": "head",
      "rarity": "common",
      "price": {
        "gold": 40,
        "wood": 8
      },
      "stats": {
        "maxHp": 35,
        "resistance": 5
      },
      "image": "/images/items/bronze_helm.png",
      "description": "+35 maxHp, +5 resistance"
    },
    {
      "id": "iron_helm",
      "name": "Iron Helm",
      "slot": "head",
      "rarity": "common",
      "price": {
        "gold": 40,
        "wood": 8
      },
      "stats": {
        "maxHp": 45,
        "resistance": 7
      },
      "image": "/images/items/iron_helm.png",
      "description": "+45 maxHp, +7 resistance"
    },
    {
      "id": "ranger_hood",
      "name": "Ranger Hood",
      "slot": "head",
      "rarity": "uncommon",
      "price": {
        "gold": 90,
        "wood": 15
      },
      "stats": {
        "maxHp": 40,
        "resistance": 6,
        "speed": 1
      },
      "image": "/images/items/ranger_hood.png",
      "description": "+40 maxHp, +6 resistance, +1 speed"
    },
    {
      "id": "mage_cowl",
      "name": "Mage Cowl",
      "slot": "head",
      "rarity": "uncommon",
      "price": {
        "gold": 90,
        "wood": 15
      },
      "stats": {
        "maxHp": 30,
        "magicPower": 8,
        "mana": 12
      },
      "image": "/images/items/mage_cowl.png",
      "description": "+30 maxHp, +8 magicPower, +12 mana"
    },
    {
      "id": "knight_helm",
      "name": "Knight Helm",
      "slot": "head",
      "rarity": "rare",
      "price": {
        "gold": 180,
        "wood": 28
      },
      "stats": {
        "maxHp": 70,
        "resistance": 12
      },
      "image": "/images/items/knight_helm.png",
      "description": "+70 maxHp, +12 resistance"
    },
    {
      "id": "shadow_mask",
      "name": "Shadow Mask",
      "slot": "head",
      "rarity": "rare",
      "price": {
        "gold": 180,
        "wood": 28
      },
      "stats": {
        "maxHp": 55,
        "resistance": 9,
        "speed": 1
      },
      "image": "/images/items/shadow_mask.png",
      "description": "+55 maxHp, +9 resistance, +1 speed"
    },
    {
      "id": "dragon_helm",
      "name": "Dragon Helm",
      "slot": "head",
      "rarity": "epic",
      "price": {
        "gold": 350,
        "wood": 45
      },
      "stats": {
        "maxHp": 100,
        "resistance": 18,
        "attack": 5
      },
      "image": "/images/items/dragon_helm.png",
      "description": "+100 maxHp, +18 resistance, +5 attack"
    },
    {
      "id": "void_crown",
      "name": "Void Crown",
      "slot": "head",
      "rarity": "legendary",
      "price": {
        "gold": 600,
        "wood": 70
      },
      "stats": {
        "maxHp": 130,
        "resistance": 22,
        "magicPower": 12
      },
      "image": "/images/items/void_crown.png",
      "description": "+130 maxHp, +22 resistance, +12 magicPower"
    },
    {
      "id": "padded_armor",
      "name": "Padded Armor",
      "slot": "armor",
      "rarity": "common",
      "price": {
        "gold": 50,
        "wood": 12
      },
      "stats": {
        "maxHp": 55,
        "resistance": 7
      },
      "image": "/images/items/padded_armor.png",
      "description": "+55 maxHp, +7 resistance"
    },
    {
      "id": "chainmail",
      "name": "Chainmail",
      "slot": "armor",
      "rarity": "common",
      "price": {
        "gold": 50,
        "wood": 12
      },
      "stats": {
        "maxHp": 65,
        "resistance": 9
      },
      "image": "/images/items/chainmail.png",
      "description": "+65 maxHp, +9 resistance"
    },
    {
      "id": "ranger_vest",
      "name": "Ranger Vest",
      "slot": "armor",
      "rarity": "uncommon",
      "price": {
        "gold": 110,
        "wood": 22
      },
      "stats": {
        "maxHp": 60,
        "resistance": 8,
        "speed": 1
      },
      "image": "/images/items/ranger_vest.png",
      "description": "+60 maxHp, +8 resistance, +1 speed"
    },
    {
      "id": "silk_robe",
      "name": "Silk Robe",
      "slot": "armor",
      "rarity": "uncommon",
      "price": {
        "gold": 110,
        "wood": 22
      },
      "stats": {
        "maxHp": 45,
        "resistance": 6,
        "magicPower": 10
      },
      "image": "/images/items/silk_robe.png",
      "description": "+45 maxHp, +6 resistance, +10 magicPower"
    },
    {
      "id": "plate_armor",
      "name": "Plate Armor",
      "slot": "armor",
      "rarity": "rare",
      "price": {
        "gold": 210,
        "wood": 35
      },
      "stats": {
        "maxHp": 110,
        "resistance": 18
      },
      "image": "/images/items/plate_armor.png",
      "description": "+110 maxHp, +18 resistance"
    },
    {
      "id": "shadow_garb",
      "name": "Shadow Garb",
      "slot": "armor",
      "rarity": "rare",
      "price": {
        "gold": 210,
        "wood": 35
      },
      "stats": {
        "maxHp": 85,
        "resistance": 14,
        "speed": 1
      },
      "image": "/images/items/shadow_garb.png",
      "description": "+85 maxHp, +14 resistance, +1 speed"
    },
    {
      "id": "dragon_scale",
      "name": "Dragon Scale",
      "slot": "armor",
      "rarity": "epic",
      "price": {
        "gold": 420,
        "wood": 60
      },
      "stats": {
        "maxHp": 150,
        "resistance": 26,
        "attack": 6
      },
      "image": "/images/items/dragon_scale.png",
      "description": "+150 maxHp, +26 resistance, +6 attack"
    },
    {
      "id": "void_plate",
      "name": "Void Plate",
      "slot": "armor",
      "rarity": "mythic",
      "price": {
        "gold": 950,
        "wood": 130
      },
      "stats": {
        "maxHp": 200,
        "resistance": 35,
        "magicPower": 10
      },
      "image": "/images/items/void_plate.png",
      "description": "+200 maxHp, +35 resistance, +10 magicPower"
    },
    {
      "id": "leather_greaves",
      "name": "Leather Greaves",
      "slot": "legs",
      "rarity": "common",
      "price": {
        "gold": 45,
        "wood": 10
      },
      "stats": {
        "maxHp": 40,
        "resistance": 6
      },
      "image": "/images/items/leather_greaves.png",
      "description": "+40 maxHp, +6 resistance"
    },
    {
      "id": "iron_greaves",
      "name": "Iron Greaves",
      "slot": "legs",
      "rarity": "common",
      "price": {
        "gold": 45,
        "wood": 10
      },
      "stats": {
        "maxHp": 50,
        "resistance": 8
      },
      "image": "/images/items/iron_greaves.png",
      "description": "+50 maxHp, +8 resistance"
    },
    {
      "id": "swift_leggings",
      "name": "Swift Leggings",
      "slot": "legs",
      "rarity": "uncommon",
      "price": {
        "gold": 100,
        "wood": 18
      },
      "stats": {
        "maxHp": 45,
        "resistance": 7,
        "speed": 1
      },
      "image": "/images/items/swift_leggings.png",
      "description": "+45 maxHp, +7 resistance, +1 speed"
    },
    {
      "id": "sage_pants",
      "name": "Sage Pants",
      "slot": "legs",
      "rarity": "uncommon",
      "price": {
        "gold": 100,
        "wood": 18
      },
      "stats": {
        "maxHp": 35,
        "magicPower": 9,
        "mana": 10
      },
      "image": "/images/items/sage_pants.png",
      "description": "+35 maxHp, +9 magicPower, +10 mana"
    },
    {
      "id": "knight_leggings",
      "name": "Knight Leggings",
      "slot": "legs",
      "rarity": "rare",
      "price": {
        "gold": 190,
        "wood": 30
      },
      "stats": {
        "maxHp": 80,
        "resistance": 14
      },
      "image": "/images/items/knight_leggings.png",
      "description": "+80 maxHp, +14 resistance"
    },
    {
      "id": "shadow_leggings",
      "name": "Shadow Leggings",
      "slot": "legs",
      "rarity": "rare",
      "price": {
        "gold": 190,
        "wood": 30
      },
      "stats": {
        "maxHp": 65,
        "resistance": 11,
        "speed": 1
      },
      "image": "/images/items/shadow_leggings.png",
      "description": "+65 maxHp, +11 resistance, +1 speed"
    },
    {
      "id": "dragon_leggings",
      "name": "Dragon Leggings",
      "slot": "legs",
      "rarity": "epic",
      "price": {
        "gold": 380,
        "wood": 55
      },
      "stats": {
        "maxHp": 120,
        "resistance": 22,
        "attack": 4
      },
      "image": "/images/items/dragon_leggings.png",
      "description": "+120 maxHp, +22 resistance, +4 attack"
    },
    {
      "id": "void_leggings",
      "name": "Void Leggings",
      "slot": "legs",
      "rarity": "legendary",
      "price": {
        "gold": 600,
        "wood": 85
      },
      "stats": {
        "maxHp": 160,
        "resistance": 28,
        "magicPower": 10
      },
      "image": "/images/items/void_leggings.png",
      "description": "+160 maxHp, +28 resistance, +10 magicPower"
    },
    {
      "id": "worn_boots",
      "name": "Worn Boots",
      "slot": "boots",
      "rarity": "common",
      "price": {
        "gold": 30,
        "wood": 8
      },
      "stats": {
        "speed": 1
      },
      "image": "/images/items/worn_boots.png",
      "description": "+1 speed"
    },
    {
      "id": "iron_boots",
      "name": "Iron Boots",
      "slot": "boots",
      "rarity": "common",
      "price": {
        "gold": 30,
        "wood": 8
      },
      "stats": {
        "maxHp": 20,
        "resistance": 4,
        "speed": 1
      },
      "image": "/images/items/iron_boots.png",
      "description": "+20 maxHp, +4 resistance, +1 speed"
    },
    {
      "id": "ranger_boots",
      "name": "Ranger Boots",
      "slot": "boots",
      "rarity": "uncommon",
      "price": {
        "gold": 70,
        "wood": 12
      },
      "stats": {
        "speed": 2
      },
      "image": "/images/items/ranger_boots.png",
      "description": "+2 speed"
    },
    {
      "id": "sorcery_boots",
      "name": "Sorcery Boots",
      "slot": "boots",
      "rarity": "uncommon",
      "price": {
        "gold": 70,
        "wood": 12
      },
      "stats": {
        "mana": 12,
        "magicPower": 6
      },
      "image": "/images/items/sorcery_boots.png",
      "description": "+12 mana, +6 magicPower"
    },
    {
      "id": "knight_boots",
      "name": "Knight Boots",
      "slot": "boots",
      "rarity": "rare",
      "price": {
        "gold": 140,
        "wood": 22
      },
      "stats": {
        "maxHp": 40,
        "resistance": 8,
        "speed": 1
      },
      "image": "/images/items/knight_boots.png",
      "description": "+40 maxHp, +8 resistance, +1 speed"
    },
    {
      "id": "void_boots",
      "name": "Void Boots",
      "slot": "boots",
      "rarity": "epic",
      "price": {
        "gold": 300,
        "wood": 40
      },
      "stats": {
        "maxHp": 60,
        "resistance": 12,
        "speed": 2
      },
      "image": "/images/items/void_boots.png",
      "description": "+60 maxHp, +12 resistance, +2 speed"
    },
    {
      "id": "copper_amulet",
      "name": "Copper Amulet",
      "slot": "amulet",
      "rarity": "common",
      "price": {
        "gold": 45,
        "wood": 10
      },
      "stats": {
        "mana": 8,
        "magicPower": 4
      },
      "image": "/images/items/copper_amulet.png",
      "description": "+8 mana, +4 magicPower"
    },
    {
      "id": "silver_amulet",
      "name": "Silver Amulet",
      "slot": "amulet",
      "rarity": "uncommon",
      "price": {
        "gold": 100,
        "wood": 18
      },
      "stats": {
        "mana": 14,
        "magicPower": 7
      },
      "image": "/images/items/silver_amulet.png",
      "description": "+14 mana, +7 magicPower"
    },
    {
      "id": "ruby_amulet",
      "name": "Ruby Amulet",
      "slot": "amulet",
      "rarity": "rare",
      "price": {
        "gold": 200,
        "wood": 30
      },
      "stats": {
        "mana": 20,
        "magicPower": 12,
        "healPower": 4
      },
      "image": "/images/items/ruby_amulet.png",
      "description": "+20 mana, +12 magicPower, +4 healPower"
    },
    {
      "id": "sapphire_amulet",
      "name": "Sapphire Amulet",
      "slot": "amulet",
      "rarity": "epic",
      "price": {
        "gold": 380,
        "wood": 50
      },
      "stats": {
        "mana": 30,
        "magicPower": 18,
        "manaRegen": 2
      },
      "image": "/images/items/sapphire_amulet.png",
      "description": "+30 mana, +18 magicPower, +2 manaRegen"
    },
    {
      "id": "void_amulet",
      "name": "Void Amulet",
      "slot": "amulet",
      "rarity": "legendary",
      "price": {
        "gold": 600,
        "wood": 80
      },
      "stats": {
        "mana": 40,
        "magicPower": 24,
        "healPower": 8
      },
      "image": "/images/items/void_amulet.png",
      "description": "+40 mana, +24 magicPower, +8 healPower"
    },
    {
      "id": "copper_ring",
      "name": "Copper Ring",
      "slot": "ring",
      "rarity": "common",
      "price": {
        "gold": 40,
        "wood": 8
      },
      "stats": {
        "attack": 3
      },
      "image": "/images/items/copper_ring.png",
      "description": "+3 attack"
    },
    {
      "id": "silver_ring",
      "name": "Silver Ring",
      "slot": "ring",
      "rarity": "uncommon",
      "price": {
        "gold": 90,
        "wood": 15
      },
      "stats": {
        "attack": 5,
        "mana": 8
      },
      "image": "/images/items/silver_ring.png",
      "description": "+5 attack, +8 mana"
    },
    {
      "id": "ruby_ring",
      "name": "Ruby Ring",
      "slot": "ring",
      "rarity": "rare",
      "price": {
        "gold": 180,
        "wood": 25
      },
      "stats": {
        "attack": 8,
        "critChance": 5
      },
      "image": "/images/items/ruby_ring.png",
      "description": "+8 attack, +5 critChance"
    },
    {
      "id": "sapphire_ring",
      "name": "Sapphire Ring",
      "slot": "ring",
      "rarity": "epic",
      "price": {
        "gold": 350,
        "wood": 45
      },
      "stats": {
        "attack": 12,
        "magicPower": 10,
        "critChance": 7
      },
      "image": "/images/items/sapphire_ring.png",
      "description": "+12 attack, +10 magicPower, +7 critChance"
    },
    {
      "id": "void_ring",
      "name": "Void Ring",
      "slot": "ring",
      "rarity": "legendary",
      "price": {
        "gold": 580,
        "wood": 75
      },
      "stats": {
        "attack": 16,
        "magicPower": 14,
        "critDamage": 15
      },
      "image": "/images/items/void_ring.png",
      "description": "+16 attack, +14 magicPower, +15 critDamage"
    },
    {
      "id": "the_essence_of_life",
      "name": "The Essence of Life",
      "slot": "material",
      "rarity": "epic",
      "price": {
        "gold": 0,
        "wood": 0
      },
      "image": "/images/items/essence_of_life.png",
      "description": "A rare essence that can revive a fallen ally at the Ancient Temple."
    },
    {
      "id": "tome_ember",
      "name": "Tome of Ember",
      "slot": "book",
      "rarity": "uncommon",
      "price": {
        "gold": 110,
        "wood": 18
      },
      "stats": {
        "magicPower": 12,
        "healPower": 2
      },
      "image": "/images/items/tome_ember.png",
      "description": "+12 Magic Power, +2 Heal Power. For mages."
    },
    {
      "id": "tome_frost",
      "name": "Tome of Frost",
      "slot": "book",
      "rarity": "rare",
      "price": {
        "gold": 180,
        "wood": 30
      },
      "stats": {
        "magicPower": 14,
        "mana": 12
      },
      "image": "/images/items/tome_frost.png",
      "description": "+14 Magic Power, +12 Mana."
    },
    {
      "id": "tome_shadow",
      "name": "Tome of Shadows",
      "slot": "book",
      "rarity": "rare",
      "price": {
        "gold": 190,
        "wood": 32
      },
      "stats": {
        "magicPower": 10,
        "mana": 8,
        "omnivamp": 3
      },
      "image": "/images/items/tome_shadow.png",
      "description": "+10 Magic Power, +3% Omnivamp."
    },
    {
      "id": "tome_light",
      "name": "Tome of Light",
      "slot": "book",
      "rarity": "epic",
      "price": {
        "gold": 320,
        "wood": 50
      },
      "stats": {
        "magicPower": 16,
        "healPower": 6,
        "mana": 10
      },
      "image": "/images/items/tome_light.png",
      "description": "+16 Magic Power, +6 Heal, +10 Mana."
    },
    {
      "id": "tome_void",
      "name": "Tome of Void",
      "slot": "book",
      "rarity": "legendary",
      "price": {
        "gold": 550,
        "wood": 80
      },
      "stats": {
        "magicPower": 22,
        "manaRegen": 2
      },
      "image": "/images/items/tome_void.png",
      "description": "+22 Magic Power, +2 Mana Regen."
    },
    {
      "id": "stone_blood",
      "name": "The Stone of Blood",
      "slot": "stone",
      "rarity": "legendary",
      "price": {
        "gold": 0,
        "wood": 0
      },
      "stats": {
        "omnivamp": 10
      },
      "image": "/images/items/stone_blood.png",
      "craftOnly": true,
      "description": "+10% Omnivamp. Heals 10% of all damage dealt. (Craftable)"
    },
    {
      "id": "stone_frost",
      "name": "Stone of Frost",
      "slot": "stone",
      "rarity": "mythic",
      "price": {
        "gold": 0,
        "wood": 0
      },
      "stats": {
        "omnivamp": 8,
        "resistance": 10
      },
      "image": "/images/items/stone_frost.png",
      "description": "+8% Omnivamp, +10 Resistance."
    },
    {
      "id": "stone_shadow",
      "name": "Stone of Shadows",
      "slot": "stone",
      "rarity": "mythic",
      "price": {
        "gold": 0,
        "wood": 0
      },
      "stats": {
        "omnivamp": 12
      },
      "image": "/images/items/stone_shadow.png",
      "description": "+12% Omnivamp."
    },
    {
      "id": "stone_arcane",
      "name": "Stone of Arcane",
      "slot": "stone",
      "rarity": "legendary",
      "price": {
        "gold": 0,
        "wood": 0
      },
      "stats": {
        "omnivamp": 6,
        "magicPower": 15
      },
      "image": "/images/items/stone_arcane.png",
      "description": "+6% Omnivamp, +15 Magic Power."
    },
    {
      "id": "stone_earth",
      "name": "Stone of Earth",
      "slot": "stone",
      "rarity": "legendary",
      "price": {
        "gold": 0,
        "wood": 0
      },
      "stats": {
        "omnivamp": 7,
        "maxHp": 50
      },
      "image": "/images/items/stone_earth.png",
      "description": "+7% Omnivamp, +50 Max HP."
    },
    {
      "id": "vampiric_ring",
      "name": "Vampiric Ring",
      "slot": "ring",
      "rarity": "rare",
      "price": {
        "gold": 220,
        "wood": 30
      },
      "stats": {
        "omnivamp": 5,
        "attack": 4
      },
      "image": "/images/items/vampiric_ring.png",
      "description": "+5% Omnivamp, +4 Attack."
    },
    {
      "id": "crimson_blade",
      "name": "Crimson Blade",
      "slot": "weapon",
      "rarity": "epic",
      "price": {
        "gold": 420,
        "wood": 60
      },
      "stats": {
        "attack": 24,
        "omnivamp": 4
      },
      "image": "/images/items/crimson_blade.png",
      "description": "+24 Attack, +4% Omnivamp."
    },
    {
      "id": "glacial_helm",
      "name": "Glacial Helm",
      "slot": "head",
      "rarity": "rare",
      "price": {
        "gold": 160,
        "wood": 28
      },
      "stats": {
        "maxHp": 60,
        "resistance": 10,
        "magicPower": 6
      },
      "image": "/images/items/glacial_helm.png",
      "description": "+60 HP, +10 Res, +6 Mgc."
    },
    {
      "id": "ember_plate",
      "name": "Ember Plate",
      "slot": "armor",
      "rarity": "epic",
      "price": {
        "gold": 380,
        "wood": 55
      },
      "stats": {
        "maxHp": 130,
        "resistance": 20,
        "attack": 5
      },
      "image": "/images/items/ember_plate.png",
      "description": "+130 HP, +20 Res, +5 Atk."
    },
    {
      "id": "boss_weapon_ember",
      "name": "Ember King's Blade",
      "slot": "weapon",
      "rarity": "epic",
      "price": {
        "gold": 0,
        "wood": 0
      },
      "stats": {
        "attack": 32,
        "critChance": 5
      },
      "image": "/images/items/boss_weapon_ember.png",
      "bossWeapon": true,
      "description": "Ember King's blade - only drops from Ember King (50%)."
    },
    {
      "id": "boss_weapon_frost",
      "name": "Frost Titan's Axe",
      "slot": "weapon",
      "rarity": "epic",
      "price": {
        "gold": 0,
        "wood": 0
      },
      "stats": {
        "attack": 36,
        "resistance": 8
      },
      "image": "/images/items/boss_weapon_frost.png",
      "bossWeapon": true,
      "description": "Frost Titan's axe - only drops from Frost Titan (50%)."
    },
    {
      "id": "boss_weapon_void",
      "name": "Void Herald's Scythe",
      "slot": "weapon",
      "rarity": "legendary",
      "price": {
        "gold": 0,
        "wood": 0
      },
      "stats": {
        "attack": 40,
        "omnivamp": 4
      },
      "image": "/images/items/boss_weapon_void.png",
      "bossWeapon": true,
      "description": "Void Herald's scythe - only drops from Void Herald (50%)."
    },
    {
      "id": "boss_weapon_storm",
      "name": "Storm Colossus Hammer",
      "slot": "weapon",
      "rarity": "legendary",
      "price": {
        "gold": 0,
        "wood": 0
      },
      "stats": {
        "attack": 44,
        "speed": 1
      },
      "image": "/images/items/boss_weapon_storm.png",
      "bossWeapon": true,
      "description": "Storm Colossus hammer - only drops from Storm Colossus (50%)."
    },
    {
      "id": "boss_weapon_world",
      "name": "World Eater Fang",
      "slot": "weapon",
      "rarity": "mythic",
      "price": {
        "gold": 0,
        "wood": 0
      },
      "stats": {
        "attack": 48,
        "critDamage": 15
      },
      "image": "/images/items/boss_weapon_world.png",
      "bossWeapon": true,
      "description": "World Eater's fang - only drops from World Eater (50%)."
    },
    {
      "id": "boss_chest_ember",
      "name": "Ember Chest",
      "slot": "chest",
      "rarity": "epic",
      "price": {
        "gold": 0,
        "wood": 0
      },
      "image": "/images/items/boss_chest_ember.png",
      "chestTier": "a",
      "description": "Ember King's chest - rare+ guaranteed."
    },
    {
      "id": "boss_chest_frost",
      "name": "Frost Chest",
      "slot": "chest",
      "rarity": "epic",
      "price": {
        "gold": 0,
        "wood": 0
      },
      "image": "/images/items/boss_chest_frost.png",
      "chestTier": "s",
      "description": "Frost Titan's chest - rare+ guaranteed."
    },
    {
      "id": "boss_chest_void",
      "name": "Void Chest",
      "slot": "chest",
      "rarity": "legendary",
      "price": {
        "gold": 0,
        "wood": 0
      },
      "image": "/images/items/boss_chest_void.png",
      "chestTier": "s",
      "description": "Void Herald's chest - epic+ guaranteed."
    },
    {
      "id": "boss_chest_storm",
      "name": "Storm Chest",
      "slot": "chest",
      "rarity": "legendary",
      "price": {
        "gold": 0,
        "wood": 0
      },
      "image": "/images/items/boss_chest_storm.png",
      "chestTier": "ss",
      "description": "Storm Colossus chest - epic+ guaranteed."
    },
    {
      "id": "boss_chest_world",
      "name": "World Chest",
      "slot": "chest",
      "rarity": "mythic",
      "price": {
        "gold": 0,
        "wood": 0
      },
      "image": "/images/items/boss_chest_world.png",
      "chestTier": "ss",
      "description": "World Eater's chest - legendary+ guaranteed."
    },
    {
      "id": "mythic_chest",
      "name": "Mythic Chest",
      "slot": "chest",
      "rarity": "mythic",
      "price": {
        "gold": 0,
        "wood": 0
      },
      "chestTier": "s",
      "image": "",
      "description": "A chest of legend. Great odds of mythic loot."
    },
    {
      "id": "sturdy_club",
      "name": "Sturdy Club",
      "rarity": "common",
      "slot": "weapon",
      "stats": {
        "attack": 11
      },
      "description": "A dependable oaken club.",
      "value": 25,
      "image": "/images/items/sturdy_club.png"
    },
    {
      "id": "cloth_cap",
      "name": "Cloth Cap",
      "rarity": "common",
      "slot": "head",
      "stats": {
        "maxHp": 35
      },
      "description": "Stitched cloth, better than nothing.",
      "value": 22,
      "image": "/images/items/cloth_cap.png"
    },
    {
      "id": "bone_ring",
      "name": "Bone Ring",
      "rarity": "common",
      "slot": "ring",
      "stats": {
        "resistance": 6
      },
      "description": "Carved from a dire wolf fang.",
      "value": 24,
      "image": "/images/items/bone_ring.png"
    },
    {
      "id": "travel_boots",
      "name": "Travel Boots",
      "rarity": "common",
      "slot": "boots",
      "stats": {
        "maxHp": 25,
        "speed": 1
      },
      "description": "Worn soles, swift steps.",
      "value": 26,
      "image": "/images/items/travel_boots.png"
    },
    {
      "id": "hunter_axe",
      "name": "Hunter Axe",
      "rarity": "uncommon",
      "slot": "weapon",
      "stats": {
        "attack": 17
      },
      "description": "A woodsman's heavy axe.",
      "value": 70,
      "image": "/images/items/hunter_axe.png"
    },
    {
      "id": "wolf_helm",
      "name": "Wolf Helm",
      "rarity": "uncommon",
      "slot": "head",
      "stats": {
        "maxHp": 60,
        "resistance": 6
      },
      "description": "Fashioned from an alpha pelt.",
      "value": 65,
      "image": "/images/items/wolf_helm.png"
    },
    {
      "id": "boar_hide_armor",
      "name": "Boar Hide Armor",
      "rarity": "uncommon",
      "slot": "armor",
      "stats": {
        "maxHp": 80,
        "resistance": 8
      },
      "description": "Thick, musky, tough.",
      "value": 75,
      "image": "/images/items/boar_hide_armor.png"
    },
    {
      "id": "swift_greaves",
      "name": "Swift Greaves",
      "rarity": "uncommon",
      "slot": "legs",
      "stats": {
        "resistance": 6,
        "speed": 1
      },
      "description": "Light plates for fast feet.",
      "value": 68,
      "image": "/images/items/swift_greaves.png"
    },
    {
      "id": "ember_boots",
      "name": "Ember Boots",
      "rarity": "uncommon",
      "slot": "boots",
      "stats": {
        "maxHp": 50,
        "resistance": 8
      },
      "description": "Still warm from the forge.",
      "value": 72,
      "image": "/images/items/ember_boots.png"
    },
    {
      "id": "moon_amulet",
      "name": "Moon Amulet",
      "rarity": "uncommon",
      "slot": "amulet",
      "stats": {
        "mana": 25
      },
      "description": "Drinks in moonlight.",
      "value": 70,
      "image": "/images/items/moon_amulet.png"
    },
    {
      "id": "serpent_ring",
      "name": "Serpent Ring",
      "rarity": "uncommon",
      "slot": "ring",
      "stats": {
        "attack": 6
      },
      "description": "A coiled silver serpent.",
      "value": 66,
      "image": "/images/items/serpent_ring.png"
    },
    {
      "id": "oak_staff",
      "name": "Oak Staff",
      "rarity": "uncommon",
      "slot": "weapon",
      "stats": {
        "magicPower": 18
      },
      "description": "Heartwood humming with mana.",
      "value": 74,
      "image": "/images/items/oak_staff.png"
    },
    {
      "id": "frostbrand_axe",
      "name": "Frostbrand Axe",
      "rarity": "rare",
      "slot": "weapon",
      "stats": {
        "attack": 24
      },
      "description": "Its edge never thaws.",
      "value": 200,
      "image": "/images/items/frostbrand_axe.png"
    },
    {
      "id": "sentinel_helm",
      "name": "Sentinel Helm",
      "rarity": "rare",
      "slot": "head",
      "stats": {
        "maxHp": 95,
        "resistance": 12
      },
      "description": "Stood a hundred sieges.",
      "value": 185,
      "image": "/images/items/sentinel_helm.png"
    },
    {
      "id": "shadowplate",
      "name": "Shadowplate",
      "rarity": "rare",
      "slot": "armor",
      "stats": {
        "maxHp": 110,
        "resistance": 14
      },
      "description": "Forged in eclipse dark.",
      "value": 210,
      "image": "/images/items/shadowplate.png"
    },
    {
      "id": "storm_leggings",
      "name": "Storm Leggings",
      "rarity": "rare",
      "slot": "legs",
      "stats": {
        "resistance": 10,
        "speed": 2
      },
      "description": "Crackling with static.",
      "value": 190,
      "image": "/images/items/storm_leggings.png"
    },
    {
      "id": "thunder_amulet",
      "name": "Thunder Amulet",
      "rarity": "rare",
      "slot": "amulet",
      "stats": {
        "attack": 10
      },
      "description": "A bottled thunderstorm.",
      "value": 195,
      "image": "/images/items/thunder_amulet.png"
    },
    {
      "id": "warden_ring",
      "name": "Warden Ring",
      "rarity": "rare",
      "slot": "ring",
      "stats": {
        "resistance": 14,
        "maxHp": 40
      },
      "description": "Oath-bound silver.",
      "value": 188,
      "image": "/images/items/warden_ring.png"
    },
    {
      "id": "runed_bow",
      "name": "Runed Bow",
      "rarity": "rare",
      "slot": "weapon",
      "stats": {
        "attack": 22,
        "speed": 1
      },
      "description": "Runes guide every shaft.",
      "value": 205,
      "image": "/images/items/runed_bow.png"
    },
    {
      "id": "void_reaver",
      "name": "Void Reaver",
      "rarity": "epic",
      "slot": "weapon",
      "stats": {
        "attack": 34
      },
      "description": "It hungers between swings.",
      "value": 500,
      "image": "/images/items/void_reaver.png"
    },
    {
      "id": "aegis_armor",
      "name": "Aegis Armor",
      "rarity": "epic",
      "slot": "armor",
      "stats": {
        "maxHp": 150,
        "resistance": 18
      },
      "description": "A wall you can wear.",
      "value": 520,
      "image": "/images/items/aegis_armor.png"
    },
    {
      "id": "archon_crown",
      "name": "Archon Crown",
      "rarity": "epic",
      "slot": "head",
      "stats": {
        "magicPower": 30,
        "mana": 40
      },
      "description": "Worn by sky-tyrants.",
      "value": 510,
      "image": "/images/items/archon_crown.png"
    },
    {
      "id": "stormcaller_staff",
      "name": "Stormcaller Staff",
      "rarity": "epic",
      "slot": "weapon",
      "stats": {
        "magicPower": 38
      },
      "description": "Points at clouds; clouds obey.",
      "value": 530,
      "image": "/images/items/stormcaller_staff.png"
    },
    {
      "id": "kingsfall_blade",
      "name": "Kingsfall Blade",
      "rarity": "legendary",
      "slot": "weapon",
      "stats": {
        "attack": 48
      },
      "description": "Ended a dynasty.",
      "value": 1200,
      "image": "/images/items/kingsfall_blade.png"
    },
    {
      "id": "titanward_plate",
      "name": "Titanward Plate",
      "rarity": "legendary",
      "slot": "armor",
      "stats": {
        "maxHp": 220,
        "resistance": 24
      },
      "description": "Titan-forged bulwark.",
      "value": 1250,
      "image": "/images/items/titanward_plate.png"
    },
    {
      "id": "worldsplitter_axe",
      "name": "Worldsplitter Axe",
      "rarity": "mythic",
      "slot": "weapon",
      "stats": {
        "attack": 62
      },
      "description": "The ground remembers it.",
      "value": 2500,
      "image": "/images/items/worldsplitter_axe.png"
    },
    {
      "id": "slime_bottle",
      "name": "Bottle of Slime",
      "rarity": "common",
      "slot": "material",
      "description": "A jiggling bottle of fresh slime.",
      "image": "/images/items/slime_bottle.png",
      "value": 6
    },
    {
      "id": "wolf_fang",
      "name": "Wolf Fang",
      "rarity": "common",
      "slot": "material",
      "description": "A sharp fang, still warm.",
      "image": "/images/items/wolf_fang.png",
      "value": 6
    },
    {
      "id": "bat_wing",
      "name": "Cave Bat Wing",
      "rarity": "common",
      "slot": "material",
      "description": "Leathery and light.",
      "image": "/images/items/bat_wing.png",
      "value": 5
    },
    {
      "id": "spider_silk",
      "name": "Ash Spider Silk",
      "rarity": "common",
      "slot": "material",
      "description": "Stronger than it looks.",
      "image": "/images/items/spider_silk.png",
      "value": 7
    },
    {
      "id": "tough_hide",
      "name": "Tough Hide",
      "rarity": "uncommon",
      "slot": "material",
      "description": "Thick hide of a hardy beast.",
      "image": "/images/items/tough_hide.png",
      "value": 15
    },
    {
      "id": "skeleton_bone",
      "name": "Old Bone",
      "rarity": "uncommon",
      "slot": "material",
      "description": "Dense with old malice.",
      "image": "/images/items/skeleton_bone.png",
      "value": 14
    },
    {
      "id": "orc_tusk",
      "name": "Orc Tusk",
      "rarity": "uncommon",
      "slot": "material",
      "description": "A trophy with an edge.",
      "image": "/images/items/orc_tusk.png",
      "value": 16
    },
    {
      "id": "harpy_feather",
      "name": "Storm Harpy Feather",
      "rarity": "uncommon",
      "slot": "material",
      "description": "Crackles faintly.",
      "image": "/images/items/harpy_feather.png",
      "value": 18
    },
    {
      "id": "golem_fragment",
      "name": "Golem Fragment",
      "rarity": "rare",
      "slot": "material",
      "description": "A chip of living stone.",
      "image": "/images/items/golem_fragment.png",
      "value": 50
    },
    {
      "id": "wraith_wisp",
      "name": "Wraith Wisp",
      "rarity": "rare",
      "slot": "material",
      "description": "Cold light in a jar.",
      "image": "/images/items/wraith_wisp.png",
      "value": 55
    },
    {
      "id": "treant_bark",
      "name": "Elder Treant Bark",
      "rarity": "rare",
      "slot": "material",
      "description": "Bark that slowly regrows.",
      "image": "/images/items/treant_bark.png",
      "value": 48
    },
    {
      "id": "hydra_scale",
      "name": "Hydra Scale",
      "rarity": "epic",
      "slot": "material",
      "description": "It shimmers with regrowth.",
      "image": "/images/items/hydra_scale.png",
      "value": 150
    },
    {
      "id": "minor_salve",
      "name": "Minor Salve",
      "rarity": "common",
      "slot": "consumable",
      "description": "Heals small wounds.",
      "image": "/images/items/minor_salve.png",
      "heal": 25,
      "value": 10
    },
    {
      "id": "wolf_jerky",
      "name": "Wolf Jerky",
      "rarity": "common",
      "slot": "consumable",
      "description": "Chewy trail food.",
      "image": "/images/items/wolf_jerky.png",
      "heal": 15,
      "food": 1,
      "value": 8
    },
    {
      "id": "mushroom_stew",
      "name": "Mushroom Stew",
      "rarity": "uncommon",
      "slot": "consumable",
      "description": "A hearty dungeon stew.",
      "image": "/images/items/mushroom_stew.png",
      "heal": 45,
      "food": 1,
      "value": 20
    },
    {
      "id": "frost_berry",
      "name": "Frost Berry",
      "rarity": "uncommon",
      "slot": "consumable",
      "description": "Numbing and sweet.",
      "image": "/images/items/frost_berry.png",
      "heal": 30,
      "value": 12
    },
    {
      "id": "ember_pepper",
      "name": "Ember Pepper",
      "rarity": "uncommon",
      "slot": "consumable",
      "description": "Burns going down.",
      "image": "/images/items/ember_pepper.png",
      "heal": 20,
      "food": 2,
      "value": 10
    },
    {
      "id": "troll_draught",
      "name": "Troll Draught",
      "rarity": "rare",
      "slot": "consumable",
      "description": "Regrows more than courage.",
      "image": "/images/items/troll_draught.png",
      "heal": 90,
      "value": 45
    },
    {
      "id": "skyshard_omelet",
      "name": "Skyshard Omelet",
      "rarity": "rare",
      "slot": "consumable",
      "description": "Storm-harpy eggs, fried.",
      "image": "/images/items/skyshard_omelet.png",
      "heal": 60,
      "food": 2,
      "value": 35
    },
    {
      "id": "elixir_of_dawn",
      "name": "Elixir of Dawn",
      "rarity": "epic",
      "slot": "consumable",
      "description": "First light, bottled.",
      "image": "/images/items/elixir_of_dawn.png",
      "heal": 150,
      "value": 90
    },
    {
      "id": "sword_blueprint",
      "name": "Sword Blueprint",
      "rarity": "uncommon",
      "slot": "material",
      "description": "Reusable weapon pattern.",
      "image": "/images/items/sword_blueprint.png",
      "blueprint": true,
      "price": {
        "gold": 300,
        "wood": 0
      }
    },
    {
      "id": "armor_blueprint",
      "name": "Armor Blueprint",
      "rarity": "uncommon",
      "slot": "material",
      "description": "Reusable armor pattern.",
      "image": "/images/items/armor_blueprint.png",
      "blueprint": true,
      "price": {
        "gold": 450,
        "wood": 0
      }
    },
    {
      "id": "staff_blueprint",
      "name": "Staff Blueprint",
      "rarity": "rare",
      "slot": "material",
      "description": "Reusable staff pattern.",
      "image": "/images/items/staff_blueprint.png",
      "blueprint": true,
      "price": {
        "gold": 600,
        "wood": 0
      }
    },
    {
      "id": "sage_circlet",
      "name": "Sage Circlet",
      "rarity": "uncommon",
      "slot": "head",
      "value": 64,
      "stats": {
        "magicPower": 12,
        "mana": 15
      },
      "description": "For quiet, clever minds.",
      "image": "/images/items/sage_circlet.png"
    }
  ],
  "equipmentSlots": [
    {
      "id": "head",
      "label": "Helmet"
    },
    {
      "id": "armor",
      "label": "Armor"
    },
    {
      "id": "legs",
      "label": "Pants"
    },
    {
      "id": "boots",
      "label": "Boots"
    },
    {
      "id": "weapon",
      "label": "Weapon"
    },
    {
      "id": "amulet",
      "label": "Amulet"
    },
    {
      "id": "ring1",
      "label": "Ring 1",
      "ring": true
    },
    {
      "id": "ring2",
      "label": "Ring 2",
      "ring": true
    },
    {
      "id": "book",
      "label": "Book"
    },
    {
      "id": "stone",
      "label": "Stone"
    }
  ],
  "monsters": [
    {
      "id": "slime",
      "name": "Slime",
      "hp": 40,
      "attack": 10,
      "speed": 4,
      "rarity": "common",
      "element": "physical",
      "image": "/images/monsters/slime.png"
    },
    {
      "id": "goblin",
      "name": "Goblin",
      "hp": 60,
      "attack": 14,
      "speed": 8,
      "rarity": "common",
      "element": "physical",
      "image": "/images/monsters/goblin.png"
    },
    {
      "id": "giant_rat",
      "name": "Giant Rat",
      "hp": 45,
      "attack": 12,
      "speed": 9,
      "rarity": "common",
      "element": "physical",
      "image": "/images/monsters/giant_rat.png"
    },
    {
      "id": "cave_bat",
      "name": "Cave Bat",
      "hp": 35,
      "attack": 11,
      "speed": 14,
      "rarity": "common",
      "element": "physical",
      "image": "/images/monsters/cave_bat.png"
    },
    {
      "id": "wolf",
      "name": "Wolf",
      "hp": 70,
      "attack": 15,
      "speed": 11,
      "rarity": "common",
      "element": "physical",
      "image": "/images/monsters/wolf.png"
    },
    {
      "id": "bandit",
      "name": "Bandit",
      "hp": 65,
      "attack": 16,
      "speed": 9,
      "rarity": "common",
      "element": "physical",
      "image": "/images/monsters/bandit.png"
    },
    {
      "id": "spider",
      "name": "Spider",
      "hp": 50,
      "attack": 13,
      "speed": 10,
      "rarity": "common",
      "element": "shadow",
      "image": "/images/monsters/spider.png"
    },
    {
      "id": "wild_boar",
      "name": "Wild Boar",
      "hp": 80,
      "attack": 17,
      "speed": 7,
      "rarity": "common",
      "element": "physical",
      "image": "/images/monsters/wild_boar.png"
    },
    {
      "id": "goblin_archer",
      "name": "Goblin Archer",
      "hp": 55,
      "attack": 16,
      "speed": 10,
      "rarity": "common",
      "element": "physical",
      "image": "/images/monsters/goblin_archer.png"
    },
    {
      "id": "rat_king",
      "name": "Rat King",
      "hp": 90,
      "attack": 14,
      "speed": 12,
      "rarity": "common",
      "element": "physical",
      "image": "/images/monsters/rat_king.png"
    },
    {
      "id": "grove_sprite",
      "name": "Grove Sprite",
      "hp": 80,
      "attack": 12,
      "speed": 10,
      "rarity": "uncommon",
      "element": "arcane",
      "image": "/images/monsters/grove_sprite.png"
    },
    {
      "id": "goblin_warrior",
      "name": "Goblin Warrior",
      "hp": 100,
      "attack": 19,
      "speed": 8,
      "rarity": "uncommon",
      "element": "physical",
      "image": "/images/monsters/goblin_warrior.png"
    },
    {
      "id": "skeleton",
      "name": "Skeleton",
      "hp": 95,
      "attack": 20,
      "speed": 7,
      "rarity": "uncommon",
      "element": "shadow",
      "image": "/images/monsters/skeleton.png"
    },
    {
      "id": "dire_wolf",
      "name": "Dire Wolf",
      "hp": 110,
      "attack": 21,
      "speed": 12,
      "rarity": "uncommon",
      "element": "physical",
      "image": "/images/monsters/dire_wolf.png"
    },
    {
      "id": "harpy",
      "name": "Harpy",
      "hp": 85,
      "attack": 18,
      "speed": 15,
      "rarity": "uncommon",
      "element": "physical",
      "image": "/images/monsters/harpy.png"
    },
    {
      "id": "orc",
      "name": "Orc",
      "hp": 140,
      "attack": 22,
      "speed": 6,
      "rarity": "uncommon",
      "element": "physical",
      "image": "/images/monsters/orc.png"
    },
    {
      "id": "thorn_viper",
      "name": "Thorn Viper",
      "hp": 75,
      "attack": 19,
      "speed": 13,
      "rarity": "uncommon",
      "element": "shadow",
      "image": "/images/monsters/thorn_viper.png"
    },
    {
      "id": "swamp_troll",
      "name": "Swamp Troll",
      "hp": 160,
      "attack": 20,
      "speed": 4,
      "rarity": "uncommon",
      "element": "physical",
      "image": "/images/monsters/swamp_troll.png"
    },
    {
      "id": "griffin",
      "name": "Griffin",
      "hp": 150,
      "attack": 23,
      "speed": 11,
      "rarity": "uncommon",
      "element": "physical",
      "image": "/images/monsters/griffin.png"
    },
    {
      "id": "golem",
      "name": "Golem",
      "hp": 300,
      "attack": 30,
      "speed": 3,
      "rarity": "rare",
      "element": "physical",
      "image": "/images/monsters/golem.png"
    },
    {
      "id": "stone_warden",
      "name": "Stone Warden",
      "hp": 220,
      "attack": 22,
      "speed": 4,
      "rarity": "rare",
      "element": "physical",
      "image": "/images/monsters/stone_warden.png"
    },
    {
      "id": "wraith",
      "name": "Wraith",
      "hp": 130,
      "attack": 26,
      "speed": 12,
      "rarity": "rare",
      "element": "shadow",
      "image": "/images/monsters/wraith.png"
    },
    {
      "id": "manticore",
      "name": "Manticore",
      "hp": 180,
      "attack": 28,
      "speed": 10,
      "rarity": "rare",
      "element": "physical",
      "image": "/images/monsters/manticore.png"
    },
    {
      "id": "ogre",
      "name": "Ogre",
      "hp": 250,
      "attack": 29,
      "speed": 5,
      "rarity": "rare",
      "element": "physical",
      "image": "/images/monsters/ogre.png"
    },
    {
      "id": "dark_knight",
      "name": "Dark Knight",
      "hp": 200,
      "attack": 30,
      "speed": 9,
      "rarity": "rare",
      "element": "shadow",
      "image": "/images/monsters/dark_knight.png"
    },
    {
      "id": "witch",
      "name": "Witch",
      "hp": 140,
      "attack": 27,
      "speed": 8,
      "rarity": "rare",
      "element": "arcane",
      "image": "/images/monsters/witch.png"
    },
    {
      "id": "wyvern",
      "name": "Wyvern",
      "hp": 260,
      "attack": 34,
      "speed": 12,
      "rarity": "epic",
      "element": "arcane",
      "image": "/images/monsters/wyvern.png"
    },
    {
      "id": "ancient_golem",
      "name": "Ancient Golem",
      "hp": 400,
      "attack": 35,
      "speed": 3,
      "rarity": "epic",
      "element": "physical",
      "image": "/images/monsters/ancient_golem.png"
    },
    {
      "id": "lich",
      "name": "Lich",
      "hp": 240,
      "attack": 36,
      "speed": 8,
      "rarity": "legendary",
      "element": "shadow",
      "image": "/images/monsters/lich.png"
    },
    {
      "id": "hydra",
      "name": "Hydra",
      "hp": 340,
      "attack": 32,
      "speed": 6,
      "rarity": "mythic",
      "element": "physical",
      "image": "/images/monsters/hydra.png"
    },
    {
      "id": "kobold",
      "name": "Kobold",
      "hp": 50,
      "attack": 13,
      "speed": 10,
      "rarity": "common",
      "element": "physical",
      "image": "/images/monsters/kobold.png"
    },
    {
      "id": "scavenger",
      "name": "Scavenger",
      "hp": 55,
      "attack": 12,
      "speed": 9,
      "rarity": "common",
      "element": "physical",
      "image": "/images/monsters/scavenger.png"
    },
    {
      "id": "cave_crawler",
      "name": "Cave Crawler",
      "hp": 48,
      "attack": 11,
      "speed": 8,
      "rarity": "common",
      "element": "physical",
      "image": "/images/monsters/cave_crawler.png"
    },
    {
      "id": "forest_mite",
      "name": "Forest Mite",
      "hp": 38,
      "attack": 10,
      "speed": 13,
      "rarity": "common",
      "element": "physical",
      "image": "/images/monsters/forest_mite.png"
    },
    {
      "id": "sludge",
      "name": "Sludge",
      "hp": 60,
      "attack": 11,
      "speed": 4,
      "rarity": "common",
      "element": "physical",
      "image": "/images/monsters/sludge.png"
    },
    {
      "id": "thug",
      "name": "Thug",
      "hp": 62,
      "attack": 15,
      "speed": 7,
      "rarity": "common",
      "element": "physical",
      "image": "/images/monsters/thug.png"
    },
    {
      "id": "dusk_bat",
      "name": "Dusk Bat",
      "hp": 36,
      "attack": 12,
      "speed": 14,
      "rarity": "common",
      "element": "physical",
      "image": "/images/monsters/dusk_bat.png"
    },
    {
      "id": "ember_slime",
      "name": "Ember Slime",
      "hp": 42,
      "attack": 12,
      "speed": 5,
      "rarity": "common",
      "element": "physical",
      "image": "/images/monsters/ember_slime.png"
    },
    {
      "id": "iron_goblin",
      "name": "Iron Goblin",
      "hp": 105,
      "attack": 20,
      "speed": 8,
      "rarity": "uncommon",
      "element": "physical",
      "image": "/images/monsters/iron_goblin.png"
    },
    {
      "id": "bone_archer",
      "name": "Bone Archer",
      "hp": 88,
      "attack": 22,
      "speed": 11,
      "rarity": "uncommon",
      "element": "physical",
      "image": "/images/monsters/bone_archer.png"
    },
    {
      "id": "frost_wolf",
      "name": "Frost Wolf",
      "hp": 115,
      "attack": 23,
      "speed": 13,
      "rarity": "uncommon",
      "element": "physical",
      "image": "/images/monsters/frost_wolf.png"
    },
    {
      "id": "vine_lurker",
      "name": "Vine Lurker",
      "hp": 95,
      "attack": 18,
      "speed": 9,
      "rarity": "uncommon",
      "element": "arcane",
      "image": "/images/monsters/vine_lurker.png"
    },
    {
      "id": "ash_spider",
      "name": "Ash Spider",
      "hp": 78,
      "attack": 19,
      "speed": 12,
      "rarity": "uncommon",
      "element": "shadow",
      "image": "/images/monsters/ash_spider.png"
    },
    {
      "id": "brigand_captain",
      "name": "Brigand Captain",
      "hp": 125,
      "attack": 21,
      "speed": 9,
      "rarity": "uncommon",
      "element": "physical",
      "image": "/images/monsters/brigand_captain.png"
    },
    {
      "id": "marsh_crawler",
      "name": "Marsh Crawler",
      "hp": 135,
      "attack": 20,
      "speed": 6,
      "rarity": "uncommon",
      "element": "physical",
      "image": "/images/monsters/marsh_crawler.png"
    },
    {
      "id": "ember_sprite",
      "name": "Ember Sprite",
      "hp": 82,
      "attack": 18,
      "speed": 12,
      "rarity": "uncommon",
      "element": "arcane",
      "image": "/images/monsters/ember_sprite.png"
    },
    {
      "id": "crystal_golem",
      "name": "Crystal Golem",
      "hp": 260,
      "attack": 28,
      "speed": 3,
      "rarity": "rare",
      "element": "physical",
      "image": "/images/monsters/crystal_golem.png"
    },
    {
      "id": "abyss_wraith",
      "name": "Abyss Wraith",
      "hp": 135,
      "attack": 27,
      "speed": 11,
      "rarity": "rare",
      "element": "shadow",
      "image": "/images/monsters/abyss_wraith.png"
    },
    {
      "id": "storm_harpy",
      "name": "Storm Harpy",
      "hp": 105,
      "attack": 24,
      "speed": 15,
      "rarity": "rare",
      "element": "physical",
      "image": "/images/monsters/storm_harpy.png"
    },
    {
      "id": "iron_ogre",
      "name": "Iron Ogre",
      "hp": 240,
      "attack": 30,
      "speed": 5,
      "rarity": "rare",
      "element": "physical",
      "image": "/images/monsters/iron_ogre.png"
    },
    {
      "id": "cursed_knight",
      "name": "Cursed Knight",
      "hp": 190,
      "attack": 29,
      "speed": 9,
      "rarity": "rare",
      "element": "shadow",
      "image": "/images/monsters/cursed_knight.png"
    },
    {
      "id": "flame_witch",
      "name": "Flame Witch",
      "hp": 145,
      "attack": 28,
      "speed": 8,
      "rarity": "rare",
      "element": "arcane",
      "image": "/images/monsters/flame_witch.png"
    },
    {
      "id": "stone_titan",
      "name": "Stone Titan",
      "hp": 270,
      "attack": 29,
      "speed": 3,
      "rarity": "rare",
      "element": "physical",
      "image": "/images/monsters/stone_titan.png"
    },
    {
      "id": "dusk_manticore",
      "name": "Dusk Manticore",
      "hp": 175,
      "attack": 27,
      "speed": 10,
      "rarity": "rare",
      "element": "physical",
      "image": "/images/monsters/dusk_manticore.png"
    },
    {
      "id": "frost_wyvern",
      "name": "Frost Wyvern",
      "hp": 270,
      "attack": 35,
      "speed": 11,
      "rarity": "epic",
      "element": "arcane",
      "image": "/images/monsters/frost_wyvern.png"
    },
    {
      "id": "void_golem",
      "name": "Void Golem",
      "hp": 380,
      "attack": 34,
      "speed": 3,
      "rarity": "epic",
      "element": "physical",
      "image": "/images/monsters/void_golem.png"
    },
    {
      "id": "storm_lich",
      "name": "Storm Lich",
      "hp": 250,
      "attack": 37,
      "speed": 9,
      "rarity": "epic",
      "element": "shadow",
      "image": "/images/monsters/storm_lich.png"
    },
    {
      "id": "nether_hydra",
      "name": "Nether Hydra",
      "hp": 330,
      "attack": 33,
      "speed": 6,
      "rarity": "epic",
      "element": "physical",
      "image": "/images/monsters/nether_hydra.png"
    },
    {
      "id": "doom_lord",
      "name": "Doom Lord",
      "hp": 300,
      "attack": 40,
      "speed": 7,
      "rarity": "legendary",
      "element": "shadow",
      "image": "/images/monsters/doom_lord.png"
    },
    {
      "id": "molten_behemoth",
      "name": "Molten Behemoth",
      "hp": 520,
      "attack": 44,
      "speed": 4,
      "rarity": "epic",
      "element": "physical",
      "image": "/images/monsters/molten_behemoth.png"
    },
    {
      "id": "frost_titan",
      "name": "Frost Titan",
      "hp": 540,
      "attack": 42,
      "speed": 3,
      "rarity": "epic",
      "element": "physical",
      "image": "/images/monsters/frost_titan.png"
    },
    {
      "id": "void_herald",
      "name": "Void Herald",
      "hp": 480,
      "attack": 46,
      "speed": 8,
      "rarity": "epic",
      "element": "shadow",
      "image": "/images/monsters/void_herald.png"
    },
    {
      "id": "storm_colossus",
      "name": "Storm Colossus",
      "hp": 500,
      "attack": 43,
      "speed": 6,
      "rarity": "epic",
      "element": "arcane",
      "image": "/images/monsters/storm_colossus.png"
    },
    {
      "id": "phoenix_canary",
      "name": "Phoenix Canary",
      "hp": 460,
      "attack": 42,
      "speed": 12,
      "rarity": "epic",
      "element": "holy",
      "image": "/images/monsters/phoenix_canary.png"
    },
    {
      "id": "world_eater",
      "name": "World Eater",
      "hp": 360,
      "attack": 38,
      "speed": 5,
      "rarity": "mythic",
      "element": "physical",
      "image": "/images/monsters/world_eater.png"
    },
    {
      "id": "vine_wraith",
      "name": "Vine Wraith",
      "hp": 95,
      "attack": 14,
      "speed": 12,
      "rarity": "uncommon",
      "element": "nature",
      "image": "/images/monsters/vine_wraith.png"
    },
    {
      "id": "thornback_boar",
      "name": "Thornback Boar",
      "hp": 130,
      "attack": 18,
      "speed": 8,
      "rarity": "uncommon",
      "element": "nature",
      "image": "/images/monsters/thornback_boar.png"
    },
    {
      "id": "elder_treant",
      "name": "Elder Treant",
      "hp": 260,
      "attack": 24,
      "speed": 5,
      "rarity": "rare",
      "element": "nature",
      "image": "/images/monsters/elder_treant.png"
    }
  ],
  "skills": [
    {
      "id": "boss_ember_skill1",
      "name": "Ember Strike",
      "target": "enemy",
      "mana": 6,
      "power": 1.6,
      "element": "fire",
      "effect": "fire_meteor_crash",
      "image": "/images/skills/boss_ember_skill1.png",
      "description": "Ember 1.6x fire strike"
    },
    {
      "id": "boss_ember_king",
      "name": "Ember King",
      "hp": 9000,
      "attack": 42,
      "speed": 6,
      "rarity": "mythic",
      "element": "fire",
      "image": "/images/bosses/ember_king.png"
    },
    {
      "id": "boss_frost_titan",
      "name": "Frost Titan",
      "hp": 16000,
      "attack": 52,
      "speed": 5,
      "rarity": "mythic",
      "element": "frost",
      "image": "/images/bosses/frost_titan.png"
    },
    {
      "id": "boss_void_herald",
      "name": "Void Herald",
      "hp": 26000,
      "attack": 62,
      "speed": 7,
      "rarity": "mythic",
      "element": "shadow",
      "image": "/images/bosses/void_herald.png"
    },
    {
      "id": "boss_storm_colossus",
      "name": "Storm Colossus",
      "hp": 40000,
      "attack": 72,
      "speed": 6,
      "rarity": "mythic",
      "element": "arcane",
      "image": "/images/bosses/storm_colossus.png"
    },
    {
      "id": "boss_world_eater",
      "name": "World Eater",
      "hp": 55000,
      "attack": 85,
      "speed": 5,
      "rarity": "mythic",
      "element": "physical",
      "image": "/images/bosses/world_eater.png"
    },
    {
      "id": "boss_ember_skill2",
      "name": "Ember Heavy",
      "target": "enemy",
      "mana": 10,
      "power": 2.4,
      "element": "fire",
      "effect": "heavy_hammer_slam",
      "image": "/images/skills/boss_ember_skill2.png",
      "description": "Ember 2.4x heavy flame"
    },
    {
      "id": "boss_ember_skill3",
      "name": "Ember Weaken",
      "target": "enemy",
      "mana": 8,
      "buffs": [
        {
          "kind": "weaken",
          "value": 0.35
        }
      ],
      "duration": 2,
      "element": "fire",
      "effect": "fire_meteor_crash",
      "image": "/images/skills/boss_ember_skill3.png",
      "description": "Ember weaken 35% 2t"
    },
    {
      "id": "boss_ember_skill4",
      "name": "Ember Fortify",
      "target": "self",
      "mana": 8,
      "buffs": [
        {
          "kind": "defense",
          "value": 0.45
        }
      ],
      "duration": 2,
      "element": "fire",
      "effect": "fire_meteor_crash",
      "image": "/images/skills/boss_ember_skill4.png",
      "description": "Ember fortify 45% 2t"
    },
    {
      "id": "boss_ember_skill5",
      "name": "Ember Venom",
      "target": "enemy",
      "mana": 9,
      "power": 0.9,
      "element": "fire",
      "effect": "fire_meteor_crash",
      "buffs": [
        {
          "kind": "dot",
          "value": 0.07
        }
      ],
      "duration": 3,
      "image": "/images/skills/boss_ember_skill5.png",
      "description": "Ember 0.9x +7% burn 3t"
    },
    {
      "id": "boss_ember_skill6",
      "name": "Ember Heal",
      "target": "self",
      "mana": 10,
      "effect": "heal_aura_fountain",
      "healSelfPct": 0.25,
      "image": "/images/skills/boss_ember_skill6.png",
      "description": "Ember heal 25%"
    },
    {
      "id": "boss_frost_skill1",
      "name": "Frost Strike",
      "target": "enemy",
      "mana": 6,
      "power": 1.6,
      "element": "frost",
      "effect": "frost_crystal_spear",
      "image": "/images/skills/boss_frost_skill1.png",
      "description": "Frost 1.6x ice strike"
    },
    {
      "id": "boss_frost_skill2",
      "name": "Frost Heavy",
      "target": "enemy",
      "mana": 10,
      "power": 2.4,
      "element": "frost",
      "effect": "heavy_hammer_slam",
      "image": "/images/skills/boss_frost_skill2.png",
      "description": "Frost 2.4x shatter"
    },
    {
      "id": "boss_frost_skill3",
      "name": "Frost Weaken",
      "target": "enemy",
      "mana": 8,
      "buffs": [
        {
          "kind": "weaken",
          "value": 0.35
        }
      ],
      "duration": 2,
      "element": "frost",
      "effect": "frost_crystal_spear",
      "image": "/images/skills/boss_frost_skill3.png",
      "description": "Frost weaken 35% 2t"
    },
    {
      "id": "boss_frost_skill4",
      "name": "Frost Fortify",
      "target": "self",
      "mana": 8,
      "buffs": [
        {
          "kind": "defense",
          "value": 0.45
        }
      ],
      "duration": 2,
      "element": "frost",
      "effect": "frost_crystal_spear",
      "image": "/images/skills/boss_frost_skill4.png",
      "description": "Frost fortify 45% 2t"
    },
    {
      "id": "boss_frost_skill5",
      "name": "Frost Venom",
      "target": "enemy",
      "mana": 9,
      "power": 0.9,
      "element": "frost",
      "effect": "frost_crystal_spear",
      "buffs": [
        {
          "kind": "dot",
          "value": 0.06
        }
      ],
      "duration": 3,
      "image": "/images/skills/boss_frost_skill5.png",
      "description": "Frost 0.9x +6% frostbite 3t"
    },
    {
      "id": "boss_frost_skill6",
      "name": "Frost Heal",
      "target": "self",
      "mana": 10,
      "effect": "heal_aura_fountain",
      "healSelfPct": 0.25,
      "image": "/images/skills/boss_frost_skill6.png",
      "description": "Frost heal 25%"
    },
    {
      "id": "boss_void_skill1",
      "name": "Void Strike",
      "target": "enemy",
      "mana": 6,
      "power": 1.7,
      "element": "shadow",
      "effect": "shadow_scythe_reap",
      "image": "/images/skills/boss_void_skill1.png",
      "description": "Void 1.7x shadow strike"
    },
    {
      "id": "boss_void_skill2",
      "name": "Void Heavy",
      "target": "enemy",
      "mana": 10,
      "power": 2.5,
      "element": "shadow",
      "effect": "heavy_hammer_slam",
      "image": "/images/skills/boss_void_skill2.png",
      "description": "Void 2.5x crush"
    },
    {
      "id": "boss_void_skill3",
      "name": "Void Weaken",
      "target": "enemy",
      "mana": 8,
      "buffs": [
        {
          "kind": "expose",
          "value": 0.3
        }
      ],
      "duration": 2,
      "element": "shadow",
      "effect": "shadow_scythe_reap",
      "image": "/images/skills/boss_void_skill3.png",
      "description": "Void expose 30% 2t"
    },
    {
      "id": "boss_void_skill4",
      "name": "Void Fortify",
      "target": "self",
      "mana": 8,
      "buffs": [
        {
          "kind": "defense",
          "value": 0.5
        }
      ],
      "duration": 2,
      "element": "shadow",
      "effect": "shadow_scythe_reap",
      "image": "/images/skills/boss_void_skill4.png",
      "description": "Void fortify 50% 2t"
    },
    {
      "id": "boss_void_skill5",
      "name": "Void Venom",
      "target": "enemy",
      "mana": 9,
      "power": 0.85,
      "element": "shadow",
      "effect": "shadow_scythe_reap",
      "buffs": [
        {
          "kind": "dot",
          "value": 0.08
        }
      ],
      "duration": 3,
      "image": "/images/skills/boss_void_skill5.png",
      "description": "Void 0.85x +8% curse 3t"
    },
    {
      "id": "boss_void_skill6",
      "name": "Void Heal",
      "target": "self",
      "mana": 10,
      "effect": "heal_aura_fountain",
      "healSelfPct": 0.3,
      "image": "/images/skills/boss_void_skill6.png",
      "description": "Void heal 30%"
    },
    {
      "id": "boss_storm_skill1",
      "name": "Storm Strike",
      "target": "enemy",
      "mana": 6,
      "power": 1.7,
      "element": "arcane",
      "effect": "frost_crystal_spear",
      "image": "/images/skills/boss_storm_skill1.png",
      "description": "Storm 1.7x arcane"
    },
    {
      "id": "boss_storm_skill2",
      "name": "Storm Heavy",
      "target": "enemy",
      "mana": 10,
      "power": 2.5,
      "element": "arcane",
      "effect": "heavy_hammer_slam",
      "image": "/images/skills/boss_storm_skill2.png",
      "description": "Storm 2.5x storm hammer"
    },
    {
      "id": "boss_storm_skill3",
      "name": "Storm Weaken",
      "target": "enemy",
      "mana": 8,
      "buffs": [
        {
          "kind": "weaken",
          "value": 0.3
        },
        {
          "kind": "expose",
          "value": 0.2
        }
      ],
      "duration": 2,
      "element": "arcane",
      "effect": "frost_crystal_spear",
      "image": "/images/skills/boss_storm_skill3.png",
      "description": "Storm weaken+expose 2t"
    },
    {
      "id": "boss_storm_skill4",
      "name": "Storm Fortify",
      "target": "self",
      "mana": 8,
      "buffs": [
        {
          "kind": "defense",
          "value": 0.4
        }
      ],
      "duration": 2,
      "element": "arcane",
      "effect": "frost_crystal_spear",
      "image": "/images/skills/boss_storm_skill4.png",
      "description": "Storm fortify 40% 2t"
    },
    {
      "id": "boss_storm_skill5",
      "name": "Storm Venom",
      "target": "enemy",
      "mana": 9,
      "power": 0.9,
      "element": "arcane",
      "effect": "frost_crystal_spear",
      "buffs": [
        {
          "kind": "dot",
          "value": 0.07
        }
      ],
      "duration": 3,
      "image": "/images/skills/boss_storm_skill5.png",
      "description": "Storm 0.9x +7% shock 3t"
    },
    {
      "id": "boss_storm_skill6",
      "name": "Storm Heal",
      "target": "self",
      "mana": 10,
      "effect": "heal_aura_fountain",
      "healSelfPct": 0.25,
      "image": "/images/skills/boss_storm_skill6.png",
      "description": "Storm heal 25%"
    },
    {
      "id": "boss_world_skill1",
      "name": "World Strike",
      "target": "enemy",
      "mana": 6,
      "power": 1.8,
      "element": "physical",
      "effect": "heavy_hammer_slam",
      "image": "/images/skills/boss_world_skill1.png",
      "description": "World 1.8x crush"
    },
    {
      "id": "boss_world_skill2",
      "name": "World Heavy",
      "target": "enemy",
      "mana": 10,
      "power": 2.6,
      "element": "physical",
      "effect": "heavy_hammer_slam",
      "image": "/images/skills/boss_world_skill2.png",
      "description": "World 2.6x world break"
    },
    {
      "id": "boss_world_skill3",
      "name": "World Weaken",
      "target": "enemy",
      "mana": 8,
      "buffs": [
        {
          "kind": "weaken",
          "value": 0.4
        }
      ],
      "duration": 2,
      "element": "physical",
      "effect": "heavy_hammer_slam",
      "image": "/images/skills/boss_world_skill3.png",
      "description": "World weaken 40% 2t"
    },
    {
      "id": "boss_world_skill4",
      "name": "World Fortify",
      "target": "self",
      "mana": 8,
      "buffs": [
        {
          "kind": "attack",
          "value": 0.4
        }
      ],
      "duration": 2,
      "element": "physical",
      "effect": "heavy_hammer_slam",
      "image": "/images/skills/boss_world_skill4.png",
      "description": "World frenzy 40% 2t"
    },
    {
      "id": "boss_world_skill5",
      "name": "World Venom",
      "target": "enemy",
      "mana": 9,
      "power": 1,
      "element": "physical",
      "effect": "rising_katana_slash",
      "buffs": [
        {
          "kind": "dot",
          "value": 0.09
        }
      ],
      "duration": 3,
      "image": "/images/skills/boss_world_skill5.png",
      "description": "World 1.0x +9% bleed 3t"
    },
    {
      "id": "boss_world_skill6",
      "name": "World Heal",
      "target": "self",
      "mana": 10,
      "effect": "heal_aura_fountain",
      "healSelfPct": 0.35,
      "image": "/images/skills/boss_world_skill6.png",
      "description": "World heal 35%"
    },
    {
      "id": "heavy_strike",
      "name": "Heavy Strike",
      "target": "enemy",
      "mana": 6,
      "power": 1.6,
      "element": "physical",
      "effect": "heavy_hammer_slam",
      "image": "/images/skills/heavy_strike.png",
      "description": "Deals 1.6× attack damage."
    },
    {
      "id": "defend",
      "name": "Defend",
      "target": "self",
      "mana": 4,
      "defense": 0.5,
      "image": "/images/skills/defend.png",
      "description": "Block 50% of incoming damage this round."
    },
    {
      "id": "arcane_barrage",
      "name": "Arcane Barrage",
      "target": "enemy",
      "mana": 8,
      "power": 1.9,
      "element": "arcane",
      "image": "/images/skills/arcane_barrage.png",
      "description": "Deals 1.9× magic damage."
    },
    {
      "id": "mana_shield",
      "name": "Mana Shield",
      "target": "self",
      "mana": 6,
      "defense": 0.55,
      "image": "/images/skills/mana_shield.png",
      "description": "Block 55% of incoming damage this round."
    },
    {
      "id": "aimed_shot",
      "name": "Aimed Shot",
      "target": "enemy",
      "mana": 10,
      "power": 2,
      "element": "physical",
      "image": "/images/skills/aimed_shot.png",
      "description": "Deals 2× attack damage."
    },
    {
      "id": "piercing_shot",
      "name": "Piercing Shot",
      "target": "enemy",
      "mana": 5,
      "power": 1.3,
      "element": "physical",
      "image": "/images/skills/piercing_shot.png",
      "description": "Deals 1.3× attack damage."
    },
    {
      "id": "vampiric_strike",
      "name": "Vampiric Strike",
      "target": "enemy",
      "mana": 9,
      "power": 2,
      "lifesteal": 0.5,
      "element": "shadow",
      "effect": "shadow_scythe_reap",
      "image": "/images/skills/vampiric_strike.png",
      "description": "Deals 2× attack damage and heals for half the damage dealt."
    },
    {
      "id": "shadow_meld",
      "name": "Shadow Meld",
      "target": "self",
      "mana": 5,
      "defense": 0.5,
      "image": "/images/skills/shadow_meld.png",
      "description": "Block 50% of incoming damage this round."
    },
    {
      "id": "holy_strike",
      "name": "Holy Strike",
      "target": "enemy",
      "mana": 7,
      "power": 1.5,
      "element": "holy",
      "image": "/images/skills/holy_strike.png",
      "description": "Deals 1.5× attack damage."
    },
    {
      "id": "divine_guard",
      "name": "Divine Guard",
      "target": "self",
      "mana": 6,
      "defense": 0.6,
      "image": "/images/skills/divine_guard.png",
      "description": "Block 60% of incoming damage this round."
    },
    {
      "id": "execute",
      "name": "Execute",
      "target": "enemy",
      "mana": 12,
      "power": 2.5,
      "element": "shadow",
      "effect": "shadow_scythe_reap",
      "image": "/images/skills/execute.png",
      "description": "Deals 2.5× attack damage."
    },
    {
      "id": "shadow_step",
      "name": "Shadow Step",
      "target": "self",
      "mana": 5,
      "defense": 0.5,
      "image": "/images/skills/shadow_step.png",
      "description": "Block 50% of incoming damage this round."
    },
    {
      "id": "mend",
      "name": "Mend",
      "target": "ally",
      "mana": 8,
      "heal": 0.35,
      "image": "/images/skills/mend.png",
      "description": "Restore 35% of an ally's max HP."
    },
    {
      "id": "greater_mend",
      "name": "Greater Mend",
      "target": "ally",
      "mana": 14,
      "heal": 0.55,
      "image": "/images/skills/greater_mend.png",
      "description": "Restore 55% of an ally's max HP."
    },
    {
      "id": "fortify",
      "name": "Fortify",
      "target": "self",
      "mana": 6,
      "defense": 0.6,
      "image": "/images/skills/fortify.png",
      "description": "Block 60% of incoming damage this round."
    },
    {
      "id": "war_banner",
      "name": "War Banner",
      "target": "self",
      "mana": 5,
      "defense": 0.5,
      "image": "/images/skills/war_banner.png",
      "description": "Block 50% of incoming damage this round."
    },
    {
      "id": "cleave",
      "name": "Cleave",
      "target": "enemy",
      "mana": 7,
      "power": 1.5,
      "element": "physical",
      "effect": "axe_cleave_horizontal",
      "image": "/images/skills/cleave.png",
      "description": "Deals 1.5× attack damage."
    },
    {
      "id": "shield_wall",
      "name": "Shield Wall",
      "target": "self",
      "mana": 7,
      "defense": 0.7,
      "image": "/images/skills/shield_wall.png",
      "description": "Block 70% of incoming damage this round."
    },
    {
      "id": "spirit_surge",
      "name": "Spirit Surge",
      "target": "party",
      "mana": 6,
      "manaRestorePct": 0.3,
      "image": "/images/skills/spirit_surge.png",
      "description": "Restore 30% of each ally's max mana."
    },
    {
      "id": "war_cry",
      "name": "War Cry",
      "target": "enemy",
      "mana": 10,
      "power": 2.6,
      "element": "physical",
      "effect": "heavy_hammer_slam",
      "image": "/images/skills/war_cry.png",
      "description": "Deals 2.6× attack damage."
    },
    {
      "id": "volley",
      "name": "Volley",
      "target": "enemy",
      "mana": 12,
      "power": 2.4,
      "element": "physical",
      "image": "/images/skills/volley.png",
      "description": "Deals 2.4× attack damage."
    },
    {
      "id": "meteor",
      "name": "Meteor",
      "target": "enemy",
      "mana": 14,
      "power": 2.8,
      "element": "arcane",
      "effect": "heavy_hammer_slam",
      "image": "/images/skills/meteor.png",
      "description": "Deals 2.8× magic damage."
    },
    {
      "id": "shadow_veil",
      "name": "Shadow Veil",
      "target": "enemy",
      "mana": 10,
      "power": 2.6,
      "lifesteal": 0.4,
      "element": "shadow",
      "effect": "shadow_scythe_reap",
      "image": "/images/skills/shadow_veil.png",
      "description": "Deals 2.6× attack damage and heals for 40% of the damage dealt."
    },
    {
      "id": "holy_judgement",
      "name": "Holy Judgement",
      "target": "enemy",
      "mana": 10,
      "power": 2.2,
      "healSelfPct": 0.4,
      "element": "holy",
      "image": "/images/skills/holy_judgement.png",
      "description": "Deals 2.2× holy damage and restores 40% of your max HP."
    },
    {
      "id": "death_mark",
      "name": "Death Mark",
      "target": "enemy",
      "mana": 14,
      "power": 3,
      "element": "shadow",
      "effect": "shadow_scythe_reap",
      "image": "/images/skills/death_mark.png",
      "description": "Deals 3× attack damage."
    },
    {
      "id": "divine_blessing",
      "name": "Divine Blessing",
      "target": "party",
      "mana": 16,
      "heal": 0.45,
      "image": "/images/skills/divine_blessing.png",
      "description": "Restore 45% of each ally's max HP."
    },
    {
      "id": "bastion",
      "name": "Bastion",
      "target": "self",
      "mana": 8,
      "defense": 0.85,
      "image": "/images/skills/bastion.png",
      "description": "Block 85% of incoming damage this round."
    },
    {
      "id": "cataclysm",
      "name": "Cataclysm",
      "target": "enemy",
      "mana": 16,
      "power": 3,
      "element": "physical",
      "effect": "heavy_hammer_slam",
      "image": "/images/skills/cataclysm.png",
      "description": "Deals 3× attack damage."
    },
    {
      "id": "storm_barrage",
      "name": "Storm Barrage",
      "target": "enemy",
      "mana": 15,
      "power": 2.9,
      "element": "physical",
      "image": "/images/skills/storm_barrage.png",
      "description": "Deals 2.9× attack damage."
    },
    {
      "id": "comet",
      "name": "Comet",
      "target": "enemy",
      "mana": 18,
      "power": 3.2,
      "element": "arcane",
      "effect": "heavy_hammer_slam",
      "image": "/images/skills/comet.png",
      "description": "Deals 3.2× magic damage."
    },
    {
      "id": "soul_thief",
      "name": "Soul Thief",
      "target": "enemy",
      "mana": 14,
      "power": 3,
      "lifesteal": 0.5,
      "element": "shadow",
      "effect": "shadow_scythe_reap",
      "image": "/images/skills/soul_thief.png",
      "description": "Deals 3× attack damage and heals for half the damage dealt."
    },
    {
      "id": "radiance",
      "name": "Radiance",
      "target": "enemy",
      "mana": 14,
      "power": 2.5,
      "healSelfPct": 0.6,
      "element": "holy",
      "image": "/images/skills/radiance.png",
      "description": "Deals 2.5× holy damage and restores 60% of your max HP."
    },
    {
      "id": "soul_reap",
      "name": "Soul Reap",
      "target": "enemy",
      "mana": 18,
      "power": 3.4,
      "element": "shadow",
      "effect": "shadow_scythe_reap",
      "image": "/images/skills/soul_reap.png",
      "description": "Deals 3.4× attack damage."
    },
    {
      "id": "resurgence",
      "name": "Resurgence",
      "target": "party",
      "mana": 20,
      "heal": 0.6,
      "manaRestorePct": 0.2,
      "image": "/images/skills/resurgence.png",
      "description": "Restore 60% of each ally's max HP and 20% of their max mana."
    },
    {
      "id": "immovable",
      "name": "Immovable",
      "target": "self",
      "mana": 10,
      "defense": 0.95,
      "image": "/images/skills/immovable.png",
      "description": "Block 95% of incoming damage this round."
    },
    {
      "id": "battle_fury",
      "name": "Battle Fury",
      "target": "self",
      "mana": 8,
      "buffs": [
        {
          "kind": "attack",
          "value": 0.3
        }
      ],
      "duration": 2,
      "image": "/images/skills/battle_fury.png",
      "description": "Increase your damage by 30% for 2 rounds."
    },
    {
      "id": "iron_wall",
      "name": "Iron Wall",
      "target": "self",
      "mana": 8,
      "buffs": [
        {
          "kind": "defense",
          "value": 0.4
        }
      ],
      "duration": 2,
      "image": "/images/skills/iron_wall.png",
      "description": "Block 40% of incoming damage for 2 rounds."
    },
    {
      "id": "group_guard",
      "name": "Group Guard",
      "target": "party",
      "mana": 10,
      "buffs": [
        {
          "kind": "defense",
          "value": 0.25
        }
      ],
      "duration": 2,
      "image": "/images/skills/group_guard.png",
      "description": "The whole party blocks 25% of incoming damage for 2 rounds."
    },
    {
      "id": "cripple",
      "name": "Cripple",
      "target": "enemy",
      "mana": 8,
      "buffs": [
        {
          "kind": "weaken",
          "value": 0.3
        },
        {
          "kind": "expose",
          "value": 0.2
        }
      ],
      "duration": 2,
      "image": "/images/skills/cripple.png",
      "description": "A monster deals 30% less damage and takes 20% more for 2 rounds."
    },
    {
      "id": "venom_strike",
      "name": "Venom Strike",
      "target": "enemy",
      "mana": 9,
      "power": 0.6,
      "element": "physical",
      "buffs": [
        {
          "kind": "dot",
          "value": 0.05
        }
      ],
      "duration": 3,
      "image": "/images/skills/venom_strike.png",
      "description": "Strike for 0.6x damage and poison the monster for 3 rounds."
    },
    {
      "id": "rejuvenate",
      "name": "Rejuvenate",
      "target": "ally",
      "mana": 8,
      "buffs": [
        {
          "kind": "regen",
          "value": 0.08
        }
      ],
      "duration": 3,
      "image": "/images/skills/rejuvenate.png",
      "description": "An ally regains 8% of max HP each round for 3 rounds."
    },
    {
      "id": "monster_physical_attack",
      "name": "Savage Blow",
      "target": "enemy",
      "kind": "attack",
      "power": 1.05,
      "element": "physical",
      "monster": true,
      "description": "Monster basic attack."
    },
    {
      "id": "monster_shadow_attack",
      "name": "Shadow Claw",
      "target": "enemy",
      "kind": "attack",
      "power": 1.15,
      "element": "shadow",
      "monster": true,
      "description": "Monster basic attack."
    },
    {
      "id": "monster_arcane_attack",
      "name": "Arcane Surge",
      "target": "enemy",
      "kind": "attack",
      "power": 1.15,
      "element": "arcane",
      "monster": true,
      "description": "Monster basic attack."
    },
    {
      "id": "monster_heavy_blow",
      "name": "Heavy Blow",
      "target": "enemy",
      "kind": "attack",
      "power": 1.5,
      "element": "physical",
      "monster": true,
      "description": "A heavy monster blow."
    },
    {
      "id": "monster_shadow_bolt",
      "name": "Shadow Bolt",
      "target": "enemy",
      "kind": "attack",
      "power": 1.5,
      "element": "shadow",
      "monster": true,
      "description": "A dark monster blast."
    },
    {
      "id": "monster_arcane_storm",
      "name": "Arcane Storm",
      "target": "enemy",
      "kind": "attack",
      "power": 1.5,
      "element": "arcane",
      "monster": true,
      "description": "A surge of monster magic."
    },
    {
      "id": "monster_frenzy",
      "name": "Frenzy",
      "target": "self",
      "kind": "buff",
      "buffs": [
        {
          "kind": "attack",
          "value": 0.3
        }
      ],
      "duration": 2,
      "monster": true,
      "description": "The monster deals 30% more damage for 2 rounds."
    },
    {
      "id": "monster_stoneskin",
      "name": "Stoneskin",
      "target": "self",
      "kind": "buff",
      "buffs": [
        {
          "kind": "defense",
          "value": 0.3
        }
      ],
      "duration": 2,
      "monster": true,
      "description": "The monster blocks 30% of damage for 2 rounds."
    },
    {
      "id": "monster_regen",
      "name": "Regenerate",
      "target": "self",
      "kind": "buff",
      "buffs": [
        {
          "kind": "regen",
          "value": 0.05
        }
      ],
      "duration": 3,
      "monster": true,
      "description": "The monster heals 5% of max HP each round for 3 rounds."
    },
    {
      "id": "monster_weaken",
      "name": "Crushing Aura",
      "target": "enemy",
      "kind": "debuff",
      "buffs": [
        {
          "kind": "weaken",
          "value": 0.25
        }
      ],
      "duration": 2,
      "monster": true,
      "description": "A hero deals 25% less damage for 2 rounds."
    },
    {
      "id": "monster_vulnerable",
      "name": "Expose Weakness",
      "target": "enemy",
      "kind": "debuff",
      "buffs": [
        {
          "kind": "expose",
          "value": 0.25
        }
      ],
      "duration": 2,
      "monster": true,
      "description": "A hero takes 25% more damage for 2 rounds."
    },
    {
      "id": "monster_poison",
      "name": "Venom",
      "target": "enemy",
      "kind": "debuff",
      "buffs": [
        {
          "kind": "dot",
          "value": 0.06
        }
      ],
      "duration": 3,
      "monster": true,
      "description": "A hero takes damage each round for 3 rounds."
    },
    {
      "id": "aegis",
      "name": "Aegis",
      "target": "self",
      "mana": 6,
      "buffs": [
        {
          "kind": "shield",
          "value": 60
        }
      ],
      "duration": 2,
      "image": "/images/skills/aegis.png",
      "description": "Gain 60 shield for 2 rounds."
    },
    {
      "id": "barrier",
      "name": "Barrier",
      "target": "party",
      "mana": 10,
      "buffs": [
        {
          "kind": "shield",
          "value": 35
        }
      ],
      "duration": 2,
      "image": "/images/skills/barrier.png",
      "description": "All allies gain 35 shield for 2 rounds."
    },
    {
      "id": "stone_skin",
      "name": "Stone Skin",
      "target": "self",
      "mana": 7,
      "buffs": [
        {
          "kind": "shield",
          "value": 80
        },
        {
          "kind": "defense",
          "value": 0.15
        }
      ],
      "duration": 2,
      "image": "/images/skills/stone_skin.png",
      "description": "Gain 80 shield and 15% damage reduction."
    },
    {
      "id": "holy_ward",
      "name": "Holy Ward",
      "target": "ally",
      "mana": 8,
      "buffs": [
        {
          "kind": "shield",
          "value": 50
        }
      ],
      "duration": 2,
      "image": "/images/skills/holy_ward.png",
      "description": "Give an ally 50 shield for 2 rounds."
    },
    {
      "id": "dark_veil",
      "name": "Dark Veil",
      "target": "self",
      "mana": 8,
      "buffs": [
        {
          "kind": "shield",
          "value": 45
        },
        {
          "kind": "weaken",
          "value": 0.15
        }
      ],
      "duration": 2,
      "image": "/images/skills/dark_veil.png",
      "description": "Gain 45 shield and weaken attacker 15%."
    },
    {
      "id": "monster_heal",
      "name": "Graft",
      "target": "self",
      "kind": "heal",
      "amount": 0.15,
      "monster": true,
      "description": "The monster restores 15% of max HP."
    },
    {
      "id": "frost_bolt",
      "name": "Frost Bolt",
      "target": "enemy",
      "mana": 8,
      "power": 2,
      "element": "frost",
      "image": "/images/skills/frost_bolt.png",
      "description": "Deals 2× magicPower frost damage. May freeze the target."
    },
    {
      "id": "frost_nova",
      "name": "Frost Nova",
      "target": "enemy",
      "mana": 10,
      "power": 1.8,
      "element": "frost",
      "buffs": [
        {
          "kind": "frozen",
          "value": 0
        }
      ],
      "duration": 1,
      "image": "/images/skills/frost_nova.png",
      "description": "Deals 1.8× magicPower frost damage and freezes the target for 1 turn."
    },
    {
      "id": "water_splash",
      "name": "Water Splash",
      "target": "enemy",
      "mana": 6,
      "power": 1.5,
      "element": "water",
      "buffs": [
        {
          "kind": "wet",
          "value": 0
        }
      ],
      "duration": 2,
      "image": "/images/skills/water_splash.png",
      "description": "Deals 1.5× magicPower water damage and soaks the target for 2 turns (wet)."
    },
    {
      "id": "lightning_bolt",
      "name": "Lightning Bolt",
      "target": "enemy",
      "mana": 9,
      "power": 1.8,
      "element": "lightning",
      "image": "/images/skills/lightning_bolt.png",
      "description": "Deals 1.8× magicPower lightning damage, +50% vs wet (Overcharge)."
    },
    {
      "id": "war_heal",
      "name": "War Heal",
      "target": "ally",
      "mana": 10,
      "heal": {
        "stat": "attack",
        "mult": 1.3
      },
      "image": "/images/skills/war_heal.png",
      "description": "Heals 1.3× attack power. Scales with healPower."
    },
    {
      "id": "magic_mend",
      "name": "Magic Mend",
      "target": "ally",
      "mana": 10,
      "heal": {
        "stat": "magicPower",
        "mult": 2
      },
      "image": "/images/skills/magic_mend.png",
      "description": "Heals 2× magicPower. Scales with healPower."
    },
    {
      "id": "scorch_mark",
      "name": "Scorch Mark",
      "target": "enemy",
      "mana": 6,
      "power": 1.1,
      "element": "fire",
      "buffs": [
        {
          "kind": "dot",
          "value": 0.04
        }
      ],
      "duration": 3,
      "effect": "fire_slash_arc",
      "image": "/images/skills/scorch_mark.png",
      "description": "Sear the foe for 1.1× magicPower and set it burning (4% max HP / round for 3 rounds)."
    },
    {
      "id": "ember_storm",
      "name": "Ember Storm",
      "target": "enemy",
      "mana": 10,
      "power": 1.6,
      "element": "fire",
      "buffs": [
        {
          "kind": "dot",
          "value": 0.03
        }
      ],
      "duration": 3,
      "effect": "ember_whirlwind",
      "image": "/images/skills/ember_storm.png",
      "description": "A whirl of cinders deals 1.6× magicPower and leaves the foe burning."
    },
    {
      "id": "blaze_rupture",
      "name": "Blaze Rupture",
      "target": "enemy",
      "mana": 12,
      "power": 2.3,
      "element": "fire",
      "effect": "magma_eruption_burst",
      "image": "/images/skills/blaze_rupture.png",
      "description": "Detonate magma for 2.3× magicPower; burning targets take +60%."
    },
    {
      "id": "cold_snap",
      "name": "Cold Snap",
      "target": "enemy",
      "mana": 7,
      "power": 1.3,
      "element": "frost",
      "buffs": [
        {
          "kind": "frozen",
          "value": 0
        }
      ],
      "duration": 2,
      "effect": "frost_crystal_spear",
      "image": "/images/skills/cold_snap.png",
      "description": "Hurl a frost spear for 1.3× magicPower and freeze the target for 2 rounds."
    },
    {
      "id": "glacial_shatter",
      "name": "Glacial Shatter",
      "target": "enemy",
      "mana": 11,
      "power": 2.4,
      "element": "frost",
      "effect": "ice_spikes_ground",
      "image": "/images/skills/glacial_shatter.png",
      "description": "Implode the ice for 2.4× magicPower; frozen targets take +65%."
    },
    {
      "id": "volt_conduit",
      "name": "Volt Conduit",
      "target": "enemy",
      "mana": 8,
      "power": 1.2,
      "element": "lightning",
      "buffs": [
        {
          "kind": "dot",
          "value": 0.03
        }
      ],
      "duration": 3,
      "effect": "electric_sparks_shower",
      "image": "/images/skills/volt_conduit.png",
      "description": "Channel crackling current for 1.2× magicPower and electrify the target."
    },
    {
      "id": "static_overload",
      "name": "Static Overload",
      "target": "enemy",
      "mana": 11,
      "power": 2.2,
      "element": "lightning",
      "effect": "lightning_strike_heavy",
      "image": "/images/skills/static_overload.png",
      "description": "Call down 2.2× magicPower lightning; wet targets take +50%."
    },
    {
      "id": "toxin_drench",
      "name": "Toxin Drench",
      "target": "enemy",
      "mana": 6,
      "power": 0.9,
      "element": "physical",
      "buffs": [
        {
          "kind": "dot",
          "value": 0.06
        }
      ],
      "duration": 3,
      "effect": "mud_splash_entangle",
      "image": "/images/skills/toxin_drench.png",
      "description": "Soak the foe in venom for 0.9× attack; poison deals 6% max HP / round."
    },
    {
      "id": "venom_burst",
      "name": "Venom Burst",
      "target": "enemy",
      "mana": 11,
      "power": 2.2,
      "element": "physical",
      "effect": "earth_fissure_rupture",
      "image": "/images/skills/venom_burst.png",
      "description": "Burst the blisters for 2.2× attack; poisoned targets take +50%."
    },
    {
      "id": "broken_guard",
      "name": "Broken Guard",
      "target": "enemy",
      "mana": 7,
      "power": 1,
      "element": "physical",
      "buffs": [
        {
          "kind": "expose",
          "value": 0.25
        },
        {
          "kind": "weaken",
          "value": 0.2
        }
      ],
      "duration": 2,
      "effect": "shield_bash_shock",
      "image": "/images/skills/broken_guard.png",
      "description": "Shatter defenses for 1× attack: the foe takes 25% more and deals 20% less for 2 rounds."
    },
    {
      "id": "shatter_point",
      "name": "Shatter Point",
      "target": "enemy",
      "mana": 8,
      "power": 1.6,
      "element": "physical",
      "effect": "piercing_rapier_thrust",
      "image": "/images/skills/shatter_point.png",
      "description": "Strike the weak point for 1.6× attack; exposed targets take +80%."
    },
    {
      "id": "devastate",
      "name": "Devastate",
      "target": "enemy",
      "mana": 12,
      "power": 2.6,
      "element": "physical",
      "effect": "heavy_hammer_slam",
      "image": "/images/skills/devastate.png",
      "description": "A crushing blow for 2.6× attack; weakened targets take +35%."
    },
    {
      "id": "vine_lash",
      "name": "Vine Lash",
      "target": "enemy",
      "mana": 6,
      "power": 1.4,
      "element": "nature",
      "effect": "nature_vine_burst",
      "image": "/images/skills/vine_lash.png",
      "description": "Whipping vines strike for 1.4× magic power."
    },
    {
      "id": "thorn_volley",
      "name": "Thorn Volley",
      "target": "enemy",
      "mana": 9,
      "power": 1.9,
      "element": "nature",
      "effect": "nature_vine_projectile",
      "buffs": [
        {
          "kind": "dot",
          "value": 0.05
        }
      ],
      "duration": 3,
      "image": "/images/skills/thorn_volley.png",
      "description": "A barrage of thorns for 1.9× magic that bleeds the target."
    },
    {
      "id": "forest_renewal",
      "name": "Forest Renewal",
      "target": "self",
      "mana": 10,
      "element": "nature",
      "effect": "heal_aura_fountain",
      "healSelfPct": 0.3,
      "image": "/images/skills/forest_renewal.png",
      "description": "Bloom with nature's blessing, restoring 30% of your max HP."
    }
  ]
};

function getClass(slug) {
  return CONTENT.classes.find((c) => c.slug === slug) || null;
}

function getDungeon(rank) {
  return CONTENT.dungeons.find((d) => d.rank === String(rank).toLowerCase()) || null;
}

function publicCatalog() {
  const evolutions = CONTENT.classes
    .filter((c) => c.evolution)
    .map((c) => {
      const evolved = getClass(c.evolution.to);
      const skill = evolved ? getSkill(evolved.startingSkills && evolved.startingSkills[0]) : null;
      const bonus = evolved && evolved.evolveBonus ? evolved.evolveBonus : {};
      const bonusText = Object.entries(bonus)
        .map(([k, v]) => `${statLabel(k)} +${v}`)
        .join(" · ");
      return {
        from: c.slug,
        to: { slug: evolved ? evolved.slug : c.evolution.to, label: evolved ? evolved.label : c.evolution.to, image: evolved ? evolved.image : "" },
        level: c.evolution.level || 20,
        skill: skill ? { name: skill.name, description: skill.description || "", mana: skill.mana, image: skill.image } : null,
        bonusText,
        ascend: {
          title: c.evolution.ascendTitle || null,
          color: c.evolution.ascendColor || "#e8c547",
          sound: c.evolution.ascendSound || "",
        },
      };
    });

  return {
    baseSkills: CONTENT.baseSkills,
    story: CONTENT.story,
    classes: CONTENT.classes.map((c) => ({
      slug: c.slug,
      label: c.label,
      image: c.image,
      baseClass: c.baseClass || null,
      // Secret flag only (boolean) — the password itself NEVER leaves the server.
      secret: !!c.secret,
      evolution: c.evolution ? { to: c.evolution.to, level: c.evolution.level } : null,
      basicAttack: c.basicAttack,
      skills: c.startingSkills || [],
      manaRegen: c.manaRegen || 0,
    })),
    images: CONTENT.images,
    town: {
      search: { stamina: CONTENT.town.search.stamina },
      blacksmith: { stamina: CONTENT.town.blacksmith.stamina },
      merchant: { stamina: CONTENT.town.merchant.stamina },
      tavern: {
        stamina: CONTENT.town.tavern.stamina,
        bets: CONTENT.town.tavern.bets,
        provisions: CONTENT.town.tavern.provisions,
      },
      rest: { stamina: CONTENT.town.rest.stamina },
      temple: { stamina: CONTENT.town.temple.stamina },
    },
    temple: {
      restore: CONTENT.temple.restore,
      recipes: CONTENT.temple.recipes,
      evolutions,
      maxLives: CONTENT.starting.lives,
    },
    effects: CONTENT.effects,
    elements: CONTENT.elements || [],
    affinity: CONTENT.affinity || {},
    combos: CONTENT.combos || [],
    darkTrait: CONTENT.darkTrait || { deal: 1.3, taken: 1.5 },
    skillTree: {
      pointsPerLevel: (CONTENT.skillTree && CONTENT.skillTree.pointsPerLevel) || 3,
      startingPoints: (CONTENT.skillTree && CONTENT.skillTree.startingPoints) || 3,
      maxLoadout: (CONTENT.skillTree && CONTENT.skillTree.maxLoadout) || 5,
      global: (CONTENT.skillTree && CONTENT.skillTree.global) || [],
      lineages: (CONTENT.skillTree && CONTENT.skillTree.lineages) || {},
    },
    pets: (CONTENT.pets || []).map((p) => ({ id: p.id, name: p.name, image: p.image, imageYoung: p.imageYoung || "", imageAdult: p.imageAdult || "", element: p.element, description: p.description || "", egg: p.egg || "", stats: p.stats || {}, buffKind: p.buffKind || "", petSkills: p.petSkills || null })),
    food: CONTENT.food,
    loot: {
      rarityOrder: CONTENT.loot.rarityOrder,
      rarityMeta: CONTENT.loot.rarityMeta,
      buyable: CONTENT.loot.buyable,
      dropChance: CONTENT.loot.dropChance,
      gradeWeights: CONTENT.loot.gradeWeights,
    },
    sizes: CONTENT.dungeonSizes.map((s) => ({ id: s.id, label: s.label, stamina: s.stamina })),
    dungeons: CONTENT.dungeons.map((d) => ({
      rank: d.rank,
      label: d.label,
      image: d.image,
      battleImage: d.battleImage || "",
      monsterPool: d.monsterPool || [],
    })),
    skills: CONTENT.skills.map((s) => ({
      id: s.id,
      name: s.name,
      target: s.target,
      power: s.power,
      heal: s.heal,
      defense: s.defense,
      lifesteal: s.lifesteal,
      manaRestore: s.manaRestore,
      manaRestorePct: s.manaRestorePct,
      healSelfPct: s.healSelfPct,
      element: s.element,
      mana: s.mana,
      image: s.image,
      description: s.description || "",
      buffs: s.buffs || null,
      duration: s.duration || null,
      kind: s.kind || null,
      monster: s.monster || false,
      bonusVsStatus: s.bonusVsStatus || null,
      effect: s.effect || null,
    })),
    items: CONTENT.items.map((i) => ({
      id: i.id,
      name: i.name,
      slot: i.slot,
      rarity: i.rarity || "common",
      price: i.price,
      value: i.value || 0,
      stats: i.stats || {},
      heal: i.heal,
      food: i.food,
      image: i.image,
      description: i.description || "",
    })),
    equipmentSlots: CONTENT.equipmentSlots,
    bosses: (CONTENT.bosses || []).map((b) => ({ id: b.id, label: b.label, image: b.image, hp: b.hp, attack: b.attack, element: b.element, unlockAfter: b.unlockAfter || null })),
    monsters: CONTENT.monsters.map((m) => ({ id: m.id, name: m.name, image: m.image, rarity: m.rarity || "common", element: m.element || "physical" })),
    anomalyFrameColors: Object.fromEntries(
      CONTENT.anomalies.traits.map((t) => [t.id, t.frameColor])
    ),
  };
}

function statLabel(key) {
  const map = { maxHp: "Max HP", attack: "Attack", mana: "Mana", manaRegen: "Mana Regen", resistance: "Resistance", magicPower: "Magic Power", healPower: "Heal Power", speed: "Speed" };
  return map[key] || key;
}

function getSkill(id) {
  return CONTENT.skills.find((s) => s.id === id) || null;
}

function getItem(id) {
  return CONTENT.items.find((i) => i.id === id) || null;
}

function getClassBasicAttack(slug) {
  const c = getClass(slug);
  return (c && c.basicAttack) || null;
}

function getMonster(id) {
  return CONTENT.monsters.find((m) => m.id === id) || (CONTENT.bosses||[]).find((m) => m.id === id) || null;
}

function getDungeonSize(id) {
  return CONTENT.dungeonSizes.find((s) => s.id === id) || null;
}

module.exports = {
  CONTENT,
  getClass,
  getClassBasicAttack,
  getDungeon,
  getDungeonSize,
  getSkill,
  getItem,
  getMonster,
  publicCatalog,
};
