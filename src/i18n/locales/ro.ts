import Common from '../resources/ro/Common.json';
import PageAccount from '../resources/ro/Page_Account.json';
import PageCheckout from '../resources/ro/Page_Checkout.json';
import PageHome from '../resources/ro/Page_Home.json';

export const ro = {
  common: {
    appName: '{{siteName}} Mobile',
    description: 'Experiența completă ShopX direct pe telefon.',
    actions: {
      retry: 'Reîncearcă',
      viewProducts: 'Vezi produse',
      goBack: 'Înapoi',
      addToCart: 'Adaugă în coș',
      addToWishlist: 'Adaugă la favorite',
      removeFromWishlist: 'Șterge din favorite',
      viewProduct: 'Vezi produsul',
      clear: 'Golește',
      reload: 'Reîncarcă',
      openDrawer: 'Deschide meniul principal',
      login: 'Autentificare',
      logout: 'Deconectare',
      seeCms: 'Vezi conținutul',
      seeDetails: 'Vezi detalii',
      viewCart: 'Vezi coșul',
      viewWishlist: 'Vezi favoritele',
      manageAccount: 'Gestionează contul',
    },
    inputs: {
      email: 'Adresă de email',
      password: 'Parolă',
      passwordPlaceholder: 'Parola ta sigură',
      search: 'Caută',
    },
    states: {
      loading: 'Se încarcă…',
      empty: 'Nu există elemente încă.',
    },
    errors: {
      genericTitle: 'Ceva nu a mers bine',
      genericMessage: 'Te rugăm să încerci din nou în câteva momente.',
      network: 'Cererea de rețea a eșuat. Verifică conexiunea.',
      authRequiredTitle: 'Autentificare necesară',
      authRequiredMessage: 'Autentifică-te pentru a continua.',
    },
    success: {
      login: 'Bine ai revenit!',
      logout: 'Te-ai deconectat cu succes.',
    },
    language: {
      options: Common.language.options,
    },
  },
  navigation: {
    tabs: {
      home: 'Produse',
      cart: 'Coș',
      wishlist: 'Favorite',
      account: 'Cont',
    },
    drawer: {
      home: 'Acasă',
      catalog: 'Catalog',
      wishlist: 'Favorite',
      cart: 'Coș',
      checkout: 'Checkout',
      account: 'Cont',
      cms: 'Pagini de conținut',
      settings: 'Setări aplicație',
      login: 'Autentificare',
      logout: 'Deconectare',
      quickLinks: 'Linkuri rapide',
      categories: 'Categorii',
      pages: 'Pagini',
      guestTitle: 'Navighezi ca vizitator.',
      signedInAs: 'Autentificat ca {{email}}',
      goToAccount: 'Deschide contul',
      signInCta: 'Autentifică-te pentru a-ți sincroniza experiența',
    },
  },
  home: {
    title: 'Descoperă produsele {{siteName}}',
    searchPlaceholder: 'Caută produse, branduri sau categorii',
    categoriesAll: 'Toate',
    emptyTitle: 'Nu am găsit rezultate',
    emptySubtitle: 'Ajustează filtrele pentru a vedea mai multe produse.',
    loading: 'Încărcăm cele mai noi produse',
    errors: {
      load: 'Nu am putut încărca produsele.',
      addToCart: 'Nu am putut adăuga produsul în coș.',
      toggleWishlist: 'Nu am putut actualiza lista de favorite.',
    },
    alerts: {
      authRequiredTitle: 'Autentificare necesară',
      authRequiredMessage:
        'Autentifică-te pentru a folosi funcționalitățile de coș și favorite.',
    },
  },
  cart: {
    title: 'Coșul tău',
    subtitle: '{{count}} produs',
    subtitle_plural: '{{count}} produse',
    emptyTitle: 'Coșul tău este gol',
    emptySubtitle: 'Adaugă produse pentru a continua cumpărăturile.',
    loading: 'Pregătim coșul tău',
    labels: {
      quantity: 'Cantitate: {{value}}',
    },
    errors: {
      load: 'Nu am putut încărca coșul.',
      remove: 'Nu am putut șterge produsul din coș.',
      clear: 'Nu am putut goli coșul.',
    },
    actions: {
      goShopping: 'Vezi produse',
      checkout: 'Continuă către checkout',
      clear: 'Golește coșul',
      viewProduct: 'Vezi produsul',
    },
    alerts: {
      loginPromptTitle: 'Autentifică-te pentru a-ți vedea coșul.',
      checkoutNotImplementedTitle: 'Checkout',
      checkoutNotImplementedMessage:
        'Fluxul de checkout va fi disponibil în curând.',
    },
    totalLabel: 'Total',
  },
  wishlist: {
    title: 'Favorite',
    emptyTitle: 'Lista de favorite este goală',
    emptySubtitle: 'Salvează produsele preferate pentru a le vedea aici.',
    loading: 'Încărcăm lista de favorite',
    errors: {
      load: 'Nu am putut încărca lista de favorite.',
      remove: 'Nu am putut șterge produsul din favorite.',
      addToCart: 'Nu am putut adăuga produsul în coș.',
    },
    alerts: {
      loginPromptTitle:
        'Creează un cont sau autentifică-te pentru a salva favoritele.',
    },
    actions: {
      goShopping: 'Descoperă produse',
    },
  },
  product: {
    back: 'Înapoi',
    addToCart: 'Adaugă în coș',
    addToWishlist: 'Adaugă la favorite',
    inWishlist: 'În favorite',
    loading: 'Se încarcă produsul',
    reviewsTitle: 'Recenzii ({{count}})',
    reviewsEmpty: 'Fii primul care lasă o recenzie.',
    reviewUser: 'Utilizator #{{id}}',
    ratingBadge: '{{rating}} / 5',
    alerts: {
      wishlist: 'Nu am putut actualiza lista de favorite.',
      addToCart: 'Nu am putut adăuga produsul în coș.',
    },
  },
  account: {
    greeting: 'Salut, {{name}}',
    role: 'Rol: {{role}}',
    anonymousTitle: 'Bun venit la {{siteName}} Mobile',
    anonymousSubtitle:
      'Autentifică-te pentru a sincroniza experiența pe toate dispozitivele.',
    theme: 'Preferințe de temă',
    themeOptions: {
      system: 'Sistem',
      light: 'Luminoasă',
      dark: 'Întunecată',
    },
    activity: 'Rezumat activitate',
    cartItems: 'Produse în coș',
    wishlistItems: 'Favorite',
    wishlistValue: 'Valoare favorite',
    addresses: 'Adrese salvate',
    noAddresses: 'Nu ai nicio adresă salvată momentan.',
    device: 'Dispozitiv',
    logout: 'Deconectare',
    loginPrompt: 'Ai deja cont? Autentifică-te mai jos.',
    forms: {
      emailLabel: 'Email',
      passwordLabel: 'Parolă',
      submit: 'Autentificare',
      submitting: 'Se autentifică…',
    },
    errors: {
      loginFailed: 'Datele introduse nu sunt valide. Încearcă din nou.',
    },
    info: {
      sessionHydrating: 'Îți încărcăm profilul',
    },
    roles: {
      CUSTOMER: 'Client',
      SUPPORT: 'Suport',
    },
  },
  auth: {
    title: 'Autentifică-te în {{siteName}}',
    subtitle: 'Folosește aceleași credențiale ca pe web.',
    success: 'Te-ai autentificat cu succes.',
  },
  cms: {
    listTitle: 'Pagini de conținut',
    empty: 'Momentan nu există pagini de conținut.',
    viewButton: 'Vezi pagina',
    updatedAt: 'Actualizat {{value}}',
    loading: 'Încărcăm paginile de conținut',
    pageLoading: 'Se încarcă pagina',
    pageError: 'Nu am putut încărca această pagină.',
  },
  settings: {
    title: 'Setări',
    language: 'Limba',
  },
  Common,
  Page_Account: PageAccount,
  Page_Checkout: PageCheckout,
  Page_Home: PageHome,
};
