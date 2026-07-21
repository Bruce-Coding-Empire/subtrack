import { ValueTransformer } from 'typeorm';

/**
 * Postgres `numeric` columns are returned as strings by the driver to avoid
 * float precision loss on large values — this app's amounts are small enough
 * that a plain JS `number` (matching `api-contract.md`'s typed fields) is safe.
 */
export const numericTransformer: ValueTransformer = {
  to: (value?: number | null) => value,
  from: (value: string | null) => (value === null ? null : Number(value)),
};
