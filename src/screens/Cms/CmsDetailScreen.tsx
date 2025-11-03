import React from 'react';
import {StyleSheet} from 'react-native';
import {Button, Text} from 'react-native-paper';
import {useNavigation, useRoute} from '@react-navigation/native';
import type {RouteProp} from '@react-navigation/native';
import {useAppTranslation} from '@/hooks/useAppTranslation';

import {Screen} from '@/components/core/Screen';
import {LoadingState} from '@/components/core/LoadingState';
import {ErrorState} from '@/components/core/ErrorState';
import {useGetCmsPageQuery} from '@/services/graphql/shopxGraphqlApi';
import type {CmsStackParamList} from '@/navigation/types';

type CmsDetailRoute = RouteProp<CmsStackParamList, 'CmsDetail'>;

export const CmsDetailScreen: React.FC = () => {
  const navigation = useNavigation();
  const route = useRoute<CmsDetailRoute>();
  const {t, i18n} = useAppTranslation(['cms', 'common']);

  const {data: page, isLoading, error, refetch} = useGetCmsPageQuery({
    slug: route.params.slug,
  });

  if (isLoading) {
    return <LoadingState label={t('cms.pageLoading')} />;
  }

  if (error || !page) {
    return (
      <ErrorState
        message={t('cms.pageError')}
        onRetry={() => refetch()}
      />
    );
  }

  const updatedAt = page.updatedAt
    ? new Date(page.updatedAt).toLocaleDateString(i18n.language)
    : undefined;

  return (
    <Screen scrollable contentContainerStyle={styles.container}>
      <Button
        mode="text"
        icon="arrow-left"
        onPress={() => navigation.goBack()}>
        {t('common.actions.goBack')}
      </Button>
      <Text variant="headlineSmall" style={styles.title}>
        {page.title}
      </Text>
      {updatedAt ? (
        <Text variant="bodySmall" style={styles.meta}>
          {t('cms.updatedAt', {value: updatedAt})}
        </Text>
      ) : null}
      {page.body ? (
        <Text variant="bodyMedium" style={styles.body}>
          {page.body}
        </Text>
      ) : null}
    </Screen>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 16,
    gap: 16,
  },
  title: {
    fontWeight: '700',
  },
  meta: {
    color: '#6b7280',
  },
  body: {
    lineHeight: 22,
  },
});
