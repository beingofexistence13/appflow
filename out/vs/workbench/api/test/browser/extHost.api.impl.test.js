/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "assert", "vs/base/common/uri", "vs/base/common/resources", "vs/base/common/platform"], function (require, exports, assert, uri_1, resources_1, platform_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    suite('ExtHost API', function () {
        test('issue #51387: originalFSPath', function () {
            if (platform_1.isWindows) {
                assert.strictEqual((0, resources_1.originalFSPath)(uri_1.URI.file('C:\\test')).charAt(0), 'C');
                assert.strictEqual((0, resources_1.originalFSPath)(uri_1.URI.file('c:\\test')).charAt(0), 'c');
                assert.strictEqual((0, resources_1.originalFSPath)(uri_1.URI.revive(JSON.parse(JSON.stringify(uri_1.URI.file('C:\\test'))))).charAt(0), 'C');
                assert.strictEqual((0, resources_1.originalFSPath)(uri_1.URI.revive(JSON.parse(JSON.stringify(uri_1.URI.file('c:\\test'))))).charAt(0), 'c');
            }
        });
    });
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZXh0SG9zdC5hcGkuaW1wbC50ZXN0LmpzIiwic291cmNlUm9vdCI6ImZpbGU6Ly8vd29ya3NwYWNlL2FwcGZsb3cvc3JjLyIsInNvdXJjZXMiOlsidnMvd29ya2JlbmNoL2FwaS90ZXN0L2Jyb3dzZXIvZXh0SG9zdC5hcGkuaW1wbC50ZXN0LnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOzs7Z0dBR2dHOzs7O0lBT2hHLEtBQUssQ0FBQyxhQUFhLEVBQUU7UUFDcEIsSUFBSSxDQUFDLDhCQUE4QixFQUFFO1lBQ3BDLElBQUksb0JBQVMsRUFBRTtnQkFDZCxNQUFNLENBQUMsV0FBVyxDQUFDLElBQUEsMEJBQWMsRUFBQyxTQUFHLENBQUMsSUFBSSxDQUFDLFVBQVUsQ0FBQyxDQUFDLENBQUMsTUFBTSxDQUFDLENBQUMsQ0FBQyxFQUFFLEdBQUcsQ0FBQyxDQUFDO2dCQUN4RSxNQUFNLENBQUMsV0FBVyxDQUFDLElBQUEsMEJBQWMsRUFBQyxTQUFHLENBQUMsSUFBSSxDQUFDLFVBQVUsQ0FBQyxDQUFDLENBQUMsTUFBTSxDQUFDLENBQUMsQ0FBQyxFQUFFLEdBQUcsQ0FBQyxDQUFDO2dCQUV4RSxNQUFNLENBQUMsV0FBVyxDQUFDLElBQUEsMEJBQWMsRUFBQyxTQUFHLENBQUMsTUFBTSxDQUFDLElBQUksQ0FBQyxLQUFLLENBQUMsSUFBSSxDQUFDLFNBQVMsQ0FBQyxTQUFHLENBQUMsSUFBSSxDQUFDLFVBQVUsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsTUFBTSxDQUFDLENBQUMsQ0FBQyxFQUFFLEdBQUcsQ0FBQyxDQUFDO2dCQUNoSCxNQUFNLENBQUMsV0FBVyxDQUFDLElBQUEsMEJBQWMsRUFBQyxTQUFHLENBQUMsTUFBTSxDQUFDLElBQUksQ0FBQyxLQUFLLENBQUMsSUFBSSxDQUFDLFNBQVMsQ0FBQyxTQUFHLENBQUMsSUFBSSxDQUFDLFVBQVUsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsTUFBTSxDQUFDLENBQUMsQ0FBQyxFQUFFLEdBQUcsQ0FBQyxDQUFDO2FBQ2hIO1FBQ0YsQ0FBQyxDQUFDLENBQUM7SUFDSixDQUFDLENBQUMsQ0FBQyJ9