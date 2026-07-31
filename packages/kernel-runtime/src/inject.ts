export const INJECT_METADATA =
  Symbol("inject_metadata");

export function Inject(
  ...tokens: (string | symbol)[]
) {
  return function (
    target: object
  ) {
    Reflect.defineProperty(
      target,
      INJECT_METADATA,
      {
        value: tokens
      }
    );
  };
}