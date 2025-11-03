import {en} from './en';

import Common from '../resources/fr/Common.json';
import PageAccount from '../resources/fr/Page_Account.json';
import PageCheckout from '../resources/fr/Page_Checkout.json';
import PageHome from '../resources/fr/Page_Home.json';

export const fr = {
  ...en,
  common: {
    ...en.common,
    language: {
      ...en.common.language,
      options: Common.language.options,
    },
  },
  Common,
  Page_Account: PageAccount,
  Page_Checkout: PageCheckout,
  Page_Home: PageHome,
};
