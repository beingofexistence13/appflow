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
    exports.$Mlb = exports.$Llb = exports.$Klb = void 0;
    function toResource(props) {
        if (!props || !props.resource) {
            return undefined;
        }
        if (uri_1.URI.isUri(props.resource)) {
            return props.resource;
        }
        return props.resource.primary;
    }
    exports.$Klb = {
        onDidChangeVisibility: event_1.Event.None
    };
    let $Llb = class $Llb extends lifecycle_1.$kc {
        constructor(container, f, g, h, j, m, n, r, s, t) {
            super();
            this.f = f;
            this.g = g;
            this.h = h;
            this.j = j;
            this.m = m;
            this.n = n;
            this.r = r;
            this.s = s;
            this.t = t;
            this.a = this.B(new event_1.$fd());
            this.onDidChangeDecorations = this.a.event;
            this.b = [];
            this.c = [];
            this.u(container);
        }
        u(container) {
            // notify when visibility changes
            this.B(container.onDidChangeVisibility(visible => {
                this.b.forEach(widget => widget.notifyVisibilityChanged(visible));
            }));
            // notify when extensions are registered with potentially new languages
            this.B(this.m.onDidChange(() => this.b.forEach(widget => widget.notifyExtensionsRegistered())));
            // notify when model language changes
            this.B(this.h.onModelLanguageChanged(e => {
                if (!e.model.uri) {
                    return; // we need the resource to compare
                }
                this.b.forEach(widget => widget.notifyModelLanguageChanged(e.model));
            }));
            // notify when model is added
            this.B(this.h.onModelAdded(model => {
                if (!model.uri) {
                    return; // we need the resource to compare
                }
                this.b.forEach(widget => widget.notifyModelAdded(model));
            }));
            // notify when workspace folders changes
            this.B(this.j.onDidChangeWorkspaceFolders(() => {
                this.b.forEach(widget => widget.notifyWorkspaceFoldersChange());
            }));
            // notify when file decoration changes
            this.B(this.n.onDidChangeDecorations(e => {
                let notifyDidChangeDecorations = false;
                this.b.forEach(widget => {
                    if (widget.notifyFileDecorationsChanges(e)) {
                        notifyDidChangeDecorations = true;
                    }
                });
                if (notifyDidChangeDecorations) {
                    this.a.fire();
                }
            }));
            // notify when theme changes
            this.B(this.r.onDidColorThemeChange(() => this.b.forEach(widget => widget.notifyThemeChange())));
            // notify when files.associations changes
            this.B(this.g.onDidChangeConfiguration(e => {
                if (e.affectsConfiguration(files_1.$sk)) {
                    this.b.forEach(widget => widget.notifyFileAssociationsChange());
                }
            }));
            // notify when label formatters change
            this.B(this.s.onDidChangeFormatters(e => {
                this.b.forEach(widget => widget.notifyFormattersChange(e.scheme));
            }));
            // notify when untitled labels change
            this.B(this.t.untitled.onDidChangeLabel(model => {
                this.b.forEach(widget => widget.notifyUntitledLabelChange(model.resource));
            }));
        }
        get(index) {
            return this.c[index];
        }
        create(container, options) {
            const widget = this.f.createInstance(ResourceLabelWidget, container, options);
            // Only expose a handle to the outside
            const label = {
                element: widget.element,
                onDidRender: widget.onDidRender,
                setLabel: (label, description, options) => widget.setLabel(label, description, options),
                setResource: (label, options) => widget.setResource(label, options),
                setFile: (resource, options) => widget.setFile(resource, options),
                clear: () => widget.clear(),
                dispose: () => this.w(widget)
            };
            // Store
            this.c.push(label);
            this.b.push(widget);
            return label;
        }
        w(widget) {
            const index = this.b.indexOf(widget);
            if (index > -1) {
                this.b.splice(index, 1);
                this.c.splice(index, 1);
            }
            (0, lifecycle_1.$fc)(widget);
        }
        clear() {
            this.b = (0, lifecycle_1.$fc)(this.b);
            this.c = [];
        }
        dispose() {
            super.dispose();
            this.clear();
        }
    };
    exports.$Llb = $Llb;
    exports.$Llb = $Llb = __decorate([
        __param(1, instantiation_1.$Ah),
        __param(2, configuration_1.$8h),
        __param(3, model_1.$yA),
        __param(4, workspace_1.$Kh),
        __param(5, language_1.$ct),
        __param(6, decorations_1.$Gcb),
        __param(7, themeService_1.$gv),
        __param(8, label_1.$Vz),
        __param(9, textfiles_1.$JD)
    ], $Llb);
    /**
     * Note: please consider to use `ResourceLabels` if you are in need
     * of more than one label for your widget.
     */
    let $Mlb = class $Mlb extends $Llb {
        get element() { return this.y; }
        constructor(container, options, instantiationService, configurationService, modelService, workspaceService, languageService, decorationsService, themeService, labelService, textFileService) {
            super(exports.$Klb, instantiationService, configurationService, modelService, workspaceService, languageService, decorationsService, themeService, labelService, textFileService);
            this.y = this.B(this.create(container, options));
        }
    };
    exports.$Mlb = $Mlb;
    exports.$Mlb = $Mlb = __decorate([
        __param(2, instantiation_1.$Ah),
        __param(3, configuration_1.$8h),
        __param(4, model_1.$yA),
        __param(5, workspace_1.$Kh),
        __param(6, language_1.$ct),
        __param(7, decorations_1.$Gcb),
        __param(8, themeService_1.$gv),
        __param(9, label_1.$Vz),
        __param(10, textfiles_1.$JD)
    ], $Mlb);
    var Redraw;
    (function (Redraw) {
        Redraw[Redraw["Basic"] = 1] = "Basic";
        Redraw[Redraw["Full"] = 2] = "Full";
    })(Redraw || (Redraw = {}));
    let ResourceLabelWidget = class ResourceLabelWidget extends iconLabel_1.$KR {
        constructor(container, options, H, I, J, L, M, N) {
            super(container, options);
            this.H = H;
            this.I = I;
            this.J = J;
            this.L = L;
            this.M = M;
            this.N = N;
            this.s = this.B(new event_1.$fd());
            this.onDidRender = this.s.event;
            this.t = undefined;
            this.u = this.B(new lifecycle_1.$lc());
            this.w = undefined;
            this.y = undefined;
            this.z = undefined;
            this.C = undefined;
            this.D = undefined;
            this.F = undefined;
            this.G = false;
        }
        notifyVisibilityChanged(visible) {
            if (visible === this.G) {
                this.G = !visible;
                if (visible && this.F) {
                    this.S({
                        updateIcon: this.F === Redraw.Full,
                        updateDecoration: this.F === Redraw.Full
                    });
                    this.F = undefined;
                }
            }
        }
        notifyModelLanguageChanged(model) {
            this.O(model);
        }
        notifyModelAdded(model) {
            this.O(model);
        }
        O(model) {
            const resource = toResource(this.t);
            if (!resource) {
                return; // only update if resource exists
            }
            if ((0, resources_1.$bg)(model.uri, resource)) {
                if (this.z !== model.getLanguageId()) {
                    this.z = model.getLanguageId();
                    this.S({ updateIcon: true, updateDecoration: false }); // update if the language id of the model has changed from our last known state
                }
            }
        }
        notifyFileDecorationsChanges(e) {
            if (!this.w) {
                return false;
            }
            const resource = toResource(this.t);
            if (!resource) {
                return false;
            }
            if (this.w.fileDecorations && e.affectsResource(resource)) {
                return this.S({ updateIcon: false, updateDecoration: true });
            }
            return false;
        }
        notifyExtensionsRegistered() {
            this.S({ updateIcon: true, updateDecoration: false });
        }
        notifyThemeChange() {
            this.S({ updateIcon: false, updateDecoration: false });
        }
        notifyFileAssociationsChange() {
            this.S({ updateIcon: true, updateDecoration: false });
        }
        notifyFormattersChange(scheme) {
            if (toResource(this.t)?.scheme === scheme) {
                this.S({ updateIcon: false, updateDecoration: false });
            }
        }
        notifyUntitledLabelChange(resource) {
            if ((0, resources_1.$bg)(resource, toResource(this.t))) {
                this.S({ updateIcon: false, updateDecoration: false });
            }
        }
        notifyWorkspaceFoldersChange() {
            if (typeof this.D === 'string') {
                const resource = toResource(this.t);
                if (uri_1.URI.isUri(resource) && this.t?.name === this.D) {
                    this.setFile(resource, this.w);
                }
            }
        }
        setFile(resource, options) {
            const hideLabel = options?.hideLabel;
            let name;
            if (!hideLabel) {
                if (options?.fileKind === files_1.FileKind.ROOT_FOLDER) {
                    const workspaceFolder = this.N.getWorkspaceFolder(resource);
                    if (workspaceFolder) {
                        name = workspaceFolder.name;
                        this.D = name;
                    }
                }
                if (!name) {
                    name = (0, labels_1.$fA)((0, resources_1.$eg)(resource));
                }
            }
            let description;
            if (!options?.hidePath) {
                description = this.L.getUriLabel((0, resources_1.$hg)(resource), { relative: true });
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
                const untitledModel = this.M.untitled.get(resource);
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
            const hasResourceChanged = this.Q(label);
            const hasPathLabelChanged = hasResourceChanged || this.R(label);
            const hasFileKindChanged = this.P(options);
            this.t = label;
            this.w = options;
            if (hasResourceChanged) {
                this.z = undefined; // reset computed language since resource changed
            }
            if (hasPathLabelChanged) {
                this.C = undefined; // reset path label due to resource/path-label change
            }
            this.S({
                updateIcon: hasResourceChanged || hasFileKindChanged,
                updateDecoration: hasResourceChanged || hasFileKindChanged
            });
        }
        P(newOptions) {
            const newFileKind = newOptions?.fileKind;
            const oldFileKind = this.w?.fileKind;
            return newFileKind !== oldFileKind; // same resource but different kind (file, folder)
        }
        Q(newLabel) {
            const newResource = toResource(newLabel);
            const oldResource = toResource(this.t);
            if (newResource && oldResource) {
                return newResource.toString() !== oldResource.toString();
            }
            if (!newResource && !oldResource) {
                return false;
            }
            return true;
        }
        R(newLabel) {
            const newResource = toResource(newLabel);
            return !!newResource && this.C !== this.L.getUriLabel(newResource);
        }
        clear() {
            this.t = undefined;
            this.w = undefined;
            this.z = undefined;
            this.y = undefined;
            this.C = undefined;
            this.setLabel('');
        }
        S(options) {
            if (this.G) {
                if (this.F !== Redraw.Full) {
                    this.F = (options.updateIcon || options.updateDecoration) ? Redraw.Full : Redraw.Basic;
                }
                return false;
            }
            if (options.updateIcon) {
                this.y = undefined;
            }
            if (!this.t) {
                return false;
            }
            const iconLabelOptions = {
                title: '',
                italic: this.w?.italic,
                strikethrough: this.w?.strikethrough,
                matches: this.w?.matches,
                descriptionMatches: this.w?.descriptionMatches,
                extraClasses: [],
                separator: this.w?.separator,
                domId: this.w?.domId,
                disabledCommand: this.w?.disabledCommand,
                labelEscapeNewLines: this.w?.labelEscapeNewLines
            };
            const resource = toResource(this.t);
            const label = this.t.name;
            if (this.w?.title !== undefined) {
                iconLabelOptions.title = this.w.title;
            }
            if (resource && resource.scheme !== network_1.Schemas.data /* do not accidentally inline Data URIs */
                && ((!this.w?.title)
                    || ((typeof this.w.title !== 'string') && !this.w.title.markdownNotSupportedFallback))) {
                if (!this.C) {
                    this.C = this.L.getUriLabel(resource);
                }
                if (!iconLabelOptions.title || (typeof iconLabelOptions.title === 'string')) {
                    iconLabelOptions.title = this.C;
                }
                else if (!iconLabelOptions.title.markdownNotSupportedFallback) {
                    iconLabelOptions.title.markdownNotSupportedFallback = this.C;
                }
            }
            if (this.w && !this.w.hideIcon) {
                if (!this.y) {
                    this.y = (0, getIconClasses_1.$x6)(this.I, this.H, resource, this.w.fileKind);
                }
                iconLabelOptions.extraClasses = this.y.slice(0);
            }
            if (this.w?.extraClasses) {
                iconLabelOptions.extraClasses.push(...this.w.extraClasses);
            }
            if (this.w?.fileDecorations && resource) {
                if (options.updateDecoration) {
                    this.u.value = this.J.getDecoration(resource, this.w.fileKind !== files_1.FileKind.FILE);
                }
                const decoration = this.u.value;
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
                    if (this.w.fileDecorations.colors) {
                        iconLabelOptions.extraClasses.push(decoration.labelClassName);
                    }
                    if (this.w.fileDecorations.badges) {
                        iconLabelOptions.extraClasses.push(decoration.badgeClassName);
                        iconLabelOptions.extraClasses.push(decoration.iconClassName);
                    }
                }
            }
            this.setLabel(label || '', this.t.description, iconLabelOptions);
            this.s.fire();
            return true;
        }
        dispose() {
            super.dispose();
            this.t = undefined;
            this.w = undefined;
            this.z = undefined;
            this.y = undefined;
            this.C = undefined;
            this.D = undefined;
        }
    };
    ResourceLabelWidget = __decorate([
        __param(2, language_1.$ct),
        __param(3, model_1.$yA),
        __param(4, decorations_1.$Gcb),
        __param(5, label_1.$Vz),
        __param(6, textfiles_1.$JD),
        __param(7, workspace_1.$Kh)
    ], ResourceLabelWidget);
});
//# sourceMappingURL=labels.js.map