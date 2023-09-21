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
define(["require", "exports", "vs/base/browser/dom", "vs/base/common/glob", "vs/platform/progress/common/progress", "vs/platform/notification/common/notification", "vs/platform/files/common/files", "vs/workbench/services/layout/browser/layoutService", "vs/platform/workspace/common/workspace", "vs/base/common/lifecycle", "vs/platform/contextview/browser/contextView", "vs/platform/theme/common/themeService", "vs/platform/configuration/common/configuration", "vs/base/common/resources", "vs/base/browser/ui/inputbox/inputBox", "vs/nls", "vs/base/common/functional", "vs/base/common/objects", "vs/base/common/path", "vs/workbench/contrib/files/common/explorerModel", "vs/base/common/comparers", "vs/platform/dnd/browser/dnd", "vs/workbench/browser/dnd", "vs/platform/instantiation/common/instantiation", "vs/base/browser/dnd", "vs/base/common/network", "vs/base/browser/ui/list/listView", "vs/base/common/platform", "vs/platform/dialogs/common/dialogs", "vs/workbench/services/workspaces/common/workspaceEditing", "vs/workbench/services/editor/common/editorService", "vs/workbench/contrib/files/browser/fileActions", "vs/base/common/filters", "vs/base/common/event", "vs/platform/label/common/label", "vs/base/common/types", "vs/platform/uriIdentity/common/uriIdentity", "vs/editor/browser/services/bulkEditService", "vs/workbench/contrib/files/browser/files", "vs/workbench/contrib/files/browser/fileImportExport", "vs/base/common/errorMessage", "vs/platform/files/browser/webFileSystemAccess", "vs/workbench/services/search/common/ignoreFile", "vs/base/common/map", "vs/base/common/ternarySearchTree", "vs/platform/theme/browser/defaultStyles", "vs/base/common/async", "vs/workbench/services/hover/browser/hover", "vs/workbench/services/filesConfiguration/common/filesConfigurationService"], function (require, exports, DOM, glob, progress_1, notification_1, files_1, layoutService_1, workspace_1, lifecycle_1, contextView_1, themeService_1, configuration_1, resources_1, inputBox_1, nls_1, functional_1, objects_1, path, explorerModel_1, comparers_1, dnd_1, dnd_2, instantiation_1, dnd_3, network_1, listView_1, platform_1, dialogs_1, workspaceEditing_1, editorService_1, fileActions_1, filters_1, event_1, label_1, types_1, uriIdentity_1, bulkEditService_1, files_2, fileImportExport_1, errorMessage_1, webFileSystemAccess_1, ignoreFile_1, map_1, ternarySearchTree_1, defaultStyles_1, async_1, hover_1, filesConfigurationService_1) {
    "use strict";
    var FilesRenderer_1, FileDragAndDrop_1;
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.ExplorerCompressionDelegate = exports.isCompressedFolderName = exports.FileDragAndDrop = exports.FileSorter = exports.FilesFilter = exports.FilesRenderer = exports.CompressedNavigationController = exports.ExplorerDataSource = exports.explorerRootErrorEmitter = exports.ExplorerDelegate = void 0;
    class ExplorerDelegate {
        static { this.ITEM_HEIGHT = 22; }
        getHeight(element) {
            return ExplorerDelegate.ITEM_HEIGHT;
        }
        getTemplateId(element) {
            return FilesRenderer.ID;
        }
    }
    exports.ExplorerDelegate = ExplorerDelegate;
    exports.explorerRootErrorEmitter = new event_1.Emitter();
    let ExplorerDataSource = class ExplorerDataSource {
        constructor(fileFilter, progressService, configService, notificationService, layoutService, fileService, explorerService, contextService, filesConfigService) {
            this.fileFilter = fileFilter;
            this.progressService = progressService;
            this.configService = configService;
            this.notificationService = notificationService;
            this.layoutService = layoutService;
            this.fileService = fileService;
            this.explorerService = explorerService;
            this.contextService = contextService;
            this.filesConfigService = filesConfigService;
        }
        hasChildren(element) {
            // don't render nest parents as containing children when all the children are filtered out
            return Array.isArray(element) || element.hasChildren((stat) => this.fileFilter.filter(stat, 1 /* TreeVisibility.Visible */));
        }
        getChildren(element) {
            if (Array.isArray(element)) {
                return element;
            }
            const hasError = element.error;
            const sortOrder = this.explorerService.sortOrderConfiguration.sortOrder;
            const children = element.fetchChildren(sortOrder);
            if (Array.isArray(children)) {
                // fast path when children are known sync (i.e. nested children)
                return children;
            }
            const promise = children.then(children => {
                // Clear previous error decoration on root folder
                if (element instanceof explorerModel_1.ExplorerItem && element.isRoot && !element.error && hasError && this.contextService.getWorkbenchState() !== 2 /* WorkbenchState.FOLDER */) {
                    exports.explorerRootErrorEmitter.fire(element.resource);
                }
                return children;
            }, e => {
                if (element instanceof explorerModel_1.ExplorerItem && element.isRoot) {
                    if (this.contextService.getWorkbenchState() === 2 /* WorkbenchState.FOLDER */) {
                        // Single folder create a dummy explorer item to show error
                        const placeholder = new explorerModel_1.ExplorerItem(element.resource, this.fileService, this.configService, this.filesConfigService, undefined, undefined, false);
                        placeholder.error = e;
                        return [placeholder];
                    }
                    else {
                        exports.explorerRootErrorEmitter.fire(element.resource);
                    }
                }
                else {
                    // Do not show error for roots since we already use an explorer decoration to notify user
                    this.notificationService.error(e);
                }
                return []; // we could not resolve any children because of an error
            });
            this.progressService.withProgress({
                location: 1 /* ProgressLocation.Explorer */,
                delay: this.layoutService.isRestored() ? 800 : 1500 // reduce progress visibility when still restoring
            }, _progress => promise);
            return promise;
        }
    };
    exports.ExplorerDataSource = ExplorerDataSource;
    exports.ExplorerDataSource = ExplorerDataSource = __decorate([
        __param(1, progress_1.IProgressService),
        __param(2, configuration_1.IConfigurationService),
        __param(3, notification_1.INotificationService),
        __param(4, layoutService_1.IWorkbenchLayoutService),
        __param(5, files_1.IFileService),
        __param(6, files_2.IExplorerService),
        __param(7, workspace_1.IWorkspaceContextService),
        __param(8, filesConfigurationService_1.IFilesConfigurationService)
    ], ExplorerDataSource);
    class CompressedNavigationController {
        static { this.ID = 0; }
        get index() { return this._index; }
        get count() { return this.items.length; }
        get current() { return this.items[this._index]; }
        get currentId() { return `${this.id}_${this.index}`; }
        get labels() { return this._labels; }
        constructor(id, items, templateData, depth, collapsed) {
            this.id = id;
            this.items = items;
            this.depth = depth;
            this.collapsed = collapsed;
            this._onDidChange = new event_1.Emitter();
            this.onDidChange = this._onDidChange.event;
            this._index = items.length - 1;
            this.updateLabels(templateData);
            this._updateLabelDisposable = templateData.label.onDidRender(() => this.updateLabels(templateData));
        }
        updateLabels(templateData) {
            this._labels = Array.from(templateData.container.querySelectorAll('.label-name'));
            let parents = '';
            for (let i = 0; i < this.labels.length; i++) {
                const ariaLabel = parents.length ? `${this.items[i].name}, compact, ${parents}` : this.items[i].name;
                this.labels[i].setAttribute('aria-label', ariaLabel);
                this.labels[i].setAttribute('aria-level', `${this.depth + i}`);
                parents = parents.length ? `${this.items[i].name} ${parents}` : this.items[i].name;
            }
            this.updateCollapsed(this.collapsed);
            if (this._index < this.labels.length) {
                this.labels[this._index].classList.add('active');
            }
        }
        previous() {
            if (this._index <= 0) {
                return;
            }
            this.setIndex(this._index - 1);
        }
        next() {
            if (this._index >= this.items.length - 1) {
                return;
            }
            this.setIndex(this._index + 1);
        }
        first() {
            if (this._index === 0) {
                return;
            }
            this.setIndex(0);
        }
        last() {
            if (this._index === this.items.length - 1) {
                return;
            }
            this.setIndex(this.items.length - 1);
        }
        setIndex(index) {
            if (index < 0 || index >= this.items.length) {
                return;
            }
            this.labels[this._index].classList.remove('active');
            this._index = index;
            this.labels[this._index].classList.add('active');
            this._onDidChange.fire();
        }
        updateCollapsed(collapsed) {
            this.collapsed = collapsed;
            for (let i = 0; i < this.labels.length; i++) {
                this.labels[i].setAttribute('aria-expanded', collapsed ? 'false' : 'true');
            }
        }
        dispose() {
            this._onDidChange.dispose();
            this._updateLabelDisposable.dispose();
        }
    }
    exports.CompressedNavigationController = CompressedNavigationController;
    let FilesRenderer = class FilesRenderer {
        static { FilesRenderer_1 = this; }
        static { this.ID = 'file'; }
        constructor(container, labels, updateWidth, contextViewService, themeService, configurationService, explorerService, labelService, contextService, contextMenuService, hoverService) {
            this.labels = labels;
            this.updateWidth = updateWidth;
            this.contextViewService = contextViewService;
            this.themeService = themeService;
            this.configurationService = configurationService;
            this.explorerService = explorerService;
            this.labelService = labelService;
            this.contextService = contextService;
            this.contextMenuService = contextMenuService;
            this.hoverService = hoverService;
            this.compressedNavigationControllers = new Map();
            this._onDidChangeActiveDescendant = new event_1.EventMultiplexer();
            this.onDidChangeActiveDescendant = this._onDidChangeActiveDescendant.event;
            this.hoverDelegate = new class {
                get delay() {
                    // Delay implementation borrowed froms src/vs/workbench/browser/parts/statusbar/statusbarPart.ts
                    if (Date.now() - this.lastHoverHideTime < 500) {
                        return 0; // show instantly when a hover was recently shown
                    }
                    return this.configurationService.getValue('workbench.hover.delay');
                }
                constructor(configurationService, hoverService) {
                    this.configurationService = configurationService;
                    this.hoverService = hoverService;
                    this.lastHoverHideTime = 0;
                    this.hiddenFromClick = false;
                    this.placement = 'element';
                }
                showHover(options, focus) {
                    let element;
                    if (options.target instanceof HTMLElement) {
                        element = options.target;
                    }
                    else {
                        element = options.target.targetElements[0];
                    }
                    const tlRow = element.closest('.monaco-tl-row');
                    const listRow = tlRow?.closest('.monaco-list-row');
                    const child = element.querySelector('div.monaco-icon-label-container');
                    const childOfChild = child?.querySelector('span.monaco-icon-name-container');
                    let overflowed = false;
                    if (childOfChild && child) {
                        const width = child.clientWidth;
                        const childWidth = childOfChild.offsetWidth;
                        // Check if element is overflowing its parent container
                        overflowed = width <= childWidth;
                    }
                    // Only count decorations that provide additional info, as hover overing decorations such as git excluded isn't helpful
                    const hasDecoration = options.content.toString().includes('•');
                    // If it's overflowing or has a decoration show the tooltip
                    overflowed = overflowed || hasDecoration;
                    const indentGuideElement = tlRow?.querySelector('.monaco-tl-indent');
                    if (!indentGuideElement) {
                        return;
                    }
                    return overflowed ? this.hoverService.showHover({
                        ...options,
                        target: indentGuideElement,
                        compact: true,
                        container: listRow,
                        additionalClasses: ['explorer-item-hover'],
                        skipFadeInAnimation: true,
                        showPointer: false,
                        hoverPosition: 1 /* HoverPosition.RIGHT */,
                    }, focus) : undefined;
                }
                onDidHideHover() {
                    if (!this.hiddenFromClick) {
                        this.lastHoverHideTime = Date.now();
                    }
                    this.hiddenFromClick = false;
                }
            }(this.configurationService, this.hoverService);
            this.config = this.configurationService.getValue();
            const updateOffsetStyles = () => {
                const indent = this.configurationService.getValue('workbench.tree.indent');
                const offset = Math.max(22 - indent, 0); // derived via inspection
                container.style.setProperty(`--vscode-explorer-align-offset-margin-left`, `${offset}px`);
            };
            this.configListener = this.configurationService.onDidChangeConfiguration(e => {
                if (e.affectsConfiguration('explorer')) {
                    this.config = this.configurationService.getValue();
                }
                if (e.affectsConfiguration('workbench.tree.indent')) {
                    updateOffsetStyles();
                }
            });
            updateOffsetStyles();
        }
        getWidgetAriaLabel() {
            return (0, nls_1.localize)('treeAriaLabel', "Files Explorer");
        }
        get templateId() {
            return FilesRenderer_1.ID;
        }
        renderTemplate(container) {
            const templateDisposables = new lifecycle_1.DisposableStore();
            const experimentalHover = this.configurationService.getValue('explorer.experimental.hover');
            const label = templateDisposables.add(this.labels.create(container, { supportHighlights: true, hoverDelegate: experimentalHover ? this.hoverDelegate : undefined }));
            templateDisposables.add(label.onDidRender(() => {
                try {
                    if (templateData.currentContext) {
                        this.updateWidth(templateData.currentContext);
                    }
                }
                catch (e) {
                    // noop since the element might no longer be in the tree, no update of width necessary
                }
            }));
            const templateData = { templateDisposables, elementDisposables: templateDisposables.add(new lifecycle_1.DisposableStore()), label, container };
            return templateData;
        }
        renderElement(node, index, templateData) {
            const stat = node.element;
            templateData.currentContext = stat;
            const editableData = this.explorerService.getEditableData(stat);
            templateData.label.element.classList.remove('compressed');
            // File Label
            if (!editableData) {
                templateData.label.element.style.display = 'flex';
                this.renderStat(stat, stat.name, undefined, node.filterData, templateData);
            }
            // Input Box
            else {
                templateData.label.element.style.display = 'none';
                templateData.elementDisposables.add(this.renderInputBox(templateData.container, stat, editableData));
            }
        }
        renderCompressedElements(node, index, templateData, height) {
            const stat = node.element.elements[node.element.elements.length - 1];
            templateData.currentContext = stat;
            const editable = node.element.elements.filter(e => this.explorerService.isEditable(e));
            const editableData = editable.length === 0 ? undefined : this.explorerService.getEditableData(editable[0]);
            // File Label
            if (!editableData) {
                templateData.label.element.classList.add('compressed');
                templateData.label.element.style.display = 'flex';
                const id = `compressed-explorer_${CompressedNavigationController.ID++}`;
                const label = node.element.elements.map(e => e.name);
                this.renderStat(stat, label, id, node.filterData, templateData);
                const compressedNavigationController = new CompressedNavigationController(id, node.element.elements, templateData, node.depth, node.collapsed);
                templateData.elementDisposables.add(compressedNavigationController);
                this.compressedNavigationControllers.set(stat, compressedNavigationController);
                // accessibility
                templateData.elementDisposables.add(this._onDidChangeActiveDescendant.add(compressedNavigationController.onDidChange));
                templateData.elementDisposables.add(DOM.addDisposableListener(templateData.container, 'mousedown', e => {
                    const result = getIconLabelNameFromHTMLElement(e.target);
                    if (result) {
                        compressedNavigationController.setIndex(result.index);
                    }
                }));
                templateData.elementDisposables.add((0, lifecycle_1.toDisposable)(() => this.compressedNavigationControllers.delete(stat)));
            }
            // Input Box
            else {
                templateData.label.element.classList.remove('compressed');
                templateData.label.element.style.display = 'none';
                templateData.elementDisposables.add(this.renderInputBox(templateData.container, editable[0], editableData));
            }
        }
        renderStat(stat, label, domId, filterData, templateData) {
            templateData.label.element.style.display = 'flex';
            const extraClasses = ['explorer-item'];
            if (this.explorerService.isCut(stat)) {
                extraClasses.push('cut');
            }
            // Offset nested children unless folders have both chevrons and icons, otherwise alignment breaks
            const theme = this.themeService.getFileIconTheme();
            // Hack to always render chevrons for file nests, or else may not be able to identify them.
            const twistieContainer = templateData.container.parentElement?.parentElement?.querySelector('.monaco-tl-twistie');
            twistieContainer?.classList.toggle('force-twistie', stat.hasNests && theme.hidesExplorerArrows);
            // when explorer arrows are hidden or there are no folder icons, nests get misaligned as they are forced to have arrows and files typically have icons
            // Apply some CSS magic to get things looking as reasonable as possible.
            const themeIsUnhappyWithNesting = theme.hasFileIcons && (theme.hidesExplorerArrows || !theme.hasFolderIcons);
            const realignNestedChildren = stat.nestedParent && themeIsUnhappyWithNesting;
            const experimentalHover = this.configurationService.getValue('explorer.experimental.hover');
            templateData.label.setResource({ resource: stat.resource, name: label }, {
                title: experimentalHover ? (0, types_1.isStringArray)(label) ? label[0] : label : undefined,
                fileKind: stat.isRoot ? files_1.FileKind.ROOT_FOLDER : stat.isDirectory ? files_1.FileKind.FOLDER : files_1.FileKind.FILE,
                extraClasses: realignNestedChildren ? [...extraClasses, 'align-nest-icon-with-parent-icon'] : extraClasses,
                fileDecorations: this.config.explorer.decorations,
                matches: (0, filters_1.createMatches)(filterData),
                separator: this.labelService.getSeparator(stat.resource.scheme, stat.resource.authority),
                domId
            });
        }
        renderInputBox(container, stat, editableData) {
            // Use a file label only for the icon next to the input box
            const label = this.labels.create(container);
            const extraClasses = ['explorer-item', 'explorer-item-edited'];
            const fileKind = stat.isRoot ? files_1.FileKind.ROOT_FOLDER : stat.isDirectory ? files_1.FileKind.FOLDER : files_1.FileKind.FILE;
            const theme = this.themeService.getFileIconTheme();
            const themeIsUnhappyWithNesting = theme.hasFileIcons && (theme.hidesExplorerArrows || !theme.hasFolderIcons);
            const realignNestedChildren = stat.nestedParent && themeIsUnhappyWithNesting;
            const labelOptions = {
                hidePath: true,
                hideLabel: true,
                fileKind,
                extraClasses: realignNestedChildren ? [...extraClasses, 'align-nest-icon-with-parent-icon'] : extraClasses,
            };
            const parent = stat.name ? (0, resources_1.dirname)(stat.resource) : stat.resource;
            const value = stat.name || '';
            label.setFile((0, resources_1.joinPath)(parent, value || ' '), labelOptions); // Use icon for ' ' if name is empty.
            // hack: hide label
            label.element.firstElementChild.style.display = 'none';
            // Input field for name
            const inputBox = new inputBox_1.InputBox(label.element, this.contextViewService, {
                validationOptions: {
                    validation: (value) => {
                        const message = editableData.validationMessage(value);
                        if (!message || message.severity !== notification_1.Severity.Error) {
                            return null;
                        }
                        return {
                            content: message.content,
                            formatContent: true,
                            type: 3 /* MessageType.ERROR */
                        };
                    }
                },
                ariaLabel: (0, nls_1.localize)('fileInputAriaLabel', "Type file name. Press Enter to confirm or Escape to cancel."),
                inputBoxStyles: defaultStyles_1.defaultInputBoxStyles
            });
            const lastDot = value.lastIndexOf('.');
            let currentSelectionState = 'prefix';
            inputBox.value = value;
            inputBox.focus();
            inputBox.select({ start: 0, end: lastDot > 0 && !stat.isDirectory ? lastDot : value.length });
            const done = (0, functional_1.once)((success, finishEditing) => {
                label.element.style.display = 'none';
                const value = inputBox.value;
                (0, lifecycle_1.dispose)(toDispose);
                label.element.remove();
                if (finishEditing) {
                    editableData.onFinish(value, success);
                }
            });
            const showInputBoxNotification = () => {
                if (inputBox.isInputValid()) {
                    const message = editableData.validationMessage(inputBox.value);
                    if (message) {
                        inputBox.showMessage({
                            content: message.content,
                            formatContent: true,
                            type: message.severity === notification_1.Severity.Info ? 1 /* MessageType.INFO */ : message.severity === notification_1.Severity.Warning ? 2 /* MessageType.WARNING */ : 3 /* MessageType.ERROR */
                        });
                    }
                    else {
                        inputBox.hideMessage();
                    }
                }
            };
            showInputBoxNotification();
            const toDispose = [
                inputBox,
                inputBox.onDidChange(value => {
                    label.setFile((0, resources_1.joinPath)(parent, value || ' '), labelOptions); // update label icon while typing!
                }),
                DOM.addStandardDisposableListener(inputBox.inputElement, DOM.EventType.KEY_DOWN, (e) => {
                    if (e.equals(60 /* KeyCode.F2 */)) {
                        const dotIndex = inputBox.value.lastIndexOf('.');
                        if (stat.isDirectory || dotIndex === -1) {
                            return;
                        }
                        if (currentSelectionState === 'prefix') {
                            currentSelectionState = 'all';
                            inputBox.select({ start: 0, end: inputBox.value.length });
                        }
                        else if (currentSelectionState === 'all') {
                            currentSelectionState = 'suffix';
                            inputBox.select({ start: dotIndex + 1, end: inputBox.value.length });
                        }
                        else {
                            currentSelectionState = 'prefix';
                            inputBox.select({ start: 0, end: dotIndex });
                        }
                    }
                    else if (e.equals(3 /* KeyCode.Enter */)) {
                        if (!inputBox.validate()) {
                            done(true, true);
                        }
                    }
                    else if (e.equals(9 /* KeyCode.Escape */)) {
                        done(false, true);
                    }
                }),
                DOM.addStandardDisposableListener(inputBox.inputElement, DOM.EventType.KEY_UP, (e) => {
                    showInputBoxNotification();
                }),
                DOM.addDisposableListener(inputBox.inputElement, DOM.EventType.BLUR, async () => {
                    while (true) {
                        await (0, async_1.timeout)(0);
                        if (!document.hasFocus()) {
                            break;
                        }
                        if (document.activeElement === inputBox.inputElement) {
                            return;
                        }
                        else if (document.activeElement instanceof HTMLElement && DOM.hasParentWithClass(document.activeElement, 'context-view')) {
                            await event_1.Event.toPromise(this.contextMenuService.onDidHideContextMenu);
                        }
                        else {
                            break;
                        }
                    }
                    done(inputBox.isInputValid(), true);
                }),
                label
            ];
            return (0, lifecycle_1.toDisposable)(() => {
                done(false, false);
            });
        }
        disposeElement(element, index, templateData) {
            templateData.currentContext = undefined;
            templateData.elementDisposables.clear();
        }
        disposeCompressedElements(node, index, templateData) {
            templateData.currentContext = undefined;
            templateData.elementDisposables.clear();
        }
        disposeTemplate(templateData) {
            templateData.templateDisposables.dispose();
        }
        getCompressedNavigationController(stat) {
            return this.compressedNavigationControllers.get(stat);
        }
        // IAccessibilityProvider
        getAriaLabel(element) {
            return element.name;
        }
        getAriaLevel(element) {
            // We need to comput aria level on our own since children of compact folders will otherwise have an incorrect level	#107235
            let depth = 0;
            let parent = element.parent;
            while (parent) {
                parent = parent.parent;
                depth++;
            }
            if (this.contextService.getWorkbenchState() === 3 /* WorkbenchState.WORKSPACE */) {
                depth = depth + 1;
            }
            return depth;
        }
        getActiveDescendantId(stat) {
            const compressedNavigationController = this.compressedNavigationControllers.get(stat);
            return compressedNavigationController?.currentId;
        }
        dispose() {
            this.configListener.dispose();
        }
    };
    exports.FilesRenderer = FilesRenderer;
    exports.FilesRenderer = FilesRenderer = FilesRenderer_1 = __decorate([
        __param(3, contextView_1.IContextViewService),
        __param(4, themeService_1.IThemeService),
        __param(5, configuration_1.IConfigurationService),
        __param(6, files_2.IExplorerService),
        __param(7, label_1.ILabelService),
        __param(8, workspace_1.IWorkspaceContextService),
        __param(9, contextView_1.IContextMenuService),
        __param(10, hover_1.IHoverService)
    ], FilesRenderer);
    /**
     * Respects files.exclude setting in filtering out content from the explorer.
     * Makes sure that visible editors are always shown in the explorer even if they are filtered out by settings.
     */
    let FilesFilter = class FilesFilter {
        constructor(contextService, configurationService, explorerService, editorService, uriIdentityService, fileService) {
            this.contextService = contextService;
            this.configurationService = configurationService;
            this.explorerService = explorerService;
            this.editorService = editorService;
            this.uriIdentityService = uriIdentityService;
            this.fileService = fileService;
            this.hiddenExpressionPerRoot = new Map();
            this.editorsAffectingFilter = new Set();
            this._onDidChange = new event_1.Emitter();
            this.toDispose = [];
            // List of ignoreFile resources. Used to detect changes to the ignoreFiles.
            this.ignoreFileResourcesPerRoot = new Map();
            // Ignore tree per root. Similar to `hiddenExpressionPerRoot`
            // Note: URI in the ternary search tree is the URI of the folder containing the ignore file
            // It is not the ignore file itself. This is because of the way the IgnoreFile works and nested paths
            this.ignoreTreesPerRoot = new Map();
            this.toDispose.push(this.contextService.onDidChangeWorkspaceFolders(() => this.updateConfiguration()));
            this.toDispose.push(this.configurationService.onDidChangeConfiguration((e) => {
                if (e.affectsConfiguration('files.exclude') || e.affectsConfiguration('explorer.excludeGitIgnore')) {
                    this.updateConfiguration();
                }
            }));
            this.toDispose.push(this.fileService.onDidFilesChange(e => {
                // Check to see if the update contains any of the ignoreFileResources
                for (const [root, ignoreFileResourceSet] of this.ignoreFileResourcesPerRoot.entries()) {
                    ignoreFileResourceSet.forEach(async (ignoreResource) => {
                        if (e.contains(ignoreResource, 0 /* FileChangeType.UPDATED */)) {
                            await this.processIgnoreFile(root, ignoreResource, true);
                        }
                        if (e.contains(ignoreResource, 2 /* FileChangeType.DELETED */)) {
                            this.ignoreTreesPerRoot.get(root)?.delete((0, resources_1.dirname)(ignoreResource));
                            ignoreFileResourceSet.delete(ignoreResource);
                            this._onDidChange.fire();
                        }
                    });
                }
            }));
            this.toDispose.push(this.editorService.onDidVisibleEditorsChange(() => {
                const editors = this.editorService.visibleEditors;
                let shouldFire = false;
                for (const e of editors) {
                    if (!e.resource) {
                        continue;
                    }
                    const stat = this.explorerService.findClosest(e.resource);
                    if (stat && stat.isExcluded) {
                        // A filtered resource suddenly became visible since user opened an editor
                        shouldFire = true;
                        break;
                    }
                }
                for (const e of this.editorsAffectingFilter) {
                    if (!editors.includes(e)) {
                        // Editor that was affecting filtering is no longer visible
                        shouldFire = true;
                        break;
                    }
                }
                if (shouldFire) {
                    this.editorsAffectingFilter.clear();
                    this._onDidChange.fire();
                }
            }));
            this.updateConfiguration();
        }
        get onDidChange() {
            return this._onDidChange.event;
        }
        updateConfiguration() {
            let shouldFire = false;
            let updatedGitIgnoreSetting = false;
            this.contextService.getWorkspace().folders.forEach(folder => {
                const configuration = this.configurationService.getValue({ resource: folder.uri });
                const excludesConfig = configuration?.files?.exclude || Object.create(null);
                const parseIgnoreFile = configuration.explorer.excludeGitIgnore;
                // If we should be parsing ignoreFiles for this workspace and don't have an ignore tree initialize one
                if (parseIgnoreFile && !this.ignoreTreesPerRoot.has(folder.uri.toString())) {
                    updatedGitIgnoreSetting = true;
                    this.ignoreFileResourcesPerRoot.set(folder.uri.toString(), new map_1.ResourceSet());
                    this.ignoreTreesPerRoot.set(folder.uri.toString(), ternarySearchTree_1.TernarySearchTree.forUris((uri) => this.uriIdentityService.extUri.ignorePathCasing(uri)));
                }
                // If we shouldn't be parsing ignore files but have an ignore tree, clear the ignore tree
                if (!parseIgnoreFile && this.ignoreTreesPerRoot.has(folder.uri.toString())) {
                    updatedGitIgnoreSetting = true;
                    this.ignoreFileResourcesPerRoot.delete(folder.uri.toString());
                    this.ignoreTreesPerRoot.delete(folder.uri.toString());
                }
                if (!shouldFire) {
                    const cached = this.hiddenExpressionPerRoot.get(folder.uri.toString());
                    shouldFire = !cached || !(0, objects_1.equals)(cached.original, excludesConfig);
                }
                const excludesConfigCopy = (0, objects_1.deepClone)(excludesConfig); // do not keep the config, as it gets mutated under our hoods
                this.hiddenExpressionPerRoot.set(folder.uri.toString(), { original: excludesConfigCopy, parsed: glob.parse(excludesConfigCopy) });
            });
            if (shouldFire || updatedGitIgnoreSetting) {
                this.editorsAffectingFilter.clear();
                this._onDidChange.fire();
            }
        }
        /**
         * Given a .gitignore file resource, processes the resource and adds it to the ignore tree which hides explorer items
         * @param root The root folder of the workspace as a string. Used for lookup key for ignore tree and resource list
         * @param ignoreFileResource The resource of the .gitignore file
         * @param update Whether or not we're updating an existing ignore file. If true it deletes the old entry
         */
        async processIgnoreFile(root, ignoreFileResource, update) {
            // Get the name of the directory which the ignore file is in
            const dirUri = (0, resources_1.dirname)(ignoreFileResource);
            const ignoreTree = this.ignoreTreesPerRoot.get(root);
            if (!ignoreTree) {
                return;
            }
            // Don't process a directory if we already have it in the tree
            if (!update && ignoreTree.has(dirUri)) {
                return;
            }
            // Maybe we need a cancellation token here in case it's super long?
            const content = await this.fileService.readFile(ignoreFileResource);
            // If it's just an update we update the contents keeping all references the same
            if (update) {
                const ignoreFile = ignoreTree.get(dirUri);
                ignoreFile?.updateContents(content.value.toString());
            }
            else {
                // Otherwise we create a new ignorefile and add it to the tree
                const ignoreParent = ignoreTree.findSubstr(dirUri);
                const ignoreFile = new ignoreFile_1.IgnoreFile(content.value.toString(), dirUri.path, ignoreParent);
                ignoreTree.set(dirUri, ignoreFile);
                // If we haven't seen this resource before then we need to add it to the list of resources we're tracking
                if (!this.ignoreFileResourcesPerRoot.get(root)?.has(ignoreFileResource)) {
                    this.ignoreFileResourcesPerRoot.get(root)?.add(ignoreFileResource);
                }
            }
            // Notify the explorer of the change so we may ignore these files
            this._onDidChange.fire();
        }
        filter(stat, parentVisibility) {
            // Add newly visited .gitignore files to the ignore tree
            if (stat.name === '.gitignore' && this.ignoreTreesPerRoot.has(stat.root.resource.toString())) {
                this.processIgnoreFile(stat.root.resource.toString(), stat.resource, false);
                return true;
            }
            return this.isVisible(stat, parentVisibility);
        }
        isVisible(stat, parentVisibility) {
            stat.isExcluded = false;
            if (parentVisibility === 0 /* TreeVisibility.Hidden */) {
                stat.isExcluded = true;
                return false;
            }
            if (this.explorerService.getEditableData(stat)) {
                return true; // always visible
            }
            // Hide those that match Hidden Patterns
            const cached = this.hiddenExpressionPerRoot.get(stat.root.resource.toString());
            const globMatch = cached?.parsed(path.relative(stat.root.resource.path, stat.resource.path), stat.name, name => !!(stat.parent && stat.parent.getChild(name)));
            // Small optimization to only traverse gitIgnore if the globMatch from fileExclude returned nothing
            const ignoreFile = globMatch ? undefined : this.ignoreTreesPerRoot.get(stat.root.resource.toString())?.findSubstr(stat.resource);
            const isIncludedInTraversal = ignoreFile?.isPathIncludedInTraversal(stat.resource.path, stat.isDirectory);
            // Doing !undefined returns true and we want it to be false when undefined because that means it's not included in the ignore file
            const isIgnoredByIgnoreFile = isIncludedInTraversal === undefined ? false : !isIncludedInTraversal;
            if (isIgnoredByIgnoreFile || globMatch || stat.parent?.isExcluded) {
                stat.isExcluded = true;
                const editors = this.editorService.visibleEditors;
                const editor = editors.find(e => e.resource && this.uriIdentityService.extUri.isEqualOrParent(e.resource, stat.resource));
                if (editor && stat.root === this.explorerService.findClosestRoot(stat.resource)) {
                    this.editorsAffectingFilter.add(editor);
                    return true; // Show all opened files and their parents
                }
                return false; // hidden through pattern
            }
            return true;
        }
        dispose() {
            (0, lifecycle_1.dispose)(this.toDispose);
        }
    };
    exports.FilesFilter = FilesFilter;
    exports.FilesFilter = FilesFilter = __decorate([
        __param(0, workspace_1.IWorkspaceContextService),
        __param(1, configuration_1.IConfigurationService),
        __param(2, files_2.IExplorerService),
        __param(3, editorService_1.IEditorService),
        __param(4, uriIdentity_1.IUriIdentityService),
        __param(5, files_1.IFileService)
    ], FilesFilter);
    // Explorer Sorter
    let FileSorter = class FileSorter {
        constructor(explorerService, contextService) {
            this.explorerService = explorerService;
            this.contextService = contextService;
        }
        compare(statA, statB) {
            // Do not sort roots
            if (statA.isRoot) {
                if (statB.isRoot) {
                    const workspaceA = this.contextService.getWorkspaceFolder(statA.resource);
                    const workspaceB = this.contextService.getWorkspaceFolder(statB.resource);
                    return workspaceA && workspaceB ? (workspaceA.index - workspaceB.index) : -1;
                }
                return -1;
            }
            if (statB.isRoot) {
                return 1;
            }
            const sortOrder = this.explorerService.sortOrderConfiguration.sortOrder;
            const lexicographicOptions = this.explorerService.sortOrderConfiguration.lexicographicOptions;
            let compareFileNames;
            let compareFileExtensions;
            switch (lexicographicOptions) {
                case 'upper':
                    compareFileNames = comparers_1.compareFileNamesUpper;
                    compareFileExtensions = comparers_1.compareFileExtensionsUpper;
                    break;
                case 'lower':
                    compareFileNames = comparers_1.compareFileNamesLower;
                    compareFileExtensions = comparers_1.compareFileExtensionsLower;
                    break;
                case 'unicode':
                    compareFileNames = comparers_1.compareFileNamesUnicode;
                    compareFileExtensions = comparers_1.compareFileExtensionsUnicode;
                    break;
                default:
                    // 'default'
                    compareFileNames = comparers_1.compareFileNamesDefault;
                    compareFileExtensions = comparers_1.compareFileExtensionsDefault;
            }
            // Sort Directories
            switch (sortOrder) {
                case 'type':
                    if (statA.isDirectory && !statB.isDirectory) {
                        return -1;
                    }
                    if (statB.isDirectory && !statA.isDirectory) {
                        return 1;
                    }
                    if (statA.isDirectory && statB.isDirectory) {
                        return compareFileNames(statA.name, statB.name);
                    }
                    break;
                case 'filesFirst':
                    if (statA.isDirectory && !statB.isDirectory) {
                        return 1;
                    }
                    if (statB.isDirectory && !statA.isDirectory) {
                        return -1;
                    }
                    break;
                case 'foldersNestsFiles':
                    if (statA.isDirectory && !statB.isDirectory) {
                        return -1;
                    }
                    if (statB.isDirectory && !statA.isDirectory) {
                        return 1;
                    }
                    if (statA.hasNests && !statB.hasNests) {
                        return -1;
                    }
                    if (statB.hasNests && !statA.hasNests) {
                        return 1;
                    }
                    break;
                case 'mixed':
                    break; // not sorting when "mixed" is on
                default: /* 'default', 'modified' */
                    if (statA.isDirectory && !statB.isDirectory) {
                        return -1;
                    }
                    if (statB.isDirectory && !statA.isDirectory) {
                        return 1;
                    }
                    break;
            }
            // Sort Files
            switch (sortOrder) {
                case 'type':
                    return compareFileExtensions(statA.name, statB.name);
                case 'modified':
                    if (statA.mtime !== statB.mtime) {
                        return (statA.mtime && statB.mtime && statA.mtime < statB.mtime) ? 1 : -1;
                    }
                    return compareFileNames(statA.name, statB.name);
                default: /* 'default', 'mixed', 'filesFirst' */
                    return compareFileNames(statA.name, statB.name);
            }
        }
    };
    exports.FileSorter = FileSorter;
    exports.FileSorter = FileSorter = __decorate([
        __param(0, files_2.IExplorerService),
        __param(1, workspace_1.IWorkspaceContextService)
    ], FileSorter);
    let FileDragAndDrop = class FileDragAndDrop {
        static { FileDragAndDrop_1 = this; }
        static { this.CONFIRM_DND_SETTING_KEY = 'explorer.confirmDragAndDrop'; }
        constructor(isCollapsed, explorerService, editorService, dialogService, contextService, fileService, configurationService, instantiationService, workspaceEditingService, uriIdentityService) {
            this.isCollapsed = isCollapsed;
            this.explorerService = explorerService;
            this.editorService = editorService;
            this.dialogService = dialogService;
            this.contextService = contextService;
            this.fileService = fileService;
            this.configurationService = configurationService;
            this.instantiationService = instantiationService;
            this.workspaceEditingService = workspaceEditingService;
            this.uriIdentityService = uriIdentityService;
            this.compressedDropTargetDisposable = lifecycle_1.Disposable.None;
            this.dropEnabled = false;
            this.toDispose = [];
            const updateDropEnablement = (e) => {
                if (!e || e.affectsConfiguration('explorer.enableDragAndDrop')) {
                    this.dropEnabled = this.configurationService.getValue('explorer.enableDragAndDrop');
                }
            };
            updateDropEnablement(undefined);
            this.toDispose.push(this.configurationService.onDidChangeConfiguration(e => updateDropEnablement(e)));
        }
        onDragOver(data, target, targetIndex, originalEvent) {
            if (!this.dropEnabled) {
                return false;
            }
            // Compressed folders
            if (target) {
                const compressedTarget = FileDragAndDrop_1.getCompressedStatFromDragEvent(target, originalEvent);
                if (compressedTarget) {
                    const iconLabelName = getIconLabelNameFromHTMLElement(originalEvent.target);
                    if (iconLabelName && iconLabelName.index < iconLabelName.count - 1) {
                        const result = this.handleDragOver(data, compressedTarget, targetIndex, originalEvent);
                        if (result) {
                            if (iconLabelName.element !== this.compressedDragOverElement) {
                                this.compressedDragOverElement = iconLabelName.element;
                                this.compressedDropTargetDisposable.dispose();
                                this.compressedDropTargetDisposable = (0, lifecycle_1.toDisposable)(() => {
                                    iconLabelName.element.classList.remove('drop-target');
                                    this.compressedDragOverElement = undefined;
                                });
                                iconLabelName.element.classList.add('drop-target');
                            }
                            return typeof result === 'boolean' ? result : { ...result, feedback: [] };
                        }
                        this.compressedDropTargetDisposable.dispose();
                        return false;
                    }
                }
            }
            this.compressedDropTargetDisposable.dispose();
            return this.handleDragOver(data, target, targetIndex, originalEvent);
        }
        handleDragOver(data, target, targetIndex, originalEvent) {
            const isCopy = originalEvent && ((originalEvent.ctrlKey && !platform_1.isMacintosh) || (originalEvent.altKey && platform_1.isMacintosh));
            const isNative = data instanceof listView_1.NativeDragAndDropData;
            const effect = (isNative || isCopy) ? 0 /* ListDragOverEffect.Copy */ : 1 /* ListDragOverEffect.Move */;
            // Native DND
            if (isNative) {
                if (!(0, dnd_1.containsDragType)(originalEvent, dnd_3.DataTransfers.FILES, dnd_1.CodeDataTransfers.FILES, dnd_3.DataTransfers.RESOURCES)) {
                    return false;
                }
            }
            // Other-Tree DND
            else if (data instanceof listView_1.ExternalElementsDragAndDropData) {
                return false;
            }
            // In-Explorer DND
            else {
                const items = FileDragAndDrop_1.getStatsFromDragAndDropData(data);
                if (!target) {
                    // Dropping onto the empty area. Do not accept if items dragged are already
                    // children of the root unless we are copying the file
                    if (!isCopy && items.every(i => !!i.parent && i.parent.isRoot)) {
                        return false;
                    }
                    return { accept: true, bubble: 0 /* TreeDragOverBubble.Down */, effect, autoExpand: false };
                }
                if (!Array.isArray(items)) {
                    return false;
                }
                if (!isCopy && items.every((source) => source.isReadonly)) {
                    return false; // Cannot move readonly items unless we copy
                }
                if (items.some((source) => {
                    if (source.isRoot && target instanceof explorerModel_1.ExplorerItem && !target.isRoot) {
                        return true; // Root folder can not be moved to a non root file stat.
                    }
                    if (this.uriIdentityService.extUri.isEqual(source.resource, target.resource)) {
                        return true; // Can not move anything onto itself
                    }
                    if (source.isRoot && target instanceof explorerModel_1.ExplorerItem && target.isRoot) {
                        // Disable moving workspace roots in one another
                        return false;
                    }
                    if (!isCopy && this.uriIdentityService.extUri.isEqual((0, resources_1.dirname)(source.resource), target.resource)) {
                        return true; // Can not move a file to the same parent unless we copy
                    }
                    if (this.uriIdentityService.extUri.isEqualOrParent(target.resource, source.resource)) {
                        return true; // Can not move a parent folder into one of its children
                    }
                    return false;
                })) {
                    return false;
                }
            }
            // All (target = model)
            if (!target) {
                return { accept: true, bubble: 0 /* TreeDragOverBubble.Down */, effect };
            }
            // All (target = file/folder)
            else {
                if (target.isDirectory) {
                    if (target.isReadonly) {
                        return false;
                    }
                    return { accept: true, bubble: 0 /* TreeDragOverBubble.Down */, effect, autoExpand: true };
                }
                if (this.contextService.getWorkspace().folders.every(folder => folder.uri.toString() !== target.resource.toString())) {
                    return { accept: true, bubble: 1 /* TreeDragOverBubble.Up */, effect };
                }
            }
            return false;
        }
        getDragURI(element) {
            if (this.explorerService.isEditable(element)) {
                return null;
            }
            return element.resource.toString();
        }
        getDragLabel(elements, originalEvent) {
            if (elements.length === 1) {
                const stat = FileDragAndDrop_1.getCompressedStatFromDragEvent(elements[0], originalEvent);
                return stat.name;
            }
            return String(elements.length);
        }
        onDragStart(data, originalEvent) {
            const items = FileDragAndDrop_1.getStatsFromDragAndDropData(data, originalEvent);
            if (items && items.length && originalEvent.dataTransfer) {
                // Apply some datatransfer types to allow for dragging the element outside of the application
                this.instantiationService.invokeFunction(accessor => (0, dnd_2.fillEditorsDragData)(accessor, items, originalEvent));
                // The only custom data transfer we set from the explorer is a file transfer
                // to be able to DND between multiple code file explorers across windows
                const fileResources = items.filter(s => s.resource.scheme === network_1.Schemas.file).map(r => r.resource.fsPath);
                if (fileResources.length) {
                    originalEvent.dataTransfer.setData(dnd_1.CodeDataTransfers.FILES, JSON.stringify(fileResources));
                }
            }
        }
        async drop(data, target, targetIndex, originalEvent) {
            this.compressedDropTargetDisposable.dispose();
            // Find compressed target
            if (target) {
                const compressedTarget = FileDragAndDrop_1.getCompressedStatFromDragEvent(target, originalEvent);
                if (compressedTarget) {
                    target = compressedTarget;
                }
            }
            // Find parent to add to
            if (!target) {
                target = this.explorerService.roots[this.explorerService.roots.length - 1];
            }
            if (!target.isDirectory && target.parent) {
                target = target.parent;
            }
            if (target.isReadonly) {
                return;
            }
            const resolvedTarget = target;
            if (!resolvedTarget) {
                return;
            }
            try {
                // External file DND (Import/Upload file)
                if (data instanceof listView_1.NativeDragAndDropData) {
                    // Use local file import when supported
                    if (!platform_1.isWeb || ((0, workspace_1.isTemporaryWorkspace)(this.contextService.getWorkspace()) && webFileSystemAccess_1.WebFileSystemAccess.supported(window))) {
                        const fileImport = this.instantiationService.createInstance(fileImportExport_1.ExternalFileImport);
                        await fileImport.import(resolvedTarget, originalEvent);
                    }
                    // Otherwise fallback to browser based file upload
                    else {
                        const browserUpload = this.instantiationService.createInstance(fileImportExport_1.BrowserFileUpload);
                        await browserUpload.upload(target, originalEvent);
                    }
                }
                // In-Explorer DND (Move/Copy file)
                else {
                    await this.handleExplorerDrop(data, resolvedTarget, originalEvent);
                }
            }
            catch (error) {
                this.dialogService.error((0, errorMessage_1.toErrorMessage)(error));
            }
        }
        async handleExplorerDrop(data, target, originalEvent) {
            const elementsData = FileDragAndDrop_1.getStatsFromDragAndDropData(data);
            const distinctItems = new Map(elementsData.map(element => [element, this.isCollapsed(element)]));
            for (const [item, collapsed] of distinctItems) {
                if (collapsed) {
                    const nestedChildren = item.nestedChildren;
                    if (nestedChildren) {
                        for (const child of nestedChildren) {
                            // if parent is collapsed, then the nested children is considered collapsed to operate as a group
                            // and skip collapsed state check since they're not in the tree
                            distinctItems.set(child, true);
                        }
                    }
                }
            }
            const items = (0, resources_1.distinctParents)([...distinctItems.keys()], s => s.resource);
            const isCopy = (originalEvent.ctrlKey && !platform_1.isMacintosh) || (originalEvent.altKey && platform_1.isMacintosh);
            // Handle confirm setting
            const confirmDragAndDrop = !isCopy && this.configurationService.getValue(FileDragAndDrop_1.CONFIRM_DND_SETTING_KEY);
            if (confirmDragAndDrop) {
                const message = items.length > 1 && items.every(s => s.isRoot) ? (0, nls_1.localize)('confirmRootsMove', "Are you sure you want to change the order of multiple root folders in your workspace?")
                    : items.length > 1 ? (0, nls_1.localize)('confirmMultiMove', "Are you sure you want to move the following {0} files into '{1}'?", items.length, target.name)
                        : items[0].isRoot ? (0, nls_1.localize)('confirmRootMove', "Are you sure you want to change the order of root folder '{0}' in your workspace?", items[0].name)
                            : (0, nls_1.localize)('confirmMove', "Are you sure you want to move '{0}' into '{1}'?", items[0].name, target.name);
                const detail = items.length > 1 && !items.every(s => s.isRoot) ? (0, dialogs_1.getFileNamesMessage)(items.map(i => i.resource)) : undefined;
                const confirmation = await this.dialogService.confirm({
                    message,
                    detail,
                    checkbox: {
                        label: (0, nls_1.localize)('doNotAskAgain', "Do not ask me again")
                    },
                    primaryButton: (0, nls_1.localize)({ key: 'moveButtonLabel', comment: ['&& denotes a mnemonic'] }, "&&Move")
                });
                if (!confirmation.confirmed) {
                    return;
                }
                // Check for confirmation checkbox
                if (confirmation.checkboxChecked === true) {
                    await this.configurationService.updateValue(FileDragAndDrop_1.CONFIRM_DND_SETTING_KEY, false);
                }
            }
            await this.doHandleRootDrop(items.filter(s => s.isRoot), target);
            const sources = items.filter(s => !s.isRoot);
            if (isCopy) {
                return this.doHandleExplorerDropOnCopy(sources, target);
            }
            return this.doHandleExplorerDropOnMove(sources, target);
        }
        async doHandleRootDrop(roots, target) {
            if (roots.length === 0) {
                return;
            }
            const folders = this.contextService.getWorkspace().folders;
            let targetIndex;
            const workspaceCreationData = [];
            const rootsToMove = [];
            for (let index = 0; index < folders.length; index++) {
                const data = {
                    uri: folders[index].uri,
                    name: folders[index].name
                };
                if (target instanceof explorerModel_1.ExplorerItem && this.uriIdentityService.extUri.isEqual(folders[index].uri, target.resource)) {
                    targetIndex = index;
                }
                if (roots.every(r => r.resource.toString() !== folders[index].uri.toString())) {
                    workspaceCreationData.push(data);
                }
                else {
                    rootsToMove.push(data);
                }
            }
            if (targetIndex === undefined) {
                targetIndex = workspaceCreationData.length;
            }
            workspaceCreationData.splice(targetIndex, 0, ...rootsToMove);
            return this.workspaceEditingService.updateFolders(0, workspaceCreationData.length, workspaceCreationData);
        }
        async doHandleExplorerDropOnCopy(sources, target) {
            // Reuse duplicate action when user copies
            const explorerConfig = this.configurationService.getValue().explorer;
            const resourceFileEdits = [];
            for (const { resource, isDirectory } of sources) {
                const allowOverwrite = explorerConfig.incrementalNaming === 'disabled';
                const newResource = await (0, fileActions_1.findValidPasteFileTarget)(this.explorerService, this.fileService, this.dialogService, target, { resource, isDirectory, allowOverwrite }, explorerConfig.incrementalNaming);
                if (!newResource) {
                    continue;
                }
                const resourceEdit = new bulkEditService_1.ResourceFileEdit(resource, newResource, { copy: true, overwrite: allowOverwrite });
                resourceFileEdits.push(resourceEdit);
            }
            const labelSuffix = getFileOrFolderLabelSuffix(sources);
            await this.explorerService.applyBulkEdit(resourceFileEdits, {
                confirmBeforeUndo: explorerConfig.confirmUndo === "default" /* UndoConfirmLevel.Default */ || explorerConfig.confirmUndo === "verbose" /* UndoConfirmLevel.Verbose */,
                undoLabel: (0, nls_1.localize)('copy', "Copy {0}", labelSuffix),
                progressLabel: (0, nls_1.localize)('copying', "Copying {0}", labelSuffix),
            });
            const editors = resourceFileEdits.filter(edit => {
                const item = edit.newResource ? this.explorerService.findClosest(edit.newResource) : undefined;
                return item && !item.isDirectory;
            }).map(edit => ({ resource: edit.newResource, options: { pinned: true } }));
            await this.editorService.openEditors(editors);
        }
        async doHandleExplorerDropOnMove(sources, target) {
            // Do not allow moving readonly items
            const resourceFileEdits = sources.filter(source => !source.isReadonly).map(source => new bulkEditService_1.ResourceFileEdit(source.resource, (0, resources_1.joinPath)(target.resource, source.name)));
            const labelSuffix = getFileOrFolderLabelSuffix(sources);
            const options = {
                confirmBeforeUndo: this.configurationService.getValue().explorer.confirmUndo === "verbose" /* UndoConfirmLevel.Verbose */,
                undoLabel: (0, nls_1.localize)('move', "Move {0}", labelSuffix),
                progressLabel: (0, nls_1.localize)('moving', "Moving {0}", labelSuffix)
            };
            try {
                await this.explorerService.applyBulkEdit(resourceFileEdits, options);
            }
            catch (error) {
                // Conflict
                if (error.fileOperationResult === 4 /* FileOperationResult.FILE_MOVE_CONFLICT */) {
                    const overwrites = [];
                    for (const edit of resourceFileEdits) {
                        if (edit.newResource && await this.fileService.exists(edit.newResource)) {
                            overwrites.push(edit.newResource);
                        }
                    }
                    // Move with overwrite if the user confirms
                    const confirm = (0, fileImportExport_1.getMultipleFilesOverwriteConfirm)(overwrites);
                    const { confirmed } = await this.dialogService.confirm(confirm);
                    if (confirmed) {
                        await this.explorerService.applyBulkEdit(resourceFileEdits.map(re => new bulkEditService_1.ResourceFileEdit(re.oldResource, re.newResource, { overwrite: true })), options);
                    }
                }
                // Any other error: bubble up
                else {
                    throw error;
                }
            }
        }
        static getStatsFromDragAndDropData(data, dragStartEvent) {
            if (data.context) {
                return data.context;
            }
            // Detect compressed folder dragging
            if (dragStartEvent && data.elements.length === 1) {
                data.context = [FileDragAndDrop_1.getCompressedStatFromDragEvent(data.elements[0], dragStartEvent)];
                return data.context;
            }
            return data.elements;
        }
        static getCompressedStatFromDragEvent(stat, dragEvent) {
            const target = document.elementFromPoint(dragEvent.clientX, dragEvent.clientY);
            const iconLabelName = getIconLabelNameFromHTMLElement(target);
            if (iconLabelName) {
                const { count, index } = iconLabelName;
                let i = count - 1;
                while (i > index && stat.parent) {
                    stat = stat.parent;
                    i--;
                }
                return stat;
            }
            return stat;
        }
        onDragEnd() {
            this.compressedDropTargetDisposable.dispose();
        }
    };
    exports.FileDragAndDrop = FileDragAndDrop;
    exports.FileDragAndDrop = FileDragAndDrop = FileDragAndDrop_1 = __decorate([
        __param(1, files_2.IExplorerService),
        __param(2, editorService_1.IEditorService),
        __param(3, dialogs_1.IDialogService),
        __param(4, workspace_1.IWorkspaceContextService),
        __param(5, files_1.IFileService),
        __param(6, configuration_1.IConfigurationService),
        __param(7, instantiation_1.IInstantiationService),
        __param(8, workspaceEditing_1.IWorkspaceEditingService),
        __param(9, uriIdentity_1.IUriIdentityService)
    ], FileDragAndDrop);
    function getIconLabelNameFromHTMLElement(target) {
        if (!(target instanceof HTMLElement)) {
            return null;
        }
        let element = target;
        while (element && !element.classList.contains('monaco-list-row')) {
            if (element.classList.contains('label-name') && element.hasAttribute('data-icon-label-count')) {
                const count = Number(element.getAttribute('data-icon-label-count'));
                const index = Number(element.getAttribute('data-icon-label-index'));
                if ((0, types_1.isNumber)(count) && (0, types_1.isNumber)(index)) {
                    return { element: element, count, index };
                }
            }
            element = element.parentElement;
        }
        return null;
    }
    function isCompressedFolderName(target) {
        return !!getIconLabelNameFromHTMLElement(target);
    }
    exports.isCompressedFolderName = isCompressedFolderName;
    class ExplorerCompressionDelegate {
        isIncompressible(stat) {
            return stat.isRoot || !stat.isDirectory || stat instanceof explorerModel_1.NewExplorerItem || (!stat.parent || stat.parent.isRoot);
        }
    }
    exports.ExplorerCompressionDelegate = ExplorerCompressionDelegate;
    function getFileOrFolderLabelSuffix(items) {
        if (items.length === 1) {
            return items[0].name;
        }
        if (items.every(i => i.isDirectory)) {
            return (0, nls_1.localize)('numberOfFolders', "{0} folders", items.length);
        }
        if (items.every(i => !i.isDirectory)) {
            return (0, nls_1.localize)('numberOfFiles', "{0} files", items.length);
        }
        return `${items.length} files and folders`;
    }
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZXhwbG9yZXJWaWV3ZXIuanMiLCJzb3VyY2VSb290IjoiZmlsZTovLy93b3Jrc3BhY2UvYXBwZmxvdy9zcmMvIiwic291cmNlcyI6WyJ2cy93b3JrYmVuY2gvY29udHJpYi9maWxlcy9icm93c2VyL3ZpZXdzL2V4cGxvcmVyVmlld2VyLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOzs7Z0dBR2dHOzs7Ozs7Ozs7Ozs7Ozs7SUFrRWhHLE1BQWEsZ0JBQWdCO2lCQUVaLGdCQUFXLEdBQUcsRUFBRSxDQUFDO1FBRWpDLFNBQVMsQ0FBQyxPQUFxQjtZQUM5QixPQUFPLGdCQUFnQixDQUFDLFdBQVcsQ0FBQztRQUNyQyxDQUFDO1FBRUQsYUFBYSxDQUFDLE9BQXFCO1lBQ2xDLE9BQU8sYUFBYSxDQUFDLEVBQUUsQ0FBQztRQUN6QixDQUFDOztJQVZGLDRDQVdDO0lBRVksUUFBQSx3QkFBd0IsR0FBRyxJQUFJLGVBQU8sRUFBTyxDQUFDO0lBQ3BELElBQU0sa0JBQWtCLEdBQXhCLE1BQU0sa0JBQWtCO1FBRTlCLFlBQ1MsVUFBdUIsRUFDSSxlQUFpQyxFQUM1QixhQUFvQyxFQUNyQyxtQkFBeUMsRUFDdEMsYUFBc0MsRUFDakQsV0FBeUIsRUFDckIsZUFBaUMsRUFDekIsY0FBd0MsRUFDdEMsa0JBQThDO1lBUm5GLGVBQVUsR0FBVixVQUFVLENBQWE7WUFDSSxvQkFBZSxHQUFmLGVBQWUsQ0FBa0I7WUFDNUIsa0JBQWEsR0FBYixhQUFhLENBQXVCO1lBQ3JDLHdCQUFtQixHQUFuQixtQkFBbUIsQ0FBc0I7WUFDdEMsa0JBQWEsR0FBYixhQUFhLENBQXlCO1lBQ2pELGdCQUFXLEdBQVgsV0FBVyxDQUFjO1lBQ3JCLG9CQUFlLEdBQWYsZUFBZSxDQUFrQjtZQUN6QixtQkFBYyxHQUFkLGNBQWMsQ0FBMEI7WUFDdEMsdUJBQWtCLEdBQWxCLGtCQUFrQixDQUE0QjtRQUN4RixDQUFDO1FBRUwsV0FBVyxDQUFDLE9BQXNDO1lBQ2pELDBGQUEwRjtZQUMxRixPQUFP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