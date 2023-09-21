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
define(["require", "exports", "vs/base/browser/browser", "vs/base/browser/dom", "vs/base/browser/fastDomNode", "vs/base/common/lifecycle", "vs/editor/browser/widget/codeEditorWidget", "vs/editor/common/config/fontInfo", "vs/editor/common/editorContextKeys", "vs/editor/common/languages/modesRegistry", "vs/nls!vs/workbench/contrib/notebook/browser/view/renderers/cellRenderer", "vs/platform/actions/common/actions", "vs/platform/configuration/common/configuration", "vs/platform/contextkey/common/contextkey", "vs/platform/contextview/browser/contextView", "vs/platform/instantiation/common/instantiation", "vs/platform/instantiation/common/serviceCollection", "vs/platform/keybinding/common/keybinding", "vs/platform/notification/common/notification", "vs/workbench/contrib/notebook/browser/view/cellPart", "vs/workbench/contrib/notebook/browser/view/cellParts/cellComments", "vs/workbench/contrib/notebook/browser/view/cellParts/cellContextKeys", "vs/workbench/contrib/notebook/browser/view/cellParts/cellDecorations", "vs/workbench/contrib/notebook/browser/view/cellParts/cellDnd", "vs/workbench/contrib/notebook/browser/view/cellParts/cellDragRenderer", "vs/workbench/contrib/notebook/browser/view/cellParts/cellEditorOptions", "vs/workbench/contrib/notebook/browser/view/cellParts/cellExecution", "vs/workbench/contrib/notebook/browser/view/cellParts/cellFocus", "vs/workbench/contrib/notebook/browser/view/cellParts/cellFocusIndicator", "vs/workbench/contrib/notebook/browser/view/cellParts/cellProgressBar", "vs/workbench/contrib/notebook/browser/view/cellParts/cellStatusPart", "vs/workbench/contrib/notebook/browser/view/cellParts/cellToolbars", "vs/workbench/contrib/notebook/browser/view/cellParts/codeCell", "vs/workbench/contrib/notebook/browser/view/cellParts/codeCellRunToolbar", "vs/workbench/contrib/notebook/browser/view/cellParts/collapsedCellInput", "vs/workbench/contrib/notebook/browser/view/cellParts/collapsedCellOutput", "vs/workbench/contrib/notebook/browser/view/cellParts/foldedCellHint", "vs/workbench/contrib/notebook/browser/view/cellParts/markupCell", "vs/workbench/contrib/notebook/common/notebookCommon"], function (require, exports, browser_1, DOM, fastDomNode_1, lifecycle_1, codeEditorWidget_1, fontInfo_1, editorContextKeys_1, modesRegistry_1, nls_1, actions_1, configuration_1, contextkey_1, contextView_1, instantiation_1, serviceCollection_1, keybinding_1, notification_1, cellPart_1, cellComments_1, cellContextKeys_1, cellDecorations_1, cellDnd_1, cellDragRenderer_1, cellEditorOptions_1, cellExecution_1, cellFocus_1, cellFocusIndicator_1, cellProgressBar_1, cellStatusPart_1, cellToolbars_1, codeCell_1, codeCellRunToolbar_1, collapsedCellInput_1, collapsedCellOutput_1, foldedCellHint_1, markupCell_1, notebookCommon_1) {
    "use strict";
    var $8qb_1, $9qb_1;
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.$9qb = exports.$8qb = exports.$7qb = void 0;
    const $ = DOM.$;
    let $7qb = class $7qb extends lifecycle_1.$kc {
        constructor(b) {
            super();
            this.b = b;
            const editorOptions = this.b.getValue('editor');
            this.a = fontInfo_1.$Rr.createFromRawSettings(editorOptions, browser_1.$WN.value).lineHeight;
        }
        getHeight(element) {
            return element.getHeight(this.a);
        }
        getDynamicHeight(element) {
            return element.getDynamicHeight();
        }
        getTemplateId(element) {
            if (element.cellKind === notebookCommon_1.CellKind.Markup) {
                return $8qb.TEMPLATE_ID;
            }
            else {
                return $9qb.TEMPLATE_ID;
            }
        }
    };
    exports.$7qb = $7qb;
    exports.$7qb = $7qb = __decorate([
        __param(0, configuration_1.$8h)
    ], $7qb);
    class AbstractCellRenderer {
        constructor(b, c, d, e, configurationService, f, g, h, language, i) {
            this.b = b;
            this.c = c;
            this.d = d;
            this.e = e;
            this.f = f;
            this.g = g;
            this.h = h;
            this.i = i;
            this.a = new cellEditorOptions_1.$ipb(this.c.getBaseCellEditorOptions(language), this.c.notebookOptions, configurationService);
        }
        dispose() {
            this.a.dispose();
            this.i = undefined;
        }
    }
    let $8qb = class $8qb extends AbstractCellRenderer {
        static { $8qb_1 = this; }
        static { this.TEMPLATE_ID = 'markdown_cell'; }
        constructor(notebookEditor, dndController, j, contextKeyServiceProvider, configurationService, instantiationService, contextMenuService, menuService, keybindingService, notificationService) {
            super(instantiationService, notebookEditor, contextMenuService, menuService, configurationService, keybindingService, notificationService, contextKeyServiceProvider, 'markdown', dndController);
            this.j = j;
        }
        get templateId() {
            return $8qb_1.TEMPLATE_ID;
        }
        renderTemplate(rootContainer) {
            rootContainer.classList.add('markdown-cell-row');
            const container = DOM.$0O(rootContainer, DOM.$('.cell-inner-container'));
            const templateDisposables = new lifecycle_1.$jc();
            const contextKeyService = templateDisposables.add(this.h(container));
            const decorationContainer = DOM.$0O(rootContainer, $('.cell-decoration'));
            const titleToolbarContainer = DOM.$0O(container, $('.cell-title-toolbar'));
            const focusIndicatorTop = new fastDomNode_1.$FP(DOM.$0O(container, $('.cell-focus-indicator.cell-focus-indicator-top')));
            const focusIndicatorLeft = new fastDomNode_1.$FP(DOM.$0O(container, DOM.$('.cell-focus-indicator.cell-focus-indicator-side.cell-focus-indicator-left')));
            const foldingIndicator = DOM.$0O(focusIndicatorLeft.domNode, DOM.$('.notebook-folding-indicator'));
            const focusIndicatorRight = new fastDomNode_1.$FP(DOM.$0O(container, DOM.$('.cell-focus-indicator.cell-focus-indicator-side.cell-focus-indicator-right')));
            const codeInnerContent = DOM.$0O(container, $('.cell.code'));
            const editorPart = DOM.$0O(codeInnerContent, $('.cell-editor-part'));
            const cellInputCollapsedContainer = DOM.$0O(codeInnerContent, $('.input-collapse-container'));
            cellInputCollapsedContainer.style.display = 'none';
            const editorContainer = DOM.$0O(editorPart, $('.cell-editor-container'));
            editorPart.style.display = 'none';
            const cellCommentPartContainer = DOM.$0O(container, $('.cell-comment-container'));
            const innerContent = DOM.$0O(container, $('.cell.markdown'));
            const bottomCellContainer = DOM.$0O(container, $('.cell-bottom-toolbar-container'));
            const scopedInstaService = this.b.createChild(new serviceCollection_1.$zh([contextkey_1.$3i, contextKeyService]));
            const rootClassDelegate = {
                toggle: (className, force) => container.classList.toggle(className, force)
            };
            const titleToolbar = templateDisposables.add(scopedInstaService.createInstance(cellToolbars_1.$ppb, titleToolbarContainer, rootClassDelegate, this.c.creationOptions.menuIds.cellTitleToolbar, this.c.creationOptions.menuIds.cellDeleteToolbar, this.c));
            const focusIndicatorBottom = new fastDomNode_1.$FP(DOM.$0O(container, $('.cell-focus-indicator.cell-focus-indicator-bottom')));
            const cellParts = new cellPart_1.$Jnb([
                templateDisposables.add(scopedInstaService.createInstance(cellStatusPart_1.$spb, this.c, container, editorPart, undefined)),
                templateDisposables.add(new cellFocusIndicator_1.$qpb(this.c, titleToolbar, focusIndicatorTop, focusIndicatorLeft, focusIndicatorRight, focusIndicatorBottom)),
                templateDisposables.add(new foldedCellHint_1.$5qb(this.c, DOM.$0O(container, $('.notebook-folded-hint')))),
                templateDisposables.add(new cellDecorations_1.$4ob(rootContainer, decorationContainer)),
                templateDisposables.add(scopedInstaService.createInstance(cellComments_1.$3ob, this.c, cellCommentPartContainer)),
                templateDisposables.add(new collapsedCellInput_1.$Yqb(this.c, cellInputCollapsedContainer)),
                templateDisposables.add(new cellFocus_1.$kpb(container, undefined, this.c)),
                templateDisposables.add(new cellDnd_1.$Bob(container)),
                templateDisposables.add(scopedInstaService.createInstance(cellContextKeys_1.$sob, this.c)),
            ], [
                titleToolbar,
                templateDisposables.add(scopedInstaService.createInstance(cellToolbars_1.$opb, this.c, titleToolbarContainer, bottomCellContainer))
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
                elementDisposables: new lifecycle_1.$jc(),
                cellParts,
                toJSON: () => { return {}; }
            };
            return templateData;
        }
        renderElement(element, index, templateData, height) {
            if (!this.c.hasModel()) {
                throw new Error('The notebook editor is not attached with view model yet.');
            }
            templateData.currentRenderedCell = element;
            templateData.currentEditor = undefined;
            templateData.editorPart.style.display = 'none';
            templateData.cellContainer.innerText = '';
            if (height === undefined) {
                return;
            }
            templateData.elementDisposables.add(templateData.instantiationService.createInstance(markupCell_1.$6qb, this.c, element, templateData, this.j));
        }
        disposeTemplate(templateData) {
            templateData.elementDisposables.dispose();
            templateData.templateDisposables.dispose();
        }
        disposeElement(_element, _index, templateData) {
            templateData.elementDisposables.clear();
        }
    };
    exports.$8qb = $8qb;
    exports.$8qb = $8qb = $8qb_1 = __decorate([
        __param(4, configuration_1.$8h),
        __param(5, instantiation_1.$Ah),
        __param(6, contextView_1.$WZ),
        __param(7, actions_1.$Su),
        __param(8, keybinding_1.$2D),
        __param(9, notification_1.$Yu)
    ], $8qb);
    let $9qb = class $9qb extends AbstractCellRenderer {
        static { $9qb_1 = this; }
        static { this.TEMPLATE_ID = 'code_cell'; }
        constructor(notebookEditor, j, dndController, contextKeyServiceProvider, configurationService, contextMenuService, menuService, instantiationService, keybindingService, notificationService) {
            super(instantiationService, notebookEditor, contextMenuService, menuService, configurationService, keybindingService, notificationService, contextKeyServiceProvider, modesRegistry_1.$Yt, dndController);
            this.j = j;
        }
        get templateId() {
            return $9qb_1.TEMPLATE_ID;
        }
        renderTemplate(rootContainer) {
            rootContainer.classList.add('code-cell-row');
            const container = DOM.$0O(rootContainer, DOM.$('.cell-inner-container'));
            const templateDisposables = new lifecycle_1.$jc();
            const contextKeyService = templateDisposables.add(this.h(container));
            const decorationContainer = DOM.$0O(rootContainer, $('.cell-decoration'));
            const focusIndicatorTop = new fastDomNode_1.$FP(DOM.$0O(container, $('.cell-focus-indicator.cell-focus-indicator-top')));
            const titleToolbarContainer = DOM.$0O(container, $('.cell-title-toolbar'));
            // This is also the drag handle
            const focusIndicatorLeft = new fastDomNode_1.$FP(DOM.$0O(container, DOM.$('.cell-focus-indicator.cell-focus-indicator-side.cell-focus-indicator-left')));
            const cellContainer = DOM.$0O(container, $('.cell.code'));
            const runButtonContainer = DOM.$0O(cellContainer, $('.run-button-container'));
            const cellInputCollapsedContainer = DOM.$0O(cellContainer, $('.input-collapse-container'));
            cellInputCollapsedContainer.style.display = 'none';
            const executionOrderLabel = DOM.$0O(focusIndicatorLeft.domNode, $('div.execution-count-label'));
            executionOrderLabel.title = (0, nls_1.localize)(0, null);
            const editorPart = DOM.$0O(cellContainer, $('.cell-editor-part'));
            const editorContainer = DOM.$0O(editorPart, $('.cell-editor-container'));
            const cellCommentPartContainer = DOM.$0O(container, $('.cell-comment-container'));
            // create a special context key service that set the inCompositeEditor-contextkey
            const editorContextKeyService = templateDisposables.add(this.h(editorPart));
            const editorInstaService = this.b.createChild(new serviceCollection_1.$zh([contextkey_1.$3i, editorContextKeyService]));
            editorContextKeys_1.EditorContextKeys.inCompositeEditor.bindTo(editorContextKeyService).set(true);
            const editor = editorInstaService.createInstance(codeEditorWidget_1.$uY, editorContainer, {
                ...this.a.getDefaultValue(),
                dimension: {
                    width: 0,
                    height: 0
                },
            }, {
                contributions: this.c.creationOptions.cellEditorContributions
            });
            templateDisposables.add(editor);
            const outputContainer = new fastDomNode_1.$FP(DOM.$0O(container, $('.output')));
            const cellOutputCollapsedContainer = DOM.$0O(outputContainer.domNode, $('.output-collapse-container'));
            const outputShowMoreContainer = new fastDomNode_1.$FP(DOM.$0O(container, $('.output-show-more-container')));
            const focusIndicatorRight = new fastDomNode_1.$FP(DOM.$0O(container, DOM.$('.cell-focus-indicator.cell-focus-indicator-side.cell-focus-indicator-right')));
            const focusSinkElement = DOM.$0O(container, $('.cell-editor-focus-sink'));
            focusSinkElement.setAttribute('tabindex', '0');
            const bottomCellToolbarContainer = DOM.$0O(container, $('.cell-bottom-toolbar-container'));
            const focusIndicatorBottom = new fastDomNode_1.$FP(DOM.$0O(container, $('.cell-focus-indicator.cell-focus-indicator-bottom')));
            const scopedInstaService = this.b.createChild(new serviceCollection_1.$zh([contextkey_1.$3i, contextKeyService]));
            const rootClassDelegate = {
                toggle: (className, force) => container.classList.toggle(className, force)
            };
            const titleToolbar = templateDisposables.add(scopedInstaService.createInstance(cellToolbars_1.$ppb, titleToolbarContainer, rootClassDelegate, this.c.creationOptions.menuIds.cellTitleToolbar, this.c.creationOptions.menuIds.cellDeleteToolbar, this.c));
            const focusIndicatorPart = templateDisposables.add(new cellFocusIndicator_1.$qpb(this.c, titleToolbar, focusIndicatorTop, focusIndicatorLeft, focusIndicatorRight, focusIndicatorBottom));
            const cellParts = new cellPart_1.$Jnb([
                focusIndicatorPart,
                templateDisposables.add(scopedInstaService.createInstance(cellStatusPart_1.$spb, this.c, container, editorPart, editor)),
                templateDisposables.add(scopedInstaService.createInstance(cellProgressBar_1.$rpb, editorPart, cellInputCollapsedContainer)),
                templateDisposables.add(scopedInstaService.createInstance(codeCellRunToolbar_1.$Wqb, this.c, contextKeyService, container, runButtonContainer)),
                templateDisposables.add(new cellDecorations_1.$4ob(rootContainer, decorationContainer)),
                templateDisposables.add(scopedInstaService.createInstance(cellComments_1.$3ob, this.c, cellCommentPartContainer)),
                templateDisposables.add(scopedInstaService.createInstance(cellExecution_1.$jpb, this.c, executionOrderLabel)),
                templateDisposables.add(scopedInstaService.createInstance(collapsedCellOutput_1.$Zqb, this.c, cellOutputCollapsedContainer)),
                templateDisposables.add(new collapsedCellInput_1.$Yqb(this.c, cellInputCollapsedContainer)),
                templateDisposables.add(new cellFocus_1.$kpb(container, focusSinkElement, this.c)),
                templateDisposables.add(new cellDnd_1.$Bob(container)),
                templateDisposables.add(scopedInstaService.createInstance(cellContextKeys_1.$sob, this.c)),
            ], [
                titleToolbar,
                templateDisposables.add(scopedInstaService.createInstance(cellToolbars_1.$opb, this.c, titleToolbarContainer, bottomCellToolbarContainer))
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
                elementDisposables: new lifecycle_1.$jc(),
                cellParts,
                toJSON: () => { return {}; }
            };
            // focusIndicatorLeft covers the left margin area
            // code/outputFocusIndicator need to be registered as drag handlers so their click handlers don't take over
            const dragHandles = [focusIndicatorLeft.domNode, focusIndicatorPart.codeFocusIndicator.domNode, focusIndicatorPart.outputFocusIndicator.domNode];
            this.i?.registerDragHandle(templateData, rootContainer, dragHandles, () => new cellDragRenderer_1.$5ob().getDragImage(templateData, templateData.editor, 'code'));
            return templateData;
        }
        renderElement(element, index, templateData, height) {
            if (!this.c.hasModel()) {
                throw new Error('The notebook editor is not attached with view model yet.');
            }
            templateData.currentRenderedCell = element;
            if (height === undefined) {
                return;
            }
            templateData.outputContainer.domNode.innerText = '';
            templateData.outputContainer.domNode.appendChild(templateData.cellOutputCollapsedContainer);
            templateData.elementDisposables.add(templateData.instantiationService.createInstance(codeCell_1.$Uqb, this.c, element, templateData));
            this.j.set(element, templateData.editor);
        }
        disposeTemplate(templateData) {
            templateData.templateDisposables.clear();
        }
        disposeElement(element, index, templateData, height) {
            templateData.elementDisposables.clear();
            this.j.delete(element);
        }
    };
    exports.$9qb = $9qb;
    exports.$9qb = $9qb = $9qb_1 = __decorate([
        __param(4, configuration_1.$8h),
        __param(5, contextView_1.$WZ),
        __param(6, actions_1.$Su),
        __param(7, instantiation_1.$Ah),
        __param(8, keybinding_1.$2D),
        __param(9, notification_1.$Yu)
    ], $9qb);
});
//# sourceMappingURL=cellRenderer.js.map