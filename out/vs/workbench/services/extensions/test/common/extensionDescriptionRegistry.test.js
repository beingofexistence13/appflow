/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "assert", "vs/base/common/uri", "vs/platform/extensions/common/extensions", "vs/workbench/services/extensions/common/extensionDescriptionRegistry"], function (require, exports, assert, uri_1, extensions_1, extensionDescriptionRegistry_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    suite('ExtensionDescriptionRegistry', () => {
        test('allow removing and adding the same extension at a different version', () => {
            const idA = new extensions_1.ExtensionIdentifier('a');
            const extensionA1 = desc(idA, '1.0.0');
            const extensionA2 = desc(idA, '2.0.0');
            const registry = new extensionDescriptionRegistry_1.ExtensionDescriptionRegistry(extensionDescriptionRegistry_1.basicActivationEventsReader, [extensionA1]);
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZXh0ZW5zaW9uRGVzY3JpcHRpb25SZWdpc3RyeS50ZXN0LmpzIiwic291cmNlUm9vdCI6ImZpbGU6Ly8vd29ya3NwYWNlL2FwcGZsb3cvc3JjLyIsInNvdXJjZXMiOlsidnMvd29ya2JlbmNoL3NlcnZpY2VzL2V4dGVuc2lvbnMvdGVzdC9jb21tb24vZXh0ZW5zaW9uRGVzY3JpcHRpb25SZWdpc3RyeS50ZXN0LnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOzs7Z0dBR2dHOzs7O0lBT2hHLEtBQUssQ0FBQyw4QkFBOEIsRUFBRSxHQUFHLEVBQUU7UUFDMUMsSUFBSSxDQUFDLHFFQUFxRSxFQUFFLEdBQUcsRUFBRTtZQUNoRixNQUFNLEdBQUcsR0FBRyxJQUFJLGdDQUFtQixDQUFDLEdBQUcsQ0FBQyxDQUFDO1lBQ3pDLE1BQU0sV0FBVyxHQUFHLElBQUksQ0FBQyxHQUFHLEVBQUUsT0FBTyxDQUFDLENBQUM7WUFDdkMsTUFBTSxXQUFXLEdBQUcsSUFBSSxDQUFDLEdBQUcsRUFBRSxPQUFPLENBQUMsQ0FBQztZQUV2QyxNQUFNLFFBQVEsR0FBRyxJQUFJLDJEQUE0QixDQUFDLDBEQUEyQixFQUFFLENBQUMsV0FBVyxDQUFDLENBQUMsQ0FBQztZQUM5RixRQUFRLENBQUMsZUFBZSxDQUFDLENBQUMsV0FBVyxDQUFDLEVBQUUsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDO1lBRS9DLE1BQU0sQ0FBQyxlQUFlLENBQUMsUUFBUSxDQUFDLDJCQUEyQixFQUFFLEVBQUUsQ0FBQyxXQUFXLENBQUMsQ0FBQyxDQUFDO1FBQy9FLENBQUMsQ0FBQyxDQUFDO1FBRUgsU0FBUyxJQUFJLENBQUMsRUFBdUIsRUFBRSxPQUFlLEVBQUUsbUJBQTZCLENBQUMsR0FBRyxDQUFDO1lBQ3pGLE9BQU87Z0JBQ04sSUFBSSxFQUFFLEVBQUUsQ0FBQyxLQUFLO2dCQUNkLFNBQVMsRUFBRSxNQUFNO2dCQUNqQixPQUFPLEVBQUUsT0FBTztnQkFDaEIsT0FBTyxFQUFFLEVBQUUsTUFBTSxFQUFFLFFBQVEsRUFBRTtnQkFDN0IsVUFBVSxFQUFFLEVBQUU7Z0JBQ2QsaUJBQWlCLEVBQUUsU0FBRyxDQUFDLEtBQUssQ0FBQyxtQkFBbUIsQ0FBQztnQkFDakQsU0FBUyxFQUFFLEtBQUs7Z0JBQ2hCLGtCQUFrQixFQUFFLEtBQUs7Z0JBQ3pCLGFBQWEsRUFBRSxLQUFLO2dCQUNwQixnQkFBZ0I7Z0JBQ2hCLElBQUksRUFBRSxVQUFVO2dCQUNoQixjQUFjLDRDQUEwQjtnQkFDeEMscUJBQXFCLEVBQUUsRUFBRTthQUN6QixDQUFDO1FBQ0gsQ0FBQztJQUNGLENBQUMsQ0FBQyxDQUFDIn0=