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
define(["require", "exports", "vs/workbench/common/editor/editorInput", "vs/platform/files/common/files", "vs/platform/label/common/label", "vs/base/common/resources", "vs/workbench/services/filesConfiguration/common/filesConfigurationService"], function (require, exports, editorInput_1, files_1, label_1, resources_1, filesConfigurationService_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.AbstractResourceEditorInput = void 0;
    /**
     * The base class for all editor inputs that open resources.
     */
    let AbstractResourceEditorInput = class AbstractResourceEditorInput extends editorInput_1.EditorInput {
        get capabilities() {
            let capabilities = 32 /* EditorInputCapabilities.CanSplitInGroup */;
            if (this.fileService.hasProvider(this.resource)) {
                if (this.filesConfigurationService.isReadonly(this.resource)) {
                    capabilities |= 2 /* EditorInputCapabilities.Readonly */;
                }
            }
            else {
                capabilities |= 4 /* EditorInputCapabilities.Untitled */;
            }
            if (!(capabilities & 2 /* EditorInputCapabilities.Readonly */)) {
                capabilities |= 128 /* EditorInputCapabilities.CanDropIntoEditor */;
            }
            return capabilities;
        }
        get preferredResource() { return this._preferredResource; }
        constructor(resource, preferredResource, labelService, fileService, filesConfigurationService) {
            super();
            this.resource = resource;
            this.labelService = labelService;
            this.fileService = fileService;
            this.filesConfigurationService = filesConfigurationService;
            this._name = undefined;
            this._shortDescription = undefined;
            this._mediumDescription = undefined;
            this._longDescription = undefined;
            this._shortTitle = undefined;
            this._mediumTitle = undefined;
            this._longTitle = undefined;
            this._preferredResource = preferredResource || resource;
            this.registerListeners();
        }
        registerListeners() {
            // Clear our labels on certain label related events
            this._register(this.labelService.onDidChangeFormatters(e => this.onLabelEvent(e.scheme)));
            this._register(this.fileService.onDidChangeFileSystemProviderRegistrations(e => this.onLabelEvent(e.scheme)));
            this._register(this.fileService.onDidChangeFileSystemProviderCapabilities(e => this.onLabelEvent(e.scheme)));
        }
        onLabelEvent(scheme) {
            if (scheme === this._preferredResource.scheme) {
                this.updateLabel();
            }
        }
        updateLabel() {
            // Clear any cached labels from before
            this._name = undefined;
            this._shortDescription = undefined;
            this._mediumDescription = undefined;
            this._longDescription = undefined;
            this._shortTitle = undefined;
            this._mediumTitle = undefined;
            this._longTitle = undefined;
            // Trigger recompute of label
            this._onDidChangeLabel.fire();
        }
        setPreferredResource(preferredResource) {
            if (!(0, resources_1.isEqual)(preferredResource, this._preferredResource)) {
                this._preferredResource = preferredResource;
                this.updateLabel();
            }
        }
        getName() {
            if (typeof this._name !== 'string') {
                this._name = this.labelService.getUriBasenameLabel(this._preferredResource);
            }
            return this._name;
        }
        getDescription(verbosity = 1 /* Verbosity.MEDIUM */) {
            switch (verbosity) {
                case 0 /* Verbosity.SHORT */:
                    return this.shortDescription;
                case 2 /* Verbosity.LONG */:
                    return this.longDescription;
                case 1 /* Verbosity.MEDIUM */:
                default:
                    return this.mediumDescription;
            }
        }
        get shortDescription() {
            if (typeof this._shortDescription !== 'string') {
                this._shortDescription = this.labelService.getUriBasenameLabel((0, resources_1.dirname)(this._preferredResource));
            }
            return this._shortDescription;
        }
        get mediumDescription() {
            if (typeof this._mediumDescription !== 'string') {
                this._mediumDescription = this.labelService.getUriLabel((0, resources_1.dirname)(this._preferredResource), { relative: true });
            }
            return this._mediumDescription;
        }
        get longDescription() {
            if (typeof this._longDescription !== 'string') {
                this._longDescription = this.labelService.getUriLabel((0, resources_1.dirname)(this._preferredResource));
            }
            return this._longDescription;
        }
        get shortTitle() {
            if (typeof this._shortTitle !== 'string') {
                this._shortTitle = this.getName();
            }
            return this._shortTitle;
        }
        get mediumTitle() {
            if (typeof this._mediumTitle !== 'string') {
                this._mediumTitle = this.labelService.getUriLabel(this._preferredResource, { relative: true });
            }
            return this._mediumTitle;
        }
        get longTitle() {
            if (typeof this._longTitle !== 'string') {
                this._longTitle = this.labelService.getUriLabel(this._preferredResource);
            }
            return this._longTitle;
        }
        getTitle(verbosity) {
            switch (verbosity) {
                case 0 /* Verbosity.SHORT */:
                    return this.shortTitle;
                case 2 /* Verbosity.LONG */:
                    return this.longTitle;
                default:
                case 1 /* Verbosity.MEDIUM */:
                    return this.mediumTitle;
            }
        }
        isReadonly() {
            return this.filesConfigurationService.isReadonly(this.resource);
        }
    };
    exports.AbstractResourceEditorInput = AbstractResourceEditorInput;
    exports.AbstractResourceEditorInput = AbstractResourceEditorInput = __decorate([
        __param(2, label_1.ILabelService),
        __param(3, files_1.IFileService),
        __param(4, filesConfigurationService_1.IFilesConfigurationService)
    ], AbstractResourceEditorInput);
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicmVzb3VyY2VFZGl0b3JJbnB1dC5qcyIsInNvdXJjZVJvb3QiOiJmaWxlOi8vL3dvcmtzcGFjZS9hcHBmbG93L3NyYy8iLCJzb3VyY2VzIjpbInZzL3dvcmtiZW5jaC9jb21tb24vZWRpdG9yL3Jlc291cmNlRWRpdG9ySW5wdXQudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7OztnR0FHZ0c7Ozs7Ozs7Ozs7Ozs7O0lBV2hHOztPQUVHO0lBQ0ksSUFBZSwyQkFBMkIsR0FBMUMsTUFBZSwyQkFBNEIsU0FBUSx5QkFBVztRQUVwRSxJQUFhLFlBQVk7WUFDeEIsSUFBSSxZQUFZLG1EQUEwQyxDQUFDO1lBRTNELElBQUksSUFBSSxDQUFDLFdBQVcsQ0FBQyxXQUFXLENBQUMsSUFBSSxDQUFDLFFBQVEsQ0FBQyxFQUFFO2dCQUNoRCxJQUFJLElBQUksQ0FBQyx5QkFBeUIsQ0FBQyxVQUFVLENBQUMsSUFBSSxDQUFDLFFBQVEsQ0FBQyxFQUFFO29CQUM3RCxZQUFZLDRDQUFvQyxDQUFDO2lCQUNqRDthQUNEO2lCQUFNO2dCQUNOLFlBQVksNENBQW9DLENBQUM7YUFDakQ7WUFFRCxJQUFJLENBQUMsQ0FBQyxZQUFZLDJDQUFtQyxDQUFDLEVBQUU7Z0JBQ3ZELFlBQVksdURBQTZDLENBQUM7YUFDMUQ7WUFFRCxPQUFPLFlBQVksQ0FBQztRQUNyQixDQUFDO1FBR0QsSUFBSSxpQkFBaUIsS0FBVSxPQUFPLElBQUksQ0FBQyxrQkFBa0IsQ0FBQyxDQUFDLENBQUM7UUFFaEUsWUFDVSxRQUFhLEVBQ3RCLGlCQUFrQyxFQUNuQixZQUE4QyxFQUMvQyxXQUE0QyxFQUM5Qix5QkFBd0U7WUFFcEcsS0FBSyxFQUFFLENBQUM7WUFOQyxhQUFRLEdBQVIsUUFBUSxDQUFLO1lBRVksaUJBQVksR0FBWixZQUFZLENBQWU7WUFDNUIsZ0JBQVcsR0FBWCxXQUFXLENBQWM7WUFDWCw4QkFBeUIsR0FBekIseUJBQXlCLENBQTRCO1lBOEM3RixVQUFLLEdBQXVCLFNBQVMsQ0FBQztZ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