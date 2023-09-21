/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
define(["require", "exports", "assert", "sinon", "vs/base/common/decorators"], function (require, exports, assert, sinon, decorators_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    suite('Decorators', () => {
        test('memoize should memoize methods', () => {
            class Foo {
                constructor(c) {
                    this.c = c;
                    this.count = 0;
                }
                answer() {
                    this.count++;
                    return this.c;
                }
            }
            __decorate([
                decorators_1.$6g
            ], Foo.prototype, "answer", null);
            const foo = new Foo(42);
            assert.strictEqual(foo.count, 0);
            assert.strictEqual(foo.answer(), 42);
            assert.strictEqual(foo.count, 1);
            assert.strictEqual(foo.answer(), 42);
            assert.strictEqual(foo.count, 1);
            const foo2 = new Foo(1337);
            assert.strictEqual(foo2.count, 0);
            assert.strictEqual(foo2.answer(), 1337);
            assert.strictEqual(foo2.count, 1);
            assert.strictEqual(foo2.answer(), 1337);
            assert.strictEqual(foo2.count, 1);
            assert.strictEqual(foo.answer(), 42);
            assert.strictEqual(foo.count, 1);
            const foo3 = new Foo(null);
            assert.strictEqual(foo3.count, 0);
            assert.strictEqual(foo3.answer(), null);
            assert.strictEqual(foo3.count, 1);
            assert.strictEqual(foo3.answer(), null);
            assert.strictEqual(foo3.count, 1);
            const foo4 = new Foo(undefined);
            assert.strictEqual(foo4.count, 0);
            assert.strictEqual(foo4.answer(), undefined);
            assert.strictEqual(foo4.count, 1);
            assert.strictEqual(foo4.answer(), undefined);
            assert.strictEqual(foo4.count, 1);
        });
        test('memoize should memoize getters', () => {
            class Foo {
                constructor(c) {
                    this.c = c;
                    this.count = 0;
                }
                get answer() {
                    this.count++;
                    return this.c;
                }
            }
            __decorate([
                decorators_1.$6g
            ], Foo.prototype, "answer", null);
            const foo = new Foo(42);
            assert.strictEqual(foo.count, 0);
            assert.strictEqual(foo.answer, 42);
            assert.strictEqual(foo.count, 1);
            assert.strictEqual(foo.answer, 42);
            assert.strictEqual(foo.count, 1);
            const foo2 = new Foo(1337);
            assert.strictEqual(foo2.count, 0);
            assert.strictEqual(foo2.answer, 1337);
            assert.strictEqual(foo2.count, 1);
            assert.strictEqual(foo2.answer, 1337);
            assert.strictEqual(foo2.count, 1);
            assert.strictEqual(foo.answer, 42);
            assert.strictEqual(foo.count, 1);
            const foo3 = new Foo(null);
            assert.strictEqual(foo3.count, 0);
            assert.strictEqual(foo3.answer, null);
            assert.strictEqual(foo3.count, 1);
            assert.strictEqual(foo3.answer, null);
            assert.strictEqual(foo3.count, 1);
            const foo4 = new Foo(undefined);
            assert.strictEqual(foo4.count, 0);
            assert.strictEqual(foo4.answer, undefined);
            assert.strictEqual(foo4.count, 1);
            assert.strictEqual(foo4.answer, undefined);
            assert.strictEqual(foo4.count, 1);
        });
        test('memoized property should not be enumerable', () => {
            class Foo {
                get answer() {
                    return 42;
                }
            }
            __decorate([
                decorators_1.$6g
            ], Foo.prototype, "answer", null);
            const foo = new Foo();
            assert.strictEqual(foo.answer, 42);
            assert(!Object.keys(foo).some(k => /\$memoize\$/.test(k)));
        });
        test('memoized property should not be writable', () => {
            class Foo {
                get answer() {
                    return 42;
                }
            }
            __decorate([
                decorators_1.$6g
            ], Foo.prototype, "answer", null);
            const foo = new Foo();
            assert.strictEqual(foo.answer, 42);
            try {
                foo['$memoize$answer'] = 1337;
                assert(false);
            }
            catch (e) {
                assert.strictEqual(foo.answer, 42);
            }
        });
        test('throttle', () => {
            const spy = sinon.spy();
            const clock = sinon.useFakeTimers();
            try {
                class ThrottleTest {
                    constructor(fn) {
                        this.c = fn;
                    }
                    report(p) {
                        this.c(p);
                    }
                }
                __decorate([
                    (0, decorators_1.$8g)(100, (a, b) => a + b, () => 0)
                ], ThrottleTest.prototype, "report", null);
                const t = new ThrottleTest(spy);
                t.report(1);
                t.report(2);
                t.report(3);
                assert.deepStrictEqual(spy.args, [[1]]);
                clock.tick(200);
                assert.deepStrictEqual(spy.args, [[1], [5]]);
                spy.resetHistory();
                t.report(4);
                t.report(5);
                clock.tick(50);
                t.report(6);
                assert.deepStrictEqual(spy.args, [[4]]);
                clock.tick(60);
                assert.deepStrictEqual(spy.args, [[4], [11]]);
            }
            finally {
                clock.restore();
            }
        });
    });
});
//# sourceMappingURL=decorators.test.js.map