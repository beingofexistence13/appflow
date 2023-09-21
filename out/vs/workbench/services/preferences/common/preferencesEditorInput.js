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
define(["require", "exports", "vs/base/common/network", "vs/base/common/uri", "vs/nls", "vs/workbench/common/editor/editorInput", "vs/workbench/services/preferences/common/preferences"], function (require, exports, network_1, uri_1, nls, editorInput_1, preferences_1) {
    "use strict";
    var SettingsEditor2Input_1;
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.SettingsEditor2Input = void 0;
    let SettingsEditor2Input = class SettingsEditor2Input extends editorInput_1.EditorInput {
        static { SettingsEditor2Input_1 = this; }
        static { this.ID = 'workbench.input.settings2'; }
        constructor(_preferencesService) {
            super();
            this.resource = uri_1.URI.from({
                scheme: network_1.Schemas.vscodeSettings,
                path: `settingseditor`
            });
            this._settingsModel = _preferencesService.createSettings2EditorModel();
        }
        matches(otherInput) {
            return super.matches(otherInput) || otherInput instanceof SettingsEditor2Input_1;
        }
        get typeId() {
            return SettingsEditor2Input_1.ID;
        }
        getName() {
            return nls.localize('settingsEditor2InputName', "Settings");
        }
        async resolve() {
            return this._settingsModel;
        }
        dispose() {
            this._settingsModel.dispose();
            super.dispose();
        }
    };
    exports.SettingsEditor2Input = SettingsEditor2Input;
    exports.SettingsEditor2Input = SettingsEditor2Input = SettingsEditor2Input_1 = __decorate([
        __param(0, preferences_1.IPreferencesService)
    ], SettingsEditor2Input);
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicHJlZmVyZW5jZXNFZGl0b3JJbnB1dC5qcyIsInNvdXJjZVJvb3QiOiJmaWxlOi8vL3dvcmtzcGFjZS9hcHBmbG93L3NyYy8iLCJzb3VyY2VzIjpbInZzL3dvcmtiZW5jaC9zZXJ2aWNlcy9wcmVmZXJlbmNlcy9jb21tb24vcHJlZmVyZW5jZXNFZGl0b3JJbnB1dC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7O2dHQUdnRzs7Ozs7Ozs7Ozs7Ozs7O0lBVXpGLElBQU0sb0JBQW9CLEdBQTFCLE1BQU0sb0JBQXFCLFNBQVEseUJBQVc7O2lCQUVwQyxPQUFFLEdBQVcsMkJBQTJCLEFBQXRDLENBQXVDO1FBUXpELFlBQ3NCLG1CQUF3QztZQUU3RCxLQUFLLEVBQUUsQ0FBQztZQVJBLGFBQVEsR0FBUSxTQUFHLENBQUMsSUFBSSxDQUFDO2dCQUNqQyxNQUFNLEVBQUUsaUJBQU8sQ0FBQyxjQUFjO2dCQUM5QixJQUFJLEVBQUUsZ0JBQWdCO2FBQ3RCLENBQUMsQ0FBQztZQU9GLElBQUksQ0FBQyxjQUFjLEdBQUcsbUJBQW1CLENBQUMsMEJBQTBCLEVBQUUsQ0FBQztRQUN4RSxDQUFDO1FBRVEsT0FBTyxDQUFDLFVBQTZDO1lBQzdELE9BQU8sS0FBSyxDQUFDLE9BQU8sQ0FBQyxVQUFVLENBQUMsSUFBSSxVQUFVLFlBQVksc0JBQW9CLENBQUM7UUFDaEYsQ0FBQztRQUVELElBQWEsTUFBTTtZQUNsQixPQUFPLHNCQUFvQixDQUFDLEVBQUUsQ0FBQztRQUNoQyxDQUFDO1FBRVEsT0FBTztZQUNmLE9BQU8sR0FBRyxDQUFDLFFBQVEsQ0FBQywwQkFBMEIsRUFBRSxVQUFVLENBQUMsQ0FBQztRQUM3RCxDQUFDO1FBRVEsS0FBSyxDQUFDLE9BQU87WUFDckIsT0FBTyxJQUFJLENBQUMsY0FBYyxDQUFDO1FBQzVCLENBQUM7UUFFUSxPQUFPO1lBQ2YsSUFBSSxDQUFDLGNBQWMsQ0FBQyxPQUFPLEVBQUUsQ0FBQztZQUU5QixLQUFLLENBQUMsT0FBTyxFQUFFLENBQUM7UUFDakIsQ0FBQzs7SUF0Q1csb0RBQW9CO21DQUFwQixvQkFBb0I7UUFXOUIsV0FBQSxpQ0FBbUIsQ0FBQTtPQVhULG9CQUFvQixDQXVDaEMifQ==