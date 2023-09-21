/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports"], function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.getEditorFeatures = exports.registerEditorFeature = void 0;
    const editorFeatures = [];
    /**
     * Registers an editor feature. Editor features will be instantiated only once, as soon as
     * the first code editor is instantiated.
     */
    function registerEditorFeature(ctor) {
        editorFeatures.push(ctor);
    }
    exports.registerEditorFeature = registerEditorFeature;
    function getEditorFeatures() {
        return editorFeatures.slice(0);
    }
    exports.getEditorFeatures = getEditorFeatures;
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZWRpdG9yRmVhdHVyZXMuanMiLCJzb3VyY2VSb290IjoiZmlsZTovLy93b3Jrc3BhY2UvYXBwZmxvdy9zcmMvIiwic291cmNlcyI6WyJ2cy9lZGl0b3IvY29tbW9uL2VkaXRvckZlYXR1cmVzLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOzs7Z0dBR2dHOzs7OztJQWFoRyxNQUFNLGNBQWMsR0FBd0IsRUFBRSxDQUFDO0lBRS9DOzs7T0FHRztJQUNILFNBQWdCLHFCQUFxQixDQUFvQyxJQUFvRDtRQUM1SCxjQUFjLENBQUMsSUFBSSxDQUFDLElBQXlCLENBQUMsQ0FBQztJQUNoRCxDQUFDO0lBRkQsc0RBRUM7SUFFRCxTQUFnQixpQkFBaUI7UUFDaEMsT0FBTyxjQUFjLENBQUMsS0FBSyxDQUFDLENBQUMsQ0FBQyxDQUFDO0lBQ2hDLENBQUM7SUFGRCw4Q0FFQyJ9