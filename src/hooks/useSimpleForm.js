import { useState } from "react";

// Малка форма само с нужното на количката (стойности, грешки, валидация) – вместо @mantine/form (~9 KB gzip в началния bundle).
// API-то е съвместимо с онова, което ползват App и CartDrawer: values, setValues, getInputProps, validate.
export function useSimpleForm({ initialValues, validate: rules = {} }) {
  const [values, setValuesState] = useState(initialValues);
  const [errors, setErrors] = useState({});

  const setValues = (next) => setValuesState((prev) => ({ ...prev, ...next }));

  const validate = () => {
    const found = {};
    for (const [field, rule] of Object.entries(rules)) {
      const message = rule(values[field], values);
      if (message) found[field] = message;
    }
    setErrors(found);
    return { hasErrors: Object.keys(found).length > 0, errors: found };
  };

  const getInputProps = (field) => ({
    value: values[field] ?? "",
    error: errors[field],
    onChange: (eventOrValue) => {
      const value = eventOrValue?.currentTarget ? eventOrValue.currentTarget.value : eventOrValue;
      setValuesState((prev) => ({ ...prev, [field]: value }));
      // грешката изчезва, щом клиентът започне да пише
      setErrors((prev) => (prev[field] ? { ...prev, [field]: undefined } : prev));
    },
  });

  return { values, errors, setValues, validate, getInputProps };
}
