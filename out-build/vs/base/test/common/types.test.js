/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "assert", "vs/base/common/types"], function (require, exports, assert, types) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    suite('Types', () => {
        test('isFunction', () => {
            assert(!types.$xf(undefined));
            assert(!types.$xf(null));
            assert(!types.$xf('foo'));
            assert(!types.$xf(5));
            assert(!types.$xf(true));
            assert(!types.$xf([]));
            assert(!types.$xf([1, 2, '3']));
            assert(!types.$xf({}));
            assert(!types.$xf({ foo: 'bar' }));
            assert(!types.$xf(/test/));
            assert(!types.$xf(new RegExp('')));
            assert(!types.$xf(new Date()));
            assert(types.$xf(assert));
            assert(types.$xf(function foo() { }));
        });
        test('areFunctions', () => {
            assert(!types.$yf());
            assert(!types.$yf(null));
            assert(!types.$yf('foo'));
            assert(!types.$yf(5));
            assert(!types.$yf(true));
            assert(!types.$yf([]));
            assert(!types.$yf([1, 2, '3']));
            assert(!types.$yf({}));
            assert(!types.$yf({ foo: 'bar' }));
            assert(!types.$yf(/test/));
            assert(!types.$yf(new RegExp('')));
            assert(!types.$yf(new Date()));
            assert(!types.$yf(assert, ''));
            assert(types.$yf(assert));
            assert(types.$yf(assert, assert));
            assert(types.$yf(function foo() { }));
        });
        test('isObject', () => {
            assert(!types.$lf(undefined));
            assert(!types.$lf(null));
            assert(!types.$lf('foo'));
            assert(!types.$lf(5));
            assert(!types.$lf(true));
            assert(!types.$lf([]));
            assert(!types.$lf([1, 2, '3']));
            assert(!types.$lf(/test/));
            assert(!types.$lf(new RegExp('')));
            assert(!types.$xf(new Date()));
            assert.strictEqual(types.$lf(assert), false);
            assert(!types.$lf(function foo() { }));
            assert(types.$lf({}));
            assert(types.$lf({ foo: 'bar' }));
        });
        test('isEmptyObject', () => {
            assert(!types.$wf(undefined));
            assert(!types.$wf(null));
            assert(!types.$wf('foo'));
            assert(!types.$wf(5));
            assert(!types.$wf(true));
            assert(!types.$wf([]));
            assert(!types.$wf([1, 2, '3']));
            assert(!types.$wf(/test/));
            assert(!types.$wf(new RegExp('')));
            assert(!types.$wf(new Date()));
            assert.strictEqual(types.$wf(assert), false);
            assert(!types.$wf(function foo() { }));
            assert(!types.$wf({ foo: 'bar' }));
            assert(types.$wf({}));
        });
        test('isString', () => {
            assert(!types.$jf(undefined));
            assert(!types.$jf(null));
            assert(!types.$jf(5));
            assert(!types.$jf([]));
            assert(!types.$jf([1, 2, '3']));
            assert(!types.$jf(true));
            assert(!types.$jf({}));
            assert(!types.$jf(/test/));
            assert(!types.$jf(new RegExp('')));
            assert(!types.$jf(new Date()));
            assert(!types.$jf(assert));
            assert(!types.$jf(function foo() { }));
            assert(!types.$jf({ foo: 'bar' }));
            assert(types.$jf('foo'));
        });
        test('isNumber', () => {
            assert(!types.$nf(undefined));
            assert(!types.$nf(null));
            assert(!types.$nf('foo'));
            assert(!types.$nf([]));
            assert(!types.$nf([1, 2, '3']));
            assert(!types.$nf(true));
            assert(!types.$nf({}));
            assert(!types.$nf(/test/));
            assert(!types.$nf(new RegExp('')));
            assert(!types.$nf(new Date()));
            assert(!types.$nf(assert));
            assert(!types.$nf(function foo() { }));
            assert(!types.$nf({ foo: 'bar' }));
            assert(!types.$nf(parseInt('A', 10)));
            assert(types.$nf(5));
        });
        test('isUndefined', () => {
            assert(!types.$qf(null));
            assert(!types.$qf('foo'));
            assert(!types.$qf([]));
            assert(!types.$qf([1, 2, '3']));
            assert(!types.$qf(true));
            assert(!types.$qf({}));
            assert(!types.$qf(/test/));
            assert(!types.$qf(new RegExp('')));
            assert(!types.$qf(new Date()));
            assert(!types.$qf(assert));
            assert(!types.$qf(function foo() { }));
            assert(!types.$qf({ foo: 'bar' }));
            assert(types.$qf(undefined));
        });
        test('isUndefinedOrNull', () => {
            assert(!types.$sf('foo'));
            assert(!types.$sf([]));
            assert(!types.$sf([1, 2, '3']));
            assert(!types.$sf(true));
            assert(!types.$sf({}));
            assert(!types.$sf(/test/));
            assert(!types.$sf(new RegExp('')));
            assert(!types.$sf(new Date()));
            assert(!types.$sf(assert));
            assert(!types.$sf(function foo() { }));
            assert(!types.$sf({ foo: 'bar' }));
            assert(types.$sf(undefined));
            assert(types.$sf(null));
        });
        test('assertIsDefined / assertAreDefined', () => {
            assert.throws(() => types.$uf(undefined));
            assert.throws(() => types.$uf(null));
            assert.throws(() => types.$vf(null, undefined));
            assert.throws(() => types.$vf(true, undefined));
            assert.throws(() => types.$vf(undefined, false));
            assert.strictEqual(types.$uf(true), true);
            assert.strictEqual(types.$uf(false), false);
            assert.strictEqual(types.$uf('Hello'), 'Hello');
            assert.strictEqual(types.$uf(''), '');
            const res = types.$vf(1, true, 'Hello');
            assert.strictEqual(res[0], 1);
            assert.strictEqual(res[1], true);
            assert.strictEqual(res[2], 'Hello');
        });
        test('validateConstraints', () => {
            types.$zf([1, 'test', true], [Number, String, Boolean]);
            types.$zf([1, 'test', true], ['number', 'string', 'boolean']);
            types.$zf([console.log], [Function]);
            types.$zf([undefined], [types.$qf]);
            types.$zf([1], [types.$nf]);
            class Foo {
            }
            types.$zf([new Foo()], [Foo]);
            function isFoo(f) { }
            assert.throws(() => types.$zf([new Foo()], [isFoo]));
            function isFoo2(f) { return true; }
            types.$zf([new Foo()], [isFoo2]);
            assert.throws(() => types.$zf([1, true], [types.$nf, types.$jf]));
            assert.throws(() => types.$zf(['2'], [types.$nf]));
            assert.throws(() => types.$zf([1, 'test', true], [Number, String, Number]));
        });
    });
});
//# sourceMappingURL=types.test.js.map