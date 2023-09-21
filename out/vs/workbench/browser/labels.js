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
define(["require", "exports", "vs/base/common/uri", "vs/base/common/resources", "vs/base/browser/ui/iconLabel/iconLabel", "vs/editor/common/languages/language", "vs/platform/workspace/common/workspace", "vs/platform/configuration/common/configuration", "vs/editor/common/services/model", "vs/workbench/services/textfile/common/textfiles", "vs/workbench/services/decorations/common/decorations", "vs/base/common/network", "vs/platform/files/common/files", "vs/platform/theme/common/themeService", "vs/base/common/event", "vs/platform/label/common/label", "vs/editor/common/services/getIconClasses", "vs/base/common/lifecycle", "vs/platform/instantiation/common/instantiation", "vs/base/common/labels"], function (require, exports, uri_1, resources_1, iconLabel_1, language_1, workspace_1, configuration_1, model_1, textfiles_1, decorations_1, network_1, files_1, themeService_1, event_1, label_1, getIconClasses_1, lifecycle_1, instantiation_1, labels_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.ResourceLabel = exports.ResourceLabels = exports.DEFAULT_LABELS_CONTAINER = void 0;
    function toResource(props) {
        if (!props || !props.resource) {
            return undefined;
        }
        if (uri_1.URI.isUri(props.resource)) {
            return props.resource;
        }
        return props.resource.primary;
    }
    exports.DEFAULT_LABELS_CONTAINER = {
        onDidChangeVisibility: event_1.Event.None
    };
    let ResourceLabels = class ResourceLabels extends lifecycle_1.Disposable {
        constructor(container, instantiationService, configurationService, modelService, workspaceService, languageService, decorationsService, themeService, labelService, textFileService) {
            super();
            this.instantiationService = instantiationService;
            this.configurationService = configurationService;
            this.modelService = modelService;
            this.workspaceService = workspaceService;
            this.languageService = languageService;
            this.decorationsService = decorationsService;
            this.themeService = themeService;
            this.labelService = labelService;
            this.textFileService = textFileService;
            this._onDidChangeDecorations = this._register(new event_1.Emitter());
            this.onDidChangeDecorations = this._onDidChangeDecorations.event;
            this.widgets = [];
            this.labels = [];
            this.registerListeners(container);
        }
        registerListeners(container) {
            // notify when visibility changes
            this._register(container.onDidChangeVisibility(visible => {
                this.widgets.forEach(widget => widget.notifyVisibilityChanged(visible));
            }));
            // notify when extensions are registered with potentially new languages
            this._register(this.languageService.onDidChange(() => this.widgets.forEach(widget => widget.notifyExtensionsRegistered())));
            // notify when model language changes
            this._register(this.modelService.onModelLanguageChanged(e => {
                if (!e.model.uri) {
                    return; // we need the resource to compare
                }
                this.widgets.forEach(widget => widget.notifyModelLanguageChanged(e.model));
            }));
            // notify when model is added
            this._register(this.modelService.onModelAdded(model => {
                if (!model.uri) {
                    return; // we need the resource to compare
                }
                this.widgets.forEach(widget => widget.notifyModelAdded(model));
            }));
            // notify when workspace folders changes
            this._register(this.workspaceService.onDidChangeWorkspaceFolders(() => {
                this.widgets.forEach(widget => widget.notifyWorkspaceFoldersChange());
            }));
            // notify when file decoration changes
            this._register(this.decorationsService.onDidChangeDecorations(e => {
                let notifyDidChangeDecorations = false;
                this.widgets.forEach(widget => {
                    if (widget.notifyFileDecorationsChanges(e)) {
                        notifyDidChangeDecorations = true;
                    }
                });
                if (notifyDidChangeDecorations) {
                    this._onDidChangeDecorations.fire();
                }
            }));
            // notify when theme changes
            this._register(this.themeService.onDidColorThemeChange(() => this.widgets.forEach(widget => widget.notifyThemeChange())));
            // notify when files.associations changes
            this._register(this.configurationService.onDidChangeConfiguration(e => {
                if (e.affectsConfiguration(files_1.FILES_ASSOCIATIONS_CONFIG)) {
                    this.widgets.forEach(widget => widget.notifyFileAssociationsChange());
                }
            }));
            // notify when label formatters change
            this._register(this.labelService.onDidChangeFormatters(e => {
                this.widgets.forEach(widget => widget.notifyFormattersChange(e.scheme));
            }));
            // notify when untitled labels change
            this._register(this.textFileService.untitled.onDidChangeLabel(model => {
                this.widgets.forEach(widget => widget.notifyUntitledLabelChange(model.resource));
            }));
        }
        get(index) {
            return this.labels[index];
        }
        create(container, options) {
            const widget = this.instantiationService.createInstance(ResourceLabelWidget, container, options);
            // Only expose a handle to the outside
            const label = {
                element: widget.element,
                onDidRender: widget.onDidRender,
                setLabel: (label, description, options) => widget.setLabel(label, description, options),
                setResource: (label, options) => widget.setResource(label, options),
                setFile: (resource, options) => widget.setFile(resource, options),
                clear: () => widget.clear(),
                dispose: () => this.disposeWidget(widget)
            };
            // Store
            this.labels.push(label);
            this.widgets.push(widget);
            return label;
        }
        disposeWidget(widget) {
            const index = this.widgets.indexOf(widget);
            if (index > -1) {
                this.widgets.splice(index, 1);
                this.labels.splice(index, 1);
            }
            (0, lifecycle_1.dispose)(widget);
        }
        clear() {
            this.widgets = (0, lifecycle_1.dispose)(this.widgets);
            this.labels = [];
        }
        dispose() {
            super.dispose();
            this.clear();
        }
    };
    exports.ResourceLabels = ResourceLabels;
    exports.ResourceLabels = ResourceLabels = __decorate([
        __param(1, instantiation_1.IInstantiationService),
        __param(2, configuration_1.IConfigurationService),
        __param(3, model_1.IModelService),
        __param(4, workspace_1.IWorkspaceContextService),
        __param(5, language_1.ILanguageService),
        __param(6, decorations_1.IDecorationsService),
        __param(7, themeService_1.IThemeService),
        __param(8, label_1.ILabelService),
        __param(9, textfiles_1.ITextFileService)
    ], ResourceLabels);
    /**
     * Note: please consider to use `ResourceLabels` if you are in need
     * of more than one label for your widget.
     */
    let ResourceLabel = class ResourceLabel extends ResourceLabels {
        get element() { return this.label; }
        constructor(container, options, instantiationService, configurationService, modelService, workspaceService, languageService, decorationsService, themeService, labelService, textFileService) {
            super(exports.DEFAULT_LABELS_CONTAINER, instantiationService, configurationService, modelService, workspaceService, languageService, decorationsService, themeService, labelService, textFileService);
            this.label = this._register(this.create(container, options));
        }
    };
    exports.ResourceLabel = ResourceLabel;
    exports.ResourceLabel = ResourceLabel = __decorate([
        __param(2, instantiation_1.IInstantiationService),
        __param(3, configuration_1.IConfigurationService),
        __param(4, model_1.IModelService),
        __param(5, workspace_1.IWorkspaceContextService),
        __param(6, language_1.ILanguageService),
        __param(7, decorations_1.IDecorationsService),
        __param(8, themeService_1.IThemeService),
        __param(9, label_1.ILabelService),
        __param(10, textfiles_1.ITextFileService)
    ], ResourceLabel);
    var Redraw;
    (function (Redraw) {
        Redraw[Redraw["Basic"] = 1] = "Basic";
        Redraw[Redraw["Full"] = 2] = "Full";
    })(Redraw || (Redraw = {}));
    let ResourceLabelWidget = class ResourceLabelWidget extends iconLabel_1.IconLabel {
        constructor(container, options, languageService, modelService, decorationsService, labelService, textFileService, contextService) {
            super(container, options);
            this.languageService = languageService;
            this.modelService = modelService;
            this.decorationsService = decorationsService;
            this.labelService = labelService;
            this.textFileService = textFileService;
            this.contextService = contextService;
            this._onDidRender = this._register(new event_1.Emitter());
            this.onDidRender = this._onDidRender.event;
            this.label = undefined;
            this.decoration = this._register(new lifecycle_1.MutableDisposable());
            this.options = undefined;
            this.computedIconClasses = undefined;
            this.computedLanguageId = undefined;
            this.computedPathLabel = undefined;
            this.computedWorkspaceFolderLabel = undefined;
            this.needsRedraw = undefined;
            this.isHidden = false;
        }
        notifyVisibilityChanged(visible) {
            if (visible === this.isHidden) {
                this.isHidden = !visible;
                if (visible && this.needsRedraw) {
                    this.render({
                        updateIcon: this.needsRedraw === Redraw.Full,
                        updateDecoration: this.needsRedraw === Redraw.Full
                    });
                    this.needsRedraw = undefined;
                }
            }
        }
        notifyModelLanguageChanged(model) {
            this.handleModelEvent(model);
        }
        notifyModelAdded(model) {
            this.handleModelEvent(model);
        }
        handleModelEvent(model) {
            const resource = toResource(this.label);
            if (!resource) {
                return; // only update if resource exists
            }
            if ((0, resources_1.isEqual)(model.uri, resource)) {
                if (this.computedLanguageId !== model.getLanguageId()) {
                    this.computedLanguageId = model.getLanguageId();
                    this.render({ updateIcon: true, updateDecoration: false }); // update if the language id of the model has changed from our last known state
                }
            }
        }
        notifyFileDecorationsChanges(e) {
            if (!this.options) {
                return false;
            }
            const resource = toResource(this.label);
            if (!resource) {
                return false;
            }
            if (this.options.fileDecorations && e.affectsResource(resource)) {
                return this.render({ updateIcon: false, updateDecoration: true });
            }
            return false;
        }
        notifyExtensionsRegistered() {
            this.render({ updateIcon: true, updateDecoration: false });
        }
        notifyThemeChange() {
            this.render({ updateIcon: false, updateDecoration: false });
        }
        notifyFileAssociationsChange() {
            this.render({ updateIcon: true, updateDecoration: false });
        }
        notifyFormattersChange(scheme) {
            if (toResource(this.label)?.scheme === scheme) {
                this.render({ updateIcon: false, updateDecoration: false });
            }
        }
        notifyUntitledLabelChange(resource) {
            if ((0, resources_1.isEqual)(resource, toResource(this.label))) {
                this.render({ updateIcon: false, updateDecoration: false });
            }
        }
        notifyWorkspaceFoldersChange() {
            if (typeof this.computedWorkspaceFolderLabel === 'string') {
                const resource = toResource(this.label);
                if (uri_1.URI.isUri(resource) && this.label?.name === this.computedWorkspaceFolderLabel) {
                    this.setFile(resource, this.options);
                }
            }
        }
        setFile(resource, options) {
            const hideLabel = options?.hideLabel;
            let name;
            if (!hideLabel) {
                if (options?.fileKind === files_1.FileKind.ROOT_FOLDER) {
                    const workspaceFolder = this.contextService.getWorkspaceFolder(resource);
                    if (workspaceFolder) {
                        name = workspaceFolder.name;
                        this.computedWorkspaceFolderLabel = name;
                    }
                }
                if (!name) {
                    name = (0, labels_1.normalizeDriveLetter)((0, resources_1.basenameOrAuthority)(resource));
                }
            }
            let description;
            if (!options?.hidePath) {
                description = this.labelService.getUriLabel((0, resources_1.dirname)(resource), { relative: true });
            }
            this.setResource({ resource, name, description }, options);
        }
        setResource(label, options = Object.create(null)) {
            const resource = toResource(label);
            const isSideBySideEditor = label?.resource && !uri_1.URI.isUri(label.resource);
            if (!options.forceLabel && !isSideBySideEditor && resource?.scheme === network_1.Schemas.untitled) {
                // Untitled labels are very dynamic because they may change
                // whenever the content changes (unless a path is associated).
                // As such we always ask the actual editor for it's name and
                // description to get latest in case name/description are
                // provided. If they are not provided from the label we got
                // we assume that the client does not want to display them
                // and as such do not override.
                //
                // We do not touch the label if it represents a primary-secondary
                // because in that case we expect it to carry a proper label
                // and description.
                const untitledModel = this.textFileService.untitled.get(resource);
                if (untitledModel && !untitledModel.hasAssociatedFilePath) {
                    if (typeof label.name === 'string') {
                        label.name = untitledModel.name;
                    }
                    if (typeof label.description === 'string') {
                        const untitledDescription = untitledModel.resource.path;
                        if (label.name !== untitledDescription) {
                            label.description = untitledDescription;
                        }
                        else {
                            label.description = undefined;
                        }
                    }
                    const untitledTitle = untitledModel.resource.path;
                    if (untitledModel.name !== untitledTitle) {
                        options.title = `${untitledModel.name} • ${untitledTitle}`;
                    }
                    else {
                        options.title = untitledTitle;
                    }
                }
            }
            const hasResourceChanged = this.hasResourceChanged(label);
            const hasPathLabelChanged = hasResourceChanged || this.hasPathLabelChanged(label);
            const hasFileKindChanged = this.hasFileKindChanged(options);
            this.label = label;
            this.options = options;
            if (hasResourceChanged) {
                this.computedLanguageId = undefined; // reset computed language since resource changed
            }
            if (hasPathLabelChanged) {
                this.computedPathLabel = undefined; // reset path label due to resource/path-label change
            }
            this.render({
                updateIcon: hasResourceChanged || hasFileKindChanged,
                updateDecoration: hasResourceChanged || hasFileKindChanged
            });
        }
        hasFileKindChanged(newOptions) {
            const newFileKind = newOptions?.fileKind;
            const oldFileKind = this.options?.fileKind;
            return newFileKind !== oldFileKind; // same resource but different kind (file, folder)
        }
        hasResourceChanged(newLabel) {
            const newResource = toResource(newLabel);
            const oldResource = toResource(this.label);
            if (newResource && oldResource) {
                return newResource.toString() !== oldResource.toString();
            }
            if (!newResource && !oldResource) {
                return false;
            }
            return true;
        }
        hasPathLabelChanged(newLabel) {
            const newResource = toResource(newLabel);
            return !!newResource && this.computedPathLabel !== this.labelService.getUriLabel(newResource);
        }
        clear() {
            this.label = undefined;
            this.options = undefined;
            this.computedLanguageId = undefined;
            this.computedIconClasses = undefined;
            this.computedPathLabel = undefined;
            this.setLabel('');
        }
        render(options) {
            if (this.isHidden) {
                if (this.needsRedraw !== Redraw.Full) {
                    this.needsRedraw = (options.updateIcon || options.updateDecoration) ? Redraw.Full : Redraw.Basic;
                }
                return false;
            }
            if (options.updateIcon) {
                this.computedIconClasses = undefined;
            }
            if (!this.label) {
                return false;
            }
            const iconLabelOptions = {
                title: '',
                italic: this.options?.italic,
                strikethrough: this.options?.strikethrough,
                matches: this.options?.matches,
                descriptionMatches: this.options?.descriptionMatches,
                extraClasses: [],
                separator: this.options?.separator,
                domId: this.options?.domId,
                disabledCommand: this.options?.disabledCommand,
                labelEscapeNewLines: this.options?.labelEscapeNewLines
            };
            const resource = toResource(this.label);
            const label = this.label.name;
            if (this.options?.title !== undefined) {
                iconLabelOptions.title = this.options.title;
            }
            if (resource && resource.scheme !== network_1.Schemas.data /* do not accidentally inline Data URIs */
                && ((!this.options?.title)
                    || ((typeof this.options.title !== 'string') && !this.options.title.markdownNotSupportedFallback))) {
                if (!this.computedPathLabel) {
                    this.computedPathLabel = this.labelService.getUriLabel(resource);
                }
                if (!iconLabelOptions.title || (typeof iconLabelOptions.title === 'string')) {
                    iconLabelOptions.title = this.computedPathLabel;
                }
                else if (!iconLabelOptions.title.markdownNotSupportedFallback) {
                    iconLabelOptions.title.markdownNotSupportedFallback = this.computedPathLabel;
                }
            }
            if (this.options && !this.options.hideIcon) {
                if (!this.computedIconClasses) {
                    this.computedIconClasses = (0, getIconClasses_1.getIconClasses)(this.modelService, this.languageService, resource, this.options.fileKind);
                }
                iconLabelOptions.extraClasses = this.computedIconClasses.slice(0);
            }
            if (this.options?.extraClasses) {
                iconLabelOptions.extraClasses.push(...this.options.extraClasses);
            }
            if (this.options?.fileDecorations && resource) {
                if (options.updateDecoration) {
                    this.decoration.value = this.decorationsService.getDecoration(resource, this.options.fileKind !== files_1.FileKind.FILE);
                }
                const decoration = this.decoration.value;
                if (decoration) {
                    if (decoration.tooltip) {
                        if (typeof iconLabelOptions.title === 'string') {
                            iconLabelOptions.title = `${iconLabelOptions.title} • ${decoration.tooltip}`;
                        }
                        else if (typeof iconLabelOptions.title?.markdown === 'string') {
                            const title = `${iconLabelOptions.title.markdown} • ${decoration.tooltip}`;
                            iconLabelOptions.title = { markdown: title, markdownNotSupportedFallback: title };
                        }
                    }
                    if (decoration.strikethrough) {
                        iconLabelOptions.strikethrough = true;
                    }
                    if (this.options.fileDecorations.colors) {
                        iconLabelOptions.extraClasses.push(decoration.labelClassName);
                    }
                    if (this.options.fileDecorations.badges) {
                        iconLabelOptions.extraClasses.push(decoration.badgeClassName);
                        iconLabelOptions.extraClasses.push(decoration.iconClassName);
                    }
                }
            }
            this.setLabel(label || '', this.label.description, iconLabelOptions);
            this._onDidRender.fire();
            return true;
        }
        dispose() {
            super.dispose();
            this.label = undefined;
            this.options = undefined;
            this.computedLanguageId = undefined;
            this.computedIconClasses = undefined;
            this.computedPathLabel = undefined;
            this.computedWorkspaceFolderLabel = undefined;
        }
    };
    ResourceLabelWidget = __decorate([
        __param(2, language_1.ILanguageService),
        __param(3, model_1.IModelService),
        __param(4, decorations_1.IDecorationsService),
        __param(5, label_1.ILabelService),
        __param(6, textfiles_1.ITextFileService),
        __param(7, workspace_1.IWorkspaceContextService)
    ], ResourceLabelWidget);
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibGFiZWxzLmpzIiwic291cmNlUm9vdCI6ImZpbGU6Ly8vd29ya3NwYWNlL2FwcGZsb3cvc3JjLyIsInNvdXJjZXMiOlsidnMvd29ya2JlbmNoL2Jyb3dzZXIvbGFiZWxzLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOzs7Z0dBR2dHOzs7Ozs7Ozs7Ozs7OztJQTRCaEcsU0FBUyxVQUFVLENBQUMsS0FBc0M7UUFDekQsSUFBSSxDQUFDLEtBQUssSUFBSSxDQUFDLEtBQUssQ0FBQyxRQUFRLEVBQUU7WUFDOUIsT0FBTyxTQUFTLENBQUM7U0FDakI7UUFFRCxJQUFJLFNBQUcsQ0FBQyxLQUFLLENBQUMsS0FBSyxDQUFDLFFBQVEsQ0FBQyxFQUFFO1lBQzlCLE9BQU8sS0FBSyxDQUFDLFFBQVEsQ0FBQztTQUN0QjtRQUVELE9BQU8sS0FBSyxDQUFDLFFBQVEsQ0FBQyxPQUFPLENBQUM7SUFDL0IsQ0FBQztJQTBEWSxRQUFBLHdCQUF3QixHQUE2QjtRQUNqRSxxQkFBcUIsRUFBRSxhQUFLLENBQUMsSUFBSTtLQUNqQyxDQUFDO0lBRUssSUFBTSxjQUFjLEdBQXBCLE1BQU0sY0FBZSxTQUFRLHNCQUFVO1FBUTdDLFlBQ0MsU0FBbUMsRUFDWixvQkFBNEQsRUFDNUQsb0JBQTRELEVBQ3BFLFlBQTRDLEVBQ2pDLGdCQUEyRCxFQUNuRSxlQUFrRCxFQUMvQyxrQkFBd0QsRUFDOUQsWUFBNEMsRUFDNUMsWUFBNEMsRUFDekMsZUFBa0Q7WUFFcEUsS0FBSyxFQUFFLENBQUM7WUFWZ0MseUJBQW9CLEdBQXBCLG9CQUFvQixDQUF1QjtZQUMzQyx5QkFBb0IsR0FBcEIsb0JBQW9CLENBQXVCO1lBQ25ELGlCQUFZLEdBQVosWUFBWSxDQUFlO1lBQ2hCLHFCQUFnQixHQUFoQixnQkFBZ0IsQ0FBMEI7WUFDbEQsb0JBQWUsR0FBZixlQUFlLENBQWtCO1lBQzlCLHVCQUFrQixHQUFsQixrQkFBa0IsQ0FBcUI7WUFDN0MsaUJBQVksR0FBWixZQUFZLENBQWU7WUFDM0IsaUJB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