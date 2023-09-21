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
define(["require", "exports", "vs/base/common/comparers", "vs/base/common/errors", "vs/base/common/event", "vs/base/common/filters", "vs/base/common/glob", "vs/base/common/lifecycle", "vs/base/common/path", "vs/base/common/resources", "vs/base/common/uri", "vs/platform/configuration/common/configuration", "vs/platform/files/common/files", "vs/platform/instantiation/common/instantiation", "vs/platform/list/browser/listService", "vs/platform/theme/common/colorRegistry", "vs/platform/workspace/common/workspace", "vs/workbench/browser/labels", "vs/workbench/browser/parts/editor/breadcrumbs", "vs/platform/theme/common/themeService", "vs/nls!vs/workbench/browser/parts/editor/breadcrumbsPicker", "vs/workbench/services/editor/common/editorService", "vs/editor/common/services/textResourceConfiguration", "vs/css!./media/breadcrumbscontrol"], function (require, exports, comparers_1, errors_1, event_1, filters_1, glob, lifecycle_1, path_1, resources_1, uri_1, configuration_1, files_1, instantiation_1, listService_1, colorRegistry_1, workspace_1, labels_1, breadcrumbs_1, themeService_1, nls_1, editorService_1, textResourceConfiguration_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.$Ixb = exports.$Hxb = exports.$Gxb = exports.$Fxb = void 0;
    let $Fxb = class $Fxb {
        constructor(parent, m, n, o, p) {
            this.m = m;
            this.n = n;
            this.o = o;
            this.p = p;
            this.c = new lifecycle_1.$jc();
            this.i = new UIEvent('fakeEvent');
            this.k = new event_1.$fd();
            this.onWillPickElement = this.k.event;
            this.l = new lifecycle_1.$lc();
            this.d = document.createElement('div');
            this.d.className = 'monaco-breadcrumbs-picker show-file-icons';
            parent.appendChild(this.d);
        }
        dispose() {
            this.c.dispose();
            this.l.dispose();
            this.k.dispose();
            this.d.remove();
            setTimeout(() => this.h.dispose(), 0); // tree cannot be disposed while being opened...
        }
        async show(input, maxHeight, width, arrowSize, arrowOffset) {
            const theme = this.o.getColorTheme();
            const color = theme.getColor(colorRegistry_1.$oy);
            this.f = document.createElement('div');
            this.f.className = 'arrow';
            this.f.style.borderColor = `transparent transparent ${color ? color.toString() : ''}`;
            this.d.appendChild(this.f);
            this.g = document.createElement('div');
            this.g.style.background = color ? color.toString() : '';
            this.g.style.paddingTop = '2px';
            this.g.style.borderRadius = '3px';
            this.g.style.boxShadow = `0 0 8px 2px ${this.o.getColorTheme().getColor(colorRegistry_1.$Kv)}`;
            this.g.style.border = `1px solid ${this.o.getColorTheme().getColor(colorRegistry_1.$Lv)}`;
            this.d.appendChild(this.g);
            this.j = { maxHeight, width, arrowSize, arrowOffset, inputHeight: 0 };
            this.h = this.s(this.g, input);
            this.c.add(this.h.onDidOpen(async (e) => {
                const { element, editorOptions, sideBySide } = e;
                const didReveal = await this.u(element, { ...editorOptions, preserveFocus: false }, sideBySide);
                if (!didReveal) {
                    return;
                }
            }));
            this.c.add(this.h.onDidChangeFocus(e => {
                this.l.value = this.t(e.elements[0]);
            }));
            this.c.add(this.h.onDidChangeContentHeight(() => {
                this.q();
            }));
            this.d.focus();
            try {
                await this.r(input);
                this.q();
            }
            catch (err) {
                (0, errors_1.$Y)(err);
            }
        }
        q() {
            const headerHeight = 2 * this.j.arrowSize;
            const treeHeight = Math.min(this.j.maxHeight - headerHeight, this.h.contentHeight);
            const totalHeight = treeHeight + headerHeight;
            this.d.style.height = `${totalHeight}px`;
            this.d.style.width = `${this.j.width}px`;
            this.f.style.top = `-${2 * this.j.arrowSize}px`;
            this.f.style.borderWidth = `${this.j.arrowSize}px`;
            this.f.style.marginLeft = `${this.j.arrowOffset}px`;
            this.g.style.height = `${treeHeight}px`;
            this.g.style.width = `${this.j.width}px`;
            this.h.layout(treeHeight, this.j.width);
        }
        restoreViewState() { }
    };
    exports.$Fxb = $Fxb;
    exports.$Fxb = $Fxb = __decorate([
        __param(2, instantiation_1.$Ah),
        __param(3, themeService_1.$gv),
        __param(4, configuration_1.$8h)
    ], $Fxb);
    //#region - Files
    class FileVirtualDelegate {
        getHeight(_element) {
            return 22;
        }
        getTemplateId(_element) {
            return 'FileStat';
        }
    }
    class FileIdentityProvider {
        getId(element) {
            if (uri_1.URI.isUri(element)) {
                return element.toString();
            }
            else if ((0, workspace_1.$Sh)(element)) {
                return element.id;
            }
            else if ((0, workspace_1.$Th)(element)) {
                return element.uri.toString();
            }
            else {
                return element.resource.toString();
            }
        }
    }
    let FileDataSource = class FileDataSource {
        constructor(c) {
            this.c = c;
        }
        hasChildren(element) {
            return uri_1.URI.isUri(element)
                || (0, workspace_1.$Sh)(element)
                || (0, workspace_1.$Th)(element)
                || element.isDirectory;
        }
        async getChildren(element) {
            if ((0, workspace_1.$Sh)(element)) {
                return element.folders;
            }
            let uri;
            if ((0, workspace_1.$Th)(element)) {
                uri = element.uri;
            }
            else if (uri_1.URI.isUri(element)) {
                uri = element;
            }
            else {
                uri = element.resource;
            }
            const stat = await this.c.resolve(uri);
            return stat.children ?? [];
        }
    };
    FileDataSource = __decorate([
        __param(0, files_1.$6j)
    ], FileDataSource);
    let FileRenderer = class FileRenderer {
        constructor(c, d) {
            this.c = c;
            this.d = d;
            this.templateId = 'FileStat';
        }
        renderTemplate(container) {
            return this.c.create(container, { supportHighlights: true });
        }
        renderElement(node, index, templateData) {
            const fileDecorations = this.d.getValue('explorer.decorations');
            const { element } = node;
            let resource;
            let fileKind;
            if ((0, workspace_1.$Th)(element)) {
                resource = element.uri;
                fileKind = files_1.FileKind.ROOT_FOLDER;
            }
            else {
                resource = element.resource;
                fileKind = element.isDirectory ? files_1.FileKind.FOLDER : files_1.FileKind.FILE;
            }
            templateData.setFile(resource, {
                fileKind,
                hidePath: true,
                fileDecorations: fileDecorations,
                matches: (0, filters_1.$Hj)(node.filterData),
                extraClasses: ['picker-item']
            });
        }
        disposeTemplate(templateData) {
            templateData.dispose();
        }
    };
    FileRenderer = __decorate([
        __param(1, configuration_1.$8h)
    ], FileRenderer);
    class FileNavigationLabelProvider {
        getKeyboardNavigationLabel(element) {
            return element.name;
        }
    }
    class FileAccessibilityProvider {
        getWidgetAriaLabel() {
            return (0, nls_1.localize)(0, null);
        }
        getAriaLabel(element) {
            return element.name;
        }
    }
    let FileFilter = class FileFilter {
        constructor(f, configService) {
            this.f = f;
            this.c = new Map();
            this.d = new lifecycle_1.$jc();
            const config = breadcrumbs_1.$Bxb.FileExcludes.bindTo(configService);
            const update = () => {
                f.getWorkspace().folders.forEach(folder => {
                    const excludesConfig = config.getValue({ resource: folder.uri });
                    if (!excludesConfig) {
                        return;
                    }
                    // adjust patterns to be absolute in case they aren't
                    // free floating (**/)
                    const adjustedConfig = {};
                    for (const pattern in excludesConfig) {
                        if (typeof excludesConfig[pattern] !== 'boolean') {
                            continue;
                        }
                        const patternAbs = pattern.indexOf('**/') !== 0
                            ? path_1.$6d.join(folder.uri.path, pattern)
                            : pattern;
                        adjustedConfig[patternAbs] = excludesConfig[pattern];
                    }
                    this.c.set(folder.uri.toString(), glob.$rj(adjustedConfig));
                });
            };
            update();
            this.d.add(config);
            this.d.add(config.onDidChange(update));
            this.d.add(f.onDidChangeWorkspaceFolders(update));
        }
        dispose() {
            this.d.dispose();
        }
        filter(element, _parentVisibility) {
            if ((0, workspace_1.$Th)(element)) {
                // not a file
                return true;
            }
            const folder = this.f.getWorkspaceFolder(element.resource);
            if (!folder || !this.c.has(folder.uri.toString())) {
                // no folder or no filer
                return true;
            }
            const expression = this.c.get(folder.uri.toString());
            return !expression((0, path_1.$$d)(folder.uri.path, element.resource.path), (0, resources_1.$fg)(element.resource));
        }
    };
    FileFilter = __decorate([
        __param(0, workspace_1.$Kh),
        __param(1, configuration_1.$8h)
    ], FileFilter);
    class $Gxb {
        compare(a, b) {
            if ((0, workspace_1.$Th)(a) && (0, workspace_1.$Th)(b)) {
                return a.index - b.index;
            }
            if (a.isDirectory === b.isDirectory) {
                // same type -> compare on names
                return (0, comparers_1.$0p)(a.name, b.name);
            }
            else if (a.isDirectory) {
                return -1;
            }
            else {
                return 1;
            }
        }
    }
    exports.$Gxb = $Gxb;
    let $Hxb = class $Hxb extends $Fxb {
        constructor(parent, resource, instantiationService, themeService, configService, v, w) {
            super(parent, resource, instantiationService, themeService, configService);
            this.v = v;
            this.w = w;
        }
        s(container) {
            // tree icon theme specials
            this.g.classList.add('file-icon-themable-tree');
            this.g.classList.add('show-file-icons');
            const onFileIconThemeChange = (fileIconTheme) => {
                this.g.classList.toggle('align-icons-and-twisties', fileIconTheme.hasFileIcons && !fileIconTheme.hasFolderIcons);
                this.g.classList.toggle('hide-arrows', fileIconTheme.hidesExplorerArrows === true);
            };
            this.c.add(this.o.onDidFileIconThemeChange(onFileIconThemeChange));
            onFileIconThemeChange(this.o.getFileIconTheme());
            const labels = this.n.createInstance(labels_1.$Llb, labels_1.$Klb /* TODO@Jo visibility propagation */);
            this.c.add(labels);
            return this.n.createInstance(listService_1.$w4, 'BreadcrumbsFilePicker', container, new FileVirtualDelegate(), [this.n.createInstance(FileRenderer, labels)], this.n.createInstance(FileDataSource), {
                multipleSelectionSupport: false,
                sorter: new $Gxb(),
                filter: this.n.createInstance(FileFilter),
                identityProvider: new FileIdentityProvider(),
                keyboardNavigationLabelProvider: new FileNavigationLabelProvider(),
                accessibilityProvider: this.n.createInstance(FileAccessibilityProvider),
                showNotFoundMessage: false,
                overrideStyles: {
                    listBackground: colorRegistry_1.$oy
                },
            });
        }
        async r(element) {
            const { uri, kind } = element;
            let input;
            if (kind === files_1.FileKind.ROOT_FOLDER) {
                input = this.v.getWorkspace();
            }
            else {
                input = (0, resources_1.$hg)(uri);
            }
            const tree = this.h;
            await tree.setInput(input);
            let focusElement;
            for (const { element } of tree.getNode().children) {
                if ((0, workspace_1.$Th)(element) && (0, resources_1.$bg)(element.uri, uri)) {
                    focusElement = element;
                    break;
                }
                else if ((0, resources_1.$bg)(element.resource, uri)) {
                    focusElement = element;
                    break;
                }
            }
            if (focusElement) {
                tree.reveal(focusElement, 0.5);
                tree.setFocus([focusElement], this.i);
            }
            tree.domFocus();
        }
        t(_element) {
            return lifecycle_1.$kc.None;
        }
        async u(element, options, sideBySide) {
            if (!(0, workspace_1.$Th)(element) && element.isFile) {
                this.k.fire();
                await this.w.openEditor({ resource: element.resource, options }, sideBySide ? editorService_1.$$C : undefined);
                return true;
            }
            return false;
        }
    };
    exports.$Hxb = $Hxb;
    exports.$Hxb = $Hxb = __decorate([
        __param(2, instantiation_1.$Ah),
        __param(3, themeService_1.$gv),
        __param(4, configuration_1.$8h),
        __param(5, workspace_1.$Kh),
        __param(6, editorService_1.$9C)
    ], $Hxb);
    //#endregion
    //#region - Outline
    let OutlineTreeSorter = class OutlineTreeSorter {
        constructor(d, uri, configService) {
            this.d = d;
            this.c = configService.getValue(uri, 'breadcrumbs.symbolSortOrder');
        }
        compare(a, b) {
            if (this.c === 'name') {
                return this.d.compareByName(a, b);
            }
            else if (this.c === 'type') {
                return this.d.compareByType(a, b);
            }
            else {
                return this.d.compareByPosition(a, b);
            }
        }
    };
    OutlineTreeSorter = __decorate([
        __param(2, textResourceConfiguration_1.$FA)
    ], OutlineTreeSorter);
    class $Ixb extends $Fxb {
        s(container, input) {
            const { config } = input.outline;
            return this.n.createInstance(listService_1.$v4, 'BreadcrumbsOutlinePicker', container, config.delegate, config.renderers, config.treeDataSource, {
                ...config.options,
                sorter: this.n.createInstance(OutlineTreeSorter, config.comparator, undefined),
                collapseByDefault: true,
                expandOnlyOnTwistieClick: true,
                multipleSelectionSupport: false,
                showNotFoundMessage: false
            });
        }
        r(input) {
            const viewState = input.outline.captureViewState();
            this.restoreViewState = () => { viewState.dispose(); };
            const tree = this.h;
            tree.setInput(input.outline);
            if (input.element !== input.outline) {
                tree.reveal(input.element, 0.5);
                tree.setFocus([input.element], this.i);
            }
            tree.domFocus();
            return Promise.resolve();
        }
        t(element) {
            const outline = this.h.getInput();
            return outline.preview(element);
        }
        async u(element, options, sideBySide) {
            this.k.fire();
            const outline = this.h.getInput();
            await outline.reveal(element, options, sideBySide);
            return true;
        }
    }
    exports.$Ixb = $Ixb;
});
//#endregion
//# sourceMappingURL=breadcrumbsPicker.js.map