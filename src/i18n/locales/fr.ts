import {en} from './en';

import Common from '../resources/fr/Common.json';
import PageAccount from '../resources/fr/Page_Account.json';
import PageCheckout from '../resources/fr/Page_Checkout.json';
import PageHome from '../resources/fr/Page_Home.json';

export const fr = {
  ...en,
  common: {
    ...en.common,
    platform: {
      connecting: 'Connexion à votre plateforme…',
      unavailable: 'Plateforme indisponible. Nouvelle tentative…',
    },
    vatIncluded: 'TVA incluse',
    actions: {...en.common.actions, loadMore: 'Afficher plus'},
    language: {
      ...en.common.language,
      options: Common.language.options,
    },
  },
  home: {
    ...en.home,
    title: 'Le quotidien, repensé.',
    eyebrow: 'Tech, maison et lifestyle',
    intro:
      'Découvrez des technologies utiles, des essentiels pour la maison et les petits détails qui améliorent le quotidien.',
  },
  Common,
  Page_Account: PageAccount,
  Page_Checkout: PageCheckout,
  Page_Home: PageHome,
};
