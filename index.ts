type Methods<T, E> = {
  expect: (message: string) => T;
  expectError: (message: string) => E;
  unwrap: () => T;
  unwrapOr: (_default: T) => T;
  unwrapOrElse: (fn: (error: E) => T) => T;
  map: <U>(fn: (value: T) => U) => Result<U, E>;
  mapError: <F>(fn: (error: E) => F) => Result<T, F>;
  mapOr: <U>(_default: U, fn: (value: T) => U) => U;
  mapOrElse: <U>(defaultFn: (error: E) => U, fn: (value: T) => U) => U;
  and: <U>(result: Result<U, E>) => Result<U, E>;
  andThen: <U>(fn: (value: T) => Result<U, E>) => Result<U, E>;
  or: <F>(result: Result<T, F>) => Result<T, F>;
  orElse: <F>(fn: (error: E) => Result<T, F>) => Result<T, F>;
  match: <U, F>(matcher: {
    ok: (value: T) => U;
    error: (error: E) => F;
  }) => U | F;
};

type Attributes<T, E> = { ok: true; value: T } | { ok: false; error: E };

export type Result<T, E> = Attributes<T, E> & Methods<T, E>;

function createResult<T, E>(init: Attributes<T, E>): Result<T, E> {
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

    match: (matcher) =>
      init.ok ? matcher.ok(init.value) : matcher.error(init.error),
  };
}

export const Result = {
  ok: <T, E>(value: T): Result<T, E> => createResult({ ok: true, value }),
  error: <T, E>(error: E): Result<T, E> => createResult({ ok: false, error }),

  equals: <T, E>(a: Result<T, E>, b: Result<T, E>): boolean =>
    a.ok ? b.ok && a.value === b.value : !b.ok && a.error === b.error,

  from: <T, E>(fn: () => T): Result<T, E> => {
    try {
      return Result.ok(fn());
    } catch (e: any) {
      return Result.error(e);
    }
  },

  wrap:
    <T, E, A extends Array<any> = []>(
      fn: (...args: A) => T
    ): ((...args: A) => Result<T, E>) =>
    (...args) => {
      try {
        return Result.ok(fn(...args));
      } catch (e: any) {
        return Result.error(e);
      }
    },
};
