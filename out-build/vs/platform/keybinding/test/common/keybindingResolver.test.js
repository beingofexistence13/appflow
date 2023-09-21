/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "assert", "vs/base/common/keybindings", "vs/base/common/keyCodes", "vs/base/common/platform", "vs/platform/contextkey/common/contextkey", "vs/platform/keybinding/common/keybindingResolver", "vs/platform/keybinding/common/resolvedKeybindingItem", "vs/platform/keybinding/common/usLayoutResolvedKeybinding", "vs/platform/keybinding/test/common/keybindingsTestUtils"], function (require, exports, assert, keybindings_1, keyCodes_1, platform_1, contextkey_1, keybindingResolver_1, resolvedKeybindingItem_1, usLayoutResolvedKeybinding_1, keybindingsTestUtils_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    function createContext(ctx) {
        return {
            getValue: (key) => {
                return ctx[key];
            }
        };
    }
    suite('KeybindingResolver', () => {
        function kbItem(keybinding, command, commandArgs, when, isDefault) {
            const resolvedKeybinding = (0, keybindingsTestUtils_1.$A$b)(keybinding, platform_1.OS);
            return new resolvedKeybindingItem_1.$XD(resolvedKeybinding, command, commandArgs, when, isDefault, null, false);
        }
        function getDispatchStr(chord) {
            return usLayoutResolvedKeybinding_1.$n3b.getDispatchStr(chord);
        }
        test('resolve key', () => {
            const keybinding = 2048 /* KeyMod.CtrlCmd */ | 1024 /* KeyMod.Shift */ | 56 /* KeyCode.KeyZ */;
            const runtimeKeybinding = (0, keybindings_1.$xq)(keybinding, platform_1.OS);
            const contextRules = contextkey_1.$Ii.equals('bar', 'baz');
            const keybindingItem = kbItem(keybinding, 'yes', null, contextRules, true);
            assert.strictEqual(contextRules.evaluate(createContext({ bar: 'baz' })), true);
            assert.strictEqual(contextRules.evaluate(createContext({ bar: 'bz' })), false);
            const resolver = new keybindingResolver_1.$1D([keybindingItem], [], () => { });
            const r1 = resolver.resolve(createContext({ bar: 'baz' }), [], getDispatchStr(runtimeKeybinding));
            assert.ok(r1.kind === 2 /* ResultKind.KbFound */);
            assert.strictEqual(r1.commandId, 'yes');
            const r2 = resolver.resolve(createContext({ bar: 'bz' }), [], getDispatchStr(runtimeKeybinding));
            assert.strictEqual(r2.kind, 0 /* ResultKind.NoMatchingKb */);
        });
        test('resolve key with arguments', () => {
            const commandArgs = { text: 'no' };
            const keybinding = 2048 /* KeyMod.CtrlCmd */ | 1024 /* KeyMod.Shift */ | 56 /* KeyCode.KeyZ */;
            const runtimeKeybinding = (0, keybindings_1.$xq)(keybinding, platform_1.OS);
            const contextRules = contextkey_1.$Ii.equals('bar', 'baz');
            const keybindingItem = kbItem(keybinding, 'yes', commandArgs, contextRules, true);
            const resolver = new keybindingResolver_1.$1D([keybindingItem], [], () => { });
            const r = resolver.resolve(createContext({ bar: 'baz' }), [], getDispatchStr(runtimeKeybinding));
            assert.ok(r.kind === 2 /* ResultKind.KbFound */);
            assert.strictEqual(r.commandArgs, commandArgs);
        });
        suite('handle keybinding removals', () => {
            test('simple 1', () => {
                const defaults = [
                    kbItem(31 /* KeyCode.KeyA */, 'yes1', null, contextkey_1.$Ii.equals('1', 'a'), true)
                ];
                const overrides = [
                    kbItem(32 /* KeyCode.KeyB */, 'yes2', null, contextkey_1.$Ii.equals('2', 'b'), false)
                ];
                const actual = keybindingResolver_1.$1D.handleRemovals([...defaults, ...overrides]);
                assert.deepStrictEqual(actual, [
                    kbItem(31 /* KeyCode.KeyA */, 'yes1', null, contextkey_1.$Ii.equals('1', 'a'), true),
                    kbItem(32 /* KeyCode.KeyB */, 'yes2', null, contextkey_1.$Ii.equals('2', 'b'), false),
                ]);
            });
            test('simple 2', () => {
                const defaults = [
                    kbItem(31 /* KeyCode.KeyA */, 'yes1', null, contextkey_1.$Ii.equals('1', 'a'), true),
                    kbItem(32 /* KeyCode.KeyB */, 'yes2', null, contextkey_1.$Ii.equals('2', 'b'), true)
                ];
                const overrides = [
                    kbItem(33 /* KeyCode.KeyC */, 'yes3', null, contextkey_1.$Ii.equals('3', 'c'), false)
                ];
                const actual = keybindingResolver_1.$1D.handleRemovals([...defaults, ...overrides]);
                assert.deepStrictEqual(actual, [
                    kbItem(31 /* KeyCode.KeyA */, 'yes1', null, contextkey_1.$Ii.equals('1', 'a'), true),
                    kbItem(32 /* KeyCode.KeyB */, 'yes2', null, contextkey_1.$Ii.equals('2', 'b'), true),
                    kbItem(33 /* KeyCode.KeyC */, 'yes3', null, contextkey_1.$Ii.equals('3', 'c'), false),
                ]);
            });
            test('removal with not matching when', () => {
                const defaults = [
                    kbItem(31 /* KeyCode.KeyA */, 'yes1', null, contextkey_1.$Ii.equals('1', 'a'), true),
                    kbItem(32 /* KeyCode.KeyB */, 'yes2', null, contextkey_1.$Ii.equals('2', 'b'), true)
                ];
                const overrides = [
                    kbItem(31 /* KeyCode.KeyA */, '-yes1', null, contextkey_1.$Ii.equals('1', 'b'), false)
                ];
                const actual = keybindingResolver_1.$1D.handleRemovals([...defaults, ...overrides]);
                assert.deepStrictEqual(actual, [
                    kbItem(31 /* KeyCode.KeyA */, 'yes1', null, contextkey_1.$Ii.equals('1', 'a'), true),
                    kbItem(32 /* KeyCode.KeyB */, 'yes2', null, contextkey_1.$Ii.equals('2', 'b'), true)
                ]);
            });
            test('removal with not matching keybinding', () => {
                const defaults = [
                    kbItem(31 /* KeyCode.KeyA */, 'yes1', null, contextkey_1.$Ii.equals('1', 'a'), true),
                    kbItem(32 /* KeyCode.KeyB */, 'yes2', null, contextkey_1.$Ii.equals('2', 'b'), true)
                ];
                const overrides = [
                    kbItem(32 /* KeyCode.KeyB */, '-yes1', null, contextkey_1.$Ii.equals('1', 'a'), false)
                ];
                const actual = keybindingResolver_1.$1D.handleRemovals([...defaults, ...overrides]);
                assert.deepStrictEqual(actual, [
                    kbItem(31 /* KeyCode.KeyA */, 'yes1', null, contextkey_1.$Ii.equals('1', 'a'), true),
                    kbItem(32 /* KeyCode.KeyB */, 'yes2', null, contextkey_1.$Ii.equals('2', 'b'), true)
                ]);
            });
            test('removal with matching keybinding and when', () => {
                const defaults = [
                    kbItem(31 /* KeyCode.KeyA */, 'yes1', null, contextkey_1.$Ii.equals('1', 'a'), true),
                    kbItem(32 /* KeyCode.KeyB */, 'yes2', null, contextkey_1.$Ii.equals('2', 'b'), true)
                ];
                const overrides = [
                    kbItem(31 /* KeyCode.KeyA */, '-yes1', null, contextkey_1.$Ii.equals('1', 'a'), false)
                ];
                const actual = keybindingResolver_1.$1D.handleRemovals([...defaults, ...overrides]);
                assert.deepStrictEqual(actual, [
                    kbItem(32 /* KeyCode.KeyB */, 'yes2', null, contextkey_1.$Ii.equals('2', 'b'), true)
                ]);
            });
            test('removal with unspecified keybinding', () => {
                const defaults = [
                    kbItem(31 /* KeyCode.KeyA */, 'yes1', null, contextkey_1.$Ii.equals('1', 'a'), true),
                    kbItem(32 /* KeyCode.KeyB */, 'yes2', null, contextkey_1.$Ii.equals('2', 'b'), true)
                ];
                const overrides = [
                    kbItem(0, '-yes1', null, contextkey_1.$Ii.equals('1', 'a'), false)
                ];
                const actual = keybindingResolver_1.$1D.handleRemovals([...defaults, ...overrides]);
                assert.deepStrictEqual(actual, [
                    kbItem(32 /* KeyCode.KeyB */, 'yes2', null, contextkey_1.$Ii.equals('2', 'b'), true)
                ]);
            });
            test('removal with unspecified when', () => {
                const defaults = [
                    kbItem(31 /* KeyCode.KeyA */, 'yes1', null, contextkey_1.$Ii.equals('1', 'a'), true),
                    kbItem(32 /* KeyCode.KeyB */, 'yes2', null, contextkey_1.$Ii.equals('2', 'b'), true)
                ];
                const overrides = [
                    kbItem(31 /* KeyCode.KeyA */, '-yes1', null, undefined, false)
                ];
                const actual = keybindingResolver_1.$1D.handleRemovals([...defaults, ...overrides]);
                assert.deepStrictEqual(actual, [
                    kbItem(32 /* KeyCode.KeyB */, 'yes2', null, contextkey_1.$Ii.equals('2', 'b'), true)
                ]);
            });
            test('removal with unspecified when and unspecified keybinding', () => {
                const defaults = [
                    kbItem(31 /* KeyCode.KeyA */, 'yes1', null, contextkey_1.$Ii.equals('1', 'a'), true),
                    kbItem(32 /* KeyCode.KeyB */, 'yes2', null, contextkey_1.$Ii.equals('2', 'b'), true)
                ];
                const overrides = [
                    kbItem(0, '-yes1', null, undefined, false)
                ];
                const actual = keybindingResolver_1.$1D.handleRemovals([...defaults, ...overrides]);
                assert.deepStrictEqual(actual, [
                    kbItem(32 /* KeyCode.KeyB */, 'yes2', null, contextkey_1.$Ii.equals('2', 'b'), true)
                ]);
            });
            test('issue #138997 - removal in default list', () => {
                const defaults = [
                    kbItem(31 /* KeyCode.KeyA */, 'yes1', null, undefined, true),
                    kbItem(32 /* KeyCode.KeyB */, 'yes2', null, undefined, true),
                    kbItem(0, '-yes1', null, undefined, false)
                ];
                const overrides = [];
                const actual = keybindingResolver_1.$1D.handleRemovals([...defaults, ...overrides]);
                assert.deepStrictEqual(actual, [
                    kbItem(32 /* KeyCode.KeyB */, 'yes2', null, undefined, true)
                ]);
            });
            test('issue #612#issuecomment-222109084 cannot remove keybindings for commands with ^', () => {
                const defaults = [
                    kbItem(31 /* KeyCode.KeyA */, '^yes1', null, contextkey_1.$Ii.equals('1', 'a'), true),
                    kbItem(32 /* KeyCode.KeyB */, 'yes2', null, contextkey_1.$Ii.equals('2', 'b'), true)
                ];
                const overrides = [
                    kbItem(31 /* KeyCode.KeyA */, '-yes1', null, undefined, false)
                ];
                const actual = keybindingResolver_1.$1D.handleRemovals([...defaults, ...overrides]);
                assert.deepStrictEqual(actual, [
                    kbItem(32 /* KeyCode.KeyB */, 'yes2', null, contextkey_1.$Ii.equals('2', 'b'), true)
                ]);
            });
            test('issue #140884 Unable to reassign F1 as keybinding for Show All Commands', () => {
                const defaults = [
                    kbItem(31 /* KeyCode.KeyA */, 'command1', null, undefined, true),
                ];
                const overrides = [
                    kbItem(31 /* KeyCode.KeyA */, '-command1', null, undefined, false),
                    kbItem(31 /* KeyCode.KeyA */, 'command1', null, undefined, false),
                ];
                const actual = keybindingResolver_1.$1D.handleRemovals([...defaults, ...overrides]);
                assert.deepStrictEqual(actual, [
                    kbItem(31 /* KeyCode.KeyA */, 'command1', null, undefined, false)
                ]);
            });
            test('issue #141638: Keyboard Shortcuts: Change When Expression might actually remove keybinding in Insiders', () => {
                const defaults = [
                    kbItem(31 /* KeyCode.KeyA */, 'command1', null, undefined, true),
                ];
                const overrides = [
                    kbItem(31 /* KeyCode.KeyA */, 'command1', null, contextkey_1.$Ii.equals('a', '1'), false),
                    kbItem(31 /* KeyCode.KeyA */, '-command1', null, undefined, false),
                ];
                const actual = keybindingResolver_1.$1D.handleRemovals([...defaults, ...overrides]);
                assert.deepStrictEqual(actual, [
                    kbItem(31 /* KeyCode.KeyA */, 'command1', null, contextkey_1.$Ii.equals('a', '1'), false)
                ]);
            });
            test('issue #157751: Auto-quoting of context keys prevents removal of keybindings via UI', () => {
                const defaults = [
                    kbItem(31 /* KeyCode.KeyA */, 'command1', null, contextkey_1.$Ii.deserialize(`editorTextFocus && activeEditor != workbench.editor.notebook && editorLangId in julia.supportedLanguageIds`), true),
                ];
                const overrides = [
                    kbItem(31 /* KeyCode.KeyA */, '-command1', null, contextkey_1.$Ii.deserialize(`editorTextFocus && activeEditor != 'workbench.editor.notebook' && editorLangId in 'julia.supportedLanguageIds'`), false),
                ];
                const actual = keybindingResolver_1.$1D.handleRemovals([...defaults, ...overrides]);
                assert.deepStrictEqual(actual, []);
            });
            test('issue #160604: Remove keybindings with when clause does not work', () => {
                const defaults = [
                    kbItem(31 /* KeyCode.KeyA */, 'command1', null, undefined, true),
                ];
                const overrides = [
                    kbItem(31 /* KeyCode.KeyA */, '-command1', null, contextkey_1.$Ii.true(), false),
                ];
                const actual = keybindingResolver_1.$1D.handleRemovals([...defaults, ...overrides]);
                assert.deepStrictEqual(actual, []);
            });
            test('contextIsEntirelyIncluded', () => {
                const toContextKeyExpression = (expr) => {
                    if (typeof expr === 'string' || !expr) {
                        return contextkey_1.$Ii.deserialize(expr);
                    }
                    return expr;
                };
                const assertIsIncluded = (a, b) => {
                    assert.strictEqual(keybindingResolver_1.$1D.whenIsEntirelyIncluded(toContextKeyExpression(a), toContextKeyExpression(b)), true);
                };
                const assertIsNotIncluded = (a, b) => {
                    assert.strictEqual(keybindingResolver_1.$1D.whenIsEntirelyIncluded(toContextKeyExpression(a), toContextKeyExpression(b)), false);
                };
                assertIsIncluded(null, null);
                assertIsIncluded(null, contextkey_1.$Ii.true());
                assertIsIncluded(contextkey_1.$Ii.true(), null);
                assertIsIncluded(contextkey_1.$Ii.true(), contextkey_1.$Ii.true());
                assertIsIncluded('key1', null);
                assertIsIncluded('key1', '');
                assertIsIncluded('key1', 'key1');
                assertIsIncluded('key1', contextkey_1.$Ii.true());
                assertIsIncluded('!key1', '');
                assertIsIncluded('!key1', '!key1');
                assertIsIncluded('key2', '');
                assertIsIncluded('key2', 'key2');
                assertIsIncluded('key1 && key1 && key2 && key2', 'key2');
                assertIsIncluded('key1 && key2', 'key2');
                assertIsIncluded('key1 && key2', 'key1');
                assertIsIncluded('key1 && key2', '');
                assertIsIncluded('key1', 'key1 || key2');
                assertIsIncluded('key1 || !key1', 'key2 || !key2');
                assertIsIncluded('key1', 'key1 || key2 && key3');
                assertIsNotIncluded('key1', '!key1');
                assertIsNotIncluded('!key1', 'key1');
                assertIsNotIncluded('key1 && key2', 'key3');
                assertIsNotIncluded('key1 && key2', 'key4');
                assertIsNotIncluded('key1', 'key2');
                assertIsNotIncluded('key1 || key2', 'key2');
                assertIsNotIncluded('', 'key2');
                assertIsNotIncluded(null, 'key2');
            });
        });
        suite('resolve command', () => {
            function _kbItem(keybinding, command, when) {
                return kbItem(keybinding, command, null, when, true);
            }
            const items = [
                // This one will never match because its "when" is always overwritten by another one
                _kbItem(54 /* KeyCode.KeyX */, 'first', contextkey_1.$Ii.and(contextkey_1.$Ii.equals('key1', true), contextkey_1.$Ii.notEquals('key2', false))),
                // This one always overwrites first
                _kbItem(54 /* KeyCode.KeyX */, 'second', contextkey_1.$Ii.equals('key2', true)),
                // This one is a secondary mapping for `second`
                _kbItem(56 /* KeyCode.KeyZ */, 'second', undefined),
                // This one sometimes overwrites first
                _kbItem(54 /* KeyCode.KeyX */, 'third', contextkey_1.$Ii.equals('key3', true)),
                // This one is always overwritten by another one
                _kbItem(2048 /* KeyMod.CtrlCmd */ | 55 /* KeyCode.KeyY */, 'fourth', contextkey_1.$Ii.equals('key4', true)),
                // This one overwrites with a chord the previous one
                _kbItem((0, keyCodes_1.$vq)(2048 /* KeyMod.CtrlCmd */ | 55 /* KeyCode.KeyY */, 56 /* KeyCode.KeyZ */), 'fifth', undefined),
                // This one has no keybinding
                _kbItem(0, 'sixth', undefined),
                _kbItem((0, keyCodes_1.$vq)(2048 /* KeyMod.CtrlCmd */ | 41 /* KeyCode.KeyK */, 2048 /* KeyMod.CtrlCmd */ | 51 /* KeyCode.KeyU */), 'seventh', undefined),
                _kbItem((0, keyCodes_1.$vq)(2048 /* KeyMod.CtrlCmd */ | 41 /* KeyCode.KeyK */, 2048 /* KeyMod.CtrlCmd */ | 41 /* KeyCode.KeyK */), 'seventh', undefined),
                _kbItem((0, keyCodes_1.$vq)(2048 /* KeyMod.CtrlCmd */ | 41 /* KeyCode.KeyK */, 2048 /* KeyMod.CtrlCmd */ | 51 /* KeyCode.KeyU */), 'uncomment lines', undefined),
                _kbItem((0, keyCodes_1.$vq)(2048 /* KeyMod.CtrlCmd */ | 41 /* KeyCode.KeyK */, 2048 /* KeyMod.CtrlCmd */ | 33 /* KeyCode.KeyC */), // cmd+k cmd+c
                'comment lines', undefined),
                _kbItem((0, keyCodes_1.$vq)(2048 /* KeyMod.CtrlCmd */ | 37 /* KeyCode.KeyG */, 2048 /* KeyMod.CtrlCmd */ | 33 /* KeyCode.KeyC */), // cmd+g cmd+c
                'unreachablechord', undefined),
                _kbItem(2048 /* KeyMod.CtrlCmd */ | 37 /* KeyCode.KeyG */, // cmd+g
                'eleven', undefined),
                _kbItem([2048 /* KeyMod.CtrlCmd */ | 41 /* KeyCode.KeyK */, 31 /* KeyCode.KeyA */, 32 /* KeyCode.KeyB */], // cmd+k a b
                'long multi chord', undefined),
                _kbItem([2048 /* KeyMod.CtrlCmd */ | 32 /* KeyCode.KeyB */, 2048 /* KeyMod.CtrlCmd */ | 33 /* KeyCode.KeyC */], // cmd+b cmd+c
                'shadowed by long-multi-chord-2', undefined),
                _kbItem([2048 /* KeyMod.CtrlCmd */ | 32 /* KeyCode.KeyB */, 2048 /* KeyMod.CtrlCmd */ | 33 /* KeyCode.KeyC */, 39 /* KeyCode.KeyI */], // cmd+b cmd+c i
                'long-multi-chord-2', undefined)
            ];
            const resolver = new keybindingResolver_1.$1D(items, [], () => { });
            const testKbLookupByCommand = (commandId, expectedKeys) => {
                // Test lookup
                const lookupResult = resolver.lookupKeybindings(commandId);
                assert.strictEqual(lookupResult.length, expectedKeys.length, 'Length mismatch @ commandId ' + commandId);
                for (let i = 0, len = lookupResult.length; i < len; i++) {
                    const expected = (0, keybindingsTestUtils_1.$A$b)(expectedKeys[i], platform_1.OS);
                    assert.strictEqual(lookupResult[i].resolvedKeybinding.getUserSettingsLabel(), expected.getUserSettingsLabel(), 'value mismatch @ commandId ' + commandId);
                }
            };
            const testResolve = (ctx, _expectedKey, commandId) => {
                const expectedKeybinding = (0, keybindings_1.$wq)(_expectedKey, platform_1.OS);
                const previousChord = [];
                for (let i = 0, len = expectedKeybinding.chords.length; i < len; i++) {
                    const chord = getDispatchStr(expectedKeybinding.chords[i]);
                    const result = resolver.resolve(ctx, previousChord, chord);
                    if (i === len - 1) {
                        // if it's the final chord, then we should find a valid command,
                        // and there should not be a chord.
                        assert.ok(result.kind === 2 /* ResultKind.KbFound */, `Enters multi chord for ${commandId} at chord ${i}`);
                        assert.strictEqual(result.commandId, commandId, `Enters multi chord for ${commandId} at chord ${i}`);
                    }
                    else if (i > 0) {
                        // if this is an intermediate chord, we should not find a valid command,
                        // and there should be an open chord we continue.
                        assert.ok(result.kind === 1 /* ResultKind.MoreChordsNeeded */, `Continues multi chord for ${commandId} at chord ${i}`);
                    }
                    else {
                        // if it's not the final chord and not an intermediate, then we should not
                        // find a valid command, and we should enter a chord.
                        assert.ok(result.kind === 1 /* ResultKind.MoreChordsNeeded */, `Enters multi chord for ${commandId} at chord ${i}`);
                    }
                    previousChord.push(chord);
                }
            };
            test('resolve command - 1', () => {
                testKbLookupByCommand('first', []);
            });
            test('resolve command - 2', () => {
                testKbLookupByCommand('second', [56 /* KeyCode.KeyZ */, 54 /* KeyCode.KeyX */]);
                testResolve(createContext({ key2: true }), 54 /* KeyCode.KeyX */, 'second');
                testResolve(createContext({}), 56 /* KeyCode.KeyZ */, 'second');
            });
            test('resolve command - 3', () => {
                testKbLookupByCommand('third', [54 /* KeyCode.KeyX */]);
                testResolve(createContext({ key3: true }), 54 /* KeyCode.KeyX */, 'third');
            });
            test('resolve command - 4', () => {
                testKbLookupByCommand('fourth', []);
            });
            test('resolve command - 5', () => {
                testKbLookupByCommand('fifth', [(0, keyCodes_1.$vq)(2048 /* KeyMod.CtrlCmd */ | 55 /* KeyCode.KeyY */, 56 /* KeyCode.KeyZ */)]);
                testResolve(createContext({}), (0, keyCodes_1.$vq)(2048 /* KeyMod.CtrlCmd */ | 55 /* KeyCode.KeyY */, 56 /* KeyCode.KeyZ */), 'fifth');
            });
            test('resolve command - 6', () => {
                testKbLookupByCommand('seventh', [(0, keyCodes_1.$vq)(2048 /* KeyMod.CtrlCmd */ | 41 /* KeyCode.KeyK */, 2048 /* KeyMod.CtrlCmd */ | 41 /* KeyCode.KeyK */)]);
                testResolve(createContext({}), (0, keyCodes_1.$vq)(2048 /* KeyMod.CtrlCmd */ | 41 /* KeyCode.KeyK */, 2048 /* KeyMod.CtrlCmd */ | 41 /* KeyCode.KeyK */), 'seventh');
            });
            test('resolve command - 7', () => {
                testKbLookupByCommand('uncomment lines', [(0, keyCodes_1.$vq)(2048 /* KeyMod.CtrlCmd */ | 41 /* KeyCode.KeyK */, 2048 /* KeyMod.CtrlCmd */ | 51 /* KeyCode.KeyU */)]);
                testResolve(createContext({}), (0, keyCodes_1.$vq)(2048 /* KeyMod.CtrlCmd */ | 41 /* KeyCode.KeyK */, 2048 /* KeyMod.CtrlCmd */ | 51 /* KeyCode.KeyU */), 'uncomment lines');
            });
            test('resolve command - 8', () => {
                testKbLookupByCommand('comment lines', [(0, keyCodes_1.$vq)(2048 /* KeyMod.CtrlCmd */ | 41 /* KeyCode.KeyK */, 2048 /* KeyMod.CtrlCmd */ | 33 /* KeyCode.KeyC */)]);
                testResolve(createContext({}), (0, keyCodes_1.$vq)(2048 /* KeyMod.CtrlCmd */ | 41 /* KeyCode.KeyK */, 2048 /* KeyMod.CtrlCmd */ | 33 /* KeyCode.KeyC */), 'comment lines');
            });
            test('resolve command - 9', () => {
                testKbLookupByCommand('unreachablechord', []);
            });
            test('resolve command - 10', () => {
                testKbLookupByCommand('eleven', [2048 /* KeyMod.CtrlCmd */ | 37 /* KeyCode.KeyG */]);
                testResolve(createContext({}), 2048 /* KeyMod.CtrlCmd */ | 37 /* KeyCode.KeyG */, 'eleven');
            });
            test('resolve command - 11', () => {
                testKbLookupByCommand('sixth', []);
            });
            test('resolve command - 12', () => {
                testKbLookupByCommand('long multi chord', [[2048 /* KeyMod.CtrlCmd */ | 41 /* KeyCode.KeyK */, 31 /* KeyCode.KeyA */, 32 /* KeyCode.KeyB */]]);
                testResolve(createContext({}), [2048 /* KeyMod.CtrlCmd */ | 41 /* KeyCode.KeyK */, 31 /* KeyCode.KeyA */, 32 /* KeyCode.KeyB */], 'long multi chord');
            });
            const emptyContext = createContext({});
            test('KBs having common prefix - the one defined later is returned', () => {
                testResolve(emptyContext, [2048 /* KeyMod.CtrlCmd */ | 32 /* KeyCode.KeyB */, 2048 /* KeyMod.CtrlCmd */ | 33 /* KeyCode.KeyC */, 39 /* KeyCode.KeyI */], 'long-multi-chord-2');
            });
        });
    });
});
//# sourceMappingURL=keybindingResolver.test.js.map