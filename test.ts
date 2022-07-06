import assert from "assert";
import { expectType } from "ts-expect";
import { Result } from "./index";

const { ok, error, equals, from, wrap } = Result;

// ok

assert.deepEqual(JSON.parse(JSON.stringify(ok(1))), { ok: true, value: 1 });

// error

assert.deepEqual(JSON.parse(JSON.stringify(error(1))), { ok: false, error: 1 });

// equals

assert(equals(ok(1), ok(1)));
assert(equals(error(1), error(1)));

assert(!equals(ok(1), ok(2)));
assert(!equals(error(1), error(2)));

assert(!equals(error<number, number>(1), ok(1)));
assert(!equals(ok<number, number>(1), error(1)));

// from

assert(
  equals(
    from(() => 1),
    ok(1)
  )
);

assert(
  equals(
    from<void, number>(() => {
      throw 1;
    }),
    error(1)
  )
);

// wrap

assert(equals(wrap((x) => x)(1), ok(1)));

assert(
  equals(
    wrap<number, number, [number]>((x) => {
      throw x;
    })(1),
    error(1)
  )
);

// expect

try {
  const x = error("emergency failure");
  x.expect("Testing expect");
} catch (e) {
  assert(e instanceof Error);
  assert(e.message === "Testing expect");
}

assert.equal(ok(10).expect("Testing expectError"), 10);

// expectError

try {
  const x = ok(10);
  x.expectError("Testing expectError");
} catch (e) {
  assert(e instanceof Error);
  assert(e.message === "Testing expectError");
}

assert.equal(error(10).expectError("Testing expectError"), 10);

// unwrap

try {
  const x = error("emergency failure");
  x.unwrap();
} catch (e) {
  assert(e instanceof Error);
  assert(e.message === "");
}

assert.equal(ok(10).unwrap(), 10);

// unwrapOr

assert.equal(ok(9).unwrapOr(2), 9);
assert.equal(error("error").unwrapOr(2), 2);

// unwrapOrElse

const count = (x: string) => x.length;

assert.equal(ok<number, string>(2).unwrapOrElse(count), 2);
assert.equal(error("foo").unwrapOrElse(count), 3);

// map

assert(
  equals(
    ok("foo").map((s) => s.length),
    ok(3)
  )
);

assert(
  equals(
    error<string, string>("error").map((s) => s.length),
    error("error")
  )
);

// mapError

assert(
  equals(
    error("error").mapError((s) => s.length),
    error(5)
  )
);

assert(
  equals(
    ok<string, string>("foo").mapError((s) => s.length),
    ok("foo")
  )
);

// mapOr

assert.equal(
  ok("foo").mapOr(42, (s) => s.length),
  3
);

assert.equal(
  error<string, string>("bar").mapOr(42, (s) => s.length),
  42
);

// and

assert(
  equals(ok<number, string>(2).and(error("late error")), error("late error"))
);

assert(equals(error("early error").and(ok("foo")), error("early error")));

assert(equals(error("not a 2").and(error("late error")), error("not a 2")));

assert(
  equals(ok(2).and(ok("different result type")), ok("different result type"))
);

// andThen

assert(
  equals(
    ok(2).andThen((i) => ok(i.toString())),
    ok("2")
  )
);

assert(
  equals(
    error<number, number>(2).andThen((i) => ok(i.toString())),
    error(2)
  )
);

// or

assert(equals(ok(2).or(error("late error")), ok(2)));

assert(equals(error<number, string>("early error").or(ok(2)), ok(2)));

assert(equals(error("not a 2").or(error("late error")), error("late error")));

assert(equals(ok(2).or(ok(100)), ok(2)));

// orElse

const sq = (x: number): Result<number, number> => ok(x * x);
const err = (x: number): Result<number, number> => error(x);

assert(equals(ok<number, number>(2).orElse(sq).orElse(sq), ok(2)));
assert(equals(ok<number, number>(2).orElse(err).orElse(sq), ok(2)));

assert(equals(error<number, number>(3).orElse(sq).orElse(err), ok(9)));

assert(equals(error<number, number>(3).orElse(err).orElse(err), error(3)));

// match

assert.equal(ok(1).match({ ok: (x) => x.toString(), error: () => {} }), "1");
assert.equal(error(1).match({ ok: () => {}, error: (x) => x.toString() }), "1");

expectType<number>(ok(1).match({ ok: () => 1, error: () => 1 }));
expectType<"foo" | "bar">(ok(1).match({ ok: () => "foo", error: () => "bar" }));

// @ts-expect-error
expectType<string>(ok(1).match({ ok: () => "foo", error: () => {} }));
