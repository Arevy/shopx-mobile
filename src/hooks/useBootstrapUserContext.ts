import {useGetUserContextQuery} from '@/services/graphql/shopxGraphqlApi';
import {useAppSelector} from '@/store/hooks';

export const useBootstrapUserContext = () => {
  const session = useAppSelector(state => state.session);
  const userId = session.user?.id ?? '';
  const skip = !session.hydrated || !userId;

  return useGetUserContextQuery(
    {userId},
    {
      skip,
      refetchOnFocus: true,
    },
  );
};
