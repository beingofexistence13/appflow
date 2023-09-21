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
            const a = contextkey_1.ContextKeyExpr.and(contextkey_1.ContextKeyExpr.has('a1'), contextkey_1.ContextKeyExpr.and(contextkey_1.ContextKeyExpr.has('and.a')), contextkey_1.ContextKeyExpr.has('a2'), contextkey_1.ContextKeyExpr.regex('d3', /d.*/), contextkey_1.ContextKeyExpr.regex('d4', /\*\*3*/), contextkey_1.ContextKeyExpr.equals('b1', 'bb1'), contextkey_1.ContextKeyExpr.equals('b2', 'bb2'), contextkey_1.ContextKeyExpr.notEquals('c1', 'cc1'), contextkey_1.ContextKeyExpr.notEquals('c2', 'cc2'), contextkey_1.ContextKeyExpr.not('d1'), contextkey_1.ContextKeyExpr.not('d2'));
            const b = contextkey_1.ContextKeyExpr.and(contextkey_1.ContextKeyExpr.equals('b2', 'bb2'), contextkey_1.ContextKeyExpr.notEquals('c1', 'cc1'), contextkey_1.ContextKeyExpr.not('d1'), contextkey_1.ContextKeyExpr.regex('d4', /\*\*3*/), contextkey_1.ContextKeyExpr.notEquals('c2', 'cc2'), contextkey_1.ContextKeyExpr.has('a2'), contextkey_1.ContextKeyExpr.equals('b1', 'bb1'), contextkey_1.ContextKeyExpr.regex('d3', /d.*/), contextkey_1.ContextKeyExpr.has('a1'), contextkey_1.ContextKeyExpr.and(contextkey_1.ContextKeyExpr.equals('and.a', true)), contextkey_1.ContextKeyExpr.not('d2'));
            assert(a.equals(b), 'expressions should be equal');
        });
        test('issue #134942: Equals in comparator expressions', () => {
            function testEquals(expr, str) {
                const deserialized = contextkey_1.ContextKeyExpr.deserialize(str);
                assert.ok(expr);
                assert.ok(deserialized);
                assert.strictEqual(expr.equals(deserialized), true, str);
            }
            testEquals(contextkey_1.ContextKeyExpr.greater('value', 0), 'value > 0');
            testEquals(contextkey_1.ContextKeyExpr.greaterEquals('value', 0), 'value >= 0');
            testEquals(contextkey_1.ContextKeyExpr.smaller('value', 0), 'value < 0');
            testEquals(contextkey_1.ContextKeyExpr.smallerEquals('value', 0), 'value <= 0');
        });
        test('normalize', () => {
            const key1IsTrue = contextkey_1.ContextKeyExpr.equals('key1', true);
            const key1IsNotFalse = contextkey_1.ContextKeyExpr.notEquals('key1', false);
            const key1IsFalse = contextkey_1.ContextKeyExpr.equals('key1', false);
            const key1IsNotTrue = contextkey_1.ContextKeyExpr.notEquals('key1', true);
            assert.ok(key1IsTrue.equals(contextkey_1.ContextKeyExpr.has('key1')));
            assert.ok(key1IsNotFalse.equals(contextkey_1.ContextKeyExpr.has('key1')));
            assert.ok(key1IsFalse.equals(contextkey_1.ContextKeyExpr.not('key1')));
            assert.ok(key1IsNotTrue.equals(contextkey_1.ContextKeyExpr.not('key1')));
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
                const rules = contextkey_1.ContextKeyExpr.deserialize(expr);
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
                const actual = contextkey_1.ContextKeyExpr.deserialize(expr).negate().serialize();
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
                const actual = contextkey_1.ContextKeyExpr.deserialize(expr).serialize();
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
            testNormalize('isMac', platform_1.isMacintosh ? 'true' : 'false');
            testNormalize('isLinux', platform_1.isLinux ? 'true' : 'false');
            testNormalize('isWindows', platform_1.isWindows ? 'true' : 'false');
        });
        test('issue #101015: distribute OR', () => {
            function t(expr1, expr2, expected) {
                const e1 = contextkey_1.ContextKeyExpr.deserialize(expr1);
                const e2 = contextkey_1.ContextKeyExpr.deserialize(expr2);
                const actual = contextkey_1.ContextKeyExpr.and(e1, e2)?.serialize();
                assert.strictEqual(actual, expected);
            }
            t('a', 'b', 'a && b');
            t('a || b', 'c', 'a && c || b && c');
            t('a || b', 'c || d', 'a && c || a && d || b && c || b && d');
            t('a || b', 'c && d', 'a && c && d || b && c && d');
            t('a || b', 'c && d || e', 'a && e || b && e || a && c && d || b && c && d');
        });
        test('ContextKeyInExpr', () => {
            const ainb = contextkey_1.ContextKeyExpr.deserialize('a in b');
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
            const aNotInB = contextkey_1.ContextKeyExpr.deserialize('a not in b');
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
            const actual = contextkey_1.ContextKeyExpr.and(contextkey_1.ContextKeyExpr.or(contextkey_1.ContextKeyExpr.has('a'), contextkey_1.ContextKeyExpr.has('b')), contextkey_1.ContextKeyExpr.has('c'));
            const expected = contextkey_1.ContextKeyExpr.or(contextkey_1.ContextKeyExpr.and(contextkey_1.ContextKeyExpr.has('a'), contextkey_1.ContextKeyExpr.has('c')), contextkey_1.ContextKeyExpr.and(contextkey_1.ContextKeyExpr.has('b'), contextkey_1.ContextKeyExpr.has('c')));
            assert.strictEqual(actual.equals(expected), true);
        });
        test('issue #129625: Removes duplicated terms in OR expressions', () => {
            const expr = contextkey_1.ContextKeyExpr.or(contextkey_1.ContextKeyExpr.has('A'), contextkey_1.ContextKeyExpr.has('B'), contextkey_1.ContextKeyExpr.has('A'));
            assert.strictEqual(expr.serialize(), 'A || B');
        });
        test('Resolves true constant OR expressions', () => {
            const expr = contextkey_1.ContextKeyExpr.or(contextkey_1.ContextKeyExpr.has('A'), contextkey_1.ContextKeyExpr.not('A'));
            assert.strictEqual(expr.serialize(), 'true');
        });
        test('Resolves false constant AND expressions', () => {
            const expr = contextkey_1.ContextKeyExpr.and(contextkey_1.ContextKeyExpr.has('A'), contextkey_1.ContextKeyExpr.not('A'));
            assert.strictEqual(expr.serialize(), 'false');
        });
        test('issue #129625: Removes duplicated terms in AND expressions', () => {
            const expr = contextkey_1.ContextKeyExpr.and(contextkey_1.ContextKeyExpr.has('A'), contextkey_1.ContextKeyExpr.has('B'), contextkey_1.ContextKeyExpr.has('A'));
            assert.strictEqual(expr.serialize(), 'A && B');
        });
        test('issue #129625: Remove duplicated terms when negating', () => {
            const expr = contextkey_1.ContextKeyExpr.and(contextkey_1.ContextKeyExpr.has('A'), contextkey_1.ContextKeyExpr.or(contextkey_1.ContextKeyExpr.has('B1'), contextkey_1.ContextKeyExpr.has('B2')));
            assert.strictEqual(expr.serialize(), 'A && B1 || A && B2');
            assert.strictEqual(expr.negate().serialize(), '!A || !A && !B1 || !A && !B2 || !B1 && !B2');
            assert.strictEqual(expr.negate().negate().serialize(), 'A && B1 || A && B2');
            assert.strictEqual(expr.negate().negate().negate().serialize(), '!A || !A && !B1 || !A && !B2 || !B1 && !B2');
        });
        test('issue #129625: remove redundant terms in OR expressions', () => {
            function strImplies(p0, q0) {
                const p = contextkey_1.ContextKeyExpr.deserialize(p0);
                const q = contextkey_1.ContextKeyExpr.deserialize(q0);
                return (0, contextkey_1.implies)(p, q);
            }
            assert.strictEqual(strImplies('a && b', 'a'), true);
            assert.strictEqual(strImplies('a', 'a && b'), false);
        });
        test('implies', () => {
            function strImplies(p0, q0) {
                const p = contextkey_1.ContextKeyExpr.deserialize(p0);
                const q = contextkey_1.ContextKeyExpr.deserialize(q0);
                return (0, contextkey_1.implies)(p, q);
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
                const _expr = contextkey_1.ContextKeyExpr.deserialize(expr);
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
                const a = contextkey_1.ContextKeyExpr.deserialize(expr);
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
            const actual = contextkey_1.ContextKeyExpr.deserialize('editorTextFocus && vim.active && vim.use<C-r>');
            assert.ok(actual.equals(contextkey_1.ContextKeyExpr.and(contextkey_1.ContextKeyExpr.has('editorTextFocus'), contextkey_1.ContextKeyExpr.has('vim.active'), contextkey_1.ContextKeyExpr.has('vim.use<C-r>'))));
        });
    });
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY29udGV4dGtleS50ZXN0LmpzIiwic291cmNlUm9vdCI6ImZpbGU6Ly8vd29ya3NwYWNlL2FwcGZsb3cvc3JjLyIsInNvdXJjZXMiOlsidnMvcGxhdGZvcm0vY29udGV4dGtleS90ZXN0L2NvbW1vbi9jb250ZXh0a2V5LnRlc3QudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7O0lBUUEsU0FBUyxhQUFhLENBQUMsR0FBUTtRQUM5QixPQUFPO1lBQ04sUUFBUSxFQUFFLENBQUMsR0FBVyxFQUFFLEVBQUU7Z0JBQ3pCLE9BQU8sR0FBRyxDQUFDLEdBQUcsQ0FBQyxDQUFDO1lBQ2pCLENBQUM7U0FDRCxDQUFDO0lBQ0gsQ0FBQztJQUVELEtBQUssQ0FBQyxnQkFBZ0IsRUFBRSxHQUFHLEVBQUU7UUFDNUIsSUFBSSxDQUFDLHVCQUF1QixFQUFFLEdBQUcsRUFBRTtZQUNsQyxNQUFNLENBQUMsR0FBRywyQkFBYyxDQUFDLEdBQUcsQ0FDM0IsMkJBQWMsQ0FBQyxHQUFHLENBQUMsSUFBSSxDQUFDLEVBQ3hCLDJCQUFjLENBQUMsR0FBRyxDQUFDLDJCQUFjLENBQUMsR0FBRyxDQUFDLE9BQU8sQ0FBQyxDQUFDLEVBQy9DLDJCQUFjLENBQUMsR0FBRyxDQUFDLElBQUksQ0FBQyxFQUN4QiwyQkFBYyxDQUFDLEtBQUssQ0FBQyxJQUFJLEVBQUUsS0FBSyxDQUFDLEVBQ2pDLDJCQUFjLENBQUMsS0FBSyxDQUFDLElBQUksRUFBRSxRQUFRLENBQUMsRUFDcEMsMkJBQWMsQ0FBQyxNQUFNLENBQUMsSUFBSSxFQUFFLEtBQUssQ0FBQyxFQUNsQywyQkFBYyxDQUFDLE1BQU0sQ0FBQyxJQUFJLEVBQUUsS0FBSyxDQUFDLEVBQ2xDLDJCQUFjLENBQUMsU0FBUyxDQUFDLElBQUksRUFBRSxLQUFLLENBQUMsRUFDckMsMkJBQWMsQ0FBQyxTQUFTLENBQUMsSUFBSSxFQUFFLEtBQUssQ0FBQyxFQUNyQywyQkFBYyxDQUFDLEdBQUcsQ0FBQyxJQUFJLENBQUMsRUFDeEIsMkJBQWMs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QUUsQ0FBQyxDQUFDLEVBQUUsS0FBSyxDQUFDLENBQUM7WUFDakYsTUFBTSxDQUFDLFdBQVcsQ0FBQyxJQUFJLENBQUMsUUFBUSxDQUFDLGFBQWEsQ0FBQyxFQUFFLEdBQUcsRUFBRSxDQUFDLEVBQUUsQ0FBQyxDQUFDLEVBQUUsS0FBSyxDQUFDLENBQUM7WUFDcEUsTUFBTSxDQUFDLFdBQVcsQ0FBQyxJQUFJLENBQUMsUUFBUSxDQUFDLGFBQWEsQ0FBQyxFQUFFLEdBQUcsRUFBRSxDQUFDLEVBQUUsR0FBRyxFQUFFLElBQUksRUFBRSxDQUFDLENBQUMsRUFBRSxLQUFLLENBQUMsQ0FBQztZQUMvRSxNQUFNLENBQUMsV0FBVyxDQUFDLElBQUksQ0FBQyxRQUFRLENBQUMsYUFBYSxDQUFDLEVBQUUsR0FBRyxFQUFFLEdBQUcsRUFBRSxHQUFHLEVBQUUsQ0FBQyxHQUFHLENBQUMsRUFBRSxDQUFDLENBQUMsRUFBRSxJQUFJLENBQUMsQ0FBQztZQUNqRixNQUFNLENBQUMsV0FBVyxDQUFDLElBQUksQ0FBQyxRQUFRLENBQUMsYUFBYSxDQUFDLEVBQUUsR0FBRyxFQUFFLEdBQUcsRUFBRSxHQUFHLEVBQUUsQ0FBQyxHQUFHLENBQUMsRUFBRSxDQUFDLENBQUMsRUFBRSxLQUFLLENBQUMsQ0FBQztZQUNsRixNQUFNLENBQUMsV0FBVyxDQUFDLElBQUksQ0FBQyxRQUFRLENBQUMsYUFBYSxDQUFDLEVBQUUsR0FBRyxFQUFFLEdBQUcsRUFBRSxHQUFHLEVBQUUsRUFBRSxFQUFFLENBQUMsQ0FBQyxFQUFFLEtBQUssQ0FBQyxDQUFDO1lBQy9FLE1BQU0sQ0FBQyxXQUFXLENBQUMsSUFBSSxDQUFDLFFBQVEsQ0FBQyxhQUFhLENBQUMsRUFBRSxHQUFHLEVBQUUsR0FBRyxFQUFFLEdBQUcsRUFBRSxFQUFFLEdBQUcsRUFBRSxLQUFLLEVBQUUsRUFBRSxDQUFDLENBQUMsRUFBRSxJQUFJLENBQUMsQ0FBQztZQUMxRixNQUFNLENBQUMsV0FBVyxDQUFDLElBQUksQ0FBQyxRQUFRLENBQUMsYUFBYSxDQUFDLEVBQUUs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QUUsR0FBRyxFQUFFLEVBQUUsS0FBSyxDQUFDLENBQUM7WUFDMUMsYUFBYSxDQUFDLE9BQU8sRUFBRSxFQUFFLENBQUMsRUFBRSxHQUFHLEVBQUUsRUFBRSxLQUFLLENBQUMsQ0FBQztZQUMxQyxhQUFhLENBQUMsT0FBTyxFQUFFLEVBQUUsQ0FBQyxFQUFFLEdBQUcsRUFBRSxFQUFFLElBQUksQ0FBQyxDQUFDO1lBQ3pDLGFBQWEsQ0FBQyxPQUFPLEVBQUUsRUFBRSxDQUFDLEVBQUUsR0FBRyxFQUFFLEVBQUUsS0FBSyxDQUFDLENBQUM7WUFFMUMsYUFBYSxDQUFDLFFBQVEsRUFBRSxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsRUFBRSxLQUFLLENBQUMsQ0FBQztZQUN6QyxhQUFhLENBQUMsUUFBUSxFQUFFLEVBQUUsQ0FBQyxFQUFFLEVBQUUsRUFBRSxFQUFFLElBQUksQ0FBQyxDQUFDO1lBQ3pDLGFBQWEsQ0FBQyxRQUFRLEVBQUUsRUFBRSxDQUFDLEVBQUUsSUFBSSxFQUFFLEVBQUUsSUFBSSxDQUFDLENBQUM7WUFDM0MsYUFBYSxDQUFDLFFBQVEsRUFBRSxFQUFFLENBQUMsRUFBRSxHQUFHLEVBQUUsRUFBRSxLQUFLLENBQUMsQ0FBQztZQUMzQyxhQUFhLENBQUMsUUFBUSxFQUFFLEVBQUUsQ0FBQyxFQUFFLElBQUksRUFBRSxFQUFFLElBQUksQ0FBQyxDQUFDO1lBRTNDLGFBQWEsQ0FBQyxTQUFTLEVBQUUsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLEVBQUUsS0FBSyxDQUFDLENBQUM7WUFDMUMsYUFBYSxDQUFDLFNBQVMsRUFBRSxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsRUFBRSxJQUFJLENBQUMsQ0FBQztZQUN6QyxhQUFhLENBQUMsU0FBUyxFQUFFLEVBQUUsQ0FBQyxFQUFFLEVBQUUsRUFBRSxFQUFFLElBQUksQ0FBQyxDQUFDO1lBQzFDLGFBQWEsQ0FBQyxTQUFTLEVBQUUsRUFBRSxDQUFDLEVBQUUsS0FBSyxFQUFFLEVBQUUsS0FBSyxDQUFDLENBQUM7WUFDOUMsYUFBYSxDQUFDLFNBQVMsRUFBRSxFQUFFLENBQUMsRUFBRSxHQUFHLEVBQUUsRUFBRSxJQUFJLENBQUMsQ0FBQztZQUMzQyxhQUFhLENBQUMsU0FBUyxFQUFFLEVBQUUsQ0FBQyxFQUFFLElBQUksRUFBRSxFQUFFLElBQUksQ0FBQyxDQUFDO1lBRTVDLGFBQWEsQ0FBQyxPQUFPLEVBQUUsRUFBRSxDQUFDLEVBQUUsR0FBRyxFQUFFLEVBQUUsS0FBSyxDQUFDLENBQUM7WUFDMUMsYUFBYSxDQUFDLE9BQU8sRUFBRSxFQUFFLENBQUMsRUFBRSxHQUFHLEVBQUUsRUFBRSxLQUFLLENBQUMsQ0FBQztZQUMxQyxhQUFhLENBQUMsT0FBTyxFQUFFLEVBQUUsQ0FBQyxFQUFFLElBQUksRUFBRSxFQUFFLEtBQUssQ0FBQyxDQUFDO1lBRTNDLGFBQWEsQ0FBQyxRQUFRLEVBQUUsRUFBRSxDQUFDLEVBQUUsR0FBRyxFQUFFLEVBQUUsS0FBSyxDQUFDLENBQUM7WUFDM0MsYUFBYSxDQUFDLFFBQVEsRUFBRSxFQUFFLENBQUMsRUFBRSxHQUFHLEVBQUUsRUFBRSxJQUFJLENBQUMsQ0FBQztZQUMxQyxhQUFhLENBQUMsUUFBUSxFQUFFLEVBQUUsQ0FBQyxFQUFFLEdBQUcsRUFBRSxFQUFFLElBQUksQ0FBQyxDQUFDO1lBRTFDLGFBQWEsQ0FBQyxPQUFPLEVBQUUsRUFBRSxDQUFDLEVBQUUsR0FBRyxFQUFFLEVBQUUsSUFBSSxDQUFDLENBQUM7WUFDekMsYUFBYSxDQUFDLE9BQU8sRUFBRSxFQUFFLENBQUMsRUFBRSxHQUFHLEVBQUUsRUFBRSxLQUFLLENBQUMsQ0FBQztZQUMxQyxhQUFhLENBQUMsT0FBTyxFQUFFLEVBQUUsQ0FBQyxFQUFFLEdBQUcsRUFBRSxFQUFFLEtBQUssQ0FBQyxDQUFDO1lBRTFDLGFBQWEsQ0FBQyxRQUFRLEVBQUUsRUFBRSxDQUFDLEVBQUUsR0FBRyxFQUFFLEVBQUUsSUFBSSxDQUFDLENBQUM7WUFDMUMsYUFBYSxDQUFDLFFBQVEsRUFBRSxFQUFFLENBQUMsRUFBRSxHQUFHLEVBQUUsRUFBRSxJQUFJLENBQUMsQ0FBQztZQUMxQyxhQUFhLENBQUMsUUFBUSxFQUFFLEVBQUUsQ0FBQyxFQUFFLEdBQUcsRUFBRSxFQUFFLEtBQUssQ0FBQyxDQUFDO1FBQzVDLENBQUMsQ0FBQyxDQUFDO1FBRUgsSUFBSSxDQUFDLHVEQUF1RCxFQUFFLEdBQUcsRUFBRTtZQUNsRSxTQUFTLFdBQVcsQ0FBQyxJQUFZLEVBQUUsUUFBZ0I7Z0JBQ2xELE1BQU0sQ0FBQyxHQUFHLDJCQUFjLENBQUMsV0FBVyxDQUFDLElBQUksQ0FBRSxDQUFDO2dCQUM1QyxNQUFNLENBQUMsR0FBRyxDQUFDLENBQUMsTUFBTSxFQUFFLENBQUM7Z0JBQ3JCLE1BQU0sQ0FBQyxXQUFXLENBQUMsQ0FBQyxDQUFDLFNBQVMsRUFBRSxFQUFFLFFBQVEsQ0FBQyxDQUFDO1lBQzdDLENBQUM7WUFFRCxXQUFXLENBQUMsT0FBTyxFQUFFLFFBQVEsQ0FBQyxDQUFDO1lBQy9CLFdBQVcsQ0FBQyxTQUFTLEVBQUUsVUFBVSxDQUFDLENBQUM7WUFDbkMsV0FBVyxDQUFDLE9BQU8sRUFBRSxRQUFRLENBQUMsQ0FBQztZQUUvQixXQUFXLENBQUMsUUFBUSxFQUFFLE9BQU8sQ0FBQyxDQUFDO1lBQy9CLFdBQVcsQ0FBQyxVQUFVLEVBQUUsU0FBUyxDQUFDLENBQUM7WUFDbkMsV0FBVyxDQUFDLFFBQVEsRUFBRSxPQUFPLENBQUMsQ0FBQztZQUUvQixXQUFXLENBQUMsT0FBTyxFQUFFLFFBQVEsQ0FBQyxDQUFDO1lBQy9CLFdBQVcsQ0FBQyxTQUFTLEVBQUUsVUFBVSxDQUFDLENBQUM7WUFDbkMsV0FBVyxDQUFDLE9BQU8sRUFBRSxRQUFRLENBQUMsQ0FBQztZQUUvQixXQUFXLENBQUMsUUFBUSxFQUFFLE9BQU8sQ0FBQyxDQUFDO1lBQy9CLFdBQVcsQ0FBQyxVQUFVLEVBQUUsU0FBUyxDQUFDLENBQUM7WUFDbkMsV0FBVyxDQUFDLFFBQVEsRUFBRSxPQUFPLENBQUMsQ0FBQztRQUNoQyxDQUFDLENBQUMsQ0FBQztRQUVILElBQUksQ0FBQyxpREFBaUQsRUFBRSxHQUFHLEVBQUU7WUFDNUQsTUFBTSxNQUFNLEdBQUcsMkJBQWMsQ0FBQyxXQUFXLENBQUMsK0NBQStDLENBQUUsQ0FBQztZQUM1RixNQUFNLENBQUMsRUFBRSxDQUFDLE1BQU0sQ0FBQyxNQUFNLENBQ3RCLDJCQUFjLENBQUMsR0FBRyxDQUNqQiwyQkFBYyxDQUFDLEdBQUcsQ0FBQyxpQkFBaUIsQ0FBQyxFQUNyQywyQkFBYyxDQUFDLEdBQUcsQ0FBQyxZQUFZLENBQUMsRUFDaEMsMkJBQWMsQ0FBQyxHQUFHLENBQUMsY0FBYyxDQUFDLENBQ2pDLENBQ0YsQ0FBQyxDQUFDO1FBQ0osQ0FBQyxDQUFDLENBQUM7SUFDSixDQUFDLENBQUMsQ0FBQyJ9