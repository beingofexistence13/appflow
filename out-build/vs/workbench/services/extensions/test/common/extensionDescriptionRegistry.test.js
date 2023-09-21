/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "assert", "vs/base/common/uri", "vs/platform/extensions/common/extensions", "vs/workbench/services/extensions/common/extensionDescriptionRegistry"], function (require, exports, assert, uri_1, extensions_1, extensionDescriptionRegistry_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    suite('ExtensionDescriptionRegistry', () => {
        test('allow removing and adding the same extension at a different version', () => {
            const idA = new extensions_1.$Vl('a');
            const extensionA1 = desc(idA, '1.0.0');
            const extensionA2 = desc(idA, '2.0.0');
            const registry = new extensionDescriptionRegistry_1.$y3b(extensionDescriptionRegistry_1.$A3b, [extensionA1]);
            registry.deltaExtensions([extensionA2], [idA]);
            assert.deepStrictEqual(registry.getAllExtensionDescriptions(), [extensionA2]);
        });
        function desc(id, version, activationEvents = ['*']) {
            return {
                name: id.value,
                publisher: 'test',
                version: '0.0.0',
                engines: { vscode: '^1.0.0' },
                identifier: id,
                extensionLocation: uri_1.URI.parse(`nothing://nowhere`),
                isBuiltin: false,
                isUnderDevelopment: false,
                isUserBuiltin: false,
                activationEvents,
                main: 'index.js',
                targetPlatform: "undefined" /* TargetPlatform.UNDEFINED */,
                extensionDependencies: []
            };
        }
    });
});
//# sourceMappingURL=extensionDescriptionRegistry.test.js.map