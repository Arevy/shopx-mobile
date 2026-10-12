import {en} from './en';

import Common from '../resources/ar/Common.json';
import PageAccount from '../resources/ar/Page_Account.json';
import PageCheckout from '../resources/ar/Page_Checkout.json';
import PageHome from '../resources/ar/Page_Home.json';

export const ar = {
  ...en,
  common: {
    ...en.common,
    vatIncluded: 'شامل الضريبة',
    actions: {...en.common.actions, loadMore: 'عرض المزيد'},
    language: {
      ...en.common.language,
      options: Common.language.options,
    },
  },
  home: {
    ...en.home,
    title: 'كل يوم، أفضل.',
    eyebrow: 'تقنية ومنزل وأسلوب حياة',
    intro:
      'اكتشف تقنيات مفيدة ومستلزمات منزلية مدروسة والتفاصيل الصغيرة التي تجعل كل يوم أفضل.',
  },
  Common,
  Page_Account: PageAccount,
  Page_Checkout: PageCheckout,
  Page_Home: PageHome,
};
