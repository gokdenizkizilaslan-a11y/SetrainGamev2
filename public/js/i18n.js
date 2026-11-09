/*
 * Setra i18n — English (source) / Turkish.
 *
 * Tasarım kararları:
 *  - İngilizce kaynak dildir; sözlükte yalnızca İngilizce -> Türkçe eşlemesi var.
 *  - Sadece OYUNCUNUN GÖRDÜĞÜ arayüz metinleri + hikaye/diyaloglar çevrilir.
 *  - Özel isimler (Setra, Krein, Palendio, Mira...), item/eşya adları,
 *    sınıf adları, canavar/yetenek isimleri ASLA çevrilmez.
 *  - Yeni DOM düğümleri için MutationObserver devrede: menü/ekranlar yeniden
 *    çizildiğinde metinler kendiliğinden çevrilir.
 *  - Dil seçimi localStorage'da tutulur; İngilizceye dönünce özgün metinler
 *    birebir geri yüklenir.
 */
(function () {
  "use strict";

  const STORAGE_KEY = "setra-lang";
  const SUPPORTED = ["en", "tr"];

  // ---- Çeviri sözlüğü: İngilizce (tam metin) -> Türkçe ------------------
  // NOT: Buraya asla özel isim / item adı / sınıf adı eklemeyin.
  const TR = {
    // ===== Travel yetenek paneli =====
    "Skills": "Yetenekler",
    "Skill Loadout": "Yetenek Dizilimi",
    "Skill Points": "Yetenek Puanı",
    "Pick a slot, then choose a skill from your class. Learn new skills with skill points.":
      "Bir yuva seç, sonra sınıfından bir yetenek seç. Yeni yetenekleri yetenek puanıyla öğren.",
    "Class Skills": "Sınıf Yetenekleri",
    "Learn": "Öğren",
    "Learned": "Öğrenildi",
    "Default": "Varsayılan",
    "Equipped": "Kuşanıldı",
    "No class skills found.": "Sınıf yeteneği bulunamadı.",
    "Learn this skill first.": "Önce bu yeteneği öğren.",
    "Learn new skills with skill points": "Yeni yetenekleri yetenek puanıyla öğren",
    "Click the same skill again to restore the default.": "Varsayılana dönmek için aynı yeteneğe tekrar tıkla.",
    "Skill Tree": "Yetenek Ağacı",
    "Travel Points": "Sefer Puanı",
    "Base Kit": "Temel Set",
    "Adept": "Usta",
    "Legend": "Efsane",
    "Pick a key, then a skill to equip it. Learn new ones with travel points.":
      "Bir tuş seç, sonra kuşanmak için bir yetenek seç. Yenilerini sefer puanıyla öğren.",
    "Pick a slot, then choose a skill from your class. Learn new skills with travel points.":
      "Bir yuva seç, sonra sınıfından bir yetenek seç. Yeni yetenekleri sefer puanıyla öğren.",
    "Travel points come from hunting in expeditions — every 4 kills grants 1. These points are separate from the turn-based skill tree.":
      "Sefer puanları avlanarak kazanılır — her 4 öldürmede 1 puan. Bu puanlar sıra tabanlı yetenek ağacından ayrıdır.",

    // ===== Ana menü / karakter yaratma / lobi =====
    "Singleplayer": "Tek Oyunculu",
    "Multiplayer": "Çok Oyunculu",
    "Chronicle of the Ember Realm": "Köz Diyarı'nın Güncesi",
    "A dying realm. One last warden. Choose your path.":
      "Ölmekte olan bir diyar. Son bir muhafız. Yolunu seç.",
    "Begin a lone pilgrimage": "Yalnız bir yolculuğa çık",
    "Ride with sworn companions": "Yeminli yoldaşlarla at sür",
    "Create Character": "Karakter Oluştur",
    "Name": "İsim",
    "Your name": "Adınız",
    "Choose a class": "Bir sınıf seçin",
    "Attributes are forged when the quest begins.": "Nitelikler görev başladığında şekillenir.",
    "Starter kit": "Başlangıç seti",
    "A wandering soul answering the call of Setra. Their legend is yet unwritten.":
      "Setra'nın çağrısına cevap veren gezgin bir ruh. Efsanesi henüz yazılmadı.",
    "Back": "Geri",
    "Continue": "Devam",
    "Find a Hall": "Salon Bul",
    "Hall name": "Salon adı",
    "Create Room": "Oda Oluştur",
    "Room code": "Oda kodu",
    "Join by Code": "Kodla Katıl",
    "Hall": "Salon",
    "Code:": "Kod:",
    "Lobby": "Lobi",
    "Leave": "Ayrıl",
    "Ready": "Hazır",
    "Start Game": "Oyunu Başlat",
    "Host": "Kurucu",
    "Waiting for players...": "Oyuncular bekleniyor...",

    // ===== Genel =====
    "Close": "Kapat",
    "Language": "Dil",
    "Settings": "Ayarlar",
    "Music: On": "Müzik: Açık",
    "Music: Off": "Müzik: Kapalı",
    "SFX: On": "SES: Açık",
    "SFX: Off": "SES: Kapalı",
    "Background Music": "Arka Plan Müziği",
    "Sound Effects": "Ses Efektleri",
    "Secret class password": "Gizli sınıf şifresi",
    "Empty = no secret classes": "Boş = gizli sınıf yok",
    "Save password": "Şifreyi kaydet",
    "Clear": "Temizle",
    "Leave Game": "Oyundan Ayrıl",
    "Music volume": "Müzik ses düzeyi",
    "SFX volume": "Ses efekti düzeyi",
    "Volume": "Ses düzeyi",
    "Play / Pause": "Çal / Duraklat",
    "Next song": "Sonraki şarkı",
    "Music: on — click to pause": "Müzik: açık — duraklatmak için tıkla",
    "Music: off — click to play": "Müzik: kapalı — çalmak için tıkla",
    "Open settings": "Ayarları aç",
    "No music": "Müzik yok",
    "Hall Chat": "Salon Sohbeti",
    "Say something...": "Bir şey yaz...",
    "Send": "Gönder",
    "Collapse": "Daralt",
    "The day ends": "Gün sona eriyor",
    "Night falls": "Gece çöküyor",
    "Stamina returns at dawn.": "Dayanıklılık şafakta geri döner.",

    // ===== Kasaba ekranı =====
    "The Town": "Kasaba",
    "Setra Village": "Setra Köyü",
    "Day": "Gün",
    "Quests": "Görevler",
    "Guide": "Rehber",
    "Skill Tree": "Yetenek Ağacı",
    "Map": "Harita",
    "What would you like to do?": "Ne yapmak istersin?",
    "Back to Town": "Kasabaya Dön",
    "You can only return to town from the travel stone where you arrived.":
      "Kasabaya dönmek için yalnızca vardığın seyahat taşından dönebilirsin.",
    "Today's omen": "Bugünün işareti",
    "How to play": "Nasıl oynanır",
    "Open Skill Tree": "Yetenek Ağacını aç",
    "Open Map": "Haritayı aç",

    // ===== Aksiyon kartları =====
    "Dungeon": "Zindan",
    "Ranked delve · High risk": "Dereceli iniş · Yüksek risk",
    "Town Center": "Kasaba Meydanı",
    "Meet the folk of Setra": "Setra halkıyla tanış",
    "Blacksmith": "Demirci",
    "Armor, weapons & gear": "Zırh, silah ve teçhizat",
    "Merchant": "Tüccar",
    "Chests, potions & materials": "Sandıklar, iksirler ve malzemeler",
    "Tavern": "Meyhane",
    "Bet gold · Coin flip, blackjack & food": "Altın yatır · Yazı tura, blackjack ve yemek",
    "Ancient Temple": "Antik Tapınak",
    "Ascend, mend hearts & rebirth": "Yüksel, kalpleri onar ve yeniden doğ",
    "Travel": "Seyahat",
    "Explore the wilds · 10 stamina": "Vahşi doğayı keşfet · 10 dayanıklılık",
    "Sleep Outside": "Dışarıda Uyu",
    "End the day · Cold stars, small risk": "Günü bitir · Soğuk yıldızlar, küçük risk",

    // ===== Overlay başlıkları =====
    "Adventurer's Guide": "Maceracı Rehberi",
    "The Tavern": "Meyhane",
    "The Blacksmith": "Demirci",
    "The Merchant": "Tüccar",
    "Inventory": "Envanter",
    "The Ancient Temple": "Antik Tapınak",
    "Arena - 1v1 Duel": "Arena - 1v1 Düello",
    "Pets": "Evcil Hayvanlar",
    "World Map": "Dünya Haritası",
    "Drag to pan · Scroll or pinch to zoom · Middle mouse drag":
      "Kaydırmak için sürükle · Yakınlaştırmak için kaydır veya sıkıştır · Orta tuşla sürükle",

    // ===== Envanter / eşya butonları =====
    "Use": "Kullan",
    "Equip": "Kuşan",
    "Open": "Aç",
    "Sell": "Sat",
    "Back to Town.": "Kasabaya Dön.",

    // ===== İstatistik etiketleri =====
    "Level": "Seviye",
    "Gold": "Altın",
    "Food": "Yiyecek",
    "Wood": "Odun",
    "Attack": "Saldırı",
    "Resistance": "Direnç",
    "Magic": "Büyü",
    "Heal": "Şifa",
    "Speed": "Hız",
    "Crit": "Kritik",
    "Lives": "Canlar",
    "Stamina": "Dayanıklılık",
    "Atk": "Sld",
    "Res": "Dir",
    "Mgc": "Büy",
    "Spd": "Hz",
    "Lv": "Sv",
    "Equipped": "Kuşanılmış",
    "Empty": "Boş",
    "empty": "boş",
    "None": "Yok",

    // ===== Profil kartı / lobi =====
    "Character details": "Karakter detayları",
    "Lives — when 0 you must be revived": "Canlar — 0 olunca diriltilmen gerekir",
    "No anomaly": "Anomali yok",
    "Equipments": "Ekipmanlar",
    "Fallen": "Düşmüş",
    "Playing": "Oynanıyor",
    "Unready": "Hazır Değil",
    "The town is quiet. Spend stamina, then end the day.":
      "Kasaba sessiz. Dayanıklılık harca, sonra günü bitir.",
    "You explore the wilds": "Vahşi doğayı keşfediyorsun",

    // ===== Rehber (Adventurer's Guide) sekmeleri =====
    "Races": "Irklar",
    "Elements": "Elementler",
    "Combos": "Kombolar",
    "Battle Basics": "Savaş Temelleri",
    "Town & Days": "Kasaba ve Günler",
    "Chests & Loot": "Sandıklar ve Ganimet",
    "Pets & Eggs": "Evcil Hayvanlar ve Yumurtalar",
    "Turns & Mana": "Turlar ve Mana",
    "Damage Types": "Hasar Türleri",
    "Shields & Healing": "Kalkanlar ve İyileştirme",
    "Stacks": "Birikimler",
    "Stamina & Days": "Dayanıklılık ve Günler",
    "Parties & PvP": "Gruplar ve PvP",
    "Chests": "Sandıklar",
    "Drops": "Düşenler",
    "How Ascension Works": "Yükseliş Nasıl İşler",
    "Rebirth (Race Reroll)": "Yeniden Doğuş (Irk Yeniden Zar)",
    "Eggs & Hatching": "Yumurtalar ve Kuluçka",
    "Pets in Battle": "Savaşta Evcil Hayvanlar",

    // ===== Hikaye: başlık / prolog =====
    "The Setra Game": "Setra",
    "Setra": "Setra",
    "Wake Up": "Uyan",
    "Krein is an old world of wind, stone and long roads. No map has ever held all of it.":
      "Krein; rüzgârın, taşın ve uzun yolların eski dünyası. Hiçbir harita tamamını kapsamadı.",
    "Krein is an old world, its lands worn smooth by ages of wind and stone. No map has ever held all of it.":
      "Krein eski bir dünya; toprakları rüzgâr ve taşın yonttuğu çağlar boyunca aşınmış. Hiçbir harita tamamını kapsamadı.",
    "You awake on the grass of an unknown valley with an empty memory and a warm stone in your hand.":
      "Bilmediğin bir vadinin çimenlerinde, hafızan boş ve elinde sıcak bir taşla uyanıyorsun.",
    "You wake on the grass of a valley you do not know. Your head is heavy, your memory empty, and a warm stone rests in your hand.":
      "Bilmediğin bir vadinin çimenlerinde uyanıyorsun. Başın ağır, hafızan boş, elinde sıcak bir taş duruyor.",
    "The stone is called Aetheria. You do not know where it came from, only that it brought you here.":
      "Taşın adı Aetheria. Nereden geldiğini bilmiyorsun; yalnızca seni buraya getirdiğini biliyorsun.",
    "The stone is Aetheria. You do not remember where it came from, or how you got here — only that it carried you.":
      "Taş Aetheria. Nereden geldiğini de buraya nasıl geldiğini de hatırlamıyorsun — yalnızca seni taşıdığını biliyorsun.",
    "Beyond the ridge lies Setra, a small village in the green kingdom of Palendio — the nearest roof and fire you have.":
      "Tepenin ardında, Palendio'nun yeşil krallığındaki küçük Setra köyü var — sana en yakın çatı ve ateş orası.",
    "Past the ridge lies Setra, a small village in the green kingdom of Palendio. It is the nearest place with a roof and a fire.":
      "Tepenin ardında, Palendio'nun yeşil krallığındaki küçük Setra köyü var. Çatısı ve ateşi olan en yakın yer orası.",

    // ===== Hikaye: diyaloglar =====
    "Cold grass. Birdsong. Someone is shaking your shoulder.":
      "Soğuk çimenler. Kuş cıvıltısı. Biri omzundan tutup sarsıyor.",
    "Hey. Hey — can you hear me? You were lying face-down in the ditch. Are you hurt?":
      "Hey. Hey — beni duyuyor musun? Hendekte yüz üstü yatıyordun. Bir yerin acıyor mu?",
    "I... don't think so. I don't remember how I got here.":
      "Sanırım... hayır. Buraya nasıl geldiğimi hatırlamıyorum.",
    "You're not bleeding, so that's a start. I'm Mira. The village is just past the ridge — Setra. Can you stand? Here, take this: fifty gold and some food. Nobody in this valley helps for free, and you'll need it.":
      "Kanaman yok, bu bir başlangıç. Ben Mira. Köy şu tepenin ardında — Setra. Kalkabilir misin? Dur, şunları al: elli altın ve biraz yiyecek. Bu vadide kimse bedavaya yardım etmez, ihtiyacın olacak.",
    "Why? You don't know me.":
      "Neden? Beni tanımıyorsun.",
    "No. But I've been the stranger at the wrong end of the road before. Come on — walk slowly, and don't drop the stone. It's still warm.":
      "Hayır. Ama ben de bir zamanlar yolun yanlış ucunda kalmıştım. Hadi — yavaş yürü ve taşı düşürme. Hâlâ sıcak.",
    "Mira gives you fifty gold and ten days of food.":
      "Mira sana elli altın ve on günlük yiyecek veriyor.",

    // ===== Kasaba arama sonuçları =====
    "You find a pouch of coins in the grass.": "Çimenlerde bir kese dolusu bozuk para buluyorsun.",
    "A fallen branch yields useful timber.": "Devrilmiş bir dal işe yarar kereste veriyor.",
    "You push through thorns and find a glint of gold.": "Dikenlerin arasından geçip bir altın parıltısı buluyorsun.",
    "A passing shade leads you to forgotten coin.": "Geçen bir gölge seni unutulmuş bir paraya götürüyor.",
    "You forage and find edible roots.": "Yiyecek topluyor ve yenilebilir kökler buluyorsun.",

    // ===== Seyahat: HUD / düşme / rapor =====
    "You Have Fallen": "Yere Düştün",
    "The wilds claim you": "Vahşi doğa seni aldı",
    "Your torch still burns. An ally may raise you, or you may walk back to town — keeping everything you found.":
      "Meşalen hâlâ yanıyor. Bir müttefik seni ayağa kaldırabilir ya da bulduğun her şeyi koruyarak kasabaya dönebilirsin.",
    "Wait for a revive": "Diriltilmeyi bekle",
    "Return to town": "Kasabaya dön",
    "Use Travel Stone": "Seyahat Taşını kullan",
    "Return from the stone where you arrived.": "Yalnızca vardığın taştan dönebilirsin.",
    "Returning to town...": "Kasabaya dönülüyor...",
    "A nearby ally revives you with": "Yakındaki bir müttefik seni şununla diriltir:",
    "The last light gutters out": "Son ışık sönüyor",
    "Safely returned": "Güvenle döndün",
    "Expedition Report": "Sefer Raporu",
    "You made it back to town with your spoils.": "Ganimetlerinle kasabaya döndün.",
    "Safe Return": "Güvenli Dönüş",
    "Back in town": "Kasabadasın",
    "You close the trail and return to town with everything you gathered.":
      "İzi kapatıp topladığın her şeyle kasabaya dönüyorsun.",
    "Expedition Failed": "Sefer Başarısız",
    "You fall in the wilds. This is what you gathered before the end.":
      "Vahşi doğada düşüyorsun. Sonundan önce topladıkların bunlar.",
    "Expedition Over": "Sefer Sona Erdi",
    "Carried back": "Geri taşındın",
    "You wake up back in town.": "Kasabada uyanıyorsun.",
    "You were carried back to town.": "Kasabaya geri taşındın.",

    // ===== Seyahat: Mana Rengi paneli =====
    "Mana Hue": "Mana Rengi",
    "One hue burns at a time. It paints your skills and cast effects. Roll a new one and the old hue fades away.":
      "Aynı anda tek bir renk yanar. Yeteneklerini ve büyü efektlerini boyar. Yeni bir renk zar at, eskisi kaybolup gider.",
    "One color of magic burns in you. Roll to change the hue of your skills.":
      "İçinde tek bir büyü rengi yanar. Yeteneklerinin rengini değiştirmek için zar at.",
    "Roll a new hue (50g)": "Yeni bir renk zar at (50 altın)",
    "Roll a mana hue (50g)": "Mana rengi zar at (50 altın)",
    "Rolling costs 50 gold": "Zar atmak 50 altın tutar",
    "✦ Mana Hue": "✦ Mana Rengi",
    "One hue of magic burns in you at a time. It paints the light of your skills and casts — roll a new one and the old hue fades away for good.":
      "İçinde aynı anda tek bir büyü rengi yanar. Yeteneklerinin ve büyülerinin ışığını boyar — yeni bir renk zar at, eskisi temelli kaybolur.",
    "No mana hue burns in you yet.": "İçinde henüz bir mana rengi yanmıyor.",
    "worn": "kuşanılmış",
    "No hue": "Renk yok",
    "One hue burns at a time. It repaints the light, trails and particles of your travel skills — rolling a new one fades the old for good.":
      "Aynı anda tek bir renk yanar. Seyahat yeteneklerinin ışığını, izlerini ve parçacıklarını yeniden boyar — yeni bir renk zar atınca eskisi temelli kaybolur.",
    "No hue yet": "Henüz renk yok",
    "roll one to paint your skills": "yeteneklerini boyamak için zar at",
    "effects": "efekti",
    "Roll a new hue": "Yeni bir renk zar at",
    "Roll a mana hue": "Mana rengi zar at",
    "gold": "altın",
    "You need 50 gold. Sell loot or finish an expedition first.":
      "50 altın gerekli. Önce ganimet sat ya da bir sefer tamamla.",

    // ===== Tapınak sekmeleri =====
    "Ascension": "Yükseliş",
    "Ascend": "Yüksel",
    "Forms your current class can ascend into.": "Mevcut sınıfının yükselebileceği formlar.",
    "Mend a Heart": "Bir Kalp Onar",
    "Rebirth": "Yeniden Doğuş",
    "Rebirth of Blood": "Kanın Yeniden Doğuşu",
    "Revive Ally": "Müttefik Dirilt",
    "Offer The Essence of Life to bring a fallen ally back to the fight.":
      "Düşmüş bir müttefiki savaşa geri getirmek için Yaşam Özü sun.",
    "Sacred Rites": "Kutsal Ayinler",
    "The stones hum with a purpose older than the kingdom.":
      "Taşlar, krallıktan daha eski bir amaçla uğulduyor.",
    "No forms": "Form yok",
    "No fallen": "Düşen yok",

    // ===== Bildirim başlıkları =====
    "Purchase": "Satın Alma",
    "Item purchased.": "Eşya satın alındı.",
    "Rite complete!": "Ayin tamamlandı!",
    "Victory": "Zafer",
    "Defeat": "Yenilgi",
    "Warning": "Uyarı",
    "Notice": "Bildirim",

    // ===== Yaygın sunucu mesajları =====
    "The quest has not begun.": "Görev henüz başlamadı.",
    "You are not in a hall.": "Bir salonda değilsin.",
    "You are not seated in this hall.": "Bu salonda oturmuyorsun.",
    "You have already ended this day.": "Bu günü zaten bitirdin.",
    "You have fallen. Seek The Essence of Life at the Ancient Temple to be revived.":
      "Yere düştün. Dirilmek için Antik Tapınak'ta Yaşam Özü'nü ara.",
    "You are already at full health.": "Zaten tam candasın.",
    "You do not own that item.": "Bu eşyaya sahip değilsin.",
    "That cannot be used.": "Bu kullanılamaz.",
    "You are down.": "Yerde yatıyorsun.",
    "Choose a valid class.": "Geçerli bir sınıf seç.",
    "Choose a base class.": "Bir temel sınıf seç.",
    "That class is locked.": "Bu sınıf kilitli.",
    "Complete player setup first.": "Önce oyuncu kurulumunu tamamla.",
    "That skill is not unlocked.": "Bu yetenek açılmamış.",
    "You have no food.": "Yiyeceğin yok.",
    "Finish your battle first.": "Önce savaşını bitir.",
    "You cannot revive while fallen.": "Yerdeyken kimseyi diriltemezsin.",
    "Pick an ally to revive.": "Diriltmek için bir müttefik seç.",
    "That ally is not down.": "O müttefik yerde değil.",
    "That ally is not with you.": "O müttefik seninle değil.",
    "You cannot revive while downed.": "Yerdeyken kimseyi diriltemezsin.",
    "That cannot be equipped.": "Bu kuşanılamaz.",
    "Both ring slots are full.": "İki yüzük yuvası da dolu.",
    "You cannot afford that.": "Bunu karşılayamazsın.",
    "That item is not for sale.": "Bu eşya satılık değil.",
    "Not enough stamina.": "Yeterli dayanıklılık yok.",
    "Not enough gold.": "Yeterli altın yok.",
    "Not enough food.": "Yeterli yiyecek yok.",
    "You are already ready.": "Zaten hazırsın.",
    "Every adventurer must be ready.": "Her maceracı hazır olmalı.",
    "Choose a valid name.": "Geçerli bir isim seç.",

    // ===== Salon / lobi hataları =====
    "Leave your current room before creating another.": "Yeni bir oda kurmadan önce mevcut odadan ayrıl.",
    "Leave your current room before joining another.": "Başka bir odaya katılmadan önce mevcut odadan ayrıl.",
    "That hall no longer exists.": "O salon artık mevcut değil.",
    "This is a private solo quest.": "Bu özel bir tek kişilik görev.",
    "That quest has already begun.": "O görev çoktan başladı.",
    "That hall is full.": "O salon dolu.",
    "No hall matches that code.": "O koda uyan bir salon yok.",
    "Only the host may begin the quest.": "Görevi yalnızca kurucu başlatabilir.",
    "The quest has already begun.": "Görev çoktan başladı.",
    "Choose singleplayer or multiplayer.": "Tek oyunculu ya da çok oyunculu seç.",
    "No session to resume.": "Devam ettirilecek oturum yok.",
    "Room creation is for multiplayer halls.": "Oda kurmak çok oyunculu salonlar içindir.",
    "Joining halls is for multiplayer.": "Salonlara katılmak çok oyunculu içindir.",
    "Finish or leave the delve first.": "Önce inişi bitir ya da terk et.",
    "Finish your current battle first.": "Önce mevcut savaşını bitir.",
    "You are already on an expedition.": "Zaten bir seferdesin.",
    "You are down. Wait for an ally to revive you.": "Yerde yatıyorsun. Bir müttefikin seni diriltmesini bekle.",
    "Unknown dialogue action.": "Bilinmeyen diyalog eylemi.",
    "Choose a tavern game.": "Bir meyhane oyunu seç.",

    // ===== Savaş / sefer / zindan / ticaret hataları =====
    "Cannot reach that ally.": "O müttefike ulaşamıyorsun.",
    "You are not in the waiting room.": "Bekleme odasında değilsin.",
    "Unknown boss.": "Bilinmeyen boss.",
    "That invite has expired.": "Bu davetin süresi doldu.",
    "The old blood is silent.": "Eski kan sessiz.",
    "No such quest.": "Böyle bir görev yok.",
    "Unknown egg.": "Bilinmeyen yumurta.",
    "You don't have that egg.": "O yumurta sende yok.",
    "That expedition no longer exists.": "O sefer artık mevcut değil.",
    "You have no pending invite.": "Bekleyen davetin yok.",
    "Defeat the previous boss first.": "Önce önceki bossu yen.",
    "That skill cannot be found on the tree.": "Bu yetenek ağaçta bulunamıyor.",
    "You don't own that pet.": "O evcil hayvana sahip değilsin.",
    "No party here.": "Burada grup yok.",
    "Unknown pet.": "Bilinmeyen evcil hayvan.",
    "This egg is empty.": "Bu yumurta boş.",
    "That place does not exist.": "O yer mevcut değil.",
    "That place is gone.": "O yer artık yok.",
    "You are not travelling.": "Seyahatte değilsin.",
    "The skill tree is hidden.": "Yetenek ağacı gizli.",
    "Target not found.": "Hedef bulunamadı.",
    "That adventurer is not here.": "O maceracı burada değil.",
    "That expedition has ended.": "O sefer sona erdi.",
    "No active travel map.": "Etkin seyahat haritası yok.",
    "You already learned that skill.": "Bu yeteneği zaten öğrendin.",
    "Only leader can start.": "Yalnızca lider başlatabilir.",
    "You cannot leave while the fight is ongoing.": "Savaş sürerken ayrılamazsın.",
    "Someone entered a battle - invite cancelled.": "Birisi savaşa girdi - davet iptal edildi.",
    "You are already in a boss fight. Leave it first.": "Zaten bir boss savaşındasın. Önce ondan ayrıl.",
    "Target is in battle.": "Hedef savaşta.",
    "Cannot challenge yourself.": "Kendine meydan okuyamazsın.",
    "Fallen players cannot PvP.": "Düşmüş oyuncular PvP yapamaz.",
    "A duel invite is already pending.": "Zaten bekleyen bir düello daveti var.",
    "You are already in this boss fight.": "Zaten bu boss savaşındasın.",
    "Another fight is already running on this boss.": "Bu bossta zaten başka bir savaş sürüyor.",
    "Only the expedition leader can start it.": "Bunu yalnızca sefer lideri başlatabilir.",
    "That expedition is full.": "O sefer dolu.",
    "That expedition is already underway.": "O sefer çoktan başladı.",
    "Someone is already in PvP.": "Birisi zaten PvP'de.",
    "Already in PvP.": "Zaten PvP'desin.",
    "Target already in PvP.": "Hedef zaten PvP'de.",
    "That invite is not yours.": "Bu davet sana ait değil.",
    "That invite is not for you.": "Bu davet sana değil.",
    "Move closer to revive your ally.": "Müttefikini diriltmek için yaklaş.",
    "Too far away.": "Çok uzaktasın.",
    "Only the leader can start.": "Yalnızca lider başlatabilir.",
    "This encounter already started.": "Bu karşılaşma çoktan başladı.",
    "The inn has closed for now.": "Hancı şimdilik kapalı.",
    "This chest is already looted.": "Bu sandık çoktan yağmalandı.",
    "This ruin has nothing left.": "Bu harabede hiçbir şey kalmadı.",
    "You have already taken up this rite.": "Bu ayini zaten üstlendin.",
    "You cannot revive yourself.": "Kendini diriltemezsin.",
    "No PvP in progress.": "Süren bir PvP yok.",
    "No PvP.": "PvP yok.",
    "Unknown skill.": "Bilinmeyen yetenek.",
    "Not your turn.": "Sıra sende değil.",
    "Not enough mana.": "Yeterli mana yok.",
    "Skill already used this turn.": "Bu yetenek bu turda çoktan kullanıldı.",
    "A party member is missing.": "Bir grup üyesi eksik.",
    "A waiting room already exists for this boss.": "Bu boss için zaten bir bekleme odası var.",
    "Boss fights start from the boss pin on the map.": "Boss savaşları haritadaki boss iğnesinden başlar.",
    "Choose a living monster.": "Yaşayan bir canavar seç.",
    "Choose an ally to heal.": "İyileştirmek için bir müttefik seç.",
    "Finish the delve first.": "Önce inişi bitir.",
    "Finish your current game first.": "Önce mevcut oyununu bitir.",
    "Finish your duel first.": "Önce düellonu bitir.",
    "Gather a party first.": "Önce bir grup topla.",
    "Hit or stand.": "Kart çek ya da dur.",
    "It is not your turn.": "Sıra sende değil.",
    "No blackjack hand in play.": "Oynanan bir blackjack eli yok.",
    "No combat in progress.": "Süren bir savaş yok.",
    "Nothing is equipped there.": "Orada kuşanılmış bir şey yok.",
    "Old Vesryn shakes his head: the old blood does not stir in you. This rite is for assassins and mages alone.":
      "Yaşlı Vesryn başını sallıyor: eski kan sende kımıldamıyor. Bu ayin yalnızca suikastçılar ve büyücüler için.",
    "Only the delve leader may start.": "Yalnızca iniş lideri başlatabilir.",
    "Only those of vampire blood may walk this path.": "Bu yolda yalnızca vampir kanı taşıyanlar yürüyebilir.",
    "Opponent down.": "Rakip yerde.",
    "That ascension is not offered to your class.": "Bu yükseliş sınıfına sunulmuyor.",
    "That ascension is not written in the temple.": "Bu yükseliş tapınakta yazılı değil.",
    "That delve has already started.": "O iniş çoktan başladı.",
    "That is not a chest.": "Bu bir sandık değil.",
    "That is not a known rite.": "Bu bilinen bir ayin değil.",
    "That party is full.": "O grup dolu.",
    "That party is no longer joinable.": "O gruba artık katılınamaz.",
    "That party no longer exists.": "O grup artık mevcut değil.",
    "That skill is not part of your class path.": "Bu yetenek sınıfının yolunun parçası değil.",
    "That skill is spent for this turn.": "Bu yetenek bu tur için harcandı.",
    "The merchant does not want that.": "Tüccar bunu istemiyor.",
    "The merchant doesn't have that today.": "Tüccarda bugün o yok.",
    "The merchant has no such wares.": "Tüccarda böyle mallar yok.",
    "The merchant needs more gold and wood.": "Tüccarın daha fazla altın ve oduna ihtiyacı var.",
    "The monsters are acting.": "Canavarlar hareket ediyor.",
    "The smith doesn't have that today.": "Demircide bugün o yok.",
    "The smith has no such wares.": "Demircide böyle mallar yok.",
    "The smith needs more gold and wood.": "Demircinin daha fazla altın ve oduna ihtiyacı var.",
    "The temple needs more gold and wood.": "Tapınağın daha fazla altın ve oduna ihtiyacı var.",
    "Unequip it first.": "Önce onu çıkar.",
    "Unknown class.": "Bilinmeyen sınıf.",
    "Unknown consumable.": "Bilinmeyen tüketilebilir.",
    "Unknown dungeon or size.": "Bilinmeyen zindan ya da boyut.",
    "Unknown item.": "Bilinmeyen eşya.",
    "You already know that skill.": "Bu yeteneği zaten biliyorsun.",
    "You are already in a party. Leave first.": "Zaten bir gruptasın. Önce ayrıl.",
    "You are already in that party.": "Zaten o gruptasın.",
    "You are too injured to flee!": "Kaçamayacak kadar yaralısın!",
    "You cannot flee while monsters are acting.": "Canavarlar hareket ederken kaçamazsın.",
    "You do not have that chest.": "O sandık sende yok.",
    "You do not have that item.": "O eşya sende yok.",
    "You do not have that.": "Sende o yok.",
    "You have rested enough today.": "Bugün yeterince dinlendin.",
    "You lack the materials for this rite.": "Bu ayin için malzemelerin eksik.",
    "You need The Essence of Life to revive.": "Dirilmek için Yaşam Özü'ne ihtiyacın var.",
    "Your class has no ascension.": "Sınıfının bir yükselişi yok.",
    "Your hearts are already full.": "Kalplerin zaten dolu.",
    "You have fallen. Must be revived.": "Yere düştün. Diriltilmen gerek.",

    // ===== İstemci bildirimleri (toast) =====
    "💤 You slept. Stamina returns at dawn.": "💤 Uyudun. Dayanıklılık şafakta geri döner.",
    "💀 You have fallen. Seek The Essence of Life at the Ancient Temple.":
      "💀 Yere düştün. Dirilmek için Antik Tapınak'ta Yaşam Özü'nü ara.",
    "The hall refuses that action.": "Salon bu eylemi reddediyor.",
    "You have fallen. Return to the temple to be revived.": "Yere düştün. Dirilmek için tapınağa dön.",
    "You lost 1 heart. You wake up back in town.": "1 kalp kaybettin. Kasabada uyanıyorsun.",
    "Secret class password saved.": "Gizli sınıf şifresi kaydedildi.",
    "Secret class password cleared.": "Gizli sınıf şifresi temizlendi.",
    "You were revived!": "Diriltildin!",
    "Rite complete! Old Vesryn will know you now.": "Ayin tamamlandı! Yaşlı Vesryn artık seni tanıyacak.",

    // ===== Savaş / yetenek / sefer arayüzü =====
    "A Moment's Respite": "Bir Anlık Huzur",
    "A new blood stirs within you.": "İçinde yeni bir kan kıpırdanıyor.",
    "A new day dawns. Stamina is restored.": "Yeni bir gün doğuyor. Dayanıklılık yenilendi.",
    "All loot revealed!": "Tüm ganimet açığa çıktı!",
    "Also hits": "Ayrıca vurur",
    "Ancient Temple services": "Antik Tapınak hizmetleri",
    "Back in town.": "Kasabadasın.",
    "Basic Attack": "Temel Saldırı",
    "Boosts your defense for 2 turns.": "Savunmanı 2 tur boyunca artırır.",
    "Boosts your magic power for 2 turns.": "Büyü gücünü 2 tur boyunca artırır.",
    "Breaking Lock...": "Kilit Kırılıyor...",
    "Challenge to duel": "Düelloya davet et",
    "Chests Opened": "Açılan Sandıklar",
    "Choose a target.": "Bir hedef seç.",
    "Claim Loot & Close": "Ganimeti Al ve Kapat",
    "Click Chest to Unlock": "Açmak için sandığa tıkla",
    "Click the skill again to use it.": "Kullanmak için yeteneğe tekrar tıkla.",
    "Click to equip": "Kuşanmak için tıkla",
    "Click to learn": "Öğrenmek için tıkla",
    "Combos & Synergies": "Kombolar ve Sinerjiler",
    "Crit Dmg": "Kritik Hasar",
    "DEALER WINS": "KRUPİYE KAZANDI",
    "Deals damage to a random enemy.": "Rastgele bir düşmana hasar verir.",
    "Empty slot": "Boş yuva",
    "Equipped — click to unequip": "Kuşanılmış — çıkarmak için tıkla",
    "Executes the target": "Hedefi infaz eder",
    "Expedition report": "Sefer raporu",
    "Experience Gained": "Kazanılan Deneyim",
    "Fights with random tricks: heals, shields, weakens or bites.":
      "Rastgele oyunlarla savaşır: iyileştirir, kalkan kurar, zayıflatır ya da ısırır.",
    "Freezes a random enemy, stalling its turn.": "Rastgele bir düşmanı dondurup turunu geciktirir.",
    "Generating world...": "Dünya oluşturuluyor...",
    "Global Skills": "Genel Yetenekler",
    "Gold Earned": "Kazanılan Altın",
    "Hatch failed": "Kuluçka başarısız",
    "Hits ALL enemies": "TÜM düşmanlara vurur",
    "Kneel and bind the cruor (become Gloomspawn).": "Diz çök ve cruor'u bağla (Gloomspawn ol).",
    "Kneel and embrace the thirst (become Bloodspawn).": "Diz çök ve açlığı kucakla (Bloodspawn ol).",
    "Leave party and back to list": "Gruptan ayrıl ve listeye dön",
    "Locked — gain skill points to unlock.": "Kilitli — açmak için yetenek puanı kazan.",
    "Magic Buffer": "Büyü Kalkanı",
    "Mana hue": "Mana rengi",
    "Max HP": "Maks HP",
    "Merchant of Setra Village": "Setra Köyü Tüccarı",
    "Merchant wares": "Tüccar malları",
    "Monsters Slain": "Öldürülen Canavarlar",
    "Mystery Pet": "Gizemli Evcil Hayvan",
    "No data": "Veri yok",
    "No open halls. Found one, and others may join.": "Açık salon yok. Bir tane kur, başkaları katılabilir.",
    "No rests left today. Sleep to end the day.": "Bugün dinlenme hakkın kalmadı. Günü bitirmek için uyu.",
    "Not enough gold to roll a mana hue.": "Mana rengi zar atmak için yeterli altın yok.",
    "Not enough items.": "Yeterli eşya yok.",
    "Opening room...": "Oda açılıyor...",
    "Pet Atk+": "Evcil Sld+",
    "Pet Def+": "Evcil Dir+",
    "Pet Mgc+": "Evcil Büy+",
    "Pet Weak": "Evcil Zayıf",
    "Raises shields that absorb incoming damage.": "Gelen hasarı emen kalkanlar kurar.",
    "Requires Vesryn's rite": "Vesryn'in ayini gerekir",
    "Requires vampire blood": "Vampir kanı gerektirir",
    "Rerolling a mana hue costs 50 gold.": "Mana rengini yeniden zar atmak 50 altın tutar.",
    "Reset view": "Görünümü sıfırla",
    "Restores your HP during battle.": "Savaş sırasında canını yeniler.",
    "Royal Chest": "Kraliyet Sandığı",
    "Soaks a random enemy to set up water combos.": "Su komboları kurmak için rastgele bir düşmanı ıslatır.",
    "Sold out": "Tükendi",
    "Start expedition": "Seferi başlat",
    "Strikes a random foe with its own Attack": "Rastgele bir düşmana kendi Saldırısıyla vurur",
    "Take up the rite of blood (physical path).": "Kan ayinini üstlen (fiziksel yol).",
    "Take up the rite of gloom (magic path).": "Kasvet ayinini üstlen (büyü yolu).",
    "The chest was empty...": "Sandık boştu...",
    "The monsters are acting...": "Canavarlar hareket ediyor...",
    "Time Afield": "Dışarıda Geçen Süre",
    "Too injured to flee!": "Kaçamayacak kadar yaralısın!",
    "Trying to reach the server... (may take a few seconds if waking)":
      "Sunucuya ulaşılmaya çalışılıyor... (uyanıyorsa birkaç saniye sürebilir)",
    "Unknown error": "Bilinmeyen hata",
    "Unlock Chest ➔": "Sandığı Aç ➔",
    "Usable below": "Şunun altında kullanılır:",
    "Usable every": "Her şu kadar kullanılır:",
    "Uses random tricks (heal, shield, weaken or bite), every few turns":
      "Rastgele oyunlar kullanır (iyileştirme, kalkan, zayıflatma ya da ısırma), birkaç turda bir",
    "Wager amount": "Bahis miktarı",
    "Waking the server... a few seconds, the game will connect.":
      "Sunucu uyandırılıyor... birkaç saniye, oyun bağlanacak.",
    "Weakens a random enemy so its hits land softer.": "Rastgele bir düşmanı zayıflatır, vuruşları daha hafif iner.",
    "YOU WIN": "KAZANDIN",
    "You Died": "Öldün",
    "You Lose": "Kaybettin",
    "You Win!": "Kazandın!",
    "You are down — wait to be revived.": "Yerde yatıyorsun — diriltilmeyi bekle.",
    "You are in a party — leave to browse other parties.": "Bir gruptasın — diğer gruplara bakmak için ayrıl.",
    "You are reborn in the flesh of": "Şunun bedeninde yeniden doğuyorsun:",
    "You catch your breath — your strength returns.": "Nefesini topluyorsun — gücün geri dönüyor.",
    "You have ascended!": "Yükseldin!",
    "You have fallen — cannot create parties.": "Yere düştün — grup kuramazsın.",
    "You have fallen. Seek The Essence of Life at the Ancient Temple.":
      "Yere düştün. Antik Tapınak'ta Yaşam Özü'nü ara.",
    "You rest": "Dinleniyorsun",
    "You revived your ally!": "Müttefikini dirilttin!",
    "You sleep beneath the cold stars. Stamina returns at dawn.":
      "Soğuk yıldızların altında uyuyorsun. Dayanıklılık şafakta geri döner.",
    "You sleep safely at the tavern. Stamina returns at dawn.":
      "Meyhanede güvenle uyuyorsun. Dayanıklılık şafakta geri döner.",
    "You slept through the night. Stamina is restored.": "Gece boyunca uyudun. Dayanıklılık yenilendi.",
    "You will become the leader. Only the leader can start the delve.":
      "Lider sen olacaksın. İnişi yalnızca lider başlatabilir.",
    "Your legend ends here. Returning to menu...": "Efsanen burada sona eriyor. Menüye dönülüyor...",
    "Your turn — choose an action.": "Sıra sende — bir eylem seç.",
    "Zoom in": "Yakınlaştır",
    "Zoom out": "Uzaklaştır",
    "You need at least 10 stamina. Rest at the tavern or sleep to recover it.":
      "En az 10 dayanıklılığa ihtiyacın var. Geri kazanmak için meyhanede dinlen ya da uyu.",
    "You have transcended into": "Şuna yükseldin:",
    "Set Forth": "Yola Çık",
    "Form party at": "Grup kur:",
    "Rest at": "Dinlen:",
    "Slot full — empty it or pick another slot.": "Yuva dolu — boşalt ya da başka bir yuva seç.",
    "Kills targets dropped to": "Canı şuna düşen hedefleri öldürür:",
    "Not enough skill points (": "Yeterli yetenek puanı yok (",
    "GILDED ROYAL CHEST": "Yaldızlı Kraliyet Sandığı",
    "☰ Menu": "☰ Menü",
    "✦ Skill Tree": "✦ Yetenek Ağacı",
    "📖 Guide": "📖 Rehber",
    "📜 Quests": "📜 Görevler",
    "🗺️ Map": "🗺️ Harita",
    // ===== Skill tooltip: element etiketleri (tek sözcük düğümler) =====
    "Physical": "Fiziksel",
    "Fire": "Ateş",
    "Frost": "Buz",
    "Poison": "Zehir",
    "Arcane": "Gizem",
    "Lightning": "Yıldırım",
    "Holy": "Kutsal",
    "Shadow": "Gölge",
    "Blood": "Kan",
    "Nature": "Doğa",
    "Water": "Su",
    "Earth": "Toprak",
    "Dark": "Karanlık",
  };

  // Diyalog sözlüğü (public/js/i18n.dialog.js) bu dosyadan önce yüklenir;
  // varsa ana sözlüğe birleştir (mevcut anahtarların üzerine yazmaz).
  if (typeof window !== "undefined" && window.SetraI18nDialogTR) {
    const extra = window.SetraI18nDialogTR;
    for (const k in extra) {
      if (Object.prototype.hasOwnProperty.call(extra, k) && TR[k] == null) TR[k] = extra[k];
    }
  }

  // Bileşik (değişkenli) metinler için desenler.
  const TR_PATTERNS = [
    [/^Lv (\d+)$/, "Sv $1"],
    [/^Level (\d+)$/, "Seviye $1"],
    [/^HEALING\s*(\d+)$/i, "ŞİFA $1"],
    [/^(\d+) items?$/i, "$1 eşya"],
    [/^(\d+) players?$/i, "$1 oyuncu"],
    [/^Player (\d+)$/i, "Oyuncu $1"],
    [/^Code:\s*(.+)$/i, "Kod: $1"],
    [/^Day (\d+)$/i, "Gün $1"],
    [/^(.+?) · Lv (\d+)( ·)?$/, "$1 · Sv $2$3"],
    [/^Gold (\d+)$/, "$1 Altın"],
    [/^Wood (\d+)$/, "$1 Odun"],
    [/^Food (\d+)$/, "$1 Yiyecek"],
    [/^Atk (\d+)$/, "Sld $1"],
    [/^Res (\d+)$/, "Dir $1"],
    [/^Mgc (\d+)$/, "Büy $1"],
    [/^Heal (\d+)$/, "Şifa $1"],
    [/^Regen (\d+)$/, "Yenilenme $1"],
    [/^Crit (\d+)%$/, "Kritik %$1"],
    [/^Crit Dmg \+(\d+)%$/, "Kritik Hasar +%$1"],
    [/^(\d+)\/(\d+) slain · (\d+)\/(\d+) cruor$/i, "$1/$2 öldürüldü · $3/$4 cruor"],
    [/^(.+) · worn$/i, "$1 · kuşanılmış"],
    [/^Rolling costs 50 gold · You have ([\d.,]+) gold$/i, "Zar atmak 50 altın tutar · Elinde $1 altın var"],
    [/^Roll a new hue \(50g\)(.*)$/i, "Yeni bir renk zar at (50 altın)$1"],
    [/^(\d+) forms?$/i, "$1 form"],
    [/^(\d+) hearts?$/i, "$1 kalp"],
    [/^(\d+) gold$/i, "$1 altın"],
    [/^(\d+) food$/i, "$1 yiyecek"],
    [/^Name must be (\d+)[–-](\d+) characters\.$/i, "İsim $1–$2 karakter olmalı."],
    [/^Travel costs (\d+) stamina\.$/i, "Seyahat $1 dayanıklılık tutar."],
    [/^You can equip max (\d+) pets\. Unequip one first\.$/i, "En fazla $1 evcil hayvan kuşanabilirsin. Önce birini çıkar."],
    [/^(.+) has already ended the day\.$/i, "$1 günü zaten bitirdi."],
    [/^(.+) is not fallen\.$/i, "$1 yere düşmüş değil."],
    [/^(.+) is fallen\.$/i, "$1 yere düştü."],
    [/^(.+) needs (\d+) stamina\.$/i, "$1 için $2 dayanıklılık gerek."],
    [/^A warm bed costs (\d+) gold\. Sleep outside instead\.$/i, "Sıcak bir yatak $1 altın tutar. Onun yerine dışarıda uyu."],
    [/^An Origin Stone costs (\d+) gold\.$/i, "Bir Origin Stone $1 altın tutar."],
    [/^Choose a wager of (.+) gold\.$/i, "$1 altın bahis seç."],
    [/^You must reach level (\d+) to ascend\.$/i, "Yükselmek için $1. seviyeye ulaşmalısın."],
    [/^You need a (.+) to mend a heart\.$/i, "Bir kalbi onarmak için $1 gerek."],
    [/^You need (.+) to be reborn\.$/i, "Yeniden doğmak için $1 gerek."],
    [/^You need (.+) to ascend\.$/i, "Yükselmek için $1 gerek."],
    [/^That skill needs (\d+) more round\(s\)\.$/i, "Bu yetenek $1 tur daha bekliyor."],
    [/^Requires: (.+)\.$/i, "Gereksinim: $1."],
    [/^Execute fells only the weak - target must be below (\d+)% HP\.$/i, "İnfaz yalnızca zayıfları devirir - hedef %$1 canın altında olmalı."],
    [/^Rite: (\d+)\/(\d+) slain · (\d+)\/(\d+) cruor$/i, "Ayin: $1/$2 öldürüldü · $3/$4 cruor"],
    [/^(.+) revived you!$/i, "$1 seni diriltti!"],
    [/^(.+) used — (.+)\.$/i, "$1 kullanıldı — $2."],
    [/^(.+) used\.$/i, "$1 kullanıldı."],
    [/^Mana hue: (.+) \((.+)\) — the old hue fades\.$/i, "Mana rengi: $1 ($2) — eski renk kayboldu."],
    [/^Atk \+(\d+) · Crit \+(\d+)$/, "Sld +$1 · Kritik +$2"],
    [/^Boosts your defense \+(\d+)% for (\d+) turns$/i, "Savunmanı $2 tur boyunca +%$1 artırır"],
    [/^Boosts your magic \+(\d+)% for (\d+) turns$/i, "Büyü gücünü $2 tur boyunca +%$1 artırır"],
    [/^Usable below (\d+)% HP — executes$/i, "Canı %$1 altındayken kullanılır — infaz eder"],
    [/^Kills targets dropped to (\d+)% HP or less$/i, "Canı %$1 veya altına düşen hedefleri öldürür"],
    [/^Usable every (\d+) rounds?$/i, "Her $1 turda kullanılabilir"],
    [/^Rest at (.+)$/i, "Şurada dinlen: $1"],
    [/^Form party at (.+)$/i, "Şurada grup kur: $1"],
    [/^Not enough skill points \((\d+) needed\)\.$/i, "Yeterli yetenek puanı yok ($1 gerekli)."],
    [/^Your rite: (\d+)\/(\d+) slain · (\d+)\/(\d+) cruor( · COMPLETE)?( ·)?$/i, "Ayinin: $1/$2 öldürüldü · $3/$4 cruor$5$6"],

    // --- Hasar / iyileştirme şablonları ---
    [/^Deals (\d+) \+ ([\d.]+)\s*[x×]\s*(attack|magic) damage\. Heals for half the damage dealt\.$/i, "$1 + $2× $3 hasarı verir. Verilen hasarın yarısı kadar iyileştirir."],
    [/^Deals (\d+) \+ ([\d.]+)\s*[x×]\s*(attack|magic) damage\. Heals for (\d+)% of the damage dealt\.$/i, "$1 + $2× $3 hasarı verir. Verilen hasarın %$4'ü kadar iyileştirir."],
    [/^Deals (\d+) \+ ([\d.]+)\s*[x×]\s*(attack|magic) damage\. Heals you for (\d+)% of the damage dealt\.$/i, "$1 + $2× $3 hasarı verir. Verilen hasarın %$4'ü kadar seni iyileştirir."],
    [/^Deals (\d+) \+ ([\d.]+)\s*[x×]\s*(attack|magic) damage\. Restores (\d+)% of your max HP\.$/i, "$1 + $2× $3 hasarı verir. Maks. canının %$4'ünü geri yükler."],
    [/^Deals (\d+) \+ ([\d.]+)\s*[x×]\s*(attack|magic) TRUE damage\. Exact — ignores all reductions\.$/i, "$1 + $2× $3 GERÇEK hasarı verir. Kesin — tüm azaltmaları yok sayar."],
    [/^Deals (\d+) \+ ([\d.]+)\s*[x×]\s*(attack|magic) damage\.$/i, "$1 + $2× $3 hasarı verir."],
    [/^Deals (\d+) \+ ([\d.]+)\s*[x×]\s*(attack|magic) damage\. (.+)$/i, "$1 + $2× $3 hasarı verir. $4"],
    [/^Restore (\d+)% of an ally's max HP\.$/i, "Bir dostun maks. canının %$1'ini geri yükler."],
    [/^Restore (\d+)% of each ally's max HP and (\d+)% of their max mana with first blood\.$/i, "İlk kanla her dostun maks. canının %$1'ini ve maks. manasının %$2'sini geri yükler."],
    [/^Restore (\d+)% of each ally's max HP and (\d+)% of their max mana\.$/i, "Her dostun maks. canının %$1'ini ve maks. manasının %$2'sini geri yükler."],
    [/^Restore (\d+)% of each ally's max HP\.$/i, "Her dostun maks. canının %$1'ini geri yükler."],
    [/^Restore (\d+)% of each ally's max mana\.$/i, "Her dostun maks. manasının %$1'ini geri yükler."],
    [/^Block (\d+)% of incoming damage this round\.$/i, "Bu tur gelen hasarın %$1'ini engeller."],
    [/^Block (\d+)% of incoming damage for 2 rounds\.$/i, "2 tur boyunca gelen hasarın %$1'ini engeller."],
    [/^Block 40% of incoming damage for 2 rounds\. The whole party\.$/i, "2 tur boyunca gelen hasarın %40'ını engeller. Tüm grup."],
    [/^Heals ([\d.]+)× attack power\. Scales with healPower\.$/i, "Saldırı gücünün $1 katı iyileştirir. İyileştirme gücüyle ölçeklenir."],
    [/^Heals ([\d.]+)× magicPower\. Scales with healPower\.$/i, "Büyü gücünün $1 katı iyileştirir. İyileştirme gücüyle ölçeklenir."],
    [/^Heals (\d+)% max HP every 2 turns\.$/i, "Her 2 turda maks. canın %$1'ini iyileştirir."],
    [/^Small heal every turn\.$/i, "Her tur küçük bir iyileştirme."],
    [/^(\d+) shield every 3 turns \(1 turn\)\.$/i, "Her 3 turda $1 kalkan (1 tur)."],
    [/^Freeze the foe every 3 turns\.$/i, "Her 3 turda düşmanı dondurur."],
    [/^Fast lightning attack every turn\.$/i, "Her tur hızlı yıldırım saldırısı."],
    [/^Weaken the foe every 2 turns\.$/i, "Her 2 turda düşmanı zayıflatır."],
    [/^Heavy weaken every 3 turns\.$/i, "Her 3 turda ağır zayıflatma."],
    [/^Fire attack every 2 turns\.$/i, "Her 2 turda ateş saldırısı."],

    // --- Pasif / buff şablonları ---
    [/^\+(\d+)% damage\.$/i, "+%$1 hasar."],
    [/^\+(\d+)% damage vs targets above (\d+)% HP\.$/i, "%$2 üzeri canlı hedeflere +%$1 hasar."],
    [/^\+(\d+)% damage vs targets below (\d+)% HP\.$/i, "%$2 altı canlı hedeflere +%$1 hasar."],
    [/^Take (\d+)% less damage \(true damage excluded\)\.$/i, "Alınan hasar %$1 azalır (gerçek hasar hariç)."],
    [/^Start combat with a shield equal to (\d+)% max HP \((\d+) turns\)\.$/i, "Savaşa maks. canın %$1'i kadar kalkanla başla ($2 tur)."],
    [/^Reflect (\d+)% of damage taken\.$/i, "Alınan hasarın %$1'ini yansıtır."],
    [/^Heal (\d+)% of all damage dealt\.$/i, "Verilen tüm hasarın %$1'ini iyileştirir."],
    [/^Heal for (\d+)% of all damage dealt\.$/i, "Verilen tüm hasarın %$1'i kadar iyileştirir."],
    [/^\+(\d+)% (healing|regeneration)\.$/i, "+%$1 $2."],
    [/^\+(\d+)% XP from victories\.$/i, "Zaferlerden +%$1 tecrübe."],
    [/^\+(\d+)% gold from victories\.$/i, "Zaferlerden +%$1 altın."],
    [/^\+(\d+) speed\.$/i, "+$1 hız."],
    [/^\+(\d+) mana regen per round\.$/i, "Tur başına +$1 mana yenilenmesi."],
    [/^\+(\d+) mana, \+(\d+) speed\.$/i, "+$1 mana, +$2 hız."],
    [/^\+(\d+) max HP, \+(\d+) resistance\.$/i, "+$1 maks. can, +$2 direnç."],
    [/^\+(\d+) attack\.$/i, "+$1 saldırı."],
    [/^\+(\d+) speed, \+(\d+) attack\.$/i, "+$1 hız, +$2 saldırı."],
    [/^\+(\d+) magic power\.$/i, "+$1 büyü gücü."],
    [/^(\d+)% chance to dodge attacks\.$/i, "Saldırılardan %$1 kaçınma şansı."],
    [/^Your hits execute targets at or below (\d+)% HP\.$/i, "Vuruşların %$1 ve altı canlı hedefleri infaz eder."],
    [/^Survive lethal damage once per combat at 1 HP\.$/i, "Savaşta bir kez ölümcül hasarı 1 canla atlatırsın."],
    [/^Shots pierce flat resistance\.$/i, "Oklar sabit direnci deler."],
    [/^Excess killing damage crashes into another foe\.$/i, "Fazla öldürme hasarı başka bir düşmana taşar."],
    [/^Regain (\d+) mana on kill\.$/i, "Öldürmede $1 mana kazanırsın."],
    [/^(\d+)% chance to strike again for (\d+)% damage\.$/i, "%$1 şansla %$2 hasarla tekrar vurursun."],
    [/^Hits burn (\d+)% of target max HP as exact damage \(max (\d+)\)\.$/i, "Vuruşlar hedefin maks. canının %$1'ini kesin hasar olarak yakar (en fazla $2)."],
    [/^Gain (\d+) shield for 2 rounds\.$/i, "2 tur boyunca $1 kalkan kazanır."],
    [/^All allies gain (\d+) shield for 2 rounds\.$/i, "Tüm dostlar 2 tur boyunca $1 kalkan kazanır."],
    [/^Gain (\d+) shield and (\d+)% damage reduction\.$/i, "$1 kalkan ve %$2 hasar azaltma kazanır."],
    [/^Give an ally (\d+) shield for 2 rounds\.$/i, "Bir dosta 2 tur boyunca $1 kalkan verir."],
    [/^Gain (\d+) shield and weaken attacker (\d+)%\.$/i, "$1 kalkan kazanır ve saldıranı %$2 zayıflatır."],
    [/^Takes (\d+)% more (holy|shadow) damage\.$/i, "Alınan $2 hasarı %$1 artar."],
    [/^Increase your damage by (\d+)% for 2 rounds\.$/i, "2 tur boyunca hasarını %$1 artırır."],
    [/^The whole party blocks (\d+)% of incoming damage for 2 rounds\.$/i, "Tüm grup 2 tur boyunca gelen hasarın %$1'ini engeller."],
    [/^An ally regains (\d+)% of max HP each round for 3 rounds\.$/i, "Bir dost 3 tur boyunca her tur maks. canının %$1'ini geri kazanır."],
    [/^Slam the ground with your whole weight: (\d+)% of your max HP as damage\.$/i, "Tüm ağırlığınla yere vur: maks. canının %$1'i kadar hasar."],
    [/^Crash down like a mountain: (\d+)% of your max HP as damage\.$/i, "Bir dağ gibi çök: maks. canının %$1'i kadar hasar."],
    [/^A monster deals (\d+)% less damage and takes (\d+)% more for 2 rounds\.$/i, "Bir canavar 2 tur boyunca %$1 az hasar verir ve %$2 fazla hasar alır."],
    [/^The monster deals (\d+)% more damage for 2 rounds\.$/i, "Canavar 2 tur boyunca %$1 fazla hasar verir."],
    [/^The monster blocks (\d+)% of damage for 2 rounds\.$/i, "Canavar 2 tur boyunca hasarın %$1'ini engeller."],
    [/^The monster heals (\d+)% of max HP each round for 3 rounds\.$/i, "Canavar 3 tur boyunca her tur maks. canının %$1'ini iyileştirir."],
    [/^The monster restores (\d+)% of max HP\.$/i, "Canavar maks. canının %$1'ini geri yükler."],
    [/^A hero deals (\d+)% less damage for 2 rounds\.$/i, "Bir kahraman 2 tur boyunca %$1 az hasar verir."],
    [/^A hero takes (\d+)% more damage for 2 rounds\.$/i, "Bir kahraman 2 tur boyunca %$1 fazla hasar alır."],
    [/^A hero takes damage each round for 3 rounds\.$/i, "Bir kahraman 3 tur boyunca her tur hasar alır."],
    [/^Monsters \+(\d+)% HP, but victories grant \+(\d+)% XP\.$/i, "Canavarlar +%$1 can, ama zaferler +%$2 tecrübe verir."],
    [/^\+(\d+)% gold and wood from dungeon victories\.$/i, "Zindan zaferlerinden +%$1 altın ve odun."],
    [/^\+(\d+)% XP from dungeon victories\.$/i, "Zindan zaferlerinden +%$1 tecrübe."],
    [/^\+(\d+)% crit chance for heroes in dungeons\.$/i, "Zindanlardaki kahramanlara +%$1 kritik şansı."],
    [/^A quiet day\. No omens stir\.$/i, "Sakin bir gün. Hiçbir işaret kımıldamıyor."],
    [/^Pure demon royalty\. \+(\d+)% damage and \+(\d+)% lifesteal\.$/i, "Saf şeytan asaleti. +%$1 hasar ve +%$2 can çalma."],
    [/^Lace your weapon with venom\.$/i, "Silahını zehirle."],

    // --- Hasar cümlesi kuyrukları ("Deals ... damage." sonrası) ---
    [/^Exact [-—–] ignores all reductions\.$/i, "Kesin — tüm azaltmaları yok sayar."],
    [/^Exposed targets take \+(\d+)%\.$/i, "İfşa olmuş hedefler +%$1 alır."],
    [/^Weakened targets take \+(\d+)%\.$/i, "Zayıflamış hedefler +%$1 alır."],
    [/^Poisoned targets take \+(\d+)%\.$/i, "Zehirli hedefler +%$1 alır."],
    [/^Burning targets take \+(\d+)%\.$/i, "Yanan hedefler +%$1 alır."],
    [/^Frozen targets take \+(\d+)%\.$/i, "Donmuş hedefler +%$1 alır."],
    [/^Wet targets take \+(\d+)%\.$/i, "Islak hedefler +%$1 alır."],
    [/^\+(\d+)% vs wet \(Overcharge\)\.$/i, "Islağa karşı +%$1 (Aşırı Yükleme)."],
    [/^Foe takes (\d+)% more, deals (\d+)% less \((\d+) rounds\)\.$/i, "Düşman %$1 fazla alır, %$2 az verir ($3 tur)."],
    [/^Heals for half the damage dealt\.$/i, "Verilen hasarın yarısı kadar iyileştirir."],
    [/^Heals for (\d+)% of the damage dealt\.$/i, "Verilen hasarın %$1'i kadar iyileştirir."],
    [/^Heals you for (\d+)% of the damage dealt\.$/i, "Verilen hasarın %$1'ü kadar seni iyileştirir."],
    [/^Restores (\d+)% of your max HP\.$/i, "Maks. canının %$1'ini geri yükler."],
    [/^Poisons the foe\.$/i, "Düşmanı zehirler."],
    [/^Poisons the monster for (\d+) rounds\.$/i, "Canavarı $1 tur zehirler."],
    [/^Soaks the target for (\d+) turns \(wet\)\.$/i, "Hedefi $1 tur ıslatır (ıslak)."],
    [/^Freezes the target for (\d+) rounds?\.$/i, "Hedefi $1 tur dondurur."],
    [/^Leaves the foe burning\.$/i, "Düşmanı yanar halde bırakır."],
    [/^Sets the foe burning\.$/i, "Düşmanı tutuşturur."],
    [/^May freeze the target\.$/i, "Hedefi dondurabilir."],
    [/^Electrifies the target\.$/i, "Hedefi elektriklendirir."],
    [/^Your companion tears into the foe\.$/i, "Yoldaşın düşmana saldırır."],

    // --- Envanter / mağaza ---
    [/^Sell \+(\d+)g$/i, "Sat +$1a"],
    [/^All \+(\d+)g$/i, "Tümü +$1a"],
    [/^Sell to merchant: \+(\d+) gold$/i, "Tüccara sat: +$1 altın"],
    [/^Sell all: \+(\d+) gold$/i, "Tümünü sat: +$1 altın"],
  ];

  // ---- Skill tooltip'in DİNAMİK satırları ---------------------------------
  // Bu metinler çalışma anında birleştirildiği için sözlükte birebir yok.
  // Yalnızca tanınan biçimler çevrilir (emoji işaretli satırlar, mana/hedef
  // meta satırı, mekanik cümleleri); başka hiçbir metne dokunulmaz.
  const SK_ELEM = {
    Physical: "Fiziksel", Fire: "Ateş", Frost: "Buz", Poison: "Zehir",
    Arcane: "Gizem", Lightning: "Yıldırım", Holy: "Kutsal", Shadow: "Gölge",
    Blood: "Kan", Nature: "Doğa", Water: "Su", Earth: "Toprak", Dark: "Karanlık",
  };
  const SK_STAT = { Attack: "Saldırı", Magic: "Büyü", Heal: "Şifa", "Max HP": "Maks. Can" };
  const SK_MARK = /^(?:⚔|💚|🩸|🛡|🔷|✨|💀|☠|💧|❄|⛰)/;

  function skWords(s) {
    return String(s)
      .replace(/target Max HP/g, "hedefin Maks. Canı")
      .replace(/target current HP/g, "hedefin mevcut Canı")
      .replace(/Max HP/g, "Maks. Can")
      .replace(/magicPower/g, "Büyü")
      .replace(/\b(Physical|Fire|Frost|Poison|Arcane|Lightning|Holy|Shadow|Blood|Nature|Water|Earth|Dark)\b/g,
        (m, w) => SK_ELEM[w] || m)
      .replace(/\b(Attack|Magic|Heal)\b/g, (m, w) => SK_STAT[w] || m);
  }
  function skDur(d) {
    return /^until match end$/i.test(d) ? "maç sonuna kadar" : String(d).replace(/^(\d+)r$/, "$1 tur");
  }
  function skBurst(b) {
    const s = String(b);
    let m = /^(\d+) heal$/.exec(s);
    if (m) return m[1] + " iyileştirme";
    m = /^(\d+) shield$/.exec(s);
    if (m) return m[1] + " kalkan";
    if (s === "exact damage") return "tam hasar";
    m = /^([\d.]+)× burst$/.exec(s);
    if (m) return m[1] + "× patlama";
    return s;
  }
  // "12 mana · → enemy · ⏳ every 3 rounds" ya da tek parça ("Free").
  function skMeta(text) {
    return String(text).split(" · ").map((raw) => {
      const s = raw.trim();
      let m;
      if (s === "Free") return "Ücretsiz";
      if (/^\d+ mana$/.test(s)) return s;
      if (s === "→ enemy") return "→ düşman";
      if (s === "→ ally") return "→ müttefik";
      if (s === "→ whole party") return "→ tüm grup";
      if (s === "→ self") return "→ kendin";
      m = /^⏳ every (\d+) rounds?$/.exec(s);
      if (m) return "⏳ her " + m[1] + " turda";
      return s;
    }).join(" · ");
  }
  // Emoji işaretli tek satır (hasar / şifa / buff / yığın).
  function skLine(t) {
    let s = skWords(t);
    let m;
    if (s.charAt(0) === "⚔") {
      return s.replace(/\bdamage\b/g, "hasar").replace(/\bexact\b/g, "tam").replace(/\bas\b/g, "olarak");
    }
    m = /^💚 Heals (.+)$/.exec(s);
    if (m) return "💚 İyileştirir: " + m[1];
    m = /^💚 Restores (.+)$/.exec(s);
    if (m) {
      let v = m[1];
      const p = /^(\d+(?:\.\d+)?)% of (Maks\. Can|hedefin Maks\. Canı|hedefin mevcut Canı)$/.exec(v);
      if (p) {
        const gen = /[ıiuü]$/.test(p[2]) ? "'nın" : "'ın";
        return "💚 " + p[2] + gen + " %" + p[1] + " kadarı geri yüklenir";
      }
      return "💚 Geri yükler: " + v.replace(/\bmax\b/g, "maks");
    }
    m = /^💚 \+(\d+)% self heal on hit$/.exec(s);
    if (m) return "💚 Vuruşta +%" + m[1] + " kendini iyileştirme";
    m = /^🩸 Lifesteal (\d+)% of damage$/.exec(s);
    if (m) return "🩸 Hasarın %" + m[1] + "'i kadar can çalma";
    m = /^🛡 Blocks (\d+)% this round$/.exec(s);
    if (m) return "🛡 Bu tur %" + m[1] + " engeller";
    m = /^🔷 Restores (.+) mana$/.exec(s);
    if (m) return "🔷 " + m[1].replace(/\bmax\b/g, "maks") + " mana geri yükler";
    m = /^🛡 \+(\d+) shield \((\d+)r\)$/.exec(s);
    if (m) return "🛡 +" + m[1] + " kalkan (" + m[2] + " tur)";
    m = /^✨ \+(\d+)% (damage|magic|defense) \((\d+)r\)$/.exec(s);
    if (m) return "✨ +%" + m[1] + " " + ({ damage: "hasar", magic: "büyü", defense: "savunma" }[m[2]]) + " (" + m[3] + " tur)";
    m = /^💀 Foe deals (\d+)% less \((\d+)r\)$/.exec(s);
    if (m) return "💀 Düşman %" + m[1] + " az vurur (" + m[2] + " tur)";
    m = /^💀 Foe takes (\d+)% more \((\d+)r\)$/.exec(s);
    if (m) return "💀 Düşman %" + m[1] + " fazla alır (" + m[2] + " tur)";
    m = /^☠ (\d+)%\/round poison \((\d+)r\)$/.exec(s);
    if (m) return "☠ tur başına %" + m[1] + " zehir (" + m[2] + " tur)";
    m = /^💚 (\d+)%\/round regen \((\d+)r\)$/.exec(s);
    if (m) return "💚 tur başına %" + m[1] + " yenilenme (" + m[2] + " tur)";
    m = /^💧 Soaks the foe \((\d+)r\)$/.exec(s);
    if (m) return "💧 Düşmanı ıslatır (" + m[1] + " tur)";
    m = /^❄ Freezes the foe \((\d+)r\)$/.exec(s);
    if (m) return "❄ Düşmanı dondurur (" + m[1] + " tur)";
    m = /^🩸 Foe healing -(\d+)% \((\d+)r\)$/.exec(s);
    if (m) return "🩸 Düşman iyileşmesi -%" + m[1] + " (" + m[2] + " tur)";
    m = /^⛰ (.+?): \+(\d+)% (.+?) per stack \(max (\d+), (.+)\)$/.exec(s);
    if (m) {
      const kind = String(m[3]).replace(/\bdamage\b/g, "hasar").replace(/\bmagic\b/g, "büyü")
        .replace(/\battack\b/g, "saldırı").replace(/\bdefense\b/g, "savunma");
      return "⛰ " + m[1] + ": yığın başına +%" + m[2] + " " + kind + " (maks " + m[4] + ", " + skDur(m[5]) + ")";
    }
    m = /^⛰ (.+?): (\d+) stacks → (.+?)( \(kept\))?$/.exec(s);
    if (m) return "⛰ " + m[1] + ": " + m[2] + " yığın → " + skBurst(m[3]) + (m[4] ? " (korunur)" : "");
    m = /^⛰ (.+?): stacks to (\d+)$/.exec(s);
    if (m) return "⛰ " + m[1] + ": " + m[2] + " yığına kadar";
    m = /^✨ (.+) \((\d+)r\)$/.exec(s);
    if (m) return "✨ " + m[1] + " (" + m[2] + " tur)";
    return s;
  }
  // Mekanik cümlesi (tek parça). Çevrilemezse null.
  function skMechPart(s) {
    let m;
    m = /^(\d+)% of (.+) as base$/.exec(s);
    if (m) return "temel olarak " + m[2] + " %" + m[1];
    if (s === "Hits ALL enemies") return "TÜM düşmanlara vurur";
    m = /^Also hits (\d+) random (?:enemy|enemies)$/.exec(s);
    if (m) return "Ayrıca " + m[1] + " rastgele düşmana vurur";
    m = /^Plus ([\d.]+)×(.+?) as (.+)$/.exec(s);
    if (m) {
      const el = SK_ELEM[m[3].charAt(0).toUpperCase() + m[3].slice(1)] || m[3];
      return "Ayrıca " + m[1] + "×" + m[2] + ", " + el;
    }
    m = /^Usable below (\d+)% HP — executes$/.exec(s);
    if (m) return "Can %" + m[1] + " altında kullanılabilir — infaz eder";
    m = /^Kills targets dropped to (\d+)% HP or less$/.exec(s);
    if (m) return "Canı %" + m[1] + " veya altına düşen hedefleri öldürür";
    if (s === "Executes the target") return "Hedefi infaz eder";
    m = /^\+(\d+)% vs targets above (\d+)% HP$/.exec(s);
    if (m) return "Canı %" + m[2] + " üzerindeki hedeflere +%" + m[1];
    m = /^\+(\d+)% vs (.+)$/.exec(s);
    if (m) return m[2] + " hedeflerine karşı +%" + m[1];
    m = /^(\d+)% chance to strike again at (\d+)% power$/.exec(s);
    if (m) return "%" + m[1] + " şansla %" + m[2] + " güçle tekrar vurur";
    m = /^Usable every (\d+) rounds?$/.exec(s);
    if (m) return "Her " + m[1] + " turda kullanılabilir";
    return null;
  }
  function trDynamic(text) {
    const t = String(text).trim();
    if (/^(?:Free|\d+ mana|→ |⏳ )/.test(t)) return skMeta(t);
    if (SK_MARK.test(t)) return skLine(t);
    // Travel yetenek paneli meta satırı: "Frost · 8s · ×1.6 · 20% heal"
    const em = /^([A-Z][a-zçğıöşü]+) · (.+)$/.exec(t);
    if (em && SK_ELEM[em[1]]) {
      return SK_ELEM[em[1]] + " · " + em[2]
        .replace(/(\d+)% heal\b/g, "%$1 şifa")
        .replace(/(\d+)% shield\b/g, "%$1 kalkan");
    }
    if (t.indexOf(" · ") >= 0 || /base$|Hits ALL|random enem|Plus |Usable |Executes |Kills targets dropped to|chance to strike again|vs | as [A-ZÇĞİÖŞÜ]/.test(t)) {
      let changed = false;
      const out = t.split(" · ").map((raw) => {
        const p = raw.trim();
        const r = skMechPart(skWords(p));
        if (r != null) { changed = true; return r; }
        return p;
      });
      if (changed) return out.join(" · ");
    }
    return null;
  }

  // ---- Durum ------------------------------------------------------------
  let lang = "en";
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved === "tr") lang = "tr";
  } catch (e) { /* storage kapalı olabilir */ }

  const listeners = [];
  const textOrig = new Map();   // TextNode -> özgün İngilizce
  const attrOrig = new Map();   // Element -> { attr: özgün İngilizce }

  const SKIP_TAGS = { SCRIPT: 1, STYLE: 1, CANVAS: 1, TEXTAREA: 1, CODE: 1, PRE: 1 };

  // ---- Çeviri çekirdeği ------------------------------------------------
  // Kaynak metinlerde "..." / "…" ve "-" / "—" / "–" karışık geçiyor.
  // Anahtar aramasını bu varyantlara karşı dayanıklı hale getiririz.
  function normKey(s) {
    return String(s)
      .replace(/…/g, "...")
      .replace(/\s*[—–]\s*/g, " - ")
      .replace(/\s+/g, " ")
      .trim();
  }
  // Normalize edilmiş İngilizce -> Türkçe (ikinci arama tablosu).
  const TRN = {};
  (function () {
    const keys = Object.keys(TR);
    for (let i = 0; i < keys.length; i++) {
      const nk = normKey(keys[i]);
      if (TRN[nk] == null) TRN[nk] = TR[keys[i]];
    }
  })();

  function lookup(text) {
    let v = TR[text];
    if (v == null) v = TRN[normKey(text)];
    return v == null ? null : v;
  }

  // ---- Otomatik çeviri (kalıplı metinler) ------------------------------
  // Stat satırları, "Deals 8 + 1.2× attack damage." gibi tekrar eden
  // şablonlar ve yumurta açıklamaları elle sözlüğe yazılmaz.
  const STAT_EN2TR = {
    attack: "Saldırı", atk: "Saldırı",
    "max hp": "Maks. Can", maxhp: "Maks. Can", hp: "Can",
    mana: "Mana",
    "mana regen": "Mana Yenilenmesi", manaregen: "Mana Yenilenmesi",
    resistance: "Direnç", res: "Direnç",
    "magic power": "Büyü Gücü", magicpower: "Büyü Gücü", mgc: "Büyü Gücü",
    "heal power": "İyileştirme Gücü", healpower: "İyileştirme Gücü", heal: "İyileştirme",
    speed: "Hız",
    "crit chance": "Kritik Şansı", critchance: "Kritik Şansı",
    "crit damage": "Kritik Hasarı", critdamage: "Kritik Hasarı",
    omnivamp: "Omnivamp",
    food: "Yiyecek", gold: "Altın", wood: "Odun", stamina: "Dayanıklılık",
  };
  const EGG_COLORS = {
    red: "Kırmızı", green: "Yeşil", blue: "Mavi", brown: "Kahverengi",
    yellow: "Sarı", purple: "Mor", cyan: "Turkuaz", dark: "Kara",
    orange: "Turuncu", gold: "Altın",
  };
  // İngilizce anahtarı küçük harfe indirip arayan yedek tablo (son çare).
  let TRL = null;
  function lookupCI(text) {
    if (TRL === null) {
      TRL = {};
      const keys = Object.keys(TR);
      for (let i = 0; i < keys.length; i++) {
        const lk = keys[i].toLowerCase();
        if (TRL[lk] == null) TRL[lk] = TR[keys[i]];
      }
    }
    return TRL[String(text).toLowerCase()] || null;
  }

  function autoStatLine(t) {
    const parts = t.replace(/\.$/, "").split(/,\s*/);
    const out = [];
    for (let i = 0; i < parts.length; i++) {
      const m = /^\+?([\d.]+)(%?)\s*(.+)$/.exec(parts[i].trim());
      if (!m) return null;
      const name = STAT_EN2TR[m[3].trim().toLowerCase()];
      if (!name) return null;
      out.push("+" + m[1] + m[2] + " " + name);
    }
    return out.join(", ") + (/\.$/.test(t) ? "." : "");
  }

  function autoTranslate(t) {
    // "+6 Attack, +1 Speed" / "+35 maxHp, +5 resistance"
    if (/^\+?[\d.]/.test(t)) {
      const st = autoStatLine(t);
      if (st) return st;
    }
    // "Deals 45 + 1.6× magic damage." (+ isteğe bağlı kuyruk cümle)
    // "Deals 30 + 1.0× magic TRUE damage. Exact — ignores all reductions."
    let m = /^Deals ([\d.]+) \+ ([\d.]+)\s*[x×]\s*(attack|magic)\s+TRUE damage\.(.*)$/i.exec(t);
    if (m) {
      let out = m[1] + " + " + m[2] + "× " + (m[3].toLowerCase() === "magic" ? "büyü" : "saldırı") + " GERÇEK hasarı verir.";
      const rest = m[4].trim();
      if (rest) out += " " + translateString(rest);
      return out;
    }
    m = /^Deals ([\d.]+) \+ ([\d.]+)\s*[x×]\s*(attack|magic) damage\.(.*)$/i.exec(t);
    if (m) {
      let out = m[1] + " + " + m[2] + "× " + (m[3].toLowerCase() === "magic" ? "büyü" : "saldırı") + " hasarı verir.";
      const rest = m[4].trim();
      if (rest) out += " " + translateString(rest);
      return out;
    }
    // "Heals 40 HP when used."
    m = /^Heals (\d+) HP when used\.$/.exec(t);
    if (m) return "Kullanıldığında " + m[1] + " Can iyileştirir.";
    // "Red Egg - hatch to get a random pet. Drops in specific dungeons."
    m = /^(\w+) Egg - hatch to get a random pet\. Drops in specific dungeons\.$/.exec(t);
    if (m) {
      const c = EGG_COLORS[m[1].toLowerCase()] || m[1];
      return c + " Yumurta - çatlatınca rastgele bir evcil hayvan verir. Belirli zindanlarda düşer.";
    }
    // "Direwolf from Red Egg"
    m = /^(.+) from (\w+) Egg$/.exec(t);
    if (m) {
      const c = EGG_COLORS[m[2].toLowerCase()] || m[2];
      return m[1] + " (" + c + " Yumurta'dan)";
    }
    return null;
  }

  function translateString(s) {
    if (s == null) return s;
    if (lang === "en") return s;
    const trimmed = String(s).trim();
    if (!trimmed) return s;
    let out = lookup(trimmed);
    if (out == null) out = autoTranslate(trimmed);
    if (out == null) {
      // "Cümle (ek bilgi)" biçimi: baştaki cümleyi çevir, parantez içini koru.
      const m = trimmed.match(/^([\s\S]+?)\s\(([^()]*)\)$/);
      const head = m ? lookup(m[1].trim()) : null;
      if (head != null) {
        const tail = m[2]
          .replace(/\bgold\b/g, "altın")
          .replace(/\bwood\b/g, "odun")
          .replace(/\bfood\b/g, "yiyecek");
        out = head + " (" + tail + ")";
      }
    }
    if (out == null) {
      const variants = trimmed === normKey(trimmed) ? [trimmed] : [trimmed, normKey(trimmed)];
      for (let v = 0; v < variants.length && out == null; v++) {
        const src = variants[v];
        for (let i = 0; i < TR_PATTERNS.length; i++) {
          const re = TR_PATTERNS[i][0];
          if (re.test(src)) { out = src.replace(re, TR_PATTERNS[i][1]); break; }
        }
      }
    }
    if (out == null) out = trDynamic(trimmed);
    if (out == null && /\.$/.test(trimmed)) {
      const stem = trimmed.slice(0, -1);
      const head = lookup(stem) || autoTranslate(stem) || lookupCI(stem);
      if (head != null) out = head + ".";
    }
    if (out == null) out = lookupCI(trimmed);
    if (out == null) return s;
    const at = String(s).indexOf(trimmed);
    return String(s).slice(0, at) + out + String(s).slice(at + trimmed.length);
  }

  function translateTextNode(node) {
    if (!node || node.nodeType !== 3) return;
    const parent = node.parentNode;
    if (!parent) return;
    if (SKIP_TAGS[parent.nodeName]) return;
    if (parent.closest && parent.closest("[data-i18n-skip]")) return;
    const cur = node.nodeValue;
    let base = cur;
    if (textOrig.has(node)) {
      const orig = textOrig.get(node);
      // Düğüm bizim altımızda değişmediyse özgün İngilizceyi kullan;
      // değiştiyse yeni metni kaynak kabul et.
      if (cur === orig || translateString(orig) === cur) base = orig;
      else textOrig.delete(node);
    }
    const next = translateString(base);
    if (next !== cur) {
      if (!textOrig.has(node)) textOrig.set(node, base);
      node.nodeValue = next;
    }
  }

  function translateAttrs(el) {
    if (!el || el.nodeType !== 1) return;
    const attrs = ["placeholder", "title", "aria-label"];
    let store = attrOrig.get(el);
    for (let i = 0; i < attrs.length; i++) {
      const a = attrs[i];
      if (!el.hasAttribute(a)) continue;
      const cur = el.getAttribute(a);
      let base = cur;
      if (store && store[a] != null) {
        const orig = store[a];
        if (cur === orig || translateString(orig) === cur) base = orig;
      }
      const next = translateString(base);
      if (next !== cur) {
        if (!store) { store = {}; attrOrig.set(el, store); }
        store[a] = base;
        el.setAttribute(a, next);
      }
    }
  }

  function walk(node) {
    if (!node) return;
    if (node.nodeType === 3) { translateTextNode(node); return; }
    if (node.nodeType === 9) { // Document
      for (let c = node.firstChild; c; c = c.nextSibling) walk(c);
      return;
    }
    if (node.nodeType !== 1) return;
    if (SKIP_TAGS[node.nodeName]) return;
    if (node.hasAttribute && node.hasAttribute("data-i18n-skip")) return;
    translateAttrs(node);
    for (let c = node.firstChild; c; c = c.nextSibling) walk(c);
  }

  function apply(root) {
    if (lang === "en") return;
    walk(root || document.body || document.documentElement);
  }

  function prune() {
    for (const [node] of textOrig) { if (!node.isConnected) textOrig.delete(node); }
    for (const [el] of attrOrig) { if (!el.isConnected) attrOrig.delete(el); }
  }

  function restore() {
    for (const [node, orig] of textOrig) {
      if (node.isConnected) { try { node.nodeValue = orig; } catch (e) {} }
    }
    textOrig.clear();
    for (const [el, store] of attrOrig) {
      if (!el.isConnected) continue;
      for (const a in store) {
        if (Object.prototype.hasOwnProperty.call(store, a)) {
          try { el.setAttribute(a, store[a]); } catch (e) {}
        }
      }
    }
    attrOrig.clear();
  }

  // ---- DOM gözlemcisi (yeniden çizilen ekranlar için) -------------------
  let observer = null;
  function startObserver() {
    if (observer || typeof MutationObserver === "undefined" || !document.body) return;
    observer = new MutationObserver((muts) => {
      if (lang === "en") return;
      for (let i = 0; i < muts.length; i++) {
        const m = muts[i];
        if (m.type === "childList") {
          const added = m.addedNodes;
          for (let j = 0; j < added.length; j++) {
            const n = added[j];
            if (n.nodeType === 3) translateTextNode(n);
            else if (n.nodeType === 1) walk(n);
          }
        } else if (m.type === "attributes" && m.target && m.target.nodeType === 1) {
          translateAttrs(m.target);
        }
      }
      if (textOrig.size + attrOrig.size > 6000) prune();
    });
    observer.observe(document.body, {
      childList: true,
      subtree: true,
      attributes: true,
      attributeFilter: ["placeholder", "title", "aria-label"],
    });
  }

  // ---- Dil değiştirme ---------------------------------------------------
  function updateButtons() {
    const btns = document.querySelectorAll("[data-lang]");
    for (let i = 0; i < btns.length; i++) {
      const b = btns[i];
      const on = b.getAttribute("data-lang") === lang;
      b.classList.toggle("is-active", on);
      b.setAttribute("aria-pressed", on ? "true" : "false");
    }
  }

  function setLang(next) {
    next = SUPPORTED.indexOf(next) >= 0 ? next : "en";
    if (next === lang) { updateButtons(); return; }
    if (next === "en") restore();
    lang = next;
    try { localStorage.setItem(STORAGE_KEY, lang); } catch (e) {}
    try { document.documentElement.setAttribute("lang", lang); } catch (e) {}
    updateButtons();
    applyDocumentTitle();
    if (lang === "tr") apply(document.body);
    for (let i = 0; i < listeners.length; i++) {
      try { listeners[i](lang); } catch (e) {}
    }
  }

  // Sekme başlığını da çevir (İngilizceye dönünce özgün hâline döner).
  let titleOrig = null;
  function applyDocumentTitle() {
    try {
      if (titleOrig == null) titleOrig = document.title || "";
      document.title = translateString(titleOrig);
    } catch (e) {}
  }

  function bindButtons() {
    const btns = document.querySelectorAll("[data-lang]");
    for (let i = 0; i < btns.length; i++) {
      const b = btns[i];
      if (b._setraLangBound) continue;
      b._setraLangBound = true;
      b.addEventListener("click", () => setLang(b.getAttribute("data-lang")));
    }
    updateButtons();
  }

  function boot() {
    try { document.documentElement.setAttribute("lang", lang); } catch (e) {}
    bindButtons();
    applyDocumentTitle();
    if (lang === "tr") apply(document.body);
    startObserver();
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", boot, { once: true });
  } else {
    boot();
  }
  // Dinamik olarak gelen menüleri de yakala.
  window.addEventListener("load", () => { bindButtons(); if (lang === "tr") apply(document.body); });

  // ---- İçerik sözlüğü (content.js -> i18nTR) ---------------------------
  // GameCraft editöründen düzenlenen [en, tr] çiftleri buradan sözlüğe eklenir.
  // Mevcut anahtarların üzerine YAZMAZ (elle yazılmış çeviriler önceliklidir).
  function loadExtra(list) {
    if (!Array.isArray(list) || !list.length) return 0;
    let added = 0;
    for (let i = 0; i < list.length; i++) {
      const row = list[i];
      if (!row) continue;
      const en = typeof row === "string" ? row : row.en;
      const tr = typeof row === "string" ? null : row.tr;
      if (!en || tr == null || tr === "") continue;
      if (TR[en] == null) { TR[en] = tr; added++; }
      const nk = normKey(en);
      if (TRN[nk] == null) TRN[nk] = tr;
    }
    if (added && lang === "tr") { prune(); apply(document.body); }
    if (added) TRL = null; // küçük-harf arama tablosunu tazele
    return added;
  }

  // ---- Genel API --------------------------------------------------------
  window.SetraI18n = {
    get lang() { return lang; },
    t: translateString,
    apply,
    setLang,
    toggle() { setLang(lang === "tr" ? "en" : "tr"); },
    onChange(fn) { if (typeof fn === "function") listeners.push(fn); },
    loadExtra,
    refresh: boot,
    // Bakım/denetim için: sözlük ve desenlere erişim (yalnızca okuma amaçlı).
    _dict: TR,
    _patterns: TR_PATTERNS,
  };
})();