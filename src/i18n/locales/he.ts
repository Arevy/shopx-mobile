import {en} from './en';

import Common from '../resources/he/Common.json';
import PageAccount from '../resources/he/Page_Account.json';
import PageCheckout from '../resources/he/Page_Checkout.json';
import PageHome from '../resources/he/Page_Home.json';

export const he = {
  ...en,
  common: {
    ...en.common,
    vatIncluded: 'כולל מע״מ',
    actions: {...en.common.actions, loadMore: 'טעינת עוד'},
    language: {
      ...en.common.language,
      options: Common.language.options,
    },
  },
  home: {
    ...en.home,
    title: 'משדרגים את היום.',
    eyebrow: 'טכנולוגיה, בית וסגנון חיים',
    intro:
      'גלו טכנולוגיה שימושית, פריטים לבית ואת הדברים הקטנים שהופכים כל יום לטוב יותר.',
  },
  Common,
  Page_Account: PageAccount,
  Page_Checkout: PageCheckout,
  Page_Home: PageHome,
};
