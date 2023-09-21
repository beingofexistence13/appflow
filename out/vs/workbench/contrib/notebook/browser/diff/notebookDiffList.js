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
define(["require", "exports", "vs/base/browser/dom", "vs/base/browser/ui/list/listWidget", "vs/base/common/lifecycle", "vs/platform/configuration/common/configuration", "vs/platform/contextkey/common/contextkey", "vs/platform/instantiation/common/instantiation", "vs/platform/keybinding/common/keybinding", "vs/platform/list/browser/listService", "vs/platform/theme/common/themeService", "vs/workbench/contrib/notebook/browser/diff/notebookDiffEditorBrowser", "vs/workbench/contrib/notebook/browser/diff/diffComponents", "vs/editor/browser/widget/codeEditorWidget", "vs/editor/browser/widget/diffEditor/diffEditorWidget", "vs/platform/actions/common/actions", "vs/platform/contextview/browser/contextView", "vs/platform/notification/common/notification", "vs/workbench/contrib/notebook/browser/view/cellParts/cellActionView", "vs/editor/common/config/fontInfo", "vs/base/browser/browser", "vs/platform/actions/browser/toolbar", "vs/workbench/contrib/notebook/browser/diff/diffCellEditorOptions", "vs/platform/accessibility/common/accessibility", "vs/css!./notebookDiff"], function (require, exports, DOM, listWidget_1, lifecycle_1, configuration_1, contextkey_1, instantiation_1, keybinding_1, listService_1, themeService_1, notebookDiffEditorBrowser_1, diffComponents_1, codeEditorWidget_1, diffEditorWidget_1, actions_1, contextView_1, notification_1, cellActionView_1, fontInfo_1, browser_1, toolbar_1, diffCellEditorOptions_1, accessibility_1) {
    "use strict";
    var CellDiffSingleSideRenderer_1, CellDiffSideBySideRenderer_1;
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.NotebookTextDiffList = exports.NotebookMouseController = exports.CellDiffSideBySideRenderer = exports.CellDiffSingleSideRenderer = exports.NotebookCellTextDiffListDelegate = void 0;
    let NotebookCellTextDiffListDelegate = class NotebookCellTextDiffListDelegate {
        constructor(configurationService) {
            this.configurationService = configurationService;
            const editorOptions = this.configurationService.getValue('editor');
            this.lineHeight = fontInfo_1.BareFontInfo.createFromRawSettings(editorOptions, browser_1.PixelRatio.value).lineHeight;
        }
        getHeight(element) {
            return element.getHeight(this.lineHeight);
        }
        hasDynamicHeight(element) {
            return false;
        }
        getTemplateId(element) {
            switch (element.type) {
                case 'delete':
                case 'insert':
                    return CellDiffSingleSideRenderer.TEMPLATE_ID;
                case 'modified':
                case 'unchanged':
                    return CellDiffSideBySideRenderer.TEMPLATE_ID;
            }
        }
    };
    exports.NotebookCellTextDiffListDelegate = NotebookCellTextDiffListDelegate;
    exports.NotebookCellTextDiffListDelegate = NotebookCellTextDiffListDelegate = __decorate([
        __param(0, configuration_1.IConfigurationService)
    ], NotebookCellTextDiffListDelegate);
    let CellDiffSingleSideRenderer = class CellDiffSingleSideRenderer {
        static { CellDiffSingleSideRenderer_1 = this; }
        static { this.TEMPLATE_ID = 'cell_diff_single'; }
        constructor(notebookEditor, instantiationService) {
            this.notebookEditor = notebookEditor;
            this.instantiationService = instantiationService;
        }
        get templateId() {
            return CellDiffSingleSideRenderer_1.TEMPLATE_ID;
        }
        renderTemplate(container) {
            const body = DOM.$('.cell-body');
            DOM.append(container, body);
            const diffEditorContainer = DOM.$('.cell-diff-editor-container');
            DOM.append(body, diffEditorContainer);
            const diagonalFill = DOM.append(body, DOM.$('.diagonal-fill'));
            const sourceContainer = DOM.append(diffEditorContainer, DOM.$('.source-container'));
            const editor = this._buildSourceEditor(sourceContainer);
            const metadataHeaderContainer = DOM.append(diffEditorContainer, DOM.$('.metadata-header-container'));
            const metadataInfoContainer = DOM.append(diffEditorContainer, DOM.$('.metadata-info-container'));
            const outputHeaderContainer = DOM.append(diffEditorContainer, DOM.$('.output-header-container'));
            const outputInfoContainer = DOM.append(diffEditorContainer, DOM.$('.output-info-container'));
            const borderContainer = DOM.append(body, DOM.$('.border-container'));
            const leftBorder = DOM.append(borderContainer, DOM.$('.left-border'));
            const rightBorder = DOM.append(borderContainer, DOM.$('.right-border'));
            const topBorder = DOM.append(borderContainer, DOM.$('.top-border'));
            const bottomBorder = DOM.append(borderContainer, DOM.$('.bottom-border'));
            return {
                body,
                container,
                diffEditorContainer,
                diagonalFill,
                sourceEditor: editor,
                metadataHeaderContainer,
                metadataInfoContainer,
                outputHeaderContainer,
                outputInfoContainer,
                leftBorder,
                rightBorder,
                topBorder,
                bottomBorder,
                elementDisposables: new lifecycle_1.DisposableStore()
            };
        }
        _buildSourceEditor(sourceContainer) {
            const editorContainer = DOM.append(sourceContainer, DOM.$('.editor-container'));
            const editor = this.instantiationService.createInstance(codeEditorWidget_1.CodeEditorWidget, editorContainer, {
                ...diffCellEditorOptions_1.fixedEditorOptions,
                dimension: {
                    width: (this.notebookEditor.getLayoutInfo().width - 2 * notebookDiffEditorBrowser_1.DIFF_CELL_MARGIN) / 2 - 18,
                    height: 0
                },
                automaticLayout: false,
                overflowWidgetsDomNode: this.notebookEditor.getOverflowContainerDomNode()
            }, {});
            return editor;
        }
        renderElement(element, index, templateData, height) {
            templateData.body.classList.remove('left', 'right', 'full');
            switch (element.type) {
                case 'delete':
                    templateData.elementDisposables.add(this.instantiationService.createInstance(diffComponents_1.DeletedElement, this.notebookEditor, element, templateData));
                    return;
                case 'insert':
                    templateData.elementDisposables.add(this.instantiationService.createInstance(diffComponents_1.InsertElement, this.notebookEditor, element, templateData));
                    return;
                default:
                    break;
            }
        }
        disposeTemplate(templateData) {
            templateData.container.innerText = '';
            templateData.sourceEditor.dispose();
            templateData.elementDisposables.dispose();
        }
        disposeElement(element, index, templateData) {
            templateData.elementDisposables.clear();
        }
    };
    exports.CellDiffSingleSideRenderer = CellDiffSingleSideRenderer;
    exports.CellDiffSingleSideRenderer = CellDiffSingleSideRenderer = CellDiffSingleSideRenderer_1 = __decorate([
        __param(1, instantiation_1.IInstantiationService)
    ], CellDiffSingleSideRenderer);
    let CellDiffSideBySideRenderer = class CellDiffSideBySideRenderer {
        static { CellDiffSideBySideRenderer_1 = this; }
        static { this.TEMPLATE_ID = 'cell_diff_side_by_side'; }
        constructor(notebookEditor, instantiationService, contextMenuService, keybindingService, menuService, contextKeyService, notificationService, themeService, accessibilityService) {
            this.notebookEditor = notebookEditor;
            this.instantiationService = instantiationService;
            this.contextMenuService = contextMenuService;
            this.keybindingService = keybindingService;
            this.menuService = menuService;
            this.contextKeyService = contextKeyService;
            this.notificationService = notificationService;
            this.themeService = themeService;
            this.accessibilityService = accessibilityService;
        }
        get templateId() {
            return CellDiffSideBySideRenderer_1.TEMPLATE_ID;
        }
        renderTemplate(container) {
            const body = DOM.$('.cell-body');
            DOM.append(container, body);
            const diffEditorContainer = DOM.$('.cell-diff-editor-container');
            DOM.append(body, diffEditorContainer);
            const sourceContainer = DOM.append(diffEditorContainer, DOM.$('.source-container'));
            const { editor, editorContainer } = this._buildSourceEditor(sourceContainer);
            const inputToolbarContainer = DOM.append(sourceContainer, DOM.$('.editor-input-toolbar-container'));
            const cellToolbarContainer = DOM.append(inputToolbarContainer, DOM.$('div.property-toolbar'));
            const toolbar = this.instantiationService.createInstance(toolbar_1.WorkbenchToolBar, cellToolbarContainer, {
                actionViewItemProvider: action => {
                    if (action instanceof actions_1.MenuItemAction) {
                        const item = new cellActionView_1.CodiconActionViewItem(action, undefined, this.keybindingService, this.notificationService, this.contextKeyService, this.themeService, this.contextMenuService, this.accessibilityService);
                        return item;
                    }
                    return undefined;
                }
            });
            const metadataHeaderContainer = DOM.append(diffEditorContainer, DOM.$('.metadata-header-container'));
            const metadataInfoContainer = DOM.append(diffEditorContainer, DOM.$('.metadata-info-container'));
            const outputHeaderContainer = DOM.append(diffEditorContainer, DOM.$('.output-header-container'));
            const outputInfoContainer = DOM.append(diffEditorContainer, DOM.$('.output-info-container'));
            const borderContainer = DOM.append(body, DOM.$('.border-container'));
            const leftBorder = DOM.append(borderContainer, DOM.$('.left-border'));
            const rightBorder = DOM.append(borderContainer, DOM.$('.right-border'));
            const topBorder = DOM.append(borderContainer, DOM.$('.top-border'));
            const bottomBorder = DOM.append(borderContainer, DOM.$('.bottom-border'));
            return {
                body,
                container,
                diffEditorContainer,
                sourceEditor: editor,
                editorContainer,
                inputToolbarContainer,
                toolbar,
                metadataHeaderContainer,
                metadataInfoContainer,
                outputHeaderContainer,
                outputInfoContainer,
                leftBorder,
                rightBorder,
                topBorder,
                bottomBorder,
                elementDisposables: new lifecycle_1.DisposableStore()
            };
        }
        _buildSourceEditor(sourceContainer) {
            const editorContainer = DOM.append(sourceContainer, DOM.$('.editor-container'));
            const editor = this.instantiationService.createInstance(diffEditorWidget_1.DiffEditorWidget, editorContainer, {
                ...diffCellEditorOptions_1.fixedDiffEditorOptions,
                padding: {
                    top: 24,
                    bottom: 12
                },
                overflowWidgetsDomNode: this.notebookEditor.getOverflowContainerDomNode(),
                originalEditable: false,
                ignoreTrimWhitespace: false,
                automaticLayout: false,
                dimension: {
                    height: 0,
                    width: 0
                }
            }, {
                originalEditor: (0, diffComponents_1.getOptimizedNestedCodeEditorWidgetOptions)(),
                modifiedEditor: (0, diffComponents_1.getOptimizedNestedCodeEditorWidgetOptions)()
            });
            return {
                editor,
                editorContainer
            };
        }
        renderElement(element, index, templateData, height) {
            templateData.body.classList.remove('left', 'right', 'full');
            switch (element.type) {
                case 'unchanged':
                    templateData.elementDisposables.add(this.instantiationService.createInstance(diffComponents_1.ModifiedElement, this.notebookEditor, element, templateData));
                    return;
                case 'modified':
                    templateData.elementDisposables.add(this.instantiationService.createInstance(diffComponents_1.ModifiedElement, this.notebookEditor, element, templateData));
                    return;
                default:
                    break;
            }
        }
        disposeTemplate(templateData) {
            templateData.container.innerText = '';
            templateData.sourceEditor.dispose();
            templateData.toolbar?.dispose();
            templateData.elementDisposables.dispose();
        }
        disposeElement(element, index, templateData) {
            if (templateData.toolbar) {
                templateData.toolbar.context = undefined;
            }
            templateData.elementDisposables.clear();
        }
    };
    exports.CellDiffSideBySideRenderer = CellDiffSideBySideRenderer;
    exports.CellDiffSideBySideRenderer = CellDiffSideBySideRenderer = CellDiffSideBySideRenderer_1 = __decorate([
        __param(1, instantiation_1.IInstantiationService),
        __param(2, contextView_1.IContextMenuService),
        __param(3, keybinding_1.IKeybindingService),
        __param(4, actions_1.IMenuService),
        __param(5, contextkey_1.IContextKeyService),
        __param(6, notification_1.INotificationService),
        __param(7, themeService_1.IThemeService),
        __param(8, accessibility_1.IAccessibilityService)
    ], CellDiffSideBySideRenderer);
    class NotebookMouseController extends listWidget_1.MouseController {
        onViewPointer(e) {
            if ((0, listWidget_1.isMonacoEditor)(e.browserEvent.target)) {
                const focus = typeof e.index === 'undefined' ? [] : [e.index];
                this.list.setFocus(focus, e.browserEvent);
            }
            else {
                super.onViewPointer(e);
            }
        }
    }
    exports.NotebookMouseController = NotebookMouseController;
    let NotebookTextDiffList = class NotebookTextDiffList extends listService_1.WorkbenchList {
        get rowsContainer() {
            return this.view.containerDomNode;
        }
        constructor(listUser, container, delegate, renderers, contextKeyService, options, listService, configurationService, instantiationService) {
            super(listUser, container, delegate, renderers, options, contextKeyService, listService, configurationService, instantiationService);
        }
        createMouseController(options) {
            return new NotebookMouseController(this);
        }
        getCellViewScrollTop(element) {
            const index = this.indexOf(element);
            // if (index === undefined || index < 0 || index >= this.length) {
            // 	this._getViewIndexUpperBound(element);
            // 	throw new ListError(this.listUser, `Invalid index ${index}`);
            // }
            return this.view.elementTop(index);
        }
        getScrollHeight() {
            return this.view.scrollHeight;
        }
        triggerScrollFromMouseWheelEvent(browserEvent) {
            this.view.delegateScrollFromMouseWheelEvent(browserEvent);
        }
        delegateVerticalScrollbarPointerDown(browserEvent) {
            this.view.delegateVerticalScrollbarPointerDown(browserEvent);
        }
        clear() {
            super.splice(0, this.length);
        }
        updateElementHeight2(element, size) {
            const viewIndex = this.indexOf(element);
            const focused = this.getFocus();
            this.view.updateElementHeight(viewIndex, size, focused.length ? focused[0] : null);
        }
        style(styles) {
            const selectorSuffix = this.view.domId;
            if (!this.styleElement) {
                this.styleElement = DOM.createStyleSheet(this.view.domNode);
            }
            const suffix = selectorSuffix && `.${selectorSuffix}`;
            const content = [];
            if (styles.listBackground) {
                content.push(`.monaco-list${suffix} > div.monaco-scrollable-element > .monaco-list-rows { background: ${styles.listBackground}; }`);
            }
            if (styles.listFocusBackground) {
                content.push(`.monaco-list${suffix}:focus > div.monaco-scrollable-element > .monaco-list-rows > .monaco-list-row.focused { background-color: ${styles.listFocusBackground}; }`);
                content.push(`.monaco-list${suffix}:focus > div.monaco-scrollable-element > .monaco-list-rows > .monaco-list-row.focused:hover { background-color: ${styles.listFocusBackground}; }`); // overwrite :hover style in this case!
            }
            if (styles.listFocusForeground) {
                content.push(`.monaco-list${suffix}:focus > div.monaco-scrollable-element > .monaco-list-rows > .monaco-list-row.focused { color: ${styles.listFocusForeground}; }`);
            }
            if (styles.listActiveSelectionBackground) {
                content.push(`.monaco-list${suffix}:focus > div.monaco-scrollable-element > .monaco-list-rows > .monaco-list-row.selected { background-color: ${styles.listActiveSelectionBackground}; }`);
                content.push(`.monaco-list${suffix}:focus > div.monaco-scrollable-element > .monaco-list-rows > .monaco-list-row.selected:hover { background-color: ${styles.listActiveSelectionBackground}; }`); // overwrite :hover style in this case!
            }
            if (styles.listActiveSelectionForeground) {
                content.push(`.monaco-list${suffix}:focus > div.monaco-scrollable-element > .monaco-list-rows > .monaco-list-row.selected { color: ${styles.listActiveSelectionForeground}; }`);
            }
            if (styles.listFocusAndSelectionBackground) {
                content.push(`
				.monaco-drag-image,
				.monaco-list${suffix}:focus > div.monaco-scrollable-element > .monaco-list-rows > .monaco-list-row.selected.focused { background-color: ${styles.listFocusAndSelectionBackground}; }
			`);
            }
            if (styles.listFocusAndSelectionForeground) {
                content.push(`
				.monaco-drag-image,
				.monaco-list${suffix}:focus > div.monaco-scrollable-element > .monaco-list-rows > .monaco-list-row.selected.focused { color: ${styles.listFocusAndSelectionForeground}; }
			`);
            }
            if (styles.listInactiveFocusBackground) {
                content.push(`.monaco-list${suffix} > div.monaco-scrollable-element > .monaco-list-rows > .monaco-list-row.focused { background-color:  ${styles.listInactiveFocusBackground}; }`);
                content.push(`.monaco-list${suffix} > div.monaco-scrollable-element > .monaco-list-rows > .monaco-list-row.focused:hover { background-color:  ${styles.listInactiveFocusBackground}; }`); // overwrite :hover style in this case!
            }
            if (styles.listInactiveSelectionBackground) {
                content.push(`.monaco-list${suffix} > div.monaco-scrollable-element > .monaco-list-rows > .monaco-list-row.selected { background-color:  ${styles.listInactiveSelectionBackground}; }`);
                content.push(`.monaco-list${suffix} > div.monaco-scrollable-element > .monaco-list-rows > .monaco-list-row.selected:hover { background-color:  ${styles.listInactiveSelectionBackground}; }`); // overwrite :hover style in this case!
            }
            if (styles.listInactiveSelectionForeground) {
                content.push(`.monaco-list${suffix} > div.monaco-scrollable-element > .monaco-list-rows > .monaco-list-row.selected { color: ${styles.listInactiveSelectionForeground}; }`);
            }
            if (styles.listHoverBackground) {
                content.push(`.monaco-list${suffix}:not(.drop-target) > div.monaco-scrollable-element > .monaco-list-rows > .monaco-list-row:hover:not(.selected):not(.focused) { background-color:  ${styles.listHoverBackground}; }`);
            }
            if (styles.listHoverForeground) {
                content.push(`.monaco-list${suffix} > div.monaco-scrollable-element > .monaco-list-rows > .monaco-list-row:hover:not(.selected):not(.focused) { color:  ${styles.listHoverForeground}; }`);
            }
            if (styles.listSelectionOutline) {
                content.push(`.monaco-list${suffix} > div.monaco-scrollable-element > .monaco-list-rows > .monaco-list-row.selected { outline: 1px dotted ${styles.listSelectionOutline}; outline-offset: -1px; }`);
            }
            if (styles.listFocusOutline) {
                content.push(`
				.monaco-drag-image,
				.monaco-list${suffix}:focus > div.monaco-scrollable-element > .monaco-list-rows > .monaco-list-row.focused { outline: 1px solid ${styles.listFocusOutline}; outline-offset: -1px; }
			`);
            }
            if (styles.listInactiveFocusOutline) {
                content.push(`.monaco-list${suffix} > div.monaco-scrollable-element > .monaco-list-rows > .monaco-list-row.focused { outline: 1px dotted ${styles.listInactiveFocusOutline}; outline-offset: -1px; }`);
            }
            if (styles.listHoverOutline) {
                content.push(`.monaco-list${suffix} > div.monaco-scrollable-element > .monaco-list-rows > .monaco-list-row:hover { outline: 1px dashed ${styles.listHoverOutline}; outline-offset: -1px; }`);
            }
            if (styles.listDropBackground) {
                content.push(`
				.monaco-list${suffix}.drop-target,
				.monaco-list${suffix} > div.monaco-scrollable-element > .monaco-list-rows.drop-target,
				.monaco-list${suffix} > div.monaco-scrollable-element > .monaco-list-row.drop-target { background-color: ${styles.listDropBackground} !important; color: inherit !important; }
			`);
            }
            const newStyles = content.join('\n');
            if (newStyles !== this.styleElement.textContent) {
                this.styleElement.textContent = newStyles;
            }
        }
    };
    exports.NotebookTextDiffList = NotebookTextDiffList;
    exports.NotebookTextDiffList = NotebookTextDiffList = __decorate([
        __param(6, listService_1.IListService),
        __param(7, configuration_1.IConfigurationService),
        __param(8, instantiation_1.IInstantiationService)
    ], NotebookTextDiffList);
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibm90ZWJvb2tEaWZmTGlzdC5qcyIsInNvdXJjZVJvb3QiOiJmaWxlOi8vL3dvcmtzcGFjZS9hcHBmbG93L3NyYy8iLCJzb3VyY2VzIjpbInZzL3dvcmtiZW5jaC9jb250cmliL25vdGVib29rL2Jyb3dzZXIvZGlmZi9ub3RlYm9va0RpZmZMaXN0LnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOzs7Z0dBR2dHOzs7Ozs7Ozs7Ozs7Ozs7SUE4QnpGLElBQU0sZ0NBQWdDLEdBQXRDLE1BQU0sZ0NBQWdDO1FBRzVDLFlBQ3lDLG9CQUEyQztZQUEzQyx5QkFBb0IsR0FBcEIsb0JBQW9CLENBQXVCO1lBRW5GLE1BQU0sYUFBYSxHQUFHLElBQUksQ0FBQyxvQkFBb0IsQ0FBQyxRQUFRLENBQWlCLFFBQVEsQ0FBQyxDQUFDO1lBQ25GLElBQUksQ0FBQyxVQUFVLEdBQUcsdUJBQVksQ0FBQyxxQkFBcUIsQ0FBQyxhQUFhLEVBQUUsb0JBQVUsQ0FBQyxLQUFLLENBQUMsQ0FBQyxVQUFVLENBQUM7UUFDbEcsQ0FBQztRQUVELFNBQVMsQ0FBQyxPQUFpQztZQUMxQyxPQUFPLE9BQU8sQ0FBQyxTQUFTLENBQUMsSUFBSSxDQUFDLFVBQVUsQ0FBQyxDQUFDO1FBQzNDLENBQUM7UUFFRCxnQkFBZ0IsQ0FBQyxPQUFpQztZQUNqRCxPQUFPLEtBQUssQ0FBQztRQUNkLENBQUM7UUFFRCxhQUFhLENBQUMsT0FBaUM7WUFDOUMsUUFBUSxPQUFPLENBQUMsSUFBSSxFQUFFO2dCQUNyQixLQUFLLFFBQVEsQ0FBQztnQkFDZCxLQUFLLFFBQVE7b0JBQ1osT0FBTywwQkFBMEIsQ0FBQyxXQUFXLENBQUM7Z0JBQy9DLEtBQUssVUFBVSxDQUFDO2dCQUNoQixLQUFLLFdBQVc7b0JBQ2YsT0FBTywwQkFBMEIsQ0FBQyxXQUFXLENBQUM7YUFDL0M7UUFFRixDQUFDO0tBQ0QsQ0FBQTtJQTdCWSw0RUFBZ0M7K0NBQWhDLGdDQUFnQztRQUkxQyxXQUFBLHFDQUFxQixDQUFBO09BSlgsZ0NB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