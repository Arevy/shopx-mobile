import React from 'react';
import {StyleSheet, View} from 'react-native';
import {TextInput} from 'react-native-paper';
import {useAppTranslation} from '@/hooks/useAppTranslation';

export type AddressFormValues = {
  street: string;
  city: string;
  postalCode: string;
  country: string;
};

type AddressFormFieldsProps = {
  values: AddressFormValues;
  onChange: <K extends keyof AddressFormValues>(
    field: K,
    value: AddressFormValues[K],
  ) => void;
  disabled?: boolean;
};

export const AddressFormFields: React.FC<AddressFormFieldsProps> = ({
  values,
  onChange,
  disabled = false,
}) => {
  const {t} = useAppTranslation('Page_Checkout');
  return (
    <View style={styles.form}>
      <TextInput
        label={t('form.address.fields.street')}
        accessibilityLabel={t('form.address.fields.street')}
        value={values.street}
        onChangeText={text => onChange('street', text)}
        autoCapitalize="words"
        autoComplete="street-address"
        disabled={disabled}
      />
      <TextInput
        label={t('form.address.fields.city')}
        accessibilityLabel={t('form.address.fields.city')}
        value={values.city}
        onChangeText={text => onChange('city', text)}
        autoCapitalize="words"
        autoComplete="postal-address-locality"
        disabled={disabled}
      />
      <TextInput
        label={t('form.address.fields.postal_code')}
        accessibilityLabel={t('form.address.fields.postal_code')}
        value={values.postalCode}
        onChangeText={text => onChange('postalCode', text)}
        autoCapitalize="characters"
        autoComplete="postal-code"
        disabled={disabled}
      />
      <TextInput
        label={t('form.address.fields.country')}
        accessibilityLabel={t('form.address.fields.country')}
        value={values.country}
        onChangeText={text => onChange('country', text)}
        autoCapitalize="words"
        autoComplete="postal-address-country"
        disabled={disabled}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  form: {
    gap: 12,
  },
});
