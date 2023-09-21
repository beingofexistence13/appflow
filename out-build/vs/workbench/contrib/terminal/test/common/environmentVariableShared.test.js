/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "assert", "vs/platform/terminal/common/environmentVariableShared", "vs/platform/terminal/common/environmentVariable", "vs/base/test/common/utils"], function (require, exports, assert_1, environmentVariableShared_1, environmentVariable_1, utils_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    suite('EnvironmentVariable - deserializeEnvironmentVariableCollection', () => {
        (0, utils_1.$bT)();
        test('should construct correctly with 3 arguments', () => {
            const c = (0, environmentVariableShared_1.$cr)([
                ['A', { value: 'a', type: environmentVariable_1.EnvironmentVariableMutatorType.Replace, variable: 'A' }],
                ['B', { value: 'b', type: environmentVariable_1.EnvironmentVariableMutatorType.Append, variable: 'B' }],
                ['C', { value: 'c', type: environmentVariable_1.EnvironmentVariableMutatorType.Prepend, variable: 'C' }]
            ]);
            const keys = [...c.keys()];
            (0, assert_1.deepStrictEqual)(keys, ['A', 'B', 'C']);
            (0, assert_1.deepStrictEqual)(c.get('A'), { value: 'a', type: environmentVariable_1.EnvironmentVariableMutatorType.Replace, variable: 'A' });
            (0, assert_1.deepStrictEqual)(c.get('B'), { value: 'b', type: environmentVariable_1.EnvironmentVariableMutatorType.Append, variable: 'B' });
            (0, assert_1.deepStrictEqual)(c.get('C'), { value: 'c', type: environmentVariable_1.EnvironmentVariableMutatorType.Prepend, variable: 'C' });
        });
    });
    suite('EnvironmentVariable - serializeEnvironmentVariableCollection', () => {
        (0, utils_1.$bT)();
        test('should correctly serialize the object', () => {
            const collection = new Map();
            (0, assert_1.deepStrictEqual)((0, environmentVariableShared_1.$ar)(collection), []);
            collection.set('A', { value: 'a', type: environmentVariable_1.EnvironmentVariableMutatorType.Replace, variable: 'A' });
            collection.set('B', { value: 'b', type: environmentVariable_1.EnvironmentVariableMutatorType.Append, variable: 'B' });
            collection.set('C', { value: 'c', type: environmentVariable_1.EnvironmentVariableMutatorType.Prepend, variable: 'C' });
            (0, assert_1.deepStrictEqual)((0, environmentVariableShared_1.$ar)(collection), [
                ['A', { value: 'a', type: environmentVariable_1.EnvironmentVariableMutatorType.Replace, variable: 'A' }],
                ['B', { value: 'b', type: environmentVariable_1.EnvironmentVariableMutatorType.Append, variable: 'B' }],
                ['C', { value: 'c', type: environmentVariable_1.EnvironmentVariableMutatorType.Prepend, variable: 'C' }]
            ]);
        });
    });
});
//# sourceMappingURL=environmentVariableShared.test.js.map