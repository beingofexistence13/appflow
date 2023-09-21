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
define(["require", "exports", "vs/base/common/event", "vs/base/common/lifecycle", "vs/base/common/resources", "vs/editor/common/services/resolverService", "vs/workbench/services/textfile/common/textfiles"], function (require, exports, event_1, lifecycle_1, resources_1, resolverService_1, textfiles_1) {
    "use strict";
    var CustomTextEditorModel_1;
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.CustomTextEditorModel = void 0;
    let CustomTextEditorModel = CustomTextEditorModel_1 = class CustomTextEditorModel extends lifecycle_1.Disposable {
        static async create(instantiationService, viewType, resource) {
            return instantiationService.invokeFunction(async (accessor) => {
                const textModelResolverService = accessor.get(resolverService_1.ITextModelService);
                const model = await textModelResolverService.createModelReference(resource);
                return instantiationService.createInstance(CustomTextEditorModel_1, viewType, resource, model);
            });
        }
        constructor(viewType, _resource, _model, textFileService) {
            super();
            this.viewType = viewType;
            this._resource = _resource;
            this._model = _model;
            this.textFileService = textFileService;
            this._onDidChangeOrphaned = this._register(new event_1.Emitter());
            this.onDidChangeOrphaned = this._onDidChangeOrphaned.event;
            this._onDidChangeReadonly = this._register(new event_1.Emitter());
            this.onDidChangeReadonly = this._onDidChangeReadonly.event;
            this._onDidChangeDirty = this._register(new event_1.Emitter());
            this.onDidChangeDirty = this._onDidChangeDirty.event;
            this._onDidChangeContent = this._register(new event_1.Emitter());
            this.onDidChangeContent = this._onDidChangeContent.event;
            this._register(_model);
            this._textFileModel = this.textFileService.files.get(_resource);
            if (this._textFileModel) {
                this._register(this._textFileModel.onDidChangeOrphaned(() => this._onDidChangeOrphaned.fire()));
                this._register(this._textFileModel.onDidChangeReadonly(() => this._onDidChangeReadonly.fire()));
            }
            this._register(this.textFileService.files.onDidChangeDirty(e => {
                if ((0, resources_1.isEqual)(this.resource, e.resource)) {
                    this._onDidChangeDirty.fire();
                    this._onDidChangeContent.fire();
                }
            }));
        }
        get resource() {
            return this._resource;
        }
        isReadonly() {
            return this._model.object.isReadonly();
        }
        get backupId() {
            return undefined;
        }
        isDirty() {
            return this.textFileService.isDirty(this.resource);
        }
        isOrphaned() {
            return !!this._textFileModel?.hasState(4 /* TextFileEditorModelState.ORPHAN */);
        }
        async revert(options) {
            return this.textFileService.revert(this.resource, options);
        }
        saveCustomEditor(options) {
            return this.textFileService.save(this.resource, options);
        }
        async saveCustomEditorAs(resource, targetResource, options) {
            return !!await this.textFileService.saveAs(resource, targetResource, options);
        }
    };
    exports.CustomTextEditorModel = CustomTextEditorModel;
    exports.CustomTextEditorModel = CustomTextEditorModel = CustomTextEditorModel_1 = __decorate([
        __param(3, textfiles_1.ITextFileService)
    ], CustomTextEditorModel);
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY3VzdG9tVGV4dEVkaXRvck1vZGVsLmpzIiwic291cmNlUm9vdCI6ImZpbGU6Ly8vd29ya3NwYWNlL2FwcGZsb3cvc3JjLyIsInNvdXJjZXMiOlsidnMvd29ya2JlbmNoL2NvbnRyaWIvY3VzdG9tRWRpdG9yL2NvbW1vbi9jdXN0b21UZXh0RWRpdG9yTW9kZWwudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7OztnR0FHZ0c7Ozs7Ozs7Ozs7Ozs7OztJQWF6RixJQUFNLHFCQUFxQiw2QkFBM0IsTUFBTSxxQkFBc0IsU0FBUSxzQkFBVTtRQUU3QyxNQUFNLENBQUMsS0FBSyxDQUFDLE1BQU0sQ0FDekIsb0JBQTJDLEVBQzNDLFFBQWdCLEVBQ2hCLFFBQWE7WUFFYixPQUFPLG9CQUFvQixDQUFDLGNBQWMsQ0FBQyxLQUFLLEVBQUMsUUFBUSxFQUFDLEVBQUU7Z0JBQzNELE1BQU0sd0JBQXdCLEdBQUcsUUFBUSxDQUFDLEdBQUcsQ0FBQyxtQ0FBaUIsQ0FBQyxDQUFDO2dCQUNqRSxNQUFNLEtBQUssR0FBRyxNQUFNLHdCQUF3QixDQUFDLG9CQUFvQixDQUFDLFFBQVEsQ0FBQyxDQUFDO2dCQUM1RSxPQUFPLG9CQUFvQixDQUFDLGNBQWMsQ0FBQyx1QkFBcUIsRUFBRSxRQUFRLEVBQUUsUUFBUSxFQUFFLEtBQUssQ0FBQyxDQUFDO1lBQzlGLENBQUMsQ0FBQyxDQUFDO1FBQ0osQ0FBQztRQVVELFlBQ2lCLFFBQWdCLEVBQ2YsU0FBYyxFQUNkLE1BQTRDLEVBQzNDLGVBQWtEO1lBRXBFLEtBQUssRUFBRSxDQUFDO1lBTFEsYUFBUSxHQUFSLFFBQVEsQ0FBUTtZQUNmLGNBQVMsR0FBVCxTQUFTLENBQUs7WUFDZCxXQUFNLEdBQU4sTUFBTSxDQUFzQztZQUMxQixvQkFBZSxHQUFmLGVBQWUsQ0FBa0I7WUFWcEQseUJBQW9CLEdBQUcsSUFBSSxDQUFDLFNBQVMsQ0FBQyxJQUFJLGVBQU8sRUFBUSxDQUFDLENBQUM7WUFDNUQsd0JBQW1CLEdBQUcsSUFBSSxDQUFD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