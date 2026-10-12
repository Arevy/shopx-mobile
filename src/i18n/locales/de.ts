import {en} from './en';

import Common from '../resources/de/Common.json';
import PageAccount from '../resources/de/Page_Account.json';
import PageCheckout from '../resources/de/Page_Checkout.json';
import PageHome from '../resources/de/Page_Home.json';

export const de = {
  ...en,
  common: {
    ...en.common,
    vatIncluded: 'Inkl. MwSt.',
    actions: {...en.common.actions, loadMore: 'Mehr laden'},
    language: {
      ...en.common.language,
      options: Common.language.options,
    },
  },
  home: {
    ...en.home,
    title: 'Jeden Tag besser.',
    eyebrow: 'Technik, Wohnen und Lifestyle',
    intro:
      'Entdecke nützliche Technik, durchdachte Wohnaccessoires und die kleinen Dinge, die jeden Tag besser machen.',
  },
  Common,
  Page_Account: PageAccount,
  Page_Checkout: PageCheckout,
  Page_Home: PageHome,
};
