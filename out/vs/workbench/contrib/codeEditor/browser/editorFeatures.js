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
define(["require", "exports", "vs/base/common/errors", "vs/base/common/lifecycle", "vs/editor/browser/services/codeEditorService", "vs/editor/common/editorFeatures", "vs/platform/instantiation/common/instantiation", "vs/platform/registry/common/platform", "vs/workbench/common/contributions"], function (require, exports, errors_1, lifecycle_1, codeEditorService_1, editorFeatures_1, instantiation_1, platform_1, contributions_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    let EditorFeaturesInstantiator = class EditorFeaturesInstantiator extends lifecycle_1.Disposable {
        constructor(codeEditorService, _instantiationService) {
            super();
            this._instantiationService = _instantiationService;
            this._instantiated = false;
            this._register(codeEditorService.onWillCreateCodeEditor(() => this._instantiate()));
            this._register(codeEditorService.onWillCreateDiffEditor(() => this._instantiate()));
            if (codeEditorService.listCodeEditors().length > 0 || codeEditorService.listDiffEditors().length > 0) {
                this._instantiate();
            }
        }
        _instantiate() {
            if (this._instantiated) {
                return;
            }
            this._instantiated = true;
            // Instantiate all editor features
            const editorFeatures = (0, editorFeatures_1.getEditorFeatures)();
            for (const feature of editorFeatures) {
                try {
                    const instance = this._instantiationService.createInstance(feature);
                    if (typeof instance.dispose === 'function') {
                        this._register(instance);
                    }
                }
                catch (err) {
                    (0, errors_1.onUnexpectedError)(err);
                }
            }
        }
    };
    EditorFeaturesInstantiator = __decorate([
        __param(0, codeEditorService_1.ICodeEditorService),
        __param(1, instantiation_1.IInstantiationService)
    ], EditorFeaturesInstantiator);
    const workbenchRegistry = platform_1.Registry.as(contributions_1.Extensions.Workbench);
    workbenchRegistry.registerWorkbenchContribution(EditorFeaturesInstantiator, 2 /* LifecyclePhase.Ready */);
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZWRpdG9yRmVhdHVyZXMuanMiLCJzb3VyY2VSb290IjoiZmlsZTovLy93b3Jrc3BhY2UvYXBwZmxvdy9zcmMvIiwic291cmNlcyI6WyJ2cy93b3JrYmVuY2gvY29udHJpYi9jb2RlRWRpdG9yL2Jyb3dzZXIvZWRpdG9yRmVhdHVyZXMudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7OztnR0FHZ0c7Ozs7Ozs7Ozs7Ozs7SUFXaEcsSUFBTSwwQkFBMEIsR0FBaEMsTUFBTSwwQkFBMkIsU0FBUSxzQkFBVTtRQUlsRCxZQUNxQixpQkFBcUMsRUFDbEMscUJBQTZEO1lBRXBGLEtBQUssRUFBRSxDQUFDO1lBRmdDLDBCQUFxQixHQUFyQixxQkFBcUIsQ0FBdUI7WUFKN0Usa0JBQWEsR0FBRyxLQUFLLENBQUM7WUFRN0IsSUFBSSxDQUFDLFNBQVMsQ0FBQyxpQkFBaUIsQ0FBQyxzQkFBc0IsQ0FBQyxHQUFHLEVBQUUsQ0FBQyxJQUFJLENBQUMsWUFBWSxFQUFFLENBQUMsQ0FBQyxDQUFDO1lBQ3BGLElBQUksQ0FBQyxTQUFTLENBQUMsaUJBQWlCLENBQUMsc0JBQXNCLENBQUMsR0FBRyxFQUFFLENBQUMsSUFBSSxDQUFDLFlBQVksRUFBRSxDQUFDLENBQUMsQ0FBQztZQUNwRixJQUFJLGlCQUFpQixDQUFDLGVBQWUsRUFBRSxDQUFDLE1BQU0sR0FBRyxDQUFDLElBQUksaUJBQWlCLENBQUMsZUFBZSxFQUFFLENBQUMsTUFBTSxHQUFHLENBQUMsRUFBRTtnQkFDckcsSUFBSSxDQUFDLFlBQVksRUFBRSxDQUFDO2FBQ3BCO1FBQ0YsQ0FBQztRQUVPLFlBQVk7WUFDbkIsSUFBSSxJQUFJLENBQUMsYUFBYSxFQUFFO2dCQUN2QixPQUFPO2FBQ1A7WUFDRCxJQUFJLENBQUMsYUFBYSxHQUFHLElBQUksQ0FBQztZQUUxQixrQ0FBa0M7WUFDbEMsTUFBTSxjQUFjLEdBQUcsSUFBQSxrQ0FBaUIsR0FBRSxDQUFDO1lBQzNDLEtBQUssTUFBTSxPQUFPLElBQUksY0FBYyxFQUFFO2dCQUNyQyxJQUFJO29CQUNILE1BQU0sUUFBUSxHQUFHLElBQUksQ0FBQyxxQkFBcUIsQ0FBQyxjQUFjLENBQUMsT0FBTyxDQUFDLENBQUM7b0JBQ3BFLElBQUksT0FBcUIsUUFBUyxDQUFDLE9BQU8sS0FBSyxVQUFVLEVBQUU7d0JBQzFELElBQUksQ0FBQyxTQUFTLENBQWUsUUFBUyxDQUFDLENBQUM7cUJBQ3hDO2lCQUNEO2dCQUFDLE9BQU8sR0FBRyxFQUFFO29CQUNiLElBQUEsMEJBQWlCLEVBQUMsR0FBRyxDQUFDLENBQUM7aUJBQ3ZCO2FBQ0Q7UUFDRixDQUFDO0tBQ0QsQ0FBQTtJQXBDSywwQkFBMEI7UUFLN0IsV0FBQSxzQ0FBa0IsQ0FBQTtRQUNsQixXQUFBLHFDQUFxQixDQUFBO09BTmxCLDBCQUEwQixDQW9DL0I7SUFFRCxNQUFNLGlCQUFpQixHQUFHLG1CQUFRLENBQUMsRUFBRSxDQUFrQywwQkFBVSxDQUFDLFNBQVMsQ0FBQyxDQUFDO0lBQzdGLGlCQUFpQixDQUFDLDZCQUE2QixDQUFDLDBCQUEwQiwrQkFBdUIsQ0FBQyJ9