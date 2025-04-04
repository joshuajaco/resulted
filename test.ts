import assert from "assert";
import { Result, Ok, Err } from "./index";

// Result

assert.strictEqual(Result.Ok, Ok);
assert.strictEqual(Result.Err, Err);

// ok
assert.deepEqual(JSON.parse(JSON.stringify(Ok(1))), { ok: true, value: 1 });

// error

assert.deepEqual(JSON.parse(JSON.stringify(Err(1))), { ok: false, error: 1 });

// eq

assert(Ok(1).eq(Ok(1)));
assert(Err(1).eq(Err(1)));

assert(!Ok(1).eq(Ok(2)));
assert(!Err(1).eq(Err(2)));

assert(!Err<number, number>(1).eq(Ok(1)));
assert(!Ok<number, number>(1).eq(Err(1)));

// expect

try {
  const x = Err("emergency failure");
  x.expect("Testing expect");
} catch (e) {
  assert(e instanceof Error);
  assert(e.message === "Testing expect");
}

assert.equal(Ok(10).expect("Testing expectError"), 10);

// expectError

try {
  const x = Ok(10);
  x.expectError("Testing expectError");
} catch (e) {
  assert(e instanceof Error);
  assert(e.message === "Testing expectError");
}

assert.equal(Err(10).expectError("Testing expectError"), 10);

// unwrap

try {
  const x = Err("emergency failure");
  x.unwrap();
} catch (e) {
  assert(e instanceof Error);
  assert(e.message === "");
}

assert.equal(Ok(10).unwrap(), 10);

// unwrapOr

assert.equal(Ok(9).unwrapOr(2), 9);
assert.equal(Err("error").unwrapOr(2), 2);

// unwrapOrElse

const count = (x: string) => x.length;

assert.equal(Ok<number, string>(2).unwrapOrElse(count), 2);
assert.equal(Err("foo").unwrapOrElse(count), 3);

// map

assert(
  Ok("foo")
    .map((s) => s.length)
    .eq(Ok(3)),
);

assert(
  Err<string, string>("error")
    .map((s) => s.length)
    .eq(Err("error")),
);

// mapError

assert(
  Err("error")
    .mapError((s) => s.length)
    .eq(Err(5)),
);

assert(
  Ok<string, string>("foo")
    .mapError((s) => s.length)
    .eq(Ok("foo")),
);

// mapOr

assert.equal(
  Ok("foo").mapOr(42, (s) => s.length),
  3,
);

assert.equal(
  Err<string, string>("bar").mapOr(42, (s) => s.length),
  42,
);

// mapOrElse

assert.equal(
  Ok("foo").mapOrElse(
    (_e) => 42,
    (s) => s.length,
  ),
  3,
);

assert.equal(
  Err<string, string>("bar").mapOrElse(
    (e) => e.length * 3,
    (s) => s.length,
  ),
  9,
);

// and

assert(Ok<number, string>(2).and(Err("late error")).eq(Err("late error")));

assert(Err("early error").and(Ok("foo")).eq(Err("early error")));

assert(Err("not a 2").and(Err("late error")).eq(Err("not a 2")));

assert(Ok(2).and(Ok("different result type")).eq(Ok("different result type")));

// andThen

assert(
  Ok(2)
    .andThen((i) => Ok(i.toString()))
    .eq(Ok("2")),
);

assert(
  Err<number, number>(2)
    .andThen((i) => Ok(i.toString()))
    .eq(Err(2)),
);

// or

assert(Ok(2).or(Err("late error")).eq(Ok(2)));

assert(Err<number, string>("early error").or(Ok(2)).eq(Ok(2)));

assert(Err("not a 2").or(Err("late error")).eq(Err("late error")));

assert(Ok(2).or(Ok(100)).eq(Ok(2)));

// orElse

const sq = (x: number): Result<number, number> => Ok(x * x);
const err = (x: number): Result<number, number> => Err(x);

assert(Ok<number, number>(2).orElse(sq).orElse(sq).eq(Ok(2)));
assert(Ok<number, number>(2).orElse(err).orElse(sq).eq(Ok(2)));

assert(Err<number, number>(3).orElse(sq).orElse(err).eq(Ok(9)));

assert(Err<number, number>(3).orElse(err).orElse(err).eq(Err(3)));

function foo(): Result<undefined, number> {
  return Ok();
}
