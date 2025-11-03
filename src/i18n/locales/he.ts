import {en} from './en';

import Common from '../resources/he/Common.json';
import PageAccount from '../resources/he/Page_Account.json';
import PageCheckout from '../resources/he/Page_Checkout.json';
import PageHome from '../resources/he/Page_Home.json';

export const he = {
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
