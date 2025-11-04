import React from 'react';
import {StyleSheet, View} from 'react-native';
import {TextInput} from 'react-native-paper';

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
  return (
    <View style={styles.form}>
      <TextInput
        label="Street"
        value={values.street}
        onChangeText={text => onChange('street', text)}
        autoCapitalize="words"
        autoComplete="street-address"
        disabled={disabled}
      />
      <TextInput
        label="City"
        value={values.city}
        onChangeText={text => onChange('city', text)}
        autoCapitalize="words"
        autoComplete="postal-address-locality"
        disabled={disabled}
      />
      <TextInput
        label="Postal code"
        value={values.postalCode}
        onChangeText={text => onChange('postalCode', text)}
        autoCapitalize="characters"
        autoComplete="postal-code"
        disabled={disabled}
      />
      <TextInput
        label="Country"
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
