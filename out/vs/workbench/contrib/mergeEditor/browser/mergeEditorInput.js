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
define(["require", "exports", "vs/base/common/assert", "vs/base/common/observable", "vs/base/common/resources", "vs/base/common/types", "vs/nls", "vs/platform/configuration/common/configuration", "vs/platform/files/common/files", "vs/platform/instantiation/common/instantiation", "vs/platform/label/common/label", "vs/workbench/common/editor", "vs/workbench/common/editor/textResourceEditorInput", "vs/workbench/contrib/mergeEditor/browser/mergeEditorInputModel", "vs/workbench/contrib/mergeEditor/browser/telemetry", "vs/workbench/services/editor/common/editorService", "vs/workbench/services/filesConfiguration/common/filesConfigurationService", "vs/workbench/services/textfile/common/textfiles"], function (require, exports, assert_1, observable_1, resources_1, types_1, nls_1, configuration_1, files_1, instantiation_1, label_1, editor_1, textResourceEditorInput_1, mergeEditorInputModel_1, telemetry_1, editorService_1, filesConfigurationService_1, textfiles_1) {
    "use strict";
    var MergeEditorInput_1;
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.MergeEditorInput = exports.MergeEditorInputData = void 0;
    class MergeEditorInputData {
        constructor(uri, title, detail, description) {
            this.uri = uri;
            this.title = title;
            this.detail = detail;
            this.description = description;
        }
    }
    exports.MergeEditorInputData = MergeEditorInputData;
    let MergeEditorInput = class MergeEditorInput extends textResourceEditorInput_1.AbstractTextResourceEditorInput {
        static { MergeEditorInput_1 = this; }
        static { this.ID = 'mergeEditor.Input'; }
        get useWorkingCopy() {
            return this.configurationService.getValue('mergeEditor.useWorkingCopy') ?? false;
        }
        constructor(base, input1, input2, result, _instaService, editorService, textFileService, labelService, fileService, configurationService, filesConfigurationService) {
            super(result, undefined, editorService, textFileService, labelService, fileService, filesConfigurationService);
            this.base = base;
            this.input1 = input1;
            this.input2 = input2;
            this.result = result;
            this._instaService = _instaService;
            this.configurationService = configurationService;
            this.closeHandler = {
                showConfirm: () => this._inputModel?.shouldConfirmClose() ?? false,
                confirm: async (editors) => {
                    (0, assert_1.assertFn)(() => editors.every(e => e.editor instanceof MergeEditorInput_1));
                    const inputModels = editors.map(e => e.editor._inputModel).filter(types_1.isDefined);
                    return await this._inputModel.confirmClose(inputModels);
                },
            };
            this.mergeEditorModeFactory = this._instaService.createInstance(this.useWorkingCopy
                ? mergeEditorInputModel_1.TempFileMergeEditorModeFactory
                : mergeEditorInputModel_1.WorkspaceMergeEditorModeFactory, this._instaService.createInstance(telemetry_1.MergeEditorTelemetry));
        }
        dispose() {
            super.dispose();
        }
        get typeId() {
            return MergeEditorInput_1.ID;
        }
        get editorId() {
            return editor_1.DEFAULT_EDITOR_ASSOCIATION.id;
        }
        get capabilities() {
            let capabilities = super.capabilities | 256 /* EditorInputCapabilities.MultipleEditors */;
            if (this.useWorkingCopy) {
                capabilities |= 4 /* EditorInputCapabilities.Untitled */;
            }
            return capabilities;
        }
        getName() {
            return (0, nls_1.localize)('name', "Merging: {0}", super.getName());
        }
        async resolve() {
            if (!this._inputModel) {
                const inputModel = this._register(await this.mergeEditorModeFactory.createInputModel({
                    base: this.base,
                    input1: this.input1,
                    input2: this.input2,
                    result: this.result,
                }));
                this._inputModel = inputModel;
                this._register((0, observable_1.autorun)(reader => {
                    /** @description fire dirty event */
                    inputModel.isDirty.read(reader);
                    this._onDidChangeDirty.fire();
                }));
                await this._inputModel.model.onInitialized;
            }
            return this._inputModel;
        }
        async accept() {
            await this._inputModel?.accept();
        }
        async save(group, options) {
            await this._inputModel?.save(options);
            return undefined;
        }
        toUntyped() {
            return {
                input1: { resource: this.input1.uri, label: this.input1.title, description: this.input1.description, detail: this.input1.detail },
                input2: { resource: this.input2.uri, label: this.input2.title, description: this.input2.description, detail: this.input2.detail },
                base: { resource: this.base },
                result: { resource: this.result },
                options: {
                    override: this.typeId
                }
            };
        }
        matches(otherInput) {
            if (this === otherInput) {
                return true;
            }
            if (otherInput instanceof MergeEditorInput_1) {
                return (0, resources_1.isEqual)(this.base, otherInput.base)
                    && (0, resources_1.isEqual)(this.input1.uri, otherInput.input1.uri)
                    && (0, resources_1.isEqual)(this.input2.uri, otherInput.input2.uri)
                    && (0, resources_1.isEqual)(this.result, otherInput.result);
            }
            if ((0, editor_1.isResourceMergeEditorInput)(otherInput)) {
                return (this.editorId === otherInput.options?.override || otherInput.options?.override === undefined)
                    && (0, resources_1.isEqual)(this.base, otherInput.base.resource)
                    && (0, resources_1.isEqual)(this.input1.uri, otherInput.input1.resource)
                    && (0, resources_1.isEqual)(this.input2.uri, otherInput.input2.resource)
                    && (0, resources_1.isEqual)(this.result, otherInput.result.resource);
            }
            return false;
        }
        async revert(group, options) {
            return this._inputModel?.revert(options);
        }
        // ---- FileEditorInput
        isDirty() {
            return this._inputModel?.isDirty.get() ?? false;
        }
        setLanguageId(languageId, source) {
            this._inputModel?.model.setLanguageId(languageId, source);
        }
    };
    exports.MergeEditorInput = MergeEditorInput;
    exports.MergeEditorInput = MergeEditorInput = MergeEditorInput_1 = __decorate([
        __param(4, instantiation_1.IInstantiationService),
        __param(5, editorService_1.IEditorService),
        __param(6, textfiles_1.ITextFileService),
        __param(7, label_1.ILabelService),
        __param(8, files_1.IFileService),
        __param(9, configuration_1.IConfigurationService),
        __param(10, filesConfigurationService_1.IFilesConfigurationService)
    ], MergeEditorInput);
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibWVyZ2VFZGl0b3JJbnB1dC5qcyIsInNvdXJjZVJvb3QiOiJmaWxlOi8vL3dvcmtzcGFjZS9hcHBmbG93L3NyYy8iLCJzb3VyY2VzIjpbInZzL3dvcmtiZW5jaC9jb250cmliL21lcmdlRWRpdG9yL2Jyb3dzZXIvbWVyZ2VFZGl0b3JJbnB1dC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7O2dHQUdnRzs7Ozs7Ozs7Ozs7Ozs7O0lBcUJoRyxNQUFhLG9CQUFvQjtRQUNoQyxZQUNVLEdBQVEsRUFDUixLQUF5QixFQUN6QixNQUEwQixFQUMxQixXQUErQjtZQUgvQixRQUFHLEdBQUgsR0FBRyxDQUFLO1lBQ1IsVUFBSyxHQUFMLEtBQUssQ0FBb0I7WUFDekIsV0FBTSxHQUFOLE1BQU0sQ0FBb0I7WUFDMUIsZ0JBQVcsR0FBWCxXQUFXLENBQW9CO1FBQ3JDLENBQUM7S0FDTDtJQVBELG9EQU9DO0lBRU0sSUFBTSxnQkFBZ0IsR0FBdEIsTUFBTSxnQkFBaUIsU0FBUSx5REFBK0I7O2lCQUNwRCxPQUFFLEdBQUcsbUJBQW1CLEFBQXRCLENBQXVCO1FBYXpDLElBQVksY0FBYztZQUN6QixPQUFPLElBQUksQ0FBQyxvQkFBb0IsQ0FBQyxRQUFRLENBQUMsNEJBQTRCLENBQUMsSUFBSSxLQUFLLENBQUM7UUFDbEYsQ0FBQztRQUVELFlBQ2lCLElBQVMsRUFDVCxNQUE0QixFQUM1QixNQUE0QixFQUM1QixNQUFXLEVBQ0osYUFBcUQsRUFDNUQsYUFBNkIsRUFDM0IsZUFBaUMsRUFDcEMsWUFBMkIsRUFDNUIsV0FBeUIsRUFDaEIsb0JBQTRELEVBQ3ZELHlCQUFxRDtZQUVqRixLQUFLLENBQUMsTUFBTSxFQUFFLFNBQVMsRUFBRSxhQUFhLEVBQUUsZUFBZSxFQUFFLFlBQVksRUFBRSxXQUFXLEVBQUUseUJBQXlCLENBQUMsQ0FBQztZQVovRixTQUFJLEdBQUosSUFBSSxDQUFLO1lBQ1QsV0FBTSxHQUFOLE1BQU0sQ0FBc0I7WUFDNUIsV0FBTSxHQUFOLE1BQU0sQ0FBc0I7WUFDNUIsV0FBTSxHQUFOLE1BQU0sQ0FBSztZQUNhLGtCQUFhLEdBQWIsYUFBYSxDQUF1QjtZQUtwQyx5QkFBb0IsR0FBcEIsb0JBQW9CLENBQXVCO1lBdkIzRSxpQkFBWSxHQUF3QjtnQkFDNUMsV0FBVyxFQUFFLEdBQUcsRUFBRSxDQUFDLElBQUksQ0FBQyxXQUFXLEVBQUUsa0JBQWtCLEVBQUUsSUFBSSxLQUFLO2dCQUNsRSxPQUFPLEVBQUUsS0FBSyxFQUFFLE9BQU8sRUFBRSxFQUFFO29CQUMxQixJQUFBLGlCQUFRLEVBQUMsR0FBRyxFQUFFLENBQUMsT0FBTyxDQUFDLEtBQUssQ0FBQyxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQyxNQUFNLFlBQVksa0JBQWdCLENBQUMsQ0FBQyxDQUFDO29CQUN6RSxNQUFNLFdBQVcsR0FBRyxPQUFPLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUUsQ0FBQyxDQUFDLE1BQTJCLENBQUMsV0FBVyxDQUFDLENBQUMsTUFBTSxDQUFDLGlCQUFTLENBQUMsQ0FBQztvQkFDbkcsT0FBTyxNQUFNLElBQUksQ0FBQyxXQUFZLENBQUMsWUFBWSxDQUFDLFdBQVcsQ0FBQyxDQUFDO2dCQUMxRCxDQUFDO2FBQ0QsQ0FBQztZQThDZSwyQkFBc0IsR0FBRyxJQUFJLENBQUMsYUFBYSxDQUFDLGNBQWMsQ0FDMUUsSUFBSSxDQUFDLGNBQWM7Z0JBQ2xCLENBQUMsQ0FBQyxzREFBOEI7Z0JBQ2hDLENBQUMsQ0FBQyx1REFBK0IsRUFDbEMsSUFBSSxDQUFDLGFBQWEsQ0FBQyxjQUFjLENBQUMsZ0NBQW9CLENBQUMsQ0FDdkQsQ0FBQztRQS9CRixDQUFDO1FBRVEsT0FBTztZQUNmLEtBQUssQ0FBQyxPQUFPLEVBQUUsQ0FBQztRQUNqQixDQUFDO1FBRUQsSUFBYSxNQUFNO1lBQ2xCLE9BQU8sa0JBQWdCLENBQUMsRUFBRSxDQUFDO1FBQzVCLENBQUM7UUFFRCxJQUFhLFFBQVE7WUFDcEIsT0FBTyxtQ0FBMEIsQ0FBQyxFQUFFLENBQUM7UUFDdEMsQ0FBQztRQUVELElBQWEsWUFBWTtZQUN4QixJQUFJLFlBQVksR0FBRyxLQUFLLENBQUMsWUFBWSxvREFBMEMsQ0FBQztZQUNoRixJQUFJLElBQUksQ0FBQyxjQUFjLEVBQUU7Z0JBQ3hCLFlBQVksNENBQW9DLENBQUM7YUFDakQ7WUFDRCxPQUFPLFlBQVksQ0FBQztRQUNyQixDQUFDO1FBRVEsT0FBTztZQUNmLE9BQU8sSUFBQSxjQUFRLEVBQUMsTUFBTSxFQUFFLGNBQWMsRUFBRSxLQUFLLENBQUMsT0FBTyxFQUFFLENBQUMsQ0FBQztRQUMxRCxDQUFDO1FBU1EsS0FBSyxDQUFDLE9BQU87WUFDckIsSUFBSSxDQUFDLElBQUksQ0FBQyxXQUFXLEVBQUU7Z0JBQ3RCLE1BQU0sVUFBVSxHQUFHLElBQUksQ0FBQyxTQUFTLENBQUMsTUFBTSxJQUFJLENBQUMsc0JBQXNCLENBQUMsZ0JBQWdCLENBQUM7b0JBQ3BGLElBQUksRUFBRSxJQUFJLENBQUMsSUFBSTtvQkFDZixNQUFNLEVBQUUsSUFBSSxDQUFDLE1BQU07b0JBQ25CLE1BQU0sRUFBRSxJQUFJLENBQUMsTUFBTTtvQkFDbkIsTUFBTSxFQUFFLElBQUksQ0FBQyxNQUFNO2lCQUNuQixDQUFDLENBQUMsQ0FBQztnQkFDSixJQUFJLENBQUMsV0FBVyxHQUFHLFVBQVUsQ0FBQztnQkFFOUIsSUFBSSxDQUFDLFNBQVMsQ0FBQyxJQUFBLG9CQUFPLEVBQUMsTUFBTSxDQUFDLEVBQUU7b0JBQy9CLG9DQUFvQztvQkFDcEMsVUFBVSxDQUFDLE9BQU8sQ0FBQyxJQUFJLENBQUMsTUFBTSxDQUFDLENBQUM7b0JBQ2hDLElBQUksQ0FBQyxpQkFBaUIsQ0FBQyxJQUFJLEVBQUUsQ0FBQztnQkFDL0IsQ0FBQyxDQUFDLENBQUMsQ0FBQztnQkFFSixNQUFNLElBQUksQ0FBQyxXQUFXLENBQUMsS0FBSyxDQUFDLGFBQWEsQ0FBQzthQUMzQztZQUVELE9BQU8sSUFBSSxDQUFDLFdBQVcsQ0FBQztRQUN6QixDQUFDO1FBRU0sS0FBSyxDQUFDLE1BQU07WUFDbEIsTUFBTSxJQUFJLENBQUMsV0FBVyxFQUFFLE1BQU0sRUFBRSxDQUFDO1FBQ2xDLENBQUM7UUFFUSxLQUFLLENBQUMsSUFBSSxDQUFDLEtBQWEsRUFBRSxPQUEwQztZQUM1RSxNQUFNLElBQUksQ0FBQyxXQUFXLEVBQUUsSUFBSSxDQUFDLE9BQU8sQ0FBQyxDQUFDO1lBQ3RDLE9BQU8sU0FBUyxDQUFDO1FBQ2xCLENBQUM7UUFFUSxTQUFTO1lBQ2pCLE9BQU87Z0JBQ04sTUFBTSxFQUFFLEVBQUUsUUFBUSxFQUFFLElBQUksQ0FBQyxNQUFNLENBQUMsR0FBRyxFQUFFLEtBQUssRUFBRSxJQUFJLENBQUMsTUFBTSxDQUFDLEtBQUssRUFBRSxXQUFXLEVBQUUsSUFBSSxDQUFDLE1BQU0sQ0FBQyxXQUFXLEVBQUUsTUFBTSxFQUFFLElBQUksQ0FBQyxNQUFNLENBQUMsTUFBTSxFQUFFO2dCQUNqSSxNQUFNLEVBQUUsRUFBRSxRQUFRLEVBQUUsSUFBSSxDQUFDLE1BQU0sQ0FBQyxHQUFHLEVBQUUsS0FBSyxFQUFFLElBQUksQ0FBQyxNQUFNLENBQUMsS0FBSyxFQUFFLFdBQVcsRUFBRSxJQUFJLENBQUMsTUFBTSxDQUFDLFdBQVcsRUFBRSxNQUFNLEVBQUUsSUFBSSxDQUFDLE1BQU0sQ0FBQyxNQUFNLEVBQUU7Z0JBQ2pJLElBQUksRUFBRSxFQUFFLFFBQVEsRUFBRSxJQUFJLENBQUMsSUFBSSxFQUFFO2dCQUM3QixNQUFNLEVBQUUsRUFBRSxRQUFRLEVBQUUsSUFBSSxDQUFDLE1BQU0sRUFBRTtnQkFDakMsT0FBTyxFQUFFO29CQUNSLFFBQVEsRUFBRSxJQUFJLENBQUMsTUFBTTtpQkFDckI7YUFDRCxDQUFDO1FBQ0gsQ0FBQztRQUVRLE9BQU8sQ0FBQyxVQUE2QztZQUM3RCxJQUFJLElBQUksS0FBSyxVQUFVLEVBQUU7Z0JBQ3hCLE9BQU8sSUFBSSxDQUFDO2FBQ1o7WUFDRCxJQUFJLFVBQVUsWUFBWSxrQkFBZ0IsRUFBRTtnQkFDM0MsT0FBTyxJQUFBLG1CQUFPLEVBQUMsSUFBSSxDQUFDLElBQUksRUFBRSxVQUFVLENBQUMsSUFBSSxDQUFDO3VCQUN0QyxJQUFBLG1CQUFPLEVBQUMsSUFBSSxDQUFDLE1BQU0sQ0FBQyxHQUFHLEVBQUUsVUFBVSxDQUFDLE1BQU0sQ0FBQyxHQUFHLENBQUM7dUJBQy9DLElBQUEsbUJBQU8sRUFBQyxJQUFJLENBQUMsTUFBTSxDQUFDLEdBQUcsRUFBRSxVQUFVLENBQUMsTUFBTSxDQUFDLEdBQUcsQ0FBQzt1QkFDL0MsSUFBQSxtQkFBTyxFQUFDLElBQUksQ0FBQyxNQUFNLEVBQUUsVUFBVSxDQUFDLE1BQU0sQ0FBQyxDQUFDO2FBQzVDO1lBQ0QsSUFBSSxJQUFBLG1DQUEwQixFQUFDLFVBQVUsQ0FBQyxFQUFFO2dCQUMzQyxPQUFPLENBQUMsSUFBSSxDQUFDLFFBQVEsS0FBSyxVQUFVLENBQUMsT0FBTyxFQUFFLFFBQVEsSUFBSSxVQUFVLENBQUMsT0FBTyxFQUFFLFFBQVEsS0FBSyxTQUFTLENBQUM7dUJBQ2pHLElBQUEsbUJBQU8sRUFBQyxJQUFJLENBQUMsSUFBSSxFQUFFLFVBQVUsQ0FBQyxJQUFJLENBQUMsUUFBUSxDQUFDO3VCQUM1QyxJQUFBLG1CQUFPLEVBQUMsSUFBSSxDQUFDLE1BQU0sQ0FBQyxHQUFHLEVBQUUsVUFBVSxDQUFDLE1BQU0sQ0FBQyxRQUFRLENBQUM7dUJBQ3BELElBQUEsbUJBQU8sRUFBQyxJQUFJLENBQUMsTUFBTSxDQUFDLEdBQUcsRUFBRSxVQUFVLENBQUMsTUFBTSxDQUFDLFFBQVEsQ0FBQzt1QkFDcEQsSUFBQSxtQkFBTyxFQUFDLElBQUksQ0FBQyxNQUFNLEVBQUUsVUFBVSxDQUFDLE1BQU0sQ0FBQyxRQUFRLENBQUMsQ0FBQzthQUNyRDtZQUVELE9BQU8sS0FBSyxDQUFDO1FBQ2QsQ0FBQztRQUVRLEtBQUssQ0FBQyxNQUFNLENBQUMsS0FBYSxFQUFFLE9BQXdCO1lBQzVELE9BQU8sSUFBSSxDQUFDLFdBQVcsRUFBRSxNQUFNLENBQUMsT0FBTyxDQUFDLENBQUM7UUFDMUMsQ0FBQztRQUVELHVCQUF1QjtRQUVkLE9BQU87WUFDZixPQUFPLElBQUksQ0FBQyxXQUFXLEVBQUUsT0FBTyxDQUFDLEdBQUcsRUFBRSxJQUFJLEtBQUssQ0FBQztRQUNqRCxDQUFDO1FBRUQsYUFBYSxDQUFDLFVBQWtCLEVBQUUsTUFBZTtZQUNoRCxJQUFJLENBQUMsV0FBVyxFQUFFLEtBQUssQ0FBQyxhQUFhLENBQUMsVUFBVSxFQUFFLE1BQU0sQ0FBQyxDQUFDO1FBQzNELENBQUM7O0lBN0lXLDRDQUFnQjsrQkFBaEIsZ0JBQWdCO1FBdUIxQixXQUFBLHFDQUFxQixDQUFBO1FBQ3JCLFdBQUEsOEJBQWMsQ0FBQTtRQUNkLFdBQUEsNEJBQWdCLENBQUE7UUFDaEIsV0FBQSxxQkFBYSxDQUFBO1FBQ2IsV0FBQSxvQkFBWSxDQUFBO1FBQ1osV0FBQSxxQ0FBcUIsQ0FBQTtRQUNyQixZQUFBLHNEQUEwQixDQUFBO09BN0JoQixnQkFBZ0IsQ0FnSjVCIn0=