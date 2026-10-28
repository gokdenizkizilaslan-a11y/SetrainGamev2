MÜZİK NASIL EKLENİR (kasaba / savaş / zafer)
================================================
Ses dosyalarını DOĞRU alt klasöre at (yoksa oluştur):
  public/music/town/     → kasabada + menülerde döngüyle çalar
  public/music/combat/   → savaş başlayınca geçer, bitince kasabaya döner
  public/music/victory/  → zaferde BİR kez çalar (ilk dosya)

Desteklenen uzantılar: .mp3 .ogg .wav .m4a .flac
Çalma sırası = dosya adı sırası (A-Z). Başına 01, 02... koyarsan
istediğin sırada çalar:
  public/music/town/01-town-theme.mp3
  public/music/combat/01-battle-drums.mp3
  public/music/victory/victory-fanfare.mp3

Kurallar:
- Sunucuyu yeniden başlatmaya gerek YOK (liste her sayfada yeniden okunur).
- Klasör boşsa o kanal sessiz kalır: combat boşsa savaşta kasaba
  çalmaya devam eder, victory boşsa sadece winningsound efekti çalar.
- Hiç müzik yoksa çalar gizli kalır, oyun etkilenmez.
- Eski usul (tüm dosyalar doğrudan public/music/ altında) hâlâ
  kasaba listesi olarak çalar — geriye uyumlu.
- GameCraft → Müzikler sekmesinden de yükleyebilir/silebilirsin
  (önce oyun sunucusu açık olmalı: npm start).
