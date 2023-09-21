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
define(["require", "exports", "vs/base/common/event", "vs/base/common/resources", "vs/base/common/lifecycle", "vs/workbench/browser/parts/views/viewPane", "vs/base/browser/dom", "vs/workbench/contrib/scm/common/scm", "vs/workbench/browser/labels", "vs/base/browser/ui/countBadge/countBadge", "vs/workbench/services/editor/common/editorService", "vs/platform/instantiation/common/instantiation", "vs/platform/contextview/browser/contextView", "vs/platform/contextkey/common/contextkey", "vs/platform/commands/common/commands", "vs/platform/keybinding/common/keybinding", "vs/platform/actions/common/actions", "vs/base/common/actions", "vs/base/browser/ui/actionbar/actionbar", "vs/platform/theme/common/themeService", "./util", "vs/platform/list/browser/listService", "vs/platform/configuration/common/configuration", "vs/base/common/async", "vs/base/common/resourceTree", "vs/base/common/iterator", "vs/base/common/uri", "vs/platform/files/common/files", "vs/base/common/comparers", "vs/base/common/filters", "vs/workbench/common/views", "vs/nls!vs/workbench/contrib/scm/browser/scmViewPane", "vs/base/common/arrays", "vs/base/common/decorators", "vs/platform/storage/common/storage", "vs/workbench/common/editor", "vs/workbench/common/theme", "vs/editor/browser/widget/codeEditorWidget", "vs/workbench/contrib/codeEditor/browser/simpleEditorOptions", "vs/editor/common/services/model", "vs/editor/browser/editorExtensions", "vs/workbench/contrib/codeEditor/browser/menuPreventer", "vs/workbench/contrib/codeEditor/browser/selectionClipboard", "vs/editor/contrib/contextmenu/browser/contextmenu", "vs/base/common/platform", "vs/base/common/strings", "vs/editor/contrib/suggest/browser/suggestController", "vs/editor/contrib/snippet/browser/snippetController2", "vs/platform/instantiation/common/serviceCollection", "vs/editor/contrib/hover/browser/hover", "vs/editor/contrib/colorPicker/browser/colorDetector", "vs/editor/contrib/links/browser/links", "vs/platform/opener/common/opener", "vs/platform/telemetry/common/telemetry", "vs/editor/common/languages/language", "vs/platform/label/common/label", "vs/workbench/browser/style", "vs/base/common/codicons", "vs/base/common/themables", "vs/workbench/contrib/scm/browser/scmRepositoryRenderer", "vs/platform/theme/common/theme", "vs/platform/uriIdentity/common/uriIdentity", "vs/workbench/browser/parts/editor/editorCommands", "vs/platform/actions/browser/menuEntryActionViewItem", "vs/platform/workspace/common/workspace", "vs/editor/contrib/markdownRenderer/browser/markdownRenderer", "vs/base/browser/ui/button/button", "vs/platform/notification/common/notification", "vs/workbench/contrib/scm/browser/scmViewService", "vs/editor/contrib/dnd/browser/dnd", "vs/editor/contrib/dropOrPasteInto/browser/dropIntoEditorController", "vs/editor/contrib/message/browser/messageController", "vs/platform/theme/common/colorRegistry", "vs/platform/theme/browser/defaultStyles", "vs/editor/contrib/inlineCompletions/browser/inlineCompletionsController", "vs/editor/contrib/codeAction/browser/codeActionController", "vs/editor/common/services/resolverService", "vs/base/common/network", "vs/workbench/browser/dnd", "vs/platform/dnd/browser/dnd", "vs/editor/contrib/format/browser/formatActions", "vs/css!./media/scm"], function (require, exports, event_1, resources_1, lifecycle_1, viewPane_1, dom_1, scm_1, labels_1, countBadge_1, editorService_1, instantiation_1, contextView_1, contextkey_1, commands_1, keybinding_1, actions_1, actions_2, actionbar_1, themeService_1, util_1, listService_1, configuration_1, async_1, resourceTree_1, iterator_1, uri_1, files_1, comparers_1, filters_1, views_1, nls_1, arrays_1, decorators_1, storage_1, editor_1, theme_1, codeEditorWidget_1, simpleEditorOptions_1, model_1, editorExtensions_1, menuPreventer_1, selectionClipboard_1, contextmenu_1, platform, strings_1, suggestController_1, snippetController2_1, serviceCollection_1, hover_1, colorDetector_1, links_1, opener_1, telemetry_1, language_1, label_1, style_1, codicons_1, themables_1, scmRepositoryRenderer_1, theme_2, uriIdentity_1, editorCommands_1, menuEntryActionViewItem_1, workspace_1, markdownRenderer_1, button_1, notification_1, scmViewService_1, dnd_1, dropIntoEditorController_1, messageController_1, colorRegistry_1, defaultStyles_1, inlineCompletionsController_1, codeActionController_1, resolverService_1, network_1, dnd_2, dnd_3, formatActions_1) {
    "use strict";
    var $PPb_1, InputRenderer_1, ResourceGroupRenderer_1, ResourceRenderer_1, SCMInputWidget_1;
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.$VPb = exports.$UPb = exports.$TPb = exports.$SPb = exports.$RPb = exports.$QPb = exports.$PPb = void 0;
    let $PPb = class $PPb {
        static { $PPb_1 = this; }
        static { this.DEFAULT_HEIGHT = 30; }
        static { this.TEMPLATE_ID = 'actionButton'; }
        get templateId() { return $PPb_1.TEMPLATE_ID; }
        constructor(b, c, d) {
            this.b = b;
            this.c = c;
            this.d = d;
            this.a = new Map();
        }
        renderTemplate(container) {
            // hack
            container.parentElement.parentElement.querySelector('.monaco-tl-twistie').classList.add('force-no-twistie');
            // Use default cursor & disable hover for list item
            container.parentElement.parentElement.classList.add('cursor-default', 'force-no-hover');
            const buttonContainer = (0, dom_1.$0O)(container, (0, dom_1.$)('.button-container'));
            const actionButton = new $VPb(buttonContainer, this.c, this.b, this.d);
            return { actionButton, disposable: lifecycle_1.$kc.None, templateDisposable: actionButton };
        }
        renderElement(node, index, templateData, height) {
            templateData.disposable.dispose();
            const disposables = new lifecycle_1.$jc();
            const actionButton = node.element;
            templateData.actionButton.setButton(node.element.button);
            // Remember action button
            this.a.set(actionButton, templateData.actionButton);
            disposables.add({ dispose: () => this.a.delete(actionButton) });
            templateData.disposable = disposables;
        }
        renderCompressedElements() {
            throw new Error('Should never happen since node is incompressible');
        }
        focusActionButton(actionButton) {
            this.a.get(actionButton)?.focus();
        }
        disposeElement(node, index, template) {
            template.disposable.dispose();
        }
        disposeTemplate(templateData) {
            templateData.disposable.dispose();
            templateData.templateDisposable.dispose();
        }
    };
    exports.$PPb = $PPb;
    exports.$PPb = $PPb = $PPb_1 = __decorate([
        __param(0, commands_1.$Fr),
        __param(1, contextView_1.$WZ),
        __param(2, notification_1.$Yu)
    ], $PPb);
    class SCMTreeDragAndDrop {
        constructor(a) {
            this.a = a;
        }
        getDragURI(element) {
            if ((0, util_1.$DPb)(element)) {
                return element.sourceUri.toString();
            }
            return null;
        }
        onDragStart(data, originalEvent) {
            const items = SCMTreeDragAndDrop.b(data);
            if (originalEvent.dataTransfer && items?.length) {
                this.a.invokeFunction(accessor => (0, dnd_2.$veb)(accessor, items, originalEvent));
                const fileResources = items.filter(s => s.scheme === network_1.Schemas.file).map(r => r.fsPath);
                if (fileResources.length) {
                    originalEvent.dataTransfer.setData(dnd_3.$56.FILES, JSON.stringify(fileResources));
                }
            }
        }
        getDragLabel(elements, originalEvent) {
            if (elements.length === 1) {
                const element = elements[0];
                if ((0, util_1.$DPb)(element)) {
                    return (0, resources_1.$fg)(element.sourceUri);
                }
            }
            return String(elements.length);
        }
        onDragOver(data, targetElement, targetIndex, originalEvent) {
            return true;
        }
        drop(data, targetElement, targetIndex, originalEvent) { }
        static b(data) {
            const uris = [];
            for (const element of [...data.context ?? [], ...data.elements]) {
                if ((0, util_1.$DPb)(element)) {
                    uris.push(element.sourceUri);
                }
            }
            return uris;
        }
    }
    let InputRenderer = class InputRenderer {
        static { InputRenderer_1 = this; }
        static { this.DEFAULT_HEIGHT = 26; }
        static { this.TEMPLATE_ID = 'input'; }
        get templateId() { return InputRenderer_1.TEMPLATE_ID; }
        constructor(d, f, g, h) {
            this.d = d;
            this.f = f;
            this.g = g;
            this.h = h;
            this.a = new Map();
            this.b = new WeakMap();
            this.c = new WeakMap();
        }
        renderTemplate(container) {
            // hack
            container.parentElement.parentElement.querySelector('.monaco-tl-twistie').classList.add('force-no-twistie');
            // Disable hover for list item
            container.parentElement.parentElement.classList.add('force-no-hover');
            const templateDisposable = new lifecycle_1.$jc();
            const inputElement = (0, dom_1.$0O)(container, (0, dom_1.$)('.scm-input'));
            const inputWidget = this.h.createInstance(SCMInputWidget, inputElement, this.f);
            templateDisposable.add(inputWidget);
            return { inputWidget, inputWidgetHeight: InputRenderer_1.DEFAULT_HEIGHT, elementDisposables: new lifecycle_1.$jc(), templateDisposable };
        }
        renderElement(node, index, templateData) {
            const input = node.element;
            templateData.inputWidget.setInput(input);
            // Remember widget
            this.a.set(input, templateData.inputWidget);
            templateData.elementDisposables.add({
                dispose: () => this.a.delete(input)
            });
            // Widget cursor selections
            const selections = this.c.get(input);
            if (selections) {
                templateData.inputWidget.selections = selections;
            }
            templateData.elementDisposables.add((0, lifecycle_1.$ic)(() => {
                const selections = templateData.inputWidget.selections;
                if (selections) {
                    this.c.set(input, selections);
                }
            }));
            // Rerender the element whenever the editor content height changes
            const onDidChangeContentHeight = () => {
                const contentHeight = templateData.inputWidget.getContentHeight();
                this.b.set(input, contentHeight);
                if (templateData.inputWidgetHeight !== contentHeight) {
                    this.g(input, contentHeight + 10);
                    templateData.inputWidgetHeight = contentHeight;
                    templateData.inputWidget.layout();
                }
            };
            const startListeningContentHeightChange = () => {
                templateData.elementDisposables.add(templateData.inputWidget.onDidChangeContentHeight(onDidChangeContentHeight));
                onDidChangeContentHeight();
            };
            // Setup height change listener on next tick
            const timeout = (0, async_1.$Ig)(startListeningContentHeightChange, 0);
            templateData.elementDisposables.add(timeout);
            // Layout the editor whenever the outer layout happens
            const layoutEditor = () => templateData.inputWidget.layout();
            templateData.elementDisposables.add(this.d.onDidChange(layoutEditor));
            layoutEditor();
        }
        renderCompressedElements() {
            throw new Error('Should never happen since node is incompressible');
        }
        disposeElement(group, index, template) {
            template.elementDisposables.clear();
        }
        disposeTemplate(templateData) {
            templateData.templateDisposable.dispose();
        }
        getHeight(input) {
            return (this.b.get(input) ?? InputRenderer_1.DEFAULT_HEIGHT) + 10;
        }
        getRenderedInputWidget(input) {
            return this.a.get(input);
        }
        getFocusedInput() {
            for (const [input, inputWidget] of this.a) {
                if (inputWidget.hasFocus()) {
                    return input;
                }
            }
            return undefined;
        }
        clearValidation() {
            for (const [, inputWidget] of this.a) {
                inputWidget.clearValidation();
            }
        }
    };
    InputRenderer = InputRenderer_1 = __decorate([
        __param(3, instantiation_1.$Ah)
    ], InputRenderer);
    let ResourceGroupRenderer = class ResourceGroupRenderer {
        static { ResourceGroupRenderer_1 = this; }
        static { this.TEMPLATE_ID = 'resource group'; }
        get templateId() { return ResourceGroupRenderer_1.TEMPLATE_ID; }
        constructor(a, b) {
            this.a = a;
            this.b = b;
        }
        renderTemplate(container) {
            // hack
            container.parentElement.parentElement.querySelector('.monaco-tl-twistie').classList.add('force-twistie');
            const element = (0, dom_1.$0O)(container, (0, dom_1.$)('.resource-group'));
            const name = (0, dom_1.$0O)(element, (0, dom_1.$)('.name'));
            const actionsContainer = (0, dom_1.$0O)(element, (0, dom_1.$)('.actions'));
            const actionBar = new actionbar_1.$1P(actionsContainer, { actionViewItemProvider: this.a });
            const countContainer = (0, dom_1.$0O)(element, (0, dom_1.$)('.count'));
            const count = new countBadge_1.$nR(countContainer, {}, defaultStyles_1.$v2);
            const disposables = (0, lifecycle_1.$hc)(actionBar);
            return { name, count, actionBar, elementDisposables: new lifecycle_1.$jc(), disposables };
        }
        renderElement(node, index, template) {
            const group = node.element;
            template.name.textContent = group.label;
            template.actionBar.clear();
            template.actionBar.context = group;
            template.count.setCount(group.elements.length);
            const menus = this.b.menus.getRepositoryMenus(group.provider);
            template.elementDisposables.add((0, util_1.$FPb)(menus.getResourceGroupMenu(group), template.actionBar));
        }
        renderCompressedElements(node, index, templateData, height) {
            throw new Error('Should never happen since node is incompressible');
        }
        disposeElement(group, index, template) {
            template.elementDisposables.clear();
        }
        disposeTemplate(template) {
            template.elementDisposables.dispose();
            template.disposables.dispose();
        }
    };
    ResourceGroupRenderer = ResourceGroupRenderer_1 = __decorate([
        __param(1, scm_1.$gI)
    ], ResourceGroupRenderer);
    class RepositoryPaneActionRunner extends actions_2.$hi {
        constructor(a) {
            super();
            this.a = a;
        }
        async u(action, context) {
            if (!(action instanceof actions_1.$Vu)) {
                return super.u(action, context);
            }
            const selection = this.a();
            const contextIsSelected = selection.some(s => s === context);
            const actualContext = contextIsSelected ? selection : [context];
            const args = (0, arrays_1.$Pb)(actualContext.map(e => resourceTree_1.$LS.isResourceNode(e) ? resourceTree_1.$LS.collect(e) : [e]));
            await action.run(...args);
        }
    }
    let ResourceRenderer = class ResourceRenderer {
        static { ResourceRenderer_1 = this; }
        static { this.TEMPLATE_ID = 'resource'; }
        get templateId() { return ResourceRenderer_1.TEMPLATE_ID; }
        constructor(c, d, f, g, h, k, l) {
            this.c = c;
            this.d = d;
            this.f = f;
            this.g = g;
            this.h = h;
            this.k = k;
            this.l = l;
            this.a = new lifecycle_1.$jc();
            this.b = new Map();
            l.onDidColorThemeChange(this.o, this, this.a);
        }
        renderTemplate(container) {
            const element = (0, dom_1.$0O)(container, (0, dom_1.$)('.resource'));
            const name = (0, dom_1.$0O)(element, (0, dom_1.$)('.name'));
            const fileLabel = this.d.create(name, { supportDescriptionHighlights: true, supportHighlights: true });
            const actionsContainer = (0, dom_1.$0O)(fileLabel.element, (0, dom_1.$)('.actions'));
            const actionBar = new actionbar_1.$1P(actionsContainer, {
                actionViewItemProvider: this.f,
                actionRunner: this.g
            });
            const decorationIcon = (0, dom_1.$0O)(element, (0, dom_1.$)('.decoration-icon'));
            const actionBarMenuListener = new lifecycle_1.$lc();
            const disposables = (0, lifecycle_1.$hc)(actionBar, fileLabel, actionBarMenuListener);
            return { element, name, fileLabel, decorationIcon, actionBar, actionBarMenu: undefined, actionBarMenuListener, elementDisposables: new lifecycle_1.$jc(), disposables };
        }
        renderElement(node, index, template) {
            const resourceOrFolder = node.element;
            const iconResource = resourceTree_1.$LS.isResourceNode(resourceOrFolder) ? resourceOrFolder.element : resourceOrFolder;
            const uri = resourceTree_1.$LS.isResourceNode(resourceOrFolder) ? resourceOrFolder.uri : resourceOrFolder.sourceUri;
            const fileKind = resourceTree_1.$LS.isResourceNode(resourceOrFolder) ? files_1.FileKind.FOLDER : files_1.FileKind.FILE;
            const viewModel = this.c();
            const tooltip = !resourceTree_1.$LS.isResourceNode(resourceOrFolder) && resourceOrFolder.decorations.tooltip || '';
            let matches;
            let descriptionMatches;
            let strikethrough;
            if (resourceTree_1.$LS.isResourceNode(resourceOrFolder)) {
                if (resourceOrFolder.element) {
                    const menus = this.k.menus.getRepositoryMenus(resourceOrFolder.element.resourceGroup.provider);
                    this.m(template, resourceOrFolder, menus.getResourceMenu(resourceOrFolder.element));
                    template.element.classList.toggle('faded', resourceOrFolder.element.decorations.faded);
                    strikethrough = resourceOrFolder.element.decorations.strikeThrough;
                }
                else {
                    const menus = this.k.menus.getRepositoryMenus(resourceOrFolder.context.provider);
                    this.m(template, resourceOrFolder, menus.getResourceFolderMenu(resourceOrFolder.context));
                    matches = (0, filters_1.$Hj)(node.filterData);
                    template.element.classList.remove('faded');
                }
            }
            else {
                const menus = this.k.menus.getRepositoryMenus(resourceOrFolder.resourceGroup.provider);
                this.m(template, resourceOrFolder, menus.getResourceMenu(resourceOrFolder));
                [matches, descriptionMatches] = this.n(uri, node.filterData);
                template.element.classList.toggle('faded', resourceOrFolder.decorations.faded);
                strikethrough = resourceOrFolder.decorations.strikeThrough;
            }
            const renderedData = {
                tooltip,
                uri,
                fileLabelOptions: {
                    hidePath: viewModel.mode === "tree" /* ViewModelMode.Tree */,
                    fileKind,
                    matches,
                    descriptionMatches,
                    strikethrough
                },
                iconResource
            };
            this.p(template, renderedData);
            this.b.set(template, renderedData);
            template.elementDisposables.add((0, lifecycle_1.$ic)(() => this.b.delete(template)));
            template.element.setAttribute('data-tooltip', tooltip);
        }
        disposeElement(resource, index, template) {
            template.elementDisposables.clear();
        }
        renderCompressedElements(node, index, template, height) {
            const compressed = node.element;
            const folder = compressed.elements[compressed.elements.length - 1];
            const label = compressed.elements.map(e => e.name);
            const fileKind = files_1.FileKind.FOLDER;
            const matches = (0, filters_1.$Hj)(node.filterData);
            template.fileLabel.setResource({ resource: folder.uri, name: label }, {
                fileDecorations: { colors: false, badges: true },
                fileKind,
                matches,
                separator: this.h.getSeparator(folder.uri.scheme)
            });
            const menus = this.k.menus.getRepositoryMenus(folder.context.provider);
            this.m(template, folder, menus.getResourceFolderMenu(folder.context));
            template.name.classList.remove('strike-through');
            template.element.classList.remove('faded');
            template.decorationIcon.style.display = 'none';
            template.decorationIcon.style.backgroundImage = '';
            template.element.setAttribute('data-tooltip', '');
        }
        disposeCompressedElements(node, index, template, height) {
            template.elementDisposables.clear();
        }
        disposeTemplate(template) {
            template.elementDisposables.dispose();
            template.disposables.dispose();
        }
        m(template, resourceOrFolder, menu) {
            if (!template.actionBarMenu || template.actionBarMenu !== menu) {
                template.actionBar.clear();
                template.actionBarMenu = menu;
                template.actionBarMenuListener.value = (0, util_1.$FPb)(menu, template.actionBar);
            }
            template.actionBar.context = resourceOrFolder;
        }
        n(uri, filterData) {
            if (!filterData) {
                return [undefined, undefined];
            }
            if (!filterData.label) {
                const matches = (0, filters_1.$Hj)(filterData);
                return [matches, undefined];
            }
            const fileName = (0, resources_1.$fg)(uri);
            const label = filterData.label;
            const pathLength = label.length - fileName.length;
            const matches = (0, filters_1.$Hj)(filterData.score);
            // FileName match
            if (label === fileName) {
                return [matches, undefined];
            }
            // FilePath match
            const labelMatches = [];
            const descriptionMatches = [];
            for (const match of matches) {
                if (match.start > pathLength) {
                    // Label match
                    labelMatches.push({
                        start: match.start - pathLength,
                        end: match.end - pathLength
                    });
                }
                else if (match.end < pathLength) {
                    // Description match
                    descriptionMatches.push(match);
                }
                else {
                    // Spanning match
                    labelMatches.push({
                        start: 0,
                        end: match.end - pathLength
                    });
                    descriptionMatches.push({
                        start: match.start,
                        end: pathLength
                    });
                }
            }
            return [labelMatches, descriptionMatches];
        }
        o() {
            for (const [template, data] of this.b) {
                this.p(template, data);
            }
        }
        p(template, data) {
            const theme = this.l.getColorTheme();
            const icon = theme.type === theme_2.ColorScheme.LIGHT ? data.iconResource?.decorations.icon : data.iconResource?.decorations.iconDark;
            template.fileLabel.setFile(data.uri, {
                ...data.fileLabelOptions,
                fileDecorations: { colors: false, badges: !icon },
            });
            if (icon) {
                if (themables_1.ThemeIcon.isThemeIcon(icon)) {
                    template.decorationIcon.className = `decoration-icon ${themables_1.ThemeIcon.asClassName(icon)}`;
                    if (icon.color) {
                        template.decorationIcon.style.color = theme.getColor(icon.color.id)?.toString() ?? '';
                    }
                    template.decorationIcon.style.display = '';
                    template.decorationIcon.style.backgroundImage = '';
                }
                else {
                    template.decorationIcon.className = 'decoration-icon';
                    template.decorationIcon.style.color = '';
                    template.decorationIcon.style.display = '';
                    template.decorationIcon.style.backgroundImage = (0, dom_1.$nP)(icon);
                }
                template.decorationIcon.title = data.tooltip;
            }
            else {
                template.decorationIcon.className = 'decoration-icon';
                template.decorationIcon.style.color = '';
                template.decorationIcon.style.display = 'none';
                template.decorationIcon.style.backgroundImage = '';
                template.decorationIcon.title = '';
            }
        }
        dispose() {
            this.a.dispose();
        }
    };
    ResourceRenderer = ResourceRenderer_1 = __decorate([
        __param(4, label_1.$Vz),
        __param(5, scm_1.$gI),
        __param(6, themeService_1.$gv)
    ], ResourceRenderer);
    class ListDelegate {
        constructor(a) {
            this.a = a;
        }
        getHeight(element) {
            if ((0, util_1.$APb)(element)) {
                return this.a.getHeight(element);
            }
            else if ((0, util_1.$BPb)(element)) {
                return $PPb.DEFAULT_HEIGHT + 10;
            }
            else {
                return 22;
            }
        }
        getTemplateId(element) {
            if ((0, util_1.$zPb)(element)) {
                return scmRepositoryRenderer_1.$JPb.TEMPLATE_ID;
            }
            else if ((0, util_1.$APb)(element)) {
                return InputRenderer.TEMPLATE_ID;
            }
            else if ((0, util_1.$BPb)(element)) {
                return $PPb.TEMPLATE_ID;
            }
            else if (resourceTree_1.$LS.isResourceNode(element) || (0, util_1.$DPb)(element)) {
                return ResourceRenderer.TEMPLATE_ID;
            }
            else {
                return ResourceGroupRenderer.TEMPLATE_ID;
            }
        }
    }
    class SCMTreeFilter {
        filter(element) {
            if (resourceTree_1.$LS.isResourceNode(element)) {
                return true;
            }
            else if ((0, util_1.$CPb)(element)) {
                return element.elements.length > 0 || !element.hideWhenEmpty;
            }
            else {
                return true;
            }
        }
    }
    class $QPb {
        get a() { return this.b(); }
        constructor(b) {
            this.b = b;
        }
        compare(one, other) {
            if ((0, util_1.$zPb)(one)) {
                if (!(0, util_1.$zPb)(other)) {
                    throw new Error('Invalid comparison');
                }
                return 0;
            }
            if ((0, util_1.$APb)(one)) {
                return -1;
            }
            else if ((0, util_1.$APb)(other)) {
                return 1;
            }
            if ((0, util_1.$BPb)(one)) {
                return -1;
            }
            else if ((0, util_1.$BPb)(other)) {
                return 1;
            }
            if ((0, util_1.$CPb)(one)) {
                if (!(0, util_1.$CPb)(other)) {
                    throw new Error('Invalid comparison');
                }
                return 0;
            }
            // List
            if (this.a.mode === "list" /* ViewModelMode.List */) {
                // FileName
                if (this.a.sortKey === "name" /* ViewModelSortKey.Name */) {
                    const oneName = (0, resources_1.$fg)(one.sourceUri);
                    const otherName = (0, resources_1.$fg)(other.sourceUri);
                    return (0, comparers_1.$0p)(oneName, otherName);
                }
                // Status
                if (this.a.sortKey === "status" /* ViewModelSortKey.Status */) {
                    const oneTooltip = one.decorations.tooltip ?? '';
                    const otherTooltip = other.decorations.tooltip ?? '';
                    if (oneTooltip !== otherTooltip) {
                        return (0, strings_1.$Fe)(oneTooltip, otherTooltip);
                    }
                }
                // Path (default)
                const onePath = one.sourceUri.fsPath;
                const otherPath = other.sourceUri.fsPath;
                return (0, comparers_1.$hq)(onePath, otherPath);
            }
            // Tree
            const oneIsDirectory = resourceTree_1.$LS.isResourceNode(one);
            const otherIsDirectory = resourceTree_1.$LS.isResourceNode(other);
            if (oneIsDirectory !== otherIsDirectory) {
                return oneIsDirectory ? -1 : 1;
            }
            const oneName = resourceTree_1.$LS.isResourceNode(one) ? one.name : (0, resources_1.$fg)(one.sourceUri);
            const otherName = resourceTree_1.$LS.isResourceNode(other) ? other.name : (0, resources_1.$fg)(other.sourceUri);
            return (0, comparers_1.$0p)(oneName, otherName);
        }
    }
    exports.$QPb = $QPb;
    __decorate([
        decorators_1.$6g
    ], $QPb.prototype, "a", null);
    let $RPb = class $RPb {
        constructor(a, b) {
            this.a = a;
            this.b = b;
        }
        getKeyboardNavigationLabel(element) {
            if (resourceTree_1.$LS.isResourceNode(element)) {
                return element.name;
            }
            else if ((0, util_1.$zPb)(element) || (0, util_1.$APb)(element) || (0, util_1.$BPb)(element)) {
                return undefined;
            }
            else if ((0, util_1.$CPb)(element)) {
                return element.label;
            }
            else {
                const viewModel = this.a();
                if (viewModel.mode === "list" /* ViewModelMode.List */) {
                    // In List mode match using the file name and the path.
                    // Since we want to match both on the file name and the
                    // full path we return an array of labels. A match in the
                    // file name takes precedence over a match in the path.
                    const fileName = (0, resources_1.$fg)(element.sourceUri);
                    const filePath = this.b.getUriLabel(element.sourceUri, { relative: true });
                    return [fileName, filePath];
                }
                else {
                    // In Tree mode only match using the file name
                    return (0, resources_1.$fg)(element.sourceUri);
                }
            }
        }
        getCompressedNodeKeyboardNavigationLabel(elements) {
            const folders = elements;
            return folders.map(e => e.name).join('/');
        }
    };
    exports.$RPb = $RPb;
    exports.$RPb = $RPb = __decorate([
        __param(1, label_1.$Vz)
    ], $RPb);
    function getSCMResourceId(element) {
        if (resourceTree_1.$LS.isResourceNode(element)) {
            const group = element.context;
            return `folder:${group.provider.id}/${group.id}/$FOLDER/${element.uri.toString()}`;
        }
        else if ((0, util_1.$zPb)(element)) {
            const provider = element.provider;
            return `repo:${provider.id}`;
        }
        else if ((0, util_1.$APb)(element)) {
            const provider = element.repository.provider;
            return `input:${provider.id}`;
        }
        else if ((0, util_1.$BPb)(element)) {
            const provider = element.repository.provider;
            return `actionButton:${provider.id}`;
        }
        else if ((0, util_1.$DPb)(element)) {
            const group = element.resourceGroup;
            const provider = group.provider;
            return `resource:${provider.id}/${group.id}/${element.sourceUri.toString()}`;
        }
        else {
            const provider = element.provider;
            return `group:${provider.id}/${element.id}`;
        }
    }
    class SCMResourceIdentityProvider {
        getId(element) {
            return getSCMResourceId(element);
        }
    }
    let $SPb = class $SPb {
        constructor(a, b) {
            this.a = a;
            this.b = b;
        }
        getWidgetAriaLabel() {
            return (0, nls_1.localize)(0, null);
        }
        getAriaLabel(element) {
            if (resourceTree_1.$LS.isResourceNode(element)) {
                return this.a.getUriLabel(element.uri, { relative: true, noPrefix: true }) || element.name;
            }
            else if ((0, util_1.$zPb)(element)) {
                let folderName = '';
                if (element.provider.rootUri) {
                    const folder = this.b.getWorkspaceFolder(element.provider.rootUri);
                    if (folder?.uri.toString() === element.provider.rootUri.toString()) {
                        folderName = folder.name;
                    }
                    else {
                        folderName = (0, resources_1.$fg)(element.provider.rootUri);
                    }
                }
                return `${folderName} ${element.provider.label}`;
            }
            else if ((0, util_1.$APb)(element)) {
                return (0, nls_1.localize)(1, null);
            }
            else if ((0, util_1.$BPb)(element)) {
                return element.button?.command.title ?? '';
            }
            else if ((0, util_1.$CPb)(element)) {
                return element.label;
            }
            else {
                const result = [];
                result.push((0, resources_1.$fg)(element.sourceUri));
                if (element.decorations.tooltip) {
                    result.push(element.decorations.tooltip);
                }
                const path = this.a.getUriLabel((0, resources_1.$hg)(element.sourceUri), { relative: true, noPrefix: true });
                if (path) {
                    result.push(path);
                }
                return result.join(', ');
            }
        }
    };
    exports.$SPb = $SPb;
    exports.$SPb = $SPb = __decorate([
        __param(0, label_1.$Vz),
        __param(1, workspace_1.$Kh)
    ], $SPb);
    function isRepositoryItem(item) {
        return Array.isArray(item.groupItems);
    }
    function asTreeElement(node, forceIncompressible, viewState) {
        const element = (node.childrenCount === 0 && node.element) ? node.element : node;
        const collapsed = viewState ? viewState.collapsed.indexOf(getSCMResourceId(element)) > -1 : false;
        return {
            element,
            children: iterator_1.Iterable.map(node.children, node => asTreeElement(node, false, viewState)),
            incompressible: !!node.element || forceIncompressible,
            collapsed,
            collapsible: node.childrenCount > 0
        };
    }
    var ViewModelMode;
    (function (ViewModelMode) {
        ViewModelMode["List"] = "list";
        ViewModelMode["Tree"] = "tree";
    })(ViewModelMode || (ViewModelMode = {}));
    var ViewModelSortKey;
    (function (ViewModelSortKey) {
        ViewModelSortKey["Path"] = "path";
        ViewModelSortKey["Name"] = "name";
        ViewModelSortKey["Status"] = "status";
    })(ViewModelSortKey || (ViewModelSortKey = {}));
    const Menus = {
        ViewSort: new actions_1.$Ru('SCMViewSort'),
        Repositories: new actions_1.$Ru('SCMRepositories'),
    };
    const ContextKeys = {
        ViewModelMode: new contextkey_1.$2i('scmViewModelMode', "list" /* ViewModelMode.List */),
        ViewModelSortKey: new contextkey_1.$2i('scmViewModelSortKey', "path" /* ViewModelSortKey.Path */),
        ViewModelAreAllRepositoriesCollapsed: new contextkey_1.$2i('scmViewModelAreAllRepositoriesCollapsed', false),
        ViewModelIsAnyRepositoryCollapsible: new contextkey_1.$2i('scmViewModelIsAnyRepositoryCollapsible', false),
        SCMProvider: new contextkey_1.$2i('scmProvider', undefined),
        SCMProviderRootUri: new contextkey_1.$2i('scmProviderRootUri', undefined),
        SCMProviderHasRootUri: new contextkey_1.$2i('scmProviderHasRootUri', undefined),
        RepositoryCount: new contextkey_1.$2i('scmRepositoryCount', 0),
        RepositoryVisibilityCount: new contextkey_1.$2i('scmRepositoryVisibleCount', 0),
        RepositoryVisibility(repository) {
            return new contextkey_1.$2i(`scmRepositoryVisible:${repository.provider.id}`, false);
        }
    };
    actions_1.$Tu.appendMenuItem(actions_1.$Ru.SCMTitle, {
        title: (0, nls_1.localize)(2, null),
        submenu: Menus.ViewSort,
        when: contextkey_1.$Ii.and(contextkey_1.$Ii.equals('view', scm_1.$cI), ContextKeys.RepositoryCount.notEqualsTo(0)),
        group: '0_view&sort'
    });
    actions_1.$Tu.appendMenuItem(Menus.ViewSort, {
        title: (0, nls_1.localize)(3, null),
        submenu: Menus.Repositories,
        group: '0_repositories'
    });
    class RepositoryVisibilityAction extends actions_1.$Wu {
        constructor(repository) {
            const title = repository.provider.rootUri ? (0, resources_1.$fg)(repository.provider.rootUri) : repository.provider.label;
            super({
                id: `workbench.scm.action.toggleRepositoryVisibility.${repository.provider.id}`,
                title,
                f1: false,
                precondition: contextkey_1.$Ii.or(ContextKeys.RepositoryVisibilityCount.notEqualsTo(1), ContextKeys.RepositoryVisibility(repository).isEqualTo(false)),
                toggled: ContextKeys.RepositoryVisibility(repository).isEqualTo(true),
                menu: { id: Menus.Repositories, group: '0_repositories' }
            });
            this.a = repository;
        }
        run(accessor) {
            const scmViewService = accessor.get(scm_1.$gI);
            scmViewService.toggleVisibility(this.a);
        }
    }
    let RepositoryVisibilityActionController = class RepositoryVisibilityActionController {
        constructor(f, scmService, g) {
            this.f = f;
            this.g = g;
            this.a = new Map();
            this.d = new lifecycle_1.$jc();
            this.b = ContextKeys.RepositoryCount.bindTo(g);
            this.c = ContextKeys.RepositoryVisibilityCount.bindTo(g);
            f.onDidChangeVisibleRepositories(this.l, this, this.d);
            scmService.onDidAddRepository(this.h, this, this.d);
            scmService.onDidRemoveRepository(this.k, this, this.d);
            for (const repository of scmService.repositories) {
                this.h(repository);
            }
        }
        h(repository) {
            const action = (0, actions_1.$Xu)(class extends RepositoryVisibilityAction {
                constructor() {
                    super(repository);
                }
            });
            const contextKey = ContextKeys.RepositoryVisibility(repository).bindTo(this.g);
            contextKey.set(this.f.isVisible(repository));
            this.a.set(repository, {
                contextKey,
                dispose() {
                    contextKey.reset();
                    action.dispose();
                }
            });
            this.m();
        }
        k(repository) {
            this.a.get(repository)?.dispose();
            this.a.delete(repository);
            this.m();
        }
        l() {
            let count = 0;
            for (const [repository, item] of this.a) {
                const isVisible = this.f.isVisible(repository);
                item.contextKey.set(isVisible);
                if (isVisible) {
                    count++;
                }
            }
            this.b.set(this.a.size);
            this.c.set(count);
        }
        m() {
            this.b.set(this.a.size);
            this.c.set(iterator_1.Iterable.reduce(this.a.keys(), (r, repository) => r + (this.f.isVisible(repository) ? 1 : 0), 0));
        }
        dispose() {
            this.d.dispose();
            (0, lifecycle_1.$fc)(this.a.values());
            this.a.clear();
        }
    };
    RepositoryVisibilityActionController = __decorate([
        __param(0, scm_1.$gI),
        __param(1, scm_1.$fI),
        __param(2, contextkey_1.$3i)
    ], RepositoryVisibilityActionController);
    let ViewModel = class ViewModel {
        get mode() { return this.x; }
        set mode(mode) {
            if (this.x === mode) {
                return;
            }
            this.x = mode;
            for (const [, item] of this.f) {
                for (const groupItem of item.groupItems) {
                    groupItem.tree.clear();
                    if (mode === "tree" /* ViewModelMode.Tree */) {
                        for (const resource of groupItem.resources) {
                            groupItem.tree.add(resource.sourceUri, resource);
                        }
                    }
                }
            }
            // Update sort key based on view mode
            this.sortKey = this.T();
            this.N();
            this.a.fire(mode);
            this.o.set(mode);
            this.G.store(`scm.viewMode`, mode, 1 /* StorageScope.WORKSPACE */, 0 /* StorageTarget.USER */);
        }
        get sortKey() { return this.y; }
        set sortKey(sortKey) {
            if (this.y === sortKey) {
                return;
            }
            this.y = sortKey;
            this.N();
            this.b.fire(sortKey);
            this.p.set(sortKey);
            if (this.x === "list" /* ViewModelMode.List */) {
                this.G.store(`scm.viewSortKey`, sortKey, 1 /* StorageScope.WORKSPACE */, 0 /* StorageTarget.USER */);
            }
        }
        get treeViewState() {
            if (this.c && this.d) {
                this.P();
                this.d = false;
            }
            return this.z;
        }
        constructor(A, B, C, D, E, F, G, H, contextKeyService) {
            this.A = A;
            this.B = B;
            this.C = C;
            this.D = D;
            this.E = E;
            this.F = F;
            this.G = G;
            this.H = H;
            this.a = new event_1.$fd();
            this.onDidChangeMode = this.a.event;
            this.b = new event_1.$fd();
            this.onDidChangeSortKey = this.b.event;
            this.c = false;
            this.d = false;
            this.f = new Map();
            this.g = new lifecycle_1.$jc();
            this.k = false;
            this.l = false;
            this.m = true;
            this.n = new lifecycle_1.$jc();
            // View mode and sort key
            this.x = this.S();
            this.y = this.T();
            // TreeView state
            const storageViewState = this.G.get(`scm.viewState`, 1 /* StorageScope.WORKSPACE */);
            if (storageViewState) {
                try {
                    this.z = JSON.parse(storageViewState);
                }
                catch { /* noop */ }
            }
            this.o = ContextKeys.ViewModelMode.bindTo(contextKeyService);
            this.o.set(this.x);
            this.p = ContextKeys.ViewModelSortKey.bindTo(contextKeyService);
            this.p.set(this.y);
            this.q = ContextKeys.ViewModelAreAllRepositoriesCollapsed.bindTo(contextKeyService);
            this.t = ContextKeys.ViewModelIsAnyRepositoryCollapsible.bindTo(contextKeyService);
            this.u = ContextKeys.SCMProvider.bindTo(contextKeyService);
            this.v = ContextKeys.SCMProviderRootUri.bindTo(contextKeyService);
            this.w = ContextKeys.SCMProviderHasRootUri.bindTo(contextKeyService);
            E.onDidChangeConfiguration(this.I, this, this.n);
            this.I();
            event_1.Event.filter(this.A.onDidChangeCollapseState, e => (0, util_1.$zPb)(e.node.element), this.n)(this.R, this, this.n);
            this.n.add(this.A.onDidChangeCollapseState(() => this.d = true));
            this.n.add(this.G.onWillSaveState(e => {
                if (e.reason === storage_1.WillSaveStateReason.SHUTDOWN) {
                    this.G.store(`scm.viewState`, JSON.stringify(this.treeViewState), 1 /* StorageScope.WORKSPACE */, 1 /* StorageTarget.MACHINE */);
                }
                this.mode = this.S();
                this.sortKey = this.T();
            }));
            this.n.add(this.G.onDidChangeValue(1 /* StorageScope.WORKSPACE */, undefined, this.n)(e => {
                switch (e.key) {
                    case 'scm.viewMode':
                        this.mode = this.S();
                        break;
                    case 'scm.viewSortKey':
                        this.sortKey = this.T();
                        break;
                }
            }));
        }
        I(e) {
            if (!e || e.affectsConfiguration('scm.alwaysShowRepositories') || e.affectsConfiguration('scm.showActionButton')) {
                this.k = this.E.getValue('scm.alwaysShowRepositories');
                this.l = this.E.getValue('scm.showActionButton');
                this.N();
            }
        }
        J({ added, removed }) {
            for (const repository of added) {
                const disposable = (0, lifecycle_1.$hc)(repository.provider.groups.onDidSplice(splice => this.K(item, splice)), repository.input.onDidChangeVisibility(() => this.N(item)), repository.provider.onDidChange(() => {
                    if (this.l) {
                        this.N(item);
                    }
                }));
                const groupItems = repository.provider.groups.elements.map(group => this.L(group));
                const item = {
                    element: repository, groupItems, dispose() {
                        (0, lifecycle_1.$fc)(this.groupItems);
                        disposable.dispose();
                    }
                };
                this.f.set(repository, item);
            }
            for (const repository of removed) {
                const item = this.f.get(repository);
                item.dispose();
                this.f.delete(repository);
            }
            this.N();
        }
        K(item, { start, deleteCount, toInsert }) {
            const itemsToInsert = toInsert.map(group => this.L(group));
            const itemsToDispose = item.groupItems.splice(start, deleteCount, ...itemsToInsert);
            for (const item of itemsToDispose) {
                item.dispose();
            }
            this.N();
        }
        L(group) {
            const tree = new resourceTree_1.$LS(group, group.provider.rootUri || uri_1.URI.file('/'), this.H.extUri);
            const resources = [...group.elements];
            const disposable = (0, lifecycle_1.$hc)(group.onDidChange(() => this.A.refilter()), group.onDidSplice(splice => this.M(item, splice)));
            const item = { element: group, resources, tree, dispose() { disposable.dispose(); } };
            if (this.x === "tree" /* ViewModelMode.Tree */) {
                for (const resource of resources) {
                    item.tree.add(resource.sourceUri, resource);
                }
            }
            return item;
        }
        M(item, { start, deleteCount, toInsert }) {
            const before = item.resources.length;
            const deleted = item.resources.splice(start, deleteCount, ...toInsert);
            const after = item.resources.length;
            if (this.x === "tree" /* ViewModelMode.Tree */) {
                for (const resource of deleted) {
                    item.tree.delete(resource.sourceUri);
                }
                for (const resource of toInsert) {
                    item.tree.add(resource.sourceUri, resource);
                }
            }
            if (before !== after && (before === 0 || after === 0)) {
                this.N();
            }
            else {
                this.N(item);
            }
        }
        setVisible(visible) {
            if (visible) {
                this.F.onDidChangeVisibleRepositories(this.J, this, this.g);
                this.J({ added: this.F.visibleRepositories, removed: iterator_1.Iterable.empty() });
                if (typeof this.h === 'number') {
                    this.A.scrollTop = this.h;
                    this.h = undefined;
                }
                this.D.onDidActiveEditorChange(this.Q, this, this.g);
                this.Q();
            }
            else {
                this.P();
                this.g.clear();
                this.J({ added: iterator_1.Iterable.empty(), removed: [...this.f.keys()] });
                this.h = this.A.scrollTop;
            }
            this.c = visible;
            this.R();
        }
        N(item) {
            if (!this.k && this.f.size === 1) {
                const provider = iterator_1.Iterable.first(this.f.values()).element.provider;
                this.u.set(provider.contextValue);
                this.v.set(provider.rootUri?.toString());
                this.w.set(!!provider.rootUri);
            }
            else {
                this.u.set(undefined);
                this.v.set(undefined);
                this.w.set(false);
            }
            const focusedInput = this.B.getFocusedInput();
            if (!this.k && (this.f.size === 1 && (!item || isRepositoryItem(item)))) {
                const item = iterator_1.Iterable.first(this.f.values());
                this.A.setChildren(null, this.O(item, this.treeViewState).children);
            }
            else if (item) {
                this.A.setChildren(item.element, this.O(item, this.treeViewState).children);
            }
            else {
                const items = (0, arrays_1.$Fb)(this.F.visibleRepositories.map(r => this.f.get(r)));
                this.A.setChildren(null, items.map(item => this.O(item, this.treeViewState)));
            }
            if (focusedInput) {
                this.B.getRenderedInputWidget(focusedInput)?.focus();
            }
            this.R();
        }
        O(item, treeViewState) {
            if (isRepositoryItem(item)) {
                const children = [];
                const hasSomeChanges = item.groupItems.some(item => item.element.elements.length > 0);
                if (item.element.input.visible) {
                    children.push({ element: item.element.input, incompressible: true, collapsible: false });
                }
                if (hasSomeChanges || (this.f.size === 1 && (!this.l || !item.element.provider.actionButton))) {
                    children.push(...item.groupItems.map(i => this.O(i, treeViewState)));
                }
                if (this.l && item.element.provider.actionButton) {
                    const button = {
                        element: {
                            type: 'actionButton',
                            repository: item.element,
                            button: item.element.provider.actionButton,
                        },
                        incompressible: true,
                        collapsible: false
                    };
                    children.push(button);
                }
                const collapsed = treeViewState ? treeViewState.collapsed.indexOf(getSCMResourceId(item.element)) > -1 : false;
                return { element: item.element, children, incompressible: true, collapsed, collapsible: true };
            }
            else {
                const children = this.mode === "list" /* ViewModelMode.List */
                    ? iterator_1.Iterable.map(item.resources, element => ({ element, incompressible: true }))
                    : iterator_1.Iterable.map(item.tree.root.children, node => asTreeElement(node, true, treeViewState));
                const collapsed = treeViewState ? treeViewState.collapsed.indexOf(getSCMResourceId(item.element)) > -1 : false;
                return { element: item.element, children, incompressible: true, collapsed, collapsible: true };
            }
        }
        P() {
            const collapsed = [];
            const visit = (node) => {
                if (node.element && node.collapsible && node.collapsed) {
                    collapsed.push(getSCMResourceId(node.element));
                }
                for (const child of node.children) {
                    visit(child);
                }
            };
            visit(this.A.getNode());
            this.z = { collapsed };
        }
        Q() {
            if (!this.E.getValue('scm.autoReveal')) {
                return;
            }
            if (this.m) {
                this.m = false;
                this.g.add((0, async_1.$Ig)(() => this.Q(), 250));
                return;
            }
            const uri = editor_1.$3E.getOriginalUri(this.D.activeEditor, { supportSideBySide: editor_1.SideBySideEditor.PRIMARY });
            if (!uri) {
                return;
            }
            for (const repository of this.F.visibleRepositories) {
                const item = this.f.get(repository);
                if (!item) {
                    continue;
                }
                // go backwards from last group
                for (let j = item.groupItems.length - 1; j >= 0; j--) {
                    const groupItem = item.groupItems[j];
                    const resource = this.mode === "tree" /* ViewModelMode.Tree */
                        ? groupItem.tree.getNode(uri)?.element
                        : groupItem.resources.find(r => this.H.extUri.isEqual(r.sourceUri, uri));
                    if (resource) {
                        this.A.reveal(resource);
                        this.A.setSelection([resource]);
                        this.A.setFocus([resource]);
                        return;
                    }
                }
            }
        }
        focus() {
            if (this.A.getFocus().length === 0) {
                for (const repository of this.F.visibleRepositories) {
                    const widget = this.B.getRenderedInputWidget(repository.input);
                    if (widget) {
                        widget.focus();
                        return;
                    }
                }
            }
            this.A.domFocus();
        }
        R() {
            if (!this.c || this.F.visibleRepositories.length === 1) {
                this.t.set(false);
                this.q.set(false);
                return;
            }
            this.t.set(this.F.visibleRepositories.some(r => this.A.hasElement(r) && this.A.isCollapsible(r)));
            this.q.set(this.F.visibleRepositories.every(r => this.A.hasElement(r) && (!this.A.isCollapsible(r) || this.A.isCollapsed(r))));
        }
        collapseAllRepositories() {
            for (const repository of this.F.visibleRepositories) {
                if (this.A.isCollapsible(repository)) {
                    this.A.collapse(repository);
                }
            }
        }
        expandAllRepositories() {
            for (const repository of this.F.visibleRepositories) {
                if (this.A.isCollapsible(repository)) {
                    this.A.expand(repository);
                }
            }
        }
        S() {
            let mode = this.E.getValue('scm.defaultViewMode') === 'list' ? "list" /* ViewModelMode.List */ : "tree" /* ViewModelMode.Tree */;
            const storageMode = this.G.get(`scm.viewMode`, 1 /* StorageScope.WORKSPACE */);
            if (typeof storageMode === 'string') {
                mode = storageMode;
            }
            return mode;
        }
        T() {
            // Tree
            if (this.x === "tree" /* ViewModelMode.Tree */) {
                return "path" /* ViewModelSortKey.Path */;
            }
            // List
            let viewSortKey;
            const viewSortKeyString = this.E.getValue('scm.defaultViewSortKey');
            switch (viewSortKeyString) {
                case 'name':
                    viewSortKey = "name" /* ViewModelSortKey.Name */;
                    break;
                case 'status':
                    viewSortKey = "status" /* ViewModelSortKey.Status */;
                    break;
                default:
                    viewSortKey = "path" /* ViewModelSortKey.Path */;
                    break;
            }
            const storageSortKey = this.G.get(`scm.viewSortKey`, 1 /* StorageScope.WORKSPACE */);
            if (typeof storageSortKey === 'string') {
                viewSortKey = storageSortKey;
            }
            return viewSortKey;
        }
        dispose() {
            this.g.dispose();
            this.n.dispose();
            (0, lifecycle_1.$fc)(this.f.values());
            this.f.clear();
        }
    };
    ViewModel = __decorate([
        __param(2, instantiation_1.$Ah),
        __param(3, editorService_1.$9C),
        __param(4, configuration_1.$8h),
        __param(5, scm_1.$gI),
        __param(6, storage_1.$Vo),
        __param(7, uriIdentity_1.$Ck),
        __param(8, contextkey_1.$3i)
    ], ViewModel);
    class SetListViewModeAction extends viewPane_1.$Keb {
        constructor(menu = {}) {
            super({
                id: 'workbench.scm.action.setListViewMode',
                title: (0, nls_1.localize)(4, null),
                viewId: scm_1.$cI,
                f1: false,
                icon: codicons_1.$Pj.listTree,
                toggled: ContextKeys.ViewModelMode.isEqualTo("list" /* ViewModelMode.List */),
                menu: { id: Menus.ViewSort, group: '1_viewmode', ...menu }
            });
        }
        async runInView(_, view) {
            view.viewModel.mode = "list" /* ViewModelMode.List */;
        }
    }
    class SetListViewModeNavigationAction extends SetListViewModeAction {
        constructor() {
            super({
                id: actions_1.$Ru.SCMTitle,
                when: contextkey_1.$Ii.and(contextkey_1.$Ii.equals('view', scm_1.$cI), ContextKeys.RepositoryCount.notEqualsTo(0), ContextKeys.ViewModelMode.isEqualTo("tree" /* ViewModelMode.Tree */)),
                group: 'navigation',
                order: -1000
            });
        }
    }
    class SetTreeViewModeAction extends viewPane_1.$Keb {
        constructor(menu = {}) {
            super({
                id: 'workbench.scm.action.setTreeViewMode',
                title: (0, nls_1.localize)(5, null),
                viewId: scm_1.$cI,
                f1: false,
                icon: codicons_1.$Pj.listFlat,
                toggled: ContextKeys.ViewModelMode.isEqualTo("tree" /* ViewModelMode.Tree */),
                menu: { id: Menus.ViewSort, group: '1_viewmode', ...menu }
            });
        }
        async runInView(_, view) {
            view.viewModel.mode = "tree" /* ViewModelMode.Tree */;
        }
    }
    class SetTreeViewModeNavigationAction extends SetTreeViewModeAction {
        constructor() {
            super({
                id: actions_1.$Ru.SCMTitle,
                when: contextkey_1.$Ii.and(contextkey_1.$Ii.equals('view', scm_1.$cI), ContextKeys.RepositoryCount.notEqualsTo(0), ContextKeys.ViewModelMode.isEqualTo("list" /* ViewModelMode.List */)),
                group: 'navigation',
                order: -1000
            });
        }
    }
    (0, actions_1.$Xu)(SetListViewModeAction);
    (0, actions_1.$Xu)(SetTreeViewModeAction);
    (0, actions_1.$Xu)(SetListViewModeNavigationAction);
    (0, actions_1.$Xu)(SetTreeViewModeNavigationAction);
    class RepositorySortAction extends viewPane_1.$Keb {
        constructor(a, title) {
            super({
                id: `workbench.scm.action.repositories.setSortKey.${a}`,
                title,
                viewId: scm_1.$cI,
                f1: false,
                toggled: scmViewService_1.$NPb.RepositorySortKey.isEqualTo(a),
                menu: [
                    {
                        id: Menus.Repositories,
                        group: '1_sort'
                    },
                    {
                        id: actions_1.$Ru.ViewTitle,
                        when: contextkey_1.$Ii.equals('view', scm_1.$dI),
                        group: '1_sort',
                    },
                ]
            });
            this.a = a;
        }
        runInView(accessor) {
            accessor.get(scm_1.$gI).toggleSortKey(this.a);
        }
    }
    class RepositorySortByDiscoveryTimeAction extends RepositorySortAction {
        constructor() {
            super("discoveryTime" /* ISCMRepositorySortKey.DiscoveryTime */, (0, nls_1.localize)(6, null));
        }
    }
    class RepositorySortByNameAction extends RepositorySortAction {
        constructor() {
            super("name" /* ISCMRepositorySortKey.Name */, (0, nls_1.localize)(7, null));
        }
    }
    class RepositorySortByPathAction extends RepositorySortAction {
        constructor() {
            super("path" /* ISCMRepositorySortKey.Path */, (0, nls_1.localize)(8, null));
        }
    }
    (0, actions_1.$Xu)(RepositorySortByDiscoveryTimeAction);
    (0, actions_1.$Xu)(RepositorySortByNameAction);
    (0, actions_1.$Xu)(RepositorySortByPathAction);
    class SetSortKeyAction extends viewPane_1.$Keb {
        constructor(a, title) {
            super({
                id: `workbench.scm.action.setSortKey.${a}`,
                title,
                viewId: scm_1.$cI,
                f1: false,
                toggled: ContextKeys.ViewModelSortKey.isEqualTo(a),
                precondition: ContextKeys.ViewModelMode.isEqualTo("list" /* ViewModelMode.List */),
                menu: { id: Menus.ViewSort, group: '2_sort' }
            });
            this.a = a;
        }
        async runInView(_, view) {
            view.viewModel.sortKey = this.a;
        }
    }
    class SetSortByNameAction extends SetSortKeyAction {
        constructor() {
            super("name" /* ViewModelSortKey.Name */, (0, nls_1.localize)(9, null));
        }
    }
    class SetSortByPathAction extends SetSortKeyAction {
        constructor() {
            super("path" /* ViewModelSortKey.Path */, (0, nls_1.localize)(10, null));
        }
    }
    class SetSortByStatusAction extends SetSortKeyAction {
        constructor() {
            super("status" /* ViewModelSortKey.Status */, (0, nls_1.localize)(11, null));
        }
    }
    (0, actions_1.$Xu)(SetSortByNameAction);
    (0, actions_1.$Xu)(SetSortByPathAction);
    (0, actions_1.$Xu)(SetSortByStatusAction);
    class CollapseAllRepositoriesAction extends viewPane_1.$Keb {
        constructor() {
            super({
                id: `workbench.scm.action.collapseAllRepositories`,
                title: (0, nls_1.localize)(12, null),
                viewId: scm_1.$cI,
                f1: false,
                icon: codicons_1.$Pj.collapseAll,
                menu: {
                    id: actions_1.$Ru.SCMTitle,
                    group: 'navigation',
                    when: contextkey_1.$Ii.and(contextkey_1.$Ii.equals('view', scm_1.$cI), ContextKeys.ViewModelIsAnyRepositoryCollapsible.isEqualTo(true), ContextKeys.ViewModelAreAllRepositoriesCollapsed.isEqualTo(false))
                }
            });
        }
        async runInView(_, view) {
            view.viewModel.collapseAllRepositories();
        }
    }
    class ExpandAllRepositoriesAction extends viewPane_1.$Keb {
        constructor() {
            super({
                id: `workbench.scm.action.expandAllRepositories`,
                title: (0, nls_1.localize)(13, null),
                viewId: scm_1.$cI,
                f1: false,
                icon: codicons_1.$Pj.expandAll,
                menu: {
                    id: actions_1.$Ru.SCMTitle,
                    group: 'navigation',
                    when: contextkey_1.$Ii.and(contextkey_1.$Ii.equals('view', scm_1.$cI), ContextKeys.ViewModelIsAnyRepositoryCollapsible.isEqualTo(true), ContextKeys.ViewModelAreAllRepositoriesCollapsed.isEqualTo(true))
                }
            });
        }
        async runInView(_, view) {
            view.viewModel.expandAllRepositories();
        }
    }
    (0, actions_1.$Xu)(CollapseAllRepositoriesAction);
    (0, actions_1.$Xu)(ExpandAllRepositoriesAction);
    let SCMInputWidget = class SCMInputWidget {
        static { SCMInputWidget_1 = this; }
        static { this.a = {
            [2 /* InputValidationType.Information */]: 5000,
            [1 /* InputValidationType.Warning */]: 8000,
            [0 /* InputValidationType.Error */]: 10000
        }; }
        get v() {
            return this.k?.input;
        }
        async setInput(input) {
            if (input === this.v) {
                return;
            }
            this.clearValidation();
            this.d.classList.remove('synthetic-focus');
            this.m.clear();
            this.l.set(input?.repository.id);
            if (!input) {
                this.k?.textModelRef?.dispose();
                this.g.setModel(undefined);
                this.k = undefined;
                return;
            }
            const uri = input.repository.provider.inputBoxDocumentUri;
            if (this.A.getValue('editor.wordBasedSuggestions', { resource: uri }) !== false) {
                this.A.updateValue('editor.wordBasedSuggestions', false, { resource: uri }, 8 /* ConfigurationTarget.MEMORY */);
            }
            const modelValue = { input, textModelRef: undefined };
            // Save model
            this.k = modelValue;
            const modelRef = await this.y.createModelReference(uri);
            // Model has been changed in the meantime
            if (this.k !== modelValue) {
                modelRef.dispose();
                return;
            }
            modelValue.textModelRef = modelRef;
            const textModel = modelRef.object.textEditorModel;
            this.g.setModel(textModel);
            // Validation
            const validationDelayer = new async_1.$Eg(200);
            const validate = async () => {
                const position = this.g.getSelection()?.getStartPosition();
                const offset = position && textModel.getOffsetAt(position);
                const value = textModel.getValue();
                this.w(await input.validateInput(value, offset || 0));
            };
            const triggerValidation = () => validationDelayer.trigger(validate);
            this.m.add(validationDelayer);
            this.m.add(this.g.onDidChangeCursorPosition(triggerValidation));
            // Adaptive indentation rules
            const opts = this.x.getCreationOptions(textModel.getLanguageId(), textModel.uri, textModel.isForSimpleWidget);
            const onEnter = event_1.Event.filter(this.g.onKeyDown, e => e.keyCode === 3 /* KeyCode.Enter */, this.m);
            this.m.add(onEnter(() => textModel.detectIndentation(opts.insertSpaces, opts.tabSize)));
            // Keep model in sync with API
            textModel.setValue(input.value);
            this.m.add(input.onDidChange(({ value, reason }) => {
                if (value === textModel.getValue()) { // circuit breaker
                    return;
                }
                textModel.setValue(value);
                const position = reason === scm_1.SCMInputChangeReason.HistoryPrevious
                    ? textModel.getFullModelRange().getStartPosition()
                    : textModel.getFullModelRange().getEndPosition();
                this.g.setPosition(position);
                this.g.revealPositionInCenterIfOutsideViewport(position);
            }));
            this.m.add(input.onDidChangeFocus(() => this.focus()));
            this.m.add(input.onDidChangeValidationMessage((e) => this.w(e, { focus: true, timeout: true })));
            this.m.add(input.onDidChangeValidateInput((e) => triggerValidation()));
            // Keep API in sync with model, update placeholder visibility and validate
            const updatePlaceholderVisibility = () => this.f.classList.toggle('hidden', textModel.getValueLength() > 0);
            this.m.add(textModel.onDidChangeContent(() => {
                input.setValue(textModel.getValue(), true);
                updatePlaceholderVisibility();
                triggerValidation();
            }));
            updatePlaceholderVisibility();
            // Update placeholder text
            const updatePlaceholderText = () => {
                const binding = this.z.lookupKeybinding('scm.acceptInput');
                const label = binding ? binding.getLabel() : (platform.$j ? 'Cmd+Enter' : 'Ctrl+Enter');
                const placeholderText = (0, strings_1.$ne)(input.placeholder, label);
                this.g.updateOptions({ ariaLabel: placeholderText });
                this.f.textContent = placeholderText;
            };
            this.m.add(input.onDidChangePlaceholder(updatePlaceholderText));
            this.m.add(this.z.onDidUpdateKeybindings(updatePlaceholderText));
            updatePlaceholderText();
            // Update input template
            let commitTemplate = '';
            const updateTemplate = () => {
                if (typeof input.repository.provider.commitTemplate === 'undefined' || !input.visible) {
                    return;
                }
                const oldCommitTemplate = commitTemplate;
                commitTemplate = input.repository.provider.commitTemplate;
                const value = textModel.getValue();
                if (value && value !== oldCommitTemplate) {
                    return;
                }
                textModel.setValue(commitTemplate);
            };
            this.m.add(input.repository.provider.onDidChangeCommitTemplate(updateTemplate, this));
            updateTemplate();
            // Update input enablement
            const updateEnablement = (enabled) => {
                this.g.updateOptions({ readOnly: !enabled });
            };
            this.m.add(input.onDidChangeEnablement(enabled => updateEnablement(enabled)));
            updateEnablement(input.enabled);
        }
        get selections() {
            return this.g.getSelections();
        }
        set selections(selections) {
            if (selections) {
                this.g.setSelections(selections);
            }
        }
        w(validation, options) {
            if (this.q) {
                clearTimeout(this.q);
                this.q = 0;
            }
            this.n = validation;
            this.F();
            if (options?.focus && !this.hasFocus()) {
                this.focus();
            }
            if (validation && options?.timeout) {
                this.q = setTimeout(() => this.w(undefined), SCMInputWidget_1.a[validation.type]);
            }
        }
        constructor(container, overflowWidgetsDomNode, contextKeyService, x, y, z, A, B, C, D, E) {
            this.x = x;
            this.y = y;
            this.z = z;
            this.A = A;
            this.B = B;
            this.C = C;
            this.D = D;
            this.E = E;
            this.b = style_1.$hqb;
            this.h = new lifecycle_1.$jc();
            this.m = new lifecycle_1.$jc();
            this.o = lifecycle_1.$kc.None;
            this.p = false;
            // This is due to "Setup height change listener on next tick" above
            // https://github.com/microsoft/vscode/issues/108067
            this.t = false;
            this.u = false;
            this.c = (0, dom_1.$0O)(container, (0, dom_1.$)('.scm-editor'));
            this.d = (0, dom_1.$0O)(this.c, (0, dom_1.$)('.scm-editor-container'));
            this.f = (0, dom_1.$0O)(this.d, (0, dom_1.$)('.scm-editor-placeholder'));
            const fontFamily = this.G();
            const fontSize = this.H();
            const lineHeight = this.I(fontSize);
            this.J(fontFamily, fontSize, lineHeight);
            const contextKeyService2 = contextKeyService.createScoped(this.c);
            this.l = contextKeyService2.createKey('scmRepository', undefined);
            const editorOptions = {
                ...(0, simpleEditorOptions_1.$uqb)(A),
                lineDecorationsWidth: 6,
                dragAndDrop: true,
                cursorWidth: 1,
                fontSize: fontSize,
                lineHeight: lineHeight,
                fontFamily: fontFamily,
                wrappingStrategy: 'advanced',
                wrappingIndent: 'none',
                padding: { top: 2, bottom: 2 },
                quickSuggestions: false,
                scrollbar: { alwaysConsumeMouseWheel: false },
                overflowWidgetsDomNode,
                formatOnType: true,
                renderWhitespace: 'none',
                dropIntoEditor: { enabled: true }
            };
            const codeEditorWidgetOptions = {
                isSimpleWidget: true,
                contributions: editorExtensions_1.EditorExtensionsRegistry.getSomeEditorContributions([
                    colorDetector_1.$e3.ID,
                    contextmenu_1.$X6.ID,
                    dnd_1.$36.ID,
                    dropIntoEditorController_1.$r7.ID,
                    links_1.$49.ID,
                    menuPreventer_1.$0lb.ID,
                    messageController_1.$M2.ID,
                    hover_1.$Q6.ID,
                    selectionClipboard_1.$tqb,
                    snippetController2_1.$05.ID,
                    suggestController_1.$G6.ID,
                    inlineCompletionsController_1.$V8.ID,
                    codeActionController_1.$Q2.ID,
                    formatActions_1.$M8.ID
                ])
            };
            const services = new serviceCollection_1.$zh([contextkey_1.$3i, contextKeyService2]);
            const instantiationService2 = B.createChild(services);
            this.g = instantiationService2.createInstance(codeEditorWidget_1.$uY, this.d, editorOptions, codeEditorWidgetOptions);
            this.h.add(this.g);
            this.h.add(this.g.onDidFocusEditorText(() => {
                if (this.v?.repository) {
                    this.C.focus(this.v.repository);
                }
                this.d.classList.add('synthetic-focus');
                this.F();
            }));
            this.h.add(this.g.onDidBlurEditorText(() => {
                this.d.classList.remove('synthetic-focus');
                setTimeout(() => {
                    if (!this.n || !this.p) {
                        this.clearValidation();
                    }
                }, 0);
            }));
            const firstLineKey = contextKeyService2.createKey('scmInputIsInFirstPosition', false);
            const lastLineKey = contextKeyService2.createKey('scmInputIsInLastPosition', false);
            this.h.add(this.g.onDidChangeCursorPosition(({ position }) => {
                const viewModel = this.g._getViewModel();
                const lastLineNumber = viewModel.getLineCount();
                const lastLineCol = viewModel.getLineContent(lastLineNumber).length + 1;
                const viewPosition = viewModel.coordinatesConverter.convertModelPositionToViewPosition(position);
                firstLineKey.set(viewPosition.lineNumber === 1 && viewPosition.column === 1);
                lastLineKey.set(viewPosition.lineNumber === lastLineNumber && viewPosition.column === lastLineCol);
            }));
            const relevantSettings = [
                'scm.inputFontFamily',
                'editor.fontFamily',
                'scm.inputFontSize',
                'editor.accessibilitySupport',
                'editor.cursorBlinking'
            ];
            const onRelevantSettingChanged = event_1.Event.filter(this.A.onDidChangeConfiguration, (e) => {
                for (const setting of relevantSettings) {
                    if (e.affectsConfiguration(setting)) {
                        return true;
                    }
                }
                return false;
            }, this.h);
            this.h.add(onRelevantSettingChanged(() => {
                const fontFamily = this.G();
                const fontSize = this.H();
                const lineHeight = this.I(fontSize);
                const accessibilitySupport = this.A.getValue('editor.accessibilitySupport');
                const cursorBlinking = this.A.getValue('editor.cursorBlinking');
                this.g.updateOptions({
                    fontFamily: fontFamily,
                    fontSize: fontSize,
                    lineHeight: lineHeight,
                    accessibilitySupport,
                    cursorBlinking
                });
                this.J(fontFamily, fontSize, lineHeight);
            }));
            this.onDidChangeContentHeight = event_1.Event.signal(event_1.Event.filter(this.g.onDidContentSizeChange, e => e.contentHeightChanged, this.h));
        }
        getContentHeight() {
            const editorContentHeight = this.g.getContentHeight();
            return Math.min(editorContentHeight, 134);
        }
        layout() {
            const editorHeight = this.getContentHeight();
            const dimension = new dom_1.$BO(this.c.clientWidth - 2, editorHeight);
            if (dimension.width < 0) {
                this.t = true;
                return;
            }
            this.t = false;
            this.g.layout(dimension);
            this.F();
            if (this.u) {
                this.u = false;
                this.focus();
            }
        }
        focus() {
            if (this.t) {
                this.t = false;
                this.u = true;
                return;
            }
            this.g.focus();
            this.d.classList.add('synthetic-focus');
        }
        hasFocus() {
            return this.g.hasTextFocus();
        }
        F() {
            this.clearValidation();
            this.d.classList.toggle('validation-info', this.n?.type === 2 /* InputValidationType.Information */);
            this.d.classList.toggle('validation-warning', this.n?.type === 1 /* InputValidationType.Warning */);
            this.d.classList.toggle('validation-error', this.n?.type === 0 /* InputValidationType.Error */);
            if (!this.n || !this.g.hasTextFocus()) {
                return;
            }
            const disposables = new lifecycle_1.$jc();
            this.o = this.D.showContextView({
                getAnchor: () => this.d,
                render: container => {
                    this.d.style.borderBottomLeftRadius = '0';
                    this.d.style.borderBottomRightRadius = '0';
                    const validationContainer = (0, dom_1.$0O)(container, (0, dom_1.$)('.scm-editor-validation-container'));
                    validationContainer.classList.toggle('validation-info', this.n.type === 2 /* InputValidationType.Information */);
                    validationContainer.classList.toggle('validation-warning', this.n.type === 1 /* InputValidationType.Warning */);
                    validationContainer.classList.toggle('validation-error', this.n.type === 0 /* InputValidationType.Error */);
                    validationContainer.style.width = `${this.d.clientWidth + 2}px`;
                    const element = (0, dom_1.$0O)(validationContainer, (0, dom_1.$)('.scm-editor-validation'));
                    const message = this.n.message;
                    if (typeof message === 'string') {
                        element.textContent = message;
                    }
                    else {
                        const tracker = (0, dom_1.$8O)(element);
                        disposables.add(tracker);
                        disposables.add(tracker.onDidFocus(() => (this.p = true)));
                        disposables.add(tracker.onDidBlur(() => {
                            this.p = false;
                            this.d.style.borderBottomLeftRadius = '2px';
                            this.d.style.borderBottomRightRadius = '2px';
                            this.D.hideContextView();
                        }));
                        const renderer = disposables.add(this.B.createInstance(markdownRenderer_1.$K2, {}));
                        const renderedMarkdown = renderer.render(message, {
                            actionHandler: {
                                callback: (link) => {
                                    (0, markdownRenderer_1.$L2)(this.E, link, message.isTrusted);
                                    this.d.style.borderBottomLeftRadius = '2px';
                                    this.d.style.borderBottomRightRadius = '2px';
                                    this.D.hideContextView();
                                },
                                disposables: disposables
                            },
                        });
                        disposables.add(renderedMarkdown);
                        element.appendChild(renderedMarkdown.element);
                    }
                    const actionsContainer = (0, dom_1.$0O)(validationContainer, (0, dom_1.$)('.scm-editor-validation-actions'));
                    const actionbar = new actionbar_1.$1P(actionsContainer);
                    const action = new actions_2.$gi('scmInputWidget.validationMessage.close', (0, nls_1.localize)(14, null), themables_1.ThemeIcon.asClassName(codicons_1.$Pj.close), true, () => {
                        this.D.hideContextView();
                        this.d.style.borderBottomLeftRadius = '2px';
                        this.d.style.borderBottomRightRadius = '2px';
                    });
                    disposables.add(actionbar);
                    actionbar.push(action, { icon: true, label: false });
                    return lifecycle_1.$kc.None;
                },
                onHide: () => {
                    this.p = false;
                    this.d.style.borderBottomLeftRadius = '2px';
                    this.d.style.borderBottomRightRadius = '2px';
                    disposables.dispose();
                },
                anchorAlignment: 0 /* AnchorAlignment.LEFT */
            });
        }
        G() {
            const inputFontFamily = this.A.getValue('scm.inputFontFamily').trim();
            if (inputFontFamily.toLowerCase() === 'editor') {
                return this.A.getValue('editor.fontFamily').trim();
            }
            if (inputFontFamily.length !== 0 && inputFontFamily.toLowerCase() !== 'default') {
                return inputFontFamily;
            }
            return this.b;
        }
        H() {
            return this.A.getValue('scm.inputFontSize');
        }
        I(fontSize) {
            return Math.round(fontSize * 1.5);
        }
        J(fontFamily, fontSize, lineHeight) {
            this.f.style.fontFamily = fontFamily;
            this.f.style.fontSize = `${fontSize}px`;
            this.f.style.lineHeight = `${lineHeight}px`;
        }
        clearValidation() {
            this.o.dispose();
            this.p = false;
        }
        dispose() {
            this.setInput(undefined);
            this.m.dispose();
            this.clearValidation();
            this.h.dispose();
        }
    };
    SCMInputWidget = SCMInputWidget_1 = __decorate([
        __param(2, contextkey_1.$3i),
        __param(3, model_1.$yA),
        __param(4, resolverService_1.$uA),
        __param(5, keybinding_1.$2D),
        __param(6, configuration_1.$8h),
        __param(7, instantiation_1.$Ah),
        __param(8, scm_1.$gI),
        __param(9, contextView_1.$VZ),
        __param(10, opener_1.$NT)
    ], SCMInputWidget);
    let $TPb = class $TPb extends viewPane_1.$Ieb {
        get viewModel() { return this.g; }
        constructor(options, L, ab, keybindingService, themeService, contextMenuService, sb, Wb, instantiationService, viewDescriptorService, configurationService, contextKeyService, Xb, openerService, telemetryService) {
            super({ ...options, titleMenuId: actions_1.$Ru.SCMTitle }, keybindingService, contextMenuService, configurationService, contextKeyService, viewDescriptorService, instantiationService, openerService, themeService, telemetryService);
            this.L = L;
            this.ab = ab;
            this.sb = sb;
            this.Wb = Wb;
            this.Xb = Xb;
            this.t = new lifecycle_1.$jc();
            this.a = new event_1.$fd();
            this.b = {
                height: undefined,
                width: undefined,
                onDidChange: this.a.event
            };
            this.B(this.Bb.createInstance(ScmInputContentProvider));
            this.B(event_1.Event.any(this.L.onDidAddRepository, this.L.onDidRemoveRepository)(() => this.db.fire()));
        }
        U(container) {
            super.U(container);
            // List
            this.c = (0, dom_1.$0O)(container, (0, dom_1.$)('.scm-view.show-file-icons'));
            const overflowWidgetsDomNode = (0, dom_1.$)('.scm-overflow-widgets-container.monaco-editor');
            const updateActionsVisibility = () => this.c.classList.toggle('show-actions', this.yb.getValue('scm.alwaysShowActions'));
            this.B(event_1.Event.filter(this.yb.onDidChangeConfiguration, e => e.affectsConfiguration('scm.alwaysShowActions'), this.t)(updateActionsVisibility));
            updateActionsVisibility();
            const updateProviderCountVisibility = () => {
                const value = this.yb.getValue('scm.providerCountBadge');
                this.c.classList.toggle('hide-provider-counts', value === 'hidden');
                this.c.classList.toggle('auto-provider-counts', value === 'auto');
            };
            this.B(event_1.Event.filter(this.yb.onDidChangeConfiguration, e => e.affectsConfiguration('scm.providerCountBadge'), this.t)(updateProviderCountVisibility));
            updateProviderCountVisibility();
            this.m = this.Bb.createInstance(InputRenderer, this.b, overflowWidgetsDomNode, (input, height) => this.f.updateElementHeight(input, height));
            const delegate = new ListDelegate(this.m);
            this.n = this.Bb.createInstance($PPb);
            this.h = this.Bb.createInstance(labels_1.$Llb, { onDidChangeVisibility: this.onDidChangeBodyVisibility });
            this.B(this.h);
            const actionRunner = new RepositoryPaneActionRunner(() => this.dc());
            this.B(actionRunner);
            this.B(actionRunner.onWillRun(() => this.f.domFocus()));
            const renderers = [
                this.Bb.createInstance(scmRepositoryRenderer_1.$JPb, (0, util_1.$IPb)(this.Bb)),
                this.m,
                this.n,
                this.Bb.createInstance(ResourceGroupRenderer, (0, util_1.$IPb)(this.Bb)),
                this.B(this.Bb.createInstance(ResourceRenderer, () => this.g, this.h, (0, util_1.$IPb)(this.Bb), actionRunner))
            ];
            const filter = new SCMTreeFilter();
            const sorter = new $QPb(() => this.g);
            const keyboardNavigationLabelProvider = this.Bb.createInstance($RPb, () => this.g);
            const identityProvider = new SCMResourceIdentityProvider();
            const dnd = new SCMTreeDragAndDrop(this.Bb);
            this.f = this.Bb.createInstance(listService_1.$u4, 'SCM Tree Repo', this.c, delegate, renderers, {
                transformOptimization: false,
                identityProvider,
                dnd,
                horizontalScrolling: false,
                setRowLineHeight: false,
                filter,
                sorter,
                keyboardNavigationLabelProvider,
                overrideStyles: {
                    listBackground: this.Ab.getViewLocationById(this.id) === 1 /* ViewContainerLocation.Panel */ ? theme_1.$L_ : theme_1.$Iab
                },
                accessibilityProvider: this.Bb.createInstance($SPb)
            });
            this.B(this.f.onDidOpen(this.bc, this));
            this.B(this.f.onContextMenu(this.cc, this));
            this.B(this.f.onDidScroll(this.m.clearValidation, this.m));
            this.B(this.f);
            (0, dom_1.$0O)(this.c, overflowWidgetsDomNode);
            this.B(this.Bb.createInstance(RepositoryVisibilityActionController));
            this.g = this.Bb.createInstance(ViewModel, this.f, this.m);
            this.B(this.g);
            this.c.classList.add('file-icon-themable-tree');
            this.c.classList.add('show-file-icons');
            this.Zb(this.Db.getFileIconTheme());
            this.B(this.Db.onDidFileIconThemeChange(this.Zb, this));
            this.B(this.g.onDidChangeMode(this.$b, this));
            this.B(this.onDidChangeBodyVisibility(this.g.setVisible, this.g));
            this.B(event_1.Event.filter(this.yb.onDidChangeConfiguration, e => e.affectsConfiguration('scm.alwaysShowRepositories'), this.t)(this.Ub, this));
            this.Ub();
        }
        Zb(theme) {
            this.c.classList.toggle('list-view-mode', this.g.mode === "list" /* ViewModelMode.List */);
            this.c.classList.toggle('tree-view-mode', this.g.mode === "tree" /* ViewModelMode.Tree */);
            this.c.classList.toggle('align-icons-and-twisties', (this.g.mode === "list" /* ViewModelMode.List */ && theme.hasFileIcons) || (theme.hasFileIcons && !theme.hasFolderIcons));
            this.c.classList.toggle('hide-arrows', this.g.mode === "tree" /* ViewModelMode.Tree */ && theme.hidesExplorerArrows === true);
        }
        $b() {
            this.Zb(this.Db.getFileIconTheme());
        }
        W(height = this.b.height, width = this.b.width) {
            if (height === undefined) {
                return;
            }
            if (width !== undefined) {
                super.W(height, width);
            }
            this.b.height = height;
            this.b.width = width;
            this.a.fire();
            this.c.style.height = `${height}px`;
            this.f.layout(height, width);
        }
        focus() {
            super.focus();
            if (this.isExpanded()) {
                this.g.focus();
            }
        }
        async bc(e) {
            if (!e.element) {
                return;
            }
            else if ((0, util_1.$zPb)(e.element)) {
                this.ab.focus(e.element);
                return;
            }
            else if ((0, util_1.$CPb)(e.element)) {
                const provider = e.element.provider;
                const repository = iterator_1.Iterable.find(this.L.repositories, r => r.provider === provider);
                if (repository) {
                    this.ab.focus(repository);
                }
                return;
            }
            else if (resourceTree_1.$LS.isResourceNode(e.element)) {
                const provider = e.element.context.provider;
                const repository = iterator_1.Iterable.find(this.L.repositories, r => r.provider === provider);
                if (repository) {
                    this.ab.focus(repository);
                }
                return;
            }
            else if ((0, util_1.$APb)(e.element)) {
                this.ab.focus(e.element.repository);
                const widget = this.m.getRenderedInputWidget(e.element);
                if (widget) {
                    widget.focus();
                    this.f.setFocus([], e.browserEvent);
                    const selection = this.f.getSelection();
                    if (selection.length === 1 && selection[0] === e.element) {
                        setTimeout(() => this.f.setSelection([]));
                    }
                }
                return;
            }
            else if ((0, util_1.$BPb)(e.element)) {
                this.ab.focus(e.element.repository);
                // Focus the action button
                this.n.focusActionButton(e.element);
                this.f.setFocus([], e.browserEvent);
                return;
            }
            // ISCMResource
            if (e.element.command?.id === editorCommands_1.$Wub || e.element.command?.id === editorCommands_1.$Xub) {
                await this.sb.executeCommand(e.element.command.id, ...(e.element.command.arguments || []), e);
            }
            else {
                await e.element.open(!!e.editorOptions.preserveFocus);
                if (e.editorOptions.pinned) {
                    const activeEditorPane = this.Wb.activeEditorPane;
                    activeEditorPane?.group.pinEditor(activeEditorPane.input);
                }
            }
            const provider = e.element.resourceGroup.provider;
            const repository = iterator_1.Iterable.find(this.L.repositories, r => r.provider === provider);
            if (repository) {
                this.ab.focus(repository);
            }
        }
        cc(e) {
            if (!e.element) {
                const menu = this.Xb.createMenu(Menus.ViewSort, this.zb);
                const actions = [];
                (0, menuEntryActionViewItem_1.$A3)(menu, undefined, actions);
                return this.xb.showContextMenu({
                    getAnchor: () => e.anchor,
                    getActions: () => actions,
                    onHide: () => {
                        menu.dispose();
                    }
                });
            }
            const element = e.element;
            let context = element;
            let actions = [];
            if ((0, util_1.$zPb)(element)) {
                const menus = this.ab.menus.getRepositoryMenus(element.provider);
                const menu = menus.repositoryMenu;
                context = element.provider;
                actions = (0, util_1.$GPb)(menu);
            }
            else if ((0, util_1.$APb)(element) || (0, util_1.$BPb)(element)) {
                // noop
            }
            else if ((0, util_1.$CPb)(element)) {
                const menus = this.ab.menus.getRepositoryMenus(element.provider);
                const menu = menus.getResourceGroupMenu(element);
                actions = (0, util_1.$GPb)(menu);
            }
            else if (resourceTree_1.$LS.isResourceNode(element)) {
                if (element.element) {
                    const menus = this.ab.menus.getRepositoryMenus(element.element.resourceGroup.provider);
                    const menu = menus.getResourceMenu(element.element);
                    actions = (0, util_1.$GPb)(menu);
                }
                else {
                    const menus = this.ab.menus.getRepositoryMenus(element.context.provider);
                    const menu = menus.getResourceFolderMenu(element.context);
                    actions = (0, util_1.$GPb)(menu);
                }
            }
            else {
                const menus = this.ab.menus.getRepositoryMenus(element.resourceGroup.provider);
                const menu = menus.getResourceMenu(element);
                actions = (0, util_1.$GPb)(menu);
            }
            const actionRunner = new RepositoryPaneActionRunner(() => this.dc());
            actionRunner.onWillRun(() => this.f.domFocus());
            this.xb.showContextMenu({
                getAnchor: () => e.anchor,
                getActions: () => actions,
                getActionsContext: () => context,
                actionRunner
            });
        }
        dc() {
            return this.f.getSelection()
                .filter(r => !!r && !(0, util_1.$CPb)(r));
        }
        shouldShowWelcome() {
            return this.L.repositoryCount === 0;
        }
        getActionsContext() {
            return this.ab.visibleRepositories.length === 1 ? this.ab.visibleRepositories[0].provider : undefined;
        }
        dispose() {
            this.t.dispose();
            super.dispose();
        }
    };
    exports.$TPb = $TPb;
    exports.$TPb = $TPb = __decorate([
        __param(1, scm_1.$fI),
        __param(2, scm_1.$gI),
        __param(3, keybinding_1.$2D),
        __param(4, themeService_1.$gv),
        __param(5, contextView_1.$WZ),
        __param(6, commands_1.$Fr),
        __param(7, editorService_1.$9C),
        __param(8, instantiation_1.$Ah),
        __param(9, views_1.$_E),
        __param(10, configuration_1.$8h),
        __param(11, contextkey_1.$3i),
        __param(12, actions_1.$Su),
        __param(13, opener_1.$NT),
        __param(14, telemetry_1.$9k)
    ], $TPb);
    exports.$UPb = (0, colorRegistry_1.$sv)('scm.providerBorder', { dark: '#454545', light: '#C8C8C8', hcDark: colorRegistry_1.$Av, hcLight: colorRegistry_1.$Av }, (0, nls_1.localize)(15, null));
    class $VPb {
        constructor(c, d, f, g) {
            this.c = c;
            this.d = d;
            this.f = f;
            this.g = g;
            this.b = new lifecycle_1.$lc();
        }
        dispose() {
            this.b?.dispose();
        }
        setButton(button) {
            // Clear old button
            this.h();
            if (!button) {
                return;
            }
            if (button.secondaryCommands?.length) {
                const actions = [];
                for (let index = 0; index < button.secondaryCommands.length; index++) {
                    const commands = button.secondaryCommands[index];
                    for (const command of commands) {
                        actions.push(new actions_2.$gi(command.id, command.title, undefined, true, async () => await this.k(command.id, ...(command.arguments || []))));
                    }
                    if (commands.length) {
                        actions.push(new actions_2.$ii());
                    }
                }
                // Remove last separator
                actions.pop();
                // ButtonWithDropdown
                this.a = new button_1.$8Q(this.c, {
                    actions: actions,
                    addPrimaryActionToDropdown: false,
                    contextMenuProvider: this.d,
                    title: button.command.tooltip,
                    supportIcons: true,
                    ...defaultStyles_1.$i2
                });
            }
            else {
                // Button
                this.a = new button_1.$7Q(this.c, { supportIcons: true, supportShortLabel: !!button.description, title: button.command.tooltip, ...defaultStyles_1.$i2 });
            }
            this.a.enabled = button.enabled;
            this.a.label = button.command.title;
            if (this.a instanceof button_1.$7Q && button.description) {
                this.a.labelShort = button.description;
            }
            this.a.onDidClick(async () => await this.k(button.command.id, ...(button.command.arguments || [])), null, this.b.value);
            this.b.value.add(this.a);
        }
        focus() {
            this.a?.focus();
        }
        h() {
            this.b.value = new lifecycle_1.$jc();
            this.a = undefined;
            (0, dom_1.$lO)(this.c);
        }
        async k(commandId, ...args) {
            try {
                await this.f.executeCommand(commandId, ...args);
            }
            catch (ex) {
                this.g.error(ex);
            }
        }
    }
    exports.$VPb = $VPb;
    let ScmInputContentProvider = class ScmInputContentProvider extends lifecycle_1.$kc {
        constructor(textModelService, a, b) {
            super();
            this.a = a;
            this.b = b;
            this.B(textModelService.registerTextModelContentProvider(network_1.Schemas.vscodeSourceControl, this));
        }
        async provideTextContent(resource) {
            const existing = this.a.getModel(resource);
            if (existing) {
                return existing;
            }
            return this.a.createModel('', this.b.createById('scminput'), resource);
        }
    };
    ScmInputContentProvider = __decorate([
        __param(0, resolverService_1.$uA),
        __param(1, model_1.$yA),
        __param(2, language_1.$ct)
    ], ScmInputContentProvider);
});
//# sourceMappingURL=scmViewPane.js.map