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
    exports.$Yjb = exports.$Xjb = exports.$Wjb = void 0;
    class $Wjb extends lifecycle_1.$kc {
        updateOptions(newOptions) {
            this.editor.updateOptions(newOptions);
        }
        constructor(n, viewModel, s) {
            super();
            this.n = n;
            this.viewModel = viewModel;
            this.s = s;
            this.model = this.viewModel.map(m => /** @description model */ m?.model);
            this.a = (0, dom_1.h)('div.code-view', [
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
            this.b = new event_1.$fd();
            this.view = {
                element: this.a.root,
                minimumWidth: editor_1.$4T.width,
                maximumWidth: editor_1.$5T.width,
                minimumHeight: editor_1.$4T.height,
                maximumHeight: editor_1.$5T.height,
                onDidChange: this.b.event,
                layout: (width, height, top, left) => {
                    (0, utils_1.$8ib)(this.a.root, { width, height, top, left });
                    this.editor.layout({
                        width: width - this.a.gutterDiv.clientWidth,
                        height: height - this.a.header.clientHeight,
                    });
                }
                // preferredWidth?: number | undefined;
                // preferredHeight?: number | undefined;
                // priority?: LayoutPriority | undefined;
                // snap?: boolean | undefined;
            };
            this.f = (0, utils_1.$fjb)('mergeEditor.showCheckboxes', false, this.s);
            this.g = (0, utils_1.$fjb)('mergeEditor.showDeletionMarkers', true, this.s);
            this.j = (0, utils_1.$fjb)('mergeEditor.useSimplifiedDecorations', false, this.s);
            this.editor = this.n.createInstance(codeEditorWidget_1.$uY, this.a.editor, {}, {
                contributions: this.t(),
            });
            this.isFocused = (0, observable_1.observableFromEvent)(event_1.Event.any(this.editor.onDidBlurEditorWidget, this.editor.onDidFocusEditorWidget), () => /** @description editor.hasWidgetFocus */ this.editor.hasWidgetFocus());
            this.cursorPosition = (0, observable_1.observableFromEvent)(this.editor.onDidChangeCursorPosition, () => /** @description editor.getPosition */ this.editor.getPosition());
            this.selection = (0, observable_1.observableFromEvent)(this.editor.onDidChangeCursorSelection, () => /** @description editor.getSelections */ this.editor.getSelections());
            this.cursorLineNumber = this.cursorPosition.map(p => /** @description cursorPosition.lineNumber */ p?.lineNumber);
        }
        t() {
            return editorExtensions_1.EditorExtensionsRegistry.getEditorContributions().filter(c => c.id !== folding_1.$z8.ID && c.id !== codelensController_1.$72.ID);
        }
    }
    exports.$Wjb = $Wjb;
    function $Xjb(codeEditorView, translateRange) {
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
            codeEditorView.editor.setSelections(ranges.map(r => new selection_1.$ms(r.startLineNumber, r.startColumn, r.endLineNumber, r.endColumn)));
        });
    }
    exports.$Xjb = $Xjb;
    let $Yjb = class $Yjb extends lifecycle_1.$kc {
        constructor(menuId, targetHtmlElement, instantiationService) {
            super();
            const toolbar = instantiationService.createInstance(toolbar_1.$M6, targetHtmlElement, menuId, {
                menuOptions: { renderShortTitle: true },
                toolbarOptions: { primaryGroup: () => false }
            });
            this.q.add(toolbar);
        }
    };
    exports.$Yjb = $Yjb;
    exports.$Yjb = $Yjb = __decorate([
        __param(2, instantiation_1.$Ah)
    ], $Yjb);
});
//# sourceMappingURL=codeEditorView.js.map