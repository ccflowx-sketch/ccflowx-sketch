export interface ServiceDescriptor<T = unknown> {
  token: string | symbol;
  implementation?: new (...args: any[]) => T;
  useValue?: T;
  useFactory?: () => T | Promise<T>;
  singleton?: boolean;
}