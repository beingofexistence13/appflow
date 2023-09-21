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
define(["require", "exports", "vs/base/common/event", "vs/base/common/resources", "vs/base/common/lifecycle", "vs/workbench/browser/parts/views/viewPane", "vs/base/browser/dom", "vs/workbench/contrib/scm/common/scm", "vs/workbench/browser/labels", "vs/base/browser/ui/countBadge/countBadge", "vs/workbench/services/editor/common/editorService", "vs/platform/instantiation/common/instantiation", "vs/platform/contextview/browser/contextView", "vs/platform/contextkey/common/contextkey", "vs/platform/commands/common/commands", "vs/platform/keybinding/common/keybinding", "vs/platform/actions/common/actions", "vs/base/common/actions", "vs/base/browser/ui/actionbar/actionbar", "vs/platform/theme/common/themeService", "./util", "vs/platform/list/browser/listService", "vs/platform/configuration/common/configuration", "vs/base/common/async", "vs/base/common/resourceTree", "vs/base/common/iterator", "vs/base/common/uri", "vs/platform/files/common/files", "vs/base/common/comparers", "vs/base/common/filters", "vs/workbench/common/views", "vs/nls", "vs/base/common/arrays", "vs/base/common/decorators", "vs/platform/storage/common/storage", "vs/workbench/common/editor", "vs/workbench/common/theme", "vs/editor/browser/widget/codeEditorWidget", "vs/workbench/contrib/codeEditor/browser/simpleEditorOptions", "vs/editor/common/services/model", "vs/editor/browser/editorExtensions", "vs/workbench/contrib/codeEditor/browser/menuPreventer", "vs/workbench/contrib/codeEditor/browser/selectionClipboard", "vs/editor/contrib/contextmenu/browser/contextmenu", "vs/base/common/platform", "vs/base/common/strings", "vs/editor/contrib/suggest/browser/suggestController", "vs/editor/contrib/snippet/browser/snippetController2", "vs/platform/instantiation/common/serviceCollection", "vs/editor/contrib/hover/browser/hover", "vs/editor/contrib/colorPicker/browser/colorDetector", "vs/editor/contrib/links/browser/links", "vs/platform/opener/common/opener", "vs/platform/telemetry/common/telemetry", "vs/editor/common/languages/language", "vs/platform/label/common/label", "vs/workbench/browser/style", "vs/base/common/codicons", "vs/base/common/themables", "vs/workbench/contrib/scm/browser/scmRepositoryRenderer", "vs/platform/theme/common/theme", "vs/platform/uriIdentity/common/uriIdentity", "vs/workbench/browser/parts/editor/editorCommands", "vs/platform/actions/browser/menuEntryActionViewItem", "vs/platform/workspace/common/workspace", "vs/editor/contrib/markdownRenderer/browser/markdownRenderer", "vs/base/browser/ui/button/button", "vs/platform/notification/common/notification", "vs/workbench/contrib/scm/browser/scmViewService", "vs/editor/contrib/dnd/browser/dnd", "vs/editor/contrib/dropOrPasteInto/browser/dropIntoEditorController", "vs/editor/contrib/message/browser/messageController", "vs/platform/theme/common/colorRegistry", "vs/platform/theme/browser/defaultStyles", "vs/editor/contrib/inlineCompletions/browser/inlineCompletionsController", "vs/editor/contrib/codeAction/browser/codeActionController", "vs/editor/common/services/resolverService", "vs/base/common/network", "vs/workbench/browser/dnd", "vs/platform/dnd/browser/dnd", "vs/editor/contrib/format/browser/formatActions", "vs/css!./media/scm"], function (require, exports, event_1, resources_1, lifecycle_1, viewPane_1, dom_1, scm_1, labels_1, countBadge_1, editorService_1, instantiation_1, contextView_1, contextkey_1, commands_1, keybinding_1, actions_1, actions_2, actionbar_1, themeService_1, util_1, listService_1, configuration_1, async_1, resourceTree_1, iterator_1, uri_1, files_1, comparers_1, filters_1, views_1, nls_1, arrays_1, decorators_1, storage_1, editor_1, theme_1, codeEditorWidget_1, simpleEditorOptions_1, model_1, editorExtensions_1, menuPreventer_1, selectionClipboard_1, contextmenu_1, platform, strings_1, suggestController_1, snippetController2_1, serviceCollection_1, hover_1, colorDetector_1, links_1, opener_1, telemetry_1, language_1, label_1, style_1, codicons_1, themables_1, scmRepositoryRenderer_1, theme_2, uriIdentity_1, editorCommands_1, menuEntryActionViewItem_1, workspace_1, markdownRenderer_1, button_1, notification_1, scmViewService_1, dnd_1, dropIntoEditorController_1, messageController_1, colorRegistry_1, defaultStyles_1, inlineCompletionsController_1, codeActionController_1, resolverService_1, network_1, dnd_2, dnd_3, formatActions_1) {
    "use strict";
    var ActionButtonRenderer_1, InputRenderer_1, ResourceGroupRenderer_1, ResourceRenderer_1, SCMInputWidget_1;
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.SCMActionButton = exports.scmProviderSeparatorBorderColor = exports.SCMViewPane = exports.SCMAccessibilityProvider = exports.SCMTreeKeyboardNavigationLabelProvider = exports.SCMTreeSorter = exports.ActionButtonRenderer = void 0;
    let ActionButtonRenderer = class ActionButtonRenderer {
        static { ActionButtonRenderer_1 = this; }
        static { this.DEFAULT_HEIGHT = 30; }
        static { this.TEMPLATE_ID = 'actionButton'; }
        get templateId() { return ActionButtonRenderer_1.TEMPLATE_ID; }
        constructor(commandService, contextMenuService, notificationService) {
            this.commandService = commandService;
            this.contextMenuService = contextMenuService;
            this.notificationService = notificationService;
            this.actionButtons = new Map();
        }
        renderTemplate(container) {
            // hack
            container.parentElement.parentElement.querySelector('.monaco-tl-twistie').classList.add('force-no-twistie');
            // Use default cursor & disable hover for list item
            container.parentElement.parentElement.classList.add('cursor-default', 'force-no-hover');
            const buttonContainer = (0, dom_1.append)(container, (0, dom_1.$)('.button-container'));
            const actionButton = new SCMActionButton(buttonContainer, this.contextMenuService, this.commandService, this.notificationService);
            return { actionButton, disposable: lifecycle_1.Disposable.None, templateDisposable: actionButton };
        }
        renderElement(node, index, templateData, height) {
            templateData.disposable.dispose();
            const disposables = new lifecycle_1.DisposableStore();
            const actionButton = node.element;
            templateData.actionButton.setButton(node.element.button);
            // Remember action button
            this.actionButtons.set(actionButton, templateData.actionButton);
            disposables.add({ dispose: () => this.actionButtons.delete(actionButton) });
            templateData.disposable = disposables;
        }
        renderCompressedElements() {
            throw new Error('Should never happen since node is incompressible');
        }
        focusActionButton(actionButton) {
            this.actionButtons.get(actionButton)?.focus();
        }
        disposeElement(node, index, template) {
            template.disposable.dispose();
        }
        disposeTemplate(templateData) {
            templateData.disposable.dispose();
            templateData.templateDisposable.dispose();
        }
    };
    exports.ActionButtonRenderer = ActionButtonRenderer;
    exports.ActionButtonRenderer = ActionButtonRenderer = ActionButtonRenderer_1 = __decorate([
        __param(0, commands_1.ICommandService),
        __param(1, contextView_1.IContextMenuService),
        __param(2, notification_1.INotificationService)
    ], ActionButtonRenderer);
    class SCMTreeDragAndDrop {
        constructor(instantiationService) {
            this.instantiationService = instantiationService;
        }
        getDragURI(element) {
            if ((0, util_1.isSCMResource)(element)) {
                return element.sourceUri.toString();
            }
            return null;
        }
        onDragStart(data, originalEvent) {
            const items = SCMTreeDragAndDrop.getResourcesFromDragAndDropData(data);
            if (originalEvent.dataTransfer && items?.length) {
                this.instantiationService.invokeFunction(accessor => (0, dnd_2.fillEditorsDragData)(accessor, items, originalEvent));
                const fileResources = items.filter(s => s.scheme === network_1.Schemas.file).map(r => r.fsPath);
                if (fileResources.length) {
                    originalEvent.dataTransfer.setData(dnd_3.CodeDataTransfers.FILES, JSON.stringify(fileResources));
                }
            }
        }
        getDragLabel(elements, originalEvent) {
            if (elements.length === 1) {
                const element = elements[0];
                if ((0, util_1.isSCMResource)(element)) {
                    return (0, resources_1.basename)(element.sourceUri);
                }
            }
            return String(elements.length);
        }
        onDragOver(data, targetElement, targetIndex, originalEvent) {
            return true;
        }
        drop(data, targetElement, targetIndex, originalEvent) { }
        static getResourcesFromDragAndDropData(data) {
            const uris = [];
            for (const element of [...data.context ?? [], ...data.elements]) {
                if ((0, util_1.isSCMResource)(element)) {
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
        constructor(outerLayout, overflowWidgetsDomNode, updateHeight, instantiationService) {
            this.outerLayout = outerLayout;
            this.overflowWidgetsDomNode = overflowWidgetsDomNode;
            this.updateHeight = updateHeight;
            this.instantiationService = instantiationService;
            this.inputWidgets = new Map();
            this.contentHeights = new WeakMap();
            this.editorSelections = new WeakMap();
        }
        renderTemplate(container) {
            // hack
            container.parentElement.parentElement.querySelector('.monaco-tl-twistie').classList.add('force-no-twistie');
            // Disable hover for list item
            container.parentElement.parentElement.classList.add('force-no-hover');
            const templateDisposable = new lifecycle_1.DisposableStore();
            const inputElement = (0, dom_1.append)(container, (0, dom_1.$)('.scm-input'));
            const inputWidget = this.instantiationService.createInstance(SCMInputWidget, inputElement, this.overflowWidgetsDomNode);
            templateDisposable.add(inputWidget);
            return { inputWidget, inputWidgetHeight: InputRenderer_1.DEFAULT_HEIGHT, elementDisposables: new lifecycle_1.DisposableStore(), templateDisposable };
        }
        renderElement(node, index, templateData) {
            const input = node.element;
            templateData.inputWidget.setInput(input);
            // Remember widget
            this.inputWidgets.set(input, templateData.inputWidget);
            templateData.elementDisposables.add({
                dispose: () => this.inputWidgets.delete(input)
            });
            // Widget cursor selections
            const selections = this.editorSelections.get(input);
            if (selections) {
                templateData.inputWidget.selections = selections;
            }
            templateData.elementDisposables.add((0, lifecycle_1.toDisposable)(() => {
                const selections = templateData.inputWidget.selections;
                if (selections) {
                    this.editorSelections.set(input, selections);
                }
            }));
            // Rerender the element whenever the editor content height changes
            const onDidChangeContentHeight = () => {
                const contentHeight = templateData.inputWidget.getContentHeight();
                this.contentHeights.set(input, contentHeight);
                if (templateData.inputWidgetHeight !== contentHeight) {
                    this.updateHeight(input, contentHeight + 10);
                    templateData.inputWidgetHeight = contentHeight;
                    templateData.inputWidget.layout();
                }
            };
            const startListeningContentHeightChange = () => {
                templateData.elementDisposables.add(templateData.inputWidget.onDidChangeContentHeight(onDidChangeContentHeight));
                onDidChangeContentHeight();
            };
            // Setup height change listener on next tick
            const timeout = (0, async_1.disposableTimeout)(startListeningContentHeightChange, 0);
            templateData.elementDisposables.add(timeout);
            // Layout the editor whenever the outer layout happens
            const layoutEditor = () => templateData.inputWidget.layout();
            templateData.elementDisposables.add(this.outerLayout.onDidChange(layoutEditor));
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
            return (this.contentHeights.get(input) ?? InputRenderer_1.DEFAULT_HEIGHT) + 10;
        }
        getRenderedInputWidget(input) {
            return this.inputWidgets.get(input);
        }
        getFocusedInput() {
            for (const [input, inputWidget] of this.inputWidgets) {
                if (inputWidget.hasFocus()) {
                    return input;
                }
            }
            return undefined;
        }
        clearValidation() {
            for (const [, inputWidget] of this.inputWidgets) {
                inputWidget.clearValidation();
            }
        }
    };
    InputRenderer = InputRenderer_1 = __decorate([
        __param(3, instantiation_1.IInstantiationService)
    ], InputRenderer);
    let ResourceGroupRenderer = class ResourceGroupRenderer {
        static { ResourceGroupRenderer_1 = this; }
        static { this.TEMPLATE_ID = 'resource group'; }
        get templateId() { return ResourceGroupRenderer_1.TEMPLATE_ID; }
        constructor(actionViewItemProvider, scmViewService) {
            this.actionViewItemProvider = actionViewItemProvider;
            this.scmViewService = scmViewService;
        }
        renderTemplate(container) {
            // hack
            container.parentElement.parentElement.querySelector('.monaco-tl-twistie').classList.add('force-twistie');
            const element = (0, dom_1.append)(container, (0, dom_1.$)('.resource-group'));
            const name = (0, dom_1.append)(element, (0, dom_1.$)('.name'));
            const actionsContainer = (0, dom_1.append)(element, (0, dom_1.$)('.actions'));
            const actionBar = new actionbar_1.ActionBar(actionsContainer, { actionViewItemProvider: this.actionViewItemProvider });
            const countContainer = (0, dom_1.append)(element, (0, dom_1.$)('.count'));
            const count = new countBadge_1.CountBadge(countContainer, {}, defaultStyles_1.defaultCountBadgeStyles);
            const disposables = (0, lifecycle_1.combinedDisposable)(actionBar);
            return { name, count, actionBar, elementDisposables: new lifecycle_1.DisposableStore(), disposables };
        }
        renderElement(node, index, template) {
            const group = node.element;
            template.name.textContent = group.label;
            template.actionBar.clear();
            template.actionBar.context = group;
            template.count.setCount(group.elements.length);
            const menus = this.scmViewService.menus.getRepositoryMenus(group.provider);
            template.elementDisposables.add((0, util_1.connectPrimaryMenuToInlineActionBar)(menus.getResourceGroupMenu(group), template.actionBar));
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
        __param(1, scm_1.ISCMViewService)
    ], ResourceGroupRenderer);
    class RepositoryPaneActionRunner extends actions_2.ActionRunner {
        constructor(getSelectedResources) {
            super();
            this.getSelectedResources = getSelectedResources;
        }
        async runAction(action, context) {
            if (!(action instanceof actions_1.MenuItemAction)) {
                return super.runAction(action, context);
            }
            const selection = this.getSelectedResources();
            const contextIsSelected = selection.some(s => s === context);
            const actualContext = contextIsSelected ? selection : [context];
            const args = (0, arrays_1.flatten)(actualContext.map(e => resourceTree_1.ResourceTree.isResourceNode(e) ? resourceTree_1.ResourceTree.collect(e) : [e]));
            await action.run(...args);
        }
    }
    let ResourceRenderer = class ResourceRenderer {
        static { ResourceRenderer_1 = this; }
        static { this.TEMPLATE_ID = 'resource'; }
        get templateId() { return ResourceRenderer_1.TEMPLATE_ID; }
        constructor(viewModelProvider, labels, actionViewItemProvider, actionRunner, labelService, scmViewService, themeService) {
            this.viewModelProvider = viewModelProvider;
            this.labels = labels;
            this.actionViewItemProvider = actionViewItemProvider;
            this.actionRunner = actionRunner;
            this.labelService = labelService;
            this.scmViewService = scmViewService;
            this.themeService = themeService;
            this.disposables = new lifecycle_1.DisposableStore();
            this.renderedResources = new Map();
            themeService.onDidColorThemeChange(this.onDidColorThemeChange, this, this.disposables);
        }
        renderTemplate(container) {
            const element = (0, dom_1.append)(container, (0, dom_1.$)('.resource'));
            const name = (0, dom_1.append)(element, (0, dom_1.$)('.name'));
            const fileLabel = this.labels.create(name, { supportDescriptionHighlights: true, supportHighlights: true });
            const actionsContainer = (0, dom_1.append)(fileLabel.element, (0, dom_1.$)('.actions'));
            const actionBar = new actionbar_1.ActionBar(actionsContainer, {
                actionViewItemProvider: this.actionViewItemProvider,
                actionRunner: this.actionRunner
            });
            const decorationIcon = (0, dom_1.append)(element, (0, dom_1.$)('.decoration-icon'));
            const actionBarMenuListener = new lifecycle_1.MutableDisposable();
            const disposables = (0, lifecycle_1.combinedDisposable)(actionBar, fileLabel, actionBarMenuListener);
            return { element, name, fileLabel, decorationIcon, actionBar, actionBarMenu: undefined, actionBarMenuListener, elementDisposables: new lifecycle_1.DisposableStore(), disposables };
        }
        renderElement(node, index, template) {
            const resourceOrFolder = node.element;
            const iconResource = resourceTree_1.ResourceTree.isResourceNode(resourceOrFolder) ? resourceOrFolder.element : resourceOrFolder;
            const uri = resourceTree_1.ResourceTree.isResourceNode(resourceOrFolder) ? resourceOrFolder.uri : resourceOrFolder.sourceUri;
            const fileKind = resourceTree_1.ResourceTree.isResourceNode(resourceOrFolder) ? files_1.FileKind.FOLDER : files_1.FileKind.FILE;
            const viewModel = this.viewModelProvider();
            const tooltip = !resourceTree_1.ResourceTree.isResourceNode(resourceOrFolder) && resourceOrFolder.decorations.tooltip || '';
            let matches;
            let descriptionMatches;
            let strikethrough;
            if (resourceTree_1.ResourceTree.isResourceNode(resourceOrFolder)) {
                if (resourceOrFolder.element) {
                    const menus = this.scmViewService.menus.getRepositoryMenus(resourceOrFolder.element.resourceGroup.provider);
                    this._renderActionBar(template, resourceOrFolder, menus.getResourceMenu(resourceOrFolder.element));
                    template.element.classList.toggle('faded', resourceOrFolder.element.decorations.faded);
                    strikethrough = resourceOrFolder.element.decorations.strikeThrough;
                }
                else {
                    const menus = this.scmViewService.menus.getRepositoryMenus(resourceOrFolder.context.provider);
                    this._renderActionBar(template, resourceOrFolder, menus.getResourceFolderMenu(resourceOrFolder.context));
                    matches = (0, filters_1.createMatches)(node.filterData);
                    template.element.classList.remove('faded');
                }
            }
            else {
                const menus = this.scmViewService.menus.getRepositoryMenus(resourceOrFolder.resourceGroup.provider);
                this._renderActionBar(template, resourceOrFolder, menus.getResourceMenu(resourceOrFolder));
                [matches, descriptionMatches] = this._processFilterData(uri, node.filterData);
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
            this.renderIcon(template, renderedData);
            this.renderedResources.set(template, renderedData);
            template.elementDisposables.add((0, lifecycle_1.toDisposable)(() => this.renderedResources.delete(template)));
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
            const matches = (0, filters_1.createMatches)(node.filterData);
            template.fileLabel.setResource({ resource: folder.uri, name: label }, {
                fileDecorations: { colors: false, badges: true },
                fileKind,
                matches,
                separator: this.labelService.getSeparator(folder.uri.scheme)
            });
            const menus = this.scmViewService.menus.getRepositoryMenus(folder.context.provider);
            this._renderActionBar(template, folder, menus.getResourceFolderMenu(folder.context));
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
        _renderActionBar(template, resourceOrFolder, menu) {
            if (!template.actionBarMenu || template.actionBarMenu !== menu) {
                template.actionBar.clear();
                template.actionBarMenu = menu;
                template.actionBarMenuListener.value = (0, util_1.connectPrimaryMenuToInlineActionBar)(menu, template.actionBar);
            }
            template.actionBar.context = resourceOrFolder;
        }
        _processFilterData(uri, filterData) {
            if (!filterData) {
                return [undefined, undefined];
            }
            if (!filterData.label) {
                const matches = (0, filters_1.createMatches)(filterData);
                return [matches, undefined];
            }
            const fileName = (0, resources_1.basename)(uri);
            const label = filterData.label;
            const pathLength = label.length - fileName.length;
            const matches = (0, filters_1.createMatches)(filterData.score);
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
        onDidColorThemeChange() {
            for (const [template, data] of this.renderedResources) {
                this.renderIcon(template, data);
            }
        }
        renderIcon(template, data) {
            const theme = this.themeService.getColorTheme();
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
                    template.decorationIcon.style.backgroundImage = (0, dom_1.asCSSUrl)(icon);
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
            this.disposables.dispose();
        }
    };
    ResourceRenderer = ResourceRenderer_1 = __decorate([
        __param(4, label_1.ILabelService),
        __param(5, scm_1.ISCMViewService),
        __param(6, themeService_1.IThemeService)
    ], ResourceRenderer);
    class ListDelegate {
        constructor(inputRenderer) {
            this.inputRenderer = inputRenderer;
        }
        getHeight(element) {
            if ((0, util_1.isSCMInput)(element)) {
                return this.inputRenderer.getHeight(element);
            }
            else if ((0, util_1.isSCMActionButton)(element)) {
                return ActionButtonRenderer.DEFAULT_HEIGHT + 10;
            }
            else {
                return 22;
            }
        }
        getTemplateId(element) {
            if ((0, util_1.isSCMRepository)(element)) {
                return scmRepositoryRenderer_1.RepositoryRenderer.TEMPLATE_ID;
            }
            else if ((0, util_1.isSCMInput)(element)) {
                return InputRenderer.TEMPLATE_ID;
            }
            else if ((0, util_1.isSCMActionButton)(element)) {
                return ActionButtonRenderer.TEMPLATE_ID;
            }
            else if (resourceTree_1.ResourceTree.isResourceNode(element) || (0, util_1.isSCMResource)(element)) {
                return ResourceRenderer.TEMPLATE_ID;
            }
            else {
                return ResourceGroupRenderer.TEMPLATE_ID;
            }
        }
    }
    class SCMTreeFilter {
        filter(element) {
            if (resourceTree_1.ResourceTree.isResourceNode(element)) {
                return true;
            }
            else if ((0, util_1.isSCMResourceGroup)(element)) {
                return element.elements.length > 0 || !element.hideWhenEmpty;
            }
            else {
                return true;
            }
        }
    }
    class SCMTreeSorter {
        get viewModel() { return this.viewModelProvider(); }
        constructor(viewModelProvider) {
            this.viewModelProvider = viewModelProvider;
        }
        compare(one, other) {
            if ((0, util_1.isSCMRepository)(one)) {
                if (!(0, util_1.isSCMRepository)(other)) {
                    throw new Error('Invalid comparison');
                }
                return 0;
            }
            if ((0, util_1.isSCMInput)(one)) {
                return -1;
            }
            else if ((0, util_1.isSCMInput)(other)) {
                return 1;
            }
            if ((0, util_1.isSCMActionButton)(one)) {
                return -1;
            }
            else if ((0, util_1.isSCMActionButton)(other)) {
                return 1;
            }
            if ((0, util_1.isSCMResourceGroup)(one)) {
                if (!(0, util_1.isSCMResourceGroup)(other)) {
                    throw new Error('Invalid comparison');
                }
                return 0;
            }
            // List
            if (this.viewModel.mode === "list" /* ViewModelMode.List */) {
                // FileName
                if (this.viewModel.sortKey === "name" /* ViewModelSortKey.Name */) {
                    const oneName = (0, resources_1.basename)(one.sourceUri);
                    const otherName = (0, resources_1.basename)(other.sourceUri);
                    return (0, comparers_1.compareFileNames)(oneName, otherName);
                }
                // Status
                if (this.viewModel.sortKey === "status" /* ViewModelSortKey.Status */) {
                    const oneTooltip = one.decorations.tooltip ?? '';
                    const otherTooltip = other.decorations.tooltip ?? '';
                    if (oneTooltip !== otherTooltip) {
                        return (0, strings_1.compare)(oneTooltip, otherTooltip);
                    }
                }
                // Path (default)
                const onePath = one.sourceUri.fsPath;
                const otherPath = other.sourceUri.fsPath;
                return (0, comparers_1.comparePaths)(onePath, otherPath);
            }
            // Tree
            const oneIsDirectory = resourceTree_1.ResourceTree.isResourceNode(one);
            const otherIsDirectory = resourceTree_1.ResourceTree.isResourceNode(other);
            if (oneIsDirectory !== otherIsDirectory) {
                return oneIsDirectory ? -1 : 1;
            }
            const oneName = resourceTree_1.ResourceTree.isResourceNode(one) ? one.name : (0, resources_1.basename)(one.sourceUri);
            const otherName = resourceTree_1.ResourceTree.isResourceNode(other) ? other.name : (0, resources_1.basename)(other.sourceUri);
            return (0, comparers_1.compareFileNames)(oneName, otherName);
        }
    }
    exports.SCMTreeSorter = SCMTreeSorter;
    __decorate([
        decorators_1.memoize
    ], SCMTreeSorter.prototype, "viewModel", null);
    let SCMTreeKeyboardNavigationLabelProvider = class SCMTreeKeyboardNavigationLabelProvider {
        constructor(viewModelProvider, labelService) {
            this.viewModelProvider = viewModelProvider;
            this.labelService = labelService;
        }
        getKeyboardNavigationLabel(element) {
            if (resourceTree_1.ResourceTree.isResourceNode(element)) {
                return element.name;
            }
            else if ((0, util_1.isSCMRepository)(element) || (0, util_1.isSCMInput)(element) || (0, util_1.isSCMActionButton)(element)) {
                return undefined;
            }
            else if ((0, util_1.isSCMResourceGroup)(element)) {
                return element.label;
            }
            else {
                const viewModel = this.viewModelProvider();
                if (viewModel.mode === "list" /* ViewModelMode.List */) {
                    // In List mode match using the file name and the path.
                    // Since we want to match both on the file name and the
                    // full path we return an array of labels. A match in the
                    // file name takes precedence over a match in the path.
                    const fileName = (0, resources_1.basename)(element.sourceUri);
                    const filePath = this.labelService.getUriLabel(element.sourceUri, { relative: true });
                    return [fileName, filePath];
                }
                else {
                    // In Tree mode only match using the file name
                    return (0, resources_1.basename)(element.sourceUri);
                }
            }
        }
        getCompressedNodeKeyboardNavigationLabel(elements) {
            const folders = elements;
            return folders.map(e => e.name).join('/');
        }
    };
    exports.SCMTreeKeyboardNavigationLabelProvider = SCMTreeKeyboardNavigationLabelProvider;
    exports.SCMTreeKeyboardNavigationLabelProvider = SCMTreeKeyboardNavigationLabelProvider = __decorate([
        __param(1, label_1.ILabelService)
    ], SCMTreeKeyboardNavigationLabelProvider);
    function getSCMResourceId(element) {
        if (resourceTree_1.ResourceTree.isResourceNode(element)) {
            const group = element.context;
            return `folder:${group.provider.id}/${group.id}/$FOLDER/${element.uri.toString()}`;
        }
        else if ((0, util_1.isSCMRepository)(element)) {
            const provider = element.provider;
            return `repo:${provider.id}`;
        }
        else if ((0, util_1.isSCMInput)(element)) {
            const provider = element.repository.provider;
            return `input:${provider.id}`;
        }
        else if ((0, util_1.isSCMActionButton)(element)) {
            const provider = element.repository.provider;
            return `actionButton:${provider.id}`;
        }
        else if ((0, util_1.isSCMResource)(element)) {
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
    let SCMAccessibilityProvider = class SCMAccessibilityProvider {
        constructor(labelService, workspaceContextService) {
            this.labelService = labelService;
            this.workspaceContextService = workspaceContextService;
        }
        getWidgetAriaLabel() {
            return (0, nls_1.localize)('scm', "Source Control Management");
        }
        getAriaLabel(element) {
            if (resourceTree_1.ResourceTree.isResourceNode(element)) {
                return this.labelService.getUriLabel(element.uri, { relative: true, noPrefix: true }) || element.name;
            }
            else if ((0, util_1.isSCMRepository)(element)) {
                let folderName = '';
                if (element.provider.rootUri) {
                    const folder = this.workspaceContextService.getWorkspaceFolder(element.provider.rootUri);
                    if (folder?.uri.toString() === element.provider.rootUri.toString()) {
                        folderName = folder.name;
                    }
                    else {
                        folderName = (0, resources_1.basename)(element.provider.rootUri);
                    }
                }
                return `${folderName} ${element.provider.label}`;
            }
            else if ((0, util_1.isSCMInput)(element)) {
                return (0, nls_1.localize)('input', "Source Control Input");
            }
            else if ((0, util_1.isSCMActionButton)(element)) {
                return element.button?.command.title ?? '';
            }
            else if ((0, util_1.isSCMResourceGroup)(element)) {
                return element.label;
            }
            else {
                const result = [];
                result.push((0, resources_1.basename)(element.sourceUri));
                if (element.decorations.tooltip) {
                    result.push(element.decorations.tooltip);
                }
                const path = this.labelService.getUriLabel((0, resources_1.dirname)(element.sourceUri), { relative: true, noPrefix: true });
                if (path) {
                    result.push(path);
                }
                return result.join(', ');
            }
        }
    };
    exports.SCMAccessibilityProvider = SCMAccessibilityProvider;
    exports.SCMAccessibilityProvider = SCMAccessibilityProvider = __decorate([
        __param(0, label_1.ILabelService),
        __param(1, workspace_1.IWorkspaceContextService)
    ], SCMAccessibilityProvider);
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
        ViewSort: new actions_1.MenuId('SCMViewSort'),
        Repositories: new actions_1.MenuId('SCMRepositories'),
    };
    const ContextKeys = {
        ViewModelMode: new contextkey_1.RawContextKey('scmViewModelMode', "list" /* ViewModelMode.List */),
        ViewModelSortKey: new contextkey_1.RawContextKey('scmViewModelSortKey', "path" /* ViewModelSortKey.Path */),
        ViewModelAreAllRepositoriesCollapsed: new contextkey_1.RawContextKey('scmViewModelAreAllRepositoriesCollapsed', false),
        ViewModelIsAnyRepositoryCollapsible: new contextkey_1.RawContextKey('scmViewModelIsAnyRepositoryCollapsible', false),
        SCMProvider: new contextkey_1.RawContextKey('scmProvider', undefined),
        SCMProviderRootUri: new contextkey_1.RawContextKey('scmProviderRootUri', undefined),
        SCMProviderHasRootUri: new contextkey_1.RawContextKey('scmProviderHasRootUri', undefined),
        RepositoryCount: new contextkey_1.RawContextKey('scmRepositoryCount', 0),
        RepositoryVisibilityCount: new contextkey_1.RawContextKey('scmRepositoryVisibleCount', 0),
        RepositoryVisibility(repository) {
            return new contextkey_1.RawContextKey(`scmRepositoryVisible:${repository.provider.id}`, false);
        }
    };
    actions_1.MenuRegistry.appendMenuItem(actions_1.MenuId.SCMTitle, {
        title: (0, nls_1.localize)('sortAction', "View & Sort"),
        submenu: Menus.ViewSort,
        when: contextkey_1.ContextKeyExpr.and(contextkey_1.ContextKeyExpr.equals('view', scm_1.VIEW_PANE_ID), ContextKeys.RepositoryCount.notEqualsTo(0)),
        group: '0_view&sort'
    });
    actions_1.MenuRegistry.appendMenuItem(Menus.ViewSort, {
        title: (0, nls_1.localize)('repositories', "Repositories"),
        submenu: Menus.Repositories,
        group: '0_repositories'
    });
    class RepositoryVisibilityAction extends actions_1.Action2 {
        constructor(repository) {
            const title = repository.provider.rootUri ? (0, resources_1.basename)(repository.provider.rootUri) : repository.provider.label;
            super({
                id: `workbench.scm.action.toggleRepositoryVisibility.${repository.provider.id}`,
                title,
                f1: false,
                precondition: contextkey_1.ContextKeyExpr.or(ContextKeys.RepositoryVisibilityCount.notEqualsTo(1), ContextKeys.RepositoryVisibility(repository).isEqualTo(false)),
                toggled: ContextKeys.RepositoryVisibility(repository).isEqualTo(true),
                menu: { id: Menus.Repositories, group: '0_repositories' }
            });
            this.repository = repository;
        }
        run(accessor) {
            const scmViewService = accessor.get(scm_1.ISCMViewService);
            scmViewService.toggleVisibility(this.repository);
        }
    }
    let RepositoryVisibilityActionController = class RepositoryVisibilityActionController {
        constructor(scmViewService, scmService, contextKeyService) {
            this.scmViewService = scmViewService;
            this.contextKeyService = contextKeyService;
            this.items = new Map();
            this.disposables = new lifecycle_1.DisposableStore();
            this.repositoryCountContextKey = ContextKeys.RepositoryCount.bindTo(contextKeyService);
            this.repositoryVisibilityCountContextKey = ContextKeys.RepositoryVisibilityCount.bindTo(contextKeyService);
            scmViewService.onDidChangeVisibleRepositories(this.onDidChangeVisibleRepositories, this, this.disposables);
            scmService.onDidAddRepository(this.onDidAddRepository, this, this.disposables);
            scmService.onDidRemoveRepository(this.onDidRemoveRepository, this, this.disposables);
            for (const repository of scmService.repositories) {
                this.onDidAddRepository(repository);
            }
        }
        onDidAddRepository(repository) {
            const action = (0, actions_1.registerAction2)(class extends RepositoryVisibilityAction {
                constructor() {
                    super(repository);
                }
            });
            const contextKey = ContextKeys.RepositoryVisibility(repository).bindTo(this.contextKeyService);
            contextKey.set(this.scmViewService.isVisible(repository));
            this.items.set(repository, {
                contextKey,
                dispose() {
                    contextKey.reset();
                    action.dispose();
                }
            });
            this.updateRepositoriesCounts();
        }
        onDidRemoveRepository(repository) {
            this.items.get(repository)?.dispose();
            this.items.delete(repository);
            this.updateRepositoriesCounts();
        }
        onDidChangeVisibleRepositories() {
            let count = 0;
            for (const [repository, item] of this.items) {
                const isVisible = this.scmViewService.isVisible(repository);
                item.contextKey.set(isVisible);
                if (isVisible) {
                    count++;
                }
            }
            this.repositoryCountContextKey.set(this.items.size);
            this.repositoryVisibilityCountContextKey.set(count);
        }
        updateRepositoriesCounts() {
            this.repositoryCountContextKey.set(this.items.size);
            this.repositoryVisibilityCountContextKey.set(iterator_1.Iterable.reduce(this.items.keys(), (r, repository) => r + (this.scmViewService.isVisible(repository) ? 1 : 0), 0));
        }
        dispose() {
            this.disposables.dispose();
            (0, lifecycle_1.dispose)(this.items.values());
            this.items.clear();
        }
    };
    RepositoryVisibilityActionController = __decorate([
        __param(0, scm_1.ISCMViewService),
        __param(1, scm_1.ISCMService),
        __param(2, contextkey_1.IContextKeyService)
    ], RepositoryVisibilityActionController);
    let ViewModel = class ViewModel {
        get mode() { return this._mode; }
        set mode(mode) {
            if (this._mode === mode) {
                return;
            }
            this._mode = mode;
            for (const [, item] of this.items) {
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
            this.sortKey = this.getViewModelSortKey();
            this.refresh();
            this._onDidChangeMode.fire(mode);
            this.modeContextKey.set(mode);
            this.storageService.store(`scm.viewMode`, mode, 1 /* StorageScope.WORKSPACE */, 0 /* StorageTarget.USER */);
        }
        get sortKey() { return this._sortKey; }
        set sortKey(sortKey) {
            if (this._sortKey === sortKey) {
                return;
            }
            this._sortKey = sortKey;
            this.refresh();
            this._onDidChangeSortKey.fire(sortKey);
            this.sortKeyContextKey.set(sortKey);
            if (this._mode === "list" /* ViewModelMode.List */) {
                this.storageService.store(`scm.viewSortKey`, sortKey, 1 /* StorageScope.WORKSPACE */, 0 /* StorageTarget.USER */);
            }
        }
        get treeViewState() {
            if (this.visible && this._treeViewStateIsStale) {
                this.updateViewState();
                this._treeViewStateIsStale = false;
            }
            return this._treeViewState;
        }
        constructor(tree, inputRenderer, instantiationService, editorService, configurationService, scmViewService, storageService, uriIdentityService, contextKeyService) {
            this.tree = tree;
            this.inputRenderer = inputRenderer;
            this.instantiationService = instantiationService;
            this.editorService = editorService;
            this.configurationService = configurationService;
            this.scmViewService = scmViewService;
            this.storageService = storageService;
            this.uriIdentityService = uriIdentityService;
            this._onDidChangeMode = new event_1.Emitter();
            this.onDidChangeMode = this._onDidChangeMode.event;
            this._onDidChangeSortKey = new event_1.Emitter();
            this.onDidChangeSortKey = this._onDidChangeSortKey.event;
            this.visible = false;
            this._treeViewStateIsStale = false;
            this.items = new Map();
            this.visibilityDisposables = new lifecycle_1.DisposableStore();
            this.alwaysShowRepositories = false;
            this.showActionButton = false;
            this.firstVisible = true;
            this.disposables = new lifecycle_1.DisposableStore();
            // View mode and sort key
            this._mode = this.getViewModelMode();
            this._sortKey = this.getViewModelSortKey();
            // TreeView state
            const storageViewState = this.storageService.get(`scm.viewState`, 1 /* StorageScope.WORKSPACE */);
            if (storageViewState) {
                try {
                    this._treeViewState = JSON.parse(storageViewState);
                }
                catch { /* noop */ }
            }
            this.modeContextKey = ContextKeys.ViewModelMode.bindTo(contextKeyService);
            this.modeContextKey.set(this._mode);
            this.sortKeyContextKey = ContextKeys.ViewModelSortKey.bindTo(contextKeyService);
            this.sortKeyContextKey.set(this._sortKey);
            this.areAllRepositoriesCollapsedContextKey = ContextKeys.ViewModelAreAllRepositoriesCollapsed.bindTo(contextKeyService);
            this.isAnyRepositoryCollapsibleContextKey = ContextKeys.ViewModelIsAnyRepositoryCollapsible.bindTo(contextKeyService);
            this.scmProviderContextKey = ContextKeys.SCMProvider.bindTo(contextKeyService);
            this.scmProviderRootUriContextKey = ContextKeys.SCMProviderRootUri.bindTo(contextKeyService);
            this.scmProviderHasRootUriContextKey = ContextKeys.SCMProviderHasRootUri.bindTo(contextKeyService);
            configurationService.onDidChangeConfiguration(this.onDidChangeConfiguration, this, this.disposables);
            this.onDidChangeConfiguration();
            event_1.Event.filter(this.tree.onDidChangeCollapseState, e => (0, util_1.isSCMRepository)(e.node.element), this.disposables)(this.updateRepositoryCollapseAllContextKeys, this, this.disposables);
            this.disposables.add(this.tree.onDidChangeCollapseState(() => this._treeViewStateIsStale = true));
            this.disposables.add(this.storageService.onWillSaveState(e => {
                if (e.reason === storage_1.WillSaveStateReason.SHUTDOWN) {
                    this.storageService.store(`scm.viewState`, JSON.stringify(this.treeViewState), 1 /* StorageScope.WORKSPACE */, 1 /* StorageTarget.MACHINE */);
                }
                this.mode = this.getViewModelMode();
                this.sortKey = this.getViewModelSortKey();
            }));
            this.disposables.add(this.storageService.onDidChangeValue(1 /* StorageScope.WORKSPACE */, undefined, this.disposables)(e => {
                switch (e.key) {
                    case 'scm.viewMode':
                        this.mode = this.getViewModelMode();
                        break;
                    case 'scm.viewSortKey':
                        this.sortKey = this.getViewModelSortKey();
                        break;
                }
            }));
        }
        onDidChangeConfiguration(e) {
            if (!e || e.affectsConfiguration('scm.alwaysShowRepositories') || e.affectsConfiguration('scm.showActionButton')) {
                this.alwaysShowRepositories = this.configurationService.getValue('scm.alwaysShowRepositories');
                this.showActionButton = this.configurationService.getValue('scm.showActionButton');
                this.refresh();
            }
        }
        _onDidChangeVisibleRepositories({ added, removed }) {
            for (const repository of added) {
                const disposable = (0, lifecycle_1.combinedDisposable)(repository.provider.groups.onDidSplice(splice => this._onDidSpliceGroups(item, splice)), repository.input.onDidChangeVisibility(() => this.refresh(item)), repository.provider.onDidChange(() => {
                    if (this.showActionButton) {
                        this.refresh(item);
                    }
                }));
                const groupItems = repository.provider.groups.elements.map(group => this.createGroupItem(group));
                const item = {
                    element: repository, groupItems, dispose() {
                        (0, lifecycle_1.dispose)(this.groupItems);
                        disposable.dispose();
                    }
                };
                this.items.set(repository, item);
            }
            for (const repository of removed) {
                const item = this.items.get(repository);
                item.dispose();
                this.items.delete(repository);
            }
            this.refresh();
        }
        _onDidSpliceGroups(item, { start, deleteCount, toInsert }) {
            const itemsToInsert = toInsert.map(group => this.createGroupItem(group));
            const itemsToDispose = item.groupItems.splice(start, deleteCount, ...itemsToInsert);
            for (const item of itemsToDispose) {
                item.dispose();
            }
            this.refresh();
        }
        createGroupItem(group) {
            const tree = new resourceTree_1.ResourceTree(group, group.provider.rootUri || uri_1.URI.file('/'), this.uriIdentityService.extUri);
            const resources = [...group.elements];
            const disposable = (0, lifecycle_1.combinedDisposable)(group.onDidChange(() => this.tree.refilter()), group.onDidSplice(splice => this._onDidSpliceGroup(item, splice)));
            const item = { element: group, resources, tree, dispose() { disposable.dispose(); } };
            if (this._mode === "tree" /* ViewModelMode.Tree */) {
                for (const resource of resources) {
                    item.tree.add(resource.sourceUri, resource);
                }
            }
            return item;
        }
        _onDidSpliceGroup(item, { start, deleteCount, toInsert }) {
            const before = item.resources.length;
            const deleted = item.resources.splice(start, deleteCount, ...toInsert);
            const after = item.resources.length;
            if (this._mode === "tree" /* ViewModelMode.Tree */) {
                for (const resource of deleted) {
                    item.tree.delete(resource.sourceUri);
                }
                for (const resource of toInsert) {
                    item.tree.add(resource.sourceUri, resource);
                }
            }
            if (before !== after && (before === 0 || after === 0)) {
                this.refresh();
            }
            else {
                this.refresh(item);
            }
        }
        setVisible(visible) {
            if (visible) {
                this.scmViewService.onDidChangeVisibleRepositories(this._onDidChangeVisibleRepositories, this, this.visibilityDisposables);
                this._onDidChangeVisibleRepositories({ added: this.scmViewService.visibleRepositories, removed: iterator_1.Iterable.empty() });
                if (typeof this.scrollTop === 'number') {
                    this.tree.scrollTop = this.scrollTop;
                    this.scrollTop = undefined;
                }
                this.editorService.onDidActiveEditorChange(this.onDidActiveEditorChange, this, this.visibilityDisposables);
                this.onDidActiveEditorChange();
            }
            else {
                this.updateViewState();
                this.visibilityDisposables.clear();
                this._onDidChangeVisibleRepositories({ added: iterator_1.Iterable.empty(), removed: [...this.items.keys()] });
                this.scrollTop = this.tree.scrollTop;
            }
            this.visible = visible;
            this.updateRepositoryCollapseAllContextKeys();
        }
        refresh(item) {
            if (!this.alwaysShowRepositories && this.items.size === 1) {
                const provider = iterator_1.Iterable.first(this.items.values()).element.provider;
                this.scmProviderContextKey.set(provider.contextValue);
                this.scmProviderRootUriContextKey.set(provider.rootUri?.toString());
                this.scmProviderHasRootUriContextKey.set(!!provider.rootUri);
            }
            else {
                this.scmProviderContextKey.set(undefined);
                this.scmProviderRootUriContextKey.set(undefined);
                this.scmProviderHasRootUriContextKey.set(false);
            }
            const focusedInput = this.inputRenderer.getFocusedInput();
            if (!this.alwaysShowRepositories && (this.items.size === 1 && (!item || isRepositoryItem(item)))) {
                const item = iterator_1.Iterable.first(this.items.values());
                this.tree.setChildren(null, this.render(item, this.treeViewState).children);
            }
            else if (item) {
                this.tree.setChildren(item.element, this.render(item, this.treeViewState).children);
            }
            else {
                const items = (0, arrays_1.coalesce)(this.scmViewService.visibleRepositories.map(r => this.items.get(r)));
                this.tree.setChildren(null, items.map(item => this.render(item, this.treeViewState)));
            }
            if (focusedInput) {
                this.inputRenderer.getRenderedInputWidget(focusedInput)?.focus();
            }
            this.updateRepositoryCollapseAllContextKeys();
        }
        render(item, treeViewState) {
            if (isRepositoryItem(item)) {
                const children = [];
                const hasSomeChanges = item.groupItems.some(item => item.element.elements.length > 0);
                if (item.element.input.visible) {
                    children.push({ element: item.element.input, incompressible: true, collapsible: false });
                }
                if (hasSomeChanges || (this.items.size === 1 && (!this.showActionButton || !item.element.provider.actionButton))) {
                    children.push(...item.groupItems.map(i => this.render(i, treeViewState)));
                }
                if (this.showActionButton && item.element.provider.actionButton) {
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
        updateViewState() {
            const collapsed = [];
            const visit = (node) => {
                if (node.element && node.collapsible && node.collapsed) {
                    collapsed.push(getSCMResourceId(node.element));
                }
                for (const child of node.children) {
                    visit(child);
                }
            };
            visit(this.tree.getNode());
            this._treeViewState = { collapsed };
        }
        onDidActiveEditorChange() {
            if (!this.configurationService.getValue('scm.autoReveal')) {
                return;
            }
            if (this.firstVisible) {
                this.firstVisible = false;
                this.visibilityDisposables.add((0, async_1.disposableTimeout)(() => this.onDidActiveEditorChange(), 250));
                return;
            }
            const uri = editor_1.EditorResourceAccessor.getOriginalUri(this.editorService.activeEditor, { supportSideBySide: editor_1.SideBySideEditor.PRIMARY });
            if (!uri) {
                return;
            }
            for (const repository of this.scmViewService.visibleRepositories) {
                const item = this.items.get(repository);
                if (!item) {
                    continue;
                }
                // go backwards from last group
                for (let j = item.groupItems.length - 1; j >= 0; j--) {
                    const groupItem = item.groupItems[j];
                    const resource = this.mode === "tree" /* ViewModelMode.Tree */
                        ? groupItem.tree.getNode(uri)?.element
                        : groupItem.resources.find(r => this.uriIdentityService.extUri.isEqual(r.sourceUri, uri));
                    if (resource) {
                        this.tree.reveal(resource);
                        this.tree.setSelection([resource]);
                        this.tree.setFocus([resource]);
                        return;
                    }
                }
            }
        }
        focus() {
            if (this.tree.getFocus().length === 0) {
                for (const repository of this.scmViewService.visibleRepositories) {
                    const widget = this.inputRenderer.getRenderedInputWidget(repository.input);
                    if (widget) {
                        widget.focus();
                        return;
                    }
                }
            }
            this.tree.domFocus();
        }
        updateRepositoryCollapseAllContextKeys() {
            if (!this.visible || this.scmViewService.visibleRepositories.length === 1) {
                this.isAnyRepositoryCollapsibleContextKey.set(false);
                this.areAllRepositoriesCollapsedContextKey.set(false);
                return;
            }
            this.isAnyRepositoryCollapsibleContextKey.set(this.scmViewService.visibleRepositories.some(r => this.tree.hasElement(r) && this.tree.isCollapsible(r)));
            this.areAllRepositoriesCollapsedContextKey.set(this.scmViewService.visibleRepositories.every(r => this.tree.hasElement(r) && (!this.tree.isCollapsible(r) || this.tree.isCollapsed(r))));
        }
        collapseAllRepositories() {
            for (const repository of this.scmViewService.visibleRepositories) {
                if (this.tree.isCollapsible(repository)) {
                    this.tree.collapse(repository);
                }
            }
        }
        expandAllRepositories() {
            for (const repository of this.scmViewService.visibleRepositories) {
                if (this.tree.isCollapsible(repository)) {
                    this.tree.expand(repository);
                }
            }
        }
        getViewModelMode() {
            let mode = this.configurationService.getValue('scm.defaultViewMode') === 'list' ? "list" /* ViewModelMode.List */ : "tree" /* ViewModelMode.Tree */;
            const storageMode = this.storageService.get(`scm.viewMode`, 1 /* StorageScope.WORKSPACE */);
            if (typeof storageMode === 'string') {
                mode = storageMode;
            }
            return mode;
        }
        getViewModelSortKey() {
            // Tree
            if (this._mode === "tree" /* ViewModelMode.Tree */) {
                return "path" /* ViewModelSortKey.Path */;
            }
            // List
            let viewSortKey;
            const viewSortKeyString = this.configurationService.getValue('scm.defaultViewSortKey');
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
            const storageSortKey = this.storageService.get(`scm.viewSortKey`, 1 /* StorageScope.WORKSPACE */);
            if (typeof storageSortKey === 'string') {
                viewSortKey = storageSortKey;
            }
            return viewSortKey;
        }
        dispose() {
            this.visibilityDisposables.dispose();
            this.disposables.dispose();
            (0, lifecycle_1.dispose)(this.items.values());
            this.items.clear();
        }
    };
    ViewModel = __decorate([
        __param(2, instantiation_1.IInstantiationService),
        __param(3, editorService_1.IEditorService),
        __param(4, configuration_1.IConfigurationService),
        __param(5, scm_1.ISCMViewService),
        __param(6, storage_1.IStorageService),
        __param(7, uriIdentity_1.IUriIdentityService),
        __param(8, contextkey_1.IContextKeyService)
    ], ViewModel);
    class SetListViewModeAction extends viewPane_1.ViewAction {
        constructor(menu = {}) {
            super({
                id: 'workbench.scm.action.setListViewMode',
                title: (0, nls_1.localize)('setListViewMode', "View as List"),
                viewId: scm_1.VIEW_PANE_ID,
                f1: false,
                icon: codicons_1.Codicon.listTree,
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
                id: actions_1.MenuId.SCMTitle,
                when: contextkey_1.ContextKeyExpr.and(contextkey_1.ContextKeyExpr.equals('view', scm_1.VIEW_PANE_ID), ContextKeys.RepositoryCount.notEqualsTo(0), ContextKeys.ViewModelMode.isEqualTo("tree" /* ViewModelMode.Tree */)),
                group: 'navigation',
                order: -1000
            });
        }
    }
    class SetTreeViewModeAction extends viewPane_1.ViewAction {
        constructor(menu = {}) {
            super({
                id: 'workbench.scm.action.setTreeViewMode',
                title: (0, nls_1.localize)('setTreeViewMode', "View as Tree"),
                viewId: scm_1.VIEW_PANE_ID,
                f1: false,
                icon: codicons_1.Codicon.listFlat,
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
                id: actions_1.MenuId.SCMTitle,
                when: contextkey_1.ContextKeyExpr.and(contextkey_1.ContextKeyExpr.equals('view', scm_1.VIEW_PANE_ID), ContextKeys.RepositoryCount.notEqualsTo(0), ContextKeys.ViewModelMode.isEqualTo("list" /* ViewModelMode.List */)),
                group: 'navigation',
                order: -1000
            });
        }
    }
    (0, actions_1.registerAction2)(SetListViewModeAction);
    (0, actions_1.registerAction2)(SetTreeViewModeAction);
    (0, actions_1.registerAction2)(SetListViewModeNavigationAction);
    (0, actions_1.registerAction2)(SetTreeViewModeNavigationAction);
    class RepositorySortAction extends viewPane_1.ViewAction {
        constructor(sortKey, title) {
            super({
                id: `workbench.scm.action.repositories.setSortKey.${sortKey}`,
                title,
                viewId: scm_1.VIEW_PANE_ID,
                f1: false,
                toggled: scmViewService_1.RepositoryContextKeys.RepositorySortKey.isEqualTo(sortKey),
                menu: [
                    {
                        id: Menus.Repositories,
                        group: '1_sort'
                    },
                    {
                        id: actions_1.MenuId.ViewTitle,
                        when: contextkey_1.ContextKeyExpr.equals('view', scm_1.REPOSITORIES_VIEW_PANE_ID),
                        group: '1_sort',
                    },
                ]
            });
            this.sortKey = sortKey;
        }
        runInView(accessor) {
            accessor.get(scm_1.ISCMViewService).toggleSortKey(this.sortKey);
        }
    }
    class RepositorySortByDiscoveryTimeAction extends RepositorySortAction {
        constructor() {
            super("discoveryTime" /* ISCMRepositorySortKey.DiscoveryTime */, (0, nls_1.localize)('repositorySortByDiscoveryTime', "Sort by Discovery Time"));
        }
    }
    class RepositorySortByNameAction extends RepositorySortAction {
        constructor() {
            super("name" /* ISCMRepositorySortKey.Name */, (0, nls_1.localize)('repositorySortByName', "Sort by Name"));
        }
    }
    class RepositorySortByPathAction extends RepositorySortAction {
        constructor() {
            super("path" /* ISCMRepositorySortKey.Path */, (0, nls_1.localize)('repositorySortByPath', "Sort by Path"));
        }
    }
    (0, actions_1.registerAction2)(RepositorySortByDiscoveryTimeAction);
    (0, actions_1.registerAction2)(RepositorySortByNameAction);
    (0, actions_1.registerAction2)(RepositorySortByPathAction);
    class SetSortKeyAction extends viewPane_1.ViewAction {
        constructor(sortKey, title) {
            super({
                id: `workbench.scm.action.setSortKey.${sortKey}`,
                title,
                viewId: scm_1.VIEW_PANE_ID,
                f1: false,
                toggled: ContextKeys.ViewModelSortKey.isEqualTo(sortKey),
                precondition: ContextKeys.ViewModelMode.isEqualTo("list" /* ViewModelMode.List */),
                menu: { id: Menus.ViewSort, group: '2_sort' }
            });
            this.sortKey = sortKey;
        }
        async runInView(_, view) {
            view.viewModel.sortKey = this.sortKey;
        }
    }
    class SetSortByNameAction extends SetSortKeyAction {
        constructor() {
            super("name" /* ViewModelSortKey.Name */, (0, nls_1.localize)('sortChangesByName', "Sort Changes by Name"));
        }
    }
    class SetSortByPathAction extends SetSortKeyAction {
        constructor() {
            super("path" /* ViewModelSortKey.Path */, (0, nls_1.localize)('sortChangesByPath', "Sort Changes by Path"));
        }
    }
    class SetSortByStatusAction extends SetSortKeyAction {
        constructor() {
            super("status" /* ViewModelSortKey.Status */, (0, nls_1.localize)('sortChangesByStatus', "Sort Changes by Status"));
        }
    }
    (0, actions_1.registerAction2)(SetSortByNameAction);
    (0, actions_1.registerAction2)(SetSortByPathAction);
    (0, actions_1.registerAction2)(SetSortByStatusAction);
    class CollapseAllRepositoriesAction extends viewPane_1.ViewAction {
        constructor() {
            super({
                id: `workbench.scm.action.collapseAllRepositories`,
                title: (0, nls_1.localize)('collapse all', "Collapse All Repositories"),
                viewId: scm_1.VIEW_PANE_ID,
                f1: false,
                icon: codicons_1.Codicon.collapseAll,
                menu: {
                    id: actions_1.MenuId.SCMTitle,
                    group: 'navigation',
                    when: contextkey_1.ContextKeyExpr.and(contextkey_1.ContextKeyExpr.equals('view', scm_1.VIEW_PANE_ID), ContextKeys.ViewModelIsAnyRepositoryCollapsible.isEqualTo(true), ContextKeys.ViewModelAreAllRepositoriesCollapsed.isEqualTo(false))
                }
            });
        }
        async runInView(_, view) {
            view.viewModel.collapseAllRepositories();
        }
    }
    class ExpandAllRepositoriesAction extends viewPane_1.ViewAction {
        constructor() {
            super({
                id: `workbench.scm.action.expandAllRepositories`,
                title: (0, nls_1.localize)('expand all', "Expand All Repositories"),
                viewId: scm_1.VIEW_PANE_ID,
                f1: false,
                icon: codicons_1.Codicon.expandAll,
                menu: {
                    id: actions_1.MenuId.SCMTitle,
                    group: 'navigation',
                    when: contextkey_1.ContextKeyExpr.and(contextkey_1.ContextKeyExpr.equals('view', scm_1.VIEW_PANE_ID), ContextKeys.ViewModelIsAnyRepositoryCollapsible.isEqualTo(true), ContextKeys.ViewModelAreAllRepositoriesCollapsed.isEqualTo(true))
                }
            });
        }
        async runInView(_, view) {
            view.viewModel.expandAllRepositories();
        }
    }
    (0, actions_1.registerAction2)(CollapseAllRepositoriesAction);
    (0, actions_1.registerAction2)(ExpandAllRepositoriesAction);
    let SCMInputWidget = class SCMInputWidget {
        static { SCMInputWidget_1 = this; }
        static { this.ValidationTimeouts = {
            [2 /* InputValidationType.Information */]: 5000,
            [1 /* InputValidationType.Warning */]: 8000,
            [0 /* InputValidationType.Error */]: 10000
        }; }
        get input() {
            return this.model?.input;
        }
        async setInput(input) {
            if (input === this.input) {
                return;
            }
            this.clearValidation();
            this.editorContainer.classList.remove('synthetic-focus');
            this.repositoryDisposables.clear();
            this.repositoryIdContextKey.set(input?.repository.id);
            if (!input) {
                this.model?.textModelRef?.dispose();
                this.inputEditor.setModel(undefined);
                this.model = undefined;
                return;
            }
            const uri = input.repository.provider.inputBoxDocumentUri;
            if (this.configurationService.getValue('editor.wordBasedSuggestions', { resource: uri }) !== false) {
                this.configurationService.updateValue('editor.wordBasedSuggestions', false, { resource: uri }, 8 /* ConfigurationTarget.MEMORY */);
            }
            const modelValue = { input, textModelRef: undefined };
            // Save model
            this.model = modelValue;
            const modelRef = await this.textModelService.createModelReference(uri);
            // Model has been changed in the meantime
            if (this.model !== modelValue) {
                modelRef.dispose();
                return;
            }
            modelValue.textModelRef = modelRef;
            const textModel = modelRef.object.textEditorModel;
            this.inputEditor.setModel(textModel);
            // Validation
            const validationDelayer = new async_1.ThrottledDelayer(200);
            const validate = async () => {
                const position = this.inputEditor.getSelection()?.getStartPosition();
                const offset = position && textModel.getOffsetAt(position);
                const value = textModel.getValue();
                this.setValidation(await input.validateInput(value, offset || 0));
            };
            const triggerValidation = () => validationDelayer.trigger(validate);
            this.repositoryDisposables.add(validationDelayer);
            this.repositoryDisposables.add(this.inputEditor.onDidChangeCursorPosition(triggerValidation));
            // Adaptive indentation rules
            const opts = this.modelService.getCreationOptions(textModel.getLanguageId(), textModel.uri, textModel.isForSimpleWidget);
            const onEnter = event_1.Event.filter(this.inputEditor.onKeyDown, e => e.keyCode === 3 /* KeyCode.Enter */, this.repositoryDisposables);
            this.repositoryDisposables.add(onEnter(() => textModel.detectIndentation(opts.insertSpaces, opts.tabSize)));
            // Keep model in sync with API
            textModel.setValue(input.value);
            this.repositoryDisposables.add(input.onDidChange(({ value, reason }) => {
                if (value === textModel.getValue()) { // circuit breaker
                    return;
                }
                textModel.setValue(value);
                const position = reason === scm_1.SCMInputChangeReason.HistoryPrevious
                    ? textModel.getFullModelRange().getStartPosition()
                    : textModel.getFullModelRange().getEndPosition();
                this.inputEditor.setPosition(position);
                this.inputEditor.revealPositionInCenterIfOutsideViewport(position);
            }));
            this.repositoryDisposables.add(input.onDidChangeFocus(() => this.focus()));
            this.repositoryDisposables.add(input.onDidChangeValidationMessage((e) => this.setValidation(e, { focus: true, timeout: true })));
            this.repositoryDisposables.add(input.onDidChangeValidateInput((e) => triggerValidation()));
            // Keep API in sync with model, update placeholder visibility and validate
            const updatePlaceholderVisibility = () => this.placeholderTextContainer.classList.toggle('hidden', textModel.getValueLength() > 0);
            this.repositoryDisposables.add(textModel.onDidChangeContent(() => {
                input.setValue(textModel.getValue(), true);
                updatePlaceholderVisibility();
                triggerValidation();
            }));
            updatePlaceholderVisibility();
            // Update placeholder text
            const updatePlaceholderText = () => {
                const binding = this.keybindingService.lookupKeybinding('scm.acceptInput');
                const label = binding ? binding.getLabel() : (platform.isMacintosh ? 'Cmd+Enter' : 'Ctrl+Enter');
                const placeholderText = (0, strings_1.format)(input.placeholder, label);
                this.inputEditor.updateOptions({ ariaLabel: placeholderText });
                this.placeholderTextContainer.textContent = placeholderText;
            };
            this.repositoryDisposables.add(input.onDidChangePlaceholder(updatePlaceholderText));
            this.repositoryDisposables.add(this.keybindingService.onDidUpdateKeybindings(updatePlaceholderText));
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
            this.repositoryDisposables.add(input.repository.provider.onDidChangeCommitTemplate(updateTemplate, this));
            updateTemplate();
            // Update input enablement
            const updateEnablement = (enabled) => {
                this.inputEditor.updateOptions({ readOnly: !enabled });
            };
            this.repositoryDisposables.add(input.onDidChangeEnablement(enabled => updateEnablement(enabled)));
            updateEnablement(input.enabled);
        }
        get selections() {
            return this.inputEditor.getSelections();
        }
        set selections(selections) {
            if (selections) {
                this.inputEditor.setSelections(selections);
            }
        }
        setValidation(validation, options) {
            if (this._validationTimer) {
                clearTimeout(this._validationTimer);
                this._validationTimer = 0;
            }
            this.validation = validation;
            this.renderValidation();
            if (options?.focus && !this.hasFocus()) {
                this.focus();
            }
            if (validation && options?.timeout) {
                this._validationTimer = setTimeout(() => this.setValidation(undefined), SCMInputWidget_1.ValidationTimeouts[validation.type]);
            }
        }
        constructor(container, overflowWidgetsDomNode, contextKeyService, modelService, textModelService, keybindingService, configurationService, instantiationService, scmViewService, contextViewService, openerService) {
            this.modelService = modelService;
            this.textModelService = textModelService;
            this.keybindingService = keybindingService;
            this.configurationService = configurationService;
            this.instantiationService = instantiationService;
            this.scmViewService = scmViewService;
            this.contextViewService = contextViewService;
            this.openerService = openerService;
            this.defaultInputFontFamily = style_1.DEFAULT_FONT_FAMILY;
            this.disposables = new lifecycle_1.DisposableStore();
            this.repositoryDisposables = new lifecycle_1.DisposableStore();
            this.validationDisposable = lifecycle_1.Disposable.None;
            this.validationHasFocus = false;
            // This is due to "Setup height change listener on next tick" above
            // https://github.com/microsoft/vscode/issues/108067
            this.lastLayoutWasTrash = false;
            this.shouldFocusAfterLayout = false;
            this.element = (0, dom_1.append)(container, (0, dom_1.$)('.scm-editor'));
            this.editorContainer = (0, dom_1.append)(this.element, (0, dom_1.$)('.scm-editor-container'));
            this.placeholderTextContainer = (0, dom_1.append)(this.editorContainer, (0, dom_1.$)('.scm-editor-placeholder'));
            const fontFamily = this.getInputEditorFontFamily();
            const fontSize = this.getInputEditorFontSize();
            const lineHeight = this.computeLineHeight(fontSize);
            this.setPlaceholderFontStyles(fontFamily, fontSize, lineHeight);
            const contextKeyService2 = contextKeyService.createScoped(this.element);
            this.repositoryIdContextKey = contextKeyService2.createKey('scmRepository', undefined);
            const editorOptions = {
                ...(0, simpleEditorOptions_1.getSimpleEditorOptions)(configurationService),
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
                    colorDetector_1.ColorDetector.ID,
                    contextmenu_1.ContextMenuController.ID,
                    dnd_1.DragAndDropController.ID,
                    dropIntoEditorController_1.DropIntoEditorController.ID,
                    links_1.LinkDetector.ID,
                    menuPreventer_1.MenuPreventer.ID,
                    messageController_1.MessageController.ID,
                    hover_1.ModesHoverController.ID,
                    selectionClipboard_1.SelectionClipboardContributionID,
                    snippetController2_1.SnippetController2.ID,
                    suggestController_1.SuggestController.ID,
                    inlineCompletionsController_1.InlineCompletionsController.ID,
                    codeActionController_1.CodeActionController.ID,
                    formatActions_1.FormatOnType.ID
                ])
            };
            const services = new serviceCollection_1.ServiceCollection([contextkey_1.IContextKeyService, contextKeyService2]);
            const instantiationService2 = instantiationService.createChild(services);
            this.inputEditor = instantiationService2.createInstance(codeEditorWidget_1.CodeEditorWidget, this.editorContainer, editorOptions, codeEditorWidgetOptions);
            this.disposables.add(this.inputEditor);
            this.disposables.add(this.inputEditor.onDidFocusEditorText(() => {
                if (this.input?.repository) {
                    this.scmViewService.focus(this.input.repository);
                }
                this.editorContainer.classList.add('synthetic-focus');
                this.renderValidation();
            }));
            this.disposables.add(this.inputEditor.onDidBlurEditorText(() => {
                this.editorContainer.classList.remove('synthetic-focus');
                setTimeout(() => {
                    if (!this.validation || !this.validationHasFocus) {
                        this.clearValidation();
                    }
                }, 0);
            }));
            const firstLineKey = contextKeyService2.createKey('scmInputIsInFirstPosition', false);
            const lastLineKey = contextKeyService2.createKey('scmInputIsInLastPosition', false);
            this.disposables.add(this.inputEditor.onDidChangeCursorPosition(({ position }) => {
                const viewModel = this.inputEditor._getViewModel();
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
            const onRelevantSettingChanged = event_1.Event.filter(this.configurationService.onDidChangeConfiguration, (e) => {
                for (const setting of relevantSettings) {
                    if (e.affectsConfiguration(setting)) {
                        return true;
                    }
                }
                return false;
            }, this.disposables);
            this.disposables.add(onRelevantSettingChanged(() => {
                const fontFamily = this.getInputEditorFontFamily();
                const fontSize = this.getInputEditorFontSize();
                const lineHeight = this.computeLineHeight(fontSize);
                const accessibilitySupport = this.configurationService.getValue('editor.accessibilitySupport');
                const cursorBlinking = this.configurationService.getValue('editor.cursorBlinking');
                this.inputEditor.updateOptions({
                    fontFamily: fontFamily,
                    fontSize: fontSize,
                    lineHeight: lineHeight,
                    accessibilitySupport,
                    cursorBlinking
                });
                this.setPlaceholderFontStyles(fontFamily, fontSize, lineHeight);
            }));
            this.onDidChangeContentHeight = event_1.Event.signal(event_1.Event.filter(this.inputEditor.onDidContentSizeChange, e => e.contentHeightChanged, this.disposables));
        }
        getContentHeight() {
            const editorContentHeight = this.inputEditor.getContentHeight();
            return Math.min(editorContentHeight, 134);
        }
        layout() {
            const editorHeight = this.getContentHeight();
            const dimension = new dom_1.Dimension(this.element.clientWidth - 2, editorHeight);
            if (dimension.width < 0) {
                this.lastLayoutWasTrash = true;
                return;
            }
            this.lastLayoutWasTrash = false;
            this.inputEditor.layout(dimension);
            this.renderValidation();
            if (this.shouldFocusAfterLayout) {
                this.shouldFocusAfterLayout = false;
                this.focus();
            }
        }
        focus() {
            if (this.lastLayoutWasTrash) {
                this.lastLayoutWasTrash = false;
                this.shouldFocusAfterLayout = true;
                return;
            }
            this.inputEditor.focus();
            this.editorContainer.classList.add('synthetic-focus');
        }
        hasFocus() {
            return this.inputEditor.hasTextFocus();
        }
        renderValidation() {
            this.clearValidation();
            this.editorContainer.classList.toggle('validation-info', this.validation?.type === 2 /* InputValidationType.Information */);
            this.editorContainer.classList.toggle('validation-warning', this.validation?.type === 1 /* InputValidationType.Warning */);
            this.editorContainer.classList.toggle('validation-error', this.validation?.type === 0 /* InputValidationType.Error */);
            if (!this.validation || !this.inputEditor.hasTextFocus()) {
                return;
            }
            const disposables = new lifecycle_1.DisposableStore();
            this.validationDisposable = this.contextViewService.showContextView({
                getAnchor: () => this.editorContainer,
                render: container => {
                    this.editorContainer.style.borderBottomLeftRadius = '0';
                    this.editorContainer.style.borderBottomRightRadius = '0';
                    const validationContainer = (0, dom_1.append)(container, (0, dom_1.$)('.scm-editor-validation-container'));
                    validationContainer.classList.toggle('validation-info', this.validation.type === 2 /* InputValidationType.Information */);
                    validationContainer.classList.toggle('validation-warning', this.validation.type === 1 /* InputValidationType.Warning */);
                    validationContainer.classList.toggle('validation-error', this.validation.type === 0 /* InputValidationType.Error */);
                    validationContainer.style.width = `${this.editorContainer.clientWidth + 2}px`;
                    const element = (0, dom_1.append)(validationContainer, (0, dom_1.$)('.scm-editor-validation'));
                    const message = this.validation.message;
                    if (typeof message === 'string') {
                        element.textContent = message;
                    }
                    else {
                        const tracker = (0, dom_1.trackFocus)(element);
                        disposables.add(tracker);
                        disposables.add(tracker.onDidFocus(() => (this.validationHasFocus = true)));
                        disposables.add(tracker.onDidBlur(() => {
                            this.validationHasFocus = false;
                            this.editorContainer.style.borderBottomLeftRadius = '2px';
                            this.editorContainer.style.borderBottomRightRadius = '2px';
                            this.contextViewService.hideContextView();
                        }));
                        const renderer = disposables.add(this.instantiationService.createInstance(markdownRenderer_1.MarkdownRenderer, {}));
                        const renderedMarkdown = renderer.render(message, {
                            actionHandler: {
                                callback: (link) => {
                                    (0, markdownRenderer_1.openLinkFromMarkdown)(this.openerService, link, message.isTrusted);
                                    this.editorContainer.style.borderBottomLeftRadius = '2px';
                                    this.editorContainer.style.borderBottomRightRadius = '2px';
                                    this.contextViewService.hideContextView();
                                },
                                disposables: disposables
                            },
                        });
                        disposables.add(renderedMarkdown);
                        element.appendChild(renderedMarkdown.element);
                    }
                    const actionsContainer = (0, dom_1.append)(validationContainer, (0, dom_1.$)('.scm-editor-validation-actions'));
                    const actionbar = new actionbar_1.ActionBar(actionsContainer);
                    const action = new actions_2.Action('scmInputWidget.validationMessage.close', (0, nls_1.localize)('label.close', "Close"), themables_1.ThemeIcon.asClassName(codicons_1.Codicon.close), true, () => {
                        this.contextViewService.hideContextView();
                        this.editorContainer.style.borderBottomLeftRadius = '2px';
                        this.editorContainer.style.borderBottomRightRadius = '2px';
                    });
                    disposables.add(actionbar);
                    actionbar.push(action, { icon: true, label: false });
                    return lifecycle_1.Disposable.None;
                },
                onHide: () => {
                    this.validationHasFocus = false;
                    this.editorContainer.style.borderBottomLeftRadius = '2px';
                    this.editorContainer.style.borderBottomRightRadius = '2px';
                    disposables.dispose();
                },
                anchorAlignment: 0 /* AnchorAlignment.LEFT */
            });
        }
        getInputEditorFontFamily() {
            const inputFontFamily = this.configurationService.getValue('scm.inputFontFamily').trim();
            if (inputFontFamily.toLowerCase() === 'editor') {
                return this.configurationService.getValue('editor.fontFamily').trim();
            }
            if (inputFontFamily.length !== 0 && inputFontFamily.toLowerCase() !== 'default') {
                return inputFontFamily;
            }
            return this.defaultInputFontFamily;
        }
        getInputEditorFontSize() {
            return this.configurationService.getValue('scm.inputFontSize');
        }
        computeLineHeight(fontSize) {
            return Math.round(fontSize * 1.5);
        }
        setPlaceholderFontStyles(fontFamily, fontSize, lineHeight) {
            this.placeholderTextContainer.style.fontFamily = fontFamily;
            this.placeholderTextContainer.style.fontSize = `${fontSize}px`;
            this.placeholderTextContainer.style.lineHeight = `${lineHeight}px`;
        }
        clearValidation() {
            this.validationDisposable.dispose();
            this.validationHasFocus = false;
        }
        dispose() {
            this.setInput(undefined);
            this.repositoryDisposables.dispose();
            this.clearValidation();
            this.disposables.dispose();
        }
    };
    SCMInputWidget = SCMInputWidget_1 = __decorate([
        __param(2, contextkey_1.IContextKeyService),
        __param(3, model_1.IModelService),
        __param(4, resolverService_1.ITextModelService),
        __param(5, keybinding_1.IKeybindingService),
        __param(6, configuration_1.IConfigurationService),
        __param(7, instantiation_1.IInstantiationService),
        __param(8, scm_1.ISCMViewService),
        __param(9, contextView_1.IContextViewService),
        __param(10, opener_1.IOpenerService)
    ], SCMInputWidget);
    let SCMViewPane = class SCMViewPane extends viewPane_1.ViewPane {
        get viewModel() { return this._viewModel; }
        constructor(options, scmService, scmViewService, keybindingService, themeService, contextMenuService, commandService, editorService, instantiationService, viewDescriptorService, configurationService, contextKeyService, menuService, openerService, telemetryService) {
            super({ ...options, titleMenuId: actions_1.MenuId.SCMTitle }, keybindingService, contextMenuService, configurationService, contextKeyService, viewDescriptorService, instantiationService, openerService, themeService, telemetryService);
            this.scmService = scmService;
            this.scmViewService = scmViewService;
            this.commandService = commandService;
            this.editorService = editorService;
            this.menuService = menuService;
            this.disposables = new lifecycle_1.DisposableStore();
            this._onDidLayout = new event_1.Emitter();
            this.layoutCache = {
                height: undefined,
                width: undefined,
                onDidChange: this._onDidLayout.event
            };
            this._register(this.instantiationService.createInstance(ScmInputContentProvider));
            this._register(event_1.Event.any(this.scmService.onDidAddRepository, this.scmService.onDidRemoveRepository)(() => this._onDidChangeViewWelcomeState.fire()));
        }
        renderBody(container) {
            super.renderBody(container);
            // List
            this.listContainer = (0, dom_1.append)(container, (0, dom_1.$)('.scm-view.show-file-icons'));
            const overflowWidgetsDomNode = (0, dom_1.$)('.scm-overflow-widgets-container.monaco-editor');
            const updateActionsVisibility = () => this.listContainer.classList.toggle('show-actions', this.configurationService.getValue('scm.alwaysShowActions'));
            this._register(event_1.Event.filter(this.configurationService.onDidChangeConfiguration, e => e.affectsConfiguration('scm.alwaysShowActions'), this.disposables)(updateActionsVisibility));
            updateActionsVisibility();
            const updateProviderCountVisibility = () => {
                const value = this.configurationService.getValue('scm.providerCountBadge');
                this.listContainer.classList.toggle('hide-provider-counts', value === 'hidden');
                this.listContainer.classList.toggle('auto-provider-counts', value === 'auto');
            };
            this._register(event_1.Event.filter(this.configurationService.onDidChangeConfiguration, e => e.affectsConfiguration('scm.providerCountBadge'), this.disposables)(updateProviderCountVisibility));
            updateProviderCountVisibility();
            this.inputRenderer = this.instantiationService.createInstance(InputRenderer, this.layoutCache, overflowWidgetsDomNode, (input, height) => this.tree.updateElementHeight(input, height));
            const delegate = new ListDelegate(this.inputRenderer);
            this.actionButtonRenderer = this.instantiationService.createInstance(ActionButtonRenderer);
            this.listLabels = this.instantiationService.createInstance(labels_1.ResourceLabels, { onDidChangeVisibility: this.onDidChangeBodyVisibility });
            this._register(this.listLabels);
            const actionRunner = new RepositoryPaneActionRunner(() => this.getSelectedResources());
            this._register(actionRunner);
            this._register(actionRunner.onWillRun(() => this.tree.domFocus()));
            const renderers = [
                this.instantiationService.createInstance(scmRepositoryRenderer_1.RepositoryRenderer, (0, util_1.getActionViewItemProvider)(this.instantiationService)),
                this.inputRenderer,
                this.actionButtonRenderer,
                this.instantiationService.createInstance(ResourceGroupRenderer, (0, util_1.getActionViewItemProvider)(this.instantiationService)),
                this._register(this.instantiationService.createInstance(ResourceRenderer, () => this._viewModel, this.listLabels, (0, util_1.getActionViewItemProvider)(this.instantiationService), actionRunner))
            ];
            const filter = new SCMTreeFilter();
            const sorter = new SCMTreeSorter(() => this._viewModel);
            const keyboardNavigationLabelProvider = this.instantiationService.createInstance(SCMTreeKeyboardNavigationLabelProvider, () => this._viewModel);
            const identityProvider = new SCMResourceIdentityProvider();
            const dnd = new SCMTreeDragAndDrop(this.instantiationService);
            this.tree = this.instantiationService.createInstance(listService_1.WorkbenchCompressibleObjectTree, 'SCM Tree Repo', this.listContainer, delegate, renderers, {
                transformOptimization: false,
                identityProvider,
                dnd,
                horizontalScrolling: false,
                setRowLineHeight: false,
                filter,
                sorter,
                keyboardNavigationLabelProvider,
                overrideStyles: {
                    listBackground: this.viewDescriptorService.getViewLocationById(this.id) === 1 /* ViewContainerLocation.Panel */ ? theme_1.PANEL_BACKGROUND : theme_1.SIDE_BAR_BACKGROUND
                },
                accessibilityProvider: this.instantiationService.createInstance(SCMAccessibilityProvider)
            });
            this._register(this.tree.onDidOpen(this.open, this));
            this._register(this.tree.onContextMenu(this.onListContextMenu, this));
            this._register(this.tree.onDidScroll(this.inputRenderer.clearValidation, this.inputRenderer));
            this._register(this.tree);
            (0, dom_1.append)(this.listContainer, overflowWidgetsDomNode);
            this._register(this.instantiationService.createInstance(RepositoryVisibilityActionController));
            this._viewModel = this.instantiationService.createInstance(ViewModel, this.tree, this.inputRenderer);
            this._register(this._viewModel);
            this.listContainer.classList.add('file-icon-themable-tree');
            this.listContainer.classList.add('show-file-icons');
            this.updateIndentStyles(this.themeService.getFileIconTheme());
            this._register(this.themeService.onDidFileIconThemeChange(this.updateIndentStyles, this));
            this._register(this._viewModel.onDidChangeMode(this.onDidChangeMode, this));
            this._register(this.onDidChangeBodyVisibility(this._viewModel.setVisible, this._viewModel));
            this._register(event_1.Event.filter(this.configurationService.onDidChangeConfiguration, e => e.affectsConfiguration('scm.alwaysShowRepositories'), this.disposables)(this.updateActions, this));
            this.updateActions();
        }
        updateIndentStyles(theme) {
            this.listContainer.classList.toggle('list-view-mode', this._viewModel.mode === "list" /* ViewModelMode.List */);
            this.listContainer.classList.toggle('tree-view-mode', this._viewModel.mode === "tree" /* ViewModelMode.Tree */);
            this.listContainer.classList.toggle('align-icons-and-twisties', (this._viewModel.mode === "list" /* ViewModelMode.List */ && theme.hasFileIcons) || (theme.hasFileIcons && !theme.hasFolderIcons));
            this.listContainer.classList.toggle('hide-arrows', this._viewModel.mode === "tree" /* ViewModelMode.Tree */ && theme.hidesExplorerArrows === true);
        }
        onDidChangeMode() {
            this.updateIndentStyles(this.themeService.getFileIconTheme());
        }
        layoutBody(height = this.layoutCache.height, width = this.layoutCache.width) {
            if (height === undefined) {
                return;
            }
            if (width !== undefined) {
                super.layoutBody(height, width);
            }
            this.layoutCache.height = height;
            this.layoutCache.width = width;
            this._onDidLayout.fire();
            this.listContainer.style.height = `${height}px`;
            this.tree.layout(height, width);
        }
        focus() {
            super.focus();
            if (this.isExpanded()) {
                this._viewModel.focus();
            }
        }
        async open(e) {
            if (!e.element) {
                return;
            }
            else if ((0, util_1.isSCMRepository)(e.element)) {
                this.scmViewService.focus(e.element);
                return;
            }
            else if ((0, util_1.isSCMResourceGroup)(e.element)) {
                const provider = e.element.provider;
                const repository = iterator_1.Iterable.find(this.scmService.repositories, r => r.provider === provider);
                if (repository) {
                    this.scmViewService.focus(repository);
                }
                return;
            }
            else if (resourceTree_1.ResourceTree.isResourceNode(e.element)) {
                const provider = e.element.context.provider;
                const repository = iterator_1.Iterable.find(this.scmService.repositories, r => r.provider === provider);
                if (repository) {
                    this.scmViewService.focus(repository);
                }
                return;
            }
            else if ((0, util_1.isSCMInput)(e.element)) {
                this.scmViewService.focus(e.element.repository);
                const widget = this.inputRenderer.getRenderedInputWidget(e.element);
                if (widget) {
                    widget.focus();
                    this.tree.setFocus([], e.browserEvent);
                    const selection = this.tree.getSelection();
                    if (selection.length === 1 && selection[0] === e.element) {
                        setTimeout(() => this.tree.setSelection([]));
                    }
                }
                return;
            }
            else if ((0, util_1.isSCMActionButton)(e.element)) {
                this.scmViewService.focus(e.element.repository);
                // Focus the action button
                this.actionButtonRenderer.focusActionButton(e.element);
                this.tree.setFocus([], e.browserEvent);
                return;
            }
            // ISCMResource
            if (e.element.command?.id === editorCommands_1.API_OPEN_EDITOR_COMMAND_ID || e.element.command?.id === editorCommands_1.API_OPEN_DIFF_EDITOR_COMMAND_ID) {
                await this.commandService.executeCommand(e.element.command.id, ...(e.element.command.arguments || []), e);
            }
            else {
                await e.element.open(!!e.editorOptions.preserveFocus);
                if (e.editorOptions.pinned) {
                    const activeEditorPane = this.editorService.activeEditorPane;
                    activeEditorPane?.group.pinEditor(activeEditorPane.input);
                }
            }
            const provider = e.element.resourceGroup.provider;
            const repository = iterator_1.Iterable.find(this.scmService.repositories, r => r.provider === provider);
            if (repository) {
                this.scmViewService.focus(repository);
            }
        }
        onListContextMenu(e) {
            if (!e.element) {
                const menu = this.menuService.createMenu(Menus.ViewSort, this.contextKeyService);
                const actions = [];
                (0, menuEntryActionViewItem_1.createAndFillInContextMenuActions)(menu, undefined, actions);
                return this.contextMenuService.showContextMenu({
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
            if ((0, util_1.isSCMRepository)(element)) {
                const menus = this.scmViewService.menus.getRepositoryMenus(element.provider);
                const menu = menus.repositoryMenu;
                context = element.provider;
                actions = (0, util_1.collectContextMenuActions)(menu);
            }
            else if ((0, util_1.isSCMInput)(element) || (0, util_1.isSCMActionButton)(element)) {
                // noop
            }
            else if ((0, util_1.isSCMResourceGroup)(element)) {
                const menus = this.scmViewService.menus.getRepositoryMenus(element.provider);
                const menu = menus.getResourceGroupMenu(element);
                actions = (0, util_1.collectContextMenuActions)(menu);
            }
            else if (resourceTree_1.ResourceTree.isResourceNode(element)) {
                if (element.element) {
                    const menus = this.scmViewService.menus.getRepositoryMenus(element.element.resourceGroup.provider);
                    const menu = menus.getResourceMenu(element.element);
                    actions = (0, util_1.collectContextMenuActions)(menu);
                }
                else {
                    const menus = this.scmViewService.menus.getRepositoryMenus(element.context.provider);
                    const menu = menus.getResourceFolderMenu(element.context);
                    actions = (0, util_1.collectContextMenuActions)(menu);
                }
            }
            else {
                const menus = this.scmViewService.menus.getRepositoryMenus(element.resourceGroup.provider);
                const menu = menus.getResourceMenu(element);
                actions = (0, util_1.collectContextMenuActions)(menu);
            }
            const actionRunner = new RepositoryPaneActionRunner(() => this.getSelectedResources());
            actionRunner.onWillRun(() => this.tree.domFocus());
            this.contextMenuService.showContextMenu({
                getAnchor: () => e.anchor,
                getActions: () => actions,
                getActionsContext: () => context,
                actionRunner
            });
        }
        getSelectedResources() {
            return this.tree.getSelection()
                .filter(r => !!r && !(0, util_1.isSCMResourceGroup)(r));
        }
        shouldShowWelcome() {
            return this.scmService.repositoryCount === 0;
        }
        getActionsContext() {
            return this.scmViewService.visibleRepositories.length === 1 ? this.scmViewService.visibleRepositories[0].provider : undefined;
        }
        dispose() {
            this.disposables.dispose();
            super.dispose();
        }
    };
    exports.SCMViewPane = SCMViewPane;
    exports.SCMViewPane = SCMViewPane = __decorate([
        __param(1, scm_1.ISCMService),
        __param(2, scm_1.ISCMViewService),
        __param(3, keybinding_1.IKeybindingService),
        __param(4, themeService_1.IThemeService),
        __param(5, contextView_1.IContextMenuService),
        __param(6, commands_1.ICommandService),
        __param(7, editorService_1.IEditorService),
        __param(8, instantiation_1.IInstantiationService),
        __param(9, views_1.IViewDescriptorService),
        __param(10, configuration_1.IConfigurationService),
        __param(11, contextkey_1.IContextKeyService),
        __param(12, actions_1.IMenuService),
        __param(13, opener_1.IOpenerService),
        __param(14, telemetry_1.ITelemetryService)
    ], SCMViewPane);
    exports.scmProviderSeparatorBorderColor = (0, colorRegistry_1.registerColor)('scm.providerBorder', { dark: '#454545', light: '#C8C8C8', hcDark: colorRegistry_1.contrastBorder, hcLight: colorRegistry_1.contrastBorder }, (0, nls_1.localize)('scm.providerBorder', "SCM Provider separator border."));
    class SCMActionButton {
        constructor(container, contextMenuService, commandService, notificationService) {
            this.container = container;
            this.contextMenuService = contextMenuService;
            this.commandService = commandService;
            this.notificationService = notificationService;
            this.disposables = new lifecycle_1.MutableDisposable();
        }
        dispose() {
            this.disposables?.dispose();
        }
        setButton(button) {
            // Clear old button
            this.clear();
            if (!button) {
                return;
            }
            if (button.secondaryCommands?.length) {
                const actions = [];
                for (let index = 0; index < button.secondaryCommands.length; index++) {
                    const commands = button.secondaryCommands[index];
                    for (const command of commands) {
                        actions.push(new actions_2.Action(command.id, command.title, undefined, true, async () => await this.executeCommand(command.id, ...(command.arguments || []))));
                    }
                    if (commands.length) {
                        actions.push(new actions_2.Separator());
                    }
                }
                // Remove last separator
                actions.pop();
                // ButtonWithDropdown
                this.button = new button_1.ButtonWithDropdown(this.container, {
                    actions: actions,
                    addPrimaryActionToDropdown: false,
                    contextMenuProvider: this.contextMenuService,
                    title: button.command.tooltip,
                    supportIcons: true,
                    ...defaultStyles_1.defaultButtonStyles
                });
            }
            else {
                // Button
                this.button = new button_1.Button(this.container, { supportIcons: true, supportShortLabel: !!button.description, title: button.command.tooltip, ...defaultStyles_1.defaultButtonStyles });
            }
            this.button.enabled = button.enabled;
            this.button.label = button.command.title;
            if (this.button instanceof button_1.Button && button.description) {
                this.button.labelShort = button.description;
            }
            this.button.onDidClick(async () => await this.executeCommand(button.command.id, ...(button.command.arguments || [])), null, this.disposables.value);
            this.disposables.value.add(this.button);
        }
        focus() {
            this.button?.focus();
        }
        clear() {
            this.disposables.value = new lifecycle_1.DisposableStore();
            this.button = undefined;
            (0, dom_1.clearNode)(this.container);
        }
        async executeCommand(commandId, ...args) {
            try {
                await this.commandService.executeCommand(commandId, ...args);
            }
            catch (ex) {
                this.notificationService.error(ex);
            }
        }
    }
    exports.SCMActionButton = SCMActionButton;
    let ScmInputContentProvider = class ScmInputContentProvider extends lifecycle_1.Disposable {
        constructor(textModelService, _modelService, _languageService) {
            super();
            this._modelService = _modelService;
            this._languageService = _languageService;
            this._register(textModelService.registerTextModelContentProvider(network_1.Schemas.vscodeSourceControl, this));
        }
        async provideTextContent(resource) {
            const existing = this._modelService.getModel(resource);
            if (existing) {
                return existing;
            }
            return this._modelService.createModel('', this._languageService.createById('scminput'), resource);
        }
    };
    ScmInputContentProvider = __decorate([
        __param(0, resolverService_1.ITextModelService),
        __param(1, model_1.IModelService),
        __param(2, language_1.ILanguageService)
    ], ScmInputContentProvider);
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoic2NtVmlld1BhbmUuanMiLCJzb3VyY2VSb290IjoiZmlsZTovLy93b3Jrc3BhY2UvYXBwZmxvdy9zcmMvIiwic291cmNlcyI6WyJ2cy93b3JrYmVuY2gvY29udHJpYi9zY20vYnJvd3Nlci9zY21WaWV3UGFuZS50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7O2dHQUdnRzs7Ozs7Ozs7Ozs7Ozs7O0lBK0d6RixJQUFNLG9CQUFvQixHQUExQixNQUFNLG9CQUFvQjs7aUJBQ2hCLG1CQUFjLEdBQUcsRUFBRSxBQUFMLENBQU07aUJBRXBCLGdCQUFXLEdBQUcsY0FBYyxBQUFqQixDQUFrQjtRQUM3QyxJQUFJLFVBQVUsS0FBYSxPQUFPLHNCQUFvQixDQUFDLFdBQVcsQ0FBQyxDQUFDLENBQUM7UUFJckUsWUFDa0IsY0FBdUMsRUFDbkMsa0JBQStDLEVBQzlDLG1CQUFpRDtZQUY5QyxtQkFBYyxHQUFkLGNBQWMsQ0FBaUI7WUFDM0IsdUJBQWtCLEdBQWxCLGtCQUFrQixDQUFxQjtZQUN0Qyx3QkFBbUIsR0FBbkIsbUJBQW1CLENBQXNCO1lBTGhFLGtCQUFhLEdBQUcsSUFBSSxHQUFHLEVBQXFDLENBQUM7UUFNakUsQ0FBQztRQUVMLGNBQWMsQ0FBQyxTQUFzQjtZQUNwQyxPQUFPO1lBQ04sU0FBUyxDQUFDLGFBQWMsQ0FBQyxhQUFjLENBQUMsYUFBYSxDQUFDLG9CQUFvQixDQUFrQixDQUFDLFNBQVMsQ0FBQyxHQUFHLENBQUMsa0JBQWtCLENBQUMsQ0FBQztZQUVoSSxtREFBbUQ7WUFDbkQsU0FBUyxDQUFDLGFBQWMsQ0FBQyxhQUFjLENBQUMsU0FBUyxDQUFDLEdBQUcsQ0FBQyxnQkFBZ0IsRUFBRSxnQkFBZ0IsQ0FBQyxDQUFDO1lBRTFGLE1BQU0sZUFBZSxHQUFHLElBQUEsWUFBTSxFQUFDLFNBQVMsRUFBRSxJQUFBLE9BQUMsRUFBQyxtQkFBbUIsQ0FBQyxDQUFDLENBQUM7WUFDbEUsTUFBTSxZQUFZLEdBQUcsSUFBSSxlQUFlLENBQUMsZUFBZSxF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