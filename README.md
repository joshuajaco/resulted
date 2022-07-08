# resulted [![Coverage Status](https://coveralls.io/repos/github/joshuajaco/resulted/badge.svg?branch=main)](https://coveralls.io/github/joshuajaco/resulted?branch=main) [![code style: prettier](https://img.shields.io/badge/code_style-prettier-ff69b4.svg?style=flat-square)](https://github.com/prettier/prettier)

A [tiny](https://bundlephobia.com/package/resulted) typescript result object implementation based on Rust's [std::result::Result](https://doc.rust-lang.org/std/result/enum.Result.html) enum.

## Table of contents

- [Installation](#installation)
- [Basic](#basic)
- [Methods](#methods)
  - [and](#and)
  - [andThen](#andthen)
- [License](#license)

## Installation

Using `npm`:

```shell
npm i resulted
```

Or using `yarn`:

```shell
yarn add resulted
```

## Basic

The `Result` type is essentially just the union of

```typescript
type Result<T, E> = { ok: true; value: T } | { ok: false; error: E };
```

```typescript
import { Result } from "resulted";

const okResult = Result.ok("foo");

okResult.value; // Property 'value' does not exist on type '{ ok: false; error: ...; } ...

if (okResult.ok) {
  okResult.value; // "foo"
}

const errorResult = Result.error("bar");

okResult.error; // Property 'error' does not exist on type '{ ok: true; value: ...; } ...

if (!okResult.ok) {
  okResult.error; // "bar"
}
```

## Methods

---

### `and`

```typescript
function and<U>(res: Result<U, E>): Result<U, E>;
```

Returns `res` if the result is `ok`, otherwise returns the `error` value of self.

Basic usage:

```typescript
Result.ok(2).and(Result.error("late error")); // Result.error("late error")

Result.error("early error").and(Result.ok("foo")); // Result.error("early error")

Result.error("not a 2").and(Result.error("late error")); // Result.error("not a 2")

Result.ok(2).and(Result.ok("different result type")); // Result.ok("different result type")
```

---

### `andThen`

```typescript
function andThen<U>(op: (value: T) => Result<U, E>): Result<U, E>;
```

Calls `op` if the result is `ok`, otherwise returns the `error` value of self.

This function can be used for control flow based on Result values.

```typescript
Result.ok(2).andThen((i) => Result.ok(i.toString())); // Result.ok("2")

Result.error(2).andThen((i) => Result.ok(i.toString())); // Result.error(2)
```

## License

[MIT](https://github.com/joshuajaco/resulted/blob/main/LICENSE)
