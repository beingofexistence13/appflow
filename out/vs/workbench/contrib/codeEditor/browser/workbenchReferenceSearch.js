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
define(["require", "exports", "vs/editor/browser/editorExtensions", "vs/editor/browser/services/codeEditorService", "vs/editor/contrib/gotoSymbol/browser/peek/referencesController", "vs/platform/configuration/common/configuration", "vs/platform/contextkey/common/contextkey", "vs/platform/instantiation/common/instantiation", "vs/platform/notification/common/notification", "vs/platform/storage/common/storage"], function (require, exports, editorExtensions_1, codeEditorService_1, referencesController_1, configuration_1, contextkey_1, instantiation_1, notification_1, storage_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.WorkbenchReferencesController = void 0;
    let WorkbenchReferencesController = class WorkbenchReferencesController extends referencesController_1.ReferencesController {
        constructor(editor, contextKeyService, editorService, notificationService, instantiationService, storageService, configurationService) {
            super(false, editor, contextKeyService, editorService, notificationService, instantiationService, storageService, configurationService);
        }
    };
    exports.WorkbenchReferencesController = WorkbenchReferencesController;
    exports.WorkbenchReferencesController = WorkbenchReferencesController = __decorate([
        __param(1, contextkey_1.IContextKeyService),
        __param(2, codeEditorService_1.ICodeEditorService),
        __param(3, notification_1.INotificationService),
        __param(4, instantiation_1.IInstantiationService),
        __param(5, storage_1.IStorageService),
        __param(6, configuration_1.IConfigurationService)
    ], WorkbenchReferencesController);
    (0, editorExtensions_1.registerEditorContribution)(referencesController_1.ReferencesController.ID, WorkbenchReferencesController, 4 /* EditorContributionInstantiation.Lazy */);
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoid29ya2JlbmNoUmVmZXJlbmNlU2VhcmNoLmpzIiwic291cmNlUm9vdCI6ImZpbGU6Ly8vd29ya3NwYWNlL2FwcGZsb3cvc3JjLyIsInNvdXJjZXMiOlsidnMvd29ya2JlbmNoL2NvbnRyaWIvY29kZUVkaXRvci9icm93c2VyL3dvcmtiZW5jaFJlZmVyZW5jZVNlYXJjaC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7O2dHQUdnRzs7Ozs7Ozs7Ozs7Ozs7SUFZekYsSUFBTSw2QkFBNkIsR0FBbkMsTUFBTSw2QkFBOEIsU0FBUSwyQ0FBb0I7UUFFdEUsWUFDQyxNQUFtQixFQUNDLGlCQUFxQyxFQUNyQyxhQUFpQyxFQUMvQixtQkFBeUMsRUFDeEMsb0JBQTJDLEVBQ2pELGNBQStCLEVBQ3pCLG9CQUEyQztZQUVsRSxLQUFLLENBQ0osS0FBSyxFQUNMLE1BQU0sRUFDTixpQkFBaUIsRUFDakIsYUFBYSxFQUNiLG1CQUFtQixFQUNuQixvQkFBb0IsRUFDcEIsY0FBYyxFQUNkLG9CQUFvQixDQUNwQixDQUFDO1FBQ0gsQ0FBQztLQUNELENBQUE7SUF0Qlksc0VBQTZCOzRDQUE3Qiw2QkFBNkI7UUFJdkMsV0FBQSwrQkFBa0IsQ0FBQTtRQUNsQixXQUFBLHNDQUFrQixDQUFBO1FBQ2xCLFdBQUEsbUNBQW9CLENBQUE7UUFDcEIsV0FBQSxxQ0FBcUIsQ0FBQTtRQUNyQixXQUFBLHlCQUFlLENBQUE7UUFDZixXQUFBLHFDQUFxQixDQUFBO09BVFgsNkJBQTZCLENBc0J6QztJQUVELElBQUEsNkNBQTBCLEVBQUMsMkNBQW9CLENBQUMsRUFBRSxFQUFFLDZCQUE2QiwrQ0FBdUMsQ0FBQyJ9