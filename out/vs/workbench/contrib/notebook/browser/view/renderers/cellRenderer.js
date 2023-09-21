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
define(["require", "exports", "vs/base/browser/browser", "vs/base/browser/dom", "vs/base/browser/fastDomNode", "vs/base/common/lifecycle", "vs/editor/browser/widget/codeEditorWidget", "vs/editor/common/config/fontInfo", "vs/editor/common/editorContextKeys", "vs/editor/common/languages/modesRegistry", "vs/nls", "vs/platform/actions/common/actions", "vs/platform/configuration/common/configuration", "vs/platform/contextkey/common/contextkey", "vs/platform/contextview/browser/contextView", "vs/platform/instantiation/common/instantiation", "vs/platform/instantiation/common/serviceCollection", "vs/platform/keybinding/common/keybinding", "vs/platform/notification/common/notification", "vs/workbench/contrib/notebook/browser/view/cellPart", "vs/workbench/contrib/notebook/browser/view/cellParts/cellComments", "vs/workbench/contrib/notebook/browser/view/cellParts/cellContextKeys", "vs/workbench/contrib/notebook/browser/view/cellParts/cellDecorations", "vs/workbench/contrib/notebook/browser/view/cellParts/cellDnd", "vs/workbench/contrib/notebook/browser/view/cellParts/cellDragRenderer", "vs/workbench/contrib/notebook/browser/view/cellParts/cellEditorOptions", "vs/workbench/contrib/notebook/browser/view/cellParts/cellExecution", "vs/workbench/contrib/notebook/browser/view/cellParts/cellFocus", "vs/workbench/contrib/notebook/browser/view/cellParts/cellFocusIndicator", "vs/workbench/contrib/notebook/browser/view/cellParts/cellProgressBar", "vs/workbench/contrib/notebook/browser/view/cellParts/cellStatusPart", "vs/workbench/contrib/notebook/browser/view/cellParts/cellToolbars", "vs/workbench/contrib/notebook/browser/view/cellParts/codeCell", "vs/workbench/contrib/notebook/browser/view/cellParts/codeCellRunToolbar", "vs/workbench/contrib/notebook/browser/view/cellParts/collapsedCellInput", "vs/workbench/contrib/notebook/browser/view/cellParts/collapsedCellOutput", "vs/workbench/contrib/notebook/browser/view/cellParts/foldedCellHint", "vs/workbench/contrib/notebook/browser/view/cellParts/markupCell", "vs/workbench/contrib/notebook/common/notebookCommon"], function (require, exports, browser_1, DOM, fastDomNode_1, lifecycle_1, codeEditorWidget_1, fontInfo_1, editorContextKeys_1, modesRegistry_1, nls_1, actions_1, configuration_1, contextkey_1, contextView_1, instantiation_1, serviceCollection_1, keybinding_1, notification_1, cellPart_1, cellComments_1, cellContextKeys_1, cellDecorations_1, cellDnd_1, cellDragRenderer_1, cellEditorOptions_1, cellExecution_1, cellFocus_1, cellFocusIndicator_1, cellProgressBar_1, cellStatusPart_1, cellToolbars_1, codeCell_1, codeCellRunToolbar_1, collapsedCellInput_1, collapsedCellOutput_1, foldedCellHint_1, markupCell_1, notebookCommon_1) {
    "use strict";
    var MarkupCellRenderer_1, CodeCellRenderer_1;
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.CodeCellRenderer = exports.MarkupCellRenderer = exports.NotebookCellListDelegate = void 0;
    const $ = DOM.$;
    let NotebookCellListDelegate = class NotebookCellListDelegate extends lifecycle_1.Disposable {
        constructor(configurationService) {
            super();
            this.configurationService = configurationService;
            const editorOptions = this.configurationService.getValue('editor');
            this.lineHeight = fontInfo_1.BareFontInfo.createFromRawSettings(editorOptions, browser_1.PixelRatio.value).lineHeight;
        }
        getHeight(element) {
            return element.getHeight(this.lineHeight);
        }
        getDynamicHeight(element) {
            return element.getDynamicHeight();
        }
        getTemplateId(element) {
            if (element.cellKind === notebookCommon_1.CellKind.Markup) {
                return MarkupCellRenderer.TEMPLATE_ID;
            }
            else {
                return CodeCellRenderer.TEMPLATE_ID;
            }
        }
    };
    exports.NotebookCellListDelegate = NotebookCellListDelegate;
    exports.NotebookCellListDelegate = NotebookCellListDelegate = __decorate([
        __param(0, configuration_1.IConfigurationService)
    ], NotebookCellListDelegate);
    class AbstractCellRenderer {
        constructor(instantiationService, notebookEditor, contextMenuService, menuService, configurationService, keybindingService, notificationService, contextKeyServiceProvider, language, dndController) {
            this.instantiationService = instantiationService;
            this.notebookEditor = notebookEditor;
            this.contextMenuService = contextMenuService;
            this.menuService = menuService;
            this.keybindingService = keybindingService;
            this.notificationService = notificationService;
            this.contextKeyServiceProvider = contextKeyServiceProvider;
            this.dndController = dndController;
            this.editorOptions = new cellEditorOptions_1.CellEditorOptions(this.notebookEditor.getBaseCellEditorOptions(language), this.notebookEditor.notebookOptions, configurationService);
        }
        dispose() {
            this.editorOptions.dispose();
            this.dndController = undefined;
        }
    }
    let MarkupCellRenderer = class MarkupCellRenderer extends AbstractCellRenderer {
        static { MarkupCellRenderer_1 = this; }
        static { this.TEMPLATE_ID = 'markdown_cell'; }
        constructor(notebookEditor, dndController, renderedEditors, contextKeyServiceProvider, configurationService, instantiationService, contextMenuService, menuService, keybindingService, notificationService) {
            super(instantiationService, notebookEditor, contextMenuService, menuService, configurationService, keybindingService, notificationService, contextKeyServiceProvider, 'markdown', dndController);
            this.renderedEditors = renderedEditors;
        }
        get templateId() {
            return MarkupCellRenderer_1.TEMPLATE_ID;
        }
        renderTemplate(rootContainer) {
            rootContainer.classList.add('markdown-cell-row');
            const container = DOM.append(rootContainer, DOM.$('.cell-inner-container'));
            const templateDisposables = new lifecycle_1.DisposableStore();
            const contextKeyService = templateDisposables.add(this.contextKeyServiceProvider(container));
            const decorationContainer = DOM.append(rootContainer, $('.cell-decoration'));
            const titleToolbarContainer = DOM.append(container, $('.cell-title-toolbar'));
            const focusIndicatorTop = new fastDomNode_1.FastDomNode(DOM.append(container, $('.cell-focus-indicator.cell-focus-indicator-top')));
            const focusIndicatorLeft = new fastDomNode_1.FastDomNode(DOM.append(container, DOM.$('.cell-focus-indicator.cell-focus-indicator-side.cell-focus-indicator-left')));
            const foldingIndicator = DOM.append(focusIndicatorLeft.domNode, DOM.$('.notebook-folding-indicator'));
            const focusIndicatorRight = new fastDomNode_1.FastDomNode(DOM.append(container, DOM.$('.cell-focus-indicator.cell-focus-indicator-side.cell-focus-indicator-right')));
            const codeInnerContent = DOM.append(container, $('.cell.code'));
            const editorPart = DOM.append(codeInnerContent, $('.cell-editor-part'));
            const cellInputCollapsedContainer = DOM.append(codeInnerContent, $('.input-collapse-container'));
            cellInputCollapsedContainer.style.display = 'none';
            const editorContainer = DOM.append(editorPart, $('.cell-editor-container'));
            editorPart.style.display = 'none';
            const cellCommentPartContainer = DOM.append(container, $('.cell-comment-container'));
            const innerContent = DOM.append(container, $('.cell.markdown'));
            const bottomCellContainer = DOM.append(container, $('.cell-bottom-toolbar-container'));
            const scopedInstaService = this.instantiationService.createChild(new serviceCollection_1.ServiceCollection([contextkey_1.IContextKeyService, contextKeyService]));
            const rootClassDelegate = {
                toggle: (className, force) => container.classList.toggle(className, force)
            };
            const titleToolbar = templateDisposables.add(scopedInstaService.createInstance(cellToolbars_1.CellTitleToolbarPart, titleToolbarContainer, rootClassDelegate, this.notebookEditor.creationOptions.menuIds.cellTitleToolbar, this.notebookEditor.creationOptions.menuIds.cellDeleteToolbar, this.notebookEditor));
            const focusIndicatorBottom = new fastDomNode_1.FastDomNode(DOM.append(container, $('.cell-focus-indicator.cell-focus-indicator-bottom')));
            const cellParts = new cellPart_1.CellPartsCollection([
                templateDisposables.add(scopedInstaService.createInstance(cellStatusPart_1.CellEditorStatusBar, this.notebookEditor, container, editorPart, undefined)),
                templateDisposables.add(new cellFocusIndicator_1.CellFocusIndicator(this.notebookEditor, titleToolbar, focusIndicatorTop, focusIndicatorLeft, focusIndicatorRight, focusIndicatorBottom)),
                templateDisposables.add(new foldedCellHint_1.FoldedCellHint(this.notebookEditor, DOM.append(container, $('.notebook-folded-hint')))),
                templateDisposables.add(new cellDecorations_1.CellDecorations(rootContainer, decorationContainer)),
                templateDisposables.add(scopedInstaService.createInstance(cellComments_1.CellComments, this.notebookEditor, cellCommentPartContainer)),
                templateDisposables.add(new collapsedCellInput_1.CollapsedCellInput(this.notebookEditor, cellInputCollapsedContainer)),
                templateDisposables.add(new cellFocus_1.CellFocusPart(container, undefined, this.notebookEditor)),
                templateDisposables.add(new cellDnd_1.CellDragAndDropPart(container)),
                templateDisposables.add(scopedInstaService.createInstance(cellContextKeys_1.CellContextKeyPart, this.notebookEditor)),
            ], [
                titleToolbar,
                templateDisposables.add(scopedInstaService.createInstance(cellToolbars_1.BetweenCellToolbar, this.notebookEditor, titleToolbarContainer, bottomCellContainer))
            ]);
            templateDisposables.add(cellParts);
            const templateData = {
                rootContainer,
                cellInputCollapsedContainer,
                instantiationService: scopedInstaService,
                container,
                cellContainer: innerContent,
                editorPart,
                editorContainer,
                foldingIndicator,
                templateDisposables,
                elementDisposables: new lifecycle_1.DisposableStore(),
                cellParts,
                toJSON: () => { return {}; }
            };
            return templateData;
        }
        renderElement(element, index, templateData, height) {
            if (!this.notebookEditor.hasModel()) {
                throw new Error('The notebook editor is not attached with view model yet.');
            }
            templateData.currentRenderedCell = element;
            templateData.currentEditor = undefined;
            templateData.editorPart.style.display = 'none';
            templateData.cellContainer.innerText = '';
            if (height === undefined) {
                return;
            }
            templateData.elementDisposables.add(templateData.instantiationService.createInstance(markupCell_1.MarkupCell, this.notebookEditor, element, templateData, this.renderedEditors));
        }
        disposeTemplate(templateData) {
            templateData.elementDisposables.dispose();
            templateData.templateDisposables.dispose();
        }
        disposeElement(_element, _index, templateData) {
            templateData.elementDisposables.clear();
        }
    };
    exports.MarkupCellRenderer = MarkupCellRenderer;
    exports.MarkupCellRenderer = MarkupCellRenderer = MarkupCellRenderer_1 = __decorate([
        __param(4, configuration_1.IConfigurationService),
        __param(5, instantiation_1.IInstantiationService),
        __param(6, contextView_1.IContextMenuService),
        __param(7, actions_1.IMenuService),
        __param(8, keybinding_1.IKeybindingService),
        __param(9, notification_1.INotificationService)
    ], MarkupCellRenderer);
    let CodeCellRenderer = class CodeCellRenderer extends AbstractCellRenderer {
        static { CodeCellRenderer_1 = this; }
        static { this.TEMPLATE_ID = 'code_cell'; }
        constructor(notebookEditor, renderedEditors, dndController, contextKeyServiceProvider, configurationService, contextMenuService, menuService, instantiationService, keybindingService, notificationService) {
            super(instantiationService, notebookEditor, contextMenuService, menuService, configurationService, keybindingService, notificationService, contextKeyServiceProvider, modesRegistry_1.PLAINTEXT_LANGUAGE_ID, dndController);
            this.renderedEditors = renderedEditors;
        }
        get templateId() {
            return CodeCellRenderer_1.TEMPLATE_ID;
        }
        renderTemplate(rootContainer) {
            rootContainer.classList.add('code-cell-row');
            const container = DOM.append(rootContainer, DOM.$('.cell-inner-container'));
            const templateDisposables = new lifecycle_1.DisposableStore();
            const contextKeyService = templateDisposables.add(this.contextKeyServiceProvider(container));
            const decorationContainer = DOM.append(rootContainer, $('.cell-decoration'));
            const focusIndicatorTop = new fastDomNode_1.FastDomNode(DOM.append(container, $('.cell-focus-indicator.cell-focus-indicator-top')));
            const titleToolbarContainer = DOM.append(container, $('.cell-title-toolbar'));
            // This is also the drag handle
            const focusIndicatorLeft = new fastDomNode_1.FastDomNode(DOM.append(container, DOM.$('.cell-focus-indicator.cell-focus-indicator-side.cell-focus-indicator-left')));
            const cellContainer = DOM.append(container, $('.cell.code'));
            const runButtonContainer = DOM.append(cellContainer, $('.run-button-container'));
            const cellInputCollapsedContainer = DOM.append(cellContainer, $('.input-collapse-container'));
            cellInputCollapsedContainer.style.display = 'none';
            const executionOrderLabel = DOM.append(focusIndicatorLeft.domNode, $('div.execution-count-label'));
            executionOrderLabel.title = (0, nls_1.localize)('cellExecutionOrderCountLabel', 'Execution Order');
            const editorPart = DOM.append(cellContainer, $('.cell-editor-part'));
            const editorContainer = DOM.append(editorPart, $('.cell-editor-container'));
            const cellCommentPartContainer = DOM.append(container, $('.cell-comment-container'));
            // create a special context key service that set the inCompositeEditor-contextkey
            const editorContextKeyService = templateDisposables.add(this.contextKeyServiceProvider(editorPart));
            const editorInstaService = this.instantiationService.createChild(new serviceCollection_1.ServiceCollection([contextkey_1.IContextKeyService, editorContextKeyService]));
            editorContextKeys_1.EditorContextKeys.inCompositeEditor.bindTo(editorContextKeyService).set(true);
            const editor = editorInstaService.createInstance(codeEditorWidget_1.CodeEditorWidget, editorContainer, {
                ...this.editorOptions.getDefaultValue(),
                dimension: {
                    width: 0,
                    height: 0
                },
            }, {
                contributions: this.notebookEditor.creationOptions.cellEditorContributions
            });
            templateDisposables.add(editor);
            const outputContainer = new fastDomNode_1.FastDomNode(DOM.append(container, $('.output')));
            const cellOutputCollapsedContainer = DOM.append(outputContainer.domNode, $('.output-collapse-container'));
            const outputShowMoreContainer = new fastDomNode_1.FastDomNode(DOM.append(container, $('.output-show-more-container')));
            const focusIndicatorRight = new fastDomNode_1.FastDomNode(DOM.append(container, DOM.$('.cell-focus-indicator.cell-focus-indicator-side.cell-focus-indicator-right')));
            const focusSinkElement = DOM.append(container, $('.cell-editor-focus-sink'));
            focusSinkElement.setAttribute('tabindex', '0');
            const bottomCellToolbarContainer = DOM.append(container, $('.cell-bottom-toolbar-container'));
            const focusIndicatorBottom = new fastDomNode_1.FastDomNode(DOM.append(container, $('.cell-focus-indicator.cell-focus-indicator-bottom')));
            const scopedInstaService = this.instantiationService.createChild(new serviceCollection_1.ServiceCollection([contextkey_1.IContextKeyService, contextKeyService]));
            const rootClassDelegate = {
                toggle: (className, force) => container.classList.toggle(className, force)
            };
            const titleToolbar = templateDisposables.add(scopedInstaService.createInstance(cellToolbars_1.CellTitleToolbarPart, titleToolbarContainer, rootClassDelegate, this.notebookEditor.creationOptions.menuIds.cellTitleToolbar, this.notebookEditor.creationOptions.menuIds.cellDeleteToolbar, this.notebookEditor));
            const focusIndicatorPart = templateDisposables.add(new cellFocusIndicator_1.CellFocusIndicator(this.notebookEditor, titleToolbar, focusIndicatorTop, focusIndicatorLeft, focusIndicatorRight, focusIndicatorBottom));
            const cellParts = new cellPart_1.CellPartsCollection([
                focusIndicatorPart,
                templateDisposables.add(scopedInstaService.createInstance(cellStatusPart_1.CellEditorStatusBar, this.notebookEditor, container, editorPart, editor)),
                templateDisposables.add(scopedInstaService.createInstance(cellProgressBar_1.CellProgressBar, editorPart, cellInputCollapsedContainer)),
                templateDisposables.add(scopedInstaService.createInstance(codeCellRunToolbar_1.RunToolbar, this.notebookEditor, contextKeyService, container, runButtonContainer)),
                templateDisposables.add(new cellDecorations_1.CellDecorations(rootContainer, decorationContainer)),
                templateDisposables.add(scopedInstaService.createInstance(cellComments_1.CellComments, this.notebookEditor, cellCommentPartContainer)),
                templateDisposables.add(scopedInstaService.createInstance(cellExecution_1.CellExecutionPart, this.notebookEditor, executionOrderLabel)),
                templateDisposables.add(scopedInstaService.createInstance(collapsedCellOutput_1.CollapsedCellOutput, this.notebookEditor, cellOutputCollapsedContainer)),
                templateDisposables.add(new collapsedCellInput_1.CollapsedCellInput(this.notebookEditor, cellInputCollapsedContainer)),
                templateDisposables.add(new cellFocus_1.CellFocusPart(container, focusSinkElement, this.notebookEditor)),
                templateDisposables.add(new cellDnd_1.CellDragAndDropPart(container)),
                templateDisposables.add(scopedInstaService.createInstance(cellContextKeys_1.CellContextKeyPart, this.notebookEditor)),
            ], [
                titleToolbar,
                templateDisposables.add(scopedInstaService.createInstance(cellToolbars_1.BetweenCellToolbar, this.notebookEditor, titleToolbarContainer, bottomCellToolbarContainer))
            ]);
            templateDisposables.add(cellParts);
            const templateData = {
                rootContainer,
                editorPart,
                cellInputCollapsedContainer,
                cellOutputCollapsedContainer,
                instantiationService: scopedInstaService,
                container,
                cellContainer,
                focusSinkElement,
                outputContainer,
                outputShowMoreContainer,
                editor,
                templateDisposables,
                elementDisposables: new lifecycle_1.DisposableStore(),
                cellParts,
                toJSON: () => { return {}; }
            };
            // focusIndicatorLeft covers the left margin area
            // code/outputFocusIndicator need to be registered as drag handlers so their click handlers don't take over
            const dragHandles = [focusIndicatorLeft.domNode, focusIndicatorPart.codeFocusIndicator.domNode, focusIndicatorPart.outputFocusIndicator.domNode];
            this.dndController?.registerDragHandle(templateData, rootContainer, dragHandles, () => new cellDragRenderer_1.CodeCellDragImageRenderer().getDragImage(templateData, templateData.editor, 'code'));
            return templateData;
        }
        renderElement(element, index, templateData, height) {
            if (!this.notebookEditor.hasModel()) {
                throw new Error('The notebook editor is not attached with view model yet.');
            }
            templateData.currentRenderedCell = element;
            if (height === undefined) {
                return;
            }
            templateData.outputContainer.domNode.innerText = '';
            templateData.outputContainer.domNode.appendChild(templateData.cellOutputCollapsedContainer);
            templateData.elementDisposables.add(templateData.instantiationService.createInstance(codeCell_1.CodeCell, this.notebookEditor, element, templateData));
            this.renderedEditors.set(element, templateData.editor);
        }
        disposeTemplate(templateData) {
            templateData.templateDisposables.clear();
        }
        disposeElement(element, index, templateData, height) {
            templateData.elementDisposables.clear();
            this.renderedEditors.delete(element);
        }
    };
    exports.CodeCellRenderer = CodeCellRenderer;
    exports.CodeCellRenderer = CodeCellRenderer = CodeCellRenderer_1 = __decorate([
        __param(4, configuration_1.IConfigurationService),
        __param(5, contextView_1.IContextMenuService),
        __param(6, actions_1.IMenuService),
        __param(7, instantiation_1.IInstantiationService),
        __param(8, keybinding_1.IKeybindingService),
        __param(9, notification_1.INotificationService)
    ], CodeCellRenderer);
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY2VsbFJlbmRlcmVyLmpzIiwic291cmNlUm9vdCI6ImZpbGU6Ly8vd29ya3NwYWNlL2FwcGZsb3cvc3JjLyIsInNvdXJjZXMiOlsidnMvd29ya2JlbmNoL2NvbnRyaWIvbm90ZWJvb2svYnJvd3Nlci92aWV3L3JlbmRlcmVycy9jZWxsUmVuZGVyZXIudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7OztnR0FHZ0c7Ozs7Ozs7Ozs7Ozs7OztJQWdEaEcsTUFBTSxDQUFDLEdBQUcsR0FBRyxDQUFDLENBQUMsQ0FBQztJQUVULElBQU0sd0JBQXdCLEdBQTlCLE1BQU0sd0JBQXlCLFNBQVEsc0JBQVU7UUFHdkQsWUFDeUMsb0JBQTJDO1lBRW5GLEtBQUssRUFBRSxDQUFDO1lBRmdDLHlCQUFvQixHQUFwQixvQkFBb0IsQ0FBdUI7WUFJbkYsTUFBTSxhQUFhLEdBQUcsSUFBSSxDQUFDLG9CQUFvQixDQUFDLFFBQVEsQ0FBaUIsUUFBUSxDQUFDLENBQUM7WUFDbkYsSUFBSSxDQUFDLFVBQVUsR0FBRyx1QkFBWSxDQUFDLHFCQUFxQixDQUFDLGFBQWEsRUFBRSxvQkFBVSxDQUFDLEtBQUssQ0FBQyxDQUFDLFVBQVUsQ0FBQztRQUNsRyxDQUFDO1FBRUQsU0FBUyxDQUFDLE9BQXNCO1lBQy9CLE9BQU8sT0FBTyxDQUFDLFNBQVMsQ0FBQyxJQUFJLENBQUMsVUFBVSxDQUFDLENBQUM7UUFDM0MsQ0FBQztRQUVELGdCQUFnQixDQUFDLE9BQXNCO1lBQ3RDLE9BQU8sT0FBTyxDQUFDLGdCQUFnQixFQUFFLENBQUM7UUFDbkMsQ0FBQztRQUVELGFBQWEsQ0FBQyxPQUFzQjtZQUNuQyxJQUFJLE9BQU8sQ0FBQyxRQUFRLEtBQUsseUJBQVEsQ0FBQyxNQUFNLEVBQUU7Z0JBQ3pDLE9BQU8sa0JBQWtCLENBQUMsV0FBVyxDQUFDO2FBQ3RDO2lCQUFNO2dCQUNOLE9BQU8sZ0JBQWdCLENBQUMsV0FBVyxDQUFDO2FBQ3BDO1FBQ0YsQ0FBQztLQUNELENBQUE7SUEzQlksNERB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