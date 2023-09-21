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
define(["require", "exports", "vs/base/common/comparers", "vs/base/common/errors", "vs/base/common/event", "vs/base/common/filters", "vs/base/common/glob", "vs/base/common/lifecycle", "vs/base/common/path", "vs/base/common/resources", "vs/base/common/uri", "vs/platform/configuration/common/configuration", "vs/platform/files/common/files", "vs/platform/instantiation/common/instantiation", "vs/platform/list/browser/listService", "vs/platform/theme/common/colorRegistry", "vs/platform/workspace/common/workspace", "vs/workbench/browser/labels", "vs/workbench/browser/parts/editor/breadcrumbs", "vs/platform/theme/common/themeService", "vs/nls", "vs/workbench/services/editor/common/editorService", "vs/editor/common/services/textResourceConfiguration", "vs/css!./media/breadcrumbscontrol"], function (require, exports, comparers_1, errors_1, event_1, filters_1, glob, lifecycle_1, path_1, resources_1, uri_1, configuration_1, files_1, instantiation_1, listService_1, colorRegistry_1, workspace_1, labels_1, breadcrumbs_1, themeService_1, nls_1, editorService_1, textResourceConfiguration_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.BreadcrumbsOutlinePicker = exports.BreadcrumbsFilePicker = exports.FileSorter = exports.BreadcrumbsPicker = void 0;
    let BreadcrumbsPicker = class BreadcrumbsPicker {
        constructor(parent, resource, _instantiationService, _themeService, _configurationService) {
            this.resource = resource;
            this._instantiationService = _instantiationService;
            this._themeService = _themeService;
            this._configurationService = _configurationService;
            this._disposables = new lifecycle_1.DisposableStore();
            this._fakeEvent = new UIEvent('fakeEvent');
            this._onWillPickElement = new event_1.Emitter();
            this.onWillPickElement = this._onWillPickElement.event;
            this._previewDispoables = new lifecycle_1.MutableDisposable();
            this._domNode = document.createElement('div');
            this._domNode.className = 'monaco-breadcrumbs-picker show-file-icons';
            parent.appendChild(this._domNode);
        }
        dispose() {
            this._disposables.dispose();
            this._previewDispoables.dispose();
            this._onWillPickElement.dispose();
            this._domNode.remove();
            setTimeout(() => this._tree.dispose(), 0); // tree cannot be disposed while being opened...
        }
        async show(input, maxHeight, width, arrowSize, arrowOffset) {
            const theme = this._themeService.getColorTheme();
            const color = theme.getColor(colorRegistry_1.breadcrumbsPickerBackground);
            this._arrow = document.createElement('div');
            this._arrow.className = 'arrow';
            this._arrow.style.borderColor = `transparent transparent ${color ? color.toString() : ''}`;
            this._domNode.appendChild(this._arrow);
            this._treeContainer = document.createElement('div');
            this._treeContainer.style.background = color ? color.toString() : '';
            this._treeContainer.style.paddingTop = '2px';
            this._treeContainer.style.borderRadius = '3px';
            this._treeContainer.style.boxShadow = `0 0 8px 2px ${this._themeService.getColorTheme().getColor(colorRegistry_1.widgetShadow)}`;
            this._treeContainer.style.border = `1px solid ${this._themeService.getColorTheme().getColor(colorRegistry_1.widgetBorder)}`;
            this._domNode.appendChild(this._treeContainer);
            this._layoutInfo = { maxHeight, width, arrowSize, arrowOffset, inputHeight: 0 };
            this._tree = this._createTree(this._treeContainer, input);
            this._disposables.add(this._tree.onDidOpen(async (e) => {
                const { element, editorOptions, sideBySide } = e;
                const didReveal = await this._revealElement(element, { ...editorOptions, preserveFocus: false }, sideBySide);
                if (!didReveal) {
                    return;
                }
            }));
            this._disposables.add(this._tree.onDidChangeFocus(e => {
                this._previewDispoables.value = this._previewElement(e.elements[0]);
            }));
            this._disposables.add(this._tree.onDidChangeContentHeight(() => {
                this._layout();
            }));
            this._domNode.focus();
            try {
                await this._setInput(input);
                this._layout();
            }
            catch (err) {
                (0, errors_1.onUnexpectedError)(err);
            }
        }
        _layout() {
            const headerHeight = 2 * this._layoutInfo.arrowSize;
            const treeHeight = Math.min(this._layoutInfo.maxHeight - headerHeight, this._tree.contentHeight);
            const totalHeight = treeHeight + headerHeight;
            this._domNode.style.height = `${totalHeight}px`;
            this._domNode.style.width = `${this._layoutInfo.width}px`;
            this._arrow.style.top = `-${2 * this._layoutInfo.arrowSize}px`;
            this._arrow.style.borderWidth = `${this._layoutInfo.arrowSize}px`;
            this._arrow.style.marginLeft = `${this._layoutInfo.arrowOffset}px`;
            this._treeContainer.style.height = `${treeHeight}px`;
            this._treeContainer.style.width = `${this._layoutInfo.width}px`;
            this._tree.layout(treeHeight, this._layoutInfo.width);
        }
        restoreViewState() { }
    };
    exports.BreadcrumbsPicker = BreadcrumbsPicker;
    exports.BreadcrumbsPicker = BreadcrumbsPicker = __decorate([
        __param(2, instantiation_1.IInstantiationService),
        __param(3, themeService_1.IThemeService),
        __param(4, configuration_1.IConfigurationService)
    ], BreadcrumbsPicker);
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
            else if ((0, workspace_1.isWorkspace)(element)) {
                return element.id;
            }
            else if ((0, workspace_1.isWorkspaceFolder)(element)) {
                return element.uri.toString();
            }
            else {
                return element.resource.toString();
            }
        }
    }
    let FileDataSource = class FileDataSource {
        constructor(_fileService) {
            this._fileService = _fileService;
        }
        hasChildren(element) {
            return uri_1.URI.isUri(element)
                || (0, workspace_1.isWorkspace)(element)
                || (0, workspace_1.isWorkspaceFolder)(element)
                || element.isDirectory;
        }
        async getChildren(element) {
            if ((0, workspace_1.isWorkspace)(element)) {
                return element.folders;
            }
            let uri;
            if ((0, workspace_1.isWorkspaceFolder)(element)) {
                uri = element.uri;
            }
            else if (uri_1.URI.isUri(element)) {
                uri = element;
            }
            else {
                uri = element.resource;
            }
            const stat = await this._fileService.resolve(uri);
            return stat.children ?? [];
        }
    };
    FileDataSource = __decorate([
        __param(0, files_1.IFileService)
    ], FileDataSource);
    let FileRenderer = class FileRenderer {
        constructor(_labels, _configService) {
            this._labels = _labels;
            this._configService = _configService;
            this.templateId = 'FileStat';
        }
        renderTemplate(container) {
            return this._labels.create(container, { supportHighlights: true });
        }
        renderElement(node, index, templateData) {
            const fileDecorations = this._configService.getValue('explorer.decorations');
            const { element } = node;
            let resource;
            let fileKind;
            if ((0, workspace_1.isWorkspaceFolder)(element)) {
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
                matches: (0, filters_1.createMatches)(node.filterData),
                extraClasses: ['picker-item']
            });
        }
        disposeTemplate(templateData) {
            templateData.dispose();
        }
    };
    FileRenderer = __decorate([
        __param(1, configuration_1.IConfigurationService)
    ], FileRenderer);
    class FileNavigationLabelProvider {
        getKeyboardNavigationLabel(element) {
            return element.name;
        }
    }
    class FileAccessibilityProvider {
        getWidgetAriaLabel() {
            return (0, nls_1.localize)('breadcrumbs', "Breadcrumbs");
        }
        getAriaLabel(element) {
            return element.name;
        }
    }
    let FileFilter = class FileFilter {
        constructor(_workspaceService, configService) {
            this._workspaceService = _workspaceService;
            this._cachedExpressions = new Map();
            this._disposables = new lifecycle_1.DisposableStore();
            const config = breadcrumbs_1.BreadcrumbsConfig.FileExcludes.bindTo(configService);
            const update = () => {
                _workspaceService.getWorkspace().folders.forEach(folder => {
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
                            ? path_1.posix.join(folder.uri.path, pattern)
                            : pattern;
                        adjustedConfig[patternAbs] = excludesConfig[pattern];
                    }
                    this._cachedExpressions.set(folder.uri.toString(), glob.parse(adjustedConfig));
                });
            };
            update();
            this._disposables.add(config);
            this._disposables.add(config.onDidChange(update));
            this._disposables.add(_workspaceService.onDidChangeWorkspaceFolders(update));
        }
        dispose() {
            this._disposables.dispose();
        }
        filter(element, _parentVisibility) {
            if ((0, workspace_1.isWorkspaceFolder)(element)) {
                // not a file
                return true;
            }
            const folder = this._workspaceService.getWorkspaceFolder(element.resource);
            if (!folder || !this._cachedExpressions.has(folder.uri.toString())) {
                // no folder or no filer
                return true;
            }
            const expression = this._cachedExpressions.get(folder.uri.toString());
            return !expression((0, path_1.relative)(folder.uri.path, element.resource.path), (0, resources_1.basename)(element.resource));
        }
    };
    FileFilter = __decorate([
        __param(0, workspace_1.IWorkspaceContextService),
        __param(1, configuration_1.IConfigurationService)
    ], FileFilter);
    class FileSorter {
        compare(a, b) {
            if ((0, workspace_1.isWorkspaceFolder)(a) && (0, workspace_1.isWorkspaceFolder)(b)) {
                return a.index - b.index;
            }
            if (a.isDirectory === b.isDirectory) {
                // same type -> compare on names
                return (0, comparers_1.compareFileNames)(a.name, b.name);
            }
            else if (a.isDirectory) {
                return -1;
            }
            else {
                return 1;
            }
        }
    }
    exports.FileSorter = FileSorter;
    let BreadcrumbsFilePicker = class BreadcrumbsFilePicker extends BreadcrumbsPicker {
        constructor(parent, resource, instantiationService, themeService, configService, _workspaceService, _editorService) {
            super(parent, resource, instantiationService, themeService, configService);
            this._workspaceService = _workspaceService;
            this._editorService = _editorService;
        }
        _createTree(container) {
            // tree icon theme specials
            this._treeContainer.classList.add('file-icon-themable-tree');
            this._treeContainer.classList.add('show-file-icons');
            const onFileIconThemeChange = (fileIconTheme) => {
                this._treeContainer.classList.toggle('align-icons-and-twisties', fileIconTheme.hasFileIcons && !fileIconTheme.hasFolderIcons);
                this._treeContainer.classList.toggle('hide-arrows', fileIconTheme.hidesExplorerArrows === true);
            };
            this._disposables.add(this._themeService.onDidFileIconThemeChange(onFileIconThemeChange));
            onFileIconThemeChange(this._themeService.getFileIconTheme());
            const labels = this._instantiationService.createInstance(labels_1.ResourceLabels, labels_1.DEFAULT_LABELS_CONTAINER /* TODO@Jo visibility propagation */);
            this._disposables.add(labels);
            return this._instantiationService.createInstance(listService_1.WorkbenchAsyncDataTree, 'BreadcrumbsFilePicker', container, new FileVirtualDelegate(), [this._instantiationService.createInstance(FileRenderer, labels)], this._instantiationService.createInstance(FileDataSource), {
                multipleSelectionSupport: false,
                sorter: new FileSorter(),
                filter: this._instantiationService.createInstance(FileFilter),
                identityProvider: new FileIdentityProvider(),
                keyboardNavigationLabelProvider: new FileNavigationLabelProvider(),
                accessibilityProvider: this._instantiationService.createInstance(FileAccessibilityProvider),
                showNotFoundMessage: false,
                overrideStyles: {
                    listBackground: colorRegistry_1.breadcrumbsPickerBackground
                },
            });
        }
        async _setInput(element) {
            const { uri, kind } = element;
            let input;
            if (kind === files_1.FileKind.ROOT_FOLDER) {
                input = this._workspaceService.getWorkspace();
            }
            else {
                input = (0, resources_1.dirname)(uri);
            }
            const tree = this._tree;
            await tree.setInput(input);
            let focusElement;
            for (const { element } of tree.getNode().children) {
                if ((0, workspace_1.isWorkspaceFolder)(element) && (0, resources_1.isEqual)(element.uri, uri)) {
                    focusElement = element;
                    break;
                }
                else if ((0, resources_1.isEqual)(element.resource, uri)) {
                    focusElement = element;
                    break;
                }
            }
            if (focusElement) {
                tree.reveal(focusElement, 0.5);
                tree.setFocus([focusElement], this._fakeEvent);
            }
            tree.domFocus();
        }
        _previewElement(_element) {
            return lifecycle_1.Disposable.None;
        }
        async _revealElement(element, options, sideBySide) {
            if (!(0, workspace_1.isWorkspaceFolder)(element) && element.isFile) {
                this._onWillPickElement.fire();
                await this._editorService.openEditor({ resource: element.resource, options }, sideBySide ? editorService_1.SIDE_GROUP : undefined);
                return true;
            }
            return false;
        }
    };
    exports.BreadcrumbsFilePicker = BreadcrumbsFilePicker;
    exports.BreadcrumbsFilePicker = BreadcrumbsFilePicker = __decorate([
        __param(2, instantiation_1.IInstantiationService),
        __param(3, themeService_1.IThemeService),
        __param(4, configuration_1.IConfigurationService),
        __param(5, workspace_1.IWorkspaceContextService),
        __param(6, editorService_1.IEditorService)
    ], BreadcrumbsFilePicker);
    //#endregion
    //#region - Outline
    let OutlineTreeSorter = class OutlineTreeSorter {
        constructor(comparator, uri, configService) {
            this.comparator = comparator;
            this._order = configService.getValue(uri, 'breadcrumbs.symbolSortOrder');
        }
        compare(a, b) {
            if (this._order === 'name') {
                return this.comparator.compareByName(a, b);
            }
            else if (this._order === 'type') {
                return this.comparator.compareByType(a, b);
            }
            else {
                return this.comparator.compareByPosition(a, b);
            }
        }
    };
    OutlineTreeSorter = __decorate([
        __param(2, textResourceConfiguration_1.ITextResourceConfigurationService)
    ], OutlineTreeSorter);
    class BreadcrumbsOutlinePicker extends BreadcrumbsPicker {
        _createTree(container, input) {
            const { config } = input.outline;
            return this._instantiationService.createInstance(listService_1.WorkbenchDataTree, 'BreadcrumbsOutlinePicker', container, config.delegate, config.renderers, config.treeDataSource, {
                ...config.options,
                sorter: this._instantiationService.createInstance(OutlineTreeSorter, config.comparator, undefined),
                collapseByDefault: true,
                expandOnlyOnTwistieClick: true,
                multipleSelectionSupport: false,
                showNotFoundMessage: false
            });
        }
        _setInput(input) {
            const viewState = input.outline.captureViewState();
            this.restoreViewState = () => { viewState.dispose(); };
            const tree = this._tree;
            tree.setInput(input.outline);
            if (input.element !== input.outline) {
                tree.reveal(input.element, 0.5);
                tree.setFocus([input.element], this._fakeEvent);
            }
            tree.domFocus();
            return Promise.resolve();
        }
        _previewElement(element) {
            const outline = this._tree.getInput();
            return outline.preview(element);
        }
        async _revealElement(element, options, sideBySide) {
            this._onWillPickElement.fire();
            const outline = this._tree.getInput();
            await outline.reveal(element, options, sideBySide);
            return true;
        }
    }
    exports.BreadcrumbsOutlinePicker = BreadcrumbsOutlinePicker;
});
//#endregion
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYnJlYWRjcnVtYnNQaWNrZXIuanMiLCJzb3VyY2VSb290IjoiZmlsZTovLy93b3Jrc3BhY2UvYXBwZmxvdy9zcmMvIiwic291cmNlcyI6WyJ2cy93b3JrYmVuY2gvYnJvd3Nlci9wYXJ0cy9lZGl0b3IvYnJlYWRjcnVtYnNQaWNrZXIudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7OztnR0FHZ0c7Ozs7Ozs7Ozs7Ozs7O0lBOEN6RixJQUFlLGlCQUFpQixHQUFoQyxNQUFlLGlCQUFpQjtRQWV0QyxZQUNDLE1BQW1CLEVBQ1QsUUFBYSxFQUNBLHFCQUErRCxFQUN2RSxhQUErQyxFQUN2QyxxQkFBK0Q7WUFINUUsYUFBUSxHQUFSLFFBQVEsQ0FBSztZQUNtQiwwQkFBcUIsR0FBckIscUJBQXFCLENBQXVCO1lBQ3BELGtCQUFhLEdBQWIsYUFBYSxDQUFlO1lBQ3BCLDBCQUFxQixHQUFyQixxQkFBcUIsQ0FBdUI7WUFsQnBFLGlCQUFZLEdBQUcsSUFBSSwyQkFBZSxFQUFFLENBQUM7WUFLOUMsZUFBVSxHQUFHLElBQUksT0FBTyxDQUFDLFdBQVcsQ0FBQyxDQUFDO1lBRzdCLHVCQUFrQixHQUFHLElBQUksZUFBTyxFQUFRLENBQUM7WUFDbkQsc0JBQWlCLEdBQWdCLElBQUksQ0FBQyxrQkFBa0IsQ0FBQyxLQUFLLENBQUM7WUFFdkQsdUJBQWtCLEdBQUcsSUFBSSw2QkFBaUIsRUFBRSxDQUFDO1lBUzdELElBQUksQ0FBQyxRQUFRLEdBQUcsUUFBUSxDQUFDLGFBQWEsQ0FBQyxLQUFLLENBQUMsQ0FBQztZQUM5QyxJQUFJLENBQUMsUUFBUSxDQUFDLFNBQVMsR0FBRywyQ0FBMkMsQ0FBQztZQUN0RSxNQUFNLENBQUMsV0FBVyxDQUFDLElBQUksQ0FBQyxRQUFRLENBQUMsQ0FBQztRQUNuQyxDQUFDO1FBRUQsT0FBTztZQUNOLElBQUksQ0FBQyxZQUFZLENBQUMsT0FBTyxFQUFFLENBQUM7WUFDNUIsSUFBSSxDQUFDLGtCQUFrQixDQUFDLE9BQU8sRUFBRSxD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