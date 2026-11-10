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
    "food": 10,
    "stamina": 10,
    "maxStamina": 10
  },
  "leveling": {
    "maxLevel": 50,
    "xpBase": 500,
    "xpExponent": 1.45,
    "growthScale": 0.02
  },
  "sfx": {
    "ui": {
      "click": "clicksound",
      "hover": "hoversound",
      "win": "winningsound",
      "lose": "losingsound",
      "search": "lootsound"
    },
    "action": {
      "rest": "",
      "search": "",
      "blacksmith": "toolsound",
      "merchant": "coinsound",
      "temple": "bellsound",
      "dungeon": "irongate",
      "eat": "eatingsound",
      "potion": "potiondrinksound",
      "revive": "revivesound"
    },
    "item": {
      "loot": "lootsound",
      "inventory": "inventorysound",
      "coin": "clicksound"
    },
    "cinematic": {
      "ascend": "holyascension",
      "rebirth": "rebirthnew",
      "newDay": "",
      "nightFall": ""
    },
    "combat": {
      "win": "winningsound",
      "lose": "losingsound",
      "crit": "heavyswordhit"
    },
    "tavern": {
      "deal": "dicemagic",
      "hit": "dicemagic",
      "flip": "dicemagic",
      "win": "",
      "lose": "",
      "push": "",
      "chip": "coinsound"
    },
    "travel": {
      "slash": "",
      "shoot": "",
      "hit": "",
      "crit": "",
      "dash": "",
      "kill": "",
      "ultimate": "",
      "revive": "",
      "downed": "",
      "loot": "",
      "footstep": "",
      "ambience_day": "",
      "ambience_night": "",
      "ambience_rain": "",
      "ambience_storm": "",
      "parry": "",
      "guard": "",
      "guardbreak": "",
      "dodge": "",
      "parry_cue": ""
    }
  },
  "travel": {
    "weather": {
      "enabled": true,
      "rainChance": 0.4,
      "minDelay": 50,
      "maxDelay": 160,
      "rainVolume": 0.28,
      "dayVolume": 0.22
    },
    "downed": {
      "enabled": true,
      "reviveRange": 110
    },
    "sound": {
      "master": 0.85
    },
    "combat": {
      "parryCue": {
        "enabled": true,
        "lead": 0.18,
        "volume": 0.85
      },
      "monsterStagger": {
        "max": 100,
        "gain": 34,
        "duration": 2.4,
        "decayDelay": 3,
        "decay": 14,
        "minSteps": 2,
        "maxSteps": 5,
        "bossSteps": 8
      },
      "stamina": {
        "max": 200,
        "dashCost": 20,
        "sprintDrain": 12,
        "regen": 20
      }
    }
  },
  "story": {
    "title": "Setra",
    "paragraphs": [
      "Krein is an old world of wind, stone and long roads. No map has ever held all of it.",
      "You awake on the grass of an unknown valley with an empty memory and a warm stone in your hand.",
      "The stone is called Aetheria. You do not know where it came from, only that it brought you here.",
      "Beyond the ridge lies Setra, a small village in the green kingdom of Palendio — the nearest roof and fire you have."
    ],
    "cta": "Wake Up",
    "intro": {
      "speaker": "Mira",
      "image": "/images/npcs/mira.webp?v=mw8o4wbq",
      "bgGrass": "/images/backgrounds/story-intro-grass.webp?v=mw8ocx1t",
      "bgStanding": "/images/backgrounds/story-intro-standing.webp?v=mw8o56no",
      "audio": {
        "stopMainMusic": true,
        "music": "",
        "musicVolume": 0.7,
        "ambience": "",
        "ambienceVolume": 0.5,
        "cueVolume": 0.9,
        "prologue1": "",
        "prologue2": "",
        "prologue3": "",
        "prologue4": "",
        "line1": "",
        "line2": "",
        "line3": "",
        "line4": "",
        "line5": "",
        "line6": "",
        "reward": ""
      },
      "slides": [
        {
          "text": "Krein is an old world, its lands worn smooth by ages of wind and stone. No map has ever held all of it.",
          "image": "/images/backgrounds/story-slide-1.webp?v=mw8o8pw2",
          "pan": "lr"
        },
        {
          "text": "You wake on the grass of a valley you do not know. Your head is heavy, your memory empty, and a warm stone rests in your hand.",
          "image": "/images/backgrounds/story-slide-2.webp?v=mw8o8tpp",
          "pan": "zoom"
        },
        {
          "text": "The stone is Aetheria. You do not remember where it came from, or how you got here — only that it carried you.",
          "image": "/images/backgrounds/story-slide-3.webp?v=mw8o8w10",
          "pan": "rl"
        },
        {
          "text": "Past the ridge lies Setra, a small village in the green kingdom of Palendio. It is the nearest place with a roof and a fire.",
          "image": "/images/backgrounds/story-slide-4.webp?v=mw8obn9w",
          "pan": "lr"
        }
      ],
      "lines": [
        {
          "who": "narrator",
          "text": "Cold grass. Birdsong. Someone is shaking your shoulder.",
          "scene": "grass"
        },
        {
          "who": "npc",
          "text": "Hey. Hey — can you hear me? You were lying face-down in the ditch. Are you hurt?",
          "scene": "grass"
        },
        {
          "who": "you",
          "text": "I... don't think so. I don't remember how I got here.",
          "scene": "grass"
        },
        {
          "who": "npc",
          "text": "You're not bleeding, so that's a start. I'm Mira. The village is just past the ridge — Setra. Can you stand? Here, take this: fifty gold and some food. Nobody in this valley helps for free, and you'll need it.",
          "scene": "standing"
        },
        {
          "who": "you",
          "text": "Why? You don't know me.",
          "scene": "standing"
        },
        {
          "who": "npc",
          "text": "No. But I've been the stranger at the wrong end of the road before. Come on — walk slowly, and don't drop the stone. It's still warm.",
          "scene": "standing"
        }
      ],
      "rewardNote": "Mira gives you fifty gold and ten days of food."
    }
  },
  "npcs": [
    {
      "id": "blacksmith",
      "name": "Blacksmith",
      "title": "Blacksmith of Setra Village",
      "image": "/images/npcs/blacksmith.webp?v=mw8m4is0",
      "location": "blacksmith",
      "nodes": [
        {
          "id": "start",
          "text": "Mind the sparks. State your business — the forge waits for no one.",
          "options": [
            {
              "label": "How does your craft work?",
              "to": "work"
            },
            {
              "label": "What news of the wars?",
              "to": "wars"
            },
            {
              "label": "What do you know of the Temple?",
              "to": "temple"
            },
            {
              "label": "Farewell.",
              "end": true
            }
          ]
        },
        {
          "id": "work",
          "text": "Bring me a pattern and the materials, and I will beat them into shape. Patterns — schematics, the traders call them — are always here for two hundred gold. Steel itself you must earn: the wilds beyond the palisade, or the deep places. Nothing in my shop is given.",
          "options": [
            {
              "label": "What news of the wars?",
              "to": "wars"
            },
            {
              "label": "Back.",
              "to": "start"
            }
          ]
        },
        {
          "id": "wars",
          "text": "Palendio quarrels with its neighbors as old men quarrel over fences — only with more widows. The crown buys every blade I can finish. If you mean to sell your sword-arm, the dungeons past the hills pay better than any king. Mind you come back breathing.",
          "options": [
            {
              "label": "How does your craft work?",
              "to": "work"
            },
            {
              "label": "Back.",
              "to": "start"
            }
          ]
        },
        {
          "id": "temple",
          "text": "The Ancient Temple stood before any crown of Palendio was minted — five billion years this world has turned, and the priests say the stones remember all of them. Bring relics there if you find any. I shape metal. They shape people. Both trades leave marks.",
          "options": [
            {
              "label": "Back.",
              "to": "start"
            }
          ]
        }
      ],
      "offers": []
    },
    {
      "id": "merchant",
      "name": "Merchant",
      "title": "Merchant of Setra Village",
      "image": "/images/npcs/merchant.webp?v=mw8m4kgc",
      "location": "merchant",
      "nodes": [
        {
          "id": "start",
          "text": "Welcome, welcome. Coin first, sentiment after — but for a new face in Setra, the first counsel is free. What do you seek?",
          "options": [
            {
              "label": "Why are times hard?",
              "to": "times"
            },
            {
              "label": "What comes down the valley road?",
              "to": "road"
            },
            {
              "label": "Do you buy relics?",
              "to": "relics"
            },
            {
              "label": "Farewell.",
              "end": true
            }
          ]
        },
        {
          "id": "times",
          "text": "War taxes, war prices. The caravans from the lowlands charge double and smile while doing it. I sell chests, salves and materials at honest rates — honest for wartime, that is. Spend your first fifty wisely. There will not be a second fifty for free.",
          "options": [
            {
              "label": "What comes down the valley road?",
              "to": "road"
            },
            {
              "label": "Back.",
              "to": "start"
            }
          ]
        },
        {
          "id": "road",
          "text": "Refugees, mostly. And sellswords going the other way, toward the border forts. A keeper's girl — Mira, you may know her — pulled some half-dead wanderer out of the hollow last week. The road gives, and the road takes. Usually it takes.",
          "options": [
            {
              "label": "Why are times hard?",
              "to": "times"
            },
            {
              "label": "Back.",
              "to": "start"
            }
          ]
        },
        {
          "id": "relics",
          "text": "Ancient relics? I deal in honest goods, friend. Whatever the dungeons cough up — essences, hearts, strange metals — the Temple pays in transformations, and I pay in gold for what honest folk carry. Bring me materials and we will both eat.",
          "options": [
            {
              "label": "Back.",
              "to": "start"
            }
          ]
        }
      ],
      "offers": []
    },
    {
      "id": "tavernkeeper",
      "name": "Tavernkeeper",
      "title": "Keeper of the Village Tavern",
      "image": "/images/npcs/tavernkeeper.png?v=mw8m4qn0",
      "location": "tavern",
      "nodes": [
        {
          "id": "start",
          "text": "Sit, sit. You look like the road chewed you and thought better of swallowing. Ale is honest here, the beds upstairs are warm, and my ears are warmer still. What will it be?",
          "options": [
            {
              "label": "Tell me about the beds.",
              "to": "beds"
            },
            {
              "label": "Who was found in the hollow?",
              "to": "stranger"
            },
            {
              "label": "Any strange guests lately?",
              "to": "guest"
            },
            {
              "label": "Farewell.",
              "end": true
            }
          ]
        },
        {
          "id": "beds",
          "text": "Fifteen gold buys a bed, a bolted door and a morning without a knife in your ribs. Sleep in the fields if your purse is light — many do — but the cold takes its toll, and I have seen men wake with one fewer heartbeat in them. Your coin, your choice.",
          "options": [
            {
              "label": "Any strange guests lately?",
              "to": "guest"
            },
            {
              "label": "Back.",
              "to": "start"
            }
          ]
        },
        {
          "id": "stranger",
          "text": "Aye, Mira's stray. Found senseless in the grass with no memory and no shoes, or so the tale goes. She fed him from her own pot — poor as a church mouse, that girl, but proud. If you see him, tell him the Tavernkeeper says the first ale is on the house. Beginnings should be toasted.",
          "options": [
            {
              "label": "Tell me about the beds.",
              "to": "beds"
            },
            {
              "label": "Back.",
              "to": "start"
            }
          ]
        },
        {
          "id": "guest",
          "text": "Lower your voice. A pale gentleman came through at dusk — old coin, older manners, eyes like winter ponds. Asked after newcomers to the village. Asked twice. Then he smiled, paid in gold minted before my grandfather was born, and walked into the dark like it owed him passage. Whatever he is looking for... I hope it is not you.",
          "options": [
            {
              "label": "Who was found in the hollow?",
              "to": "stranger"
            },
            {
              "label": "Back.",
              "to": "start"
            }
          ]
        }
      ],
      "offers": []
    },
    {
      "id": "mira",
      "name": "Mira",
      "title": "Keeper's ward, friend of strays",
      "image": "/images/npcs/mira.png?v=mw8nnfd7",
      "location": "town",
      "nodes": [
        {
          "id": "start",
          "text": "You! You're up and walking — oh, thank the dawn. I found you senseless in the hollow grass, no memory and no shoes, and half-carried you all the way to town myself. Are you alright? Does your head still ache?",
          "options": [
            {
              "label": "I'm alright, thanks to you.",
              "to": "better"
            },
            {
              "label": "Who are you, again?",
              "to": "who"
            },
            {
              "label": "The pale gentleman — have you seen him?",
              "to": "pale"
            },
            {
              "label": "Farewell.",
              "end": true
            }
          ]
        },
        {
          "id": "better",
          "text": "Good. Good! Eat something today, you hear me? No more fainting in ditches on my watch. The town already talks — 'Mira's stray,' they say. Let them talk. You're MY stray, and strays eat first at my table.",
          "options": [
            {
              "label": "Back.",
              "to": "start"
            }
          ]
        },
        {
          "id": "who",
          "text": "Mira! I gather herbs, I feed strays — and you, my friend, are my finest stray yet. The Tavernkeeper took me in when the road took my family. If you are hurt, the town will not let you starve. That much I can promise.",
          "options": [
            {
              "label": "I'm alright, thanks to you.",
              "to": "better"
            },
            {
              "label": "The pale gentleman — have you seen him?",
              "to": "pale"
            },
            {
              "label": "Back.",
              "to": "start"
            }
          ]
        },
        {
          "id": "pale",
          "text": "Uncle Vesryn? Heavens, no — he only walks at dusk, and never far. He is... old blood, as he says. If old blood calls to you, you will find him here in the square most evenings. Go gently with him. He means kinder than he sounds.",
          "options": [
            {
              "label": "Back.",
              "to": "start"
            }
          ]
        }
      ],
      "offers": []
    },
    {
      "id": "uncle",
      "name": "Old Vesryn",
      "title": "Mira's uncle, of the old blood",
      "image": "/images/npcs/uncle.webp?v=mw8m4v0w",
      "location": "town",
      "nodes": [
        {
          "id": "start",
          "text": "So. Another moth come to my niece's lantern. I can smell the road on you — and underneath it, something older. Speak, then. The night is short and I am shorter with strangers.",
          "options": [
            {
              "label": "Who are you, old man?",
              "to": "who"
            },
            {
              "label": "Mira said you walk only at dusk. Why?",
              "to": "dusk"
            },
            {
              "label": "Tell me of the old blood.",
              "to": "rite"
            },
            {
              "label": "Farewell.",
              "end": true
            }
          ]
        },
        {
          "id": "who",
          "text": "Vesryn. Uncle to Mira, debtor to no one, drinker of nothing the tavern sells. My coin is older than this village and my thirst older than my coin. That is the whole of me, and more than most get.",
          "options": [
            {
              "label": "Tell me of the old blood.",
              "to": "rite"
            },
            {
              "label": "Back.",
              "to": "start"
            }
          ]
        },
        {
          "id": "dusk",
          "text": "The sun and I have an understanding: it does not look at me, and I do not burn. Dusk is my morning, little moth. If you would walk as I walk, first prove the thirst is in you.",
          "options": [
            {
              "label": "Tell me of the old blood.",
              "to": "rite"
            },
            {
              "label": "Back.",
              "to": "start"
            }
          ]
        },
        {
          "id": "rite",
          "text": "The rite is simple and it is not easy. Slay 50 of the humanoid filth that infest these lands — goblins, bandits, knights, witches, all that walk like men and kill like beasts. And bring me 10 drops of primeval cruor, the first blood, which sometimes spills from their wounds. Do this, and the old blood will know you.",
          "options": [
            {
              "label": "Back.",
              "to": "start"
            }
          ]
        }
      ],
      "offers": []
    },
    {
      "id": "zeynep",
      "name": "Zeynep the Apothecary",
      "title": "Town lunatic (probably)",
      "image": "/images/npcs/zeynep.webp?v=mw8m4wy5",
      "location": "town",
      "nodes": [
        {
          "id": "start",
          "text": "YOU! Yes, you with the face! Come closer, I don't bite on Tuesdays. I'm Zeynep — apothecary, genius, town lunatic, pick whichever, they're all true. What do you want? I have answers. Most of them are even for your questions.",
          "options": [
            {
              "label": "The coup — is it true what they say?",
              "to": "z01"
            },
            {
              "label": "What are you brewing?",
              "to": "z07"
            },
            {
              "label": "Why are you staring at that pigeon?",
              "to": "z12"
            },
            {
              "label": "Nice moon tonight.",
              "to": "z17"
            },
            {
              "label": "How is the Tavernkeeper?",
              "to": "z21"
            },
            {
              "label": "Do you know Old Vesryn?",
              "to": "z25"
            },
            {
              "label": "Do you know Mira?",
              "to": "z28"
            },
            {
              "label": "Any advice for the dungeons?",
              "to": "z31"
            },
            {
              "label": "What do you think of slimes?",
              "to": "z35"
            },
            {
              "label": "Nice boots.",
              "to": "z38"
            },
            {
              "label": "Will it rain tomorrow?",
              "to": "z41"
            },
            {
              "label": "I can't sleep. Help?",
              "to": "z44"
            },
            {
              "label": "What's that croaking?",
              "to": "z47"
            },
            {
              "label": "Farewell. Probably.",
              "end": true
            }
          ]
        },
        {
          "id": "z01",
          "text": "THE COUP! Oh, you heard! Nine years ago, the Gray Banner boys marched on the town hall with pikes and a list of demands. Demands! On paper! While I was in the middle of a very important nap in the doorway. So I stood up — hair everywhere, one shoe on — and said: 'Boys. Put those down before someone gets crowned.'",
          "options": [
            {
              "label": "And then?",
              "to": "z02"
            },
            {
              "label": "Back.",
              "to": "start"
            }
          ]
        },
        {
          "id": "z02",
          "text": "Their three leaders — big mustaches, tiny brains, you know the type — laughed at me. LAUGHED! So I said: 'Fine. All three of you. My hut. Tonight. If any of you walk out by morning, the town is yours.' They stopped laughing. The whole square stopped breathing.",
          "options": [
            {
              "label": "You didn't.",
              "to": "z03"
            },
            {
              "label": "Back.",
              "to": "start"
            }
          ]
        },
        {
          "id": "z03",
          "text": "I DID. All three. At once. By dawn, General Puff-Chest was crying into my pillow asking for his mother, Captain Left-Boots had proposed marriage twice, and the so-called Supreme Leader was doing my dishes and begging for a job reference. The coup was OVER, darling. Cancelled by exhaustion.",
          "options": [
            {
              "label": "That's... that's incredible.",
              "to": "z04"
            },
            {
              "label": "Back.",
              "to": "start"
            }
          ]
        },
        {
          "id": "z04",
          "text": "The council wanted to give me a medal. I said: 'Melt it down, I need a new cauldron.' They named a street after me instead. Then UNNAMED it when the priest found out why. Cowards! History will remember. I remember! Mostly. The details get fuzzy around midnight, but the snoring — three-part harmony — I'll never forget.",
          "options": [
            {
              "label": "What happened to the leaders?",
              "to": "z05"
            },
            {
              "label": "Back.",
              "to": "start"
            }
          ]
        },
        {
          "id": "z05",
          "text": "Puff-Chest runs a bakery now. Terrible bread, wonderful man. Left-Boots married a goat farmer and looks ten years younger. And the Supreme Leader? He sweeps my porch every Sunday. Still does! That's not a rumor, that's a SCHEDULE. Ask anyone. Ask HIM — he'll be here Sunday with a broom and that look in his eye.",
          "options": [
            {
              "label": "You're a hero, Zeynep.",
              "to": "z06"
            },
            {
              "label": "Back.",
              "to": "start"
            }
          ]
        },
        {
          "id": "z06",
          "text": "Hero? Lunatic? Apothecary? YES. I'm all three before breakfast. The town calls me mad because sane people don't stop armies with their bedroom. Their loss! Say — you smell a little like old blood, little moth. If the thirst ever takes you, go see Old Vesryn at dusk. Tell him Zeynep sent you. He owes me money. Don't tell him I said that.",
          "options": [
            {
              "label": "Tell me about Vesryn.",
              "to": "z25"
            },
            {
              "label": "Back.",
              "to": "start"
            }
          ]
        },
        {
          "id": "z07",
          "text": "Brewing? BREWING?! I am brewing justice! And soup. Mostly soup. This cauldron here holds my famous 'Probably Not Poison' stew — seventeen herbs, one bootlace for texture, and a secret ingredient I forgot, which is why it's secret. Bottomless appetite, bottomless pot. Science!",
          "options": [
            {
              "label": "Can I taste it?",
              "to": "z08"
            },
            {
              "label": "Back.",
              "to": "start"
            }
          ]
        },
        {
          "id": "z08",
          "text": "Taste it? TASTE IT?! Nobody tastes batch forty-one! Batch forty lost me two eyebrows and a customer. But batch forty-one — oh, she's PERFECT. She sings when stirred. Listen! ...You don't hear that? Hm. That's concerning. For you, I mean. My hearing is excellent. The pot and I agree.",
          "options": [
            {
              "label": "What else do you brew?",
              "to": "z09"
            },
            {
              "label": "Back.",
              "to": "start"
            }
          ]
        },
        {
          "id": "z09",
          "text": "Hair tonic that grows hair on EVERYTHING — doorknobs, chickens, one very surprised priest. Love philters (banned in three villages, highly effective, do not combine with coup leaders). And my masterpiece: a tea that makes you remember things that never happened. Would you like some? Last cup made a man remember being a chair. He sits better now. Improved posture!",
          "options": [
            {
              "label": "I'll pass on the tea.",
              "to": "z10"
            },
            {
              "label": "Back.",
              "to": "start"
            }
          ]
        },
        {
          "id": "z10",
          "text": "Wise! Wisdom looks good on you. Most people drink first and remember being furniture later. You — you have the eyes of someone who reads labels. I like that. The frogs like that too. Have you met my frogs? They're in the well. Don't drink from the well.",
          "options": [
            {
              "label": "Tell me about the frogs.",
              "to": "z47"
            },
            {
              "label": "Back.",
              "to": "start"
            }
          ]
        },
        {
          "id": "z11",
          "text": "Oh good, you're back! The stew missed you. It said so. In words. With grammar! Anyway — where were we? Potions! Right! My entire inventory is: green ones heal, red ones thrill, blue ones bill — that one costs extra. And if it's glowing, don't shake it. That's not a rule, that's a eulogy waiting to happen.",
          "options": [
            {
              "label": "Tell me about the frogs.",
              "to": "z47"
            },
            {
              "label": "Back.",
              "to": "start"
            }
          ]
        },
        {
          "id": "z12",
          "text": "Shhh! That pigeon — the grey one with the attitude — owes me three coppers and a secret. Pigeons are the town's real government, you know. They see EVERYTHING. The council just stamps what the pigeons decide. I've been trying to get elected to the pigeon council for years, but they say my cooing is 'mocking.' IT'S CALLED DEDICATION, GERALD!",
          "options": [
            {
              "label": "Who is Gerald?",
              "to": "z13"
            },
            {
              "label": "Back.",
              "to": "start"
            }
          ]
        },
        {
          "id": "z13",
          "text": "Gerald is THAT pigeon. The grey one. Don't let the identical grey ones fool you — Gerald has a scar. Emotional scar. From me, when I called his landing 'adequate.' He's never forgiven me. Pigeons hold grudges the way I hold grudges: forever, and with snacks involved.",
          "options": [
            {
              "label": "What secrets do pigeons know?",
              "to": "z14"
            },
            {
              "label": "Back.",
              "to": "start"
            }
          ]
        },
        {
          "id": "z14",
          "text": "Everything! Who sneaks out at night (the baker, flour everywhere, worst sneak in history). Who waters whose garden (scandalous). And where the fattest crumbs fall on market day — now THAT is classified. I'd tell you, but then Gerald wins. And Gerald does NOT win. Not this week. Not ever.",
          "options": [
            {
              "label": "Can pigeons scout dungeons?",
              "to": "z15"
            },
            {
              "label": "Back.",
              "to": "start"
            }
          ]
        },
        {
          "id": "z15",
          "text": "Tried it! Sent twelve pigeons into the F-rank with tiny helmets. Eleven came back heroes. The twelfth — Kevin — now runs the place, probably. He sends postcards. They just say 'COO' but I know what he means. He means the loot is excellent and the slimes are weak to compliments.",
          "options": [
            {
              "label": "Any advice for the dungeons?",
              "to": "z31"
            },
            {
              "label": "Back.",
              "to": "start"
            }
          ]
        },
        {
          "id": "z16",
          "text": "Oh! You came back to pigeon talk! My favorite subject after myself and soup. Remember: bread in the LEFT pocket (snacks), stones in the RIGHT pocket (self-defense), and never — NEVER — wink at a pigeon unless you mean it. Winking is a marriage proposal in pigeon. I am married to four pigeons. Four!",
          "options": [
            {
              "label": "Back.",
              "to": "start"
            }
          ]
        },
        {
          "id": "z17",
          "text": "The moon! Finally, someone with culture! People think the moon just hangs there. WRONG. The moon commutes. Every night it clocks in, does its glowing, clocks out. I've seen its timesheets. Impeccable penmanship. Terrible attendance during eclipses — calls in sick, the drama queen.",
          "options": [
            {
              "label": "What about a blood moon?",
              "to": "z18"
            },
            {
              "label": "Back.",
              "to": "start"
            }
          ]
        },
        {
          "id": "z18",
          "text": "Blood moon?! Oh, that's just the moon blushing. It happens when Old Vesryn looks at it too long. Don't tell him I told you. Actually DO tell him — his face does this thing, like a raisin remembering being a grape. Priceless! But from a distance. A LARGE distance. Trust auntie Zeynep.",
          "options": [
            {
              "label": "Is the moon made of cheese?",
              "to": "z19"
            },
            {
              "label": "Back.",
              "to": "start"
            }
          ]
        },
        {
          "id": "z19",
          "text": "Cheese? CHEESE?! My dear, the moon is made of moon. Everyone knows that. Though — between you and me — I once licked a moonrock the merchant sold me and it tasted faintly of gouda. Either the moon IS cheese, or the merchant is a genius, or I need better hobbies. Verdict: all three. Simultaneously!",
          "options": [
            {
              "label": "I need to lie down.",
              "to": "z20"
            },
            {
              "label": "Back.",
              "to": "start"
            }
          ]
        },
        {
          "id": "z20",
          "text": "Lie down? HERE? On MY good cobblestones? ...Fine. They're clean. I licked them this morning. Minty! Rest a while, little hero. When you wake up I'll tell you about the time I arm-wrestled the fog. Spoiler: the fog cheats. It has no arms and yet — somehow — it wins.",
          "options": [
            {
              "label": "Back.",
              "to": "start"
            }
          ]
        },
        {
          "id": "z21",
          "text": "The Tavernkeeper? Oh, bless his apron, that man waters the ale and counts the foam as a serving. I told him: 'You keep this up and the mugs will unionize!' He laughed. The mugs did NOT laugh. They're organizing. Tuesday meetings. Bring your own coaster.",
          "options": [
            {
              "label": "Is the food good at least?",
              "to": "z22"
            },
            {
              "label": "Back.",
              "to": "start"
            }
          ]
        },
        {
          "id": "z22",
          "text": "The stew? It's... consistent. That's the kindest true thing I can say. I've been sneaking MY herbs into their pot for years — little upgrades, you understand. The 'mystery flavor' everyone praises? That's mine. You're welcome, town. My invoice is in the mail. It's been in the mail for six years. The mail pigeon is Gerald. He eats invoices.",
          "options": [
            {
              "label": "What about the beds?",
              "to": "z23"
            },
            {
              "label": "Back.",
              "to": "start"
            }
          ]
        },
        {
          "id": "z23",
          "text": "The beds upstairs? Lumpy in a way that builds character. I once slept there and woke up fluent in a language nobody speaks. Useful at parties! Useless everywhere else! My advice: sleep on your left side, dream on your right, and if the mattress whispers your name, that's just the springs. Probably. Pay no attention.",
          "options": [
            {
              "label": "Anything stronger than ale?",
              "to": "z24"
            },
            {
              "label": "Back.",
              "to": "start"
            }
          ]
        },
        {
          "id": "z24",
          "text": "Stronger?! My sweet summer child, I once distilled moonlight and regret into a shot glass. One sip and the drinker could hear colors for a week. The Tavernkeeper BANNED it. Banned! Said something about 'health codes' and 'the screaming.' Philistine! Fine. Water for you. Sparkling. From the well. NOT the frog well. The other well.",
          "options": [
            {
              "label": "Back.",
              "to": "start"
            }
          ]
        },
        {
          "id": "z25",
          "text": "Vesryn? Old Bloodbags? Oh, we go WAY back. He owes me money AND an apology AND — technically — a small house. Lovely man. Terrible debtor. Pale as milk left in a cellar. He only comes out at dusk because the sun filed a complaint. True story! The sun and I are close. It tells me things.",
          "options": [
            {
              "label": "What does he want from newcomers?",
              "to": "z26"
            },
            {
              "label": "Back.",
              "to": "start"
            }
          ]
        },
        {
          "id": "z26",
          "text": "What does he want? Oh, the usual: blood, loyalty, eternal servitude, someone to reach the top shelf — he's dramatic AND short, worst combination. But listen: under all that cape-swishing, he's Mira's uncle and he'd burn the world for that girl. Just... maybe don't tell him I said anything nice. I have a reputation to protect.",
          "options": [
            {
              "label": "Should I trust him?",
              "to": "z27"
            },
            {
              "label": "Back.",
              "to": "start"
            }
          ]
        },
        {
          "id": "z27",
          "text": "Trust him? With your life: yes. With your lunch: absolutely not. The man inhales stew like a haunted bellows. But for the old blood business — the rite, the thirst, all that midnight poetry — he's the only honest broker in town. Tell him Zeynep sent you. Then RUN. No no — walk. Running implies debt. You don't owe him. I do. IT'S COMPLICATED.",
          "options": [
            {
              "label": "Back.",
              "to": "start"
            }
          ]
        },
        {
          "id": "z28",
          "text": "Mira? Oh, my sweet herb girl! I found her the way she found you — well, no. SHE found YOU. I found HER stealing my bandages years ago. Tiny thief, huge heart. I taught her everything: which mushroom kills, which mushroom thrills, and which mushroom to serve the tax collector. She's the best of us. Don't you DARE get her hurt.",
          "options": [
            {
              "label": "She saved my life.",
              "to": "z29"
            },
            {
              "label": "Back.",
              "to": "start"
            }
          ]
        },
        {
          "id": "z29",
          "text": "Of course she did! It's her hobby! Collecting strays! You, me, three-legged Tom the cat, a one-eyed crow named Justice — we're all Mira's strays! She feeds us, scolds us, patches us up. One day this town will realize she's been holding it together with soup and stubbornness. On that day, I shall say 'I told you so' in FOUR languages.",
          "options": [
            {
              "label": "What languages?",
              "to": "z30"
            },
            {
              "label": "Back.",
              "to": "start"
            }
          ]
        },
        {
          "id": "z30",
          "text": "Common, Pigeon, Frog, and Tax Collector. The last one is just sighing with extra steps. Anyway — Mira. If anyone in this town deserves a quiet life, it's her. So YOU — yes, you — stay alive out there, or I'll resurrect you myself just to scold you. My scolding has RANGE, little stray. Ask the Gray Banner boys. Oh wait — they're still traumatized!",
          "options": [
            {
              "label": "Back.",
              "to": "start"
            }
          ]
        },
        {
          "id": "z31",
          "text": "Dungeons?! Oh, marvelous! My favorite topic after soup and myself! Rule one: everything down there wants to hug you TO DEATH. Rule two: the floor is lava. Not always lava. But assume lava. Rule three: bring snacks. Goblins can be bribed with cheese. Skeletons cannot — no stomachs, no sense of humor, total waste of cheese.",
          "options": [
            {
              "label": "What about bosses?",
              "to": "z32"
            },
            {
              "label": "Back.",
              "to": "start"
            }
          ]
        },
        {
          "id": "z32",
          "text": "Bosses! Big lads with big feelings! The Ember King? Divorced. Twice. It's the horns — intimidating in battle, terrible for cuddling. The Frost Titan? Just cold. Emotionally AND thermally. My advice: compliment their lairs. 'Lovely magma pools, very feng shui.' Works sixty percent of the time, every time. The other forty percent: run.",
          "options": [
            {
              "label": "And if I fall?",
              "to": "z33"
            },
            {
              "label": "Back.",
              "to": "start"
            }
          ]
        },
        {
          "id": "z33",
          "text": "Fall? Down there? Oh honey, everyone falls! I fell down a well once — that's how I met the frogs, best thing that ever happened to me besides the coup. If you fall in a dungeon, the town drags you home and Mira fusses over you with soup. Dying is just fainting with commitment. Commit LESS. Snack MORE.",
          "options": [
            {
              "label": "Slimes though — easy, right?",
              "to": "z35"
            },
            {
              "label": "Back.",
              "to": "start"
            }
          ]
        },
        {
          "id": "z34",
          "text": "Oh! Back for more dungeon wisdom! Fine, fine — pro tip, free of charge: lick every new potion BEFORE battle. No! Wait! That's my OTHER advice column! Do NOT lick potions! Drink them like a normal person! ...Unless it's glowing. Glowing ones you lick. No! Ugh. Forget everything. Bring cheese. Cheese never lies.",
          "options": [
            {
              "label": "Back.",
              "to": "start"
            }
          ]
        },
        {
          "id": "z35",
          "text": "Slimes! My beloved blobs! People mock them — 'oh, they're just jelly' — and then they slip on one and sue the dungeon! Slimes are 90% water, 10% grudge. They remember EVERYTHING. I once insulted a slime in my youth and to this day they jiggle menacingly when I pass. Respect the jiggle!",
          "options": [
            {
              "label": "How do you fight one?",
              "to": "z36"
            },
            {
              "label": "Back.",
              "to": "start"
            }
          ]
        },
        {
          "id": "z36",
          "text": "Salt! No wait, that's slugs. Slimes hate... hmm... compliments? Kevin the pigeon said compliments! Yes! Tell the slime it looks less translucent today! It'll blush — you can SEE it blush, the whole blob goes pink — and while it's flustered, you bonk it! Science! Kevin has a tiny helmet. I trust Kevin.",
          "options": [
            {
              "label": "Who is Kevin?",
              "to": "z37"
            },
            {
              "label": "Back.",
              "to": "start"
            }
          ]
        },
        {
          "id": "z37",
          "text": "Kevin is my BEST pigeon! Plumage like a thundercloud, heart like a lion, bladder like a traitor! He runs the F-rank now — did I tell you? Sends postcards: 'COO.' That's pigeon for 'the loot is excellent.' Learn pigeon, little hero. It's the language of the future. And of Gerald. Ugh. Gerald.",
          "options": [
            {
              "label": "Back.",
              "to": "start"
            }
          ]
        },
        {
          "id": "z38",
          "text": "My BOOTS?! You're complimenting my BOOTS?! Oh, stop it! ...Don't stop. These beauties are genuine faux-dragon hide — the dragon was complimentary about them, true story, he said 'nice boots' right before trying to eat my cart. One boot is left, one is right, and BOTH are magnificent. Fashion is armor for the soul!",
          "options": [
            {
              "label": "Where did you get them?",
              "to": "z39"
            },
            {
              "label": "Back.",
              "to": "start"
            }
          ]
        },
        {
          "id": "z39",
          "text": "Won them! Arm-wrestling! Against the fog! I told you about the fog — cheats something awful! Best two out of three, and on the third bout the fog got... distracted. By what? BY MY BOOTS, obviously. Dazzled! It handed them over and dissipated in shame. I wear victory on my feet, darling!",
          "options": [
            {
              "label": "Can I have boots like that?",
              "to": "z40"
            },
            {
              "label": "Back.",
              "to": "start"
            }
          ]
        },
        {
          "id": "z40",
          "text": "Boots like MINE?! Oh, sweetie, these are one of a kind! But — because I like your face — I'll tell you the secret: wear two different socks. LEFT sock for luck, RIGHT sock for speed. Mismatched socks confuse the ground itself! That's why I never trip! ...In public. Where people can see. The ground and I have an understanding.",
          "options": [
            {
              "label": "Back.",
              "to": "start"
            }
          ]
        },
        {
          "id": "z41",
          "text": "Rain tomorrow? Let me consult the council! ...The PIGEON council! Gerald says... hmm... Gerald says it'll rain indoors. Gerald is an idiot. My knees say sun, my elbows say hail, and my left eyebrow — the wise one — says DRIZZLE WITH PURPOSE. Pack for all four weathers and a fifth one you invent yourself!",
          "options": [
            {
              "label": "What about storms?",
              "to": "z42"
            },
            {
              "label": "Back.",
              "to": "start"
            }
          ]
        },
        {
          "id": "z42",
          "text": "Storms?! Oh, I LOVE storms! I stand on the roof and conduct the lightning with a soup ladle! BEETHOVEN OF THE TEMPEST, they call me! Nobody calls me that. The lightning and I have an understanding: it misses me, I applaud. Standing ovation, every time. You should try it! ...Actually no. You look flammable. Stay inside.",
          "options": [
            {
              "label": "Flammable?!",
              "to": "z43"
            },
            {
              "label": "Back.",
              "to": "start"
            }
          ]
        },
        {
          "id": "z43",
          "text": "Flammable is a spectrum, darling! On one end: rocks. On the other end: ME after my moonshine. You're somewhere in the middle — 'damp twig' energy. No offense! Damp twigs survive! Rocks just sit there being smug! Embrace the twig! Now go inside before the sky does something theatrical!",
          "options": [
            {
              "label": "Back.",
              "to": "start"
            }
          ]
        },
        {
          "id": "z44",
          "text": "Can't sleep?! Oh, my specialty! Forget sheep — amateurs, all wool and no technique. I count TAX COLLECTORS jumping over a fence! One... two... by seven you're begging for sleep, by twelve you're asleep, by twenty you're auditing THEM in your dreams! Works every time! Side effects include: budgeting. You've been warned.",
          "options": [
            {
              "label": "Got anything stronger?",
              "to": "z45"
            },
            {
              "label": "Back.",
              "to": "start"
            }
          ]
        },
        {
          "id": "z45",
          "text": "Stronger?! My moonshine lullaby: one drop in warm milk and you'll sleep through a siege! Two drops and you'll sleep through YOUR OWN snoring — paradoxical, magnificent! Three drops and... well. Let's just say the well frogs know the rest of that story. THEY won't drink from the well either. NOBODY drinks from the well!!",
          "options": [
            {
              "label": "What happened at the well?",
              "to": "z46"
            },
            {
              "label": "Back.",
              "to": "start"
            }
          ]
        },
        {
          "id": "z46",
          "text": "What DIDN'T happen at the well! Let's just say three drops too many, one moonless night, and a chorus of frogs who witnessed EVERYTHING. They croak it to this day. Listen... hear that? 'ZEY-nep! ZEY-nep!' They're not saying my name. They're issuing a WARNING. To you. About me. Rude! Accurate! But rude!",
          "options": [
            {
              "label": "Back.",
              "to": "start"
            }
          ]
        },
        {
          "id": "z47",
          "text": "The croaking?! Oh, those are MY frogs! Well — the well's frogs. Technically the well's. Emotionally MINE. They hold parliament every night: Croak Croakerson opens with old business (me, falling in, AGAIN), then new business (also me, also falling). Democracy in action! I bring them flies. Big ones. Parliamentary bribes. It works!",
          "options": [
            {
              "label": "Can frogs predict the future?",
              "to": "z48"
            },
            {
              "label": "Back.",
              "to": "start"
            }
          ]
        },
        {
          "id": "z48",
          "text": "Predict?! They INVENT the future and dare it to happen! Three croaks means rain! Two croaks means a visitor! One long croak means SOMEONE is about to fall in the well — statistically, historically, ME. I've started wearing a helmet near water. Fashion AND function! The fog is jealous. The fog wishes it had my helmet.",
          "options": [
            {
              "label": "One more frog question.",
              "to": "z49"
            },
            {
              "label": "Back.",
              "to": "start"
            }
          ]
        },
        {
          "id": "z49",
          "text": "Last frog fact, and it's my favorite: frogs blink with their EYES but see with their SOULS. That's why they stare at you while you talk. They're not listening — they're JUDGING. And you know what? Fair. I've earned every stare. Now hop along, little hero — the frogs and I have a budget meeting. Snacks were promised. Snacks WILL be delivered!",
          "options": [
            {
              "label": "Back.",
              "to": "start"
            }
          ]
        }
      ],
      "offers": []
    }
  ],
  "quests": [
    {
      "id": "vampire_rite",
      "name": "The Progenitor's Thirst",
      "giver": "uncle",
      "classes": [
        "assassin",
        "mage"
      ],
      "monsterTag": "humanoid",
      "requiredKills": 50,
      "requiredItem": "primeval_cruor",
      "requiredItemCount": 10,
      "cruorDropChance": 0.2,
      "description": "Slay 50 humanoid foes and gather 10 Drops of Primeval Cruor for Old Vesryn. Completing the rite opens the vampire paths: Bloodspawn (physical, assassin Lv20, through Vesryn), Gloomspawn (magic, mage Lv20, through Vesryn), then Bloodlord and Sanguine Lord (Lv40, temple, vampire blood only)."
    }
  ],
  "food": {
    "healBase": 10,
    "healPct": 0.02
  },
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
        "description": "Mana flows back in battle: +4 mana at the start of every combat round.",
        "effect": {
          "type": "manaRegenBonus",
          "amount": 4
        }
      },
      {
        "id": "arcane_reservoir",
        "name": "Arcane Reservoir",
        "pureBlood": false,
        "rarity": "uncommon",
        "frameColor": "#7a9ec4",
        "description": "Mana regenerates a little faster each round.",
        "effect": {
          "type": "manaRegenBonus",
          "amount": 2
        }
      },
      {
        "id": "gale_veins",
        "name": "Gale Veins",
        "pureBlood": false,
        "rarity": "rare",
        "frameColor": "#6fd6c4",
        "description": "Attack speed +40%. Each hit has a 40% chance to echo for 50% damage.",
        "effect": {
          "type": "attackSpeed",
          "amount": 40
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
      },
      {
        "id": "stormheart",
        "name": "Stormheart",
        "pureBlood": true,
        "rarity": "pureblood",
        "frameColor": "#b388ff",
        "description": "Pure blood runs like lightning: attack speed +40% and +3 mana every combat round.",
        "effect": {
          "type": "attackSpeed",
          "amount": 40,
          "manaRegen": 3
        }
      }
    ]
  },
  "classes": [
    {
      "slug": "warrior",
      "label": "Warrior",
      "image": "/images/characters/warrior.webp?v=mu04hrh8",
      "basicAttack": {
        "id": "slash",
        "name": "Slash",
        "power": 1,
        "element": "physical",
        "image": "/images/skills/slash.webp",
        "description": "Deals 8 + 1× attack damage.",
        "baseDamage": 8
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
      "evolutions": [
        {
          "level": 20,
          "to": "warlord",
          "requiredItem": "war_crest",
          "requiredItemCount": 1,
          "requirementType": "level_and_item"
        },
        {
          "level": 20,
          "to": "juggernaut",
          "requiredItem": "war_crest",
          "requiredItemCount": 1,
          "requirementType": "level_and_item"
        },
        {
          "level": 20,
          "to": "crusader",
          "requiredItem": "war_crest",
          "requiredItemCount": 1,
          "requirementType": "level_and_item"
        },
        {
          "level": 20,
          "to": "reaper",
          "requiredItem": "shadow_sigil",
          "requiredItemCount": 1,
          "requirementType": "level_and_item"
        }
      ],
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
      },
      "tagline": "Frontline Swordmaster",
      "lore": "A veteran of the front line. Heavy armor and a loyal blade. Balanced and forgiving — ideal for beginners.",
      "passives": [
        {
          "id": "warrior_battle_fervor",
          "kind": "damageBonus",
          "name": "Battle Fervor",
          "desc": "+10% damage.",
          "mult": 0.1
        }
      ],
      "attackSpeed": 6
    },
    {
      "slug": "ranger",
      "label": "Archer",
      "image": "/images/characters/ranger.webp?v=mu7hv8a1",
      "basicAttack": {
        "id": "quick_shot",
        "name": "Quick Shot",
        "power": 0.9,
        "element": "physical",
        "image": "/images/skills/quick_shot.webp",
        "description": "Deals 8 + 0.9× attack damage.",
        "baseDamage": 8
      },
      "startingSkills": [
        "aimed_shot",
        "piercing_shot"
      ],
      "evolution": {
        "level": 20,
        "to": "warden"
      },
      "evolutions": [
        {
          "level": 20,
          "to": "warden",
          "requiredItem": "shadow_sigil",
          "requiredItemCount": 1,
          "requirementType": "level_and_item"
        },
        {
          "level": 20,
          "to": "nightblade",
          "requiredItem": "shadow_sigil",
          "requiredItemCount": 1,
          "requirementType": "level_and_item"
        },
        {
          "level": 20,
          "to": "reaper",
          "requiredItem": "shadow_sigil",
          "requiredItemCount": 1,
          "requirementType": "level_and_item"
        }
      ],
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
      },
      "tagline": "Long-Range Hunter",
      "lore": "A deadly archer striking from afar. Fast and first to shoot, but fragile up close.",
      "passives": [
        {
          "id": "ranger_hunters_instinct",
          "kind": "damageBonus",
          "name": "Hunter's Instinct",
          "desc": "+20% damage vs targets above 60% HP.",
          "aboveHpPct": 0.6,
          "mult": 0.2
        }
      ],
      "attackSpeed": 18
    },
    {
      "slug": "mage",
      "label": "Mage",
      "image": "/images/characters/mage.webp?v=mu04i2ic",
      "basicAttack": {
        "id": "arcane_bolt",
        "name": "Arcane Bolt",
        "power": 0.95,
        "element": "arcane",
        "image": "/images/skills/arcane_bolt.webp",
        "description": "Deals 8 + 0.95× magic damage.",
        "baseDamage": 8
      },
      "startingSkills": [
        "arcane_barrage",
        "mana_shield"
      ],
      "evolution": {
        "level": 20,
        "to": "archmage"
      },
      "evolutions": [
        {
          "level": 20,
          "to": "archmage",
          "requiredItem": "arcane_seal",
          "requiredItemCount": 1,
          "requirementType": "level_and_item"
        },
        {
          "level": 20,
          "to": "high_priest",
          "requiredItem": "arcane_seal",
          "requiredItemCount": 1,
          "requirementType": "level_and_item"
        }
      ],
      "speed": 7,
      "manaRegen": 2,
      "hp": {
        "min": 380,
        "max": 440
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
      },
      "tagline": "Apprentice Mage",
      "lore": "A novice bending arcane energy. Low health, deep mana pool. Huge burst damage, but needs protection.",
      "passives": [
        {
          "id": "mage_arcane_intellect",
          "kind": "statBonus",
          "name": "Arcane Intellect",
          "desc": "+10% magic power.",
          "stat": "magicPower",
          "pct": 0.1
        }
      ],
      "attackSpeed": -4
    },
    {
      "slug": "rogue",
      "label": "Rogue",
      "image": "/images/characters/rogue.webp?v=mu7qdwu0",
      "basicAttack": {
        "id": "stab",
        "name": "Stab",
        "power": 1,
        "element": "physical",
        "image": "/images/skills/stab.webp",
        "description": "Deals 8 + 1× attack damage.",
        "baseDamage": 8
      },
      "startingSkills": [
        "vampiric_strike",
        "shadow_meld"
      ],
      "evolution": {
        "level": 20,
        "to": "nightblade"
      },
      "evolutions": [
        {
          "level": 20,
          "to": "nightblade",
          "requiredItem": "shadow_sigil",
          "requiredItemCount": 1,
          "requirementType": "level_and_item"
        },
        {
          "level": 20,
          "to": "reaper",
          "requiredItem": "shadow_sigil",
          "requiredItemCount": 1,
          "requirementType": "level_and_item"
        },
        {
          "level": 20,
          "to": "warden",
          "requiredItem": "shadow_sigil",
          "requiredItemCount": 1,
          "requirementType": "level_and_item"
        }
      ],
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
      },
      "tagline": "Shadow Thief",
      "lore": "A cutpurse living in the shadows. Vampiric strikes steal life with every hit. Fast and cunning — for the impatient.",
      "passives": [
        {
          "id": "rogue_opportunist",
          "kind": "damageBonus",
          "name": "Opportunist",
          "desc": "+25% damage vs targets below 50% HP.",
          "belowHpPct": 0.5,
          "mult": 0.25
        }
      ],
      "attackSpeed": 22
    },
    {
      "slug": "paladin",
      "label": "Paladin",
      "image": "/images/characters/paladin.webp?v=mu04ieje",
      "basicAttack": {
        "id": "smite",
        "name": "Smite",
        "power": 0.95,
        "element": "holy",
        "image": "/images/skills/smite.webp",
        "description": "Deals 8 + 0.95× attack damage.",
        "baseDamage": 8
      },
      "startingSkills": [
        "holy_strike",
        "mend"
      ],
      "evolution": {
        "level": 20,
        "to": "crusader"
      },
      "evolutions": [
        {
          "level": 20,
          "to": "crusader",
          "requiredItem": "war_crest",
          "requiredItemCount": 1,
          "requirementType": "level_and_item"
        },
        {
          "level": 20,
          "to": "warlord",
          "requiredItem": "war_crest",
          "requiredItemCount": 1,
          "requirementType": "level_and_item"
        },
        {
          "level": 20,
          "to": "high_priest",
          "requiredItem": "arcane_seal",
          "requiredItemCount": 1,
          "requirementType": "level_and_item"
        }
      ],
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
      },
      "tagline": "Holy Guardian",
      "lore": "A knight sworn to the light. Strikes with steel, heals with prayer. Slow, but a rock that refuses to fall.",
      "passives": [
        {
          "id": "paladin_holy_aegis",
          "kind": "damageTaken",
          "name": "Holy Aegis",
          "desc": "Take 30% less damage (true damage excluded).",
          "mult": -0.3
        },
        {
          "id": "paladin_dawn_ward",
          "kind": "shieldStart",
          "name": "Dawn Ward",
          "desc": "Start combat with a shield equal to 20% max HP (4 turns).",
          "pct": 0.2,
          "turns": 4
        }
      ],
      "attackSpeed": 0
    },
    {
      "slug": "assassin",
      "label": "Assassin",
      "image": "/images/characters/assassin.webp?v=mu04ixgb",
      "basicAttack": {
        "id": "lunge",
        "name": "Lunge",
        "power": 1.05,
        "element": "physical",
        "image": "/images/skills/lunge.webp",
        "description": "Deals 8 + 1.05× attack damage.",
        "baseDamage": 8
      },
      "startingSkills": [
        "execute",
        "shadow_step"
      ],
      "evolution": {
        "level": 20,
        "to": "reaper"
      },
      "evolutions": [
        {
          "level": 20,
          "to": "reaper",
          "requiredItem": "shadow_sigil",
          "requiredItemCount": 1,
          "requirementType": "level_and_item"
        },
        {
          "level": 20,
          "to": "nightblade",
          "requiredItem": "shadow_sigil",
          "requiredItemCount": 1,
          "requirementType": "level_and_item"
        },
        {
          "level": 20,
          "to": "warden",
          "requiredItem": "shadow_sigil",
          "requiredItemCount": 1,
          "requirementType": "level_and_item"
        }
      ],
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
        "min": 30,
        "max": 44
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
      },
      "tagline": "Apprentice Assassin",
      "lore": "A student of the deadly arts. Execute ends a single target — TRUE damage that ignores armor. Glass cannon: them or you.",
      "passives": [
        {
          "id": "assassin_final_curtain",
          "kind": "execute",
          "name": "Final Curtain",
          "desc": "Your hits execute targets at or below 10% HP.",
          "finishBelowHpPct": 0.1
        }
      ],
      "attackSpeed": 20
    },
    {
      "slug": "support",
      "label": "Healer",
      "image": "/images/characters/support.webp?v=mu0egvxe",
      "basicAttack": {
        "id": "sanct_bolt",
        "name": "Sanct Bolt",
        "power": 0.9,
        "element": "holy",
        "image": "/images/skills/sanct_bolt.webp",
        "description": "Deals 8 + 0.9× attack damage.",
        "baseDamage": 8
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
      "evolutions": [
        {
          "level": 20,
          "to": "high_priest",
          "requiredItem": "arcane_seal",
          "requiredItemCount": 1,
          "requirementType": "level_and_item"
        },
        {
          "level": 20,
          "to": "archmage",
          "requiredItem": "arcane_seal",
          "requiredItemCount": 1,
          "requirementType": "level_and_item"
        },
        {
          "level": 20,
          "to": "crusader",
          "requiredItem": "war_crest",
          "requiredItemCount": 1,
          "requirementType": "level_and_item"
        }
      ],
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
      },
      "tagline": "Healer Adept",
      "lore": "The heart of the party. Cannot hunt alone — shines with friends. For team players.",
      "passives": [
        {
          "id": "healer_merciful_hand",
          "kind": "healBonus",
          "name": "Merciful Hand",
          "desc": "+20% healing.",
          "mult": 0.2
        }
      ],
      "attackSpeed": -6
    },
    {
      "slug": "tank",
      "label": "Tank",
      "image": "/images/characters/tank.webp?v=mu0eg6ml",
      "basicAttack": {
        "id": "shield_bash",
        "name": "Shield Bash",
        "power": 0.85,
        "element": "physical",
        "effect": "heavy_hammer_slam",
        "image": "/images/skills/shield_bash.webp",
        "description": "Deals 8 + 0.85× attack damage.",
        "baseDamage": 8
      },
      "startingSkills": [
        "cleave",
        "shield_wall"
      ],
      "evolution": {
        "level": 20,
        "to": "juggernaut"
      },
      "evolutions": [
        {
          "level": 20,
          "to": "juggernaut",
          "requiredItem": "war_crest",
          "requiredItemCount": 1,
          "requirementType": "level_and_item"
        },
        {
          "level": 20,
          "to": "warlord",
          "requiredItem": "war_crest",
          "requiredItemCount": 1,
          "requirementType": "level_and_item"
        },
        {
          "level": 20,
          "to": "crusader",
          "requiredItem": "war_crest",
          "requiredItemCount": 1,
          "requirementType": "level_and_item"
        }
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
      },
      "tagline": "Living Wall",
      "lore": "A fortress incarnate. Low damage, but felling them takes a siege. A party without one is incomplete.",
      "passives": [
        {
          "id": "tank_spiked_wall",
          "kind": "thorns",
          "name": "Spiked Wall",
          "desc": "Reflect 15% of damage taken.",
          "mult": 0.15
        },
        {
          "id": "tank_iron_hide",
          "kind": "damageTaken",
          "name": "Iron Hide",
          "desc": "Take 10% less damage (true damage excluded).",
          "mult": -0.1
        }
      ],
      "attackSpeed": -12
    },
    {
      "slug": "tamer",
      "label": "Tamer",
      "image": "/images/characters/tamer.webp?v=mu0eiwtr",
      "basicAttack": {
        "id": "tame_hit",
        "name": "Tame Hit",
        "power": 1,
        "element": "physical",
        "image": "/images/skills/tame_hit.webp",
        "description": "Deals 8 + 1× attack damage.",
        "baseDamage": 8
      },
      "startingSkills": [
        "beast_bite",
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
      },
      "tagline": "Beast Tamer",
      "lore": "A tamer fighting beside wild companions. Hunts with Beast Bite, endures with War Heal. Strength in the pack, never alone.",
      "petSlots": 3,
      "petPowerMult": 2,
      "attackSpeed": 8
    },
    {
      "slug": "beastmaster",
      "label": "Beastmaster",
      "passives": [
        {
          "id": "beastmaster_pack_alpha",
          "kind": "damageBonus",
          "name": "Pack Alpha",
          "desc": "+15% damage.",
          "mult": 0.15
        },
        {
          "id": "beastmaster_predator_strides",
          "kind": "speed",
          "name": "Predator Strides",
          "desc": "+3 speed.",
          "flat": 3
        }
      ],
      "baseClass": "tamer",
      "evolution": {
        "level": 40,
        "to": "anima_lorde"
      },
      "image": "/images/characters/beastmaster.webp?v=mu0f2njo",
      "basicAttack": {
        "id": "beast_strike",
        "name": "Beast Strike",
        "power": 1.15,
        "element": "physical",
        "image": "/images/skills/beast_strike.webp",
        "description": "Deals 8 + 1.15× attack damage.",
        "baseDamage": 8
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
      },
      "petSlots": 3,
      "petPowerMult": 2,
      "attackSpeed": 9
    },
    {
      "slug": "anima_lorde",
      "label": "Alpha Tamer",
      "passives": [
        {
          "id": "anima_lorde_apex_bond",
          "kind": "damageBonus",
          "name": "Apex Bond",
          "desc": "+20% damage.",
          "mult": 0.2
        },
        {
          "id": "anima_lorde_wild_sprint",
          "kind": "speed",
          "name": "Wild Sprint",
          "desc": "+5 speed.",
          "flat": 5
        },
        {
          "id": "anima_lorde_legendary_beasts",
          "kind": "victoryXp",
          "name": "Legendary Beasts",
          "desc": "+20% XP from victories.",
          "mult": 0.2
        }
      ],
      "baseClass": "beastmaster",
      "image": "/images/characters/anima_lorde.webp?v=mu0er997",
      "basicAttack": {
        "id": "alpha_strike",
        "name": "Alpha Strike",
        "power": 1.25,
        "element": "physical",
        "image": "/images/skills/alpha_strike.webp",
        "description": "Deals 8 + 1.25× attack damage.",
        "baseDamage": 8
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
        "attack": 9,
        "mana": 10,
        "resistance": 5,
        "magicPower": 5
      },
      "petSlots": 4,
      "petPowerMult": 2,
      "attackSpeed": 12
    },
    {
      "slug": "gardener",
      "label": "Gardener",
      "image": "/images/characters/gardener.webp?v=mu0eic48",
      "basicAttack": {
        "id": "garden_swipe",
        "name": "Garden Swipe",
        "power": 0.9,
        "element": "nature",
        "image": "/images/skills/vine_lash.webp",
        "description": "Deals 8 + 0.9× magic damage.",
        "baseDamage": 8
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
      },
      "tagline": "Nature Sprout",
      "lore": "A gardener who hears the forest whisper. Vines and thorns are their weapons. A patient player's pick.",
      "passives": [
        {
          "id": "gardener_living_bark",
          "kind": "shieldStart",
          "name": "Living Bark",
          "desc": "Start combat with a shield equal to 50% max HP (3 turns).",
          "pct": 0.5,
          "turns": 3
        }
      ],
      "attackSpeed": 2
    },
    {
      "slug": "rootbinder",
      "label": "Rootbinder",
      "passives": [
        {
          "id": "rootbinder_deep_roots",
          "kind": "shieldStart",
          "name": "Deep Roots",
          "desc": "Start combat with a shield equal to 60% max HP (3 turns).",
          "pct": 0.6,
          "turns": 3
        },
        {
          "id": "rootbinder_sap_flow",
          "kind": "regenBonus",
          "name": "Sap Flow",
          "desc": "+20% regeneration.",
          "mult": 0.2
        }
      ],
      "baseClass": "gardener",
      "evolution": {
        "level": 40,
        "to": "lifeweaver",
        "ascendTitle": "You have ascended to Lifeweaver!",
        "ascendColor": "#bef264",
        "ascendSound": "holy-ascensionsound"
      },
      "image": "/images/characters/rootbinder.webp?v=mu0fc3zv",
      "basicAttack": {
        "id": "root_lash",
        "name": "Root Lash",
        "power": 1.1,
        "element": "nature",
        "image": "/images/skills/thorn_volley.webp",
        "description": "Deals 8 + 1.1× magic damage.",
        "baseDamage": 8
      },
      "startingSkills": [
        "thorn_volley"
      ],
      "speed": 9,
      "manaRegen": 2,
      "hp": {
        "min": 750,
        "max": 900
      },
      "attack": {
        "min": 26,
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
        "min": 65,
        "max": 85
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
      },
      "attackSpeed": 14
    },
    {
      "slug": "lifeweaver",
      "label": "Lifeweaver",
      "passives": [
        {
          "id": "lifeweaver_worldbloom",
          "kind": "regenBonus",
          "name": "Worldbloom",
          "desc": "+40% regeneration.",
          "mult": 0.4
        },
        {
          "id": "lifeweaver_gentle_season",
          "kind": "healBonus",
          "name": "Gentle Season",
          "desc": "+30% healing.",
          "mult": 0.3
        },
        {
          "id": "lifeweaver_bark_sanctuary",
          "kind": "shieldStart",
          "name": "Bark Sanctuary",
          "desc": "Start combat with a shield equal to 40% max HP (4 turns).",
          "pct": 0.4,
          "turns": 4
        }
      ],
      "baseClass": "rootbinder",
      "image": "/images/characters/lifeweaver.webp?v=mu0fbhy5",
      "basicAttack": {
        "id": "bloom_burst",
        "name": "Bloom Burst",
        "power": 1.2,
        "element": "nature",
        "image": "/images/skills/forest_renewal.webp",
        "description": "Deals 8 + 1.2× magic damage.",
        "baseDamage": 8
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
      },
      "attackSpeed": -2
    },
    {
      "slug": "moderator",
      "label": "Moderator",
      "secret": "xx0mod0xx",
      "startLevel": 45,
      "image": "/images/characters/moderator.webp?v=mu0ehrbi",
      "basicAttack": {
        "id": "mod_strike",
        "name": "Mod Strike",
        "power": 1.5,
        "element": "arcane",
        "image": "/images/skills/meteor.webp",
        "description": "Deals 8 + 1.5× magic damage.",
        "baseDamage": 8
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
      },
      "attackSpeed": 4
    },
    {
      "slug": "ultra_moderator",
      "label": "Ultra Moderator",
      "passives": [
        {
          "id": "ultra_moderator_ban_hammer",
          "kind": "damageBonus",
          "name": "Ban Hammer",
          "desc": "+20% damage.",
          "mult": 0.2
        },
        {
          "id": "ultra_moderator_trophy_case",
          "kind": "victoryXp",
          "name": "Trophy Case",
          "desc": "+50% XP from victories.",
          "mult": 0.5
        },
        {
          "id": "ultra_moderator_confiscated",
          "kind": "victoryGold",
          "name": "Confiscated",
          "desc": "+50% gold from victories.",
          "mult": 0.5
        }
      ],
      "baseClass": "moderator",
      "image": "/images/characters/ultra_moderator.png",
      "basicAttack": {
        "id": "mod_obliterate",
        "name": "Mod Obliterate",
        "power": 1.8,
        "element": "arcane",
        "image": "/images/skills/cataclysm.webp",
        "description": "Deals 8 + 1.8× magic damage.",
        "baseDamage": 8
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
      },
      "attackSpeed": 6
    },
    {
      "slug": "tester",
      "label": "Tester",
      "secret": "test123",
      "startLevel": 20,
      "tagline": "Ascension Test Dummy",
      "lore": "A test vessel for trying ascension. Starts at level 20 with every chest, every egg and every evolution item in its pack.",
      "image": "/images/characters/tester.webp?v=mu0ehjel",
      "basicAttack": {
        "id": "slash",
        "name": "Slash",
        "power": 1,
        "element": "physical",
        "image": "/images/skills/slash.webp",
        "description": "Deals 8 + 1× attack damage.",
        "baseDamage": 8
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
      },
      "attackSpeed": 10
    },
    {
      "slug": "warlord",
      "label": "War Lord",
      "passives": [
        {
          "id": "warlord_battle_hunger",
          "kind": "damageBonus",
          "name": "Battle Hunger",
          "desc": "+15% damage.",
          "mult": 0.15
        },
        {
          "id": "warlord_undying",
          "kind": "secondWind",
          "name": "Undying Warlord",
          "desc": "Survive lethal damage once per combat at 1 HP."
        }
      ],
      "baseClass": "warrior",
      "evolution": {
        "level": 40,
        "to": "war_emperor"
      },
      "image": "/images/characters/warlord.webp?v=mu7hutcl",
      "basicAttack": {
        "id": "great_slash",
        "name": "Great Slash",
        "power": 1.2,
        "element": "physical",
        "image": "/images/skills/great_slash.webp",
        "description": "Deals 8 + 1.2× attack damage.",
        "baseDamage": 8
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
      },
      "attackSpeed": 2
    },
    {
      "slug": "warden",
      "label": "Warden",
      "passives": [
        {
          "id": "warden_true_aim",
          "kind": "damageBonus",
          "name": "True Aim",
          "desc": "+30% damage vs targets above 50% HP.",
          "aboveHpPct": 0.5,
          "mult": 0.3
        },
        {
          "id": "warden_piercing_shots",
          "kind": "pierce",
          "name": "Piercing Shots",
          "desc": "Shots pierce flat resistance.",
          "flat": 8
        }
      ],
      "baseClass": "ranger",
      "evolution": {
        "level": 40,
        "to": "storm_warden"
      },
      "image": "/images/characters/warden.webp?v=mu7qfi19",
      "basicAttack": {
        "id": "hunter_shot",
        "name": "Hunter Shot",
        "power": 1.05,
        "element": "physical",
        "image": "/images/skills/hunter_shot.webp",
        "description": "Deals 8 + 1.05× attack damage.",
        "baseDamage": 8
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
      },
      "attackSpeed": 10
    },
    {
      "slug": "archmage",
      "label": "Archmage",
      "passives": [
        {
          "id": "archmage_overmind",
          "kind": "statBonus",
          "name": "Overmind",
          "desc": "+20% magic power.",
          "stat": "magicPower",
          "pct": 0.2
        },
        {
          "id": "archmage_deep_well",
          "kind": "manaRegen",
          "name": "Deep Well",
          "desc": "+2 mana regen per round.",
          "flat": 2
        }
      ],
      "baseClass": "mage",
      "evolution": {
        "level": 40,
        "to": "archon"
      },
      "image": "/images/characters/archmage.webp?v=mu7qfomb",
      "basicAttack": {
        "id": "arcane_blast",
        "name": "Arcane Blast",
        "power": 1.1,
        "element": "arcane",
        "image": "/images/skills/arcane_blast.webp",
        "description": "Deals 8 + 1.1× magic damage.",
        "baseDamage": 8
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
      },
      "attackSpeed": 0
    },
    {
      "slug": "nightblade",
      "label": "Nightblade",
      "passives": [
        {
          "id": "nightblade_red_harvest",
          "kind": "damageBonus",
          "name": "Red Harvest",
          "desc": "+30% damage vs targets below 50% HP.",
          "belowHpPct": 0.5,
          "mult": 0.3
        },
        {
          "id": "nightblade_ghoststep",
          "kind": "dodge",
          "name": "Ghoststep",
          "desc": "10% chance to dodge attacks.",
          "chance": 0.1
        }
      ],
      "baseClass": "rogue",
      "evolution": {
        "level": 40,
        "to": "shade_king"
      },
      "image": "/images/characters/nightblade.webp?v=mu7sia0r",
      "basicAttack": {
        "id": "shadow_stab",
        "name": "Shadow Stab",
        "power": 1.1,
        "element": "shadow",
        "image": "/images/skills/shadow_stab.webp",
        "description": "Deals 8 + 1.1× magic damage.",
        "baseDamage": 8
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
      },
      "attackSpeed": 24
    },
    {
      "slug": "crusader",
      "label": "Crusader",
      "passives": [
        {
          "id": "crusader_bulwark_of_dawn",
          "kind": "damageTaken",
          "name": "Bulwark of Dawn",
          "desc": "Take 40% less damage (true damage excluded).",
          "mult": -0.4
        },
        {
          "id": "crusader_dawn_ward_greater",
          "kind": "shieldStart",
          "name": "Greater Dawn Ward",
          "desc": "Start combat with a shield equal to 25% max HP (4 turns).",
          "pct": 0.25,
          "turns": 4
        }
      ],
      "baseClass": "paladin",
      "evolution": {
        "level": 40,
        "to": "lightbringer"
      },
      "image": "/images/characters/crusader.webp?v=mu7s5q2g",
      "basicAttack": {
        "id": "blessed_blade",
        "name": "Blessed Blade",
        "power": 1.1,
        "element": "holy",
        "image": "/images/skills/blessed_blade.webp",
        "description": "Deals 8 + 1.1× attack damage.",
        "baseDamage": 8
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
      },
      "attackSpeed": -2
    },
    {
      "slug": "reaper",
      "label": "Reaper",
      "passives": [
        {
          "id": "reaper_reap_the_weak",
          "kind": "execute",
          "name": "Reap the Weak",
          "desc": "Your hits execute targets at or below 15% HP.",
          "finishBelowHpPct": 0.15
        },
        {
          "id": "reaper_soul_siphon",
          "kind": "lifesteal",
          "name": "Soul Siphon",
          "desc": "Heal 10% of all damage dealt.",
          "pct": 0.1
        }
      ],
      "baseClass": "assassin",
      "evolution": {
        "level": 40,
        "to": "death_lord"
      },
      "image": "/images/characters/reaper.webp?v=mu7qhiri",
      "basicAttack": {
        "id": "reap",
        "name": "Reap",
        "power": 1.2,
        "element": "shadow",
        "image": "/images/skills/reap.webp",
        "description": "Deals 8 + 1.2× magic damage.",
        "baseDamage": 8
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
      },
      "attackSpeed": 18
    },
    {
      "slug": "high_priest",
      "label": "High Priest",
      "passives": [
        {
          "id": "high_priest_benediction",
          "kind": "healBonus",
          "name": "Greater Benediction",
          "desc": "+35% healing.",
          "mult": 0.35
        },
        {
          "id": "high_priest_renewing_light",
          "kind": "regenBonus",
          "name": "Renewing Light",
          "desc": "+25% regeneration.",
          "mult": 0.25
        }
      ],
      "baseClass": "support",
      "evolution": {
        "level": 40,
        "to": "divine_saint"
      },
      "image": "/images/characters/high_priest.webp?v=mu7qgmik",
      "basicAttack": {
        "id": "hallowed_bolt",
        "name": "Hallowed Bolt",
        "power": 1,
        "element": "holy",
        "image": "/images/skills/hallowed_bolt.webp",
        "description": "Deals 8 + 1× attack damage.",
        "baseDamage": 8
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
      },
      "attackSpeed": -6
    },
    {
      "slug": "juggernaut",
      "label": "Juggernaut",
      "passives": [
        {
          "id": "juggernaut_avalanche_hide",
          "kind": "thorns",
          "name": "Avalanche Hide",
          "desc": "Reflect 25% of damage taken.",
          "mult": 0.25
        },
        {
          "id": "juggernaut_siege_flesh",
          "kind": "damageTaken",
          "name": "Siege Flesh",
          "desc": "Take 15% less damage (true damage excluded).",
          "mult": -0.15
        }
      ],
      "baseClass": "tank",
      "evolution": {
        "level": 40,
        "to": "colossus"
      },
      "image": "/images/characters/juggernaut.webp?v=mu0fnmks",
      "basicAttack": {
        "id": "adamant_bash",
        "name": "Adamant Bash",
        "power": 0.95,
        "element": "physical",
        "effect": "heavy_hammer_slam",
        "image": "/images/skills/adamant_bash.webp",
        "description": "Deals 8 + 0.95× attack damage.",
        "baseDamage": 8
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
      },
      "attackSpeed": -14
    },
    {
      "slug": "war_emperor",
      "label": "War Emperor",
      "passives": [
        {
          "id": "war_emperor_conqueror_aura",
          "kind": "damageBonus",
          "name": "Conqueror's Aura",
          "desc": "+25% damage.",
          "mult": 0.25
        },
        {
          "id": "war_emperor_no_survivors",
          "kind": "overkill",
          "name": "No Survivors",
          "desc": "Excess killing damage crashes into another foe."
        },
        {
          "id": "war_emperor_imperial_decree",
          "kind": "execute",
          "name": "Imperial Decree",
          "desc": "Your hits execute targets at or below 10% HP.",
          "finishBelowHpPct": 0.1
        }
      ],
      "baseClass": "warlord",
      "image": "/images/characters/war_emperor.webp?v=mu7qi09a",
      "basicAttack": {
        "id": "colossal_slash",
        "name": "Colossal Slash",
        "power": 1.3,
        "element": "physical",
        "image": "/images/skills/colossal_slash.webp",
        "description": "Deals 8 + 1.3× attack damage.",
        "baseDamage": 8
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
      },
      "attackSpeed": 0
    },
    {
      "slug": "storm_warden",
      "label": "Storm Warden",
      "passives": [
        {
          "id": "storm_warden_storms_judgment",
          "kind": "damageBonus",
          "name": "Storm's Judgment",
          "desc": "+35% damage vs targets above 50% HP.",
          "aboveHpPct": 0.5,
          "mult": 0.35
        },
        {
          "id": "storm_warden_second_bolt",
          "kind": "echo",
          "name": "Second Bolt",
          "desc": "25% chance to strike again for 40% damage.",
          "chance": 0.25,
          "mult": 0.4
        }
      ],
      "baseClass": "warden",
      "image": "/images/characters/storm_warden.webp?v=mu7s1c49",
      "basicAttack": {
        "id": "storm_shot",
        "name": "Storm Shot",
        "power": 1.15,
        "element": "physical",
        "image": "/images/skills/storm_shot.webp",
        "description": "Deals 8 + 1.15× attack damage.",
        "baseDamage": 8
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
      },
      "attackSpeed": 16
    },
    {
      "slug": "archon",
      "label": "Archon",
      "passives": [
        {
          "id": "archon_cosmic_mind",
          "kind": "statBonus",
          "name": "Cosmic Mind",
          "desc": "+30% magic power.",
          "stat": "magicPower",
          "pct": 0.3
        },
        {
          "id": "archon_star_thirst",
          "kind": "manaOnKill",
          "name": "Star Thirst",
          "desc": "Regain 8 mana on kill.",
          "flat": 8
        }
      ],
      "baseClass": "archmage",
      "image": "/images/characters/archon.webp?v=mu7qrqou",
      "basicAttack": {
        "id": "primordial_bolt",
        "name": "Primordial Bolt",
        "power": 1.2,
        "element": "arcane",
        "image": "/images/skills/primordial_bolt.webp",
        "description": "Deals 8 + 1.2× magic damage.",
        "baseDamage": 8
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
      },
      "attackSpeed": 4
    },
    {
      "slug": "shade_king",
      "label": "Shade King",
      "passives": [
        {
          "id": "shade_king_eclipse_reign",
          "kind": "damageBonus",
          "name": "Eclipse Reign",
          "desc": "+35% damage vs targets below 50% HP.",
          "belowHpPct": 0.5,
          "mult": 0.35
        },
        {
          "id": "shade_king_untouchable",
          "kind": "dodge",
          "name": "Untouchable",
          "desc": "15% chance to dodge attacks.",
          "chance": 0.15
        }
      ],
      "baseClass": "nightblade",
      "image": "/images/characters/shade_king.webp?v=mu7scjzg",
      "basicAttack": {
        "id": "eclipse_strike",
        "name": "Eclipse Strike",
        "power": 1.2,
        "element": "shadow",
        "image": "/images/skills/eclipse_strike.webp",
        "description": "Deals 8 + 1.2× magic damage.",
        "baseDamage": 8
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
      },
      "attackSpeed": 20
    },
    {
      "slug": "lightbringer",
      "label": "Lightbringer",
      "passives": [
        {
          "id": "lightbringer_dawn_incarnate",
          "kind": "damageTaken",
          "name": "Dawn Incarnate",
          "desc": "Take 40% less damage (true damage excluded).",
          "mult": -0.4
        },
        {
          "id": "lightbringer_radiant_mercy",
          "kind": "healBonus",
          "name": "Radiant Mercy",
          "desc": "+30% healing.",
          "mult": 0.3
        },
        {
          "id": "lightbringer_halo_wall",
          "kind": "shieldStart",
          "name": "Halo Wall",
          "desc": "Start combat with a shield equal to 20% max HP (4 turns).",
          "pct": 0.2,
          "turns": 4
        }
      ],
      "baseClass": "crusader",
      "image": "/images/characters/lightbringer.webp?v=mu7s66gf",
      "basicAttack": {
        "id": "radiant_edge",
        "name": "Radiant Edge",
        "power": 1.2,
        "element": "holy",
        "image": "/images/skills/radiant_edge.webp",
        "description": "Deals 8 + 1.2× attack damage.",
        "baseDamage": 8
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
      },
      "attackSpeed": 0
    },
    {
      "slug": "death_lord",
      "label": "Death Lord",
      "passives": [
        {
          "id": "death_lord_deaths_due",
          "kind": "hpBurn",
          "name": "Death's Due",
          "desc": "Hits burn 4% of target max HP as exact damage (max 400).",
          "pct": 0.04,
          "cap": 400
        },
        {
          "id": "death_lord_soul_feast",
          "kind": "lifesteal",
          "name": "Soul Feast",
          "desc": "Heal 12% of all damage dealt.",
          "pct": 0.12
        },
        {
          "id": "death_lord_final_word",
          "kind": "execute",
          "name": "Final Word",
          "desc": "Your hits execute targets at or below 20% HP.",
          "finishBelowHpPct": 0.2
        }
      ],
      "baseClass": "reaper",
      "image": "/images/characters/death_lord.webp?v=mu7s3fq1",
      "basicAttack": {
        "id": "scythe_sweep",
        "name": "Scythe Sweep",
        "power": 1.3,
        "element": "shadow",
        "image": "/images/skills/scythe_sweep.webp",
        "description": "Deals 8 + 1.3× magic damage.",
        "baseDamage": 8
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
      },
      "attackSpeed": 16
    },
    {
      "slug": "bloodspawn",
      "label": "Bloodspawn",
      "obtain": "dialogue:uncle",
      "passives": [
        {
          "id": "bloodspawn_sanguine_hunger",
          "kind": "lifesteal",
          "name": "Sanguine Hunger",
          "desc": "Heal 10% of all damage dealt.",
          "pct": 0.1
        },
        {
          "id": "bloodspawn_apex_predator",
          "kind": "damageBonus",
          "name": "Apex Predator",
          "desc": "+15% damage vs targets above 70% HP.",
          "aboveHpPct": 0.7,
          "mult": 0.15
        }
      ],
      "baseClass": "assassin",
      "tagline": "Fledgling of the Old Blood",
      "lore": "An assassin who knelt before Old Vesryn and rose thirsting. Fast, cruel, and forever barred from any other path.",
      "image": "/images/characters/bloodspawn.png",
      "basicAttack": {
        "id": "vampire_bite",
        "name": "Vampire Bite",
        "power": 1.3,
        "element": "blood",
        "scaling": "attack",
        "image": "/images/skills/exsanguinate.webp",
        "description": "Deals 8 + 1.3× attack damage.",
        "baseDamage": 8
      },
      "startingSkills": [
        "vampiric_strike"
      ],
      "speed": 17,
      "hp": {
        "min": 380,
        "max": 450
      },
      "attack": {
        "min": 52,
        "max": 66
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
        "min": 4,
        "max": 8
      },
      "growth": {
        "hp": 11,
        "attack": 8,
        "mana": 2,
        "resistance": 1,
        "magicPower": 2,
        "healPower": 1,
        "critChance": 1,
        "critDamage": 2
      },
      "evolveBonus": {
        "hp": 40,
        "attack": 14,
        "mana": 10,
        "resistance": 3,
        "magicPower": 4,
        "healPower": 3
      },
      "evolutions": [
        {
          "level": 40,
          "to": "bloodlord",
          "requiredItem": "primeval_cruor",
          "requiredItemCount": 5,
          "requirementType": "level_and_item",
          "requiresVampire": true
        }
      ],
      "evolution": {
        "level": 40,
        "to": "bloodlord",
        "requiredItem": "primeval_cruor",
        "requiredItemCount": 5,
        "requirementType": "level_and_item",
        "requiresVampire": true
      },
      "attackSpeed": 22
    },
    {
      "slug": "bloodlord",
      "label": "Bloodlord",
      "passives": [
        {
          "id": "bloodlord_blood_tyranny",
          "kind": "lifesteal",
          "name": "Blood Tyranny",
          "desc": "Heal 15% of all damage dealt.",
          "pct": 0.15
        },
        {
          "id": "bloodlord_crimson_verdict",
          "kind": "execute",
          "name": "Crimson Verdict",
          "desc": "Your hits execute targets at or below 15% HP.",
          "finishBelowHpPct": 0.15
        },
        {
          "id": "bloodlord_red_reign",
          "kind": "damageBonus",
          "name": "Red Reign",
          "desc": "+20% damage.",
          "mult": 0.2
        }
      ],
      "baseClass": "bloodspawn",
      "tagline": "Tyrant of the Thirst",
      "lore": "A Bloodspawn that gorged for twenty levels and rose higher. The physical peak of the old blood — nothing else can become this.",
      "image": "/images/characters/bloodlord.png",
      "basicAttack": {
        "id": "tyrant_bite",
        "name": "Tyrant Bite",
        "power": 1.4,
        "element": "blood",
        "scaling": "attack",
        "image": "/images/skills/bloodbath.webp",
        "description": "Deals 10 + 1.4× attack damage.",
        "baseDamage": 10
      },
      "startingSkills": [
        "bloodbath"
      ],
      "speed": 17,
      "hp": {
        "min": 400,
        "max": 470
      },
      "attack": {
        "min": 58,
        "max": 72
      },
      "mana": {
        "min": 26,
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
        "min": 4,
        "max": 8
      },
      "growth": {
        "hp": 12,
        "attack": 9,
        "mana": 2,
        "resistance": 2,
        "magicPower": 2,
        "healPower": 1,
        "critChance": 1,
        "critDamage": 2
      },
      "evolveBonus": {
        "hp": 48,
        "attack": 16,
        "mana": 12,
        "resistance": 5,
        "magicPower": 5,
        "healPower": 3
      },
      "attackSpeed": 14
    },
    {
      "slug": "gloomspawn",
      "label": "Gloomspawn",
      "obtain": "dialogue:uncle",
      "passives": [
        {
          "id": "gloomspawn_moonlit_thirst",
          "kind": "lifesteal",
          "name": "Moonlit Thirst",
          "desc": "Heal 10% of all damage dealt.",
          "pct": 0.1
        },
        {
          "id": "gloomspawn_gloom_well",
          "kind": "manaRegen",
          "name": "Gloom Well",
          "desc": "+2 mana regen per round.",
          "flat": 2
        },
        {
          "id": "gloomspawn_occult_mind",
          "kind": "statBonus",
          "name": "Occult Mind",
          "desc": "+15% magic power.",
          "stat": "magicPower",
          "pct": 0.15
        }
      ],
      "baseClass": "mage",
      "tagline": "Acolyte of the Gloom",
      "lore": "A mage who knelt before Old Vesryn and bound the cruor into spellcraft. The magical twin of the Bloodspawn — no other path leads here.",
      "image": "/images/characters/gloomspawn.png",
      "basicAttack": {
        "id": "gloom_bolt",
        "name": "Gloom Bolt",
        "power": 1.3,
        "element": "blood",
        "scaling": "magicPower",
        "image": "/images/skills/crimson_rebirth.webp",
        "description": "Deals 10 + 1.3× magic damage.",
        "baseDamage": 10
      },
      "startingSkills": [
        "crimson_rebirth"
      ],
      "speed": 13,
      "hp": {
        "min": 360,
        "max": 430
      },
      "attack": {
        "min": 26,
        "max": 36
      },
      "mana": {
        "min": 44,
        "max": 58
      },
      "resistance": {
        "min": 10,
        "max": 16
      },
      "magicPower": {
        "min": 34,
        "max": 46
      },
      "healPower": {
        "min": 8,
        "max": 14
      },
      "growth": {
        "hp": 10,
        "attack": 3,
        "mana": 5,
        "resistance": 1,
        "magicPower": 8,
        "healPower": 2,
        "critChance": 1,
        "critDamage": 2
      },
      "evolveBonus": {
        "hp": 40,
        "attack": 5,
        "mana": 22,
        "resistance": 3,
        "magicPower": 14,
        "healPower": 4
      },
      "evolutions": [
        {
          "level": 40,
          "to": "sanguine_lord",
          "requiredItem": "primeval_cruor",
          "requiredItemCount": 5,
          "requirementType": "level_and_item",
          "requiresVampire": true
        }
      ],
      "evolution": {
        "level": 40,
        "to": "sanguine_lord",
        "requiredItem": "primeval_cruor",
        "requiredItemCount": 5,
        "requirementType": "level_and_item",
        "requiresVampire": true
      },
      "attackSpeed": 8
    },
    {
      "slug": "sanguine_lord",
      "label": "Sanguine Lord",
      "passives": [
        {
          "id": "sanguine_lord_first_thirst",
          "kind": "lifesteal",
          "name": "First Thirst",
          "desc": "Heal 20% of all damage dealt.",
          "pct": 0.2
        },
        {
          "id": "sanguine_lord_crimson_grace",
          "kind": "healBonus",
          "name": "Crimson Grace",
          "desc": "+30% healing.",
          "mult": 0.3
        },
        {
          "id": "sanguine_lord_soul_vintage",
          "kind": "manaOnKill",
          "name": "Soul Vintage",
          "desc": "Regain 8 mana on kill.",
          "flat": 8
        }
      ],
      "baseClass": "gloomspawn",
      "tagline": "Heir of the First Thirst",
      "lore": "A mage who completed Vesryn's rite and bound the primeval cruor into spellcraft. Peerless blood magic — open only to those the rite has marked.",
      "image": "/images/characters/sanguine_lord.png",
      "basicAttack": {
        "id": "sanguine_bolt",
        "name": "Sanguine Bolt",
        "power": 1.3,
        "element": "blood",
        "scaling": "magicPower",
        "image": "/images/skills/crimson_rebirth.webp",
        "description": "Deals 10 + 1.3× magic damage.",
        "baseDamage": 10
      },
      "startingSkills": [
        "crimson_rebirth"
      ],
      "speed": 14,
      "hp": {
        "min": 360,
        "max": 430
      },
      "attack": {
        "min": 28,
        "max": 38
      },
      "mana": {
        "min": 42,
        "max": 56
      },
      "resistance": {
        "min": 10,
        "max": 16
      },
      "magicPower": {
        "min": 32,
        "max": 44
      },
      "healPower": {
        "min": 8,
        "max": 14
      },
      "growth": {
        "hp": 10,
        "attack": 3,
        "mana": 5,
        "resistance": 1,
        "magicPower": 8,
        "healPower": 2,
        "critChance": 1,
        "critDamage": 2
      },
      "evolveBonus": {
        "hp": 40,
        "attack": 5,
        "mana": 22,
        "resistance": 3,
        "magicPower": 14,
        "healPower": 4
      },
      "attackSpeed": 12
    },
    {
      "slug": "divine_saint",
      "label": "Divine Saint",
      "passives": [
        {
          "id": "divine_saint_miracle",
          "kind": "healBonus",
          "name": "Miracle",
          "desc": "+50% healing.",
          "mult": 0.5
        },
        {
          "id": "divine_saint_martyrs_return",
          "kind": "secondWind",
          "name": "Martyr's Return",
          "desc": "Survive lethal damage once per combat at 1 HP."
        },
        {
          "id": "divine_saint_everlasting_grace",
          "kind": "regenBonus",
          "name": "Everlasting Grace",
          "desc": "+30% regeneration.",
          "mult": 0.3
        }
      ],
      "baseClass": "high_priest",
      "image": "/images/characters/divine_saint.webp?v=mu7s6k9a",
      "basicAttack": {
        "id": "divine_light",
        "name": "Divine Light",
        "power": 1.1,
        "element": "holy",
        "image": "/images/skills/divine_light.webp",
        "description": "Deals 8 + 1.1× attack damage.",
        "baseDamage": 8
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
      },
      "attackSpeed": -4
    },
    {
      "slug": "colossus",
      "label": "Colossus",
      "passives": [
        {
          "id": "colossus_mountains_spite",
          "kind": "thorns",
          "name": "Mountain's Spite",
          "desc": "Reflect 35% of damage taken.",
          "mult": 0.35
        },
        {
          "id": "colossus_bedrock_form",
          "kind": "damageTaken",
          "name": "Bedrock Form",
          "desc": "Take 20% less damage (true damage excluded).",
          "mult": -0.2
        },
        {
          "id": "colossus_gate_of_stone",
          "kind": "shieldStart",
          "name": "Gate of Stone",
          "desc": "Start combat with a shield equal to 30% max HP (5 turns).",
          "pct": 0.3,
          "turns": 5
        }
      ],
      "baseClass": "juggernaut",
      "image": "/images/characters/colossus.webp?v=mu0ft8go",
      "basicAttack": {
        "id": "titan_slam",
        "name": "Titan Slam",
        "power": 1.05,
        "element": "physical",
        "effect": "heavy_hammer_slam",
        "image": "/images/skills/titan_slam.webp",
        "description": "Deals 8 + 1.05× attack damage.",
        "baseDamage": 8
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
      },
      "attackSpeed": -16
    }
  ],
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
  "skills": [
    {
      "id": "boss_ember_skill1",
      "name": "Ember Strike",
      "target": "enemy",
      "mana": 6,
      "power": 1.6,
      "element": "fire",
      "effect": "fire_meteor_crash",
      "image": "/images/skills/boss_ember_skill1.webp",
      "description": "Deals 45 + 1.6× magic damage.",
      "baseDamage": 45
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
      "image": "/images/skills/boss_ember_skill2.webp",
      "description": "Deals 60 + 2.4× magic damage.",
      "baseDamage": 60
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
      "image": "/images/skills/boss_ember_skill3.webp",
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
      "image": "/images/skills/boss_ember_skill4.webp",
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
      "image": "/images/skills/boss_ember_skill5.webp",
      "description": "Deals 30 + 0.9× magic damage.",
      "baseDamage": 30
    },
    {
      "id": "boss_ember_skill6",
      "name": "Ember Heal",
      "target": "self",
      "mana": 10,
      "effect": "heal_aura_fountain",
      "healSelfPct": 0.25,
      "image": "/images/skills/boss_ember_skill6.webp",
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
      "image": "/images/skills/boss_frost_skill1.webp",
      "description": "Deals 45 + 1.6× magic damage.",
      "baseDamage": 45
    },
    {
      "id": "boss_frost_skill2",
      "name": "Frost Heavy",
      "target": "enemy",
      "mana": 10,
      "power": 2.4,
      "element": "frost",
      "effect": "heavy_hammer_slam",
      "image": "/images/skills/boss_frost_skill2.webp",
      "description": "Deals 60 + 2.4× magic damage.",
      "baseDamage": 60
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
      "image": "/images/skills/boss_frost_skill3.webp",
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
      "image": "/images/skills/boss_frost_skill4.webp",
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
      "image": "/images/skills/boss_frost_skill5.webp",
      "description": "Deals 30 + 0.9× magic damage.",
      "baseDamage": 30
    },
    {
      "id": "boss_frost_skill6",
      "name": "Frost Heal",
      "target": "self",
      "mana": 10,
      "effect": "heal_aura_fountain",
      "healSelfPct": 0.25,
      "image": "/images/skills/boss_frost_skill6.webp",
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
      "image": "/images/skills/boss_void_skill1.webp",
      "description": "Deals 45 + 1.7× magic damage.",
      "baseDamage": 45
    },
    {
      "id": "boss_void_skill2",
      "name": "Void Heavy",
      "target": "enemy",
      "mana": 10,
      "power": 2.5,
      "element": "shadow",
      "effect": "heavy_hammer_slam",
      "image": "/images/skills/boss_void_skill2.webp",
      "description": "Deals 60 + 2.5× magic damage.",
      "baseDamage": 60
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
      "image": "/images/skills/boss_void_skill3.webp",
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
      "image": "/images/skills/boss_void_skill4.webp",
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
      "image": "/images/skills/boss_void_skill5.webp",
      "description": "Deals 30 + 0.85× magic damage.",
      "baseDamage": 30
    },
    {
      "id": "boss_void_skill6",
      "name": "Void Heal",
      "target": "self",
      "mana": 10,
      "effect": "heal_aura_fountain",
      "healSelfPct": 0.3,
      "image": "/images/skills/boss_void_skill6.webp",
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
      "image": "/images/skills/boss_storm_skill1.webp",
      "description": "Deals 45 + 1.7× magic damage.",
      "baseDamage": 45
    },
    {
      "id": "boss_storm_skill2",
      "name": "Storm Heavy",
      "target": "enemy",
      "mana": 10,
      "power": 2.5,
      "element": "arcane",
      "effect": "heavy_hammer_slam",
      "image": "/images/skills/boss_storm_skill2.webp",
      "description": "Deals 60 + 2.5× magic damage.",
      "baseDamage": 60
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
      "image": "/images/skills/boss_storm_skill3.webp",
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
      "image": "/images/skills/boss_storm_skill4.webp",
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
      "image": "/images/skills/boss_storm_skill5.webp",
      "description": "Deals 30 + 0.9× magic damage.",
      "baseDamage": 30
    },
    {
      "id": "boss_storm_skill6",
      "name": "Storm Heal",
      "target": "self",
      "mana": 10,
      "effect": "heal_aura_fountain",
      "healSelfPct": 0.25,
      "image": "/images/skills/boss_storm_skill6.webp",
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
      "image": "/images/skills/boss_world_skill1.webp",
      "description": "Deals 60 + 1.8× attack damage.",
      "baseDamage": 60
    },
    {
      "id": "boss_world_skill2",
      "name": "World Heavy",
      "target": "enemy",
      "mana": 10,
      "power": 2.6,
      "element": "physical",
      "effect": "heavy_hammer_slam",
      "image": "/images/skills/boss_world_skill2.webp",
      "description": "Deals 60 + 2.6× attack damage.",
      "baseDamage": 60
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
      "image": "/images/skills/boss_world_skill3.webp",
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
      "image": "/images/skills/boss_world_skill4.webp",
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
      "image": "/images/skills/boss_world_skill5.webp",
      "description": "Deals 30 + 1× attack damage.",
      "baseDamage": 30
    },
    {
      "id": "boss_world_skill6",
      "name": "World Heal",
      "target": "self",
      "mana": 10,
      "effect": "heal_aura_fountain",
      "healSelfPct": 0.35,
      "image": "/images/skills/boss_world_skill6.webp",
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
      "image": "/images/skills/heavy_strike.webp",
      "description": "Deals 30 + 1.6× attack damage.",
      "baseDamage": 30
    },
    {
      "id": "defend",
      "name": "Defend",
      "target": "self",
      "mana": 4,
      "defense": 0.5,
      "image": "/images/skills/defend.webp",
      "description": "Block 50% of incoming damage this round."
    },
    {
      "id": "arcane_barrage",
      "cooldown": 2,
      "name": "Arcane Barrage",
      "target": "enemy",
      "mana": 8,
      "power": 1.9,
      "element": "arcane",
      "image": "/images/skills/arcane_barrage.webp",
      "description": "Deals 45 + 1.9× magic damage.",
      "baseDamage": 45
    },
    {
      "id": "mana_shield",
      "name": "Mana Shield",
      "target": "self",
      "mana": 6,
      "defense": 0.55,
      "image": "/images/skills/mana_shield.webp",
      "description": "Block 55% of incoming damage this round."
    },
    {
      "id": "aimed_shot",
      "cooldown": 2,
      "name": "Aimed Shot",
      "target": "enemy",
      "mana": 10,
      "power": 2,
      "element": "physical",
      "image": "/images/skills/aimed_shot.webp",
      "description": "Deals 45 + 2× attack damage.",
      "baseDamage": 45
    },
    {
      "id": "piercing_shot",
      "name": "Piercing Shot",
      "target": "enemy",
      "mana": 5,
      "power": 1.3,
      "element": "physical",
      "image": "/images/skills/piercing_shot.webp",
      "description": "Deals 30 + 1.3× attack damage.",
      "baseDamage": 30
    },
    {
      "id": "vampiric_strike",
      "cooldown": 3,
      "name": "Vampiric Strike",
      "target": "enemy",
      "mana": 9,
      "power": 2,
      "lifesteal": 0.5,
      "element": "shadow",
      "effect": "shadow_scythe_reap",
      "image": "/images/skills/vampiric_strike.webp",
      "description": "Deals 45 + 2× magic damage. Heals for half the damage dealt.",
      "baseDamage": 45
    },
    {
      "id": "shadow_meld",
      "name": "Shadow Meld",
      "target": "self",
      "mana": 5,
      "defense": 0.5,
      "image": "/images/skills/shadow_meld.webp",
      "description": "Block 50% of incoming damage this round."
    },
    {
      "id": "holy_strike",
      "name": "Holy Strike",
      "target": "enemy",
      "mana": 7,
      "power": 1.5,
      "element": "holy",
      "image": "/images/skills/holy_strike.webp",
      "description": "Deals 30 + 1.5× attack damage.",
      "baseDamage": 30
    },
    {
      "id": "divine_guard",
      "name": "Divine Guard",
      "target": "self",
      "mana": 6,
      "defense": 0.6,
      "image": "/images/skills/divine_guard.webp",
      "description": "Block 60% of incoming damage this round."
    },
    {
      "id": "execute",
      "cooldown": 3,
      "name": "Execute",
      "target": "enemy",
      "mana": 12,
      "power": 2.5,
      "element": "shadow",
      "effect": "shadow_scythe_reap",
      "image": "/images/skills/execute.webp",
      "description": "Deals 65 + 2.5x magic TRUE damage. Exact — ignores all reductions.",
      "baseDamage": 65,
      "trueDamage": true
    },
    {
      "id": "shadow_step",
      "name": "Shadow Step",
      "target": "self",
      "mana": 5,
      "defense": 0.5,
      "image": "/images/skills/shadow_step.webp",
      "description": "Block 50% of incoming damage this round."
    },
    {
      "id": "mend",
      "cooldown": 2,
      "name": "Mend",
      "target": "ally",
      "mana": 8,
      "heal": 0.35,
      "image": "/images/skills/mend.webp",
      "description": "Restore 35% of an ally's max HP."
    },
    {
      "id": "greater_mend",
      "cooldown": 3,
      "name": "Greater Mend",
      "target": "ally",
      "mana": 14,
      "heal": 0.55,
      "image": "/images/skills/greater_mend.webp",
      "description": "Restore 55% of an ally's max HP."
    },
    {
      "id": "fortify",
      "name": "Fortify",
      "target": "self",
      "mana": 6,
      "defense": 0.6,
      "image": "/images/skills/fortify.webp",
      "description": "Block 60% of incoming damage this round."
    },
    {
      "id": "war_banner",
      "name": "War Banner",
      "target": "self",
      "mana": 5,
      "defense": 0.5,
      "image": "/images/skills/war_banner.webp",
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
      "image": "/images/skills/cleave.webp",
      "description": "Deals 30 + 1.5× attack damage.",
      "baseDamage": 30
    },
    {
      "id": "shield_wall",
      "cooldown": 2,
      "name": "Shield Wall",
      "target": "self",
      "mana": 7,
      "defense": 0.7,
      "image": "/images/skills/shield_wall.webp",
      "description": "Block 70% of incoming damage this round."
    },
    {
      "id": "spirit_surge",
      "cooldown": 3,
      "name": "Spirit Surge",
      "target": "party",
      "mana": 6,
      "manaRestorePct": 0.3,
      "image": "/images/skills/spirit_surge.webp",
      "description": "Restore 30% of each ally's max mana."
    },
    {
      "id": "war_cry",
      "cooldown": 3,
      "name": "War Cry",
      "target": "enemy",
      "mana": 10,
      "power": 2.6,
      "element": "physical",
      "effect": "heavy_hammer_slam",
      "image": "/images/skills/war_cry.webp",
      "description": "Deals 65 + 2.6× attack damage.",
      "baseDamage": 65
    },
    {
      "id": "volley",
      "cooldown": 3,
      "name": "Volley",
      "target": "enemy",
      "mana": 12,
      "power": 2.4,
      "element": "physical",
      "image": "/images/skills/volley.webp",
      "description": "Deals 65 + 2.4× attack damage.",
      "baseDamage": 65
    },
    {
      "id": "meteor",
      "cooldown": 4,
      "name": "Meteor",
      "target": "enemy",
      "mana": 14,
      "power": 2.8,
      "element": "arcane",
      "effect": "heavy_hammer_slam",
      "image": "/images/skills/meteor.webp",
      "description": "Deals 65 + 2.8× magic damage.",
      "baseDamage": 65
    },
    {
      "id": "shadow_veil",
      "cooldown": 3,
      "name": "Shadow Veil",
      "target": "enemy",
      "mana": 10,
      "power": 2.6,
      "lifesteal": 0.4,
      "element": "shadow",
      "effect": "shadow_scythe_reap",
      "image": "/images/skills/shadow_veil.webp",
      "description": "Deals 65 + 2.6× magic damage. Heals for 40% of the damage dealt.",
      "baseDamage": 65
    },
    {
      "id": "holy_judgement",
      "cooldown": 3,
      "name": "Holy Judgement",
      "target": "enemy",
      "mana": 10,
      "power": 2.2,
      "healSelfPct": 0.4,
      "element": "holy",
      "image": "/images/skills/holy_judgement.webp",
      "description": "Deals 45 + 2.2× attack damage. Restores 40% of your max HP.",
      "baseDamage": 45
    },
    {
      "id": "death_mark",
      "cooldown": 4,
      "name": "Death Mark",
      "target": "enemy",
      "mana": 14,
      "power": 3,
      "element": "shadow",
      "effect": "shadow_scythe_reap",
      "image": "/images/skills/death_mark.webp",
      "description": "Deals 85 + 3x magic damage.",
      "baseDamage": 85
    },
    {
      "id": "divine_blessing",
      "cooldown": 4,
      "name": "Divine Blessing",
      "target": "party",
      "mana": 16,
      "heal": 0.45,
      "image": "/images/skills/divine_blessing.webp",
      "description": "Restore 45% of each ally's max HP."
    },
    {
      "id": "bastion",
      "cooldown": 3,
      "name": "Bastion",
      "target": "self",
      "mana": 8,
      "defense": 0.85,
      "image": "/images/skills/bastion.webp",
      "description": "Block 85% of incoming damage this round."
    },
    {
      "id": "cataclysm",
      "cooldown": 4,
      "name": "Cataclysm",
      "target": "enemy",
      "mana": 16,
      "power": 3,
      "element": "physical",
      "effect": "heavy_hammer_slam",
      "image": "/images/skills/cataclysm.webp",
      "description": "Deals 85 + 3× attack damage.",
      "baseDamage": 85
    },
    {
      "id": "storm_barrage",
      "cooldown": 4,
      "name": "Storm Barrage",
      "target": "enemy",
      "mana": 15,
      "power": 2.9,
      "element": "physical",
      "image": "/images/skills/storm_barrage.webp",
      "description": "Deals 85 + 2.9× attack damage.",
      "baseDamage": 85
    },
    {
      "id": "comet",
      "cooldown": 4,
      "name": "Comet",
      "target": "enemy",
      "mana": 18,
      "power": 3.2,
      "element": "arcane",
      "effect": "heavy_hammer_slam",
      "image": "/images/skills/comet.webp",
      "description": "Deals 85 + 3.2× magic damage.",
      "baseDamage": 85
    },
    {
      "id": "soul_thief",
      "cooldown": 4,
      "name": "Soul Thief",
      "target": "enemy",
      "mana": 14,
      "power": 3,
      "lifesteal": 0.5,
      "element": "shadow",
      "effect": "shadow_scythe_reap",
      "image": "/images/skills/soul_thief.webp",
      "description": "Deals 85 + 3× magic damage. Heals for half the damage dealt.",
      "baseDamage": 85
    },
    {
      "id": "radiance",
      "cooldown": 3,
      "name": "Radiance",
      "target": "enemy",
      "mana": 14,
      "power": 2.5,
      "healSelfPct": 0.6,
      "element": "holy",
      "image": "/images/skills/radiance.webp",
      "description": "Deals 65 + 2.5× attack damage. Restores 60% of your max HP.",
      "baseDamage": 65
    },
    {
      "id": "soul_reap",
      "cooldown": 5,
      "name": "Soul Reap",
      "target": "enemy",
      "mana": 18,
      "power": 3.4,
      "element": "shadow",
      "effect": "shadow_scythe_reap",
      "image": "/images/skills/soul_reap.webp",
      "description": "Deals 85 + 3.4× magic damage.",
      "baseDamage": 85
    },
    {
      "id": "resurgence",
      "cooldown": 5,
      "name": "Resurgence",
      "target": "party",
      "mana": 20,
      "heal": 0.6,
      "manaRestorePct": 0.2,
      "image": "/images/skills/resurgence.webp",
      "description": "Restore 60% of each ally's max HP and 20% of their max mana."
    },
    {
      "id": "exsanguinate",
      "cooldown": 4,
      "name": "Exsanguinate",
      "target": "enemy",
      "mana": 16,
      "power": 3.2,
      "lifesteal": 0.6,
      "element": "blood",
      "scaling": "attack",
      "effect": "blood_scythe",
      "hitShake": 3,
      "image": "/images/skills/exsanguinate.webp",
      "description": "Deals 90 + 3.2× attack damage. Heals you for 60% of the damage dealt.",
      "baseDamage": 90
    },
    {
      "id": "bloodbath",
      "cooldown": 5,
      "name": "Bloodbath",
      "target": "enemy",
      "mana": 20,
      "power": 3.6,
      "lifesteal": 0.4,
      "element": "blood",
      "scaling": "attack",
      "effect": "blood_scythe",
      "hitShake": 3,
      "image": "/images/skills/bloodbath.webp",
      "description": "Deals 95 + 3.6× attack damage. Heals you for 40% of the damage dealt.",
      "baseDamage": 95
    },
    {
      "id": "crimson_rebirth",
      "cooldown": 5,
      "name": "Crimson Rebirth",
      "target": "party",
      "mana": 22,
      "heal": 0.45,
      "manaRestorePct": 0.15,
      "element": "blood",
      "hitShake": 0,
      "image": "/images/skills/crimson_rebirth.webp",
      "description": "Restore 45% of each ally's max HP and 15% of their max mana with first blood."
    },
    {
      "id": "immovable",
      "cooldown": 4,
      "name": "Immovable",
      "target": "self",
      "mana": 10,
      "defense": 0.95,
      "image": "/images/skills/immovable.webp",
      "description": "Block 95% of incoming damage this round."
    },
    {
      "id": "seismic_slam",
      "cooldown": 3,
      "name": "Seismic Slam",
      "target": "enemy",
      "mana": 12,
      "power": 0,
      "baseDamage": {
        "stat": "maxHp",
        "mult": 0.08
      },
      "element": "physical",
      "effect": "heavy_hammer_slam",
      "hitShake": 2,
      "image": "/images/skills/seismic_slam.webp",
      "description": "Slam the ground with your whole weight: 8% of your max HP as damage."
    },
    {
      "id": "colossal_crash",
      "cooldown": 4,
      "name": "Colossal Crash",
      "target": "enemy",
      "mana": 18,
      "power": 0,
      "baseDamage": {
        "stat": "maxHp",
        "mult": 0.12
      },
      "element": "physical",
      "effect": "heavy_hammer_slam",
      "hitShake": 3,
      "image": "/images/skills/colossal_crash.webp",
      "description": "Crash down like a mountain: 12% of your max HP as damage."
    },
    {
      "id": "battle_fury",
      "cooldown": 3,
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
      "image": "/images/skills/battle_fury.webp",
      "description": "Increase your damage by 30% for 2 rounds."
    },
    {
      "id": "iron_wall",
      "cooldown": 3,
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
      "image": "/images/skills/iron_wall.webp",
      "description": "Block 40% of incoming damage for 2 rounds."
    },
    {
      "id": "group_guard",
      "cooldown": 3,
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
      "image": "/images/skills/group_guard.webp",
      "description": "The whole party blocks 25% of incoming damage for 2 rounds."
    },
    {
      "id": "cripple",
      "cooldown": 3,
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
      "image": "/images/skills/cripple.webp",
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
      "image": "/images/skills/venom_strike.webp",
      "description": "Deals 15 + 0.6× attack damage. Poisons the monster for 3 rounds.",
      "baseDamage": 15
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
      "image": "/images/skills/rejuvenate.webp",
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
      "description": "Deals 10 + 1.05× attack damage.",
      "baseDamage": 10
    },
    {
      "id": "monster_shadow_attack",
      "name": "Shadow Claw",
      "target": "enemy",
      "kind": "attack",
      "power": 1.15,
      "element": "shadow",
      "monster": true,
      "description": "Deals 10 + 1.15× magic damage.",
      "baseDamage": 10
    },
    {
      "id": "monster_arcane_attack",
      "name": "Arcane Surge",
      "target": "enemy",
      "kind": "attack",
      "power": 1.15,
      "element": "arcane",
      "monster": true,
      "description": "Deals 10 + 1.15× magic damage.",
      "baseDamage": 10
    },
    {
      "id": "monster_heavy_blow",
      "name": "Heavy Blow",
      "target": "enemy",
      "kind": "attack",
      "power": 1.5,
      "element": "physical",
      "monster": true,
      "description": "Deals 10 + 1.5× attack damage.",
      "baseDamage": 10
    },
    {
      "id": "monster_shadow_bolt",
      "name": "Shadow Bolt",
      "target": "enemy",
      "kind": "attack",
      "power": 1.5,
      "element": "shadow",
      "monster": true,
      "description": "Deals 10 + 1.5× magic damage.",
      "baseDamage": 10
    },
    {
      "id": "monster_arcane_storm",
      "name": "Arcane Storm",
      "target": "enemy",
      "kind": "attack",
      "power": 1.5,
      "element": "arcane",
      "monster": true,
      "description": "Deals 10 + 1.5× magic damage.",
      "baseDamage": 10
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
      "image": "/images/skills/aegis.webp",
      "description": "Gain 60 shield for 2 rounds."
    },
    {
      "id": "barrier",
      "cooldown": 3,
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
      "image": "/images/skills/barrier.webp",
      "description": "All allies gain 35 shield for 2 rounds."
    },
    {
      "id": "stone_skin",
      "cooldown": 3,
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
      "image": "/images/skills/stone_skin.webp",
      "description": "Gain 80 shield and 15% damage reduction."
    },
    {
      "id": "holy_ward",
      "cooldown": 2,
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
      "image": "/images/skills/holy_ward.webp",
      "description": "Give an ally 50 shield for 2 rounds."
    },
    {
      "id": "dark_veil",
      "cooldown": 2,
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
      "image": "/images/skills/dark_veil.webp",
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
      "cooldown": 2,
      "name": "Frost Bolt",
      "target": "enemy",
      "mana": 8,
      "power": 2,
      "element": "frost",
      "image": "/images/skills/frost_bolt.webp",
      "description": "Deals 45 + 2× magic damage. May freeze the target.",
      "baseDamage": 45
    },
    {
      "id": "frost_nova",
      "cooldown": 2,
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
      "image": "/images/skills/frost_nova.webp",
      "description": "Deals 45 + 1.8× magic damage. Freezes the target for 1 turn.",
      "baseDamage": 45
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
      "image": "/images/skills/water_splash.webp",
      "description": "Deals 30 + 1.5× magic damage. Soaks the target for 2 turns (wet).",
      "baseDamage": 30
    },
    {
      "id": "lightning_bolt",
      "cooldown": 2,
      "name": "Lightning Bolt",
      "target": "enemy",
      "mana": 9,
      "power": 1.8,
      "element": "lightning",
      "image": "/images/skills/lightning_bolt.webp",
      "description": "Deals 45 + 1.8× magic damage. +50% vs wet (Overcharge).",
      "baseDamage": 45
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
      "image": "/images/skills/war_heal.webp",
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
      "image": "/images/skills/magic_mend.webp",
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
      "image": "/images/skills/scorch_mark.webp",
      "description": "Deals 30 + 1.1× magic damage. Sets the foe burning.",
      "baseDamage": 30
    },
    {
      "id": "ember_storm",
      "cooldown": 2,
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
      "image": "/images/skills/ember_storm.webp",
      "description": "Deals 30 + 1.6× magic damage. Leaves the foe burning.",
      "baseDamage": 30
    },
    {
      "id": "blaze_rupture",
      "cooldown": 3,
      "name": "Blaze Rupture",
      "target": "enemy",
      "mana": 12,
      "power": 2.3,
      "element": "fire",
      "effect": "magma_eruption_burst",
      "image": "/images/skills/blaze_rupture.webp",
      "description": "Deals 65 + 2.3× magic damage. Burning targets take +60%.",
      "baseDamage": 65
    },
    {
      "id": "cold_snap",
      "cooldown": 2,
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
      "image": "/images/skills/cold_snap.webp",
      "description": "Deals 30 + 1.3× magic damage. Freezes the target for 2 rounds.",
      "baseDamage": 30
    },
    {
      "id": "glacial_shatter",
      "cooldown": 3,
      "name": "Glacial Shatter",
      "target": "enemy",
      "mana": 11,
      "power": 2.4,
      "element": "frost",
      "effect": "ice_spikes_ground",
      "image": "/images/skills/glacial_shatter.webp",
      "description": "Deals 65 + 2.4× magic damage. Frozen targets take +65%.",
      "baseDamage": 65
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
      "image": "/images/skills/volt_conduit.webp",
      "description": "Deals 30 + 1.2× magic damage. Electrifies the target.",
      "baseDamage": 30
    },
    {
      "id": "static_overload",
      "cooldown": 2,
      "name": "Static Overload",
      "target": "enemy",
      "mana": 11,
      "power": 2.2,
      "element": "lightning",
      "effect": "lightning_strike_heavy",
      "image": "/images/skills/static_overload.webp",
      "description": "Deals 45 + 2.2× magic damage. Wet targets take +50%.",
      "baseDamage": 45
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
      "image": "/images/skills/toxin_drench.webp",
      "description": "Deals 15 + 0.9× attack damage. Poisons the foe.",
      "baseDamage": 15
    },
    {
      "id": "venom_burst",
      "cooldown": 2,
      "name": "Venom Burst",
      "target": "enemy",
      "mana": 11,
      "power": 2.2,
      "element": "physical",
      "effect": "earth_fissure_rupture",
      "image": "/images/skills/venom_burst.webp",
      "description": "Deals 45 + 2.2× attack damage. Poisoned targets take +50%.",
      "baseDamage": 45
    },
    {
      "id": "broken_guard",
      "cooldown": 2,
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
      "image": "/images/skills/broken_guard.webp",
      "description": "Deals 15 + 1× attack damage. Foe takes 25% more, deals 20% less (2 rounds).",
      "baseDamage": 15
    },
    {
      "id": "shatter_point",
      "name": "Shatter Point",
      "target": "enemy",
      "mana": 8,
      "power": 1.6,
      "element": "physical",
      "effect": "piercing_rapier_thrust",
      "image": "/images/skills/shatter_point.webp",
      "description": "Deals 30 + 1.6× attack damage. Exposed targets take +80%.",
      "baseDamage": 30
    },
    {
      "id": "devastate",
      "cooldown": 3,
      "name": "Devastate",
      "target": "enemy",
      "mana": 12,
      "power": 2.6,
      "element": "physical",
      "effect": "heavy_hammer_slam",
      "image": "/images/skills/devastate.webp",
      "description": "Deals 65 + 2.6× attack damage. Weakened targets take +35%.",
      "baseDamage": 65
    },
    {
      "id": "vine_lash",
      "name": "Vine Lash",
      "target": "enemy",
      "mana": 6,
      "power": 1.4,
      "element": "nature",
      "effect": "nature_vine_burst",
      "image": "/images/skills/vine_lash.webp",
      "description": "Deals 30 + 1.4× magic damage.",
      "baseDamage": 30
    },
    {
      "id": "thorn_volley",
      "cooldown": 2,
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
      "image": "/images/skills/thorn_volley.webp",
      "description": "Deals 45 + 1.9× magic damage.",
      "baseDamage": 45
    },
    {
      "id": "forest_renewal",
      "name": "Forest Renewal",
      "target": "self",
      "mana": 10,
      "element": "nature",
      "effect": "heal_aura_fountain",
      "healSelfPct": 0.3,
      "image": "/images/skills/forest_renewal.webp",
      "description": "Bloom with nature's blessing, restoring 30% of your max HP."
    },
    {
      "id": "beast_bite",
      "name": "Beast Bite",
      "target": "enemy",
      "mana": 6,
      "power": 1.3,
      "baseDamage": 25,
      "element": "physical",
      "effect": "rising_katana_slash",
      "image": "/images/skills/beast_bite.webp",
      "description": "Deals 25 + 1.3× attack damage. Your companion tears into the foe."
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
      "image": "/images/items/egg_red.webp",
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
      "image": "/images/items/egg_green.webp",
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
      "image": "/images/items/egg_blue.webp",
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
      "image": "/images/items/egg_brown.webp",
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
      "image": "/images/items/egg_yellow.webp",
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
      "image": "/images/items/egg_purple.webp",
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
      "image": "/images/items/egg_cyan.webp",
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
      "image": "/images/items/egg_dark.webp",
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
      "image": "/images/items/egg_gold.webp",
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
        "attack": 6,
        "speed": 1,
        "attackSpeed": 2
      },
      "image": "/images/items/rusty_sword.webp",
      "description": "+6 Attack, +1 Speed"
    },
    {
      "id": "leather_helm",
      "setId": "leather",
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
      "image": "/images/items/leather_helm.webp",
      "description": "+30 Max HP, +4 Resistance"
    },
    {
      "id": "leather_chest",
      "setId": "leather",
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
      "image": "/images/items/leather_chest.webp",
      "description": "+50 Max HP, +6 Resistance"
    },
    {
      "id": "leather_pants",
      "setId": "leather",
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
      "image": "/images/items/leather_pants.webp",
      "description": "+35 Max HP, +5 Resistance"
    },
    {
      "id": "leather_boots",
      "setId": "leather",
      "name": "Leather Boots",
      "slot": "boots",
      "rarity": "common",
      "price": {
        "gold": 30,
        "wood": 8
      },
      "stats": {
        "speed": 1,
        "attackSpeed": 1
      },
      "image": "/images/items/leather_boots.webp",
      "description": "+1 Speed"
    },
    {
      "id": "iron_amulet",
      "setId": "iron",
      "name": "Iron Amulet",
      "slot": "amulet",
      "rarity": "uncommon",
      "price": {
        "gold": 45,
        "wood": 10
      },
      "stats": {
        "mana": 10,
        "magicPower": 3,
        "attackSpeed": 2
      },
      "image": "/images/items/iron_amulet.webp",
      "description": "+10 Mana, +3 Magic Power"
    },
    {
      "id": "iron_ring",
      "setId": "iron",
      "name": "Iron Ring",
      "slot": "ring",
      "rarity": "common",
      "price": {
        "gold": 40,
        "wood": 9
      },
      "stats": {
        "attack": 2,
        "mana": 5,
        "attackSpeed": 1
      },
      "image": "/images/items/iron_ring.webp",
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
        "manaRegen": 1,
        "attackSpeed": 3
      },
      "image": "/images/items/mana_talisman.webp",
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
        "attack": 8,
        "attackSpeed": 2
      },
      "image": "/images/items/battle_axe.webp",
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
        "attack": 12,
        "attackSpeed": 2
      },
      "image": "/images/items/war_hammer.webp",
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
        "speed": 1,
        "attackSpeed": 2
      },
      "image": "/images/items/longbow.webp",
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
        "speed": 2,
        "attackSpeed": 2
      },
      "image": "/images/items/shortbow.webp",
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
        "magicPower": 8,
        "attackSpeed": 2
      },
      "image": "/images/items/apprentice_staff.webp",
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
        "mana": 10,
        "attackSpeed": 3
      },
      "image": "/images/items/archon_staff.webp",
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
        "speed": 2,
        "attackSpeed": 2
      },
      "image": "/images/items/dagger.webp",
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
        "attack": 7,
        "attackSpeed": 2
      },
      "image": "/images/items/poison_dagger.webp",
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
        "magicPower": 3,
        "attackSpeed": 2
      },
      "image": "/images/items/mace.webp",
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
        "magicPower": 5,
        "attackSpeed": 3
      },
      "image": "/images/items/holy_sword.webp",
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
        "attack": 10,
        "attackSpeed": 3
      },
      "image": "/images/items/kris_blade.webp",
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
        "speed": 2,
        "attackSpeed": 3
      },
      "image": "/images/items/whisper_blade.webp",
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
        "healPower": 2,
        "attackSpeed": 3
      },
      "image": "/images/items/scepter.webp",
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
        "healPower": 4,
        "attackSpeed": 5
      },
      "image": "/images/items/cleric_staff.webp",
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
        "maxHp": 20,
        "attackSpeed": 2
      },
      "image": "/images/items/maul.webp",
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
        "resistance": 5,
        "attackSpeed": 3
      },
      "image": "/images/items/bulwark_hammer.webp",
      "description": "+8 Attack, +5 Resistance"
    },
    {
      "id": "stone_ash_sword",
      "name": "Stone Ash Sword",
      "slot": "weapon",
      "rarity": "common",
      "dungeonOnly": true,
      "price": {
        "gold": 60,
        "wood": 10
      },
      "stats": {
        "attack": 8,
        "attackSpeed": 2
      },
      "image": "/images/items/stone_ash_sword.webp",
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
      "image": "/images/items/hearth_tea.webp",
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
      "image": "/images/items/field_rations.webp",
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
      "image": "/images/items/fire_essence.webp",
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
      "image": "/images/items/frost_essence.webp",
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
      "image": "/images/items/arcane_essence.webp",
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
      "image": "/images/items/shadow_essence.webp",
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
      "image": "/images/items/heart_of_fire.webp",
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
      "image": "/images/items/golem_heart.webp",
      "description": "Offer it at the Ancient Temple to mend a lost heart."
    },
    {
      "id": "origin_stone",
      "name": "Origin Stone",
      "slot": "material",
      "rarity": "epic",
      "price": {
        "gold": 250,
        "wood": 0
      },
      "image": "/images/items/origin_stone.webp",
      "description": "Offer it at the Ancient Temple to be reborn into a new race."
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
      "image": "/images/items/ancient_relic.webp",
      "description": "An artifact older than the kingdom. The temple remembers."
    },
    {
      "id": "war_crest",
      "name": "Warlord Crest",
      "slot": "material",
      "rarity": "epic",
      "price": {
        "gold": 0,
        "wood": 0
      },
      "image": "/images/items/war_crest.webp",
      "description": "A battle-worn crest. The Ancient Temple demands it from those walking the heavy path (Warlord, Juggernaut, Crusader)."
    },
    {
      "id": "shadow_sigil",
      "name": "Shadow Sigil",
      "slot": "material",
      "rarity": "epic",
      "price": {
        "gold": 0,
        "wood": 0
      },
      "image": "/images/items/shadow_sigil.webp",
      "description": "A whispering sigil. The Ancient Temple demands it from those walking the shadow path (Nightblade, Reaper, Warden)."
    },
    {
      "id": "arcane_seal",
      "name": "Arcane Seal",
      "slot": "material",
      "rarity": "epic",
      "price": {
        "gold": 0,
        "wood": 0
      },
      "image": "/images/items/arcane_seal.webp",
      "description": "A humming seal. The Ancient Temple demands it from those walking the arcane path (Archmage, High Priest)."
    },
    {
      "id": "primeval_cruor",
      "name": "Drop of Primeval Cruor",
      "slot": "material",
      "rarity": "legendary",
      "price": {
        "gold": 0,
        "wood": 0
      },
      "image": "/images/items/primeval_cruor.webp",
      "description": "First blood, still warm. Rarely spills from humanoid wounds. Old Vesryn demands 10 drops for his rite."
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
        "attack": 16,
        "attackSpeed": 3
      },
      "image": "/images/items/fire_ash_sword.webp",
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
        "attack": 28,
        "attackSpeed": 5
      },
      "image": "/images/items/molten_cleaver.webp",
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
        "resistance": 6,
        "attackSpeed": 3
      },
      "image": "/images/items/frost_gladius.webp",
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
        "mana": 15,
        "attackSpeed": 3
      },
      "image": "/images/items/arcane_rod.webp",
      "craftOnly": true,
      "description": "+14 Magic Power, +10 Mana."
    },
    {
      "id": "shadow_knife",
      "setId": "shadow",
      "name": "Shadow Knife",
      "slot": "weapon",
      "rarity": "uncommon",
      "price": {
        "gold": 0,
        "wood": 0
      },
      "stats": {
        "attack": 18,
        "speed": 3,
        "attackSpeed": 3
      },
      "image": "/images/items/shadow_knife.webp",
      "craftOnly": true,
      "description": "+18 Attack, +3 Speed."
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
        "attack": 26,
        "attackSpeed": 7
      },
      "image": "/images/items/ember_sword.webp",
      "description": "+26 Attack. Found only in the deep ruins."
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
        "magicPower": 30,
        "healPower": 6,
        "attackSpeed": 10
      },
      "image": "/images/items/phoenix_staff.webp",
      "description": "+30 Magic Power, +6 Heal Power."
    },
    {
      "id": "void_cleaver",
      "setId": "void",
      "name": "Void Cleaver",
      "slot": "weapon",
      "rarity": "mythic",
      "price": {
        "gold": 0,
        "wood": 0
      },
      "stats": {
        "attack": 42,
        "attackSpeed": 13
      },
      "image": "/images/items/void_cleaver.webp",
      "description": "+42 Attack. The edge drinks the dark."
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
      "image": "/images/items/wooden_chest.webp",
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
      "image": "/images/items/iron_chest.webp",
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
      "image": "/images/items/gold_chest.webp",
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
      "image": "/images/items/emerald_chest.webp",
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
      "image": "/images/items/obsidian_chest.webp",
      "description": "A black-glass chest. Fine odds of legendary loot."
    },
    {
      "id": "iron_greatsword",
      "setId": "iron",
      "name": "Iron Greatsword",
      "slot": "weapon",
      "rarity": "common",
      "price": {
        "gold": 60,
        "wood": 10
      },
      "stats": {
        "attack": 12,
        "attackSpeed": 2
      },
      "image": "/images/items/iron_greatsword.webp",
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
        "attack": 14,
        "attackSpeed": 2
      },
      "image": "/images/items/steel_blade.webp",
      "description": "+14 attack"
    },
    {
      "id": "ranger_bow",
      "setId": "ranger",
      "name": "Ranger Bow",
      "slot": "weapon",
      "rarity": "uncommon",
      "price": {
        "gold": 120,
        "wood": 20
      },
      "stats": {
        "attack": 16,
        "speed": 1,
        "attackSpeed": 3
      },
      "image": "/images/items/ranger_bow.webp",
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
        "mana": 12,
        "attackSpeed": 3
      },
      "image": "/images/items/arcane_scepter.webp",
      "description": "+16 magicPower, +12 mana"
    },
    {
      "id": "shadow_dagger",
      "setId": "shadow",
      "name": "Shadow Dagger",
      "slot": "weapon",
      "rarity": "rare",
      "price": {
        "gold": 220,
        "wood": 35
      },
      "stats": {
        "attack": 20,
        "speed": 2,
        "attackSpeed": 5
      },
      "image": "/images/items/shadow_dagger.webp",
      "description": "+20 attack, +2 speed"
    },
    {
      "id": "dragon_spear",
      "setId": "dragon",
      "name": "Dragon Spear",
      "slot": "weapon",
      "rarity": "rare",
      "price": {
        "gold": 220,
        "wood": 35
      },
      "stats": {
        "attack": 22,
        "speed": 1,
        "attackSpeed": 5
      },
      "image": "/images/items/dragon_spear.webp",
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
        "attack": 26,
        "attackSpeed": 7
      },
      "image": "/images/items/titan_hammer.webp",
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
        "speed": 2,
        "attackSpeed": 7
      },
      "image": "/images/items/storm_bow.webp",
      "description": "+24 attack, +2 speed"
    },
    {
      "id": "void_blade",
      "setId": "void",
      "name": "Void Blade",
      "slot": "weapon",
      "rarity": "legendary",
      "price": {
        "gold": 650,
        "wood": 90
      },
      "stats": {
        "attack": 32,
        "speed": 1,
        "attackSpeed": 10
      },
      "image": "/images/items/void_blade.webp",
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
        "attack": 46,
        "maxHp": 20,
        "attackSpeed": 13
      },
      "image": "/images/items/world_breaker.webp",
      "description": "+46 attack, +20 Max HP"
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
      "image": "/images/items/bronze_helm.webp",
      "description": "+35 maxHp, +5 resistance"
    },
    {
      "id": "iron_helm",
      "setId": "iron",
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
      "image": "/images/items/iron_helm.webp",
      "description": "+45 maxHp, +7 resistance"
    },
    {
      "id": "ranger_hood",
      "setId": "ranger",
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
      "image": "/images/items/ranger_hood.webp",
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
      "image": "/images/items/mage_cowl.webp",
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
      "image": "/images/items/knight_helm.webp",
      "description": "+70 maxHp, +12 resistance"
    },
    {
      "id": "shadow_mask",
      "setId": "shadow",
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
      "image": "/images/items/shadow_mask.webp",
      "description": "+55 maxHp, +9 resistance, +1 speed"
    },
    {
      "id": "dragon_helm",
      "setId": "dragon",
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
      "image": "/images/items/dragon_helm.webp",
      "description": "+100 maxHp, +18 resistance, +5 attack"
    },
    {
      "id": "void_crown",
      "setId": "void",
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
      "image": "/images/items/void_crown.webp",
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
      "image": "/images/items/padded_armor.webp",
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
        "maxHp": 55,
        "resistance": 8
      },
      "image": "/images/items/chainmail.webp",
      "description": "+55 maxHp, +8 resistance"
    },
    {
      "id": "ranger_vest",
      "setId": "ranger",
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
      "image": "/images/items/ranger_vest.webp",
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
        "magicPower": 14
      },
      "image": "/images/items/silk_robe.webp",
      "description": "+45 maxHp, +6 resistance, +14 magicPower"
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
      "image": "/images/items/plate_armor.webp",
      "description": "+110 maxHp, +18 resistance"
    },
    {
      "id": "shadow_garb",
      "setId": "shadow",
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
      "image": "/images/items/shadow_garb.webp",
      "description": "+85 maxHp, +14 resistance, +1 speed"
    },
    {
      "id": "dragon_scale",
      "setId": "dragon",
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
      "image": "/images/items/dragon_scale.webp",
      "description": "+150 maxHp, +26 resistance, +6 attack"
    },
    {
      "id": "void_plate",
      "setId": "void",
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
      "image": "/images/items/void_plate.webp",
      "description": "+200 maxHp, +35 resistance, +10 magicPower"
    },
    {
      "id": "leather_greaves",
      "setId": "leather",
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
      "image": "/images/items/leather_greaves.webp",
      "description": "+40 maxHp, +6 resistance"
    },
    {
      "id": "iron_greaves",
      "setId": "iron",
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
      "image": "/images/items/iron_greaves.webp",
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
      "image": "/images/items/swift_leggings.webp",
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
      "image": "/images/items/sage_pants.webp",
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
      "image": "/images/items/knight_leggings.webp",
      "description": "+80 maxHp, +14 resistance"
    },
    {
      "id": "shadow_leggings",
      "setId": "shadow",
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
      "image": "/images/items/shadow_leggings.webp",
      "description": "+65 maxHp, +11 resistance, +1 speed"
    },
    {
      "id": "dragon_leggings",
      "setId": "dragon",
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
      "image": "/images/items/dragon_leggings.webp",
      "description": "+120 maxHp, +22 resistance, +4 attack"
    },
    {
      "id": "void_leggings",
      "setId": "void",
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
      "image": "/images/items/void_leggings.webp",
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
        "speed": 1,
        "attackSpeed": 1
      },
      "image": "/images/items/worn_boots.webp",
      "description": "+1 speed"
    },
    {
      "id": "iron_boots",
      "setId": "iron",
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
        "speed": 1,
        "attackSpeed": 1
      },
      "image": "/images/items/iron_boots.webp",
      "description": "+20 maxHp, +4 resistance, +1 speed"
    },
    {
      "id": "ranger_boots",
      "setId": "ranger",
      "name": "Ranger Boots",
      "slot": "boots",
      "rarity": "uncommon",
      "price": {
        "gold": 70,
        "wood": 12
      },
      "stats": {
        "maxHp": 20,
        "speed": 2,
        "attackSpeed": 2
      },
      "image": "/images/items/ranger_boots.webp",
      "description": "+20 Max HP, +2 speed"
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
        "magicPower": 6,
        "attackSpeed": 2
      },
      "image": "/images/items/sorcery_boots.webp",
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
        "speed": 1,
        "attackSpeed": 3
      },
      "image": "/images/items/knight_boots.webp",
      "description": "+40 maxHp, +8 resistance, +1 speed"
    },
    {
      "id": "void_boots",
      "setId": "void",
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
        "speed": 2,
        "attackSpeed": 4
      },
      "image": "/images/items/void_boots.webp",
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
        "magicPower": 4,
        "attackSpeed": 1
      },
      "image": "/images/items/copper_amulet.webp",
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
        "magicPower": 7,
        "attackSpeed": 2
      },
      "image": "/images/items/silver_amulet.webp",
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
        "healPower": 4,
        "attackSpeed": 3
      },
      "image": "/images/items/ruby_amulet.webp",
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
        "manaRegen": 2,
        "attackSpeed": 4
      },
      "image": "/images/items/sapphire_amulet.webp",
      "description": "+30 mana, +18 magicPower, +2 manaRegen"
    },
    {
      "id": "void_amulet",
      "setId": "void",
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
        "healPower": 8,
        "attackSpeed": 6
      },
      "image": "/images/items/void_amulet.webp",
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
        "attack": 3,
        "attackSpeed": 1
      },
      "image": "/images/items/copper_ring.webp",
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
        "mana": 8,
        "attackSpeed": 2
      },
      "image": "/images/items/silver_ring.webp",
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
        "critChance": 5,
        "attackSpeed": 3
      },
      "image": "/images/items/ruby_ring.webp",
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
        "critChance": 7,
        "attackSpeed": 4
      },
      "image": "/images/items/sapphire_ring.webp",
      "description": "+12 attack, +10 magicPower, +7 critChance"
    },
    {
      "id": "void_ring",
      "setId": "void",
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
        "critDamage": 15,
        "attackSpeed": 6
      },
      "image": "/images/items/void_ring.webp",
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
      "image": "/images/items/essence_of_life.webp",
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
      "image": "/images/items/tome_ember.webp",
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
      "image": "/images/items/tome_frost.webp",
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
      "image": "/images/items/tome_shadow.webp",
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
      "image": "/images/items/tome_light.webp",
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
      "image": "/images/items/tome_void.webp",
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
      "image": "/images/items/stone_blood.webp",
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
      "image": "/images/items/stone_frost.webp",
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
      "image": "/images/items/stone_shadow.webp",
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
      "image": "/images/items/stone_arcane.webp",
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
      "image": "/images/items/stone_earth.webp",
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
        "attack": 4,
        "attackSpeed": 3
      },
      "image": "/images/items/vampiric_ring.webp",
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
        "omnivamp": 4,
        "attackSpeed": 7
      },
      "image": "/images/items/crimson_blade.webp",
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
        "maxHp": 75,
        "resistance": 10,
        "magicPower": 6
      },
      "image": "/images/items/glacial_helm.webp",
      "description": "+75 HP, +10 Res, +6 Mgc."
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
      "image": "/images/items/ember_plate.webp",
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
        "attack": 36,
        "critChance": 5,
        "attackSpeed": 7
      },
      "image": "/images/items/boss_weapon_ember.webp",
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
        "resistance": 8,
        "attackSpeed": 7
      },
      "image": "/images/items/boss_weapon_frost.webp",
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
        "omnivamp": 4,
        "attackSpeed": 10
      },
      "image": "/images/items/boss_weapon_void.webp",
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
        "speed": 1,
        "attackSpeed": 10
      },
      "image": "/images/items/boss_weapon_storm.webp",
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
        "critDamage": 15,
        "attackSpeed": 13
      },
      "image": "/images/items/boss_weapon_world.webp",
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
      "image": "/images/items/boss_chest_ember.webp",
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
      "image": "/images/items/boss_chest_frost.webp",
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
      "image": "/images/items/boss_chest_void.webp",
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
      "image": "/images/items/boss_chest_storm.webp",
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
      "image": "/images/items/boss_chest_world.webp",
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
      "image": "/images/items/mythic_chest.webp",
      "description": "A chest of legend. Great odds of mythic loot."
    },
    {
      "id": "buried_treasure",
      "name": "Buried Treasure",
      "slot": "chest",
      "rarity": "epic",
      "price": {
        "gold": 0,
        "wood": 0
      },
      "chestTier": "b",
      "image": "/images/items/buried_treasure.webp",
      "description": "A dirt-caked hoard dug up on the road. Lucky find, honest loot."
    },
    {
      "id": "sturdy_club",
      "name": "Sturdy Club",
      "rarity": "common",
      "slot": "weapon",
      "stats": {
        "attack": 11,
        "attackSpeed": 2
      },
      "description": "A dependable oaken club.",
      "value": 25,
      "image": "/images/items/sturdy_club.webp"
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
      "image": "/images/items/cloth_cap.webp"
    },
    {
      "id": "bone_ring",
      "name": "Bone Ring",
      "rarity": "common",
      "slot": "ring",
      "stats": {
        "resistance": 6,
        "attackSpeed": 1
      },
      "description": "Carved from a dire wolf fang.",
      "value": 24,
      "image": "/images/items/bone_ring.webp"
    },
    {
      "id": "travel_boots",
      "name": "Travel Boots",
      "rarity": "common",
      "slot": "boots",
      "stats": {
        "maxHp": 25,
        "speed": 1,
        "attackSpeed": 1
      },
      "description": "Worn soles, swift steps.",
      "value": 26,
      "image": "/images/items/travel_boots.webp"
    },
    {
      "id": "hunter_axe",
      "name": "Hunter Axe",
      "rarity": "uncommon",
      "slot": "weapon",
      "stats": {
        "attack": 17,
        "attackSpeed": 3
      },
      "description": "A woodsman's heavy axe.",
      "value": 70,
      "image": "/images/items/hunter_axe.webp"
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
      "image": "/images/items/wolf_helm.webp"
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
      "image": "/images/items/boar_hide_armor.webp"
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
      "image": "/images/items/swift_greaves.webp"
    },
    {
      "id": "ember_boots",
      "name": "Ember Boots",
      "rarity": "uncommon",
      "slot": "boots",
      "stats": {
        "maxHp": 50,
        "resistance": 8,
        "attackSpeed": 2
      },
      "description": "Still warm from the forge.",
      "value": 72,
      "image": "/images/items/ember_boots.webp"
    },
    {
      "id": "moon_amulet",
      "name": "Moon Amulet",
      "rarity": "uncommon",
      "slot": "amulet",
      "stats": {
        "mana": 25,
        "magicPower": 4,
        "attackSpeed": 2
      },
      "description": "Drinks in moonlight.",
      "value": 70,
      "image": "/images/items/moon_amulet.webp"
    },
    {
      "id": "serpent_ring",
      "name": "Serpent Ring",
      "rarity": "uncommon",
      "slot": "ring",
      "stats": {
        "attack": 6,
        "attackSpeed": 2
      },
      "description": "A coiled silver serpent.",
      "value": 66,
      "image": "/images/items/serpent_ring.webp"
    },
    {
      "id": "oak_staff",
      "name": "Oak Staff",
      "rarity": "uncommon",
      "slot": "weapon",
      "stats": {
        "magicPower": 18,
        "attackSpeed": 3
      },
      "description": "Heartwood humming with mana.",
      "value": 74,
      "image": "/images/items/oak_staff.webp"
    },
    {
      "id": "frostbrand_axe",
      "name": "Frostbrand Axe",
      "rarity": "rare",
      "slot": "weapon",
      "stats": {
        "attack": 24,
        "attackSpeed": 5
      },
      "description": "Its edge never thaws.",
      "value": 200,
      "image": "/images/items/frostbrand_axe.webp"
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
      "image": "/images/items/sentinel_helm.webp"
    },
    {
      "id": "shadowplate",
      "name": "Shadowplate",
      "rarity": "rare",
      "slot": "armor",
      "stats": {
        "maxHp": 110,
        "resistance": 16,
        "speed": 2
      },
      "description": "Forged in eclipse dark.",
      "value": 210,
      "image": "/images/items/shadowplate.webp"
    },
    {
      "id": "storm_leggings",
      "name": "Storm Leggings",
      "rarity": "rare",
      "slot": "legs",
      "stats": {
        "maxHp": 40,
        "resistance": 10,
        "speed": 2
      },
      "description": "Crackling with static.",
      "value": 190,
      "image": "/images/items/storm_leggings.webp"
    },
    {
      "id": "thunder_amulet",
      "name": "Thunder Amulet",
      "rarity": "rare",
      "slot": "amulet",
      "stats": {
        "attack": 14,
        "speed": 2,
        "attackSpeed": 3
      },
      "description": "A bottled thunderstorm.",
      "value": 195,
      "image": "/images/items/thunder_amulet.webp"
    },
    {
      "id": "warden_ring",
      "name": "Warden Ring",
      "rarity": "rare",
      "slot": "ring",
      "stats": {
        "resistance": 14,
        "maxHp": 40,
        "attackSpeed": 3
      },
      "description": "Oath-bound silver.",
      "value": 188,
      "image": "/images/items/warden_ring.webp"
    },
    {
      "id": "runed_bow",
      "name": "Runed Bow",
      "rarity": "rare",
      "slot": "weapon",
      "stats": {
        "attack": 22,
        "speed": 1,
        "attackSpeed": 5
      },
      "description": "Runes guide every shaft.",
      "value": 205,
      "image": "/images/items/runed_bow.webp"
    },
    {
      "id": "void_reaver",
      "setId": "void",
      "name": "Void Reaver",
      "rarity": "epic",
      "slot": "weapon",
      "stats": {
        "attack": 34,
        "attackSpeed": 7
      },
      "description": "It hungers between swings.",
      "value": 500,
      "image": "/images/items/void_reaver.webp"
    },
    {
      "id": "aegis_armor",
      "name": "Aegis Armor",
      "rarity": "epic",
      "slot": "armor",
      "stats": {
        "maxHp": 150,
        "resistance": 24
      },
      "description": "A wall you can wear.",
      "value": 520,
      "image": "/images/items/aegis_armor.webp"
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
      "image": "/images/items/archon_crown.webp"
    },
    {
      "id": "stormcaller_staff",
      "name": "Stormcaller Staff",
      "rarity": "epic",
      "slot": "weapon",
      "stats": {
        "magicPower": 38,
        "attackSpeed": 7
      },
      "description": "Points at clouds; clouds obey.",
      "value": 530,
      "image": "/images/items/stormcaller_staff.webp"
    },
    {
      "id": "kingsfall_blade",
      "name": "Kingsfall Blade",
      "rarity": "legendary",
      "slot": "weapon",
      "stats": {
        "attack": 48,
        "attackSpeed": 10
      },
      "description": "Ended a dynasty.",
      "value": 1200,
      "image": "/images/items/kingsfall_blade.webp"
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
      "image": "/images/items/titanward_plate.webp"
    },
    {
      "id": "worldsplitter_axe",
      "name": "Worldsplitter Axe",
      "rarity": "mythic",
      "slot": "weapon",
      "stats": {
        "attack": 62,
        "attackSpeed": 13
      },
      "description": "The ground remembers it.",
      "value": 2500,
      "image": "/images/items/worldsplitter_axe.webp"
    },
    {
      "id": "slime_bottle",
      "name": "Bottle of Slime",
      "rarity": "common",
      "slot": "material",
      "description": "A jiggling bottle of fresh slime.",
      "image": "/images/items/slime_bottle.webp",
      "value": 6
    },
    {
      "id": "wolf_fang",
      "name": "Wolf Fang",
      "rarity": "common",
      "slot": "material",
      "description": "A sharp fang, still warm.",
      "image": "/images/items/wolf_fang.webp",
      "value": 6
    },
    {
      "id": "bat_wing",
      "name": "Cave Bat Wing",
      "rarity": "common",
      "slot": "material",
      "description": "Leathery and light.",
      "image": "/images/items/bat_wing.webp",
      "value": 5
    },
    {
      "id": "spider_silk",
      "name": "Ash Spider Silk",
      "rarity": "common",
      "slot": "material",
      "description": "Stronger than it looks.",
      "image": "/images/items/spider_silk.webp",
      "value": 7
    },
    {
      "id": "tough_hide",
      "name": "Tough Hide",
      "rarity": "uncommon",
      "slot": "material",
      "description": "Thick hide of a hardy beast.",
      "image": "/images/items/tough_hide.webp",
      "value": 15
    },
    {
      "id": "skeleton_bone",
      "name": "Old Bone",
      "rarity": "uncommon",
      "slot": "material",
      "description": "Dense with old malice.",
      "image": "/images/items/skeleton_bone.webp",
      "value": 14
    },
    {
      "id": "orc_tusk",
      "name": "Orc Tusk",
      "rarity": "uncommon",
      "slot": "material",
      "description": "A trophy with an edge.",
      "image": "/images/items/orc_tusk.webp",
      "value": 16
    },
    {
      "id": "harpy_feather",
      "name": "Storm Harpy Feather",
      "rarity": "uncommon",
      "slot": "material",
      "description": "Crackles faintly.",
      "image": "/images/items/harpy_feather.webp",
      "value": 18
    },
    {
      "id": "golem_fragment",
      "name": "Golem Fragment",
      "rarity": "rare",
      "slot": "material",
      "description": "A chip of living stone.",
      "image": "/images/items/golem_fragment.webp",
      "value": 50
    },
    {
      "id": "wraith_wisp",
      "name": "Wraith Wisp",
      "rarity": "rare",
      "slot": "material",
      "description": "Cold light in a jar.",
      "image": "/images/items/wraith_wisp.webp",
      "value": 55
    },
    {
      "id": "treant_bark",
      "name": "Elder Treant Bark",
      "rarity": "rare",
      "slot": "material",
      "description": "Bark that slowly regrows.",
      "image": "/images/items/treant_bark.webp",
      "value": 48
    },
    {
      "id": "hydra_scale",
      "name": "Hydra Scale",
      "rarity": "epic",
      "slot": "material",
      "description": "It shimmers with regrowth.",
      "image": "/images/items/hydra_scale.webp",
      "value": 150
    },
    {
      "id": "minor_salve",
      "name": "Minor Salve",
      "rarity": "common",
      "slot": "consumable",
      "description": "Heals small wounds.",
      "image": "/images/items/minor_salve.webp",
      "heal": 25,
      "value": 10
    },
    {
      "id": "wolf_jerky",
      "name": "Wolf Jerky",
      "rarity": "common",
      "slot": "consumable",
      "description": "Chewy trail food.",
      "image": "/images/items/wolf_jerky.webp",
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
      "image": "/images/items/mushroom_stew.webp",
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
      "image": "/images/items/frost_berry.webp",
      "heal": 30,
      "value": 12
    },
    {
      "id": "ember_pepper",
      "name": "Ember Pepper",
      "rarity": "uncommon",
      "slot": "consumable",
      "description": "Burns going down.",
      "image": "/images/items/ember_pepper.webp",
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
      "image": "/images/items/troll_draught.webp",
      "heal": 90,
      "value": 45
    },
    {
      "id": "skyshard_omelet",
      "name": "Skyshard Omelet",
      "rarity": "rare",
      "slot": "consumable",
      "description": "Storm-harpy eggs, fried.",
      "image": "/images/items/skyshard_omelet.webp",
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
      "image": "/images/items/elixir_of_dawn.webp",
      "heal": 150,
      "value": 90
    },
    {
      "id": "sword_blueprint",
      "name": "Sword Blueprint",
      "rarity": "uncommon",
      "slot": "material",
      "description": "Reusable weapon pattern.",
      "image": "/images/items/sword_blueprint.webp",
      "blueprint": true,
      "price": {
        "gold": 200,
        "wood": 0
      }
    },
    {
      "id": "armor_blueprint",
      "name": "Armor Blueprint",
      "rarity": "uncommon",
      "slot": "material",
      "description": "Reusable armor pattern.",
      "image": "/images/items/armor_blueprint.webp",
      "blueprint": true,
      "price": {
        "gold": 200,
        "wood": 0
      }
    },
    {
      "id": "staff_blueprint",
      "name": "Staff Blueprint",
      "rarity": "rare",
      "slot": "material",
      "description": "Reusable staff pattern.",
      "image": "/images/items/staff_blueprint.webp",
      "blueprint": true,
      "price": {
        "gold": 200,
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
      "image": "/images/items/sage_circlet.webp"
    },
    {
      "id": "blood_blade",
      "name": "Blood Blade",
      "slot": "weapon",
      "rarity": "epic",
      "price": {
        "gold": 430,
        "wood": 60
      },
      "stats": {
        "attack": 28,
        "attackSpeed": 7
      },
      "setId": "blood",
      "image": "/images/items/blood_blade.webp",
      "description": "+28 Attack. It remembers every vein."
    },
    {
      "id": "blood_fang",
      "name": "Blood Fang",
      "slot": "weapon",
      "rarity": "rare",
      "price": {
        "gold": 230,
        "wood": 35
      },
      "stats": {
        "attack": 18,
        "speed": 2,
        "attackSpeed": 5
      },
      "setId": "blood",
      "image": "/images/items/blood_fang.webp",
      "description": "+18 Attack, +2 Speed. Still warm."
    },
    {
      "id": "blood_helm",
      "name": "Blood Helm",
      "slot": "head",
      "rarity": "epic",
      "price": {
        "gold": 390,
        "wood": 55
      },
      "stats": {
        "maxHp": 90,
        "resistance": 16,
        "speed": 2
      },
      "setId": "blood",
      "image": "/images/items/blood_helm.webp",
      "description": "+90 Max HP, +16 Resistance, +2 Speed."
    },
    {
      "id": "blood_chest",
      "name": "Blood Chest",
      "slot": "armor",
      "rarity": "epic",
      "price": {
        "gold": 410,
        "wood": 60
      },
      "stats": {
        "maxHp": 140,
        "resistance": 22
      },
      "setId": "blood",
      "image": "/images/items/blood_chest.webp",
      "description": "+140 Max HP, +22 Resistance."
    },
    {
      "id": "blood_leggings",
      "name": "Blood Leggings",
      "slot": "legs",
      "rarity": "epic",
      "price": {
        "gold": 380,
        "wood": 55
      },
      "stats": {
        "maxHp": 110,
        "resistance": 20
      },
      "setId": "blood",
      "image": "/images/items/blood_leggings.webp",
      "description": "+110 Max HP, +20 Resistance."
    },
    {
      "id": "blood_boots",
      "name": "Blood Boots",
      "slot": "boots",
      "rarity": "rare",
      "price": {
        "gold": 150,
        "wood": 24
      },
      "stats": {
        "maxHp": 45,
        "resistance": 10,
        "speed": 2,
        "attackSpeed": 3
      },
      "setId": "blood",
      "image": "/images/items/blood_boots.webp",
      "description": "+45 Max HP, +10 Resistance, +2 Speed."
    },
    {
      "id": "blood_ring",
      "name": "Blood Ring",
      "slot": "ring",
      "rarity": "epic",
      "price": {
        "gold": 400,
        "wood": 55
      },
      "stats": {
        "attack": 10,
        "omnivamp": 5,
        "attackSpeed": 4
      },
      "setId": "blood",
      "image": "/images/items/blood_ring.webp",
      "description": "+10 Attack, +5% Omnivamp."
    },
    {
      "id": "blood_amulet",
      "name": "Blood Amulet",
      "slot": "amulet",
      "rarity": "rare",
      "price": {
        "gold": 210,
        "wood": 30
      },
      "stats": {
        "mana": 20,
        "magicPower": 10,
        "omnivamp": 3,
        "attackSpeed": 3
      },
      "setId": "blood",
      "image": "/images/items/blood_amulet.webp",
      "description": "+20 Mana, +10 Magic Power, +3% Omnivamp."
    },
    {
      "id": "blood_tome",
      "name": "Blood Tome",
      "slot": "book",
      "rarity": "rare",
      "price": {
        "gold": 220,
        "wood": 32
      },
      "stats": {
        "magicPower": 14,
        "healPower": 8
      },
      "setId": "blood",
      "image": "/images/items/blood_tome.webp",
      "description": "+14 Magic Power, +8 Heal Power. Written in red."
    },
    {
      "id": "sword_duskwood",
      "name": "Duskwood Blade",
      "slot": "weapon",
      "rarity": "common",
      "price": {
        "gold": 0,
        "wood": 0
      },
      "stats": {
        "attack": 8,
        "attackSpeed": 2
      },
      "travelOnly": true,
      "image": "/images/items/sword_duskwood.webp",
      "description": "Duskwood Blade."
    },
    {
      "id": "sword_reed",
      "name": "Reedcutter",
      "slot": "weapon",
      "rarity": "common",
      "price": {
        "gold": 0,
        "wood": 0
      },
      "stats": {
        "attack": 8,
        "attackSpeed": 2
      },
      "travelOnly": true,
      "image": "/images/items/sword_reed.webp",
      "description": "Reedcutter."
    },
    {
      "id": "sword_ironleaf",
      "name": "Ironleaf Sword",
      "slot": "weapon",
      "rarity": "common",
      "price": {
        "gold": 0,
        "wood": 0
      },
      "stats": {
        "attack": 8,
        "attackSpeed": 2
      },
      "travelOnly": true,
      "image": "/images/items/sword_ironleaf.webp",
      "description": "Ironleaf Sword."
    },
    {
      "id": "sword_patrol",
      "name": "Patrol Saber",
      "slot": "weapon",
      "rarity": "common",
      "price": {
        "gold": 0,
        "wood": 0
      },
      "stats": {
        "attack": 8,
        "attackSpeed": 2
      },
      "travelOnly": true,
      "image": "/images/items/sword_patrol.webp",
      "description": "Patrol Saber."
    },
    {
      "id": "sword_tin",
      "name": "Tinker's Shortsword",
      "slot": "weapon",
      "rarity": "common",
      "price": {
        "gold": 0,
        "wood": 0
      },
      "stats": {
        "attack": 8,
        "attackSpeed": 2
      },
      "travelOnly": true,
      "image": "/images/items/sword_tin.webp",
      "description": "Tinker's Shortsword."
    },
    {
      "id": "sword_militia",
      "name": "Militia Sword",
      "slot": "weapon",
      "rarity": "common",
      "price": {
        "gold": 0,
        "wood": 0
      },
      "stats": {
        "attack": 8,
        "attackSpeed": 2
      },
      "travelOnly": true,
      "image": "/images/items/sword_militia.webp",
      "description": "Militia Sword."
    },
    {
      "id": "sword_boar",
      "name": "Boar Tusk Blade",
      "slot": "weapon",
      "rarity": "common",
      "price": {
        "gold": 0,
        "wood": 0
      },
      "stats": {
        "attack": 8,
        "attackSpeed": 2
      },
      "travelOnly": true,
      "image": "/images/items/sword_boar.webp",
      "description": "Boar Tusk Blade."
    },
    {
      "id": "sword_salt",
      "name": "Salt-Rusted Sword",
      "slot": "weapon",
      "rarity": "common",
      "price": {
        "gold": 0,
        "wood": 0
      },
      "stats": {
        "attack": 8,
        "attackSpeed": 2
      },
      "travelOnly": true,
      "image": "/images/items/sword_salt.webp",
      "description": "Salt-Rusted Sword."
    },
    {
      "id": "sword_coal",
      "name": "Charcoal Cutter",
      "slot": "weapon",
      "rarity": "common",
      "price": {
        "gold": 0,
        "wood": 0
      },
      "stats": {
        "attack": 8,
        "attackSpeed": 2
      },
      "travelOnly": true,
      "image": "/images/items/sword_coal.webp",
      "description": "Charcoal Cutter."
    },
    {
      "id": "sword_bronzeguard",
      "name": "Bronzeguard",
      "slot": "weapon",
      "rarity": "uncommon",
      "price": {
        "gold": 0,
        "wood": 0
      },
      "stats": {
        "attack": 12,
        "attackSpeed": 3
      },
      "travelOnly": true,
      "image": "/images/items/sword_bronzeguard.webp",
      "description": "Bronzeguard."
    },
    {
      "id": "sword_mossbrand",
      "name": "Mossbrand",
      "slot": "weapon",
      "rarity": "uncommon",
      "price": {
        "gold": 0,
        "wood": 0
      },
      "stats": {
        "attack": 12,
        "attackSpeed": 3
      },
      "travelOnly": true,
      "image": "/images/items/sword_mossbrand.webp",
      "description": "Mossbrand."
    },
    {
      "id": "sword_tide",
      "name": "Tidecutter",
      "slot": "weapon",
      "rarity": "uncommon",
      "price": {
        "gold": 0,
        "wood": 0
      },
      "stats": {
        "attack": 12,
        "attackSpeed": 3
      },
      "travelOnly": true,
      "image": "/images/items/sword_tide.webp",
      "description": "Tidecutter."
    },
    {
      "id": "sword_ashen",
      "name": "Ashen Edge",
      "slot": "weapon",
      "rarity": "uncommon",
      "price": {
        "gold": 0,
        "wood": 0
      },
      "stats": {
        "attack": 12,
        "attackSpeed": 3
      },
      "travelOnly": true,
      "image": "/images/items/sword_ashen.webp",
      "description": "Ashen Edge."
    },
    {
      "id": "sword_watch",
      "name": "Watchman's Sabre",
      "slot": "weapon",
      "rarity": "uncommon",
      "price": {
        "gold": 0,
        "wood": 0
      },
      "stats": {
        "attack": 12,
        "attackSpeed": 3
      },
      "travelOnly": true,
      "image": "/images/items/sword_watch.webp",
      "description": "Watchman's Sabre."
    },
    {
      "id": "sword_glade",
      "name": "Glade Whisper",
      "slot": "weapon",
      "rarity": "uncommon",
      "price": {
        "gold": 0,
        "wood": 0
      },
      "stats": {
        "attack": 12,
        "attackSpeed": 3
      },
      "travelOnly": true,
      "image": "/images/items/sword_glade.webp",
      "description": "Glade Whisper."
    },
    {
      "id": "sword_emberwood",
      "name": "Emberwood Blade",
      "slot": "weapon",
      "rarity": "uncommon",
      "price": {
        "gold": 0,
        "wood": 0
      },
      "stats": {
        "attack": 12,
        "attackSpeed": 3
      },
      "travelOnly": true,
      "image": "/images/items/sword_emberwood.webp",
      "description": "Emberwood Blade."
    },
    {
      "id": "sword_frostpin",
      "name": "Frostpin",
      "slot": "weapon",
      "rarity": "uncommon",
      "price": {
        "gold": 0,
        "wood": 0
      },
      "stats": {
        "attack": 12,
        "attackSpeed": 3
      },
      "travelOnly": true,
      "image": "/images/items/sword_frostpin.webp",
      "description": "Frostpin."
    },
    {
      "id": "sword_mason",
      "name": "Mason's Broadsword",
      "slot": "weapon",
      "rarity": "uncommon",
      "price": {
        "gold": 0,
        "wood": 0
      },
      "stats": {
        "attack": 12,
        "attackSpeed": 3
      },
      "travelOnly": true,
      "image": "/images/items/sword_mason.webp",
      "description": "Mason's Broadsword."
    },
    {
      "id": "sword_stormhilt",
      "name": "Stormhilt",
      "slot": "weapon",
      "rarity": "rare",
      "price": {
        "gold": 0,
        "wood": 0
      },
      "stats": {
        "attack": 18,
        "critChance": 2,
        "attackSpeed": 5
      },
      "travelOnly": true,
      "image": "/images/items/sword_stormhilt.webp",
      "description": "Stormhilt."
    },
    {
      "id": "sword_runeblade",
      "name": "Runeblade",
      "slot": "weapon",
      "rarity": "rare",
      "price": {
        "gold": 0,
        "wood": 0
      },
      "stats": {
        "attack": 18,
        "critChance": 2,
        "attackSpeed": 5
      },
      "travelOnly": true,
      "image": "/images/items/sword_runeblade.webp",
      "description": "Runeblade."
    },
    {
      "id": "sword_glacier",
      "name": "Glacier Fang",
      "slot": "weapon",
      "rarity": "rare",
      "price": {
        "gold": 0,
        "wood": 0
      },
      "stats": {
        "attack": 18,
        "critChance": 2,
        "attackSpeed": 5
      },
      "travelOnly": true,
      "image": "/images/items/sword_glacier.webp",
      "description": "Glacier Fang."
    },
    {
      "id": "sword_venom",
      "name": "Venomfang",
      "slot": "weapon",
      "rarity": "rare",
      "price": {
        "gold": 0,
        "wood": 0
      },
      "stats": {
        "attack": 18,
        "critChance": 2,
        "attackSpeed": 5
      },
      "travelOnly": true,
      "image": "/images/items/sword_venom.webp",
      "description": "Venomfang."
    },
    {
      "id": "sword_brass",
      "name": "Brass Talon",
      "slot": "weapon",
      "rarity": "rare",
      "price": {
        "gold": 0,
        "wood": 0
      },
      "stats": {
        "attack": 18,
        "critChance": 2,
        "attackSpeed": 5
      },
      "travelOnly": true,
      "image": "/images/items/sword_brass.webp",
      "description": "Brass Talon."
    },
    {
      "id": "sword_shadow",
      "name": "Shadowthorn",
      "slot": "weapon",
      "rarity": "rare",
      "price": {
        "gold": 0,
        "wood": 0
      },
      "stats": {
        "attack": 18,
        "critChance": 2,
        "attackSpeed": 5
      },
      "travelOnly": true,
      "image": "/images/items/sword_shadow.webp",
      "description": "Shadowthorn."
    },
    {
      "id": "sword_coral",
      "name": "Coral Reaver",
      "slot": "weapon",
      "rarity": "rare",
      "price": {
        "gold": 0,
        "wood": 0
      },
      "stats": {
        "attack": 18,
        "critChance": 2,
        "attackSpeed": 5
      },
      "travelOnly": true,
      "image": "/images/items/sword_coral.webp",
      "description": "Coral Reaver."
    },
    {
      "id": "sword_grave",
      "name": "Graverust Sword",
      "slot": "weapon",
      "rarity": "rare",
      "price": {
        "gold": 0,
        "wood": 0
      },
      "stats": {
        "attack": 18,
        "critChance": 2,
        "attackSpeed": 5
      },
      "travelOnly": true,
      "image": "/images/items/sword_grave.webp",
      "description": "Graverust Sword."
    },
    {
      "id": "sword_sun",
      "name": "Sunflare Sabre",
      "slot": "weapon",
      "rarity": "rare",
      "price": {
        "gold": 0,
        "wood": 0
      },
      "stats": {
        "attack": 18,
        "critChance": 2,
        "attackSpeed": 5
      },
      "travelOnly": true,
      "image": "/images/items/sword_sun.webp",
      "description": "Sunflare Sabre."
    },
    {
      "id": "sword_emberforged",
      "name": "Emberforged Greatsword",
      "slot": "weapon",
      "rarity": "epic",
      "price": {
        "gold": 0,
        "wood": 0
      },
      "stats": {
        "attack": 27,
        "critChance": 4,
        "attackSpeed": 7
      },
      "travelOnly": true,
      "image": "/images/items/sword_emberforged.webp",
      "description": "Emberforged Greatsword."
    },
    {
      "id": "sword_glacial",
      "name": "Glacial Requiem",
      "slot": "weapon",
      "rarity": "epic",
      "price": {
        "gold": 0,
        "wood": 0
      },
      "stats": {
        "attack": 27,
        "critChance": 4,
        "attackSpeed": 7
      },
      "travelOnly": true,
      "image": "/images/items/sword_glacial.webp",
      "description": "Glacial Requiem."
    },
    {
      "id": "sword_thunder",
      "name": "Thunderbrand",
      "slot": "weapon",
      "rarity": "epic",
      "price": {
        "gold": 0,
        "wood": 0
      },
      "stats": {
        "attack": 27,
        "critChance": 4,
        "attackSpeed": 7
      },
      "travelOnly": true,
      "image": "/images/items/sword_thunder.webp",
      "description": "Thunderbrand."
    },
    {
      "id": "sword_crimson",
      "name": "Crimson Oath",
      "slot": "weapon",
      "rarity": "epic",
      "price": {
        "gold": 0,
        "wood": 0
      },
      "stats": {
        "attack": 27,
        "critChance": 4,
        "attackSpeed": 7
      },
      "travelOnly": true,
      "image": "/images/items/sword_crimson.webp",
      "description": "Crimson Oath."
    },
    {
      "id": "sword_voidsteel",
      "name": "Voidsteel Edge",
      "slot": "weapon",
      "rarity": "epic",
      "price": {
        "gold": 0,
        "wood": 0
      },
      "stats": {
        "attack": 27,
        "critChance": 4,
        "attackSpeed": 7
      },
      "travelOnly": true,
      "image": "/images/items/sword_voidsteel.webp",
      "description": "Voidsteel Edge."
    },
    {
      "id": "sword_seraph",
      "name": "Seraph's Wing",
      "slot": "weapon",
      "rarity": "epic",
      "price": {
        "gold": 0,
        "wood": 0
      },
      "stats": {
        "attack": 27,
        "critChance": 4,
        "attackSpeed": 7
      },
      "travelOnly": true,
      "image": "/images/items/sword_seraph.webp",
      "description": "Seraph's Wing."
    },
    {
      "id": "sword_nightbloom",
      "name": "Nightbloom Blade",
      "slot": "weapon",
      "rarity": "epic",
      "price": {
        "gold": 0,
        "wood": 0
      },
      "stats": {
        "attack": 27,
        "critChance": 4,
        "attackSpeed": 7
      },
      "travelOnly": true,
      "image": "/images/items/sword_nightbloom.webp",
      "description": "Nightbloom Blade."
    },
    {
      "id": "sword_tidecaller",
      "name": "Tidecaller",
      "slot": "weapon",
      "rarity": "epic",
      "price": {
        "gold": 0,
        "wood": 0
      },
      "stats": {
        "attack": 27,
        "critChance": 4,
        "attackSpeed": 7
      },
      "travelOnly": true,
      "image": "/images/items/sword_tidecaller.webp",
      "description": "Tidecaller."
    },
    {
      "id": "sword_runic",
      "name": "Runic Warblade",
      "slot": "weapon",
      "rarity": "epic",
      "price": {
        "gold": 0,
        "wood": 0
      },
      "stats": {
        "attack": 27,
        "critChance": 4,
        "attackSpeed": 7
      },
      "travelOnly": true,
      "image": "/images/items/sword_runic.webp",
      "description": "Runic Warblade."
    },
    {
      "id": "sword_dragonfang",
      "name": "Dragonfang Blade",
      "slot": "weapon",
      "rarity": "legendary",
      "price": {
        "gold": 0,
        "wood": 0
      },
      "stats": {
        "attack": 38,
        "critChance": 6,
        "speed": 2,
        "attackSpeed": 10
      },
      "travelOnly": true,
      "image": "/images/items/sword_dragonfang.webp",
      "description": "Dragonfang Blade."
    },
    {
      "id": "sword_phoenix",
      "name": "Phoenix Ember Sword",
      "slot": "weapon",
      "rarity": "legendary",
      "price": {
        "gold": 0,
        "wood": 0
      },
      "stats": {
        "attack": 38,
        "critChance": 6,
        "speed": 2,
        "attackSpeed": 10
      },
      "travelOnly": true,
      "image": "/images/items/sword_phoenix.webp",
      "description": "Phoenix Ember Sword."
    },
    {
      "id": "sword_worldtree",
      "name": "Worldtree Blade",
      "slot": "weapon",
      "rarity": "legendary",
      "price": {
        "gold": 0,
        "wood": 0
      },
      "stats": {
        "attack": 38,
        "critChance": 6,
        "speed": 2,
        "attackSpeed": 10
      },
      "travelOnly": true,
      "image": "/images/items/sword_worldtree.webp",
      "description": "Worldtree Blade."
    },
    {
      "id": "sword_voidheart",
      "name": "Voidheart Cleaver",
      "slot": "weapon",
      "rarity": "mythic",
      "price": {
        "gold": 0,
        "wood": 0
      },
      "stats": {
        "attack": 52,
        "critChance": 8,
        "speed": 3,
        "omnivamp": 4,
        "attackSpeed": 13
      },
      "travelOnly": true,
      "image": "/images/items/sword_voidheart.webp",
      "description": "Voidheart Cleaver."
    },
    {
      "id": "sword_astral",
      "name": "Astral Sever",
      "slot": "weapon",
      "rarity": "mythic",
      "price": {
        "gold": 0,
        "wood": 0
      },
      "stats": {
        "attack": 52,
        "critChance": 8,
        "speed": 3,
        "omnivamp": 4,
        "attackSpeed": 13
      },
      "travelOnly": true,
      "image": "/images/items/sword_astral.webp",
      "description": "Astral Sever."
    },
    {
      "id": "sword_bloodmoon",
      "name": "Bloodmoon Greatsword",
      "slot": "weapon",
      "rarity": "mythic",
      "price": {
        "gold": 0,
        "wood": 0
      },
      "stats": {
        "attack": 52,
        "critChance": 8,
        "speed": 3,
        "omnivamp": 4,
        "attackSpeed": 13
      },
      "travelOnly": true,
      "image": "/images/items/sword_bloodmoon.webp",
      "description": "Bloodmoon Greatsword."
    },
    {
      "id": "sword_setra",
      "name": "Setra's Dawnblade",
      "slot": "weapon",
      "rarity": "ancient_relic",
      "price": {
        "gold": 0,
        "wood": 0
      },
      "stats": {
        "attack": 70,
        "critChance": 10,
        "speed": 4,
        "omnivamp": 6,
        "attackSpeed": 16
      },
      "travelOnly": true,
      "image": "/images/items/sword_setra.webp",
      "description": "Setra's Dawnblade."
    },
    {
      "id": "sword_firstborn",
      "name": "Edge of the Firstborn",
      "slot": "weapon",
      "rarity": "ancient_relic",
      "price": {
        "gold": 0,
        "wood": 0
      },
      "stats": {
        "attack": 70,
        "critChance": 10,
        "speed": 4,
        "omnivamp": 6,
        "attackSpeed": 16
      },
      "travelOnly": true,
      "image": "/images/items/sword_firstborn.webp",
      "description": "Edge of the Firstborn."
    },
    {
      "id": "sword_worldheart",
      "name": "Worldheart, the Unmaking",
      "slot": "weapon",
      "rarity": "ancient_relic",
      "price": {
        "gold": 0,
        "wood": 0
      },
      "stats": {
        "attack": 70,
        "critChance": 10,
        "speed": 4,
        "omnivamp": 6,
        "attackSpeed": 16
      },
      "travelOnly": true,
      "image": "/images/items/sword_worldheart.webp",
      "description": "Worldheart, the Unmaking."
    },
    {
      "id": "duskhide_helm",
      "setId": "duskhide",
      "name": "Duskhide Helm",
      "slot": "head",
      "rarity": "common",
      "price": {
        "gold": 0,
        "wood": 0
      },
      "stats": {
        "maxHp": 35,
        "resistance": 5
      },
      "travelOnly": true,
      "image": "/images/items/duskhide_helm.webp",
      "description": "Duskhide helm."
    },
    {
      "id": "duskhide_chest",
      "setId": "duskhide",
      "name": "Duskhide Chest",
      "slot": "armor",
      "rarity": "common",
      "price": {
        "gold": 0,
        "wood": 0
      },
      "stats": {
        "maxHp": 35,
        "resistance": 5
      },
      "travelOnly": true,
      "image": "/images/items/duskhide_chest.webp",
      "description": "Duskhide chest."
    },
    {
      "id": "duskhide_legs",
      "setId": "duskhide",
      "name": "Duskhide Legs",
      "slot": "legs",
      "rarity": "common",
      "price": {
        "gold": 0,
        "wood": 0
      },
      "stats": {
        "maxHp": 42,
        "resistance": 6
      },
      "travelOnly": true,
      "image": "/images/items/duskhide_legs.webp",
      "description": "Duskhide legs."
    },
    {
      "id": "duskhide_boots",
      "setId": "duskhide",
      "name": "Duskhide Boots",
      "slot": "boots",
      "rarity": "common",
      "price": {
        "gold": 0,
        "wood": 0
      },
      "stats": {
        "maxHp": 32,
        "resistance": 5,
        "attackSpeed": 1
      },
      "travelOnly": true,
      "image": "/images/items/duskhide_boots.webp",
      "description": "Duskhide boots."
    },
    {
      "id": "duskhide_blade",
      "setId": "duskhide",
      "name": "Duskhide Blade",
      "slot": "weapon",
      "rarity": "common",
      "price": {
        "gold": 0,
        "wood": 0
      },
      "stats": {
        "attack": 8,
        "attackSpeed": 2
      },
      "travelOnly": true,
      "image": "/images/items/duskhide_blade.webp",
      "description": "Duskhide blade."
    },
    {
      "id": "bronzeforge_helm",
      "setId": "bronzeforge",
      "name": "Bronzeforge Helm",
      "slot": "head",
      "rarity": "uncommon",
      "price": {
        "gold": 0,
        "wood": 0
      },
      "stats": {
        "maxHp": 55,
        "resistance": 8
      },
      "travelOnly": true,
      "image": "/images/items/bronzeforge_helm.webp",
      "description": "Bronzeforge helm."
    },
    {
      "id": "bronzeforge_chest",
      "setId": "bronzeforge",
      "name": "Bronzeforge Chest",
      "slot": "armor",
      "rarity": "uncommon",
      "price": {
        "gold": 0,
        "wood": 0
      },
      "stats": {
        "maxHp": 55,
        "resistance": 8
      },
      "travelOnly": true,
      "image": "/images/items/bronzeforge_chest.webp",
      "description": "Bronzeforge chest."
    },
    {
      "id": "bronzeforge_legs",
      "setId": "bronzeforge",
      "name": "Bronzeforge Legs",
      "slot": "legs",
      "rarity": "uncommon",
      "price": {
        "gold": 0,
        "wood": 0
      },
      "stats": {
        "maxHp": 66,
        "resistance": 9
      },
      "travelOnly": true,
      "image": "/images/items/bronzeforge_legs.webp",
      "description": "Bronzeforge legs."
    },
    {
      "id": "bronzeforge_boots",
      "setId": "bronzeforge",
      "name": "Bronzeforge Boots",
      "slot": "boots",
      "rarity": "uncommon",
      "price": {
        "gold": 0,
        "wood": 0
      },
      "stats": {
        "maxHp": 50,
        "resistance": 7,
        "attackSpeed": 2
      },
      "travelOnly": true,
      "image": "/images/items/bronzeforge_boots.webp",
      "description": "Bronzeforge boots."
    },
    {
      "id": "bronzeforge_blade",
      "setId": "bronzeforge",
      "name": "Bronzeforge Blade",
      "slot": "weapon",
      "rarity": "uncommon",
      "price": {
        "gold": 0,
        "wood": 0
      },
      "stats": {
        "attack": 12,
        "attackSpeed": 3
      },
      "travelOnly": true,
      "image": "/images/items/bronzeforge_blade.webp",
      "description": "Bronzeforge blade."
    },
    {
      "id": "mosswarden_helm",
      "setId": "mosswarden",
      "name": "Mosswarden Helm",
      "slot": "head",
      "rarity": "uncommon",
      "price": {
        "gold": 0,
        "wood": 0
      },
      "stats": {
        "maxHp": 55,
        "resistance": 8
      },
      "travelOnly": true,
      "image": "/images/items/mosswarden_helm.webp",
      "description": "Mosswarden helm."
    },
    {
      "id": "mosswarden_chest",
      "setId": "mosswarden",
      "name": "Mosswarden Chest",
      "slot": "armor",
      "rarity": "uncommon",
      "price": {
        "gold": 0,
        "wood": 0
      },
      "stats": {
        "maxHp": 55,
        "resistance": 8
      },
      "travelOnly": true,
      "image": "/images/items/mosswarden_chest.webp",
      "description": "Mosswarden chest."
    },
    {
      "id": "mosswarden_legs",
      "setId": "mosswarden",
      "name": "Mosswarden Legs",
      "slot": "legs",
      "rarity": "uncommon",
      "price": {
        "gold": 0,
        "wood": 0
      },
      "stats": {
        "maxHp": 66,
        "resistance": 9
      },
      "travelOnly": true,
      "image": "/images/items/mosswarden_legs.webp",
      "description": "Mosswarden legs."
    },
    {
      "id": "mosswarden_boots",
      "setId": "mosswarden",
      "name": "Mosswarden Boots",
      "slot": "boots",
      "rarity": "uncommon",
      "price": {
        "gold": 0,
        "wood": 0
      },
      "stats": {
        "maxHp": 50,
        "resistance": 7,
        "attackSpeed": 2
      },
      "travelOnly": true,
      "image": "/images/items/mosswarden_boots.webp",
      "description": "Mosswarden boots."
    },
    {
      "id": "mosswarden_blade",
      "setId": "mosswarden",
      "name": "Mosswarden Blade",
      "slot": "weapon",
      "rarity": "uncommon",
      "price": {
        "gold": 0,
        "wood": 0
      },
      "stats": {
        "attack": 12,
        "attackSpeed": 3
      },
      "travelOnly": true,
      "image": "/images/items/mosswarden_blade.webp",
      "description": "Mosswarden blade."
    },
    {
      "id": "stormtouched_helm",
      "setId": "stormtouched",
      "name": "Stormtouched Helm",
      "slot": "head",
      "rarity": "rare",
      "price": {
        "gold": 0,
        "wood": 0
      },
      "stats": {
        "maxHp": 85,
        "resistance": 13
      },
      "travelOnly": true,
      "image": "/images/items/stormtouched_helm.webp",
      "description": "Stormtouched helm."
    },
    {
      "id": "stormtouched_chest",
      "setId": "stormtouched",
      "name": "Stormtouched Chest",
      "slot": "armor",
      "rarity": "rare",
      "price": {
        "gold": 0,
        "wood": 0
      },
      "stats": {
        "maxHp": 85,
        "resistance": 13
      },
      "travelOnly": true,
      "image": "/images/items/stormtouched_chest.webp",
      "description": "Stormtouched chest."
    },
    {
      "id": "stormtouched_legs",
      "setId": "stormtouched",
      "name": "Stormtouched Legs",
      "slot": "legs",
      "rarity": "rare",
      "price": {
        "gold": 0,
        "wood": 0
      },
      "stats": {
        "maxHp": 102,
        "resistance": 14
      },
      "travelOnly": true,
      "image": "/images/items/stormtouched_legs.webp",
      "description": "Stormtouched legs."
    },
    {
      "id": "stormtouched_boots",
      "setId": "stormtouched",
      "name": "Stormtouched Boots",
      "slot": "boots",
      "rarity": "rare",
      "price": {
        "gold": 0,
        "wood": 0
      },
      "stats": {
        "maxHp": 77,
        "resistance": 12,
        "attackSpeed": 3
      },
      "travelOnly": true,
      "image": "/images/items/stormtouched_boots.webp",
      "description": "Stormtouched boots."
    },
    {
      "id": "stormtouched_blade",
      "setId": "stormtouched",
      "name": "Stormtouched Blade",
      "slot": "weapon",
      "rarity": "rare",
      "price": {
        "gold": 0,
        "wood": 0
      },
      "stats": {
        "attack": 18,
        "critChance": 2,
        "attackSpeed": 5
      },
      "travelOnly": true,
      "image": "/images/items/stormtouched_blade.webp",
      "description": "Stormtouched blade."
    },
    {
      "id": "runebound_helm",
      "setId": "runebound",
      "name": "Runebound Helm",
      "slot": "head",
      "rarity": "rare",
      "price": {
        "gold": 0,
        "wood": 0
      },
      "stats": {
        "maxHp": 85,
        "resistance": 13
      },
      "travelOnly": true,
      "image": "/images/items/runebound_helm.webp",
      "description": "Runebound helm."
    },
    {
      "id": "runebound_chest",
      "setId": "runebound",
      "name": "Runebound Chest",
      "slot": "armor",
      "rarity": "rare",
      "price": {
        "gold": 0,
        "wood": 0
      },
      "stats": {
        "maxHp": 85,
        "resistance": 13
      },
      "travelOnly": true,
      "image": "/images/items/runebound_chest.webp",
      "description": "Runebound chest."
    },
    {
      "id": "runebound_legs",
      "setId": "runebound",
      "name": "Runebound Legs",
      "slot": "legs",
      "rarity": "rare",
      "price": {
        "gold": 0,
        "wood": 0
      },
      "stats": {
        "maxHp": 102,
        "resistance": 14
      },
      "travelOnly": true,
      "image": "/images/items/runebound_legs.webp",
      "description": "Runebound legs."
    },
    {
      "id": "runebound_boots",
      "setId": "runebound",
      "name": "Runebound Boots",
      "slot": "boots",
      "rarity": "rare",
      "price": {
        "gold": 0,
        "wood": 0
      },
      "stats": {
        "maxHp": 77,
        "resistance": 12,
        "attackSpeed": 3
      },
      "travelOnly": true,
      "image": "/images/items/runebound_boots.webp",
      "description": "Runebound boots."
    },
    {
      "id": "runebound_blade",
      "setId": "runebound",
      "name": "Runebound Blade",
      "slot": "weapon",
      "rarity": "rare",
      "price": {
        "gold": 0,
        "wood": 0
      },
      "stats": {
        "attack": 18,
        "critChance": 2,
        "attackSpeed": 5
      },
      "travelOnly": true,
      "image": "/images/items/runebound_blade.webp",
      "description": "Runebound blade."
    },
    {
      "id": "emberforged_helm",
      "setId": "emberforged",
      "name": "Emberforged Helm",
      "slot": "head",
      "rarity": "epic",
      "price": {
        "gold": 0,
        "wood": 0
      },
      "stats": {
        "maxHp": 130,
        "resistance": 20
      },
      "travelOnly": true,
      "image": "/images/items/emberforged_helm.webp",
      "description": "Emberforged helm."
    },
    {
      "id": "emberforged_chest",
      "setId": "emberforged",
      "name": "Emberforged Chest",
      "slot": "armor",
      "rarity": "epic",
      "price": {
        "gold": 0,
        "wood": 0
      },
      "stats": {
        "maxHp": 130,
        "resistance": 20
      },
      "travelOnly": true,
      "image": "/images/items/emberforged_chest.webp",
      "description": "Emberforged chest."
    },
    {
      "id": "emberforged_legs",
      "setId": "emberforged",
      "name": "Emberforged Legs",
      "slot": "legs",
      "rarity": "epic",
      "price": {
        "gold": 0,
        "wood": 0
      },
      "stats": {
        "maxHp": 156,
        "resistance": 22
      },
      "travelOnly": true,
      "image": "/images/items/emberforged_legs.webp",
      "description": "Emberforged legs."
    },
    {
      "id": "emberforged_boots",
      "setId": "emberforged",
      "name": "Emberforged Boots",
      "slot": "boots",
      "rarity": "epic",
      "price": {
        "gold": 0,
        "wood": 0
      },
      "stats": {
        "maxHp": 117,
        "resistance": 18,
        "attackSpeed": 4
      },
      "travelOnly": true,
      "image": "/images/items/emberforged_boots.webp",
      "description": "Emberforged boots."
    },
    {
      "id": "emberforged_blade",
      "setId": "emberforged",
      "name": "Emberforged Blade",
      "slot": "weapon",
      "rarity": "epic",
      "price": {
        "gold": 0,
        "wood": 0
      },
      "stats": {
        "attack": 27,
        "critChance": 4,
        "attackSpeed": 7
      },
      "travelOnly": true,
      "image": "/images/items/emberforged_blade.webp",
      "description": "Emberforged blade."
    },
    {
      "id": "frostbound_helm",
      "setId": "frostbound",
      "name": "Frostbound Helm",
      "slot": "head",
      "rarity": "epic",
      "price": {
        "gold": 0,
        "wood": 0
      },
      "stats": {
        "maxHp": 130,
        "resistance": 20
      },
      "travelOnly": true,
      "image": "/images/items/frostbound_helm.webp",
      "description": "Frostbound helm."
    },
    {
      "id": "frostbound_chest",
      "setId": "frostbound",
      "name": "Frostbound Chest",
      "slot": "armor",
      "rarity": "epic",
      "price": {
        "gold": 0,
        "wood": 0
      },
      "stats": {
        "maxHp": 130,
        "resistance": 20
      },
      "travelOnly": true,
      "image": "/images/items/frostbound_chest.webp",
      "description": "Frostbound chest."
    },
    {
      "id": "frostbound_legs",
      "setId": "frostbound",
      "name": "Frostbound Legs",
      "slot": "legs",
      "rarity": "epic",
      "price": {
        "gold": 0,
        "wood": 0
      },
      "stats": {
        "maxHp": 156,
        "resistance": 22
      },
      "travelOnly": true,
      "image": "/images/items/frostbound_legs.webp",
      "description": "Frostbound legs."
    },
    {
      "id": "frostbound_boots",
      "setId": "frostbound",
      "name": "Frostbound Boots",
      "slot": "boots",
      "rarity": "epic",
      "price": {
        "gold": 0,
        "wood": 0
      },
      "stats": {
        "maxHp": 117,
        "resistance": 18,
        "attackSpeed": 4
      },
      "travelOnly": true,
      "image": "/images/items/frostbound_boots.webp",
      "description": "Frostbound boots."
    },
    {
      "id": "frostbound_blade",
      "setId": "frostbound",
      "name": "Frostbound Blade",
      "slot": "weapon",
      "rarity": "epic",
      "price": {
        "gold": 0,
        "wood": 0
      },
      "stats": {
        "attack": 27,
        "critChance": 4,
        "attackSpeed": 7
      },
      "travelOnly": true,
      "image": "/images/items/frostbound_blade.webp",
      "description": "Frostbound blade."
    },
    {
      "id": "dragonblood_helm",
      "setId": "dragonblood",
      "name": "Dragonblood Helm",
      "slot": "head",
      "rarity": "legendary",
      "price": {
        "gold": 0,
        "wood": 0
      },
      "stats": {
        "maxHp": 190,
        "resistance": 28
      },
      "travelOnly": true,
      "image": "/images/items/dragonblood_helm.webp",
      "description": "Dragonblood helm."
    },
    {
      "id": "dragonblood_chest",
      "setId": "dragonblood",
      "name": "Dragonblood Chest",
      "slot": "armor",
      "rarity": "legendary",
      "price": {
        "gold": 0,
        "wood": 0
      },
      "stats": {
        "maxHp": 190,
        "resistance": 28
      },
      "travelOnly": true,
      "image": "/images/items/dragonblood_chest.webp",
      "description": "Dragonblood chest."
    },
    {
      "id": "dragonblood_legs",
      "setId": "dragonblood",
      "name": "Dragonblood Legs",
      "slot": "legs",
      "rarity": "legendary",
      "price": {
        "gold": 0,
        "wood": 0
      },
      "stats": {
        "maxHp": 228,
        "resistance": 31
      },
      "travelOnly": true,
      "image": "/images/items/dragonblood_legs.webp",
      "description": "Dragonblood legs."
    },
    {
      "id": "dragonblood_boots",
      "setId": "dragonblood",
      "name": "Dragonblood Boots",
      "slot": "boots",
      "rarity": "legendary",
      "price": {
        "gold": 0,
        "wood": 0
      },
      "stats": {
        "maxHp": 171,
        "resistance": 25,
        "attackSpeed": 6
      },
      "travelOnly": true,
      "image": "/images/items/dragonblood_boots.webp",
      "description": "Dragonblood boots."
    },
    {
      "id": "dragonblood_blade",
      "setId": "dragonblood",
      "name": "Dragonblood Blade",
      "slot": "weapon",
      "rarity": "legendary",
      "price": {
        "gold": 0,
        "wood": 0
      },
      "stats": {
        "attack": 38,
        "critChance": 6,
        "speed": 2,
        "attackSpeed": 10
      },
      "travelOnly": true,
      "image": "/images/items/dragonblood_blade.webp",
      "description": "Dragonblood blade."
    },
    {
      "id": "voidweave_helm",
      "setId": "voidweave",
      "name": "Voidweave Helm",
      "slot": "head",
      "rarity": "mythic",
      "price": {
        "gold": 0,
        "wood": 0
      },
      "stats": {
        "maxHp": 260,
        "resistance": 38
      },
      "travelOnly": true,
      "image": "/images/items/voidweave_helm.webp",
      "description": "Voidweave helm."
    },
    {
      "id": "voidweave_chest",
      "setId": "voidweave",
      "name": "Voidweave Chest",
      "slot": "armor",
      "rarity": "mythic",
      "price": {
        "gold": 0,
        "wood": 0
      },
      "stats": {
        "maxHp": 260,
        "resistance": 38
      },
      "travelOnly": true,
      "image": "/images/items/voidweave_chest.webp",
      "description": "Voidweave chest."
    },
    {
      "id": "voidweave_legs",
      "setId": "voidweave",
      "name": "Voidweave Legs",
      "slot": "legs",
      "rarity": "mythic",
      "price": {
        "gold": 0,
        "wood": 0
      },
      "stats": {
        "maxHp": 312,
        "resistance": 42
      },
      "travelOnly": true,
      "image": "/images/items/voidweave_legs.webp",
      "description": "Voidweave legs."
    },
    {
      "id": "voidweave_boots",
      "setId": "voidweave",
      "name": "Voidweave Boots",
      "slot": "boots",
      "rarity": "mythic",
      "price": {
        "gold": 0,
        "wood": 0
      },
      "stats": {
        "maxHp": 234,
        "resistance": 34,
        "attackSpeed": 8
      },
      "travelOnly": true,
      "image": "/images/items/voidweave_boots.webp",
      "description": "Voidweave boots."
    },
    {
      "id": "voidweave_blade",
      "setId": "voidweave",
      "name": "Voidweave Blade",
      "slot": "weapon",
      "rarity": "mythic",
      "price": {
        "gold": 0,
        "wood": 0
      },
      "stats": {
        "attack": 52,
        "critChance": 8,
        "speed": 3,
        "omnivamp": 4,
        "attackSpeed": 13
      },
      "travelOnly": true,
      "image": "/images/items/voidweave_blade.webp",
      "description": "Voidweave blade."
    },
    {
      "id": "setras_chosen_helm",
      "setId": "setras_chosen",
      "name": "Setra's Chosen Helm",
      "slot": "head",
      "rarity": "ancient_relic",
      "price": {
        "gold": 0,
        "wood": 0
      },
      "stats": {
        "maxHp": 360,
        "resistance": 52
      },
      "travelOnly": true,
      "image": "/images/items/setras_chosen_helm.webp",
      "description": "Setra's Chosen helm."
    },
    {
      "id": "setras_chosen_chest",
      "setId": "setras_chosen",
      "name": "Setra's Chosen Chest",
      "slot": "armor",
      "rarity": "ancient_relic",
      "price": {
        "gold": 0,
        "wood": 0
      },
      "stats": {
        "maxHp": 360,
        "resistance": 52
      },
      "travelOnly": true,
      "image": "/images/items/setras_chosen_chest.webp",
      "description": "Setra's Chosen chest."
    },
    {
      "id": "setras_chosen_legs",
      "setId": "setras_chosen",
      "name": "Setra's Chosen Legs",
      "slot": "legs",
      "rarity": "ancient_relic",
      "price": {
        "gold": 0,
        "wood": 0
      },
      "stats": {
        "maxHp": 432,
        "resistance": 57
      },
      "travelOnly": true,
      "image": "/images/items/setras_chosen_legs.webp",
      "description": "Setra's Chosen legs."
    },
    {
      "id": "setras_chosen_boots",
      "setId": "setras_chosen",
      "name": "Setra's Chosen Boots",
      "slot": "boots",
      "rarity": "ancient_relic",
      "price": {
        "gold": 0,
        "wood": 0
      },
      "stats": {
        "maxHp": 324,
        "resistance": 47,
        "attackSpeed": 10
      },
      "travelOnly": true,
      "image": "/images/items/setras_chosen_boots.webp",
      "description": "Setra's Chosen boots."
    },
    {
      "id": "setras_chosen_blade",
      "setId": "setras_chosen",
      "name": "Setra's Chosen Blade",
      "slot": "weapon",
      "rarity": "ancient_relic",
      "price": {
        "gold": 0,
        "wood": 0
      },
      "stats": {
        "attack": 70,
        "critChance": 10,
        "speed": 4,
        "omnivamp": 6,
        "attackSpeed": 16
      },
      "travelOnly": true,
      "image": "/images/items/setras_chosen_blade.webp",
      "description": "Setra's Chosen blade."
    },
    {
      "id": "setras_chosen_amulet",
      "setId": "setras_chosen",
      "name": "Setra's Chosen Amulet",
      "slot": "amulet",
      "rarity": "ancient_relic",
      "price": {
        "gold": 0,
        "wood": 0
      },
      "stats": {
        "magicPower": 16,
        "healPower": 8,
        "mana": 360,
        "attackSpeed": 10
      },
      "travelOnly": true,
      "image": "/images/items/setras_chosen_amulet.webp",
      "description": "Setra's Chosen amulet."
    },
    {
      "id": "setras_chosen_ring",
      "setId": "setras_chosen",
      "name": "Setra's Chosen Ring",
      "slot": "ring",
      "rarity": "ancient_relic",
      "price": {
        "gold": 0,
        "wood": 0
      },
      "stats": {
        "attack": 28,
        "critChance": 10,
        "attackSpeed": 10
      },
      "travelOnly": true,
      "image": "/images/items/setras_chosen_ring.webp",
      "description": "Setra's Chosen ring."
    },
    {
      "id": "setras_chosen_book",
      "setId": "setras_chosen",
      "name": "Setra's Chosen Book",
      "slot": "book",
      "rarity": "ancient_relic",
      "price": {
        "gold": 0,
        "wood": 0
      },
      "stats": {
        "magicPower": 16,
        "healPower": 16
      },
      "travelOnly": true,
      "image": "/images/items/setras_chosen_book.webp",
      "description": "Setra's Chosen book."
    },
    {
      "id": "setras_chosen_stone",
      "setId": "setras_chosen",
      "name": "Setra's Chosen Stone",
      "slot": "stone",
      "rarity": "ancient_relic",
      "price": {
        "gold": 0,
        "wood": 0
      },
      "stats": {
        "resistance": 31,
        "maxHp": 216
      },
      "travelOnly": true,
      "image": "/images/items/setras_chosen_stone.webp",
      "description": "Setra's Chosen stone."
    }
  ],
  "itemSets": [
    {
      "id": "void",
      "name": "Voidcaller",
      "description": "Gear steeped in the lightless void. It hums when whole.",
      "bonuses": [
        {
          "pieces": 2,
          "stats": {
            "attack": 12,
            "magicPower": 12
          }
        },
        {
          "pieces": 4,
          "stats": {
            "attack": 30,
            "magicPower": 30,
            "speed": 5
          }
        }
      ]
    },
    {
      "id": "shadow",
      "name": "Nightshade",
      "description": "Eclipse-dark garb for those who strike unseen.",
      "bonuses": [
        {
          "pieces": 2,
          "stats": {
            "attack": 8,
            "speed": 2
          }
        },
        {
          "pieces": 4,
          "stats": {
            "attack": 20,
            "speed": 5,
            "critChance": 3
          }
        }
      ]
    },
    {
      "id": "ranger",
      "name": "Wildstrider",
      "description": "Scout gear of the deep woods. Light feet, true aim.",
      "bonuses": [
        {
          "pieces": 2,
          "stats": {
            "attack": 6,
            "speed": 2
          }
        },
        {
          "pieces": 4,
          "stats": {
            "attack": 15,
            "maxHp": 30,
            "speed": 3
          }
        }
      ]
    },
    {
      "id": "dragon",
      "name": "Dragonscale",
      "description": "Plate cut from elder wyrms. Heavy, proud, unbroken.",
      "bonuses": [
        {
          "pieces": 2,
          "stats": {
            "maxHp": 20,
            "resistance": 5
          }
        },
        {
          "pieces": 4,
          "stats": {
            "maxHp": 60,
            "resistance": 12,
            "attack": 10
          }
        }
      ]
    },
    {
      "id": "leather",
      "name": "Trailworn",
      "description": "Honest stitched leather for the road.",
      "bonuses": [
        {
          "pieces": 2,
          "stats": {
            "maxHp": 15
          }
        },
        {
          "pieces": 4,
          "stats": {
            "maxHp": 40,
            "resistance": 4
          }
        }
      ]
    },
    {
      "id": "iron",
      "name": "Ironclad",
      "description": "Plain iron, honestly forged.",
      "bonuses": [
        {
          "pieces": 2,
          "stats": {
            "maxHp": 12,
            "resistance": 2
          }
        },
        {
          "pieces": 4,
          "stats": {
            "maxHp": 30,
            "resistance": 6
          }
        }
      ]
    },
    {
      "id": "blood",
      "name": "Sanguine",
      "description": "Vampiric relics that thirst together. Two pieces wake them; four unleash them.",
      "bonuses": [
        {
          "pieces": 2,
          "stats": {
            "attack": 12,
            "maxHp": 25
          }
        },
        {
          "pieces": 4,
          "stats": {
            "attack": 30,
            "maxHp": 60,
            "omnivamp": 5
          }
        }
      ]
    },
    {
      "id": "duskhide",
      "name": "Duskhide",
      "description": "Dark leather for quiet roads.",
      "bonuses": [
        {
          "pieces": 2,
          "stats": {
            "maxHp": 30
          }
        },
        {
          "pieces": 4,
          "stats": {
            "maxHp": 40,
            "resistance": 4
          }
        }
      ]
    },
    {
      "id": "bronzeforge",
      "name": "Bronzeforge",
      "description": "Steel breast and bronze trim.",
      "bonuses": [
        {
          "pieces": 2,
          "stats": {
            "attack": 4,
            "resistance": 4
          }
        },
        {
          "pieces": 4,
          "stats": {
            "attack": 8,
            "maxHp": 60
          }
        }
      ]
    },
    {
      "id": "mosswarden",
      "name": "Mosswarden",
      "description": "Bark and moss grown armour.",
      "bonuses": [
        {
          "pieces": 2,
          "stats": {
            "attack": 4,
            "resistance": 4
          }
        },
        {
          "pieces": 4,
          "stats": {
            "attack": 8,
            "maxHp": 60
          }
        }
      ]
    },
    {
      "id": "stormtouched",
      "name": "Stormtouched",
      "description": "Forged in a thunderstorm.",
      "bonuses": [
        {
          "pieces": 2,
          "stats": {
            "attack": 7,
            "magicPower": 5
          }
        },
        {
          "pieces": 4,
          "stats": {
            "attack": 14,
            "speed": 5
          }
        }
      ]
    },
    {
      "id": "runebound",
      "name": "Runebound",
      "description": "Etched with living runes.",
      "bonuses": [
        {
          "pieces": 2,
          "stats": {
            "attack": 7,
            "magicPower": 5
          }
        },
        {
          "pieces": 4,
          "stats": {
            "attack": 14,
            "speed": 5
          }
        }
      ]
    },
    {
      "id": "emberforged",
      "name": "Emberforged",
      "description": "Black steel veined with molten ember.",
      "bonuses": [
        {
          "pieces": 2,
          "stats": {
            "attack": 12,
            "resistance": 8
          }
        },
        {
          "pieces": 4,
          "stats": {
            "attack": 22,
            "maxHp": 120
          }
        }
      ]
    },
    {
      "id": "frostbound",
      "name": "Frostbound",
      "description": "Armour of enduring winter.",
      "bonuses": [
        {
          "pieces": 2,
          "stats": {
            "attack": 12,
            "resistance": 8
          }
        },
        {
          "pieces": 4,
          "stats": {
            "attack": 22,
            "maxHp": 120
          }
        }
      ]
    },
    {
      "id": "dragonblood",
      "name": "Dragonblood",
      "description": "Dragonscale burning with a molten heart.",
      "bonuses": [
        {
          "pieces": 2,
          "stats": {
            "attack": 18,
            "critChance": 3
          }
        },
        {
          "pieces": 4,
          "stats": {
            "attack": 32,
            "critDamage": 15
          }
        }
      ]
    },
    {
      "id": "voidweave",
      "name": "Voidweave",
      "description": "Cloth of the lightless void.",
      "bonuses": [
        {
          "pieces": 2,
          "stats": {
            "attack": 26,
            "magicPower": 20
          }
        },
        {
          "pieces": 4,
          "stats": {
            "attack": 44,
            "magicPower": 36,
            "speed": 6
          }
        }
      ]
    },
    {
      "id": "setras_chosen",
      "name": "Setra's Chosen",
      "description": "The relic panoply of the first chosen.",
      "bonuses": [
        {
          "pieces": 2,
          "stats": {
            "attack": 18,
            "magicPower": 18
          }
        },
        {
          "pieces": 4,
          "stats": {
            "resistance": 25,
            "maxHp": 80
          }
        },
        {
          "pieces": 6,
          "stats": {
            "attack": 40,
            "magicPower": 40,
            "speed": 10
          }
        }
      ]
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
      "image": "/images/monsters/slime.webp?v=mu7qtmip",
      "resistance": 4,
      "tags": [
        "slime"
      ]
    },
    {
      "id": "goblin",
      "name": "Goblin",
      "hp": 60,
      "attack": 14,
      "speed": 8,
      "rarity": "common",
      "element": "physical",
      "image": "/images/monsters/goblin.webp?v=mu7qu4od",
      "resistance": 5,
      "tags": [
        "humanoid"
      ]
    },
    {
      "id": "giant_rat",
      "name": "Giant Rat",
      "hp": 45,
      "attack": 12,
      "speed": 9,
      "rarity": "common",
      "element": "physical",
      "image": "/images/monsters/giant_rat.webp?v=mu7quogb",
      "resistance": 5,
      "tags": [
        "beast"
      ]
    },
    {
      "id": "cave_bat",
      "name": "Cave Bat",
      "hp": 35,
      "attack": 11,
      "speed": 14,
      "rarity": "common",
      "element": "physical",
      "image": "/images/monsters/cave_bat.webp?v=mu7qv2o5",
      "resistance": 1,
      "tags": [
        "beast"
      ]
    },
    {
      "id": "wolf",
      "name": "Wolf",
      "hp": 70,
      "attack": 15,
      "speed": 11,
      "rarity": "common",
      "element": "physical",
      "image": "/images/monsters/wolf.webp?v=mu7qvbai",
      "resistance": 2,
      "tags": [
        "beast"
      ]
    },
    {
      "id": "bandit",
      "name": "Bandit",
      "hp": 65,
      "attack": 16,
      "speed": 9,
      "rarity": "common",
      "element": "physical",
      "image": "/images/monsters/bandit.webp?v=mu7qwkj6",
      "resistance": 2,
      "tags": [
        "humanoid"
      ]
    },
    {
      "id": "spider",
      "name": "Spider",
      "hp": 50,
      "attack": 13,
      "speed": 10,
      "rarity": "common",
      "element": "shadow",
      "image": "/images/monsters/spider.webp?v=mu7qxh6t",
      "resistance": 5,
      "tags": [
        "beast"
      ]
    },
    {
      "id": "wild_boar",
      "name": "Wild Boar",
      "hp": 80,
      "attack": 17,
      "speed": 7,
      "rarity": "common",
      "element": "physical",
      "image": "/images/monsters/wild_boar.webp?v=mu7qxsqv",
      "resistance": 3,
      "tags": [
        "beast"
      ]
    },
    {
      "id": "goblin_archer",
      "name": "Goblin Archer",
      "hp": 55,
      "attack": 16,
      "speed": 10,
      "rarity": "common",
      "element": "physical",
      "image": "/images/monsters/goblin_archer.webp?v=mu7qy07h",
      "resistance": 5,
      "tags": [
        "humanoid"
      ]
    },
    {
      "id": "rat_king",
      "name": "Rat King",
      "hp": 90,
      "attack": 14,
      "speed": 12,
      "rarity": "common",
      "element": "physical",
      "image": "/images/monsters/rat_king.webp?v=mu7qy89j",
      "resistance": 3,
      "tags": [
        "beast"
      ]
    },
    {
      "id": "grove_sprite",
      "name": "Grove Sprite",
      "hp": 80,
      "attack": 12,
      "speed": 10,
      "rarity": "uncommon",
      "element": "arcane",
      "image": "/images/monsters/grove_sprite.webp?v=mu7qynwb",
      "resistance": 6,
      "tags": [
        "plant"
      ]
    },
    {
      "id": "goblin_warrior",
      "name": "Goblin Warrior",
      "hp": 100,
      "attack": 19,
      "speed": 8,
      "rarity": "uncommon",
      "element": "physical",
      "image": "/images/monsters/goblin_warrior.webp?v=mu7qyvo2",
      "resistance": 7,
      "tags": [
        "humanoid"
      ]
    },
    {
      "id": "skeleton",
      "name": "Skeleton",
      "hp": 95,
      "attack": 20,
      "speed": 7,
      "rarity": "uncommon",
      "element": "shadow",
      "image": "/images/monsters/skeleton.webp?v=mu7qz2m0",
      "resistance": 10,
      "tags": [
        "undead"
      ]
    },
    {
      "id": "dire_wolf",
      "name": "Dire Wolf",
      "hp": 110,
      "attack": 21,
      "speed": 12,
      "rarity": "uncommon",
      "element": "physical",
      "image": "/images/monsters/dire_wolf.webp?v=mu7qzanm",
      "resistance": 6,
      "tags": [
        "beast"
      ]
    },
    {
      "id": "harpy",
      "name": "Harpy",
      "hp": 85,
      "attack": 18,
      "speed": 15,
      "rarity": "uncommon",
      "element": "physical",
      "image": "/images/monsters/harpy.webp?v=mu7r1669",
      "resistance": 7,
      "tags": [
        "beast"
      ]
    },
    {
      "id": "orc",
      "name": "Orc",
      "hp": 140,
      "attack": 22,
      "speed": 6,
      "rarity": "uncommon",
      "element": "physical",
      "image": "/images/monsters/orc.webp?v=mu7r1eep",
      "resistance": 5,
      "tags": [
        "humanoid"
      ]
    },
    {
      "id": "thorn_viper",
      "name": "Thorn Viper",
      "hp": 75,
      "attack": 19,
      "speed": 13,
      "rarity": "uncommon",
      "element": "shadow",
      "image": "/images/monsters/thorn_viper.webp?v=mu7r1k10",
      "resistance": 7,
      "tags": [
        "beast"
      ]
    },
    {
      "id": "swamp_troll",
      "name": "Swamp Troll",
      "hp": 160,
      "attack": 20,
      "speed": 4,
      "rarity": "uncommon",
      "element": "physical",
      "image": "/images/monsters/swamp_troll.webp?v=mu7r1wab",
      "resistance": 7,
      "tags": [
        "beast"
      ]
    },
    {
      "id": "griffin",
      "name": "Griffin",
      "hp": 150,
      "attack": 23,
      "speed": 11,
      "rarity": "uncommon",
      "element": "physical",
      "image": "/images/monsters/griffin.webp?v=mu7r23vh",
      "resistance": 8,
      "tags": [
        "beast"
      ]
    },
    {
      "id": "golem",
      "name": "Golem",
      "hp": 300,
      "attack": 18,
      "speed": 3,
      "rarity": "rare",
      "element": "physical",
      "image": "/images/monsters/golem.webp?v=mu7r2ahq",
      "resistance": 38,
      "tags": [
        "construct"
      ]
    },
    {
      "id": "stone_warden",
      "name": "Stone Warden",
      "hp": 220,
      "attack": 16,
      "speed": 4,
      "rarity": "rare",
      "element": "physical",
      "image": "/images/monsters/stone_warden.webp?v=mu7r2hkq",
      "resistance": 30,
      "tags": [
        "construct"
      ]
    },
    {
      "id": "wraith",
      "name": "Wraith",
      "hp": 130,
      "attack": 26,
      "speed": 12,
      "rarity": "rare",
      "element": "shadow",
      "image": "/images/monsters/wraith.webp?v=mu7r2myq",
      "resistance": 25,
      "tags": [
        "undead"
      ]
    },
    {
      "id": "manticore",
      "name": "Manticore",
      "hp": 180,
      "attack": 28,
      "speed": 10,
      "rarity": "rare",
      "element": "physical",
      "image": "/images/monsters/manticore.webp?v=mu7r2rxl",
      "resistance": 12,
      "tags": [
        "beast"
      ]
    },
    {
      "id": "ogre",
      "name": "Ogre",
      "hp": 250,
      "attack": 29,
      "speed": 5,
      "rarity": "rare",
      "element": "physical",
      "image": "/images/monsters/ogre.webp?v=mu7r2zoc",
      "resistance": 25,
      "tags": [
        "beast"
      ]
    },
    {
      "id": "dark_knight",
      "name": "Dark Knight",
      "hp": 200,
      "attack": 30,
      "speed": 9,
      "rarity": "rare",
      "element": "shadow",
      "image": "/images/monsters/dark_knight.webp?v=mu7r3ipk",
      "resistance": 20,
      "tags": [
        "humanoid"
      ]
    },
    {
      "id": "witch",
      "name": "Witch",
      "hp": 140,
      "attack": 27,
      "speed": 8,
      "rarity": "rare",
      "element": "arcane",
      "image": "/images/monsters/witch.webp?v=mu7r3r8w",
      "resistance": 15,
      "tags": [
        "humanoid"
      ]
    },
    {
      "id": "wyvern",
      "name": "Wyvern",
      "hp": 260,
      "attack": 34,
      "speed": 12,
      "rarity": "epic",
      "element": "arcane",
      "image": "/images/monsters/wyvern.webp?v=mu7r4cjg",
      "resistance": 25,
      "tags": [
        "dragon"
      ]
    },
    {
      "id": "ancient_golem",
      "name": "Ancient Golem",
      "hp": 400,
      "attack": 35,
      "speed": 3,
      "rarity": "epic",
      "element": "physical",
      "image": "/images/monsters/ancient_golem.webp?v=mu7r4ixe",
      "resistance": 46,
      "tags": [
        "construct"
      ]
    },
    {
      "id": "lich",
      "name": "Lich",
      "hp": 240,
      "attack": 36,
      "speed": 8,
      "rarity": "legendary",
      "element": "shadow",
      "image": "/images/monsters/lich.webp?v=mu7rbse8",
      "resistance": 45,
      "tags": [
        "undead"
      ]
    },
    {
      "id": "hydra",
      "name": "Hydra",
      "hp": 340,
      "attack": 32,
      "speed": 6,
      "rarity": "mythic",
      "element": "physical",
      "image": "/images/monsters/hydra.webp?v=mu7r6jq2",
      "resistance": 47,
      "tags": [
        "dragon"
      ]
    },
    {
      "id": "kobold",
      "name": "Kobold",
      "hp": 50,
      "attack": 13,
      "speed": 10,
      "rarity": "common",
      "element": "physical",
      "image": "/images/monsters/kobold.webp?v=mu7r79ob",
      "resistance": 5,
      "tags": [
        "humanoid"
      ]
    },
    {
      "id": "scavenger",
      "name": "Scavenger",
      "hp": 55,
      "attack": 12,
      "speed": 9,
      "rarity": "common",
      "element": "physical",
      "image": "/images/monsters/scavenger.webp?v=mu7r7hoz",
      "resistance": 0,
      "tags": [
        "humanoid"
      ]
    },
    {
      "id": "cave_crawler",
      "name": "Cave Crawler",
      "hp": 48,
      "attack": 11,
      "speed": 8,
      "rarity": "common",
      "element": "physical",
      "image": "/images/monsters/cave_crawler.webp?v=mu7r7n2u",
      "resistance": 0,
      "tags": [
        "plant"
      ]
    },
    {
      "id": "forest_mite",
      "name": "Forest Mite",
      "hp": 38,
      "attack": 10,
      "speed": 13,
      "rarity": "common",
      "element": "physical",
      "image": "/images/monsters/forest_mite.webp?v=mu7r7urs",
      "resistance": 1,
      "tags": [
        "plant"
      ]
    },
    {
      "id": "sludge",
      "name": "Sludge",
      "hp": 60,
      "attack": 11,
      "speed": 4,
      "rarity": "common",
      "element": "physical",
      "image": "/images/monsters/sludge.webp?v=mu7r80xw",
      "resistance": 2,
      "tags": [
        "slime"
      ]
    },
    {
      "id": "thug",
      "name": "Thug",
      "hp": 62,
      "attack": 15,
      "speed": 7,
      "rarity": "common",
      "element": "physical",
      "image": "/images/monsters/thug.webp?v=mu7r86qm",
      "resistance": 2,
      "tags": [
        "humanoid"
      ]
    },
    {
      "id": "dusk_bat",
      "name": "Dusk Bat",
      "hp": 36,
      "attack": 12,
      "speed": 14,
      "rarity": "common",
      "element": "physical",
      "image": "/images/monsters/dusk_bat.webp?v=mu7r8glb",
      "resistance": 3,
      "tags": [
        "beast"
      ]
    },
    {
      "id": "ember_slime",
      "name": "Ember Slime",
      "hp": 42,
      "attack": 12,
      "speed": 5,
      "rarity": "common",
      "element": "physical",
      "image": "/images/monsters/ember_slime.webp?v=mu7r8nnb",
      "resistance": 4,
      "tags": [
        "slime"
      ]
    },
    {
      "id": "iron_goblin",
      "name": "Iron Goblin",
      "hp": 105,
      "attack": 20,
      "speed": 8,
      "rarity": "uncommon",
      "element": "physical",
      "image": "/images/monsters/iron_goblin.webp?v=mu7rrqif",
      "resistance": 11,
      "tags": [
        "humanoid"
      ]
    },
    {
      "id": "bone_archer",
      "name": "Bone Archer",
      "hp": 88,
      "attack": 22,
      "speed": 11,
      "rarity": "uncommon",
      "element": "physical",
      "image": "/images/monsters/bone_archer.webp?v=mu7rrjd3",
      "resistance": 11,
      "tags": [
        "undead"
      ]
    },
    {
      "id": "frost_wolf",
      "name": "Frost Wolf",
      "hp": 115,
      "attack": 23,
      "speed": 13,
      "rarity": "uncommon",
      "element": "physical",
      "image": "/images/monsters/frost_wolf.webp?v=mu7rr9ba",
      "resistance": 10,
      "tags": [
        "beast"
      ]
    },
    {
      "id": "vine_lurker",
      "name": "Vine Lurker",
      "hp": 95,
      "attack": 18,
      "speed": 9,
      "rarity": "uncommon",
      "element": "arcane",
      "image": "/images/monsters/vine_lurker.webp?v=mu7rre5s",
      "resistance": 9,
      "tags": [
        "plant"
      ]
    },
    {
      "id": "ash_spider",
      "name": "Ash Spider",
      "hp": 78,
      "attack": 19,
      "speed": 12,
      "rarity": "uncommon",
      "element": "shadow",
      "image": "/images/monsters/ash_spider.webp?v=mu7rs0ti",
      "resistance": 11,
      "tags": [
        "beast"
      ]
    },
    {
      "id": "brigand_captain",
      "name": "Brigand Captain",
      "hp": 125,
      "attack": 21,
      "speed": 9,
      "rarity": "uncommon",
      "element": "physical",
      "image": "/images/monsters/brigand_captain.webp?v=mu7rwelo",
      "resistance": 11,
      "tags": [
        "humanoid"
      ]
    },
    {
      "id": "marsh_crawler",
      "name": "Marsh Crawler",
      "hp": 135,
      "attack": 20,
      "speed": 6,
      "rarity": "uncommon",
      "element": "physical",
      "image": "/images/monsters/marsh_crawler.webp?v=mu7rhs7k",
      "resistance": 5,
      "tags": [
        "plant"
      ]
    },
    {
      "id": "ember_sprite",
      "name": "Ember Sprite",
      "hp": 82,
      "attack": 18,
      "speed": 12,
      "rarity": "uncommon",
      "element": "arcane",
      "image": "/images/monsters/ember_sprite.webp?v=mu7roir8",
      "resistance": 10,
      "tags": [
        "plant"
      ]
    },
    {
      "id": "crystal_golem",
      "name": "Crystal Golem",
      "hp": 260,
      "attack": 28,
      "speed": 3,
      "rarity": "rare",
      "element": "physical",
      "image": "/images/monsters/crystal_golem.webp?v=mu7rvqqs",
      "resistance": 45,
      "tags": [
        "construct"
      ]
    },
    {
      "id": "abyss_wraith",
      "name": "Abyss Wraith",
      "hp": 135,
      "attack": 27,
      "speed": 11,
      "rarity": "rare",
      "element": "shadow",
      "image": "/images/monsters/abyss_wraith.webp?v=mu7ruesw",
      "resistance": 14,
      "tags": [
        "undead"
      ]
    },
    {
      "id": "storm_harpy",
      "name": "Storm Harpy",
      "hp": 105,
      "attack": 24,
      "speed": 15,
      "rarity": "rare",
      "element": "physical",
      "image": "/images/monsters/storm_harpy.webp?v=mu7rsho3",
      "resistance": 16,
      "tags": [
        "beast"
      ]
    },
    {
      "id": "iron_ogre",
      "name": "Iron Ogre",
      "hp": 240,
      "attack": 30,
      "speed": 5,
      "rarity": "rare",
      "element": "physical",
      "image": "/images/monsters/iron_ogre.webp?v=mu7rpeze",
      "resistance": 32,
      "tags": [
        "beast"
      ]
    },
    {
      "id": "cursed_knight",
      "name": "Cursed Knight",
      "hp": 190,
      "attack": 29,
      "speed": 9,
      "rarity": "rare",
      "element": "shadow",
      "image": "/images/monsters/cursed_knight.webp?v=mu7rpb0u",
      "resistance": 20,
      "tags": [
        "humanoid"
      ]
    },
    {
      "id": "flame_witch",
      "name": "Flame Witch",
      "hp": 145,
      "attack": 28,
      "speed": 8,
      "rarity": "rare",
      "element": "arcane",
      "image": "/images/monsters/flame_witch.webp?v=mu7rnfdp",
      "resistance": 17,
      "tags": [
        "humanoid"
      ]
    },
    {
      "id": "stone_titan",
      "name": "Stone Titan",
      "hp": 270,
      "attack": 29,
      "speed": 3,
      "rarity": "rare",
      "element": "physical",
      "image": "/images/monsters/stone_titan.webp?v=mu7rmvhz",
      "resistance": 42,
      "tags": [
        "construct"
      ]
    },
    {
      "id": "dusk_manticore",
      "name": "Dusk Manticore",
      "hp": 175,
      "attack": 27,
      "speed": 10,
      "rarity": "rare",
      "element": "physical",
      "image": "/images/monsters/dusk_manticore.webp?v=mu7rmq8v",
      "resistance": 24,
      "tags": [
        "beast"
      ]
    },
    {
      "id": "frost_wyvern",
      "name": "Frost Wyvern",
      "hp": 270,
      "attack": 35,
      "speed": 11,
      "rarity": "epic",
      "element": "arcane",
      "image": "/images/monsters/frost_wyvern.webp?v=mu7rn8vx",
      "resistance": 36,
      "tags": [
        "dragon"
      ]
    },
    {
      "id": "void_golem",
      "name": "Void Golem",
      "hp": 380,
      "attack": 34,
      "speed": 3,
      "rarity": "epic",
      "element": "physical",
      "image": "/images/monsters/void_golem.webp?v=mu7ru458",
      "resistance": 44,
      "tags": [
        "construct"
      ]
    },
    {
      "id": "storm_lich",
      "name": "Storm Lich",
      "hp": 250,
      "attack": 37,
      "speed": 9,
      "rarity": "epic",
      "element": "shadow",
      "image": "/images/monsters/storm_lich.webp?v=mu7rs9hm",
      "resistance": 23,
      "tags": [
        "undead"
      ]
    },
    {
      "id": "nether_hydra",
      "name": "Nether Hydra",
      "hp": 330,
      "attack": 33,
      "speed": 6,
      "rarity": "epic",
      "element": "physical",
      "image": "/images/monsters/nether_hydra.webp?v=mu7rjzij",
      "resistance": 40,
      "tags": [
        "dragon"
      ]
    },
    {
      "id": "doom_lord",
      "name": "Doom Lord",
      "hp": 300,
      "attack": 40,
      "speed": 7,
      "rarity": "legendary",
      "element": "shadow",
      "image": "/images/monsters/doom_lord.webp?v=mu7rjrmg",
      "resistance": 30,
      "tags": [
        "demon"
      ]
    },
    {
      "id": "molten_behemoth",
      "name": "Molten Behemoth",
      "hp": 520,
      "attack": 44,
      "speed": 4,
      "rarity": "epic",
      "element": "physical",
      "image": "/images/monsters/molten_behemoth.webp?v=mu7rds3s",
      "resistance": 40,
      "tags": [
        "demon"
      ]
    },
    {
      "id": "frost_titan",
      "name": "Frost Titan",
      "hp": 540,
      "attack": 42,
      "speed": 3,
      "rarity": "epic",
      "element": "physical",
      "image": "/images/monsters/frost_titan.webp?v=mu7rdgek",
      "resistance": 38,
      "tags": [
        "construct"
      ]
    },
    {
      "id": "void_herald",
      "name": "Void Herald",
      "hp": 480,
      "attack": 46,
      "speed": 8,
      "rarity": "epic",
      "element": "shadow",
      "image": "/images/monsters/void_herald.webp?v=mu7rd7o2",
      "resistance": 21,
      "tags": [
        "demon"
      ]
    },
    {
      "id": "storm_colossus",
      "name": "Storm Colossus",
      "hp": 500,
      "attack": 43,
      "speed": 6,
      "rarity": "epic",
      "element": "arcane",
      "image": "/images/monsters/storm_colossus.webp?v=mu7rd159",
      "resistance": 37,
      "tags": [
        "construct"
      ]
    },
    {
      "id": "phoenix_canary",
      "name": "Phoenix Canary",
      "hp": 460,
      "attack": 42,
      "speed": 12,
      "rarity": "epic",
      "element": "holy",
      "image": "/images/monsters/phoenix_canary.webp?v=mu7rc371",
      "resistance": 36,
      "tags": [
        "beast"
      ]
    },
    {
      "id": "world_eater",
      "tags": [
        "dragon"
      ],
      "name": "World Eater",
      "hp": 360,
      "attack": 38,
      "speed": 5,
      "rarity": "mythic",
      "element": "physical",
      "image": "/images/monsters/world_eater.webp?v=mu7rcazb",
      "resistance": 40
    },
    {
      "id": "vine_wraith",
      "name": "Vine Wraith",
      "hp": 95,
      "attack": 14,
      "speed": 12,
      "rarity": "uncommon",
      "element": "nature",
      "image": "/images/monsters/vine_wraith.webp?v=mu7rch8q",
      "resistance": 9,
      "tags": [
        "undead"
      ]
    },
    {
      "id": "thornback_boar",
      "name": "Thornback Boar",
      "hp": 130,
      "attack": 18,
      "speed": 8,
      "rarity": "uncommon",
      "element": "nature",
      "image": "/images/monsters/thornback_boar.webp?v=mu7rcorz",
      "resistance": 12,
      "tags": [
        "beast"
      ]
    },
    {
      "id": "elder_treant",
      "name": "Elder Treant",
      "hp": 260,
      "attack": 24,
      "speed": 5,
      "rarity": "rare",
      "element": "nature",
      "image": "/images/monsters/elder_treant.webp?v=mu7rcttz",
      "resistance": 19,
      "tags": [
        "plant"
      ]
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
        "shadow_essence",
        "shadow_sigil"
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
        "arcane_essence",
        "arcane_seal"
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
        "arcane_essence",
        "war_crest"
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
      "label": "Glacier Doomlord",
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
      "label": "Eternal Abyss Herald",
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
      "label": "Thunder Tyrant",
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
      "label": "Oblivion Devourer",
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
    },
    {
      "rank": "t1",
      "label": "Verdant Ruins",
      "image": "/images/dungeons/t1.png",
      "stamina": 3,
      "xpReward": 90,
      "goldScale": 0.8,
      "woodScale": 0.7,
      "goldBase": 55,
      "woodBase": 35,
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
      "monsterPower": 1.5,
      "sizeProfile": "more",
      "travel": true
    },
    {
      "rank": "t2",
      "label": "Sunken Cistern",
      "image": "/images/dungeons/t2.png",
      "stamina": 3,
      "xpReward": 140,
      "goldScale": 1,
      "woodScale": 0.9,
      "goldBase": 80,
      "woodBase": 50,
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
      "monsterPower": 1.9,
      "sizeProfile": "more",
      "travel": true
    },
    {
      "rank": "t3",
      "label": "Ashen War Camp",
      "image": "/images/dungeons/t3.png",
      "stamina": 4,
      "xpReward": 210,
      "goldScale": 1.25,
      "woodScale": 1.1,
      "goldBase": 110,
      "woodBase": 70,
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
      "monsterCount": 4,
      "monsterPower": 2.4,
      "sizeProfile": "more",
      "travel": true
    },
    {
      "rank": "t4",
      "label": "Frozen Sanctum",
      "image": "/images/dungeons/t4.png",
      "stamina": 4,
      "xpReward": 300,
      "goldScale": 1.5,
      "woodScale": 1.3,
      "goldBase": 150,
      "woodBase": 95,
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
      "monsterPower": 3,
      "sizeProfile": "more",
      "travel": true
    },
    {
      "rank": "t5",
      "label": "Void Rift",
      "image": "/images/dungeons/t5.png",
      "stamina": 5,
      "xpReward": 420,
      "goldScale": 1.8,
      "woodScale": 1.55,
      "goldBase": 200,
      "woodBase": 125,
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
      "monsterCount": 5,
      "monsterPower": 3.7,
      "sizeProfile": "more",
      "travel": true
    },
    {
      "rank": "t6",
      "label": "Worldroot Abyss",
      "image": "/images/dungeons/t6.png",
      "stamina": 6,
      "xpReward": 600,
      "goldScale": 2.15,
      "woodScale": 1.85,
      "goldBase": 270,
      "woodBase": 170,
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
      "monsterPower": 4.5,
      "sizeProfile": "more",
      "travel": true
    }
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
  "images": {
    "backgrounds": {
      "menu": "/images/backgrounds/menu.webp",
      "setup": "/images/backgrounds/setup.webp?v=mvzvhr9k",
      "lobby": "/images/backgrounds/lobby.webp?v=mvzvmxoj",
      "town": "/images/backgrounds/town.webp?v=mvzvyu13",
      "dungeon": "/images/backgrounds/dungeon.webp",
      "tavern": "/images/backgrounds/tavern.png",
      "blacksmith": "/images/backgrounds/blacksmith.webp?v=mw8l5138",
      "merchant": "/images/backgrounds/merchant.png",
      "temple": "/images/backgrounds/temple.png"
    },
    "combat": {
      "enemy": "/images/backgrounds/combat_enemy.webp?v=mw8jkvj9",
      "party": "/images/backgrounds/combat_party.webp?v=mw4g20ag"
    },
    "ui": {
      "panel": "/images/ui/panel.webp?v=mw2vvvsp",
      "profileBg": "/images/ui/profilebg.webp?v=mw2vz51q",
      "townPanelBg": "/images/ui/townpanelbg.webp?v=mw2wkt47",
      "townDayBg": "/images/ui/towndaybg.webp?v=mw2w19vj",
      "dungeonBg": "/images/ui/dungeonbg.webp?v=mw8kya8u",
      "merchantBg": "/images/ui/merchantbg.webp?v=mw8kxnov",
      "merchantChests": "/images/ui/merchantchests.webp?v=mw8nd41p",
      "merchantPotions": "/images/ui/merchantpotions.webp?v=mw8nd61p",
      "merchantMaterials": "/images/ui/merchantmaterials.webp?v=mw8ndgon",
      "templeBg": "/images/ui/templebg.webp?v=mw8kxima",
      "templeAscend": "/images/ui/templeascend.webp?v=mw8ncq2t",
      "templeHearts": "/images/ui/templehearts.webp?v=mw8ncs63",
      "templeRebirth": "/images/ui/templerebirth.webp?v=mw8nctu4",
      "templeRevive": "/images/ui/templerevive.webp?v=mw8ncw2l",
      "blacksmithButton": "/images/ui/blacksmithbutton.webp?v=mw2zkywk",
      "blacksmithNpc": "/images/ui/blacksmithnpc.webp?v=mw8ksp7x",
      "blacksmithBg": "/images/ui/blacksmithbg.webp?v=mw8ksso4",
      "tavernButton": "/images/ui/tavernbutton.webp?v=mw2zltjf",
      "tavernBg": "/images/ui/tavernbg.webp?v=mw8m9gdl",
      "tavernPortrait": "/images/ui/tavernportrait.webp?v=mw8mj4yk",
      "tavernSleep": "/images/ui/tavernsleep.webp?v=mw8mf8ve",
      "tavernRations": "/images/ui/tavernrations.webp?v=mw8me758",
      "tavernCoin": "/images/ui/taverncoin.webp?v=mw8me56r",
      "tavernCards": "/images/ui/taverncards.webp?v=mw8me3a1",
      "tavernLeave": "/images/ui/tavernleave.webp?v=mw8mdchf",
      "merchantButton": "/images/ui/merchantbutton.webp?v=mw2zmzyf",
      "templeButton": "/images/ui/templebutton.webp?v=mw2zmdf3",
      "dungeonButton": "/images/ui/dungeonbutton.webp?v=mw2wszbb",
      "travelButton": "/images/ui/travelbutton.webp?v=mw2zmguu",
      "searchButton": "/images/ui/searchbutton.webp?v=mw2zmnlw",
      "restButton": "",
      "sleepButton": "/images/ui/sleepbutton.webp?v=mw2zmrt1",
      "restNight": "",
      "actionCardOpacity": "",
      "bgPhotoOpacity": "",
      "bgPhotoTownOpacity": "",
      "panelTint": "#07080a",
      "panelOpacity": "0.9",
      "panelRadius": "4"
    }
  },
  "town": {
    "search": {
      "stamina": 1,
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
      "stamina": 1
    },
    "merchant": {
      "stamina": 1
    },
    "tavern": {
      "stamina": 1,
      "bets": [
        25,
        100,
        500,
        700
      ],
      "provisions": {
        "foodPrice": 10,
        "foodAmount": 2
      },
      "sleep": {
        "price": 15
      }
    },
    "rest": {
      "stamina": 4,
      "maxPerDay": 3
    },
    "temple": {
      "stamina": 1
    },
    "sleepOutside": {
      "lifeLossChance": 0.04
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
    "origin": {
      "item": "origin_stone",
      "price": 250,
      "startQty": 5
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
  "effects": {
    "blood_scythe": {
      "animation": "hit",
      "color": "#dc2626",
      "particles": "slash",
      "sound": [
        "bloodbolt",
        "cursedwhisper",
        "darkascension"
      ]
    },
    "blood_splatter": {
      "animation": "hit",
      "color": "#b91c1c",
      "particles": "burst",
      "sound": [
        "bloodbolt",
        "cursedwhisper",
        "darkascension"
      ]
    },
    "blood_eruption": {
      "animation": "hit",
      "color": "#e11d48",
      "particles": "burst",
      "sound": [
        "bloodbolt",
        "cursedwhisper",
        "darkascension"
      ]
    },
    "blood_vortex": {
      "animation": "hit-shadow",
      "color": "#ef4444",
      "particles": "vortex",
      "sound": [
        "bloodbolt",
        "cursedwhisper",
        "darkascension"
      ]
    },
    "blood_needles": {
      "animation": "hit",
      "color": "#f43f5e",
      "particles": "slash",
      "sound": [
        "bloodbolt",
        "cursedwhisper",
        "darkascension"
      ]
    },
    "blood_drain": {
      "animation": "hit-shadow",
      "color": "#be123c",
      "particles": "slash",
      "sound": [
        "bloodbolt",
        "cursedwhisper",
        "darkascension"
      ]
    },
    "blood_scythe_cross": {
      "animation": "hit-crit",
      "color": "#991b1b",
      "particles": "slash",
      "sound": [
        "bloodbolt",
        "cursedwhisper",
        "darkascension"
      ]
    },
    "blood_curse_mist": {
      "animation": "hit",
      "color": "#881337",
      "particles": "burst",
      "sound": [
        "bloodbolt",
        "cursedwhisper",
        "darkascension"
      ]
    },
    "blood_cleave": {
      "animation": "hit",
      "color": "#b91c1c",
      "particles": "slash",
      "sound": [
        "bloodbolt",
        "cursedwhisper",
        "darkascension"
      ]
    },
    "blood_nova": {
      "animation": "hit-crit",
      "color": "#dc2626",
      "particles": "burst",
      "sound": [
        "bloodbolt",
        "cursedwhisper",
        "darkascension"
      ]
    },
    "shadow_scythe_reap": {
      "animation": "hit-shadow",
      "color": "#9333ea",
      "particles": "slash",
      "sound": [
        "bloodbolt",
        "cursedwhisper",
        "darkascension"
      ]
    },
    "void_rift_tear": {
      "animation": "hit-shadow",
      "color": "#7e22ce",
      "particles": "burst",
      "sound": [
        "bloodbolt",
        "cursedwhisper",
        "darkascension"
      ]
    },
    "shadow_spikes_rise": {
      "animation": "hit",
      "color": "#581c87",
      "particles": "burst",
      "sound": [
        "bloodbolt",
        "cursedwhisper",
        "darkascension"
      ]
    },
    "dark_matter_orb": {
      "animation": "hit-arcane",
      "color": "#a855f7",
      "particles": "orb",
      "sound": [
        "bloodbolt",
        "cursedwhisper",
        "darkascension"
      ]
    },
    "soul_harvest_wisps": {
      "animation": "hit",
      "color": "#c084fc",
      "particles": "burst",
      "sound": [
        "bloodbolt",
        "cursedwhisper",
        "darkascension"
      ]
    },
    "dark_cross_execution": {
      "animation": "hit-crit",
      "color": "#6b21a8",
      "particles": "slash",
      "sound": [
        "bloodbolt",
        "cursedwhisper",
        "darkascension"
      ]
    },
    "eclipse_wave": {
      "animation": "hit-shadow",
      "color": "#4c1d95",
      "particles": "burst",
      "sound": [
        "bloodbolt",
        "cursedwhisper",
        "darkascension"
      ]
    },
    "shadow_tendrils": {
      "animation": "hit-shadow",
      "color": "#3b0764",
      "particles": "vortex",
      "sound": [
        "bloodbolt",
        "cursedwhisper",
        "darkascension"
      ]
    },
    "phantom_dagger_barrage": {
      "animation": "hit",
      "color": "#7c3aed",
      "particles": "slash",
      "sound": [
        "bloodbolt",
        "cursedwhisper",
        "darkascension"
      ]
    },
    "black_hole_implosion": {
      "animation": "hit",
      "color": "#2e1065",
      "particles": "burst",
      "sound": [
        "bloodbolt",
        "cursedwhisper",
        "darkascension"
      ]
    },
    "fire_meteor_crash": {
      "animation": "hit-crit",
      "color": "#ea580c",
      "particles": "burst",
      "sound": [
        "dragonfire",
        "meteorfall"
      ]
    },
    "flame_pillar_inferno": {
      "animation": "hit",
      "color": "#f97316",
      "particles": "burst",
      "sound": [
        "dragonfire",
        "meteorfall"
      ]
    },
    "fire_slash_arc": {
      "animation": "hit",
      "color": "#ff5722",
      "particles": "slash",
      "sound": [
        "dragonfire",
        "meteorfall"
      ]
    },
    "dragon_breath_cone": {
      "animation": "hit",
      "color": "#dc2626",
      "particles": "burst",
      "sound": [
        "dragonfire",
        "meteorfall"
      ]
    },
    "magma_eruption_burst": {
      "animation": "hit",
      "color": "#c2410c",
      "particles": "burst",
      "sound": [
        "dragonfire",
        "meteorfall"
      ]
    },
    "phoenix_wings_sweep": {
      "animation": "hit",
      "color": "#f97316",
      "particles": "burst",
      "sound": [
        "dragonfire",
        "meteorfall"
      ]
    },
    "ember_whirlwind": {
      "animation": "hit-shadow",
      "color": "#fb923c",
      "particles": "vortex",
      "sound": [
        "dragonfire",
        "meteorfall"
      ]
    },
    "scorch_wave_ring": {
      "animation": "hit",
      "color": "#ef4444",
      "particles": "burst",
      "sound": [
        "dragonfire",
        "meteorfall"
      ]
    },
    "fireball_streak": {
      "animation": "hit-arcane",
      "color": "#ea580c",
      "particles": "slash",
      "sound": [
        "dragonfire",
        "meteorfall"
      ]
    },
    "supernova_blast": {
      "animation": "hit-crit",
      "color": "#f59e0b",
      "particles": "burst",
      "sound": [
        "dragonfire",
        "meteorfall"
      ]
    },
    "earth_fissure_rupture": {
      "animation": "hit",
      "color": "#854d0e",
      "particles": "burst",
      "sound": [
        "irongate",
        "axeskill"
      ]
    },
    "boulder_crush_drop": {
      "animation": "hit",
      "color": "#713f12",
      "particles": "burst",
      "sound": [
        "irongate",
        "axeskill"
      ]
    },
    "seismic_shockwave_ring": {
      "animation": "hit",
      "color": "#a16207",
      "particles": "burst",
      "sound": [
        "irongate",
        "axeskill"
      ]
    },
    "sandstorm_vortex_spin": {
      "animation": "hit-shadow",
      "color": "#d97706",
      "particles": "vortex",
      "sound": [
        "irongate",
        "axeskill"
      ]
    },
    "stone_spikes_impale": {
      "animation": "hit",
      "color": "#65a30d",
      "particles": "burst",
      "sound": [
        "irongate",
        "axeskill"
      ]
    },
    "rock_avalanche_barrage": {
      "animation": "hit",
      "color": "#78716c",
      "particles": "slash",
      "sound": [
        "irongate",
        "axeskill"
      ]
    },
    "earth_hammer_quake": {
      "animation": "hit-crit",
      "color": "#b45309",
      "particles": "slash",
      "sound": [
        "irongate",
        "axeskill"
      ]
    },
    "crystal_earth_shards": {
      "animation": "hit",
      "color": "#65a30d",
      "particles": "burst",
      "sound": [
        "battleaxe"
      ]
    },
    "mud_splash_entangle": {
      "animation": "hit",
      "color": "#451a03",
      "particles": "burst",
      "sound": [
        "irongate",
        "axeskill"
      ]
    },
    "granite_armor_shatter": {
      "animation": "hit",
      "color": "#57534e",
      "particles": "burst",
      "sound": [
        "irongate",
        "axeskill"
      ]
    },
    "frost_crystal_spear": {
      "animation": "hit-arcane",
      "color": "#38bdf8",
      "particles": "slash",
      "sound": [
        "waterorb",
        "waterburst"
      ]
    },
    "frost_nova_freeze": {
      "animation": "hit",
      "color": "#0284c7",
      "particles": "burst",
      "sound": [
        "waterorb",
        "waterburst"
      ]
    },
    "ice_sword_uppercut": {
      "animation": "hit",
      "color": "#7dd3fc",
      "particles": "slash",
      "sound": [
        "waterorb",
        "waterburst"
      ]
    },
    "blizzard_cyclone_vortex": {
      "animation": "hit-shadow",
      "color": "#0ea5e9",
      "particles": "vortex",
      "sound": [
        "waterorb",
        "waterburst"
      ]
    },
    "ice_spikes_ground": {
      "animation": "hit",
      "color": "#38bdf8",
      "particles": "burst",
      "sound": [
        "waterorb",
        "waterburst"
      ]
    },
    "tidal_wave_water": {
      "animation": "hit",
      "color": "#2563eb",
      "particles": "burst",
      "sound": [
        "waterorb",
        "waterburst"
      ]
    },
    "frozen_orb_shatter": {
      "animation": "hit-arcane",
      "color": "#06b6d4",
      "particles": "burst",
      "sound": [
        "waterorb",
        "waterburst"
      ]
    },
    "icicle_rain_barrage": {
      "animation": "hit",
      "color": "#0284c7",
      "particles": "burst",
      "sound": [
        "waterorb",
        "waterburst"
      ]
    },
    "water_whip_lash": {
      "animation": "hit",
      "color": "#3b82f6",
      "particles": "slash",
      "sound": [
        "waterorb",
        "waterburst"
      ]
    },
    "frost_prison_dome": {
      "animation": "hit",
      "color": "#0369a1",
      "particles": "burst",
      "sound": [
        "waterorb",
        "waterburst"
      ]
    },
    "lightning_strike_heavy": {
      "animation": "hit-arcane",
      "color": "#facc15",
      "particles": "slash",
      "sound": [
        "lightningcast",
        "chargeshot"
      ]
    },
    "chain_lightning_arc": {
      "animation": "hit-arcane",
      "color": "#eab308",
      "particles": "slash",
      "sound": [
        "lightningcast",
        "chargeshot"
      ]
    },
    "ball_lightning_plasma": {
      "animation": "hit-arcane",
      "color": "#ca8a04",
      "particles": "burst",
      "sound": [
        "lightningcast",
        "chargeshot"
      ]
    },
    "lightning_slash_blade": {
      "animation": "hit",
      "color": "#fde047",
      "particles": "slash",
      "sound": [
        "lightningcast",
        "chargeshot"
      ]
    },
    "electric_field_discharge": {
      "animation": "hit",
      "color": "#eab308",
      "particles": "burst",
      "sound": [
        "lightningcast",
        "chargeshot"
      ]
    },
    "storm_tornado_vortex": {
      "animation": "hit-shadow",
      "color": "#fbbf24",
      "particles": "vortex",
      "sound": [
        "lightningcast",
        "chargeshot"
      ]
    },
    "emp_shockwave_ring": {
      "animation": "hit",
      "color": "#facc15",
      "particles": "burst",
      "sound": [
        "lightningcast",
        "chargeshot"
      ]
    },
    "triple_thunder_judgement": {
      "animation": "hit-arcane",
      "color": "#fef08a",
      "particles": "burst",
      "sound": [
        "lightningcast",
        "chargeshot"
      ]
    },
    "electric_sparks_shower": {
      "animation": "hit",
      "color": "#fde047",
      "particles": "burst",
      "sound": [
        "lightningcast",
        "chargeshot"
      ]
    },
    "storm_spear_throw": {
      "animation": "hit-arcane",
      "color": "#eab308",
      "particles": "slash",
      "sound": [
        "lightningcast",
        "chargeshot"
      ]
    },
    "holy_pillar_smite": {
      "animation": "hit",
      "color": "#facc15",
      "particles": "burst",
      "sound": [
        "divinejudgement",
        "holyhammer"
      ]
    },
    "radiance_sword_slash": {
      "animation": "hit",
      "color": "#fef08a",
      "particles": "slash",
      "sound": [
        "divinejudgement",
        "holyhammer"
      ]
    },
    "holy_cross_burst": {
      "animation": "hit",
      "color": "#fde047",
      "particles": "burst",
      "sound": [
        "divinejudgement",
        "holyhammer"
      ]
    },
    "heal_aura_fountain": {
      "animation": "heal",
      "color": "#4ade80",
      "particles": "glow",
      "sound": [
        "divinejudgement",
        "holyhammer"
      ]
    },
    "radiant_halo_shield": {
      "animation": "defend",
      "color": "#f59e0b",
      "particles": "ring",
      "sound": [
        "divinejudgement",
        "holyhammer"
      ]
    },
    "angel_feathers_scatter": {
      "animation": "hit",
      "color": "#ffffff",
      "particles": "burst",
      "sound": [
        "divinejudgement",
        "holyhammer"
      ]
    },
    "judgement_solar_flare": {
      "animation": "hit",
      "color": "#facc15",
      "particles": "burst",
      "sound": [
        "divinejudgement",
        "holyhammer"
      ]
    },
    "holy_lance_projectile": {
      "animation": "hit-arcane",
      "color": "#fef08a",
      "particles": "slash",
      "sound": [
        "divinejudgement",
        "holyhammer"
      ]
    },
    "divine_retribution_ring": {
      "animation": "hit",
      "color": "#eab308",
      "particles": "burst",
      "sound": [
        "divinejudgement",
        "holyhammer"
      ]
    },
    "dawn_star_explosion": {
      "animation": "hit",
      "color": "#ffffff",
      "particles": "burst",
      "sound": [
        "divinejudgement",
        "holyhammer"
      ]
    },
    "rising_katana_slash": {
      "animation": "hit",
      "color": "#ffffff",
      "particles": "slash",
      "sound": [
        "slashfast1",
        "sword1"
      ]
    },
    "cross_cut_x_slash": {
      "animation": "hit-crit",
      "color": "#f87171",
      "particles": "slash",
      "sound": [
        "sword2",
        "slashfast2"
      ]
    },
    "heavy_hammer_slam": {
      "animation": "hit-crit",
      "color": "#fb923c",
      "particles": "slash",
      "sound": [
        "holyhammer",
        "heavyswordhit"
      ]
    },
    "whirlwind_blade_spin": {
      "animation": "hit-shadow",
      "color": "#cbd5e1",
      "particles": "vortex",
      "sound": [
        "greatswordspin",
        "slashfast4"
      ]
    },
    "piercing_rapier_thrust": {
      "animation": "hit",
      "color": "#ffffff",
      "particles": "slash",
      "sound": [
        "sword3",
        "bladehit"
      ]
    },
    "axe_cleave_horizontal": {
      "animation": "hit",
      "color": "#ea580c",
      "particles": "slash",
      "sound": [
        "axeswing1",
        "axeswing2",
        "axeskill"
      ]
    },
    "sonic_air_blade": {
      "animation": "hit-arcane",
      "color": "#94a3b8",
      "particles": "slash",
      "sound": [
        "greatswordslash",
        "slashfast3"
      ]
    },
    "shield_bash_shock": {
      "animation": "hit",
      "color": "#64748b",
      "particles": "burst",
      "sound": [
        "shieldpulse",
        "bladesclash1"
      ]
    },
    "triple_dagger_slash": {
      "animation": "hit",
      "color": "#e2e8f0",
      "particles": "slash",
      "sound": [
        "daggerthrow",
        "slashfast1"
      ]
    },
    "guillotine_fall": {
      "animation": "hit-crit",
      "color": "#dc2626",
      "particles": "slash",
      "sound": [
        "twohanded",
        "heavyswordhit"
      ]
    },
    "slash": {
      "animation": "hit",
      "color": "#ff7a5c",
      "particles": "slash",
      "sound": [
        "slashfast1",
        "slashfast2",
        "slashfast3",
        "slashfast4",
        "sword1",
        "sword2",
        "sword3"
      ]
    },
    "heavy": {
      "animation": "hit-crit",
      "color": "#ffb347",
      "particles": "shatter",
      "sound": [
        "heavyslash1",
        "heavyslash2",
        "greatswordslash",
        "twohanded",
        "heavyswordhit"
      ]
    },
    "axe": {
      "animation": "hit",
      "color": "#ff9b4a",
      "particles": "shatter",
      "sound": [
        "axeswing1",
        "axeswing2",
        "axeskill"
      ]
    },
    "crush": {
      "animation": "hit-crit",
      "color": "#ffd23e",
      "particles": "burst",
      "sound": [
        "hitgeneric",
        "axehit"
      ]
    },
    "arcane": {
      "animation": "hit-arcane",
      "color": "#c9a0ff",
      "particles": "orb",
      "sound": [
        "arcanebolt",
        "lightningcast"
      ]
    },
    "fire": {
      "animation": "hit-arcane",
      "color": "#ff7a3c",
      "particles": "fire",
      "sound": [
        "dragonfire",
        "meteorfall"
      ]
    },
    "frost": {
      "animation": "hit-arcane",
      "color": "#9fd4ff",
      "particles": "frost",
      "sound": [
        "waterorb",
        "waterburst"
      ]
    },
    "holy": {
      "animation": "hit-holy",
      "color": "#ffe9a8",
      "particles": "rays",
      "sound": [
        "divinejudgement",
        "holyhammer"
      ]
    },
    "shadow": {
      "animation": "hit-shadow",
      "color": "#b98cff",
      "particles": "pulse",
      "sound": [
        "bloodbolt",
        "cursedwhisper",
        "darkascension"
      ]
    },
    "heal": {
      "animation": "heal",
      "color": "#8fe08a",
      "particles": "glow",
      "sound": [
        "healingmagic"
      ]
    },
    "defend": {
      "animation": "defend",
      "color": "#8fc9ff",
      "particles": "ring",
      "sound": [
        "shieldpulse",
        "bladesclash1",
        "bladesclash2"
      ]
    },
    "monster": {
      "animation": "hit",
      "color": "#ff7a5c",
      "particles": "slash",
      "sound": [
        "monsterroar",
        "terrifyingroar",
        "bonesrattle",
        "undeadmoan",
        "slimesquelch",
        "wolfsnap",
        "vampirehiss",
        "dragonroar"
      ]
    },
    "crit": {
      "animation": "hit-crit",
      "color": "#ffd23e",
      "particles": "burst",
      "sound": [
        "heavyswordhit",
        "holyhammer"
      ]
    },
    "buff": {
      "animation": "defend",
      "color": "#8fe08a",
      "particles": "glow",
      "sound": [
        "shieldpulse"
      ]
    },
    "dot": {
      "animation": "hit",
      "color": "#b98cff",
      "particles": "pulse",
      "sound": [
        "bloodbolt",
        "vineslash"
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
        "color": "#ff2323"
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
      "t1": {
        "common": 35,
        "uncommon": 35,
        "rare": 22,
        "epic": 10.4,
        "legendary": 2.25,
        "mythic": 0.48,
        "ancient_relic": 0.03
      },
      "t2": {
        "common": 25,
        "uncommon": 38.5,
        "rare": 30,
        "epic": 18.2,
        "legendary": 4.5,
        "mythic": 1.28,
        "ancient_relic": 0.08
      },
      "t3": {
        "common": 15,
        "uncommon": 35,
        "rare": 38,
        "epic": 28.6,
        "legendary": 9,
        "mythic": 2.56,
        "ancient_relic": 0.19
      },
      "t4": {
        "common": 7.5,
        "uncommon": 28,
        "rare": 45,
        "epic": 41.6,
        "legendary": 15,
        "mythic": 4.8,
        "ancient_relic": 0.4
      },
      "t5": {
        "common": 4,
        "uncommon": 21,
        "rare": 48,
        "epic": 54.6,
        "legendary": 22.5,
        "mythic": 8,
        "ancient_relic": 0.8
      },
      "t6": {
        "common": 2.5,
        "uncommon": 15.4,
        "rare": 50,
        "epic": 71.5,
        "legendary": 33,
        "mythic": 12.8,
        "ancient_relic": 1.6
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
  "bosses": [
    {
      "id": "boss_ember_king",
      "label": "Ember King",
      "name": "Ember King",
      "image": "/images/bosses/ember_king.png",
      "hp": 9000,
      "attack": 460,
      "speed": 6,
      "element": "fire",
      "rarity": "mythic",
      "weaponId": "boss_weapon_ember",
      "chestId": "boss_chest_ember",
      "unlockAfter": null,
      "resistance": 20,
      "phases": 3,
      "phaseSkills": {
        "1": [
          "boss_ember_skill1",
          "boss_ember_skill2"
        ],
        "2": [
          "boss_ember_skill3",
          "boss_ember_skill4",
          "boss_ember_skill5"
        ],
        "3": [
          "boss_ember_skill2",
          "boss_ember_skill5",
          "boss_ember_skill6"
        ]
      },
      "tags": [
        "elemental"
      ]
    },
    {
      "id": "boss_frost_titan",
      "label": "Glacier Doomlord",
      "name": "Glacier Doomlord",
      "image": "/images/bosses/frost_titan.png",
      "hp": 16000,
      "attack": 640,
      "speed": 5,
      "element": "frost",
      "rarity": "mythic",
      "weaponId": "boss_weapon_frost",
      "chestId": "boss_chest_frost",
      "unlockAfter": "boss_ember_king",
      "resistance": 25,
      "phases": 3,
      "phaseSkills": {
        "1": [
          "boss_frost_skill1",
          "boss_frost_skill2"
        ],
        "2": [
          "boss_frost_skill3",
          "boss_frost_skill4",
          "boss_frost_skill5"
        ],
        "3": [
          "boss_frost_skill2",
          "boss_frost_skill5",
          "boss_frost_skill6"
        ]
      },
      "tags": [
        "elemental"
      ]
    },
    {
      "id": "boss_void_herald",
      "label": "Eternal Abyss Herald",
      "name": "Eternal Abyss Herald",
      "image": "/images/bosses/void_herald.png",
      "hp": 26000,
      "attack": 820,
      "speed": 7,
      "element": "shadow",
      "rarity": "mythic",
      "weaponId": "boss_weapon_void",
      "chestId": "boss_chest_void",
      "unlockAfter": "boss_frost_titan",
      "resistance": 30,
      "phases": 3,
      "phaseSkills": {
        "1": [
          "boss_void_skill1",
          "boss_void_skill2"
        ],
        "2": [
          "boss_void_skill3",
          "boss_void_skill4",
          "boss_void_skill5"
        ],
        "3": [
          "boss_void_skill2",
          "boss_void_skill5",
          "boss_void_skill6"
        ]
      },
      "tags": [
        "demon"
      ]
    },
    {
      "id": "boss_storm_colossus",
      "label": "Thunder Tyrant",
      "name": "Thunder Tyrant",
      "image": "/images/bosses/storm_colossus.png",
      "hp": 40000,
      "attack": 1000,
      "speed": 6,
      "element": "arcane",
      "rarity": "mythic",
      "weaponId": "boss_weapon_storm",
      "chestId": "boss_chest_storm",
      "unlockAfter": "boss_void_herald",
      "resistance": 35,
      "phases": 3,
      "phaseSkills": {
        "1": [
          "boss_storm_skill1",
          "boss_storm_skill2"
        ],
        "2": [
          "boss_storm_skill3",
          "boss_storm_skill4",
          "boss_storm_skill5"
        ],
        "3": [
          "boss_storm_skill2",
          "boss_storm_skill5",
          "boss_storm_skill6"
        ]
      },
      "tags": [
        "elemental"
      ]
    },
    {
      "id": "boss_world_eater",
      "label": "Oblivion Devourer",
      "name": "Oblivion Devourer",
      "image": "/images/bosses/world_eater.png",
      "hp": 55000,
      "attack": 1200,
      "speed": 5,
      "element": "physical",
      "rarity": "mythic",
      "weaponId": "boss_weapon_world",
      "chestId": "boss_chest_world",
      "unlockAfter": "boss_storm_colossus",
      "resistance": 45,
      "phases": 3,
      "phaseSkills": {
        "1": [
          "boss_world_skill1",
          "boss_world_skill2"
        ],
        "2": [
          "boss_world_skill3",
          "boss_world_skill4",
          "boss_world_skill5"
        ],
        "3": [
          "boss_world_skill2",
          "boss_world_skill5",
          "boss_world_skill6"
        ]
      },
      "tags": [
        "dragon"
      ]
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
        "attack": 4
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
        "attack": 7
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
        "attack": 6
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
        "attack": 3
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
        "attack": 3
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
        "attack": 3
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
        "attack": 4
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
        "attack": 5
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
        "attack": 4
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
        "attack": 4
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
        "attack": 6
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
        "attack": 5
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
        "attack": 3
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
      "egg": "egg_blue",
      "buffKind": "magicBoost"
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
      "egg": "egg_blue",
      "buffKind": "magicBoost"
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
      "egg": "egg_blue",
      "buffKind": "magicBoost"
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
      "egg": "egg_blue",
      "buffKind": "magicBoost"
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
      "egg": "egg_blue",
      "buffKind": "magicBoost"
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
      "egg": "egg_blue",
      "buffKind": "magicBoost"
    },
    {
      "id": "pet_stone_pup",
      "name": "Stone Pup",
      "image": "/images/pets/pet_stone_pup.png",
      "element": "earth",
      "stats": {
        "attack": 5,
        "magicPower": 7,
        "resistance": 3
      },
      "description": "Stone Pup from Brown Egg",
      "egg": "egg_brown",
      "buffKind": "attack"
    },
    {
      "id": "pet_rockling",
      "name": "Rockling",
      "image": "/images/pets/pet_rockling.png",
      "element": "earth",
      "stats": {
        "attack": 4,
        "magicPower": 6,
        "resistance": 3
      },
      "description": "Rockling from Brown Egg",
      "egg": "egg_brown",
      "buffKind": "attack"
    },
    {
      "id": "pet_boulder_cub",
      "name": "Boulder Cub",
      "image": "/images/pets/pet_boulder_cub.png",
      "element": "earth",
      "stats": {
        "attack": 7,
        "magicPower": 6,
        "resistance": 3
      },
      "description": "Boulder Cub from Brown Egg",
      "egg": "egg_brown",
      "buffKind": "attack"
    },
    {
      "id": "pet_crystal_sprite",
      "name": "Crystal Sprite",
      "image": "/images/pets/pet_crystal_sprite.png",
      "element": "earth",
      "stats": {
        "attack": 5,
        "magicPower": 4,
        "resistance": 3
      },
      "description": "Crystal Sprite from Brown Egg",
      "egg": "egg_brown",
      "buffKind": "attack"
    },
    {
      "id": "pet_golem_whelp",
      "name": "Golem Whelp",
      "image": "/images/pets/pet_golem_whelp.png",
      "element": "earth",
      "stats": {
        "attack": 6,
        "magicPower": 6,
        "resistance": 3
      },
      "description": "Golem Whelp from Brown Egg",
      "egg": "egg_brown",
      "buffKind": "attack"
    },
    {
      "id": "pet_granite_pup",
      "name": "Granite Pup",
      "image": "/images/pets/pet_granite_pup.png",
      "element": "earth",
      "stats": {
        "attack": 7,
        "magicPower": 3,
        "resistance": 3
      },
      "description": "Granite Pup from Brown Egg",
      "egg": "egg_brown",
      "buffKind": "attack"
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
      "egg": "egg_yellow",
      "buffKind": "magicBoost"
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
      "egg": "egg_yellow",
      "buffKind": "magicBoost"
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
      "egg": "egg_yellow",
      "buffKind": "magicBoost"
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
      "egg": "egg_yellow",
      "buffKind": "magicBoost"
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
      "egg": "egg_yellow",
      "buffKind": "magicBoost"
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
      "egg": "egg_yellow",
      "buffKind": "magicBoost"
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
      "egg": "egg_purple",
      "petSkills": [
        {
          "kind": "weaken",
          "value": 0.55,
          "interval": 2,
          "element": "dark"
        }
      ]
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
      "egg": "egg_purple",
      "petSkills": [
        {
          "kind": "weaken",
          "value": 0.55,
          "interval": 2,
          "element": "dark"
        }
      ]
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
      "egg": "egg_purple",
      "petSkills": [
        {
          "kind": "weaken",
          "value": 0.55,
          "interval": 2,
          "element": "dark"
        }
      ]
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
      "egg": "egg_purple",
      "petSkills": [
        {
          "kind": "weaken",
          "value": 0.55,
          "interval": 2,
          "element": "dark"
        }
      ]
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
      "egg": "egg_purple",
      "petSkills": [
        {
          "kind": "weaken",
          "value": 0.55,
          "interval": 2,
          "element": "dark"
        }
      ]
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
      "egg": "egg_purple",
      "petSkills": [
        {
          "kind": "weaken",
          "value": 0.55,
          "interval": 2,
          "element": "dark"
        }
      ]
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
      "egg": "egg_cyan",
      "petSkills": [
        {
          "kind": "heal",
          "value": 0.55,
          "interval": 2,
          "element": "water"
        }
      ]
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
      "egg": "egg_cyan",
      "petSkills": [
        {
          "kind": "heal",
          "value": 0.55,
          "interval": 2,
          "element": "water"
        }
      ]
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
      "egg": "egg_cyan",
      "petSkills": [
        {
          "kind": "heal",
          "value": 0.55,
          "interval": 2,
          "element": "water"
        }
      ]
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
      "egg": "egg_cyan",
      "petSkills": [
        {
          "kind": "heal",
          "value": 0.55,
          "interval": 2,
          "element": "water"
        }
      ]
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
      "egg": "egg_cyan",
      "petSkills": [
        {
          "kind": "heal",
          "value": 0.55,
          "interval": 2,
          "element": "water"
        }
      ]
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
      "egg": "egg_cyan",
      "petSkills": [
        {
          "kind": "heal",
          "value": 0.55,
          "interval": 2,
          "element": "water"
        }
      ]
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
      "egg": "egg_dark",
      "petSkills": [
        {
          "kind": "weaken",
          "value": 0.55,
          "interval": 2,
          "element": "dark"
        }
      ]
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
      "egg": "egg_dark",
      "petSkills": [
        {
          "kind": "weaken",
          "value": 0.55,
          "interval": 2,
          "element": "dark"
        }
      ]
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
      "egg": "egg_dark",
      "petSkills": [
        {
          "kind": "weaken",
          "value": 0.55,
          "interval": 2,
          "element": "dark"
        }
      ]
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
      "egg": "egg_dark",
      "petSkills": [
        {
          "kind": "weaken",
          "value": 0.55,
          "interval": 2,
          "element": "dark"
        }
      ]
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
      "egg": "egg_dark",
      "petSkills": [
        {
          "kind": "weaken",
          "value": 0.55,
          "interval": 2,
          "element": "dark"
        }
      ]
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
      "egg": "egg_dark",
      "petSkills": [
        {
          "kind": "weaken",
          "value": 0.55,
          "interval": 2,
          "element": "dark"
        }
      ]
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
      "egg": "egg_orange",
      "petSkills": [
        {
          "kind": "attack",
          "value": 0.65,
          "interval": 2,
          "element": "fire"
        },
        {
          "kind": "shield",
          "value": 0.4,
          "interval": 3,
          "element": "fire"
        }
      ]
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
      "egg": "egg_orange",
      "petSkills": [
        {
          "kind": "attack",
          "value": 0.65,
          "interval": 2,
          "element": "fire"
        },
        {
          "kind": "shield",
          "value": 0.4,
          "interval": 3,
          "element": "fire"
        }
      ]
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
      "egg": "egg_orange",
      "petSkills": [
        {
          "kind": "attack",
          "value": 0.65,
          "interval": 2,
          "element": "fire"
        },
        {
          "kind": "shield",
          "value": 0.4,
          "interval": 3,
          "element": "fire"
        }
      ]
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
      "egg": "egg_orange",
      "petSkills": [
        {
          "kind": "attack",
          "value": 0.65,
          "interval": 2,
          "element": "fire"
        },
        {
          "kind": "shield",
          "value": 0.4,
          "interval": 3,
          "element": "fire"
        }
      ]
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
      "egg": "egg_orange",
      "petSkills": [
        {
          "kind": "attack",
          "value": 0.65,
          "interval": 2,
          "element": "fire"
        },
        {
          "kind": "shield",
          "value": 0.4,
          "interval": 3,
          "element": "fire"
        }
      ]
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
      "egg": "egg_orange",
      "petSkills": [
        {
          "kind": "attack",
          "value": 0.65,
          "interval": 2,
          "element": "fire"
        },
        {
          "kind": "shield",
          "value": 0.4,
          "interval": 3,
          "element": "fire"
        }
      ]
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
      "egg": "egg_gold",
      "petSkills": [
        {
          "kind": "attack",
          "value": 0.65,
          "interval": 2,
          "element": "physical"
        },
        {
          "kind": "shield",
          "value": 0.4,
          "interval": 3,
          "element": "physical"
        }
      ]
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
      "egg": "egg_gold",
      "petSkills": [
        {
          "kind": "attack",
          "value": 0.65,
          "interval": 2,
          "element": "physical"
        },
        {
          "kind": "shield",
          "value": 0.4,
          "interval": 3,
          "element": "physical"
        }
      ]
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
      "egg": "egg_gold",
      "petSkills": [
        {
          "kind": "attack",
          "value": 0.65,
          "interval": 2,
          "element": "physical"
        },
        {
          "kind": "shield",
          "value": 0.4,
          "interval": 3,
          "element": "physical"
        }
      ]
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
      "egg": "egg_gold",
      "petSkills": [
        {
          "kind": "attack",
          "value": 0.65,
          "interval": 2,
          "element": "physical"
        },
        {
          "kind": "shield",
          "value": 0.4,
          "interval": 3,
          "element": "physical"
        }
      ]
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
      "egg": "egg_gold",
      "petSkills": [
        {
          "kind": "attack",
          "value": 0.65,
          "interval": 2,
          "element": "physical"
        },
        {
          "kind": "shield",
          "value": 0.4,
          "interval": 3,
          "element": "physical"
        }
      ]
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
      "egg": "egg_gold",
      "petSkills": [
        {
          "kind": "attack",
          "value": 0.65,
          "interval": 2,
          "element": "physical"
        },
        {
          "kind": "shield",
          "value": 0.4,
          "interval": 3,
          "element": "physical"
        }
      ]
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
  "statPaths": {
    "maxPoints": 40,
    "pointsPerLevel": 1,
    "startingPoints": 1,
    "rings": 10,
    "paths": [
      {
        "id": "fury",
        "name": "Fury",
        "tagline": "Attack speed and sharpened strikes",
        "color": "#ff8a4c",
        "glyph": "⚔",
        "stats": [
          "attackSpeed",
          "attack",
          "critChance",
          "critDamage"
        ]
      },
      {
        "id": "bulwark",
        "name": "Bulwark",
        "tagline": "Resistance, footing and life-drinking blows",
        "color": "#7fb2e8",
        "glyph": "🛡",
        "stats": [
          "resistance",
          "maxHp",
          "speed",
          "omnivamp"
        ]
      },
      {
        "id": "vitality",
        "name": "Vitality",
        "tagline": "Health, healing and long roads",
        "color": "#7fd18f",
        "glyph": "❤",
        "stats": [
          "maxHp",
          "healPower",
          "maxStamina",
          "omnivamp"
        ]
      },
      {
        "id": "arcana",
        "name": "Arcana",
        "tagline": "Spell power, deep mana and mending magic",
        "color": "#b48bea",
        "glyph": "✦",
        "stats": [
          "magicPower",
          "maxMana",
          "manaRegen",
          "healPower"
        ]
      }
    ],
    "nodeValues": {
      "attackSpeed": 1.2,
      "attack": 3.5,
      "critChance": 0.4,
      "critDamage": 1.5,
      "resistance": 2.2,
      "maxHp": 30,
      "speed": 0.12,
      "omnivamp": 0.08,
      "healPower": 1.2,
      "maxStamina": 0.15,
      "magicPower": 3.5,
      "maxMana": 2.5,
      "manaRegen": 0.12
    },
    "labels": {
      "attack": "Attack",
      "attackSpeed": "Attack Speed",
      "resistance": "Resistance",
      "magicPower": "Magic",
      "healPower": "Healing",
      "maxHp": "Max HP",
      "maxMana": "Max Mana",
      "manaRegen": "Mana Regen",
      "critChance": "Crit Chance",
      "critDamage": "Crit Damage",
      "speed": "Speed",
      "omnivamp": "Omnivamp",
      "maxStamina": "Max Stamina"
    },
    "units": {
      "attackSpeed": "%",
      "critChance": "%",
      "critDamage": "%",
      "omnivamp": "%"
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
        "label": "Archer Path",
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
          },
          {
            "id": "mg_crimson_rebirth",
            "skillId": "crimson_rebirth",
            "ownerClass": "gloomspawn",
            "cost": 4,
            "minLevel": 20
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
          },
          {
            "id": "a_exsanguinate",
            "skillId": "exsanguinate",
            "ownerClass": "bloodspawn",
            "cost": 4,
            "minLevel": 20
          },
          {
            "id": "bl_vampiric_strike",
            "skillId": "vampiric_strike",
            "ownerClass": "bloodspawn",
            "cost": 2,
            "minLevel": 20
          },
          {
            "id": "bl_bloodbath",
            "skillId": "bloodbath",
            "ownerClass": "bloodlord",
            "cost": 8,
            "minLevel": 40
          },
          {
            "id": "a_crimson_rebirth",
            "skillId": "crimson_rebirth",
            "ownerClass": "sanguine_lord",
            "cost": 8,
            "minLevel": 40
          }
        ]
      },
      "support": {
        "label": "Healer Path",
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
            "id": "t_seismic_slam",
            "skillId": "seismic_slam",
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
          },
          {
            "id": "t_colossal_crash",
            "skillId": "colossal_crash",
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
            "id": "tm_beast_bite",
            "skillId": "beast_bite",
            "owned": true,
            "cost": 0
          },
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
            "ownerClass": "anima_lorde",
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
    },
    {
      "id": "rend",
      "name": "Rend",
      "when": "dot",
      "ifElement": "physical",
      "mult": 1.3,
      "desc": "Steel tears bleeding foes, dealing +30% physical damage to poisoned targets."
    },
    {
      "id": "backstab",
      "name": "Backstab",
      "when": "expose",
      "ifElement": "shadow",
      "mult": 1.4,
      "desc": "Shadow finds the cracks, dealing +40% shadow damage to exposed targets."
    }
  ],
  "dailyOmens": [
    {
      "id": "bountiful_dawn",
      "name": "Bountiful Dawn",
      "icon": "🌾",
      "desc": "+15% gold and wood from dungeon victories.",
      "goldMult": 1.15,
      "xpMult": 1,
      "playerCritBonus": 0,
      "monsterHpMult": 1
    },
    {
      "id": "echoes",
      "name": "Echoes",
      "icon": "🔮",
      "desc": "+15% XP from dungeon victories.",
      "goldMult": 1,
      "xpMult": 1.15,
      "playerCritBonus": 0,
      "monsterHpMult": 1
    },
    {
      "id": "keen_edge",
      "name": "Keen Edge",
      "icon": "⚔️",
      "desc": "+5% crit chance for heroes in dungeons.",
      "goldMult": 1,
      "xpMult": 1,
      "playerCritBonus": 0.05,
      "monsterHpMult": 1
    },
    {
      "id": "iron_trial",
      "name": "Iron Trial",
      "icon": "🛡️",
      "desc": "Monsters +10% HP, but victories grant +10% XP.",
      "goldMult": 1,
      "xpMult": 1.1,
      "playerCritBonus": 0,
      "monsterHpMult": 1.1
    },
    {
      "id": "calm_day",
      "name": "Calm Day",
      "icon": "☀️",
      "desc": "A quiet day. No omens stir.",
      "goldMult": 1,
      "xpMult": 1,
      "playerCritBonus": 0,
      "monsterHpMult": 1
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
  "darkTrait": {
    "deal": 1.3,
    "taken": 1.5
  },
  "ui": {
    "classSelect": {
      "title": "Create Character",
      "subtitle": "Choose a class",
      "hint": "Attributes are forged when the quest begins.",
      "starterKitHead": "Starter kit",
      "defaultLore": "A wandering soul answering the call of Setra. Their legend is yet unwritten."
    }
  },
  "races": [
    {
      "id": "human",
      "color": "#c0b283",
      "name": "Human",
      "desc": "Adaptable and ambitious. +10% gold from victories.",
      "chance": 10,
      "stats": {
        "attackSpeed": 3
      },
      "passives": [
        {
          "kind": "victoryGold",
          "name": "Ambitious",
          "desc": "+10% gold from victories.",
          "mult": 0.1
        }
      ]
    },
    {
      "id": "elf",
      "color": "#6fa287",
      "name": "Elf",
      "desc": "Graceful and attuned. +12 mana, +1 speed.",
      "chance": 10,
      "stats": {
        "maxMana": 12,
        "speed": 1,
        "attackSpeed": 6
      },
      "passives": []
    },
    {
      "id": "dwarf",
      "color": "#b3814d",
      "name": "Dwarf",
      "desc": "Stout and enduring. +30 max HP, +6 resistance.",
      "chance": 10,
      "stats": {
        "maxHp": 30,
        "resistance": 6,
        "attackSpeed": -3
      },
      "passives": []
    },
    {
      "id": "orc",
      "color": "#7a8b4f",
      "name": "Orc",
      "desc": "Brutal and strong. +6 attack.",
      "chance": 10,
      "stats": {
        "attack": 6,
        "attackSpeed": 2
      },
      "passives": []
    },
    {
      "id": "beastkin",
      "color": "#c98f4e",
      "name": "Beastkin",
      "desc": "Wild instincts. +2 speed, +3 attack.",
      "chance": 8.75,
      "stats": {
        "speed": 2,
        "attack": 3,
        "attackSpeed": 7
      },
      "passives": []
    },
    {
      "id": "wyvernkin",
      "color": "#6fa8b8",
      "name": "Wyvernkin",
      "desc": "Sky hunters. 5% dodge chance.",
      "chance": 8.75,
      "stats": {
        "attackSpeed": 4
      },
      "passives": [
        {
          "kind": "dodge",
          "name": "Sky Dancer",
          "desc": "5% chance to dodge attacks.",
          "chance": 0.05
        }
      ]
    },
    {
      "id": "high_elf",
      "color": "#93a9d6",
      "name": "High Elf",
      "desc": "Ancient magic in the blood. +8 magic power.",
      "chance": 8.75,
      "stats": {
        "magicPower": 8,
        "attackSpeed": 5
      },
      "passives": []
    },
    {
      "id": "gorgon",
      "color": "#69a377",
      "name": "Gorgon",
      "desc": "A gaze of stone. Reflects 10% damage, +4 resistance.",
      "chance": 8.75,
      "stats": {
        "resistance": 4,
        "attackSpeed": 1
      },
      "passives": [
        {
          "kind": "thorns",
          "name": "Petrifying Gaze",
          "desc": "Reflect 10% of damage taken.",
          "mult": 0.1
        }
      ]
    },
    {
      "id": "demonblood",
      "color": "#b0503c",
      "name": "Demonblood",
      "desc": "Burning heritage. +15% damage, but takes 30% more holy damage.",
      "chance": 7,
      "stats": {
        "attackSpeed": 3
      },
      "passives": [
        {
          "kind": "damageBonus",
          "name": "Demonic Fury",
          "desc": "+15% damage.",
          "mult": 0.15
        },
        {
          "kind": "damageTaken",
          "name": "Unholy Weakness",
          "desc": "Takes 30% more holy damage.",
          "mult": 0.3,
          "fromElement": "holy"
        }
      ]
    },
    {
      "id": "lightborn",
      "color": "#d8c56a",
      "name": "Lightborn",
      "desc": "Blessed radiance. +15% healing, but takes 30% more shadow damage.",
      "chance": 7,
      "stats": {
        "attackSpeed": 0
      },
      "passives": [
        {
          "kind": "healBonus",
          "name": "Radiant Touch",
          "desc": "+15% healing.",
          "mult": 0.15
        },
        {
          "kind": "damageTaken",
          "name": "Shadow Frailty",
          "desc": "Takes 30% more shadow damage.",
          "mult": 0.3,
          "fromElement": "shadow"
        }
      ]
    },
    {
      "id": "voidborn",
      "color": "#7f74b8",
      "name": "Voidborn",
      "desc": "Touched by the void. 8% dodge, but takes 20% more holy damage.",
      "chance": 7,
      "stats": {
        "attackSpeed": 2
      },
      "passives": [
        {
          "kind": "dodge",
          "name": "Void Step",
          "desc": "8% chance to dodge attacks.",
          "chance": 0.08
        },
        {
          "kind": "damageTaken",
          "name": "Light Frailty",
          "desc": "Takes 20% more holy damage.",
          "mult": 0.2,
          "fromElement": "holy"
        }
      ]
    },
    {
      "id": "daemonkin",
      "color": "#0b0b12",
      "glow": "#ff5a36",
      "name": "Daemonkin",
      "desc": "Pure demon royalty. +20% damage and +10% lifesteal.",
      "chance": 1,
      "stats": {
        "attackSpeed": 2
      },
      "passives": [
        {
          "kind": "damageBonus",
          "name": "Royal Wrath",
          "desc": "+20% damage.",
          "mult": 0.2
        },
        {
          "kind": "lifesteal",
          "name": "Soul Siphon",
          "desc": "Heal 10% of all damage dealt.",
          "pct": 0.1
        }
      ]
    },
    {
      "id": "dragonborn",
      "color": "#0b0b12",
      "glow": "#4d9fff",
      "name": "Dragonborn",
      "desc": "Scales of the wyrms. Take 15% less damage.",
      "chance": 1,
      "stats": {
        "attackSpeed": 1
      },
      "passives": [
        {
          "kind": "damageTaken",
          "name": "Dragonscales",
          "desc": "Take 15% less damage (true damage excluded).",
          "mult": -0.15
        }
      ]
    },
    {
      "id": "arch_vampyr",
      "color": "#0b0b12",
      "glow": "#e0244a",
      "name": "Arch-Vampyr",
      "desc": "Ancient predator. Heal 12% of all damage dealt.",
      "chance": 1,
      "stats": {
        "attackSpeed": 5
      },
      "passives": [
        {
          "kind": "lifesteal",
          "name": "Crimson Thirst",
          "desc": "Heal 12% of all damage dealt.",
          "pct": 0.12
        }
      ]
    },
    {
      "id": "archangel",
      "color": "#0b0b12",
      "glow": "#e8d98a",
      "name": "Archangel",
      "desc": "Celestial guardian. +25% healing and start combat with a 10% shield (3 turns).",
      "chance": 1,
      "stats": {
        "attackSpeed": 0
      },
      "passives": [
        {
          "kind": "healBonus",
          "name": "Celestial Grace",
          "desc": "+25% healing.",
          "mult": 0.25
        },
        {
          "kind": "shieldStart",
          "name": "Aegis of Dawn",
          "desc": "Start combat with a shield equal to 10% max HP (3 turns).",
          "pct": 0.1,
          "turns": 3
        }
      ]
    }
  ],
  "petSkillPresets": [
    {
      "id": "preset_flame_bite",
      "name": "Flame Bite",
      "kind": "attack",
      "value": 0.6,
      "interval": 2,
      "element": "fire",
      "desc": "Fire attack every 2 turns."
    },
    {
      "id": "preset_aqua_mend",
      "name": "Aqua Mend",
      "kind": "heal",
      "value": 0.15,
      "interval": 2,
      "element": "water",
      "desc": "Heal 15% max HP every 2 turns."
    },
    {
      "id": "preset_stone_ward",
      "name": "Stone Ward",
      "kind": "shield",
      "value": 35,
      "interval": 3,
      "element": "earth",
      "desc": "35 shield every 3 turns (1 turn)."
    },
    {
      "id": "preset_frostbite",
      "name": "Frostbite",
      "kind": "frozen",
      "value": 0,
      "interval": 3,
      "element": "frost",
      "desc": "Freeze the foe every 3 turns."
    },
    {
      "id": "preset_volt_zap",
      "name": "Volt Zap",
      "kind": "attack",
      "value": 0.5,
      "interval": 1,
      "element": "lightning",
      "desc": "Fast lightning attack every turn."
    },
    {
      "id": "preset_vine_leech",
      "name": "Vine Leech",
      "kind": "weaken",
      "value": 0.15,
      "interval": 2,
      "element": "nature",
      "desc": "Weaken the foe every 2 turns."
    },
    {
      "id": "preset_dusk_curse",
      "name": "Dusk Curse",
      "kind": "weaken",
      "value": 0.2,
      "interval": 3,
      "element": "dark",
      "desc": "Heavy weaken every 3 turns."
    },
    {
      "id": "preset_bloom",
      "name": "Bloom",
      "kind": "heal",
      "value": 0.12,
      "interval": 1,
      "element": "nature",
      "desc": "Small heal every turn."
    }
  ],
  "monsterTags": [
    "beast",
    "undead",
    "humanoid",
    "elemental",
    "construct",
    "dragon",
    "demon",
    "plant",
    "slime",
    "spirit"
  ],
  "arpgSkills": {
    "warrior": {
      "atkSpd": 6,
      "auto": {
        "element": "physical"
      },
      "q": {
        "id": "whirlwind",
        "name": "Whirlwind",
        "visual": "Whirlwind",
        "element": "physical",
        "kind": "arc",
        "cd": 4.5,
        "power": 1.55,
        "radius": 100,
        "arc": 1.15,
        "color": "#ffd54f",
        "cost": 0,
        "desc": "A full spinning cut that carves every foe in front of you.",
        "trDesc": "Önündeki bütün düşmanları biçen tam turlu bir savuruş.",
        "slot": "q",
        "defaultSlot": "q"
      },
      "e": {
        "id": "earthbreaker",
        "name": "Earthbreaker",
        "visual": "Earthbreaker",
        "element": "physical",
        "kind": "nova",
        "cd": 9,
        "power": 1.7,
        "radius": 110,
        "knockback": 120,
        "color": "#ffb74d",
        "cost": 0,
        "desc": "Slam the ground and send a shockwave through everything nearby.",
        "trDesc": "Yere vur; çevrendeki her şeyi sarsan bir şok dalgası yay.",
        "slot": "e",
        "defaultSlot": "e"
      },
      "r": {
        "id": "bladestorm",
        "name": "Blade Storm",
        "visual": "Blade Storm",
        "element": "physical",
        "kind": "orbit",
        "cd": 15,
        "power": 2.35,
        "radius": 118,
        "duration": 3.2,
        "tick": 0.35,
        "count": 8,
        "speed": 4.6,
        "color": "#80d8ff",
        "cost": 0,
        "desc": "Blades orbit you for three seconds, shredding anything they touch.",
        "trDesc": "Bıçaklar üç saniye etrafında döner, dokunduklarını parçalar.",
        "slot": "r",
        "defaultSlot": "r"
      },
      "pool": [
        {
          "id": "battlefocus",
          "name": "Battle Focus",
          "visual": "Rune Circle",
          "element": "physical",
          "kind": "buff",
          "cd": 18,
          "color": "#ffb74d",
          "cost": 2,
          "slot": null,
          "buff": {
            "stat": "attack",
            "pct": 30,
            "duration": 8
          },
          "desc": "Sharpen your focus: attack power rises for 8 seconds.",
          "trDesc": "Odağını topla: 8 saniye boyunca saldırı gücün yükselir."
        },
        {
          "id": "ironskin",
          "name": "Iron Skin",
          "visual": "",
          "element": "earth",
          "kind": "buff",
          "cd": 20,
          "color": "#b0bec5",
          "cost": 2,
          "slot": null,
          "buff": {
            "stat": "defense",
            "pct": 35,
            "duration": 8
          },
          "desc": "Harden your body: damage taken drops for 8 seconds.",
          "trDesc": "Bedenini sertleştir: 8 saniye boyunca aldığın hasar azalır."
        },
        {
          "id": "tremor",
          "name": "Tremor",
          "visual": "Earthbreaker",
          "element": "physical",
          "kind": "quake",
          "cd": 14,
          "power": 1.5,
          "radius": 130,
          "pulses": 3,
          "interval": 0.22,
          "knockback": 100,
          "color": "#a1887f",
          "cost": 2,
          "slot": null,
          "desc": "Smash the ground and send three rolling shockwaves outward.",
          "trDesc": "Yere vur; dışa doğru yayılan üç şok dalgası gönder."
        },
        {
          "name": "Swordstorm",
          "element": "physical",
          "kind": "swing",
          "cd": 10,
          "power": 0.62,
          "color": "#9fd8ff",
          "desc": "A technique carried over from the old travel kit.",
          "radius": 122,
          "hits": 3,
          "interval": 0.2,
          "arc": 1.65,
          "status": {
            "type": "bleed",
            "duration": 2,
            "dps": 8
          },
          "id": "legacy_warrior_e",
          "visual": "Whirlwind",
          "tr": "Kılıç Fırtınası",
          "legacyFrom": "warrior.e",
          "trDesc": "A technique carried over from the old travel kit.",
          "cost": 2,
          "slot": null
        },
        {
          "name": "Cleaving Arc",
          "element": "physical",
          "kind": "arc",
          "cd": 4.5,
          "power": 1.7,
          "color": "#9fd8ff",
          "desc": "A technique carried over from the old travel kit.",
          "radius": 100,
          "arc": 1.1,
          "id": "legacy_warrior_q",
          "visual": "Whirlwind",
          "tr": "Yaran Yay",
          "legacyFrom": "warrior.q",
          "trDesc": "A technique carried over from the old travel kit.",
          "cost": 1,
          "slot": null
        }
      ],
      "late": [
        {
          "id": "doomgavel",
          "name": "Doom Gavel",
          "visual": "Titan Fist",
          "element": "physical",
          "kind": "meteor",
          "cd": 34,
          "power": 3.4,
          "radius": 150,
          "delay": 0.45,
          "range": 340,
          "knockback": 260,
          "color": "#ffd54f",
          "cost": 4,
          "late": true,
          "desc": "A colossal gavel of stone falls from the sky and shatters the ground.",
          "trDesc": "Gökten devasa bir taş tokmak düşer ve yeri parçalar.",
          "slot": null
        },
        {
          "id": "worldbreaker",
          "name": "World Breaker",
          "visual": "Earthbreaker",
          "element": "physical",
          "kind": "nova",
          "cd": 45,
          "power": 4.6,
          "radius": 190,
          "knockback": 340,
          "color": "#ffb74d",
          "cost": 6,
          "late": true,
          "desc": "One strike cracks the world; everything around you is thrown back.",
          "trDesc": "Tek vuruş dünyayı çatlatır; çevrendeki her şey geri savrulur.",
          "slot": null
        }
      ],
      "legacy": {
        "q": {
          "name": "Cleaving Arc",
          "element": "physical",
          "kind": "arc",
          "cd": 4.5,
          "power": 1.7,
          "color": "#9fd8ff",
          "desc": "",
          "radius": 100,
          "arc": 1.1
        },
        "e": {
          "name": "Swordstorm",
          "element": "physical",
          "kind": "swing",
          "cd": 10,
          "power": 0.62,
          "color": "#9fd8ff",
          "desc": "",
          "radius": 122,
          "hits": 3,
          "interval": 0.2,
          "arc": 1.65,
          "status": {
            "type": "bleed",
            "duration": 2,
            "dps": 8
          }
        },
        "r": {
          "name": "Blade Tempest",
          "element": "physical",
          "kind": "orbit",
          "cd": 16,
          "power": 2.7,
          "color": "#9fd8ff",
          "desc": "",
          "radius": 120,
          "duration": 3.4,
          "tick": 0.35,
          "count": 8,
          "speed": 4.4
        }
      }
    },
    "ranger": {
      "atkSpd": 18,
      "auto": {
        "element": "physical"
      },
      "q": {
        "id": "gale",
        "name": "Gale",
        "visual": "Cyclone",
        "element": "physical",
        "kind": "vortex",
        "cd": 6,
        "power": 1,
        "radius": 100,
        "duration": 2,
        "tick": 0.35,
        "pull": 90,
        "range": 260,
        "color": "#b0bec5",
        "cost": 0,
        "desc": "A short burst of wind that pulls and cuts.",
        "trDesc": "Çeken ve kesen kısa bir rüzgâr patlaması.",
        "slot": "q",
        "defaultSlot": "q"
      },
      "e": {
        "id": "cyclone",
        "name": "Cyclone",
        "visual": "Cyclone",
        "element": "physical",
        "kind": "vortex",
        "cd": 9,
        "power": 1.2,
        "radius": 120,
        "duration": 2.6,
        "tick": 0.35,
        "pull": 120,
        "range": 300,
        "color": "#b0bec5",
        "cost": 0,
        "desc": "A spinning vortex drags enemies inward and shreds them.",
        "trDesc": "Dönen bir girdap düşmanları içeri çeker ve parçalar.",
        "slot": "e",
        "defaultSlot": "e"
      },
      "r": {
        "id": "starfall",
        "name": "Starfall",
        "visual": "Starfall",
        "element": "arcane",
        "magic": true,
        "kind": "meteor",
        "cd": 17,
        "power": 2.8,
        "radius": 135,
        "delay": 0.45,
        "count": 3,
        "stagger": 0.14,
        "spreadRadius": 130,
        "range": 360,
        "color": "#ffe57f",
        "cost": 0,
        "desc": "Stars rain from the sky across a wide area.",
        "trDesc": "Gökten geniş bir alana yıldızlar yağar.",
        "slot": "r",
        "defaultSlot": "r"
      },
      "pool": [
        {
          "id": "battlefocus",
          "name": "Battle Focus",
          "visual": "Rune Circle",
          "element": "physical",
          "kind": "buff",
          "cd": 18,
          "color": "#ffb74d",
          "cost": 2,
          "slot": null,
          "buff": {
            "stat": "attack",
            "pct": 30,
            "duration": 8
          },
          "desc": "Sharpen your focus: attack power rises for 8 seconds.",
          "trDesc": "Odağını topla: 8 saniye boyunca saldırı gücün yükselir."
        },
        {
          "id": "ironskin",
          "name": "Iron Skin",
          "visual": "",
          "element": "earth",
          "kind": "buff",
          "cd": 20,
          "color": "#b0bec5",
          "cost": 2,
          "slot": null,
          "buff": {
            "stat": "defense",
            "pct": 35,
            "duration": 8
          },
          "desc": "Harden your body: damage taken drops for 8 seconds.",
          "trDesc": "Bedenini sertleştir: 8 saniye boyunca aldığın hasar azalır."
        },
        {
          "id": "tremor",
          "name": "Tremor",
          "visual": "Earthbreaker",
          "element": "physical",
          "kind": "quake",
          "cd": 14,
          "power": 1.5,
          "radius": 130,
          "pulses": 3,
          "interval": 0.22,
          "knockback": 100,
          "color": "#a1887f",
          "cost": 2,
          "slot": null,
          "desc": "Smash the ground and send three rolling shockwaves outward.",
          "trDesc": "Yere vur; dışa doğru yayılan üç şok dalgası gönder."
        },
        {
          "name": "Rain of Arrows",
          "element": "physical",
          "kind": "barrage",
          "cd": 15,
          "power": 2.2,
          "color": "#9fd8ff",
          "desc": "A technique carried over from the old travel kit.",
          "count": 16,
          "interval": 0.055,
          "speed": 900,
          "radius": 6,
          "spread": 0.13,
          "id": "legacy_ranger_r",
          "visual": "Starfall",
          "tr": "Ok Yağmuru",
          "legacyFrom": "ranger.r",
          "trDesc": "A technique carried over from the old travel kit.",
          "cost": 3,
          "slot": null
        },
        {
          "id": "spiritpack",
          "name": "Spirit Pack",
          "visual": "Spirit Pack",
          "element": "nature",
          "magic": true,
          "kind": "aoe",
          "cd": 14,
          "power": 1.7,
          "radius": 120,
          "offset": 60,
          "pet": true,
          "color": "#80deea",
          "cost": 3,
          "desc": "Ghostly wolves circle the target and lunge as one.",
          "trDesc": "Hayalet kurtlar hedefin etrafında döner ve birlikte atılır.",
          "slot": null
        },
        {
          "id": "toxiccloud",
          "name": "Toxic Cloud",
          "visual": "Toxic Cloud",
          "element": "nature",
          "magic": true,
          "kind": "ground",
          "cd": 8,
          "power": 1.1,
          "radius": 100,
          "duration": 3,
          "tick": 0.5,
          "dot": 10,
          "range": 300,
          "color": "#7cb342",
          "cost": 1,
          "desc": "A lingering cloud of poison that eats away at anything inside.",
          "trDesc": "İçindeki her şeyi kemiren, kalıcı bir zehir bulutu.",
          "slot": null
        }
      ],
      "late": [
        {
          "id": "astralcollapse",
          "name": "Astral Collapse",
          "visual": "Starfall",
          "element": "arcane",
          "magic": true,
          "kind": "meteor",
          "cd": 36,
          "power": 3.6,
          "radius": 165,
          "delay": 0.4,
          "count": 5,
          "stagger": 0.12,
          "spreadRadius": 160,
          "range": 370,
          "color": "#ffe57f",
          "cost": 4,
          "late": true,
          "desc": "Five collapsing stars hammer the battlefield in quick succession.",
          "trDesc": "Beş çöken yıldız art arda savaş alanını döver.",
          "slot": null
        },
        {
          "id": "arcanedominion",
          "name": "Arcane Dominion",
          "visual": "Starfall",
          "element": "arcane",
          "magic": true,
          "kind": "meteor",
          "cd": 47,
          "power": 4.9,
          "radius": 210,
          "delay": 0.5,
          "count": 7,
          "stagger": 0.1,
          "spreadRadius": 200,
          "range": 400,
          "color": "#b388ff",
          "cost": 6,
          "late": true,
          "desc": "You claim the sky: seven stars answer your call at once.",
          "trDesc": "Gökyüzünü sahiplenirsin: yedi yıldız aynı anda çağrına uyar.",
          "slot": null
        }
      ],
      "legacy": {
        "q": {
          "name": "Triple Shot",
          "element": "physical",
          "kind": "fan",
          "cd": 4,
          "power": 0.9,
          "color": "#9fd8ff",
          "desc": "",
          "count": 3,
          "spread": 0.2,
          "speed": 620,
          "radius": 7
        },
        "e": {
          "name": "Piercing Bolt",
          "element": "physical",
          "kind": "beam",
          "cd": 8,
          "power": 2,
          "color": "#9fd8ff",
          "desc": "",
          "range": 300,
          "width": 22
        },
        "r": {
          "name": "Rain of Arrows",
          "element": "physical",
          "kind": "barrage",
          "cd": 15,
          "power": 2.2,
          "color": "#9fd8ff",
          "desc": "",
          "count": 16,
          "interval": 0.055,
          "speed": 900,
          "radius": 6,
          "spread": 0.13
        }
      }
    },
    "mage": {
      "atkSpd": -4,
      "auto": {
        "element": "arcane",
        "magic": true
      },
      "q": {
        "id": "frostnova",
        "name": "Frost Nova",
        "visual": "Frost Nova",
        "element": "frost",
        "magic": true,
        "kind": "nova",
        "cd": 8,
        "power": 1.4,
        "radius": 105,
        "color": "#80deea",
        "status": {
          "type": "freeze",
          "duration": 1.2
        },
        "cost": 0,
        "desc": "A ring of ice bursts outward and freezes what it touches.",
        "trDesc": "Dışa doğru buz halkası patlar, dokunduğunu dondurur.",
        "slot": "q",
        "defaultSlot": "q"
      },
      "e": {
        "id": "infernoburst",
        "name": "Inferno Burst",
        "visual": "Inferno Burst",
        "element": "fire",
        "magic": true,
        "kind": "nova",
        "cd": 8.5,
        "power": 1.6,
        "radius": 100,
        "color": "#ff7a1a",
        "status": {
          "type": "burn",
          "duration": 3,
          "dps": 12
        },
        "cost": 0,
        "desc": "A ring of fire detonates around you and keeps burning.",
        "trDesc": "Etrafında bir ateş halkası patlar ve yanmaya devam eder.",
        "slot": "e",
        "defaultSlot": "e"
      },
      "r": {
        "id": "meteorstorm",
        "name": "Meteor Storm",
        "visual": "Meteor Storm",
        "element": "fire",
        "magic": true,
        "kind": "meteor",
        "cd": 15,
        "power": 2.6,
        "radius": 120,
        "delay": 0.35,
        "count": 2,
        "stagger": 0.2,
        "spreadRadius": 110,
        "range": 340,
        "color": "#ff8a65",
        "status": {
          "type": "burn",
          "duration": 3,
          "dps": 14
        },
        "cost": 0,
        "desc": "Call down meteors on the marked ground, leaving burning craters.",
        "trDesc": "İşaretli yere meteorlar indir; yanan kraterler bırak.",
        "slot": "r",
        "defaultSlot": "r"
      },
      "pool": [
        {
          "id": "frostbite",
          "name": "Frostbite",
          "visual": "",
          "element": "frost",
          "kind": "projectile",
          "cd": 6,
          "power": 1.4,
          "speed": 660,
          "radius": 10,
          "color": "#81d4fa",
          "cost": 1,
          "slot": null,
          "status": {
            "type": "slow",
            "duration": 2,
            "slow": 0.45
          },
          "desc": "Hurl a shard of ice that chills and slows the target.",
          "trDesc": "Hedefi üşütüp yavaşlatan bir buz kırığı fırlat."
        },
        {
          "id": "ironskin",
          "name": "Iron Skin",
          "visual": "",
          "element": "earth",
          "kind": "buff",
          "cd": 20,
          "color": "#b0bec5",
          "cost": 2,
          "slot": null,
          "buff": {
            "stat": "defense",
            "pct": 35,
            "duration": 8
          },
          "desc": "Harden your body: damage taken drops for 8 seconds.",
          "trDesc": "Bedenini sertleştir: 8 saniye boyunca aldığın hasar azalır."
        },
        {
          "id": "spiritward",
          "name": "Spirit Ward",
          "visual": "",
          "element": "holy",
          "kind": "shield",
          "cd": 22,
          "shieldPct": 30,
          "duration": 6,
          "radius": 60,
          "color": "#ffe082",
          "cost": 2,
          "slot": null,
          "desc": "A spirit shield absorbs damage for 6 seconds.",
          "trDesc": "Ruh kalkanı 6 saniye boyunca gelen hasarı emer."
        },
        {
          "id": "glaciervall",
          "name": "Glacier Wall",
          "visual": "Glacier Wall",
          "element": "frost",
          "magic": true,
          "kind": "ground",
          "cd": 11,
          "power": 1.25,
          "radius": 80,
          "duration": 2.2,
          "tick": 0.45,
          "range": 280,
          "color": "#9fe2ff",
          "status": {
            "type": "freeze",
            "duration": 1
          },
          "cost": 2,
          "desc": "Raise a wall of ice ahead that slows and cuts anything crossing it.",
          "trDesc": "Önüne geçenleri yavaşlatan ve kesen bir buz duvarı dik.",
          "slot": null
        },
        {
          "id": "chainlightning",
          "name": "Chain Lightning",
          "visual": "Chain Lightning",
          "element": "lightning",
          "magic": true,
          "kind": "chain",
          "cd": 8,
          "power": 1.5,
          "radius": 320,
          "jumps": 4,
          "chainRange": 200,
          "color": "#80d8ff",
          "status": {
            "type": "shock",
            "duration": 2,
            "dps": 8
          },
          "cost": 1,
          "desc": "Lightning leaps between foes, shocking each one it touches.",
          "trDesc": "Yıldırım düşmandan düşmana sıçrar, her birini çarpar.",
          "slot": null
        },
        {
          "id": "emberwave",
          "name": "Ember Wave",
          "visual": "Inferno Burst",
          "element": "fire",
          "magic": true,
          "kind": "arc",
          "cd": 5,
          "power": 1.5,
          "radius": 105,
          "arc": 1,
          "color": "#ffb300",
          "status": {
            "type": "burn",
            "duration": 2,
            "dps": 8
          },
          "cost": 1,
          "desc": "A wave of cinders washes over the arc ahead.",
          "trDesc": "Önündeki yayın üzerinden kor dalgası geçer.",
          "slot": null
        }
      ],
      "late": [
        {
          "id": "sunfall",
          "name": "Sunfall",
          "visual": "Meteor Storm",
          "element": "fire",
          "magic": true,
          "kind": "meteor",
          "cd": 36,
          "power": 3.5,
          "radius": 165,
          "delay": 0.4,
          "count": 3,
          "stagger": 0.18,
          "spreadRadius": 150,
          "range": 360,
          "color": "#ff8a65",
          "status": {
            "type": "burn",
            "duration": 4,
            "dps": 20
          },
          "cost": 4,
          "late": true,
          "desc": "Three burning suns crash down and leave the earth ablaze.",
          "trDesc": "Üç yanan güneş yere çakılır ve toprağı tutuşturur.",
          "slot": null
        },
        {
          "id": "infernalcrown",
          "name": "Infernal Crown",
          "visual": "Inferno Burst",
          "element": "fire",
          "magic": true,
          "kind": "nova",
          "cd": 46,
          "power": 4.8,
          "radius": 200,
          "color": "#ff3d00",
          "status": {
            "type": "burn",
            "duration": 5,
            "dps": 26
          },
          "cost": 6,
          "late": true,
          "desc": "A crown of hellfire erupts around you and keeps the ground burning.",
          "trDesc": "Etrafında cehennem ateşinden bir taç patlar ve yeri yakmaya devam eder.",
          "slot": null
        }
      ],
      "legacy": {
        "q": {
          "name": "Arcane Rift",
          "element": "arcane",
          "kind": "chain",
          "cd": 4.5,
          "power": 1,
          "color": "#c77dff",
          "desc": "",
          "radius": 330,
          "jumps": 4,
          "chainRange": 205,
          "status": {
            "type": "shock",
            "duration": 2,
            "dps": 7
          }
        },
        "e": {
          "name": "Frost Vortex",
          "element": "frost",
          "kind": "vortex",
          "cd": 9,
          "power": 1.15,
          "color": "#8fe4ff",
          "desc": "",
          "radius": 132,
          "duration": 2.8,
          "tick": 0.35,
          "pull": 135,
          "status": {
            "type": "freeze",
            "duration": 1.3
          },
          "range": 320,
          "knockback": 130
        },
        "r": {
          "name": "Meteor Storm",
          "element": "fire",
          "kind": "meteor",
          "cd": 17,
          "power": 3,
          "color": "#ff8a65",
          "desc": "",
          "radius": 148,
          "delay": 0.35,
          "count": 3,
          "stagger": 0.16,
          "spreadRadius": 120,
          "status": {
            "type": "burn",
            "duration": 3,
            "dps": 18
          },
          "range": 340
        }
      }
    },
    "rogue": {
      "atkSpd": 22,
      "auto": {
        "element": "physical"
      },
      "q": {
        "id": "toxiccloud",
        "name": "Toxic Cloud",
        "visual": "Toxic Cloud",
        "element": "nature",
        "magic": true,
        "kind": "ground",
        "cd": 8,
        "power": 1.1,
        "radius": 100,
        "duration": 3,
        "tick": 0.5,
        "dot": 10,
        "range": 300,
        "color": "#7cb342",
        "cost": 0,
        "desc": "A lingering cloud of poison that eats away at anything inside.",
        "trDesc": "İçindeki her şeyi kemiren, kalıcı bir zehir bulutu.",
        "slot": "q",
        "defaultSlot": "q"
      },
      "e": {
        "id": "umbrallash",
        "name": "Umbral Lash",
        "visual": "Shadow Grasp",
        "element": "shadow",
        "kind": "arc",
        "cd": 5,
        "power": 1.5,
        "radius": 110,
        "arc": 1.1,
        "color": "#9c4dff",
        "cost": 0,
        "desc": "A whip of shadow cuts across the foes in front of you.",
        "trDesc": "Önündeki düşmanları kesen bir gölge kamçısı.",
        "slot": "e",
        "defaultSlot": "e"
      },
      "r": {
        "id": "bladestorm",
        "name": "Blade Storm",
        "visual": "Blade Storm",
        "element": "physical",
        "kind": "orbit",
        "cd": 15,
        "power": 2.35,
        "radius": 118,
        "duration": 3.2,
        "tick": 0.35,
        "count": 8,
        "speed": 4.6,
        "color": "#80d8ff",
        "cost": 0,
        "desc": "Blades orbit you for three seconds, shredding anything they touch.",
        "trDesc": "Bıçaklar üç saniye etrafında döner, dokunduklarını parçalar.",
        "slot": "r",
        "defaultSlot": "r"
      },
      "pool": [
        {
          "id": "thornwave",
          "name": "Thorn Wave",
          "visual": "Thorn Snare",
          "element": "nature",
          "kind": "ground",
          "cd": 14,
          "power": 0.62,
          "radius": 120,
          "duration": 4,
          "tick": 0.5,
          "color": "#81c784",
          "cost": 2,
          "slot": null,
          "status": {
            "type": "slow",
            "duration": 2,
            "slow": 0.35
          },
          "desc": "Thorns erupt from the ground and keep stinging anything standing there.",
          "trDesc": "Yerden dikenler fışkırır; orada duran her şeyi sürekli yakar."
        },
        {
          "id": "windstep",
          "name": "Wind Step",
          "visual": "",
          "element": "nature",
          "kind": "buff",
          "cd": 16,
          "color": "#a5d6a7",
          "cost": 1,
          "slot": null,
          "buff": {
            "stat": "speed",
            "pct": 35,
            "duration": 6
          },
          "desc": "Ride the wind: movement speed rises for 6 seconds.",
          "trDesc": "Rüzgâra bin: 6 saniye boyunca hareket hızın artar."
        },
        {
          "id": "spiritward",
          "name": "Spirit Ward",
          "visual": "",
          "element": "holy",
          "kind": "shield",
          "cd": 22,
          "shieldPct": 30,
          "duration": 6,
          "radius": 60,
          "color": "#ffe082",
          "cost": 2,
          "slot": null,
          "desc": "A spirit shield absorbs damage for 6 seconds.",
          "trDesc": "Ruh kalkanı 6 saniye boyunca gelen hasarı emer."
        },
        {
          "id": "shadowgrasp",
          "name": "Shadow Grasp",
          "visual": "Shadow Grasp",
          "element": "shadow",
          "magic": true,
          "kind": "ground",
          "cd": 9,
          "power": 1.4,
          "radius": 95,
          "duration": 2.2,
          "tick": 0.4,
          "range": 300,
          "color": "#9c4dff",
          "status": {
            "type": "freeze",
            "duration": 1
          },
          "cost": 2,
          "desc": "Shadow tendrils burst from the ground and claw at everything.",
          "trDesc": "Yerden gölge kolları fışkırır ve her şeyi tırmalar.",
          "slot": null
        },
        {
          "name": "Smoke Bomb",
          "element": "shadow",
          "kind": "ground",
          "cd": 9,
          "power": 0.7,
          "color": "#b388ff",
          "desc": "A technique carried over from the old travel kit.",
          "radius": 92,
          "duration": 2.8,
          "tick": 0.45,
          "status": {
            "type": "slow",
            "duration": 2.2,
            "slow": 0.55
          },
          "dot": 8,
          "id": "legacy_rogue_e",
          "visual": "Toxic Cloud",
          "tr": "Sis Bombası",
          "legacyFrom": "rogue.e",
          "trDesc": "A technique carried over from the old travel kit.",
          "cost": 2,
          "slot": null
        },
        {
          "id": "gale",
          "name": "Gale",
          "visual": "Cyclone",
          "element": "physical",
          "kind": "vortex",
          "cd": 6,
          "power": 1,
          "radius": 100,
          "duration": 2,
          "tick": 0.35,
          "pull": 90,
          "range": 260,
          "color": "#b0bec5",
          "cost": 1,
          "desc": "A short burst of wind that pulls and cuts.",
          "trDesc": "Çeken ve kesen kısa bir rüzgâr patlaması.",
          "slot": null
        }
      ],
      "late": [
        {
          "id": "doomgavel",
          "name": "Doom Gavel",
          "visual": "Titan Fist",
          "element": "physical",
          "kind": "meteor",
          "cd": 34,
          "power": 3.4,
          "radius": 150,
          "delay": 0.45,
          "range": 340,
          "knockback": 260,
          "color": "#ffd54f",
          "cost": 4,
          "late": true,
          "desc": "A colossal gavel of stone falls from the sky and shatters the ground.",
          "trDesc": "Gökten devasa bir taş tokmak düşer ve yeri parçalar.",
          "slot": null
        },
        {
          "id": "worldbreaker",
          "name": "World Breaker",
          "visual": "Earthbreaker",
          "element": "physical",
          "kind": "nova",
          "cd": 45,
          "power": 4.6,
          "radius": 190,
          "knockback": 340,
          "color": "#ffb74d",
          "cost": 6,
          "late": true,
          "desc": "One strike cracks the world; everything around you is thrown back.",
          "trDesc": "Tek vuruş dünyayı çatlatır; çevrendeki her şey geri savrulur.",
          "slot": null
        }
      ],
      "legacy": {
        "q": {
          "name": "Fan of Knives",
          "element": "shadow",
          "kind": "fan",
          "cd": 4,
          "power": 0.8,
          "color": "#b388ff",
          "desc": "",
          "count": 5,
          "spread": 0.16,
          "speed": 720,
          "radius": 6
        },
        "e": {
          "name": "Smoke Bomb",
          "element": "shadow",
          "kind": "ground",
          "cd": 9,
          "power": 0.7,
          "color": "#b388ff",
          "desc": "",
          "radius": 92,
          "duration": 2.8,
          "tick": 0.45,
          "status": {
            "type": "slow",
            "duration": 2.2,
            "slow": 0.55
          },
          "dot": 8
        },
        "r": {
          "name": "Shadow Dance",
          "element": "shadow",
          "kind": "orbit",
          "cd": 15,
          "power": 2.6,
          "color": "#b388ff",
          "desc": "",
          "radius": 118,
          "duration": 3.6,
          "tick": 0.28,
          "count": 10,
          "speed": 5.2,
          "status": {
            "type": "bleed",
            "duration": 2.5,
            "dps": 9
          }
        }
      }
    },
    "paladin": {
      "atkSpd": 0,
      "auto": {
        "element": "holy"
      },
      "q": {
        "id": "holylance",
        "name": "Judgement Beam",
        "visual": "Judgement Beam",
        "element": "holy",
        "magic": true,
        "kind": "beam",
        "cd": 7,
        "power": 1.7,
        "range": 300,
        "width": 26,
        "color": "#fff59d",
        "cost": 0,
        "desc": "A lance of holy light burns a straight line through the enemy.",
        "trDesc": "Kutsal ışıktan bir mızrak düşmanın içinden düz bir çizgi yakar.",
        "slot": "q",
        "defaultSlot": "q"
      },
      "e": {
        "id": "runeseal",
        "name": "Rune Seal",
        "visual": "Rune Circle",
        "element": "arcane",
        "magic": true,
        "kind": "shield",
        "cd": 11,
        "power": 0,
        "shieldPct": 22,
        "duration": 5,
        "color": "#b388ff",
        "cost": 0,
        "desc": "Etch a warding rune that absorbs a share of incoming damage.",
        "trDesc": "Gelen hasarın bir kısmını yutan koruyucu bir rün kaz.",
        "slot": "e",
        "defaultSlot": "e"
      },
      "r": {
        "id": "divinejudgement",
        "name": "Divine Judgement",
        "visual": "Divine Judgement",
        "element": "holy",
        "magic": true,
        "kind": "nova",
        "cd": 18,
        "power": 2.9,
        "radius": 150,
        "color": "#fff59d",
        "status": {
          "type": "stun",
          "duration": 0.8
        },
        "cost": 0,
        "desc": "Six blades of light fall around you and stun the wicked.",
        "trDesc": "Etrafına altı ışık kılıcı iner ve günahkârları sersemletir.",
        "slot": "r",
        "defaultSlot": "r"
      },
      "pool": [
        {
          "id": "spiritward",
          "name": "Spirit Ward",
          "visual": "",
          "element": "holy",
          "kind": "shield",
          "cd": 22,
          "shieldPct": 30,
          "duration": 6,
          "radius": 60,
          "color": "#ffe082",
          "cost": 2,
          "slot": null,
          "desc": "A spirit shield absorbs damage for 6 seconds.",
          "trDesc": "Ruh kalkanı 6 saniye boyunca gelen hasarı emer."
        },
        {
          "id": "battlefocus",
          "name": "Battle Focus",
          "visual": "Rune Circle",
          "element": "physical",
          "kind": "buff",
          "cd": 18,
          "color": "#ffb74d",
          "cost": 2,
          "slot": null,
          "buff": {
            "stat": "attack",
            "pct": 30,
            "duration": 8
          },
          "desc": "Sharpen your focus: attack power rises for 8 seconds.",
          "trDesc": "Odağını topla: 8 saniye boyunca saldırı gücün yükselir."
        },
        {
          "id": "ironskin",
          "name": "Iron Skin",
          "visual": "",
          "element": "earth",
          "kind": "buff",
          "cd": 20,
          "color": "#b0bec5",
          "cost": 2,
          "slot": null,
          "buff": {
            "stat": "defense",
            "pct": 35,
            "duration": 8
          },
          "desc": "Harden your body: damage taken drops for 8 seconds.",
          "trDesc": "Bedenini sertleştir: 8 saniye boyunca aldığın hasar azalır."
        },
        {
          "id": "judgementbeam",
          "name": "Radiant Verdict",
          "visual": "Judgement Beam",
          "element": "holy",
          "magic": true,
          "kind": "beam",
          "cd": 11,
          "power": 2.1,
          "range": 360,
          "width": 34,
          "color": "#ffe082",
          "cost": 2,
          "desc": "A wide beam of judgement that sears everything in its path.",
          "trDesc": "Yolundaki her şeyi dağlayan geniş bir hüküm ışını.",
          "slot": null
        },
        {
          "id": "healingrain",
          "name": "Healing Rain",
          "visual": "Healing Rain",
          "element": "holy",
          "magic": true,
          "kind": "heal",
          "cd": 9,
          "healPct": 18,
          "radius": 90,
          "color": "#69f0ae",
          "power": 0,
          "cost": 2,
          "desc": "Warm rain falls and knits your wounds shut.",
          "trDesc": "Ilık bir yağmur yağar ve yaralarını kapatır.",
          "slot": null
        },
        {
          "name": "Aegis of Dawn",
          "element": "holy",
          "kind": "shield",
          "cd": 10,
          "power": 0,
          "color": "#ffe082",
          "desc": "A technique carried over from the old travel kit.",
          "shieldPct": 28,
          "duration": 5,
          "id": "legacy_paladin_e",
          "visual": "Rune Circle",
          "tr": "Şafak Siperi",
          "legacyFrom": "paladin.e",
          "trDesc": "A technique carried over from the old travel kit.",
          "cost": 2,
          "slot": null
        }
      ],
      "late": [
        {
          "id": "seraphsjudgement",
          "name": "Seraph's Judgement",
          "visual": "Judgement Beam",
          "element": "holy",
          "magic": true,
          "kind": "beam",
          "cd": 34,
          "power": 3.5,
          "range": 380,
          "width": 42,
          "color": "#fff59d",
          "cost": 4,
          "late": true,
          "desc": "A seraph's spear of light burns a wide path through everything.",
          "trDesc": "Bir serafın ışık mızrağı her şeyin içinden geniş bir yol yakar.",
          "slot": null
        },
        {
          "id": "eternaldawn",
          "name": "Eternal Dawn",
          "visual": "Divine Judgement",
          "element": "holy",
          "magic": true,
          "kind": "nova",
          "cd": 45,
          "power": 4.8,
          "radius": 195,
          "healPct": 22,
          "color": "#ffe082",
          "status": {
            "type": "stun",
            "duration": 1.2
          },
          "cost": 6,
          "late": true,
          "desc": "Dawn breaks all at once: foes are stunned, allies are restored.",
          "trDesc": "Şafak bir anda söker: düşmanlar sersemler, müttefikler iyileşir.",
          "slot": null
        }
      ],
      "legacy": {
        "q": {
          "name": "Dawn Strike",
          "element": "holy",
          "kind": "arc",
          "cd": 4.5,
          "power": 1.7,
          "color": "#ffe082",
          "desc": "",
          "radius": 100,
          "arc": 1
        },
        "e": {
          "name": "Aegis of Dawn",
          "element": "holy",
          "kind": "shield",
          "cd": 10,
          "power": 0,
          "color": "#ffe082",
          "desc": "",
          "shieldPct": 28,
          "duration": 5
        },
        "r": {
          "name": "Judgment",
          "element": "holy",
          "kind": "meteor",
          "cd": 16,
          "power": 2.9,
          "color": "#ffe082",
          "desc": "",
          "radius": 135,
          "delay": 0.4,
          "status": {
            "type": "stun",
            "duration": 0.9
          },
          "range": 340
        }
      }
    },
    "assassin": {
      "atkSpd": 20,
      "auto": {
        "element": "physical"
      },
      "q": {
        "id": "umbrallash",
        "name": "Umbral Lash",
        "visual": "Shadow Grasp",
        "element": "shadow",
        "kind": "arc",
        "cd": 5,
        "power": 1.5,
        "radius": 110,
        "arc": 1.1,
        "color": "#9c4dff",
        "cost": 0,
        "desc": "A whip of shadow cuts across the foes in front of you.",
        "trDesc": "Önündeki düşmanları kesen bir gölge kamçısı.",
        "slot": "q",
        "defaultSlot": "q"
      },
      "e": {
        "id": "shadowgrasp",
        "name": "Shadow Grasp",
        "visual": "Shadow Grasp",
        "element": "shadow",
        "magic": true,
        "kind": "ground",
        "cd": 9,
        "power": 1.4,
        "radius": 95,
        "duration": 2.2,
        "tick": 0.4,
        "range": 300,
        "color": "#9c4dff",
        "status": {
          "type": "freeze",
          "duration": 1
        },
        "cost": 0,
        "desc": "Shadow tendrils burst from the ground and claw at everything.",
        "trDesc": "Yerden gölge kolları fışkırır ve her şeyi tırmalar.",
        "slot": "e",
        "defaultSlot": "e"
      },
      "r": {
        "id": "bladestorm",
        "name": "Blade Storm",
        "visual": "Blade Storm",
        "element": "physical",
        "kind": "orbit",
        "cd": 15,
        "power": 2.35,
        "radius": 118,
        "duration": 3.2,
        "tick": 0.35,
        "count": 8,
        "speed": 4.6,
        "color": "#80d8ff",
        "cost": 0,
        "desc": "Blades orbit you for three seconds, shredding anything they touch.",
        "trDesc": "Bıçaklar üç saniye etrafında döner, dokunduklarını parçalar.",
        "slot": "r",
        "defaultSlot": "r"
      },
      "pool": [
        {
          "id": "shadowveil",
          "name": "Shadow Veil",
          "visual": "Dimension Rift",
          "element": "shadow",
          "kind": "teleport",
          "cd": 10,
          "power": 0.9,
          "range": 200,
          "radius": 70,
          "color": "#9575cd",
          "cost": 2,
          "slot": null,
          "desc": "Melt into shadow and reappear a short distance away.",
          "trDesc": "Gölgeye karışıp kısa bir mesafe öteye belir."
        },
        {
          "id": "frostbite",
          "name": "Frostbite",
          "visual": "",
          "element": "frost",
          "kind": "projectile",
          "cd": 6,
          "power": 1.4,
          "speed": 660,
          "radius": 10,
          "color": "#81d4fa",
          "cost": 1,
          "slot": null,
          "status": {
            "type": "slow",
            "duration": 2,
            "slow": 0.45
          },
          "desc": "Hurl a shard of ice that chills and slows the target.",
          "trDesc": "Hedefi üşütüp yavaşlatan bir buz kırığı fırlat."
        },
        {
          "id": "ironskin",
          "name": "Iron Skin",
          "visual": "",
          "element": "earth",
          "kind": "buff",
          "cd": 20,
          "color": "#b0bec5",
          "cost": 2,
          "slot": null,
          "buff": {
            "stat": "defense",
            "pct": 35,
            "duration": 8
          },
          "desc": "Harden your body: damage taken drops for 8 seconds.",
          "trDesc": "Bedenini sertleştir: 8 saniye boyunca aldığın hasar azalır."
        },
        {
          "id": "dimensionrift",
          "name": "Dimension Rift",
          "visual": "Dimension Rift",
          "element": "arcane",
          "magic": true,
          "kind": "teleport",
          "cd": 10,
          "power": 1.9,
          "radius": 90,
          "range": 230,
          "color": "#b388ff",
          "cost": 2,
          "desc": "Tear space and step through it, shredding everything you leave behind.",
          "trDesc": "Uzayı yırt ve içinden geç; geride bıraktığın her şeyi parçala.",
          "slot": null
        },
        {
          "name": "Shadow Dance",
          "element": "shadow",
          "kind": "orbit",
          "cd": 15,
          "power": 2.6,
          "color": "#b388ff",
          "desc": "A technique carried over from the old travel kit.",
          "radius": 118,
          "duration": 3.6,
          "tick": 0.28,
          "count": 10,
          "speed": 5.2,
          "status": {
            "type": "bleed",
            "duration": 2.5,
            "dps": 9
          },
          "id": "legacy_rogue_r",
          "visual": "Blade Storm",
          "tr": "Gölge Dansı",
          "legacyFrom": "rogue.r",
          "trDesc": "A technique carried over from the old travel kit.",
          "cost": 3,
          "slot": null
        },
        {
          "id": "venomspit",
          "name": "Venom Spit",
          "visual": "Toxic Cloud",
          "element": "nature",
          "magic": true,
          "kind": "projectile",
          "cd": 5,
          "power": 1.35,
          "speed": 620,
          "radius": 9,
          "color": "#7cb342",
          "cost": 1,
          "desc": "Spit a blob of venom that bursts on impact.",
          "trDesc": "Çarpınca patlayan bir zehir topağı tükür.",
          "slot": null
        }
      ],
      "late": [
        {
          "id": "doomgavel",
          "name": "Doom Gavel",
          "visual": "Titan Fist",
          "element": "physical",
          "kind": "meteor",
          "cd": 34,
          "power": 3.4,
          "radius": 150,
          "delay": 0.45,
          "range": 340,
          "knockback": 260,
          "color": "#ffd54f",
          "cost": 4,
          "late": true,
          "desc": "A colossal gavel of stone falls from the sky and shatters the ground.",
          "trDesc": "Gökten devasa bir taş tokmak düşer ve yeri parçalar.",
          "slot": null
        },
        {
          "id": "worldbreaker",
          "name": "World Breaker",
          "visual": "Earthbreaker",
          "element": "physical",
          "kind": "nova",
          "cd": 45,
          "power": 4.6,
          "radius": 190,
          "knockback": 340,
          "color": "#ffb74d",
          "cost": 6,
          "late": true,
          "desc": "One strike cracks the world; everything around you is thrown back.",
          "trDesc": "Tek vuruş dünyayı çatlatır; çevrendeki her şey geri savrulur.",
          "slot": null
        }
      ],
      "legacy": {
        "q": {
          "name": "Throat Cut",
          "element": "physical",
          "kind": "arc",
          "cd": 3.5,
          "power": 1.9,
          "color": "#9fd8ff",
          "desc": "",
          "radius": 85,
          "arc": 0.8
        },
        "e": {
          "name": "Blood Mark",
          "element": "blood",
          "kind": "beam",
          "cd": 7,
          "power": 2.1,
          "color": "#ff5370",
          "desc": "",
          "range": 210,
          "width": 26,
          "status": {
            "type": "bleed",
            "duration": 3,
            "dps": 12
          }
        },
        "r": {
          "name": "Crimson Reaping",
          "element": "blood",
          "kind": "teleport",
          "cd": 15,
          "power": 2.9,
          "color": "#ff5370",
          "desc": "",
          "range": 200,
          "radius": 120,
          "status": {
            "type": "bleed",
            "duration": 4,
            "dps": 18
          }
        }
      }
    },
    "support": {
      "atkSpd": -6,
      "auto": {
        "element": "holy",
        "magic": true
      },
      "q": {
        "id": "mendinglight",
        "name": "Mending Light",
        "visual": "Healing Rain",
        "element": "holy",
        "magic": true,
        "kind": "heal",
        "cd": 6,
        "healPct": 10,
        "radius": 70,
        "color": "#69f0ae",
        "power": 0,
        "cost": 0,
        "desc": "A soft light mends a small amount of health.",
        "trDesc": "Yumuşak bir ışık az miktarda can onarır.",
        "slot": "q",
        "defaultSlot": "q"
      },
      "e": {
        "id": "healingrain",
        "name": "Healing Rain",
        "visual": "Healing Rain",
        "element": "holy",
        "magic": true,
        "kind": "heal",
        "cd": 9,
        "healPct": 18,
        "radius": 90,
        "color": "#69f0ae",
        "power": 0,
        "cost": 0,
        "desc": "Warm rain falls and knits your wounds shut.",
        "trDesc": "Ilık bir yağmur yağar ve yaralarını kapatır.",
        "slot": "e",
        "defaultSlot": "e"
      },
      "r": {
        "id": "treeoflife",
        "name": "Tree of Life",
        "visual": "Tree of Life",
        "element": "nature",
        "magic": true,
        "kind": "heal",
        "cd": 16,
        "healPct": 30,
        "radius": 120,
        "color": "#69f0ae",
        "power": 0,
        "cost": 0,
        "desc": "A great tree blooms and pours healing light over the ground.",
        "trDesc": "Ulu bir ağaç açar ve yere şifa ışığı döker.",
        "slot": "r",
        "defaultSlot": "r"
      },
      "pool": [
        {
          "id": "spiritward",
          "name": "Spirit Ward",
          "visual": "",
          "element": "holy",
          "kind": "shield",
          "cd": 22,
          "shieldPct": 30,
          "duration": 6,
          "radius": 60,
          "color": "#ffe082",
          "cost": 2,
          "slot": null,
          "desc": "A spirit shield absorbs damage for 6 seconds.",
          "trDesc": "Ruh kalkanı 6 saniye boyunca gelen hasarı emer."
        },
        {
          "id": "battlefocus",
          "name": "Battle Focus",
          "visual": "Rune Circle",
          "element": "physical",
          "kind": "buff",
          "cd": 18,
          "color": "#ffb74d",
          "cost": 2,
          "slot": null,
          "buff": {
            "stat": "attack",
            "pct": 30,
            "duration": 8
          },
          "desc": "Sharpen your focus: attack power rises for 8 seconds.",
          "trDesc": "Odağını topla: 8 saniye boyunca saldırı gücün yükselir."
        },
        {
          "id": "ironskin",
          "name": "Iron Skin",
          "visual": "",
          "element": "earth",
          "kind": "buff",
          "cd": 20,
          "color": "#b0bec5",
          "cost": 2,
          "slot": null,
          "buff": {
            "stat": "defense",
            "pct": 35,
            "duration": 8
          },
          "desc": "Harden your body: damage taken drops for 8 seconds.",
          "trDesc": "Bedenini sertleştir: 8 saniye boyunca aldığın hasar azalır."
        },
        {
          "id": "phoenixrebirth",
          "name": "Phoenix Rebirth",
          "visual": "Phoenix Rebirth",
          "element": "holy",
          "magic": true,
          "kind": "heal",
          "cd": 22,
          "healPct": 45,
          "radius": 110,
          "shieldPct": 12,
          "duration": 5,
          "color": "#ff8f00",
          "power": 0,
          "cost": 3,
          "desc": "A phoenix rises from you, restoring a great amount of health.",
          "trDesc": "İçinden bir anka yükselir, büyük miktarda can geri verir.",
          "slot": null
        },
        {
          "id": "runeseal",
          "name": "Rune Seal",
          "visual": "Rune Circle",
          "element": "arcane",
          "magic": true,
          "kind": "shield",
          "cd": 11,
          "power": 0,
          "shieldPct": 22,
          "duration": 5,
          "color": "#b388ff",
          "cost": 2,
          "desc": "Etch a warding rune that absorbs a share of incoming damage.",
          "trDesc": "Gelen hasarın bir kısmını yutan koruyucu bir rün kaz.",
          "slot": null
        },
        {
          "id": "thornsnare",
          "name": "Thorn Snare",
          "visual": "Thorn Snare",
          "element": "nature",
          "magic": true,
          "kind": "ground",
          "cd": 8,
          "power": 1,
          "radius": 90,
          "duration": 2.2,
          "tick": 0.4,
          "range": 280,
          "color": "#76ff03",
          "status": {
            "type": "freeze",
            "duration": 1.4
          },
          "cost": 1,
          "desc": "Thorned vines erupt and root everything in the area.",
          "trDesc": "Dikenli sarmaşıklar fışkırır ve alandaki her şeyi kökler.",
          "slot": null
        }
      ],
      "late": [
        {
          "id": "primordialgrove",
          "name": "Primordial Grove",
          "visual": "Tree of Life",
          "element": "nature",
          "magic": true,
          "kind": "heal",
          "cd": 30,
          "healPct": 55,
          "shieldPct": 20,
          "duration": 6,
          "radius": 150,
          "color": "#69f0ae",
          "cost": 4,
          "late": true,
          "power": 0,
          "desc": "An ancient grove blooms around you, pouring life into every wound.",
          "trDesc": "Etrafında kadim bir koru açar, her yaraya can döker.",
          "slot": null
        },
        {
          "id": "verdantwrath",
          "name": "Verdant Wrath",
          "visual": "Thorn Snare",
          "element": "nature",
          "magic": true,
          "kind": "ground",
          "cd": 44,
          "power": 4.6,
          "radius": 200,
          "duration": 4,
          "tick": 0.35,
          "range": 340,
          "color": "#76ff03",
          "status": {
            "type": "freeze",
            "duration": 1.8
          },
          "cost": 6,
          "late": true,
          "desc": "The wilds rise up: thorns, roots and rot devour the marked land.",
          "trDesc": "Yaban ayaklanır: dikenler, kökler ve çürük işaretli toprağı yutar.",
          "slot": null
        }
      ],
      "legacy": {
        "q": {
          "name": "Holy Bolt",
          "element": "holy",
          "kind": "projectile",
          "cd": 3,
          "power": 1.2,
          "color": "#ffe082",
          "desc": "",
          "speed": 600,
          "radius": 9
        },
        "e": {
          "name": "Sanctuary",
          "element": "holy",
          "kind": "shield",
          "cd": 10,
          "power": 0,
          "color": "#ffe082",
          "desc": "",
          "shieldPct": 24,
          "duration": 5,
          "healPct": 8
        },
        "r": {
          "name": "Radiant Chorus",
          "element": "holy",
          "kind": "heal",
          "cd": 16,
          "power": 0,
          "color": "#ffe082",
          "desc": "",
          "healPct": 35,
          "radius": 155
        }
      }
    },
    "tank": {
      "atkSpd": -12,
      "auto": {
        "element": "physical"
      },
      "q": {
        "id": "earthbreaker",
        "name": "Earthbreaker",
        "visual": "Earthbreaker",
        "element": "physical",
        "kind": "nova",
        "cd": 9,
        "power": 1.7,
        "radius": 110,
        "knockback": 120,
        "color": "#ffb74d",
        "cost": 0,
        "desc": "Slam the ground and send a shockwave through everything nearby.",
        "trDesc": "Yere vur; çevrendeki her şeyi sarsan bir şok dalgası yay.",
        "slot": "q",
        "defaultSlot": "q"
      },
      "e": {
        "id": "glaciervall",
        "name": "Glacier Wall",
        "visual": "Glacier Wall",
        "element": "frost",
        "magic": true,
        "kind": "ground",
        "cd": 11,
        "power": 1.25,
        "radius": 80,
        "duration": 2.2,
        "tick": 0.45,
        "range": 280,
        "color": "#9fe2ff",
        "status": {
          "type": "freeze",
          "duration": 1
        },
        "cost": 0,
        "desc": "Raise a wall of ice ahead that slows and cuts anything crossing it.",
        "trDesc": "Önüne geçenleri yavaşlatan ve kesen bir buz duvarı dik.",
        "slot": "e",
        "defaultSlot": "e"
      },
      "r": {
        "id": "tremor",
        "name": "Tremor",
        "visual": "Earthbreaker",
        "element": "physical",
        "kind": "quake",
        "cd": 14,
        "power": 1.5,
        "radius": 130,
        "pulses": 3,
        "interval": 0.22,
        "knockback": 100,
        "color": "#a1887f",
        "cost": 2,
        "slot": "r",
        "desc": "Smash the ground and send three rolling shockwaves outward.",
        "trDesc": "Yere vur; dışa doğru yayılan üç şok dalgası gönder.",
        "defaultSlot": "r"
      },
      "pool": [
        {
          "id": "battlefocus",
          "name": "Battle Focus",
          "visual": "Rune Circle",
          "element": "physical",
          "kind": "buff",
          "cd": 18,
          "color": "#ffb74d",
          "cost": 2,
          "slot": null,
          "buff": {
            "stat": "attack",
            "pct": 30,
            "duration": 8
          },
          "desc": "Sharpen your focus: attack power rises for 8 seconds.",
          "trDesc": "Odağını topla: 8 saniye boyunca saldırı gücün yükselir."
        },
        {
          "id": "ironskin",
          "name": "Iron Skin",
          "visual": "",
          "element": "earth",
          "kind": "buff",
          "cd": 20,
          "color": "#b0bec5",
          "cost": 2,
          "slot": null,
          "buff": {
            "stat": "defense",
            "pct": 35,
            "duration": 8
          },
          "desc": "Harden your body: damage taken drops for 8 seconds.",
          "trDesc": "Bedenini sertleştir: 8 saniye boyunca aldığın hasar azalır."
        },
        {
          "id": "runeseal",
          "name": "Rune Seal",
          "visual": "Rune Circle",
          "element": "arcane",
          "magic": true,
          "kind": "shield",
          "cd": 11,
          "power": 0,
          "shieldPct": 22,
          "duration": 5,
          "color": "#b388ff",
          "cost": 2,
          "desc": "Etch a warding rune that absorbs a share of incoming damage.",
          "trDesc": "Gelen hasarın bir kısmını yutan koruyucu bir rün kaz.",
          "slot": null
        },
        {
          "id": "bonecage",
          "name": "Bone Cage",
          "visual": "Bone Cage",
          "element": "shadow",
          "kind": "ground",
          "cd": 12,
          "power": 1.4,
          "radius": 95,
          "duration": 2.4,
          "tick": 0.4,
          "color": "#d8d0b8",
          "status": {
            "type": "freeze",
            "duration": 1.2
          },
          "cost": 2,
          "desc": "Bones erupt around the target and lock it in place while they cut.",
          "trDesc": "Hedefin çevresinde kemikler yükselir, onu yerinde kilitler.",
          "slot": null
        },
        {
          "name": "Aegis of Dawn",
          "element": "holy",
          "kind": "shield",
          "cd": 10,
          "power": 0,
          "color": "#ffe082",
          "desc": "A technique carried over from the old travel kit.",
          "shieldPct": 28,
          "duration": 5,
          "id": "legacy_paladin_e",
          "visual": "Rune Circle",
          "tr": "Şafak Siperi",
          "legacyFrom": "paladin.e",
          "trDesc": "A technique carried over from the old travel kit.",
          "cost": 2,
          "slot": null
        }
      ],
      "late": [
        {
          "id": "doomgavel",
          "name": "Doom Gavel",
          "visual": "Titan Fist",
          "element": "physical",
          "kind": "meteor",
          "cd": 34,
          "power": 3.4,
          "radius": 150,
          "delay": 0.45,
          "range": 340,
          "knockback": 260,
          "color": "#ffd54f",
          "cost": 4,
          "late": true,
          "desc": "A colossal gavel of stone falls from the sky and shatters the ground.",
          "trDesc": "Gökten devasa bir taş tokmak düşer ve yeri parçalar.",
          "slot": null
        },
        {
          "id": "worldbreaker",
          "name": "World Breaker",
          "visual": "Earthbreaker",
          "element": "physical",
          "kind": "nova",
          "cd": 45,
          "power": 4.6,
          "radius": 190,
          "knockback": 340,
          "color": "#ffb74d",
          "cost": 6,
          "late": true,
          "desc": "One strike cracks the world; everything around you is thrown back.",
          "trDesc": "Tek vuruş dünyayı çatlatır; çevrendeki her şey geri savrulur.",
          "slot": null
        }
      ],
      "legacy": {
        "q": {
          "name": "Shield Bash",
          "element": "physical",
          "kind": "arc",
          "cd": 4,
          "power": 1.4,
          "color": "#9fd8ff",
          "desc": "",
          "radius": 85,
          "arc": 0.9,
          "knockback": 120,
          "status": {
            "type": "stun",
            "duration": 0.5
          }
        },
        "e": {
          "name": "Iron Bulwark",
          "element": "earth",
          "kind": "shield",
          "cd": 11,
          "power": 0,
          "color": "#c9a227",
          "desc": "",
          "shieldPct": 35,
          "duration": 5
        },
        "r": {
          "name": "Shockwave",
          "element": "earth",
          "kind": "quake",
          "cd": 16,
          "power": 2.5,
          "color": "#c9a227",
          "desc": "",
          "radius": 150,
          "pulses": 3,
          "interval": 0.22,
          "knockback": 200
        }
      }
    },
    "tamer": {
      "atkSpd": 8,
      "auto": {
        "element": "nature"
      },
      "q": {
        "id": "bramble",
        "name": "Bramble",
        "visual": "Thorn Snare",
        "element": "nature",
        "magic": true,
        "kind": "arc",
        "cd": 5,
        "power": 1.3,
        "radius": 95,
        "arc": 1,
        "color": "#76ff03",
        "cost": 0,
        "desc": "A lash of thorned vines sweeps the arc ahead.",
        "trDesc": "Önündeki yayı süpüren dikenli sarmaşık kamçısı.",
        "slot": "q",
        "defaultSlot": "q"
      },
      "e": {
        "id": "thornsnare",
        "name": "Thorn Snare",
        "visual": "Thorn Snare",
        "element": "nature",
        "magic": true,
        "kind": "ground",
        "cd": 8,
        "power": 1,
        "radius": 90,
        "duration": 2.2,
        "tick": 0.4,
        "range": 280,
        "color": "#76ff03",
        "status": {
          "type": "freeze",
          "duration": 1.4
        },
        "cost": 0,
        "desc": "Thorned vines erupt and root everything in the area.",
        "trDesc": "Dikenli sarmaşıklar fışkırır ve alandaki her şeyi kökler.",
        "slot": "e",
        "defaultSlot": "e"
      },
      "r": {
        "id": "spiritpack",
        "name": "Spirit Pack",
        "visual": "Spirit Pack",
        "element": "nature",
        "magic": true,
        "kind": "aoe",
        "cd": 14,
        "power": 1.7,
        "radius": 120,
        "offset": 60,
        "pet": true,
        "color": "#80deea",
        "cost": 0,
        "desc": "Ghostly wolves circle the target and lunge as one.",
        "trDesc": "Hayalet kurtlar hedefin etrafında döner ve birlikte atılır.",
        "slot": "r",
        "defaultSlot": "r"
      },
      "pool": [
        {
          "id": "thornwave",
          "name": "Thorn Wave",
          "visual": "Thorn Snare",
          "element": "nature",
          "kind": "ground",
          "cd": 14,
          "power": 0.62,
          "radius": 120,
          "duration": 4,
          "tick": 0.5,
          "color": "#81c784",
          "cost": 2,
          "slot": null,
          "status": {
            "type": "slow",
            "duration": 2,
            "slow": 0.35
          },
          "desc": "Thorns erupt from the ground and keep stinging anything standing there.",
          "trDesc": "Yerden dikenler fışkırır; orada duran her şeyi sürekli yakar."
        },
        {
          "id": "windstep",
          "name": "Wind Step",
          "visual": "",
          "element": "nature",
          "kind": "buff",
          "cd": 16,
          "color": "#a5d6a7",
          "cost": 1,
          "slot": null,
          "buff": {
            "stat": "speed",
            "pct": 35,
            "duration": 6
          },
          "desc": "Ride the wind: movement speed rises for 6 seconds.",
          "trDesc": "Rüzgâra bin: 6 saniye boyunca hareket hızın artar."
        },
        {
          "id": "spiritward",
          "name": "Spirit Ward",
          "visual": "",
          "element": "holy",
          "kind": "shield",
          "cd": 22,
          "shieldPct": 30,
          "duration": 6,
          "radius": 60,
          "color": "#ffe082",
          "cost": 2,
          "slot": null,
          "desc": "A spirit shield absorbs damage for 6 seconds.",
          "trDesc": "Ruh kalkanı 6 saniye boyunca gelen hasarı emer."
        },
        {
          "id": "cyclone",
          "name": "Cyclone",
          "visual": "Cyclone",
          "element": "physical",
          "kind": "vortex",
          "cd": 9,
          "power": 1.2,
          "radius": 120,
          "duration": 2.6,
          "tick": 0.35,
          "pull": 120,
          "range": 300,
          "color": "#b0bec5",
          "cost": 2,
          "desc": "A spinning vortex drags enemies inward and shreds them.",
          "trDesc": "Dönen bir girdap düşmanları içeri çeker ve parçalar.",
          "slot": null
        },
        {
          "id": "umbrallash",
          "name": "Umbral Lash",
          "visual": "Shadow Grasp",
          "element": "shadow",
          "kind": "arc",
          "cd": 5,
          "power": 1.5,
          "radius": 110,
          "arc": 1.1,
          "color": "#9c4dff",
          "cost": 1,
          "desc": "A whip of shadow cuts across the foes in front of you.",
          "trDesc": "Önündeki düşmanları kesen bir gölge kamçısı.",
          "slot": null
        },
        {
          "name": "Stampede",
          "element": "nature",
          "kind": "aoe",
          "cd": 16,
          "power": 2.7,
          "color": "#9ccc65",
          "desc": "A technique carried over from the old travel kit.",
          "radius": 145,
          "offset": 40,
          "knockback": 160,
          "pet": true,
          "id": "legacy_tamer_r",
          "visual": "Earthbreaker",
          "tr": "Stampede",
          "legacyFrom": "tamer.r",
          "trDesc": "A technique carried over from the old travel kit.",
          "cost": 3,
          "slot": null
        }
      ],
      "late": [
        {
          "id": "primordialgrove",
          "name": "Primordial Grove",
          "visual": "Tree of Life",
          "element": "nature",
          "magic": true,
          "kind": "heal",
          "cd": 30,
          "healPct": 55,
          "shieldPct": 20,
          "duration": 6,
          "radius": 150,
          "color": "#69f0ae",
          "cost": 4,
          "late": true,
          "power": 0,
          "desc": "An ancient grove blooms around you, pouring life into every wound.",
          "trDesc": "Etrafında kadim bir koru açar, her yaraya can döker.",
          "slot": null
        },
        {
          "id": "verdantwrath",
          "name": "Verdant Wrath",
          "visual": "Thorn Snare",
          "element": "nature",
          "magic": true,
          "kind": "ground",
          "cd": 44,
          "power": 4.6,
          "radius": 200,
          "duration": 4,
          "tick": 0.35,
          "range": 340,
          "color": "#76ff03",
          "status": {
            "type": "freeze",
            "duration": 1.8
          },
          "cost": 6,
          "late": true,
          "desc": "The wilds rise up: thorns, roots and rot devour the marked land.",
          "trDesc": "Yaban ayaklanır: dikenler, kökler ve çürük işaretli toprağı yutar.",
          "slot": null
        }
      ],
      "legacy": {
        "q": {
          "name": "Beast Fang",
          "element": "nature",
          "kind": "projectile",
          "cd": 3.5,
          "power": 1.3,
          "color": "#9ccc65",
          "desc": "",
          "speed": 640,
          "radius": 9,
          "pet": true
        },
        "e": {
          "name": "Spirit Howl",
          "element": "nature",
          "kind": "nova",
          "cd": 8,
          "power": 1.5,
          "color": "#9ccc65",
          "desc": "",
          "radius": 125,
          "status": {
            "type": "slow",
            "duration": 2.2,
            "slow": 0.55
          },
          "pet": true
        },
        "r": {
          "name": "Stampede",
          "element": "nature",
          "kind": "aoe",
          "cd": 16,
          "power": 2.7,
          "color": "#9ccc65",
          "desc": "",
          "radius": 145,
          "offset": 40,
          "knockback": 160,
          "pet": true
        }
      }
    },
    "gardener": {
      "atkSpd": 2,
      "auto": {
        "element": "nature"
      },
      "q": {
        "id": "bramble",
        "name": "Bramble",
        "visual": "Thorn Snare",
        "element": "nature",
        "magic": true,
        "kind": "arc",
        "cd": 5,
        "power": 1.3,
        "radius": 95,
        "arc": 1,
        "color": "#76ff03",
        "cost": 0,
        "desc": "A lash of thorned vines sweeps the arc ahead.",
        "trDesc": "Önündeki yayı süpüren dikenli sarmaşık kamçısı.",
        "slot": "q",
        "defaultSlot": "q"
      },
      "e": {
        "id": "toxiccloud",
        "name": "Toxic Cloud",
        "visual": "Toxic Cloud",
        "element": "nature",
        "magic": true,
        "kind": "ground",
        "cd": 8,
        "power": 1.1,
        "radius": 100,
        "duration": 3,
        "tick": 0.5,
        "dot": 10,
        "range": 300,
        "color": "#7cb342",
        "cost": 0,
        "desc": "A lingering cloud of poison that eats away at anything inside.",
        "trDesc": "İçindeki her şeyi kemiren, kalıcı bir zehir bulutu.",
        "slot": "e",
        "defaultSlot": "e"
      },
      "r": {
        "id": "treeoflife",
        "name": "Tree of Life",
        "visual": "Tree of Life",
        "element": "nature",
        "magic": true,
        "kind": "heal",
        "cd": 16,
        "healPct": 30,
        "radius": 120,
        "color": "#69f0ae",
        "power": 0,
        "cost": 0,
        "desc": "A great tree blooms and pours healing light over the ground.",
        "trDesc": "Ulu bir ağaç açar ve yere şifa ışığı döker.",
        "slot": "r",
        "defaultSlot": "r"
      },
      "pool": [
        {
          "id": "thornwave",
          "name": "Thorn Wave",
          "visual": "Thorn Snare",
          "element": "nature",
          "kind": "ground",
          "cd": 14,
          "power": 0.62,
          "radius": 120,
          "duration": 4,
          "tick": 0.5,
          "color": "#81c784",
          "cost": 2,
          "slot": null,
          "status": {
            "type": "slow",
            "duration": 2,
            "slow": 0.35
          },
          "desc": "Thorns erupt from the ground and keep stinging anything standing there.",
          "trDesc": "Yerden dikenler fışkırır; orada duran her şeyi sürekli yakar."
        },
        {
          "id": "windstep",
          "name": "Wind Step",
          "visual": "",
          "element": "nature",
          "kind": "buff",
          "cd": 16,
          "color": "#a5d6a7",
          "cost": 1,
          "slot": null,
          "buff": {
            "stat": "speed",
            "pct": 35,
            "duration": 6
          },
          "desc": "Ride the wind: movement speed rises for 6 seconds.",
          "trDesc": "Rüzgâra bin: 6 saniye boyunca hareket hızın artar."
        },
        {
          "id": "spiritward",
          "name": "Spirit Ward",
          "visual": "",
          "element": "holy",
          "kind": "shield",
          "cd": 22,
          "shieldPct": 30,
          "duration": 6,
          "radius": 60,
          "color": "#ffe082",
          "cost": 2,
          "slot": null,
          "desc": "A spirit shield absorbs damage for 6 seconds.",
          "trDesc": "Ruh kalkanı 6 saniye boyunca gelen hasarı emer."
        },
        {
          "id": "thornsnare",
          "name": "Thorn Snare",
          "visual": "Thorn Snare",
          "element": "nature",
          "magic": true,
          "kind": "ground",
          "cd": 8,
          "power": 1,
          "radius": 90,
          "duration": 2.2,
          "tick": 0.4,
          "range": 280,
          "color": "#76ff03",
          "status": {
            "type": "freeze",
            "duration": 1.4
          },
          "cost": 1,
          "desc": "Thorned vines erupt and root everything in the area.",
          "trDesc": "Dikenli sarmaşıklar fışkırır ve alandaki her şeyi kökler.",
          "slot": null
        },
        {
          "id": "healingrain",
          "name": "Healing Rain",
          "visual": "Healing Rain",
          "element": "holy",
          "magic": true,
          "kind": "heal",
          "cd": 9,
          "healPct": 18,
          "radius": 90,
          "color": "#69f0ae",
          "power": 0,
          "cost": 2,
          "desc": "Warm rain falls and knits your wounds shut.",
          "trDesc": "Ilık bir yağmur yağar ve yaralarını kapatır.",
          "slot": null
        },
        {
          "name": "Bloom",
          "element": "nature",
          "kind": "ground",
          "cd": 15,
          "power": 2,
          "color": "#9ccc65",
          "desc": "A technique carried over from the old travel kit.",
          "radius": 130,
          "duration": 4,
          "tick": 0.5,
          "status": {
            "type": "root",
            "duration": 1.2
          },
          "dot": 12,
          "range": 340,
          "id": "legacy_gardener_r",
          "visual": "Toxic Cloud",
          "tr": "Bloom",
          "legacyFrom": "gardener.r",
          "trDesc": "A technique carried over from the old travel kit.",
          "cost": 3,
          "slot": null
        }
      ],
      "late": [
        {
          "id": "primordialgrove",
          "name": "Primordial Grove",
          "visual": "Tree of Life",
          "element": "nature",
          "magic": true,
          "kind": "heal",
          "cd": 30,
          "healPct": 55,
          "shieldPct": 20,
          "duration": 6,
          "radius": 150,
          "color": "#69f0ae",
          "cost": 4,
          "late": true,
          "power": 0,
          "desc": "An ancient grove blooms around you, pouring life into every wound.",
          "trDesc": "Etrafında kadim bir koru açar, her yaraya can döker.",
          "slot": null
        },
        {
          "id": "verdantwrath",
          "name": "Verdant Wrath",
          "visual": "Thorn Snare",
          "element": "nature",
          "magic": true,
          "kind": "ground",
          "cd": 44,
          "power": 4.6,
          "radius": 200,
          "duration": 4,
          "tick": 0.35,
          "range": 340,
          "color": "#76ff03",
          "status": {
            "type": "freeze",
            "duration": 1.8
          },
          "cost": 6,
          "late": true,
          "desc": "The wilds rise up: thorns, roots and rot devour the marked land.",
          "trDesc": "Yaban ayaklanır: dikenler, kökler ve çürük işaretli toprağı yutar.",
          "slot": null
        }
      ],
      "legacy": {
        "q": {
          "name": "Thorn Volley",
          "element": "nature",
          "kind": "fan",
          "cd": 4,
          "power": 0.8,
          "color": "#9ccc65",
          "desc": "",
          "count": 4,
          "spread": 0.2,
          "speed": 620,
          "radius": 7
        },
        "e": {
          "name": "Entangling Roots",
          "element": "nature",
          "kind": "ground",
          "cd": 9,
          "power": 0.9,
          "color": "#9ccc65",
          "desc": "",
          "radius": 78,
          "duration": 3,
          "tick": 0.5,
          "status": {
            "type": "root",
            "duration": 2.2
          },
          "dot": 10,
          "range": 340
        },
        "r": {
          "name": "Bloom",
          "element": "nature",
          "kind": "ground",
          "cd": 15,
          "power": 2,
          "color": "#9ccc65",
          "desc": "",
          "radius": 130,
          "duration": 4,
          "tick": 0.5,
          "status": {
            "type": "root",
            "duration": 1.2
          },
          "dot": 12,
          "range": 340
        }
      }
    },
    "moderator": {
      "atkSpd": 4,
      "auto": {
        "element": "arcane",
        "magic": true
      },
      "q": {
        "id": "runecircle",
        "name": "Rune Circle",
        "visual": "Rune Circle",
        "element": "arcane",
        "magic": true,
        "kind": "nova",
        "cd": 10,
        "power": 1.2,
        "radius": 120,
        "color": "#b388ff",
        "status": {
          "type": "shock",
          "duration": 2,
          "dps": 7
        },
        "cost": 0,
        "desc": "A rune circle flares under you, shocking everything standing on it.",
        "trDesc": "Altında bir rün çemberi parlar, üstündeki her şeyi çarpar.",
        "slot": "q",
        "defaultSlot": "q"
      },
      "e": {
        "id": "dimensionrift",
        "name": "Dimension Rift",
        "visual": "Dimension Rift",
        "element": "arcane",
        "magic": true,
        "kind": "teleport",
        "cd": 10,
        "power": 1.9,
        "radius": 90,
        "range": 230,
        "color": "#b388ff",
        "cost": 0,
        "desc": "Tear space and step through it, shredding everything you leave behind.",
        "trDesc": "Uzayı yırt ve içinden geç; geride bıraktığın her şeyi parçala.",
        "slot": "e",
        "defaultSlot": "e"
      },
      "r": {
        "id": "starfall",
        "name": "Starfall",
        "visual": "Starfall",
        "element": "arcane",
        "magic": true,
        "kind": "meteor",
        "cd": 17,
        "power": 2.8,
        "radius": 135,
        "delay": 0.45,
        "count": 3,
        "stagger": 0.14,
        "spreadRadius": 130,
        "range": 360,
        "color": "#ffe57f",
        "cost": 0,
        "desc": "Stars rain from the sky across a wide area.",
        "trDesc": "Gökten geniş bir alana yıldızlar yağar.",
        "slot": "r",
        "defaultSlot": "r"
      },
      "pool": [
        {
          "id": "arcanepulse",
          "name": "Arcane Pulse",
          "visual": "",
          "element": "arcane",
          "kind": "nova",
          "cd": 8,
          "power": 1.5,
          "radius": 130,
          "knockback": 90,
          "color": "#ce93d8",
          "cost": 1,
          "slot": null,
          "desc": "Release a ring of raw magic that hurls nearby foes back.",
          "trDesc": "Çevrene ham büyü halkası sal; yakındaki düşmanları geri iter."
        },
        {
          "id": "shadowveil",
          "name": "Shadow Veil",
          "visual": "Dimension Rift",
          "element": "shadow",
          "kind": "teleport",
          "cd": 10,
          "power": 0.9,
          "range": 200,
          "radius": 70,
          "color": "#9575cd",
          "cost": 2,
          "slot": null,
          "desc": "Melt into shadow and reappear a short distance away.",
          "trDesc": "Gölgeye karışıp kısa bir mesafe öteye belir."
        },
        {
          "id": "windstep",
          "name": "Wind Step",
          "visual": "",
          "element": "nature",
          "kind": "buff",
          "cd": 16,
          "color": "#a5d6a7",
          "cost": 1,
          "slot": null,
          "buff": {
            "stat": "speed",
            "pct": 35,
            "duration": 6
          },
          "desc": "Ride the wind: movement speed rises for 6 seconds.",
          "trDesc": "Rüzgâra bin: 6 saniye boyunca hareket hızın artar."
        },
        {
          "id": "runeseal",
          "name": "Rune Seal",
          "visual": "Rune Circle",
          "element": "arcane",
          "magic": true,
          "kind": "shield",
          "cd": 11,
          "power": 0,
          "shieldPct": 22,
          "duration": 5,
          "color": "#b388ff",
          "cost": 2,
          "desc": "Etch a warding rune that absorbs a share of incoming damage.",
          "trDesc": "Gelen hasarın bir kısmını yutan koruyucu bir rün kaz.",
          "slot": null
        },
        {
          "id": "chainlightning",
          "name": "Chain Lightning",
          "visual": "Chain Lightning",
          "element": "lightning",
          "magic": true,
          "kind": "chain",
          "cd": 8,
          "power": 1.5,
          "radius": 320,
          "jumps": 4,
          "chainRange": 200,
          "color": "#80d8ff",
          "status": {
            "type": "shock",
            "duration": 2,
            "dps": 8
          },
          "cost": 1,
          "desc": "Lightning leaps between foes, shocking each one it touches.",
          "trDesc": "Yıldırım düşmandan düşmana sıçrar, her birini çarpar.",
          "slot": null
        },
        {
          "id": "singularity",
          "name": "Singularity",
          "visual": "Singularity",
          "element": "shadow",
          "magic": true,
          "kind": "vortex",
          "cd": 16,
          "power": 2,
          "radius": 130,
          "duration": 2.8,
          "tick": 0.4,
          "pull": 220,
          "range": 330,
          "color": "#7c4dff",
          "cost": 3,
          "desc": "Open a collapsing void that drags enemies into its core.",
          "trDesc": "Düşmanları çekirdeğine çeken, çöken bir boşluk aç.",
          "slot": null
        }
      ],
      "late": [
        {
          "id": "astralcollapse",
          "name": "Astral Collapse",
          "visual": "Starfall",
          "element": "arcane",
          "magic": true,
          "kind": "meteor",
          "cd": 36,
          "power": 3.6,
          "radius": 165,
          "delay": 0.4,
          "count": 5,
          "stagger": 0.12,
          "spreadRadius": 160,
          "range": 370,
          "color": "#ffe57f",
          "cost": 4,
          "late": true,
          "desc": "Five collapsing stars hammer the battlefield in quick succession.",
          "trDesc": "Beş çöken yıldız art arda savaş alanını döver.",
          "slot": null
        },
        {
          "id": "arcanedominion",
          "name": "Arcane Dominion",
          "visual": "Starfall",
          "element": "arcane",
          "magic": true,
          "kind": "meteor",
          "cd": 47,
          "power": 4.9,
          "radius": 210,
          "delay": 0.5,
          "count": 7,
          "stagger": 0.1,
          "spreadRadius": 200,
          "range": 400,
          "color": "#b388ff",
          "cost": 6,
          "late": true,
          "desc": "You claim the sky: seven stars answer your call at once.",
          "trDesc": "Gökyüzünü sahiplenirsin: yedi yıldız aynı anda çağrına uyar.",
          "slot": null
        }
      ],
      "legacy": {
        "q": {
          "name": "Debug Beam",
          "element": "arcane",
          "kind": "beam",
          "cd": 4,
          "power": 1.6,
          "color": "#c77dff",
          "desc": "",
          "range": 230,
          "width": 26
        },
        "e": {
          "name": "Null Field",
          "element": "arcane",
          "kind": "ground",
          "cd": 9,
          "power": 0.8,
          "color": "#c77dff",
          "desc": "",
          "radius": 85,
          "duration": 3,
          "tick": 0.5,
          "status": {
            "type": "slow",
            "duration": 2.5,
            "slow": 0.4
          },
          "dot": 12,
          "range": 340
        },
        "r": {
          "name": "Overclock",
          "element": "arcane",
          "kind": "chain",
          "cd": 16,
          "power": 3,
          "color": "#c77dff",
          "desc": "",
          "radius": 320,
          "jumps": 5,
          "chainRange": 190
        }
      }
    },
    "tester": {
      "atkSpd": 10,
      "auto": {
        "element": "physical"
      },
      "q": {
        "id": "whirlwind",
        "name": "Whirlwind",
        "visual": "Whirlwind",
        "element": "physical",
        "kind": "arc",
        "cd": 4.5,
        "power": 1.55,
        "radius": 100,
        "arc": 1.15,
        "color": "#ffd54f",
        "cost": 0,
        "desc": "A full spinning cut that carves every foe in front of you.",
        "trDesc": "Önündeki bütün düşmanları biçen tam turlu bir savuruş.",
        "slot": "q",
        "defaultSlot": "q"
      },
      "e": {
        "name": "Arcane Rift",
        "element": "arcane",
        "kind": "chain",
        "cd": 4.5,
        "power": 1,
        "color": "#c77dff",
        "desc": "A technique carried over from the old travel kit.",
        "radius": 330,
        "jumps": 4,
        "chainRange": 205,
        "status": {
          "type": "shock",
          "duration": 2,
          "dps": 7
        },
        "id": "legacy_mage_q",
        "visual": "Chain Lightning",
        "tr": "Arkana Yarığı",
        "legacyFrom": "mage.q",
        "trDesc": "A technique carried over from the old travel kit.",
        "cost": 0,
        "slot": "e",
        "defaultSlot": "e"
      },
      "r": {
        "id": "meteorstorm",
        "name": "Meteor Storm",
        "visual": "Meteor Storm",
        "element": "fire",
        "magic": true,
        "kind": "meteor",
        "cd": 15,
        "power": 2.6,
        "radius": 120,
        "delay": 0.35,
        "count": 2,
        "stagger": 0.2,
        "spreadRadius": 110,
        "range": 340,
        "color": "#ff8a65",
        "status": {
          "type": "burn",
          "duration": 3,
          "dps": 14
        },
        "cost": 0,
        "desc": "Call down meteors on the marked ground, leaving burning craters.",
        "trDesc": "İşaretli yere meteorlar indir; yanan kraterler bırak.",
        "slot": "r",
        "defaultSlot": "r"
      },
      "pool": [
        {
          "id": "battlefocus",
          "name": "Battle Focus",
          "visual": "Rune Circle",
          "element": "physical",
          "kind": "buff",
          "cd": 18,
          "color": "#ffb74d",
          "cost": 2,
          "slot": null,
          "buff": {
            "stat": "attack",
            "pct": 30,
            "duration": 8
          },
          "desc": "Sharpen your focus: attack power rises for 8 seconds.",
          "trDesc": "Odağını topla: 8 saniye boyunca saldırı gücün yükselir."
        },
        {
          "id": "ironskin",
          "name": "Iron Skin",
          "visual": "",
          "element": "earth",
          "kind": "buff",
          "cd": 20,
          "color": "#b0bec5",
          "cost": 2,
          "slot": null,
          "buff": {
            "stat": "defense",
            "pct": 35,
            "duration": 8
          },
          "desc": "Harden your body: damage taken drops for 8 seconds.",
          "trDesc": "Bedenini sertleştir: 8 saniye boyunca aldığın hasar azalır."
        },
        {
          "id": "tremor",
          "name": "Tremor",
          "visual": "Earthbreaker",
          "element": "physical",
          "kind": "quake",
          "cd": 14,
          "power": 1.5,
          "radius": 130,
          "pulses": 3,
          "interval": 0.22,
          "knockback": 100,
          "color": "#a1887f",
          "cost": 2,
          "slot": null,
          "desc": "Smash the ground and send three rolling shockwaves outward.",
          "trDesc": "Yere vur; dışa doğru yayılan üç şok dalgası gönder."
        },
        {
          "id": "chainlightning",
          "name": "Chain Lightning",
          "visual": "Chain Lightning",
          "element": "lightning",
          "magic": true,
          "kind": "chain",
          "cd": 8,
          "power": 1.5,
          "radius": 320,
          "jumps": 4,
          "chainRange": 200,
          "color": "#80d8ff",
          "status": {
            "type": "shock",
            "duration": 2,
            "dps": 8
          },
          "cost": 1,
          "desc": "Lightning leaps between foes, shocking each one it touches.",
          "trDesc": "Yıldırım düşmandan düşmana sıçrar, her birini çarpar.",
          "slot": null
        },
        {
          "id": "runecircle",
          "name": "Rune Circle",
          "visual": "Rune Circle",
          "element": "arcane",
          "magic": true,
          "kind": "nova",
          "cd": 10,
          "power": 1.2,
          "radius": 120,
          "color": "#b388ff",
          "status": {
            "type": "shock",
            "duration": 2,
            "dps": 7
          },
          "cost": 2,
          "desc": "A rune circle flares under you, shocking everything standing on it.",
          "trDesc": "Altında bir rün çemberi parlar, üstündeki her şeyi çarpar.",
          "slot": null
        },
        {
          "id": "soulharvest",
          "name": "Soul Harvest",
          "visual": "Soul Harvest",
          "element": "shadow",
          "kind": "nova",
          "cd": 16,
          "power": 2.5,
          "radius": 140,
          "healPct": 12,
          "color": "#69f0ae",
          "cost": 3,
          "desc": "Rip the souls from nearby foes and drink back a share as life.",
          "trDesc": "Yakındaki düşmanların ruhunu söküp bir kısmını can olarak içine çek.",
          "slot": null
        }
      ],
      "late": [
        {
          "id": "sunfall",
          "name": "Sunfall",
          "visual": "Meteor Storm",
          "element": "fire",
          "magic": true,
          "kind": "meteor",
          "cd": 36,
          "power": 3.5,
          "radius": 165,
          "delay": 0.4,
          "count": 3,
          "stagger": 0.18,
          "spreadRadius": 150,
          "range": 360,
          "color": "#ff8a65",
          "status": {
            "type": "burn",
            "duration": 4,
            "dps": 20
          },
          "cost": 4,
          "late": true,
          "desc": "Three burning suns crash down and leave the earth ablaze.",
          "trDesc": "Üç yanan güneş yere çakılır ve toprağı tutuşturur.",
          "slot": null
        },
        {
          "id": "infernalcrown",
          "name": "Infernal Crown",
          "visual": "Inferno Burst",
          "element": "fire",
          "magic": true,
          "kind": "nova",
          "cd": 46,
          "power": 4.8,
          "radius": 200,
          "color": "#ff3d00",
          "status": {
            "type": "burn",
            "duration": 5,
            "dps": 26
          },
          "cost": 6,
          "late": true,
          "desc": "A crown of hellfire erupts around you and keeps the ground burning.",
          "trDesc": "Etrafında cehennem ateşinden bir taç patlar ve yeri yakmaya devam eder.",
          "slot": null
        }
      ],
      "legacy": {
        "q": {
          "name": "Test Strike",
          "element": "physical",
          "kind": "arc",
          "cd": 3,
          "power": 1.6,
          "color": "#9fd8ff",
          "desc": "",
          "radius": 90,
          "arc": 0.9
        },
        "e": {
          "name": "Bug Sweep",
          "element": "physical",
          "kind": "nova",
          "cd": 7,
          "power": 1.7,
          "color": "#9fd8ff",
          "desc": "",
          "radius": 115
        },
        "r": {
          "name": "Crash",
          "element": "arcane",
          "kind": "vortex",
          "cd": 15,
          "power": 3.2,
          "color": "#c77dff",
          "desc": "",
          "radius": 155,
          "duration": 2.6,
          "tick": 0.4,
          "pull": 110,
          "range": 320
        }
      }
    },
    "beastmaster": {
      "atkSpd": 9,
      "auto": {
        "element": "nature"
      },
      "q": {
        "id": "bramble",
        "name": "Bramble",
        "visual": "Thorn Snare",
        "element": "nature",
        "magic": true,
        "kind": "arc",
        "cd": 5,
        "power": 1.3,
        "radius": 95,
        "arc": 1,
        "color": "#76ff03",
        "cost": 0,
        "desc": "A lash of thorned vines sweeps the arc ahead.",
        "trDesc": "Önündeki yayı süpüren dikenli sarmaşık kamçısı.",
        "slot": "q",
        "defaultSlot": "q"
      },
      "e": {
        "id": "spiritpack",
        "name": "Spirit Pack",
        "visual": "Spirit Pack",
        "element": "nature",
        "magic": true,
        "kind": "aoe",
        "cd": 14,
        "power": 1.7,
        "radius": 120,
        "offset": 60,
        "pet": true,
        "color": "#80deea",
        "cost": 0,
        "desc": "Ghostly wolves circle the target and lunge as one.",
        "trDesc": "Hayalet kurtlar hedefin etrafında döner ve birlikte atılır.",
        "slot": "e",
        "defaultSlot": "e"
      },
      "r": {
        "id": "cyclone",
        "name": "Cyclone",
        "visual": "Cyclone",
        "element": "physical",
        "kind": "vortex",
        "cd": 9,
        "power": 1.2,
        "radius": 120,
        "duration": 2.6,
        "tick": 0.35,
        "pull": 120,
        "range": 300,
        "color": "#b0bec5",
        "cost": 0,
        "desc": "A spinning vortex drags enemies inward and shreds them.",
        "trDesc": "Dönen bir girdap düşmanları içeri çeker ve parçalar.",
        "slot": "r",
        "defaultSlot": "r"
      },
      "pool": [
        {
          "id": "thornwave",
          "name": "Thorn Wave",
          "visual": "Thorn Snare",
          "element": "nature",
          "kind": "ground",
          "cd": 14,
          "power": 0.62,
          "radius": 120,
          "duration": 4,
          "tick": 0.5,
          "color": "#81c784",
          "cost": 2,
          "slot": null,
          "status": {
            "type": "slow",
            "duration": 2,
            "slow": 0.35
          },
          "desc": "Thorns erupt from the ground and keep stinging anything standing there.",
          "trDesc": "Yerden dikenler fışkırır; orada duran her şeyi sürekli yakar."
        },
        {
          "id": "windstep",
          "name": "Wind Step",
          "visual": "",
          "element": "nature",
          "kind": "buff",
          "cd": 16,
          "color": "#a5d6a7",
          "cost": 1,
          "slot": null,
          "buff": {
            "stat": "speed",
            "pct": 35,
            "duration": 6
          },
          "desc": "Ride the wind: movement speed rises for 6 seconds.",
          "trDesc": "Rüzgâra bin: 6 saniye boyunca hareket hızın artar."
        },
        {
          "id": "spiritward",
          "name": "Spirit Ward",
          "visual": "",
          "element": "holy",
          "kind": "shield",
          "cd": 22,
          "shieldPct": 30,
          "duration": 6,
          "radius": 60,
          "color": "#ffe082",
          "cost": 2,
          "slot": null,
          "desc": "A spirit shield absorbs damage for 6 seconds.",
          "trDesc": "Ruh kalkanı 6 saniye boyunca gelen hasarı emer."
        },
        {
          "id": "umbrallash",
          "name": "Umbral Lash",
          "visual": "Shadow Grasp",
          "element": "shadow",
          "kind": "arc",
          "cd": 5,
          "power": 1.5,
          "radius": 110,
          "arc": 1.1,
          "color": "#9c4dff",
          "cost": 1,
          "desc": "A whip of shadow cuts across the foes in front of you.",
          "trDesc": "Önündeki düşmanları kesen bir gölge kamçısı.",
          "slot": null
        },
        {
          "id": "earthbreaker",
          "name": "Earthbreaker",
          "visual": "Earthbreaker",
          "element": "physical",
          "kind": "nova",
          "cd": 9,
          "power": 1.7,
          "radius": 110,
          "knockback": 120,
          "color": "#ffb74d",
          "cost": 2,
          "desc": "Slam the ground and send a shockwave through everything nearby.",
          "trDesc": "Yere vur; çevrendeki her şeyi sarsan bir şok dalgası yay.",
          "slot": null
        },
        {
          "name": "Primal Stampede",
          "element": "nature",
          "kind": "barrage",
          "cd": 13.6,
          "power": 2.93,
          "color": "#9ccc65",
          "desc": "A technique carried over from the old travel kit.",
          "count": 12,
          "interval": 0.08,
          "speed": 700,
          "radius": 10,
          "spread": 0.2,
          "pet": true,
          "knockback": 140,
          "id": "legacy_beastmaster_r",
          "visual": "Starfall",
          "tr": "Primal Stampede",
          "legacyFrom": "beastmaster.r",
          "trDesc": "A technique carried over from the old travel kit.",
          "cost": 2,
          "slot": null
        }
      ],
      "late": [
        {
          "id": "doomgavel",
          "name": "Doom Gavel",
          "visual": "Titan Fist",
          "element": "physical",
          "kind": "meteor",
          "cd": 34,
          "power": 3.4,
          "radius": 150,
          "delay": 0.45,
          "range": 340,
          "knockback": 260,
          "color": "#ffd54f",
          "cost": 4,
          "late": true,
          "desc": "A colossal gavel of stone falls from the sky and shatters the ground.",
          "trDesc": "Gökten devasa bir taş tokmak düşer ve yeri parçalar.",
          "slot": null
        },
        {
          "id": "worldbreaker",
          "name": "World Breaker",
          "visual": "Earthbreaker",
          "element": "physical",
          "kind": "nova",
          "cd": 45,
          "power": 4.6,
          "radius": 190,
          "knockback": 340,
          "color": "#ffb74d",
          "cost": 6,
          "late": true,
          "desc": "One strike cracks the world; everything around you is thrown back.",
          "trDesc": "Tek vuruş dünyayı çatlatır; çevrendeki her şey geri savrulur.",
          "slot": null
        }
      ],
      "legacy": {
        "q": {
          "name": "Savage Bite",
          "element": "nature",
          "kind": "projectile",
          "cd": 6,
          "power": 1.83,
          "color": "#9ccc65",
          "desc": "",
          "speed": 650,
          "radius": 10,
          "pet": true
        },
        "e": {
          "name": "Pack Call",
          "element": "nature",
          "kind": "nova",
          "cd": 6.8,
          "power": 1.95,
          "color": "#9ccc65",
          "desc": "",
          "radius": 134,
          "status": {
            "type": "slow",
            "duration": 2,
            "slow": 0.5
          },
          "pet": true
        },
        "r": {
          "name": "Primal Stampede",
          "element": "nature",
          "kind": "barrage",
          "cd": 13.6,
          "power": 2.93,
          "color": "#9ccc65",
          "desc": "",
          "count": 12,
          "interval": 0.08,
          "speed": 700,
          "radius": 10,
          "spread": 0.2,
          "pet": true,
          "knockback": 140
        }
      }
    },
    "anima_lorde": {
      "atkSpd": 12,
      "auto": {
        "element": "nature"
      },
      "q": {
        "id": "umbrallash",
        "name": "Umbral Lash",
        "visual": "Shadow Grasp",
        "element": "shadow",
        "kind": "arc",
        "cd": 5,
        "power": 1.5,
        "radius": 110,
        "arc": 1.1,
        "color": "#9c4dff",
        "cost": 0,
        "desc": "A whip of shadow cuts across the foes in front of you.",
        "trDesc": "Önündeki düşmanları kesen bir gölge kamçısı.",
        "slot": "q",
        "defaultSlot": "q"
      },
      "e": {
        "id": "thornsnare",
        "name": "Thorn Snare",
        "visual": "Thorn Snare",
        "element": "nature",
        "magic": true,
        "kind": "ground",
        "cd": 8,
        "power": 1,
        "radius": 90,
        "duration": 2.2,
        "tick": 0.4,
        "range": 280,
        "color": "#76ff03",
        "status": {
          "type": "freeze",
          "duration": 1.4
        },
        "cost": 0,
        "desc": "Thorned vines erupt and root everything in the area.",
        "trDesc": "Dikenli sarmaşıklar fışkırır ve alandaki her şeyi kökler.",
        "slot": "e",
        "defaultSlot": "e"
      },
      "r": {
        "id": "spiritpack",
        "name": "Spirit Pack",
        "visual": "Spirit Pack",
        "element": "nature",
        "magic": true,
        "kind": "aoe",
        "cd": 14,
        "power": 1.7,
        "radius": 120,
        "offset": 60,
        "pet": true,
        "color": "#80deea",
        "cost": 0,
        "desc": "Ghostly wolves circle the target and lunge as one.",
        "trDesc": "Hayalet kurtlar hedefin etrafında döner ve birlikte atılır.",
        "slot": "r",
        "defaultSlot": "r"
      },
      "pool": [
        {
          "id": "shadowveil",
          "name": "Shadow Veil",
          "visual": "Dimension Rift",
          "element": "shadow",
          "kind": "teleport",
          "cd": 10,
          "power": 0.9,
          "range": 200,
          "radius": 70,
          "color": "#9575cd",
          "cost": 2,
          "slot": null,
          "desc": "Melt into shadow and reappear a short distance away.",
          "trDesc": "Gölgeye karışıp kısa bir mesafe öteye belir."
        },
        {
          "id": "frostbite",
          "name": "Frostbite",
          "visual": "",
          "element": "frost",
          "kind": "projectile",
          "cd": 6,
          "power": 1.4,
          "speed": 660,
          "radius": 10,
          "color": "#81d4fa",
          "cost": 1,
          "slot": null,
          "status": {
            "type": "slow",
            "duration": 2,
            "slow": 0.45
          },
          "desc": "Hurl a shard of ice that chills and slows the target.",
          "trDesc": "Hedefi üşütüp yavaşlatan bir buz kırığı fırlat."
        },
        {
          "id": "ironskin",
          "name": "Iron Skin",
          "visual": "",
          "element": "earth",
          "kind": "buff",
          "cd": 20,
          "color": "#b0bec5",
          "cost": 2,
          "slot": null,
          "buff": {
            "stat": "defense",
            "pct": 35,
            "duration": 8
          },
          "desc": "Harden your body: damage taken drops for 8 seconds.",
          "trDesc": "Bedenini sertleştir: 8 saniye boyunca aldığın hasar azalır."
        },
        {
          "id": "treeoflife",
          "name": "Tree of Life",
          "visual": "Tree of Life",
          "element": "nature",
          "magic": true,
          "kind": "heal",
          "cd": 16,
          "healPct": 30,
          "radius": 120,
          "color": "#69f0ae",
          "power": 0,
          "cost": 3,
          "desc": "A great tree blooms and pours healing light over the ground.",
          "trDesc": "Ulu bir ağaç açar ve yere şifa ışığı döker.",
          "slot": null
        },
        {
          "name": "Wild Hunt",
          "element": "nature",
          "kind": "orbit",
          "cd": 14.5,
          "power": 3.9,
          "color": "#9ccc65",
          "desc": "A technique carried over from the old travel kit.",
          "radius": 146,
          "duration": 3.6,
          "tick": 0.35,
          "count": 9,
          "speed": 4,
          "id": "legacy_anima_lorde_r",
          "visual": "Blade Storm",
          "tr": "Wild Hunt",
          "legacyFrom": "anima_lorde.r",
          "trDesc": "A technique carried over from the old travel kit.",
          "cost": 3,
          "slot": null
        }
      ],
      "late": [
        {
          "id": "primordialgrove",
          "name": "Primordial Grove",
          "visual": "Tree of Life",
          "element": "nature",
          "magic": true,
          "kind": "heal",
          "cd": 30,
          "healPct": 55,
          "shieldPct": 20,
          "duration": 6,
          "radius": 150,
          "color": "#69f0ae",
          "cost": 4,
          "late": true,
          "power": 0,
          "desc": "An ancient grove blooms around you, pouring life into every wound.",
          "trDesc": "Etrafında kadim bir koru açar, her yaraya can döker.",
          "slot": null
        },
        {
          "id": "verdantwrath",
          "name": "Verdant Wrath",
          "visual": "Thorn Snare",
          "element": "nature",
          "magic": true,
          "kind": "ground",
          "cd": 44,
          "power": 4.6,
          "radius": 200,
          "duration": 4,
          "tick": 0.35,
          "range": 340,
          "color": "#76ff03",
          "status": {
            "type": "freeze",
            "duration": 1.8
          },
          "cost": 6,
          "late": true,
          "desc": "The wilds rise up: thorns, roots and rot devour the marked land.",
          "trDesc": "Yaban ayaklanır: dikenler, kökler ve çürük işaretli toprağı yutar.",
          "slot": null
        }
      ],
      "legacy": {
        "q": {
          "name": "Spirit Bolt",
          "element": "nature",
          "kind": "projectile",
          "cd": 6,
          "power": 2.07,
          "color": "#9ccc65",
          "desc": "",
          "speed": 660,
          "radius": 10
        },
        "e": {
          "name": "Anima Shield",
          "element": "nature",
          "kind": "shield",
          "cd": 8.5,
          "power": 0,
          "color": "#9ccc65",
          "desc": "",
          "shieldPct": 24,
          "duration": 5,
          "healPct": 10
        },
        "r": {
          "name": "Wild Hunt",
          "element": "nature",
          "kind": "orbit",
          "cd": 14.5,
          "power": 3.9,
          "color": "#9ccc65",
          "desc": "",
          "radius": 146,
          "duration": 3.6,
          "tick": 0.35,
          "count": 9,
          "speed": 4
        }
      }
    },
    "rootbinder": {
      "atkSpd": 14,
      "auto": {
        "element": "nature"
      },
      "q": {
        "id": "bramble",
        "name": "Bramble",
        "visual": "Thorn Snare",
        "element": "nature",
        "magic": true,
        "kind": "arc",
        "cd": 5,
        "power": 1.3,
        "radius": 95,
        "arc": 1,
        "color": "#76ff03",
        "cost": 0,
        "desc": "A lash of thorned vines sweeps the arc ahead.",
        "trDesc": "Önündeki yayı süpüren dikenli sarmaşık kamçısı.",
        "slot": "q",
        "defaultSlot": "q"
      },
      "e": {
        "id": "thornsnare",
        "name": "Thorn Snare",
        "visual": "Thorn Snare",
        "element": "nature",
        "magic": true,
        "kind": "ground",
        "cd": 8,
        "power": 1,
        "radius": 90,
        "duration": 2.2,
        "tick": 0.4,
        "range": 280,
        "color": "#76ff03",
        "status": {
          "type": "freeze",
          "duration": 1.4
        },
        "cost": 0,
        "desc": "Thorned vines erupt and root everything in the area.",
        "trDesc": "Dikenli sarmaşıklar fışkırır ve alandaki her şeyi kökler.",
        "slot": "e",
        "defaultSlot": "e"
      },
      "r": {
        "id": "treeoflife",
        "name": "Tree of Life",
        "visual": "Tree of Life",
        "element": "nature",
        "magic": true,
        "kind": "heal",
        "cd": 16,
        "healPct": 30,
        "radius": 120,
        "color": "#69f0ae",
        "power": 0,
        "cost": 0,
        "desc": "A great tree blooms and pours healing light over the ground.",
        "trDesc": "Ulu bir ağaç açar ve yere şifa ışığı döker.",
        "slot": "r",
        "defaultSlot": "r"
      },
      "pool": [
        {
          "id": "thornwave",
          "name": "Thorn Wave",
          "visual": "Thorn Snare",
          "element": "nature",
          "kind": "ground",
          "cd": 14,
          "power": 0.62,
          "radius": 120,
          "duration": 4,
          "tick": 0.5,
          "color": "#81c784",
          "cost": 2,
          "slot": null,
          "status": {
            "type": "slow",
            "duration": 2,
            "slow": 0.35
          },
          "desc": "Thorns erupt from the ground and keep stinging anything standing there.",
          "trDesc": "Yerden dikenler fışkırır; orada duran her şeyi sürekli yakar."
        },
        {
          "id": "windstep",
          "name": "Wind Step",
          "visual": "",
          "element": "nature",
          "kind": "buff",
          "cd": 16,
          "color": "#a5d6a7",
          "cost": 1,
          "slot": null,
          "buff": {
            "stat": "speed",
            "pct": 35,
            "duration": 6
          },
          "desc": "Ride the wind: movement speed rises for 6 seconds.",
          "trDesc": "Rüzgâra bin: 6 saniye boyunca hareket hızın artar."
        },
        {
          "id": "spiritward",
          "name": "Spirit Ward",
          "visual": "",
          "element": "holy",
          "kind": "shield",
          "cd": 22,
          "shieldPct": 30,
          "duration": 6,
          "radius": 60,
          "color": "#ffe082",
          "cost": 2,
          "slot": null,
          "desc": "A spirit shield absorbs damage for 6 seconds.",
          "trDesc": "Ruh kalkanı 6 saniye boyunca gelen hasarı emer."
        },
        {
          "id": "toxiccloud",
          "name": "Toxic Cloud",
          "visual": "Toxic Cloud",
          "element": "nature",
          "magic": true,
          "kind": "ground",
          "cd": 8,
          "power": 1.1,
          "radius": 100,
          "duration": 3,
          "tick": 0.5,
          "dot": 10,
          "range": 300,
          "color": "#7cb342",
          "cost": 1,
          "desc": "A lingering cloud of poison that eats away at anything inside.",
          "trDesc": "İçindeki her şeyi kemiren, kalıcı bir zehir bulutu.",
          "slot": null
        },
        {
          "id": "bonecage",
          "name": "Bone Cage",
          "visual": "Bone Cage",
          "element": "shadow",
          "kind": "ground",
          "cd": 12,
          "power": 1.4,
          "radius": 95,
          "duration": 2.4,
          "tick": 0.4,
          "color": "#d8d0b8",
          "status": {
            "type": "freeze",
            "duration": 1.2
          },
          "cost": 2,
          "desc": "Bones erupt around the target and lock it in place while they cut.",
          "trDesc": "Hedefin çevresinde kemikler yükselir, onu yerinde kilitler.",
          "slot": null
        },
        {
          "name": "Overgrowth",
          "element": "nature",
          "kind": "ground",
          "cd": 13.6,
          "power": 3.54,
          "color": "#9ccc65",
          "desc": "A technique carried over from the old travel kit.",
          "radius": 179,
          "duration": 4,
          "tick": 0.45,
          "status": {
            "type": "root",
            "duration": 1.6
          },
          "dot": 14,
          "range": 340,
          "id": "legacy_rootbinder_r",
          "visual": "Toxic Cloud",
          "tr": "Overgrowth",
          "legacyFrom": "rootbinder.r",
          "trDesc": "A technique carried over from the old travel kit.",
          "cost": 2,
          "slot": null
        }
      ],
      "late": [
        {
          "id": "primordialgrove",
          "name": "Primordial Grove",
          "visual": "Tree of Life",
          "element": "nature",
          "magic": true,
          "kind": "heal",
          "cd": 30,
          "healPct": 55,
          "shieldPct": 20,
          "duration": 6,
          "radius": 150,
          "color": "#69f0ae",
          "cost": 4,
          "late": true,
          "power": 0,
          "desc": "An ancient grove blooms around you, pouring life into every wound.",
          "trDesc": "Etrafında kadim bir koru açar, her yaraya can döker.",
          "slot": null
        },
        {
          "id": "verdantwrath",
          "name": "Verdant Wrath",
          "visual": "Thorn Snare",
          "element": "nature",
          "magic": true,
          "kind": "ground",
          "cd": 44,
          "power": 4.6,
          "radius": 200,
          "duration": 4,
          "tick": 0.35,
          "range": 340,
          "color": "#76ff03",
          "status": {
            "type": "freeze",
            "duration": 1.8
          },
          "cost": 6,
          "late": true,
          "desc": "The wilds rise up: thorns, roots and rot devour the marked land.",
          "trDesc": "Yaban ayaklanır: dikenler, kökler ve çürük işaretli toprağı yutar.",
          "slot": null
        }
      ],
      "legacy": {
        "q": {
          "name": "Thorn Lance",
          "element": "nature",
          "kind": "beam",
          "cd": 6,
          "power": 2.07,
          "color": "#9ccc65",
          "desc": "",
          "range": 242,
          "width": 26
        },
        "e": {
          "name": "Grasping Roots",
          "element": "nature",
          "kind": "ground",
          "cd": 7.7,
          "power": 1.22,
          "color": "#9ccc65",
          "desc": "",
          "radius": 92,
          "duration": 3,
          "tick": 0.5,
          "status": {
            "type": "root",
            "duration": 2.4
          },
          "dot": 11,
          "range": 340
        },
        "r": {
          "name": "Overgrowth",
          "element": "nature",
          "kind": "ground",
          "cd": 13.6,
          "power": 3.54,
          "color": "#9ccc65",
          "desc": "",
          "radius": 179,
          "duration": 4,
          "tick": 0.45,
          "status": {
            "type": "root",
            "duration": 1.6
          },
          "dot": 14,
          "range": 340
        }
      }
    },
    "lifeweaver": {
      "atkSpd": -2,
      "auto": {
        "element": "holy",
        "magic": true
      },
      "q": {
        "id": "mendinglight",
        "name": "Mending Light",
        "visual": "Healing Rain",
        "element": "holy",
        "magic": true,
        "kind": "heal",
        "cd": 6,
        "healPct": 10,
        "radius": 70,
        "color": "#69f0ae",
        "power": 0,
        "cost": 0,
        "desc": "A soft light mends a small amount of health.",
        "trDesc": "Yumuşak bir ışık az miktarda can onarır.",
        "slot": "q",
        "defaultSlot": "q"
      },
      "e": {
        "id": "healingrain",
        "name": "Healing Rain",
        "visual": "Healing Rain",
        "element": "holy",
        "magic": true,
        "kind": "heal",
        "cd": 9,
        "healPct": 18,
        "radius": 90,
        "color": "#69f0ae",
        "power": 0,
        "cost": 0,
        "desc": "Warm rain falls and knits your wounds shut.",
        "trDesc": "Ilık bir yağmur yağar ve yaralarını kapatır.",
        "slot": "e",
        "defaultSlot": "e"
      },
      "r": {
        "id": "treeoflife",
        "name": "Tree of Life",
        "visual": "Tree of Life",
        "element": "nature",
        "magic": true,
        "kind": "heal",
        "cd": 16,
        "healPct": 30,
        "radius": 120,
        "color": "#69f0ae",
        "power": 0,
        "cost": 0,
        "desc": "A great tree blooms and pours healing light over the ground.",
        "trDesc": "Ulu bir ağaç açar ve yere şifa ışığı döker.",
        "slot": "r",
        "defaultSlot": "r"
      },
      "pool": [
        {
          "id": "spiritward",
          "name": "Spirit Ward",
          "visual": "",
          "element": "holy",
          "kind": "shield",
          "cd": 22,
          "shieldPct": 30,
          "duration": 6,
          "radius": 60,
          "color": "#ffe082",
          "cost": 2,
          "slot": null,
          "desc": "A spirit shield absorbs damage for 6 seconds.",
          "trDesc": "Ruh kalkanı 6 saniye boyunca gelen hasarı emer."
        },
        {
          "id": "battlefocus",
          "name": "Battle Focus",
          "visual": "Rune Circle",
          "element": "physical",
          "kind": "buff",
          "cd": 18,
          "color": "#ffb74d",
          "cost": 2,
          "slot": null,
          "buff": {
            "stat": "attack",
            "pct": 30,
            "duration": 8
          },
          "desc": "Sharpen your focus: attack power rises for 8 seconds.",
          "trDesc": "Odağını topla: 8 saniye boyunca saldırı gücün yükselir."
        },
        {
          "id": "ironskin",
          "name": "Iron Skin",
          "visual": "",
          "element": "earth",
          "kind": "buff",
          "cd": 20,
          "color": "#b0bec5",
          "cost": 2,
          "slot": null,
          "buff": {
            "stat": "defense",
            "pct": 35,
            "duration": 8
          },
          "desc": "Harden your body: damage taken drops for 8 seconds.",
          "trDesc": "Bedenini sertleştir: 8 saniye boyunca aldığın hasar azalır."
        },
        {
          "id": "phoenixrebirth",
          "name": "Phoenix Rebirth",
          "visual": "Phoenix Rebirth",
          "element": "holy",
          "magic": true,
          "kind": "heal",
          "cd": 22,
          "healPct": 45,
          "radius": 110,
          "shieldPct": 12,
          "duration": 5,
          "color": "#ff8f00",
          "power": 0,
          "cost": 3,
          "desc": "A phoenix rises from you, restoring a great amount of health.",
          "trDesc": "İçinden bir anka yükselir, büyük miktarda can geri verir.",
          "slot": null
        },
        {
          "id": "runeseal",
          "name": "Rune Seal",
          "visual": "Rune Circle",
          "element": "arcane",
          "magic": true,
          "kind": "shield",
          "cd": 11,
          "power": 0,
          "shieldPct": 22,
          "duration": 5,
          "color": "#b388ff",
          "cost": 2,
          "desc": "Etch a warding rune that absorbs a share of incoming damage.",
          "trDesc": "Gelen hasarın bir kısmını yutan koruyucu bir rün kaz.",
          "slot": null
        },
        {
          "id": "spiritpack",
          "name": "Spirit Pack",
          "visual": "Spirit Pack",
          "element": "nature",
          "magic": true,
          "kind": "aoe",
          "cd": 14,
          "power": 1.7,
          "radius": 120,
          "offset": 60,
          "pet": true,
          "color": "#80deea",
          "cost": 3,
          "desc": "Ghostly wolves circle the target and lunge as one.",
          "trDesc": "Hayalet kurtlar hedefin etrafında döner ve birlikte atılır.",
          "slot": null
        }
      ],
      "late": [
        {
          "id": "primordialgrove",
          "name": "Primordial Grove",
          "visual": "Tree of Life",
          "element": "nature",
          "magic": true,
          "kind": "heal",
          "cd": 30,
          "healPct": 55,
          "shieldPct": 20,
          "duration": 6,
          "radius": 150,
          "color": "#69f0ae",
          "cost": 4,
          "late": true,
          "power": 0,
          "desc": "An ancient grove blooms around you, pouring life into every wound.",
          "trDesc": "Etrafında kadim bir koru açar, her yaraya can döker.",
          "slot": null
        },
        {
          "id": "verdantwrath",
          "name": "Verdant Wrath",
          "visual": "Thorn Snare",
          "element": "nature",
          "magic": true,
          "kind": "ground",
          "cd": 44,
          "power": 4.6,
          "radius": 200,
          "duration": 4,
          "tick": 0.35,
          "range": 340,
          "color": "#76ff03",
          "status": {
            "type": "freeze",
            "duration": 1.8
          },
          "cost": 6,
          "late": true,
          "desc": "The wilds rise up: thorns, roots and rot devour the marked land.",
          "trDesc": "Yaban ayaklanır: dikenler, kökler ve çürük işaretli toprağı yutar.",
          "slot": null
        }
      ],
      "legacy": {
        "q": {
          "name": "Life Bolt",
          "element": "holy",
          "kind": "projectile",
          "cd": 6,
          "power": 1.83,
          "color": "#ffe082",
          "desc": "",
          "speed": 620,
          "radius": 10
        },
        "e": {
          "name": "Living Bark",
          "element": "nature",
          "kind": "shield",
          "cd": 7.7,
          "power": 0,
          "color": "#9ccc65",
          "desc": "",
          "shieldPct": 24,
          "duration": 5,
          "healPct": 15
        },
        "r": {
          "name": "Renewal",
          "element": "holy",
          "kind": "heal",
          "cd": 13.6,
          "power": 0,
          "color": "#ffe082",
          "desc": "",
          "healPct": 50,
          "radius": 179
        }
      }
    },
    "ultra_moderator": {
      "atkSpd": 6,
      "auto": {
        "element": "arcane",
        "magic": true
      },
      "q": {
        "id": "dimensionrift",
        "name": "Dimension Rift",
        "visual": "Dimension Rift",
        "element": "arcane",
        "magic": true,
        "kind": "teleport",
        "cd": 10,
        "power": 1.9,
        "radius": 90,
        "range": 230,
        "color": "#b388ff",
        "cost": 0,
        "desc": "Tear space and step through it, shredding everything you leave behind.",
        "trDesc": "Uzayı yırt ve içinden geç; geride bıraktığın her şeyi parçala.",
        "slot": "q",
        "defaultSlot": "q"
      },
      "e": {
        "id": "runecircle",
        "name": "Rune Circle",
        "visual": "Rune Circle",
        "element": "arcane",
        "magic": true,
        "kind": "nova",
        "cd": 10,
        "power": 1.2,
        "radius": 120,
        "color": "#b388ff",
        "status": {
          "type": "shock",
          "duration": 2,
          "dps": 7
        },
        "cost": 0,
        "desc": "A rune circle flares under you, shocking everything standing on it.",
        "trDesc": "Altında bir rün çemberi parlar, üstündeki her şeyi çarpar.",
        "slot": "e",
        "defaultSlot": "e"
      },
      "r": {
        "id": "singularity",
        "name": "Singularity",
        "visual": "Singularity",
        "element": "shadow",
        "magic": true,
        "kind": "vortex",
        "cd": 16,
        "power": 2,
        "radius": 130,
        "duration": 2.8,
        "tick": 0.4,
        "pull": 220,
        "range": 330,
        "color": "#7c4dff",
        "cost": 0,
        "desc": "Open a collapsing void that drags enemies into its core.",
        "trDesc": "Düşmanları çekirdeğine çeken, çöken bir boşluk aç.",
        "slot": "r",
        "defaultSlot": "r"
      },
      "pool": [
        {
          "id": "arcanepulse",
          "name": "Arcane Pulse",
          "visual": "",
          "element": "arcane",
          "kind": "nova",
          "cd": 8,
          "power": 1.5,
          "radius": 130,
          "knockback": 90,
          "color": "#ce93d8",
          "cost": 1,
          "slot": null,
          "desc": "Release a ring of raw magic that hurls nearby foes back.",
          "trDesc": "Çevrene ham büyü halkası sal; yakındaki düşmanları geri iter."
        },
        {
          "id": "shadowveil",
          "name": "Shadow Veil",
          "visual": "Dimension Rift",
          "element": "shadow",
          "kind": "teleport",
          "cd": 10,
          "power": 0.9,
          "range": 200,
          "radius": 70,
          "color": "#9575cd",
          "cost": 2,
          "slot": null,
          "desc": "Melt into shadow and reappear a short distance away.",
          "trDesc": "Gölgeye karışıp kısa bir mesafe öteye belir."
        },
        {
          "id": "windstep",
          "name": "Wind Step",
          "visual": "",
          "element": "nature",
          "kind": "buff",
          "cd": 16,
          "color": "#a5d6a7",
          "cost": 1,
          "slot": null,
          "buff": {
            "stat": "speed",
            "pct": 35,
            "duration": 6
          },
          "desc": "Ride the wind: movement speed rises for 6 seconds.",
          "trDesc": "Rüzgâra bin: 6 saniye boyunca hareket hızın artar."
        },
        {
          "id": "starfall",
          "name": "Starfall",
          "visual": "Starfall",
          "element": "arcane",
          "magic": true,
          "kind": "meteor",
          "cd": 17,
          "power": 2.8,
          "radius": 135,
          "delay": 0.45,
          "count": 3,
          "stagger": 0.14,
          "spreadRadius": 130,
          "range": 360,
          "color": "#ffe57f",
          "cost": 3,
          "desc": "Stars rain from the sky across a wide area.",
          "trDesc": "Gökten geniş bir alana yıldızlar yağar.",
          "slot": null
        },
        {
          "id": "judgementbeam",
          "name": "Radiant Verdict",
          "visual": "Judgement Beam",
          "element": "holy",
          "magic": true,
          "kind": "beam",
          "cd": 11,
          "power": 2.1,
          "range": 360,
          "width": 34,
          "color": "#ffe082",
          "cost": 2,
          "desc": "A wide beam of judgement that sears everything in its path.",
          "trDesc": "Yolundaki her şeyi dağlayan geniş bir hüküm ışını.",
          "slot": null
        },
        {
          "id": "chainlightning",
          "name": "Chain Lightning",
          "visual": "Chain Lightning",
          "element": "lightning",
          "magic": true,
          "kind": "chain",
          "cd": 8,
          "power": 1.5,
          "radius": 320,
          "jumps": 4,
          "chainRange": 200,
          "color": "#80d8ff",
          "status": {
            "type": "shock",
            "duration": 2,
            "dps": 8
          },
          "cost": 1,
          "desc": "Lightning leaps between foes, shocking each one it touches.",
          "trDesc": "Yıldırım düşmandan düşmana sıçrar, her birini çarpar.",
          "slot": null
        }
      ],
      "late": [
        {
          "id": "nightfall",
          "name": "Nightfall",
          "visual": "Singularity",
          "element": "shadow",
          "magic": true,
          "kind": "vortex",
          "cd": 35,
          "power": 3.3,
          "radius": 165,
          "duration": 3.2,
          "tick": 0.35,
          "pull": 280,
          "range": 350,
          "color": "#7c4dff",
          "cost": 4,
          "late": true,
          "desc": "Night collapses into a hungry void that drags enemies to its core.",
          "trDesc": "Gece, düşmanları çekirdeğine çeken aç bir boşluğa çöker.",
          "slot": null
        },
        {
          "id": "voidcrown",
          "name": "Void Crown",
          "visual": "Blood Ritual",
          "element": "shadow",
          "magic": true,
          "kind": "nova",
          "cd": 46,
          "power": 4.7,
          "radius": 200,
          "healPct": 18,
          "color": "#9c4dff",
          "cost": 6,
          "late": true,
          "desc": "A void crown detonates around you, tearing foes and feeding you their essence.",
          "trDesc": "Etrafında bir boşluk tacı patlar; düşmanı yırtar, özlerini sana verir.",
          "slot": null
        }
      ],
      "legacy": {
        "q": {
          "name": "Admin Beam",
          "element": "arcane",
          "kind": "beam",
          "cd": 6,
          "power": 2.44,
          "color": "#c77dff",
          "desc": "",
          "range": 286,
          "width": 26
        },
        "e": {
          "name": "Ban Field",
          "element": "arcane",
          "kind": "ground",
          "cd": 7.7,
          "power": 1.1,
          "color": "#c77dff",
          "desc": "",
          "radius": 103,
          "duration": 3,
          "tick": 0.5,
          "status": {
            "type": "stun",
            "duration": 0.7
          },
          "dot": 14,
          "range": 340
        },
        "r": {
          "name": "Server Crash",
          "element": "arcane",
          "kind": "quake",
          "cd": 15.3,
          "power": 4.64,
          "color": "#c77dff",
          "desc": "",
          "radius": 213,
          "pulses": 4,
          "interval": 0.18
        }
      }
    },
    "warlord": {
      "atkSpd": 2,
      "auto": {
        "element": "fire"
      },
      "q": {
        "name": "Blade Tempest",
        "element": "physical",
        "kind": "orbit",
        "cd": 16,
        "power": 2.7,
        "color": "#9fd8ff",
        "desc": "A technique carried over from the old travel kit.",
        "radius": 120,
        "duration": 3.4,
        "tick": 0.35,
        "count": 8,
        "speed": 4.4,
        "id": "legacy_warrior_r",
        "visual": "Blade Storm",
        "tr": "Bıçak Kasırgası",
        "legacyFrom": "warrior.r",
        "trDesc": "A technique carried over from the old travel kit.",
        "cost": 0,
        "slot": "q",
        "defaultSlot": "q"
      },
      "e": {
        "id": "pyre",
        "name": "Flame Pillar",
        "visual": "Flame Pillar",
        "element": "fire",
        "magic": true,
        "kind": "ground",
        "cd": 8,
        "power": 1.5,
        "radius": 70,
        "duration": 2.4,
        "tick": 0.45,
        "range": 300,
        "color": "#ff6a1a",
        "status": {
          "type": "burn",
          "duration": 2.5,
          "dps": 10
        },
        "cost": 0,
        "desc": "A pillar of flame erupts where you point and lingers.",
        "trDesc": "İşaret ettiğin yerde alev sütunu yükselir ve sürer.",
        "slot": "e",
        "defaultSlot": "e"
      },
      "r": {
        "id": "dragonsbreath",
        "name": "Dragon Breath",
        "visual": "Dragon Breath",
        "element": "fire",
        "magic": true,
        "kind": "arc",
        "cd": 14,
        "power": 2.4,
        "radius": 150,
        "arc": 1,
        "color": "#ff5a14",
        "status": {
          "type": "burn",
          "duration": 3,
          "dps": 16
        },
        "cost": 0,
        "desc": "Exhale a cone of dragonfire that sets the ground alight.",
        "trDesc": "Yeri tutuşturan bir ejder ateşi konisi püskürt.",
        "slot": "r",
        "defaultSlot": "r"
      },
      "pool": [
        {
          "id": "battlefocus",
          "name": "Battle Focus",
          "visual": "Rune Circle",
          "element": "physical",
          "kind": "buff",
          "cd": 18,
          "color": "#ffb74d",
          "cost": 2,
          "slot": null,
          "buff": {
            "stat": "attack",
            "pct": 30,
            "duration": 8
          },
          "desc": "Sharpen your focus: attack power rises for 8 seconds.",
          "trDesc": "Odağını topla: 8 saniye boyunca saldırı gücün yükselir."
        },
        {
          "id": "ironskin",
          "name": "Iron Skin",
          "visual": "",
          "element": "earth",
          "kind": "buff",
          "cd": 20,
          "color": "#b0bec5",
          "cost": 2,
          "slot": null,
          "buff": {
            "stat": "defense",
            "pct": 35,
            "duration": 8
          },
          "desc": "Harden your body: damage taken drops for 8 seconds.",
          "trDesc": "Bedenini sertleştir: 8 saniye boyunca aldığın hasar azalır."
        },
        {
          "id": "tremor",
          "name": "Tremor",
          "visual": "Earthbreaker",
          "element": "physical",
          "kind": "quake",
          "cd": 14,
          "power": 1.5,
          "radius": 130,
          "pulses": 3,
          "interval": 0.22,
          "knockback": 100,
          "color": "#a1887f",
          "cost": 2,
          "slot": null,
          "desc": "Smash the ground and send three rolling shockwaves outward.",
          "trDesc": "Yere vur; dışa doğru yayılan üç şok dalgası gönder."
        },
        {
          "id": "whirlwind",
          "name": "Whirlwind",
          "visual": "Whirlwind",
          "element": "physical",
          "kind": "arc",
          "cd": 4.5,
          "power": 1.55,
          "radius": 100,
          "arc": 1.15,
          "color": "#ffd54f",
          "cost": 1,
          "desc": "A full spinning cut that carves every foe in front of you.",
          "trDesc": "Önündeki bütün düşmanları biçen tam turlu bir savuruş.",
          "slot": null
        },
        {
          "id": "bladestorm",
          "name": "Blade Storm",
          "visual": "Blade Storm",
          "element": "physical",
          "kind": "orbit",
          "cd": 15,
          "power": 2.35,
          "radius": 118,
          "duration": 3.2,
          "tick": 0.35,
          "count": 8,
          "speed": 4.6,
          "color": "#80d8ff",
          "cost": 3,
          "desc": "Blades orbit you for three seconds, shredding anything they touch.",
          "trDesc": "Bıçaklar üç saniye etrafında döner, dokunduklarını parçalar.",
          "slot": null
        },
        {
          "id": "earthbreaker",
          "name": "Earthbreaker",
          "visual": "Earthbreaker",
          "element": "physical",
          "kind": "nova",
          "cd": 9,
          "power": 1.7,
          "radius": 110,
          "knockback": 120,
          "color": "#ffb74d",
          "cost": 2,
          "desc": "Slam the ground and send a shockwave through everything nearby.",
          "trDesc": "Yere vur; çevrendeki her şeyi sarsan bir şok dalgası yay.",
          "slot": null
        }
      ],
      "late": [
        {
          "id": "sunfall",
          "name": "Sunfall",
          "visual": "Meteor Storm",
          "element": "fire",
          "magic": true,
          "kind": "meteor",
          "cd": 36,
          "power": 3.5,
          "radius": 165,
          "delay": 0.4,
          "count": 3,
          "stagger": 0.18,
          "spreadRadius": 150,
          "range": 360,
          "color": "#ff8a65",
          "status": {
            "type": "burn",
            "duration": 4,
            "dps": 20
          },
          "cost": 4,
          "late": true,
          "desc": "Three burning suns crash down and leave the earth ablaze.",
          "trDesc": "Üç yanan güneş yere çakılır ve toprağı tutuşturur.",
          "slot": null
        },
        {
          "id": "infernalcrown",
          "name": "Infernal Crown",
          "visual": "Inferno Burst",
          "element": "fire",
          "magic": true,
          "kind": "nova",
          "cd": 46,
          "power": 4.8,
          "radius": 200,
          "color": "#ff3d00",
          "status": {
            "type": "burn",
            "duration": 5,
            "dps": 26
          },
          "cost": 6,
          "late": true,
          "desc": "A crown of hellfire erupts around you and keeps the ground burning.",
          "trDesc": "Etrafında cehennem ateşinden bir taç patlar ve yeri yakmaya devam eder.",
          "slot": null
        }
      ],
      "legacy": {
        "q": {
          "name": "Warlord Cleave",
          "element": "fire",
          "kind": "arc",
          "cd": 6,
          "power": 2.32,
          "color": "#ff8a65",
          "desc": "",
          "radius": 121,
          "arc": 1.15,
          "status": {
            "type": "burn",
            "duration": 2,
            "dps": 8
          }
        },
        "e": {
          "name": "War Banner",
          "element": "fire",
          "kind": "shield",
          "cd": 8.5,
          "power": 0,
          "color": "#ff8a65",
          "desc": "",
          "shieldPct": 20,
          "duration": 5
        },
        "r": {
          "name": "Executioner",
          "element": "fire",
          "kind": "arc",
          "cd": 13.6,
          "power": 3.9,
          "color": "#ff8a65",
          "desc": "",
          "radius": 168,
          "arc": 1.4,
          "knockback": 160,
          "status": {
            "type": "burn",
            "duration": 3,
            "dps": 20
          }
        }
      }
    },
    "warden": {
      "atkSpd": 10,
      "auto": {
        "element": "nature"
      },
      "q": {
        "id": "cyclone",
        "name": "Cyclone",
        "visual": "Cyclone",
        "element": "physical",
        "kind": "vortex",
        "cd": 9,
        "power": 1.2,
        "radius": 120,
        "duration": 2.6,
        "tick": 0.35,
        "pull": 120,
        "range": 300,
        "color": "#b0bec5",
        "cost": 0,
        "desc": "A spinning vortex drags enemies inward and shreds them.",
        "trDesc": "Dönen bir girdap düşmanları içeri çeker ve parçalar.",
        "slot": "q",
        "defaultSlot": "q"
      },
      "e": {
        "id": "blizzard",
        "name": "Blizzard",
        "visual": "Blizzard",
        "element": "frost",
        "magic": true,
        "kind": "ground",
        "cd": 16,
        "power": 1.9,
        "radius": 130,
        "duration": 3.4,
        "tick": 0.4,
        "range": 330,
        "color": "#9fe2ff",
        "status": {
          "type": "freeze",
          "duration": 0.8
        },
        "cost": 0,
        "desc": "A long-lasting snowstorm grinds away at a wide area.",
        "trDesc": "Geniş bir alanı kemiren, uzun süreli bir kar fırtınası.",
        "slot": "e",
        "defaultSlot": "e"
      },
      "r": {
        "id": "starfall",
        "name": "Starfall",
        "visual": "Starfall",
        "element": "arcane",
        "magic": true,
        "kind": "meteor",
        "cd": 17,
        "power": 2.8,
        "radius": 135,
        "delay": 0.45,
        "count": 3,
        "stagger": 0.14,
        "spreadRadius": 130,
        "range": 360,
        "color": "#ffe57f",
        "cost": 0,
        "desc": "Stars rain from the sky across a wide area.",
        "trDesc": "Gökten geniş bir alana yıldızlar yağar.",
        "slot": "r",
        "defaultSlot": "r"
      },
      "pool": [
        {
          "id": "battlefocus",
          "name": "Battle Focus",
          "visual": "Rune Circle",
          "element": "physical",
          "kind": "buff",
          "cd": 18,
          "color": "#ffb74d",
          "cost": 2,
          "slot": null,
          "buff": {
            "stat": "attack",
            "pct": 30,
            "duration": 8
          },
          "desc": "Sharpen your focus: attack power rises for 8 seconds.",
          "trDesc": "Odağını topla: 8 saniye boyunca saldırı gücün yükselir."
        },
        {
          "id": "ironskin",
          "name": "Iron Skin",
          "visual": "",
          "element": "earth",
          "kind": "buff",
          "cd": 20,
          "color": "#b0bec5",
          "cost": 2,
          "slot": null,
          "buff": {
            "stat": "defense",
            "pct": 35,
            "duration": 8
          },
          "desc": "Harden your body: damage taken drops for 8 seconds.",
          "trDesc": "Bedenini sertleştir: 8 saniye boyunca aldığın hasar azalır."
        },
        {
          "id": "tremor",
          "name": "Tremor",
          "visual": "Earthbreaker",
          "element": "physical",
          "kind": "quake",
          "cd": 14,
          "power": 1.5,
          "radius": 130,
          "pulses": 3,
          "interval": 0.22,
          "knockback": 100,
          "color": "#a1887f",
          "cost": 2,
          "slot": null,
          "desc": "Smash the ground and send three rolling shockwaves outward.",
          "trDesc": "Yere vur; dışa doğru yayılan üç şok dalgası gönder."
        },
        {
          "id": "gale",
          "name": "Gale",
          "visual": "Cyclone",
          "element": "physical",
          "kind": "vortex",
          "cd": 6,
          "power": 1,
          "radius": 100,
          "duration": 2,
          "tick": 0.35,
          "pull": 90,
          "range": 260,
          "color": "#b0bec5",
          "cost": 1,
          "desc": "A short burst of wind that pulls and cuts.",
          "trDesc": "Çeken ve kesen kısa bir rüzgâr patlaması.",
          "slot": null
        },
        {
          "id": "glaciervall",
          "name": "Glacier Wall",
          "visual": "Glacier Wall",
          "element": "frost",
          "magic": true,
          "kind": "ground",
          "cd": 11,
          "power": 1.25,
          "radius": 80,
          "duration": 2.2,
          "tick": 0.45,
          "range": 280,
          "color": "#9fe2ff",
          "status": {
            "type": "freeze",
            "duration": 1
          },
          "cost": 2,
          "desc": "Raise a wall of ice ahead that slows and cuts anything crossing it.",
          "trDesc": "Önüne geçenleri yavaşlatan ve kesen bir buz duvarı dik.",
          "slot": null
        },
        {
          "name": "Rain of Arrows",
          "element": "physical",
          "kind": "barrage",
          "cd": 15,
          "power": 2.2,
          "color": "#9fd8ff",
          "desc": "A technique carried over from the old travel kit.",
          "count": 16,
          "interval": 0.055,
          "speed": 900,
          "radius": 6,
          "spread": 0.13,
          "id": "legacy_ranger_r",
          "visual": "Starfall",
          "tr": "Ok Yağmuru",
          "legacyFrom": "ranger.r",
          "trDesc": "A technique carried over from the old travel kit.",
          "cost": 3,
          "slot": null
        }
      ],
      "late": [
        {
          "id": "astralcollapse",
          "name": "Astral Collapse",
          "visual": "Starfall",
          "element": "arcane",
          "magic": true,
          "kind": "meteor",
          "cd": 36,
          "power": 3.6,
          "radius": 165,
          "delay": 0.4,
          "count": 5,
          "stagger": 0.12,
          "spreadRadius": 160,
          "range": 370,
          "color": "#ffe57f",
          "cost": 4,
          "late": true,
          "desc": "Five collapsing stars hammer the battlefield in quick succession.",
          "trDesc": "Beş çöken yıldız art arda savaş alanını döver.",
          "slot": null
        },
        {
          "id": "arcanedominion",
          "name": "Arcane Dominion",
          "visual": "Starfall",
          "element": "arcane",
          "magic": true,
          "kind": "meteor",
          "cd": 47,
          "power": 4.9,
          "radius": 210,
          "delay": 0.5,
          "count": 7,
          "stagger": 0.1,
          "spreadRadius": 200,
          "range": 400,
          "color": "#b388ff",
          "cost": 6,
          "late": true,
          "desc": "You claim the sky: seven stars answer your call at once.",
          "trDesc": "Gökyüzünü sahiplenirsin: yedi yıldız aynı anda çağrına uyar.",
          "slot": null
        }
      ],
      "legacy": {
        "q": {
          "name": "Bramble Shot",
          "element": "nature",
          "kind": "projectile",
          "cd": 6,
          "power": 1.83,
          "color": "#9ccc65",
          "desc": "",
          "speed": 660,
          "radius": 10
        },
        "e": {
          "name": "Verdant Snare",
          "element": "nature",
          "kind": "ground",
          "cd": 6.8,
          "power": 1.22,
          "color": "#9ccc65",
          "desc": "",
          "radius": 95,
          "duration": 3,
          "tick": 0.5,
          "status": {
            "type": "root",
            "duration": 2.2
          },
          "dot": 12,
          "range": 340
        },
        "r": {
          "name": "Wildstorm",
          "element": "nature",
          "kind": "fan",
          "cd": 13.6,
          "power": 1.95,
          "color": "#9ccc65",
          "desc": "",
          "count": 10,
          "spread": 0.22,
          "speed": 760,
          "radius": 8
        }
      }
    },
    "archmage": {
      "atkSpd": 0,
      "auto": {
        "element": "arcane",
        "magic": true
      },
      "q": {
        "id": "frostnova",
        "name": "Frost Nova",
        "visual": "Frost Nova",
        "element": "frost",
        "magic": true,
        "kind": "nova",
        "cd": 8,
        "power": 1.4,
        "radius": 105,
        "color": "#80deea",
        "status": {
          "type": "freeze",
          "duration": 1.2
        },
        "cost": 0,
        "desc": "A ring of ice bursts outward and freezes what it touches.",
        "trDesc": "Dışa doğru buz halkası patlar, dokunduğunu dondurur.",
        "slot": "q",
        "defaultSlot": "q"
      },
      "e": {
        "id": "chainlightning",
        "name": "Chain Lightning",
        "visual": "Chain Lightning",
        "element": "lightning",
        "magic": true,
        "kind": "chain",
        "cd": 8,
        "power": 1.5,
        "radius": 320,
        "jumps": 4,
        "chainRange": 200,
        "color": "#80d8ff",
        "status": {
          "type": "shock",
          "duration": 2,
          "dps": 8
        },
        "cost": 0,
        "desc": "Lightning leaps between foes, shocking each one it touches.",
        "trDesc": "Yıldırım düşmandan düşmana sıçrar, her birini çarpar.",
        "slot": "e",
        "defaultSlot": "e"
      },
      "r": {
        "id": "starfall",
        "name": "Starfall",
        "visual": "Starfall",
        "element": "arcane",
        "magic": true,
        "kind": "meteor",
        "cd": 17,
        "power": 2.8,
        "radius": 135,
        "delay": 0.45,
        "count": 3,
        "stagger": 0.14,
        "spreadRadius": 130,
        "range": 360,
        "color": "#ffe57f",
        "cost": 0,
        "desc": "Stars rain from the sky across a wide area.",
        "trDesc": "Gökten geniş bir alana yıldızlar yağar.",
        "slot": "r",
        "defaultSlot": "r"
      },
      "pool": [
        {
          "id": "frostbite",
          "name": "Frostbite",
          "visual": "",
          "element": "frost",
          "kind": "projectile",
          "cd": 6,
          "power": 1.4,
          "speed": 660,
          "radius": 10,
          "color": "#81d4fa",
          "cost": 1,
          "slot": null,
          "status": {
            "type": "slow",
            "duration": 2,
            "slow": 0.45
          },
          "desc": "Hurl a shard of ice that chills and slows the target.",
          "trDesc": "Hedefi üşütüp yavaşlatan bir buz kırığı fırlat."
        },
        {
          "id": "ironskin",
          "name": "Iron Skin",
          "visual": "",
          "element": "earth",
          "kind": "buff",
          "cd": 20,
          "color": "#b0bec5",
          "cost": 2,
          "slot": null,
          "buff": {
            "stat": "defense",
            "pct": 35,
            "duration": 8
          },
          "desc": "Harden your body: damage taken drops for 8 seconds.",
          "trDesc": "Bedenini sertleştir: 8 saniye boyunca aldığın hasar azalır."
        },
        {
          "id": "spiritward",
          "name": "Spirit Ward",
          "visual": "",
          "element": "holy",
          "kind": "shield",
          "cd": 22,
          "shieldPct": 30,
          "duration": 6,
          "radius": 60,
          "color": "#ffe082",
          "cost": 2,
          "slot": null,
          "desc": "A spirit shield absorbs damage for 6 seconds.",
          "trDesc": "Ruh kalkanı 6 saniye boyunca gelen hasarı emer."
        },
        {
          "id": "meteorstorm",
          "name": "Meteor Storm",
          "visual": "Meteor Storm",
          "element": "fire",
          "magic": true,
          "kind": "meteor",
          "cd": 15,
          "power": 2.6,
          "radius": 120,
          "delay": 0.35,
          "count": 2,
          "stagger": 0.2,
          "spreadRadius": 110,
          "range": 340,
          "color": "#ff8a65",
          "status": {
            "type": "burn",
            "duration": 3,
            "dps": 14
          },
          "cost": 3,
          "desc": "Call down meteors on the marked ground, leaving burning craters.",
          "trDesc": "İşaretli yere meteorlar indir; yanan kraterler bırak.",
          "slot": null
        },
        {
          "id": "singularity",
          "name": "Singularity",
          "visual": "Singularity",
          "element": "shadow",
          "magic": true,
          "kind": "vortex",
          "cd": 16,
          "power": 2,
          "radius": 130,
          "duration": 2.8,
          "tick": 0.4,
          "pull": 220,
          "range": 330,
          "color": "#7c4dff",
          "cost": 3,
          "desc": "Open a collapsing void that drags enemies into its core.",
          "trDesc": "Düşmanları çekirdeğine çeken, çöken bir boşluk aç.",
          "slot": null
        },
        {
          "id": "blizzard",
          "name": "Blizzard",
          "visual": "Blizzard",
          "element": "frost",
          "magic": true,
          "kind": "ground",
          "cd": 16,
          "power": 1.9,
          "radius": 130,
          "duration": 3.4,
          "tick": 0.4,
          "range": 330,
          "color": "#9fe2ff",
          "status": {
            "type": "freeze",
            "duration": 0.8
          },
          "cost": 3,
          "desc": "A long-lasting snowstorm grinds away at a wide area.",
          "trDesc": "Geniş bir alanı kemiren, uzun süreli bir kar fırtınası.",
          "slot": null
        }
      ],
      "late": [
        {
          "id": "astralcollapse",
          "name": "Astral Collapse",
          "visual": "Starfall",
          "element": "arcane",
          "magic": true,
          "kind": "meteor",
          "cd": 36,
          "power": 3.6,
          "radius": 165,
          "delay": 0.4,
          "count": 5,
          "stagger": 0.12,
          "spreadRadius": 160,
          "range": 370,
          "color": "#ffe57f",
          "cost": 4,
          "late": true,
          "desc": "Five collapsing stars hammer the battlefield in quick succession.",
          "trDesc": "Beş çöken yıldız art arda savaş alanını döver.",
          "slot": null
        },
        {
          "id": "arcanedominion",
          "name": "Arcane Dominion",
          "visual": "Starfall",
          "element": "arcane",
          "magic": true,
          "kind": "meteor",
          "cd": 47,
          "power": 4.9,
          "radius": 210,
          "delay": 0.5,
          "count": 7,
          "stagger": 0.1,
          "spreadRadius": 200,
          "range": 400,
          "color": "#b388ff",
          "cost": 6,
          "late": true,
          "desc": "You claim the sky: seven stars answer your call at once.",
          "trDesc": "Gökyüzünü sahiplenirsin: yedi yıldız aynı anda çağrına uyar.",
          "slot": null
        }
      ],
      "legacy": {
        "q": {
          "name": "Arcane Lance",
          "element": "arcane",
          "kind": "chain",
          "cd": 6,
          "power": 2.26,
          "color": "#c77dff",
          "desc": "",
          "radius": 392,
          "jumps": 5,
          "chainRange": 220,
          "status": {
            "type": "shock",
            "duration": 2.5,
            "dps": 10
          }
        },
        "e": {
          "name": "Glacial Prison",
          "element": "frost",
          "kind": "vortex",
          "cd": 7.7,
          "power": 1.71,
          "color": "#8fe4ff",
          "desc": "",
          "radius": 157,
          "duration": 3,
          "tick": 0.32,
          "pull": 150,
          "status": {
            "type": "freeze",
            "duration": 2
          },
          "range": 320
        },
        "r": {
          "name": "Cataclysm",
          "element": "fire",
          "kind": "meteor",
          "cd": 15.3,
          "power": 4.27,
          "color": "#ff8a65",
          "desc": "",
          "radius": 193,
          "delay": 0.4,
          "count": 5,
          "stagger": 0.18,
          "spreadRadius": 150,
          "status": {
            "type": "burn",
            "duration": 4,
            "dps": 20
          },
          "range": 340
        }
      }
    },
    "nightblade": {
      "atkSpd": 24,
      "auto": {
        "element": "shadow"
      },
      "q": {
        "id": "umbrallash",
        "name": "Umbral Lash",
        "visual": "Shadow Grasp",
        "element": "shadow",
        "kind": "arc",
        "cd": 5,
        "power": 1.5,
        "radius": 110,
        "arc": 1.1,
        "color": "#9c4dff",
        "cost": 0,
        "desc": "A whip of shadow cuts across the foes in front of you.",
        "trDesc": "Önündeki düşmanları kesen bir gölge kamçısı.",
        "slot": "q",
        "defaultSlot": "q"
      },
      "e": {
        "id": "shadowgrasp",
        "name": "Shadow Grasp",
        "visual": "Shadow Grasp",
        "element": "shadow",
        "magic": true,
        "kind": "ground",
        "cd": 9,
        "power": 1.4,
        "radius": 95,
        "duration": 2.2,
        "tick": 0.4,
        "range": 300,
        "color": "#9c4dff",
        "status": {
          "type": "freeze",
          "duration": 1
        },
        "cost": 0,
        "desc": "Shadow tendrils burst from the ground and claw at everything.",
        "trDesc": "Yerden gölge kolları fışkırır ve her şeyi tırmalar.",
        "slot": "e",
        "defaultSlot": "e"
      },
      "r": {
        "id": "bladestorm",
        "name": "Blade Storm",
        "visual": "Blade Storm",
        "element": "physical",
        "kind": "orbit",
        "cd": 15,
        "power": 2.35,
        "radius": 118,
        "duration": 3.2,
        "tick": 0.35,
        "count": 8,
        "speed": 4.6,
        "color": "#80d8ff",
        "cost": 0,
        "desc": "Blades orbit you for three seconds, shredding anything they touch.",
        "trDesc": "Bıçaklar üç saniye etrafında döner, dokunduklarını parçalar.",
        "slot": "r",
        "defaultSlot": "r"
      },
      "pool": [
        {
          "id": "shadowveil",
          "name": "Shadow Veil",
          "visual": "Dimension Rift",
          "element": "shadow",
          "kind": "teleport",
          "cd": 10,
          "power": 0.9,
          "range": 200,
          "radius": 70,
          "color": "#9575cd",
          "cost": 2,
          "slot": null,
          "desc": "Melt into shadow and reappear a short distance away.",
          "trDesc": "Gölgeye karışıp kısa bir mesafe öteye belir."
        },
        {
          "id": "frostbite",
          "name": "Frostbite",
          "visual": "",
          "element": "frost",
          "kind": "projectile",
          "cd": 6,
          "power": 1.4,
          "speed": 660,
          "radius": 10,
          "color": "#81d4fa",
          "cost": 1,
          "slot": null,
          "status": {
            "type": "slow",
            "duration": 2,
            "slow": 0.45
          },
          "desc": "Hurl a shard of ice that chills and slows the target.",
          "trDesc": "Hedefi üşütüp yavaşlatan bir buz kırığı fırlat."
        },
        {
          "id": "ironskin",
          "name": "Iron Skin",
          "visual": "",
          "element": "earth",
          "kind": "buff",
          "cd": 20,
          "color": "#b0bec5",
          "cost": 2,
          "slot": null,
          "buff": {
            "stat": "defense",
            "pct": 35,
            "duration": 8
          },
          "desc": "Harden your body: damage taken drops for 8 seconds.",
          "trDesc": "Bedenini sertleştir: 8 saniye boyunca aldığın hasar azalır."
        },
        {
          "name": "Shadow Dance",
          "element": "shadow",
          "kind": "orbit",
          "cd": 15,
          "power": 2.6,
          "color": "#b388ff",
          "desc": "A technique carried over from the old travel kit.",
          "radius": 118,
          "duration": 3.6,
          "tick": 0.28,
          "count": 10,
          "speed": 5.2,
          "status": {
            "type": "bleed",
            "duration": 2.5,
            "dps": 9
          },
          "id": "legacy_rogue_r",
          "visual": "Blade Storm",
          "tr": "Gölge Dansı",
          "legacyFrom": "rogue.r",
          "trDesc": "A technique carried over from the old travel kit.",
          "cost": 3,
          "slot": null
        },
        {
          "id": "dimensionrift",
          "name": "Dimension Rift",
          "visual": "Dimension Rift",
          "element": "arcane",
          "magic": true,
          "kind": "teleport",
          "cd": 10,
          "power": 1.9,
          "radius": 90,
          "range": 230,
          "color": "#b388ff",
          "cost": 2,
          "desc": "Tear space and step through it, shredding everything you leave behind.",
          "trDesc": "Uzayı yırt ve içinden geç; geride bıraktığın her şeyi parçala.",
          "slot": null
        },
        {
          "id": "crimsonreap",
          "name": "Crimson Reap",
          "visual": "Crimson Reap",
          "element": "shadow",
          "kind": "arc",
          "cd": 10,
          "power": 2.2,
          "radius": 130,
          "arc": 1.4,
          "color": "#ff1744",
          "status": {
            "type": "bleed",
            "duration": 3,
            "dps": 12
          },
          "cost": 2,
          "desc": "A wide scythe of blood rips through the crowd.",
          "trDesc": "Kan orak kalabalığın içinden geçer.",
          "slot": null
        }
      ],
      "late": [
        {
          "id": "doomgavel",
          "name": "Doom Gavel",
          "visual": "Titan Fist",
          "element": "physical",
          "kind": "meteor",
          "cd": 34,
          "power": 3.4,
          "radius": 150,
          "delay": 0.45,
          "range": 340,
          "knockback": 260,
          "color": "#ffd54f",
          "cost": 4,
          "late": true,
          "desc": "A colossal gavel of stone falls from the sky and shatters the ground.",
          "trDesc": "Gökten devasa bir taş tokmak düşer ve yeri parçalar.",
          "slot": null
        },
        {
          "id": "worldbreaker",
          "name": "World Breaker",
          "visual": "Earthbreaker",
          "element": "physical",
          "kind": "nova",
          "cd": 45,
          "power": 4.6,
          "radius": 190,
          "knockback": 340,
          "color": "#ffb74d",
          "cost": 6,
          "late": true,
          "desc": "One strike cracks the world; everything around you is thrown back.",
          "trDesc": "Tek vuruş dünyayı çatlatır; çevrendeki her şey geri savrulur.",
          "slot": null
        }
      ],
      "legacy": {
        "q": {
          "name": "Umbral Slash",
          "element": "shadow",
          "kind": "arc",
          "cd": 6,
          "power": 2.44,
          "color": "#b388ff",
          "desc": "",
          "radius": 101,
          "arc": 0.85
        },
        "e": {
          "name": "Shadow Veil",
          "element": "shadow",
          "kind": "teleport",
          "cd": 6,
          "power": 2.07,
          "color": "#b388ff",
          "desc": "",
          "range": 175,
          "radius": 84
        },
        "r": {
          "name": "Nightfall",
          "element": "shadow",
          "kind": "teleport",
          "cd": 13.6,
          "power": 3.66,
          "color": "#b388ff",
          "desc": "",
          "range": 210,
          "radius": 146,
          "status": {
            "type": "stun",
            "duration": 0.5
          }
        }
      }
    },
    "crusader": {
      "atkSpd": -2,
      "auto": {
        "element": "holy"
      },
      "q": {
        "id": "whirlwind",
        "name": "Whirlwind",
        "visual": "Whirlwind",
        "element": "physical",
        "kind": "arc",
        "cd": 4.5,
        "power": 1.55,
        "radius": 100,
        "arc": 1.15,
        "color": "#ffd54f",
        "cost": 0,
        "desc": "A full spinning cut that carves every foe in front of you.",
        "trDesc": "Önündeki bütün düşmanları biçen tam turlu bir savuruş.",
        "slot": "q",
        "defaultSlot": "q"
      },
      "e": {
        "name": "Swordstorm",
        "element": "physical",
        "kind": "swing",
        "cd": 10,
        "power": 0.62,
        "color": "#9fd8ff",
        "desc": "A technique carried over from the old travel kit.",
        "radius": 122,
        "hits": 3,
        "interval": 0.2,
        "arc": 1.65,
        "status": {
          "type": "bleed",
          "duration": 2,
          "dps": 8
        },
        "id": "legacy_warrior_e",
        "visual": "Whirlwind",
        "tr": "Kılıç Fırtınası",
        "legacyFrom": "warrior.e",
        "trDesc": "A technique carried over from the old travel kit.",
        "cost": 0,
        "slot": "e",
        "defaultSlot": "e"
      },
      "r": {
        "id": "divinejudgement",
        "name": "Divine Judgement",
        "visual": "Divine Judgement",
        "element": "holy",
        "magic": true,
        "kind": "nova",
        "cd": 18,
        "power": 2.9,
        "radius": 150,
        "color": "#fff59d",
        "status": {
          "type": "stun",
          "duration": 0.8
        },
        "cost": 0,
        "desc": "Six blades of light fall around you and stun the wicked.",
        "trDesc": "Etrafına altı ışık kılıcı iner ve günahkârları sersemletir.",
        "slot": "r",
        "defaultSlot": "r"
      },
      "pool": [
        {
          "id": "battlefocus",
          "name": "Battle Focus",
          "visual": "Rune Circle",
          "element": "physical",
          "kind": "buff",
          "cd": 18,
          "color": "#ffb74d",
          "cost": 2,
          "slot": null,
          "buff": {
            "stat": "attack",
            "pct": 30,
            "duration": 8
          },
          "desc": "Sharpen your focus: attack power rises for 8 seconds.",
          "trDesc": "Odağını topla: 8 saniye boyunca saldırı gücün yükselir."
        },
        {
          "id": "ironskin",
          "name": "Iron Skin",
          "visual": "",
          "element": "earth",
          "kind": "buff",
          "cd": 20,
          "color": "#b0bec5",
          "cost": 2,
          "slot": null,
          "buff": {
            "stat": "defense",
            "pct": 35,
            "duration": 8
          },
          "desc": "Harden your body: damage taken drops for 8 seconds.",
          "trDesc": "Bedenini sertleştir: 8 saniye boyunca aldığın hasar azalır."
        },
        {
          "id": "tremor",
          "name": "Tremor",
          "visual": "Earthbreaker",
          "element": "physical",
          "kind": "quake",
          "cd": 14,
          "power": 1.5,
          "radius": 130,
          "pulses": 3,
          "interval": 0.22,
          "knockback": 100,
          "color": "#a1887f",
          "cost": 2,
          "slot": null,
          "desc": "Smash the ground and send three rolling shockwaves outward.",
          "trDesc": "Yere vur; dışa doğru yayılan üç şok dalgası gönder."
        },
        {
          "name": "Judgment",
          "element": "holy",
          "kind": "meteor",
          "cd": 16,
          "power": 2.9,
          "color": "#ffe082",
          "desc": "A technique carried over from the old travel kit.",
          "radius": 135,
          "delay": 0.4,
          "status": {
            "type": "stun",
            "duration": 0.9
          },
          "range": 340,
          "id": "legacy_paladin_r",
          "visual": "Meteor Storm",
          "tr": "Hüküm",
          "legacyFrom": "paladin.r",
          "trDesc": "A technique carried over from the old travel kit.",
          "cost": 3,
          "slot": null
        },
        {
          "id": "runeseal",
          "name": "Rune Seal",
          "visual": "Rune Circle",
          "element": "arcane",
          "magic": true,
          "kind": "shield",
          "cd": 11,
          "power": 0,
          "shieldPct": 22,
          "duration": 5,
          "color": "#b388ff",
          "cost": 2,
          "desc": "Etch a warding rune that absorbs a share of incoming damage.",
          "trDesc": "Gelen hasarın bir kısmını yutan koruyucu bir rün kaz.",
          "slot": null
        },
        {
          "id": "judgementbeam",
          "name": "Radiant Verdict",
          "visual": "Judgement Beam",
          "element": "holy",
          "magic": true,
          "kind": "beam",
          "cd": 11,
          "power": 2.1,
          "range": 360,
          "width": 34,
          "color": "#ffe082",
          "cost": 2,
          "desc": "A wide beam of judgement that sears everything in its path.",
          "trDesc": "Yolundaki her şeyi dağlayan geniş bir hüküm ışını.",
          "slot": null
        }
      ],
      "late": [
        {
          "id": "seraphsjudgement",
          "name": "Seraph's Judgement",
          "visual": "Judgement Beam",
          "element": "holy",
          "magic": true,
          "kind": "beam",
          "cd": 34,
          "power": 3.5,
          "range": 380,
          "width": 42,
          "color": "#fff59d",
          "cost": 4,
          "late": true,
          "desc": "A seraph's spear of light burns a wide path through everything.",
          "trDesc": "Bir serafın ışık mızrağı her şeyin içinden geniş bir yol yakar.",
          "slot": null
        },
        {
          "id": "eternaldawn",
          "name": "Eternal Dawn",
          "visual": "Divine Judgement",
          "element": "holy",
          "magic": true,
          "kind": "nova",
          "cd": 45,
          "power": 4.8,
          "radius": 195,
          "healPct": 22,
          "color": "#ffe082",
          "status": {
            "type": "stun",
            "duration": 1.2
          },
          "cost": 6,
          "late": true,
          "desc": "Dawn breaks all at once: foes are stunned, allies are restored.",
          "trDesc": "Şafak bir anda söker: düşmanlar sersemler, müttefikler iyileşir.",
          "slot": null
        }
      ],
      "legacy": {
        "q": {
          "name": "Crusader's Blow",
          "element": "holy",
          "kind": "arc",
          "cd": 6,
          "power": 2.2,
          "color": "#ffe082",
          "desc": "",
          "radius": 112,
          "arc": 1.05
        },
        "e": {
          "name": "Divine Aegis",
          "element": "holy",
          "kind": "shield",
          "cd": 8.5,
          "power": 0,
          "color": "#ffe082",
          "desc": "",
          "shieldPct": 30,
          "duration": 5
        },
        "r": {
          "name": "Hammerfall",
          "element": "holy",
          "kind": "arc",
          "cd": 13.6,
          "power": 3.54,
          "color": "#ffe082",
          "desc": "",
          "radius": 162,
          "arc": 1.5,
          "knockback": 150,
          "status": {
            "type": "stun",
            "duration": 0.6
          }
        }
      }
    },
    "reaper": {
      "atkSpd": 18,
      "auto": {
        "element": "shadow"
      },
      "q": {
        "id": "bloodcut",
        "name": "Blood Cut",
        "visual": "Crimson Reap",
        "element": "shadow",
        "kind": "arc",
        "cd": 5,
        "power": 1.7,
        "radius": 105,
        "arc": 0.95,
        "color": "#ff1744",
        "status": {
          "type": "bleed",
          "duration": 2.5,
          "dps": 9
        },
        "cost": 0,
        "desc": "A quick crimson slash that leaves the wound bleeding.",
        "trDesc": "Yarayı kanatır biçimde hızlı, kızıl bir kesik.",
        "slot": "q",
        "defaultSlot": "q"
      },
      "e": {
        "id": "crimsonreap",
        "name": "Crimson Reap",
        "visual": "Crimson Reap",
        "element": "shadow",
        "kind": "arc",
        "cd": 10,
        "power": 2.2,
        "radius": 130,
        "arc": 1.4,
        "color": "#ff1744",
        "status": {
          "type": "bleed",
          "duration": 3,
          "dps": 12
        },
        "cost": 0,
        "desc": "A wide scythe of blood rips through the crowd.",
        "trDesc": "Kan orak kalabalığın içinden geçer.",
        "slot": "e",
        "defaultSlot": "e"
      },
      "r": {
        "id": "soulharvest",
        "name": "Soul Harvest",
        "visual": "Soul Harvest",
        "element": "shadow",
        "kind": "nova",
        "cd": 16,
        "power": 2.5,
        "radius": 140,
        "healPct": 12,
        "color": "#69f0ae",
        "cost": 0,
        "desc": "Rip the souls from nearby foes and drink back a share as life.",
        "trDesc": "Yakındaki düşmanların ruhunu söküp bir kısmını can olarak içine çek.",
        "slot": "r",
        "defaultSlot": "r"
      },
      "pool": [
        {
          "id": "shadowveil",
          "name": "Shadow Veil",
          "visual": "Dimension Rift",
          "element": "shadow",
          "kind": "teleport",
          "cd": 10,
          "power": 0.9,
          "range": 200,
          "radius": 70,
          "color": "#9575cd",
          "cost": 2,
          "slot": null,
          "desc": "Melt into shadow and reappear a short distance away.",
          "trDesc": "Gölgeye karışıp kısa bir mesafe öteye belir."
        },
        {
          "id": "frostbite",
          "name": "Frostbite",
          "visual": "",
          "element": "frost",
          "kind": "projectile",
          "cd": 6,
          "power": 1.4,
          "speed": 660,
          "radius": 10,
          "color": "#81d4fa",
          "cost": 1,
          "slot": null,
          "status": {
            "type": "slow",
            "duration": 2,
            "slow": 0.45
          },
          "desc": "Hurl a shard of ice that chills and slows the target.",
          "trDesc": "Hedefi üşütüp yavaşlatan bir buz kırığı fırlat."
        },
        {
          "id": "ironskin",
          "name": "Iron Skin",
          "visual": "",
          "element": "earth",
          "kind": "buff",
          "cd": 20,
          "color": "#b0bec5",
          "cost": 2,
          "slot": null,
          "buff": {
            "stat": "defense",
            "pct": 35,
            "duration": 8
          },
          "desc": "Harden your body: damage taken drops for 8 seconds.",
          "trDesc": "Bedenini sertleştir: 8 saniye boyunca aldığın hasar azalır."
        },
        {
          "id": "bonecage",
          "name": "Bone Cage",
          "visual": "Bone Cage",
          "element": "shadow",
          "kind": "ground",
          "cd": 12,
          "power": 1.4,
          "radius": 95,
          "duration": 2.4,
          "tick": 0.4,
          "color": "#d8d0b8",
          "status": {
            "type": "freeze",
            "duration": 1.2
          },
          "cost": 2,
          "desc": "Bones erupt around the target and lock it in place while they cut.",
          "trDesc": "Hedefin çevresinde kemikler yükselir, onu yerinde kilitler.",
          "slot": null
        },
        {
          "id": "shadowgrasp",
          "name": "Shadow Grasp",
          "visual": "Shadow Grasp",
          "element": "shadow",
          "magic": true,
          "kind": "ground",
          "cd": 9,
          "power": 1.4,
          "radius": 95,
          "duration": 2.2,
          "tick": 0.4,
          "range": 300,
          "color": "#9c4dff",
          "status": {
            "type": "freeze",
            "duration": 1
          },
          "cost": 2,
          "desc": "Shadow tendrils burst from the ground and claw at everything.",
          "trDesc": "Yerden gölge kolları fışkırır ve her şeyi tırmalar.",
          "slot": null
        },
        {
          "name": "Scythe Storm",
          "element": "blood",
          "kind": "orbit",
          "cd": 13.6,
          "power": 3.78,
          "color": "#ff5370",
          "desc": "A technique carried over from the old travel kit.",
          "radius": 140,
          "duration": 3.4,
          "tick": 0.35,
          "count": 7,
          "speed": 4.2,
          "status": {
            "type": "bleed",
            "duration": 2,
            "dps": 10
          },
          "id": "legacy_reaper_r",
          "visual": "Blade Storm",
          "tr": "Scythe Storm",
          "legacyFrom": "reaper.r",
          "trDesc": "A technique carried over from the old travel kit.",
          "cost": 2,
          "slot": null
        }
      ],
      "late": [
        {
          "id": "nightfall",
          "name": "Nightfall",
          "visual": "Singularity",
          "element": "shadow",
          "magic": true,
          "kind": "vortex",
          "cd": 35,
          "power": 3.3,
          "radius": 165,
          "duration": 3.2,
          "tick": 0.35,
          "pull": 280,
          "range": 350,
          "color": "#7c4dff",
          "cost": 4,
          "late": true,
          "desc": "Night collapses into a hungry void that drags enemies to its core.",
          "trDesc": "Gece, düşmanları çekirdeğine çeken aç bir boşluğa çöker.",
          "slot": null
        },
        {
          "id": "voidcrown",
          "name": "Void Crown",
          "visual": "Blood Ritual",
          "element": "shadow",
          "magic": true,
          "kind": "nova",
          "cd": 46,
          "power": 4.7,
          "radius": 200,
          "healPct": 18,
          "color": "#9c4dff",
          "cost": 6,
          "late": true,
          "desc": "A void crown detonates around you, tearing foes and feeding you their essence.",
          "trDesc": "Etrafında bir boşluk tacı patlar; düşmanı yırtar, özlerini sana verir.",
          "slot": null
        }
      ],
      "legacy": {
        "q": {
          "name": "Soul Reap",
          "element": "shadow",
          "kind": "arc",
          "cd": 6,
          "power": 2.56,
          "color": "#b388ff",
          "desc": "",
          "radius": 106,
          "arc": 1.2
        },
        "e": {
          "name": "Death Grip",
          "element": "shadow",
          "kind": "beam",
          "cd": 6.8,
          "power": 2.32,
          "color": "#b388ff",
          "desc": "",
          "range": 231,
          "width": 26,
          "status": {
            "type": "slow",
            "duration": 1.8,
            "slow": 0.45
          }
        },
        "r": {
          "name": "Scythe Storm",
          "element": "blood",
          "kind": "orbit",
          "cd": 13.6,
          "power": 3.78,
          "color": "#ff5370",
          "desc": "",
          "radius": 140,
          "duration": 3.4,
          "tick": 0.35,
          "count": 7,
          "speed": 4.2,
          "status": {
            "type": "bleed",
            "duration": 2,
            "dps": 10
          }
        }
      }
    },
    "high_priest": {
      "atkSpd": -6,
      "auto": {
        "element": "holy",
        "magic": true
      },
      "q": {
        "id": "holylance",
        "name": "Judgement Beam",
        "visual": "Judgement Beam",
        "element": "holy",
        "magic": true,
        "kind": "beam",
        "cd": 7,
        "power": 1.7,
        "range": 300,
        "width": 26,
        "color": "#fff59d",
        "cost": 0,
        "desc": "A lance of holy light burns a straight line through the enemy.",
        "trDesc": "Kutsal ışıktan bir mızrak düşmanın içinden düz bir çizgi yakar.",
        "slot": "q",
        "defaultSlot": "q"
      },
      "e": {
        "id": "healingrain",
        "name": "Healing Rain",
        "visual": "Healing Rain",
        "element": "holy",
        "magic": true,
        "kind": "heal",
        "cd": 9,
        "healPct": 18,
        "radius": 90,
        "color": "#69f0ae",
        "power": 0,
        "cost": 0,
        "desc": "Warm rain falls and knits your wounds shut.",
        "trDesc": "Ilık bir yağmur yağar ve yaralarını kapatır.",
        "slot": "e",
        "defaultSlot": "e"
      },
      "r": {
        "id": "phoenixrebirth",
        "name": "Phoenix Rebirth",
        "visual": "Phoenix Rebirth",
        "element": "holy",
        "magic": true,
        "kind": "heal",
        "cd": 22,
        "healPct": 45,
        "radius": 110,
        "shieldPct": 12,
        "duration": 5,
        "color": "#ff8f00",
        "power": 0,
        "cost": 0,
        "desc": "A phoenix rises from you, restoring a great amount of health.",
        "trDesc": "İçinden bir anka yükselir, büyük miktarda can geri verir.",
        "slot": "r",
        "defaultSlot": "r"
      },
      "pool": [
        {
          "id": "spiritward",
          "name": "Spirit Ward",
          "visual": "",
          "element": "holy",
          "kind": "shield",
          "cd": 22,
          "shieldPct": 30,
          "duration": 6,
          "radius": 60,
          "color": "#ffe082",
          "cost": 2,
          "slot": null,
          "desc": "A spirit shield absorbs damage for 6 seconds.",
          "trDesc": "Ruh kalkanı 6 saniye boyunca gelen hasarı emer."
        },
        {
          "id": "battlefocus",
          "name": "Battle Focus",
          "visual": "Rune Circle",
          "element": "physical",
          "kind": "buff",
          "cd": 18,
          "color": "#ffb74d",
          "cost": 2,
          "slot": null,
          "buff": {
            "stat": "attack",
            "pct": 30,
            "duration": 8
          },
          "desc": "Sharpen your focus: attack power rises for 8 seconds.",
          "trDesc": "Odağını topla: 8 saniye boyunca saldırı gücün yükselir."
        },
        {
          "id": "ironskin",
          "name": "Iron Skin",
          "visual": "",
          "element": "earth",
          "kind": "buff",
          "cd": 20,
          "color": "#b0bec5",
          "cost": 2,
          "slot": null,
          "buff": {
            "stat": "defense",
            "pct": 35,
            "duration": 8
          },
          "desc": "Harden your body: damage taken drops for 8 seconds.",
          "trDesc": "Bedenini sertleştir: 8 saniye boyunca aldığın hasar azalır."
        },
        {
          "id": "judgementbeam",
          "name": "Radiant Verdict",
          "visual": "Judgement Beam",
          "element": "holy",
          "magic": true,
          "kind": "beam",
          "cd": 11,
          "power": 2.1,
          "range": 360,
          "width": 34,
          "color": "#ffe082",
          "cost": 2,
          "desc": "A wide beam of judgement that sears everything in its path.",
          "trDesc": "Yolundaki her şeyi dağlayan geniş bir hüküm ışını.",
          "slot": null
        },
        {
          "id": "treeoflife",
          "name": "Tree of Life",
          "visual": "Tree of Life",
          "element": "nature",
          "magic": true,
          "kind": "heal",
          "cd": 16,
          "healPct": 30,
          "radius": 120,
          "color": "#69f0ae",
          "power": 0,
          "cost": 3,
          "desc": "A great tree blooms and pours healing light over the ground.",
          "trDesc": "Ulu bir ağaç açar ve yere şifa ışığı döker.",
          "slot": null
        },
        {
          "name": "Divine Judgment",
          "element": "holy",
          "kind": "beam",
          "cd": 13.6,
          "power": 3.54,
          "color": "#ffe082",
          "desc": "A technique carried over from the old travel kit.",
          "range": 352,
          "width": 42,
          "id": "legacy_high_priest_r",
          "visual": "Judgement Beam",
          "tr": "Divine Judgment",
          "legacyFrom": "high_priest.r",
          "trDesc": "A technique carried over from the old travel kit.",
          "cost": 2,
          "slot": null
        }
      ],
      "late": [
        {
          "id": "seraphsjudgement",
          "name": "Seraph's Judgement",
          "visual": "Judgement Beam",
          "element": "holy",
          "magic": true,
          "kind": "beam",
          "cd": 34,
          "power": 3.5,
          "range": 380,
          "width": 42,
          "color": "#fff59d",
          "cost": 4,
          "late": true,
          "desc": "A seraph's spear of light burns a wide path through everything.",
          "trDesc": "Bir serafın ışık mızrağı her şeyin içinden geniş bir yol yakar.",
          "slot": null
        },
        {
          "id": "eternaldawn",
          "name": "Eternal Dawn",
          "visual": "Divine Judgement",
          "element": "holy",
          "magic": true,
          "kind": "nova",
          "cd": 45,
          "power": 4.8,
          "radius": 195,
          "healPct": 22,
          "color": "#ffe082",
          "status": {
            "type": "stun",
            "duration": 1.2
          },
          "cost": 6,
          "late": true,
          "desc": "Dawn breaks all at once: foes are stunned, allies are restored.",
          "trDesc": "Şafak bir anda söker: düşmanlar sersemler, müttefikler iyileşir.",
          "slot": null
        }
      ],
      "legacy": {
        "q": {
          "name": "Smite",
          "element": "holy",
          "kind": "projectile",
          "cd": 6,
          "power": 1.95,
          "color": "#ffe082",
          "desc": "",
          "speed": 640,
          "radius": 10
        },
        "e": {
          "name": "Blessing",
          "element": "holy",
          "kind": "shield",
          "cd": 7.7,
          "power": 0,
          "color": "#ffe082",
          "desc": "",
          "shieldPct": 22,
          "duration": 5,
          "healPct": 19
        },
        "r": {
          "name": "Divine Judgment",
          "element": "holy",
          "kind": "beam",
          "cd": 13.6,
          "power": 3.54,
          "color": "#ffe082",
          "desc": "",
          "range": 352,
          "width": 42
        }
      }
    },
    "juggernaut": {
      "atkSpd": -14,
      "auto": {
        "element": "earth"
      },
      "q": {
        "id": "earthbreaker",
        "name": "Earthbreaker",
        "visual": "Earthbreaker",
        "element": "physical",
        "kind": "nova",
        "cd": 9,
        "power": 1.7,
        "radius": 110,
        "knockback": 120,
        "color": "#ffb74d",
        "cost": 0,
        "desc": "Slam the ground and send a shockwave through everything nearby.",
        "trDesc": "Yere vur; çevrendeki her şeyi sarsan bir şok dalgası yay.",
        "slot": "q",
        "defaultSlot": "q"
      },
      "e": {
        "id": "tremor",
        "name": "Tremor",
        "visual": "Earthbreaker",
        "element": "physical",
        "kind": "quake",
        "cd": 14,
        "power": 1.5,
        "radius": 130,
        "pulses": 3,
        "interval": 0.22,
        "knockback": 100,
        "color": "#a1887f",
        "cost": 2,
        "slot": "e",
        "desc": "Smash the ground and send three rolling shockwaves outward.",
        "trDesc": "Yere vur; dışa doğru yayılan üç şok dalgası gönder.",
        "defaultSlot": "e"
      },
      "r": {
        "id": "bladestorm",
        "name": "Blade Storm",
        "visual": "Blade Storm",
        "element": "physical",
        "kind": "orbit",
        "cd": 15,
        "power": 2.35,
        "radius": 118,
        "duration": 3.2,
        "tick": 0.35,
        "count": 8,
        "speed": 4.6,
        "color": "#80d8ff",
        "cost": 0,
        "desc": "Blades orbit you for three seconds, shredding anything they touch.",
        "trDesc": "Bıçaklar üç saniye etrafında döner, dokunduklarını parçalar.",
        "slot": "r",
        "defaultSlot": "r"
      },
      "pool": [
        {
          "id": "battlefocus",
          "name": "Battle Focus",
          "visual": "Rune Circle",
          "element": "physical",
          "kind": "buff",
          "cd": 18,
          "color": "#ffb74d",
          "cost": 2,
          "slot": null,
          "buff": {
            "stat": "attack",
            "pct": 30,
            "duration": 8
          },
          "desc": "Sharpen your focus: attack power rises for 8 seconds.",
          "trDesc": "Odağını topla: 8 saniye boyunca saldırı gücün yükselir."
        },
        {
          "id": "ironskin",
          "name": "Iron Skin",
          "visual": "",
          "element": "earth",
          "kind": "buff",
          "cd": 20,
          "color": "#b0bec5",
          "cost": 2,
          "slot": null,
          "buff": {
            "stat": "defense",
            "pct": 35,
            "duration": 8
          },
          "desc": "Harden your body: damage taken drops for 8 seconds.",
          "trDesc": "Bedenini sertleştir: 8 saniye boyunca aldığın hasar azalır."
        },
        {
          "id": "bonecage",
          "name": "Bone Cage",
          "visual": "Bone Cage",
          "element": "shadow",
          "kind": "ground",
          "cd": 12,
          "power": 1.4,
          "radius": 95,
          "duration": 2.4,
          "tick": 0.4,
          "color": "#d8d0b8",
          "status": {
            "type": "freeze",
            "duration": 1.2
          },
          "cost": 2,
          "desc": "Bones erupt around the target and lock it in place while they cut.",
          "trDesc": "Hedefin çevresinde kemikler yükselir, onu yerinde kilitler.",
          "slot": null
        },
        {
          "id": "whirlwind",
          "name": "Whirlwind",
          "visual": "Whirlwind",
          "element": "physical",
          "kind": "arc",
          "cd": 4.5,
          "power": 1.55,
          "radius": 100,
          "arc": 1.15,
          "color": "#ffd54f",
          "cost": 1,
          "desc": "A full spinning cut that carves every foe in front of you.",
          "trDesc": "Önündeki bütün düşmanları biçen tam turlu bir savuruş.",
          "slot": null
        },
        {
          "name": "Earthquake",
          "element": "earth",
          "kind": "quake",
          "cd": 14.5,
          "power": 3.66,
          "color": "#c9a227",
          "desc": "A technique carried over from the old travel kit.",
          "radius": 202,
          "pulses": 4,
          "interval": 0.2,
          "knockback": 200,
          "id": "legacy_juggernaut_r",
          "visual": "Whirlwind",
          "tr": "Earthquake",
          "legacyFrom": "juggernaut.r",
          "trDesc": "A technique carried over from the old travel kit.",
          "cost": 3,
          "slot": null
        }
      ],
      "late": [
        {
          "id": "doomgavel",
          "name": "Doom Gavel",
          "visual": "Titan Fist",
          "element": "physical",
          "kind": "meteor",
          "cd": 34,
          "power": 3.4,
          "radius": 150,
          "delay": 0.45,
          "range": 340,
          "knockback": 260,
          "color": "#ffd54f",
          "cost": 4,
          "late": true,
          "desc": "A colossal gavel of stone falls from the sky and shatters the ground.",
          "trDesc": "Gökten devasa bir taş tokmak düşer ve yeri parçalar.",
          "slot": null
        },
        {
          "id": "worldbreaker",
          "name": "World Breaker",
          "visual": "Earthbreaker",
          "element": "physical",
          "kind": "nova",
          "cd": 45,
          "power": 4.6,
          "radius": 190,
          "knockback": 340,
          "color": "#ffb74d",
          "cost": 6,
          "late": true,
          "desc": "One strike cracks the world; everything around you is thrown back.",
          "trDesc": "Tek vuruş dünyayı çatlatır; çevrendeki her şey geri savrulur.",
          "slot": null
        }
      ],
      "legacy": {
        "q": {
          "name": "Crushing Blow",
          "element": "earth",
          "kind": "arc",
          "cd": 6,
          "power": 2.44,
          "color": "#c9a227",
          "desc": "",
          "radius": 118,
          "arc": 1.15
        },
        "e": {
          "name": "Fortress",
          "element": "earth",
          "kind": "shield",
          "cd": 9.4,
          "power": 0,
          "color": "#c9a227",
          "desc": "",
          "shieldPct": 42,
          "duration": 5
        },
        "r": {
          "name": "Earthquake",
          "element": "earth",
          "kind": "quake",
          "cd": 14.5,
          "power": 3.66,
          "color": "#c9a227",
          "desc": "",
          "radius": 202,
          "pulses": 4,
          "interval": 0.2,
          "knockback": 200
        }
      }
    },
    "war_emperor": {
      "atkSpd": 0,
      "auto": {
        "element": "fire"
      },
      "q": {
        "id": "dragonsbreath",
        "name": "Dragon Breath",
        "visual": "Dragon Breath",
        "element": "fire",
        "magic": true,
        "kind": "arc",
        "cd": 14,
        "power": 2.4,
        "radius": 150,
        "arc": 1,
        "color": "#ff5a14",
        "status": {
          "type": "burn",
          "duration": 3,
          "dps": 16
        },
        "cost": 0,
        "desc": "Exhale a cone of dragonfire that sets the ground alight.",
        "trDesc": "Yeri tutuşturan bir ejder ateşi konisi püskürt.",
        "slot": "q",
        "defaultSlot": "q"
      },
      "e": {
        "id": "infernoburst",
        "name": "Inferno Burst",
        "visual": "Inferno Burst",
        "element": "fire",
        "magic": true,
        "kind": "nova",
        "cd": 8.5,
        "power": 1.6,
        "radius": 100,
        "color": "#ff7a1a",
        "status": {
          "type": "burn",
          "duration": 3,
          "dps": 12
        },
        "cost": 0,
        "desc": "A ring of fire detonates around you and keeps burning.",
        "trDesc": "Etrafında bir ateş halkası patlar ve yanmaya devam eder.",
        "slot": "e",
        "defaultSlot": "e"
      },
      "r": {
        "id": "meteorstorm",
        "name": "Meteor Storm",
        "visual": "Meteor Storm",
        "element": "fire",
        "magic": true,
        "kind": "meteor",
        "cd": 15,
        "power": 2.6,
        "radius": 120,
        "delay": 0.35,
        "count": 2,
        "stagger": 0.2,
        "spreadRadius": 110,
        "range": 340,
        "color": "#ff8a65",
        "status": {
          "type": "burn",
          "duration": 3,
          "dps": 14
        },
        "cost": 0,
        "desc": "Call down meteors on the marked ground, leaving burning craters.",
        "trDesc": "İşaretli yere meteorlar indir; yanan kraterler bırak.",
        "slot": "r",
        "defaultSlot": "r"
      },
      "pool": [
        {
          "id": "flamejet",
          "name": "Flame Jet",
          "visual": "",
          "element": "fire",
          "kind": "beam",
          "cd": 9,
          "power": 1.8,
          "range": 250,
          "width": 30,
          "color": "#ff7043",
          "cost": 2,
          "slot": null,
          "desc": "Spray a searing jet of flame in a straight line.",
          "trDesc": "Düz bir hat boyunca kavurucu alev püskürt."
        },
        {
          "id": "battlefocus",
          "name": "Battle Focus",
          "visual": "Rune Circle",
          "element": "physical",
          "kind": "buff",
          "cd": 18,
          "color": "#ffb74d",
          "cost": 2,
          "slot": null,
          "buff": {
            "stat": "attack",
            "pct": 30,
            "duration": 8
          },
          "desc": "Sharpen your focus: attack power rises for 8 seconds.",
          "trDesc": "Odağını topla: 8 saniye boyunca saldırı gücün yükselir."
        },
        {
          "id": "arcanepulse",
          "name": "Arcane Pulse",
          "visual": "",
          "element": "arcane",
          "kind": "nova",
          "cd": 8,
          "power": 1.5,
          "radius": 130,
          "knockback": 90,
          "color": "#ce93d8",
          "cost": 1,
          "slot": null,
          "desc": "Release a ring of raw magic that hurls nearby foes back.",
          "trDesc": "Çevrene ham büyü halkası sal; yakındaki düşmanları geri iter."
        },
        {
          "id": "bladestorm",
          "name": "Blade Storm",
          "visual": "Blade Storm",
          "element": "physical",
          "kind": "orbit",
          "cd": 15,
          "power": 2.35,
          "radius": 118,
          "duration": 3.2,
          "tick": 0.35,
          "count": 8,
          "speed": 4.6,
          "color": "#80d8ff",
          "cost": 3,
          "desc": "Blades orbit you for three seconds, shredding anything they touch.",
          "trDesc": "Bıçaklar üç saniye etrafında döner, dokunduklarını parçalar.",
          "slot": null
        },
        {
          "name": "Worldbreaker",
          "element": "fire",
          "kind": "meteor",
          "cd": 15.3,
          "power": 4.39,
          "color": "#ff8a65",
          "desc": "A technique carried over from the old travel kit.",
          "radius": 190,
          "delay": 0.45,
          "status": {
            "type": "burn",
            "duration": 3,
            "dps": 22
          },
          "range": 340,
          "id": "legacy_war_emperor_r",
          "visual": "Meteor Storm",
          "tr": "Worldbreaker",
          "legacyFrom": "war_emperor.r",
          "trDesc": "A technique carried over from the old travel kit.",
          "cost": 3,
          "slot": null
        }
      ],
      "late": [
        {
          "id": "sunfall",
          "name": "Sunfall",
          "visual": "Meteor Storm",
          "element": "fire",
          "magic": true,
          "kind": "meteor",
          "cd": 36,
          "power": 3.5,
          "radius": 165,
          "delay": 0.4,
          "count": 3,
          "stagger": 0.18,
          "spreadRadius": 150,
          "range": 360,
          "color": "#ff8a65",
          "status": {
            "type": "burn",
            "duration": 4,
            "dps": 20
          },
          "cost": 4,
          "late": true,
          "desc": "Three burning suns crash down and leave the earth ablaze.",
          "trDesc": "Üç yanan güneş yere çakılır ve toprağı tutuşturur.",
          "slot": null
        },
        {
          "id": "infernalcrown",
          "name": "Infernal Crown",
          "visual": "Inferno Burst",
          "element": "fire",
          "magic": true,
          "kind": "nova",
          "cd": 46,
          "power": 4.8,
          "radius": 200,
          "color": "#ff3d00",
          "status": {
            "type": "burn",
            "duration": 5,
            "dps": 26
          },
          "cost": 6,
          "late": true,
          "desc": "A crown of hellfire erupts around you and keeps the ground burning.",
          "trDesc": "Etrafında cehennem ateşinden bir taç patlar ve yeri yakmaya devam eder.",
          "slot": null
        }
      ],
      "legacy": {
        "q": {
          "name": "Emperor's Edge",
          "element": "fire",
          "kind": "arc",
          "cd": 6,
          "power": 2.56,
          "color": "#ff8a65",
          "desc": "",
          "radius": 123,
          "arc": 1.1,
          "status": {
            "type": "burn",
            "duration": 2.5,
            "dps": 10
          }
        },
        "e": {
          "name": "Crown of Flame",
          "element": "fire",
          "kind": "nova",
          "cd": 7.7,
          "power": 2.32,
          "color": "#ff8a65",
          "desc": "",
          "radius": 146,
          "status": {
            "type": "burn",
            "duration": 3,
            "dps": 14
          }
        },
        "r": {
          "name": "Worldbreaker",
          "element": "fire",
          "kind": "meteor",
          "cd": 15.3,
          "power": 4.39,
          "color": "#ff8a65",
          "desc": "",
          "radius": 190,
          "delay": 0.45,
          "status": {
            "type": "burn",
            "duration": 3,
            "dps": 22
          },
          "range": 340
        }
      }
    },
    "storm_warden": {
      "atkSpd": 16,
      "auto": {
        "element": "lightning"
      },
      "q": {
        "id": "cyclone",
        "name": "Cyclone",
        "visual": "Cyclone",
        "element": "physical",
        "kind": "vortex",
        "cd": 9,
        "power": 1.2,
        "radius": 120,
        "duration": 2.6,
        "tick": 0.35,
        "pull": 120,
        "range": 300,
        "color": "#b0bec5",
        "cost": 0,
        "desc": "A spinning vortex drags enemies inward and shreds them.",
        "trDesc": "Dönen bir girdap düşmanları içeri çeker ve parçalar.",
        "slot": "q",
        "defaultSlot": "q"
      },
      "e": {
        "id": "chainlightning",
        "name": "Chain Lightning",
        "visual": "Chain Lightning",
        "element": "lightning",
        "magic": true,
        "kind": "chain",
        "cd": 8,
        "power": 1.5,
        "radius": 320,
        "jumps": 4,
        "chainRange": 200,
        "color": "#80d8ff",
        "status": {
          "type": "shock",
          "duration": 2,
          "dps": 8
        },
        "cost": 0,
        "desc": "Lightning leaps between foes, shocking each one it touches.",
        "trDesc": "Yıldırım düşmandan düşmana sıçrar, her birini çarpar.",
        "slot": "e",
        "defaultSlot": "e"
      },
      "r": {
        "id": "thunderfall",
        "name": "Thunderfall",
        "visual": "Thunderfall",
        "element": "lightning",
        "magic": true,
        "kind": "meteor",
        "cd": 12,
        "power": 2.2,
        "radius": 110,
        "delay": 0.35,
        "range": 320,
        "color": "#b388ff",
        "status": {
          "type": "stun",
          "duration": 0.5
        },
        "cost": 0,
        "desc": "A thunderbolt slams down and stuns the target area.",
        "trDesc": "Bir yıldırım iner ve hedef alanı sersemletir.",
        "slot": "r",
        "defaultSlot": "r"
      },
      "pool": [
        {
          "id": "battlefocus",
          "name": "Battle Focus",
          "visual": "Rune Circle",
          "element": "physical",
          "kind": "buff",
          "cd": 18,
          "color": "#ffb74d",
          "cost": 2,
          "slot": null,
          "buff": {
            "stat": "attack",
            "pct": 30,
            "duration": 8
          },
          "desc": "Sharpen your focus: attack power rises for 8 seconds.",
          "trDesc": "Odağını topla: 8 saniye boyunca saldırı gücün yükselir."
        },
        {
          "id": "ironskin",
          "name": "Iron Skin",
          "visual": "",
          "element": "earth",
          "kind": "buff",
          "cd": 20,
          "color": "#b0bec5",
          "cost": 2,
          "slot": null,
          "buff": {
            "stat": "defense",
            "pct": 35,
            "duration": 8
          },
          "desc": "Harden your body: damage taken drops for 8 seconds.",
          "trDesc": "Bedenini sertleştir: 8 saniye boyunca aldığın hasar azalır."
        },
        {
          "id": "tremor",
          "name": "Tremor",
          "visual": "Earthbreaker",
          "element": "physical",
          "kind": "quake",
          "cd": 14,
          "power": 1.5,
          "radius": 130,
          "pulses": 3,
          "interval": 0.22,
          "knockback": 100,
          "color": "#a1887f",
          "cost": 2,
          "slot": null,
          "desc": "Smash the ground and send three rolling shockwaves outward.",
          "trDesc": "Yere vur; dışa doğru yayılan üç şok dalgası gönder."
        },
        {
          "id": "blizzard",
          "name": "Blizzard",
          "visual": "Blizzard",
          "element": "frost",
          "magic": true,
          "kind": "ground",
          "cd": 16,
          "power": 1.9,
          "radius": 130,
          "duration": 3.4,
          "tick": 0.4,
          "range": 330,
          "color": "#9fe2ff",
          "status": {
            "type": "freeze",
            "duration": 0.8
          },
          "cost": 3,
          "desc": "A long-lasting snowstorm grinds away at a wide area.",
          "trDesc": "Geniş bir alanı kemiren, uzun süreli bir kar fırtınası.",
          "slot": null
        },
        {
          "name": "Frost Vortex",
          "element": "frost",
          "kind": "vortex",
          "cd": 9,
          "power": 1.15,
          "color": "#8fe4ff",
          "desc": "A technique carried over from the old travel kit.",
          "radius": 132,
          "duration": 2.8,
          "tick": 0.35,
          "pull": 135,
          "status": {
            "type": "freeze",
            "duration": 1.3
          },
          "range": 320,
          "knockback": 130,
          "id": "legacy_mage_e",
          "visual": "Cyclone",
          "tr": "Don Girdabı",
          "legacyFrom": "mage.e",
          "trDesc": "A technique carried over from the old travel kit.",
          "cost": 2,
          "slot": null
        },
        {
          "id": "stormcall",
          "name": "Storm Call",
          "visual": "Thunderfall",
          "element": "lightning",
          "magic": true,
          "kind": "meteor",
          "cd": 6.5,
          "power": 1.35,
          "radius": 85,
          "delay": 0.28,
          "range": 300,
          "color": "#80d8ff",
          "status": {
            "type": "shock",
            "duration": 1.5,
            "dps": 7
          },
          "cost": 1,
          "desc": "Call a quick bolt to a nearby point.",
          "trDesc": "Yakın bir noktaya hızlı bir yıldırım çağır.",
          "slot": null
        }
      ],
      "late": [
        {
          "id": "skyrend",
          "name": "Sky Rend",
          "visual": "Thunderfall",
          "element": "lightning",
          "magic": true,
          "kind": "meteor",
          "cd": 34,
          "power": 3.4,
          "radius": 155,
          "delay": 0.35,
          "range": 350,
          "color": "#b388ff",
          "status": {
            "type": "stun",
            "duration": 1
          },
          "cost": 4,
          "late": true,
          "desc": "The sky tears open and a single bolt levels the marked ground.",
          "trDesc": "Gökyüzü yırtılır ve tek bir yıldırım işaretli yeri yerle bir eder.",
          "slot": null
        },
        {
          "id": "tempestsovereign",
          "name": "Tempest Sovereign",
          "visual": "Chain Lightning",
          "element": "lightning",
          "magic": true,
          "kind": "chain",
          "cd": 44,
          "power": 4.5,
          "radius": 420,
          "jumps": 7,
          "chainRange": 230,
          "color": "#80d8ff",
          "status": {
            "type": "shock",
            "duration": 3,
            "dps": 18
          },
          "cost": 6,
          "late": true,
          "desc": "Lightning obeys you, leaping across the whole battlefield.",
          "trDesc": "Yıldırım sana itaat eder, tüm savaş alanına sıçrar.",
          "slot": null
        }
      ],
      "legacy": {
        "q": {
          "name": "Storm Arrow",
          "element": "lightning",
          "kind": "projectile",
          "cd": 6,
          "power": 2.07,
          "color": "#fff176",
          "desc": "",
          "speed": 720,
          "radius": 10
        },
        "e": {
          "name": "Thunder Cage",
          "element": "lightning",
          "kind": "ground",
          "cd": 7.7,
          "power": 1.22,
          "color": "#fff176",
          "desc": "",
          "radius": 99,
          "duration": 3,
          "tick": 0.5,
          "status": {
            "type": "shock",
            "duration": 2.4,
            "dps": 12
          },
          "dot": 10,
          "range": 340
        },
        "r": {
          "name": "Tempest",
          "element": "lightning",
          "kind": "chain",
          "cd": 13.6,
          "power": 3.66,
          "color": "#fff176",
          "desc": "",
          "radius": 381,
          "jumps": 6,
          "chainRange": 200,
          "status": {
            "type": "shock",
            "duration": 1.6
          }
        }
      }
    },
    "archon": {
      "atkSpd": 4,
      "auto": {
        "element": "arcane",
        "magic": true
      },
      "q": {
        "id": "thunderfall",
        "name": "Thunderfall",
        "visual": "Thunderfall",
        "element": "lightning",
        "magic": true,
        "kind": "meteor",
        "cd": 12,
        "power": 2.2,
        "radius": 110,
        "delay": 0.35,
        "range": 320,
        "color": "#b388ff",
        "status": {
          "type": "stun",
          "duration": 0.5
        },
        "cost": 0,
        "desc": "A thunderbolt slams down and stuns the target area.",
        "trDesc": "Bir yıldırım iner ve hedef alanı sersemletir.",
        "slot": "q",
        "defaultSlot": "q"
      },
      "e": {
        "id": "starfall",
        "name": "Starfall",
        "visual": "Starfall",
        "element": "arcane",
        "magic": true,
        "kind": "meteor",
        "cd": 17,
        "power": 2.8,
        "radius": 135,
        "delay": 0.45,
        "count": 3,
        "stagger": 0.14,
        "spreadRadius": 130,
        "range": 360,
        "color": "#ffe57f",
        "cost": 0,
        "desc": "Stars rain from the sky across a wide area.",
        "trDesc": "Gökten geniş bir alana yıldızlar yağar.",
        "slot": "e",
        "defaultSlot": "e"
      },
      "r": {
        "id": "divinejudgement",
        "name": "Divine Judgement",
        "visual": "Divine Judgement",
        "element": "holy",
        "magic": true,
        "kind": "nova",
        "cd": 18,
        "power": 2.9,
        "radius": 150,
        "color": "#fff59d",
        "status": {
          "type": "stun",
          "duration": 0.8
        },
        "cost": 0,
        "desc": "Six blades of light fall around you and stun the wicked.",
        "trDesc": "Etrafına altı ışık kılıcı iner ve günahkârları sersemletir.",
        "slot": "r",
        "defaultSlot": "r"
      },
      "pool": [
        {
          "id": "stormlash",
          "name": "Storm Lash",
          "visual": "Chain Lightning",
          "element": "lightning",
          "kind": "chain",
          "cd": 12,
          "power": 1.6,
          "radius": 300,
          "jumps": 4,
          "chainRange": 190,
          "color": "#4fc3f7",
          "cost": 2,
          "slot": null,
          "desc": "Lightning arcs from foe to foe, striking up to four enemies.",
          "trDesc": "Şimşek düşmandan düşmana atlar; en fazla dört hedefe çarpar."
        },
        {
          "id": "windstep",
          "name": "Wind Step",
          "visual": "",
          "element": "nature",
          "kind": "buff",
          "cd": 16,
          "color": "#a5d6a7",
          "cost": 1,
          "slot": null,
          "buff": {
            "stat": "speed",
            "pct": 35,
            "duration": 6
          },
          "desc": "Ride the wind: movement speed rises for 6 seconds.",
          "trDesc": "Rüzgâra bin: 6 saniye boyunca hareket hızın artar."
        },
        {
          "id": "arcanepulse",
          "name": "Arcane Pulse",
          "visual": "",
          "element": "arcane",
          "kind": "nova",
          "cd": 8,
          "power": 1.5,
          "radius": 130,
          "knockback": 90,
          "color": "#ce93d8",
          "cost": 1,
          "slot": null,
          "desc": "Release a ring of raw magic that hurls nearby foes back.",
          "trDesc": "Çevrene ham büyü halkası sal; yakındaki düşmanları geri iter."
        },
        {
          "id": "dimensionrift",
          "name": "Dimension Rift",
          "visual": "Dimension Rift",
          "element": "arcane",
          "magic": true,
          "kind": "teleport",
          "cd": 10,
          "power": 1.9,
          "radius": 90,
          "range": 230,
          "color": "#b388ff",
          "cost": 2,
          "desc": "Tear space and step through it, shredding everything you leave behind.",
          "trDesc": "Uzayı yırt ve içinden geç; geride bıraktığın her şeyi parçala.",
          "slot": null
        },
        {
          "id": "chainlightning",
          "name": "Chain Lightning",
          "visual": "Chain Lightning",
          "element": "lightning",
          "magic": true,
          "kind": "chain",
          "cd": 8,
          "power": 1.5,
          "radius": 320,
          "jumps": 4,
          "chainRange": 200,
          "color": "#80d8ff",
          "status": {
            "type": "shock",
            "duration": 2,
            "dps": 8
          },
          "cost": 1,
          "desc": "Lightning leaps between foes, shocking each one it touches.",
          "trDesc": "Yıldırım düşmandan düşmana sıçrar, her birini çarpar.",
          "slot": null
        },
        {
          "id": "judgementbeam",
          "name": "Radiant Verdict",
          "visual": "Judgement Beam",
          "element": "holy",
          "magic": true,
          "kind": "beam",
          "cd": 11,
          "power": 2.1,
          "range": 360,
          "width": 34,
          "color": "#ffe082",
          "cost": 2,
          "desc": "A wide beam of judgement that sears everything in its path.",
          "trDesc": "Yolundaki her şeyi dağlayan geniş bir hüküm ışını.",
          "slot": null
        }
      ],
      "late": [
        {
          "id": "seraphsjudgement",
          "name": "Seraph's Judgement",
          "visual": "Judgement Beam",
          "element": "holy",
          "magic": true,
          "kind": "beam",
          "cd": 34,
          "power": 3.5,
          "range": 380,
          "width": 42,
          "color": "#fff59d",
          "cost": 4,
          "late": true,
          "desc": "A seraph's spear of light burns a wide path through everything.",
          "trDesc": "Bir serafın ışık mızrağı her şeyin içinden geniş bir yol yakar.",
          "slot": null
        },
        {
          "id": "eternaldawn",
          "name": "Eternal Dawn",
          "visual": "Divine Judgement",
          "element": "holy",
          "magic": true,
          "kind": "nova",
          "cd": 45,
          "power": 4.8,
          "radius": 195,
          "healPct": 22,
          "color": "#ffe082",
          "status": {
            "type": "stun",
            "duration": 1.2
          },
          "cost": 6,
          "late": true,
          "desc": "Dawn breaks all at once: foes are stunned, allies are restored.",
          "trDesc": "Şafak bir anda söker: düşmanlar sersemler, müttefikler iyileşir.",
          "slot": null
        }
      ],
      "legacy": {
        "q": {
          "name": "Arcane Spear",
          "element": "arcane",
          "kind": "beam",
          "cd": 6,
          "power": 2.32,
          "color": "#c77dff",
          "desc": "",
          "range": 281,
          "width": 26
        },
        "e": {
          "name": "Chrono Field",
          "element": "arcane",
          "kind": "ground",
          "cd": 8.5,
          "power": 1.1,
          "color": "#c77dff",
          "desc": "",
          "radius": 106,
          "duration": 3,
          "tick": 0.5,
          "status": {
            "type": "slow",
            "duration": 2.6,
            "slow": 0.35
          },
          "dot": 10,
          "range": 340
        },
        "r": {
          "name": "Singularity",
          "element": "arcane",
          "kind": "vortex",
          "cd": 15.3,
          "power": 4.27,
          "color": "#c77dff",
          "desc": "",
          "radius": 179,
          "duration": 2.8,
          "tick": 0.4,
          "pull": 150,
          "range": 320
        }
      }
    },
    "shade_king": {
      "atkSpd": 20,
      "auto": {
        "element": "shadow"
      },
      "q": {
        "id": "shadowgrasp",
        "name": "Shadow Grasp",
        "visual": "Shadow Grasp",
        "element": "shadow",
        "magic": true,
        "kind": "ground",
        "cd": 9,
        "power": 1.4,
        "radius": 95,
        "duration": 2.2,
        "tick": 0.4,
        "range": 300,
        "color": "#9c4dff",
        "status": {
          "type": "freeze",
          "duration": 1
        },
        "cost": 0,
        "desc": "Shadow tendrils burst from the ground and claw at everything.",
        "trDesc": "Yerden gölge kolları fışkırır ve her şeyi tırmalar.",
        "slot": "q",
        "defaultSlot": "q"
      },
      "e": {
        "id": "singularity",
        "name": "Singularity",
        "visual": "Singularity",
        "element": "shadow",
        "magic": true,
        "kind": "vortex",
        "cd": 16,
        "power": 2,
        "radius": 130,
        "duration": 2.8,
        "tick": 0.4,
        "pull": 220,
        "range": 330,
        "color": "#7c4dff",
        "cost": 0,
        "desc": "Open a collapsing void that drags enemies into its core.",
        "trDesc": "Düşmanları çekirdeğine çeken, çöken bir boşluk aç.",
        "slot": "e",
        "defaultSlot": "e"
      },
      "r": {
        "id": "dimensionrift",
        "name": "Dimension Rift",
        "visual": "Dimension Rift",
        "element": "arcane",
        "magic": true,
        "kind": "teleport",
        "cd": 10,
        "power": 1.9,
        "radius": 90,
        "range": 230,
        "color": "#b388ff",
        "cost": 0,
        "desc": "Tear space and step through it, shredding everything you leave behind.",
        "trDesc": "Uzayı yırt ve içinden geç; geride bıraktığın her şeyi parçala.",
        "slot": "r",
        "defaultSlot": "r"
      },
      "pool": [
        {
          "id": "shadowveil",
          "name": "Shadow Veil",
          "visual": "Dimension Rift",
          "element": "shadow",
          "kind": "teleport",
          "cd": 10,
          "power": 0.9,
          "range": 200,
          "radius": 70,
          "color": "#9575cd",
          "cost": 2,
          "slot": null,
          "desc": "Melt into shadow and reappear a short distance away.",
          "trDesc": "Gölgeye karışıp kısa bir mesafe öteye belir."
        },
        {
          "id": "frostbite",
          "name": "Frostbite",
          "visual": "",
          "element": "frost",
          "kind": "projectile",
          "cd": 6,
          "power": 1.4,
          "speed": 660,
          "radius": 10,
          "color": "#81d4fa",
          "cost": 1,
          "slot": null,
          "status": {
            "type": "slow",
            "duration": 2,
            "slow": 0.45
          },
          "desc": "Hurl a shard of ice that chills and slows the target.",
          "trDesc": "Hedefi üşütüp yavaşlatan bir buz kırığı fırlat."
        },
        {
          "id": "ironskin",
          "name": "Iron Skin",
          "visual": "",
          "element": "earth",
          "kind": "buff",
          "cd": 20,
          "color": "#b0bec5",
          "cost": 2,
          "slot": null,
          "buff": {
            "stat": "defense",
            "pct": 35,
            "duration": 8
          },
          "desc": "Harden your body: damage taken drops for 8 seconds.",
          "trDesc": "Bedenini sertleştir: 8 saniye boyunca aldığın hasar azalır."
        },
        {
          "name": "Arcane Rift",
          "element": "arcane",
          "kind": "chain",
          "cd": 4.5,
          "power": 1,
          "color": "#c77dff",
          "desc": "A technique carried over from the old travel kit.",
          "radius": 330,
          "jumps": 4,
          "chainRange": 205,
          "status": {
            "type": "shock",
            "duration": 2,
            "dps": 7
          },
          "id": "legacy_mage_q",
          "visual": "Chain Lightning",
          "tr": "Arkana Yarığı",
          "legacyFrom": "mage.q",
          "trDesc": "A technique carried over from the old travel kit.",
          "cost": 1,
          "slot": null
        },
        {
          "id": "umbrallash",
          "name": "Umbral Lash",
          "visual": "Shadow Grasp",
          "element": "shadow",
          "kind": "arc",
          "cd": 5,
          "power": 1.5,
          "radius": 110,
          "arc": 1.1,
          "color": "#9c4dff",
          "cost": 1,
          "desc": "A whip of shadow cuts across the foes in front of you.",
          "trDesc": "Önündeki düşmanları kesen bir gölge kamçısı.",
          "slot": null
        },
        {
          "id": "soulharvest",
          "name": "Soul Harvest",
          "visual": "Soul Harvest",
          "element": "shadow",
          "kind": "nova",
          "cd": 16,
          "power": 2.5,
          "radius": 140,
          "healPct": 12,
          "color": "#69f0ae",
          "cost": 3,
          "desc": "Rip the souls from nearby foes and drink back a share as life.",
          "trDesc": "Yakındaki düşmanların ruhunu söküp bir kısmını can olarak içine çek.",
          "slot": null
        }
      ],
      "late": [
        {
          "id": "astralcollapse",
          "name": "Astral Collapse",
          "visual": "Starfall",
          "element": "arcane",
          "magic": true,
          "kind": "meteor",
          "cd": 36,
          "power": 3.6,
          "radius": 165,
          "delay": 0.4,
          "count": 5,
          "stagger": 0.12,
          "spreadRadius": 160,
          "range": 370,
          "color": "#ffe57f",
          "cost": 4,
          "late": true,
          "desc": "Five collapsing stars hammer the battlefield in quick succession.",
          "trDesc": "Beş çöken yıldız art arda savaş alanını döver.",
          "slot": null
        },
        {
          "id": "arcanedominion",
          "name": "Arcane Dominion",
          "visual": "Starfall",
          "element": "arcane",
          "magic": true,
          "kind": "meteor",
          "cd": 47,
          "power": 4.9,
          "radius": 210,
          "delay": 0.5,
          "count": 7,
          "stagger": 0.1,
          "spreadRadius": 200,
          "range": 400,
          "color": "#b388ff",
          "cost": 6,
          "late": true,
          "desc": "You claim the sky: seven stars answer your call at once.",
          "trDesc": "Gökyüzünü sahiplenirsin: yedi yıldız aynı anda çağrına uyar.",
          "slot": null
        }
      ],
      "legacy": {
        "q": {
          "name": "King's Edict",
          "element": "shadow",
          "kind": "arc",
          "cd": 6,
          "power": 2.68,
          "color": "#b388ff",
          "desc": "",
          "radius": 112,
          "arc": 1.1
        },
        "e": {
          "name": "Umbra Gate",
          "element": "shadow",
          "kind": "teleport",
          "cd": 6.8,
          "power": 2.07,
          "color": "#b388ff",
          "desc": "",
          "range": 185,
          "radius": 95
        },
        "r": {
          "name": "Reign of Shadows",
          "element": "shadow",
          "kind": "nova",
          "cd": 14.5,
          "power": 4.03,
          "color": "#b388ff",
          "desc": "",
          "radius": 185,
          "status": {
            "type": "slow",
            "duration": 2,
            "slow": 0.45
          }
        }
      }
    },
    "lightbringer": {
      "atkSpd": 0,
      "auto": {
        "element": "holy"
      },
      "q": {
        "id": "judgementbeam",
        "name": "Radiant Verdict",
        "visual": "Judgement Beam",
        "element": "holy",
        "magic": true,
        "kind": "beam",
        "cd": 11,
        "power": 2.1,
        "range": 360,
        "width": 34,
        "color": "#ffe082",
        "cost": 0,
        "desc": "A wide beam of judgement that sears everything in its path.",
        "trDesc": "Yolundaki her şeyi dağlayan geniş bir hüküm ışını.",
        "slot": "q",
        "defaultSlot": "q"
      },
      "e": {
        "id": "phoenixrebirth",
        "name": "Phoenix Rebirth",
        "visual": "Phoenix Rebirth",
        "element": "holy",
        "magic": true,
        "kind": "heal",
        "cd": 22,
        "healPct": 45,
        "radius": 110,
        "shieldPct": 12,
        "duration": 5,
        "color": "#ff8f00",
        "power": 0,
        "cost": 0,
        "desc": "A phoenix rises from you, restoring a great amount of health.",
        "trDesc": "İçinden bir anka yükselir, büyük miktarda can geri verir.",
        "slot": "e",
        "defaultSlot": "e"
      },
      "r": {
        "id": "divinejudgement",
        "name": "Divine Judgement",
        "visual": "Divine Judgement",
        "element": "holy",
        "magic": true,
        "kind": "nova",
        "cd": 18,
        "power": 2.9,
        "radius": 150,
        "color": "#fff59d",
        "status": {
          "type": "stun",
          "duration": 0.8
        },
        "cost": 0,
        "desc": "Six blades of light fall around you and stun the wicked.",
        "trDesc": "Etrafına altı ışık kılıcı iner ve günahkârları sersemletir.",
        "slot": "r",
        "defaultSlot": "r"
      },
      "pool": [
        {
          "id": "spiritward",
          "name": "Spirit Ward",
          "visual": "",
          "element": "holy",
          "kind": "shield",
          "cd": 22,
          "shieldPct": 30,
          "duration": 6,
          "radius": 60,
          "color": "#ffe082",
          "cost": 2,
          "slot": null,
          "desc": "A spirit shield absorbs damage for 6 seconds.",
          "trDesc": "Ruh kalkanı 6 saniye boyunca gelen hasarı emer."
        },
        {
          "id": "battlefocus",
          "name": "Battle Focus",
          "visual": "Rune Circle",
          "element": "physical",
          "kind": "buff",
          "cd": 18,
          "color": "#ffb74d",
          "cost": 2,
          "slot": null,
          "buff": {
            "stat": "attack",
            "pct": 30,
            "duration": 8
          },
          "desc": "Sharpen your focus: attack power rises for 8 seconds.",
          "trDesc": "Odağını topla: 8 saniye boyunca saldırı gücün yükselir."
        },
        {
          "id": "ironskin",
          "name": "Iron Skin",
          "visual": "",
          "element": "earth",
          "kind": "buff",
          "cd": 20,
          "color": "#b0bec5",
          "cost": 2,
          "slot": null,
          "buff": {
            "stat": "defense",
            "pct": 35,
            "duration": 8
          },
          "desc": "Harden your body: damage taken drops for 8 seconds.",
          "trDesc": "Bedenini sertleştir: 8 saniye boyunca aldığın hasar azalır."
        },
        {
          "id": "holylance",
          "name": "Judgement Beam",
          "visual": "Judgement Beam",
          "element": "holy",
          "magic": true,
          "kind": "beam",
          "cd": 7,
          "power": 1.7,
          "range": 300,
          "width": 26,
          "color": "#fff59d",
          "cost": 1,
          "desc": "A lance of holy light burns a straight line through the enemy.",
          "trDesc": "Kutsal ışıktan bir mızrak düşmanın içinden düz bir çizgi yakar.",
          "slot": null
        },
        {
          "id": "treeoflife",
          "name": "Tree of Life",
          "visual": "Tree of Life",
          "element": "nature",
          "magic": true,
          "kind": "heal",
          "cd": 16,
          "healPct": 30,
          "radius": 120,
          "color": "#69f0ae",
          "power": 0,
          "cost": 3,
          "desc": "A great tree blooms and pours healing light over the ground.",
          "trDesc": "Ulu bir ağaç açar ve yere şifa ışığı döker.",
          "slot": null
        },
        {
          "name": "Judgment",
          "element": "holy",
          "kind": "meteor",
          "cd": 16,
          "power": 2.9,
          "color": "#ffe082",
          "desc": "A technique carried over from the old travel kit.",
          "radius": 135,
          "delay": 0.4,
          "status": {
            "type": "stun",
            "duration": 0.9
          },
          "range": 340,
          "id": "legacy_paladin_r",
          "visual": "Meteor Storm",
          "tr": "Hüküm",
          "legacyFrom": "paladin.r",
          "trDesc": "A technique carried over from the old travel kit.",
          "cost": 3,
          "slot": null
        }
      ],
      "late": [
        {
          "id": "seraphsjudgement",
          "name": "Seraph's Judgement",
          "visual": "Judgement Beam",
          "element": "holy",
          "magic": true,
          "kind": "beam",
          "cd": 34,
          "power": 3.5,
          "range": 380,
          "width": 42,
          "color": "#fff59d",
          "cost": 4,
          "late": true,
          "desc": "A seraph's spear of light burns a wide path through everything.",
          "trDesc": "Bir serafın ışık mızrağı her şeyin içinden geniş bir yol yakar.",
          "slot": null
        },
        {
          "id": "eternaldawn",
          "name": "Eternal Dawn",
          "visual": "Divine Judgement",
          "element": "holy",
          "magic": true,
          "kind": "nova",
          "cd": 45,
          "power": 4.8,
          "radius": 195,
          "healPct": 22,
          "color": "#ffe082",
          "status": {
            "type": "stun",
            "duration": 1.2
          },
          "cost": 6,
          "late": true,
          "desc": "Dawn breaks all at once: foes are stunned, allies are restored.",
          "trDesc": "Şafak bir anda söker: düşmanlar sersemler, müttefikler iyileşir.",
          "slot": null
        }
      ],
      "legacy": {
        "q": {
          "name": "Radiant Strike",
          "element": "holy",
          "kind": "arc",
          "cd": 6,
          "power": 2.44,
          "color": "#ffe082",
          "desc": "",
          "radius": 118,
          "arc": 1.05
        },
        "e": {
          "name": "Aegis of Light",
          "element": "holy",
          "kind": "shield",
          "cd": 8.5,
          "power": 0,
          "color": "#ffe082",
          "desc": "",
          "shieldPct": 32,
          "duration": 5
        },
        "r": {
          "name": "Solar Flare",
          "element": "holy",
          "kind": "beam",
          "cd": 14.5,
          "power": 3.9,
          "color": "#ffe082",
          "desc": "",
          "range": 374,
          "width": 46
        }
      }
    },
    "death_lord": {
      "atkSpd": 16,
      "auto": {
        "element": "shadow"
      },
      "q": {
        "id": "bonecage",
        "name": "Bone Cage",
        "visual": "Bone Cage",
        "element": "shadow",
        "kind": "ground",
        "cd": 12,
        "power": 1.4,
        "radius": 95,
        "duration": 2.4,
        "tick": 0.4,
        "color": "#d8d0b8",
        "status": {
          "type": "freeze",
          "duration": 1.2
        },
        "cost": 0,
        "desc": "Bones erupt around the target and lock it in place while they cut.",
        "trDesc": "Hedefin çevresinde kemikler yükselir, onu yerinde kilitler.",
        "slot": "q",
        "defaultSlot": "q"
      },
      "e": {
        "id": "crimsonreap",
        "name": "Crimson Reap",
        "visual": "Crimson Reap",
        "element": "shadow",
        "kind": "arc",
        "cd": 10,
        "power": 2.2,
        "radius": 130,
        "arc": 1.4,
        "color": "#ff1744",
        "status": {
          "type": "bleed",
          "duration": 3,
          "dps": 12
        },
        "cost": 0,
        "desc": "A wide scythe of blood rips through the crowd.",
        "trDesc": "Kan orak kalabalığın içinden geçer.",
        "slot": "e",
        "defaultSlot": "e"
      },
      "r": {
        "id": "soulharvest",
        "name": "Soul Harvest",
        "visual": "Soul Harvest",
        "element": "shadow",
        "kind": "nova",
        "cd": 16,
        "power": 2.5,
        "radius": 140,
        "healPct": 12,
        "color": "#69f0ae",
        "cost": 0,
        "desc": "Rip the souls from nearby foes and drink back a share as life.",
        "trDesc": "Yakındaki düşmanların ruhunu söküp bir kısmını can olarak içine çek.",
        "slot": "r",
        "defaultSlot": "r"
      },
      "pool": [
        {
          "id": "shadowveil",
          "name": "Shadow Veil",
          "visual": "Dimension Rift",
          "element": "shadow",
          "kind": "teleport",
          "cd": 10,
          "power": 0.9,
          "range": 200,
          "radius": 70,
          "color": "#9575cd",
          "cost": 2,
          "slot": null,
          "desc": "Melt into shadow and reappear a short distance away.",
          "trDesc": "Gölgeye karışıp kısa bir mesafe öteye belir."
        },
        {
          "id": "frostbite",
          "name": "Frostbite",
          "visual": "",
          "element": "frost",
          "kind": "projectile",
          "cd": 6,
          "power": 1.4,
          "speed": 660,
          "radius": 10,
          "color": "#81d4fa",
          "cost": 1,
          "slot": null,
          "status": {
            "type": "slow",
            "duration": 2,
            "slow": 0.45
          },
          "desc": "Hurl a shard of ice that chills and slows the target.",
          "trDesc": "Hedefi üşütüp yavaşlatan bir buz kırığı fırlat."
        },
        {
          "id": "ironskin",
          "name": "Iron Skin",
          "visual": "",
          "element": "earth",
          "kind": "buff",
          "cd": 20,
          "color": "#b0bec5",
          "cost": 2,
          "slot": null,
          "buff": {
            "stat": "defense",
            "pct": 35,
            "duration": 8
          },
          "desc": "Harden your body: damage taken drops for 8 seconds.",
          "trDesc": "Bedenini sertleştir: 8 saniye boyunca aldığın hasar azalır."
        },
        {
          "id": "shadowgrasp",
          "name": "Shadow Grasp",
          "visual": "Shadow Grasp",
          "element": "shadow",
          "magic": true,
          "kind": "ground",
          "cd": 9,
          "power": 1.4,
          "radius": 95,
          "duration": 2.2,
          "tick": 0.4,
          "range": 300,
          "color": "#9c4dff",
          "status": {
            "type": "freeze",
            "duration": 1
          },
          "cost": 2,
          "desc": "Shadow tendrils burst from the ground and claw at everything.",
          "trDesc": "Yerden gölge kolları fışkırır ve her şeyi tırmalar.",
          "slot": null
        },
        {
          "id": "singularity",
          "name": "Singularity",
          "visual": "Singularity",
          "element": "shadow",
          "magic": true,
          "kind": "vortex",
          "cd": 16,
          "power": 2,
          "radius": 130,
          "duration": 2.8,
          "tick": 0.4,
          "pull": 220,
          "range": 330,
          "color": "#7c4dff",
          "cost": 3,
          "desc": "Open a collapsing void that drags enemies into its core.",
          "trDesc": "Düşmanları çekirdeğine çeken, çöken bir boşluk aç.",
          "slot": null
        },
        {
          "name": "Army of the Dead",
          "element": "shadow",
          "kind": "barrage",
          "cd": 15.3,
          "power": 2.68,
          "color": "#b388ff",
          "desc": "A technique carried over from the old travel kit.",
          "count": 14,
          "interval": 0.08,
          "speed": 680,
          "radius": 9,
          "spread": 0.3,
          "id": "legacy_death_lord_r",
          "visual": "Starfall",
          "tr": "Army of the Dead",
          "legacyFrom": "death_lord.r",
          "trDesc": "A technique carried over from the old travel kit.",
          "cost": 3,
          "slot": null
        }
      ],
      "late": [
        {
          "id": "nightfall",
          "name": "Nightfall",
          "visual": "Singularity",
          "element": "shadow",
          "magic": true,
          "kind": "vortex",
          "cd": 35,
          "power": 3.3,
          "radius": 165,
          "duration": 3.2,
          "tick": 0.35,
          "pull": 280,
          "range": 350,
          "color": "#7c4dff",
          "cost": 4,
          "late": true,
          "desc": "Night collapses into a hungry void that drags enemies to its core.",
          "trDesc": "Gece, düşmanları çekirdeğine çeken aç bir boşluğa çöker.",
          "slot": null
        },
        {
          "id": "voidcrown",
          "name": "Void Crown",
          "visual": "Blood Ritual",
          "element": "shadow",
          "magic": true,
          "kind": "nova",
          "cd": 46,
          "power": 4.7,
          "radius": 200,
          "healPct": 18,
          "color": "#9c4dff",
          "cost": 6,
          "late": true,
          "desc": "A void crown detonates around you, tearing foes and feeding you their essence.",
          "trDesc": "Etrafında bir boşluk tacı patlar; düşmanı yırtar, özlerini sana verir.",
          "slot": null
        }
      ],
      "legacy": {
        "q": {
          "name": "Reaper's Toll",
          "element": "shadow",
          "kind": "arc",
          "cd": 6,
          "power": 2.81,
          "color": "#b388ff",
          "desc": "",
          "radius": 121,
          "arc": 1.2
        },
        "e": {
          "name": "Grave Chains",
          "element": "shadow",
          "kind": "beam",
          "cd": 6.8,
          "power": 2.44,
          "color": "#b388ff",
          "desc": "",
          "range": 242,
          "width": 26,
          "status": {
            "type": "root",
            "duration": 1.8
          }
        },
        "r": {
          "name": "Army of the Dead",
          "element": "shadow",
          "kind": "barrage",
          "cd": 15.3,
          "power": 2.68,
          "color": "#b388ff",
          "desc": "",
          "count": 14,
          "interval": 0.08,
          "speed": 680,
          "radius": 9,
          "spread": 0.3
        }
      }
    },
    "bloodspawn": {
      "atkSpd": 22,
      "auto": {
        "element": "blood"
      },
      "q": {
        "id": "bloodcut",
        "name": "Blood Cut",
        "visual": "Crimson Reap",
        "element": "shadow",
        "kind": "arc",
        "cd": 5,
        "power": 1.7,
        "radius": 105,
        "arc": 0.95,
        "color": "#ff1744",
        "status": {
          "type": "bleed",
          "duration": 2.5,
          "dps": 9
        },
        "cost": 0,
        "desc": "A quick crimson slash that leaves the wound bleeding.",
        "trDesc": "Yarayı kanatır biçimde hızlı, kızıl bir kesik.",
        "slot": "q",
        "defaultSlot": "q"
      },
      "e": {
        "id": "crimsonreap",
        "name": "Crimson Reap",
        "visual": "Crimson Reap",
        "element": "shadow",
        "kind": "arc",
        "cd": 10,
        "power": 2.2,
        "radius": 130,
        "arc": 1.4,
        "color": "#ff1744",
        "status": {
          "type": "bleed",
          "duration": 3,
          "dps": 12
        },
        "cost": 0,
        "desc": "A wide scythe of blood rips through the crowd.",
        "trDesc": "Kan orak kalabalığın içinden geçer.",
        "slot": "e",
        "defaultSlot": "e"
      },
      "r": {
        "id": "bloodritual",
        "name": "Blood Ritual",
        "visual": "Blood Ritual",
        "element": "shadow",
        "kind": "nova",
        "cd": 17,
        "power": 2.7,
        "radius": 120,
        "healPct": 10,
        "color": "#ff1744",
        "cost": 0,
        "desc": "A crimson ritual circle erupts, tearing foes and feeding you.",
        "trDesc": "Kızıl bir ritüel çemberi patlar; düşmanı yırtar, sana can verir.",
        "slot": "r",
        "defaultSlot": "r"
      },
      "pool": [
        {
          "id": "shadowveil",
          "name": "Shadow Veil",
          "visual": "Dimension Rift",
          "element": "shadow",
          "kind": "teleport",
          "cd": 10,
          "power": 0.9,
          "range": 200,
          "radius": 70,
          "color": "#9575cd",
          "cost": 2,
          "slot": null,
          "desc": "Melt into shadow and reappear a short distance away.",
          "trDesc": "Gölgeye karışıp kısa bir mesafe öteye belir."
        },
        {
          "id": "frostbite",
          "name": "Frostbite",
          "visual": "",
          "element": "frost",
          "kind": "projectile",
          "cd": 6,
          "power": 1.4,
          "speed": 660,
          "radius": 10,
          "color": "#81d4fa",
          "cost": 1,
          "slot": null,
          "status": {
            "type": "slow",
            "duration": 2,
            "slow": 0.45
          },
          "desc": "Hurl a shard of ice that chills and slows the target.",
          "trDesc": "Hedefi üşütüp yavaşlatan bir buz kırığı fırlat."
        },
        {
          "id": "ironskin",
          "name": "Iron Skin",
          "visual": "",
          "element": "earth",
          "kind": "buff",
          "cd": 20,
          "color": "#b0bec5",
          "cost": 2,
          "slot": null,
          "buff": {
            "stat": "defense",
            "pct": 35,
            "duration": 8
          },
          "desc": "Harden your body: damage taken drops for 8 seconds.",
          "trDesc": "Bedenini sertleştir: 8 saniye boyunca aldığın hasar azalır."
        },
        {
          "id": "shadowgrasp",
          "name": "Shadow Grasp",
          "visual": "Shadow Grasp",
          "element": "shadow",
          "magic": true,
          "kind": "ground",
          "cd": 9,
          "power": 1.4,
          "radius": 95,
          "duration": 2.2,
          "tick": 0.4,
          "range": 300,
          "color": "#9c4dff",
          "status": {
            "type": "freeze",
            "duration": 1
          },
          "cost": 2,
          "desc": "Shadow tendrils burst from the ground and claw at everything.",
          "trDesc": "Yerden gölge kolları fışkırır ve her şeyi tırmalar.",
          "slot": null
        },
        {
          "id": "soulharvest",
          "name": "Soul Harvest",
          "visual": "Soul Harvest",
          "element": "shadow",
          "kind": "nova",
          "cd": 16,
          "power": 2.5,
          "radius": 140,
          "healPct": 12,
          "color": "#69f0ae",
          "cost": 3,
          "desc": "Rip the souls from nearby foes and drink back a share as life.",
          "trDesc": "Yakındaki düşmanların ruhunu söküp bir kısmını can olarak içine çek.",
          "slot": null
        },
        {
          "name": "Blood Tide",
          "element": "blood",
          "kind": "ground",
          "cd": 16,
          "power": 3,
          "color": "#ff5370",
          "desc": "A technique carried over from the old travel kit.",
          "radius": 150,
          "duration": 4,
          "tick": 0.45,
          "status": {
            "type": "slow",
            "duration": 2,
            "slow": 0.4
          },
          "dot": 16,
          "range": 340,
          "id": "legacy_bloodspawn_r",
          "visual": "Toxic Cloud",
          "tr": "Blood Tide",
          "legacyFrom": "bloodspawn.r",
          "trDesc": "A technique carried over from the old travel kit.",
          "cost": 3,
          "slot": null
        }
      ],
      "late": [
        {
          "id": "nightfall",
          "name": "Nightfall",
          "visual": "Singularity",
          "element": "shadow",
          "magic": true,
          "kind": "vortex",
          "cd": 35,
          "power": 3.3,
          "radius": 165,
          "duration": 3.2,
          "tick": 0.35,
          "pull": 280,
          "range": 350,
          "color": "#7c4dff",
          "cost": 4,
          "late": true,
          "desc": "Night collapses into a hungry void that drags enemies to its core.",
          "trDesc": "Gece, düşmanları çekirdeğine çeken aç bir boşluğa çöker.",
          "slot": null
        },
        {
          "id": "voidcrown",
          "name": "Void Crown",
          "visual": "Blood Ritual",
          "element": "shadow",
          "magic": true,
          "kind": "nova",
          "cd": 46,
          "power": 4.7,
          "radius": 200,
          "healPct": 18,
          "color": "#9c4dff",
          "cost": 6,
          "late": true,
          "desc": "A void crown detonates around you, tearing foes and feeding you their essence.",
          "trDesc": "Etrafında bir boşluk tacı patlar; düşmanı yırtar, özlerini sana verir.",
          "slot": null
        }
      ],
      "legacy": {
        "q": {
          "name": "Blood Claw",
          "element": "blood",
          "kind": "arc",
          "cd": 3.5,
          "power": 1.9,
          "color": "#ff5370",
          "desc": "",
          "radius": 90,
          "arc": 0.95,
          "status": {
            "type": "bleed",
            "duration": 2,
            "dps": 8
          }
        },
        "e": {
          "name": "Crimson Rush",
          "element": "blood",
          "kind": "dash",
          "cd": 7,
          "power": 1.9,
          "color": "#ff5370",
          "desc": "",
          "range": 175,
          "radius": 70,
          "status": {
            "type": "bleed",
            "duration": 2,
            "dps": 10
          }
        },
        "r": {
          "name": "Blood Tide",
          "element": "blood",
          "kind": "ground",
          "cd": 16,
          "power": 3,
          "color": "#ff5370",
          "desc": "",
          "radius": 150,
          "duration": 4,
          "tick": 0.45,
          "status": {
            "type": "slow",
            "duration": 2,
            "slow": 0.4
          },
          "dot": 16,
          "range": 340
        }
      }
    },
    "bloodlord": {
      "atkSpd": 14,
      "auto": {
        "element": "blood"
      },
      "q": {
        "id": "bloodcut",
        "name": "Blood Cut",
        "visual": "Crimson Reap",
        "element": "shadow",
        "kind": "arc",
        "cd": 5,
        "power": 1.7,
        "radius": 105,
        "arc": 0.95,
        "color": "#ff1744",
        "status": {
          "type": "bleed",
          "duration": 2.5,
          "dps": 9
        },
        "cost": 0,
        "desc": "A quick crimson slash that leaves the wound bleeding.",
        "trDesc": "Yarayı kanatır biçimde hızlı, kızıl bir kesik.",
        "slot": "q",
        "defaultSlot": "q"
      },
      "e": {
        "id": "dragonsbreath",
        "name": "Dragon Breath",
        "visual": "Dragon Breath",
        "element": "fire",
        "magic": true,
        "kind": "arc",
        "cd": 14,
        "power": 2.4,
        "radius": 150,
        "arc": 1,
        "color": "#ff5a14",
        "status": {
          "type": "burn",
          "duration": 3,
          "dps": 16
        },
        "cost": 0,
        "desc": "Exhale a cone of dragonfire that sets the ground alight.",
        "trDesc": "Yeri tutuşturan bir ejder ateşi konisi püskürt.",
        "slot": "e",
        "defaultSlot": "e"
      },
      "r": {
        "id": "bloodritual",
        "name": "Blood Ritual",
        "visual": "Blood Ritual",
        "element": "shadow",
        "kind": "nova",
        "cd": 17,
        "power": 2.7,
        "radius": 120,
        "healPct": 10,
        "color": "#ff1744",
        "cost": 0,
        "desc": "A crimson ritual circle erupts, tearing foes and feeding you.",
        "trDesc": "Kızıl bir ritüel çemberi patlar; düşmanı yırtar, sana can verir.",
        "slot": "r",
        "defaultSlot": "r"
      },
      "pool": [
        {
          "id": "shadowveil",
          "name": "Shadow Veil",
          "visual": "Dimension Rift",
          "element": "shadow",
          "kind": "teleport",
          "cd": 10,
          "power": 0.9,
          "range": 200,
          "radius": 70,
          "color": "#9575cd",
          "cost": 2,
          "slot": null,
          "desc": "Melt into shadow and reappear a short distance away.",
          "trDesc": "Gölgeye karışıp kısa bir mesafe öteye belir."
        },
        {
          "id": "frostbite",
          "name": "Frostbite",
          "visual": "",
          "element": "frost",
          "kind": "projectile",
          "cd": 6,
          "power": 1.4,
          "speed": 660,
          "radius": 10,
          "color": "#81d4fa",
          "cost": 1,
          "slot": null,
          "status": {
            "type": "slow",
            "duration": 2,
            "slow": 0.45
          },
          "desc": "Hurl a shard of ice that chills and slows the target.",
          "trDesc": "Hedefi üşütüp yavaşlatan bir buz kırığı fırlat."
        },
        {
          "id": "ironskin",
          "name": "Iron Skin",
          "visual": "",
          "element": "earth",
          "kind": "buff",
          "cd": 20,
          "color": "#b0bec5",
          "cost": 2,
          "slot": null,
          "buff": {
            "stat": "defense",
            "pct": 35,
            "duration": 8
          },
          "desc": "Harden your body: damage taken drops for 8 seconds.",
          "trDesc": "Bedenini sertleştir: 8 saniye boyunca aldığın hasar azalır."
        },
        {
          "id": "crimsonreap",
          "name": "Crimson Reap",
          "visual": "Crimson Reap",
          "element": "shadow",
          "kind": "arc",
          "cd": 10,
          "power": 2.2,
          "radius": 130,
          "arc": 1.4,
          "color": "#ff1744",
          "status": {
            "type": "bleed",
            "duration": 3,
            "dps": 12
          },
          "cost": 2,
          "desc": "A wide scythe of blood rips through the crowd.",
          "trDesc": "Kan orak kalabalığın içinden geçer.",
          "slot": null
        },
        {
          "id": "soulharvest",
          "name": "Soul Harvest",
          "visual": "Soul Harvest",
          "element": "shadow",
          "kind": "nova",
          "cd": 16,
          "power": 2.5,
          "radius": 140,
          "healPct": 12,
          "color": "#69f0ae",
          "cost": 3,
          "desc": "Rip the souls from nearby foes and drink back a share as life.",
          "trDesc": "Yakındaki düşmanların ruhunu söküp bir kısmını can olarak içine çek.",
          "slot": null
        },
        {
          "name": "Crimson Cataclysm",
          "element": "blood",
          "kind": "vortex",
          "cd": 15.3,
          "power": 4.27,
          "color": "#ff5370",
          "desc": "A technique carried over from the old travel kit.",
          "radius": 196,
          "duration": 2.6,
          "tick": 0.4,
          "pull": 140,
          "status": {
            "type": "bleed",
            "duration": 4,
            "dps": 22
          },
          "range": 320,
          "id": "legacy_bloodlord_r",
          "visual": "Cyclone",
          "tr": "Crimson Cataclysm",
          "legacyFrom": "bloodlord.r",
          "trDesc": "A technique carried over from the old travel kit.",
          "cost": 3,
          "slot": null
        }
      ],
      "late": [
        {
          "id": "nightfall",
          "name": "Nightfall",
          "visual": "Singularity",
          "element": "shadow",
          "magic": true,
          "kind": "vortex",
          "cd": 35,
          "power": 3.3,
          "radius": 165,
          "duration": 3.2,
          "tick": 0.35,
          "pull": 280,
          "range": 350,
          "color": "#7c4dff",
          "cost": 4,
          "late": true,
          "desc": "Night collapses into a hungry void that drags enemies to its core.",
          "trDesc": "Gece, düşmanları çekirdeğine çeken aç bir boşluğa çöker.",
          "slot": null
        },
        {
          "id": "voidcrown",
          "name": "Void Crown",
          "visual": "Blood Ritual",
          "element": "shadow",
          "magic": true,
          "kind": "nova",
          "cd": 46,
          "power": 4.7,
          "radius": 200,
          "healPct": 18,
          "color": "#9c4dff",
          "cost": 6,
          "late": true,
          "desc": "A void crown detonates around you, tearing foes and feeding you their essence.",
          "trDesc": "Etrafında bir boşluk tacı patlar; düşmanı yırtar, özlerini sana verir.",
          "slot": null
        }
      ],
      "legacy": {
        "q": {
          "name": "Sanguine Slash",
          "element": "blood",
          "kind": "arc",
          "cd": 6,
          "power": 2.68,
          "color": "#ff5370",
          "desc": "",
          "radius": 118,
          "arc": 1.1,
          "status": {
            "type": "bleed",
            "duration": 2.5,
            "dps": 12
          }
        },
        "e": {
          "name": "Blood Pact",
          "element": "blood",
          "kind": "shield",
          "cd": 8.5,
          "power": 0,
          "color": "#ff5370",
          "desc": "",
          "shieldPct": 25,
          "duration": 5,
          "healPct": 13
        },
        "r": {
          "name": "Crimson Cataclysm",
          "element": "blood",
          "kind": "vortex",
          "cd": 15.3,
          "power": 4.27,
          "color": "#ff5370",
          "desc": "",
          "radius": 196,
          "duration": 2.6,
          "tick": 0.4,
          "pull": 140,
          "status": {
            "type": "bleed",
            "duration": 4,
            "dps": 22
          },
          "range": 320
        }
      }
    },
    "gloomspawn": {
      "atkSpd": 8,
      "auto": {
        "element": "shadow",
        "magic": true
      },
      "q": {
        "id": "umbrallash",
        "name": "Umbral Lash",
        "visual": "Shadow Grasp",
        "element": "shadow",
        "kind": "arc",
        "cd": 5,
        "power": 1.5,
        "radius": 110,
        "arc": 1.1,
        "color": "#9c4dff",
        "cost": 0,
        "desc": "A whip of shadow cuts across the foes in front of you.",
        "trDesc": "Önündeki düşmanları kesen bir gölge kamçısı.",
        "slot": "q",
        "defaultSlot": "q"
      },
      "e": {
        "id": "bonecage",
        "name": "Bone Cage",
        "visual": "Bone Cage",
        "element": "shadow",
        "kind": "ground",
        "cd": 12,
        "power": 1.4,
        "radius": 95,
        "duration": 2.4,
        "tick": 0.4,
        "color": "#d8d0b8",
        "status": {
          "type": "freeze",
          "duration": 1.2
        },
        "cost": 0,
        "desc": "Bones erupt around the target and lock it in place while they cut.",
        "trDesc": "Hedefin çevresinde kemikler yükselir, onu yerinde kilitler.",
        "slot": "e",
        "defaultSlot": "e"
      },
      "r": {
        "id": "soulharvest",
        "name": "Soul Harvest",
        "visual": "Soul Harvest",
        "element": "shadow",
        "kind": "nova",
        "cd": 16,
        "power": 2.5,
        "radius": 140,
        "healPct": 12,
        "color": "#69f0ae",
        "cost": 0,
        "desc": "Rip the souls from nearby foes and drink back a share as life.",
        "trDesc": "Yakındaki düşmanların ruhunu söküp bir kısmını can olarak içine çek.",
        "slot": "r",
        "defaultSlot": "r"
      },
      "pool": [
        {
          "id": "shadowveil",
          "name": "Shadow Veil",
          "visual": "Dimension Rift",
          "element": "shadow",
          "kind": "teleport",
          "cd": 10,
          "power": 0.9,
          "range": 200,
          "radius": 70,
          "color": "#9575cd",
          "cost": 2,
          "slot": null,
          "desc": "Melt into shadow and reappear a short distance away.",
          "trDesc": "Gölgeye karışıp kısa bir mesafe öteye belir."
        },
        {
          "id": "frostbite",
          "name": "Frostbite",
          "visual": "",
          "element": "frost",
          "kind": "projectile",
          "cd": 6,
          "power": 1.4,
          "speed": 660,
          "radius": 10,
          "color": "#81d4fa",
          "cost": 1,
          "slot": null,
          "status": {
            "type": "slow",
            "duration": 2,
            "slow": 0.45
          },
          "desc": "Hurl a shard of ice that chills and slows the target.",
          "trDesc": "Hedefi üşütüp yavaşlatan bir buz kırığı fırlat."
        },
        {
          "id": "ironskin",
          "name": "Iron Skin",
          "visual": "",
          "element": "earth",
          "kind": "buff",
          "cd": 20,
          "color": "#b0bec5",
          "cost": 2,
          "slot": null,
          "buff": {
            "stat": "defense",
            "pct": 35,
            "duration": 8
          },
          "desc": "Harden your body: damage taken drops for 8 seconds.",
          "trDesc": "Bedenini sertleştir: 8 saniye boyunca aldığın hasar azalır."
        },
        {
          "id": "shadowgrasp",
          "name": "Shadow Grasp",
          "visual": "Shadow Grasp",
          "element": "shadow",
          "magic": true,
          "kind": "ground",
          "cd": 9,
          "power": 1.4,
          "radius": 95,
          "duration": 2.2,
          "tick": 0.4,
          "range": 300,
          "color": "#9c4dff",
          "status": {
            "type": "freeze",
            "duration": 1
          },
          "cost": 2,
          "desc": "Shadow tendrils burst from the ground and claw at everything.",
          "trDesc": "Yerden gölge kolları fışkırır ve her şeyi tırmalar.",
          "slot": null
        },
        {
          "id": "singularity",
          "name": "Singularity",
          "visual": "Singularity",
          "element": "shadow",
          "magic": true,
          "kind": "vortex",
          "cd": 16,
          "power": 2,
          "radius": 130,
          "duration": 2.8,
          "tick": 0.4,
          "pull": 220,
          "range": 330,
          "color": "#7c4dff",
          "cost": 3,
          "desc": "Open a collapsing void that drags enemies into its core.",
          "trDesc": "Düşmanları çekirdeğine çeken, çöken bir boşluk aç.",
          "slot": null
        },
        {
          "name": "Eclipse",
          "element": "shadow",
          "kind": "orbit",
          "cd": 17,
          "power": 3.2,
          "color": "#b388ff",
          "desc": "A technique carried over from the old travel kit.",
          "radius": 120,
          "duration": 3.6,
          "tick": 0.35,
          "count": 6,
          "speed": 3.8,
          "id": "legacy_gloomspawn_r",
          "visual": "Blade Storm",
          "tr": "Eclipse",
          "legacyFrom": "gloomspawn.r",
          "trDesc": "A technique carried over from the old travel kit.",
          "cost": 3,
          "slot": null
        }
      ],
      "late": [
        {
          "id": "nightfall",
          "name": "Nightfall",
          "visual": "Singularity",
          "element": "shadow",
          "magic": true,
          "kind": "vortex",
          "cd": 35,
          "power": 3.3,
          "radius": 165,
          "duration": 3.2,
          "tick": 0.35,
          "pull": 280,
          "range": 350,
          "color": "#7c4dff",
          "cost": 4,
          "late": true,
          "desc": "Night collapses into a hungry void that drags enemies to its core.",
          "trDesc": "Gece, düşmanları çekirdeğine çeken aç bir boşluğa çöker.",
          "slot": null
        },
        {
          "id": "voidcrown",
          "name": "Void Crown",
          "visual": "Blood Ritual",
          "element": "shadow",
          "magic": true,
          "kind": "nova",
          "cd": 46,
          "power": 4.7,
          "radius": 200,
          "healPct": 18,
          "color": "#9c4dff",
          "cost": 6,
          "late": true,
          "desc": "A void crown detonates around you, tearing foes and feeding you their essence.",
          "trDesc": "Etrafında bir boşluk tacı patlar; düşmanı yırtar, özlerini sana verir.",
          "slot": null
        }
      ],
      "legacy": {
        "q": {
          "name": "Gloom Bolt",
          "element": "shadow",
          "kind": "projectile",
          "cd": 3,
          "power": 1.7,
          "color": "#b388ff",
          "desc": "",
          "speed": 620,
          "radius": 9
        },
        "e": {
          "name": "Shadow Well",
          "element": "shadow",
          "kind": "ground",
          "cd": 9,
          "power": 0.9,
          "color": "#b388ff",
          "desc": "",
          "radius": 88,
          "duration": 3,
          "tick": 0.5,
          "status": {
            "type": "slow",
            "duration": 2.4,
            "slow": 0.4
          },
          "dot": 12,
          "range": 340
        },
        "r": {
          "name": "Eclipse",
          "element": "shadow",
          "kind": "orbit",
          "cd": 17,
          "power": 3.2,
          "color": "#b388ff",
          "desc": "",
          "radius": 120,
          "duration": 3.6,
          "tick": 0.35,
          "count": 6,
          "speed": 3.8
        }
      }
    },
    "sanguine_lord": {
      "atkSpd": 12,
      "auto": {
        "element": "blood"
      },
      "q": {
        "id": "bloodcut",
        "name": "Blood Cut",
        "visual": "Crimson Reap",
        "element": "shadow",
        "kind": "arc",
        "cd": 5,
        "power": 1.7,
        "radius": 105,
        "arc": 0.95,
        "color": "#ff1744",
        "status": {
          "type": "bleed",
          "duration": 2.5,
          "dps": 9
        },
        "cost": 0,
        "desc": "A quick crimson slash that leaves the wound bleeding.",
        "trDesc": "Yarayı kanatır biçimde hızlı, kızıl bir kesik.",
        "slot": "q",
        "defaultSlot": "q"
      },
      "e": {
        "id": "bloodritual",
        "name": "Blood Ritual",
        "visual": "Blood Ritual",
        "element": "shadow",
        "kind": "nova",
        "cd": 17,
        "power": 2.7,
        "radius": 120,
        "healPct": 10,
        "color": "#ff1744",
        "cost": 0,
        "desc": "A crimson ritual circle erupts, tearing foes and feeding you.",
        "trDesc": "Kızıl bir ritüel çemberi patlar; düşmanı yırtar, sana can verir.",
        "slot": "e",
        "defaultSlot": "e"
      },
      "r": {
        "id": "soulharvest",
        "name": "Soul Harvest",
        "visual": "Soul Harvest",
        "element": "shadow",
        "kind": "nova",
        "cd": 16,
        "power": 2.5,
        "radius": 140,
        "healPct": 12,
        "color": "#69f0ae",
        "cost": 0,
        "desc": "Rip the souls from nearby foes and drink back a share as life.",
        "trDesc": "Yakındaki düşmanların ruhunu söküp bir kısmını can olarak içine çek.",
        "slot": "r",
        "defaultSlot": "r"
      },
      "pool": [
        {
          "id": "shadowveil",
          "name": "Shadow Veil",
          "visual": "Dimension Rift",
          "element": "shadow",
          "kind": "teleport",
          "cd": 10,
          "power": 0.9,
          "range": 200,
          "radius": 70,
          "color": "#9575cd",
          "cost": 2,
          "slot": null,
          "desc": "Melt into shadow and reappear a short distance away.",
          "trDesc": "Gölgeye karışıp kısa bir mesafe öteye belir."
        },
        {
          "id": "frostbite",
          "name": "Frostbite",
          "visual": "",
          "element": "frost",
          "kind": "projectile",
          "cd": 6,
          "power": 1.4,
          "speed": 660,
          "radius": 10,
          "color": "#81d4fa",
          "cost": 1,
          "slot": null,
          "status": {
            "type": "slow",
            "duration": 2,
            "slow": 0.45
          },
          "desc": "Hurl a shard of ice that chills and slows the target.",
          "trDesc": "Hedefi üşütüp yavaşlatan bir buz kırığı fırlat."
        },
        {
          "id": "ironskin",
          "name": "Iron Skin",
          "visual": "",
          "element": "earth",
          "kind": "buff",
          "cd": 20,
          "color": "#b0bec5",
          "cost": 2,
          "slot": null,
          "buff": {
            "stat": "defense",
            "pct": 35,
            "duration": 8
          },
          "desc": "Harden your body: damage taken drops for 8 seconds.",
          "trDesc": "Bedenini sertleştir: 8 saniye boyunca aldığın hasar azalır."
        },
        {
          "id": "crimsonreap",
          "name": "Crimson Reap",
          "visual": "Crimson Reap",
          "element": "shadow",
          "kind": "arc",
          "cd": 10,
          "power": 2.2,
          "radius": 130,
          "arc": 1.4,
          "color": "#ff1744",
          "status": {
            "type": "bleed",
            "duration": 3,
            "dps": 12
          },
          "cost": 2,
          "desc": "A wide scythe of blood rips through the crowd.",
          "trDesc": "Kan orak kalabalığın içinden geçer.",
          "slot": null
        },
        {
          "id": "shadowgrasp",
          "name": "Shadow Grasp",
          "visual": "Shadow Grasp",
          "element": "shadow",
          "magic": true,
          "kind": "ground",
          "cd": 9,
          "power": 1.4,
          "radius": 95,
          "duration": 2.2,
          "tick": 0.4,
          "range": 300,
          "color": "#9c4dff",
          "status": {
            "type": "freeze",
            "duration": 1
          },
          "cost": 2,
          "desc": "Shadow tendrils burst from the ground and claw at everything.",
          "trDesc": "Yerden gölge kolları fışkırır ve her şeyi tırmalar.",
          "slot": null
        },
        {
          "name": "Exsanguinate",
          "element": "blood",
          "kind": "beam",
          "cd": 15.3,
          "power": 4.39,
          "color": "#ff5370",
          "desc": "A technique carried over from the old travel kit.",
          "range": 330,
          "width": 38,
          "healPct": 8,
          "id": "legacy_sanguine_lord_r",
          "visual": "Judgement Beam",
          "tr": "Exsanguinate",
          "legacyFrom": "sanguine_lord.r",
          "trDesc": "A technique carried over from the old travel kit.",
          "cost": 3,
          "slot": null
        }
      ],
      "late": [
        {
          "id": "nightfall",
          "name": "Nightfall",
          "visual": "Singularity",
          "element": "shadow",
          "magic": true,
          "kind": "vortex",
          "cd": 35,
          "power": 3.3,
          "radius": 165,
          "duration": 3.2,
          "tick": 0.35,
          "pull": 280,
          "range": 350,
          "color": "#7c4dff",
          "cost": 4,
          "late": true,
          "desc": "Night collapses into a hungry void that drags enemies to its core.",
          "trDesc": "Gece, düşmanları çekirdeğine çeken aç bir boşluğa çöker.",
          "slot": null
        },
        {
          "id": "voidcrown",
          "name": "Void Crown",
          "visual": "Blood Ritual",
          "element": "shadow",
          "magic": true,
          "kind": "nova",
          "cd": 46,
          "power": 4.7,
          "radius": 200,
          "healPct": 18,
          "color": "#9c4dff",
          "cost": 6,
          "late": true,
          "desc": "A void crown detonates around you, tearing foes and feeding you their essence.",
          "trDesc": "Etrafında bir boşluk tacı patlar; düşmanı yırtar, özlerini sana verir.",
          "slot": null
        }
      ],
      "legacy": {
        "q": {
          "name": "Blood Reign",
          "element": "blood",
          "kind": "arc",
          "cd": 6,
          "power": 2.81,
          "color": "#ff5370",
          "desc": "",
          "radius": 123,
          "arc": 1.15
        },
        "e": {
          "name": "Veil of Blood",
          "element": "blood",
          "kind": "shield",
          "cd": 9.4,
          "power": 0,
          "color": "#ff5370",
          "desc": "",
          "shieldPct": 30,
          "duration": 5
        },
        "r": {
          "name": "Exsanguinate",
          "element": "blood",
          "kind": "beam",
          "cd": 15.3,
          "power": 4.39,
          "color": "#ff5370",
          "desc": "",
          "range": 330,
          "width": 38,
          "healPct": 8
        }
      }
    },
    "divine_saint": {
      "atkSpd": -4,
      "auto": {
        "element": "holy",
        "magic": true
      },
      "q": {
        "id": "judgementbeam",
        "name": "Radiant Verdict",
        "visual": "Judgement Beam",
        "element": "holy",
        "magic": true,
        "kind": "beam",
        "cd": 11,
        "power": 2.1,
        "range": 360,
        "width": 34,
        "color": "#ffe082",
        "cost": 0,
        "desc": "A wide beam of judgement that sears everything in its path.",
        "trDesc": "Yolundaki her şeyi dağlayan geniş bir hüküm ışını.",
        "slot": "q",
        "defaultSlot": "q"
      },
      "e": {
        "id": "phoenixrebirth",
        "name": "Phoenix Rebirth",
        "visual": "Phoenix Rebirth",
        "element": "holy",
        "magic": true,
        "kind": "heal",
        "cd": 22,
        "healPct": 45,
        "radius": 110,
        "shieldPct": 12,
        "duration": 5,
        "color": "#ff8f00",
        "power": 0,
        "cost": 0,
        "desc": "A phoenix rises from you, restoring a great amount of health.",
        "trDesc": "İçinden bir anka yükselir, büyük miktarda can geri verir.",
        "slot": "e",
        "defaultSlot": "e"
      },
      "r": {
        "id": "starfall",
        "name": "Starfall",
        "visual": "Starfall",
        "element": "arcane",
        "magic": true,
        "kind": "meteor",
        "cd": 17,
        "power": 2.8,
        "radius": 135,
        "delay": 0.45,
        "count": 3,
        "stagger": 0.14,
        "spreadRadius": 130,
        "range": 360,
        "color": "#ffe57f",
        "cost": 0,
        "desc": "Stars rain from the sky across a wide area.",
        "trDesc": "Gökten geniş bir alana yıldızlar yağar.",
        "slot": "r",
        "defaultSlot": "r"
      },
      "pool": [
        {
          "id": "spiritward",
          "name": "Spirit Ward",
          "visual": "",
          "element": "holy",
          "kind": "shield",
          "cd": 22,
          "shieldPct": 30,
          "duration": 6,
          "radius": 60,
          "color": "#ffe082",
          "cost": 2,
          "slot": null,
          "desc": "A spirit shield absorbs damage for 6 seconds.",
          "trDesc": "Ruh kalkanı 6 saniye boyunca gelen hasarı emer."
        },
        {
          "id": "battlefocus",
          "name": "Battle Focus",
          "visual": "Rune Circle",
          "element": "physical",
          "kind": "buff",
          "cd": 18,
          "color": "#ffb74d",
          "cost": 2,
          "slot": null,
          "buff": {
            "stat": "attack",
            "pct": 30,
            "duration": 8
          },
          "desc": "Sharpen your focus: attack power rises for 8 seconds.",
          "trDesc": "Odağını topla: 8 saniye boyunca saldırı gücün yükselir."
        },
        {
          "id": "ironskin",
          "name": "Iron Skin",
          "visual": "",
          "element": "earth",
          "kind": "buff",
          "cd": 20,
          "color": "#b0bec5",
          "cost": 2,
          "slot": null,
          "buff": {
            "stat": "defense",
            "pct": 35,
            "duration": 8
          },
          "desc": "Harden your body: damage taken drops for 8 seconds.",
          "trDesc": "Bedenini sertleştir: 8 saniye boyunca aldığın hasar azalır."
        },
        {
          "id": "judgement",
          "name": "Judgement",
          "visual": "Divine Judgement",
          "element": "holy",
          "magic": true,
          "kind": "meteor",
          "cd": 16,
          "power": 2.9,
          "radius": 135,
          "delay": 0.4,
          "range": 340,
          "color": "#ffe082",
          "status": {
            "type": "stun",
            "duration": 0.9
          },
          "cost": 3,
          "desc": "Call a single colossal blade of judgement on the marked spot.",
          "trDesc": "İşaretli noktaya tek, devasa bir hüküm kılıcı çağır.",
          "slot": null
        },
        {
          "id": "runeseal",
          "name": "Rune Seal",
          "visual": "Rune Circle",
          "element": "arcane",
          "magic": true,
          "kind": "shield",
          "cd": 11,
          "power": 0,
          "shieldPct": 22,
          "duration": 5,
          "color": "#b388ff",
          "cost": 2,
          "desc": "Etch a warding rune that absorbs a share of incoming damage.",
          "trDesc": "Gelen hasarın bir kısmını yutan koruyucu bir rün kaz.",
          "slot": null
        },
        {
          "id": "treeoflife",
          "name": "Tree of Life",
          "visual": "Tree of Life",
          "element": "nature",
          "magic": true,
          "kind": "heal",
          "cd": 16,
          "healPct": 30,
          "radius": 120,
          "color": "#69f0ae",
          "power": 0,
          "cost": 3,
          "desc": "A great tree blooms and pours healing light over the ground.",
          "trDesc": "Ulu bir ağaç açar ve yere şifa ışığı döker.",
          "slot": null
        }
      ],
      "late": [
        {
          "id": "astralcollapse",
          "name": "Astral Collapse",
          "visual": "Starfall",
          "element": "arcane",
          "magic": true,
          "kind": "meteor",
          "cd": 36,
          "power": 3.6,
          "radius": 165,
          "delay": 0.4,
          "count": 5,
          "stagger": 0.12,
          "spreadRadius": 160,
          "range": 370,
          "color": "#ffe57f",
          "cost": 4,
          "late": true,
          "desc": "Five collapsing stars hammer the battlefield in quick succession.",
          "trDesc": "Beş çöken yıldız art arda savaş alanını döver.",
          "slot": null
        },
        {
          "id": "arcanedominion",
          "name": "Arcane Dominion",
          "visual": "Starfall",
          "element": "arcane",
          "magic": true,
          "kind": "meteor",
          "cd": 47,
          "power": 4.9,
          "radius": 210,
          "delay": 0.5,
          "count": 7,
          "stagger": 0.1,
          "spreadRadius": 200,
          "range": 400,
          "color": "#b388ff",
          "cost": 6,
          "late": true,
          "desc": "You claim the sky: seven stars answer your call at once.",
          "trDesc": "Gökyüzünü sahiplenirsin: yedi yıldız aynı anda çağrına uyar.",
          "slot": null
        }
      ],
      "legacy": {
        "q": {
          "name": "Holy Lance",
          "element": "holy",
          "kind": "beam",
          "cd": 6,
          "power": 2.32,
          "color": "#ffe082",
          "desc": "",
          "range": 259,
          "width": 26
        },
        "e": {
          "name": "Sacred Aegis",
          "element": "holy",
          "kind": "shield",
          "cd": 7.7,
          "power": 0,
          "color": "#ffe082",
          "desc": "",
          "shieldPct": 26,
          "duration": 5,
          "healPct": 13
        },
        "r": {
          "name": "Ascension",
          "element": "holy",
          "kind": "shield",
          "cd": 15.3,
          "power": 0,
          "color": "#ffe082",
          "desc": "",
          "shieldPct": 30,
          "duration": 6,
          "healPct": 19
        }
      }
    },
    "colossus": {
      "atkSpd": -16,
      "auto": {
        "element": "earth"
      },
      "q": {
        "id": "earthbreaker",
        "name": "Earthbreaker",
        "visual": "Earthbreaker",
        "element": "physical",
        "kind": "nova",
        "cd": 9,
        "power": 1.7,
        "radius": 110,
        "knockback": 120,
        "color": "#ffb74d",
        "cost": 0,
        "desc": "Slam the ground and send a shockwave through everything nearby.",
        "trDesc": "Yere vur; çevrendeki her şeyi sarsan bir şok dalgası yay.",
        "slot": "q",
        "defaultSlot": "q"
      },
      "e": {
        "id": "titanfist",
        "name": "Titan Fist",
        "visual": "Titan Fist",
        "element": "physical",
        "kind": "aoe",
        "cd": 12,
        "power": 2.7,
        "radius": 95,
        "offset": 55,
        "knockback": 220,
        "color": "#00e5ff",
        "cost": 0,
        "desc": "A colossal stone fist crashes down ahead of you.",
        "trDesc": "Önüne devasa bir taş yumruk iner.",
        "slot": "e",
        "defaultSlot": "e"
      },
      "r": {
        "id": "bladestorm",
        "name": "Blade Storm",
        "visual": "Blade Storm",
        "element": "physical",
        "kind": "orbit",
        "cd": 15,
        "power": 2.35,
        "radius": 118,
        "duration": 3.2,
        "tick": 0.35,
        "count": 8,
        "speed": 4.6,
        "color": "#80d8ff",
        "cost": 0,
        "desc": "Blades orbit you for three seconds, shredding anything they touch.",
        "trDesc": "Bıçaklar üç saniye etrafında döner, dokunduklarını parçalar.",
        "slot": "r",
        "defaultSlot": "r"
      },
      "pool": [
        {
          "id": "battlefocus",
          "name": "Battle Focus",
          "visual": "Rune Circle",
          "element": "physical",
          "kind": "buff",
          "cd": 18,
          "color": "#ffb74d",
          "cost": 2,
          "slot": null,
          "buff": {
            "stat": "attack",
            "pct": 30,
            "duration": 8
          },
          "desc": "Sharpen your focus: attack power rises for 8 seconds.",
          "trDesc": "Odağını topla: 8 saniye boyunca saldırı gücün yükselir."
        },
        {
          "id": "ironskin",
          "name": "Iron Skin",
          "visual": "",
          "element": "earth",
          "kind": "buff",
          "cd": 20,
          "color": "#b0bec5",
          "cost": 2,
          "slot": null,
          "buff": {
            "stat": "defense",
            "pct": 35,
            "duration": 8
          },
          "desc": "Harden your body: damage taken drops for 8 seconds.",
          "trDesc": "Bedenini sertleştir: 8 saniye boyunca aldığın hasar azalır."
        },
        {
          "id": "tremor",
          "name": "Tremor",
          "visual": "Earthbreaker",
          "element": "physical",
          "kind": "quake",
          "cd": 14,
          "power": 1.5,
          "radius": 130,
          "pulses": 3,
          "interval": 0.22,
          "knockback": 100,
          "color": "#a1887f",
          "cost": 2,
          "slot": null,
          "desc": "Smash the ground and send three rolling shockwaves outward.",
          "trDesc": "Yere vur; dışa doğru yayılan üç şok dalgası gönder."
        },
        {
          "id": "bonecage",
          "name": "Bone Cage",
          "visual": "Bone Cage",
          "element": "shadow",
          "kind": "ground",
          "cd": 12,
          "power": 1.4,
          "radius": 95,
          "duration": 2.4,
          "tick": 0.4,
          "color": "#d8d0b8",
          "status": {
            "type": "freeze",
            "duration": 1.2
          },
          "cost": 2,
          "desc": "Bones erupt around the target and lock it in place while they cut.",
          "trDesc": "Hedefin çevresinde kemikler yükselir, onu yerinde kilitler.",
          "slot": null
        },
        {
          "id": "glaciervall",
          "name": "Glacier Wall",
          "visual": "Glacier Wall",
          "element": "frost",
          "magic": true,
          "kind": "ground",
          "cd": 11,
          "power": 1.25,
          "radius": 80,
          "duration": 2.2,
          "tick": 0.45,
          "range": 280,
          "color": "#9fe2ff",
          "status": {
            "type": "freeze",
            "duration": 1
          },
          "cost": 2,
          "desc": "Raise a wall of ice ahead that slows and cuts anything crossing it.",
          "trDesc": "Önüne geçenleri yavaşlatan ve kesen bir buz duvarı dik.",
          "slot": null
        },
        {
          "name": "World Quake",
          "element": "earth",
          "kind": "quake",
          "cd": 15.3,
          "power": 4.15,
          "color": "#c9a227",
          "desc": "A technique carried over from the old travel kit.",
          "radius": 224,
          "pulses": 4,
          "interval": 0.2,
          "knockback": 220,
          "id": "legacy_colossus_r",
          "visual": "Whirlwind",
          "tr": "World Quake",
          "legacyFrom": "colossus.r",
          "trDesc": "A technique carried over from the old travel kit.",
          "cost": 3,
          "slot": null
        }
      ],
      "late": [
        {
          "id": "doomgavel",
          "name": "Doom Gavel",
          "visual": "Titan Fist",
          "element": "physical",
          "kind": "meteor",
          "cd": 34,
          "power": 3.4,
          "radius": 150,
          "delay": 0.45,
          "range": 340,
          "knockback": 260,
          "color": "#ffd54f",
          "cost": 4,
          "late": true,
          "desc": "A colossal gavel of stone falls from the sky and shatters the ground.",
          "trDesc": "Gökten devasa bir taş tokmak düşer ve yeri parçalar.",
          "slot": null
        },
        {
          "id": "worldbreaker",
          "name": "World Breaker",
          "visual": "Earthbreaker",
          "element": "physical",
          "kind": "nova",
          "cd": 45,
          "power": 4.6,
          "radius": 190,
          "knockback": 340,
          "color": "#ffb74d",
          "cost": 6,
          "late": true,
          "desc": "One strike cracks the world; everything around you is thrown back.",
          "trDesc": "Tek vuruş dünyayı çatlatır; çevrendeki her şey geri savrulur.",
          "slot": null
        }
      ],
      "legacy": {
        "q": {
          "name": "Titanic Fist",
          "element": "earth",
          "kind": "arc",
          "cd": 6,
          "power": 2.81,
          "color": "#c9a227",
          "desc": "",
          "radius": 129,
          "arc": 1.2
        },
        "e": {
          "name": "Colossal Guard",
          "element": "earth",
          "kind": "shield",
          "cd": 9.4,
          "power": 0,
          "color": "#c9a227",
          "desc": "",
          "shieldPct": 45,
          "duration": 5
        },
        "r": {
          "name": "World Quake",
          "element": "earth",
          "kind": "quake",
          "cd": 15.3,
          "power": 4.15,
          "color": "#c9a227",
          "desc": "",
          "radius": 224,
          "pulses": 4,
          "interval": 0.2,
          "knockback": 220
        }
      }
    }
  },
  "travelBiomes": {
    "verdant": {
      "id": "verdant",
      "label": "Verdant Wilds",
      "slogan": "Lush, alive, and never truly safe.",
      "palette": {
        "ground": "#4f8f3a",
        "fog": "#9bd47a",
        "sky": "#1a2e14",
        "accent": "#9ccc65",
        "grade": 0.08
      },
      "ambient": {
        "color": "#b8e986",
        "color2": "#ffd54f",
        "leaf": true,
        "fog": 0.16
      },
      "spawn": {
        "count": 3,
        "max": 6,
        "respawn": 9,
        "eliteChance": 0.05
      },
      "monsters": [
        {
          "painter": "goblin",
          "element": "nature",
          "weight": 26,
          "elite": false,
          "attackCooldown": 1.5,
          "exp": 48,
          "gold": 8,
          "speed": 138,
          "radius": 16,
          "kind": "thorn_goblin",
          "name": "Thornback Skirmisher",
          "color": "#6aa84f",
          "accent": "#d9f99d",
          "hp": 267,
          "damage": 39,
          "aggroRange": 290,
          "skills": [
            {
              "id": "lunge",
              "kind": "dash",
              "cd": 6.5,
              "range": 250,
              "windup": 0.55,
              "dist": 130,
              "power": 1.15,
              "radius": 34,
              "defense": "dodge",
              "attackKind": "heavy",
              "guardPressure": 25
            }
          ],
          "tags": [
            "humanoid",
            "plant"
          ],
          "attackKind": "medium",
          "attackDefense": "parryable",
          "attackTelegraph": 0.38,
          "guardPressure": 18
        },
        {
          "painter": "treant",
          "element": "nature",
          "weight": 14,
          "elite": false,
          "attackCooldown": 1.8,
          "exp": 106,
          "gold": 18,
          "speed": 82,
          "radius": 26,
          "kind": "moss_treant",
          "name": "Elder Moss Treant",
          "color": "#3f6b2a",
          "accent": "#a3e635",
          "hp": 638,
          "damage": 71,
          "aggroRange": 290,
          "skills": [
            {
              "id": "slam",
              "kind": "slam",
              "cd": 8.5,
              "range": 190,
              "windup": 1,
              "radius": 110,
              "power": 1.4,
              "defense": "dodge",
              "attackKind": "ultimate",
              "guardPressure": 45
            }
          ],
          "tags": [
            "plant"
          ],
          "attackKind": "heavy",
          "attackDefense": "parryable",
          "attackTelegraph": 0.65,
          "guardPressure": 25
        },
        {
          "painter": "wraith",
          "element": "shadow",
          "weight": 18,
          "elite": false,
          "attackCooldown": 1.2,
          "exp": 64,
          "gold": 11,
          "speed": 176,
          "radius": 15,
          "kind": "gloom_wraith",
          "name": "Gloom Wraith",
          "color": "#7b4dce",
          "accent": "#e9d5ff",
          "hp": 232,
          "damage": 48,
          "aggroRange": 290,
          "skills": [
            {
              "id": "bolt",
              "kind": "shot",
              "cd": 4.5,
              "range": 340,
              "windup": 0.55,
              "power": 1.1,
              "defense": "parryable",
              "attackKind": "medium",
              "guardPressure": 18
            }
          ],
          "tags": [
            "undead",
            "spirit"
          ],
          "attackKind": "light",
          "attackDefense": "parryable",
          "attackTelegraph": 0.22,
          "guardPressure": 12
        },
        {
          "painter": "spider",
          "element": "nature",
          "weight": 18,
          "elite": false,
          "attackCooldown": 1.5,
          "exp": 57,
          "gold": 10,
          "speed": 150,
          "radius": 17,
          "kind": "venomfang",
          "name": "Venomfang Spider",
          "color": "#3f6212",
          "accent": "#bef264",
          "hp": 249,
          "damage": 35,
          "status": {
            "type": "poison",
            "duration": 3,
            "dps": 10,
            "chance": 0.5
          },
          "aggroRange": 290,
          "skills": [
            {
              "id": "web",
              "kind": "slam",
              "cd": 7.5,
              "range": 200,
              "windup": 0.7,
              "radius": 80,
              "power": 0.9,
              "status": {
                "type": "slow",
                "duration": 2,
                "slow": 0.5
              },
              "defense": "dodge",
              "attackKind": "ultimate",
              "guardPressure": 45
            }
          ],
          "tags": [
            "beast",
            "plant"
          ],
          "attackKind": "medium",
          "attackDefense": "parryable",
          "attackTelegraph": 0.38,
          "guardPressure": 18
        },
        {
          "painter": "treant",
          "element": "nature",
          "weight": 3,
          "elite": true,
          "attackCooldown": 2,
          "exp": 242,
          "gold": 55,
          "speed": 90,
          "radius": 30,
          "kind": "ancient_guardian",
          "name": "Ancient Grove Guardian",
          "color": "#2f4f1f",
          "accent": "#fde68a",
          "hp": 1178,
          "damage": 101,
          "ability": "nova",
          "aggroRange": 340,
          "skills": [
            {
              "id": "slam",
              "kind": "slam",
              "cd": 8.5,
              "range": 190,
              "windup": 1,
              "radius": 110,
              "power": 1.4,
              "defense": "dodge",
              "attackKind": "ultimate",
              "guardPressure": 45
            },
            {
              "id": "quake",
              "kind": "slam",
              "cd": 6.5,
              "range": 210,
              "windup": 0.85,
              "radius": 130,
              "power": 1.45,
              "defense": "dodge",
              "attackKind": "ultimate",
              "guardPressure": 45
            }
          ],
          "tags": [
            "plant",
            "construct"
          ],
          "attackKind": "heavy",
          "attackDefense": "parryable",
          "attackTelegraph": 0.65,
          "guardPressure": 25
        },
        {
          "painter": "sporeling",
          "element": "nature",
          "weight": 16,
          "elite": false,
          "attackCooldown": 2.1,
          "exp": 20,
          "gold": 3,
          "speed": 112,
          "radius": 11,
          "kind": "sporeling",
          "name": "Sporeling",
          "color": "#a6c76a",
          "accent": "#eaff91",
          "hp": 190,
          "damage": 21,
          "aggroRange": 205,
          "skills": [
            {
              "id": "sporeling_cloud",
              "kind": "slam",
              "cd": 8,
              "range": 150,
              "windup": 0.7,
              "radius": 64,
              "power": 0.6,
              "defense": "dodge",
              "attackKind": "ultimate",
              "guardPressure": 45
            }
          ],
          "tags": [
            "plant",
            "slime"
          ],
          "attackKind": "medium",
          "attackDefense": "parryable",
          "attackTelegraph": 0.38,
          "guardPressure": 18
        },
        {
          "painter": "briarHound",
          "element": "nature",
          "weight": 9,
          "elite": false,
          "attackCooldown": 1.65,
          "exp": 58,
          "gold": 9,
          "speed": 174,
          "radius": 17,
          "kind": "briarbound_hound",
          "name": "Briarbound Hound",
          "color": "#526b36",
          "accent": "#b0c96a",
          "hp": 430,
          "damage": 46,
          "aggroRange": 315,
          "skills": [
            {
              "id": "briar_pounce",
              "kind": "dash",
              "cd": 6.5,
              "range": 245,
              "windup": 0.48,
              "dist": 145,
              "power": 1.15,
              "radius": 38,
              "defense": "dodge",
              "attackKind": "heavy",
              "guardPressure": 25
            }
          ],
          "tags": [
            "beast",
            "plant"
          ],
          "attackKind": "medium",
          "attackDefense": "parryable",
          "attackTelegraph": 0.38,
          "guardPressure": 18
        },
        {
          "painter": "myceliumOracle",
          "element": "nature",
          "weight": 2,
          "elite": true,
          "attackCooldown": 2.2,
          "exp": 470,
          "gold": 95,
          "speed": 84,
          "radius": 28,
          "kind": "mycelium_oracle",
          "name": "Mycelium Oracle",
          "color": "#667b4a",
          "accent": "#d5ff9c",
          "ability": "nova",
          "hp": 2100,
          "damage": 88,
          "aggroRange": 390,
          "skills": [
            {
              "id": "oracle_spore_nova",
              "kind": "slam",
              "cd": 9,
              "range": 200,
              "windup": 1.05,
              "radius": 130,
              "power": 1.15,
              "defense": "dodge",
              "attackKind": "ultimate",
              "guardPressure": 45
            },
            {
              "id": "oracle_root_prison",
              "kind": "slam",
              "cd": 13,
              "range": 180,
              "windup": 1.25,
              "radius": 95,
              "power": 0.85,
              "status": "root",
              "defense": "dodge",
              "attackKind": "ultimate",
              "guardPressure": 45
            },
            {
              "id": "oracle_spore_bolt",
              "kind": "shot",
              "cd": 3.8,
              "range": 340,
              "windup": 0.55,
              "power": 1,
              "defense": "parryable",
              "attackKind": "medium",
              "guardPressure": 18
            }
          ],
          "tags": [
            "plant",
            "humanoid"
          ],
          "attackKind": "heavy",
          "attackDefense": "parryable",
          "attackTelegraph": 0.65,
          "guardPressure": 25
        }
      ]
    },
    "ashen": {
      "id": "ashen",
      "label": "Ashen Wastes",
      "slogan": "Cinders, crags, and things that burn.",
      "palette": {
        "ground": "#5a4030",
        "fog": "#ffb27a",
        "sky": "#2a1408",
        "accent": "#ff8a50",
        "grade": 0.12
      },
      "ambient": {
        "color": "#ffb74d",
        "color2": "#ff7043",
        "ember": true,
        "fog": 0.24
      },
      "spawn": {
        "count": 3,
        "max": 6,
        "respawn": 11,
        "eliteChance": 0.055
      },
      "monsters": [
        {
          "painter": "goblin",
          "element": "fire",
          "weight": 26,
          "elite": false,
          "attackCooldown": 1.15,
          "exp": 55,
          "gold": 9,
          "speed": 160,
          "radius": 14,
          "kind": "cinder_imp",
          "name": "Cinder Imp",
          "color": "#c2410c",
          "accent": "#fde68a",
          "hp": 226,
          "damage": 46,
          "aggroRange": 290,
          "skills": [
            {
              "id": "lunge",
              "kind": "dash",
              "cd": 6.5,
              "range": 250,
              "windup": 0.55,
              "dist": 130,
              "power": 1.15,
              "radius": 34,
              "defense": "dodge",
              "attackKind": "heavy",
              "guardPressure": 25
            }
          ],
          "tags": [
            "demon",
            "humanoid"
          ],
          "attackKind": "light",
          "attackDefense": "parryable",
          "attackTelegraph": 0.22,
          "guardPressure": 12
        },
        {
          "painter": "knight",
          "element": "fire",
          "weight": 18,
          "elite": false,
          "attackCooldown": 1.5,
          "exp": 86,
          "gold": 15,
          "speed": 108,
          "radius": 18,
          "kind": "ash_revenant",
          "name": "Ash Revenant",
          "color": "#6b4f3a",
          "accent": "#ff8a65",
          "hp": 418,
          "damage": 60,
          "status": {
            "type": "burn",
            "duration": 2.5,
            "dps": 9,
            "chance": 0.4
          },
          "aggroRange": 290,
          "skills": [
            {
              "id": "charge",
              "kind": "dash",
              "cd": 7,
              "range": 280,
              "windup": 0.65,
              "dist": 155,
              "power": 1.3,
              "radius": 38,
              "defense": "dodge",
              "attackKind": "heavy",
              "guardPressure": 25
            }
          ],
          "tags": [
            "undead",
            "elemental"
          ],
          "attackKind": "heavy",
          "attackDefense": "parryable",
          "attackTelegraph": 0.65,
          "guardPressure": 25
        },
        {
          "painter": "golem",
          "element": "fire",
          "weight": 10,
          "elite": false,
          "attackCooldown": 2.1,
          "exp": 165,
          "gold": 30,
          "speed": 70,
          "radius": 30,
          "kind": "magma_behemoth",
          "name": "Magma Behemoth",
          "color": "#7f1d1d",
          "accent": "#f97316",
          "hp": 870,
          "damage": 97,
          "aggroRange": 290,
          "skills": [
            {
              "id": "slam",
              "kind": "slam",
              "cd": 8,
              "range": 170,
              "windup": 0.95,
              "radius": 100,
              "power": 1.5,
              "defense": "dodge",
              "attackKind": "ultimate",
              "guardPressure": 45
            }
          ],
          "tags": [
            "elemental",
            "construct"
          ],
          "attackKind": "heavy",
          "attackDefense": "parryable",
          "attackTelegraph": 0.65,
          "guardPressure": 25
        },
        {
          "painter": "wraith",
          "element": "fire",
          "weight": 24,
          "elite": false,
          "attackCooldown": 1,
          "exp": 37,
          "gold": 6,
          "speed": 210,
          "radius": 12,
          "kind": "cinder_bat",
          "name": "Cinder Bat",
          "color": "#9a3412",
          "accent": "#fdba74",
          "hp": 174,
          "damage": 32,
          "aggroRange": 290,
          "skills": [
            {
              "id": "bolt",
              "kind": "shot",
              "cd": 4.5,
              "range": 340,
              "windup": 0.55,
              "power": 1.1,
              "defense": "parryable",
              "attackKind": "medium",
              "guardPressure": 18
            }
          ],
          "tags": [
            "beast",
            "elemental"
          ],
          "attackKind": "light",
          "attackDefense": "parryable",
          "attackTelegraph": 0.22,
          "guardPressure": 12
        },
        {
          "painter": "golem",
          "element": "fire",
          "weight": 3,
          "elite": true,
          "attackCooldown": 1.9,
          "exp": 308,
          "gold": 70,
          "speed": 84,
          "radius": 34,
          "kind": "emberlord",
          "name": "Emberlord Vulkarr",
          "color": "#450a0a",
          "accent": "#fbbf24",
          "hp": 1488,
          "damage": 124,
          "ability": "nova",
          "status": {
            "type": "burn",
            "duration": 4,
            "dps": 20,
            "chance": 0.6
          },
          "aggroRange": 340,
          "skills": [
            {
              "id": "slam",
              "kind": "slam",
              "cd": 8,
              "range": 170,
              "windup": 0.95,
              "radius": 100,
              "power": 1.5,
              "defense": "dodge",
              "attackKind": "ultimate",
              "guardPressure": 45
            },
            {
              "id": "quake",
              "kind": "slam",
              "cd": 6.5,
              "range": 210,
              "windup": 0.85,
              "radius": 130,
              "power": 1.45,
              "defense": "dodge",
              "attackKind": "ultimate",
              "guardPressure": 45
            }
          ],
          "tags": [
            "demon",
            "elemental"
          ],
          "attackKind": "heavy",
          "attackDefense": "parryable",
          "attackTelegraph": 0.65,
          "guardPressure": 25
        },
        {
          "painter": "scoriaCrawler",
          "element": "fire",
          "weight": 16,
          "elite": false,
          "attackCooldown": 2,
          "exp": 22,
          "gold": 4,
          "speed": 108,
          "radius": 12,
          "kind": "scoria_crawler",
          "name": "Scoria Crawler",
          "color": "#34363b",
          "accent": "#ff6b27",
          "hp": 210,
          "damage": 24,
          "aggroRange": 195,
          "skills": [
            {
              "id": "scoria_ember_spit",
              "kind": "shot",
              "cd": 4.5,
              "range": 220,
              "windup": 0.5,
              "power": 0.7,
              "defense": "parryable",
              "attackKind": "medium",
              "guardPressure": 18
            }
          ],
          "tags": [
            "beast",
            "construct"
          ],
          "attackKind": "medium",
          "attackDefense": "parryable",
          "attackTelegraph": 0.38,
          "guardPressure": 18
        },
        {
          "painter": "furnaceHound",
          "element": "fire",
          "weight": 8,
          "elite": false,
          "attackCooldown": 1.8,
          "exp": 88,
          "gold": 14,
          "speed": 148,
          "radius": 20,
          "kind": "furnace_hound",
          "name": "Furnace Hound",
          "color": "#4c4648",
          "accent": "#ff8a3c",
          "hp": 640,
          "damage": 64,
          "aggroRange": 330,
          "skills": [
            {
              "id": "furnace_charge",
              "kind": "dash",
              "cd": 7,
              "range": 260,
              "windup": 0.7,
              "dist": 155,
              "power": 1.3,
              "radius": 48,
              "defense": "dodge",
              "attackKind": "heavy",
              "guardPressure": 25
            },
            {
              "id": "furnace_bite",
              "kind": "slam",
              "cd": 3.2,
              "range": 110,
              "windup": 0.45,
              "radius": 62,
              "power": 1.05,
              "status": "burn",
              "defense": "dodge",
              "attackKind": "ultimate",
              "guardPressure": 45
            }
          ],
          "tags": [
            "beast",
            "elemental"
          ],
          "attackKind": "heavy",
          "attackDefense": "parryable",
          "attackTelegraph": 0.65,
          "guardPressure": 25
        },
        {
          "painter": "pyrewingMatriarch",
          "element": "fire",
          "weight": 2,
          "elite": true,
          "attackCooldown": 2.1,
          "exp": 600,
          "gold": 125,
          "speed": 116,
          "radius": 29,
          "kind": "pyrewing_matriarch",
          "name": "Pyrewing Matriarch",
          "color": "#3b2525",
          "accent": "#ffb64a",
          "ability": "nova",
          "hp": 2400,
          "damage": 100,
          "aggroRange": 430,
          "skills": [
            {
              "id": "pyre_meteor_rain",
              "kind": "slam",
              "cd": 12,
              "range": 240,
              "windup": 1.4,
              "radius": 160,
              "power": 1.35,
              "status": "burn",
              "defense": "dodge",
              "attackKind": "ultimate",
              "guardPressure": 45
            },
            {
              "id": "pyre_infernal_dive",
              "kind": "dash",
              "cd": 8,
              "range": 300,
              "windup": 0.9,
              "dist": 210,
              "power": 1.5,
              "radius": 58,
              "defense": "dodge",
              "attackKind": "heavy",
              "guardPressure": 25
            },
            {
              "id": "pyre_flame_cyclone",
              "kind": "slam",
              "cd": 15,
              "range": 210,
              "windup": 1.1,
              "radius": 115,
              "power": 1.1,
              "status": "burn",
              "defense": "dodge",
              "attackKind": "ultimate",
              "guardPressure": 45
            }
          ],
          "tags": [
            "dragon",
            "elemental"
          ],
          "attackKind": "heavy",
          "attackDefense": "parryable",
          "attackTelegraph": 0.65,
          "guardPressure": 25
        }
      ]
    },
    "frost": {
      "id": "frost",
      "label": "Frozen Tundra",
      "slogan": "Where the wind bites and the dead do not sleep.",
      "palette": {
        "ground": "#e8f7ff",
        "fog": "#d7f2ff",
        "sky": "#0d2230",
        "accent": "#8fe4ff",
        "grade": 0.1
      },
      "ambient": {
        "color": "#d7f2ff",
        "color2": "#a5d8ff",
        "snow": true,
        "fog": 0.2
      },
      "spawn": {
        "count": 3,
        "max": 6,
        "respawn": 10,
        "eliteChance": 0.05
      },
      "monsters": [
        {
          "painter": "beast",
          "element": "frost",
          "weight": 26,
          "elite": false,
          "attackCooldown": 1.15,
          "exp": 62,
          "gold": 10,
          "speed": 190,
          "radius": 17,
          "kind": "frost_wolf",
          "name": "Frost Wolf",
          "color": "#93c5fd",
          "accent": "#e0f2fe",
          "hp": 278,
          "damage": 44,
          "aggroRange": 290,
          "skills": [
            {
              "id": "pounce",
              "kind": "dash",
              "cd": 6,
              "range": 300,
              "windup": 0.6,
              "dist": 165,
              "power": 1.25,
              "radius": 40,
              "defense": "dodge",
              "attackKind": "heavy",
              "guardPressure": 25
            }
          ],
          "tags": [
            "beast"
          ],
          "attackKind": "light",
          "attackDefense": "parryable",
          "attackTelegraph": 0.22,
          "guardPressure": 12
        },
        {
          "painter": "wraith",
          "element": "frost",
          "weight": 18,
          "elite": false,
          "attackCooldown": 1.5,
          "exp": 70,
          "gold": 12,
          "speed": 150,
          "radius": 15,
          "kind": "ice_wraith",
          "name": "Ice Wraith",
          "color": "#3b82f6",
          "accent": "#e0f2fe",
          "hp": 255,
          "damage": 53,
          "status": {
            "type": "freeze",
            "duration": 1.1,
            "chance": 0.28
          },
          "aggroRange": 290,
          "skills": [
            {
              "id": "bolt",
              "kind": "shot",
              "cd": 4.5,
              "range": 340,
              "windup": 0.55,
              "power": 1.1,
              "defense": "parryable",
              "attackKind": "medium",
              "guardPressure": 18
            }
          ],
          "tags": [
            "undead",
            "spirit"
          ],
          "attackKind": "medium",
          "attackDefense": "parryable",
          "attackTelegraph": 0.38,
          "guardPressure": 18
        },
        {
          "painter": "golem",
          "element": "frost",
          "weight": 10,
          "elite": false,
          "attackCooldown": 2.2,
          "exp": 165,
          "gold": 28,
          "speed": 72,
          "radius": 30,
          "kind": "glacier_golem",
          "name": "Glacier Golem",
          "color": "#1e40af",
          "accent": "#bfdbfe",
          "hp": 957,
          "damage": 90,
          "status": {
            "type": "slow",
            "duration": 2,
            "slow": 0.5,
            "chance": 0.5
          },
          "aggroRange": 290,
          "skills": [
            {
              "id": "slam",
              "kind": "slam",
              "cd": 8,
              "range": 170,
              "windup": 0.95,
              "radius": 100,
              "power": 1.5,
              "defense": "dodge",
              "attackKind": "ultimate",
              "guardPressure": 45
            }
          ],
          "tags": [
            "construct",
            "elemental"
          ],
          "attackKind": "heavy",
          "attackDefense": "parryable",
          "attackTelegraph": 0.65,
          "guardPressure": 25
        },
        {
          "painter": "spider",
          "element": "frost",
          "weight": 22,
          "elite": false,
          "attackCooldown": 1.5,
          "exp": 53,
          "gold": 9,
          "speed": 168,
          "radius": 16,
          "kind": "snow_stalker",
          "name": "Snow Stalker",
          "color": "#bfdbfe",
          "accent": "#ffffff",
          "hp": 244,
          "damage": 39,
          "aggroRange": 290,
          "skills": [
            {
              "id": "web",
              "kind": "slam",
              "cd": 7.5,
              "range": 200,
              "windup": 0.7,
              "radius": 80,
              "power": 0.9,
              "status": {
                "type": "slow",
                "duration": 2,
                "slow": 0.5
              },
              "defense": "dodge",
              "attackKind": "ultimate",
              "guardPressure": 45
            }
          ],
          "tags": [
            "beast"
          ],
          "attackKind": "medium",
          "attackDefense": "parryable",
          "attackTelegraph": 0.38,
          "guardPressure": 18
        },
        {
          "painter": "beast",
          "element": "frost",
          "weight": 3,
          "elite": true,
          "attackCooldown": 1.8,
          "exp": 330,
          "gold": 75,
          "speed": 104,
          "radius": 36,
          "kind": "permafrost_wyrm",
          "name": "Permafrost Wyrm",
          "color": "#1d4ed8",
          "accent": "#f0f9ff",
          "hp": 1612,
          "damage": 117,
          "ability": "nova",
          "status": {
            "type": "freeze",
            "duration": 1.6,
            "chance": 0.5
          },
          "aggroRange": 340,
          "skills": [
            {
              "id": "pounce",
              "kind": "dash",
              "cd": 6,
              "range": 300,
              "windup": 0.6,
              "dist": 165,
              "power": 1.25,
              "radius": 40,
              "defense": "dodge",
              "attackKind": "heavy",
              "guardPressure": 25
            },
            {
              "id": "quake",
              "kind": "slam",
              "cd": 6.5,
              "range": 210,
              "windup": 0.85,
              "radius": 130,
              "power": 1.45,
              "defense": "dodge",
              "attackKind": "ultimate",
              "guardPressure": 45
            }
          ],
          "tags": [
            "dragon"
          ],
          "attackKind": "heavy",
          "attackDefense": "parryable",
          "attackTelegraph": 0.65,
          "guardPressure": 25
        },
        {
          "painter": "archer",
          "element": "frost",
          "weight": 16,
          "elite": false,
          "attackCooldown": 1.6,
          "exp": 97,
          "gold": 18,
          "speed": 128,
          "radius": 15,
          "kind": "rime_archer",
          "name": "Rime Archer",
          "color": "#7dd3fc",
          "accent": "#f0f9ff",
          "hp": 360,
          "damage": 53,
          "ability": "ranged",
          "aggroRange": 290,
          "skills": [
            {
              "id": "aimed",
              "kind": "shot",
              "cd": 3.6,
              "range": 380,
              "windup": 0.75,
              "power": 1.15,
              "defense": "parryable",
              "attackKind": "medium",
              "guardPressure": 18
            },
            {
              "id": "volley",
              "kind": "volley",
              "cd": 6.5,
              "range": 360,
              "windup": 0.7,
              "power": 0.9,
              "count": 3,
              "spread": 0.22,
              "defense": "parryable",
              "attackKind": "medium",
              "guardPressure": 18
            }
          ],
          "tags": [
            "humanoid",
            "undead"
          ],
          "attackKind": "medium",
          "attackDefense": "parryable",
          "attackTelegraph": 0.38,
          "guardPressure": 18
        },
        {
          "painter": "archer",
          "element": "frost",
          "weight": 14,
          "elite": false,
          "attackCooldown": 1.6,
          "exp": 101,
          "gold": 19,
          "speed": 126,
          "radius": 15,
          "kind": "grave_archer",
          "name": "Grave Archer",
          "color": "#9ca3af",
          "accent": "#a7f3d0",
          "hp": 371,
          "damage": 55,
          "ability": "ranged",
          "aggroRange": 290,
          "skills": [
            {
              "id": "aimed",
              "kind": "shot",
              "cd": 3.6,
              "range": 380,
              "windup": 0.75,
              "power": 1.15,
              "defense": "parryable",
              "attackKind": "medium",
              "guardPressure": 18
            },
            {
              "id": "volley",
              "kind": "volley",
              "cd": 6.5,
              "range": 360,
              "windup": 0.7,
              "power": 0.9,
              "count": 3,
              "spread": 0.22,
              "defense": "parryable",
              "attackKind": "medium",
              "guardPressure": 18
            }
          ],
          "tags": [
            "undead",
            "humanoid"
          ],
          "attackKind": "medium",
          "attackDefense": "parryable",
          "attackTelegraph": 0.38,
          "guardPressure": 18
        },
        {
          "painter": "rimeToad",
          "element": "frost",
          "weight": 15,
          "elite": false,
          "attackCooldown": 2.25,
          "exp": 24,
          "gold": 4,
          "speed": 88,
          "radius": 15,
          "kind": "rime_toad",
          "name": "Rime Toad",
          "color": "#8ab8c4",
          "accent": "#e3ffff",
          "hp": 250,
          "damage": 27,
          "aggroRange": 205,
          "skills": [
            {
              "id": "rime_frost_glob",
              "kind": "shot",
              "cd": 5,
              "range": 240,
              "windup": 0.55,
              "power": 0.75,
              "status": "slow",
              "defense": "parryable",
              "attackKind": "medium",
              "guardPressure": 18
            }
          ],
          "tags": [
            "beast"
          ],
          "attackKind": "medium",
          "attackDefense": "parryable",
          "attackTelegraph": 0.38,
          "guardPressure": 18
        },
        {
          "painter": "borealStag",
          "element": "frost",
          "weight": 8,
          "elite": false,
          "attackCooldown": 1.9,
          "exp": 98,
          "gold": 16,
          "speed": 162,
          "radius": 21,
          "kind": "boreal_stag",
          "name": "Boreal Stag",
          "color": "#b9d3d9",
          "accent": "#9beaff",
          "hp": 700,
          "damage": 70,
          "aggroRange": 350,
          "skills": [
            {
              "id": "stag_crystal_charge",
              "kind": "dash",
              "cd": 7,
              "range": 275,
              "windup": 0.75,
              "dist": 175,
              "power": 1.35,
              "radius": 50,
              "defense": "dodge",
              "attackKind": "heavy",
              "guardPressure": 25
            },
            {
              "id": "stag_shard_burst",
              "kind": "slam",
              "cd": 9,
              "range": 160,
              "windup": 0.8,
              "radius": 88,
              "power": 0.9,
              "status": "slow",
              "defense": "dodge",
              "attackKind": "ultimate",
              "guardPressure": 45
            }
          ],
          "tags": [
            "beast"
          ],
          "attackKind": "heavy",
          "attackDefense": "parryable",
          "attackTelegraph": 0.65,
          "guardPressure": 25
        },
        {
          "painter": "whiteoutSiren",
          "element": "frost",
          "weight": 5,
          "elite": false,
          "attackCooldown": 2.3,
          "exp": 90,
          "gold": 15,
          "speed": 118,
          "radius": 16,
          "kind": "whiteout_siren",
          "name": "Whiteout Siren",
          "color": "#c6eaf0",
          "accent": "#b6faff",
          "hp": 470,
          "damage": 58,
          "aggroRange": 380,
          "skills": [
            {
              "id": "siren_winter_scream",
              "kind": "slam",
              "cd": 10,
              "range": 200,
              "windup": 1.15,
              "radius": 110,
              "power": 1,
              "status": "freeze",
              "defense": "dodge",
              "attackKind": "ultimate",
              "guardPressure": 45
            },
            {
              "id": "siren_ice_shard",
              "kind": "shot",
              "cd": 3.6,
              "range": 330,
              "windup": 0.5,
              "power": 0.9,
              "defense": "parryable",
              "attackKind": "medium",
              "guardPressure": 18
            }
          ],
          "tags": [
            "spirit",
            "humanoid"
          ],
          "attackKind": "medium",
          "attackDefense": "parryable",
          "attackTelegraph": 0.38,
          "guardPressure": 18
        },
        {
          "painter": "borealDevourer",
          "element": "frost",
          "weight": 2,
          "elite": true,
          "attackCooldown": 2.15,
          "exp": 660,
          "gold": 140,
          "speed": 98,
          "radius": 31,
          "kind": "boreal_devourer",
          "name": "Boreal Devourer",
          "color": "#527f91",
          "accent": "#b5f3ff",
          "ability": "nova",
          "hp": 2500,
          "damage": 110,
          "aggroRange": 440,
          "skills": [
            {
              "id": "devourer_glacial_breath",
              "kind": "slam",
              "cd": 8,
              "range": 230,
              "windup": 0.9,
              "radius": 150,
              "power": 1.3,
              "status": "slow",
              "defense": "dodge",
              "attackKind": "ultimate",
              "guardPressure": 45
            },
            {
              "id": "devourer_ground_shatter",
              "kind": "slam",
              "cd": 12,
              "range": 210,
              "windup": 1.25,
              "radius": 145,
              "power": 1.2,
              "defense": "dodge",
              "attackKind": "ultimate",
              "guardPressure": 45
            },
            {
              "id": "devourer_icefall",
              "kind": "shot",
              "cd": 4,
              "range": 380,
              "windup": 0.6,
              "power": 1.05,
              "defense": "parryable",
              "attackKind": "medium",
              "guardPressure": 18
            }
          ],
          "tags": [
            "beast",
            "demon"
          ],
          "attackKind": "heavy",
          "attackDefense": "parryable",
          "attackTelegraph": 0.65,
          "guardPressure": 25
        }
      ]
    },
    "swamp": {
      "id": "swamp",
      "label": "Mirefen Marsh",
      "slogan": "Every step squelches. Something is always watching.",
      "palette": {
        "ground": "#3f5a34",
        "fog": "#9bbf6b",
        "sky": "#141f12",
        "accent": "#84cc16",
        "grade": 0.14
      },
      "ambient": {
        "color": "#bef264",
        "color2": "#65a30d",
        "bubble": true,
        "fog": 0.3
      },
      "spawn": {
        "count": 3,
        "max": 7,
        "respawn": 9,
        "eliteChance": 0.055
      },
      "monsters": [
        {
          "painter": "goblin",
          "element": "poison",
          "weight": 26,
          "elite": false,
          "attackCooldown": 1.5,
          "exp": 51,
          "gold": 8,
          "speed": 140,
          "radius": 16,
          "kind": "bog_lurker",
          "name": "Bog Lurker",
          "color": "#4d7c0f",
          "accent": "#d9f99d",
          "hp": 255,
          "damage": 41,
          "status": {
            "type": "poison",
            "duration": 3,
            "dps": 9,
            "chance": 0.45
          },
          "aggroRange": 290,
          "skills": [
            {
              "id": "lunge",
              "kind": "dash",
              "cd": 6.5,
              "range": 250,
              "windup": 0.55,
              "dist": 130,
              "power": 1.15,
              "radius": 34,
              "defense": "dodge",
              "attackKind": "heavy",
              "guardPressure": 25
            }
          ],
          "tags": [
            "beast",
            "slime"
          ],
          "attackKind": "medium",
          "attackDefense": "parryable",
          "attackTelegraph": 0.38,
          "guardPressure": 18
        },
        {
          "painter": "wraith",
          "element": "poison",
          "weight": 18,
          "elite": false,
          "attackCooldown": 1.5,
          "exp": 79,
          "gold": 14,
          "speed": 120,
          "radius": 16,
          "kind": "mire_hag",
          "name": "Mire Hag",
          "color": "#6d28d9",
          "accent": "#a3e635",
          "hp": 302,
          "damage": 55,
          "ability": "ranged",
          "status": {
            "type": "poison",
            "duration": 4,
            "dps": 12,
            "chance": 0.55
          },
          "aggroRange": 290,
          "skills": [
            {
              "id": "bolt",
              "kind": "shot",
              "cd": 4.5,
              "range": 340,
              "windup": 0.55,
              "power": 1.1,
              "defense": "parryable",
              "attackKind": "medium",
              "guardPressure": 18
            },
            {
              "id": "volley",
              "kind": "volley",
              "cd": 6.5,
              "range": 360,
              "windup": 0.7,
              "power": 0.9,
              "count": 3,
              "spread": 0.22,
              "defense": "parryable",
              "attackKind": "medium",
              "guardPressure": 18
            }
          ],
          "tags": [
            "humanoid"
          ],
          "attackKind": "medium",
          "attackDefense": "parryable",
          "attackTelegraph": 0.38,
          "guardPressure": 18
        },
        {
          "painter": "treant",
          "element": "nature",
          "weight": 12,
          "elite": false,
          "attackCooldown": 1.9,
          "exp": 121,
          "gold": 20,
          "speed": 76,
          "radius": 27,
          "kind": "rot_treant",
          "name": "Rot Treant",
          "color": "#3f4a1f",
          "accent": "#84cc16",
          "hp": 725,
          "damage": 76,
          "aggroRange": 290,
          "skills": [
            {
              "id": "slam",
              "kind": "slam",
              "cd": 8.5,
              "range": 190,
              "windup": 1,
              "radius": 110,
              "power": 1.4,
              "defense": "dodge",
              "attackKind": "ultimate",
              "guardPressure": 45
            }
          ],
          "tags": [
            "plant",
            "undead"
          ],
          "attackKind": "heavy",
          "attackDefense": "parryable",
          "attackTelegraph": 0.65,
          "guardPressure": 25
        },
        {
          "painter": "spider",
          "element": "blood",
          "weight": 22,
          "elite": false,
          "attackCooldown": 1.5,
          "exp": 44,
          "gold": 7,
          "speed": 180,
          "radius": 14,
          "kind": "leech_swarm",
          "name": "Leech Swarm",
          "color": "#7f1d1d",
          "accent": "#fecaca",
          "hp": 197,
          "damage": 32,
          "status": {
            "type": "bleed",
            "duration": 3,
            "dps": 8,
            "chance": 0.5
          },
          "aggroRange": 290,
          "skills": [
            {
              "id": "web",
              "kind": "slam",
              "cd": 7.5,
              "range": 200,
              "windup": 0.7,
              "radius": 80,
              "power": 0.9,
              "status": {
                "type": "slow",
                "duration": 2,
                "slow": 0.5
              },
              "defense": "dodge",
              "attackKind": "ultimate",
              "guardPressure": 45
            }
          ],
          "tags": [
            "beast",
            "slime"
          ],
          "attackKind": "medium",
          "attackDefense": "parryable",
          "attackTelegraph": 0.38,
          "guardPressure": 18
        },
        {
          "painter": "knight",
          "element": "poison",
          "weight": 3,
          "elite": true,
          "attackCooldown": 1.8,
          "exp": 297,
          "gold": 68,
          "speed": 92,
          "radius": 32,
          "kind": "plaguebringer",
          "name": "Plaguebringer Morvane",
          "color": "#3b3a1a",
          "accent": "#a3e635",
          "hp": 1364,
          "damage": 110,
          "ability": "nova",
          "status": {
            "type": "poison",
            "duration": 5,
            "dps": 18,
            "chance": 0.7
          },
          "aggroRange": 340,
          "skills": [
            {
              "id": "charge",
              "kind": "dash",
              "cd": 7,
              "range": 280,
              "windup": 0.65,
              "dist": 155,
              "power": 1.3,
              "radius": 38,
              "defense": "dodge",
              "attackKind": "heavy",
              "guardPressure": 25
            },
            {
              "id": "quake",
              "kind": "slam",
              "cd": 6.5,
              "range": 210,
              "windup": 0.85,
              "radius": 130,
              "power": 1.45,
              "defense": "dodge",
              "attackKind": "ultimate",
              "guardPressure": 45
            }
          ],
          "tags": [
            "humanoid",
            "undead"
          ],
          "attackKind": "heavy",
          "attackDefense": "parryable",
          "attackTelegraph": 0.65,
          "guardPressure": 25
        },
        {
          "painter": "mireling",
          "element": "poison",
          "weight": 16,
          "elite": false,
          "attackCooldown": 1.9,
          "exp": 20,
          "gold": 3,
          "speed": 122,
          "radius": 10,
          "kind": "mireling",
          "name": "Mireling",
          "color": "#78905a",
          "accent": "#d5ff69",
          "hp": 200,
          "damage": 22,
          "aggroRange": 190,
          "skills": [
            {
              "id": "mireling_leech_bite",
              "kind": "dash",
              "cd": 5.5,
              "range": 120,
              "windup": 0.35,
              "dist": 65,
              "power": 0.8,
              "radius": 22,
              "status": "poison",
              "defense": "dodge",
              "attackKind": "heavy",
              "guardPressure": 25
            }
          ],
          "tags": [
            "slime"
          ],
          "attackKind": "medium",
          "attackDefense": "parryable",
          "attackTelegraph": 0.38,
          "guardPressure": 18
        },
        {
          "painter": "corpseLantern",
          "element": "poison",
          "weight": 6,
          "elite": false,
          "attackCooldown": 2.15,
          "exp": 88,
          "gold": 15,
          "speed": 94,
          "radius": 17,
          "kind": "corpse_lantern",
          "name": "Corpse Lantern",
          "color": "#58675b",
          "accent": "#8dff9b",
          "hp": 450,
          "damage": 55,
          "aggroRange": 360,
          "skills": [
            {
              "id": "lantern_spectral_burst",
              "kind": "slam",
              "cd": 9,
              "range": 190,
              "windup": 0.9,
              "radius": 95,
              "power": 1,
              "defense": "dodge",
              "attackKind": "ultimate",
              "guardPressure": 45
            },
            {
              "id": "lantern_false_light",
              "kind": "shot",
              "cd": 4.2,
              "range": 300,
              "windup": 0.55,
              "power": 0.85,
              "status": "poison",
              "defense": "parryable",
              "attackKind": "medium",
              "guardPressure": 18
            }
          ],
          "tags": [
            "undead",
            "spirit"
          ],
          "attackKind": "medium",
          "attackDefense": "parryable",
          "attackTelegraph": 0.38,
          "guardPressure": 18
        },
        {
          "painter": "drownedMatron",
          "element": "poison",
          "weight": 2,
          "elite": true,
          "attackCooldown": 2.35,
          "exp": 620,
          "gold": 130,
          "speed": 80,
          "radius": 30,
          "kind": "drowned_matron",
          "name": "Drowned Matron",
          "color": "#617b63",
          "accent": "#d8ff92",
          "ability": "nova",
          "hp": 2300,
          "damage": 102,
          "aggroRange": 410,
          "skills": [
            {
              "id": "matron_mire_wave",
              "kind": "slam",
              "cd": 10,
              "range": 230,
              "windup": 1.1,
              "radius": 150,
              "power": 1.2,
              "status": "poison",
              "defense": "dodge",
              "attackKind": "ultimate",
              "guardPressure": 45
            },
            {
              "id": "matron_grasping_tendrils",
              "kind": "slam",
              "cd": 7,
              "range": 190,
              "windup": 0.8,
              "radius": 100,
              "power": 1.15,
              "status": "root",
              "defense": "dodge",
              "attackKind": "ultimate",
              "guardPressure": 45
            },
            {
              "id": "matron_rotting_flood",
              "kind": "slam",
              "cd": 15,
              "range": 250,
              "windup": 1.6,
              "radius": 180,
              "power": 1.4,
              "status": "poison",
              "defense": "dodge",
              "attackKind": "ultimate",
              "guardPressure": 45
            }
          ],
          "tags": [
            "spirit",
            "undead"
          ],
          "attackKind": "heavy",
          "attackDefense": "parryable",
          "attackTelegraph": 0.65,
          "guardPressure": 25
        }
      ]
    },
    "cursed": {
      "id": "cursed",
      "label": "Cursed Reach",
      "slogan": "The sky is wrong here. So is everything below it.",
      "palette": {
        "ground": "#3a2c4a",
        "fog": "#c084fc",
        "sky": "#120a1c",
        "accent": "#c084fc",
        "grade": 0.16
      },
      "ambient": {
        "color": "#c084fc",
        "color2": "#f472b6",
        "void": true,
        "fog": 0.34
      },
      "spawn": {
        "count": 3,
        "max": 7,
        "respawn": 10,
        "eliteChance": 0.06
      },
      "monsters": [
        {
          "painter": "knight",
          "element": "shadow",
          "weight": 24,
          "elite": false,
          "attackCooldown": 1.5,
          "exp": 92,
          "gold": 16,
          "speed": 116,
          "radius": 19,
          "kind": "hollow_knight",
          "name": "Hollow Knight",
          "color": "#3f3f46",
          "accent": "#a78bfa",
          "hp": 441,
          "damage": 64,
          "aggroRange": 290,
          "skills": [
            {
              "id": "charge",
              "kind": "dash",
              "cd": 7,
              "range": 280,
              "windup": 0.65,
              "dist": 155,
              "power": 1.3,
              "radius": 38,
              "defense": "dodge",
              "attackKind": "heavy",
              "guardPressure": 25
            }
          ],
          "tags": [
            "undead",
            "humanoid"
          ],
          "attackKind": "heavy",
          "attackDefense": "parryable",
          "attackTelegraph": 0.65,
          "guardPressure": 25
        },
        {
          "painter": "wraith",
          "element": "blood",
          "weight": 18,
          "elite": false,
          "attackCooldown": 1.5,
          "exp": 88,
          "gold": 15,
          "speed": 128,
          "radius": 16,
          "kind": "blood_seer",
          "name": "Blood Seer",
          "color": "#7f1d1d",
          "accent": "#fb7185",
          "hp": 302,
          "damage": 62,
          "ability": "ranged",
          "status": {
            "type": "bleed",
            "duration": 3,
            "dps": 12,
            "chance": 0.5
          },
          "aggroRange": 290,
          "skills": [
            {
              "id": "bolt",
              "kind": "shot",
              "cd": 4.5,
              "range": 340,
              "windup": 0.55,
              "power": 1.1,
              "defense": "parryable",
              "attackKind": "medium",
              "guardPressure": 18
            },
            {
              "id": "volley",
              "kind": "volley",
              "cd": 6.5,
              "range": 360,
              "windup": 0.7,
              "power": 0.9,
              "count": 3,
              "spread": 0.22,
              "defense": "parryable",
              "attackKind": "medium",
              "guardPressure": 18
            }
          ],
          "tags": [
            "humanoid"
          ],
          "attackKind": "heavy",
          "attackDefense": "parryable",
          "attackTelegraph": 0.65,
          "guardPressure": 25
        },
        {
          "painter": "knight",
          "element": "shadow",
          "weight": 12,
          "elite": false,
          "attackCooldown": 2,
          "exp": 154,
          "gold": 26,
          "speed": 88,
          "radius": 28,
          "kind": "bone_warden",
          "name": "Bone Warden",
          "color": "#4b3f2f",
          "accent": "#fde68a",
          "hp": 812,
          "damage": 85,
          "aggroRange": 290,
          "skills": [
            {
              "id": "charge",
              "kind": "dash",
              "cd": 7,
              "range": 280,
              "windup": 0.65,
              "dist": 155,
              "power": 1.3,
              "radius": 38,
              "defense": "dodge",
              "attackKind": "heavy",
              "guardPressure": 25
            }
          ],
          "tags": [
            "undead",
            "construct"
          ],
          "attackKind": "heavy",
          "attackDefense": "parryable",
          "attackTelegraph": 0.65,
          "guardPressure": 25
        },
        {
          "painter": "wraith",
          "element": "shadow",
          "weight": 22,
          "elite": false,
          "attackCooldown": 1.1,
          "exp": 73,
          "gold": 12,
          "speed": 196,
          "radius": 15,
          "kind": "nightmare",
          "name": "Nightmare",
          "color": "#4c1d95",
          "accent": "#e879f9",
          "hp": 273,
          "damage": 51,
          "aggroRange": 290,
          "skills": [
            {
              "id": "bolt",
              "kind": "shot",
              "cd": 4.5,
              "range": 340,
              "windup": 0.55,
              "power": 1.1,
              "defense": "parryable",
              "attackKind": "medium",
              "guardPressure": 18
            }
          ],
          "tags": [
            "spirit",
            "demon"
          ],
          "attackKind": "light",
          "attackDefense": "parryable",
          "attackTelegraph": 0.22,
          "guardPressure": 12
        },
        {
          "painter": "golem",
          "element": "shadow",
          "weight": 3,
          "elite": true,
          "attackCooldown": 1.7,
          "exp": 374,
          "gold": 85,
          "speed": 96,
          "radius": 36,
          "kind": "dread_sovereign",
          "name": "Dread Sovereign",
          "color": "#1e1b4b",
          "accent": "#c084fc",
          "hp": 1860,
          "damage": 136,
          "ability": "nova",
          "status": {
            "type": "stun",
            "duration": 0.8,
            "chance": 0.4
          },
          "aggroRange": 340,
          "skills": [
            {
              "id": "slam",
              "kind": "slam",
              "cd": 8,
              "range": 170,
              "windup": 0.95,
              "radius": 100,
              "power": 1.5,
              "defense": "dodge",
              "attackKind": "ultimate",
              "guardPressure": 45
            },
            {
              "id": "quake",
              "kind": "slam",
              "cd": 6.5,
              "range": 210,
              "windup": 0.85,
              "radius": 130,
              "power": 1.45,
              "defense": "dodge",
              "attackKind": "ultimate",
              "guardPressure": 45
            }
          ],
          "tags": [
            "demon",
            "humanoid"
          ],
          "attackKind": "heavy",
          "attackDefense": "parryable",
          "attackTelegraph": 0.65,
          "guardPressure": 25
        },
        {
          "painter": "archer",
          "element": "shadow",
          "weight": 16,
          "elite": false,
          "attackCooldown": 1.55,
          "exp": 106,
          "gold": 20,
          "speed": 124,
          "radius": 15,
          "kind": "bone_archer",
          "name": "Bone Archer",
          "color": "#a8a29e",
          "accent": "#c084fc",
          "hp": 406,
          "damage": 60,
          "ability": "ranged",
          "aggroRange": 290,
          "skills": [
            {
              "id": "aimed",
              "kind": "shot",
              "cd": 3.6,
              "range": 380,
              "windup": 0.75,
              "power": 1.15,
              "defense": "parryable",
              "attackKind": "medium",
              "guardPressure": 18
            },
            {
              "id": "volley",
              "kind": "volley",
              "cd": 6.5,
              "range": 360,
              "windup": 0.7,
              "power": 0.9,
              "count": 3,
              "spread": 0.22,
              "defense": "parryable",
              "attackKind": "medium",
              "guardPressure": 18
            }
          ],
          "tags": [
            "undead"
          ],
          "attackKind": "heavy",
          "attackDefense": "parryable",
          "attackTelegraph": 0.65,
          "guardPressure": 25
        },
        {
          "painter": "graveMoth",
          "element": "shadow",
          "weight": 15,
          "elite": false,
          "attackCooldown": 1.8,
          "exp": 23,
          "gold": 4,
          "speed": 148,
          "radius": 12,
          "kind": "grave_moth",
          "name": "Grave Moth",
          "color": "#282934",
          "accent": "#ff5d70",
          "hp": 215,
          "damage": 24,
          "aggroRange": 240,
          "skills": [
            {
              "id": "moth_death_dust",
              "kind": "slam",
              "cd": 8,
              "range": 140,
              "windup": 0.55,
              "radius": 60,
              "power": 0.6,
              "status": "bleed",
              "defense": "dodge",
              "attackKind": "ultimate",
              "guardPressure": 45
            }
          ],
          "tags": [
            "beast",
            "spirit"
          ],
          "attackKind": "medium",
          "attackDefense": "parryable",
          "attackTelegraph": 0.38,
          "guardPressure": 18
        },
        {
          "painter": "chainboundPenitent",
          "element": "shadow",
          "weight": 7,
          "elite": false,
          "attackCooldown": 2.05,
          "exp": 115,
          "gold": 19,
          "speed": 90,
          "radius": 22,
          "kind": "chainbound_penitent",
          "name": "Chainbound Penitent",
          "color": "#4d4b50",
          "accent": "#b2a9a0",
          "hp": 780,
          "damage": 78,
          "aggroRange": 300,
          "skills": [
            {
              "id": "penitent_chain_lash",
              "kind": "slam",
              "cd": 5.5,
              "range": 170,
              "windup": 0.65,
              "radius": 82,
              "power": 1.2,
              "defense": "dodge",
              "attackKind": "ultimate",
              "guardPressure": 45
            },
            {
              "id": "penitent_iron_punishment",
              "kind": "dash",
              "cd": 9,
              "range": 185,
              "windup": 0.85,
              "dist": 110,
              "power": 1.3,
              "radius": 45,
              "defense": "dodge",
              "attackKind": "heavy",
              "guardPressure": 25
            }
          ],
          "tags": [
            "undead",
            "humanoid"
          ],
          "attackKind": "heavy",
          "attackDefense": "parryable",
          "attackTelegraph": 0.65,
          "guardPressure": 25
        },
        {
          "painter": "carrionAbomination",
          "element": "shadow",
          "weight": 5,
          "elite": false,
          "attackCooldown": 2.2,
          "exp": 160,
          "gold": 26,
          "speed": 74,
          "radius": 25,
          "kind": "carrion_abomination",
          "name": "Carrion Abomination",
          "color": "#765b54",
          "accent": "#ffcf77",
          "hp": 1080,
          "damage": 92,
          "aggroRange": 315,
          "skills": [
            {
              "id": "abomination_carrion_slam",
              "kind": "slam",
              "cd": 8,
              "range": 190,
              "windup": 1,
              "radius": 110,
              "power": 1.3,
              "defense": "dodge",
              "attackKind": "ultimate",
              "guardPressure": 45
            },
            {
              "id": "abomination_cleaving_arms",
              "kind": "slam",
              "cd": 4.5,
              "range": 150,
              "windup": 0.55,
              "radius": 78,
              "power": 1.15,
              "status": "bleed",
              "defense": "dodge",
              "attackKind": "ultimate",
              "guardPressure": 45
            }
          ],
          "tags": [
            "undead",
            "beast"
          ],
          "attackKind": "heavy",
          "attackDefense": "parryable",
          "attackTelegraph": 0.65,
          "guardPressure": 25
        },
        {
          "painter": "bellRinger",
          "element": "shadow",
          "weight": 2,
          "elite": true,
          "attackCooldown": 2.3,
          "exp": 730,
          "gold": 155,
          "speed": 82,
          "radius": 29,
          "kind": "the_bell_ringer",
          "name": "The Bell-Ringer",
          "color": "#393740",
          "accent": "#e74e6c",
          "ability": "nova",
          "hp": 2700,
          "damage": 118,
          "aggroRange": 430,
          "skills": [
            {
              "id": "bell_funeral_toll",
              "kind": "slam",
              "cd": 11,
              "range": 240,
              "windup": 1.25,
              "radius": 160,
              "power": 1.25,
              "status": "shock",
              "defense": "dodge",
              "attackKind": "ultimate",
              "guardPressure": 45
            },
            {
              "id": "bell_grave_summoning",
              "kind": "slam",
              "cd": 17,
              "range": 220,
              "windup": 1.5,
              "radius": 120,
              "power": 0.75,
              "status": "slow",
              "defense": "dodge",
              "attackKind": "ultimate",
              "guardPressure": 45
            },
            {
              "id": "bell_resonance_wave",
              "kind": "slam",
              "cd": 6,
              "range": 200,
              "windup": 0.7,
              "radius": 120,
              "power": 1.1,
              "status": "stun",
              "defense": "dodge",
              "attackKind": "ultimate",
              "guardPressure": 45
            }
          ],
          "tags": [
            "undead",
            "demon"
          ],
          "attackKind": "heavy",
          "attackDefense": "parryable",
          "attackTelegraph": 0.65,
          "guardPressure": 25
        }
      ]
    }
  },
  "skillSkins": {
    "ashen_ember": {
      "id": "ashen_ember",
      "name": "Ashen Ember",
      "rarity": "common",
      "primary": "#ffb74d",
      "secondary": "#ff7043",
      "glow": "#ffa726",
      "fx": "flame"
    },
    "forest_leaf": {
      "id": "forest_leaf",
      "name": "Forest Leaf",
      "rarity": "common",
      "primary": "#9ccc65",
      "secondary": "#558b2f",
      "glow": "#aed581",
      "fx": "petal"
    },
    "spring_water": {
      "id": "spring_water",
      "name": "Spring Water",
      "rarity": "common",
      "primary": "#4fc3f7",
      "secondary": "#0288d1",
      "glow": "#81d4fa",
      "fx": "water"
    },
    "cobble_dust": {
      "id": "cobble_dust",
      "name": "Cobble Dust",
      "rarity": "common",
      "primary": "#bdbdbd",
      "secondary": "#757575",
      "glow": "#e0e0e0",
      "fx": "plain"
    },
    "candlelight": {
      "id": "candlelight",
      "name": "Candlelight",
      "rarity": "common",
      "primary": "#ffe082",
      "secondary": "#ffb300",
      "glow": "#ffd54f",
      "fx": "ember"
    },
    "bog_moss": {
      "id": "bog_moss",
      "name": "Bog Moss",
      "rarity": "common",
      "primary": "#8d9e4b",
      "secondary": "#4e6b26",
      "glow": "#aee571",
      "fx": "bubble"
    },
    "iron_grey": {
      "id": "iron_grey",
      "name": "Iron Grey",
      "rarity": "common",
      "primary": "#90a4ae",
      "secondary": "#546e7a",
      "glow": "#cfd8dc",
      "fx": "plain"
    },
    "pale_blue": {
      "id": "pale_blue",
      "name": "Pale Blue",
      "rarity": "common",
      "primary": "#b3e5fc",
      "secondary": "#4fc3f7",
      "glow": "#e1f5fe",
      "fx": "plain"
    },
    "harvest_amber": {
      "id": "harvest_amber",
      "name": "Harvest Amber",
      "rarity": "common",
      "primary": "#ffca28",
      "secondary": "#f57f17",
      "glow": "#ffd54f",
      "fx": "plain"
    },
    "rust_red": {
      "id": "rust_red",
      "name": "Rust Red",
      "rarity": "common",
      "primary": "#e57373",
      "secondary": "#b71c1c",
      "glow": "#ff8a80",
      "fx": "plain"
    },
    "pale_rose": {
      "id": "pale_rose",
      "name": "Pale Rose",
      "rarity": "common",
      "primary": "#f8bbd0",
      "secondary": "#c2185b",
      "glow": "#ffd1dc",
      "fx": "petal"
    },
    "seafoam": {
      "id": "seafoam",
      "name": "Seafoam",
      "rarity": "common",
      "primary": "#80cbc4",
      "secondary": "#00695c",
      "glow": "#b2dfdb",
      "fx": "bubble"
    },
    "toadstone": {
      "id": "toadstone",
      "name": "Toadstone",
      "rarity": "common",
      "primary": "#9e9d24",
      "secondary": "#4e4a00",
      "glow": "#d4e157",
      "fx": "plain"
    },
    "chalk_white": {
      "id": "chalk_white",
      "name": "Chalk White",
      "rarity": "common",
      "primary": "#eceff1",
      "secondary": "#90a4ae",
      "glow": "#ffffff",
      "fx": "plain"
    },
    "frostbite": {
      "id": "frostbite",
      "name": "Frostbite",
      "rarity": "uncommon",
      "primary": "#81d4fa",
      "secondary": "#0277bd",
      "glow": "#e1f5fe",
      "fx": "frost"
    },
    "sunlit_gold": {
      "id": "sunlit_gold",
      "name": "Sunlit Gold",
      "rarity": "uncommon",
      "primary": "#ffd54f",
      "secondary": "#ff8f00",
      "glow": "#fff59d",
      "fx": "holy"
    },
    "blood_red": {
      "id": "blood_red",
      "name": "Blood Red",
      "rarity": "uncommon",
      "primary": "#ef5350",
      "secondary": "#7f0000",
      "glow": "#ff8a80",
      "fx": "blood"
    },
    "violet_mist": {
      "id": "violet_mist",
      "name": "Violet Mist",
      "rarity": "uncommon",
      "primary": "#ba68c8",
      "secondary": "#4a148c",
      "glow": "#e1bee7",
      "fx": "smoke"
    },
    "storm_spark": {
      "id": "storm_spark",
      "name": "Storm Spark",
      "rarity": "uncommon",
      "primary": "#4dd0e1",
      "secondary": "#006064",
      "glow": "#b2ebf2",
      "fx": "storm"
    },
    "moon_silver": {
      "id": "moon_silver",
      "name": "Moon Silver",
      "rarity": "uncommon",
      "primary": "#e0e0e0",
      "secondary": "#7986cb",
      "glow": "#f5f5f5",
      "fx": "moon"
    },
    "thorn_green": {
      "id": "thorn_green",
      "name": "Thorn Green",
      "rarity": "uncommon",
      "primary": "#7cb342",
      "secondary": "#33691e",
      "glow": "#aed581",
      "fx": "thorn"
    },
    "marsh_teal": {
      "id": "marsh_teal",
      "name": "Marsh Teal",
      "rarity": "uncommon",
      "primary": "#26a69a",
      "secondary": "#004d40",
      "glow": "#80cbc4",
      "fx": "bubble"
    },
    "cinder_orange": {
      "id": "cinder_orange",
      "name": "Cinder Orange",
      "rarity": "uncommon",
      "primary": "#ff8a65",
      "secondary": "#bf360c",
      "glow": "#ffab91",
      "fx": "ember"
    },
    "pale_amethyst": {
      "id": "pale_amethyst",
      "name": "Pale Amethyst",
      "rarity": "uncommon",
      "primary": "#b39ddb",
      "secondary": "#512da8",
      "glow": "#d1c4e9",
      "fx": "plain"
    },
    "poison_lime": {
      "id": "poison_lime",
      "name": "Poison Lime",
      "rarity": "rare",
      "primary": "#c6ff00",
      "secondary": "#33691e",
      "glow": "#eeff41",
      "fx": "venom"
    },
    "crystal_blue": {
      "id": "crystal_blue",
      "name": "Crystal Blue",
      "rarity": "rare",
      "primary": "#4fc3f7",
      "secondary": "#01579b",
      "glow": "#b3e5fc",
      "fx": "crystal"
    },
    "sandstorm": {
      "id": "sandstorm",
      "name": "Sandstorm",
      "rarity": "rare",
      "primary": "#d4a373",
      "secondary": "#7f5539",
      "glow": "#ffe0b2",
      "fx": "sand"
    },
    "rune_cyan": {
      "id": "rune_cyan",
      "name": "Rune Cyan",
      "rarity": "rare",
      "primary": "#00e5ff",
      "secondary": "#006064",
      "glow": "#84ffff",
      "fx": "rune"
    },
    "obsidian": {
      "id": "obsidian",
      "name": "Obsidian",
      "rarity": "rare",
      "primary": "#5c6bc0",
      "secondary": "#1a237e",
      "glow": "#9fa8da",
      "fx": "shadow"
    },
    "royal_purple": {
      "id": "royal_purple",
      "name": "Royal Purple",
      "rarity": "rare",
      "primary": "#ce93d8",
      "secondary": "#6a1b9a",
      "glow": "#e1bee7",
      "fx": "plain"
    },
    "bloodmoon_rose": {
      "id": "bloodmoon_rose",
      "name": "Bloodmoon Rose",
      "rarity": "rare",
      "primary": "#f06292",
      "secondary": "#880e4f",
      "glow": "#ff8a80",
      "fx": "blood"
    },
    "sunfire": {
      "id": "sunfire",
      "name": "Sunfire",
      "rarity": "rare",
      "primary": "#ffd740",
      "secondary": "#ff6d00",
      "glow": "#fff8e1",
      "fx": "flame"
    },
    "glitch_green": {
      "id": "glitch_green",
      "name": "Glitch Green",
      "rarity": "epic",
      "primary": "#76ff03",
      "secondary": "#ff00e6",
      "glow": "#b2ff59",
      "fx": "glitch"
    },
    "spectre_teal": {
      "id": "spectre_teal",
      "name": "Spectre Teal",
      "rarity": "epic",
      "primary": "#1de9b6",
      "secondary": "#004d40",
      "glow": "#a7ffeb",
      "fx": "ghost"
    },
    "emberstorm": {
      "id": "emberstorm",
      "name": "Emberstorm",
      "rarity": "epic",
      "primary": "#ff7043",
      "secondary": "#d84315",
      "glow": "#ffab91",
      "fx": "ember"
    },
    "frostbloom": {
      "id": "frostbloom",
      "name": "Frostbloom",
      "rarity": "epic",
      "primary": "#80deea",
      "secondary": "#00838f",
      "glow": "#e0f7fa",
      "fx": "ice"
    },
    "starfall": {
      "id": "starfall",
      "name": "Starfall",
      "rarity": "epic",
      "primary": "#fff59d",
      "secondary": "#3949ab",
      "glow": "#ffffff",
      "fx": "star"
    },
    "pitch_black": {
      "id": "pitch_black",
      "name": "Pitch Black",
      "rarity": "legendary",
      "primary": "#0a0a0a",
      "secondary": "#6a1b9a",
      "glow": "#b388ff",
      "fx": "void"
    },
    "galaxy": {
      "id": "galaxy",
      "name": "Galaxy",
      "rarity": "legendary",
      "primary": "#7c4dff",
      "secondary": "#00bcd4",
      "glow": "#e040fb",
      "fx": "galaxy"
    },
    "aurora": {
      "id": "aurora",
      "name": "Aurora",
      "rarity": "legendary",
      "primary": "#69f0ae",
      "secondary": "#7c4dff",
      "glow": "#b9f6ca",
      "fx": "prism"
    },
    "bat_swarm": {
      "id": "bat_swarm",
      "name": "Bat Swarm",
      "rarity": "legendary",
      "primary": "#b71c1c",
      "secondary": "#12005e",
      "glow": "#ff5252",
      "fx": "bats"
    },
    "void_heart": {
      "id": "void_heart",
      "name": "Void Heart",
      "rarity": "mythic",
      "primary": "#000000",
      "secondary": "#d500f9",
      "glow": "#ea80fc",
      "fx": "void"
    }
  },
  "i18nTR": [
    {
      "en": "Red Egg",
      "tr": "Kırmızı Yumurta"
    },
    {
      "en": "Green Egg",
      "tr": "Yeşil Yumurta"
    },
    {
      "en": "Blue Egg",
      "tr": "Mavi Yumurta"
    },
    {
      "en": "Brown Egg",
      "tr": "Kahverengi Yumurta"
    },
    {
      "en": "Yellow Egg",
      "tr": "Sarı Yumurta"
    },
    {
      "en": "Purple Egg",
      "tr": "Mor Yumurta"
    },
    {
      "en": "Cyan Egg",
      "tr": "Turkuaz Yumurta"
    },
    {
      "en": "Dark Egg",
      "tr": "Kara Yumurta"
    },
    {
      "en": "Orange Egg",
      "tr": "Turuncu Yumurta"
    },
    {
      "en": "Gold Egg",
      "tr": "Altın Yumurta"
    },
    {
      "en": "Rusty Sword",
      "tr": "Paslı Kılıç"
    },
    {
      "en": "Leather Helm",
      "tr": "Deri Miğfer"
    },
    {
      "en": "Leather Chest",
      "tr": "Deri Göğüslük"
    },
    {
      "en": "Leather Pants",
      "tr": "Deri Pantolon"
    },
    {
      "en": "Leather Boots",
      "tr": "Deri Çizme"
    },
    {
      "en": "Iron Amulet",
      "tr": "Demir Muska"
    },
    {
      "en": "Iron Ring",
      "tr": "Demir Yüzük"
    },
    {
      "en": "Mana Talisman",
      "tr": "Mana Tılsımı"
    },
    {
      "en": "Battle Axe",
      "tr": "Savaş Baltası"
    },
    {
      "en": "War Hammer",
      "tr": "Savaş Çekici"
    },
    {
      "en": "Longbow",
      "tr": "Uzun Yay"
    },
    {
      "en": "Shortbow",
      "tr": "Kısa Yay"
    },
    {
      "en": "Apprentice Staff",
      "tr": "Çırak Asası"
    },
    {
      "en": "Archon Staff",
      "tr": "Arhon Asası"
    },
    {
      "en": "Dagger",
      "tr": "Hançer"
    },
    {
      "en": "Poison Dagger",
      "tr": "Zehirli Hançer"
    },
    {
      "en": "Mace",
      "tr": "Topuz"
    },
    {
      "en": "Holy Sword",
      "tr": "Kutsal Kılıç"
    },
    {
      "en": "Kris Blade",
      "tr": "Kris Kılıcı"
    },
    {
      "en": "Whisper Blade",
      "tr": "Fısıltı Kılıcı"
    },
    {
      "en": "Scepter",
      "tr": "Saltanat Asası"
    },
    {
      "en": "Cleric Staff",
      "tr": "Rahip Asası"
    },
    {
      "en": "Maul",
      "tr": "Balyoz"
    },
    {
      "en": "Bulwark Hammer",
      "tr": "Siper Çekici"
    },
    {
      "en": "Stone Ash Sword",
      "tr": "Taş Külü Kılıcı"
    },
    {
      "en": "+8 Attack. A base for temple crafting.",
      "tr": "+8 Saldırı. Tapınak zanaatı için bir temel."
    },
    {
      "en": "Hearth Tea",
      "tr": "Ocak Çayı"
    },
    {
      "en": "Field Rations",
      "tr": "Saha Azığı"
    },
    {
      "en": "Fire Essence",
      "tr": "Ateş Özü"
    },
    {
      "en": "A spark of bottled flame. Used in crafting.",
      "tr": "Şişeye konmuş bir alev kıvılcımı. Zanaatta kullanılır."
    },
    {
      "en": "Frost Essence",
      "tr": "Buz Özü"
    },
    {
      "en": "Cold condensed to a droplet. Used in crafting.",
      "tr": "Bir damlaya yoğunlaşmış soğuk. Zanaatta kullanılır."
    },
    {
      "en": "Arcane Essence",
      "tr": "Arkane Öz"
    },
    {
      "en": "Raw magic held in a vial. Used in crafting.",
      "tr": "Bir şişede tutulan ham büyü. Zanaatta kullanılır."
    },
    {
      "en": "Shadow Essence",
      "tr": "Gölge Özü"
    },
    {
      "en": "Light that never arrives. Used in crafting.",
      "tr": "Hiç ulaşmayan ışık. Zanaatta kullanılır."
    },
    {
      "en": "Heart of Fire",
      "tr": "Ateş Kalbi"
    },
    {
      "en": "The still-burning heart of a fire spirit.",
      "tr": "Bir ateş ruhunun hâlâ yanan kalbi."
    },
    {
      "en": "Heart of Golem",
      "tr": "Golem Kalbi"
    },
    {
      "en": "Offer it at the Ancient Temple to mend a lost heart.",
      "tr": "Kayıp bir kalbi onarmak için Antik Tapınak'ta sun."
    },
    {
      "en": "Origin Stone",
      "tr": "Köken Taşı"
    },
    {
      "en": "Offer it at the Ancient Temple to be reborn into a new race.",
      "tr": "Yeni bir ırka yeniden doğmak için Antik Tapınak'ta sun."
    },
    {
      "en": "Ancient Relic",
      "tr": "Kadim Kalıntı"
    },
    {
      "en": "An artifact older than the kingdom. The temple remembers.",
      "tr": "Krallıktan daha eski bir yadigâr. Tapınak hatırlar."
    },
    {
      "en": "Warlord Crest",
      "tr": "Savaş Lordu Arması"
    },
    {
      "en": "A battle-worn crest. The Ancient Temple demands it from those walking the heavy path (Warlord, Juggernaut, Crusader).",
      "tr": "Savaşta yıpranmış bir arma. Antik Tapınak bunu ağır yolda yürüyenlerden ister (Savaş Lordu, Juggernaut, Haçlı)."
    },
    {
      "en": "Shadow Sigil",
      "tr": "Gölge Mührü"
    },
    {
      "en": "A whispering sigil. The Ancient Temple demands it from those walking the shadow path (Nightblade, Reaper, Warden).",
      "tr": "Fısıldayan bir mühür. Antik Tapınak bunu gölge yolunda yürüyenlerden ister (Gece Bıçağı, Azrail, Muhafız)."
    },
    {
      "en": "Arcane Seal",
      "tr": "Arkane Mührü"
    },
    {
      "en": "A humming seal. The Ancient Temple demands it from those walking the arcane path (Archmage, High Priest).",
      "tr": "Uğuldayan bir mühür. Antik Tapınak bunu arkane yolunda yürüyenlerden ister (Başbüyücü, Yüce Rahip)."
    },
    {
      "en": "Drop of Primeval Cruor",
      "tr": "Kadim Cruor Damlası"
    },
    {
      "en": "First blood, still warm. Rarely spills from humanoid wounds. Old Vesryn demands 10 drops for his rite.",
      "tr": "İlk kan, hâlâ sıcak. İnsansı yaralarından nadiren sızar. Yaşlı Vesryn ayini için 10 damla ister."
    },
    {
      "en": "Fire Ash Sword",
      "tr": "Ateş Külü Kılıcı"
    },
    {
      "en": "+12 Attack. Still warm to the touch.",
      "tr": "+12 Saldırı. Dokununca hâlâ sıcak."
    },
    {
      "en": "Molten Cleaver",
      "tr": "Erimiş Satır"
    },
    {
      "en": "+20 Attack. It hums with fire.",
      "tr": "+20 Saldırı. Ateşle uğulduyor."
    },
    {
      "en": "Frost Gladius",
      "tr": "Buz Gladiusu"
    },
    {
      "en": "Arcane Rod",
      "tr": "Arkane Değnek"
    },
    {
      "en": "Shadow Knife",
      "tr": "Gölge Bıçağı"
    },
    {
      "en": "Ember Sword",
      "tr": "Kor Kılıcı"
    },
    {
      "en": "+26 Attack. Found only in the deep ruins.",
      "tr": "+26 Saldırı. Yalnızca derin harabelerde bulunur."
    },
    {
      "en": "Phoenix Staff",
      "tr": "Anka Asası"
    },
    {
      "en": "Void Cleaver",
      "tr": "Boşluk Satırı"
    },
    {
      "en": "+42 Attack. The edge drinks the dark.",
      "tr": "+42 Saldırı. Keskin ağzı karanlığı içer."
    },
    {
      "en": "Wooden Chest",
      "tr": "Ahşap Sandık"
    },
    {
      "en": "A simple chest. Common odds of decent loot.",
      "tr": "Basit bir sandık. İyi ganimet için sıradan şans."
    },
    {
      "en": "Iron Chest",
      "tr": "Demir Sandık"
    },
    {
      "en": "A sturdy chest. Better odds of uncommon loot.",
      "tr": "Sağlam bir sandık. Sıra dışı ganimet için daha iyi şans."
    },
    {
      "en": "Gold Chest",
      "tr": "Altın Sandık"
    },
    {
      "en": "A gilded chest. Decent odds of rare loot.",
      "tr": "Yaldızlı bir sandık. Nadir ganimet için iyi şans."
    },
    {
      "en": "Emerald Chest",
      "tr": "Zümrüt Sandık"
    },
    {
      "en": "A gem-studded chest. Strong odds of epic loot.",
      "tr": "Mücevher kakmalı bir sandık. Destansı ganimet için yüksek şans."
    },
    {
      "en": "Obsidian Chest",
      "tr": "Obsidyen Sandık"
    },
    {
      "en": "A black-glass chest. Fine odds of legendary loot.",
      "tr": "Kara camdan bir sandık. Efsanevi ganimet için yüksek şans."
    },
    {
      "en": "Iron Greatsword",
      "tr": "Demir Çift Elli Kılıç"
    },
    {
      "en": "Steel Blade",
      "tr": "Çelik Kılıç"
    },
    {
      "en": "Ranger Bow",
      "tr": "Korucu Yayı"
    },
    {
      "en": "Arcane Scepter",
      "tr": "Arkane Asa"
    },
    {
      "en": "Shadow Dagger",
      "tr": "Gölge Hançeri"
    },
    {
      "en": "Dragon Spear",
      "tr": "Ejder Mızrağı"
    },
    {
      "en": "Titan Hammer",
      "tr": "Titan Çekici"
    },
    {
      "en": "Storm Bow",
      "tr": "Fırtına Yayı"
    },
    {
      "en": "Void Blade",
      "tr": "Boşluk Kılıcı"
    },
    {
      "en": "World Breaker",
      "tr": "Dünya Kırıcı"
    },
    {
      "en": "Bronze Helm",
      "tr": "Bronz Miğfer"
    },
    {
      "en": "Iron Helm",
      "tr": "Demir Miğfer"
    },
    {
      "en": "Ranger Hood",
      "tr": "Korucu Başlığı"
    },
    {
      "en": "Mage Cowl",
      "tr": "Büyücü Kukuletası"
    },
    {
      "en": "Knight Helm",
      "tr": "Şövalye Miğferi"
    },
    {
      "en": "Shadow Mask",
      "tr": "Gölge Maskesi"
    },
    {
      "en": "Dragon Helm",
      "tr": "Ejder Miğferi"
    },
    {
      "en": "Void Crown",
      "tr": "Boşluk Tacı"
    },
    {
      "en": "Padded Armor",
      "tr": "Dolgulu Zırh"
    },
    {
      "en": "Chainmail",
      "tr": "Zincir Zırh"
    },
    {
      "en": "Ranger Vest",
      "tr": "Korucu Yeleği"
    },
    {
      "en": "Silk Robe",
      "tr": "İpek Cübbe"
    },
    {
      "en": "Plate Armor",
      "tr": "Plaka Zırh"
    },
    {
      "en": "Shadow Garb",
      "tr": "Gölge Giysisi"
    },
    {
      "en": "Dragon Scale",
      "tr": "Ejder Pulu"
    },
    {
      "en": "Void Plate",
      "tr": "Boşluk Zırhı"
    },
    {
      "en": "Leather Greaves",
      "tr": "Deri Dizlik"
    },
    {
      "en": "Iron Greaves",
      "tr": "Demir Dizlik"
    },
    {
      "en": "Swift Leggings",
      "tr": "Çevik Tozluk"
    },
    {
      "en": "Sage Pants",
      "tr": "Bilge Pantolonu"
    },
    {
      "en": "Knight Leggings",
      "tr": "Şövalye Tozluğu"
    },
    {
      "en": "Shadow Leggings",
      "tr": "Gölge Tozluğu"
    },
    {
      "en": "Dragon Leggings",
      "tr": "Ejder Tozluğu"
    },
    {
      "en": "Void Leggings",
      "tr": "Boşluk Tozluğu"
    },
    {
      "en": "Worn Boots",
      "tr": "Yıpranmış Çizme"
    },
    {
      "en": "Iron Boots",
      "tr": "Demir Çizme"
    },
    {
      "en": "Ranger Boots",
      "tr": "Korucu Çizmesi"
    },
    {
      "en": "Sorcery Boots",
      "tr": "Büyü Çizmesi"
    },
    {
      "en": "Knight Boots",
      "tr": "Şövalye Çizmesi"
    },
    {
      "en": "Void Boots",
      "tr": "Boşluk Çizmesi"
    },
    {
      "en": "Copper Amulet",
      "tr": "Bakır Muska"
    },
    {
      "en": "Silver Amulet",
      "tr": "Gümüş Muska"
    },
    {
      "en": "Ruby Amulet",
      "tr": "Yakut Muska"
    },
    {
      "en": "Sapphire Amulet",
      "tr": "Safir Muska"
    },
    {
      "en": "Void Amulet",
      "tr": "Boşluk Muskası"
    },
    {
      "en": "Copper Ring",
      "tr": "Bakır Yüzük"
    },
    {
      "en": "Silver Ring",
      "tr": "Gümüş Yüzük"
    },
    {
      "en": "Ruby Ring",
      "tr": "Yakut Yüzük"
    },
    {
      "en": "Sapphire Ring",
      "tr": "Safir Yüzük"
    },
    {
      "en": "Void Ring",
      "tr": "Boşluk Yüzüğü"
    },
    {
      "en": "The Essence of Life",
      "tr": "Yaşam Özü"
    },
    {
      "en": "A rare essence that can revive a fallen ally at the Ancient Temple.",
      "tr": "Antik Tapınak'ta düşmüş bir dostu diriltebilen nadir bir öz."
    },
    {
      "en": "Tome of Ember",
      "tr": "Kor Kitabı"
    },
    {
      "en": "+12 Magic Power, +2 Heal Power. For mages.",
      "tr": "+12 Büyü Gücü, +2 İyileştirme Gücü. Büyücüler için."
    },
    {
      "en": "Tome of Frost",
      "tr": "Buz Kitabı"
    },
    {
      "en": "Tome of Shadows",
      "tr": "Gölgeler Kitabı"
    },
    {
      "en": "Tome of Light",
      "tr": "Işık Kitabı"
    },
    {
      "en": "Tome of Void",
      "tr": "Boşluk Kitabı"
    },
    {
      "en": "The Stone of Blood",
      "tr": "Kan Taşı"
    },
    {
      "en": "+10% Omnivamp. Heals 10% of all damage dealt. (Craftable)",
      "tr": "+10% Omnivamp. Verilen tüm hasarın %10'unu iyileştirir. (Üretilebilir)"
    },
    {
      "en": "Stone of Frost",
      "tr": "Buz Taşı"
    },
    {
      "en": "Stone of Shadows",
      "tr": "Gölgeler Taşı"
    },
    {
      "en": "Stone of Arcane",
      "tr": "Arkane Taşı"
    },
    {
      "en": "Stone of Earth",
      "tr": "Toprak Taşı"
    },
    {
      "en": "Vampiric Ring",
      "tr": "Vampir Yüzüğü"
    },
    {
      "en": "Crimson Blade",
      "tr": "Kızıl Kılıç"
    },
    {
      "en": "Glacial Helm",
      "tr": "Buzul Miğferi"
    },
    {
      "en": "Ember Plate",
      "tr": "Kor Zırhı"
    },
    {
      "en": "Ember King's Blade",
      "tr": "Kor Kralı'nın Kılıcı"
    },
    {
      "en": "Ember King's blade - only drops from Ember King (50%).",
      "tr": "Kor Kralı'nın kılıcı - yalnızca Kor Kralı'ndan düşer (%50)."
    },
    {
      "en": "Frost Titan's Axe",
      "tr": "Buz Devi'nin Baltası"
    },
    {
      "en": "Frost Titan's axe - only drops from Frost Titan (50%).",
      "tr": "Buz Devi'nin baltası - yalnızca Buz Devi'nden düşer (%50)."
    },
    {
      "en": "Void Herald's Scythe",
      "tr": "Boşluk Habercisi'nin Tırpanı"
    },
    {
      "en": "Void Herald's scythe - only drops from Void Herald (50%).",
      "tr": "Boşluk Habercisi'nin tırpanı - yalnızca Boşluk Habercisi'nden düşer (%50)."
    },
    {
      "en": "Storm Colossus Hammer",
      "tr": "Fırtına Devi'nin Çekici"
    },
    {
      "en": "Storm Colossus hammer - only drops from Storm Colossus (50%).",
      "tr": "Fırtına Devi'nin çekici - yalnızca Fırtına Devi'nden düşer (%50)."
    },
    {
      "en": "World Eater Fang",
      "tr": "Dünya Yiyen'in Dişi"
    },
    {
      "en": "World Eater's fang - only drops from World Eater (50%).",
      "tr": "Dünya Yiyen'in dişi - yalnızca Dünya Yiyen'den düşer (%50)."
    },
    {
      "en": "Ember Chest",
      "tr": "Kor Sandığı"
    },
    {
      "en": "Ember King's chest - rare+ guaranteed.",
      "tr": "Kor Kralı'nın sandığı - en az nadir garanti."
    },
    {
      "en": "Frost Chest",
      "tr": "Buz Sandığı"
    },
    {
      "en": "Frost Titan's chest - rare+ guaranteed.",
      "tr": "Buz Devi'nin sandığı - en az nadir garanti."
    },
    {
      "en": "Void Chest",
      "tr": "Boşluk Sandığı"
    },
    {
      "en": "Void Herald's chest - epic+ guaranteed.",
      "tr": "Boşluk Habercisi'nin sandığı - en az destansı garanti."
    },
    {
      "en": "Storm Chest",
      "tr": "Fırtına Sandığı"
    },
    {
      "en": "Storm Colossus chest - epic+ guaranteed.",
      "tr": "Fırtına Devi'nin sandığı - en az destansı garanti."
    },
    {
      "en": "World Chest",
      "tr": "Dünya Sandığı"
    },
    {
      "en": "World Eater's chest - legendary+ guaranteed.",
      "tr": "Dünya Yiyen'in sandığı - en az efsanevi garanti."
    },
    {
      "en": "Mythic Chest",
      "tr": "Mitik Sandık"
    },
    {
      "en": "A chest of legend. Great odds of mythic loot.",
      "tr": "Efsanevi bir sandık. Mitik ganimet için yüksek şans."
    },
    {
      "en": "Buried Treasure",
      "tr": "Gömülü Hazine"
    },
    {
      "en": "A dirt-caked hoard dug up on the road. Lucky find, honest loot.",
      "tr": "Yolda topraktan çıkarılmış, çamura bulanmış bir define. Şanslı buluş, dürüst ganimet."
    },
    {
      "en": "Sturdy Club",
      "tr": "Dayanıklı Sopa"
    },
    {
      "en": "A dependable oaken club.",
      "tr": "Güvenilir bir meşe sopa."
    },
    {
      "en": "Cloth Cap",
      "tr": "Bez Başlık"
    },
    {
      "en": "Stitched cloth, better than nothing.",
      "tr": "Dikilmiş bez; hiç yoktan iyidir."
    },
    {
      "en": "Bone Ring",
      "tr": "Kemik Yüzük"
    },
    {
      "en": "Carved from a dire wolf fang.",
      "tr": "Bir dev kurt dişinden oyulmuş."
    },
    {
      "en": "Travel Boots",
      "tr": "Yol Çizmesi"
    },
    {
      "en": "Worn soles, swift steps.",
      "tr": "Aşınmış tabanlar, çevik adımlar."
    },
    {
      "en": "Hunter Axe",
      "tr": "Avcı Baltası"
    },
    {
      "en": "A woodsman's heavy axe.",
      "tr": "Bir oduncunun ağır baltası."
    },
    {
      "en": "Wolf Helm",
      "tr": "Kurt Miğferi"
    },
    {
      "en": "Fashioned from an alpha pelt.",
      "tr": "Bir alfa postundan yapılmış."
    },
    {
      "en": "Boar Hide Armor",
      "tr": "Yaban Domuzu Derisi Zırh"
    },
    {
      "en": "Thick, musky, tough.",
      "tr": "Kalın, keskin kokulu, dayanıklı."
    },
    {
      "en": "Swift Greaves",
      "tr": "Çevik Dizlik"
    },
    {
      "en": "Light plates for fast feet.",
      "tr": "Hızlı ayaklar için hafif plakalar."
    },
    {
      "en": "Ember Boots",
      "tr": "Kor Çizmesi"
    },
    {
      "en": "Still warm from the forge.",
      "tr": "Ocaktan hâlâ sıcak."
    },
    {
      "en": "Moon Amulet",
      "tr": "Ay Muskası"
    },
    {
      "en": "Drinks in moonlight.",
      "tr": "Ay ışığını içine çeker."
    },
    {
      "en": "Serpent Ring",
      "tr": "Yılan Yüzüğü"
    },
    {
      "en": "A coiled silver serpent.",
      "tr": "Kıvrılmış gümüş bir yılan."
    },
    {
      "en": "Oak Staff",
      "tr": "Meşe Asa"
    },
    {
      "en": "Heartwood humming with mana.",
      "tr": "Öz odunu manayla uğulduyor."
    },
    {
      "en": "Frostbrand Axe",
      "tr": "Buzdamgası Baltası"
    },
    {
      "en": "Its edge never thaws.",
      "tr": "Keskin ağzı asla çözülmez."
    },
    {
      "en": "Sentinel Helm",
      "tr": "Nöbetçi Miğferi"
    },
    {
      "en": "Stood a hundred sieges.",
      "tr": "Yüz kuşatmaya dayandı."
    },
    {
      "en": "Shadowplate",
      "tr": "Gölge Zırhı"
    },
    {
      "en": "Forged in eclipse dark.",
      "tr": "Tutulma karanlığında dövülmüş."
    },
    {
      "en": "Storm Leggings",
      "tr": "Fırtına Tozluğu"
    },
    {
      "en": "Crackling with static.",
      "tr": "Statikle çıtırdıyor."
    },
    {
      "en": "Thunder Amulet",
      "tr": "Gök Gürültüsü Muskası"
    },
    {
      "en": "A bottled thunderstorm.",
      "tr": "Şişeye konmuş bir gök gürültüsü fırtınası."
    },
    {
      "en": "Warden Ring",
      "tr": "Muhafız Yüzüğü"
    },
    {
      "en": "Oath-bound silver.",
      "tr": "Yeminle bağlı gümüş."
    },
    {
      "en": "Runed Bow",
      "tr": "Rünlü Yay"
    },
    {
      "en": "Runes guide every shaft.",
      "tr": "Rünler her oku yönlendirir."
    },
    {
      "en": "Void Reaver",
      "tr": "Boşluk Kemiricisi"
    },
    {
      "en": "It hungers between swings.",
      "tr": "Savurmalar arasında acıkır."
    },
    {
      "en": "Aegis Armor",
      "tr": "Aegis Zırhı"
    },
    {
      "en": "A wall you can wear.",
      "tr": "Giymek mümkün bir duvar."
    },
    {
      "en": "Archon Crown",
      "tr": "Arhon Tacı"
    },
    {
      "en": "Worn by sky-tyrants.",
      "tr": "Gökyüzü zorbaları tarafından giyilir."
    },
    {
      "en": "Stormcaller Staff",
      "tr": "Fırtına Çağıran Asa"
    },
    {
      "en": "Points at clouds; clouds obey.",
      "tr": "Bulutlara doğrultur; bulutlar itaat eder."
    },
    {
      "en": "Kingsfall Blade",
      "tr": "Kral Düşüren Kılıç"
    },
    {
      "en": "Ended a dynasty.",
      "tr": "Bir hanedanı bitirdi."
    },
    {
      "en": "Titanward Plate",
      "tr": "Titan Korulu Zırh"
    },
    {
      "en": "Titan-forged bulwark.",
      "tr": "Titan dövmesi siper."
    },
    {
      "en": "Worldsplitter Axe",
      "tr": "Dünya Yaran Balta"
    },
    {
      "en": "The ground remembers it.",
      "tr": "Toprak onu hatırlar."
    },
    {
      "en": "Bottle of Slime",
      "tr": "Slime Şişesi"
    },
    {
      "en": "A jiggling bottle of fresh slime.",
      "tr": "Taze slime dolu, kıpır kıpır bir şişe."
    },
    {
      "en": "Wolf Fang",
      "tr": "Kurt Dişi"
    },
    {
      "en": "A sharp fang, still warm.",
      "tr": "Keskin bir diş, hâlâ sıcak."
    },
    {
      "en": "Cave Bat Wing",
      "tr": "Mağara Yarasası Kanadı"
    },
    {
      "en": "Leathery and light.",
      "tr": "Derimsi ve hafif."
    },
    {
      "en": "Ash Spider Silk",
      "tr": "Kül Örümceği İpeği"
    },
    {
      "en": "Stronger than it looks.",
      "tr": "Göründüğünden daha güçlü."
    },
    {
      "en": "Tough Hide",
      "tr": "Dayanıklı Deri"
    },
    {
      "en": "Thick hide of a hardy beast.",
      "tr": "Dayanıklı bir hayvanın kalın derisi."
    },
    {
      "en": "Old Bone",
      "tr": "Eski Kemik"
    },
    {
      "en": "Dense with old malice.",
      "tr": "Eski kinden yoğun."
    },
    {
      "en": "Orc Tusk",
      "tr": "Ork Dişi"
    },
    {
      "en": "A trophy with an edge.",
      "tr": "Keskin bir ganimet."
    },
    {
      "en": "Storm Harpy Feather",
      "tr": "Fırtına Harpi Tüyü"
    },
    {
      "en": "Crackles faintly.",
      "tr": "Hafifçe çıtırdar."
    },
    {
      "en": "Golem Fragment",
      "tr": "Golem Parçası"
    },
    {
      "en": "A chip of living stone.",
      "tr": "Canlı taştan bir kıymık."
    },
    {
      "en": "Wraith Wisp",
      "tr": "Hayalet Işığı"
    },
    {
      "en": "Cold light in a jar.",
      "tr": "Kavanozda soğuk ışık."
    },
    {
      "en": "Elder Treant Bark",
      "tr": "Yaşlı Ağaç Adam Kabuğu"
    },
    {
      "en": "Bark that slowly regrows.",
      "tr": "Yavaşça yeniden büyüyen kabuk."
    },
    {
      "en": "Hydra Scale",
      "tr": "Hidra Pulu"
    },
    {
      "en": "It shimmers with regrowth.",
      "tr": "Yeniden büyümeyle parıldar."
    },
    {
      "en": "Minor Salve",
      "tr": "Küçük Merhem"
    },
    {
      "en": "Heals small wounds.",
      "tr": "Küçük yaraları iyileştirir."
    },
    {
      "en": "Wolf Jerky",
      "tr": "Kurt Pastırması"
    },
    {
      "en": "Chewy trail food.",
      "tr": "Çiğnenir yol azığı."
    },
    {
      "en": "Mushroom Stew",
      "tr": "Mantar Güveç"
    },
    {
      "en": "A hearty dungeon stew.",
      "tr": "Doyurucu bir zindan güveci."
    },
    {
      "en": "Frost Berry",
      "tr": "Buz Meyvesi"
    },
    {
      "en": "Numbing and sweet.",
      "tr": "Uyuşturucu ve tatlı."
    },
    {
      "en": "Ember Pepper",
      "tr": "Kor Biberi"
    },
    {
      "en": "Burns going down.",
      "tr": "Boğazdan inerken yakar."
    },
    {
      "en": "Troll Draught",
      "tr": "Trol Şerbeti"
    },
    {
      "en": "Regrows more than courage.",
      "tr": "Cesaretten fazlasını yeniden büyütür."
    },
    {
      "en": "Skyshard Omelet",
      "tr": "Gökyüzü Parçası Omleti"
    },
    {
      "en": "Storm-harpy eggs, fried.",
      "tr": "Kızarmış fırtına harpi yumurtaları."
    },
    {
      "en": "Elixir of Dawn",
      "tr": "Şafak İksiri"
    },
    {
      "en": "First light, bottled.",
      "tr": "Şişeye konmuş ilk ışık."
    },
    {
      "en": "Sword Blueprint",
      "tr": "Kılıç Kalıbı"
    },
    {
      "en": "Reusable weapon pattern.",
      "tr": "Yeniden kullanılabilir silah kalıbı."
    },
    {
      "en": "Armor Blueprint",
      "tr": "Zırh Kalıbı"
    },
    {
      "en": "Reusable armor pattern.",
      "tr": "Yeniden kullanılabilir zırh kalıbı."
    },
    {
      "en": "Staff Blueprint",
      "tr": "Asa Kalıbı"
    },
    {
      "en": "Reusable staff pattern.",
      "tr": "Yeniden kullanılabilir asa kalıbı."
    },
    {
      "en": "Sage Circlet",
      "tr": "Bilge Taçlığı"
    },
    {
      "en": "For quiet, clever minds.",
      "tr": "Sessiz, zeki zihinler için."
    },
    {
      "en": "Blood Blade",
      "tr": "Kan Kılıcı"
    },
    {
      "en": "+28 Attack. It remembers every vein.",
      "tr": "+28 Saldırı. Her damarı hatırlar."
    },
    {
      "en": "Blood Fang",
      "tr": "Kan Dişi"
    },
    {
      "en": "+18 Attack, +2 Speed. Still warm.",
      "tr": "+18 Saldırı, +2 Hız. Hâlâ sıcak."
    },
    {
      "en": "Blood Helm",
      "tr": "Kan Miğferi"
    },
    {
      "en": "Blood Chest",
      "tr": "Kan Göğüslüğü"
    },
    {
      "en": "Blood Leggings",
      "tr": "Kan Tozluğu"
    },
    {
      "en": "Blood Boots",
      "tr": "Kan Çizmesi"
    },
    {
      "en": "Blood Ring",
      "tr": "Kan Yüzüğü"
    },
    {
      "en": "Blood Amulet",
      "tr": "Kan Muskası"
    },
    {
      "en": "Blood Tome",
      "tr": "Kan Kitabı"
    },
    {
      "en": "+14 Magic Power, +8 Heal Power. Written in red.",
      "tr": "+14 Büyü Gücü, +8 İyileştirme Gücü. Kırmızıyla yazılmış."
    },
    {
      "en": "Duskwood Blade",
      "tr": "Alacakaranlık Ormanı Kılıcı"
    },
    {
      "en": "Reedcutter",
      "tr": "Sazkesen"
    },
    {
      "en": "Ironleaf Sword",
      "tr": "Demiryaprak Kılıcı"
    },
    {
      "en": "Patrol Saber",
      "tr": "Devriye Kılıcı"
    },
    {
      "en": "Tinker's Shortsword",
      "tr": "Tamircinin Kısa Kılıcı"
    },
    {
      "en": "Militia Sword",
      "tr": "Milis Kılıcı"
    },
    {
      "en": "Boar Tusk Blade",
      "tr": "Domuz Dişi Kılıcı"
    },
    {
      "en": "Salt-Rusted Sword",
      "tr": "Tuzpaslı Kılıç"
    },
    {
      "en": "Charcoal Cutter",
      "tr": "Kömürkesen"
    },
    {
      "en": "Bronzeguard",
      "tr": "Bronz Muhafız"
    },
    {
      "en": "Mossbrand",
      "tr": "Yosundamgası"
    },
    {
      "en": "Tidecutter",
      "tr": "Dalgakesen"
    },
    {
      "en": "Ashen Edge",
      "tr": "Kül Ağzı"
    },
    {
      "en": "Watchman's Sabre",
      "tr": "Bekçinin Kılıcı"
    },
    {
      "en": "Glade Whisper",
      "tr": "Açıklık Fısıltısı"
    },
    {
      "en": "Emberwood Blade",
      "tr": "Kor Odunu Kılıcı"
    },
    {
      "en": "Frostpin",
      "tr": "Buziğnesi"
    },
    {
      "en": "Mason's Broadsword",
      "tr": "Duvarcının Kılıcı"
    },
    {
      "en": "Stormhilt",
      "tr": "Fırtına Kabzası"
    },
    {
      "en": "Runeblade",
      "tr": "Rün Kılıcı"
    },
    {
      "en": "Glacier Fang",
      "tr": "Buzul Dişi"
    },
    {
      "en": "Venomfang",
      "tr": "Zehirdiş"
    },
    {
      "en": "Brass Talon",
      "tr": "Pirinç Pençe"
    },
    {
      "en": "Shadowthorn",
      "tr": "Gölge Dikeni"
    },
    {
      "en": "Coral Reaver",
      "tr": "Mercan Kemiricisi"
    },
    {
      "en": "Graverust Sword",
      "tr": "Mezar Pası Kılıcı"
    },
    {
      "en": "Sunflare Sabre",
      "tr": "Güneş Patlaması Kılıcı"
    },
    {
      "en": "Emberforged Greatsword",
      "tr": "Kordövme Çift Elli Kılıç"
    },
    {
      "en": "Glacial Requiem",
      "tr": "Buzul Ağıdı"
    },
    {
      "en": "Thunderbrand",
      "tr": "Gök Gürültüsü Damgası"
    },
    {
      "en": "Crimson Oath",
      "tr": "Kızıl Yemin"
    },
    {
      "en": "Voidsteel Edge",
      "tr": "Boşluk Çeliği Ağzı"
    },
    {
      "en": "Seraph's Wing",
      "tr": "Seraf'ın Kanadı"
    },
    {
      "en": "Nightbloom Blade",
      "tr": "Geceçiçeği Kılıcı"
    },
    {
      "en": "Tidecaller",
      "tr": "Dalga Çağıran"
    },
    {
      "en": "Runic Warblade",
      "tr": "Rünik Savaş Kılıcı"
    },
    {
      "en": "Dragonfang Blade",
      "tr": "Ejderdışı Kılıç"
    },
    {
      "en": "Phoenix Ember Sword",
      "tr": "Anka Kor Kılıcı"
    },
    {
      "en": "Worldtree Blade",
      "tr": "Dünya Ağacı Kılıcı"
    },
    {
      "en": "Voidheart Cleaver",
      "tr": "Boşluk Kalbi Satırı"
    },
    {
      "en": "Astral Sever",
      "tr": "Astral Kesici"
    },
    {
      "en": "Bloodmoon Greatsword",
      "tr": "Kan Ayı Çift Elli Kılıcı"
    },
    {
      "en": "Setra's Dawnblade",
      "tr": "Setra'nın Şafak Kılıcı"
    },
    {
      "en": "Edge of the Firstborn",
      "tr": "İlk Doğan'ın Ağzı"
    },
    {
      "en": "Worldheart, the Unmaking",
      "tr": "Dünya Kalbi, Yok Edici"
    },
    {
      "en": "Duskhide Helm",
      "tr": "Alacakaranlık Derisi Miğfer"
    },
    {
      "en": "Duskhide Chest",
      "tr": "Alacakaranlık Derisi Göğüslük"
    },
    {
      "en": "Duskhide Legs",
      "tr": "Alacakaranlık Derisi Bacaklık"
    },
    {
      "en": "Duskhide Boots",
      "tr": "Alacakaranlık Derisi Çizme"
    },
    {
      "en": "Duskhide Blade",
      "tr": "Alacakaranlık Derisi Kılıç"
    },
    {
      "en": "Bronzeforge Helm",
      "tr": "Bronzdövme Miğfer"
    },
    {
      "en": "Bronzeforge Chest",
      "tr": "Bronzdövme Göğüslük"
    },
    {
      "en": "Bronzeforge Legs",
      "tr": "Bronzdövme Bacaklık"
    },
    {
      "en": "Bronzeforge Boots",
      "tr": "Bronzdövme Çizme"
    },
    {
      "en": "Bronzeforge Blade",
      "tr": "Bronzdövme Kılıç"
    },
    {
      "en": "Mosswarden Helm",
      "tr": "Yosmuhafız Miğfer"
    },
    {
      "en": "Mosswarden Chest",
      "tr": "Yosmuhafız Göğüslük"
    },
    {
      "en": "Mosswarden Legs",
      "tr": "Yosmuhafız Bacaklık"
    },
    {
      "en": "Mosswarden Boots",
      "tr": "Yosmuhafız Çizme"
    },
    {
      "en": "Mosswarden Blade",
      "tr": "Yosmuhafız Kılıç"
    },
    {
      "en": "Stormtouched Helm",
      "tr": "Fırtınadeğmiş Miğfer"
    },
    {
      "en": "Stormtouched Chest",
      "tr": "Fırtınadeğmiş Göğüslük"
    },
    {
      "en": "Stormtouched Legs",
      "tr": "Fırtınadeğmiş Bacaklık"
    },
    {
      "en": "Stormtouched Boots",
      "tr": "Fırtınadeğmiş Çizme"
    },
    {
      "en": "Stormtouched Blade",
      "tr": "Fırtınadeğmiş Kılıç"
    },
    {
      "en": "Runebound Helm",
      "tr": "Rünbağlı Miğfer"
    },
    {
      "en": "Runebound Chest",
      "tr": "Rünbağlı Göğüslük"
    },
    {
      "en": "Runebound Legs",
      "tr": "Rünbağlı Bacaklık"
    },
    {
      "en": "Runebound Boots",
      "tr": "Rünbağlı Çizme"
    },
    {
      "en": "Runebound Blade",
      "tr": "Rünbağlı Kılıç"
    },
    {
      "en": "Emberforged Helm",
      "tr": "Kordövme Miğfer"
    },
    {
      "en": "Emberforged Chest",
      "tr": "Kordövme Göğüslük"
    },
    {
      "en": "Emberforged Legs",
      "tr": "Kordövme Bacaklık"
    },
    {
      "en": "Emberforged Boots",
      "tr": "Kordövme Çizme"
    },
    {
      "en": "Emberforged Blade",
      "tr": "Kordövme Kılıç"
    },
    {
      "en": "Frostbound Helm",
      "tr": "Buzbağlı Miğfer"
    },
    {
      "en": "Frostbound Chest",
      "tr": "Buzbağlı Göğüslük"
    },
    {
      "en": "Frostbound Legs",
      "tr": "Buzbağlı Bacaklık"
    },
    {
      "en": "Frostbound Boots",
      "tr": "Buzbağlı Çizme"
    },
    {
      "en": "Frostbound Blade",
      "tr": "Buzbağlı Kılıç"
    },
    {
      "en": "Dragonblood Helm",
      "tr": "Ejderkanı Miğfer"
    },
    {
      "en": "Dragonblood Chest",
      "tr": "Ejderkanı Göğüslük"
    },
    {
      "en": "Dragonblood Legs",
      "tr": "Ejderkanı Bacaklık"
    },
    {
      "en": "Dragonblood Boots",
      "tr": "Ejderkanı Çizme"
    },
    {
      "en": "Dragonblood Blade",
      "tr": "Ejderkanı Kılıç"
    },
    {
      "en": "Voidweave Helm",
      "tr": "Boşlukdokuma Miğfer"
    },
    {
      "en": "Voidweave Chest",
      "tr": "Boşlukdokuma Göğüslük"
    },
    {
      "en": "Voidweave Legs",
      "tr": "Boşlukdokuma Bacaklık"
    },
    {
      "en": "Voidweave Boots",
      "tr": "Boşlukdokuma Çizme"
    },
    {
      "en": "Voidweave Blade",
      "tr": "Boşlukdokuma Kılıç"
    },
    {
      "en": "Setra's Chosen Helm",
      "tr": "Setra'nın Seçilmişi Miğfer"
    },
    {
      "en": "Setra's Chosen Chest",
      "tr": "Setra'nın Seçilmişi Göğüslük"
    },
    {
      "en": "Setra's Chosen Legs",
      "tr": "Setra'nın Seçilmişi Bacaklık"
    },
    {
      "en": "Setra's Chosen Boots",
      "tr": "Setra'nın Seçilmişi Çizme"
    },
    {
      "en": "Setra's Chosen Blade",
      "tr": "Setra'nın Seçilmişi Kılıç"
    },
    {
      "en": "Setra's Chosen Amulet",
      "tr": "Setra'nın Seçilmişi Muska"
    },
    {
      "en": "Setra's Chosen Ring",
      "tr": "Setra'nın Seçilmişi Yüzük"
    },
    {
      "en": "Setra's Chosen Book",
      "tr": "Setra'nın Seçilmişi Kitap"
    },
    {
      "en": "Setra's Chosen Stone",
      "tr": "Setra'nın Seçilmişi Taş"
    },
    {
      "en": "Warrior",
      "tr": "Savaşçı"
    },
    {
      "en": "Slash",
      "tr": "Kesme"
    },
    {
      "en": "Frontline Swordmaster",
      "tr": "Cephe Kılıç Ustası"
    },
    {
      "en": "A veteran of the front line. Heavy armor and a loyal blade. Balanced and forgiving — ideal for beginners.",
      "tr": "Cephenin emektarı. Ağır zırh ve sadık bir kılıç. Dengeli ve bağışlayıcı — yeni başlayanlar için ideal."
    },
    {
      "en": "Battle Fervor",
      "tr": "Savaş Şevki"
    },
    {
      "en": "Archer",
      "tr": "Okçu"
    },
    {
      "en": "Quick Shot",
      "tr": "Çabuk Atış"
    },
    {
      "en": "Long-Range Hunter",
      "tr": "Uzun Menzilli Avcı"
    },
    {
      "en": "A deadly archer striking from afar. Fast and first to shoot, but fragile up close.",
      "tr": "Uzaktan vuran ölümcül bir okçu. Hızlı ve ilk atışta, ama yakında kırılgan."
    },
    {
      "en": "Hunter's Instinct",
      "tr": "Avcı İçgüdüsü"
    },
    {
      "en": "Mage",
      "tr": "Büyücü"
    },
    {
      "en": "Arcane Bolt",
      "tr": "Arkane Ok"
    },
    {
      "en": "Apprentice Mage",
      "tr": "Çırak Büyücü"
    },
    {
      "en": "A novice bending arcane energy. Low health, deep mana pool. Huge burst damage, but needs protection.",
      "tr": "Arkane enerjiyi büken bir çırak. Az can, derin mana havuzu. Muazzam patlama hasarı, ama korunmaya ihtiyaç duyar."
    },
    {
      "en": "Arcane Intellect",
      "tr": "Arkane Zeka"
    },
    {
      "en": "Rogue",
      "tr": "Haydut"
    },
    {
      "en": "Stab",
      "tr": "Saplama"
    },
    {
      "en": "Shadow Thief",
      "tr": "Gölge Hırsızı"
    },
    {
      "en": "A cutpurse living in the shadows. Vampiric strikes steal life with every hit. Fast and cunning — for the impatient.",
      "tr": "Gölgelerde yaşayan bir kese kesen. Vampir vuruşları her isabetle can çalar. Hızlı ve kurnaz — sabırsızlar için."
    },
    {
      "en": "Opportunist",
      "tr": "Fırsatçı"
    },
    {
      "en": "Smite",
      "tr": "Kutsal Darbe"
    },
    {
      "en": "Holy Guardian",
      "tr": "Kutsal Muhafız"
    },
    {
      "en": "A knight sworn to the light. Strikes with steel, heals with prayer. Slow, but a rock that refuses to fall.",
      "tr": "Işığa yemin etmiş bir şövalye. Çelikle vurur, duayla iyileştirir. Yavaş, ama düşmeyi reddeden bir kaya."
    },
    {
      "en": "Holy Aegis",
      "tr": "Kutsal Aegis"
    },
    {
      "en": "Dawn Ward",
      "tr": "Şafak Siperi"
    },
    {
      "en": "Assassin",
      "tr": "Suikastçı"
    },
    {
      "en": "Lunge",
      "tr": "Atılış"
    },
    {
      "en": "Apprentice Assassin",
      "tr": "Çırak Suikastçı"
    },
    {
      "en": "A student of the deadly arts. Execute ends a single target — TRUE damage that ignores armor. Glass cannon: them or you.",
      "tr": "Ölümcül sanatların öğrencisi. İnfaz tek bir hedefi bitirir — zırhı yok sayan GERÇEK hasar. Cam top: ya onlar ya sen."
    },
    {
      "en": "Final Curtain",
      "tr": "Son Perde"
    },
    {
      "en": "Healer",
      "tr": "Şifacı"
    },
    {
      "en": "Sanct Bolt",
      "tr": "Kutsal Ok"
    },
    {
      "en": "Healer Adept",
      "tr": "Şifacı Ustası"
    },
    {
      "en": "The heart of the party. Cannot hunt alone — shines with friends. For team players.",
      "tr": "Grubun kalbi. Tek başına avlanamaz — dostlarıyla parlar. Takım oyuncuları için."
    },
    {
      "en": "Merciful Hand",
      "tr": "Merhametli El"
    },
    {
      "en": "Living Wall",
      "tr": "Yaşayan Duvar"
    },
    {
      "en": "A fortress incarnate. Low damage, but felling them takes a siege. A party without one is incomplete.",
      "tr": "Vücut bulmuş bir kale. Az hasar, ama onu devirmek bir kuşatma ister. Onsuz bir grup eksiktir."
    },
    {
      "en": "Spiked Wall",
      "tr": "Dikenli Duvar"
    },
    {
      "en": "Iron Hide",
      "tr": "Demir Deri"
    },
    {
      "en": "Tamer",
      "tr": "Terbiyeci"
    },
    {
      "en": "Tame Hit",
      "tr": "Evcilleştirme Vuruşu"
    },
    {
      "en": "Beast Tamer",
      "tr": "Hayvan Terbiyecisi"
    },
    {
      "en": "A tamer fighting beside wild companions. Hunts with Beast Bite, endures with War Heal. Strength in the pack, never alone.",
      "tr": "Vahşi yoldaşlarının yanında savaşan bir terbiyeci. Hayvan Isırığı ile avlanır, Savaş Şifası ile dayanır. Güç sürüde, asla yalnız değil."
    },
    {
      "en": "Beastmaster",
      "tr": "Hayvan Efendisi"
    },
    {
      "en": "Pack Alpha",
      "tr": "Sürü Lideri"
    },
    {
      "en": "Predator Strides",
      "tr": "Yırtıcı Adımları"
    },
    {
      "en": "Beast Strike",
      "tr": "Hayvan Vuruşu"
    },
    {
      "en": "Alpha Tamer",
      "tr": "Alfa Terbiyeci"
    },
    {
      "en": "Apex Bond",
      "tr": "Zirve Bağı"
    },
    {
      "en": "Wild Sprint",
      "tr": "Vahşi Koşu"
    },
    {
      "en": "Legendary Beasts",
      "tr": "Efsanevi Hayvanlar"
    },
    {
      "en": "Alpha Strike",
      "tr": "Alfa Vuruşu"
    },
    {
      "en": "Gardener",
      "tr": "Bahçıvan"
    },
    {
      "en": "Garden Swipe",
      "tr": "Bahçe Savurması"
    },
    {
      "en": "Nature Sprout",
      "tr": "Doğa Filizi"
    },
    {
      "en": "A gardener who hears the forest whisper. Vines and thorns are their weapons. A patient player's pick.",
      "tr": "Ormanın fısıltısını duyan bir bahçıvan. Sarmaşıklar ve dikenler onun silahı. Sabırlı oyuncunun seçimi."
    },
    {
      "en": "Living Bark",
      "tr": "Yaşayan Kabuk"
    },
    {
      "en": "Rootbinder",
      "tr": "Kökbağlayıcı"
    },
    {
      "en": "Deep Roots",
      "tr": "Derin Kökler"
    },
    {
      "en": "Sap Flow",
      "tr": "Öz Akışı"
    },
    {
      "en": "Root Lash",
      "tr": "Kök Kamçısı"
    },
    {
      "en": "Lifeweaver",
      "tr": "Yaşam Dokuyucu"
    },
    {
      "en": "Worldbloom",
      "tr": "Dünya Çiçeği"
    },
    {
      "en": "Gentle Season",
      "tr": "Nazik Mevsim"
    },
    {
      "en": "Bark Sanctuary",
      "tr": "Kabuk Sığınağı"
    },
    {
      "en": "Bloom Burst",
      "tr": "Çiçek Patlaması"
    },
    {
      "en": "Moderator",
      "tr": "Moderatör"
    },
    {
      "en": "Mod Strike",
      "tr": "Mod Vuruşu"
    },
    {
      "en": "Ultra Moderator",
      "tr": "Ultra Moderatör"
    },
    {
      "en": "Ban Hammer",
      "tr": "Ban Çekici"
    },
    {
      "en": "Trophy Case",
      "tr": "Kupa Vitrini"
    },
    {
      "en": "Confiscated",
      "tr": "El Konuldu"
    },
    {
      "en": "Mod Obliterate",
      "tr": "Mod Yok Etme"
    },
    {
      "en": "Tester",
      "tr": "Testçi"
    },
    {
      "en": "Ascension Test Dummy",
      "tr": "Yükseliş Test Kuklası"
    },
    {
      "en": "A test vessel for trying ascension. Starts at level 20 with every chest, every egg and every evolution item in its pack.",
      "tr": "Yükselişi denemek için bir test kabı. 20. seviyede başlar; çantasında her sandık, her yumurta ve her evrim eşyası vardır."
    },
    {
      "en": "War Lord",
      "tr": "Savaş Lordu"
    },
    {
      "en": "Battle Hunger",
      "tr": "Savaş Açlığı"
    },
    {
      "en": "Undying Warlord",
      "tr": "Ölümsüz Savaş Lordu"
    },
    {
      "en": "Great Slash",
      "tr": "Büyük Kesme"
    },
    {
      "en": "Warden",
      "tr": "Muhafız"
    },
    {
      "en": "True Aim",
      "tr": "Gerçek Nişan"
    },
    {
      "en": "Piercing Shots",
      "tr": "Delici Atışlar"
    },
    {
      "en": "Hunter Shot",
      "tr": "Avcı Atışı"
    },
    {
      "en": "Archmage",
      "tr": "Başbüyücü"
    },
    {
      "en": "Overmind",
      "tr": "Üst Zihin"
    },
    {
      "en": "Deep Well",
      "tr": "Derin Kuyu"
    },
    {
      "en": "Arcane Blast",
      "tr": "Arkane Patlama"
    },
    {
      "en": "Nightblade",
      "tr": "Gece Bıçağı"
    },
    {
      "en": "Red Harvest",
      "tr": "Kızıl Hasat"
    },
    {
      "en": "Ghoststep",
      "tr": "Hayalet Adımı"
    },
    {
      "en": "Shadow Stab",
      "tr": "Gölge Saplaması"
    },
    {
      "en": "Crusader",
      "tr": "Haçlı"
    },
    {
      "en": "Bulwark of Dawn",
      "tr": "Şafak Siperi"
    },
    {
      "en": "Greater Dawn Ward",
      "tr": "Yüce Şafak Siperi"
    },
    {
      "en": "Blessed Blade",
      "tr": "Kutsanmış Kılıç"
    },
    {
      "en": "Reaper",
      "tr": "Azrail"
    },
    {
      "en": "Reap the Weak",
      "tr": "Zayıfı Biç"
    },
    {
      "en": "Soul Siphon",
      "tr": "Ruh Sifonu"
    },
    {
      "en": "Reap",
      "tr": "Biçme"
    },
    {
      "en": "High Priest",
      "tr": "Yüce Rahip"
    },
    {
      "en": "Greater Benediction",
      "tr": "Yüce Takdis"
    },
    {
      "en": "Renewing Light",
      "tr": "Yenileyen Işık"
    },
    {
      "en": "Hallowed Bolt",
      "tr": "Kutsal Ok"
    },
    {
      "en": "Avalanche Hide",
      "tr": "Çığ Derisi"
    },
    {
      "en": "Siege Flesh",
      "tr": "Kuşatma Eti"
    },
    {
      "en": "Adamant Bash",
      "tr": "Sarsılmaz Vuruş"
    },
    {
      "en": "War Emperor",
      "tr": "Savaş İmparatoru"
    },
    {
      "en": "Conqueror's Aura",
      "tr": "Fatih'in Aurası"
    },
    {
      "en": "No Survivors",
      "tr": "Hayatta Kalan Yok"
    },
    {
      "en": "Imperial Decree",
      "tr": "İmparatorluk Fermanı"
    },
    {
      "en": "Colossal Slash",
      "tr": "Devasa Kesme"
    },
    {
      "en": "Storm Warden",
      "tr": "Fırtına Muhafızı"
    },
    {
      "en": "Storm's Judgment",
      "tr": "Fırtınanın Hükmü"
    },
    {
      "en": "Second Bolt",
      "tr": "İkinci Ok"
    },
    {
      "en": "Storm Shot",
      "tr": "Fırtına Atışı"
    },
    {
      "en": "Archon",
      "tr": "Arhon"
    },
    {
      "en": "Cosmic Mind",
      "tr": "Kozmik Zihin"
    },
    {
      "en": "Star Thirst",
      "tr": "Yıldız Susuzluğu"
    },
    {
      "en": "Primordial Bolt",
      "tr": "İlksel Ok"
    },
    {
      "en": "Shade King",
      "tr": "Gölge Kralı"
    },
    {
      "en": "Eclipse Reign",
      "tr": "Tutulma Hükümdarlığı"
    },
    {
      "en": "Untouchable",
      "tr": "Dokunulmaz"
    },
    {
      "en": "Eclipse Strike",
      "tr": "Tutulma Vuruşu"
    },
    {
      "en": "Lightbringer",
      "tr": "Işık Getiren"
    },
    {
      "en": "Dawn Incarnate",
      "tr": "Şafak Vücut Bulmuş"
    },
    {
      "en": "Radiant Mercy",
      "tr": "Parlak Merhamet"
    },
    {
      "en": "Halo Wall",
      "tr": "Halo Duvarı"
    },
    {
      "en": "Radiant Edge",
      "tr": "Işıyan Ağız"
    },
    {
      "en": "Death Lord",
      "tr": "Ölüm Lordu"
    },
    {
      "en": "Death's Due",
      "tr": "Ölümün Hakkı"
    },
    {
      "en": "Soul Feast",
      "tr": "Ruh Ziyafeti"
    },
    {
      "en": "Final Word",
      "tr": "Son Söz"
    },
    {
      "en": "Scythe Sweep",
      "tr": "Tırpan Savurması"
    },
    {
      "en": "Bloodspawn",
      "tr": "Kan Doğuşlu"
    },
    {
      "en": "Sanguine Hunger",
      "tr": "Kanlı Açlık"
    },
    {
      "en": "Apex Predator",
      "tr": "Zirve Yırtıcı"
    },
    {
      "en": "Fledgling of the Old Blood",
      "tr": "Eski Kanın Yavrusu"
    },
    {
      "en": "An assassin who knelt before Old Vesryn and rose thirsting. Fast, cruel, and forever barred from any other path.",
      "tr": "Yaşlı Vesryn'in önünde diz çöküp susayarak ayağa kalkan bir suikastçı. Hızlı, zalim ve sonsuza dek başka hiçbir yola kapalı."
    },
    {
      "en": "Vampire Bite",
      "tr": "Vampir Isırığı"
    },
    {
      "en": "Bloodlord",
      "tr": "Kan Lordu"
    },
    {
      "en": "Blood Tyranny",
      "tr": "Kan Zorbalığı"
    },
    {
      "en": "Crimson Verdict",
      "tr": "Kızıl Hüküm"
    },
    {
      "en": "Red Reign",
      "tr": "Kırmızı Hükümdarlık"
    },
    {
      "en": "Tyrant of the Thirst",
      "tr": "Susuzluğun Zorbası"
    },
    {
      "en": "A Bloodspawn that gorged for twenty levels and rose higher. The physical peak of the old blood — nothing else can become this.",
      "tr": "Yirmi seviye boyunca tıkınıp daha yükselen bir Kan Doğuşlu. Eski kanın fiziksel zirvesi — başka hiçbir şey buna dönüşemez."
    },
    {
      "en": "Tyrant Bite",
      "tr": "Zorba Isırığı"
    },
    {
      "en": "Gloomspawn",
      "tr": "Kasvet Doğuşlu"
    },
    {
      "en": "Moonlit Thirst",
      "tr": "Ay Işığı Susuzluğu"
    },
    {
      "en": "Gloom Well",
      "tr": "Kasvet Kuyusu"
    },
    {
      "en": "Occult Mind",
      "tr": "Gizemli Zihin"
    },
    {
      "en": "Acolyte of the Gloom",
      "tr": "Kasvetin Çırağı"
    },
    {
      "en": "A mage who knelt before Old Vesryn and bound the cruor into spellcraft. The magical twin of the Bloodspawn — no other path leads here.",
      "tr": "Yaşlı Vesryn'in önünde diz çöküp cruor'u büyücülüğe bağlayan bir büyücü. Kan Doğuşlu'nun büyülü ikizi — başka hiçbir yol buraya çıkmaz."
    },
    {
      "en": "Gloom Bolt",
      "tr": "Kasvet Oku"
    },
    {
      "en": "Sanguine Lord",
      "tr": "Kanlı Lord"
    },
    {
      "en": "First Thirst",
      "tr": "İlk Susuzluk"
    },
    {
      "en": "Crimson Grace",
      "tr": "Kızıl Lütuf"
    },
    {
      "en": "Soul Vintage",
      "tr": "Ruh Mahsulü"
    },
    {
      "en": "Heir of the First Thirst",
      "tr": "İlk Susuzluğun Vârisi"
    },
    {
      "en": "A mage who completed Vesryn's rite and bound the primeval cruor into spellcraft. Peerless blood magic — open only to those the rite has marked.",
      "tr": "Vesryn'in ayinini tamamlayıp kadim cruor'u büyücülüğe bağlayan bir büyücü. Eşsiz kan büyüsü — yalnızca ayinin işaretlediklerine açık."
    },
    {
      "en": "Sanguine Bolt",
      "tr": "Kanlı Ok"
    },
    {
      "en": "Divine Saint",
      "tr": "Kutsal Aziz"
    },
    {
      "en": "Miracle",
      "tr": "Mucize"
    },
    {
      "en": "Martyr's Return",
      "tr": "Şehidin Dönüşü"
    },
    {
      "en": "Everlasting Grace",
      "tr": "Ebedi Lütuf"
    },
    {
      "en": "Divine Light",
      "tr": "İlahi Işık"
    },
    {
      "en": "Colossus",
      "tr": "Dev"
    },
    {
      "en": "Mountain's Spite",
      "tr": "Dağın Kindarlığı"
    },
    {
      "en": "Bedrock Form",
      "tr": "Ana Kaya Formu"
    },
    {
      "en": "Gate of Stone",
      "tr": "Taş Kapısı"
    },
    {
      "en": "Titan Slam",
      "tr": "Titan Çarpması"
    },
    {
      "en": "Ember Strike",
      "tr": "Kor Vuruşu"
    },
    {
      "en": "Ember King",
      "tr": "Kor Kralı"
    },
    {
      "en": "Frost Titan",
      "tr": "Buz Devi"
    },
    {
      "en": "Void Herald",
      "tr": "Boşluk Habercisi"
    },
    {
      "en": "Storm Colossus",
      "tr": "Fırtına Devi"
    },
    {
      "en": "World Eater",
      "tr": "Dünya Yiyen"
    },
    {
      "en": "Ember Heavy",
      "tr": "Kor Ağır Vuruş"
    },
    {
      "en": "Ember Weaken",
      "tr": "Kor Zayıflatma"
    },
    {
      "en": "Ember weaken 35% 2t",
      "tr": "Kor zayıflatma %35 2t"
    },
    {
      "en": "Ember Fortify",
      "tr": "Kor Güçlendirme"
    },
    {
      "en": "Ember fortify 45% 2t",
      "tr": "Kor güçlendirme %45 2t"
    },
    {
      "en": "Ember Venom",
      "tr": "Kor Zehir"
    },
    {
      "en": "Ember Heal",
      "tr": "Kor İyileştirme"
    },
    {
      "en": "Ember heal 25%",
      "tr": "Kor iyileştirme %25"
    },
    {
      "en": "Frost Strike",
      "tr": "Buz Vuruşu"
    },
    {
      "en": "Frost Heavy",
      "tr": "Buz Ağır Vuruş"
    },
    {
      "en": "Frost Weaken",
      "tr": "Buz Zayıflatma"
    },
    {
      "en": "Frost weaken 35% 2t",
      "tr": "Buz zayıflatma %35 2t"
    },
    {
      "en": "Frost Fortify",
      "tr": "Buz Güçlendirme"
    },
    {
      "en": "Frost fortify 45% 2t",
      "tr": "Buz güçlendirme %45 2t"
    },
    {
      "en": "Frost Venom",
      "tr": "Buz Zehir"
    },
    {
      "en": "Frost Heal",
      "tr": "Buz İyileştirme"
    },
    {
      "en": "Frost heal 25%",
      "tr": "Buz iyileştirme %25"
    },
    {
      "en": "Void Strike",
      "tr": "Boşluk Vuruşu"
    },
    {
      "en": "Void Heavy",
      "tr": "Boşluk Ağır Vuruş"
    },
    {
      "en": "Void Weaken",
      "tr": "Boşluk Zayıflatma"
    },
    {
      "en": "Void expose 30% 2t",
      "tr": "Boşluk ifşa %30 2t"
    },
    {
      "en": "Void Fortify",
      "tr": "Boşluk Güçlendirme"
    },
    {
      "en": "Void fortify 50% 2t",
      "tr": "Boşluk güçlendirme %50 2t"
    },
    {
      "en": "Void Venom",
      "tr": "Boşluk Zehir"
    },
    {
      "en": "Void Heal",
      "tr": "Boşluk İyileştirme"
    },
    {
      "en": "Void heal 30%",
      "tr": "Boşluk iyileştirme %30"
    },
    {
      "en": "Storm Strike",
      "tr": "Fırtına Vuruşu"
    },
    {
      "en": "Storm Heavy",
      "tr": "Fırtına Ağır Vuruş"
    },
    {
      "en": "Storm Weaken",
      "tr": "Fırtına Zayıflatma"
    },
    {
      "en": "Storm weaken+expose 2t",
      "tr": "Fırtına zayıflatma+ifşa 2t"
    },
    {
      "en": "Storm Fortify",
      "tr": "Fırtına Güçlendirme"
    },
    {
      "en": "Storm fortify 40% 2t",
      "tr": "Fırtına güçlendirme %40 2t"
    },
    {
      "en": "Storm Venom",
      "tr": "Fırtına Zehir"
    },
    {
      "en": "Storm Heal",
      "tr": "Fırtına İyileştirme"
    },
    {
      "en": "Storm heal 25%",
      "tr": "Fırtına iyileştirme %25"
    },
    {
      "en": "World Strike",
      "tr": "Dünya Vuruşu"
    },
    {
      "en": "World Heavy",
      "tr": "Dünya Ağır Vuruş"
    },
    {
      "en": "World Weaken",
      "tr": "Dünya Zayıflatma"
    },
    {
      "en": "World weaken 40% 2t",
      "tr": "Dünya zayıflatma %40 2t"
    },
    {
      "en": "World Fortify",
      "tr": "Dünya Güçlendirme"
    },
    {
      "en": "World frenzy 40% 2t",
      "tr": "Dünya cinnet %40 2t"
    },
    {
      "en": "World Venom",
      "tr": "Dünya Zehir"
    },
    {
      "en": "World Heal",
      "tr": "Dünya İyileştirme"
    },
    {
      "en": "World heal 35%",
      "tr": "Dünya iyileştirme %35"
    },
    {
      "en": "Heavy Strike",
      "tr": "Ağır Vuruş"
    },
    {
      "en": "Defend",
      "tr": "Savun"
    },
    {
      "en": "Arcane Barrage",
      "tr": "Arkane Yaylımı"
    },
    {
      "en": "Mana Shield",
      "tr": "Mana Kalkanı"
    },
    {
      "en": "Aimed Shot",
      "tr": "Nişanlı Atış"
    },
    {
      "en": "Piercing Shot",
      "tr": "Delici Atış"
    },
    {
      "en": "Vampiric Strike",
      "tr": "Vampir Vuruşu"
    },
    {
      "en": "Shadow Meld",
      "tr": "Gölge Karışımı"
    },
    {
      "en": "Holy Strike",
      "tr": "Kutsal Vuruş"
    },
    {
      "en": "Divine Guard",
      "tr": "İlahi Koruma"
    },
    {
      "en": "Execute",
      "tr": "İnfaz"
    },
    {
      "en": "Shadow Step",
      "tr": "Gölge Adımı"
    },
    {
      "en": "Mend",
      "tr": "Onarım"
    },
    {
      "en": "Greater Mend",
      "tr": "Yüce Onarım"
    },
    {
      "en": "Fortify",
      "tr": "Güçlendir"
    },
    {
      "en": "War Banner",
      "tr": "Savaş Sancağı"
    },
    {
      "en": "Cleave",
      "tr": "Yarma"
    },
    {
      "en": "Shield Wall",
      "tr": "Kalkan Duvarı"
    },
    {
      "en": "Spirit Surge",
      "tr": "Ruh Dalgası"
    },
    {
      "en": "War Cry",
      "tr": "Savaş Çığlığı"
    },
    {
      "en": "Volley",
      "tr": "Yaylım"
    },
    {
      "en": "Shadow Veil",
      "tr": "Gölge Peçesi"
    },
    {
      "en": "Holy Judgement",
      "tr": "Kutsal Hüküm"
    },
    {
      "en": "Death Mark",
      "tr": "Ölüm İşareti"
    },
    {
      "en": "Divine Blessing",
      "tr": "İlahi Lütuf"
    },
    {
      "en": "Bastion",
      "tr": "Kale"
    },
    {
      "en": "Cataclysm",
      "tr": "Felaket"
    },
    {
      "en": "Storm Barrage",
      "tr": "Fırtına Yaylımı"
    },
    {
      "en": "Comet",
      "tr": "Kuyruklu Yıldız"
    },
    {
      "en": "Soul Thief",
      "tr": "Ruh Hırsızı"
    },
    {
      "en": "Radiance",
      "tr": "Işıltı"
    },
    {
      "en": "Soul Reap",
      "tr": "Ruh Biçme"
    },
    {
      "en": "Resurgence",
      "tr": "Yeniden Doğuş"
    },
    {
      "en": "Exsanguinate",
      "tr": "Kansızlaştırma"
    },
    {
      "en": "Bloodbath",
      "tr": "Kan Banyosu"
    },
    {
      "en": "Crimson Rebirth",
      "tr": "Kızıl Yeniden Doğuş"
    },
    {
      "en": "Immovable",
      "tr": "Sarsılmaz"
    },
    {
      "en": "Seismic Slam",
      "tr": "Sismik Çarpma"
    },
    {
      "en": "Colossal Crash",
      "tr": "Devasa Çöküş"
    },
    {
      "en": "Battle Fury",
      "tr": "Savaş Öfkesi"
    },
    {
      "en": "Iron Wall",
      "tr": "Demir Duvar"
    },
    {
      "en": "Group Guard",
      "tr": "Grup Koruma"
    },
    {
      "en": "Cripple",
      "tr": "Sakatla"
    },
    {
      "en": "Venom Strike",
      "tr": "Zehir Vuruşu"
    },
    {
      "en": "Rejuvenate",
      "tr": "Gençleştir"
    },
    {
      "en": "Savage Blow",
      "tr": "Vahşi Darbe"
    },
    {
      "en": "Shadow Claw",
      "tr": "Gölge Pençesi"
    },
    {
      "en": "Arcane Surge",
      "tr": "Arkane Dalgası"
    },
    {
      "en": "Heavy Blow",
      "tr": "Ağır Darbe"
    },
    {
      "en": "Shadow Bolt",
      "tr": "Gölge Oku"
    },
    {
      "en": "Arcane Storm",
      "tr": "Arkane Fırtınası"
    },
    {
      "en": "Frenzy",
      "tr": "Cinnet"
    },
    {
      "en": "Stoneskin",
      "tr": "Taş Deri"
    },
    {
      "en": "Regenerate",
      "tr": "Yenilen"
    },
    {
      "en": "Crushing Aura",
      "tr": "Ezici Aura"
    },
    {
      "en": "Expose Weakness",
      "tr": "Zayıflık Aç"
    },
    {
      "en": "Venom",
      "tr": "Zehir"
    },
    {
      "en": "Barrier",
      "tr": "Bariyer"
    },
    {
      "en": "Stone Skin",
      "tr": "Taş Ten"
    },
    {
      "en": "Holy Ward",
      "tr": "Kutsal Siper"
    },
    {
      "en": "Dark Veil",
      "tr": "Karanlık Peçe"
    },
    {
      "en": "Graft",
      "tr": "Aşı"
    },
    {
      "en": "Frost Bolt",
      "tr": "Buz Oku"
    },
    {
      "en": "Frost Nova",
      "tr": "Buz Novası"
    },
    {
      "en": "Water Splash",
      "tr": "Su Sıçraması"
    },
    {
      "en": "Lightning Bolt",
      "tr": "Yıldırım Oku"
    },
    {
      "en": "War Heal",
      "tr": "Savaş Şifası"
    },
    {
      "en": "Magic Mend",
      "tr": "Büyülü Onarım"
    },
    {
      "en": "Scorch Mark",
      "tr": "Kavurma İzi"
    },
    {
      "en": "Ember Storm",
      "tr": "Kor Fırtınası"
    },
    {
      "en": "Blaze Rupture",
      "tr": "Alev Yarığı"
    },
    {
      "en": "Cold Snap",
      "tr": "Ani Soğuk"
    },
    {
      "en": "Glacial Shatter",
      "tr": "Buzul Kırılması"
    },
    {
      "en": "Volt Conduit",
      "tr": "Volt Kanalı"
    },
    {
      "en": "Static Overload",
      "tr": "Statik Aşırı Yükleme"
    },
    {
      "en": "Toxin Drench",
      "tr": "Toksin Yağmuru"
    },
    {
      "en": "Venom Burst",
      "tr": "Zehir Patlaması"
    },
    {
      "en": "Broken Guard",
      "tr": "Kırık Siper"
    },
    {
      "en": "Shatter Point",
      "tr": "Kırılma Noktası"
    },
    {
      "en": "Devastate",
      "tr": "Yıkım"
    },
    {
      "en": "Vine Lash",
      "tr": "Sarmaşık Kamçısı"
    },
    {
      "en": "Thorn Volley",
      "tr": "Diken Yaylımı"
    },
    {
      "en": "Forest Renewal",
      "tr": "Orman Yenilenmesi"
    },
    {
      "en": "Bloom with nature's blessing, restoring 30% of your max HP.",
      "tr": "Doğanın lütfuyla çiçek açarak maks. canının %30'unu geri yükler."
    },
    {
      "en": "Beast Bite",
      "tr": "Hayvan Isırığı"
    },
    {
      "en": "Slime",
      "tr": "Balçık"
    },
    {
      "en": "Goblin",
      "tr": "Goblin"
    },
    {
      "en": "Giant Rat",
      "tr": "Dev Sıçan"
    },
    {
      "en": "Cave Bat",
      "tr": "Mağara Yarasası"
    },
    {
      "en": "Wolf",
      "tr": "Kurt"
    },
    {
      "en": "Bandit",
      "tr": "Haydut"
    },
    {
      "en": "Spider",
      "tr": "Örümcek"
    },
    {
      "en": "Wild Boar",
      "tr": "Yaban Domuzu"
    },
    {
      "en": "Goblin Archer",
      "tr": "Goblin Okçu"
    },
    {
      "en": "Rat King",
      "tr": "Sıçan Kral"
    },
    {
      "en": "Grove Sprite",
      "tr": "Koru Perisi"
    },
    {
      "en": "Goblin Warrior",
      "tr": "Goblin Savaşçı"
    },
    {
      "en": "Skeleton",
      "tr": "İskelet"
    },
    {
      "en": "Dire Wolf",
      "tr": "Dev Kurt"
    },
    {
      "en": "Harpy",
      "tr": "Harpi"
    },
    {
      "en": "Orc",
      "tr": "Ork"
    },
    {
      "en": "Thorn Viper",
      "tr": "Diken Engereği"
    },
    {
      "en": "Swamp Troll",
      "tr": "Bataklık Trolü"
    },
    {
      "en": "Griffin",
      "tr": "Grifon"
    },
    {
      "en": "Golem",
      "tr": "Golem"
    },
    {
      "en": "Stone Warden",
      "tr": "Taş Muhafız"
    },
    {
      "en": "Wraith",
      "tr": "Hayalet"
    },
    {
      "en": "Manticore",
      "tr": "Manticore"
    },
    {
      "en": "Ogre",
      "tr": "Ogre"
    },
    {
      "en": "Dark Knight",
      "tr": "Karanlık Şövalye"
    },
    {
      "en": "Witch",
      "tr": "Cadı"
    },
    {
      "en": "Wyvern",
      "tr": "Wyvern"
    },
    {
      "en": "Ancient Golem",
      "tr": "Kadim Golem"
    },
    {
      "en": "Lich",
      "tr": "Lich"
    },
    {
      "en": "Hydra",
      "tr": "Hidra"
    },
    {
      "en": "Kobold",
      "tr": "Kobold"
    },
    {
      "en": "Scavenger",
      "tr": "Leşçil"
    },
    {
      "en": "Cave Crawler",
      "tr": "Mağara Sürüngeni"
    },
    {
      "en": "Forest Mite",
      "tr": "Orman Akarı"
    },
    {
      "en": "Sludge",
      "tr": "Çamur"
    },
    {
      "en": "Thug",
      "tr": "Kabadayı"
    },
    {
      "en": "Dusk Bat",
      "tr": "Alacakaranlık Yarasası"
    },
    {
      "en": "Ember Slime",
      "tr": "Kor Balçığı"
    },
    {
      "en": "Iron Goblin",
      "tr": "Demir Goblin"
    },
    {
      "en": "Bone Archer",
      "tr": "Kemik Okçu"
    },
    {
      "en": "Frost Wolf",
      "tr": "Buz Kurdu"
    },
    {
      "en": "Vine Lurker",
      "tr": "Sarmaşık Pusu"
    },
    {
      "en": "Ash Spider",
      "tr": "Kül Örümceği"
    },
    {
      "en": "Brigand Captain",
      "tr": "Haydut Kaptanı"
    },
    {
      "en": "Marsh Crawler",
      "tr": "Bataklık Sürüngeni"
    },
    {
      "en": "Ember Sprite",
      "tr": "Kor Perisi"
    },
    {
      "en": "Crystal Golem",
      "tr": "Kristal Golem"
    },
    {
      "en": "Abyss Wraith",
      "tr": "Uçurum Hayaleti"
    },
    {
      "en": "Storm Harpy",
      "tr": "Fırtına Harpisi"
    },
    {
      "en": "Iron Ogre",
      "tr": "Demir Ogre"
    },
    {
      "en": "Cursed Knight",
      "tr": "Lanetli Şövalye"
    },
    {
      "en": "Flame Witch",
      "tr": "Alev Cadısı"
    },
    {
      "en": "Stone Titan",
      "tr": "Taş Titan"
    },
    {
      "en": "Dusk Manticore",
      "tr": "Alacakaranlık Manticore"
    },
    {
      "en": "Frost Wyvern",
      "tr": "Buz Wyvern"
    },
    {
      "en": "Void Golem",
      "tr": "Boşluk Golemi"
    },
    {
      "en": "Storm Lich",
      "tr": "Fırtına Lich"
    },
    {
      "en": "Nether Hydra",
      "tr": "Cehennem Hidrası"
    },
    {
      "en": "Doom Lord",
      "tr": "Kıyamet Lordu"
    },
    {
      "en": "Molten Behemoth",
      "tr": "Erimiş Behemot"
    },
    {
      "en": "Phoenix Canary",
      "tr": "Anka Kanaryası"
    },
    {
      "en": "Vine Wraith",
      "tr": "Sarmaşık Hayaleti"
    },
    {
      "en": "Thornback Boar",
      "tr": "Dikensırt Domuzu"
    },
    {
      "en": "Elder Treant",
      "tr": "Yaşlı Ağaç Adam"
    },
    {
      "en": "Human",
      "tr": "İnsan"
    },
    {
      "en": "Adaptable and ambitious. +10% gold from victories.",
      "tr": "Uyum sağlayan ve hırslı. Zaferlerden +%10 altın."
    },
    {
      "en": "Ambitious",
      "tr": "Hırslı"
    },
    {
      "en": "Elf",
      "tr": "Elf"
    },
    {
      "en": "Graceful and attuned. +12 mana, +1 speed.",
      "tr": "Zarif ve uyumlu. +12 mana, +1 hız."
    },
    {
      "en": "Dwarf",
      "tr": "Cüce"
    },
    {
      "en": "Stout and enduring. +30 max HP, +6 resistance.",
      "tr": "Sağlam ve dayanıklı. +30 maks. can, +6 direnç."
    },
    {
      "en": "Brutal and strong. +6 attack.",
      "tr": "Vahşi ve güçlü. +6 saldırı."
    },
    {
      "en": "Beastkin",
      "tr": "Yarı Hayvan"
    },
    {
      "en": "Wild instincts. +2 speed, +3 attack.",
      "tr": "Vahşi içgüdüler. +2 hız, +3 saldırı."
    },
    {
      "en": "Wyvernkin",
      "tr": "Wyvern Halkı"
    },
    {
      "en": "Sky hunters. 5% dodge chance.",
      "tr": "Gökyüzü avcıları. %5 kaçınma şansı."
    },
    {
      "en": "Sky Dancer",
      "tr": "Gökyüzü Dansçısı"
    },
    {
      "en": "High Elf",
      "tr": "Yüce Elf"
    },
    {
      "en": "Ancient magic in the blood. +8 magic power.",
      "tr": "Kanında kadim büyü. +8 büyü gücü."
    },
    {
      "en": "Gorgon",
      "tr": "Gorgon"
    },
    {
      "en": "A gaze of stone. Reflects 10% damage, +4 resistance.",
      "tr": "Taşa çeviren bakış. Hasarın %10'unu yansıtır, +4 direnç."
    },
    {
      "en": "Petrifying Gaze",
      "tr": "Taşlaştıran Bakış"
    },
    {
      "en": "Demonblood",
      "tr": "Şeytankanı"
    },
    {
      "en": "Burning heritage. +15% damage, but takes 30% more holy damage.",
      "tr": "Yanan bir miras. +%15 hasar, ama %30 daha fazla kutsal hasar alır."
    },
    {
      "en": "Demonic Fury",
      "tr": "Şeytani Öfke"
    },
    {
      "en": "Unholy Weakness",
      "tr": "Kutsal Olmayan Zayıflık"
    },
    {
      "en": "Lightborn",
      "tr": "Işıkdoğan"
    },
    {
      "en": "Blessed radiance. +15% healing, but takes 30% more shadow damage.",
      "tr": "Kutsanmış ışıltı. +%15 iyileştirme, ama %30 daha fazla gölge hasar alır."
    },
    {
      "en": "Radiant Touch",
      "tr": "Işıyan Dokunuş"
    },
    {
      "en": "Shadow Frailty",
      "tr": "Gölge Kırılganlığı"
    },
    {
      "en": "Voidborn",
      "tr": "Boşlukdoğan"
    },
    {
      "en": "Touched by the void. 8% dodge, but takes 20% more holy damage.",
      "tr": "Boşluk tarafından dokunulmuş. %8 kaçınma, ama %20 daha fazla kutsal hasar alır."
    },
    {
      "en": "Void Step",
      "tr": "Boşluk Adımı"
    },
    {
      "en": "Light Frailty",
      "tr": "Işık Kırılganlığı"
    },
    {
      "en": "Daemonkin",
      "tr": "Şeytan Halkı"
    },
    {
      "en": "Royal Wrath",
      "tr": "Kraliyet Gazabı"
    },
    {
      "en": "Dragonborn",
      "tr": "Ejderdoğan"
    },
    {
      "en": "Scales of the wyrms. Take 15% less damage.",
      "tr": "Ejder pulları. %15 daha az hasar alır."
    },
    {
      "en": "Dragonscales",
      "tr": "Ejder Pulları"
    },
    {
      "en": "Arch-Vampyr",
      "tr": "Baş Vampir"
    },
    {
      "en": "Ancient predator. Heal 12% of all damage dealt.",
      "tr": "Kadim yırtıcı. Verilen tüm hasarın %12'sini iyileştirir."
    },
    {
      "en": "Crimson Thirst",
      "tr": "Kızıl Susuzluk"
    },
    {
      "en": "Archangel",
      "tr": "Baş Melek"
    },
    {
      "en": "Celestial guardian. +25% healing and start combat with a 10% shield (3 turns).",
      "tr": "Göksel muhafız. +%25 iyileştirme ve savaşa %10 kalkanla başla (3 tur)."
    },
    {
      "en": "Celestial Grace",
      "tr": "Göksel Lütuf"
    },
    {
      "en": "Aegis of Dawn",
      "tr": "Şafak Aegisi"
    },
    {
      "en": "The Progenitor's Thirst",
      "tr": "Atanın Susuzluğu"
    },
    {
      "en": "Slay 50 humanoid foes and gather 10 Drops of Primeval Cruor for Old Vesryn. Completing the rite opens the vampire paths: Bloodspawn (physical, assassin Lv20, through Vesryn), Gloomspawn (magic, mage Lv20, through Vesryn), then Bloodlord and Sanguine Lord (Lv40, temple, vampire blood only).",
      "tr": "Yaşlı Vesryn için 50 insansı düşman öldür ve 10 Kadim Cruor Damlası topla. Ayini tamamlamak vampir yollarını açar: Kan Doğuşlu (fiziksel, suikastçı Sv20, Vesryn aracılığıyla), Kasvet Doğuşlu (büyü, büyücü Sv20, Vesryn aracılığıyla), ardından Kan Lordu ve Kanlı Lord (Sv40, tapınak, yalnızca vampir kanı)."
    },
    {
      "en": "Common",
      "tr": "Yaygın"
    },
    {
      "en": "Uncommon",
      "tr": "Sıra Dışı"
    },
    {
      "en": "Rare",
      "tr": "Nadir"
    },
    {
      "en": "Epic",
      "tr": "Destansı"
    },
    {
      "en": "Legendary",
      "tr": "Efsanevi"
    },
    {
      "en": "Mythic",
      "tr": "Mitik"
    },
    {
      "en": "Verdant Wilds",
      "tr": "Yeşil Vahşi Doğa"
    },
    {
      "en": "Lush, alive, and never truly safe.",
      "tr": "Yemyeşil, canlı ve asla tam güvenli değil."
    },
    {
      "en": "Thornback Skirmisher",
      "tr": "Dikensırt Çatışmacısı"
    },
    {
      "en": "Elder Moss Treant",
      "tr": "Yaşlı Yosun Ağaç Adam"
    },
    {
      "en": "Gloom Wraith",
      "tr": "Kasvet Hayaleti"
    },
    {
      "en": "Venomfang Spider",
      "tr": "Zehirdiş Örümcek"
    },
    {
      "en": "Ancient Grove Guardian",
      "tr": "Kadim Koru Muhafızı"
    },
    {
      "en": "Ashen Wastes",
      "tr": "Kül Çorakları"
    },
    {
      "en": "Cinders, crags, and things that burn.",
      "tr": "Korlar, kayalıklar ve yanan şeyler."
    },
    {
      "en": "Cinder Imp",
      "tr": "Kor İblisi"
    },
    {
      "en": "Ash Revenant",
      "tr": "Kül Hortlağı"
    },
    {
      "en": "Magma Behemoth",
      "tr": "Magma Behemot"
    },
    {
      "en": "Cinder Bat",
      "tr": "Kor Yarasası"
    },
    {
      "en": "Emberlord Vulkarr",
      "tr": "Kor Lordu Vulkarr"
    },
    {
      "en": "Frozen Tundra",
      "tr": "Donmuş Tundra"
    },
    {
      "en": "Where the wind bites and the dead do not sleep.",
      "tr": "Rüzgârın ısırdığı ve ölülerin uyumadığı yer."
    },
    {
      "en": "Ice Wraith",
      "tr": "Buz Hayaleti"
    },
    {
      "en": "Glacier Golem",
      "tr": "Buzul Golemi"
    },
    {
      "en": "Snow Stalker",
      "tr": "Kar Avcısı"
    },
    {
      "en": "Permafrost Wyrm",
      "tr": "Kalıcı Buz Ejderi"
    },
    {
      "en": "Rime Archer",
      "tr": "Kırağı Okçu"
    },
    {
      "en": "Grave Archer",
      "tr": "Mezar Okçu"
    },
    {
      "en": "Mirefen Marsh",
      "tr": "Mirefen Bataklığı"
    },
    {
      "en": "Every step squelches. Something is always watching.",
      "tr": "Her adım şapırdıyor. Bir şey her zaman izliyor."
    },
    {
      "en": "Bog Lurker",
      "tr": "Bataklık Pusucusu"
    },
    {
      "en": "Mire Hag",
      "tr": "Bataklık Kocakarısı"
    },
    {
      "en": "Rot Treant",
      "tr": "Çürük Ağaç Adam"
    },
    {
      "en": "Leech Swarm",
      "tr": "Sülük Sürüsü"
    },
    {
      "en": "Plaguebringer Morvane",
      "tr": "Veba Getiren Morvane"
    },
    {
      "en": "Cursed Reach",
      "tr": "Lanetli Diyar"
    },
    {
      "en": "The sky is wrong here. So is everything below it.",
      "tr": "Burada gökyüzü yanlış. Altındaki her şey de öyle."
    },
    {
      "en": "Hollow Knight",
      "tr": "İçi Boş Şövalye"
    },
    {
      "en": "Blood Seer",
      "tr": "Kan Gören"
    },
    {
      "en": "Bone Warden",
      "tr": "Kemik Muhafız"
    },
    {
      "en": "Nightmare",
      "tr": "Kâbus"
    },
    {
      "en": "Dread Sovereign",
      "tr": "Dehşet Hükümdarı"
    },
    {
      "en": "Sanguine Thirst",
      "tr": "Kanlı Susuzluk"
    },
    {
      "en": "Iron Bark",
      "tr": "Demir Kabuk"
    },
    {
      "en": "Gain a little extra resistance.",
      "tr": "Biraz ekstra direnç kazan."
    },
    {
      "en": "Ember Well",
      "tr": "Kor Kuyusu"
    },
    {
      "en": "Arcane Reservoir",
      "tr": "Arkane Haznesi"
    },
    {
      "en": "Mana regenerates a little faster each round.",
      "tr": "Mana her tur biraz daha hızlı yenilenir."
    },
    {
      "en": "Primeval Bloodlust",
      "tr": "Kadim Kan Susuzluğu"
    },
    {
      "en": "First Dawn",
      "tr": "İlk Şafak"
    },
    {
      "en": "Start each day with bonus stamina.",
      "tr": "Her güne bonus dayanıklılıkla başla."
    },
    {
      "en": "Physical",
      "tr": "Fiziksel"
    },
    {
      "en": "Plain weapon strikes and brute force.",
      "tr": "Basit silah vuruşları ve kaba kuvvet."
    },
    {
      "en": "Arcane",
      "tr": "Arkane"
    },
    {
      "en": "Raw magical energy and eldritch plasma.",
      "tr": "Ham büyülü enerji ve tuhaf plazma."
    },
    {
      "en": "Shadow",
      "tr": "Gölge"
    },
    {
      "en": "Darkness and cold moonlight arts.",
      "tr": "Karanlık ve soğuk ay ışığı sanatları."
    },
    {
      "en": "Holy",
      "tr": "Kutsal"
    },
    {
      "en": "Divine light and radiant judgement.",
      "tr": "İlahi ışık ve parlak hüküm."
    },
    {
      "en": "Frost",
      "tr": "Buz"
    },
    {
      "en": "Ice, cold and glacial shards.",
      "tr": "Buz, soğuk ve buzul parçaları."
    },
    {
      "en": "Fire",
      "tr": "Ateş"
    },
    {
      "en": "Burning flame and searing heat.",
      "tr": "Yanan alev ve kavurucu sıcaklık."
    },
    {
      "en": "Water",
      "tr": "Su"
    },
    {
      "en": "Flowing currents and crushing waves.",
      "tr": "Akan akıntılar ve ezici dalgalar."
    },
    {
      "en": "Earth",
      "tr": "Toprak"
    },
    {
      "en": "Stone, soil and bedrock.",
      "tr": "Taş, toprak ve ana kaya."
    },
    {
      "en": "Nature",
      "tr": "Doğa"
    },
    {
      "en": "Growth, vines, thorns and the living forest.",
      "tr": "Büyüme, sarmaşıklar, dikenler ve yaşayan orman."
    },
    {
      "en": "Lightning",
      "tr": "Yıldırım"
    },
    {
      "en": "Storms, thunder and electric surges.",
      "tr": "Fırtınalar, gök gürültüsü ve elektrik dalgaları."
    },
    {
      "en": "Blood",
      "tr": "Kan"
    },
    {
      "en": "Crimson hemomancy and life-stealing arts.",
      "tr": "Kızıl kan büyüsü ve can çalan sanatlar."
    },
    {
      "en": "Dark",
      "tr": "Karanlık"
    },
    {
      "en": "Void, abyss and forbidden power.",
      "tr": "Boşluk, uçurum ve yasak güç."
    },
    {
      "en": "Voidcaller",
      "tr": "Boşluk Çağıran"
    },
    {
      "en": "Gear steeped in the lightless void. It hums when whole.",
      "tr": "Işıksız boşluğa batmış teçhizat. Tamamlanınca uğuldar."
    },
    {
      "en": "Nightshade",
      "tr": "Gece Gölgesi"
    },
    {
      "en": "Eclipse-dark garb for those who strike unseen.",
      "tr": "Görünmeden vuranlar için tutulma karanlığında giysi."
    },
    {
      "en": "Wildstrider",
      "tr": "Vahşi Yolcu"
    },
    {
      "en": "Scout gear of the deep woods. Light feet, true aim.",
      "tr": "Derin ormanların keşif teçhizatı. Hafif ayaklar, isabetli nişan."
    },
    {
      "en": "Dragonscale",
      "tr": "Ejder Pulu"
    },
    {
      "en": "Plate cut from elder wyrms. Heavy, proud, unbroken.",
      "tr": "Yaşlı ejderlerden kesilmiş plaka. Ağır, gururlu, kırılmamış."
    },
    {
      "en": "Trailworn",
      "tr": "Yol Yıpranmışı"
    },
    {
      "en": "Honest stitched leather for the road.",
      "tr": "Yol için dürüstçe dikilmiş deri."
    },
    {
      "en": "Ironclad",
      "tr": "Demir Kaplı"
    },
    {
      "en": "Plain iron, honestly forged.",
      "tr": "Sade demir, dürüstçe dövülmüş."
    },
    {
      "en": "Sanguine",
      "tr": "Kanlı"
    },
    {
      "en": "Vampiric relics that thirst together. Two pieces wake them; four unleash them.",
      "tr": "Birlikte susayan vampir kalıntıları. İki parça onları uyandırır; dört parça serbest bırakır."
    },
    {
      "en": "Duskhide",
      "tr": "Alacakaranlık Derisi"
    },
    {
      "en": "Dark leather for quiet roads.",
      "tr": "Sessiz yollar için koyu deri."
    },
    {
      "en": "Bronzeforge",
      "tr": "Bronzdövme"
    },
    {
      "en": "Steel breast and bronze trim.",
      "tr": "Çelik göğüs ve bronz süsleme."
    },
    {
      "en": "Mosswarden",
      "tr": "Yosmuhafız"
    },
    {
      "en": "Bark and moss grown armour.",
      "tr": "Kabuk ve yosundan büyümüş zırh."
    },
    {
      "en": "Stormtouched",
      "tr": "Fırtınadeğmiş"
    },
    {
      "en": "Forged in a thunderstorm.",
      "tr": "Bir gök gürültüsü fırtınasında dövülmüş."
    },
    {
      "en": "Runebound",
      "tr": "Rünbağlı"
    },
    {
      "en": "Etched with living runes.",
      "tr": "Yaşayan rünlerle kazınmış."
    },
    {
      "en": "Emberforged",
      "tr": "Kordövme"
    },
    {
      "en": "Black steel veined with molten ember.",
      "tr": "Erimiş korla damarlanmış kara çelik."
    },
    {
      "en": "Frostbound",
      "tr": "Buzbağlı"
    },
    {
      "en": "Armour of enduring winter.",
      "tr": "Dayanıklı kışın zırhı."
    },
    {
      "en": "Dragonblood",
      "tr": "Ejderkanı"
    },
    {
      "en": "Dragonscale burning with a molten heart.",
      "tr": "Erimiş bir kalple yanan ejder pulu."
    },
    {
      "en": "Voidweave",
      "tr": "Boşlukdokuma"
    },
    {
      "en": "Cloth of the lightless void.",
      "tr": "Işıksız boşluğun kumaşı."
    },
    {
      "en": "Setra's Chosen",
      "tr": "Setra'nın Seçilmişi"
    },
    {
      "en": "The relic panoply of the first chosen.",
      "tr": "İlk seçilmişin kalıntı donanımı."
    },
    {
      "en": "F-Rank",
      "tr": "F-Rütbesi"
    },
    {
      "en": "D-Rank",
      "tr": "D-Rütbesi"
    },
    {
      "en": "C-Rank",
      "tr": "C-Rütbesi"
    },
    {
      "en": "B-Rank",
      "tr": "B-Rütbesi"
    },
    {
      "en": "A-Rank",
      "tr": "A-Rütbesi"
    },
    {
      "en": "S-Rank",
      "tr": "S-Rütbesi"
    },
    {
      "en": "SS-Rank",
      "tr": "SS-Rütbesi"
    },
    {
      "en": "Fast Dungeon",
      "tr": "Hızlı Zindan"
    },
    {
      "en": "Ember Hollow",
      "tr": "Kor Çukuru"
    },
    {
      "en": "Frost Crypt",
      "tr": "Buz Mahzeni"
    },
    {
      "en": "Shadow Sanctum",
      "tr": "Gölge Mabedi"
    },
    {
      "en": "Storm Bastion",
      "tr": "Fırtına Kalesi"
    },
    {
      "en": "Void Maw",
      "tr": "Boşluk Ağzı"
    },
    {
      "en": "Ancient Foundry",
      "tr": "Kadim Dökümhane"
    },
    {
      "en": "Phoenix Sanctum",
      "tr": "Anka Mabedi"
    },
    {
      "en": "Glacier Doomlord",
      "tr": "Buzul Kıyamet Lordu"
    },
    {
      "en": "Eternal Abyss Herald",
      "tr": "Ebedi Uçurum Habercisi"
    },
    {
      "en": "Thunder Tyrant",
      "tr": "Gök Gürültüsü Zorbası"
    },
    {
      "en": "Oblivion Devourer",
      "tr": "Unutuluş Yiyeni"
    },
    {
      "en": "Verdant Ruins",
      "tr": "Yeşil Harabeler"
    },
    {
      "en": "Sunken Cistern",
      "tr": "Batık Sarnıç"
    },
    {
      "en": "Ashen War Camp",
      "tr": "Kül Savaş Kampı"
    },
    {
      "en": "Frozen Sanctum",
      "tr": "Donmuş Mabet"
    },
    {
      "en": "Void Rift",
      "tr": "Boşluk Yarığı"
    },
    {
      "en": "Worldroot Abyss",
      "tr": "Dünyakökü Uçurumu"
    },
    {
      "en": "Overcharge",
      "tr": "Aşırı Yükleme"
    },
    {
      "en": "Lightning surges through soaked foes, dealing +50% damage to wet targets.",
      "tr": "Yıldırım ıslak düşmanlardan geçer, ıslak hedeflere +%50 hasar verir."
    },
    {
      "en": "Deep Freeze",
      "tr": "Derin Donma"
    },
    {
      "en": "Frost latches onto moisture, dealing +40% damage to wet targets.",
      "tr": "Buz neme tutunur, ıslak hedeflere +%40 hasar verir."
    },
    {
      "en": "Shatter",
      "tr": "Kırılma"
    },
    {
      "en": "Physical blows shatter frozen enemies, dealing +60% damage.",
      "tr": "Fiziksel darbeler donmuş düşmanları kırar, +%60 hasar verir."
    },
    {
      "en": "Burning Blaze",
      "tr": "Yanan Alev"
    },
    {
      "en": "Fire erupts on burning foes, dealing +60% damage to poisoned targets.",
      "tr": "Ateş yanan düşmanlarda patlar, zehirli hedeflere +%60 hasar verir."
    },
    {
      "en": "Break Guard",
      "tr": "Siper Kırma"
    },
    {
      "en": "Exposed enemies take +35% physical damage.",
      "tr": "İfşa olmuş düşmanlar +%35 fiziksel hasar alır."
    },
    {
      "en": "Overwhelm",
      "tr": "Ezme"
    },
    {
      "en": "Weakened enemies crumble, taking +20% physical damage.",
      "tr": "Zayıflamış düşmanlar çöker, +%20 fiziksel hasar alır."
    },
    {
      "en": "Rend",
      "tr": "Yırtma"
    },
    {
      "en": "Steel tears bleeding foes, dealing +30% physical damage to poisoned targets.",
      "tr": "Çelik kanayan düşmanları yırtar, zehirli hedeflere +%30 fiziksel hasar verir."
    },
    {
      "en": "Backstab",
      "tr": "Sırttan Hançer"
    },
    {
      "en": "Shadow finds the cracks, dealing +40% shadow damage to exposed targets.",
      "tr": "Gölge çatlakları bulur, ifşa olmuş hedeflere +%40 gölge hasarı verir."
    },
    {
      "en": "Bountiful Dawn",
      "tr": "Bereketli Şafak"
    },
    {
      "en": "Echoes",
      "tr": "Yankılar"
    },
    {
      "en": "Keen Edge",
      "tr": "Keskin Ağız"
    },
    {
      "en": "Iron Trial",
      "tr": "Demir Sınavı"
    },
    {
      "en": "Calm Day",
      "tr": "Sakin Gün"
    },
    {
      "en": "Helmet",
      "tr": "Miğfer"
    },
    {
      "en": "Armor",
      "tr": "Zırh"
    },
    {
      "en": "Pants",
      "tr": "Pantolon"
    },
    {
      "en": "Boots",
      "tr": "Çizme"
    },
    {
      "en": "Weapon",
      "tr": "Silah"
    },
    {
      "en": "Amulet",
      "tr": "Muska"
    },
    {
      "en": "Ring 1",
      "tr": "Yüzük 1"
    },
    {
      "en": "Ring 2",
      "tr": "Yüzük 2"
    },
    {
      "en": "Book",
      "tr": "Kitap"
    },
    {
      "en": "Stone",
      "tr": "Taş"
    },
    {
      "en": "Small",
      "tr": "Küçük"
    },
    {
      "en": "Normal",
      "tr": "Normal"
    },
    {
      "en": "Big",
      "tr": "Büyük"
    },
    {
      "en": "Huge",
      "tr": "Devasa"
    },
    {
      "en": "Flame Bite",
      "tr": "Alev Isırığı"
    },
    {
      "en": "Aqua Mend",
      "tr": "Su Onarımı"
    },
    {
      "en": "Heal 15% max HP every 2 turns.",
      "tr": "Her 2 turda maks. canın %15'ini iyileştirir."
    },
    {
      "en": "Stone Ward",
      "tr": "Taş Siperi"
    },
    {
      "en": "Frostbite",
      "tr": "Soğuk Isırığı"
    },
    {
      "en": "Volt Zap",
      "tr": "Volt Çarpması"
    },
    {
      "en": "Vine Leech",
      "tr": "Sarmaşık Sülüğü"
    },
    {
      "en": "Dusk Curse",
      "tr": "Alacakaranlık Laneti"
    },
    {
      "en": "Bloom",
      "tr": "Çiçek Açma"
    },
    {
      "en": "Offer a Heart of Golem to mend a lost heart.",
      "tr": "Kayıp bir kalbi onarmak için bir Golem Kalbi sun."
    },
    {
      "en": "Forge a sword that still smoulders.",
      "tr": "Hâlâ için için yanan bir kılıç döv."
    },
    {
      "en": "Bond the heart of a fire spirit to the blade.",
      "tr": "Bir ateş ruhunun kalbini kılıca bağla."
    },
    {
      "en": "Temper the blade in hoarfrost.",
      "tr": "Kılıcı kırağıda su ver."
    },
    {
      "en": "Weave raw magic into the staff.",
      "tr": "Ham büyüyü asaya doku."
    },
    {
      "en": "Fold shadow itself into the edge.",
      "tr": "Gölgenin kendisini ağza katla."
    },
    {
      "en": "Stone of Blood",
      "tr": "Kan Taşı"
    },
    {
      "en": "Forge a stone that drinks blood - 10% omnivamp.",
      "tr": "Kan içen bir taş döv - %10 omnivamp."
    },
    {
      "en": "Cleaving Arc",
      "tr": "Yaran Kavis"
    },
    {
      "en": "Swordstorm",
      "tr": "Kılıç Fırtınası"
    },
    {
      "en": "Blade Tempest",
      "tr": "Bıçak Kasırgası"
    },
    {
      "en": "Triple Shot",
      "tr": "Üçlü Atış"
    },
    {
      "en": "Piercing Bolt",
      "tr": "Delici Ok"
    },
    {
      "en": "Rain of Arrows",
      "tr": "Ok Yağmuru"
    },
    {
      "en": "Arcane Rift",
      "tr": "Arkane Yarık"
    },
    {
      "en": "Frost Vortex",
      "tr": "Buz Girdabı"
    },
    {
      "en": "Meteor Storm",
      "tr": "Meteor Fırtınası"
    },
    {
      "en": "Fan of Knives",
      "tr": "Bıçak Yelpazesi"
    },
    {
      "en": "Smoke Bomb",
      "tr": "Sis Bombası"
    },
    {
      "en": "Shadow Dance",
      "tr": "Gölge Dansı"
    },
    {
      "en": "Dawn Strike",
      "tr": "Şafak Vuruşu"
    },
    {
      "en": "Judgment",
      "tr": "Hüküm"
    },
    {
      "en": "Throat Cut",
      "tr": "Boğaz Kesme"
    },
    {
      "en": "Blood Mark",
      "tr": "Kan İşareti"
    },
    {
      "en": "Crimson Reaping",
      "tr": "Kızıl Biçme"
    },
    {
      "en": "Holy Bolt",
      "tr": "Kutsal Ok"
    },
    {
      "en": "Sanctuary",
      "tr": "Sığınak"
    },
    {
      "en": "Radiant Chorus",
      "tr": "Işıyan Koro"
    },
    {
      "en": "Shield Bash",
      "tr": "Kalkan Vuruşu"
    },
    {
      "en": "Iron Bulwark",
      "tr": "Demir Siper"
    },
    {
      "en": "Shockwave",
      "tr": "Şok Dalgası"
    },
    {
      "en": "Beast Fang",
      "tr": "Hayvan Dişi"
    },
    {
      "en": "Spirit Howl",
      "tr": "Ruh Uluması"
    },
    {
      "en": "Stampede",
      "tr": "Sürü Hücumu"
    },
    {
      "en": "Entangling Roots",
      "tr": "Dolanan Kökler"
    },
    {
      "en": "Debug Beam",
      "tr": "Hata Ayıklama Işını"
    },
    {
      "en": "Null Field",
      "tr": "Sıfır Alanı"
    },
    {
      "en": "Overclock",
      "tr": "Aşırı Hız"
    },
    {
      "en": "Test Strike",
      "tr": "Test Vuruşu"
    },
    {
      "en": "Bug Sweep",
      "tr": "Hata Süpürme"
    },
    {
      "en": "Crash",
      "tr": "Çökme"
    },
    {
      "en": "Savage Bite",
      "tr": "Vahşi Isırık"
    },
    {
      "en": "Pack Call",
      "tr": "Sürü Çağrısı"
    },
    {
      "en": "Primal Stampede",
      "tr": "İlksel Hücum"
    },
    {
      "en": "Spirit Bolt",
      "tr": "Ruh Oku"
    },
    {
      "en": "Anima Shield",
      "tr": "Anima Kalkanı"
    },
    {
      "en": "Wild Hunt",
      "tr": "Vahşi Av"
    },
    {
      "en": "Thorn Lance",
      "tr": "Diken Mızrağı"
    },
    {
      "en": "Grasping Roots",
      "tr": "Kavrayan Kökler"
    },
    {
      "en": "Overgrowth",
      "tr": "Aşırı Büyüme"
    },
    {
      "en": "Life Bolt",
      "tr": "Yaşam Oku"
    },
    {
      "en": "Renewal",
      "tr": "Yenilenme"
    },
    {
      "en": "Admin Beam",
      "tr": "Yönetici Işını"
    },
    {
      "en": "Ban Field",
      "tr": "Ban Alanı"
    },
    {
      "en": "Server Crash",
      "tr": "Sunucu Çökmesi"
    },
    {
      "en": "Warlord Cleave",
      "tr": "Savaş Lordu Yarması"
    },
    {
      "en": "Executioner",
      "tr": "Cellat"
    },
    {
      "en": "Bramble Shot",
      "tr": "Çalı Atışı"
    },
    {
      "en": "Verdant Snare",
      "tr": "Yeşil Tuzak"
    },
    {
      "en": "Wildstorm",
      "tr": "Vahşi Fırtına"
    },
    {
      "en": "Arcane Lance",
      "tr": "Arkane Mızrağı"
    },
    {
      "en": "Glacial Prison",
      "tr": "Buzul Hapishanesi"
    },
    {
      "en": "Umbral Slash",
      "tr": "Gölge Kesme"
    },
    {
      "en": "Nightfall",
      "tr": "Gece Çöküşü"
    },
    {
      "en": "Crusader's Blow",
      "tr": "Haçlı'nın Darbesi"
    },
    {
      "en": "Divine Aegis",
      "tr": "İlahi Aegis"
    },
    {
      "en": "Hammerfall",
      "tr": "Çekiç Düşüşü"
    },
    {
      "en": "Death Grip",
      "tr": "Ölüm Pençesi"
    },
    {
      "en": "Scythe Storm",
      "tr": "Tırpan Fırtınası"
    },
    {
      "en": "Blessing",
      "tr": "Lütuf"
    },
    {
      "en": "Divine Judgment",
      "tr": "İlahi Hüküm"
    },
    {
      "en": "Crushing Blow",
      "tr": "Ezici Darbe"
    },
    {
      "en": "Fortress",
      "tr": "Kale"
    },
    {
      "en": "Earthquake",
      "tr": "Deprem"
    },
    {
      "en": "Emperor's Edge",
      "tr": "İmparatorun Ağzı"
    },
    {
      "en": "Crown of Flame",
      "tr": "Alev Tacı"
    },
    {
      "en": "Worldbreaker",
      "tr": "Dünya Kırıcı"
    },
    {
      "en": "Storm Arrow",
      "tr": "Fırtına Oku"
    },
    {
      "en": "Thunder Cage",
      "tr": "Gök Gürültüsü Kafesi"
    },
    {
      "en": "Tempest",
      "tr": "Kasırga"
    },
    {
      "en": "Arcane Spear",
      "tr": "Arkane Kargı"
    },
    {
      "en": "Chrono Field",
      "tr": "Krono Alanı"
    },
    {
      "en": "Singularity",
      "tr": "Tekillik"
    },
    {
      "en": "King's Edict",
      "tr": "Kralın Fermanı"
    },
    {
      "en": "Umbra Gate",
      "tr": "Gölge Kapısı"
    },
    {
      "en": "Reign of Shadows",
      "tr": "Gölgelerin Hükümdarlığı"
    },
    {
      "en": "Radiant Strike",
      "tr": "Işıyan Vuruş"
    },
    {
      "en": "Aegis of Light",
      "tr": "Işık Aegisi"
    },
    {
      "en": "Solar Flare",
      "tr": "Güneş Patlaması"
    },
    {
      "en": "Reaper's Toll",
      "tr": "Azrail'in Bedeli"
    },
    {
      "en": "Grave Chains",
      "tr": "Mezar Zincirleri"
    },
    {
      "en": "Army of the Dead",
      "tr": "Ölüler Ordusu"
    },
    {
      "en": "Blood Claw",
      "tr": "Kan Pençesi"
    },
    {
      "en": "Crimson Rush",
      "tr": "Kızıl Hücum"
    },
    {
      "en": "Blood Tide",
      "tr": "Kan Gelgiti"
    },
    {
      "en": "Sanguine Slash",
      "tr": "Kanlı Kesme"
    },
    {
      "en": "Blood Pact",
      "tr": "Kan Anlaşması"
    },
    {
      "en": "Crimson Cataclysm",
      "tr": "Kızıl Felaket"
    },
    {
      "en": "Shadow Well",
      "tr": "Gölge Kuyusu"
    },
    {
      "en": "Eclipse",
      "tr": "Tutulma"
    },
    {
      "en": "Blood Reign",
      "tr": "Kan Hükümdarlığı"
    },
    {
      "en": "Veil of Blood",
      "tr": "Kan Peçesi"
    },
    {
      "en": "Holy Lance",
      "tr": "Kutsal Mızrak"
    },
    {
      "en": "Sacred Aegis",
      "tr": "Kutsal Aegis"
    },
    {
      "en": "Titanic Fist",
      "tr": "Titan Yumruğu"
    },
    {
      "en": "Colossal Guard",
      "tr": "Devasa Koruma"
    },
    {
      "en": "World Quake",
      "tr": "Dünya Sarsıntısı"
    },
    {
      "en": "A holy ward turns aside a heavy blow.",
      "tr": "Kutsal bir siper ağır bir darbeyi savuşturur."
    },
    {
      "en": "Steady yourself against damage.",
      "tr": "Hasar karşısında kendini sağlamlaştır."
    },
    {
      "en": "Raise morale; allies strike true.",
      "tr": "Moral yükselt; dostlar isabetle vurur."
    },
    {
      "en": "Wraiths of shadow guard you and sap the foe.",
      "tr": "Gölge hayaletleri seni korur ve düşmanı zayıflatır."
    },
    {
      "en": "A mighty ward shields body and spirit.",
      "tr": "Kudretli bir siper bedeni ve ruhu korur."
    },
    {
      "en": "A resilient bulwark of pure will.",
      "tr": "Saf iradeden esnek bir siper."
    },
    {
      "en": "Your hide hardens into living stone.",
      "tr": "Derin yaşayan taşa dönüşür."
    },
    {
      "en": "Become an unyielding wall of iron.",
      "tr": "Boyun eğmeyen bir demir duvara dönüş."
    },
    {
      "en": "Guard the whole party with armored grace.",
      "tr": "Tüm grubu zırhlı bir zarafetle koru."
    },
    {
      "en": "A radiant barrier blessed against harm.",
      "tr": "Zarara karşı kutsanmış ışıyan bir bariyer."
    },
    {
      "en": "Renew vitality, round after round.",
      "tr": "Tur be tur canlılığı yenile."
    },
    {
      "en": "Mend wounds with pure channeled magic.",
      "tr": "Yaraları saf yönlendirilmiş büyüyle onar."
    },
    {
      "en": "Soak the foe - wet makes lightning and frost bite harder.",
      "tr": "Düşmanı ıslat - ıslak, yıldırım ve buzu daha sert ısırtır."
    },
    {
      "en": "Overcharge: +50% vs wet.",
      "tr": "Aşırı Yükleme: ıslağa karşı +%50."
    },
    {
      "en": "Mighty lightning; still +50% vs wet.",
      "tr": "Kudretli yıldırım; yine de ıslağa karşı +%50."
    },
    {
      "en": "Electrify the foe while wet.",
      "tr": "Düşmanı ıslakken elektriklendir."
    },
    {
      "en": "A chill that lingers.",
      "tr": "Süregelen bir soğuk."
    },
    {
      "en": "Freeze the foe solid.",
      "tr": "Düşmanı tamamen dondur."
    },
    {
      "en": "A burst of frost; freezes, then Shatter for +60%.",
      "tr": "Bir buz patlaması; dondurur, sonra +%60 için Kırılma."
    },
    {
      "en": "Shatter the ice for huge frost damage.",
      "tr": "Büyük buz hasarı için buzu kır."
    },
    {
      "en": "Set the foe alight.",
      "tr": "Düşmanı tutuştur."
    },
    {
      "en": "Whirling cinders that keep burning.",
      "tr": "Yanmaya devam eden dönen korlar."
    },
    {
      "en": "Burning Blaze: +60% vs poisoned foes.",
      "tr": "Yanan Alev: zehirli düşmanlara karşı +%60."
    },
    {
      "en": "Heavy poison for 6% max HP / round.",
      "tr": "Tur başına maks. canın %6'sı kadar ağır zehir."
    },
    {
      "en": "Poisoned targets take +50%.",
      "tr": "Zehirli hedefler +%50 alır."
    },
    {
      "en": "Weaken and expose the foe in one blow.",
      "tr": "Düşmanı tek darbede zayıflat ve ifşa et."
    },
    {
      "en": "Shatter guard: expose + weaken.",
      "tr": "Siper kır: ifşa + zayıflatma."
    },
    {
      "en": "Break Guard: +80% vs exposed.",
      "tr": "Siper Kırma: ifşa olmuşlara karşı +%80."
    },
    {
      "en": "Overwhelm: +35% vs weakened.",
      "tr": "Ezme: zayıflamışlara karşı +%35."
    },
    {
      "en": "Whipping vines for 1.4× magic - first link of the nature chain.",
      "tr": "1.4× büyü için kamçılayan sarmaşıklar - doğa zincirinin ilk halkası."
    },
    {
      "en": "Thorny barrage for 1.9× magic that bleeds. Requires Vine Lash.",
      "tr": "1.9× büyü için kanatan dikenli yaylım. Sarmaşık Kamçısı gerektirir."
    },
    {
      "en": "Bloom restores 30% of your max HP.",
      "tr": "Çiçek Açma maks. canının %30'unu geri yükler."
    },
    {
      "en": "Warrior Path",
      "tr": "Savaşçı Yolu"
    },
    {
      "en": "Archer Path",
      "tr": "Okçu Yolu"
    },
    {
      "en": "Mage Path",
      "tr": "Büyücü Yolu"
    },
    {
      "en": "Rogue Path",
      "tr": "Haydut Yolu"
    },
    {
      "en": "Paladin Path",
      "tr": "Paladin Yolu"
    },
    {
      "en": "Assassin Path",
      "tr": "Suikastçı Yolu"
    },
    {
      "en": "Healer Path",
      "tr": "Şifacı Yolu"
    },
    {
      "en": "Tank Path",
      "tr": "Tank Yolu"
    },
    {
      "en": "Tamer Path",
      "tr": "Terbiyeci Yolu"
    },
    {
      "en": "Gardener Path",
      "tr": "Bahçıvan Yolu"
    },
    {
      "en": "Ashen Ember",
      "tr": "Kül Kor"
    },
    {
      "en": "Forest Leaf",
      "tr": "Orman Yaprağı"
    },
    {
      "en": "Spring Water",
      "tr": "Pınar Suyu"
    },
    {
      "en": "Cobble Dust",
      "tr": "Arnavut Kaldırımı Tozu"
    },
    {
      "en": "Candlelight",
      "tr": "Mum Işığı"
    },
    {
      "en": "Bog Moss",
      "tr": "Bataklık Yosunu"
    },
    {
      "en": "Iron Grey",
      "tr": "Demir Grisi"
    },
    {
      "en": "Pale Blue",
      "tr": "Soluk Mavi"
    },
    {
      "en": "Harvest Amber",
      "tr": "Hasat Kehribarı"
    },
    {
      "en": "Rust Red",
      "tr": "Pas Kırmızısı"
    },
    {
      "en": "Pale Rose",
      "tr": "Soluk Gül"
    },
    {
      "en": "Seafoam",
      "tr": "Deniz Köpüğü"
    },
    {
      "en": "Toadstone",
      "tr": "Kurbağa Taşı"
    },
    {
      "en": "Chalk White",
      "tr": "Tebeşir Beyazı"
    },
    {
      "en": "Sunlit Gold",
      "tr": "Güneş Işığı Altını"
    },
    {
      "en": "Blood Red",
      "tr": "Kan Kırmızısı"
    },
    {
      "en": "Violet Mist",
      "tr": "Menekşe Sisi"
    },
    {
      "en": "Storm Spark",
      "tr": "Fırtına Kıvılcımı"
    },
    {
      "en": "Moon Silver",
      "tr": "Ay Gümüşü"
    },
    {
      "en": "Thorn Green",
      "tr": "Diken Yeşili"
    },
    {
      "en": "Marsh Teal",
      "tr": "Bataklık Turkuazı"
    },
    {
      "en": "Cinder Orange",
      "tr": "Kor Turuncusu"
    },
    {
      "en": "Pale Amethyst",
      "tr": "Soluk Ametist"
    },
    {
      "en": "Poison Lime",
      "tr": "Zehir Misketi"
    },
    {
      "en": "Crystal Blue",
      "tr": "Kristal Mavisi"
    },
    {
      "en": "Sandstorm",
      "tr": "Kum Fırtınası"
    },
    {
      "en": "Rune Cyan",
      "tr": "Rün Turkuazı"
    },
    {
      "en": "Obsidian",
      "tr": "Obsidyen"
    },
    {
      "en": "Royal Purple",
      "tr": "Kraliyet Moru"
    },
    {
      "en": "Bloodmoon Rose",
      "tr": "Kan Ayı Gülü"
    },
    {
      "en": "Sunfire",
      "tr": "Güneş Ateşi"
    },
    {
      "en": "Glitch Green",
      "tr": "Glitch Yeşili"
    },
    {
      "en": "Spectre Teal",
      "tr": "Hayalet Turkuazı"
    },
    {
      "en": "Emberstorm",
      "tr": "Kor Fırtınası"
    },
    {
      "en": "Frostbloom",
      "tr": "Buz Çiçeği"
    },
    {
      "en": "Starfall",
      "tr": "Yıldız Düşüşü"
    },
    {
      "en": "Pitch Black",
      "tr": "Zifiri Siyah"
    },
    {
      "en": "Galaxy",
      "tr": "Galaksi"
    },
    {
      "en": "Aurora",
      "tr": "Aurora"
    },
    {
      "en": "Bat Swarm",
      "tr": "Yarasa Sürüsü"
    },
    {
      "en": "Void Heart",
      "tr": "Boşluk Kalbi"
    },
    {
      "en": "Fire Wolf",
      "tr": "Ateş Kurdu"
    },
    {
      "en": "A loyal ember pup. +5 Attack.",
      "tr": "Sadık bir kor yavrusu. +5 Saldırı."
    },
    {
      "en": "Water Sprite",
      "tr": "Su Perisi"
    },
    {
      "en": "A bubbling companion. +6 Magic Power.",
      "tr": "Fokurdayan bir yoldaş. +6 Büyü Gücü."
    },
    {
      "en": "Direwolf",
      "tr": "Dev Kurt"
    },
    {
      "en": "Ember Pup",
      "tr": "Kor Yavrusu"
    },
    {
      "en": "Cinder Cub",
      "tr": "Kül Yavrusu"
    },
    {
      "en": "Sprout",
      "tr": "Filiz"
    },
    {
      "en": "Flame Sprite",
      "tr": "Alev Perisi"
    },
    {
      "en": "Mossling",
      "tr": "Yosuncuk"
    },
    {
      "en": "Vine Pup",
      "tr": "Sarmaşık Yavrusu"
    },
    {
      "en": "Thorn Whelp",
      "tr": "Diken Yavrusu"
    },
    {
      "en": "Slime King",
      "tr": "Balçık Kralı"
    },
    {
      "en": "Forest Cub",
      "tr": "Orman Yavrusu"
    },
    {
      "en": "Natureling",
      "tr": "Doğacık"
    },
    {
      "en": "A budding nature spirit from the Green Egg.",
      "tr": "Yeşil Yumurta'dan çıkan tomurcuklanan bir doğa ruhu."
    },
    {
      "en": "Frost Pup",
      "tr": "Buz Yavrusu"
    },
    {
      "en": "Ice Whelp",
      "tr": "Buz Çırağı"
    },
    {
      "en": "Snow Cub",
      "tr": "Kar Yavrusu"
    },
    {
      "en": "Glacierling",
      "tr": "Buzulcuk"
    },
    {
      "en": "Chill Sprite",
      "tr": "Soğuk Perisi"
    },
    {
      "en": "Frost Drake",
      "tr": "Buz Ejderi"
    },
    {
      "en": "Stone Pup",
      "tr": "Taş Yavrusu"
    },
    {
      "en": "Rockling",
      "tr": "Kayacık"
    },
    {
      "en": "Boulder Cub",
      "tr": "Kaya Yavrusu"
    },
    {
      "en": "Crystal Sprite",
      "tr": "Kristal Perisi"
    },
    {
      "en": "Golem Whelp",
      "tr": "Golem Yavrusu"
    },
    {
      "en": "Granite Pup",
      "tr": "Granit Yavrusu"
    },
    {
      "en": "Storm Pup",
      "tr": "Fırtına Yavrusu"
    },
    {
      "en": "Thunder Cub",
      "tr": "Gök Gürültüsü Yavrusu"
    },
    {
      "en": "Lightning Drake",
      "tr": "Yıldırım Ejderi"
    },
    {
      "en": "Wind Sprite",
      "tr": "Rüzgâr Perisi"
    },
    {
      "en": "Gale Whelp",
      "tr": "Bora Yavrusu"
    },
    {
      "en": "Storm Hatchling",
      "tr": "Fırtına Civcivi"
    },
    {
      "en": "Shadow Pup",
      "tr": "Gölge Yavrusu"
    },
    {
      "en": "Voidling",
      "tr": "Boşlukçuk"
    },
    {
      "en": "Dusk Whelp",
      "tr": "Alacakaranlık Yavrusu"
    },
    {
      "en": "Night Cub",
      "tr": "Gece Yavrusu"
    },
    {
      "en": "Shade Sprite",
      "tr": "Gölge Perisi"
    },
    {
      "en": "Umbra Drake",
      "tr": "Gölge Ejderi"
    },
    {
      "en": "Crystal Drake",
      "tr": "Kristal Ejderi"
    },
    {
      "en": "Arcane Pup",
      "tr": "Arkane Yavrusu"
    },
    {
      "en": "Mana Sprite",
      "tr": "Mana Perisi"
    },
    {
      "en": "Spell Whelp",
      "tr": "Büyü Yavrusu"
    },
    {
      "en": "Runeling",
      "tr": "Rüncük"
    },
    {
      "en": "Crystal Hound",
      "tr": "Kristal Tazısı"
    },
    {
      "en": "Void Pup",
      "tr": "Boşluk Yavrusu"
    },
    {
      "en": "Abyssling",
      "tr": "Uçurumcuk"
    },
    {
      "en": "Nether Cub",
      "tr": "Cehennem Yavrusu"
    },
    {
      "en": "Shadow Drake",
      "tr": "Gölge Ejderi"
    },
    {
      "en": "Dark Hound",
      "tr": "Karanlık Tazı"
    },
    {
      "en": "Void Sprite",
      "tr": "Boşluk Perisi"
    },
    {
      "en": "Phoenix Hatchling",
      "tr": "Anka Civcivi"
    },
    {
      "en": "Ember Drake",
      "tr": "Kor Ejderi"
    },
    {
      "en": "Flame Hound",
      "tr": "Alev Tazısı"
    },
    {
      "en": "Inferno Pup",
      "tr": "Yanardağ Yavrusu"
    },
    {
      "en": "Blaze Drake",
      "tr": "Alev Ejderi"
    },
    {
      "en": "Phoenix Chick",
      "tr": "Anka Piliç"
    },
    {
      "en": "Mythic Drake",
      "tr": "Mitik Ejder"
    },
    {
      "en": "Gold Pup",
      "tr": "Altın Yavrusu"
    },
    {
      "en": "Radiant Cub",
      "tr": "Işıyan Yavru"
    },
    {
      "en": "Divine Whelp",
      "tr": "İlahi Yavru"
    },
    {
      "en": "Light Sprite",
      "tr": "Işık Perisi"
    },
    {
      "en": "Mythic Hound",
      "tr": "Mitik Tazı"
    },
    {
      "en": "Rage Pup",
      "tr": "Öfke Yavrusu"
    },
    {
      "en": "Fury Cub",
      "tr": "Hiddet Yavrusu"
    },
    {
      "en": "Berserk Whelp",
      "tr": "Cinnet Yavrusu"
    },
    {
      "en": "War Hound",
      "tr": "Savaş Tazısı"
    },
    {
      "en": "Battle Pup",
      "tr": "Savaş Yavrusu"
    },
    {
      "en": "Might Cub",
      "tr": "Kudret Yavrusu"
    },
    {
      "en": "Mystic Cub",
      "tr": "Mistik Yavrusu"
    },
    {
      "en": "Rune Pup",
      "tr": "Rün Yavrusu"
    },
    {
      "en": "Gale Sprite",
      "tr": "Bora Perisi"
    },
    {
      "en": "Stone Guardian",
      "tr": "Taş Muhafız"
    },
    {
      "en": "Iron Pup",
      "tr": "Demir Yavrusu"
    },
    {
      "en": "Granite Whelp",
      "tr": "Granit Yavrusu"
    },
    {
      "en": "Crystal Pup",
      "tr": "Kristal Yavrusu"
    },
    {
      "en": "Rock Sprite",
      "tr": "Kaya Perisi"
    },
    {
      "en": "Frost Lynx",
      "tr": "Buz Vaşağı"
    },
    {
      "en": "Glacier Pup",
      "tr": "Buzul Yavrusu"
    },
    {
      "en": "Snow Hound",
      "tr": "Kar Tazısı"
    },
    {
      "en": "Ice Cub",
      "tr": "Buz Yavrusu"
    },
    {
      "en": "Chill Whelp",
      "tr": "Soğuk Yavrusu"
    },
    {
      "en": "Frost Kit",
      "tr": "Buz Tilkisi Yavrusu"
    },
    {
      "en": "Ember Lynx",
      "tr": "Kor Vaşağı"
    },
    {
      "en": "Cinder Pup",
      "tr": "Kül Yavrusu"
    },
    {
      "en": "Blaze Cub",
      "tr": "Alev Yavrusu"
    },
    {
      "en": "Inferno Whelp",
      "tr": "Yanardağ Yavrusu"
    },
    {
      "en": "Fire Sprite",
      "tr": "Ateş Perisi"
    },
    {
      "en": "Storm Hawk",
      "tr": "Fırtına Şahini"
    },
    {
      "en": "Thunder Pup",
      "tr": "Gök Gürültüsü Yavrusu"
    },
    {
      "en": "Gale Cub",
      "tr": "Bora Yavrusu"
    },
    {
      "en": "Lightning Pup",
      "tr": "Yıldırım Yavrusu"
    },
    {
      "en": "Tempest Whelp",
      "tr": "Kasırga Yavrusu"
    },
    {
      "en": "Shadow Cat",
      "tr": "Gölge Kedisi"
    },
    {
      "en": "Rage Pup - grants attack buff. From egg_red",
      "tr": "Öfke Yavrusu - saldırı güçlendirmesi verir. egg_red'den"
    },
    {
      "en": "Fury Cub - grants magicBoost buff. From egg_green",
      "tr": "Hiddet Yavrusu - magicBoost güçlendirmesi verir. egg_green'den"
    },
    {
      "en": "Berserk Whelp - grants defense buff. From egg_blue",
      "tr": "Cinnet Yavrusu - savunma güçlendirmesi verir. egg_blue'den"
    },
    {
      "en": "War Hound - grants attack buff. From egg_brown",
      "tr": "Savaş Tazısı - saldırı güçlendirmesi verir. egg_brown'dan"
    },
    {
      "en": "Battle Pup - grants magicBoost buff. From egg_yellow",
      "tr": "Savaş Yavrusu - magicBoost güçlendirmesi verir. egg_yellow'dan"
    },
    {
      "en": "Might Cub - grants defense buff. From egg_purple",
      "tr": "Kudret Yavrusu - savunma güçlendirmesi verir. egg_purple'dan"
    },
    {
      "en": "Arcane Pup - grants attack buff. From egg_cyan",
      "tr": "Arkane Yavrusu - saldırı güçlendirmesi verir. egg_cyan'dan"
    },
    {
      "en": "Mana Sprite - grants magicBoost buff. From egg_dark",
      "tr": "Mana Perisi - magicBoost güçlendirmesi verir. egg_dark'tan"
    },
    {
      "en": "Spell Whelp - grants defense buff. From egg_orange",
      "tr": "Büyü Yavrusu - savunma güçlendirmesi verir. egg_orange'dan"
    },
    {
      "en": "Mystic Cub - grants attack buff. From egg_gold",
      "tr": "Mistik Yavrusu - saldırı güçlendirmesi verir. egg_gold'dan"
    },
    {
      "en": "Rune Pup - grants magicBoost buff. From egg_red",
      "tr": "Rün Yavrusu - magicBoost güçlendirmesi verir. egg_red'den"
    },
    {
      "en": "Gale Sprite - grants defense buff. From egg_green",
      "tr": "Bora Perisi - savunma güçlendirmesi verir. egg_green'den"
    },
    {
      "en": "Stone Guardian - grants attack buff. From egg_blue",
      "tr": "Taş Muhafız - saldırı güçlendirmesi verir. egg_blue'den"
    },
    {
      "en": "Iron Pup - grants magicBoost buff. From egg_brown",
      "tr": "Demir Yavrusu - magicBoost güçlendirmesi verir. egg_brown'dan"
    },
    {
      "en": "Granite Whelp - grants defense buff. From egg_yellow",
      "tr": "Granit Yavrusu - savunma güçlendirmesi verir. egg_yellow'dan"
    },
    {
      "en": "Crystal Pup - grants attack buff. From egg_purple",
      "tr": "Kristal Yavrusu - saldırı güçlendirmesi verir. egg_purple'dan"
    },
    {
      "en": "Boulder Cub - grants magicBoost buff. From egg_cyan",
      "tr": "Kaya Yavrusu - magicBoost güçlendirmesi verir. egg_cyan'dan"
    },
    {
      "en": "Rock Sprite - grants defense buff. From egg_dark",
      "tr": "Kaya Perisi - savunma güçlendirmesi verir. egg_dark'tan"
    },
    {
      "en": "Frost Lynx - grants attack buff. From egg_orange",
      "tr": "Buz Vaşağı - saldırı güçlendirmesi verir. egg_orange'dan"
    },
    {
      "en": "Glacier Pup - grants magicBoost buff. From egg_gold",
      "tr": "Buzul Yavrusu - magicBoost güçlendirmesi verir. egg_gold'dan"
    },
    {
      "en": "Snow Hound - grants defense buff. From egg_red",
      "tr": "Kar Tazısı - savunma güçlendirmesi verir. egg_red'den"
    },
    {
      "en": "Ice Cub - grants attack buff. From egg_green",
      "tr": "Buz Yavrusu - saldırı güçlendirmesi verir. egg_green'den"
    },
    {
      "en": "Chill Whelp - grants magicBoost buff. From egg_blue",
      "tr": "Soğuk Yavrusu - magicBoost güçlendirmesi verir. egg_blue'den"
    },
    {
      "en": "Frost Kit - grants defense buff. From egg_brown",
      "tr": "Buz Tilkisi Yavrusu - savunma güçlendirmesi verir. egg_brown'dan"
    },
    {
      "en": "Ember Lynx - grants attack buff. From egg_yellow",
      "tr": "Kor Vaşağı - saldırı güçlendirmesi verir. egg_yellow'dan"
    },
    {
      "en": "Flame Hound - grants magicBoost buff. From egg_purple",
      "tr": "Alev Tazısı - magicBoost güçlendirmesi verir. egg_purple'dan"
    },
    {
      "en": "Cinder Pup - grants defense buff. From egg_cyan",
      "tr": "Kül Yavrusu - savunma güçlendirmesi verir. egg_cyan'dan"
    },
    {
      "en": "Blaze Cub - grants attack buff. From egg_dark",
      "tr": "Alev Yavrusu - saldırı güçlendirmesi verir. egg_dark'tan"
    },
    {
      "en": "Inferno Whelp - grants magicBoost buff. From egg_orange",
      "tr": "Yanardağ Yavrusu - magicBoost güçlendirmesi verir. egg_orange'dan"
    },
    {
      "en": "Fire Sprite - grants defense buff. From egg_gold",
      "tr": "Ateş Perisi - savunma güçlendirmesi verir. egg_gold'dan"
    },
    {
      "en": "Storm Hawk - grants attack buff. From egg_red",
      "tr": "Fırtına Şahini - saldırı güçlendirmesi verir. egg_red'den"
    },
    {
      "en": "Thunder Pup - grants magicBoost buff. From egg_green",
      "tr": "Gök Gürültüsü Yavrusu - magicBoost güçlendirmesi verir. egg_green'den"
    },
    {
      "en": "Gale Cub - grants defense buff. From egg_blue",
      "tr": "Bora Yavrusu - savunma güçlendirmesi verir. egg_blue'den"
    },
    {
      "en": "Wind Sprite - grants attack buff. From egg_brown",
      "tr": "Rüzgâr Perisi - saldırı güçlendirmesi verir. egg_brown'dan"
    },
    {
      "en": "Lightning Pup - grants magicBoost buff. From egg_yellow",
      "tr": "Yıldırım Yavrusu - magicBoost güçlendirmesi verir. egg_yellow'dan"
    },
    {
      "en": "Tempest Whelp - grants defense buff. From egg_purple",
      "tr": "Kasırga Yavrusu - savunma güçlendirmesi verir. egg_purple'dan"
    },
    {
      "en": "Shadow Cat - grants attack buff. From egg_cyan",
      "tr": "Gölge Kedisi - saldırı güçlendirmesi verir. egg_cyan'dan"
    },
    {
      "en": "Void Pup - grants magicBoost buff. From egg_dark",
      "tr": "Boşluk Yavrusu - magicBoost güçlendirmesi verir. egg_dark'tan"
    },
    {
      "en": "Whirlwind",
      "tr": "Kasırga"
    },
    {
      "en": "A full spinning cut that carves every foe in front of you.",
      "tr": "Önündeki bütün düşmanları biçen tam turlu bir savuruş."
    },
    {
      "en": "Earthbreaker",
      "tr": "Yerkıran"
    },
    {
      "en": "Slam the ground and send a shockwave through everything nearby.",
      "tr": "Yere vur; çevrendeki her şeyi sarsan bir şok dalgası yay."
    },
    {
      "en": "Blade Storm",
      "tr": "Bıçak Fırtınası"
    },
    {
      "en": "Blades orbit you for three seconds, shredding anything they touch.",
      "tr": "Bıçaklar üç saniye etrafında döner, dokunduklarını parçalar."
    },
    {
      "en": "Titan Fist",
      "tr": "Titan Yumruğu"
    },
    {
      "en": "A colossal stone fist crashes down ahead of you.",
      "tr": "Önüne devasa bir taş yumruk iner."
    },
    {
      "en": "Gale",
      "tr": "Rüzgâr"
    },
    {
      "en": "A short burst of wind that pulls and cuts.",
      "tr": "Çeken ve kesen kısa bir rüzgâr patlaması."
    },
    {
      "en": "Cyclone",
      "tr": "Siklon"
    },
    {
      "en": "A spinning vortex drags enemies inward and shreds them.",
      "tr": "Dönen bir girdap düşmanları içeri çeker ve parçalar."
    },
    {
      "en": "Stars rain from the sky across a wide area.",
      "tr": "Gökten geniş bir alana yıldızlar yağar."
    },
    {
      "en": "Spirit Pack",
      "tr": "Ruh Sürüsü"
    },
    {
      "en": "Ghostly wolves circle the target and lunge as one.",
      "tr": "Hayalet kurtlar hedefin etrafında döner ve birlikte atılır."
    },
    {
      "en": "Toxic Cloud",
      "tr": "Zehir Bulutu"
    },
    {
      "en": "A lingering cloud of poison that eats away at anything inside.",
      "tr": "İçindeki her şeyi kemiren, kalıcı bir zehir bulutu."
    },
    {
      "en": "A ring of ice bursts outward and freezes what it touches.",
      "tr": "Dışa doğru buz halkası patlar, dokunduğunu dondurur."
    },
    {
      "en": "Inferno Burst",
      "tr": "Cehennem Patlaması"
    },
    {
      "en": "A ring of fire detonates around you and keeps burning.",
      "tr": "Etrafında bir ateş halkası patlar ve yanmaya devam eder."
    },
    {
      "en": "Call down meteors on the marked ground, leaving burning craters.",
      "tr": "İşaretli yere meteorlar indir; yanan kraterler bırak."
    },
    {
      "en": "Glacier Wall",
      "tr": "Buzul Duvarı"
    },
    {
      "en": "Raise a wall of ice ahead that slows and cuts anything crossing it.",
      "tr": "Önüne geçenleri yavaşlatan ve kesen bir buz duvarı dik."
    },
    {
      "en": "Chain Lightning",
      "tr": "Zincir Yıldırım"
    },
    {
      "en": "Lightning leaps between foes, shocking each one it touches.",
      "tr": "Yıldırım düşmandan düşmana sıçrar, her birini çarpar."
    },
    {
      "en": "Ember Wave",
      "tr": "Kor Dalgası"
    },
    {
      "en": "A wave of cinders washes over the arc ahead.",
      "tr": "Önündeki yayın üzerinden kor dalgası geçer."
    },
    {
      "en": "Umbral Lash",
      "tr": "Gölge Kamçısı"
    },
    {
      "en": "A whip of shadow cuts across the foes in front of you.",
      "tr": "Önündeki düşmanları kesen bir gölge kamçısı."
    },
    {
      "en": "Shadow Grasp",
      "tr": "Gölge Kavrayışı"
    },
    {
      "en": "Shadow tendrils burst from the ground and claw at everything.",
      "tr": "Yerden gölge kolları fışkırır ve her şeyi tırmalar."
    },
    {
      "en": "Judgement Beam",
      "tr": "Hüküm Işını"
    },
    {
      "en": "A lance of holy light burns a straight line through the enemy.",
      "tr": "Kutsal ışıktan bir mızrak düşmanın içinden düz bir çizgi yakar."
    },
    {
      "en": "Rune Seal",
      "tr": "Rün Mührü"
    },
    {
      "en": "Etch a warding rune that absorbs a share of incoming damage.",
      "tr": "Gelen hasarın bir kısmını yutan koruyucu bir rün kaz."
    },
    {
      "en": "Divine Judgement",
      "tr": "İlahi Hüküm"
    },
    {
      "en": "Six blades of light fall around you and stun the wicked.",
      "tr": "Etrafına altı ışık kılıcı iner ve günahkârları sersemletir."
    },
    {
      "en": "Radiant Verdict",
      "tr": "Işıklı Hüküm"
    },
    {
      "en": "A wide beam of judgement that sears everything in its path.",
      "tr": "Yolundaki her şeyi dağlayan geniş bir hüküm ışını."
    },
    {
      "en": "Healing Rain",
      "tr": "Şifa Yağmuru"
    },
    {
      "en": "Warm rain falls and knits your wounds shut.",
      "tr": "Ilık bir yağmur yağar ve yaralarını kapatır."
    },
    {
      "en": "Dimension Rift",
      "tr": "Boyut Yarığı"
    },
    {
      "en": "Tear space and step through it, shredding everything you leave behind.",
      "tr": "Uzayı yırt ve içinden geç; geride bıraktığın her şeyi parçala."
    },
    {
      "en": "Venom Spit",
      "tr": "Zehir Tükürüğü"
    },
    {
      "en": "Spit a blob of venom that bursts on impact.",
      "tr": "Çarpınca patlayan bir zehir topağı tükür."
    },
    {
      "en": "Mending Light",
      "tr": "Onaran Işık"
    },
    {
      "en": "A soft light mends a small amount of health.",
      "tr": "Yumuşak bir ışık az miktarda can onarır."
    },
    {
      "en": "Tree of Life",
      "tr": "Hayat Ağacı"
    },
    {
      "en": "A great tree blooms and pours healing light over the ground.",
      "tr": "Ulu bir ağaç açar ve yere şifa ışığı döker."
    },
    {
      "en": "Phoenix Rebirth",
      "tr": "Anka Doğuşu"
    },
    {
      "en": "A phoenix rises from you, restoring a great amount of health.",
      "tr": "İçinden bir anka yükselir, büyük miktarda can geri verir."
    },
    {
      "en": "Thorn Snare",
      "tr": "Diken Tuzağı"
    },
    {
      "en": "Thorned vines erupt and root everything in the area.",
      "tr": "Dikenli sarmaşıklar fışkırır ve alandaki her şeyi kökler."
    },
    {
      "en": "Bone Cage",
      "tr": "Kemik Kafes"
    },
    {
      "en": "Bones erupt around the target and lock it in place while they cut.",
      "tr": "Hedefin çevresinde kemikler yükselir, onu yerinde kilitler."
    },
    {
      "en": "Bramble",
      "tr": "Çalı Dikeni"
    },
    {
      "en": "A lash of thorned vines sweeps the arc ahead.",
      "tr": "Önündeki yayı süpüren dikenli sarmaşık kamçısı."
    },
    {
      "en": "Rune Circle",
      "tr": "Rün Çemberi"
    },
    {
      "en": "A rune circle flares under you, shocking everything standing on it.",
      "tr": "Altında bir rün çemberi parlar, üstündeki her şeyi çarpar."
    },
    {
      "en": "Open a collapsing void that drags enemies into its core.",
      "tr": "Düşmanları çekirdeğine çeken, çöken bir boşluk aç."
    },
    {
      "en": "Soul Harvest",
      "tr": "Ruh Hasadı"
    },
    {
      "en": "Rip the souls from nearby foes and drink back a share as life.",
      "tr": "Yakındaki düşmanların ruhunu söküp bir kısmını can olarak içine çek."
    },
    {
      "en": "Flame Pillar",
      "tr": "Alev Sütunu"
    },
    {
      "en": "A pillar of flame erupts where you point and lingers.",
      "tr": "İşaret ettiğin yerde alev sütunu yükselir ve sürer."
    },
    {
      "en": "Dragon Breath",
      "tr": "Ejder Nefesi"
    },
    {
      "en": "Exhale a cone of dragonfire that sets the ground alight.",
      "tr": "Yeri tutuşturan bir ejder ateşi konisi püskürt."
    },
    {
      "en": "Blizzard",
      "tr": "Kar Fırtınası"
    },
    {
      "en": "A long-lasting snowstorm grinds away at a wide area.",
      "tr": "Geniş bir alanı kemiren, uzun süreli bir kar fırtınası."
    },
    {
      "en": "Crimson Reap",
      "tr": "Kızıl Biçim"
    },
    {
      "en": "A wide scythe of blood rips through the crowd.",
      "tr": "Kan orak kalabalığın içinden geçer."
    },
    {
      "en": "Blood Cut",
      "tr": "Kan Kesisi"
    },
    {
      "en": "A quick crimson slash that leaves the wound bleeding.",
      "tr": "Yarayı kanatır biçimde hızlı, kızıl bir kesik."
    },
    {
      "en": "Thunderfall",
      "tr": "Gök Gürültüsü"
    },
    {
      "en": "A thunderbolt slams down and stuns the target area.",
      "tr": "Bir yıldırım iner ve hedef alanı sersemletir."
    },
    {
      "en": "Storm Call",
      "tr": "Fırtına Çağrısı"
    },
    {
      "en": "Call a quick bolt to a nearby point.",
      "tr": "Yakın bir noktaya hızlı bir yıldırım çağır."
    },
    {
      "en": "Blood Ritual",
      "tr": "Kan Ritüeli"
    },
    {
      "en": "A crimson ritual circle erupts, tearing foes and feeding you.",
      "tr": "Kızıl bir ritüel çemberi patlar; düşmanı yırtar, sana can verir."
    },
    {
      "en": "Judgement",
      "tr": "Hüküm"
    },
    {
      "en": "Call a single colossal blade of judgement on the marked spot.",
      "tr": "İşaretli noktaya tek, devasa bir hüküm kılıcı çağır."
    },
    {
      "en": "Doom Gavel",
      "tr": "Kıyamet Tokmağı"
    },
    {
      "en": "A colossal gavel of stone falls from the sky and shatters the ground.",
      "tr": "Gökten devasa bir taş tokmak düşer ve yeri parçalar."
    },
    {
      "en": "One strike cracks the world; everything around you is thrown back.",
      "tr": "Tek vuruş dünyayı çatlatır; çevrendeki her şey geri savrulur."
    },
    {
      "en": "Astral Collapse",
      "tr": "Astral Çöküş"
    },
    {
      "en": "Five collapsing stars hammer the battlefield in quick succession.",
      "tr": "Beş çöken yıldız art arda savaş alanını döver."
    },
    {
      "en": "Arcane Dominion",
      "tr": "Arkana Egemenliği"
    },
    {
      "en": "You claim the sky: seven stars answer your call at once.",
      "tr": "Gökyüzünü sahiplenirsin: yedi yıldız aynı anda çağrına uyar."
    },
    {
      "en": "Sunfall",
      "tr": "Güneş Düşüşü"
    },
    {
      "en": "Three burning suns crash down and leave the earth ablaze.",
      "tr": "Üç yanan güneş yere çakılır ve toprağı tutuşturur."
    },
    {
      "en": "Infernal Crown",
      "tr": "Cehennem Tacı"
    },
    {
      "en": "A crown of hellfire erupts around you and keeps the ground burning.",
      "tr": "Etrafında cehennem ateşinden bir taç patlar ve yeri yakmaya devam eder."
    },
    {
      "en": "Seraph's Judgement",
      "tr": "Seraf Hükmü"
    },
    {
      "en": "A seraph's spear of light burns a wide path through everything.",
      "tr": "Bir serafın ışık mızrağı her şeyin içinden geniş bir yol yakar."
    },
    {
      "en": "Eternal Dawn",
      "tr": "Ebedi Şafak"
    },
    {
      "en": "Dawn breaks all at once: foes are stunned, allies are restored.",
      "tr": "Şafak bir anda söker: düşmanlar sersemler, müttefikler iyileşir."
    },
    {
      "en": "Primordial Grove",
      "tr": "İlkel Koru"
    },
    {
      "en": "An ancient grove blooms around you, pouring life into every wound.",
      "tr": "Etrafında kadim bir koru açar, her yaraya can döker."
    },
    {
      "en": "Verdant Wrath",
      "tr": "Yeşil Gazap"
    },
    {
      "en": "The wilds rise up: thorns, roots and rot devour the marked land.",
      "tr": "Yaban ayaklanır: dikenler, kökler ve çürük işaretli toprağı yutar."
    },
    {
      "en": "Night collapses into a hungry void that drags enemies to its core.",
      "tr": "Gece, düşmanları çekirdeğine çeken aç bir boşluğa çöker."
    },
    {
      "en": "A void crown detonates around you, tearing foes and feeding you their essence.",
      "tr": "Etrafında bir boşluk tacı patlar; düşmanı yırtar, özlerini sana verir."
    },
    {
      "en": "Sky Rend",
      "tr": "Gökyüzü Yarığı"
    },
    {
      "en": "The sky tears open and a single bolt levels the marked ground.",
      "tr": "Gökyüzü yırtılır ve tek bir yıldırım işaretli yeri yerle bir eder."
    },
    {
      "en": "Tempest Sovereign",
      "tr": "Fırtına Hükümdarı"
    },
    {
      "en": "Lightning obeys you, leaping across the whole battlefield.",
      "tr": "Yıldırım sana itaat eder, tüm savaş alanına sıçrar."
    },
    {
      "en": "Mana flows back in battle: +4 mana at the start of every combat round.",
      "tr": "Savaşta mana geri akar: her savaş turunun başında +4 mana."
    },
    {
      "en": "Gale Veins",
      "tr": "Rüzgar Damarları"
    },
    {
      "en": "Attack speed +40%. Each hit has a 40% chance to echo for 50% damage.",
      "tr": "Saldırı hızı +%40. Her vuruşun %50 hasarla yankılanma şansı %40."
    },
    {
      "en": "Stormheart",
      "tr": "Fırtına Kalbi"
    },
    {
      "en": "Pure blood runs like lightning: attack speed +40% and +3 mana every combat round.",
      "tr": "Saf kan şimşek gibi akar: saldırı hızı +%40 ve her savaş turunda +3 mana."
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
  const evolutions = [];
  for (const c of CONTENT.classes) {
    const routes = Array.isArray(c.evolutions) && c.evolutions.length
      ? c.evolutions
      : (c.evolution ? [c.evolution] : []);
    for (const route of routes) {
      const evolved = getClass(route.to);
      const skill = evolved ? getSkill(evolved.startingSkills && evolved.startingSkills[0]) : null;
      const bonus = evolved && evolved.evolveBonus ? evolved.evolveBonus : {};
      const bonusText = Object.entries(bonus)
        .map(([k, v]) => `${statLabel(k)} +${v}`)
        .join(" · ");
      evolutions.push({
        from: c.slug,
        to: { slug: evolved ? evolved.slug : route.to, label: evolved ? evolved.label : route.to, image: evolved ? evolved.image : "" },
        level: route.level || 20,
        requirementType: route.requirementType || null,
        requiredItem: route.requiredItem || null,
        requiredItemCount: route.requiredItemCount || null,
        requiresQuest: route.requiresQuest || null,
        requiresVampire: !!route.requiresVampire,
        skill: skill ? { name: skill.name, description: skill.description || "", mana: skill.mana, image: skill.image } : null,
        bonusText,
        ascend: {
          title: route.ascendTitle || null,
          color: route.ascendColor || "#e8c547",
          sound: route.ascendSound || "",
          sound2: route.ascendSound2 || "",
        },
      });
    }
  }

  return {
    baseSkills: CONTENT.baseSkills,
    story: CONTENT.story,
    // Ekrandaki metinlerin Türkçe karşılıkları (id/slug değil, sadece metin).
    i18nTR: CONTENT.i18nTR || [],
    npcs: CONTENT.npcs || [],
    classes: CONTENT.classes.map((c) => ({
      slug: c.slug,
      label: c.label,
      tagline: c.tagline || "",
      lore: c.lore || "",
      image: c.image,
      baseClass: c.baseClass || null,
      // Secret flag only (boolean) — the password itself NEVER leaves the server.
      secret: !!c.secret,
      evolution: c.evolution ? { to: c.evolution.to, level: c.evolution.level } : null,
      evolutions: (c.evolutions || []).map((r) => ({ to: r.to, level: r.level || 20 })),
      basicAttack: c.basicAttack,
      skills: c.startingSkills || [],
      manaRegen: c.manaRegen || 0,
      petSlots: c.petSlots != null ? c.petSlots : null,
      petPowerMult: c.petPowerMult != null ? c.petPowerMult : null,
      // Stat ranges drive the class-select detail panel (HP/ATK/MAG/RES/SPD bars).
      speed: c.speed || 0,
      attackSpeed: c.attackSpeed || 0,
      hp: c.hp || null,
      attack: c.attack || null,
      mana: c.mana || null,
      resistance: c.resistance || null,
      magicPower: c.magicPower || null,
      healPower: c.healPower || null,
      // Passives shown on the class panel (name + desc only).
      passives: (c.passives || []).map((p) => ({ kind: p.kind, name: p.name || p.kind, desc: p.desc || "" })),
    })),
    ui: CONTENT.ui || {},
    images: CONTENT.images,
    sfx: CONTENT.sfx || {},
    travel: CONTENT.travel || {},
    arpgSkills: CONTENT.arpgSkills || {},
    travelBiomes: CONTENT.travelBiomes || {},
    skillSkins: CONTENT.skillSkins || {},
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
      origin: CONTENT.temple.origin || { item: "origin_stone", price: 250, startQty: 5 },
      recipes: CONTENT.temple.recipes,
      evolutions,
      maxLives: CONTENT.starting.lives,
    },
    effects: CONTENT.effects,
    elements: CONTENT.elements || [],
    affinity: CONTENT.affinity || {},
    combos: CONTENT.combos || [],
    dailyOmens: CONTENT.dailyOmens || [],
    darkTrait: CONTENT.darkTrait || { deal: 1.3, taken: 1.5 },
    races: (CONTENT.races || []).map((r) => ({
      id: r.id,
      name: r.name || r.id,
      description: r.description || r.desc || "",
      color: r.color || "",
      glow: r.glow || "",
      stats: r.stats || {},
      passives: (r.passives || []).map((p) => ({ kind: p.kind, name: p.name || p.kind, desc: p.desc || "" })),
    })),
    combat: {
      turnTimeoutMs: (CONTENT.combat && CONTENT.combat.turnTimeoutMs) || 15000,
    },
    skillTree: {
      pointsPerLevel: (CONTENT.skillTree && CONTENT.skillTree.pointsPerLevel) || 3,
      startingPoints: (CONTENT.skillTree && CONTENT.skillTree.startingPoints) || 3,
      maxLoadout: (CONTENT.skillTree && CONTENT.skillTree.maxLoadout) || 5,
      global: (CONTENT.skillTree && CONTENT.skillTree.global) || [],
      lineages: (CONTENT.skillTree && CONTENT.skillTree.lineages) || {},
    },
    statPaths: {
      maxPoints: (CONTENT.statPaths && CONTENT.statPaths.maxPoints) || 40,
      pointsPerLevel: (CONTENT.statPaths && CONTENT.statPaths.pointsPerLevel) || 1,
      startingPoints: (CONTENT.statPaths && CONTENT.statPaths.startingPoints) || 1,
      rings: (CONTENT.statPaths && CONTENT.statPaths.rings) || 10,
      paths: (CONTENT.statPaths && CONTENT.statPaths.paths) || [],
      nodeValues: (CONTENT.statPaths && CONTENT.statPaths.nodeValues) || {},
      labels: (CONTENT.statPaths && CONTENT.statPaths.labels) || {},
      units: (CONTENT.statPaths && CONTENT.statPaths.units) || {},
    },
    // Radyal pasif ağaç (160 düğüm, komşuluklar dahil). Tek kaynak: server/statTree.js
    statTree: (function () {
      try {
        return require("./server/statTree").publicTree();
      } catch (e) {
        return null;
      }
    })(),
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
    // Boss dungeons are entered from the world-map boss pins (server/boss.js),
    // never from the normal dungeon browser — showing them there created a
    // second, reward-less "boss fight" path.
    dungeons: CONTENT.dungeons.filter((d) => !d.isBoss).map((d) => ({
      rank: d.rank,
      label: d.label,
      image: d.image,
      battleImage: d.battleImage || "",
      monsterPool: d.monsterPool || [],
      travel: d.travel || false,
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
      sound: s.sound || null,
      scaling: s.scaling || null,
      hitShake: s.hitShake != null ? s.hitShake : null,
      baseDamage: s.baseDamage != null ? s.baseDamage : null,
      cooldown: s.cooldown || null,
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
      setId: i.setId || null,
      chestTier: i.chestTier || null,
      craftOnly: i.craftOnly || null,
      bossWeapon: i.bossWeapon || null,
      blueprint: i.blueprint || null,
      chestDrop: i.chestDrop || null,
      dungeonOnly: i.dungeonOnly || null,
      travelOnly: i.travelOnly || null,
      image: i.image,
      description: i.description || "",
    })),
    equipmentSlots: CONTENT.equipmentSlots,
    quests: CONTENT.quests || [],
    itemSets: CONTENT.itemSets || [],
    eggs: CONTENT.eggs || [],
    bosses: (CONTENT.bosses || []).map((b) => ({ id: b.id, label: b.label, image: b.image, hp: b.hp, attack: b.attack, element: b.element, rarity: b.rarity || "mythic", unlockAfter: b.unlockAfter || null })),
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

// How many pets a class can field. Falls back to legacy behavior
// (tamer 3, everyone else 2) so old content keeps working.
function getPetSlots(slug) {
  const c = typeof slug === "string" ? getClass(slug) : slug;
  if (c && c.petSlots != null) return Math.max(0, Math.min(6, Math.floor(Number(c.petSlots) || 0)));
  const id = c ? c.slug : slug;
  return id === "tamer" ? 3 : 2;
}

function getPetPowerMult(slug) {
  const c = typeof slug === "string" ? getClass(slug) : slug;
  if (c && c.petPowerMult != null) return Math.max(1, Number(c.petPowerMult) || 1);
  const id = c ? c.slug : slug;
  return id === "tamer" ? 2 : 1;
}

// Which stat a damage skill scales from. Explicit `scaling` wins
// ("attack" | "magicPower" | "healPower"); otherwise legacy rule:
// physical -> attack, everything else -> magicPower.
function resolveDamageStat(skill) {
  const s = skill && skill.scaling;
  if (s === "attack" || s === "magicPower" || s === "healPower") return s;
  if (s === "magic" || s === "mag") return "magicPower";
  if (s === "atk") return "attack";
  const el = skill && skill.element;
  return (!el || el === "physical") ? "attack" : "magicPower";
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
  getPetSlots,
  getPetPowerMult,
  resolveDamageStat,
  getDungeon,
  getDungeonSize,
  getSkill,
  getItem,
  getMonster,
  publicCatalog,
};
