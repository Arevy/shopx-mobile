import type {en} from './locales/en';

const additions = {
  en: ['Cancel', 'Save address', 'Complete all address fields.', 'Email and password are required.', 'Account created', 'Welcome! You are signed in.', 'No changes detected.', 'Profile updated.', 'Password updated.', 'Use at least 8 characters.', 'Your order was recorded. View its status in your account.', 'Order ID', 'Items', 'Order summary', 'Back to cart', 'Review your address, products and payment method.'],
  ro: ['Anulează', 'Salvează adresa', 'Completează toate câmpurile adresei.', 'Emailul și parola sunt obligatorii.', 'Cont creat', 'Bine ai venit! Ești autentificat.', 'Nu există modificări.', 'Profil actualizat.', 'Parolă actualizată.', 'Folosește cel puțin 8 caractere.', 'Comanda a fost înregistrată. Vezi starea ei în contul tău.', 'Număr comandă', 'Produse', 'Rezumatul comenzii', 'Înapoi la coș', 'Verifică adresa, produsele și metoda de plată.'],
  fr: ['Annuler', 'Enregistrer l’adresse', 'Renseignez tous les champs de l’adresse.', 'L’adresse e-mail et le mot de passe sont obligatoires.', 'Compte créé', 'Bienvenue ! Vous êtes connecté.', 'Aucune modification.', 'Profil mis à jour.', 'Mot de passe mis à jour.', 'Utilisez au moins 8 caractères.', 'Votre commande a été enregistrée. Consultez son statut dans votre compte.', 'Numéro de commande', 'Articles', 'Récapitulatif de la commande', 'Retour au panier', 'Vérifiez votre adresse, vos articles et votre mode de paiement.'],
  de: ['Abbrechen', 'Adresse speichern', 'Füllen Sie alle Adressfelder aus.', 'E-Mail und Passwort sind erforderlich.', 'Konto erstellt', 'Willkommen! Sie sind angemeldet.', 'Keine Änderungen.', 'Profil aktualisiert.', 'Passwort aktualisiert.', 'Verwenden Sie mindestens 8 Zeichen.', 'Ihre Bestellung wurde erfasst. Den Status finden Sie in Ihrem Konto.', 'Bestellnummer', 'Artikel', 'Bestellübersicht', 'Zurück zum Warenkorb', 'Prüfen Sie Adresse, Artikel und Zahlungsart.'],
  ar: ['إلغاء', 'حفظ العنوان', 'أكمل جميع حقول العنوان.', 'البريد الإلكتروني وكلمة المرور مطلوبان.', 'تم إنشاء الحساب', 'مرحبًا! تم تسجيل دخولك.', 'لا توجد تغييرات.', 'تم تحديث الملف الشخصي.', 'تم تحديث كلمة المرور.', 'استخدم 8 أحرف على الأقل.', 'تم تسجيل طلبك. يمكنك متابعة حالته في حسابك.', 'رقم الطلب', 'المنتجات', 'ملخص الطلب', 'العودة إلى السلة', 'راجع العنوان والمنتجات وطريقة الدفع.'],
  he: ['ביטול', 'שמירת כתובת', 'יש למלא את כל שדות הכתובת.', 'נדרשים דוא״ל וסיסמה.', 'החשבון נוצר', 'ברוכים הבאים! התחברתם לחשבון.', 'לא בוצעו שינויים.', 'הפרופיל עודכן.', 'הסיסמה עודכנה.', 'יש להשתמש ב־8 תווים לפחות.', 'ההזמנה נרשמה. אפשר לצפות במצב שלה בחשבון שלכם.', 'מספר הזמנה', 'פריטים', 'סיכום הזמנה', 'חזרה לסל', 'בדקו את הכתובת, המוצרים ואמצעי התשלום.'],
};

// Reuse the storefront translations already shipped in RN instead of maintaining
// a second set of profile, security, address and checkout labels.
export function withCommerceResources(base: typeof en, language: keyof typeof additions) {
  const [cancel, saveAddress, addressRequired, registerRequired, registered, welcome,
    noChanges, profileUpdated, passwordUpdated, passwordTooShort, orderRecorded,
    orderNumber, items, summary, backToCart, checkoutIntro] = additions[language];
  const account = base.Page_Account;
  const checkout = base.Page_Checkout;
  const profile = account.sections.overview.form;
  const security = account.sections.security.form;
  const genericError = base.common.errors.genericMessage;
  return {
    ...base,
    common: {...base.common, actions: {...base.common.actions, cancel}},
    cart: {...base.cart, errors: {...base.cart.errors, add: genericError, update: genericError}},
    account: {
      ...base.account,
      actions: {register: base.Common.routes.register},
      addresses: {heading: base.account.addresses, add: checkout.form.address.add_new,
        save: saveAddress, loading: base.common.states.loading, required: addressRequired, failed: genericError},
      forms: {...base.account.forms, nameLabel: profile.name_label},
      errors: {...base.account.errors, registerRequired, registerFailed: genericError, passwordMismatch: security.mismatch},
      login: {heading: account.guard.title},
      register: {heading: base.Common.routes.register, nameLabel: profile.name_label,
        confirmLabel: security.confirm_label, submit: base.Common.routes.register,
        successTitle: registered, successMessage: welcome},
      sections: account.menu,
      profile: {heading: account.sections.overview.title, noChanges,
        passwordLabel: profile.password_label, passwordRequired: profile.password_required,
        save: profile.submit, updateFailed: genericError, updated: profileUpdated},
      security: {heading: account.sections.security.title, current: security.current_label,
        new: security.new_label, confirm: security.confirm_label, update: security.submit,
        mismatch: security.mismatch, tooShort: passwordTooShort, changed: passwordUpdated, error: genericError},
      orders: {heading: account.sections.orders.title, loading: account.sections.orders.loading,
        empty: account.sections.orders.empty, total: checkout.form.payment.summary.total, itemsLabel: items},
    },
    checkout: {
      intro: {title: checkout.intro.title, subtitle: checkoutIntro},
      guard: {...checkout.guard, actions: {...checkout.guard.actions, browse: checkout.empty.cta}},
      empty: {title: checkout.empty.message, subtitle: checkout.empty.message},
      address: {heading: checkout.form.address.title, loading: base.common.states.loading, new: checkout.form.address.add_new},
      payment: {heading: checkout.form.payment.title, methods: checkout.form.payment.methods},
      summary: {heading: summary},
      errors: {generic: checkout.form.errors.generic, addressRequired},
      actions: {...checkout.form.payment.actions, backToCart},
      success: {title: checkout.toast.success, subtitle: orderRecorded, orderNumber,
        actions: {continue: checkout.success.cta, orders: account.sections.orders.title}},
    },
  };
}
