/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "assert", "vs/platform/terminal/common/environmentVariable", "vs/base/common/platform", "vs/platform/terminal/common/environmentVariableCollection", "vs/platform/terminal/common/environmentVariableShared", "vs/base/common/uri", "vs/base/test/common/utils"], function (require, exports, assert_1, environmentVariable_1, platform_1, environmentVariableCollection_1, environmentVariableShared_1, uri_1, utils_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    suite('EnvironmentVariable - MergedEnvironmentVariableCollection', () => {
        (0, utils_1.ensureNoDisposablesAreLeakedInTestSuite)();
        suite('ctor', () => {
            test('Should keep entries that come after a Prepend or Append type mutators', () => {
                const merged = new environmentVariableCollection_1.MergedEnvironmentVariableCollection(new Map([
                    ['ext1', {
                            map: (0, environmentVariableShared_1.deserializeEnvironmentVariableCollection)([
                                ['A-key', { value: 'a1', type: environmentVariable_1.EnvironmentVariableMutatorType.Prepend, variable: 'A' }]
                            ])
                        }],
                    ['ext2', {
                            map: (0, environmentVariableShared_1.deserializeEnvironmentVariableCollection)([
                                ['A-key', { value: 'a2', type: environmentVariable_1.EnvironmentVariableMutatorType.Append, variable: 'A' }]
                            ])
                        }],
                    ['ext3', {
                            map: (0, environmentVariableShared_1.deserializeEnvironmentVariableCollection)([
                                ['A-key', { value: 'a3', type: environmentVariable_1.EnvironmentVariableMutatorType.Prepend, variable: 'A' }]
                            ])
                        }],
                    ['ext4', {
                            map: (0, environmentVariableShared_1.deserializeEnvironmentVariableCollection)([
                                ['A-key', { value: 'a4', type: environmentVariable_1.EnvironmentVariableMutatorType.Append, variable: 'A', options: { applyAtProcessCreation: true, applyAtShellIntegration: true } }]
                            ])
                        }]
                ]));
                (0, assert_1.deepStrictEqual)([...merged.getVariableMap(undefined).entries()], [
                    ['A', [
                            { extensionIdentifier: 'ext4', type: environmentVariable_1.EnvironmentVariableMutatorType.Append, value: 'a4', variable: 'A', options: { applyAtProcessCreation: true, applyAtShellIntegration: true } },
                            { extensionIdentifier: 'ext3', type: environmentVariable_1.EnvironmentVariableMutatorType.Prepend, value: 'a3', variable: 'A', options: undefined },
                            { extensionIdentifier: 'ext2', type: environmentVariable_1.EnvironmentVariableMutatorType.Append, value: 'a2', variable: 'A', options: undefined },
                            { extensionIdentifier: 'ext1', type: environmentVariable_1.EnvironmentVariableMutatorType.Prepend, value: 'a1', variable: 'A', options: undefined }
                        ]]
                ]);
            });
            test('Should remove entries that come after a Replace type mutator', () => {
                const merged = new environmentVariableCollection_1.MergedEnvironmentVariableCollection(new Map([
                    ['ext1', {
                            map: (0, environmentVariableShared_1.deserializeEnvironmentVariableCollection)([
                                ['A-key', { value: 'a1', type: environmentVariable_1.EnvironmentVariableMutatorType.Prepend, variable: 'A' }]
                            ])
                        }],
                    ['ext2', {
                            map: (0, environmentVariableShared_1.deserializeEnvironmentVariableCollection)([
                                ['A-key', { value: 'a2', type: environmentVariable_1.EnvironmentVariableMutatorType.Append, variable: 'A' }]
                            ])
                        }],
                    ['ext3', {
                            map: (0, environmentVariableShared_1.deserializeEnvironmentVariableCollection)([
                                ['A-key', { value: 'a3', type: environmentVariable_1.EnvironmentVariableMutatorType.Replace, variable: 'A' }]
                            ])
                        }],
                    ['ext4', {
                            map: (0, environmentVariableShared_1.deserializeEnvironmentVariableCollection)([
                                ['A-key', { value: 'a4', type: environmentVariable_1.EnvironmentVariableMutatorType.Append, variable: 'A' }]
                            ])
                        }]
                ]));
                (0, assert_1.deepStrictEqual)([...merged.getVariableMap(undefined).entries()], [
                    ['A', [
                            { extensionIdentifier: 'ext3', type: environmentVariable_1.EnvironmentVariableMutatorType.Replace, value: 'a3', variable: 'A', options: undefined },
                            { extensionIdentifier: 'ext2', type: environmentVariable_1.EnvironmentVariableMutatorType.Append, value: 'a2', variable: 'A', options: undefined },
                            { extensionIdentifier: 'ext1', type: environmentVariable_1.EnvironmentVariableMutatorType.Prepend, value: 'a1', variable: 'A', options: undefined }
                        ]]
                ], 'The ext4 entry should be removed as it comes after a Replace');
            });
            test('Appropriate workspace scoped entries are returned when querying for a particular workspace folder', () => {
                const scope1 = { workspaceFolder: { uri: uri_1.URI.file('workspace1'), name: 'workspace1', index: 0 } };
                const scope2 = { workspaceFolder: { uri: uri_1.URI.file('workspace2'), name: 'workspace2', index: 3 } };
                const merged = new environmentVariableCollection_1.MergedEnvironmentVariableCollection(new Map([
                    ['ext1', {
                            map: (0, environmentVariableShared_1.deserializeEnvironmentVariableCollection)([
                                ['A-key', { value: 'a1', type: environmentVariable_1.EnvironmentVariableMutatorType.Prepend, scope: scope1, variable: 'A' }]
                            ])
                        }],
                    ['ext2', {
                            map: (0, environmentVariableShared_1.deserializeEnvironmentVariableCollection)([
                                ['A-key', { value: 'a2', type: environmentVariable_1.EnvironmentVariableMutatorType.Append, variable: 'A' }]
                            ])
                        }],
                    ['ext3', {
                            map: (0, environmentVariableShared_1.deserializeEnvironmentVariableCollection)([
                                ['A-key', { value: 'a3', type: environmentVariable_1.EnvironmentVariableMutatorType.Prepend, scope: scope2, variable: 'A' }]
                            ])
                        }],
                    ['ext4', {
                            map: (0, environmentVariableShared_1.deserializeEnvironmentVariableCollection)([
                                ['A-key', { value: 'a4', type: environmentVariable_1.EnvironmentVariableMutatorType.Append, variable: 'A' }]
                            ])
                        }]
                ]));
                (0, assert_1.deepStrictEqual)([...merged.getVariableMap(scope2).entries()], [
                    ['A', [
                            { extensionIdentifier: 'ext4', type: environmentVariable_1.EnvironmentVariableMutatorType.Append, value: 'a4', variable: 'A', options: undefined },
                            { extensionIdentifier: 'ext3', type: environmentVariable_1.EnvironmentVariableMutatorType.Prepend, value: 'a3', scope: scope2, variable: 'A', options: undefined },
                            { extensionIdentifier: 'ext2', type: environmentVariable_1.EnvironmentVariableMutatorType.Append, value: 'a2', variable: 'A', options: undefined },
                        ]]
                ]);
            });
            test('Workspace scoped entries are not included when looking for global entries', () => {
                const scope1 = { workspaceFolder: { uri: uri_1.URI.file('workspace1'), name: 'workspace1', index: 0 } };
                const scope2 = { workspaceFolder: { uri: uri_1.URI.file('workspace2'), name: 'workspace2', index: 3 } };
                const merged = new environmentVariableCollection_1.MergedEnvironmentVariableCollection(new Map([
                    ['ext1', {
                            map: (0, environmentVariableShared_1.deserializeEnvironmentVariableCollection)([
                                ['A-key', { value: 'a1', type: environmentVariable_1.EnvironmentVariableMutatorType.Prepend, scope: scope1, variable: 'A' }]
                            ])
                        }],
                    ['ext2', {
                            map: (0, environmentVariableShared_1.deserializeEnvironmentVariableCollection)([
                                ['A-key', { value: 'a2', type: environmentVariable_1.EnvironmentVariableMutatorType.Append, variable: 'A' }]
                            ])
                        }],
                    ['ext3', {
                            map: (0, environmentVariableShared_1.deserializeEnvironmentVariableCollection)([
                                ['A-key', { value: 'a3', type: environmentVariable_1.EnvironmentVariableMutatorType.Prepend, scope: scope2, variable: 'A' }]
                            ])
                        }],
                    ['ext4', {
                            map: (0, environmentVariableShared_1.deserializeEnvironmentVariableCollection)([
                                ['A-key', { value: 'a4', type: environmentVariable_1.EnvironmentVariableMutatorType.Append, variable: 'A' }]
                            ])
                        }]
                ]));
                (0, assert_1.deepStrictEqual)([...merged.getVariableMap(undefined).entries()], [
                    ['A', [
                            { extensionIdentifier: 'ext4', type: environmentVariable_1.EnvironmentVariableMutatorType.Append, value: 'a4', variable: 'A', options: undefined },
                            { extensionIdentifier: 'ext2', type: environmentVariable_1.EnvironmentVariableMutatorType.Append, value: 'a2', variable: 'A', options: undefined },
                        ]]
                ]);
            });
            test('Workspace scoped description entries are properly filtered for each extension', () => {
                const scope1 = { workspaceFolder: { uri: uri_1.URI.file('workspace1'), name: 'workspace1', index: 0 } };
                const scope2 = { workspaceFolder: { uri: uri_1.URI.file('workspace2'), name: 'workspace2', index: 3 } };
                const merged = new environmentVariableCollection_1.MergedEnvironmentVariableCollection(new Map([
                    ['ext1', {
                            map: (0, environmentVariableShared_1.deserializeEnvironmentVariableCollection)([
                                ['A-key', { value: 'a1', type: environmentVariable_1.EnvironmentVariableMutatorType.Prepend, scope: scope1, variable: 'A' }]
                            ]),
                            descriptionMap: (0, environmentVariableShared_1.deserializeEnvironmentDescriptionMap)([
                                ['A-key-scope1', { description: 'ext1 scope1 description', scope: scope1 }],
                                ['A-key-scope2', { description: 'ext1 scope2 description', scope: scope2 }],
                            ])
                        }],
                    ['ext2', {
                            map: (0, environmentVariableShared_1.deserializeEnvironmentVariableCollection)([
                                ['A-key', { value: 'a2', type: environmentVariable_1.EnvironmentVariableMutatorType.Append, variable: 'A' }]
                            ]),
                            descriptionMap: (0, environmentVariableShared_1.deserializeEnvironmentDescriptionMap)([
                                ['A-key', { description: 'ext2 global description' }],
                            ])
                        }],
                    ['ext3', {
                            map: (0, environmentVariableShared_1.deserializeEnvironmentVariableCollection)([
                                ['A-key', { value: 'a3', type: environmentVariable_1.EnvironmentVariableMutatorType.Prepend, scope: scope2, variable: 'A' }]
                            ]),
                            descriptionMap: (0, environmentVariableShared_1.deserializeEnvironmentDescriptionMap)([
                                ['A-key', { description: 'ext3 scope2 description', scope: scope2 }],
                            ])
                        }],
                    ['ext4', {
                            map: (0, environmentVariableShared_1.deserializeEnvironmentVariableCollection)([
                                ['A-key', { value: 'a4', type: environmentVariable_1.EnvironmentVariableMutatorType.Append, variable: 'A' }]
                            ])
                        }]
                ]));
                (0, assert_1.deepStrictEqual)([...merged.getDescriptionMap(scope1).entries()], [
                    ['ext1', 'ext1 scope1 description'],
                ]);
                (0, assert_1.deepStrictEqual)([...merged.getDescriptionMap(undefined).entries()], [
                    ['ext2', 'ext2 global description'],
                ]);
            });
        });
        suite('applyToProcessEnvironment', () => {
            test('should apply the collection to an environment', async () => {
                const merged = new environmentVariableCollection_1.MergedEnvironmentVariableCollection(new Map([
                    ['ext', {
                            map: (0, environmentVariableShared_1.deserializeEnvironmentVariableCollection)([
                                ['A-key', { value: 'a', type: environmentVariable_1.EnvironmentVariableMutatorType.Replace, variable: 'A' }],
                                ['B', { value: 'b', type: environmentVariable_1.EnvironmentVariableMutatorType.Append, variable: 'B' }],
                                ['C', { value: 'c', type: environmentVariable_1.EnvironmentVariableMutatorType.Prepend, variable: 'C' }]
                            ])
                        }]
                ]));
                const env = {
                    A: 'foo',
                    B: 'bar',
                    C: 'baz'
                };
                await merged.applyToProcessEnvironment(env, undefined);
                (0, assert_1.deepStrictEqual)(env, {
                    A: 'a',
                    B: 'barb',
                    C: 'cbaz'
                });
            });
            test('should apply the appropriate workspace scoped entries to an environment', async () => {
                const scope1 = { workspaceFolder: { uri: uri_1.URI.file('workspace1'), name: 'workspace1', index: 0 } };
                const scope2 = { workspaceFolder: { uri: uri_1.URI.file('workspace2'), name: 'workspace2', index: 3 } };
                const merged = new environmentVariableCollection_1.MergedEnvironmentVariableCollection(new Map([
                    ['ext', {
                            map: (0, environmentVariableShared_1.deserializeEnvironmentVariableCollection)([
                                ['A-key', { value: 'a', type: environmentVariable_1.EnvironmentVariableMutatorType.Replace, scope: scope1, variable: 'A' }],
                                ['B', { value: 'b', type: environmentVariable_1.EnvironmentVariableMutatorType.Append, scope: scope2, variable: 'B' }],
                                ['C', { value: 'c', type: environmentVariable_1.EnvironmentVariableMutatorType.Prepend, variable: 'C' }]
                            ])
                        }]
                ]));
                const env = {
                    A: 'foo',
                    B: 'bar',
                    C: 'baz'
                };
                await merged.applyToProcessEnvironment(env, scope1);
                (0, assert_1.deepStrictEqual)(env, {
                    A: 'a',
                    B: 'bar',
                    C: 'cbaz'
                });
            });
            test('should apply the collection to environment entries with no values', async () => {
                const merged = new environmentVariableCollection_1.MergedEnvironmentVariableCollection(new Map([
                    ['ext', {
                            map: (0, environmentVariableShared_1.deserializeEnvironmentVariableCollection)([
                                ['A-key', { value: 'a', type: environmentVariable_1.EnvironmentVariableMutatorType.Replace, variable: 'A' }],
                                ['B', { value: 'b', type: environmentVariable_1.EnvironmentVariableMutatorType.Append, variable: 'B' }],
                                ['C', { value: 'c', type: environmentVariable_1.EnvironmentVariableMutatorType.Prepend, variable: 'C' }]
                            ])
                        }]
                ]));
                const env = {};
                await merged.applyToProcessEnvironment(env, undefined);
                (0, assert_1.deepStrictEqual)(env, {
                    A: 'a',
                    B: 'b',
                    C: 'c'
                });
            });
            test('should apply to variable case insensitively on Windows only', async () => {
                const merged = new environmentVariableCollection_1.MergedEnvironmentVariableCollection(new Map([
                    ['ext', {
                            map: (0, environmentVariableShared_1.deserializeEnvironmentVariableCollection)([
                                ['A-key', { value: 'a', type: environmentVariable_1.EnvironmentVariableMutatorType.Replace, variable: 'a' }],
                                ['b', { value: 'b', type: environmentVariable_1.EnvironmentVariableMutatorType.Append, variable: 'b' }],
                                ['c', { value: 'c', type: environmentVariable_1.EnvironmentVariableMutatorType.Prepend, variable: 'c' }]
                            ])
                        }]
                ]));
                const env = {
                    A: 'A',
                    B: 'B',
                    C: 'C'
                };
                await merged.applyToProcessEnvironment(env, undefined);
                if (platform_1.isWindows) {
                    (0, assert_1.deepStrictEqual)(env, {
                        A: 'a',
                        B: 'Bb',
                        C: 'cC'
                    });
                }
                else {
                    (0, assert_1.deepStrictEqual)(env, {
                        a: 'a',
                        A: 'A',
                        b: 'b',
                        B: 'B',
                        c: 'c',
                        C: 'C'
                    });
                }
            });
        });
        suite('diff', () => {
            test('should return undefined when collectinos are the same', () => {
                const merged1 = new environmentVariableCollection_1.MergedEnvironmentVariableCollection(new Map([
                    ['ext1', {
                            map: (0, environmentVariableShared_1.deserializeEnvironmentVariableCollection)([
                                ['A-key', { value: 'a', type: environmentVariable_1.EnvironmentVariableMutatorType.Replace, variable: 'A' }]
                            ])
                        }]
                ]));
                const merged2 = new environmentVariableCollection_1.MergedEnvironmentVariableCollection(new Map([
                    ['ext1', {
                            map: (0, environmentVariableShared_1.deserializeEnvironmentVariableCollection)([
                                ['A-key', { value: 'a', type: environmentVariable_1.EnvironmentVariableMutatorType.Replace, variable: 'A' }]
                            ])
                        }]
                ]));
                const diff = merged1.diff(merged2, undefined);
                (0, assert_1.strictEqual)(diff, undefined);
            });
            test('should generate added diffs from when the first entry is added', () => {
                const merged1 = new environmentVariableCollection_1.MergedEnvironmentVariableCollection(new Map([]));
                const merged2 = new environmentVariableCollection_1.MergedEnvironmentVariableCollection(new Map([
                    ['ext1', {
                            map: (0, environmentVariableShared_1.deserializeEnvironmentVariableCollection)([
                                ['A-key', { value: 'a', type: environmentVariable_1.EnvironmentVariableMutatorType.Replace, variable: 'A' }]
                            ])
                        }]
                ]));
                const diff = merged1.diff(merged2, undefined);
                (0, assert_1.strictEqual)(diff.changed.size, 0);
                (0, assert_1.strictEqual)(diff.removed.size, 0);
                const entries = [...diff.added.entries()];
                (0, assert_1.deepStrictEqual)(entries, [
                    ['A', [{ extensionIdentifier: 'ext1', value: 'a', type: environmentVariable_1.EnvironmentVariableMutatorType.Replace, variable: 'A', options: undefined }]]
                ]);
            });
            test('should generate added diffs from the same extension', () => {
                const merged1 = new environmentVariableCollection_1.MergedEnvironmentVariableCollection(new Map([
                    ['ext1', {
                            map: (0, environmentVariableShared_1.deserializeEnvironmentVariableCollection)([
                                ['A-key', { value: 'a', type: environmentVariable_1.EnvironmentVariableMutatorType.Replace, variable: 'A' }]
                            ])
                        }]
                ]));
                const merged2 = new environmentVariableCollection_1.MergedEnvironmentVariableCollection(new Map([
                    ['ext1', {
                            map: (0, environmentVariableShared_1.deserializeEnvironmentVariableCollection)([
                                ['A-key', { value: 'a', type: environmentVariable_1.EnvironmentVariableMutatorType.Replace, variable: 'A' }],
                                ['B', { value: 'b', type: environmentVariable_1.EnvironmentVariableMutatorType.Append, variable: 'B' }]
                            ])
                        }]
                ]));
                const diff = merged1.diff(merged2, undefined);
                (0, assert_1.strictEqual)(diff.changed.size, 0);
                (0, assert_1.strictEqual)(diff.removed.size, 0);
                const entries = [...diff.added.entries()];
                (0, assert_1.deepStrictEqual)(entries, [
                    ['B', [{ extensionIdentifier: 'ext1', value: 'b', type: environmentVariable_1.EnvironmentVariableMutatorType.Append, variable: 'B', options: undefined }]]
                ]);
            });
            test('should generate added diffs from a different extension', () => {
                const merged1 = new environmentVariableCollection_1.MergedEnvironmentVariableCollection(new Map([
                    ['ext1', {
                            map: (0, environmentVariableShared_1.deserializeEnvironmentVariableCollection)([
                                ['A-key', { value: 'a1', type: environmentVariable_1.EnvironmentVariableMutatorType.Prepend, variable: 'A' }]
                            ])
                        }]
                ]));
                const merged2 = new environmentVariableCollection_1.MergedEnvironmentVariableCollection(new Map([
                    ['ext2', {
                            map: (0, environmentVariableShared_1.deserializeEnvironmentVariableCollection)([
                                ['A-key', { value: 'a2', type: environmentVariable_1.EnvironmentVariableMutatorType.Append, variable: 'A' }]
                            ])
                        }],
                    ['ext1', {
                            map: (0, environmentVariableShared_1.deserializeEnvironmentVariableCollection)([
                                ['A-key', { value: 'a1', type: environmentVariable_1.EnvironmentVariableMutatorType.Prepend, variable: 'A' }]
                            ])
                        }]
                ]));
                const diff = merged1.diff(merged2, undefined);
                (0, assert_1.strictEqual)(diff.changed.size, 0);
                (0, assert_1.strictEqual)(diff.removed.size, 0);
                (0, assert_1.deepStrictEqual)([...diff.added.entries()], [
                    ['A', [{ extensionIdentifier: 'ext2', value: 'a2', type: environmentVariable_1.EnvironmentVariableMutatorType.Append, variable: 'A', options: undefined }]]
                ]);
                const merged3 = new environmentVariableCollection_1.MergedEnvironmentVariableCollection(new Map([
                    ['ext1', {
                            map: (0, environmentVariableShared_1.deserializeEnvironmentVariableCollection)([
                                ['A-key', { value: 'a1', type: environmentVariable_1.EnvironmentVariableMutatorType.Prepend, variable: 'A' }]
                            ])
                        }],
                    // This entry should get removed
                    ['ext2', {
                            map: (0, environmentVariableShared_1.deserializeEnvironmentVariableCollection)([
                                ['A-key', { value: 'a2', type: environmentVariable_1.EnvironmentVariableMutatorType.Append, variable: 'A' }]
                            ])
                        }]
                ]));
                const diff2 = merged1.diff(merged3, undefined);
                (0, assert_1.strictEqual)(diff2.changed.size, 0);
                (0, assert_1.strictEqual)(diff2.removed.size, 0);
                (0, assert_1.deepStrictEqual)([...diff.added.entries()], [...diff2.added.entries()], 'Swapping the order of the entries in the other collection should yield the same result');
            });
            test('should remove entries in the diff that come after a Replace', () => {
                const merged1 = new environmentVariableCollection_1.MergedEnvironmentVariableCollection(new Map([
                    ['ext1', {
                            map: (0, environmentVariableShared_1.deserializeEnvironmentVariableCollection)([
                                ['A-key', { value: 'a1', type: environmentVariable_1.EnvironmentVariableMutatorType.Replace, variable: 'A' }]
                            ])
                        }]
                ]));
                const merged4 = new environmentVariableCollection_1.MergedEnvironmentVariableCollection(new Map([
                    ['ext1', {
                            map: (0, environmentVariableShared_1.deserializeEnvironmentVariableCollection)([
                                ['A-key', { value: 'a1', type: environmentVariable_1.EnvironmentVariableMutatorType.Replace, variable: 'A' }]
                            ])
                        }],
                    // This entry should get removed as it comes after a replace
                    ['ext2', {
                            map: (0, environmentVariableShared_1.deserializeEnvironmentVariableCollection)([
                                ['A-key', { value: 'a2', type: environmentVariable_1.EnvironmentVariableMutatorType.Append, variable: 'A' }]
                            ])
                        }]
                ]));
                const diff = merged1.diff(merged4, undefined);
                (0, assert_1.strictEqual)(diff, undefined, 'Replace should ignore any entries after it');
            });
            test('should generate removed diffs', () => {
                const merged1 = new environmentVariableCollection_1.MergedEnvironmentVariableCollection(new Map([
                    ['ext1', {
                            map: (0, environmentVariableShared_1.deserializeEnvironmentVariableCollection)([
                                ['A-key', { value: 'a', type: environmentVariable_1.EnvironmentVariableMutatorType.Replace, variable: 'A' }],
                                ['B', { value: 'b', type: environmentVariable_1.EnvironmentVariableMutatorType.Replace, variable: 'B' }]
                            ])
                        }]
                ]));
                const merged2 = new environmentVariableCollection_1.MergedEnvironmentVariableCollection(new Map([
                    ['ext1', {
                            map: (0, environmentVariableShared_1.deserializeEnvironmentVariableCollection)([
                                ['A-key', { value: 'a', type: environmentVariable_1.EnvironmentVariableMutatorType.Replace, variable: 'A' }]
                            ])
                        }]
                ]));
                const diff = merged1.diff(merged2, undefined);
                (0, assert_1.strictEqual)(diff.changed.size, 0);
                (0, assert_1.strictEqual)(diff.added.size, 0);
                (0, assert_1.deepStrictEqual)([...diff.removed.entries()], [
                    ['B', [{ extensionIdentifier: 'ext1', value: 'b', type: environmentVariable_1.EnvironmentVariableMutatorType.Replace, variable: 'B', options: undefined }]]
                ]);
            });
            test('should generate changed diffs', () => {
                const merged1 = new environmentVariableCollection_1.MergedEnvironmentVariableCollection(new Map([
                    ['ext1', {
                            map: (0, environmentVariableShared_1.deserializeEnvironmentVariableCollection)([
                                ['A-key', { value: 'a1', type: environmentVariable_1.EnvironmentVariableMutatorType.Replace, variable: 'A' }],
                                ['B', { value: 'b', type: environmentVariable_1.EnvironmentVariableMutatorType.Replace, variable: 'B' }]
                            ])
                        }]
                ]));
                const merged2 = new environmentVariableCollection_1.MergedEnvironmentVariableCollection(new Map([
                    ['ext1', {
                            map: (0, environmentVariableShared_1.deserializeEnvironmentVariableCollection)([
                                ['A-key', { value: 'a2', type: environmentVariable_1.EnvironmentVariableMutatorType.Replace, variable: 'A' }],
                                ['B', { value: 'b', type: environmentVariable_1.EnvironmentVariableMutatorType.Append, variable: 'B' }]
                            ])
                        }]
                ]));
                const diff = merged1.diff(merged2, undefined);
                (0, assert_1.strictEqual)(diff.added.size, 0);
                (0, assert_1.strictEqual)(diff.removed.size, 0);
                (0, assert_1.deepStrictEqual)([...diff.changed.entries()], [
                    ['A', [{ extensionIdentifier: 'ext1', value: 'a2', type: environmentVariable_1.EnvironmentVariableMutatorType.Replace, variable: 'A', options: undefined }]],
                    ['B', [{ extensionIdentifier: 'ext1', value: 'b', type: environmentVariable_1.EnvironmentVariableMutatorType.Append, variable: 'B', options: undefined }]]
                ]);
            });
            test('should generate diffs with added, changed and removed', () => {
                const merged1 = new environmentVariableCollection_1.MergedEnvironmentVariableCollection(new Map([
                    ['ext1', {
                            map: (0, environmentVariableShared_1.deserializeEnvironmentVariableCollection)([
                                ['A-key', { value: 'a1', type: environmentVariable_1.EnvironmentVariableMutatorType.Replace, variable: 'A' }],
                                ['B', { value: 'b', type: environmentVariable_1.EnvironmentVariableMutatorType.Prepend, variable: 'B' }]
                            ])
                        }]
                ]));
                const merged2 = new environmentVariableCollection_1.MergedEnvironmentVariableCollection(new Map([
                    ['ext1', {
                            map: (0, environmentVariableShared_1.deserializeEnvironmentVariableCollection)([
                                ['A-key', { value: 'a2', type: environmentVariable_1.EnvironmentVariableMutatorType.Replace, variable: 'A' }],
                                ['C', { value: 'c', type: environmentVariable_1.EnvironmentVariableMutatorType.Append, variable: 'C' }]
                            ])
                        }]
                ]));
                const diff = merged1.diff(merged2, undefined);
                (0, assert_1.deepStrictEqual)([...diff.added.entries()], [
                    ['C', [{ extensionIdentifier: 'ext1', value: 'c', type: environmentVariable_1.EnvironmentVariableMutatorType.Append, variable: 'C', options: undefined }]],
                ]);
                (0, assert_1.deepStrictEqual)([...diff.removed.entries()], [
                    ['B', [{ extensionIdentifier: 'ext1', value: 'b', type: environmentVariable_1.EnvironmentVariableMutatorType.Prepend, variable: 'B', options: undefined }]]
                ]);
                (0, assert_1.deepStrictEqual)([...diff.changed.entries()], [
                    ['A', [{ extensionIdentifier: 'ext1', value: 'a2', type: environmentVariable_1.EnvironmentVariableMutatorType.Replace, variable: 'A', options: undefined }]]
                ]);
            });
            test('should only generate workspace specific diffs', () => {
                const scope1 = { workspaceFolder: { uri: uri_1.URI.file('workspace1'), name: 'workspace1', index: 0 } };
                const scope2 = { workspaceFolder: { uri: uri_1.URI.file('workspace2'), name: 'workspace2', index: 3 } };
                const merged1 = new environmentVariableCollection_1.MergedEnvironmentVariableCollection(new Map([
                    ['ext1', {
                            map: (0, environmentVariableShared_1.deserializeEnvironmentVariableCollection)([
                                ['A-key', { value: 'a1', type: environmentVariable_1.EnvironmentVariableMutatorType.Replace, scope: scope1, variable: 'A' }],
                                ['B', { value: 'b', type: environmentVariable_1.EnvironmentVariableMutatorType.Prepend, variable: 'B' }]
                            ])
                        }]
                ]));
                const merged2 = new environmentVariableCollection_1.MergedEnvironmentVariableCollection(new Map([
                    ['ext1', {
                            map: (0, environmentVariableShared_1.deserializeEnvironmentVariableCollection)([
                                ['A-key', { value: 'a2', type: environmentVariable_1.EnvironmentVariableMutatorType.Replace, scope: scope1, variable: 'A' }],
                                ['C', { value: 'c', type: environmentVariable_1.EnvironmentVariableMutatorType.Append, scope: scope2, variable: 'C' }]
                            ])
                        }]
                ]));
                const diff = merged1.diff(merged2, scope1);
                (0, assert_1.strictEqual)(diff.added.size, 0);
                (0, assert_1.deepStrictEqual)([...diff.removed.entries()], [
                    ['B', [{ extensionIdentifier: 'ext1', value: 'b', type: environmentVariable_1.EnvironmentVariableMutatorType.Prepend, variable: 'B', options: undefined }]]
                ]);
                (0, assert_1.deepStrictEqual)([...diff.changed.entries()], [
                    ['A', [{ extensionIdentifier: 'ext1', value: 'a2', type: environmentVariable_1.EnvironmentVariableMutatorType.Replace, scope: scope1, variable: 'A', options: undefined }]]
                ]);
            });
        });
    });
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZW52aXJvbm1lbnRWYXJpYWJsZUNvbGxlY3Rpb24udGVzdC5qcyIsInNvdXJjZVJvb3QiOiJmaWxlOi8vL3dvcmtzcGFjZS9hcHBmbG93L3NyYy8iLCJzb3VyY2VzIjpbInZzL3dvcmtiZW5jaC9jb250cmliL3Rlcm1pbmFsL3Rlc3QvY29tbW9uL2Vudmlyb25tZW50VmFyaWFibGVDb2xsZWN0aW9uLnRlc3QudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7OztnR0FHZ0c7Ozs7SUFVaEcsS0FBSyxDQUFDLDJEQUEyRCxFQUFFLEdBQUcsRUFBRTtRQUN2RSxJQUFBLCtDQUF1QyxHQUFFLENBQUM7UUFFMUMsS0FBSyxDQUFDLE1BQU0sRUFBRSxHQUFHLEVBQUU7WUFDbEIsSUFBSSxDQUFDLHVFQUF1RSxFQUFFLEdBQUcsRUFBRTtnQkFDbEYsTUFBTSxNQUFNLEdBQUcsSUFBSSxtRUFBbUMsQ0FBQyxJQUFJLEdBQUcsQ0FBQztvQkFDOUQsQ0FBQyxNQUFNLEVBQUU7NEJBQ1IsR0FBRyxFQUFFLElBQUEsb0VBQXdDLEVBQUM7Z0NBQzdDLENBQUMsT0FBTyxFQUFFLEVBQUUsS0FBSyxFQUFFLElBQUksRUFBRSxJQUFJLEVBQUUsb0RBQThCLENBQUMsT0FBTyxFQUFFLFFBQVEsRUFBRSxHQUFHLEVBQUUsQ0FBQzs2QkFDdkYsQ0FBQzt5QkFDRixDQUFDO29CQUNGLENBQUMsTUFBTSxFQUFFOzRCQUNSLEdBQUcsRUFBRSxJQUFBLG9FQUF3QyxFQUFDO2dDQUM3QyxDQUFDLE9BQU8sRUFBRSxFQUFFLEtBQUssRUFBRSxJQUFJLEVBQUUsSUFBSSxFQUFFLG9EQUE4QixDQUFDLE1BQU0sRUFBRSxRQUFRLEVBQUUsR0FBRyxFQUFFLENBQUM7NkJBQ3RGLENBQUM7eUJBQ0YsQ0FBQztvQkFDRixDQUFDLE1BQU0sRUFBRTs0QkFDUixHQUFHLEVBQUUsSUFBQSxvRUFBd0MsRUFBQztnQ0FDN0MsQ0FBQyxPQUFPLEVBQUUsRUFBRSxLQUFLLEVBQUUsSUFBSSxFQUFFLElB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