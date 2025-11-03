import {en} from './en';

import Common from '../resources/de/Common.json';
import PageAccount from '../resources/de/Page_Account.json';
import PageCheckout from '../resources/de/Page_Checkout.json';
import PageHome from '../resources/de/Page_Home.json';

export const de = {
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
