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
define(["require", "exports", "vs/platform/keybinding/common/keybinding", "vs/platform/userDataSync/common/userDataSync", "vs/platform/instantiation/common/extensions", "vs/editor/common/services/resolverService", "vs/editor/common/services/textResourceConfiguration"], function (require, exports, keybinding_1, userDataSync_1, extensions_1, resolverService_1, textResourceConfiguration_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    let UserDataSyncUtilService = class UserDataSyncUtilService {
        constructor(keybindingsService, textModelService, textResourcePropertiesService, textResourceConfigurationService) {
            this.keybindingsService = keybindingsService;
            this.textModelService = textModelService;
            this.textResourcePropertiesService = textResourcePropertiesService;
            this.textResourceConfigurationService = textResourceConfigurationService;
        }
        async resolveDefaultIgnoredSettings() {
            return (0, userDataSync_1.getDefaultIgnoredSettings)();
        }
        async resolveUserBindings(userBindings) {
            const keys = {};
            for (const userbinding of userBindings) {
                keys[userbinding] = this.keybindingsService.resolveUserBinding(userbinding).map(part => part.getUserSettingsLabel()).join(' ');
            }
            return keys;
        }
        async resolveFormattingOptions(resource) {
            try {
                const modelReference = await this.textModelService.createModelReference(resource);
                const { insertSpaces, tabSize } = modelReference.object.textEditorModel.getOptions();
                const eol = modelReference.object.textEditorModel.getEOL();
                modelReference.dispose();
                return { eol, insertSpaces, tabSize };
            }
            catch (e) {
            }
            return {
                eol: this.textResourcePropertiesService.getEOL(resource),
                insertSpaces: !!this.textResourceConfigurationService.getValue(resource, 'editor.insertSpaces'),
                tabSize: this.textResourceConfigurationService.getValue(resource, 'editor.tabSize')
            };
        }
    };
    UserDataSyncUtilService = __decorate([
        __param(0, keybinding_1.IKeybindingService),
        __param(1, resolverService_1.ITextModelService),
        __param(2, textResourceConfiguration_1.ITextResourcePropertiesService),
        __param(3, textResourceConfiguration_1.ITextResourceConfigurationService)
    ], UserDataSyncUtilService);
    (0, extensions_1.registerSingleton)(userDataSync_1.IUserDataSyncUtilService, UserDataSyncUtilService, 1 /* InstantiationType.Delayed */);
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidXNlckRhdGFTeW5jVXRpbC5qcyIsInNvdXJjZVJvb3QiOiJmaWxlOi8vL3dvcmtzcGFjZS9hcHBmbG93L3NyYy8iLCJzb3VyY2VzIjpbInZzL3dvcmtiZW5jaC9zZXJ2aWNlcy91c2VyRGF0YVN5bmMvY29tbW9uL3VzZXJEYXRhU3luY1V0aWwudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7OztnR0FHZ0c7Ozs7Ozs7Ozs7Ozs7SUFXaEcsSUFBTSx1QkFBdUIsR0FBN0IsTUFBTSx1QkFBdUI7UUFJNUIsWUFDc0Msa0JBQXNDLEVBQ3ZDLGdCQUFtQyxFQUN0Qiw2QkFBNkQsRUFDMUQsZ0NBQW1FO1lBSGxGLHVCQUFrQixHQUFsQixrQkFBa0IsQ0FBb0I7WUFDdkMscUJBQWdCLEdBQWhCLGdCQUFnQixDQUFtQjtZQUN0QixrQ0FBNkIsR0FBN0IsNkJBQTZCLENBQWdDO1lBQzFELHFDQUFnQyxHQUFoQyxnQ0FBZ0MsQ0FBbUM7UUFDcEgsQ0FBQztRQUVMLEtBQUssQ0FBQyw2QkFBNkI7WUFDbEMsT0FBTyxJQUFBLHdDQUF5QixHQUFFLENBQUM7UUFDcEMsQ0FBQztRQUVELEtBQUssQ0FBQyxtQkFBbUIsQ0FBQyxZQUFzQjtZQUMvQyxNQUFNLElBQUksR0FBOEIsRUFBRSxDQUFDO1lBQzNDLEtBQUssTUFBTSxXQUFXLElBQUksWUFBWSxFQUFFO2dCQUN2QyxJQUFJLENBQUMsV0FBVyxDQUFDLEdBQUcsSUFBSSxDQUFDLGtCQUFrQixDQUFDLGtCQUFrQixDQUFDLFdBQVcsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxJQUFJLENBQUMsRUFBRSxDQUFDLElBQUksQ0FBQyxvQkFBb0IsRUFBRSxDQUFDLENBQUMsSUFBSSxDQUFDLEdBQUcsQ0FBQyxDQUFDO2FBQy9IO1lBQ0QsT0FBTyxJQUFJLENBQUM7UUFDYixDQUFDO1FBRUQsS0FBSyxDQUFDLHdCQUF3QixDQUFDLFFBQWE7WUFDM0MsSUFBSTtnQkFDSCxNQUFNLGNBQWMsR0FBRyxNQUFNLElBQUksQ0FBQyxnQkFBZ0IsQ0FBQyxvQkFBb0IsQ0FBQyxRQUFRLENBQUMsQ0FBQztnQkFDbEYsTUFBTSxFQUFFLFlBQVksRUFBRSxPQUFPLEVBQUUsR0FBRyxjQUFjLENBQUMsTUFBTSxDQUFDLGVBQWUsQ0FBQyxVQUFVLEVBQUUsQ0FBQztnQkFDckYsTUFBTSxHQUFHLEdBQUcsY0FBYyxDQUFDLE1BQU0sQ0FBQyxlQUFlLENBQUMsTUFBTSxFQUFFLENBQUM7Z0JBQzNELGNBQWMsQ0FBQyxPQUFPLEVBQUUsQ0FBQztnQkFDekIsT0FBTyxFQUFFLEdBQUcsRUFBRSxZQUFZLEVBQUUsT0FBTyxFQUFFLENBQUM7YUFDdEM7WUFBQyxPQUFPLENBQUMsRUFBRTthQUNYO1lBQ0QsT0FBTztnQkFDTixHQUFHLEVBQUUsSUFBSSxDQUFDLDZCQUE2QixDQUFDLE1BQU0sQ0FBQyxRQUFRLENBQUM7Z0JBQ3hELFlBQVksRUFBRSxDQUFDLENBQUMsSUFBSSxDQUFDLGdDQUFnQyxDQUFDLFFBQVEsQ0FBQyxRQUFRLEVBQUUscUJBQXFCLENBQUM7Z0JBQy9GLE9BQU8sRUFBRSxJQUFJLENBQUMsZ0NBQWdDLENBQUMsUUFBUSxDQUFDLFFBQVEsRUFBRSxnQkFBZ0IsQ0FBQzthQUNuRixDQUFDO1FBQ0gsQ0FBQztLQUVELENBQUE7SUF2Q0ssdUJBQXVCO1FBSzFCLFdBQUEsK0JBQWtCLENBQUE7UUFDbEIsV0FBQSxtQ0FBaUIsQ0FBQTtRQUNqQixXQUFBLDBEQUE4QixDQUFBO1FBQzlCLFdBQUEsNkRBQWlDLENBQUE7T0FSOUIsdUJBQXVCLENBdUM1QjtJQUVELElBQUEsOEJBQWlCLEVBQUMsdUNBQXdCLEVBQUUsdUJBQXVCLG9DQUE0QixDQUFDIn0=