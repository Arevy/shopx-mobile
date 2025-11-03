import {en} from './en';

import Common from '../resources/ar/Common.json';
import PageAccount from '../resources/ar/Page_Account.json';
import PageCheckout from '../resources/ar/Page_Checkout.json';
import PageHome from '../resources/ar/Page_Home.json';

export const ar = {
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
