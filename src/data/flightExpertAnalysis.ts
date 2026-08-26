// Expert weather & flight-analysis content for the Flight Status page.
// English content provided by the operator; Turkish/Spanish can be added
// under the same keys later without touching FlightStatusPage.astro.

export const flightExpertAnalysis = {
  en: {
    kicker: 'OFFICIAL AVIATION INFORMATION & PROFESSIONAL WEATHER ANALYSIS',
    heading: 'Cappadocia Balloon Flight Status & Weather Forecast',
    intro: [
      'Planning a Cappadocia hot air balloon flight and wondering whether balloons are likely to fly?',
      "Our Cappadocia Balloon Flight Status page provides travelers with additional weather and operational information to help them understand the conditions that may affect a balloon flight.",
      'We use publicly available information from official Turkish aviation and meteorological sources, including SHGM / SHM and MGM Hezarfen, together with international weather forecast models such as ECMWF and ICON.',
      'This information is reviewed with professional ballooning experience and presented in a clear, traveler-friendly format.',
      'We are not an official aviation authority and do not issue flight permissions, cancellations or operational clearances. The official flight decision always takes priority.',
    ],
    ctaLabel: 'Check Cappadocia Balloon Flight Status',

    analysisHeading: 'How We Analyze Cappadocia Balloon Flight Conditions',
    analysisIntro: "Cappadocia balloon flights depend on several atmospheric and operational factors. We therefore do not rely on a single weather application or forecast. Our analysis may include:",
    analysisFactors: [
      'Wind speed and direction', 'Wind changes and gusts', 'Visibility', 'Cloud base',
      'Fog and haze', 'Rain and snow', 'Thunderstorm and CB risk', 'Thermal activity',
      'Estimated flight probability', 'Possible launch areas', 'Estimated balloon movement', 'Potential viewing areas',
    ],
    analysisOutro: "We compare local aviation weather information with international forecast models and consider Cappadocia's unique geographical conditions. Our goal is to provide additional context for travelers, not to replace the official aviation system.",

    sourcesHeading: 'Official Turkish Aviation & Weather Sources',
    sources: [
      {
        name: 'MGM Hezarfen – Cappadocia Aviation Weather',
        body: 'The Meteorological General Directorate of Türkiye (MGM) provides aviation weather information through its Hezarfen system, including dedicated information for Cappadocia.',
        linkLabel: 'MGM Hezarfen Cappadocia Aviation Weather',
        url: 'https://hezarfen.mgm.gov.tr/Kapadokya/khcapdk.aspx',
      },
      {
        name: 'SHGM / SHM',
        body: 'The Directorate General of Civil Aviation of Türkiye (SHGM) establishes and oversees the regulatory framework applicable to commercial balloon operations in Türkiye. We use official SHGM / SHM information as a reference for the aviation framework, balloon flight areas and operational information applicable to Cappadocia. We respect and follow the official aviation framework established by the competent authorities.',
        linkLabel: 'SHGM – Official Balloon Operator Information',
        url: 'https://web.shgm.gov.tr/tr/s/80-balon-isletmeleri',
        secondLinkLabel: 'SHGM – Balloon Search / Publications',
        secondUrl: 'https://web.shgm.gov.tr/tr/arama?searchkey=balon',
      },
      {
        name: 'ECMWF & ICON Weather Models',
        body: 'In addition to local Turkish aviation weather information, we compare internationally recognized numerical weather prediction models. The European Centre for Medium-Range Weather Forecasts (ECMWF) provides global weather forecasts and ensemble prediction information. ICON is a numerical weather prediction model operated by the German Meteorological Service (DWD) and its partners. We compare relevant forecast information from these models with local Cappadocia conditions.',
        linkLabel: 'ECMWF Official Forecasts',
        url: 'https://www.ecmwf.int/en/forecasts',
        secondLinkLabel: 'DWD – ICON Weather Model',
        secondUrl: 'https://www.dwd.de/EN/research/weatherforecasting/num_modelling/01_num_weather_prediction_modells/icon_description.html',
      },
    ],

    probabilityHeading: 'Estimated Flight Probability',
    probabilityIntro: 'Our Cappadocia balloon flight probability is an estimate based on the available weather and operational information. It is not an official percentage published by SHGM, SHM or MGM.',
    probabilityLevels: [
      { title: 'High Flight Probability', body: 'Forecast conditions appear generally favorable.' },
      { title: 'Moderate Flight Probability', body: 'Some conditions require closer monitoring.' },
      { title: 'Low Flight Probability', body: 'One or more factors indicate a greater possibility of unsuitable conditions.' },
    ],
    probabilityNote: 'A high flight probability is never a guarantee that a balloon flight will operate. Weather conditions can change, local observations may differ from forecast models, and the official operational assessment always takes priority.',

    launchHeading: 'Estimated Launch Areas & Balloon Movement',
    launchIntro: "Cappadocia's terrain and changing wind conditions mean that balloon launch locations can vary. Our analysis may consider areas around:",
    launchAreas: ['Göreme', 'Çavuşin', 'Love Valley', 'Uçhisar', 'Paşabağ', 'Zelve', 'Ortahisar', 'Kızılçukur'],
    launchOutro: 'We may also provide an estimated general balloon movement direction based on forecast wind patterns. These are weather-based estimates only and are not official launch assignments or flight routes.',

    launchPhoto: {
      src: '/images/flight-status/cappadocia-balloon-launch-sunrise.webp',
      alt: 'Cappadocia hot air balloon launch before sunrise',
      caption: 'Hot air balloons preparing for launch before sunrise in Cappadocia.',
    },

    officialMap: {
      src: '/images/flight-status/shgm-official-flight-area-map.webp',
      caption: 'Official Cappadocia Balloon Flight Area Map – SHGM',
      note: 'The official map should always be considered together with the latest information published by the competent authority.',
    },
    ownMap: {
      src: '/images/flight-status/weather-based-balloon-map.webp',
      caption: 'UNOFFICIAL WEATHER-BASED ESTIMATE – FOR TRAVEL PLANNING ONLY',
      itemsHeading: 'This separate map can show:',
      items: ['Estimated launch areas', 'Estimated wind direction', 'Estimated balloon movement', 'Potential viewing areas', 'Main Cappadocia valleys and locations'],
    },

    sunriseHeading: 'Why Do Cappadocia Balloons Fly Around Sunrise?',
    sunriseBody: [
      "One of Cappadocia's most famous sights is the large number of balloons appearing in the sky around sunrise.",
      'Hot air balloon flights are generally scheduled around sunrise because thermal activity is usually lower during the early morning hours, before the ground becomes strongly heated by the sun.',
      "The morning also provides beautiful sunrise light and, when weather conditions are favorable, spectacular views across Cappadocia's valleys.",
      "This combination makes Cappadocia sunrise hot air balloon flights one of the region's most popular experiences.",
    ],
    heroPhoto: {
      src: '/images/flight-status/cappadocia-balloons-sunrise-goreme.webp',
      alt: 'Cappadocia hot air balloons flying over Göreme at sunrise',
    },

    weatherFactorsHeading: 'Weather Conditions That Can Affect a Balloon Flight',
    weatherFactorsIntro: 'Weather is one of the most important factors in balloon operations. Among the conditions that may be monitored are:',
    weatherFactors: [
      'Surface wind', 'Wind direction and gusts', 'Visibility', 'Cloud base', 'Fog and haze',
      'Rain and snow', 'Thunderstorms and CB development', 'Thermal activity', 'Atmospheric stability',
    ],
    weatherFactorsNote1: 'As a general reference, surface winds above approximately 10 knots (18 km/h) can become unsuitable for balloon operations, depending on the complete weather and operational situation.',
    weatherFactorsNote2: 'Rain or snow does not automatically determine the conditions for a future flight. If conditions subsequently improve sufficiently, a later flight may become possible.',
    weatherFactorsNote3: 'The final decision depends on the complete operational assessment, not on one weather parameter alone.',

    slotHeading: "Understanding Cappadocia's Balloon Slot System",
    slotBody: [
      "Cappadocia's commercial balloon operations are conducted within an official slot and flight-area system.",
      'A company having a certain number of balloons does not automatically mean that all of those balloons can fly commercially on the same morning.',
      'Commercial operations are conducted according to the applicable slot allocation, operator capacity, passenger capacity and aviation regulations.',
      "This system helps manage balloon traffic in Cappadocia and supports the organized operation of one of the world's most active hot air balloon destinations.",
    ],

    pilotHeading: 'Professional Ballooning Experience',
    pilotBody: [
      'This analysis has been prepared and reviewed with professional ballooning experience.',
      'Expert Balloon Pilot Vahit SERTTAŞ has more than 550 hours of balloon flight experience. His professional experience contributes to the interpretation of meteorological and operational information presented on this page.',
      'Pre-flight operations may include reviewing weather reports, assessing wind conditions, calculating balloon payload, preparing flight equipment and coordinating with the ground team.',
    ],
    pilotEquipmentIntro: 'Depending on the operation and applicable requirements, equipment may include:',
    pilotEquipment: ['Variometer', 'Altimeter', 'GPS', 'Aviation radio', 'Ground communication systems'],
    pilotNote: 'Professional experience helps us provide additional context, but it does not guarantee future weather conditions or the operation of a flight.',

    comparisonHeading: 'Official Information & Our Additional Analysis',
    comparisonIntro: 'We believe it is important to clearly distinguish between official information and our own analysis.',
    comparisonRows: [
      ['Aviation regulations', 'Official SHGM'],
      ['Cappadocia aviation information', 'Official SHGM / SHM'],
      ['Cappadocia aviation weather', 'Official MGM Hezarfen'],
      ['International weather models', 'ECMWF / ICON'],
      ['Estimated flight probability', 'Our additional analysis'],
      ['Estimated launch area', 'Our additional analysis'],
      ['Estimated balloon movement', 'Our additional analysis'],
      ['Viewing guidance', 'Our additional analysis'],
    ],
    comparisonOutro: 'Official information remains official. Our interpretation remains our own independent analysis.',

    disclaimerHeading: 'Expert Analysis & Disclaimer',
    disclaimerSubheading: 'Prepared and Reviewed by Vahit SERTTAŞ',
    disclaimerBody: [
      'This Cappadocia Balloon Flight Status analysis has been prepared and reviewed by Expert Hot Air Balloon Pilot Vahit SERTTAŞ.',
      'The analysis combines publicly available information from official Turkish aviation and meteorological sources, including SHGM / SHM and MGM Hezarfen, with international weather models such as ECMWF and ICON.',
      'Our purpose is to provide travelers with additional weather-based information and professional context when planning their Cappadocia balloon experience.',
      'Tatildokya Travels is not an aviation authority and does not issue official flight permissions, cancellations, operational clearances or aviation instructions.',
      'All estimates and interpretations on this page are unofficial and provided for informational and travel-planning purposes only. The official flight decision always takes priority.',
      'If you believe any information on this page is incorrect, outdated or requires clarification, please contact us. We welcome feedback and will review the information where appropriate.',
    ],
    preparedByLabel: 'Prepared and Reviewed By',
    pilotName: 'Vahit SERTTAŞ',
    pilotTitle: 'Expert Hot Air Balloon Pilot',

    relatedHeading: 'Continue Planning Your Cappadocia Balloon Flight',
    relatedLinks: [
      { label: 'All Cappadocia Balloon Tours', href: '/en/balloon-tours/' },
      { label: 'Göreme Standard Hot Air Balloon Tour', href: '/en/tours/goreme-standart-hot-air-balloon-tour/' },
      { label: 'Göreme Comfort Hot Air Balloon Tour', href: '/en/tours/goreme-comfort-hot-air-balloon-tour/' },
    ],
  },

  tr: {
    kicker: 'RESMİ HAVACILIK BİLGİSİ VE PROFESYONEL HAVA DURUMU ANALİZİ',
    heading: 'Kapadokya Balon Uçuş Durumu ve Hava Tahmini',
    intro: [
      'Kapadokya sıcak hava balonu turu planlıyor ve balonların uçup uçmayacağını mı merak ediyorsunuz?',
      'Kapadokya Balon Uçuş Durumu sayfamız, gezginlere bir balon uçuşunu etkileyebilecek koşulları anlamalarına yardımcı olacak ek hava durumu ve operasyonel bilgiler sunar.',
      'SHGM / SHM ve MGM Hezarfen dahil olmak üzere resmi Türk havacılık ve meteoroloji kaynaklarından kamuya açık bilgileri, ECMWF ve ICON gibi uluslararası hava tahmin modelleriyle birlikte kullanıyoruz.',
      'Bu bilgiler, profesyonel balon pilotluğu deneyimiyle gözden geçirilerek gezgin dostu, anlaşılır bir formatta sunulur.',
      'Resmi bir havacılık otoritesi değiliz ve uçuş izni, iptal veya operasyonel onay vermiyoruz. Resmi uçuş kararı her zaman önceliklidir.',
    ],
    ctaLabel: 'Kapadokya Balon Uçuş Durumunu Kontrol Edin',

    analysisHeading: 'Kapadokya Balon Uçuş Koşullarını Nasıl Analiz Ediyoruz',
    analysisIntro: 'Kapadokya balon uçuşları birçok atmosferik ve operasyonel faktöre bağlıdır. Bu yüzden tek bir hava durumu uygulamasına veya tahmine güvenmiyoruz. Analizimiz şunları içerebilir:',
    analysisFactors: [
      'Rüzgar hızı ve yönü', 'Rüzgar değişimleri ve hamleler', 'Görüş mesafesi', 'Bulut tabanı',
      'Sis ve pus', 'Yağmur ve kar', 'Fırtına ve CB riski', 'Termal aktivite',
      'Tahmini uçuş olasılığı', 'Olası kalkış alanları', 'Tahmini balon hareketi', 'Potansiyel izleme alanları',
    ],
    analysisOutro: 'Yerel havacılık hava durumu bilgilerini uluslararası tahmin modelleriyle karşılaştırıyor ve Kapadokya\'nın kendine özgü coğrafi koşullarını dikkate alıyoruz. Amacımız gezginlere ek bir bakış açısı sunmak, resmi havacılık sistemini değiştirmek değil.',

    sourcesHeading: 'Resmi Türk Havacılık ve Hava Durumu Kaynakları',
    sources: [
      {
        name: 'MGM Hezarfen – Kapadokya Havacılık Hava Durumu',
        body: 'Türkiye Meteoroloji Genel Müdürlüğü (MGM), Hezarfen sistemi üzerinden havacılık hava durumu bilgisi sunar; bu sistemde Kapadokya\'ya özel bilgiler de yer alır.',
        linkLabel: 'MGM Hezarfen Kapadokya Havacılık Hava Durumu',
        url: 'https://hezarfen.mgm.gov.tr/Kapadokya/khcapdk.aspx',
      },
      {
        name: 'SHGM / SHM',
        body: 'Türkiye Sivil Havacılık Genel Müdürlüğü (SHGM), Türkiye\'de ticari balon operasyonlarına uygulanan düzenleyici çerçeveyi belirler ve denetler. Kapadokya\'ya uygulanan havacılık çerçevesi, balon uçuş alanları ve operasyonel bilgiler için resmi SHGM / SHM bilgilerini referans olarak kullanıyoruz. Yetkili makamlar tarafından oluşturulan resmi havacılık çerçevesine saygı duyuyor ve buna uyuyoruz.',
        linkLabel: 'SHGM – Resmi Balon İşletmecisi Bilgisi',
        url: 'https://web.shgm.gov.tr/tr/s/80-balon-isletmeleri',
        secondLinkLabel: 'SHGM – Balon Arama / Yayınlar',
        secondUrl: 'https://web.shgm.gov.tr/tr/arama?searchkey=balon',
      },
      {
        name: 'ECMWF ve ICON Hava Durumu Modelleri',
        body: 'Yerel Türk havacılık hava durumu bilgisine ek olarak, uluslararası alanda tanınan sayısal hava tahmin modellerini de karşılaştırıyoruz. Avrupa Orta Vadeli Hava Tahminleri Merkezi (ECMWF), küresel hava tahminleri ve topluluk (ensemble) tahmin bilgisi sunar. ICON ise Alman Meteoroloji Servisi (DWD) ve ortakları tarafından işletilen bir sayısal hava tahmin modelidir. Bu modellerden elde edilen ilgili tahmin bilgilerini yerel Kapadokya koşullarıyla karşılaştırıyoruz.',
        linkLabel: 'ECMWF Resmi Tahminler',
        url: 'https://www.ecmwf.int/en/forecasts',
        secondLinkLabel: 'DWD – ICON Hava Durumu Modeli',
        secondUrl: 'https://www.dwd.de/EN/research/weatherforecasting/num_modelling/01_num_weather_prediction_modells/icon_description.html',
      },
    ],

    probabilityHeading: 'Tahmini Uçuş Olasılığı',
    probabilityIntro: 'Kapadokya balon uçuş olasılığımız, mevcut hava durumu ve operasyonel bilgilere dayanan bir tahmindir. SHGM, SHM veya MGM tarafından yayınlanan resmi bir yüzde değildir.',
    probabilityLevels: [
      { title: 'Yüksek Uçuş Olasılığı', body: 'Tahmin edilen koşullar genel olarak elverişli görünüyor.' },
      { title: 'Orta Uçuş Olasılığı', body: 'Bazı koşullar daha yakından takip gerektiriyor.' },
      { title: 'Düşük Uçuş Olasılığı', body: 'Bir veya daha fazla faktör, uygun olmayan koşul ihtimalinin daha yüksek olduğunu gösteriyor.' },
    ],
    probabilityNote: 'Yüksek uçuş olasılığı, bir balon uçuşunun gerçekleşeceğinin garantisi asla değildir. Hava koşulları değişebilir, yerel gözlemler tahmin modellerinden farklı olabilir ve resmi operasyonel değerlendirme her zaman önceliklidir.',

    launchHeading: 'Tahmini Kalkış Alanları ve Balon Hareketi',
    launchIntro: 'Kapadokya\'nın arazi yapısı ve değişen rüzgar koşulları, balon kalkış noktalarının değişebileceği anlamına gelir. Analizimiz şu bölgeleri dikkate alabilir:',
    launchAreas: ['Göreme', 'Çavuşin', 'Aşk Vadisi (Love Valley)', 'Uçhisar', 'Paşabağ', 'Zelve', 'Ortahisar', 'Kızılçukur'],
    launchOutro: 'Ayrıca tahmin edilen rüzgar örüntülerine dayanarak genel bir balon hareket yönü tahmini de sunabiliriz. Bunlar yalnızca hava durumuna dayalı tahminlerdir; resmi kalkış ataması veya uçuş rotası değildir.',

    launchPhoto: {
      src: '/images/flight-status/cappadocia-balloon-launch-sunrise.webp',
      alt: 'Kapadokya\'da gündoğumundan önce sıcak hava balonu kalkışı',
      caption: 'Kapadokya\'da gündoğumundan önce kalkışa hazırlanan sıcak hava balonları.',
    },

    officialMap: {
      src: '/images/flight-status/shgm-official-flight-area-map.webp',
      caption: 'Resmi Kapadokya Balon Uçuş Alanı Haritası – SHGM',
      note: 'Resmi harita, her zaman yetkili makam tarafından yayınlanan en güncel bilgiyle birlikte değerlendirilmelidir.',
    },
    ownMap: {
      src: '/images/flight-status/weather-based-balloon-map.webp',
      caption: 'GAYRIRESMİ HAVA DURUMUNA DAYALI TAHMİN – YALNIZCA SEYAHAT PLANLAMASI İÇİN',
      itemsHeading: 'Bu ayrı harita şunları gösterebilir:',
      items: ['Tahmini kalkış alanları', 'Tahmini rüzgar yönü', 'Tahmini balon hareketi', 'Potansiyel izleme alanları', 'Ana Kapadokya vadileri ve lokasyonları'],
    },

    sunriseHeading: 'Kapadokya Balonları Neden Gündoğumu Civarında Uçar?',
    sunriseBody: [
      'Kapadokya\'nın en ünlü manzaralarından biri, gündoğumu civarında gökyüzünde beliren çok sayıda balondur.',
      'Sıcak hava balonu uçuşları genellikle gündoğumu civarında planlanır çünkü zemin güneş tarafından güçlü şekilde ısınmadan önce, sabahın erken saatlerinde termal aktivite genellikle daha düşüktür.',
      'Sabah ayrıca güzel bir gündoğumu ışığı sunar ve hava koşulları uygun olduğunda Kapadokya\'nın vadileri boyunca muhteşem manzaralar sağlar.',
      'Bu kombinasyon, Kapadokya\'da gündoğumu sıcak hava balonu uçuşlarını bölgenin en popüler deneyimlerinden biri haline getiriyor.',
    ],
    heroPhoto: {
      src: '/images/flight-status/cappadocia-balloons-sunrise-goreme.webp',
      alt: 'Kapadokya\'da gündoğumunda Göreme üzerinde uçan sıcak hava balonları',
    },

    weatherFactorsHeading: 'Bir Balon Uçuşunu Etkileyebilecek Hava Koşulları',
    weatherFactorsIntro: 'Hava durumu, balon operasyonlarındaki en önemli faktörlerden biridir. İzlenebilecek koşullar arasında şunlar bulunur:',
    weatherFactors: [
      'Yüzey rüzgarı', 'Rüzgar yönü ve hamleler', 'Görüş mesafesi', 'Bulut tabanı', 'Sis ve pus',
      'Yağmur ve kar', 'Fırtına ve CB gelişimi', 'Termal aktivite', 'Atmosferik istikrar',
    ],
    weatherFactorsNote1: 'Genel bir referans olarak, yaklaşık 10 knot (18 km/sa) üzerindeki yüzey rüzgarları, tam hava durumu ve operasyonel duruma bağlı olarak balon operasyonları için uygun olmayabilir.',
    weatherFactorsNote2: 'Yağmur veya kar, gelecekteki bir uçuşun koşullarını otomatik olarak belirlemez. Koşullar sonradan yeterince iyileşirse, daha sonraki bir uçuş mümkün hale gelebilir.',
    weatherFactorsNote3: 'Nihai karar, tek bir hava durumu parametresine değil, eksiksiz operasyonel değerlendirmeye bağlıdır.',

    slotHeading: 'Kapadokya\'nın Balon Slot Sistemini Anlamak',
    slotBody: [
      'Kapadokya\'nın ticari balon operasyonları, resmi bir slot ve uçuş alanı sistemi içinde yürütülür.',
      'Bir firmanın belirli sayıda balona sahip olması, o balonların tümünün aynı sabah ticari olarak uçabileceği anlamına otomatik olarak gelmez.',
      'Ticari operasyonlar; geçerli slot tahsisine, işletmeci kapasitesine, yolcu kapasitesine ve havacılık düzenlemelerine göre yürütülür.',
      'Bu sistem, Kapadokya\'daki balon trafiğinin yönetilmesine yardımcı olur ve dünyanın en aktif sıcak hava balonu destinasyonlarından birinin düzenli işleyişini destekler.',
    ],

    pilotHeading: 'Profesyonel Balon Pilotluğu Deneyimi',
    pilotBody: [
      'Bu analiz, profesyonel balon pilotluğu deneyimiyle hazırlanmış ve gözden geçirilmiştir.',
      'Uzman Balon Pilotu Vahit SERTTAŞ, 550 saatin üzerinde balon uçuş deneyimine sahiptir. Profesyonel deneyimi, bu sayfada sunulan meteorolojik ve operasyonel bilgilerin yorumlanmasına katkıda bulunuyor.',
      'Uçuş öncesi işlemler; hava raporlarının incelenmesini, rüzgar koşullarının değerlendirilmesini, balon yük hesaplamasını, uçuş ekipmanının hazırlanmasını ve yer ekibiyle koordinasyonu içerebilir.',
    ],
    pilotEquipmentIntro: 'Operasyona ve geçerli gereksinimlere bağlı olarak, ekipman şunları içerebilir:',
    pilotEquipment: ['Variometre', 'Altimetre', 'GPS', 'Havacılık telsizi', 'Yer iletişim sistemleri'],
    pilotNote: 'Profesyonel deneyim ek bir bakış açısı sunmamıza yardımcı olur, ancak gelecekteki hava koşullarını veya bir uçuşun gerçekleşeceğini garanti etmez.',

    comparisonHeading: 'Resmi Bilgi ve Bizim Ek Analizimiz',
    comparisonIntro: 'Resmi bilgi ile kendi analizimiz arasında net bir ayrım yapmanın önemli olduğuna inanıyoruz.',
    comparisonRows: [
      ['Havacılık düzenlemeleri', 'Resmi SHGM'],
      ['Kapadokya havacılık bilgisi', 'Resmi SHGM / SHM'],
      ['Kapadokya havacılık hava durumu', 'Resmi MGM Hezarfen'],
      ['Uluslararası hava durumu modelleri', 'ECMWF / ICON'],
      ['Tahmini uçuş olasılığı', 'Bizim ek analizimiz'],
      ['Tahmini kalkış alanı', 'Bizim ek analizimiz'],
      ['Tahmini balon hareketi', 'Bizim ek analizimiz'],
      ['İzleme rehberliği', 'Bizim ek analizimiz'],
    ],
    comparisonOutro: 'Resmi bilgi resmi kalır. Bizim yorumumuz kendi bağımsız analizimiz olarak kalır.',

    disclaimerHeading: 'Uzman Analizi ve Sorumluluk Reddi',
    disclaimerSubheading: 'Vahit SERTTAŞ Tarafından Hazırlanmış ve Gözden Geçirilmiştir',
    disclaimerBody: [
      'Bu Kapadokya Balon Uçuş Durumu analizi, Uzman Sıcak Hava Balonu Pilotu Vahit SERTTAŞ tarafından hazırlanmış ve gözden geçirilmiştir.',
      'Analiz, SHGM / SHM ve MGM Hezarfen dahil resmi Türk havacılık ve meteoroloji kaynaklarından kamuya açık bilgileri, ECMWF ve ICON gibi uluslararası hava durumu modelleriyle birleştirir.',
      'Amacımız, gezginlere Kapadokya balon deneyimlerini planlarken ek hava durumuna dayalı bilgi ve profesyonel bir bakış açısı sunmaktır.',
      'Tatildokya Travels bir havacılık otoritesi değildir ve resmi uçuş izni, iptal, operasyonel onay veya havacılık talimatı vermez.',
      'Bu sayfadaki tüm tahminler ve yorumlar gayriresmidir ve yalnızca bilgilendirme ve seyahat planlama amaçlıdır. Resmi uçuş kararı her zaman önceliklidir.',
      'Bu sayfadaki herhangi bir bilginin yanlış, güncel olmadığını veya açıklama gerektirdiğini düşünüyorsanız, lütfen bizimle iletişime geçin. Geri bildirimlerinizi memnuniyetle karşılar ve bilgiyi uygun görüldüğünde gözden geçiririz.',
    ],
    preparedByLabel: 'Hazırlayan ve Gözden Geçiren',
    pilotName: 'Vahit SERTTAŞ',
    pilotTitle: 'Uzman Sıcak Hava Balonu Pilotu',

    relatedHeading: 'Kapadokya Balon Uçuşunuzu Planlamaya Devam Edin',
    relatedLinks: [
      { label: 'Tüm Kapadokya Balon Turları', href: '/tr/balloon-tours/' },
      { label: 'Göreme Standart Sıcak Hava Balonu Turu', href: '/tr/tours/goreme-standart-hot-air-balloon-tour/' },
      { label: 'Göreme Comfort Sıcak Hava Balonu Turu', href: '/tr/tours/goreme-comfort-hot-air-balloon-tour/' },
    ],
  },

  es: {
    kicker: 'INFORMACIÓN AERONÁUTICA OFICIAL Y ANÁLISIS METEOROLÓGICO PROFESIONAL',
    heading: 'Estado de los Vuelos en Globo en Capadocia y Pronóstico del Tiempo',
    intro: [
      '¿Estás planeando un vuelo en globo aerostático en Capadocia y te preguntas si los globos podrán volar?',
      'Nuestra página de Estado de Vuelos en Globo en Capadocia ofrece a los viajeros información meteorológica y operativa adicional para ayudarles a entender las condiciones que pueden afectar a un vuelo en globo.',
      'Utilizamos información disponible públicamente de fuentes oficiales de aviación y meteorología turcas, incluyendo SHGM / SHM y MGM Hezarfen, junto con modelos internacionales de pronóstico como ECMWF e ICON.',
      'Esta información se revisa con experiencia profesional en globos aerostáticos y se presenta en un formato claro y adaptado a los viajeros.',
      'No somos una autoridad aeronáutica oficial y no emitimos permisos de vuelo, cancelaciones ni autorizaciones operativas. La decisión oficial de vuelo siempre tiene prioridad.',
    ],
    ctaLabel: 'Consultar el Estado de los Vuelos en Globo en Capadocia',

    analysisHeading: 'Cómo Analizamos las Condiciones de Vuelo en Globo en Capadocia',
    analysisIntro: 'Los vuelos en globo en Capadocia dependen de varios factores atmosféricos y operativos. Por eso no nos basamos en una sola aplicación o pronóstico meteorológico. Nuestro análisis puede incluir:',
    analysisFactors: [
      'Velocidad y dirección del viento', 'Cambios de viento y ráfagas', 'Visibilidad', 'Base de nubes',
      'Niebla y bruma', 'Lluvia y nieve', 'Riesgo de tormenta y CB', 'Actividad térmica',
      'Probabilidad estimada de vuelo', 'Posibles zonas de despegue', 'Movimiento estimado del globo', 'Zonas potenciales de observación',
    ],
    analysisOutro: 'Comparamos la información meteorológica aeronáutica local con modelos internacionales de pronóstico y tenemos en cuenta las condiciones geográficas únicas de Capadocia. Nuestro objetivo es ofrecer contexto adicional a los viajeros, no sustituir el sistema aeronáutico oficial.',

    sourcesHeading: 'Fuentes Oficiales de Aviación y Meteorología Turcas',
    sources: [
      {
        name: 'MGM Hezarfen – Meteorología Aeronáutica de Capadocia',
        body: 'La Dirección General de Meteorología de Turquía (MGM) proporciona información meteorológica aeronáutica a través de su sistema Hezarfen, que incluye información específica para Capadocia.',
        linkLabel: 'MGM Hezarfen – Meteorología Aeronáutica de Capadocia',
        url: 'https://hezarfen.mgm.gov.tr/Kapadokya/khcapdk.aspx',
      },
      {
        name: 'SHGM / SHM',
        body: 'La Dirección General de Aviación Civil de Turquía (SHGM) establece y supervisa el marco regulatorio aplicable a las operaciones comerciales de globos en Turquía. Utilizamos la información oficial de SHGM / SHM como referencia para el marco aeronáutico, las zonas de vuelo de los globos y la información operativa aplicable a Capadocia. Respetamos y seguimos el marco aeronáutico oficial establecido por las autoridades competentes.',
        linkLabel: 'SHGM – Información Oficial de Operadores de Globos',
        url: 'https://web.shgm.gov.tr/tr/s/80-balon-isletmeleri',
        secondLinkLabel: 'SHGM – Búsqueda / Publicaciones sobre Globos',
        secondUrl: 'https://web.shgm.gov.tr/tr/arama?searchkey=balon',
      },
      {
        name: 'Modelos Meteorológicos ECMWF e ICON',
        body: 'Además de la información meteorológica aeronáutica turca local, comparamos modelos numéricos de predicción meteorológica reconocidos internacionalmente. El Centro Europeo de Previsiones Meteorológicas a Plazo Medio (ECMWF) ofrece previsiones meteorológicas globales e información de predicción por conjuntos (ensemble). ICON es un modelo numérico de predicción meteorológica operado por el Servicio Meteorológico Alemán (DWD) y sus socios. Comparamos la información relevante de estos modelos con las condiciones locales de Capadocia.',
        linkLabel: 'Previsiones Oficiales de ECMWF',
        url: 'https://www.ecmwf.int/en/forecasts',
        secondLinkLabel: 'DWD – Modelo Meteorológico ICON',
        secondUrl: 'https://www.dwd.de/EN/research/weatherforecasting/num_modelling/01_num_weather_prediction_modells/icon_description.html',
      },
    ],

    probabilityHeading: 'Probabilidad Estimada de Vuelo',
    probabilityIntro: 'Nuestra probabilidad de vuelo en globo en Capadocia es una estimación basada en la información meteorológica y operativa disponible. No es un porcentaje oficial publicado por SHGM, SHM o MGM.',
    probabilityLevels: [
      { title: 'Probabilidad Alta de Vuelo', body: 'Las condiciones previstas parecen generalmente favorables.' },
      { title: 'Probabilidad Moderada de Vuelo', body: 'Algunas condiciones requieren un seguimiento más cercano.' },
      { title: 'Probabilidad Baja de Vuelo', body: 'Uno o más factores indican una mayor posibilidad de condiciones no adecuadas.' },
    ],
    probabilityNote: 'Una probabilidad alta de vuelo nunca es una garantía de que un vuelo en globo vaya a operar. Las condiciones meteorológicas pueden cambiar, las observaciones locales pueden diferir de los modelos de pronóstico, y la evaluación operativa oficial siempre tiene prioridad.',

    launchHeading: 'Zonas de Despegue Estimadas y Movimiento del Globo',
    launchIntro: 'El terreno de Capadocia y las condiciones cambiantes del viento hacen que las ubicaciones de despegue de los globos puedan variar. Nuestro análisis puede considerar zonas alrededor de:',
    launchAreas: ['Göreme', 'Çavuşin', 'Valle del Amor', 'Uçhisar', 'Paşabağ', 'Zelve', 'Ortahisar', 'Kızılçukur'],
    launchOutro: 'También podemos ofrecer una dirección general estimada del movimiento de los globos, basada en los patrones de viento previstos. Se trata únicamente de estimaciones meteorológicas y no de asignaciones oficiales de despegue ni rutas de vuelo.',

    launchPhoto: {
      src: '/images/flight-status/cappadocia-balloon-launch-sunrise.webp',
      alt: 'Despegue de globos aerostáticos antes del amanecer en Capadocia',
      caption: 'Globos aerostáticos preparándose para despegar antes del amanecer en Capadocia.',
    },

    officialMap: {
      src: '/images/flight-status/shgm-official-flight-area-map.webp',
      caption: 'Mapa Oficial de la Zona de Vuelo de Globos en Capadocia – SHGM',
      note: 'El mapa oficial siempre debe consultarse junto con la información más reciente publicada por la autoridad competente.',
    },
    ownMap: {
      src: '/images/flight-status/weather-based-balloon-map.webp',
      caption: 'ESTIMACIÓN NO OFICIAL BASADA EN EL TIEMPO – SOLO PARA PLANIFICACIÓN DE VIAJE',
      itemsHeading: 'Este mapa independiente puede mostrar:',
      items: ['Zonas de despegue estimadas', 'Dirección estimada del viento', 'Movimiento estimado del globo', 'Zonas potenciales de observación', 'Principales valles y ubicaciones de Capadocia'],
    },

    sunriseHeading: '¿Por Qué Vuelan los Globos de Capadocia al Amanecer?',
    sunriseBody: [
      'Uno de los espectáculos más famosos de Capadocia es la gran cantidad de globos que aparecen en el cielo alrededor del amanecer.',
      'Los vuelos en globo aerostático suelen programarse cerca del amanecer porque la actividad térmica suele ser menor en las primeras horas de la mañana, antes de que el suelo se caliente intensamente por el sol.',
      'La mañana también ofrece una hermosa luz de amanecer y, cuando las condiciones meteorológicas son favorables, vistas espectaculares de los valles de Capadocia.',
      'Esta combinación convierte a los vuelos en globo al amanecer en Capadocia en una de las experiencias más populares de la región.',
    ],
    heroPhoto: {
      src: '/images/flight-status/cappadocia-balloons-sunrise-goreme.webp',
      alt: 'Globos aerostáticos volando sobre Göreme al amanecer en Capadocia',
    },

    weatherFactorsHeading: 'Condiciones Meteorológicas que Pueden Afectar a un Vuelo en Globo',
    weatherFactorsIntro: 'El clima es uno de los factores más importantes en las operaciones de globos. Entre las condiciones que se pueden monitorear se incluyen:',
    weatherFactors: [
      'Viento en superficie', 'Dirección del viento y ráfagas', 'Visibilidad', 'Base de nubes', 'Niebla y bruma',
      'Lluvia y nieve', 'Tormentas y desarrollo de CB', 'Actividad térmica', 'Estabilidad atmosférica',
    ],
    weatherFactorsNote1: 'Como referencia general, vientos en superficie superiores a aproximadamente 10 nudos (18 km/h) pueden no ser adecuados para las operaciones de globos, dependiendo de la situación meteorológica y operativa completa.',
    weatherFactorsNote2: 'La lluvia o la nieve no determinan automáticamente las condiciones de un vuelo futuro. Si las condiciones mejoran posteriormente lo suficiente, un vuelo posterior podría ser posible.',
    weatherFactorsNote3: 'La decisión final depende de la evaluación operativa completa, no de un único parámetro meteorológico.',

    slotHeading: 'Entendiendo el Sistema de Franjas Horarias de Globos en Capadocia',
    slotBody: [
      'Las operaciones comerciales de globos en Capadocia se llevan a cabo dentro de un sistema oficial de franjas horarias y zonas de vuelo.',
      'Que una empresa tenga cierto número de globos no significa automáticamente que todos esos globos puedan volar comercialmente la misma mañana.',
      'Las operaciones comerciales se realizan de acuerdo con la asignación de franjas horarias aplicable, la capacidad del operador, la capacidad de pasajeros y las normativas de aviación.',
      'Este sistema ayuda a gestionar el tráfico de globos en Capadocia y respalda el funcionamiento organizado de uno de los destinos de globos aerostáticos más activos del mundo.',
    ],

    pilotHeading: 'Experiencia Profesional en Globos Aerostáticos',
    pilotBody: [
      'Este análisis ha sido preparado y revisado con experiencia profesional en globos aerostáticos.',
      'El piloto experto de globos Vahit SERTTAŞ tiene más de 550 horas de experiencia en vuelos en globo. Su experiencia profesional contribuye a la interpretación de la información meteorológica y operativa presentada en esta página.',
      'Las operaciones previas al vuelo pueden incluir la revisión de los partes meteorológicos, la evaluación de las condiciones del viento, el cálculo de la carga del globo, la preparación del equipo de vuelo y la coordinación con el equipo de tierra.',
    ],
    pilotEquipmentIntro: 'Dependiendo de la operación y los requisitos aplicables, el equipo puede incluir:',
    pilotEquipment: ['Variómetro', 'Altímetro', 'GPS', 'Radio de aviación', 'Sistemas de comunicación con tierra'],
    pilotNote: 'La experiencia profesional nos ayuda a ofrecer contexto adicional, pero no garantiza las condiciones meteorológicas futuras ni la operación de un vuelo.',

    comparisonHeading: 'Información Oficial y Nuestro Análisis Adicional',
    comparisonIntro: 'Creemos que es importante distinguir claramente entre la información oficial y nuestro propio análisis.',
    comparisonRows: [
      ['Normativa de aviación', 'SHGM Oficial'],
      ['Información aeronáutica de Capadocia', 'SHGM / SHM Oficial'],
      ['Meteorología aeronáutica de Capadocia', 'MGM Hezarfen Oficial'],
      ['Modelos meteorológicos internacionales', 'ECMWF / ICON'],
      ['Probabilidad estimada de vuelo', 'Nuestro análisis adicional'],
      ['Zona de despegue estimada', 'Nuestro análisis adicional'],
      ['Movimiento estimado del globo', 'Nuestro análisis adicional'],
      ['Orientación para la observación', 'Nuestro análisis adicional'],
    ],
    comparisonOutro: 'La información oficial sigue siendo oficial. Nuestra interpretación sigue siendo nuestro análisis independiente.',

    disclaimerHeading: 'Análisis Experto y Aviso Legal',
    disclaimerSubheading: 'Preparado y Revisado por Vahit SERTTAŞ',
    disclaimerBody: [
      'Este análisis del Estado de Vuelos en Globo en Capadocia ha sido preparado y revisado por el piloto experto de globos aerostáticos Vahit SERTTAŞ.',
      'El análisis combina información disponible públicamente de fuentes oficiales de aviación y meteorología turcas, incluyendo SHGM / SHM y MGM Hezarfen, con modelos meteorológicos internacionales como ECMWF e ICON.',
      'Nuestro propósito es ofrecer a los viajeros información adicional basada en el clima y contexto profesional al planificar su experiencia en globo en Capadocia.',
      'Tatildokya Travels no es una autoridad aeronáutica y no emite permisos oficiales de vuelo, cancelaciones, autorizaciones operativas ni instrucciones aeronáuticas.',
      'Todas las estimaciones e interpretaciones de esta página son no oficiales y se ofrecen únicamente con fines informativos y de planificación de viajes. La decisión oficial de vuelo siempre tiene prioridad.',
      'Si cree que alguna información de esta página es incorrecta, está desactualizada o necesita aclaración, póngase en contacto con nosotros. Agradecemos sus comentarios y revisaremos la información cuando corresponda.',
    ],
    preparedByLabel: 'Preparado y Revisado Por',
    pilotName: 'Vahit SERTTAŞ',
    pilotTitle: 'Piloto Experto de Globos Aerostáticos',

    relatedHeading: 'Continúa Planificando tu Vuelo en Globo en Capadocia',
    relatedLinks: [
      { label: 'Todos los Tours en Globo en Capadocia', href: '/es/balloon-tours/' },
      { label: 'Tour en Globo Aerostático Estándar de Göreme', href: '/es/tours/goreme-standart-hot-air-balloon-tour/' },
      { label: 'Tour en Globo Aerostático Comfort de Göreme', href: '/es/tours/goreme-comfort-hot-air-balloon-tour/' },
    ],
  },
};
