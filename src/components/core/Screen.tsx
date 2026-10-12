import React from 'react';
import {ScrollView, StyleSheet, View} from 'react-native';
import type {StyleProp, ViewStyle} from 'react-native';
import {SafeAreaView} from 'react-native-safe-area-context';
import type {SafeAreaViewProps} from 'react-native-safe-area-context';
import {useTheme} from 'react-native-paper';

type ScreenProps = {
  children: React.ReactNode;
  scrollable?: boolean;
  contentContainerStyle?: StyleProp<ViewStyle>;
  style?: StyleProp<ViewStyle>;
  edges?: SafeAreaViewProps['edges'];
};

export const Screen: React.FC<ScreenProps> = ({
  children,
  scrollable = false,
  contentContainerStyle,
  style,
  edges,
}) => {
  const theme = useTheme();

  if (scrollable) {
    return (
      <SafeAreaView
        edges={edges}
        style={[
          styles.safeArea,
          style,
          {backgroundColor: theme.colors.background},
        ]}>
        <ScrollView
          contentContainerStyle={[styles.scrollContent, contentContainerStyle]}
          style={styles.scrollView}
          keyboardShouldPersistTaps="handled">
          {children}
        </ScrollView>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView
      edges={edges}
      style={[
        styles.safeArea,
        style,
        {backgroundColor: theme.colors.background},
      ]}>
      <View style={[styles.content, contentContainerStyle]}>{children}</View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 20,
    width: '100%',
    maxWidth: 960,
    alignSelf: 'center',
  },
  content: {
    flex: 1,
  },
});
