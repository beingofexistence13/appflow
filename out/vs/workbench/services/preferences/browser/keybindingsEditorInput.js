/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
define(["require", "exports", "vs/base/common/platform", "vs/nls", "vs/platform/instantiation/common/instantiation", "vs/workbench/common/editor/editorInput", "vs/workbench/services/preferences/browser/keybindingsEditorModel"], function (require, exports, platform_1, nls, instantiation_1, editorInput_1, keybindingsEditorModel_1) {
    "use strict";
    var KeybindingsEditorInput_1;
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.KeybindingsEditorInput = void 0;
    let KeybindingsEditorInput = class KeybindingsEditorInput extends editorInput_1.EditorInput {
        static { KeybindingsEditorInput_1 = this; }
        static { this.ID = 'workbench.input.keybindings'; }
        constructor(instantiationService) {
            super();
            this.searchOptions = null;
            this.resource = undefined;
            this.keybindingsModel = instantiationService.createInstance(keybindingsEditorModel_1.KeybindingsEditorModel, platform_1.OS);
        }
        get typeId() {
            return KeybindingsEditorInput_1.ID;
        }
        getName() {
            return nls.localize('keybindingsInputName', "Keyboard Shortcuts");
        }
        async resolve() {
            return this.keybindingsModel;
        }
        matches(otherInput) {
            return otherInput instanceof KeybindingsEditorInput_1;
        }
        dispose() {
            this.keybindingsModel.dispose();
            super.dispose();
        }
    };
    exports.KeybindingsEditorInput = KeybindingsEditorInput;
    exports.KeybindingsEditorInput = KeybindingsEditorInput = KeybindingsEditorInput_1 = __decorate([
        __param(0, instantiation_1.IInstantiationService)
    ], KeybindingsEditorInput);
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoia2V5YmluZGluZ3NFZGl0b3JJbnB1dC5qcyIsInNvdXJjZVJvb3QiOiJmaWxlOi8vL3dvcmtzcGFjZS9hcHBmbG93L3NyYy8iLCJzb3VyY2VzIjpbInZzL3dvcmtiZW5jaC9zZXJ2aWNlcy9wcmVmZXJlbmNlcy9icm93c2VyL2tleWJpbmRpbmdzRWRpdG9ySW5wdXQudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7OztnR0FHZ0c7Ozs7Ozs7Ozs7Ozs7OztJQWV6RixJQUFNLHNCQUFzQixHQUE1QixNQUFNLHNCQUF1QixTQUFRLHlCQUFXOztpQkFFdEMsT0FBRSxHQUFXLDZCQUE2QixBQUF4QyxDQUF5QztRQU8zRCxZQUFtQyxvQkFBMkM7WUFDN0UsS0FBSyxFQUFFLENBQUM7WUFMVCxrQkFBYSxHQUEyQyxJQUFJLENBQUM7WUFFcEQsYUFBUSxHQUFHLFNBQVMsQ0FBQztZQUs3QixJQUFJLENBQUMsZ0JBQWdCLEdBQUcsb0JBQW9CLENBQUMsY0FBYyxDQUFDLCtDQUFzQixFQUFFLGFBQUUsQ0FBQyxDQUFDO1FBQ3pGLENBQUM7UUFFRCxJQUFhLE1BQU07WUFDbEIsT0FBTyx3QkFBc0IsQ0FBQyxFQUFFLENBQUM7UUFDbEMsQ0FBQztRQUVRLE9BQU87WUFDZixPQUFPLEdBQUcsQ0FBQyxRQUFRLENBQUMsc0JBQXNCLEVBQUUsb0JBQW9CLENBQUMsQ0FBQztRQUNuRSxDQUFDO1FBRVEsS0FBSyxDQUFDLE9BQU87WUFDckIsT0FBTyxJQUFJLENBQUMsZ0JBQWdCLENBQUM7UUFDOUIsQ0FBQztRQUVRLE9BQU8sQ0FBQyxVQUE2QztZQUM3RCxPQUFPLFVBQVUsWUFBWSx3QkFBc0IsQ0FBQztRQUNyRCxDQUFDO1FBRVEsT0FBTztZQUNmLElBQUksQ0FBQyxnQkFBZ0IsQ0FBQyxPQUFPLEVBQUUsQ0FBQztZQUVoQyxLQUFLLENBQUMsT0FBTyxFQUFFLENBQUM7UUFDakIsQ0FBQzs7SUFuQ1csd0RBQXNCO3FDQUF0QixzQkFBc0I7UUFTckIsV0FBQSxxQ0FBcUIsQ0FBQTtPQVR0QixzQkFBc0IsQ0FvQ2xDIn0=