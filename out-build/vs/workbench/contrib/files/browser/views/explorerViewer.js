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
define(["require", "exports", "vs/base/browser/dom", "vs/base/common/glob", "vs/platform/progress/common/progress", "vs/platform/notification/common/notification", "vs/platform/files/common/files", "vs/workbench/services/layout/browser/layoutService", "vs/platform/workspace/common/workspace", "vs/base/common/lifecycle", "vs/platform/contextview/browser/contextView", "vs/platform/theme/common/themeService", "vs/platform/configuration/common/configuration", "vs/base/common/resources", "vs/base/browser/ui/inputbox/inputBox", "vs/nls!vs/workbench/contrib/files/browser/views/explorerViewer", "vs/base/common/functional", "vs/base/common/objects", "vs/base/common/path", "vs/workbench/contrib/files/common/explorerModel", "vs/base/common/comparers", "vs/platform/dnd/browser/dnd", "vs/workbench/browser/dnd", "vs/platform/instantiation/common/instantiation", "vs/base/browser/dnd", "vs/base/common/network", "vs/base/browser/ui/list/listView", "vs/base/common/platform", "vs/platform/dialogs/common/dialogs", "vs/workbench/services/workspaces/common/workspaceEditing", "vs/workbench/services/editor/common/editorService", "vs/workbench/contrib/files/browser/fileActions", "vs/base/common/filters", "vs/base/common/event", "vs/platform/label/common/label", "vs/base/common/types", "vs/platform/uriIdentity/common/uriIdentity", "vs/editor/browser/services/bulkEditService", "vs/workbench/contrib/files/browser/files", "vs/workbench/contrib/files/browser/fileImportExport", "vs/base/common/errorMessage", "vs/platform/files/browser/webFileSystemAccess", "vs/workbench/services/search/common/ignoreFile", "vs/base/common/map", "vs/base/common/ternarySearchTree", "vs/platform/theme/browser/defaultStyles", "vs/base/common/async", "vs/workbench/services/hover/browser/hover", "vs/workbench/services/filesConfiguration/common/filesConfigurationService"], function (require, exports, DOM, glob, progress_1, notification_1, files_1, layoutService_1, workspace_1, lifecycle_1, contextView_1, themeService_1, configuration_1, resources_1, inputBox_1, nls_1, functional_1, objects_1, path, explorerModel_1, comparers_1, dnd_1, dnd_2, instantiation_1, dnd_3, network_1, listView_1, platform_1, dialogs_1, workspaceEditing_1, editorService_1, fileActions_1, filters_1, event_1, label_1, types_1, uriIdentity_1, bulkEditService_1, files_2, fileImportExport_1, errorMessage_1, webFileSystemAccess_1, ignoreFile_1, map_1, ternarySearchTree_1, defaultStyles_1, async_1, hover_1, filesConfigurationService_1) {
    "use strict";
    var $jIb_1, $mIb_1;
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.$oIb = exports.$nIb = exports.$mIb = exports.$lIb = exports.$kIb = exports.$jIb = exports.$iIb = exports.$hIb = exports.$gIb = exports.$fIb = void 0;
    class $fIb {
        static { this.ITEM_HEIGHT = 22; }
        getHeight(element) {
            return $fIb.ITEM_HEIGHT;
        }
        getTemplateId(element) {
            return $jIb.ID;
        }
    }
    exports.$fIb = $fIb;
    exports.$gIb = new event_1.$fd();
    let $hIb = class $hIb {
        constructor(a, b, c, d, f, g, h, j, k) {
            this.a = a;
            this.b = b;
            this.c = c;
            this.d = d;
            this.f = f;
            this.g = g;
            this.h = h;
            this.j = j;
            this.k = k;
        }
        hasChildren(element) {
            // don't render nest parents as containing children when all the children are filtered out
            return Array.isArray(element) || element.hasChildren((stat) => this.a.filter(stat, 1 /* TreeVisibility.Visible */));
        }
        getChildren(element) {
            if (Array.isArray(element)) {
                return element;
            }
            const hasError = element.error;
            const sortOrder = this.h.sortOrderConfiguration.sortOrder;
            const children = element.fetchChildren(sortOrder);
            if (Array.isArray(children)) {
                // fast path when children are known sync (i.e. nested children)
                return children;
            }
            const promise = children.then(children => {
                // Clear previous error decoration on root folder
                if (element instanceof explorerModel_1.$vHb && element.isRoot && !element.error && hasError && this.j.getWorkbenchState() !== 2 /* WorkbenchState.FOLDER */) {
                    exports.$gIb.fire(element.resource);
                }
                return children;
            }, e => {
                if (element instanceof explorerModel_1.$vHb && element.isRoot) {
                    if (this.j.getWorkbenchState() === 2 /* WorkbenchState.FOLDER */) {
                        // Single folder create a dummy explorer item to show error
                        const placeholder = new explorerModel_1.$vHb(element.resource, this.g, this.c, this.k, undefined, undefined, false);
                        placeholder.error = e;
                        return [placeholder];
                    }
                    else {
                        exports.$gIb.fire(element.resource);
                    }
                }
                else {
                    // Do not show error for roots since we already use an explorer decoration to notify user
                    this.d.error(e);
                }
                return []; // we could not resolve any children because of an error
            });
            this.b.withProgress({
                location: 1 /* ProgressLocation.Explorer */,
                delay: this.f.isRestored() ? 800 : 1500 // reduce progress visibility when still restoring
            }, _progress => promise);
            return promise;
        }
    };
    exports.$hIb = $hIb;
    exports.$hIb = $hIb = __decorate([
        __param(1, progress_1.$2u),
        __param(2, configuration_1.$8h),
        __param(3, notification_1.$Yu),
        __param(4, layoutService_1.$Meb),
        __param(5, files_1.$6j),
        __param(6, files_2.$xHb),
        __param(7, workspace_1.$Kh),
        __param(8, filesConfigurationService_1.$yD)
    ], $hIb);
    class $iIb {
        static { this.ID = 0; }
        get index() { return this.a; }
        get count() { return this.items.length; }
        get current() { return this.items[this.a]; }
        get currentId() { return `${this.f}_${this.index}`; }
        get labels() { return this.b; }
        constructor(f, items, templateData, g, h) {
            this.f = f;
            this.items = items;
            this.g = g;
            this.h = h;
            this.d = new event_1.$fd();
            this.onDidChange = this.d.event;
            this.a = items.length - 1;
            this.j(templateData);
            this.c = templateData.label.onDidRender(() => this.j(templateData));
        }
        j(templateData) {
            this.b = Array.from(templateData.container.querySelectorAll('.label-name'));
            let parents = '';
            for (let i = 0; i < this.labels.length; i++) {
                const ariaLabel = parents.length ? `${this.items[i].name}, compact, ${parents}` : this.items[i].name;
                this.labels[i].setAttribute('aria-label', ariaLabel);
                this.labels[i].setAttribute('aria-level', `${this.g + i}`);
                parents = parents.length ? `${this.items[i].name} ${parents}` : this.items[i].name;
            }
            this.updateCollapsed(this.h);
            if (this.a < this.labels.length) {
                this.labels[this.a].classList.add('active');
            }
        }
        previous() {
            if (this.a <= 0) {
                return;
            }
            this.setIndex(this.a - 1);
        }
        next() {
            if (this.a >= this.items.length - 1) {
                return;
            }
            this.setIndex(this.a + 1);
        }
        first() {
            if (this.a === 0) {
                return;
            }
            this.setIndex(0);
        }
        last() {
            if (this.a === this.items.length - 1) {
                return;
            }
            this.setIndex(this.items.length - 1);
        }
        setIndex(index) {
            if (index < 0 || index >= this.items.length) {
                return;
            }
            this.labels[this.a].classList.remove('active');
            this.a = index;
            this.labels[this.a].classList.add('active');
            this.d.fire();
        }
        updateCollapsed(collapsed) {
            this.h = collapsed;
            for (let i = 0; i < this.labels.length; i++) {
                this.labels[i].setAttribute('aria-expanded', collapsed ? 'false' : 'true');
            }
        }
        dispose() {
            this.d.dispose();
            this.c.dispose();
        }
    }
    exports.$iIb = $iIb;
    let $jIb = class $jIb {
        static { $jIb_1 = this; }
        static { this.ID = 'file'; }
        constructor(container, g, h, j, k, l, m, n, o, p, q) {
            this.g = g;
            this.h = h;
            this.j = j;
            this.k = k;
            this.l = l;
            this.m = m;
            this.n = n;
            this.o = o;
            this.p = p;
            this.q = q;
            this.c = new Map();
            this.d = new event_1.$ld();
            this.onDidChangeActiveDescendant = this.d.event;
            this.f = new class {
                get delay() {
                    // Delay implementation borrowed froms src/vs/workbench/browser/parts/statusbar/statusbarPart.ts
                    if (Date.now() - this.a < 500) {
                        return 0; // show instantly when a hover was recently shown
                    }
                    return this.c.getValue('workbench.hover.delay');
                }
                constructor(c, d) {
                    this.c = c;
                    this.d = d;
                    this.a = 0;
                    this.b = false;
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
                    return overflowed ? this.d.showHover({
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
                    if (!this.b) {
                        this.a = Date.now();
                    }
                    this.b = false;
                }
            }(this.l, this.q);
            this.a = this.l.getValue();
            const updateOffsetStyles = () => {
                const indent = this.l.getValue('workbench.tree.indent');
                const offset = Math.max(22 - indent, 0); // derived via inspection
                container.style.setProperty(`--vscode-explorer-align-offset-margin-left`, `${offset}px`);
            };
            this.b = this.l.onDidChangeConfiguration(e => {
                if (e.affectsConfiguration('explorer')) {
                    this.a = this.l.getValue();
                }
                if (e.affectsConfiguration('workbench.tree.indent')) {
                    updateOffsetStyles();
                }
            });
            updateOffsetStyles();
        }
        getWidgetAriaLabel() {
            return (0, nls_1.localize)(0, null);
        }
        get templateId() {
            return $jIb_1.ID;
        }
        renderTemplate(container) {
            const templateDisposables = new lifecycle_1.$jc();
            const experimentalHover = this.l.getValue('explorer.experimental.hover');
            const label = templateDisposables.add(this.g.create(container, { supportHighlights: true, hoverDelegate: experimentalHover ? this.f : undefined }));
            templateDisposables.add(label.onDidRender(() => {
                try {
                    if (templateData.currentContext) {
                        this.h(templateData.currentContext);
                    }
                }
                catch (e) {
                    // noop since the element might no longer be in the tree, no update of width necessary
                }
            }));
            const templateData = { templateDisposables, elementDisposables: templateDisposables.add(new lifecycle_1.$jc()), label, container };
            return templateData;
        }
        renderElement(node, index, templateData) {
            const stat = node.element;
            templateData.currentContext = stat;
            const editableData = this.m.getEditableData(stat);
            templateData.label.element.classList.remove('compressed');
            // File Label
            if (!editableData) {
                templateData.label.element.style.display = 'flex';
                this.t(stat, stat.name, undefined, node.filterData, templateData);
            }
            // Input Box
            else {
                templateData.label.element.style.display = 'none';
                templateData.elementDisposables.add(this.u(templateData.container, stat, editableData));
            }
        }
        renderCompressedElements(node, index, templateData, height) {
            const stat = node.element.elements[node.element.elements.length - 1];
            templateData.currentContext = stat;
            const editable = node.element.elements.filter(e => this.m.isEditable(e));
            const editableData = editable.length === 0 ? undefined : this.m.getEditableData(editable[0]);
            // File Label
            if (!editableData) {
                templateData.label.element.classList.add('compressed');
                templateData.label.element.style.display = 'flex';
                const id = `compressed-explorer_${$iIb.ID++}`;
                const label = node.element.elements.map(e => e.name);
                this.t(stat, label, id, node.filterData, templateData);
                const compressedNavigationController = new $iIb(id, node.element.elements, templateData, node.depth, node.collapsed);
                templateData.elementDisposables.add(compressedNavigationController);
                this.c.set(stat, compressedNavigationController);
                // accessibility
                templateData.elementDisposables.add(this.d.add(compressedNavigationController.onDidChange));
                templateData.elementDisposables.add(DOM.$nO(templateData.container, 'mousedown', e => {
                    const result = getIconLabelNameFromHTMLElement(e.target);
                    if (result) {
                        compressedNavigationController.setIndex(result.index);
                    }
                }));
                templateData.elementDisposables.add((0, lifecycle_1.$ic)(() => this.c.delete(stat)));
            }
            // Input Box
            else {
                templateData.label.element.classList.remove('compressed');
                templateData.label.element.style.display = 'none';
                templateData.elementDisposables.add(this.u(templateData.container, editable[0], editableData));
            }
        }
        t(stat, label, domId, filterData, templateData) {
            templateData.label.element.style.display = 'flex';
            const extraClasses = ['explorer-item'];
            if (this.m.isCut(stat)) {
                extraClasses.push('cut');
            }
            // Offset nested children unless folders have both chevrons and icons, otherwise alignment breaks
            const theme = this.k.getFileIconTheme();
            // Hack to always render chevrons for file nests, or else may not be able to identify them.
            const twistieContainer = templateData.container.parentElement?.parentElement?.querySelector('.monaco-tl-twistie');
            twistieContainer?.classList.toggle('force-twistie', stat.hasNests && theme.hidesExplorerArrows);
            // when explorer arrows are hidden or there are no folder icons, nests get misaligned as they are forced to have arrows and files typically have icons
            // Apply some CSS magic to get things looking as reasonable as possible.
            const themeIsUnhappyWithNesting = theme.hasFileIcons && (theme.hidesExplorerArrows || !theme.hasFolderIcons);
            const realignNestedChildren = stat.nestedParent && themeIsUnhappyWithNesting;
            const experimentalHover = this.l.getValue('explorer.experimental.hover');
            templateData.label.setResource({ resource: stat.resource, name: label }, {
                title: experimentalHover ? (0, types_1.$kf)(label) ? label[0] : label : undefined,
                fileKind: stat.isRoot ? files_1.FileKind.ROOT_FOLDER : stat.isDirectory ? files_1.FileKind.FOLDER : files_1.FileKind.FILE,
                extraClasses: realignNestedChildren ? [...extraClasses, 'align-nest-icon-with-parent-icon'] : extraClasses,
                fileDecorations: this.a.explorer.decorations,
                matches: (0, filters_1.$Hj)(filterData),
                separator: this.n.getSeparator(stat.resource.scheme, stat.resource.authority),
                domId
            });
        }
        u(container, stat, editableData) {
            // Use a file label only for the icon next to the input box
            const label = this.g.create(container);
            const extraClasses = ['explorer-item', 'explorer-item-edited'];
            const fileKind = stat.isRoot ? files_1.FileKind.ROOT_FOLDER : stat.isDirectory ? files_1.FileKind.FOLDER : files_1.FileKind.FILE;
            const theme = this.k.getFileIconTheme();
            const themeIsUnhappyWithNesting = theme.hasFileIcons && (theme.hidesExplorerArrows || !theme.hasFolderIcons);
            const realignNestedChildren = stat.nestedParent && themeIsUnhappyWithNesting;
            const labelOptions = {
                hidePath: true,
                hideLabel: true,
                fileKind,
                extraClasses: realignNestedChildren ? [...extraClasses, 'align-nest-icon-with-parent-icon'] : extraClasses,
            };
            const parent = stat.name ? (0, resources_1.$hg)(stat.resource) : stat.resource;
            const value = stat.name || '';
            label.setFile((0, resources_1.$ig)(parent, value || ' '), labelOptions); // Use icon for ' ' if name is empty.
            // hack: hide label
            label.element.firstElementChild.style.display = 'none';
            // Input field for name
            const inputBox = new inputBox_1.$sR(label.element, this.j, {
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
                ariaLabel: (0, nls_1.localize)(1, null),
                inputBoxStyles: defaultStyles_1.$s2
            });
            const lastDot = value.lastIndexOf('.');
            let currentSelectionState = 'prefix';
            inputBox.value = value;
            inputBox.focus();
            inputBox.select({ start: 0, end: lastDot > 0 && !stat.isDirectory ? lastDot : value.length });
            const done = (0, functional_1.$bb)((success, finishEditing) => {
                label.element.style.display = 'none';
                const value = inputBox.value;
                (0, lifecycle_1.$fc)(toDispose);
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
                    label.setFile((0, resources_1.$ig)(parent, value || ' '), labelOptions); // update label icon while typing!
                }),
                DOM.$oO(inputBox.inputElement, DOM.$3O.KEY_DOWN, (e) => {
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
                DOM.$oO(inputBox.inputElement, DOM.$3O.KEY_UP, (e) => {
                    showInputBoxNotification();
                }),
                DOM.$nO(inputBox.inputElement, DOM.$3O.BLUR, async () => {
                    while (true) {
                        await (0, async_1.$Hg)(0);
                        if (!document.hasFocus()) {
                            break;
                        }
                        if (document.activeElement === inputBox.inputElement) {
                            return;
                        }
                        else if (document.activeElement instanceof HTMLElement && DOM.$RO(document.activeElement, 'context-view')) {
                            await event_1.Event.toPromise(this.p.onDidHideContextMenu);
                        }
                        else {
                            break;
                        }
                    }
                    done(inputBox.isInputValid(), true);
                }),
                label
            ];
            return (0, lifecycle_1.$ic)(() => {
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
            return this.c.get(stat);
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
            if (this.o.getWorkbenchState() === 3 /* WorkbenchState.WORKSPACE */) {
                depth = depth + 1;
            }
            return depth;
        }
        getActiveDescendantId(stat) {
            const compressedNavigationController = this.c.get(stat);
            return compressedNavigationController?.currentId;
        }
        dispose() {
            this.b.dispose();
        }
    };
    exports.$jIb = $jIb;
    exports.$jIb = $jIb = $jIb_1 = __decorate([
        __param(3, contextView_1.$VZ),
        __param(4, themeService_1.$gv),
        __param(5, configuration_1.$8h),
        __param(6, files_2.$xHb),
        __param(7, label_1.$Vz),
        __param(8, workspace_1.$Kh),
        __param(9, contextView_1.$WZ),
        __param(10, hover_1.$zib)
    ], $jIb);
    /**
     * Respects files.exclude setting in filtering out content from the explorer.
     * Makes sure that visible editors are always shown in the explorer even if they are filtered out by settings.
     */
    let $kIb = class $kIb {
        constructor(h, j, k, l, m, n) {
            this.h = h;
            this.j = j;
            this.k = k;
            this.l = l;
            this.m = m;
            this.n = n;
            this.a = new Map();
            this.b = new Set();
            this.c = new event_1.$fd();
            this.d = [];
            // List of ignoreFile resources. Used to detect changes to the ignoreFiles.
            this.f = new Map();
            // Ignore tree per root. Similar to `hiddenExpressionPerRoot`
            // Note: URI in the ternary search tree is the URI of the folder containing the ignore file
            // It is not the ignore file itself. This is because of the way the IgnoreFile works and nested paths
            this.g = new Map();
            this.d.push(this.h.onDidChangeWorkspaceFolders(() => this.o()));
            this.d.push(this.j.onDidChangeConfiguration((e) => {
                if (e.affectsConfiguration('files.exclude') || e.affectsConfiguration('explorer.excludeGitIgnore')) {
                    this.o();
                }
            }));
            this.d.push(this.n.onDidFilesChange(e => {
                // Check to see if the update contains any of the ignoreFileResources
                for (const [root, ignoreFileResourceSet] of this.f.entries()) {
                    ignoreFileResourceSet.forEach(async (ignoreResource) => {
                        if (e.contains(ignoreResource, 0 /* FileChangeType.UPDATED */)) {
                            await this.p(root, ignoreResource, true);
                        }
                        if (e.contains(ignoreResource, 2 /* FileChangeType.DELETED */)) {
                            this.g.get(root)?.delete((0, resources_1.$hg)(ignoreResource));
                            ignoreFileResourceSet.delete(ignoreResource);
                            this.c.fire();
                        }
                    });
                }
            }));
            this.d.push(this.l.onDidVisibleEditorsChange(() => {
                const editors = this.l.visibleEditors;
                let shouldFire = false;
                for (const e of editors) {
                    if (!e.resource) {
                        continue;
                    }
                    const stat = this.k.findClosest(e.resource);
                    if (stat && stat.isExcluded) {
                        // A filtered resource suddenly became visible since user opened an editor
                        shouldFire = true;
                        break;
                    }
                }
                for (const e of this.b) {
                    if (!editors.includes(e)) {
                        // Editor that was affecting filtering is no longer visible
                        shouldFire = true;
                        break;
                    }
                }
                if (shouldFire) {
                    this.b.clear();
                    this.c.fire();
                }
            }));
            this.o();
        }
        get onDidChange() {
            return this.c.event;
        }
        o() {
            let shouldFire = false;
            let updatedGitIgnoreSetting = false;
            this.h.getWorkspace().folders.forEach(folder => {
                const configuration = this.j.getValue({ resource: folder.uri });
                const excludesConfig = configuration?.files?.exclude || Object.create(null);
                const parseIgnoreFile = configuration.explorer.excludeGitIgnore;
                // If we should be parsing ignoreFiles for this workspace and don't have an ignore tree initialize one
                if (parseIgnoreFile && !this.g.has(folder.uri.toString())) {
                    updatedGitIgnoreSetting = true;
                    this.f.set(folder.uri.toString(), new map_1.$Ai());
                    this.g.set(folder.uri.toString(), ternarySearchTree_1.$Hh.forUris((uri) => this.m.extUri.ignorePathCasing(uri)));
                }
                // If we shouldn't be parsing ignore files but have an ignore tree, clear the ignore tree
                if (!parseIgnoreFile && this.g.has(folder.uri.toString())) {
                    updatedGitIgnoreSetting = true;
                    this.f.delete(folder.uri.toString());
                    this.g.delete(folder.uri.toString());
                }
                if (!shouldFire) {
                    const cached = this.a.get(folder.uri.toString());
                    shouldFire = !cached || !(0, objects_1.$Zm)(cached.original, excludesConfig);
                }
                const excludesConfigCopy = (0, objects_1.$Vm)(excludesConfig); // do not keep the config, as it gets mutated under our hoods
                this.a.set(folder.uri.toString(), { original: excludesConfigCopy, parsed: glob.$rj(excludesConfigCopy) });
            });
            if (shouldFire || updatedGitIgnoreSetting) {
                this.b.clear();
                this.c.fire();
            }
        }
        /**
         * Given a .gitignore file resource, processes the resource and adds it to the ignore tree which hides explorer items
         * @param root The root folder of the workspace as a string. Used for lookup key for ignore tree and resource list
         * @param ignoreFileResource The resource of the .gitignore file
         * @param update Whether or not we're updating an existing ignore file. If true it deletes the old entry
         */
        async p(root, ignoreFileResource, update) {
            // Get the name of the directory which the ignore file is in
            const dirUri = (0, resources_1.$hg)(ignoreFileResource);
            const ignoreTree = this.g.get(root);
            if (!ignoreTree) {
                return;
            }
            // Don't process a directory if we already have it in the tree
            if (!update && ignoreTree.has(dirUri)) {
                return;
            }
            // Maybe we need a cancellation token here in case it's super long?
            const content = await this.n.readFile(ignoreFileResource);
            // If it's just an update we update the contents keeping all references the same
            if (update) {
                const ignoreFile = ignoreTree.get(dirUri);
                ignoreFile?.updateContents(content.value.toString());
            }
            else {
                // Otherwise we create a new ignorefile and add it to the tree
                const ignoreParent = ignoreTree.findSubstr(dirUri);
                const ignoreFile = new ignoreFile_1.$eIb(content.value.toString(), dirUri.path, ignoreParent);
                ignoreTree.set(dirUri, ignoreFile);
                // If we haven't seen this resource before then we need to add it to the list of resources we're tracking
                if (!this.f.get(root)?.has(ignoreFileResource)) {
                    this.f.get(root)?.add(ignoreFileResource);
                }
            }
            // Notify the explorer of the change so we may ignore these files
            this.c.fire();
        }
        filter(stat, parentVisibility) {
            // Add newly visited .gitignore files to the ignore tree
            if (stat.name === '.gitignore' && this.g.has(stat.root.resource.toString())) {
                this.p(stat.root.resource.toString(), stat.resource, false);
                return true;
            }
            return this.q(stat, parentVisibility);
        }
        q(stat, parentVisibility) {
            stat.isExcluded = false;
            if (parentVisibility === 0 /* TreeVisibility.Hidden */) {
                stat.isExcluded = true;
                return false;
            }
            if (this.k.getEditableData(stat)) {
                return true; // always visible
            }
            // Hide those that match Hidden Patterns
            const cached = this.a.get(stat.root.resource.toString());
            const globMatch = cached?.parsed(path.$$d(stat.root.resource.path, stat.resource.path), stat.name, name => !!(stat.parent && stat.parent.getChild(name)));
            // Small optimization to only traverse gitIgnore if the globMatch from fileExclude returned nothing
            const ignoreFile = globMatch ? undefined : this.g.get(stat.root.resource.toString())?.findSubstr(stat.resource);
            const isIncludedInTraversal = ignoreFile?.isPathIncludedInTraversal(stat.resource.path, stat.isDirectory);
            // Doing !undefined returns true and we want it to be false when undefined because that means it's not included in the ignore file
            const isIgnoredByIgnoreFile = isIncludedInTraversal === undefined ? false : !isIncludedInTraversal;
            if (isIgnoredByIgnoreFile || globMatch || stat.parent?.isExcluded) {
                stat.isExcluded = true;
                const editors = this.l.visibleEditors;
                const editor = editors.find(e => e.resource && this.m.extUri.isEqualOrParent(e.resource, stat.resource));
                if (editor && stat.root === this.k.findClosestRoot(stat.resource)) {
                    this.b.add(editor);
                    return true; // Show all opened files and their parents
                }
                return false; // hidden through pattern
            }
            return true;
        }
        dispose() {
            (0, lifecycle_1.$fc)(this.d);
        }
    };
    exports.$kIb = $kIb;
    exports.$kIb = $kIb = __decorate([
        __param(0, workspace_1.$Kh),
        __param(1, configuration_1.$8h),
        __param(2, files_2.$xHb),
        __param(3, editorService_1.$9C),
        __param(4, uriIdentity_1.$Ck),
        __param(5, files_1.$6j)
    ], $kIb);
    // Explorer Sorter
    let $lIb = class $lIb {
        constructor(a, b) {
            this.a = a;
            this.b = b;
        }
        compare(statA, statB) {
            // Do not sort roots
            if (statA.isRoot) {
                if (statB.isRoot) {
                    const workspaceA = this.b.getWorkspaceFolder(statA.resource);
                    const workspaceB = this.b.getWorkspaceFolder(statB.resource);
                    return workspaceA && workspaceB ? (workspaceA.index - workspaceB.index) : -1;
                }
                return -1;
            }
            if (statB.isRoot) {
                return 1;
            }
            const sortOrder = this.a.sortOrderConfiguration.sortOrder;
            const lexicographicOptions = this.a.sortOrderConfiguration.lexicographicOptions;
            let compareFileNames;
            let compareFileExtensions;
            switch (lexicographicOptions) {
                case 'upper':
                    compareFileNames = comparers_1.$_p;
                    compareFileExtensions = comparers_1.$eq;
                    break;
                case 'lower':
                    compareFileNames = comparers_1.$aq;
                    compareFileExtensions = comparers_1.$fq;
                    break;
                case 'unicode':
                    compareFileNames = comparers_1.$bq;
                    compareFileExtensions = comparers_1.$gq;
                    break;
                default:
                    // 'default'
                    compareFileNames = comparers_1.$$p;
                    compareFileExtensions = comparers_1.$dq;
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
    exports.$lIb = $lIb;
    exports.$lIb = $lIb = __decorate([
        __param(0, files_2.$xHb),
        __param(1, workspace_1.$Kh)
    ], $lIb);
    let $mIb = class $mIb {
        static { $mIb_1 = this; }
        static { this.a = 'explorer.confirmDragAndDrop'; }
        constructor(g, h, j, k, l, m, n, o, p, q) {
            this.g = g;
            this.h = h;
            this.j = j;
            this.k = k;
            this.l = l;
            this.m = m;
            this.n = n;
            this.o = o;
            this.p = p;
            this.q = q;
            this.c = lifecycle_1.$kc.None;
            this.f = false;
            this.d = [];
            const updateDropEnablement = (e) => {
                if (!e || e.affectsConfiguration('explorer.enableDragAndDrop')) {
                    this.f = this.n.getValue('explorer.enableDragAndDrop');
                }
            };
            updateDropEnablement(undefined);
            this.d.push(this.n.onDidChangeConfiguration(e => updateDropEnablement(e)));
        }
        onDragOver(data, target, targetIndex, originalEvent) {
            if (!this.f) {
                return false;
            }
            // Compressed folders
            if (target) {
                const compressedTarget = $mIb_1.z(target, originalEvent);
                if (compressedTarget) {
                    const iconLabelName = getIconLabelNameFromHTMLElement(originalEvent.target);
                    if (iconLabelName && iconLabelName.index < iconLabelName.count - 1) {
                        const result = this.t(data, compressedTarget, targetIndex, originalEvent);
                        if (result) {
                            if (iconLabelName.element !== this.b) {
                                this.b = iconLabelName.element;
                                this.c.dispose();
                                this.c = (0, lifecycle_1.$ic)(() => {
                                    iconLabelName.element.classList.remove('drop-target');
                                    this.b = undefined;
                                });
                                iconLabelName.element.classList.add('drop-target');
                            }
                            return typeof result === 'boolean' ? result : { ...result, feedback: [] };
                        }
                        this.c.dispose();
                        return false;
                    }
                }
            }
            this.c.dispose();
            return this.t(data, target, targetIndex, originalEvent);
        }
        t(data, target, targetIndex, originalEvent) {
            const isCopy = originalEvent && ((originalEvent.ctrlKey && !platform_1.$j) || (originalEvent.altKey && platform_1.$j));
            const isNative = data instanceof listView_1.$lQ;
            const effect = (isNative || isCopy) ? 0 /* ListDragOverEffect.Copy */ : 1 /* ListDragOverEffect.Move */;
            // Native DND
            if (isNative) {
                if (!(0, dnd_1.$06)(originalEvent, dnd_3.$CP.FILES, dnd_1.$56.FILES, dnd_3.$CP.RESOURCES)) {
                    return false;
                }
            }
            // Other-Tree DND
            else if (data instanceof listView_1.$kQ) {
                return false;
            }
            // In-Explorer DND
            else {
                const items = $mIb_1.y(data);
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
                    if (source.isRoot && target instanceof explorerModel_1.$vHb && !target.isRoot) {
                        return true; // Root folder can not be moved to a non root file stat.
                    }
                    if (this.q.extUri.isEqual(source.resource, target.resource)) {
                        return true; // Can not move anything onto itself
                    }
                    if (source.isRoot && target instanceof explorerModel_1.$vHb && target.isRoot) {
                        // Disable moving workspace roots in one another
                        return false;
                    }
                    if (!isCopy && this.q.extUri.isEqual((0, resources_1.$hg)(source.resource), target.resource)) {
                        return true; // Can not move a file to the same parent unless we copy
                    }
                    if (this.q.extUri.isEqualOrParent(target.resource, source.resource)) {
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
                if (this.l.getWorkspace().folders.every(folder => folder.uri.toString() !== target.resource.toString())) {
                    return { accept: true, bubble: 1 /* TreeDragOverBubble.Up */, effect };
                }
            }
            return false;
        }
        getDragURI(element) {
            if (this.h.isEditable(element)) {
                return null;
            }
            return element.resource.toString();
        }
        getDragLabel(elements, originalEvent) {
            if (elements.length === 1) {
                const stat = $mIb_1.z(elements[0], originalEvent);
                return stat.name;
            }
            return String(elements.length);
        }
        onDragStart(data, originalEvent) {
            const items = $mIb_1.y(data, originalEvent);
            if (items && items.length && originalEvent.dataTransfer) {
                // Apply some datatransfer types to allow for dragging the element outside of the application
                this.o.invokeFunction(accessor => (0, dnd_2.$veb)(accessor, items, originalEvent));
                // The only custom data transfer we set from the explorer is a file transfer
                // to be able to DND between multiple code file explorers across windows
                const fileResources = items.filter(s => s.resource.scheme === network_1.Schemas.file).map(r => r.resource.fsPath);
                if (fileResources.length) {
                    originalEvent.dataTransfer.setData(dnd_1.$56.FILES, JSON.stringify(fileResources));
                }
            }
        }
        async drop(data, target, targetIndex, originalEvent) {
            this.c.dispose();
            // Find compressed target
            if (target) {
                const compressedTarget = $mIb_1.z(target, originalEvent);
                if (compressedTarget) {
                    target = compressedTarget;
                }
            }
            // Find parent to add to
            if (!target) {
                target = this.h.roots[this.h.roots.length - 1];
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
                if (data instanceof listView_1.$lQ) {
                    // Use local file import when supported
                    if (!platform_1.$o || ((0, workspace_1.$3h)(this.l.getWorkspace()) && webFileSystemAccess_1.WebFileSystemAccess.supported(window))) {
                        const fileImport = this.o.createInstance(fileImportExport_1.$CHb);
                        await fileImport.import(resolvedTarget, originalEvent);
                    }
                    // Otherwise fallback to browser based file upload
                    else {
                        const browserUpload = this.o.createInstance(fileImportExport_1.$BHb);
                        await browserUpload.upload(target, originalEvent);
                    }
                }
                // In-Explorer DND (Move/Copy file)
                else {
                    await this.u(data, resolvedTarget, originalEvent);
                }
            }
            catch (error) {
                this.k.error((0, errorMessage_1.$mi)(error));
            }
        }
        async u(data, target, originalEvent) {
            const elementsData = $mIb_1.y(data);
            const distinctItems = new Map(elementsData.map(element => [element, this.g(element)]));
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
            const items = (0, resources_1.$rg)([...distinctItems.keys()], s => s.resource);
            const isCopy = (originalEvent.ctrlKey && !platform_1.$j) || (originalEvent.altKey && platform_1.$j);
            // Handle confirm setting
            const confirmDragAndDrop = !isCopy && this.n.getValue($mIb_1.a);
            if (confirmDragAndDrop) {
                const message = items.length > 1 && items.every(s => s.isRoot) ? (0, nls_1.localize)(2, null)
                    : items.length > 1 ? (0, nls_1.localize)(3, null, items.length, target.name)
                        : items[0].isRoot ? (0, nls_1.localize)(4, null, items[0].name)
                            : (0, nls_1.localize)(5, null, items[0].name, target.name);
                const detail = items.length > 1 && !items.every(s => s.isRoot) ? (0, dialogs_1.$rA)(items.map(i => i.resource)) : undefined;
                const confirmation = await this.k.confirm({
                    message,
                    detail,
                    checkbox: {
                        label: (0, nls_1.localize)(6, null)
                    },
                    primaryButton: (0, nls_1.localize)(7, null)
                });
                if (!confirmation.confirmed) {
                    return;
                }
                // Check for confirmation checkbox
                if (confirmation.checkboxChecked === true) {
                    await this.n.updateValue($mIb_1.a, false);
                }
            }
            await this.v(items.filter(s => s.isRoot), target);
            const sources = items.filter(s => !s.isRoot);
            if (isCopy) {
                return this.w(sources, target);
            }
            return this.x(sources, target);
        }
        async v(roots, target) {
            if (roots.length === 0) {
                return;
            }
            const folders = this.l.getWorkspace().folders;
            let targetIndex;
            const workspaceCreationData = [];
            const rootsToMove = [];
            for (let index = 0; index < folders.length; index++) {
                const data = {
                    uri: folders[index].uri,
                    name: folders[index].name
                };
                if (target instanceof explorerModel_1.$vHb && this.q.extUri.isEqual(folders[index].uri, target.resource)) {
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
            return this.p.updateFolders(0, workspaceCreationData.length, workspaceCreationData);
        }
        async w(sources, target) {
            // Reuse duplicate action when user copies
            const explorerConfig = this.n.getValue().explorer;
            const resourceFileEdits = [];
            for (const { resource, isDirectory } of sources) {
                const allowOverwrite = explorerConfig.incrementalNaming === 'disabled';
                const newResource = await (0, fileActions_1.$THb)(this.h, this.m, this.k, target, { resource, isDirectory, allowOverwrite }, explorerConfig.incrementalNaming);
                if (!newResource) {
                    continue;
                }
                const resourceEdit = new bulkEditService_1.$q1(resource, newResource, { copy: true, overwrite: allowOverwrite });
                resourceFileEdits.push(resourceEdit);
            }
            const labelSuffix = getFileOrFolderLabelSuffix(sources);
            await this.h.applyBulkEdit(resourceFileEdits, {
                confirmBeforeUndo: explorerConfig.confirmUndo === "default" /* UndoConfirmLevel.Default */ || explorerConfig.confirmUndo === "verbose" /* UndoConfirmLevel.Verbose */,
                undoLabel: (0, nls_1.localize)(8, null, labelSuffix),
                progressLabel: (0, nls_1.localize)(9, null, labelSuffix),
            });
            const editors = resourceFileEdits.filter(edit => {
                const item = edit.newResource ? this.h.findClosest(edit.newResource) : undefined;
                return item && !item.isDirectory;
            }).map(edit => ({ resource: edit.newResource, options: { pinned: true } }));
            await this.j.openEditors(editors);
        }
        async x(sources, target) {
            // Do not allow moving readonly items
            const resourceFileEdits = sources.filter(source => !source.isReadonly).map(source => new bulkEditService_1.$q1(source.resource, (0, resources_1.$ig)(target.resource, source.name)));
            const labelSuffix = getFileOrFolderLabelSuffix(sources);
            const options = {
                confirmBeforeUndo: this.n.getValue().explorer.confirmUndo === "verbose" /* UndoConfirmLevel.Verbose */,
                undoLabel: (0, nls_1.localize)(10, null, labelSuffix),
                progressLabel: (0, nls_1.localize)(11, null, labelSuffix)
            };
            try {
                await this.h.applyBulkEdit(resourceFileEdits, options);
            }
            catch (error) {
                // Conflict
                if (error.fileOperationResult === 4 /* FileOperationResult.FILE_MOVE_CONFLICT */) {
                    const overwrites = [];
                    for (const edit of resourceFileEdits) {
                        if (edit.newResource && await this.m.exists(edit.newResource)) {
                            overwrites.push(edit.newResource);
                        }
                    }
                    // Move with overwrite if the user confirms
                    const confirm = (0, fileImportExport_1.$FHb)(overwrites);
                    const { confirmed } = await this.k.confirm(confirm);
                    if (confirmed) {
                        await this.h.applyBulkEdit(resourceFileEdits.map(re => new bulkEditService_1.$q1(re.oldResource, re.newResource, { overwrite: true })), options);
                    }
                }
                // Any other error: bubble up
                else {
                    throw error;
                }
            }
        }
        static y(data, dragStartEvent) {
            if (data.context) {
                return data.context;
            }
            // Detect compressed folder dragging
            if (dragStartEvent && data.elements.length === 1) {
                data.context = [$mIb_1.z(data.elements[0], dragStartEvent)];
                return data.context;
            }
            return data.elements;
        }
        static z(stat, dragEvent) {
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
            this.c.dispose();
        }
    };
    exports.$mIb = $mIb;
    exports.$mIb = $mIb = $mIb_1 = __decorate([
        __param(1, files_2.$xHb),
        __param(2, editorService_1.$9C),
        __param(3, dialogs_1.$oA),
        __param(4, workspace_1.$Kh),
        __param(5, files_1.$6j),
        __param(6, configuration_1.$8h),
        __param(7, instantiation_1.$Ah),
        __param(8, workspaceEditing_1.$pU),
        __param(9, uriIdentity_1.$Ck)
    ], $mIb);
    function getIconLabelNameFromHTMLElement(target) {
        if (!(target instanceof HTMLElement)) {
            return null;
        }
        let element = target;
        while (element && !element.classList.contains('monaco-list-row')) {
            if (element.classList.contains('label-name') && element.hasAttribute('data-icon-label-count')) {
                const count = Number(element.getAttribute('data-icon-label-count'));
                const index = Number(element.getAttribute('data-icon-label-index'));
                if ((0, types_1.$nf)(count) && (0, types_1.$nf)(index)) {
                    return { element: element, count, index };
                }
            }
            element = element.parentElement;
        }
        return null;
    }
    function $nIb(target) {
        return !!getIconLabelNameFromHTMLElement(target);
    }
    exports.$nIb = $nIb;
    class $oIb {
        isIncompressible(stat) {
            return stat.isRoot || !stat.isDirectory || stat instanceof explorerModel_1.$wHb || (!stat.parent || stat.parent.isRoot);
        }
    }
    exports.$oIb = $oIb;
    function getFileOrFolderLabelSuffix(items) {
        if (items.length === 1) {
            return items[0].name;
        }
        if (items.every(i => i.isDirectory)) {
            return (0, nls_1.localize)(12, null, items.length);
        }
        if (items.every(i => !i.isDirectory)) {
            return (0, nls_1.localize)(13, null, items.length);
        }
        return `${items.length} files and folders`;
    }
});
//# sourceMappingURL=explorerViewer.js.map