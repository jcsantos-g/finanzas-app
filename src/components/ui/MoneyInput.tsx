import { useState } from 'react';

import { parseAmount } from '@/lib/validators';

import { TextField } from './TextField';

type Props = {
  label?: string;
  /** Monto actual, o null si el campo está vacío o es inválido. */
  value: number | null;
  onChange: (amount: number | null) => void;
  error?: string;
};

/**
 * Campo de monto. Muestra teclado numérico y entrega un número (o null).
 * La validación "mayor que cero" (RN-02) la hace el formulario con isPositiveAmount.
 */
export function MoneyInput({ label = 'Monto', value, onChange, error }: Props) {
  // Se guarda el texto aparte para no perder cosas como "12." mientras se escribe.
  const [text, setText] = useState(value === null ? '' : String(value));

  return (
    <TextField
      label={label}
      value={text}
      onChangeText={(next) => {
        // Solo dígitos, comas y un punto decimal.
        if (!/^[\d,]*\.?\d{0,2}$/.test(next)) return;
        setText(next);
        onChange(parseAmount(next));
      }}
      keyboardType="decimal-pad"
      placeholder="0.00"
      error={error}
    />
  );
}
