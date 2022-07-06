type Methods<T, E> = {
  expect: (message: string) => T;
  expectError: (message: string) => E;
  unwrap: () => T;
  unwrapOr: (_default: T) => T;
  unwrapOrElse: (fn: (error: E) => T) => T;
  map: <U>(fn: (value: T) => U) => Result<U, E>;
  mapError: <F>(fn: (error: E) => F) => Result<T, F>;
  mapOr: <U>(_default: U, fn: (value: T) => U) => U;
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
    expect(message) {
      if (init.ok) return init.value;
      throw new Error(message);
    },
    expectError(message) {
      if (init.ok) throw new Error(message);
      return init.error;
    },
    unwrap() {
      if (init.ok) return init.value;
      throw new Error();
    },
    unwrapOr(_default) {
      if (init.ok) return init.value;
      return _default;
    },
    unwrapOrElse(fn) {
      if (init.ok) return init.value;
      return fn(init.error);
    },
    and(result) {
      if (init.ok) return result;
      return createResult(init);
    },
    andThen(fn) {
      if (init.ok) return fn(init.value);
      return createResult(init);
    },
    or(result) {
      if (init.ok) return createResult(init);
      return result;
    },
    orElse(fn) {
      if (init.ok) return createResult(init);
      return fn(init.error);
    },
    map(fn) {
      if (init.ok) return createResult({ ok: true, value: fn(init.value) });
      return createResult(init);
    },
    mapError(fn) {
      if (init.ok) return createResult(init);
      return createResult({ ok: false, error: fn(init.error) });
    },
    mapOr(_default, fn) {
      if (init.ok) return fn(init.value);
      return _default;
    },
    match(matcher) {
      if (init.ok) return matcher.ok(init.value);
      return matcher.error(init.error);
    },
  };
}

export const Result = {
  ok<T, E>(value: T): Result<T, E> {
    return createResult({ ok: true, value });
  },
  error<T, E>(error: E): Result<T, E> {
    return createResult({ ok: false, error });
  },
  equals<T, E>(a: Result<T, E>, b: Result<T, E>): boolean {
    if (a.ok) return b.ok && a.value === b.value;
    if (!b.ok) return a.error === b.error;
    return false;
  },
  from<T, E>(fn: () => T): Result<T, E> {
    try {
      return Result.ok(fn());
    } catch (e: any) {
      return Result.error(e);
    }
  },
  wrap<T, E, A extends Array<any> = []>(
    fn: (...args: A) => T
  ): (...args: A) => Result<T, E> {
    return (...args) => {
      try {
        return Result.ok(fn(...args));
      } catch (e: any) {
        return Result.error(e);
      }
    };
  },
};
