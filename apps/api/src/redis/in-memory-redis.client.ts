import { EventEmitter } from 'events';

export class InMemoryRedisClient extends EventEmitter {
  public status = 'ready';
  private store = new Map<string, { value: string; expiresAt?: number }>();

  async get(key: string): Promise<string | null> {
    const item = this.store.get(key);
    if (!item) return null;
    if (item.expiresAt && Date.now() > item.expiresAt) {
      this.store.delete(key);
      return null;
    }
    return item.value;
  }

  async set(key: string, value: unknown, ...args: any[]): Promise<'OK'> {
    let expiresAt: number | undefined;
    const strVal = typeof value === 'string' ? value : JSON.stringify(value);

    // Support SET key value EX seconds
    const exIdx = args.findIndex(
      (a) => typeof a === 'string' && a.toUpperCase() === 'EX',
    );
    if (exIdx !== -1 && typeof args[exIdx + 1] === 'number') {
      expiresAt = Date.now() + args[exIdx + 1] * 1000;
    }

    this.store.set(key, { value: strVal, expiresAt });
    return 'OK';
  }

  async del(...keys: string[]): Promise<number> {
    let count = 0;
    for (const key of keys) {
      if (this.store.delete(key)) count++;
    }
    return count;
  }

  async unlink(...keys: string[]): Promise<number> {
    return this.del(...keys);
  }

  async scan(cursor: string, ...args: any[]): Promise<[string, string[]]> {
    const matchIdx = args.indexOf('MATCH');
    const pattern = matchIdx !== -1 ? args[matchIdx + 1] : '*';
    const regex = new RegExp(
      '^' + pattern.replace(/\*/g, '.*').replace(/\?/g, '.') + '$',
    );
    const now = Date.now();
    const matched: string[] = [];

    for (const [k, v] of this.store.entries()) {
      if (v.expiresAt && now > v.expiresAt) {
        this.store.delete(k);
        continue;
      }
      if (regex.test(k)) {
        matched.push(k);
      }
    }
    return ['0', matched];
  }

  async eval(
    _script: string,
    _numKeys: number,
    key: string,
    ...args: any[]
  ): Promise<number> {
    // Atomic INCR + EXPIRE simulation for RateLimitGuard
    const now = Date.now();
    const item = this.store.get(key);
    const ttlSec = Number(args[0]) || 60;

    if (!item || (item.expiresAt && now > item.expiresAt)) {
      this.store.set(key, { value: '1', expiresAt: now + ttlSec * 1000 });
      return 1;
    }

    const nextVal = (Number(item.value) || 0) + 1;
    item.value = String(nextVal);
    return nextVal;
  }

  async ttl(key: string): Promise<number> {
    const item = this.store.get(key);
    if (!item) return -2;
    if (!item.expiresAt) return -1;
    const remaining = Math.ceil((item.expiresAt - Date.now()) / 1000);
    return remaining > 0 ? remaining : -2;
  }

  async quit(): Promise<'OK'> {
    this.store.clear();
    return 'OK';
  }

  disconnect(): void {
    this.store.clear();
  }
}
