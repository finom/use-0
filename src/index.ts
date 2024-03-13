/* eslint-disable no-param-reassign */
/* eslint-disable max-len */
import { useEffect, useMemo, useState } from 'react';
import listen from './listen';
import type { SliceRecord } from './types';

export type WithUse<T> = T & {
  use: ReturnType<typeof getUse<WithUse<T>>>;
};

export { listen };

export function getUse<STORE>() {
  return function use<
    KEYS extends keyof STORE | null | undefined | Array<keyof STORE>,
  >(
    this: SliceRecord<STORE>,
    keyAsIs: KEYS,
  ): KEYS extends null | undefined
      ? undefined : KEYS extends keyof STORE
        ? STORE[KEYS]
        : KEYS extends Array<infer U> ? (U extends keyof STORE ? STORE[U] : never)[] : never {
    const keys = useMemo(() => (keyAsIs instanceof Array ? keyAsIs : [keyAsIs]) as (keyof STORE)[], [keyAsIs]);

    const [stateValue, setStateValue] = useState(() => keys.map((key) => (key ? this[key] : undefined)));

    useEffect(() => {
      const handler = () => {
        setStateValue(() => keys.map((key) => (key ? this[key] : undefined)));
      };

      const unsubscribe = keys.filter(Boolean).map((key) => listen(this, key, handler));

      return () => {
        unsubscribe.forEach((u) => u());
      };
    }, [stateValue, keys]);

    return (keyAsIs instanceof Array ? stateValue : stateValue[0]) as ReturnType<typeof use<KEYS>>;
  };
}

export default getUse;
