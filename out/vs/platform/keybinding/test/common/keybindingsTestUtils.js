/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/base/common/keybindings", "vs/platform/keybinding/common/usLayoutResolvedKeybinding"], function (require, exports, keybindings_1, usLayoutResolvedKeybinding_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.createUSLayoutResolvedKeybinding = void 0;
    function createUSLayoutResolvedKeybinding(encodedKeybinding, OS) {
        if (encodedKeybinding === 0) {
            return undefined;
        }
        const keybinding = (0, keybindings_1.decodeKeybinding)(encodedKeybinding, OS);
        if (!keybinding) {
            return undefined;
        }
        const result = usLayoutResolvedKeybinding_1.USLayoutResolvedKeybinding.resolveKeybinding(keybinding, OS);
        if (result.length > 0) {
            return result[0];
        }
        return undefined;
    }
    exports.createUSLayoutResolvedKeybinding = createUSLayoutResolvedKeybinding;
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoia2V5YmluZGluZ3NUZXN0VXRpbHMuanMiLCJzb3VyY2VSb290IjoiZmlsZTovLy93b3Jrc3BhY2UvYXBwZmxvdy9zcmMvIiwic291cmNlcyI6WyJ2cy9wbGF0Zm9ybS9rZXliaW5kaW5nL3Rlc3QvY29tbW9uL2tleWJpbmRpbmdzVGVzdFV0aWxzLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOzs7Z0dBR2dHOzs7OztJQU1oRyxTQUFnQixnQ0FBZ0MsQ0FBQyxpQkFBb0MsRUFBRSxFQUFtQjtRQUN6RyxJQUFJLGlCQUFpQixLQUFLLENBQUMsRUFBRTtZQUM1QixPQUFPLFNBQVMsQ0FBQztTQUNqQjtRQUNELE1BQU0sVUFBVSxHQUFHLElBQUEsOEJBQWdCLEVBQUMsaUJBQWlCLEVBQUUsRUFBRSxDQUFDLENBQUM7UUFDM0QsSUFBSSxDQUFDLFVBQVUsRUFBRTtZQUNoQixPQUFPLFNBQVMsQ0FBQztTQUNqQjtRQUNELE1BQU0sTUFBTSxHQUFHLHVEQUEwQixDQUFDLGlCQUFpQixDQUFDLFVBQVUsRUFBRSxFQUFFLENBQUMsQ0FBQztRQUM1RSxJQUFJLE1BQU0sQ0FBQyxNQUFNLEdBQUcsQ0FBQyxFQUFFO1lBQ3RCLE9BQU8sTUFBTSxDQUFDLENBQUMsQ0FBQyxDQUFDO1NBQ2pCO1FBQ0QsT0FBTyxTQUFTLENBQUM7SUFDbEIsQ0FBQztJQWJELDRFQWFDIn0=