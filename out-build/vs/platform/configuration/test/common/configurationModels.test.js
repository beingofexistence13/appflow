define(["require", "exports", "assert", "vs/base/common/path", "vs/base/common/uri", "vs/platform/configuration/common/configurationModels", "vs/platform/configuration/common/configurationRegistry", "vs/platform/registry/common/platform", "vs/platform/workspace/common/workspace", "vs/platform/workspace/test/common/testWorkspace"], function (require, exports, assert, path_1, uri_1, configurationModels_1, configurationRegistry_1, platform_1, workspace_1, testWorkspace_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    suite('ConfigurationModelParser', () => {
        suiteSetup(() => {
            platform_1.$8m.as(configurationRegistry_1.$an.Configuration).registerConfiguration({
                'id': 'ConfigurationModelParserTest',
                'type': 'object',
                'properties': {
                    'ConfigurationModelParserTest.windowSetting': {
                        'type': 'string',
                        'default': 'isSet',
                    }
                }
            });
        });
        test('parse configuration model with single override identifier', () => {
            const testObject = new configurationModels_1.$rn('');
            testObject.parse(JSON.stringify({ '[x]': { 'a': 1 } }));
            assert.deepStrictEqual(JSON.stringify(testObject.configurationModel.overrides), JSON.stringify([{ identifiers: ['x'], keys: ['a'], contents: { 'a': 1 } }]));
        });
        test('parse configuration model with multiple override identifiers', () => {
            const testObject = new configurationModels_1.$rn('');
            testObject.parse(JSON.stringify({ '[x][y]': { 'a': 1 } }));
            assert.deepStrictEqual(JSON.stringify(testObject.configurationModel.overrides), JSON.stringify([{ identifiers: ['x', 'y'], keys: ['a'], contents: { 'a': 1 } }]));
        });
        test('parse configuration model with multiple duplicate override identifiers', () => {
            const testObject = new configurationModels_1.$rn('');
            testObject.parse(JSON.stringify({ '[x][y][x][z]': { 'a': 1 } }));
            assert.deepStrictEqual(JSON.stringify(testObject.configurationModel.overrides), JSON.stringify([{ identifiers: ['x', 'y', 'z'], keys: ['a'], contents: { 'a': 1 } }]));
        });
        test('parse configuration model with exclude option', () => {
            const testObject = new configurationModels_1.$rn('');
            testObject.parse(JSON.stringify({ 'a': 1, 'b': 2 }), { exclude: ['a'] });
            assert.strictEqual(testObject.configurationModel.getValue('a'), undefined);
            assert.strictEqual(testObject.configurationModel.getValue('b'), 2);
        });
        test('parse configuration model with exclude option even included', () => {
            const testObject = new configurationModels_1.$rn('');
            testObject.parse(JSON.stringify({ 'a': 1, 'b': 2 }), { exclude: ['a'], include: ['a'] });
            assert.strictEqual(testObject.configurationModel.getValue('a'), undefined);
            assert.strictEqual(testObject.configurationModel.getValue('b'), 2);
        });
        test('parse configuration model with scopes filter', () => {
            const testObject = new configurationModels_1.$rn('');
            testObject.parse(JSON.stringify({ 'ConfigurationModelParserTest.windowSetting': '1' }), { scopes: [1 /* ConfigurationScope.APPLICATION */] });
            assert.strictEqual(testObject.configurationModel.getValue('ConfigurationModelParserTest.windowSetting'), undefined);
        });
        test('parse configuration model with include option', () => {
            const testObject = new configurationModels_1.$rn('');
            testObject.parse(JSON.stringify({ 'ConfigurationModelParserTest.windowSetting': '1' }), { include: ['ConfigurationModelParserTest.windowSetting'], scopes: [1 /* ConfigurationScope.APPLICATION */] });
            assert.strictEqual(testObject.configurationModel.getValue('ConfigurationModelParserTest.windowSetting'), '1');
        });
    });
    suite('ConfigurationModel', () => {
        test('setValue for a key that has no sections and not defined', () => {
            const testObject = new configurationModels_1.$qn({ 'a': { 'b': 1 } }, ['a.b']);
            testObject.setValue('f', 1);
            assert.deepStrictEqual(testObject.contents, { 'a': { 'b': 1 }, 'f': 1 });
            assert.deepStrictEqual(testObject.keys, ['a.b', 'f']);
        });
        test('setValue for a key that has no sections and defined', () => {
            const testObject = new configurationModels_1.$qn({ 'a': { 'b': 1 }, 'f': 1 }, ['a.b', 'f']);
            testObject.setValue('f', 3);
            assert.deepStrictEqual(testObject.contents, { 'a': { 'b': 1 }, 'f': 3 });
            assert.deepStrictEqual(testObject.keys, ['a.b', 'f']);
        });
        test('setValue for a key that has sections and not defined', () => {
            const testObject = new configurationModels_1.$qn({ 'a': { 'b': 1 }, 'f': 1 }, ['a.b', 'f']);
            testObject.setValue('b.c', 1);
            const expected = {};
            expected['a'] = { 'b': 1 };
            expected['f'] = 1;
            expected['b'] = Object.create(null);
            expected['b']['c'] = 1;
            assert.deepStrictEqual(testObject.contents, expected);
            assert.deepStrictEqual(testObject.keys, ['a.b', 'f', 'b.c']);
        });
        test('setValue for a key that has sections and defined', () => {
            const testObject = new configurationModels_1.$qn({ 'a': { 'b': 1 }, 'b': { 'c': 1 }, 'f': 1 }, ['a.b', 'b.c', 'f']);
            testObject.setValue('b.c', 3);
            assert.deepStrictEqual(testObject.contents, { 'a': { 'b': 1 }, 'b': { 'c': 3 }, 'f': 1 });
            assert.deepStrictEqual(testObject.keys, ['a.b', 'b.c', 'f']);
        });
        test('setValue for a key that has sections and sub section not defined', () => {
            const testObject = new configurationModels_1.$qn({ 'a': { 'b': 1 }, 'f': 1 }, ['a.b', 'f']);
            testObject.setValue('a.c', 1);
            assert.deepStrictEqual(testObject.contents, { 'a': { 'b': 1, 'c': 1 }, 'f': 1 });
            assert.deepStrictEqual(testObject.keys, ['a.b', 'f', 'a.c']);
        });
        test('setValue for a key that has sections and sub section defined', () => {
            const testObject = new configurationModels_1.$qn({ 'a': { 'b': 1, 'c': 1 }, 'f': 1 }, ['a.b', 'a.c', 'f']);
            testObject.setValue('a.c', 3);
            assert.deepStrictEqual(testObject.contents, { 'a': { 'b': 1, 'c': 3 }, 'f': 1 });
            assert.deepStrictEqual(testObject.keys, ['a.b', 'a.c', 'f']);
        });
        test('setValue for a key that has sections and last section is added', () => {
            const testObject = new configurationModels_1.$qn({ 'a': { 'b': {} }, 'f': 1 }, ['a.b', 'f']);
            testObject.setValue('a.b.c', 1);
            assert.deepStrictEqual(testObject.contents, { 'a': { 'b': { 'c': 1 } }, 'f': 1 });
            assert.deepStrictEqual(testObject.keys, ['a.b', 'f', 'a.b.c']);
        });
        test('removeValue: remove a non existing key', () => {
            const testObject = new configurationModels_1.$qn({ 'a': { 'b': 2 } }, ['a.b']);
            testObject.removeValue('a.b.c');
            assert.deepStrictEqual(testObject.contents, { 'a': { 'b': 2 } });
            assert.deepStrictEqual(testObject.keys, ['a.b']);
        });
        test('removeValue: remove a single segmented key', () => {
            const testObject = new configurationModels_1.$qn({ 'a': 1 }, ['a']);
            testObject.removeValue('a');
            assert.deepStrictEqual(testObject.contents, {});
            assert.deepStrictEqual(testObject.keys, []);
        });
        test('removeValue: remove a multi segmented key', () => {
            const testObject = new configurationModels_1.$qn({ 'a': { 'b': 1 } }, ['a.b']);
            testObject.removeValue('a.b');
            assert.deepStrictEqual(testObject.contents, {});
            assert.deepStrictEqual(testObject.keys, []);
        });
        test('get overriding configuration model for an existing identifier', () => {
            const testObject = new configurationModels_1.$qn({ 'a': { 'b': 1 }, 'f': 1 }, [], [{ identifiers: ['c'], contents: { 'a': { 'd': 1 } }, keys: ['a'] }]);
            assert.deepStrictEqual(testObject.override('c').contents, { 'a': { 'b': 1, 'd': 1 }, 'f': 1 });
        });
        test('get overriding configuration model for an identifier that does not exist', () => {
            const testObject = new configurationModels_1.$qn({ 'a': { 'b': 1 }, 'f': 1 }, [], [{ identifiers: ['c'], contents: { 'a': { 'd': 1 } }, keys: ['a'] }]);
            assert.deepStrictEqual(testObject.override('xyz').contents, { 'a': { 'b': 1 }, 'f': 1 });
        });
        test('get overriding configuration when one of the keys does not exist in base', () => {
            const testObject = new configurationModels_1.$qn({ 'a': { 'b': 1 }, 'f': 1 }, [], [{ identifiers: ['c'], contents: { 'a': { 'd': 1 }, 'g': 1 }, keys: ['a', 'g'] }]);
            assert.deepStrictEqual(testObject.override('c').contents, { 'a': { 'b': 1, 'd': 1 }, 'f': 1, 'g': 1 });
        });
        test('get overriding configuration when one of the key in base is not of object type', () => {
            const testObject = new configurationModels_1.$qn({ 'a': { 'b': 1 }, 'f': 1 }, [], [{ identifiers: ['c'], contents: { 'a': { 'd': 1 }, 'f': { 'g': 1 } }, keys: ['a', 'f'] }]);
            assert.deepStrictEqual(testObject.override('c').contents, { 'a': { 'b': 1, 'd': 1 }, 'f': { 'g': 1 } });
        });
        test('get overriding configuration when one of the key in overriding contents is not of object type', () => {
            const testObject = new configurationModels_1.$qn({ 'a': { 'b': 1 }, 'f': { 'g': 1 } }, [], [{ identifiers: ['c'], contents: { 'a': { 'd': 1 }, 'f': 1 }, keys: ['a', 'f'] }]);
            assert.deepStrictEqual(testObject.override('c').contents, { 'a': { 'b': 1, 'd': 1 }, 'f': 1 });
        });
        test('get overriding configuration if the value of overriding identifier is not object', () => {
            const testObject = new configurationModels_1.$qn({ 'a': { 'b': 1 }, 'f': { 'g': 1 } }, [], [{ identifiers: ['c'], contents: 'abc', keys: [] }]);
            assert.deepStrictEqual(testObject.override('c').contents, { 'a': { 'b': 1 }, 'f': { 'g': 1 } });
        });
        test('get overriding configuration if the value of overriding identifier is an empty object', () => {
            const testObject = new configurationModels_1.$qn({ 'a': { 'b': 1 }, 'f': { 'g': 1 } }, [], [{ identifiers: ['c'], contents: {}, keys: [] }]);
            assert.deepStrictEqual(testObject.override('c').contents, { 'a': { 'b': 1 }, 'f': { 'g': 1 } });
        });
        test('simple merge', () => {
            const base = new configurationModels_1.$qn({ 'a': 1, 'b': 2 }, ['a', 'b']);
            const add = new configurationModels_1.$qn({ 'a': 3, 'c': 4 }, ['a', 'c']);
            const result = base.merge(add);
            assert.deepStrictEqual(result.contents, { 'a': 3, 'b': 2, 'c': 4 });
            assert.deepStrictEqual(result.keys, ['a', 'b', 'c']);
        });
        test('recursive merge', () => {
            const base = new configurationModels_1.$qn({ 'a': { 'b': 1 } }, ['a.b']);
            const add = new configurationModels_1.$qn({ 'a': { 'b': 2 } }, ['a.b']);
            const result = base.merge(add);
            assert.deepStrictEqual(result.contents, { 'a': { 'b': 2 } });
            assert.deepStrictEqual(result.getValue('a'), { 'b': 2 });
            assert.deepStrictEqual(result.keys, ['a.b']);
        });
        test('simple merge overrides', () => {
            const base = new configurationModels_1.$qn({ 'a': { 'b': 1 } }, ['a.b'], [{ identifiers: ['c'], contents: { 'a': 2 }, keys: ['a'] }]);
            const add = new configurationModels_1.$qn({ 'a': { 'b': 2 } }, ['a.b'], [{ identifiers: ['c'], contents: { 'b': 2 }, keys: ['b'] }]);
            const result = base.merge(add);
            assert.deepStrictEqual(result.contents, { 'a': { 'b': 2 } });
            assert.deepStrictEqual(result.overrides, [{ identifiers: ['c'], contents: { 'a': 2, 'b': 2 }, keys: ['a', 'b'] }]);
            assert.deepStrictEqual(result.override('c').contents, { 'a': 2, 'b': 2 });
            assert.deepStrictEqual(result.keys, ['a.b']);
        });
        test('recursive merge overrides', () => {
            const base = new configurationModels_1.$qn({ 'a': { 'b': 1 }, 'f': 1 }, ['a.b', 'f'], [{ identifiers: ['c'], contents: { 'a': { 'd': 1 } }, keys: ['a'] }]);
            const add = new configurationModels_1.$qn({ 'a': { 'b': 2 } }, ['a.b'], [{ identifiers: ['c'], contents: { 'a': { 'e': 2 } }, keys: ['a'] }]);
            const result = base.merge(add);
            assert.deepStrictEqual(result.contents, { 'a': { 'b': 2 }, 'f': 1 });
            assert.deepStrictEqual(result.overrides, [{ identifiers: ['c'], contents: { 'a': { 'd': 1, 'e': 2 } }, keys: ['a'] }]);
            assert.deepStrictEqual(result.override('c').contents, { 'a': { 'b': 2, 'd': 1, 'e': 2 }, 'f': 1 });
            assert.deepStrictEqual(result.keys, ['a.b', 'f']);
        });
        test('Test contents while getting an existing property', () => {
            let testObject = new configurationModels_1.$qn({ 'a': 1 });
            assert.deepStrictEqual(testObject.getValue('a'), 1);
            testObject = new configurationModels_1.$qn({ 'a': { 'b': 1 } });
            assert.deepStrictEqual(testObject.getValue('a'), { 'b': 1 });
        });
        test('Test contents are undefined for non existing properties', () => {
            const testObject = new configurationModels_1.$qn({ awesome: true });
            assert.deepStrictEqual(testObject.getValue('unknownproperty'), undefined);
        });
        test('Test override gives all content merged with overrides', () => {
            const testObject = new configurationModels_1.$qn({ 'a': 1, 'c': 1 }, [], [{ identifiers: ['b'], contents: { 'a': 2 }, keys: ['a'] }]);
            assert.deepStrictEqual(testObject.override('b').contents, { 'a': 2, 'c': 1 });
        });
        test('Test override when an override has multiple identifiers', () => {
            const testObject = new configurationModels_1.$qn({ 'a': 1, 'c': 1 }, ['a', 'c'], [{ identifiers: ['x', 'y'], contents: { 'a': 2 }, keys: ['a'] }]);
            let actual = testObject.override('x');
            assert.deepStrictEqual(actual.contents, { 'a': 2, 'c': 1 });
            assert.deepStrictEqual(actual.keys, ['a', 'c']);
            assert.deepStrictEqual(testObject.getKeysForOverrideIdentifier('x'), ['a']);
            actual = testObject.override('y');
            assert.deepStrictEqual(actual.contents, { 'a': 2, 'c': 1 });
            assert.deepStrictEqual(actual.keys, ['a', 'c']);
            assert.deepStrictEqual(testObject.getKeysForOverrideIdentifier('y'), ['a']);
        });
        test('Test override when an identifier is defined in multiple overrides', () => {
            const testObject = new configurationModels_1.$qn({ 'a': 1, 'c': 1 }, ['a', 'c'], [{ identifiers: ['x'], contents: { 'a': 3, 'b': 1 }, keys: ['a', 'b'] }, { identifiers: ['x', 'y'], contents: { 'a': 2 }, keys: ['a'] }]);
            const actual = testObject.override('x');
            assert.deepStrictEqual(actual.contents, { 'a': 3, 'c': 1, 'b': 1 });
            assert.deepStrictEqual(actual.keys, ['a', 'c']);
            assert.deepStrictEqual(testObject.getKeysForOverrideIdentifier('x'), ['a', 'b']);
        });
        test('Test merge when configuration models have multiple identifiers', () => {
            const testObject = new configurationModels_1.$qn({ 'a': 1, 'c': 1 }, ['a', 'c'], [{ identifiers: ['y'], contents: { 'c': 1 }, keys: ['c'] }, { identifiers: ['x', 'y'], contents: { 'a': 2 }, keys: ['a'] }]);
            const target = new configurationModels_1.$qn({ 'a': 2, 'b': 1 }, ['a', 'b'], [{ identifiers: ['x'], contents: { 'a': 3, 'b': 2 }, keys: ['a', 'b'] }, { identifiers: ['x', 'y'], contents: { 'b': 3 }, keys: ['b'] }]);
            const actual = testObject.merge(target);
            assert.deepStrictEqual(actual.contents, { 'a': 2, 'c': 1, 'b': 1 });
            assert.deepStrictEqual(actual.keys, ['a', 'c', 'b']);
            assert.deepStrictEqual(actual.overrides, [
                { identifiers: ['y'], contents: { 'c': 1 }, keys: ['c'] },
                { identifiers: ['x', 'y'], contents: { 'a': 2, 'b': 3 }, keys: ['a', 'b'] },
                { identifiers: ['x'], contents: { 'a': 3, 'b': 2 }, keys: ['a', 'b'] },
            ]);
        });
        test('inspect when raw is same', () => {
            const testObject = new configurationModels_1.$qn({ 'a': 1, 'c': 1 }, ['a', 'c'], [{ identifiers: ['x', 'y'], contents: { 'a': 2, 'b': 1 }, keys: ['a'] }]);
            assert.deepStrictEqual(testObject.inspect('a'), { value: 1, override: undefined, merged: 1 });
            assert.deepStrictEqual(testObject.inspect('a', 'x'), { value: 1, override: 2, merged: 2 });
            assert.deepStrictEqual(testObject.inspect('b', 'x'), { value: undefined, override: 1, merged: 1 });
            assert.deepStrictEqual(testObject.inspect('d'), { value: undefined, override: undefined, merged: undefined });
        });
        test('inspect when raw is not same', () => {
            const testObject = new configurationModels_1.$qn({ 'a': 1, 'c': 1 }, ['a', 'c'], [{ identifiers: ['x', 'y'], contents: { 'a': 2, }, keys: ['a'] }], [{
                    'a': 1,
                    'b': 2,
                    'c': 1,
                    'd': 3,
                    '[x][y]': {
                        'a': 2,
                        'b': 1
                    }
                }]);
            assert.deepStrictEqual(testObject.inspect('a'), { value: 1, override: undefined, merged: 1 });
            assert.deepStrictEqual(testObject.inspect('a', 'x'), { value: 1, override: 2, merged: 2 });
            assert.deepStrictEqual(testObject.inspect('b', 'x'), { value: 2, override: 1, merged: 1 });
            assert.deepStrictEqual(testObject.inspect('d'), { value: 3, override: undefined, merged: 3 });
            assert.deepStrictEqual(testObject.inspect('e'), { value: undefined, override: undefined, merged: undefined });
        });
        test('inspect in merged configuration when raw is same', () => {
            const target1 = new configurationModels_1.$qn({ 'a': 1 }, ['a'], [{ identifiers: ['x', 'y'], contents: { 'a': 2, }, keys: ['a'] }]);
            const target2 = new configurationModels_1.$qn({ 'b': 3 }, ['b'], []);
            const testObject = target1.merge(target2);
            assert.deepStrictEqual(testObject.inspect('a'), { value: 1, override: undefined, merged: 1 });
            assert.deepStrictEqual(testObject.inspect('a', 'x'), { value: 1, override: 2, merged: 2 });
            assert.deepStrictEqual(testObject.inspect('b'), { value: 3, override: undefined, merged: 3 });
            assert.deepStrictEqual(testObject.inspect('b', 'y'), { value: 3, override: undefined, merged: 3 });
            assert.deepStrictEqual(testObject.inspect('c'), { value: undefined, override: undefined, merged: undefined });
        });
        test('inspect in merged configuration when raw is not same for one model', () => {
            const target1 = new configurationModels_1.$qn({ 'a': 1 }, ['a'], [{ identifiers: ['x', 'y'], contents: { 'a': 2, }, keys: ['a'] }], [{
                    'a': 1,
                    'b': 2,
                    'c': 3,
                    '[x][y]': {
                        'a': 2,
                        'b': 4,
                    }
                }]);
            const target2 = new configurationModels_1.$qn({ 'b': 3 }, ['b'], []);
            const testObject = target1.merge(target2);
            assert.deepStrictEqual(testObject.inspect('a'), { value: 1, override: undefined, merged: 1 });
            assert.deepStrictEqual(testObject.inspect('a', 'x'), { value: 1, override: 2, merged: 2 });
            assert.deepStrictEqual(testObject.inspect('b'), { value: 3, override: undefined, merged: 3 });
            assert.deepStrictEqual(testObject.inspect('b', 'y'), { value: 3, override: 4, merged: 4 });
            assert.deepStrictEqual(testObject.inspect('c'), { value: 3, override: undefined, merged: 3 });
        });
    });
    suite('CustomConfigurationModel', () => {
        test('simple merge using models', () => {
            const base = new configurationModels_1.$rn('base');
            base.parse(JSON.stringify({ 'a': 1, 'b': 2 }));
            const add = new configurationModels_1.$rn('add');
            add.parse(JSON.stringify({ 'a': 3, 'c': 4 }));
            const result = base.configurationModel.merge(add.configurationModel);
            assert.deepStrictEqual(result.contents, { 'a': 3, 'b': 2, 'c': 4 });
        });
        test('simple merge with an undefined contents', () => {
            let base = new configurationModels_1.$rn('base');
            base.parse(JSON.stringify({ 'a': 1, 'b': 2 }));
            let add = new configurationModels_1.$rn('add');
            let result = base.configurationModel.merge(add.configurationModel);
            assert.deepStrictEqual(result.contents, { 'a': 1, 'b': 2 });
            base = new configurationModels_1.$rn('base');
            add = new configurationModels_1.$rn('add');
            add.parse(JSON.stringify({ 'a': 1, 'b': 2 }));
            result = base.configurationModel.merge(add.configurationModel);
            assert.deepStrictEqual(result.contents, { 'a': 1, 'b': 2 });
            base = new configurationModels_1.$rn('base');
            add = new configurationModels_1.$rn('add');
            result = base.configurationModel.merge(add.configurationModel);
            assert.deepStrictEqual(result.contents, {});
        });
        test('Recursive merge using config models', () => {
            const base = new configurationModels_1.$rn('base');
            base.parse(JSON.stringify({ 'a': { 'b': 1 } }));
            const add = new configurationModels_1.$rn('add');
            add.parse(JSON.stringify({ 'a': { 'b': 2 } }));
            const result = base.configurationModel.merge(add.configurationModel);
            assert.deepStrictEqual(result.contents, { 'a': { 'b': 2 } });
        });
        test('Test contents while getting an existing property', () => {
            const testObject = new configurationModels_1.$rn('test');
            testObject.parse(JSON.stringify({ 'a': 1 }));
            assert.deepStrictEqual(testObject.configurationModel.getValue('a'), 1);
            testObject.parse(JSON.stringify({ 'a': { 'b': 1 } }));
            assert.deepStrictEqual(testObject.configurationModel.getValue('a'), { 'b': 1 });
        });
        test('Test contents are undefined for non existing properties', () => {
            const testObject = new configurationModels_1.$rn('test');
            testObject.parse(JSON.stringify({
                awesome: true
            }));
            assert.deepStrictEqual(testObject.configurationModel.getValue('unknownproperty'), undefined);
        });
        test('Test contents are undefined for undefined config', () => {
            const testObject = new configurationModels_1.$rn('test');
            assert.deepStrictEqual(testObject.configurationModel.getValue('unknownproperty'), undefined);
        });
        test('Test configWithOverrides gives all content merged with overrides', () => {
            const testObject = new configurationModels_1.$rn('test');
            testObject.parse(JSON.stringify({ 'a': 1, 'c': 1, '[b]': { 'a': 2 } }));
            assert.deepStrictEqual(testObject.configurationModel.override('b').contents, { 'a': 2, 'c': 1, '[b]': { 'a': 2 } });
        });
        test('Test configWithOverrides gives empty contents', () => {
            const testObject = new configurationModels_1.$rn('test');
            assert.deepStrictEqual(testObject.configurationModel.override('b').contents, {});
        });
        test('Test update with empty data', () => {
            const testObject = new configurationModels_1.$rn('test');
            testObject.parse('');
            assert.deepStrictEqual(testObject.configurationModel.contents, Object.create(null));
            assert.deepStrictEqual(testObject.configurationModel.keys, []);
            testObject.parse(null);
            assert.deepStrictEqual(testObject.configurationModel.contents, Object.create(null));
            assert.deepStrictEqual(testObject.configurationModel.keys, []);
            testObject.parse(undefined);
            assert.deepStrictEqual(testObject.configurationModel.contents, Object.create(null));
            assert.deepStrictEqual(testObject.configurationModel.keys, []);
        });
        test('Test empty property is not ignored', () => {
            const testObject = new configurationModels_1.$rn('test');
            testObject.parse(JSON.stringify({ '': 1 }));
            // deepStrictEqual seems to ignore empty properties, fall back
            // to comparing the output of JSON.stringify
            assert.strictEqual(JSON.stringify(testObject.configurationModel.contents), JSON.stringify({ '': 1 }));
            assert.deepStrictEqual(testObject.configurationModel.keys, ['']);
        });
    });
    suite('Configuration', () => {
        test('Test inspect for overrideIdentifiers', () => {
            const defaultConfigurationModel = parseConfigurationModel({ '[l1]': { 'a': 1 }, '[l2]': { 'b': 1 } });
            const userConfigurationModel = parseConfigurationModel({ '[l3]': { 'a': 2 } });
            const workspaceConfigurationModel = parseConfigurationModel({ '[l1]': { 'a': 3 }, '[l4]': { 'a': 3 } });
            const testObject = new configurationModels_1.$tn(defaultConfigurationModel, new configurationModels_1.$qn(), userConfigurationModel, workspaceConfigurationModel);
            const { overrideIdentifiers } = testObject.inspect('a', {}, undefined);
            assert.deepStrictEqual(overrideIdentifiers, ['l1', 'l3', 'l4']);
        });
        test('Test update value', () => {
            const parser = new configurationModels_1.$rn('test');
            parser.parse(JSON.stringify({ 'a': 1 }));
            const testObject = new configurationModels_1.$tn(parser.configurationModel, new configurationModels_1.$qn(), new configurationModels_1.$qn(), new configurationModels_1.$qn());
            testObject.updateValue('a', 2);
            assert.strictEqual(testObject.getValue('a', {}, undefined), 2);
        });
        test('Test update value after inspect', () => {
            const parser = new configurationModels_1.$rn('test');
            parser.parse(JSON.stringify({ 'a': 1 }));
            const testObject = new configurationModels_1.$tn(parser.configurationModel, new configurationModels_1.$qn(), new configurationModels_1.$qn(), new configurationModels_1.$qn());
            testObject.inspect('a', {}, undefined);
            testObject.updateValue('a', 2);
            assert.strictEqual(testObject.getValue('a', {}, undefined), 2);
        });
        test('Test compare and update default configuration', () => {
            const testObject = new configurationModels_1.$tn(new configurationModels_1.$qn(), new configurationModels_1.$qn(), new configurationModels_1.$qn(), new configurationModels_1.$qn());
            testObject.updateDefaultConfiguration(toConfigurationModel({
                'editor.lineNumbers': 'on',
            }));
            const actual = testObject.compareAndUpdateDefaultConfiguration(toConfigurationModel({
                'editor.lineNumbers': 'off',
                '[markdown]': {
                    'editor.wordWrap': 'off'
                }
            }), ['editor.lineNumbers', '[markdown]']);
            assert.deepStrictEqual(actual, { keys: ['editor.lineNumbers', '[markdown]'], overrides: [['markdown', ['editor.wordWrap']]] });
        });
        test('Test compare and update application configuration', () => {
            const testObject = new configurationModels_1.$tn(new configurationModels_1.$qn(), new configurationModels_1.$qn(), new configurationModels_1.$qn(), new configurationModels_1.$qn());
            testObject.updateApplicationConfiguration(toConfigurationModel({
                'update.mode': 'on',
            }));
            const actual = testObject.compareAndUpdateApplicationConfiguration(toConfigurationModel({
                'update.mode': 'none',
                '[typescript]': {
                    'editor.wordWrap': 'off'
                }
            }));
            assert.deepStrictEqual(actual, { keys: ['[typescript]', 'update.mode',], overrides: [['typescript', ['editor.wordWrap']]] });
        });
        test('Test compare and update user configuration', () => {
            const testObject = new configurationModels_1.$tn(new configurationModels_1.$qn(), new configurationModels_1.$qn(), new configurationModels_1.$qn(), new configurationModels_1.$qn());
            testObject.updateLocalUserConfiguration(toConfigurationModel({
                'editor.lineNumbers': 'off',
                'editor.fontSize': 12,
                '[typescript]': {
                    'editor.wordWrap': 'off'
                }
            }));
            const actual = testObject.compareAndUpdateLocalUserConfiguration(toConfigurationModel({
                'editor.lineNumbers': 'on',
                'window.zoomLevel': 1,
                '[typescript]': {
                    'editor.wordWrap': 'on',
                    'editor.insertSpaces': false
                }
            }));
            assert.deepStrictEqual(actual, { keys: ['window.zoomLevel', 'editor.lineNumbers', '[typescript]', 'editor.fontSize'], overrides: [['typescript', ['editor.insertSpaces', 'editor.wordWrap']]] });
        });
        test('Test compare and update workspace configuration', () => {
            const testObject = new configurationModels_1.$tn(new configurationModels_1.$qn(), new configurationModels_1.$qn(), new configurationModels_1.$qn(), new configurationModels_1.$qn());
            testObject.updateWorkspaceConfiguration(toConfigurationModel({
                'editor.lineNumbers': 'off',
                'editor.fontSize': 12,
                '[typescript]': {
                    'editor.wordWrap': 'off'
                }
            }));
            const actual = testObject.compareAndUpdateWorkspaceConfiguration(toConfigurationModel({
                'editor.lineNumbers': 'on',
                'window.zoomLevel': 1,
                '[typescript]': {
                    'editor.wordWrap': 'on',
                    'editor.insertSpaces': false
                }
            }));
            assert.deepStrictEqual(actual, { keys: ['window.zoomLevel', 'editor.lineNumbers', '[typescript]', 'editor.fontSize'], overrides: [['typescript', ['editor.insertSpaces', 'editor.wordWrap']]] });
        });
        test('Test compare and update workspace folder configuration', () => {
            const testObject = new configurationModels_1.$tn(new configurationModels_1.$qn(), new configurationModels_1.$qn(), new configurationModels_1.$qn(), new configurationModels_1.$qn());
            testObject.updateFolderConfiguration(uri_1.URI.file('file1'), toConfigurationModel({
                'editor.lineNumbers': 'off',
                'editor.fontSize': 12,
                '[typescript]': {
                    'editor.wordWrap': 'off'
                }
            }));
            const actual = testObject.compareAndUpdateFolderConfiguration(uri_1.URI.file('file1'), toConfigurationModel({
                'editor.lineNumbers': 'on',
                'window.zoomLevel': 1,
                '[typescript]': {
                    'editor.wordWrap': 'on',
                    'editor.insertSpaces': false
                }
            }));
            assert.deepStrictEqual(actual, { keys: ['window.zoomLevel', 'editor.lineNumbers', '[typescript]', 'editor.fontSize'], overrides: [['typescript', ['editor.insertSpaces', 'editor.wordWrap']]] });
        });
        test('Test compare and delete workspace folder configuration', () => {
            const testObject = new configurationModels_1.$tn(new configurationModels_1.$qn(), new configurationModels_1.$qn(), new configurationModels_1.$qn(), new configurationModels_1.$qn());
            testObject.updateFolderConfiguration(uri_1.URI.file('file1'), toConfigurationModel({
                'editor.lineNumbers': 'off',
                'editor.fontSize': 12,
                '[typescript]': {
                    'editor.wordWrap': 'off'
                }
            }));
            const actual = testObject.compareAndDeleteFolderConfiguration(uri_1.URI.file('file1'));
            assert.deepStrictEqual(actual, { keys: ['editor.lineNumbers', 'editor.fontSize', '[typescript]'], overrides: [['typescript', ['editor.wordWrap']]] });
        });
        function parseConfigurationModel(content) {
            const parser = new configurationModels_1.$rn('test');
            parser.parse(JSON.stringify(content));
            return parser.configurationModel;
        }
    });
    suite('ConfigurationChangeEvent', () => {
        test('changeEvent affecting keys with new configuration', () => {
            const configuration = new configurationModels_1.$tn(new configurationModels_1.$qn(), new configurationModels_1.$qn(), new configurationModels_1.$qn(), new configurationModels_1.$qn());
            const change = configuration.compareAndUpdateLocalUserConfiguration(toConfigurationModel({
                'window.zoomLevel': 1,
                'workbench.editor.enablePreview': false,
                'files.autoSave': 'off',
            }));
            const testObject = new configurationModels_1.$vn(change, undefined, configuration);
            assert.deepStrictEqual([...testObject.affectedKeys], ['window.zoomLevel', 'workbench.editor.enablePreview', 'files.autoSave']);
            assert.ok(testObject.affectsConfiguration('window.zoomLevel'));
            assert.ok(testObject.affectsConfiguration('window'));
            assert.ok(testObject.affectsConfiguration('workbench.editor.enablePreview'));
            assert.ok(testObject.affectsConfiguration('workbench.editor'));
            assert.ok(testObject.affectsConfiguration('workbench'));
            assert.ok(testObject.affectsConfiguration('files'));
            assert.ok(testObject.affectsConfiguration('files.autoSave'));
            assert.ok(!testObject.affectsConfiguration('files.exclude'));
            assert.ok(!testObject.affectsConfiguration('[markdown]'));
            assert.ok(!testObject.affectsConfiguration('editor'));
        });
        test('changeEvent affecting keys when configuration changed', () => {
            const configuration = new configurationModels_1.$tn(new configurationModels_1.$qn(), new configurationModels_1.$qn(), new configurationModels_1.$qn(), new configurationModels_1.$qn());
            configuration.updateLocalUserConfiguration(toConfigurationModel({
                'window.zoomLevel': 2,
                'workbench.editor.enablePreview': true,
                'files.autoSave': 'off',
            }));
            const data = configuration.toData();
            const change = configuration.compareAndUpdateLocalUserConfiguration(toConfigurationModel({
                'window.zoomLevel': 1,
                'workbench.editor.enablePreview': false,
                'files.autoSave': 'off',
            }));
            const testObject = new configurationModels_1.$vn(change, { data }, configuration);
            assert.deepStrictEqual([...testObject.affectedKeys], ['window.zoomLevel', 'workbench.editor.enablePreview']);
            assert.ok(testObject.affectsConfiguration('window.zoomLevel'));
            assert.ok(testObject.affectsConfiguration('window'));
            assert.ok(testObject.affectsConfiguration('workbench.editor.enablePreview'));
            assert.ok(testObject.affectsConfiguration('workbench.editor'));
            assert.ok(testObject.affectsConfiguration('workbench'));
            assert.ok(!testObject.affectsConfiguration('files'));
            assert.ok(!testObject.affectsConfiguration('[markdown]'));
            assert.ok(!testObject.affectsConfiguration('editor'));
        });
        test('changeEvent affecting overrides with new configuration', () => {
            const configuration = new configurationModels_1.$tn(new configurationModels_1.$qn(), new configurationModels_1.$qn(), new configurationModels_1.$qn(), new configurationModels_1.$qn());
            const change = configuration.compareAndUpdateLocalUserConfiguration(toConfigurationModel({
                'files.autoSave': 'off',
                '[markdown]': {
                    'editor.wordWrap': 'off'
                },
                '[typescript][jsonc]': {
                    'editor.lineNumbers': 'off'
                }
            }));
            const testObject = new configurationModels_1.$vn(change, undefined, configuration);
            assert.deepStrictEqual([...testObject.affectedKeys], ['files.autoSave', '[markdown]', '[typescript][jsonc]', 'editor.wordWrap', 'editor.lineNumbers']);
            assert.ok(testObject.affectsConfiguration('files'));
            assert.ok(testObject.affectsConfiguration('files.autoSave'));
            assert.ok(!testObject.affectsConfiguration('files.exclude'));
            assert.ok(testObject.affectsConfiguration('[markdown]'));
            assert.ok(!testObject.affectsConfiguration('[markdown].editor'));
            assert.ok(!testObject.affectsConfiguration('[markdown].workbench'));
            assert.ok(testObject.affectsConfiguration('editor'));
            assert.ok(testObject.affectsConfiguration('editor.wordWrap'));
            assert.ok(testObject.affectsConfiguration('editor.lineNumbers'));
            assert.ok(testObject.affectsConfiguration('editor', { overrideIdentifier: 'markdown' }));
            assert.ok(testObject.affectsConfiguration('editor', { overrideIdentifier: 'jsonc' }));
            assert.ok(testObject.affectsConfiguration('editor', { overrideIdentifier: 'typescript' }));
            assert.ok(testObject.affectsConfiguration('editor.wordWrap', { overrideIdentifier: 'markdown' }));
            assert.ok(!testObject.affectsConfiguration('editor.wordWrap', { overrideIdentifier: 'jsonc' }));
            assert.ok(!testObject.affectsConfiguration('editor.wordWrap', { overrideIdentifier: 'typescript' }));
            assert.ok(!testObject.affectsConfiguration('editor.lineNumbers', { overrideIdentifier: 'markdown' }));
            assert.ok(testObject.affectsConfiguration('editor.lineNumbers', { overrideIdentifier: 'typescript' }));
            assert.ok(testObject.affectsConfiguration('editor.lineNumbers', { overrideIdentifier: 'jsonc' }));
            assert.ok(!testObject.affectsConfiguration('editor', { overrideIdentifier: 'json' }));
            assert.ok(!testObject.affectsConfiguration('editor.fontSize', { overrideIdentifier: 'markdown' }));
            assert.ok(!testObject.affectsConfiguration('editor.fontSize'));
            assert.ok(!testObject.affectsConfiguration('window'));
        });
        test('changeEvent affecting overrides when configuration changed', () => {
            const configuration = new configurationModels_1.$tn(new configurationModels_1.$qn(), new configurationModels_1.$qn(), new configurationModels_1.$qn(), new configurationModels_1.$qn());
            configuration.updateLocalUserConfiguration(toConfigurationModel({
                'workbench.editor.enablePreview': true,
                '[markdown]': {
                    'editor.fontSize': 12,
                    'editor.wordWrap': 'off'
                },
                '[css][scss]': {
                    'editor.lineNumbers': 'off',
                    'css.lint.emptyRules': 'error'
                },
                'files.autoSave': 'off',
            }));
            const data = configuration.toData();
            const change = configuration.compareAndUpdateLocalUserConfiguration(toConfigurationModel({
                'files.autoSave': 'off',
                '[markdown]': {
                    'editor.fontSize': 13,
                    'editor.wordWrap': 'off'
                },
                '[css][scss]': {
                    'editor.lineNumbers': 'relative',
                    'css.lint.emptyRules': 'error'
                },
                'window.zoomLevel': 1,
            }));
            const testObject = new configurationModels_1.$vn(change, { data }, configuration);
            assert.deepStrictEqual([...testObject.affectedKeys], ['window.zoomLevel', '[markdown]', '[css][scss]', 'workbench.editor.enablePreview', 'editor.fontSize', 'editor.lineNumbers']);
            assert.ok(!testObject.affectsConfiguration('files'));
            assert.ok(testObject.affectsConfiguration('[markdown]'));
            assert.ok(!testObject.affectsConfiguration('[markdown].editor'));
            assert.ok(!testObject.affectsConfiguration('[markdown].editor.fontSize'));
            assert.ok(!testObject.affectsConfiguration('[markdown].editor.wordWrap'));
            assert.ok(!testObject.affectsConfiguration('[markdown].workbench'));
            assert.ok(testObject.affectsConfiguration('[css][scss]'));
            assert.ok(testObject.affectsConfiguration('editor'));
            assert.ok(testObject.affectsConfiguration('editor', { overrideIdentifier: 'markdown' }));
            assert.ok(testObject.affectsConfiguration('editor', { overrideIdentifier: 'css' }));
            assert.ok(testObject.affectsConfiguration('editor', { overrideIdentifier: 'scss' }));
            assert.ok(testObject.affectsConfiguration('editor.fontSize', { overrideIdentifier: 'markdown' }));
            assert.ok(!testObject.affectsConfiguration('editor.fontSize', { overrideIdentifier: 'css' }));
            assert.ok(!testObject.affectsConfiguration('editor.fontSize', { overrideIdentifier: 'scss' }));
            assert.ok(testObject.affectsConfiguration('editor.lineNumbers', { overrideIdentifier: 'scss' }));
            assert.ok(testObject.affectsConfiguration('editor.lineNumbers', { overrideIdentifier: 'css' }));
            assert.ok(!testObject.affectsConfiguration('editor.lineNumbers', { overrideIdentifier: 'markdown' }));
            assert.ok(!testObject.affectsConfiguration('editor.wordWrap'));
            assert.ok(!testObject.affectsConfiguration('editor.wordWrap', { overrideIdentifier: 'markdown' }));
            assert.ok(!testObject.affectsConfiguration('editor', { overrideIdentifier: 'json' }));
            assert.ok(!testObject.affectsConfiguration('editor.fontSize', { overrideIdentifier: 'json' }));
            assert.ok(testObject.affectsConfiguration('window'));
            assert.ok(testObject.affectsConfiguration('window.zoomLevel'));
            assert.ok(testObject.affectsConfiguration('window', { overrideIdentifier: 'markdown' }));
            assert.ok(testObject.affectsConfiguration('window.zoomLevel', { overrideIdentifier: 'markdown' }));
            assert.ok(testObject.affectsConfiguration('workbench'));
            assert.ok(testObject.affectsConfiguration('workbench.editor'));
            assert.ok(testObject.affectsConfiguration('workbench.editor.enablePreview'));
            assert.ok(testObject.affectsConfiguration('workbench', { overrideIdentifier: 'markdown' }));
            assert.ok(testObject.affectsConfiguration('workbench.editor', { overrideIdentifier: 'markdown' }));
        });
        test('changeEvent affecting workspace folders', () => {
            const configuration = new configurationModels_1.$tn(new configurationModels_1.$qn(), new configurationModels_1.$qn(), new configurationModels_1.$qn(), new configurationModels_1.$qn());
            configuration.updateWorkspaceConfiguration(toConfigurationModel({ 'window.title': 'custom' }));
            configuration.updateFolderConfiguration(uri_1.URI.file('folder1'), toConfigurationModel({ 'window.zoomLevel': 2, 'window.restoreFullscreen': true }));
            configuration.updateFolderConfiguration(uri_1.URI.file('folder2'), toConfigurationModel({ 'workbench.editor.enablePreview': true, 'window.restoreWindows': true }));
            const data = configuration.toData();
            const workspace = new testWorkspace_1.$00b('a', [new workspace_1.$Vh({ index: 0, name: 'a', uri: uri_1.URI.file('folder1') }), new workspace_1.$Vh({ index: 1, name: 'b', uri: uri_1.URI.file('folder2') }), new workspace_1.$Vh({ index: 2, name: 'c', uri: uri_1.URI.file('folder3') })]);
            const change = (0, configurationModels_1.$un)(configuration.compareAndUpdateWorkspaceConfiguration(toConfigurationModel({ 'window.title': 'native' })), configuration.compareAndUpdateFolderConfiguration(uri_1.URI.file('folder1'), toConfigurationModel({ 'window.zoomLevel': 1, 'window.restoreFullscreen': false })), configuration.compareAndUpdateFolderConfiguration(uri_1.URI.file('folder2'), toConfigurationModel({ 'workbench.editor.enablePreview': false, 'window.restoreWindows': false })));
            const testObject = new configurationModels_1.$vn(change, { data, workspace }, configuration, workspace);
            assert.deepStrictEqual([...testObject.affectedKeys], ['window.title', 'window.zoomLevel', 'window.restoreFullscreen', 'workbench.editor.enablePreview', 'window.restoreWindows']);
            assert.ok(testObject.affectsConfiguration('window.zoomLevel'));
            assert.ok(testObject.affectsConfiguration('window.zoomLevel', { resource: uri_1.URI.file('folder1') }));
            assert.ok(testObject.affectsConfiguration('window.zoomLevel', { resource: uri_1.URI.file((0, path_1.$9d)('folder1', 'file1')) }));
            assert.ok(!testObject.affectsConfiguration('window.zoomLevel', { resource: uri_1.URI.file('file1') }));
            assert.ok(!testObject.affectsConfiguration('window.zoomLevel', { resource: uri_1.URI.file('file2') }));
            assert.ok(!testObject.affectsConfiguration('window.zoomLevel', { resource: uri_1.URI.file((0, path_1.$9d)('folder2', 'file2')) }));
            assert.ok(!testObject.affectsConfiguration('window.zoomLevel', { resource: uri_1.URI.file((0, path_1.$9d)('folder3', 'file3')) }));
            assert.ok(testObject.affectsConfiguration('window.restoreFullscreen'));
            assert.ok(testObject.affectsConfiguration('window.restoreFullscreen', { resource: uri_1.URI.file((0, path_1.$9d)('folder1', 'file1')) }));
            assert.ok(testObject.affectsConfiguration('window.restoreFullscreen', { resource: uri_1.URI.file('folder1') }));
            assert.ok(!testObject.affectsConfiguration('window.restoreFullscreen', { resource: uri_1.URI.file('file1') }));
            assert.ok(!testObject.affectsConfiguration('window.restoreFullscreen', { resource: uri_1.URI.file('file2') }));
            assert.ok(!testObject.affectsConfiguration('window.restoreFullscreen', { resource: uri_1.URI.file((0, path_1.$9d)('folder2', 'file2')) }));
            assert.ok(!testObject.affectsConfiguration('window.restoreFullscreen', { resource: uri_1.URI.file((0, path_1.$9d)('folder3', 'file3')) }));
            assert.ok(testObject.affectsConfiguration('window.restoreWindows'));
            assert.ok(testObject.affectsConfiguration('window.restoreWindows', { resource: uri_1.URI.file('folder2') }));
            assert.ok(testObject.affectsConfiguration('window.restoreWindows', { resource: uri_1.URI.file((0, path_1.$9d)('folder2', 'file2')) }));
            assert.ok(!testObject.affectsConfiguration('window.restoreWindows', { resource: uri_1.URI.file('file2') }));
            assert.ok(!testObject.affectsConfiguration('window.restoreWindows', { resource: uri_1.URI.file((0, path_1.$9d)('folder1', 'file1')) }));
            assert.ok(!testObject.affectsConfiguration('window.restoreWindows', { resource: uri_1.URI.file((0, path_1.$9d)('folder3', 'file3')) }));
            assert.ok(testObject.affectsConfiguration('window.title'));
            assert.ok(testObject.affectsConfiguration('window.title', { resource: uri_1.URI.file('folder1') }));
            assert.ok(testObject.affectsConfiguration('window.title', { resource: uri_1.URI.file((0, path_1.$9d)('folder1', 'file1')) }));
            assert.ok(testObject.affectsConfiguration('window.title', { resource: uri_1.URI.file('folder2') }));
            assert.ok(testObject.affectsConfiguration('window.title', { resource: uri_1.URI.file((0, path_1.$9d)('folder2', 'file2')) }));
            assert.ok(testObject.affectsConfiguration('window.title', { resource: uri_1.URI.file('folder3') }));
            assert.ok(testObject.affectsConfiguration('window.title', { resource: uri_1.URI.file((0, path_1.$9d)('folder3', 'file3')) }));
            assert.ok(testObject.affectsConfiguration('window.title', { resource: uri_1.URI.file('file1') }));
            assert.ok(testObject.affectsConfiguration('window.title', { resource: uri_1.URI.file('file2') }));
            assert.ok(testObject.affectsConfiguration('window.title', { resource: uri_1.URI.file('file3') }));
            assert.ok(testObject.affectsConfiguration('window'));
            assert.ok(testObject.affectsConfiguration('window', { resource: uri_1.URI.file('folder1') }));
            assert.ok(testObject.affectsConfiguration('window', { resource: uri_1.URI.file((0, path_1.$9d)('folder1', 'file1')) }));
            assert.ok(testObject.affectsConfiguration('window', { resource: uri_1.URI.file('folder2') }));
            assert.ok(testObject.affectsConfiguration('window', { resource: uri_1.URI.file((0, path_1.$9d)('folder2', 'file2')) }));
            assert.ok(testObject.affectsConfiguration('window', { resource: uri_1.URI.file('folder3') }));
            assert.ok(testObject.affectsConfiguration('window', { resource: uri_1.URI.file((0, path_1.$9d)('folder3', 'file3')) }));
            assert.ok(testObject.affectsConfiguration('window', { resource: uri_1.URI.file('file1') }));
            assert.ok(testObject.affectsConfiguration('window', { resource: uri_1.URI.file('file2') }));
            assert.ok(testObject.affectsConfiguration('window', { resource: uri_1.URI.file('file3') }));
            assert.ok(testObject.affectsConfiguration('workbench.editor.enablePreview'));
            assert.ok(testObject.affectsConfiguration('workbench.editor.enablePreview', { resource: uri_1.URI.file('folder2') }));
            assert.ok(testObject.affectsConfiguration('workbench.editor.enablePreview', { resource: uri_1.URI.file((0, path_1.$9d)('folder2', 'file2')) }));
            assert.ok(!testObject.affectsConfiguration('workbench.editor.enablePreview', { resource: uri_1.URI.file('folder1') }));
            assert.ok(!testObject.affectsConfiguration('workbench.editor.enablePreview', { resource: uri_1.URI.file((0, path_1.$9d)('folder1', 'file1')) }));
            assert.ok(!testObject.affectsConfiguration('workbench.editor.enablePreview', { resource: uri_1.URI.file('folder3') }));
            assert.ok(testObject.affectsConfiguration('workbench.editor'));
            assert.ok(testObject.affectsConfiguration('workbench.editor', { resource: uri_1.URI.file('folder2') }));
            assert.ok(testObject.affectsConfiguration('workbench.editor', { resource: uri_1.URI.file((0, path_1.$9d)('folder2', 'file2')) }));
            assert.ok(!testObject.affectsConfiguration('workbench.editor', { resource: uri_1.URI.file('folder1') }));
            assert.ok(!testObject.affectsConfiguration('workbench.editor', { resource: uri_1.URI.file((0, path_1.$9d)('folder1', 'file1')) }));
            assert.ok(!testObject.affectsConfiguration('workbench.editor', { resource: uri_1.URI.file('folder3') }));
            assert.ok(testObject.affectsConfiguration('workbench'));
            assert.ok(testObject.affectsConfiguration('workbench', { resource: uri_1.URI.file('folder2') }));
            assert.ok(testObject.affectsConfiguration('workbench', { resource: uri_1.URI.file((0, path_1.$9d)('folder2', 'file2')) }));
            assert.ok(!testObject.affectsConfiguration('workbench', { resource: uri_1.URI.file('folder1') }));
            assert.ok(!testObject.affectsConfiguration('workbench', { resource: uri_1.URI.file('folder3') }));
            assert.ok(!testObject.affectsConfiguration('files'));
            assert.ok(!testObject.affectsConfiguration('files', { resource: uri_1.URI.file('folder1') }));
            assert.ok(!testObject.affectsConfiguration('files', { resource: uri_1.URI.file((0, path_1.$9d)('folder1', 'file1')) }));
            assert.ok(!testObject.affectsConfiguration('files', { resource: uri_1.URI.file('folder2') }));
            assert.ok(!testObject.affectsConfiguration('files', { resource: uri_1.URI.file((0, path_1.$9d)('folder2', 'file2')) }));
            assert.ok(!testObject.affectsConfiguration('files', { resource: uri_1.URI.file('folder3') }));
            assert.ok(!testObject.affectsConfiguration('files', { resource: uri_1.URI.file((0, path_1.$9d)('folder3', 'file3')) }));
        });
        test('changeEvent - all', () => {
            const configuration = new configurationModels_1.$tn(new configurationModels_1.$qn(), new configurationModels_1.$qn(), new configurationModels_1.$qn(), new configurationModels_1.$qn());
            configuration.updateFolderConfiguration(uri_1.URI.file('file1'), toConfigurationModel({ 'window.zoomLevel': 2, 'window.restoreFullscreen': true }));
            const data = configuration.toData();
            const change = (0, configurationModels_1.$un)(configuration.compareAndUpdateDefaultConfiguration(toConfigurationModel({
                'editor.lineNumbers': 'off',
                '[markdown]': {
                    'editor.wordWrap': 'off'
                }
            }), ['editor.lineNumbers', '[markdown]']), configuration.compareAndUpdateLocalUserConfiguration(toConfigurationModel({
                '[json]': {
                    'editor.lineNumbers': 'relative'
                }
            })), configuration.compareAndUpdateWorkspaceConfiguration(toConfigurationModel({ 'window.title': 'custom' })), configuration.compareAndDeleteFolderConfiguration(uri_1.URI.file('file1')), configuration.compareAndUpdateFolderConfiguration(uri_1.URI.file('file2'), toConfigurationModel({ 'workbench.editor.enablePreview': true, 'window.restoreWindows': true })));
            const workspace = new testWorkspace_1.$00b('a', [new workspace_1.$Vh({ index: 0, name: 'a', uri: uri_1.URI.file('file1') }), new workspace_1.$Vh({ index: 1, name: 'b', uri: uri_1.URI.file('file2') }), new workspace_1.$Vh({ index: 2, name: 'c', uri: uri_1.URI.file('folder3') })]);
            const testObject = new configurationModels_1.$vn(change, { data, workspace }, configuration, workspace);
            assert.deepStrictEqual([...testObject.affectedKeys], ['editor.lineNumbers', '[markdown]', '[json]', 'window.title', 'window.zoomLevel', 'window.restoreFullscreen', 'workbench.editor.enablePreview', 'window.restoreWindows', 'editor.wordWrap']);
            assert.ok(testObject.affectsConfiguration('window.title'));
            assert.ok(testObject.affectsConfiguration('window.title', { resource: uri_1.URI.file('file1') }));
            assert.ok(testObject.affectsConfiguration('window.title', { resource: uri_1.URI.file('file2') }));
            assert.ok(testObject.affectsConfiguration('window'));
            assert.ok(testObject.affectsConfiguration('window', { resource: uri_1.URI.file('file1') }));
            assert.ok(testObject.affectsConfiguration('window', { resource: uri_1.URI.file('file2') }));
            assert.ok(testObject.affectsConfiguration('window.zoomLevel'));
            assert.ok(testObject.affectsConfiguration('window.zoomLevel', { resource: uri_1.URI.file('file1') }));
            assert.ok(!testObject.affectsConfiguration('window.zoomLevel', { resource: uri_1.URI.file('file2') }));
            assert.ok(testObject.affectsConfiguration('window.restoreFullscreen'));
            assert.ok(testObject.affectsConfiguration('window.restoreFullscreen', { resource: uri_1.URI.file('file1') }));
            assert.ok(!testObject.affectsConfiguration('window.restoreFullscreen', { resource: uri_1.URI.file('file2') }));
            assert.ok(testObject.affectsConfiguration('window.restoreWindows'));
            assert.ok(testObject.affectsConfiguration('window.restoreWindows', { resource: uri_1.URI.file('file2') }));
            assert.ok(!testObject.affectsConfiguration('window.restoreWindows', { resource: uri_1.URI.file('file1') }));
            assert.ok(testObject.affectsConfiguration('workbench.editor.enablePreview'));
            assert.ok(testObject.affectsConfiguration('workbench.editor.enablePreview', { resource: uri_1.URI.file('file2') }));
            assert.ok(!testObject.affectsConfiguration('workbench.editor.enablePreview', { resource: uri_1.URI.file('file1') }));
            assert.ok(testObject.affectsConfiguration('workbench.editor'));
            assert.ok(testObject.affectsConfiguration('workbench.editor', { resource: uri_1.URI.file('file2') }));
            assert.ok(!testObject.affectsConfiguration('workbench.editor', { resource: uri_1.URI.file('file1') }));
            assert.ok(testObject.affectsConfiguration('workbench'));
            assert.ok(testObject.affectsConfiguration('workbench', { resource: uri_1.URI.file('file2') }));
            assert.ok(!testObject.affectsConfiguration('workbench', { resource: uri_1.URI.file('file1') }));
            assert.ok(!testObject.affectsConfiguration('files'));
            assert.ok(!testObject.affectsConfiguration('files', { resource: uri_1.URI.file('file1') }));
            assert.ok(!testObject.affectsConfiguration('files', { resource: uri_1.URI.file('file2') }));
            assert.ok(testObject.affectsConfiguration('editor'));
            assert.ok(testObject.affectsConfiguration('editor', { resource: uri_1.URI.file('file1') }));
            assert.ok(testObject.affectsConfiguration('editor', { resource: uri_1.URI.file('file2') }));
            assert.ok(testObject.affectsConfiguration('editor', { resource: uri_1.URI.file('file1'), overrideIdentifier: 'json' }));
            assert.ok(testObject.affectsConfiguration('editor', { resource: uri_1.URI.file('file1'), overrideIdentifier: 'markdown' }));
            assert.ok(testObject.affectsConfiguration('editor', { resource: uri_1.URI.file('file1'), overrideIdentifier: 'typescript' }));
            assert.ok(testObject.affectsConfiguration('editor', { resource: uri_1.URI.file('file2'), overrideIdentifier: 'json' }));
            assert.ok(testObject.affectsConfiguration('editor', { resource: uri_1.URI.file('file2'), overrideIdentifier: 'markdown' }));
            assert.ok(testObject.affectsConfiguration('editor', { resource: uri_1.URI.file('file2'), overrideIdentifier: 'typescript' }));
            assert.ok(testObject.affectsConfiguration('editor.lineNumbers'));
            assert.ok(testObject.affectsConfiguration('editor.lineNumbers', { resource: uri_1.URI.file('file1') }));
            assert.ok(testObject.affectsConfiguration('editor.lineNumbers', { resource: uri_1.URI.file('file2') }));
            assert.ok(testObject.affectsConfiguration('editor.lineNumbers', { resource: uri_1.URI.file('file1'), overrideIdentifier: 'json' }));
            assert.ok(testObject.affectsConfiguration('editor.lineNumbers', { resource: uri_1.URI.file('file1'), overrideIdentifier: 'markdown' }));
            assert.ok(testObject.affectsConfiguration('editor.lineNumbers', { resource: uri_1.URI.file('file1'), overrideIdentifier: 'typescript' }));
            assert.ok(testObject.affectsConfiguration('editor.lineNumbers', { resource: uri_1.URI.file('file2'), overrideIdentifier: 'json' }));
            assert.ok(testObject.affectsConfiguration('editor.lineNumbers', { resource: uri_1.URI.file('file2'), overrideIdentifier: 'markdown' }));
            assert.ok(testObject.affectsConfiguration('editor.lineNumbers', { resource: uri_1.URI.file('file2'), overrideIdentifier: 'typescript' }));
            assert.ok(testObject.affectsConfiguration('editor.wordWrap'));
            assert.ok(!testObject.affectsConfiguration('editor.wordWrap', { resource: uri_1.URI.file('file1') }));
            assert.ok(!testObject.affectsConfiguration('editor.wordWrap', { resource: uri_1.URI.file('file2') }));
            assert.ok(!testObject.affectsConfiguration('editor.wordWrap', { resource: uri_1.URI.file('file1'), overrideIdentifier: 'json' }));
            assert.ok(testObject.affectsConfiguration('editor.wordWrap', { resource: uri_1.URI.file('file1'), overrideIdentifier: 'markdown' }));
            assert.ok(!testObject.affectsConfiguration('editor.wordWrap', { resource: uri_1.URI.file('file1'), overrideIdentifier: 'typescript' }));
            assert.ok(!testObject.affectsConfiguration('editor.wordWrap', { resource: uri_1.URI.file('file2'), overrideIdentifier: 'json' }));
            assert.ok(testObject.affectsConfiguration('editor.wordWrap', { resource: uri_1.URI.file('file2'), overrideIdentifier: 'markdown' }));
            assert.ok(!testObject.affectsConfiguration('editor.wordWrap', { resource: uri_1.URI.file('file2'), overrideIdentifier: 'typescript' }));
            assert.ok(!testObject.affectsConfiguration('editor.fontSize'));
            assert.ok(!testObject.affectsConfiguration('editor.fontSize', { resource: uri_1.URI.file('file1') }));
            assert.ok(!testObject.affectsConfiguration('editor.fontSize', { resource: uri_1.URI.file('file2') }));
        });
        test('changeEvent affecting tasks and launches', () => {
            const configuration = new configurationModels_1.$tn(new configurationModels_1.$qn(), new configurationModels_1.$qn(), new configurationModels_1.$qn(), new configurationModels_1.$qn());
            const change = configuration.compareAndUpdateLocalUserConfiguration(toConfigurationModel({
                'launch': {
                    'configuraiton': {}
                },
                'launch.version': 1,
                'tasks': {
                    'version': 2
                }
            }));
            const testObject = new configurationModels_1.$vn(change, undefined, configuration);
            assert.deepStrictEqual([...testObject.affectedKeys], ['launch', 'launch.version', 'tasks']);
            assert.ok(testObject.affectsConfiguration('launch'));
            assert.ok(testObject.affectsConfiguration('launch.version'));
            assert.ok(testObject.affectsConfiguration('tasks'));
        });
        test('affectsConfiguration returns false for empty string', () => {
            const configuration = new configurationModels_1.$tn(new configurationModels_1.$qn(), new configurationModels_1.$qn(), new configurationModels_1.$qn(), new configurationModels_1.$qn());
            const change = configuration.compareAndUpdateLocalUserConfiguration(toConfigurationModel({ 'window.zoomLevel': 1 }));
            const testObject = new configurationModels_1.$vn(change, undefined, configuration);
            assert.strictEqual(false, testObject.affectsConfiguration(''));
        });
    });
    function toConfigurationModel(obj) {
        const parser = new configurationModels_1.$rn('test');
        parser.parse(JSON.stringify(obj));
        return parser.configurationModel;
    }
});
//# sourceMappingURL=configurationModels.test.js.map