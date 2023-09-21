/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "assert", "vs/base/parts/sandbox/electron-sandbox/globals"], function (require, exports, assert, globals_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    suite('Sandbox', () => {
        test('globals', async () => {
            assert.ok(typeof globals_1.ipcRenderer.send === 'function');
            assert.ok(typeof globals_1.webFrame.setZoomLevel === 'function');
            assert.ok(typeof globals_1.process.platform === 'string');
            const config = await globals_1.context.resolveConfiguration();
            assert.ok(config);
            assert.ok(globals_1.context.configuration());
        });
    });
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZ2xvYmFscy50ZXN0LmpzIiwic291cmNlUm9vdCI6ImZpbGU6Ly8vd29ya3NwYWNlL2FwcGZsb3cvc3JjLyIsInNvdXJjZXMiOlsidnMvYmFzZS9wYXJ0cy9zYW5kYm94L3Rlc3QvZWxlY3Ryb24tc2FuZGJveC9nbG9iYWxzLnRlc3QudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7OztnR0FHZ0c7Ozs7SUFLaEcsS0FBSyxDQUFDLFNBQVMsRUFBRSxHQUFHLEVBQUU7UUFDckIsSUFBSSxDQUFDLFNBQVMsRUFBRSxLQUFLLElBQUksRUFBRTtZQUMxQixNQUFNLENBQUMsRUFBRSxDQUFDLE9BQU8scUJBQVcsQ0FBQyxJQUFJLEtBQUssVUFBVSxDQUFDLENBQUM7WUFDbEQsTUFBTSxDQUFDLEVBQUUsQ0FBQyxPQUFPLGtCQUFRLENBQUMsWUFBWSxLQUFLLFVBQVUsQ0FBQyxDQUFDO1lBQ3ZELE1BQU0sQ0FBQyxFQUFFLENBQUMsT0FBTyxpQkFBTyxDQUFDLFFBQVEsS0FBSyxRQUFRLENBQUMsQ0FBQztZQUVoRCxNQUFNLE1BQU0sR0FBRyxNQUFNLGlCQUFPLENBQUMsb0JBQW9CLEVBQUUsQ0FBQztZQUNwRCxNQUFNLENBQUMsRUFBRSxDQUFDLE1BQU0sQ0FBQyxDQUFDO1lBQ2xCLE1BQU0sQ0FBQyxFQUFFLENBQUMsaUJBQU8sQ0FBQyxhQUFhLEVBQUUsQ0FBQyxDQUFDO1FBQ3BDLENBQUMsQ0FBQyxDQUFDO0lBQ0osQ0FBQyxDQUFDLENBQUMifQ==