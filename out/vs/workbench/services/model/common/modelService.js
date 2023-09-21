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
define(["require", "exports", "vs/editor/common/languages/languageConfigurationRegistry", "vs/editor/common/services/model", "vs/editor/common/services/modelService", "vs/editor/common/languages/language", "vs/editor/common/services/textResourceConfiguration", "vs/platform/configuration/common/configuration", "vs/platform/instantiation/common/extensions", "vs/platform/undoRedo/common/undoRedo", "vs/workbench/services/path/common/pathService"], function (require, exports, languageConfigurationRegistry_1, model_1, modelService_1, language_1, textResourceConfiguration_1, configuration_1, extensions_1, undoRedo_1, pathService_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.WorkbenchModelService = void 0;
    let WorkbenchModelService = class WorkbenchModelService extends modelService_1.ModelService {
        constructor(configurationService, resourcePropertiesService, undoRedoService, languageConfigurationService, languageService, _pathService) {
            super(configurationService, resourcePropertiesService, undoRedoService, languageService, languageConfigurationService);
            this._pathService = _pathService;
        }
        _schemaShouldMaintainUndoRedoElements(resource) {
            return (super._schemaShouldMaintainUndoRedoElements(resource)
                || resource.scheme === this._pathService.defaultUriScheme);
        }
    };
    exports.WorkbenchModelService = WorkbenchModelService;
    exports.WorkbenchModelService = WorkbenchModelService = __decorate([
        __param(0, configuration_1.IConfigurationService),
        __param(1, textResourceConfiguration_1.ITextResourcePropertiesService),
        __param(2, undoRedo_1.IUndoRedoService),
        __param(3, languageConfigurationRegistry_1.ILanguageConfigurationService),
        __param(4, language_1.ILanguageService),
        __param(5, pathService_1.IPathService)
    ], WorkbenchModelService);
    (0, extensions_1.registerSingleton)(model_1.IModelService, WorkbenchModelService, 1 /* InstantiationType.Delayed */);
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibW9kZWxTZXJ2aWNlLmpzIiwic291cmNlUm9vdCI6ImZpbGU6Ly8vd29ya3NwYWNlL2FwcGZsb3cvc3JjLyIsInNvdXJjZXMiOlsidnMvd29ya2JlbmNoL3NlcnZpY2VzL21vZGVsL2NvbW1vbi9tb2RlbFNlcnZpY2UudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7OztnR0FHZ0c7Ozs7Ozs7Ozs7Ozs7O0lBYXpGLElBQU0scUJBQXFCLEdBQTNCLE1BQU0scUJBQXNCLFNBQVEsMkJBQVk7UUFDdEQsWUFDd0Isb0JBQTJDLEVBQ2xDLHlCQUF5RCxFQUN2RSxlQUFpQyxFQUNwQiw0QkFBMkQsRUFDeEUsZUFBaUMsRUFDcEIsWUFBMEI7WUFFekQsS0FBSyxDQUFDLG9CQUFvQixFQUFFLHlCQUF5QixFQUFFLGVBQWUsRUFBRSxlQUFlLEVBQUUsNEJBQTRCLENBQUMsQ0FBQztZQUZ4RixpQkFBWSxHQUFaLFlBQVksQ0FBYztRQUcxRCxDQUFDO1FBRWtCLHFDQUFxQyxDQUFDLFFBQWE7WUFDckUsT0FBTyxDQUNOLEtBQUssQ0FBQyxxQ0FBcUMsQ0FBQyxRQUFRLENBQUM7bUJBQ2xELFFBQVEsQ0FBQyxNQUFNLEtBQUssSUFBSSxDQUFDLFlBQVksQ0FBQyxnQkFBZ0IsQ0FDekQsQ0FBQztRQUNILENBQUM7S0FDRCxDQUFBO0lBbEJZLHNEQUFxQjtvQ0FBckIscUJBQXFCO1FBRS9CLFdBQUEscUNBQXFCLENBQUE7UUFDckIsV0FBQSwwREFBOEIsQ0FBQTtRQUM5QixXQUFBLDJCQUFnQixDQUFBO1FBQ2hCLFdBQUEsNkRBQTZCLENBQUE7UUFDN0IsV0FBQSwyQkFBZ0IsQ0FBQTtRQUNoQixXQUFBLDBCQUFZLENBQUE7T0FQRixxQkFBcUIsQ0FrQmpDO0lBRUQsSUFBQSw4QkFBaUIsRUFBQyxxQkFBYSxFQUFFLHFCQUFxQixvQ0FBNEIsQ0FBQyJ9