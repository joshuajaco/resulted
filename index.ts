export type Result<T, E> = (
  | { ok: true; value: T }
  | { ok: false; error: E }
) & {
  expect(message: string): T;
  expectError(message: string): E;
  unwrap(): T;
  unwrapOr(_default: T): T;
  unwrapOrElse(fn: (error: E) => T): T;
  map<U>(fn: (value: T) => U): Result<U, E>;
  mapError<F>(fn: (error: E) => F): Result<T, F>;
  mapOr<U>(_default: U, fn: (value: T) => U): U;
  mapOrElse<U>(defaultFn: (error: E) => U, fn: (value: T) => U): U;
  and<U>(result: Result<U, E>): Result<U, E>;
  andThen<U>(fn: (value: T) => Result<U, E>): Result<U, E>;
  or<F>(result: Result<T, F>): Result<T, F>;
  orElse<F>(fn: (error: E) => Result<T, F>): Result<T, F>;
  eq(other: Result<T, E>): boolean;
};

export function Ok<T extends void, E>(value?: T): Result<T, E>;
export function Ok<T, E>(value: T): Result<T, E>;
export function Ok(value: unknown) {
  return createResult({ ok: true, value });
}

export function Err<T, E extends void>(error?: E): Result<T, E>;
export function Err<T, E>(error: E): Result<T, E>;
export function Err(error: unknown) {
  return createResult({ ok: false, error });
}

export const Result = { Ok, Err };

export default Result;

function createResult<T, E>(
  init: { ok: true; value: T } | { ok: false; error: E }
): Result<T, E> {
  return {
    ...init,
    expect: (message) => {
      if (init.ok) return init.value;
      throw new Error(message);
    },
    expectError: (message) => {
      if (init.ok) throw new Error(message);
      return init.error;
    },
    unwrap: () => {
      if (init.ok) return init.value;
      throw new Error();
    },
    unwrapOr: (_default) => (init.ok ? init.value : _default),
    unwrapOrElse: (fn) => (init.ok ? init.value : fn(init.error)),
    and: (result) => (init.ok ? result : createResult(init)),
    andThen: (fn) => (init.ok ? fn(init.value) : createResult(init)),
    or: (result) => (init.ok ? createResult(init) : result),
    orElse: (fn) => (init.ok ? createResult(init) : fn(init.error)),
    map: (fn) =>
      createResult(init.ok ? { ok: true, value: fn(init.value) } : init),
    mapError: (fn) =>
      createResult(init.ok ? init : { ok: false, error: fn(init.error) }),
    mapOr: (_default, fn) => (init.ok ? fn(init.value) : _default),
    mapOrElse: (defaultFn, fn) =>
      init.ok ? fn(init.value) : defaultFn(init.error),
    eq: (other) =>
      init.ok
        ? other.ok && init.value === other.value
        : !other.ok && init.error === other.error,
  };
}
