export interface DependencyMetadata {
  token: string | symbol;
  dependencies: (string | symbol)[];
}