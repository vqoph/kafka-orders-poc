export type PocEventMap = {
  'poc:order-created': { orderId: string };
  'poc:order-selected': { orderId: string };
  'poc:chaos-updated': { service: 'payment' | 'inventory'; rate: number };
};

type EventName = keyof PocEventMap;

function eventName(name: EventName): string {
  return name;
}

export function emitPocEvent<K extends EventName>(name: K, detail: PocEventMap[K]): void {
  if (typeof window === 'undefined') return;
  window.dispatchEvent(new CustomEvent(eventName(name), { detail }));
}

export function onPocEvent<K extends EventName>(
  name: K,
  handler: (detail: PocEventMap[K]) => void,
): () => void {
  if (typeof window === 'undefined') {
    return () => undefined;
  }

  const listener = (event: Event) => {
    const custom = event as CustomEvent<PocEventMap[K]>;
    handler(custom.detail);
  };

  window.addEventListener(eventName(name), listener);
  return () => window.removeEventListener(eventName(name), listener);
}
