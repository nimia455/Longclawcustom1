import type { ChatModelId } from './models';

export type Language = 'en' | 'tr';

export interface Translations {
  common: {
    close: string;
    newChat: string;
    defaultUser: string;
    loading: string;
  };
  app: {
    emailVerifiedBanner: string;
    emailVerifyErrorBanner: string;
  };
  models: Record<
    ChatModelId,
    {
      tagline: string;
      description: string;
    }
  >;
  nav: {
    whatItDoes: string;
    depths: string;
    benchmarks: string;
    faq: string;
    toggleTheme: string;
    signIn: string;
    start: string;
    chooseLanguage: string;
  };
  landing: {
    poweredBy: string;
    heroTitleLine1: string;
    heroTitleLine2: string;
    heroSubtitle: string;
    startFree: string;
    benchmarksCta: string;
    demoConversations: { q: string; a: string }[];
    sidebarMockTitle: string;
    familyEyebrow: string;
    familyTitle: string;
    familySubtitle: string;
    compareBenchmarks: string;
    timelineTitle: string;
    timelineItems: {
      time: string;
      title: string;
      prompt: string;
      answer: string;
    }[];
    depthsTitle: string;
    depthsSubtitle: string;
    depthPrompt: string;
    depthAnswers: {
      title: string;
      desc: string;
      width: string;
      text: string;
    }[];
    checklistTitle: string;
    checklistItems: string[];
    mockSearchPlaceholder: string;
    mockPinnedTitle: string;
    mockNote1: string;
    mockNote2: string;
    mockNote3: string;
    faqTitle: string;
    faqs: { q: string; a: string }[];
    getStartedNow: string;
    footerTagline: string;
    footerNavHeading: string;
    footerBackToTop: string;
    footerLegalHeading: string;
    footerPrivacy: string;
    footerTerms: string;
    footerKvkk: string;
    footerCopyright: string;
  };
  benchmarks: {
    backToHome: string;
    eyebrow: string;
    title: string;
    subtitle: string;
    testYourself: string;
    takeaways: {
      ultra12: string;
      ultra11: string;
      pro11: string;
      low11: string;
    };
    tabs: {
      all: string;
      general: string;
      coding: string;
      math: string;
      speed: string;
    };
    legendLongclaw: string;
    legendOthers: string;
    cards: Record<
      string,
      {
        title: string;
        subtitle: string;
        unit: string;
        note: string;
      }
    >;
    tableTitle: string;
    tableSubtitle: string;
    scrollHint: string;
    colModel: string;
    colSpeed: string;
    speedUnit: string;
    methodologyNote: string;
    startChatting: string;
  };
  auth: {
    titleForgot: string;
    titleDefault: string;
    subtitle: string;
    backToSignIn: string;
    forgotDesc: string;
    emailPlaceholder: string;
    sending: string;
    sendVerificationEmail: string;
    haveCodePrompt: string;
    verificationStepTitle: string;
    verificationStepVerified: (email: string) => string;
    verificationStepDefault: string;
    codePlaceholder: string;
    newPasswordPlaceholder: string;
    verifying: string;
    verifyAndUpdatePassword: string;
    resendVerificationEmail: string;
    continueWithGoogle: string;
    continueWithApple: string;
    orWithEmail: string;
    tabSignIn: string;
    tabSignUp: string;
    namePlaceholder: string;
    emailShortPlaceholder: string;
    passwordPlaceholder: string;
    forgotPasswordLink: string;
    tosPrefix: string;
    tosTerms: string;
    tosAnd: string;
    tosPrivacy: string;
    tosSuffix: string;
    processing: string;
    createAccount: string;
    signInBtn: string;
    footerSecurity: string;
    errors: {
      popupClosed: string;
      accountExistsDifferentCred: string;
      googleGeneric: string;
      applePopupClosed: string;
      appleNotAllowed: string;
      appleGeneric: string;
      invalidEmail: string;
      shortPassword: string;
      acceptTos: string;
      accountCreatedInfo: string;
      emailInUse: string;
      invalidCredential: string;
      userNotFound: string;
      operationNotAllowed: string;
      genericAuth: string;
      invalidEmailReset: string;
      resetSentInfo: (email: string) => string;
      resetUserNotFound: string;
      resetSendFailed: (msg: string) => string;
      missingResetCode: string;
      shortNewPassword: string;
      resetSuccessInfo: (email: string) => string;
      expiredActionCode: string;
      invalidActionCode: string;
      resetVerifyFailed: string;
    };
  };
  legal: {
    close: string;
    docs: {
      gizlilik: { title: string; content: string[] };
      sartlar: { title: string; content: string[] };
      kvkk: { title: string; content: string[] };
    };
  };
  chat: {
    suggestions: string[];
    backToLandingTitle: string;
    closeMenuAria: string;
    newChatTitle: string;
    searchPlaceholder: string;
    searchTitle: string;
    noResults: string;
    noChatsYet: string;
    unpinTitle: string;
    pinTitle: string;
    renameTitle: string;
    deleteTitle: string;
    emailVerified: string;
    emailUnverified: string;
    switchToLight: string;
    switchToDark: string;
    switchLanguageLabel: string;
    signOut: string;
    deleteAccountConfirm: string;
    deleteAccount: string;
    openSidebarAria: string;
    sidebarLabel: string;
    hideSidebar: string;
    showSidebar: string;
    depthFast: string;
    depthFastTitle: string;
    depthMid: string;
    depthMidTitle: string;
    depthDeep: string;
    depthDeepTitle: string;
    exportMarkdownTitle: string;
    emailUnverifiedBanner: (email: string) => string;
    emailVerificationSent: string;
    emailSendFailed: string;
    sendVerification: string;
    emailStillUnverified: string;
    checkAgain: string;
    helloUser: (name: string) => string;
    defaultFriendName: string;
    emptySubtitle: string;
    thoughtsLabel: string;
    secondsShort: string;
    copied: string;
    copy: string;
    regenerate: string;
    thinking: string;
    inputPlaceholder: string;
    attachFileTitle: string;
    selectModelTitle: string;
    modelSelectionAria: string;
    chooseModel: string;
    otherModels: string;
    stopTitle: string;
    sendTitle: string;
    composerHint: string;
    effortLow: string;
    effortBalanced: string;
    effortHigh: string;
    stoppedFallback: string;
    readBodyError: string;
    streamError: string;
    noResponseFallback: string;
    chatErrorMessage: (msg: string) => string;
    connectionError: string;
    fileLabel: string;
    exportUserLabel: string;
    codePreview: {
      openResult: string;
      copyCode: string;
      copiedCode: string;
      liveResultTitle: string;
      previewTab: string;
      codeTab: string;
      consoleTab: string;
      rerunTitle: string;
      downloadTitle: string;
      expandTitle: string;
      restoreTitle: string;
      closeTitle: string;
      desktopView: string;
      mobileView: string;
      clearConsole: string;
      noConsoleOutput: string;
    };
  };
}

export const TRANSLATIONS: Record<Language, Translations> = {
  tr: {
    common: {
      close: 'Kapat',
      newChat: 'Yeni sohbet',
      defaultUser: 'Kullanıcı',
      loading: 'Yükleniyor...',
    },
    app: {
      emailVerifiedBanner: 'E-posta adresiniz başarıyla doğrulandı!',
      emailVerifyErrorBanner: 'E-posta doğrulama bağlantısı geçersiz veya süresi dolmuş.',
    },
    models: {
      'longclaw-clawing-1.2-ultra': {
        tagline: 'MMLU-Pro Uzmanı',
        description:
          'MMLU-Pro ve doktora düzeyi çok adımlı akıl yürütme için geliştirilen amiral gemisi canavar model.',
      },
      'longclaw-clawing-1.1-ultra': {
        tagline: 'Ultra',
        description:
          'En zorlu mimari tasarım, uzun araştırma ve çok adımlı akıl yürütme için üst seviye.',
      },
      'longclaw-clawing-1.1-pro': {
        tagline: 'Yeni · Gelişmiş',
        description:
          'Clawing 1.1 temelinin Pro yükseltmesi; daha keskin kodlama, güçlü bağlam takibi ve hızlı Pro yanıtlar.',
      },
      'longclaw-clawing-1-pro': {
        tagline: 'Önceki Pro',
        description:
          'Karmaşık problemler, kodlama ve derin akıl yürütme için önceki nesil Pro modeli.',
      },
      'longclaw-clawing-1.1-low': {
        tagline: 'Yeni · Ultra Hızlı',
        description:
          '1 Low’un geliştirilmiş 1.1 sürümü; daha keskin Türkçe, temiz biçimlendirme ve sıfır gecikmeye yakın yanıtlar.',
      },
      'longclaw-clawing-1.1': {
        tagline: 'Yeni · Standart',
        description:
          '1.1 nesli standart model; daha doğal Türkçe, düzenli anlatım ve akıcı günlük sohbetler için.',
      },
    },
    nav: {
      whatItDoes: 'Neler yapar',
      depths: 'Derinlikler',
      benchmarks: 'Benchmark',
      faq: 'Sorular',
      toggleTheme: 'Temayı değiştir',
      signIn: 'Giriş yap',
      start: 'Başla',
      chooseLanguage: 'Dil seçin',
    },
    landing: {
      poweredBy: 'LongClaw Clawing ile güçlendirilmiş',
      heroTitleLine1: 'Aklındakini yaz,',
      heroTitleLine2: 'Longclaw toparlasın.',
      heroSubtitle:
        'E-posta yazarken, uzun bir metni okumaya üşenirken ya da bir konuyu üçüncü kez anlamaya çalışırken yanında duran sessiz arkadaş.',
      startFree: 'Ücretsiz başla',
      benchmarksCta: 'Benchmarklar',
      demoConversations: [
        {
          q: 'Toplantıyı ertelemek için kısa bir mesaj yaz.',
          a: 'Merhaba, yarınki toplantıyı perşembeye alabilir miyiz? Önüme beklenmedik acil bir iş çıktı.',
        },
        {
          q: '“Görüşmek üzere” İngilizcede nasıl denir?',
          a: 'Resmi yazışmada “Looking forward to speaking with you”, samimi ortamda “See you soon” iyi çalışır.',
        },
        {
          q: 'Bunu daha samimi yap: Talebiniz değerlendirilmiştir.',
          a: 'Mesajını aldım, hemen bir bakıp sana dönüyorum!',
        },
      ],
      sidebarMockTitle: 'Günlük Notlar',
      familyEyebrow: 'LongClaw Clawing Ailesi',
      familyTitle: 'Her ihtiyaca uygun dört ayrı model.',
      familySubtitle:
        'Sohbet çubuğundan dilediğin an 1.2 Ultra, Ultra, Pro veya hızlı moda geç.',
      compareBenchmarks: 'Diğer modellerle kıyasla (Benchmark)',
      timelineTitle: 'Bir günde Longclaw’a ne sorulur?',
      timelineItems: [
        {
          time: '09:12',
          title: 'Kısa bir e-posta',
          prompt: '“Müşteriye teşekkür eden iki cümlelik bir mail yaz.”',
          answer:
            '“Merhaba, desteğiniz ve güveniniz için içtenlikle teşekkür ederiz. Bir sonraki adımı sizinle planlamaktan memnuniyet duyarız.”',
        },
        {
          time: '11:40',
          title: 'Toplantı notları',
          prompt: '“Bu dağınık notları üç maddeye indir.”',
          answer:
            '• Bütçe revizyonu onaylandı\n• Lansman tarihi 14 Kasım olarak belirlendi\n• Arayüz tasarımları cuma günü teslim edilecek',
        },
        {
          time: '14:05',
          title: 'İngilizce bir cümle',
          prompt: '“Bunu daha resmi ve nazik nasıl söylerim?”',
          answer: '“Would you mind sharing the updated project report by Friday afternoon?”',
        },
        {
          time: '17:30',
          title: 'Yarının planı',
          prompt: '“Yarın için öncelikli yapılacaklar listesi hazırla.”',
          answer:
            '1. Çeyrek raporunu tamamla\n2. Faturaları muhasebeye ilet\n3. Diş hekimi randevusunu takvime işle',
        },
        {
          time: '22:10',
          title: 'Ders çalışırken',
          prompt: '“Osmoz ile difüzyon arasındaki temel fark ne?”',
          answer:
            'Osmoz sadece su moleküllerinin yarı geçirgen bir zardan geçişidir. Difüzyon ise genel olarak herhangi bir maddenin yüksek yoğunluklu ortamdan düşük yoğunluklu ortama kendiliğinden yayılmasıdır.',
        },
      ],
      depthsTitle: 'Aynı soru, üç derinlik.',
      depthsSubtitle:
        'Aynı model; Hızlı, Orta ve Derin düşünme eforlarıyla nasıl yanıt verir? İncele.',
      depthPrompt: '“Neden gökyüzü mavi?”',
      depthAnswers: [
        {
          title: 'Hızlı',
          desc: 'Acelen varsa ve soru basitse.',
          width: '30%',
          text: 'Güneş ışığındaki mavi, atmosferdeki gaz moleküllerinde en çok saçılan renk olduğu için.',
        },
        {
          title: 'Orta',
          desc: 'Günlük işlerin ve genel açıklamaların çoğu için.',
          width: '65%',
          text: 'Güneş ışığı beyaz görünür ama aslında tüm renkleri barındırır. Atmosferdeki gaz molekülleri kısa dalga boylu mavi ışığı diğer renklere göre çok daha fazla saçar.\n\nBu saçılan mavi her yönden gözümüze ulaştığı için gökyüzünü mavi görürüz.',
        },
        {
          title: 'Derin',
          desc: 'Karmaşık konular, karşılaştırmalar, neden-sonuç zinciri.',
          width: '100%',
          text: 'Bu olaya Rayleigh saçılması denir. Saçılma şiddeti ışığın dalga boyunun dördüncü kuvvetiyle ters orantılıdır; yani yaklaşık 450 nm dalga boyundaki mavi ışık, kırmızıya oranla atmosfere girdiğinde 6 kata yakın daha fazla saçılır.\n\nPeki neden mor değil? Çünkü Güneş spektrumu moru mavi kadar yoğun yaymaz ve insan gözündeki reseptörler maviye çok daha duyarlıdır.',
        },
      ],
      checklistTitle: 'Küçük şeyler',
      checklistItems: [
        'Google, Apple ve E-posta doğrulamalı güvenli giriş',
        'Firebase Firestore ile tüm cihazlarda bulut eşitleme',
        'Tek model üzerinde Hızlı / Orta / Derin düşünme eforu',
        'Görünür yapay zekâ düşünce adımları ve canlı kod sonucu önizleme',
        'Hızlı klavye kısayolları: Yeni sohbet (Ctrl/⌘ + K) ve Kenar çubuğu (Ctrl/⌘ + B)',
        'Önemli konuşmaları üste sabitleme',
        'Kod ve metin dosyası ekleme (.txt, .md, .py)',
        'Yanıtı tek tıkla kopyalama & Markdown dışa aktarma',
        'Açık ve koyu tema desteği',
      ],
      mockSearchPlaceholder: 'özet...',
      mockPinnedTitle: 'Toplantı özeti (Sabitlenmiş)',
      mockNote1: 'Özet çıkarma yöntemleri',
      mockNote2: 'Haftalık plan',
      mockNote3: 'İngilizce e-posta taslağı',
      faqTitle: 'Merak edilenler',
      faqs: [
        {
          q: 'Ücretli mi?',
          a: 'Longclaw’ı denemek tamamen ücretsizdir. Firebase ve Google Gemini altyapısıyla çalışır.',
        },
        {
          q: 'Yazdıklarım nerede saklanıyor?',
          a: 'Oturum açtığında tüm sohbetlerin Firebase Firestore üzerinde güvenle şifrelenerek hesabına kaydedilir. Dilediğin an tüm verilerini silebilirsin.',
        },
        {
          q: 'Google ve Apple ile nasıl giriş yapabilirim?',
          a: 'Giriş ekranında yer alan Google veya Apple düğmesine basarak şifre girmeden tek tıkla hesabına bağlanabilirsin.',
        },
        {
          q: 'Hangi dillerde çalışır?',
          a: 'Arayüzü Türkçe veya İngilizce kullanabilir, sohbette ise hangi dilde yazarsan o dilde doğal ve akıcı yanıt alırsın.',
        },
      ],
      getStartedNow: 'Hemen Başla',
      footerTagline: 'Yaz, özetle, çevir, düşün. Hepsi tek bir sohbette.',
      footerNavHeading: 'Gezinme',
      footerBackToTop: 'Başa dön',
      footerLegalHeading: 'Yasal & Güvenlik',
      footerPrivacy: 'Gizlilik Politikası',
      footerTerms: 'Kullanım Şartları',
      footerKvkk: 'KVKK Aydınlatma Metni',
      footerCopyright: 'Longclaw © 2026. Tüm hakları saklıdır.',
    },
    benchmarks: {
      backToHome: 'Ana sayfaya dön',
      eyebrow: 'Değerlendirme ve Kıyaslama · Kasım 2026',
      title: 'Diğer modellerle gerçekçi kıyaslama.',
      subtitle:
        'MMLU-Pro için özel geliştirilen yeni Longclaw Clawing 1.2 Ultra ve tüm LongClaw ailesini Türkçe dil nüansı, akademik bilgi, kodlama, matematik ve yanıt hızı testlerinde rakip modellerle karşılaştırdık.',
      testYourself: 'Kendin test et',
      takeaways: {
        ultra12:
          'MMLU-Pro (84.6%) ve GPQA Diamond (71.4%) lideri; doktora seviyesi çok adımlı akıl yürütme canavarı.',
        ultra11:
          'Türkçe nüans (86.8%) ve talimat uyumunda güçlü; 1.2 Ultra öncesi mimari ve araştırma standardı.',
        pro11:
          'Clawing 1.1’in Pro yükseltmesi: 61.2% LiveCodeBench ve 88 tok/s hızıyla dengeli günlük Pro.',
        low11:
          '1 Low’un 1.1 yükseltmesi: 184 tok/s hız ve 79.8% Türkçe skoruyla hem anlık hem isabetli.',
      },
      tabs: {
        all: 'Tümü',
        general: 'Türkçe & Bilgi',
        coding: 'Kodlama',
        math: 'Matematik & Mantık',
        speed: 'Hız & Uyum',
      },
      legendLongclaw: 'LongClaw modelleri',
      legendOthers: 'Diğer modeller',
      cards: {
        'tr-bench': {
          title: 'TR-Bench (Türkçe Anlama & Nüans)',
          subtitle: 'Deyim, resmi dil, özetleme ve bağlam tutarlılığı değerlendirmesi',
          unit: '%',
          note: '5-shot · İnsan değerlendirmesi + otomatik doğrulama',
        },
        'mmlu-pro': {
          title: 'MMLU-Pro',
          subtitle: '14 farklı akademik ve mesleki alanda çoktan seçmeli genel bilgi',
          unit: '%',
          note: 'Zero-shot CoT · 10 seçenekli zorlu set',
        },
        livecodebench: {
          title: 'LiveCodeBench',
          subtitle: 'Güncel yarışma ve algoritma problemlerinde tek denemede çözüm oranı',
          unit: '%',
          note: 'Pass@1 · Zaman sızıntısı olmayan güncel problemler',
        },
        'swe-bench': {
          title: 'SWE-bench Verified',
          subtitle: 'Gerçek açık kaynak kod depolarında hata tespiti ve yama üretimi',
          unit: '%',
          note: 'Agentless harness · 500 doğrulanmış GitHub görevi',
        },
        'math-500': {
          title: 'MATH-500',
          subtitle: 'Lise ve olimpiyat seviyesinde çok adımlı matematiksel akıl yürütme',
          unit: '%',
          note: 'Zero-shot · Adım adım çözüm doğrulaması',
        },
        'gpqa-diamond': {
          title: 'GPQA Diamond',
          subtitle: 'Fizik, kimya ve biyolojide doktora düzeyinde muhakeme soruları',
          unit: '%',
          note: 'Zero-shot · Uzmanların bile zorlandığı alt küme',
        },
        ifeval: {
          title: 'IFEval (Talimat Uyumu)',
          subtitle: 'Biçim, uzunluk, ton ve kısıt kurallarına birebir sadık kalma oranı',
          unit: '%',
          note: 'Strict Prompt Accuracy · Günlük iş akışları için kritik metrik',
        },
        throughput: {
          title: 'Çıktı Hızı (Token / saniye)',
          subtitle: 'Orta efor seviyesinde saniyede üretilen ortalama token miktarı',
          unit: ' tok/s',
          note: 'Medyan akış hızı · Yüksek değer daha hızlıdır',
        },
      },
      tableTitle: 'Özet kıyaslama tablosu',
      tableSubtitle: 'Tüm modellerin temel değerlendirme setlerindeki puanları yan yana.',
      scrollHint: 'Tabloyu yana kaydır',
      colModel: 'Model',
      colSpeed: 'Hız',
      speedUnit: 'tok/s',
      methodologyNote:
        'Not: LongClaw skorları Orta/Derin düşünme eforu ayarında, rakip modeller ise kamuya açık standart API sürümleriyle aynı test protokolünde ölçülmüştür.',
      startChatting: 'Sohbete başla',
    },
    auth: {
      titleForgot: 'Şifre Sıfırlama & Doğrulama',
      titleDefault: 'Longclaw’a Hoş Geldin',
      subtitle: 'Google Firebase & Gemini destekli akıllı asistan',
      backToSignIn: 'Giriş ekranına dön',
      forgotDesc:
        'Hesabınıza kayıtlı e-posta adresinizi girin. Kimliğinizi doğrulamanız için size bir doğrulama ve şifre sıfırlama bağlantısı göndereceğiz.',
      emailPlaceholder: 'E-posta adresiniz',
      sending: 'Gönderiliyor...',
      sendVerificationEmail: 'Doğrulama E-postası Gönder',
      haveCodePrompt: 'Zaten doğrulama kodun var mı? Kodu gir',
      verificationStepTitle: 'E-posta Doğrulama Adımı',
      verificationStepVerified: (email) =>
        `${email} adresi doğrulandı. Yeni şifrenizi belirleyin.`,
      verificationStepDefault:
        'E-postanızdaki sıfırlama bağlantısına doğrudan tıklayabilir veya bağlantıdaki doğrulama kodunu aşağıya yapıştırarak şifrenizi yenileyebilirsiniz.',
      codePlaceholder: 'E-postadaki doğrulama kodu veya bağlantısı',
      newPasswordPlaceholder: 'Yeni şifre (en az 6 karakter)',
      verifying: 'Doğrulanıyor...',
      verifyAndUpdatePassword: 'E-postayı Doğrula ve Şifreyi Güncelle',
      resendVerificationEmail: 'Doğrulama e-postasını tekrar gönder',
      continueWithGoogle: 'Google ile Devam Et',
      continueWithApple: 'Apple ile Giriş Yap',
      orWithEmail: 'veya e-posta ile',
      tabSignIn: 'Giriş yap',
      tabSignUp: 'Kayıt ol',
      namePlaceholder: 'Adın',
      emailShortPlaceholder: 'E-posta',
      passwordPlaceholder: 'Şifre (en az 6 karakter)',
      forgotPasswordLink: 'Şifremi unuttum (E-posta ile doğrula)',
      tosPrefix: '',
      tosTerms: 'Kullanım Şartları',
      tosAnd: '’nı ve ',
      tosPrivacy: 'Gizlilik Politikası',
      tosSuffix: '’nı okudum, kabul ediyorum.',
      processing: 'İşleniyor...',
      createAccount: 'Hesap oluştur',
      signInBtn: 'Giriş yap',
      footerSecurity: 'Verileriniz Firebase Firestore üzerinde şifrelenir ve korunur.',
      errors: {
        popupClosed: 'Giriş penceresi kapatıldı.',
        accountExistsDifferentCred:
          'Bu e-posta adresiyle başka bir oturum sağlayıcısı ilişkilendirilmiş.',
        googleGeneric: 'Google ile giriş yapılırken bir sorun oluştu.',
        applePopupClosed: 'Apple giriş penceresi kapatıldı.',
        appleNotAllowed: 'Apple ile giriş Firebase konsolunda etkinleştirilmemiş.',
        appleGeneric: 'Apple ile giriş yapılırken bir hata oluştu.',
        invalidEmail: 'Lütfen geçerli bir e-posta adresi girin.',
        shortPassword: 'Şifre en az 6 karakter olmalıdır.',
        acceptTos:
          'Devam etmek için Kullanım Şartları ve Gizlilik Politikasını kabul etmelisiniz.',
        accountCreatedInfo:
          'Hesabınız oluşturuldu ve e-posta adresinize doğrulama bağlantısı gönderildi.',
        emailInUse: 'Bu e-posta adresi zaten kayıtlı. Giriş yapmayı deneyin.',
        invalidCredential: 'E-posta veya şifre hatalı.',
        userNotFound: 'Bu e-posta ile kayıtlı bir hesap bulunamadı.',
        operationNotAllowed:
          'E-posta/şifre girişi Firebase Console > Authentication üzerinden etkinleştirilmelidir.',
        genericAuth: 'İşlem sırasında bir hata oluştu.',
        invalidEmailReset:
          'Doğrulama e-postası için lütfen geçerli bir e-posta adresi girin.',
        resetSentInfo: (email) =>
          `${email} adresine şifre sıfırlama ve e-posta doğrulama bağlantısı gönderildi. Gelen kutunuzdaki bağlantıya tıklayın veya bağlantıdaki doğrulama kodunu aşağıya girin.`,
        resetUserNotFound: 'Bu e-posta adresine kayıtlı bir kullanıcı bulunamadı.',
        resetSendFailed: (msg) => `Doğrulama e-postası gönderilemedi: ${msg}`,
        missingResetCode:
          'Lütfen e-postanızdaki doğrulama kodunu veya bağlantısını yapıştırın.',
        shortNewPassword: 'Yeni şifreniz en az 6 karakter olmalıdır.',
        resetSuccessInfo: (email) =>
          `${email} hesabı doğrulandı ve şifreniz güncellendi! Şimdi yeni şifrenizle giriş yapabilirsiniz.`,
        expiredActionCode:
          'Doğrulama kodunun süresi dolmuş. Lütfen yeni bir doğrulama e-postası isteyin.',
        invalidActionCode: 'Geçersiz veya daha önce kullanılmış doğrulama kodu.',
        resetVerifyFailed: 'Şifre sıfırlama doğrulanamadı.',
      },
    },
    legal: {
      close: 'Kapat',
      docs: {
        gizlilik: {
          title: 'Gizlilik Politikası',
          content: [
            'Bu politika, Longclaw’ı kullanırken hangi verilerin işlendiğini ve nasıl korunduğunu açıklar. Hizmetimiz, kullanıcılarımızın gizliliğini en yüksek standartlarda korumayı taahhüt eder.',
            'Hangi verileri topluyoruz? Firebase Authentication aracılığıyla hesap bilgilerin (ad, e-posta adresi, profil fotoğrafı), Firestore üzerinde güvenle şifrelenmiş sohbet kayıtların ve tercihleriniz (tema, derinlik modu).',
            'Ne için kullanıyoruz? Sohbet geçmişini cihazlarınız arasında güvenle eşitlemek, akıllı Gemini yanıtları üretmek ve oturum güvenliğini sağlamak için.',
            'Kimlerle paylaşıyoruz? Veritabanı ve kimlik doğrulama için Google Firebase, yapay zekâ yanıtları üretmek için Google Gemini API kullanılır. Verileriniz asla üçüncü taraflara satılmaz veya pazarlama amacıyla paylaşılmaz.',
            'Saklama ve silme: Sohbet geçmişinizi dilediğiniz zaman tek tek veya profil menüsünden hesabınızı ve tüm verilerinizi tamamen silebilirsiniz.',
          ],
        },
        sartlar: {
          title: 'Kullanım Şartları',
          content: [
            'Longclaw’a hoş geldiniz. Hizmeti kullanarak bu şartları kabul etmiş olursunuz.',
            'Hizmet kapsamı: Longclaw; düşünme, yazma, özetleme ve araştırma süreçlerinizde size yardımcı olan bir yapay zekâ asistanıdır.',
            'Yapay zekâ yanıtları: Yapay zekâ modelleri bazen hatalı veya eksik bilgi üretebilir. Verilen yanıtlar medikal, yasal veya finansal profesyonel tavsiye niteliği taşımaz; kritik kararlarda teyit edilmelidir.',
            'Kabul edilebilir kullanım: Hizmeti yasa dışı faaliyetler, kötü amaçlı içerik üretimi veya sistem güvenliğini aksatacak müdahaleler için kullanamazsınız.',
            'Hesap güvenliği: Oturum bilgilerinizi güvende tutmak kullanıcının sorumluluğundadır.',
          ],
        },
        kvkk: {
          title: 'KVKK Aydınlatma Metni',
          content: [
            '6698 sayılı Kişisel Verilerin Korunması Kanunu uyarınca aydınlatma metnidir.',
            'İşlenen kişisel veriler: Kimlik bilgisi (Ad, Soyad), iletişim bilgisi (E-posta), kullanıcı işlem kayıtları ve sohbet içerikleri.',
            'Veri işleme amaçları: Kullanıcı kaydının oluşturulması, yapay zekâ asistan hizmetinin sunulması, veri kaybının önlenmesi ve bilgi güvenliğinin sağlanması.',
            'Veri aktarımı: Kimlik doğrulama ve veritabanı altyapısı Google Firebase üzerinden, yapay zekâ işleme katmanı Google Gemini API üzerinden sunulmaktadır.',
            'Haklarınız: KVKK’nın 11. maddesi uyarınca verilerinize erişme, düzeltilmesini talep etme ve silinmesini isteme hakkına sahipsiniz.',
          ],
        },
      },
    },
    chat: {
      suggestions: [
        'Kuantum bilgisayarları basitçe anlat',
        'Zaman yönetimimi nasıl iyileştirebilirim?',
        'Müşteriye teşekkür eden samimi ve kısa bir e-posta yaz',
        'Bu metni üç ana maddede özetle:',
      ],
      backToLandingTitle: 'Tanıtım sayfasına dön',
      closeMenuAria: 'Menüyü kapat',
      newChatTitle: 'Yeni sohbet',
      searchPlaceholder: 'Sohbetlerde ara (/)',
      searchTitle: 'Sohbetlerde ara',
      noResults: 'Sonuç bulunamadı',
      noChatsYet: 'Henüz sohbet yok',
      unpinTitle: 'Sabitlemeyi kaldır',
      pinTitle: 'Üste sabitle',
      renameTitle: 'Yeniden adlandır',
      deleteTitle: 'Sil',
      emailVerified: 'E-posta Doğrulandı',
      emailUnverified: 'E-posta Onaysız',
      switchToLight: 'Açık temaya geç',
      switchToDark: 'Koyu temaya geç',
      switchLanguageLabel: 'Dil: Türkçe (English’e geç)',
      signOut: 'Çıkış yap',
      deleteAccountConfirm: 'Emin misin? Tekrar tıkla',
      deleteAccount: 'Hesabı ve verileri sil',
      openSidebarAria: 'Kenar çubuğunu aç',
      sidebarLabel: 'Kenar çubuğu',
      hideSidebar: 'Kenar çubuğunu gizle',
      showSidebar: 'Kenar çubuğunu göster',
      depthFast: 'Hızlı',
      depthFastTitle: 'Hızlı mod: Düşük düşünme eforu ile hızlı ve doğrudan yanıtlar',
      depthMid: 'Orta',
      depthMidTitle: 'Orta mod: Dengeli düşünme eforu ve akıl yürütme',
      depthDeep: 'Derin',
      depthDeepTitle: 'Derin mod: Yüksek düşünme eforu ve kapsamlı analiz',
      exportMarkdownTitle: 'Sohbeti Markdown olarak kopyala',
      emailUnverifiedBanner: (email) => `E-posta adresiniz (${email}) henüz doğrulanmadı.`,
      emailVerificationSent:
        'Doğrulama bağlantısı tekrar gönderildi. Gelen kutunuzu kontrol edin.',
      emailSendFailed: 'E-posta gönderilemedi.',
      sendVerification: 'Doğrulama Gönder',
      emailStillUnverified:
        'Henüz doğrulanmamış görünüyor. Lütfen e-postanızdaki bağlantıya tıklayın.',
      checkAgain: 'Kontrol Et',
      helloUser: (name) => `Merhaba, ${name}`,
      defaultFriendName: 'Arkadaşım',
      emptySubtitle: 'Bir soru sor ya da aşağıdaki hazır önerilerden birini dene.',
      thoughtsLabel: 'Düşünceler',
      secondsShort: 'sn',
      copied: 'Kopyalandı',
      copy: 'Kopyala',
      regenerate: 'Yeniden oluştur',
      thinking: 'Düşünüyor…',
      inputPlaceholder: 'Longclaw’a bir şey sor...',
      attachFileTitle: 'Metin / Kod dosyası ekle',
      selectModelTitle: 'Kullanılacak modeli seç',
      modelSelectionAria: 'Model seçimi',
      chooseModel: 'Model seçin',
      otherModels: 'Diğer modeller',
      stopTitle: 'Yanıtı durdur',
      sendTitle: 'Gönder',
      composerHint: 'Enter ile gönder · Shift+Enter ile yeni satır',
      effortLow: 'Düşük Efor',
      effortBalanced: 'Dengeli Efor',
      effortHigh: 'Yüksek Efor',
      stoppedFallback: 'Yanıt durduruldu.',
      readBodyError: 'Response body okunamadı.',
      streamError: 'Yanıt üretilirken bir hata oluştu.',
      noResponseFallback: 'Yanıt alınamadı.',
      chatErrorMessage: (msg) => `Şu an yanıt veremedim: ${msg}. Lütfen tekrar deneyin.`,
      connectionError: 'Bağlantı hatası',
      fileLabel: 'Dosya',
      exportUserLabel: 'Sen',
      codePreview: {
        openResult: 'Sonucu aç',
        copyCode: 'Kodu kopyala',
        copiedCode: 'Kopyalandı',
        liveResultTitle: 'Canlı Sonuç',
        previewTab: 'Önizleme',
        codeTab: 'Kod',
        consoleTab: 'Konsol',
        rerunTitle: 'Yeniden çalıştır',
        downloadTitle: 'Dosyayı indir',
        expandTitle: 'Tam ekran yap',
        restoreTitle: 'Yan panele dön',
        closeTitle: 'Önizlemeyi kapat',
        desktopView: 'Masaüstü görünüm',
        mobileView: 'Mobil görünüm (390px)',
        clearConsole: 'Temizle',
        noConsoleOutput: 'Henüz konsol çıktısı yok.',
      },
    },
  },
  en: {
    common: {
      close: 'Close',
      newChat: 'New chat',
      defaultUser: 'User',
      loading: 'Loading...',
    },
    app: {
      emailVerifiedBanner: 'Your email address has been verified!',
      emailVerifyErrorBanner: 'The email verification link is invalid or has expired.',
    },
    models: {
      'longclaw-clawing-1.2-ultra': {
        tagline: 'MMLU-Pro Specialist',
        description:
          'Flagship powerhouse engineered for MMLU-Pro and PhD-level multi-step reasoning.',
      },
      'longclaw-clawing-1.1-ultra': {
        tagline: 'Ultra',
        description:
          'High-capacity model for complex architecture, deep research, and multi-step reasoning.',
      },
      'longclaw-clawing-1.1-pro': {
        tagline: 'New · Enhanced',
        description:
          'Pro upgrade of Clawing 1.1; sharper coding, strong context tracking, and fast Pro replies.',
      },
      'longclaw-clawing-1-pro': {
        tagline: 'Previous Pro',
        description:
          'Previous-generation Pro model for complex problem-solving, coding, and deep reasoning.',
      },
      'longclaw-clawing-1.1-low': {
        tagline: 'New · Ultra Fast',
        description:
          'Upgraded 1.1 edition of 1 Low; cleaner formatting, sharper precision, and near-zero latency.',
      },
      'longclaw-clawing-1.1': {
        tagline: 'New · Standard',
        description:
          '1.1 standard model; built for natural expression, structured writing, and smooth daily chats.',
      },
    },
    nav: {
      whatItDoes: 'What it does',
      depths: 'Depths',
      benchmarks: 'Benchmarks',
      faq: 'FAQ',
      toggleTheme: 'Toggle theme',
      signIn: 'Sign in',
      start: 'Start',
      chooseLanguage: 'Choose language',
    },
    landing: {
      poweredBy: 'Powered by LongClaw Clawing',
      heroTitleLine1: 'Write what’s on your mind,',
      heroTitleLine2: 'let Longclaw organize it.',
      heroSubtitle:
        'A quiet companion at your side when drafting an email, skimming a long document, or untangling a topic for the third time.',
      startFree: 'Start for free',
      benchmarksCta: 'Benchmarks',
      demoConversations: [
        {
          q: 'Write a short message to reschedule a meeting.',
          a: 'Hi, could we move tomorrow’s meeting to Thursday? Something urgent just came up on my end.',
        },
        {
          q: 'What’s a polite way to ask for an update?',
          a: 'In a formal email: “Could you please share an update when you have a moment?” Casual: “Quick check-in—how’s this looking?”',
        },
        {
          q: 'Make this warmer: Your request has been noted.',
          a: 'Got your message—I’m taking a look right now and will get back to you shortly!',
        },
      ],
      sidebarMockTitle: 'Daily Notes',
      familyEyebrow: 'LongClaw Clawing Family',
      familyTitle: 'Four distinct models for every need.',
      familySubtitle:
        'Switch between 1.2 Ultra, Ultra, Pro, or fast mode right from the chat bar.',
      compareBenchmarks: 'Compare with other models (Benchmarks)',
      timelineTitle: 'What do people ask Longclaw in a day?',
      timelineItems: [
        {
          time: '09:12',
          title: 'A quick email',
          prompt: '“Write a two-sentence thank-you note to a client.”',
          answer:
            '“Thank you sincerely for your support and trust. We look forward to planning the next milestone together with you.”',
        },
        {
          time: '11:40',
          title: 'Meeting notes',
          prompt: '“Distill these messy notes into three bullet points.”',
          answer:
            '• Budget revision approved\n• Launch date set for November 14\n• UI designs due this Friday',
        },
        {
          time: '14:05',
          title: 'Polishing a sentence',
          prompt: '“How do I say this more politely and formally?”',
          answer: '“Would you mind sharing the updated project report by Friday afternoon?”',
        },
        {
          time: '17:30',
          title: 'Tomorrow’s plan',
          prompt: '“Make a priority to-do list for tomorrow.”',
          answer:
            '1. Finish the quarterly report\n2. Send invoices to accounting\n3. Add the dentist appointment to the calendar',
        },
        {
          time: '22:10',
          title: 'While studying',
          prompt: '“What’s the main difference between osmosis and diffusion?”',
          answer:
            'Osmosis is strictly the movement of water molecules across a semipermeable membrane. Diffusion is the spontaneous spread of any substance from a region of higher concentration to lower concentration.',
        },
      ],
      depthsTitle: 'Same question, three depths.',
      depthsSubtitle:
        'See how the same model responds across Fast, Balanced, and Deep thinking efforts.',
      depthPrompt: '“Why is the sky blue?”',
      depthAnswers: [
        {
          title: 'Fast',
          desc: 'When you’re in a rush and the question is simple.',
          width: '30%',
          text: 'Because blue wavelengths in sunlight scatter much more strongly off gas molecules in Earth’s atmosphere than other colors.',
        },
        {
          title: 'Balanced',
          desc: 'For everyday tasks and most general explanations.',
          width: '65%',
          text: 'Sunlight looks white, but it contains all colors of the spectrum. Gas molecules in the atmosphere scatter short-wavelength blue light far more than longer red wavelengths.\n\nBecause that scattered blue light reaches our eyes from every direction, the sky appears blue.',
        },
        {
          title: 'Deep',
          desc: 'For complex topics, comparisons, and cause-and-effect chains.',
          width: '100%',
          text: 'This effect is called Rayleigh scattering. Scattering intensity is inversely proportional to the fourth power of wavelength, so ~450 nm blue light scatters nearly 6× more strongly in the atmosphere than red light.\n\nWhy not violet? The Sun emits less violet light than blue, and human cone receptors are far more sensitive to blue.',
        },
      ],
      checklistTitle: 'The little things',
      checklistItems: [
        'Secure sign-in with Google, Apple, and verified Email',
        'Cloud sync across all your devices with Firebase Firestore',
        'Fast / Balanced / Deep thinking effort on a single model',
        'Visible AI thinking steps and live code result preview',
        'Quick keyboard shortcuts: New chat (Ctrl/⌘ + K) & Sidebar (Ctrl/⌘ + B)',
        'Pin important conversations to the top',
        'Attach code and text files (.txt, .md, .py)',
        'One-click copy & Markdown export',
        'Light and dark theme support',
      ],
      mockSearchPlaceholder: 'summary...',
      mockPinnedTitle: 'Meeting summary (Pinned)',
      mockNote1: 'Summarization methods',
      mockNote2: 'Weekly plan',
      mockNote3: 'Client email draft',
      faqTitle: 'Frequently asked',
      faqs: [
        {
          q: 'Is it free?',
          a: 'Yes, trying Longclaw is completely free. It runs on Firebase and Google Gemini infrastructure.',
        },
        {
          q: 'Where are my conversations stored?',
          a: 'When you sign in, your chats are securely stored in Firebase Firestore under your account. You can delete any chat or all of your data at any time.',
        },
        {
          q: 'How do I sign in with Google or Apple?',
          a: 'Click the Google or Apple button on the sign-in modal to connect with one click without entering a password.',
        },
        {
          q: 'Which languages does it support?',
          a: 'You can switch the interface between English and Turkish anytime, and in chat Longclaw naturally replies in whichever language you write.',
        },
      ],
      getStartedNow: 'Get Started',
      footerTagline: 'Write, summarize, translate, think. All in a single chat.',
      footerNavHeading: 'Navigation',
      footerBackToTop: 'Back to top',
      footerLegalHeading: 'Legal & Security',
      footerPrivacy: 'Privacy Policy',
      footerTerms: 'Terms of Use',
      footerKvkk: 'Data Protection (KVKK)',
      footerCopyright: 'Longclaw © 2026. All rights reserved.',
    },
    benchmarks: {
      backToHome: 'Back to home',
      eyebrow: 'Evaluation & Benchmarks · November 2026',
      title: 'Realistic comparison against frontier models.',
      subtitle:
        'We tested the new MMLU-Pro specialist Longclaw Clawing 1.2 Ultra alongside the entire LongClaw family across language nuance, academic knowledge, coding, math, and output throughput.',
      testYourself: 'Try it yourself',
      takeaways: {
        ultra12:
          'Leader in MMLU-Pro (84.6%) and GPQA Diamond (71.4%); a PhD-level multi-step reasoning powerhouse.',
        ultra11:
          'Strong in language nuance (86.8%) and instruction following; the architecture & research standard prior to 1.2 Ultra.',
        pro11:
          'The Pro upgrade of Clawing 1.1: balanced daily Pro with 61.2% LiveCodeBench and 88 tok/s speed.',
        low11:
          'The 1.1 upgrade of 1 Low: instant 184 tok/s speed paired with 79.8% nuance accuracy.',
      },
      tabs: {
        all: 'All',
        general: 'Language & Knowledge',
        coding: 'Coding',
        math: 'Math & Reasoning',
        speed: 'Speed & Compliance',
      },
      legendLongclaw: 'LongClaw models',
      legendOthers: 'Other models',
      cards: {
        'tr-bench': {
          title: 'TR-Bench (Language Nuance & Context)',
          subtitle: 'Idioms, formal register, summarization, and contextual consistency',
          unit: '%',
          note: '5-shot · Human evaluation + automated verification',
        },
        'mmlu-pro': {
          title: 'MMLU-Pro',
          subtitle: 'Multiple-choice knowledge across 14 academic & professional domains',
          unit: '%',
          note: 'Zero-shot CoT · 10-choice rigorous benchmark',
        },
        livecodebench: {
          title: 'LiveCodeBench',
          subtitle: 'Single-attempt pass rate on fresh competitive & algorithmic problems',
          unit: '%',
          note: 'Pass@1 · Contamination-free recent problem set',
        },
        'swe-bench': {
          title: 'SWE-bench Verified',
          subtitle: 'Bug diagnosis and patch generation across real open-source repositories',
          unit: '%',
          note: 'Agentless harness · 500 verified GitHub tasks',
        },
        'math-500': {
          title: 'MATH-500',
          subtitle: 'Competition and olympiad-level multi-step mathematical reasoning',
          unit: '%',
          note: 'Zero-shot · Step-by-step solution verification',
        },
        'gpqa-diamond': {
          title: 'GPQA Diamond',
          subtitle: 'PhD-level reasoning across physics, chemistry, and biology',
          unit: '%',
          note: 'Zero-shot · Subset challenging even to domain experts',
        },
        ifeval: {
          title: 'IFEval (Instruction Following)',
          subtitle: 'Strict adherence to formatting, length, tone, and constraint rules',
          unit: '%',
          note: 'Strict Prompt Accuracy · Critical for daily workflows',
        },
        throughput: {
          title: 'Output Speed (Tokens / sec)',
          subtitle: 'Average tokens generated per second at Balanced thinking effort',
          unit: ' tok/s',
          note: 'Median streaming speed · Higher is faster',
        },
      },
      tableTitle: 'Summary comparison matrix',
      tableSubtitle: 'Core evaluation scores across all models side by side.',
      scrollHint: 'Scroll table horizontally',
      colModel: 'Model',
      colSpeed: 'Speed',
      speedUnit: 'tok/s',
      methodologyNote:
        'Note: LongClaw scores were measured at Balanced/Deep thinking effort, and competing models were evaluated under the same test protocol using publicly available standard API versions.',
      startChatting: 'Start chatting',
    },
    auth: {
      titleForgot: 'Password Reset & Verification',
      titleDefault: 'Welcome to Longclaw',
      subtitle: 'Smart assistant powered by Google Firebase & Gemini',
      backToSignIn: 'Back to sign in',
      forgotDesc:
        'Enter the email address registered to your account. We will send you a verification and password reset link to confirm your identity.',
      emailPlaceholder: 'Your email address',
      sending: 'Sending...',
      sendVerificationEmail: 'Send Verification Email',
      haveCodePrompt: 'Already have a verification code? Enter code',
      verificationStepTitle: 'Email Verification Step',
      verificationStepVerified: (email) =>
        `${email} has been verified. Set your new password.`,
      verificationStepDefault:
        'You can click the reset link in your email directly or paste the verification code from the link below to reset your password.',
      codePlaceholder: 'Verification code or link from email',
      newPasswordPlaceholder: 'New password (at least 6 characters)',
      verifying: 'Verifying...',
      verifyAndUpdatePassword: 'Verify Email & Update Password',
      resendVerificationEmail: 'Resend verification email',
      continueWithGoogle: 'Continue with Google',
      continueWithApple: 'Sign in with Apple',
      orWithEmail: 'or with email',
      tabSignIn: 'Sign in',
      tabSignUp: 'Sign up',
      namePlaceholder: 'Your name',
      emailShortPlaceholder: 'Email',
      passwordPlaceholder: 'Password (at least 6 characters)',
      forgotPasswordLink: 'Forgot password? (Verify via email)',
      tosPrefix: 'I have read and agree to the ',
      tosTerms: 'Terms of Use',
      tosAnd: ' and ',
      tosPrivacy: 'Privacy Policy',
      tosSuffix: '.',
      processing: 'Processing...',
      createAccount: 'Create account',
      signInBtn: 'Sign in',
      footerSecurity: 'Your data is encrypted and protected in Firebase Firestore.',
      errors: {
        popupClosed: 'Sign-in window was closed.',
        accountExistsDifferentCred:
          'Another sign-in provider is already associated with this email address.',
        googleGeneric: 'Something went wrong while signing in with Google.',
        applePopupClosed: 'Apple sign-in window was closed.',
        appleNotAllowed: 'Apple sign-in is not enabled in the Firebase console.',
        appleGeneric: 'An error occurred while signing in with Apple.',
        invalidEmail: 'Please enter a valid email address.',
        shortPassword: 'Password must be at least 6 characters long.',
        acceptTos: 'You must accept the Terms of Use and Privacy Policy to continue.',
        accountCreatedInfo:
          'Your account has been created and a verification link was sent to your email.',
        emailInUse: 'This email address is already registered. Try signing in instead.',
        invalidCredential: 'Incorrect email or password.',
        userNotFound: 'No account found with this email address.',
        operationNotAllowed:
          'Email/password sign-in must be enabled in Firebase Console > Authentication.',
        genericAuth: 'An error occurred during authentication.',
        invalidEmailReset:
          'Please enter a valid email address to receive the verification email.',
        resetSentInfo: (email) =>
          `A password reset and verification link has been sent to ${email}. Click the link in your inbox or paste the verification code below.`,
        resetUserNotFound: 'No user found registered with this email address.',
        resetSendFailed: (msg) => `Could not send verification email: ${msg}`,
        missingResetCode: 'Please paste the verification code or link from your email.',
        shortNewPassword: 'Your new password must be at least 6 characters long.',
        resetSuccessInfo: (email) =>
          `${email} has been verified and your password was updated! You can now sign in with your new password.`,
        expiredActionCode:
          'The verification code has expired. Please request a new verification email.',
        invalidActionCode: 'Invalid or already used verification code.',
        resetVerifyFailed: 'Could not verify password reset.',
      },
    },
    legal: {
      close: 'Close',
      docs: {
        gizlilik: {
          title: 'Privacy Policy',
          content: [
            'This policy explains what data is processed and how it is protected when using Longclaw. We are committed to safeguarding your privacy to the highest standards.',
            'What data do we collect? Your account details via Firebase Authentication (name, email address, profile photo), securely stored chat history in Firestore, and preferences (theme, depth mode, language).',
            'How do we use it? To sync your conversation history securely across your devices, generate intelligent Gemini responses, and keep your session secure.',
            'Who do we share it with? Google Firebase is used for authentication and database storage, and the Google Gemini API is used to generate AI responses. Your data is never sold or shared for marketing.',
            'Retention and deletion: You can delete individual chats or permanently remove your entire account and all associated data from the profile menu at any time.',
          ],
        },
        sartlar: {
          title: 'Terms of Use',
          content: [
            'Welcome to Longclaw. By using this service, you agree to these Terms of Use.',
            'Scope of service: Longclaw is an AI assistant built to help you think, write, summarize, and research.',
            'AI-generated output: AI models may occasionally produce inaccurate or incomplete information. Responses do not constitute medical, legal, or financial professional advice; verify critical decisions independently.',
            'Acceptable use: You may not use the service for illegal activities, harmful content generation, or attempts to disrupt system security.',
            'Account security: Keeping your login credentials secure is the responsibility of the account holder.',
          ],
        },
        kvkk: {
          title: 'Data Protection Notice (KVKK)',
          content: [
            'This notice is provided under Law No. 6698 on the Protection of Personal Data (KVKK).',
            'Personal data processed: Identity info (name), contact info (email address), usage logs, and chat content.',
            'Purposes of processing: Account creation, delivering AI assistant functionality, preventing data loss, and ensuring information security.',
            'Data transfer: Authentication and database infrastructure run on Google Firebase, while AI processing runs via the Google Gemini API.',
            'Your rights: Under Article 11 of KVKK, you have the right to access your personal data, request corrections, and request complete deletion.',
          ],
        },
      },
    },
    chat: {
      suggestions: [
        'Explain quantum computing simply',
        'How can I improve my time management?',
        'Write a warm, concise thank-you email to a client',
        'Summarize this text in three key bullet points:',
      ],
      backToLandingTitle: 'Back to landing page',
      closeMenuAria: 'Close menu',
      newChatTitle: 'New chat',
      searchPlaceholder: 'Search chats (/)',
      searchTitle: 'Search chats',
      noResults: 'No results found',
      noChatsYet: 'No chats yet',
      unpinTitle: 'Unpin',
      pinTitle: 'Pin to top',
      renameTitle: 'Rename',
      deleteTitle: 'Delete',
      emailVerified: 'Email Verified',
      emailUnverified: 'Email Unverified',
      switchToLight: 'Switch to light theme',
      switchToDark: 'Switch to dark theme',
      switchLanguageLabel: 'Language: English (Switch to Türkçe)',
      signOut: 'Sign out',
      deleteAccountConfirm: 'Are you sure? Click again',
      deleteAccount: 'Delete account & data',
      openSidebarAria: 'Open sidebar',
      sidebarLabel: 'Sidebar',
      hideSidebar: 'Hide sidebar',
      showSidebar: 'Show sidebar',
      depthFast: 'Fast',
      depthFastTitle: 'Fast mode: Direct replies with low thinking effort',
      depthMid: 'Balanced',
      depthMidTitle: 'Balanced mode: Everyday reasoning and balanced effort',
      depthDeep: 'Deep',
      depthDeepTitle: 'Deep mode: Comprehensive analysis with high thinking effort',
      exportMarkdownTitle: 'Copy chat as Markdown',
      emailUnverifiedBanner: (email) => `Your email address (${email}) is not verified yet.`,
      emailVerificationSent: 'Verification link sent again. Please check your inbox.',
      emailSendFailed: 'Could not send verification email.',
      sendVerification: 'Send Verification',
      emailStillUnverified: 'Still looks unverified. Please click the link in your email.',
      checkAgain: 'Check Again',
      helloUser: (name) => `Hello, ${name}`,
      defaultFriendName: 'Friend',
      emptySubtitle: 'Ask a question or try one of the quick prompts below.',
      thoughtsLabel: 'Thoughts',
      secondsShort: 's',
      copied: 'Copied',
      copy: 'Copy',
      regenerate: 'Regenerate',
      thinking: 'Thinking…',
      inputPlaceholder: 'Ask Longclaw anything...',
      attachFileTitle: 'Attach text / code file',
      selectModelTitle: 'Choose model',
      modelSelectionAria: 'Model selection',
      chooseModel: 'Choose a model',
      otherModels: 'Other models',
      stopTitle: 'Stop response',
      sendTitle: 'Send',
      composerHint: 'Enter to send · Shift+Enter for new line',
      effortLow: 'Low Effort',
      effortBalanced: 'Balanced Effort',
      effortHigh: 'High Effort',
      stoppedFallback: 'Response stopped.',
      readBodyError: 'Unable to read response stream.',
      streamError: 'An error occurred while generating a response.',
      noResponseFallback: 'No response received.',
      chatErrorMessage: (msg) => `I couldn't respond right now: ${msg}. Please try again.`,
      connectionError: 'Connection error',
      fileLabel: 'File',
      exportUserLabel: 'You',
      codePreview: {
        openResult: 'Open result',
        copyCode: 'Copy code',
        copiedCode: 'Copied',
        liveResultTitle: 'Live Result',
        previewTab: 'Preview',
        codeTab: 'Code',
        consoleTab: 'Console',
        rerunTitle: 'Re-run',
        downloadTitle: 'Download file',
        expandTitle: 'Expand fullscreen',
        restoreTitle: 'Restore split view',
        closeTitle: 'Close preview',
        desktopView: 'Desktop view',
        mobileView: 'Mobile view (390px)',
        clearConsole: 'Clear',
        noConsoleOutput: 'No console output yet.',
      },
    },
  },
};

export function getInitialLanguage(): Language {
  try {
    const saved = localStorage.getItem('lc_lang');
    if (saved === 'en' || saved === 'tr') return saved;
    if (typeof navigator !== 'undefined' && navigator.language?.toLowerCase().startsWith('tr')) {
      return 'tr';
    }
  } catch {}
  return 'en';
}
