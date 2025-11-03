import React from 'react';
import {ScrollView, StyleSheet, View} from 'react-native';
import type {StyleProp, ViewStyle} from 'react-native';
import {SafeAreaView} from 'react-native-safe-area-context';
import {useTheme} from 'react-native-paper';

type ScreenProps = {
  children: React.ReactNode;
  scrollable?: boolean;
  contentContainerStyle?: StyleProp<ViewStyle>;
  style?: StyleProp<ViewStyle>;
};

export const Screen: React.FC<ScreenProps> = ({
  children,
  scrollable = false,
  contentContainerStyle,
  style,
}) => {
  const theme = useTheme();

  if (scrollable) {
    return (
      <SafeAreaView
        style={[styles.safeArea, style, {backgroundColor: theme.colors.background}]}> 
        <ScrollView
          contentContainerStyle={contentContainerStyle ?? styles.scrollContent}
          style={styles.scrollView}
          keyboardShouldPersistTaps="handled">
          {children}
        </ScrollView>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView
      style={[styles.safeArea, style, {backgroundColor: theme.colors.background}]}> 
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
    padding: 16,
  },
  content: {
    flex: 1,
  },
});
