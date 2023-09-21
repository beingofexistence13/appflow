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
define(["require", "exports", "vs/base/browser/dom", "vs/base/common/event", "vs/base/common/lifecycle", "vs/base/common/observable", "vs/editor/browser/editorExtensions", "vs/editor/browser/widget/codeEditorWidget", "vs/editor/common/core/selection", "vs/editor/contrib/codelens/browser/codelensController", "vs/editor/contrib/folding/browser/folding", "vs/platform/actions/browser/toolbar", "vs/platform/instantiation/common/instantiation", "vs/workbench/browser/parts/editor/editor", "vs/workbench/contrib/mergeEditor/browser/utils"], function (require, exports, dom_1, event_1, lifecycle_1, observable_1, editorExtensions_1, codeEditorWidget_1, selection_1, codelensController_1, folding_1, toolbar_1, instantiation_1, editor_1, utils_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.TitleMenu = exports.createSelectionsAutorun = exports.CodeEditorView = void 0;
    class CodeEditorView extends lifecycle_1.Disposable {
        updateOptions(newOptions) {
            this.editor.updateOptions(newOptions);
        }
        constructor(instantiationService, viewModel, configurationService) {
            super();
            this.instantiationService = instantiationService;
            this.viewModel = viewModel;
            this.configurationService = configurationService;
            this.model = this.viewModel.map(m => /** @description model */ m?.model);
            this.htmlElements = (0, dom_1.h)('div.code-view', [
                (0, dom_1.h)('div.header@header', [
                    (0, dom_1.h)('span.title@title'),
                    (0, dom_1.h)('span.description@description'),
                    (0, dom_1.h)('span.detail@detail'),
                    (0, dom_1.h)('span.toolbar@toolbar'),
                ]),
                (0, dom_1.h)('div.container', [
                    (0, dom_1.h)('div.gutter@gutterDiv'),
                    (0, dom_1.h)('div@editor'),
                ]),
            ]);
            this._onDidViewChange = new event_1.Emitter();
            this.view = {
                element: this.htmlElements.root,
                minimumWidth: editor_1.DEFAULT_EDITOR_MIN_DIMENSIONS.width,
                maximumWidth: editor_1.DEFAULT_EDITOR_MAX_DIMENSIONS.width,
                minimumHeight: editor_1.DEFAULT_EDITOR_MIN_DIMENSIONS.height,
                maximumHeight: editor_1.DEFAULT_EDITOR_MAX_DIMENSIONS.height,
                onDidChange: this._onDidViewChange.event,
                layout: (width, height, top, left) => {
                    (0, utils_1.setStyle)(this.htmlElements.root, { width, height, top, left });
                    this.editor.layout({
                        width: width - this.htmlElements.gutterDiv.clientWidth,
                        height: height - this.htmlElements.header.clientHeight,
                    });
                }
                // preferredWidth?: number | undefined;
                // preferredHeight?: number | undefined;
                // priority?: LayoutPriority | undefined;
                // snap?: boolean | undefined;
            };
            this.checkboxesVisible = (0, utils_1.observableConfigValue)('mergeEditor.showCheckboxes', false, this.configurationService);
            this.showDeletionMarkers = (0, utils_1.observableConfigValue)('mergeEditor.showDeletionMarkers', true, this.configurationService);
            this.useSimplifiedDecorations = (0, utils_1.observableConfigValue)('mergeEditor.useSimplifiedDecorations', false, this.configurationService);
            this.editor = this.instantiationService.createInstance(codeEditorWidget_1.CodeEditorWidget, this.htmlElements.editor, {}, {
                contributions: this.getEditorContributions(),
            });
            this.isFocused = (0, observable_1.observableFromEvent)(event_1.Event.any(this.editor.onDidBlurEditorWidget, this.editor.onDidFocusEditorWidget), () => /** @description editor.hasWidgetFocus */ this.editor.hasWidgetFocus());
            this.cursorPosition = (0, observable_1.observableFromEvent)(this.editor.onDidChangeCursorPosition, () => /** @description editor.getPosition */ this.editor.getPosition());
            this.selection = (0, observable_1.observableFromEvent)(this.editor.onDidChangeCursorSelection, () => /** @description editor.getSelections */ this.editor.getSelections());
            this.cursorLineNumber = this.cursorPosition.map(p => /** @description cursorPosition.lineNumber */ p?.lineNumber);
        }
        getEditorContributions() {
            return editorExtensions_1.EditorExtensionsRegistry.getEditorContributions().filter(c => c.id !== folding_1.FoldingController.ID && c.id !== codelensController_1.CodeLensContribution.ID);
        }
    }
    exports.CodeEditorView = CodeEditorView;
    function createSelectionsAutorun(codeEditorView, translateRange) {
        const selections = (0, observable_1.derived)(reader => {
            /** @description selections */
            const viewModel = codeEditorView.viewModel.read(reader);
            if (!viewModel) {
                return [];
            }
            const baseRange = viewModel.selectionInBase.read(reader);
            if (!baseRange || baseRange.sourceEditor === codeEditorView) {
                return [];
            }
            return baseRange.rangesInBase.map(r => translateRange(r, viewModel));
        });
        return (0, observable_1.autorun)(reader => {
            /** @description set selections */
            const ranges = selections.read(reader);
            if (ranges.length === 0) {
                return;
            }
            codeEditorView.editor.setSelections(ranges.map(r => new selection_1.Selection(r.startLineNumber, r.startColumn, r.endLineNumber, r.endColumn)));
        });
    }
    exports.createSelectionsAutorun = createSelectionsAutorun;
    let TitleMenu = class TitleMenu extends lifecycle_1.Disposable {
        constructor(menuId, targetHtmlElement, instantiationService) {
            super();
            const toolbar = instantiationService.createInstance(toolbar_1.MenuWorkbenchToolBar, targetHtmlElement, menuId, {
                menuOptions: { renderShortTitle: true },
                toolbarOptions: { primaryGroup: () => false }
            });
            this._store.add(toolbar);
        }
    };
    exports.TitleMenu = TitleMenu;
    exports.TitleMenu = TitleMenu = __decorate([
        __param(2, instantiation_1.IInstantiationService)
    ], TitleMenu);
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY29kZUVkaXRvclZpZXcuanMiLCJzb3VyY2VSb290IjoiZmlsZTovLy93b3Jrc3BhY2UvYXBwZmxvdy9zcmMvIiwic291cmNlcyI6WyJ2cy93b3JrYmVuY2gvY29udHJpYi9tZXJnZUVkaXRvci9icm93c2VyL3ZpZXcvZWRpdG9ycy9jb2RlRWRpdG9yVmlldy50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7O2dHQUdnRzs7Ozs7Ozs7Ozs7Ozs7SUFzQmhHLE1BQXNCLGNBQWUsU0FBUSxzQkFBVTtRQW1EL0MsYUFBYSxDQUFDLFVBQW9DO1lBQ3hELElBQUksQ0FBQyxNQUFNLENBQUMsYUFBYSxDQUFDLFVBQVUsQ0FBQyxDQUFDO1FBQ3ZDLENBQUM7UUFtQkQsWUFDa0Isb0JBQTJDLEVBQzVDLFNBQXdELEVBQ3ZELG9CQUEyQztZQUU1RCxLQUFLLEVBQUUsQ0FBQztZQUpTLHlCQUFvQixHQUFwQixvQkFBb0IsQ0FBdUI7WUFDNUMsY0FBUyxHQUFULFNBQVMsQ0FBK0M7WUFDdkQseUJBQW9CLEdBQXBCLG9CQUFvQixDQUF1QjtZQTFFcEQsVUFBSyxHQUFHLElBQUksQ0FBQyxTQUFTLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUMseUJBQXlCLENBQUMsQ0FBQyxFQUFFLEtBQUssQ0FBQyxDQUFDO1lBRTFELGlCQUFZLEdBQUcsSUFBQSxPQUFDLEVBQUMsZUFBZSxFQUFFO2dCQUNwRCxJQUFBLE9BQUMsRUFBQyxtQkFBbUIsRUFBRTtvQkFDdEIsSUFBQSxPQUFDLEVBQUMsa0JBQWtCLENBQUM7b0JBQ3JCLElBQUEsT0FBQyxFQUFDLDhCQUE4QixDQUFDO29CQUNqQyxJQUFBLE9BQUMsRUFBQyxvQkFBb0IsQ0FBQztvQkFDdkIsSUFBQSxPQUFDLEVBQUMsc0JBQXNCLENBQUM7aUJBQ3pCLENBQUM7Z0JBQ0YsSUFBQSxPQUFDLEVBQUMsZUFBZSxFQUFFO29CQUNsQixJQUFBLE9BQUMsRUFBQyxzQkFBc0IsQ0FBQztvQkFDekIsSUFBQSxPQUFD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