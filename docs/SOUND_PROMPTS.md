# Setra Sound Design - Generation Prompts (150+)

Bu dokuman, oyundaki tum ses olaylari icin **metin->ses** uretim prompt'larini icerir.
Her satir tek bir ses dosyasina karsilik gelir. Uretilen dosyayi
`public/sounds/<id>.mp3` olarak kaydedin; oyun dosyayi otomatik bulur.

## Nasil kullanilir

1. Asagidaki tablolardan bir `id` secin.
2. Prompt'u ses uretim aracina (ElevenLabs SFX, Stable Audio, Suno, AudioGen vb.) verin.
3. Cikan dosyayi `public/sounds/<id>.mp3` olarak kaydedin.
4. GameCraft -> **Sesler** panelinde ilgili olayi secin, `Refresh list` ile dosyayi dogrulayin.
5. Oyunu yeniden baslatmaya gerek yok; `/api/sounds` klasoru her istekte okur.

## Teknik hedef

- Format: MP3, 44.1 kHz veya 48 kHz, 16-bit.
- SFX: mono, 0.15-2.5 sn, tepe -1 dBFS, clipping yok.
- Ambience/loop: stereo, 30-90 sn, kesintisiz dongu (ilk/son ornek eslesmeli).
- Ortak stil: **dark medieval fantasy, warm analog textures, cinematic, slightly gritty, no modern EDM**.
- Ses seviyeleri tutarli olsun; ayni kategorideki dosyalar birbirini bastirmasin.
- Telifli marka/film/oyun referansi kullanmayin.

`★` = bu id zaten `public/sounds/` icinde var (yeniden uretirken ayni karakteri koruyun).

---

## 1. UI & Feedback (12)

| ID | Sure | Prompt |
| --- | --- | --- |
| `★ clicksound` | 0.12s | Soft wooden button click with a tiny metallic tick, close and dry, no reverb. |
| `★ hoversound` | 0.10s | Very quiet airy tick, like a fingertip brushing parchment, subtle high-frequency shimmer. |
| `uic_confirm` | 0.35s | Warm two-note chime, small wooden bell then soft golden shimmer, UI confirmation. |
| `uic_cancel` | 0.30s | Short descending muted thud with a paper swipe, gentle negative feedback. |
| `uic_error` | 0.45s | Low wooden knock with a brief dissonant string scrape, not harsh. |
| `uic_tab` | 0.18s | Quick parchment page flick with a soft leather tap. |
| `uic_toggle_on` | 0.22s | Small mechanical lever click followed by a clean rising spark. |
| `uic_toggle_off` | 0.22s | Same lever click but descending, duller and softer. |
| `uic_coin` | 0.35s | Two small gold coins tapped together, bright but intimate. |
| `uic_page_turn` | 0.40s | Old book page turn, dry paper crackle, close perspective. |
| `uic_notification` | 0.55s | Gentle three-note lute pluck with a soft bell tail, friendly attention cue. |
| `uic_locked` | 0.35s | Heavy metal latch refusing to open, short clank and low thud. |

## 2. Town Actions (17)

| ID | Sure | Prompt |
| --- | --- | --- |
| `★ healingmagic` (`sfx.action.rest`) | 1.4s | Warm restorative hum, soft choir pad and gentle water droplets, restful and holy. |
| `★ aftersleepnewdaysound` | 2.0s | Dawn awakening: distant rooster, soft wind, a rising warm string swell. |
| `tavern_sleep` | 2.0s | Cozy tavern night: fire crackle fading into a soft yawn and warm blanket rustle. |
| `action_search` | 1.0s | Rumaging through bushes and dry leaves, cloth rustle, a small discovery chime at the end. |
| `blacksmith_forge_hit` | 0.6s | Hammer striking hot iron on an anvil, bright metal ring with a short room tail. |
| `blacksmith_bellows` | 1.2s | Leather bellows breathing air into a forge, low whoosh with fire crackle. |
| `merchant_greet` | 1.2s | Friendly shopkeeper clearing throat and unrolling a cloth of wares, coins jingle softly. |
| `temple_enter` | 1.8s | Stone door opening into a vast temple, deep reverb, distant choir and candle flicker. |
| `dungeon_enter` | 1.6s | Heavy iron gate creak, cold wind, distant monster growl, cavern reverb. |
| `★ eatingsound` | 0.8s | Crisp bite into bread and a satisfied small hum, close and warm. |
| `★ potiondrinksound` | 0.9s | Glass vial uncork, liquid gulp, soft magical fizz aftertaste. |
| `★ revivesound` | 2.0s | Life returning: deep heartbeat, rising golden choir, breath gasp, soft light burst. |
| `craft_start` | 0.8s | Tools and materials placed on a wooden bench, leather pouch open, small metal clink. |
| `craft_finish` | 1.2s | Final hammer tap, warm sparkle, satisfied object-place thud. |
| `equip_gear` | 0.5s | Leather straps tightening and metal buckle click, close armor movement. |
| `shop_buy` | 0.5s | Coins poured onto a wooden counter and a cheerful small bell. |
| `shop_sell` | 0.5s | Item sliding across wood, single coin flip, soft merchant nod. |

## 3. Items & Loot (15)

| ID | Sure | Prompt |
| --- | --- | --- |
| `★ lootsound` | 0.9s | Treasure discovery: cloth bag open, sparkling gold shimmer, tiny rising chime. |
| `★ inventorysound` | 0.5s | Leather bag open and items shifting, soft cloth and a small buckle. |
| `item_coin_pickup` | 0.3s | Single gold coin picked up from stone, bright tiny ring. |
| `gold_spend` | 0.6s | A small pile of coins sliding off a counter into a purse. |
| `gold_gain` | 0.7s | Coins dropping into a leather pouch, warm and satisfying. |
| `chest_wood_open` | 1.0s | Old wooden chest lid creaking open, dust puff, hopeful low string note. |
| `chest_iron_open` | 1.0s | Iron-bound chest unlatching, heavy hinge groan, metallic click. |
| `chest_gold_open` | 1.2s | Ornate chest opening with golden shimmer and a short angelic choir sparkle. |
| `chest_boss_open` | 1.8s | Massive boss chest slamming open, deep boom, overwhelming treasure sparkle. |
| `rarity_common` | 0.4s | Small dull wooden token drop, no fanfare. |
| `rarity_rare` | 0.7s | Clean blue crystal ping with a short shimmering tail. |
| `rarity_epic` | 0.9s | Purple arcane pulse, rising two-note synth-bell, mysterious. |
| `rarity_legendary` | 1.3s | Golden fanfare sting, warm brass and harp, short but triumphant. |
| `rarity_mythic` | 1.5s | Crimson pulse, deep heartbeat and a high ethereal scream, unsettling glory. |
| `rarity_relic` | 1.8s | Ancient relic awakening: stone grinding, choir hit, cosmic low drone. |

## 4. Combat - Physical (16)

| ID | Sure | Prompt |
| --- | --- | --- |
| `★ slash1` | 0.25s | Fast sword slash through air, clean high whoosh with a metallic edge. |
| `★ slash2` | 0.30s | Heavier diagonal blade swing, deeper whoosh and short steel ring. |
| `★ slash3` | 0.35s | Wide horizontal sword cut, broad air movement and a sharp metal whisper. |
| `★ slash4` | 0.40s | Deep finishing slash, low body and bright blade at the end. |
| `★ strongattack1` | 0.45s | Powerful two-handed swing, wind-up grunt and heavy impact thud. |
| `★ strongattack2` | 0.50s | Overhead smash, low whoosh into a cracking strike. |
| `★ battleaxe` | 0.55s | Heavy axe chop, chunky air whoosh and brutal wooden impact. |
| `★ skull_crush` | 0.60s | Critical blunt impact, wet crunch and deep bone crack, cinematic but not gory. |
| `sword_parry` | 0.30s | Two blades clashing, bright metallic ring with short decay. |
| `shield_block` | 0.35s | Wooden shield taking a hit, dull thud plus metal rim ring. |
| `punch_impact` | 0.22s | Bare fist hitting leather armor, tight body thump. |
| `kick_impact` | 0.28s | Boot kick into a heavy target, low thud with cloth movement. |
| `arrow_shot` | 0.30s | Bowstring release and arrow flying away, taut snap and air whistle. |
| `arrow_hit` | 0.25s | Arrow thudding into wood, sharp tip and shaft vibration. |
| `dagger_stab` | 0.22s | Quick dagger thrust and soft puncture, close and dry. |
| `dodge_whoosh` | 0.30s | Fast cloth-and-air dodge, quick side whoosh, no impact. |

## 5. Combat - Magic & Elements (24)

| ID | Sure | Prompt |
| --- | --- | --- |
| `★ firemagic` | 0.9s | Fire spell ignition, roaring flame burst and crackling embers. |
| `★ frostmagic` | 0.9s | Ice spell, crystalline shards forming then a cold shattering burst. |
| `★ normalmagic` | 0.7s | Generic arcane bolt, quick magical whoosh with a soft energy pop. |
| `lightning_cast` | 0.7s | Electric charge gathering, crackling static rising into a bright zap. |
| `lightning_impact` | 0.8s | Thunder strike hitting ground, sharp crack and deep rumble tail. |
| `water_cast` | 0.8s | Water orb forming, swirling liquid and a soft splash release. |
| `water_impact` | 0.7s | Heavy water burst against a target, drenching splash and droplets. |
| `earth_cast` | 0.9s | Earth magic rumble, stones grinding and lifting from the ground. |
| `earth_impact` | 0.9s | Rock spike erupting, deep crack and falling rubble. |
| `nature_cast` | 0.8s | Vines and leaves growing rapidly, organic creak and soft rustle. |
| `nature_impact` | 0.8s | Thorned vines lashing a target, whip crack and leafy burst. |
| `shadow_cast` | 0.9s | Dark smoke gathering, low whispered drone and reversed air suck. |
| `shadow_impact` | 0.9s | Shadow burst, hollow boom and distant ghostly echo. |
| `holy_cast` | 1.0s | Holy light gathering, warm choir pad rising into a gentle bell. |
| `holy_impact` | 1.1s | Radiant divine strike, bright choir hit and soft golden shockwave. |
| `★ bloodmagic1` | 0.9s | Blood magic drain, wet pulse and a low heartbeat, dark and intimate. |
| `★ bloodmagic2` | 1.0s | Blood bolt impact, thick splatter and a deep forbidden hum. |
| `★ evilascension` | 2.5s | Dark ascension, reversed choir, deep horn and a shattering black crystal. |
| `★ holy-ascensionsound` | 2.5s | Holy ascension, rising angelic choir, golden bell and light burst. |
| `★ neutralascension` | 2.2s | Neutral ascension, warm arcane swell, soft shimmer and a calm bell. |
| `arcane_cast` | 0.8s | Arcane runes igniting, glassy shimmer and a rising magical hum. |
| `arcane_impact` | 0.9s | Arcane detonation, glassy burst and a short reversed tail. |
| `curse_cast` | 1.0s | Cursed whisper, detuned strings and a cold breath. |
| `mana_restore` | 0.9s | Blue mana flowing back, soft liquid shimmer and a clear rising note. |

## 6. Monsters & Creatures (17)

| ID | Sure | Prompt |
| --- | --- | --- |
| `★ monstersound` | 0.8s | Generic monster roar, raspy throat and wet growl, medium distance. |
| `★ kaymakvampiresound` | 1.0s | Elegant vampire hiss, silk movement and a low predatory purr. |
| `★ Succubustalk` | 1.4s | Seductive demonic whisper, breathy and echoing, no clear words. |
| `wolf_growl` | 0.9s | Low wolf growl, close and threatening, slight snarl. |
| `wolf_attack` | 0.5s | Wolf snap and claw swipe, quick and aggressive. |
| `dragon_roar` | 1.8s | Massive dragon roar, layered low growl and throat rumble, huge space. |
| `dragon_breath` | 1.5s | Dragon fire breath, sustained roaring flame with crackling embers. |
| `undead_moan` | 1.2s | Hollow undead moan, dry throat and distant reverb. |
| `skeleton_rattle` | 0.7s | Dry bones rattling and a jaw clack, close and brittle. |
| `slime_squelch` | 0.6s | Wet slime squelch and bubble pop, gooey and gross but playful. |
| `golem_step` | 0.9s | Stone golem footstep, deep grinding thud and falling pebbles. |
| `golem_smash` | 1.1s | Golem fist smashing ground, heavy stone impact and rubble. |
| `spider_chitter` | 0.7s | Spider legs clicking rapidly, dry chitin and a soft hiss. |
| `bat_screech` | 0.6s | Bat screech and wing flutters, high but not piercing. |
| `ghost_wail` | 1.6s | Ghostly wail, airy and mournful, long reverb tail. |
| `vampire_bite` | 0.5s | Quick bite and a soft liquid pull, dark and restrained. |
| `beast_death` | 1.2s | Wounded beast collapsing, fading growl and a final breath. |

## 7. Cinematics & Progress (14)

| ID | Sure | Prompt |
| --- | --- | --- |
| `cinematic_ascend_holy` | 3.0s | Full holy ascension sequence, low choir building into a brilliant golden burst. |
| `cinematic_ascend_dark` | 3.0s | Full dark ascension sequence, deep drone, reversed whispers, black crystal shatter. |
| `cinematic_ascend_neutral` | 2.8s | Balanced ascension, warm arcane swell, soft bells, calm and majestic. |
| `cinematic_rebirth` | 3.0s | Rebirth: heartbeat, liquid swirl, rising light and a newborn breath. |
| `level_up` | 1.2s | Level up fanfare, short rising harp arpeggio with a warm bell. |
| `quest_accept` | 0.8s | Quest parchment unrolled and a confident low lute chord. |
| `quest_complete` | 1.6s | Quest complete, bright lute melody and a soft coin shower. |
| `day_dawn` | 2.5s | Dawn ambience sting, birds waking, warm light swell. |
| `night_fall` | 2.5s | Night transition, distant wolf, cold wind, low string drone. |
| `boss_intro` | 3.0s | Boss introduction, massive drums, dark choir and a rising tension string. |
| `boss_phase2` | 2.0s | Boss enrage, roar, shattering armor and a faster drum pattern. |
| `defeat_sting` | 2.0s | Defeat sting, low cello fall and a fading heartbeat. |
| `victory_sting` | 2.0s | Victory sting, warm brass and choir, short and triumphant. |
| `title_swell` | 3.0s | Main title swell, epic medieval strings and distant choir. |

## 8. Tavern & Casino (12)

| ID | Sure | Prompt |
| --- | --- | --- |
| `coinflip_spin` | 0.7s | Gold coin spinning in the air, rapid metallic flutter. |
| `coinflip_land_win` | 0.9s | Coin lands on wood with a bright ring followed by a small winning chime. |
| `coinflip_land_lose` | 0.9s | Coin lands flat and rolls briefly, dull and disappointing. |
| `card_deal` | 0.25s | Playing card sliding across a felt table, crisp and quick. |
| `card_flip` | 0.2s | Card flipped over, sharp snap against felt. |
| `card_shuffle` | 1.0s | Casino card shuffle, bridge and riffle, close and smooth. |
| `chip_place` | 0.3s | Clay poker chip placed on felt, soft click. |
| `chip_win` | 0.8s | Chips pushed toward the player, clinking pile and a small cheer. |
| `blackjack_win` | 1.2s | Blackjack win, bright card snap and a short celebratory fanfare. |
| `blackjack_lose` | 1.0s | Blackjack loss, cards swept away and a low disappointed sting. |
| `dice_roll` | 0.9s | Bone dice rolling on wood, tumbling and settling. |
| `tavern_ambience_loop` | 45s loop | Cozy medieval tavern: low crowd murmur, fire crackle, occasional cup clink, no music. |

## 9. Ambience (12, all loops)

| ID | Sure | Prompt |
| --- | --- | --- |
| `amb_town_day` | 60s loop | Peaceful medieval village daytime, distant chatter, birds, light wind, faint cart wheels. |
| `amb_town_night` | 60s loop | Quiet village night, crickets, distant owl, soft wind through wooden houses. |
| `amb_dungeon` | 60s loop | Cold stone dungeon, dripping water, low airy drone, occasional distant metal creak. |
| `amb_forest` | 60s loop | Deep forest, leaves rustling, birds, a distant woodpecker. |
| `amb_tavern_crowd` | 45s loop | Tavern crowd walla, laughter, mugs, fire, no intelligible words. |
| `amb_temple` | 60s loop | Sacred temple, airy choir pad, candle flicker, deep stone reverb. |
| `amb_forge` | 45s loop | Blacksmith forge, rhythmic hammer, fire whoosh, metal cooling hiss. |
| `amb_market` | 45s loop | Busy market, overlapping voices, crates, coins, distant animals. |
| `amb_wind_cold` | 60s loop | High mountain cold wind, thin whistle, sparse icy gusts. |
| `amb_rain` | 60s loop | Steady rain on stone and wood, soft thunder far away. |
| `amb_cave_low` | 60s loop | Subterranean cave, deep sub drone, water drops, slow air movement. |
| `amb_boss_room` | 60s loop | Ominous boss chamber, low pulse, distant chains, tense air. |

## 10. Food, Rest & Misc (13)

| ID | Sure | Prompt |
| --- | --- | --- |
| `food_bread_bite` | 0.5s | Crisp bread bite, dry crust crack and soft chew. |
| `food_meat_tear` | 0.6s | Tearing cooked meat, juicy and warm, close. |
| `drink_gulp` | 0.7s | Deep gulp from a wooden cup, liquid swish, satisfied exhale. |
| `cooking_sizzle` | 1.2s | Meat searing on a hot pan, steady sizzle and fat pop. |
| `fire_crackle` | 2.0s loop | Small campfire crackling, warm and steady, gentle pops. |
| `book_open` | 0.5s | Old book opened, spine creak and paper settle. |
| `map_open` | 0.7s | Parchment map unrolled on a table, dry paper and a soft thump. |
| `compass_ping` | 0.4s | Small brass compass needle settling with a clear ping. |
| `footstep_grass` | 0.35s | Single boot step on soft grass, close and natural. |
| `footstep_stone` | 0.35s | Single boot step on stone, slight heel scuff and echo. |
| `door_creak` | 0.9s | Old wooden door slowly creaking open, hinge groan. |
| `door_close` | 0.5s | Wooden door closing firmly, latch click and short room thud. |
| `sleep_breath` | 2.0s | Soft sleeping breath, calm and slow, fade out. |

---

## Oncelik sirasi (ilk uretim turu)

Oyunun su an kullandigi ve en cok duyulan sesler:

1. `clicksound`, `hoversound` - her tiklama/hover.
2. `lootsound`, `winningsound`, `losingsound` - odul ve sonuc.
3. `healingmagic`, `aftersleepnewdaysound` - rest/sleep.
4. `firemagic`, `frostmagic`, `normalmagic`, `healingmagic` - savas buyuleri.
5. `slash1-4`, `strongattack1-2`, `skull_crush` - fiziksel savas.
6. `holy-ascensionsound`, `neutralascension`, `evilascension` - sinematikler.
7. `coinflip_spin`, `card_deal`, `card_flip`, `chip_place` - tavern (blackjack yenilemesi ile birlikte).

## Esleme notu

`content.js` icindeki `sfx` blogu hangi olayin hangi dosyayi calacagini belirler.
Bos birakilan alan varsayilana doner; `"none"` yazilirsa o olay sessiz kalir.
Yeni dosya ekledikten sonra GameCraft -> Sesler -> **Refresh list** ile listede
gorundugunu dogrulayin ve ilgili olayi secin.