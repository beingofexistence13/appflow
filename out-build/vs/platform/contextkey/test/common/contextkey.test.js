define(["require", "exports", "assert", "vs/base/common/platform", "vs/platform/contextkey/common/contextkey"], function (require, exports, assert, platform_1, contextkey_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    function createContext(ctx) {
        return {
            getValue: (key) => {
                return ctx[key];
            }
        };
    }
    suite('ContextKeyExpr', () => {
        test('ContextKeyExpr.equals', () => {
            const a = contextkey_1.$Ii.and(contextkey_1.$Ii.has('a1'), contextkey_1.$Ii.and(contextkey_1.$Ii.has('and.a')), contextkey_1.$Ii.has('a2'), contextkey_1.$Ii.regex('d3', /d.*/), contextkey_1.$Ii.regex('d4', /\*\*3*/), contextkey_1.$Ii.equals('b1', 'bb1'), contextkey_1.$Ii.equals('b2', 'bb2'), contextkey_1.$Ii.notEquals('c1', 'cc1'), contextkey_1.$Ii.notEquals('c2', 'cc2'), contextkey_1.$Ii.not('d1'), contextkey_1.$Ii.not('d2'));
            const b = contextkey_1.$Ii.and(contextkey_1.$Ii.equals('b2', 'bb2'), contextkey_1.$Ii.notEquals('c1', 'cc1'), contextkey_1.$Ii.not('d1'), contextkey_1.$Ii.regex('d4', /\*\*3*/), contextkey_1.$Ii.notEquals('c2', 'cc2'), contextkey_1.$Ii.has('a2'), contextkey_1.$Ii.equals('b1', 'bb1'), contextkey_1.$Ii.regex('d3', /d.*/), contextkey_1.$Ii.has('a1'), contextkey_1.$Ii.and(contextkey_1.$Ii.equals('and.a', true)), contextkey_1.$Ii.not('d2'));
            assert(a.equals(b), 'expressions should be equal');
        });
        test('issue #134942: Equals in comparator expressions', () => {
            function testEquals(expr, str) {
                const deserialized = contextkey_1.$Ii.deserialize(str);
                assert.ok(expr);
                assert.ok(deserialized);
                assert.strictEqual(expr.equals(deserialized), true, str);
            }
            testEquals(contextkey_1.$Ii.greater('value', 0), 'value > 0');
            testEquals(contextkey_1.$Ii.greaterEquals('value', 0), 'value >= 0');
            testEquals(contextkey_1.$Ii.smaller('value', 0), 'value < 0');
            testEquals(contextkey_1.$Ii.smallerEquals('value', 0), 'value <= 0');
        });
        test('normalize', () => {
            const key1IsTrue = contextkey_1.$Ii.equals('key1', true);
            const key1IsNotFalse = contextkey_1.$Ii.notEquals('key1', false);
            const key1IsFalse = contextkey_1.$Ii.equals('key1', false);
            const key1IsNotTrue = contextkey_1.$Ii.notEquals('key1', true);
            assert.ok(key1IsTrue.equals(contextkey_1.$Ii.has('key1')));
            assert.ok(key1IsNotFalse.equals(contextkey_1.$Ii.has('key1')));
            assert.ok(key1IsFalse.equals(contextkey_1.$Ii.not('key1')));
            assert.ok(key1IsNotTrue.equals(contextkey_1.$Ii.not('key1')));
        });
        test('evaluate', () => {
            const context = createContext({
                'a': true,
                'b': false,
                'c': '5',
                'd': 'd'
            });
            function testExpression(expr, expected) {
                // console.log(expr + ' ' + expected);
                const rules = contextkey_1.$Ii.deserialize(expr);
                assert.strictEqual(rules.evaluate(context), expected, expr);
            }
            function testBatch(expr, value) {
                /* eslint-disable eqeqeq */
                testExpression(expr, !!value);
                testExpression(expr + ' == true', !!value);
                testExpression(expr + ' != true', !value);
                testExpression(expr + ' == false', !value);
                testExpression(expr + ' != false', !!value);
                testExpression(expr + ' == 5', value == '5');
                testExpression(expr + ' != 5', value != '5');
                testExpression('!' + expr, !value);
                testExpression(expr + ' =~ /d.*/', /d.*/.test(value));
                testExpression(expr + ' =~ /D/i', /D/i.test(value));
                /* eslint-enable eqeqeq */
            }
            testBatch('a', true);
            testBatch('b', false);
            testBatch('c', '5');
            testBatch('d', 'd');
            testBatch('z', undefined);
            testExpression('true', true);
            testExpression('false', false);
            testExpression('a && !b', true && !false);
            testExpression('a && b', true && false);
            testExpression('a && !b && c == 5', true && !false && '5' === '5');
            testExpression('d =~ /e.*/', false);
            // precedence test: false && true || true === true because && is evaluated first
            testExpression('b && a || a', true);
            testExpression('a || b', true);
            testExpression('b || b', false);
            testExpression('b && a || a && b', false);
        });
        test('negate', () => {
            function testNegate(expr, expected) {
                const actual = contextkey_1.$Ii.deserialize(expr).negate().serialize();
                assert.strictEqual(actual, expected);
            }
            testNegate('true', 'false');
            testNegate('false', 'true');
            testNegate('a', '!a');
            testNegate('a && b || c', '!a && !c || !b && !c');
            testNegate('a && b || c || d', '!a && !c && !d || !b && !c && !d');
            testNegate('!a && !b || !c && !d', 'a && c || a && d || b && c || b && d');
            testNegate('!a && !b || !c && !d || !e && !f', 'a && c && e || a && c && f || a && d && e || a && d && f || b && c && e || b && c && f || b && d && e || b && d && f');
        });
        test('false, true', () => {
            function testNormalize(expr, expected) {
                const actual = contextkey_1.$Ii.deserialize(expr).serialize();
                assert.strictEqual(actual, expected);
            }
            testNormalize('true', 'true');
            testNormalize('!true', 'false');
            testNormalize('false', 'false');
            testNormalize('!false', 'true');
            testNormalize('a && true', 'a');
            testNormalize('a && false', 'false');
            testNormalize('a || true', 'true');
            testNormalize('a || false', 'a');
            testNormalize('isMac', platform_1.$j ? 'true' : 'false');
            testNormalize('isLinux', platform_1.$k ? 'true' : 'false');
            testNormalize('isWindows', platform_1.$i ? 'true' : 'false');
        });
        test('issue #101015: distribute OR', () => {
            function t(expr1, expr2, expected) {
                const e1 = contextkey_1.$Ii.deserialize(expr1);
                const e2 = contextkey_1.$Ii.deserialize(expr2);
                const actual = contextkey_1.$Ii.and(e1, e2)?.serialize();
                assert.strictEqual(actual, expected);
            }
            t('a', 'b', 'a && b');
            t('a || b', 'c', 'a && c || b && c');
            t('a || b', 'c || d', 'a && c || a && d || b && c || b && d');
            t('a || b', 'c && d', 'a && c && d || b && c && d');
            t('a || b', 'c && d || e', 'a && e || b && e || a && c && d || b && c && d');
        });
        test('ContextKeyInExpr', () => {
            const ainb = contextkey_1.$Ii.deserialize('a in b');
            assert.strictEqual(ainb.evaluate(createContext({ 'a': 3, 'b': [3, 2, 1] })), true);
            assert.strictEqual(ainb.evaluate(createContext({ 'a': 3, 'b': [1, 2, 3] })), true);
            assert.strictEqual(ainb.evaluate(createContext({ 'a': 3, 'b': [1, 2] })), false);
            assert.strictEqual(ainb.evaluate(createContext({ 'a': 3 })), false);
            assert.strictEqual(ainb.evaluate(createContext({ 'a': 3, 'b': null })), false);
            assert.strictEqual(ainb.evaluate(createContext({ 'a': 'x', 'b': ['x'] })), true);
            assert.strictEqual(ainb.evaluate(createContext({ 'a': 'x', 'b': ['y'] })), false);
            assert.strictEqual(ainb.evaluate(createContext({ 'a': 'x', 'b': {} })), false);
            assert.strictEqual(ainb.evaluate(createContext({ 'a': 'x', 'b': { 'x': false } })), true);
            assert.strictEqual(ainb.evaluate(createContext({ 'a': 'x', 'b': { 'x': true } })), true);
            assert.strictEqual(ainb.evaluate(createContext({ 'a': 'prototype', 'b': {} })), false);
        });
        test('ContextKeyNotInExpr', () => {
            const aNotInB = contextkey_1.$Ii.deserialize('a not in b');
            assert.strictEqual(aNotInB.evaluate(createContext({ 'a': 3, 'b': [3, 2, 1] })), false);
            assert.strictEqual(aNotInB.evaluate(createContext({ 'a': 3, 'b': [1, 2, 3] })), false);
            assert.strictEqual(aNotInB.evaluate(createContext({ 'a': 3, 'b': [1, 2] })), true);
            assert.strictEqual(aNotInB.evaluate(createContext({ 'a': 3 })), true);
            assert.strictEqual(aNotInB.evaluate(createContext({ 'a': 3, 'b': null })), true);
            assert.strictEqual(aNotInB.evaluate(createContext({ 'a': 'x', 'b': ['x'] })), false);
            assert.strictEqual(aNotInB.evaluate(createContext({ 'a': 'x', 'b': ['y'] })), true);
            assert.strictEqual(aNotInB.evaluate(createContext({ 'a': 'x', 'b': {} })), true);
            assert.strictEqual(aNotInB.evaluate(createContext({ 'a': 'x', 'b': { 'x': false } })), false);
            assert.strictEqual(aNotInB.evaluate(createContext({ 'a': 'x', 'b': { 'x': true } })), false);
            assert.strictEqual(aNotInB.evaluate(createContext({ 'a': 'prototype', 'b': {} })), true);
        });
        test('issue #106524: distributing AND should normalize', () => {
            const actual = contextkey_1.$Ii.and(contextkey_1.$Ii.or(contextkey_1.$Ii.has('a'), contextkey_1.$Ii.has('b')), contextkey_1.$Ii.has('c'));
            const expected = contextkey_1.$Ii.or(contextkey_1.$Ii.and(contextkey_1.$Ii.has('a'), contextkey_1.$Ii.has('c')), contextkey_1.$Ii.and(contextkey_1.$Ii.has('b'), contextkey_1.$Ii.has('c')));
            assert.strictEqual(actual.equals(expected), true);
        });
        test('issue #129625: Removes duplicated terms in OR expressions', () => {
            const expr = contextkey_1.$Ii.or(contextkey_1.$Ii.has('A'), contextkey_1.$Ii.has('B'), contextkey_1.$Ii.has('A'));
            assert.strictEqual(expr.serialize(), 'A || B');
        });
        test('Resolves true constant OR expressions', () => {
            const expr = contextkey_1.$Ii.or(contextkey_1.$Ii.has('A'), contextkey_1.$Ii.not('A'));
            assert.strictEqual(expr.serialize(), 'true');
        });
        test('Resolves false constant AND expressions', () => {
            const expr = contextkey_1.$Ii.and(contextkey_1.$Ii.has('A'), contextkey_1.$Ii.not('A'));
            assert.strictEqual(expr.serialize(), 'false');
        });
        test('issue #129625: Removes duplicated terms in AND expressions', () => {
            const expr = contextkey_1.$Ii.and(contextkey_1.$Ii.has('A'), contextkey_1.$Ii.has('B'), contextkey_1.$Ii.has('A'));
            assert.strictEqual(expr.serialize(), 'A && B');
        });
        test('issue #129625: Remove duplicated terms when negating', () => {
            const expr = contextkey_1.$Ii.and(contextkey_1.$Ii.has('A'), contextkey_1.$Ii.or(contextkey_1.$Ii.has('B1'), contextkey_1.$Ii.has('B2')));
            assert.strictEqual(expr.serialize(), 'A && B1 || A && B2');
            assert.strictEqual(expr.negate().serialize(), '!A || !A && !B1 || !A && !B2 || !B1 && !B2');
            assert.strictEqual(expr.negate().negate().serialize(), 'A && B1 || A && B2');
            assert.strictEqual(expr.negate().negate().negate().serialize(), '!A || !A && !B1 || !A && !B2 || !B1 && !B2');
        });
        test('issue #129625: remove redundant terms in OR expressions', () => {
            function strImplies(p0, q0) {
                const p = contextkey_1.$Ii.deserialize(p0);
                const q = contextkey_1.$Ii.deserialize(q0);
                return (0, contextkey_1.$4i)(p, q);
            }
            assert.strictEqual(strImplies('a && b', 'a'), true);
            assert.strictEqual(strImplies('a', 'a && b'), false);
        });
        test('implies', () => {
            function strImplies(p0, q0) {
                const p = contextkey_1.$Ii.deserialize(p0);
                const q = contextkey_1.$Ii.deserialize(q0);
                return (0, contextkey_1.$4i)(p, q);
            }
            assert.strictEqual(strImplies('a', 'a'), true);
            assert.strictEqual(strImplies('a', 'a || b'), true);
            assert.strictEqual(strImplies('a', 'a && b'), false);
            assert.strictEqual(strImplies('a', 'a && b || a && c'), false);
            assert.strictEqual(strImplies('a && b', 'a'), true);
            assert.strictEqual(strImplies('a && b', 'b'), true);
            assert.strictEqual(strImplies('a && b', 'a && b || c'), true);
            assert.strictEqual(strImplies('a || b', 'a || c'), false);
            assert.strictEqual(strImplies('a || b', 'a || b'), true);
            assert.strictEqual(strImplies('a && b', 'a && b'), true);
            assert.strictEqual(strImplies('a || b', 'a || b || c'), true);
            assert.strictEqual(strImplies('c && a && b', 'c && a'), true);
        });
        test('Greater, GreaterEquals, Smaller, SmallerEquals evaluate', () => {
            function checkEvaluate(expr, ctx, expected) {
                const _expr = contextkey_1.$Ii.deserialize(expr);
                assert.strictEqual(_expr.evaluate(createContext(ctx)), expected);
            }
            checkEvaluate('a > 1', {}, false);
            checkEvaluate('a > 1', { a: 0 }, false);
            checkEvaluate('a > 1', { a: 1 }, false);
            checkEvaluate('a > 1', { a: 2 }, true);
            checkEvaluate('a > 1', { a: '0' }, false);
            checkEvaluate('a > 1', { a: '1' }, false);
            checkEvaluate('a > 1', { a: '2' }, true);
            checkEvaluate('a > 1', { a: 'a' }, false);
            checkEvaluate('a > 10', { a: 2 }, false);
            checkEvaluate('a > 10', { a: 11 }, true);
            checkEvaluate('a > 10', { a: '11' }, true);
            checkEvaluate('a > 10', { a: '2' }, false);
            checkEvaluate('a > 10', { a: '11' }, true);
            checkEvaluate('a > 1.1', { a: 1 }, false);
            checkEvaluate('a > 1.1', { a: 2 }, true);
            checkEvaluate('a > 1.1', { a: 11 }, true);
            checkEvaluate('a > 1.1', { a: '1.1' }, false);
            checkEvaluate('a > 1.1', { a: '2' }, true);
            checkEvaluate('a > 1.1', { a: '11' }, true);
            checkEvaluate('a > b', { a: 'b' }, false);
            checkEvaluate('a > b', { a: 'c' }, false);
            checkEvaluate('a > b', { a: 1000 }, false);
            checkEvaluate('a >= 2', { a: '1' }, false);
            checkEvaluate('a >= 2', { a: '2' }, true);
            checkEvaluate('a >= 2', { a: '3' }, true);
            checkEvaluate('a < 2', { a: '1' }, true);
            checkEvaluate('a < 2', { a: '2' }, false);
            checkEvaluate('a < 2', { a: '3' }, false);
            checkEvaluate('a <= 2', { a: '1' }, true);
            checkEvaluate('a <= 2', { a: '2' }, true);
            checkEvaluate('a <= 2', { a: '3' }, false);
        });
        test('Greater, GreaterEquals, Smaller, SmallerEquals negate', () => {
            function checkNegate(expr, expected) {
                const a = contextkey_1.$Ii.deserialize(expr);
                const b = a.negate();
                assert.strictEqual(b.serialize(), expected);
            }
            checkNegate('a > 1', 'a <= 1');
            checkNegate('a > 1.1', 'a <= 1.1');
            checkNegate('a > b', 'a <= b');
            checkNegate('a >= 1', 'a < 1');
            checkNegate('a >= 1.1', 'a < 1.1');
            checkNegate('a >= b', 'a < b');
            checkNegate('a < 1', 'a >= 1');
            checkNegate('a < 1.1', 'a >= 1.1');
            checkNegate('a < b', 'a >= b');
            checkNegate('a <= 1', 'a > 1');
            checkNegate('a <= 1.1', 'a > 1.1');
            checkNegate('a <= b', 'a > b');
        });
        test('issue #111899: context keys can use `<` or `>` ', () => {
            const actual = contextkey_1.$Ii.deserialize('editorTextFocus && vim.active && vim.use<C-r>');
            assert.ok(actual.equals(contextkey_1.$Ii.and(contextkey_1.$Ii.has('editorTextFocus'), contextkey_1.$Ii.has('vim.active'), contextkey_1.$Ii.has('vim.use<C-r>'))));
        });
    });
});
//# sourceMappingURL=contextkey.test.js.map