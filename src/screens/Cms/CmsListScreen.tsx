import React from 'react';
import {FlatList, StyleSheet, View} from 'react-native';
import {Button, Card, Text} from 'react-native-paper';
import {useNavigation} from '@react-navigation/native';
import {useAppTranslation} from '@/hooks/useAppTranslation';

import {Screen} from '@/components/core/Screen';
import {LoadingState} from '@/components/core/LoadingState';
import {ErrorState} from '@/components/core/ErrorState';
import {useGetCmsPagesQuery} from '@/services/graphql/shopxGraphqlApi';
import type {CmsStackNavigation} from '@/navigation/types';

export const CmsListScreen: React.FC = () => {
  const {data, isLoading, error, refetch} = useGetCmsPagesQuery();
  const navigation = useNavigation<CmsStackNavigation>();
  const {t, i18n} = useAppTranslation(['cms', 'common']);

  const pages = data ?? [];

  if (isLoading && pages.length === 0) {
    return <LoadingState label={t('cms.loading')} />;
  }

  if (error) {
    return (
      <ErrorState
        message={t('common.errors.genericMessage')}
        onRetry={() => refetch()}
      />
    );
  }

  return (
    <Screen>
      <FlatList
        data={pages}
        keyExtractor={item => item.id}
        contentContainerStyle={styles.listContent}
        ListHeaderComponent={() => (
          <Text variant="headlineSmall" style={styles.header}>
            {t('cms.listTitle')}
          </Text>
        )}
        renderItem={({item}) => {
          const updatedLabel = item.updatedAt
            ? t('cms.updatedAt', {
                value: new Date(item.updatedAt).toLocaleDateString(
                  i18n.language,
                ),
              })
            : undefined;

          return (
            <Card style={styles.card}>
              <Card.Title title={item.title} subtitle={updatedLabel} />
              <Card.Content>
                {item.excerpt ? (
                  <Text variant="bodyMedium" style={styles.excerpt}>
                    {item.excerpt}
                  </Text>
                ) : null}
              </Card.Content>
              <Card.Actions>
                <Button
                  mode="contained"
                  onPress={() =>
                    navigation.navigate('CmsDetail', {
                      slug: item.slug,
                      title: item.title,
                    })
                  }>
                  {t('cms.viewButton')}
                </Button>
              </Card.Actions>
            </Card>
          );
        }}
        ItemSeparatorComponent={() => <View style={styles.separator} />}
        ListEmptyComponent={() => (
          <Text variant="bodyMedium" style={styles.empty}>
            {t('cms.empty')}
          </Text>
        )}
      />
    </Screen>
  );
};

const styles = StyleSheet.create({
  listContent: {
    padding: 16,
    gap: 16,
  },
  header: {
    marginBottom: 8,
    fontWeight: '600',
  },
  card: {
    borderRadius: 16,
  },
  excerpt: {
    color: '#4b5563',
  },
  separator: {
    height: 12,
  },
  empty: {
    textAlign: 'center',
    marginTop: 48,
    color: '#6b7280',
  },
});
