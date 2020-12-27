import { useWatch } from '0g-react';
import * as React from 'react';
import { Field, FieldInput, FieldLabel } from '../components/Field';
import { useId } from '../hooks/useId';
import { StoreFieldProps } from './types';

export type NumberFieldProps = StoreFieldProps;

export function NumberField({ store, name }: NumberFieldProps) {
  const id = useId();
  const ref = React.useRef<HTMLInputElement>(null);
  const onChange = React.useCallback(
    (ev: React.ChangeEvent<HTMLInputElement>) => {
      store.set({ [name]: ev.target.value });
    },
    [store, name],
  );

  useWatch(
    store,
    React.useCallback(() => {
      if (!ref.current) return;
      ref.current.value = (store as any)[name];
    }, [store, name, ref]),
  );

  return (
    <Field>
      <FieldLabel htmlFor={id}>{name}</FieldLabel>
      <FieldInput ref={ref} onChange={onChange} id={id} type="number" />
    </Field>
  );
}
