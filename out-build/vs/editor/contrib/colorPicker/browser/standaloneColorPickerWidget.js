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
define(["require", "exports", "vs/base/common/lifecycle", "vs/editor/contrib/colorPicker/browser/colorHoverParticipant", "vs/platform/instantiation/common/instantiation", "vs/editor/contrib/hover/browser/contentHover", "vs/platform/keybinding/common/keybinding", "vs/base/common/event", "vs/editor/common/services/languageFeatures", "vs/editor/browser/editorExtensions", "vs/editor/common/editorContextKeys", "vs/platform/contextkey/common/contextkey", "vs/editor/common/services/model", "vs/editor/common/languages/languageConfigurationRegistry", "vs/editor/contrib/colorPicker/browser/defaultDocumentColorProvider", "vs/base/browser/dom", "vs/css!./colorPicker"], function (require, exports, lifecycle_1, colorHoverParticipant_1, instantiation_1, contentHover_1, keybinding_1, event_1, languageFeatures_1, editorExtensions_1, editorContextKeys_1, contextkey_1, model_1, languageConfigurationRegistry_1, defaultDocumentColorProvider_1, dom) {
    "use strict";
    var $S6_1, $T6_1;
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.$T6 = exports.$S6 = void 0;
    let $S6 = class $S6 extends lifecycle_1.$kc {
        static { $S6_1 = this; }
        static { this.ID = 'editor.contrib.standaloneColorPickerController'; }
        constructor(f, _contextKeyService, g, h, j, m, n) {
            super();
            this.f = f;
            this.g = g;
            this.h = h;
            this.j = j;
            this.m = m;
            this.n = n;
            this.a = null;
            this.b = editorContextKeys_1.EditorContextKeys.standaloneColorPickerVisible.bindTo(_contextKeyService);
            this.c = editorContextKeys_1.EditorContextKeys.standaloneColorPickerFocused.bindTo(_contextKeyService);
        }
        showOrFocus() {
            if (!this.f.hasModel()) {
                return;
            }
            if (!this.b.get()) {
                this.a = new $T6(this.f, this.b, this.c, this.j, this.g, this.h, this.m, this.n);
            }
            else if (!this.c.get()) {
                this.a?.focus();
            }
        }
        hide() {
            this.c.set(false);
            this.b.set(false);
            this.a?.hide();
            this.f.focus();
        }
        insertColor() {
            this.a?.updateEditor();
            this.hide();
        }
        static get(editor) {
            return editor.getContribution($S6_1.ID);
        }
    };
    exports.$S6 = $S6;
    exports.$S6 = $S6 = $S6_1 = __decorate([
        __param(1, contextkey_1.$3i),
        __param(2, model_1.$yA),
        __param(3, keybinding_1.$2D),
        __param(4, instantiation_1.$Ah),
        __param(5, languageFeatures_1.$hF),
        __param(6, languageConfigurationRegistry_1.$2t)
    ], $S6);
    (0, editorExtensions_1.$AV)($S6.ID, $S6, 1 /* EditorContributionInstantiation.AfterFirstRender */);
    const PADDING = 8;
    const CLOSE_BUTTON_WIDTH = 22;
    let $T6 = class $T6 extends lifecycle_1.$kc {
        static { $T6_1 = this; }
        static { this.ID = 'editor.contrib.standaloneColorPickerWidget'; }
        constructor(j, m, n, _instantiationService, r, s, t, u) {
            super();
            this.j = j;
            this.m = m;
            this.n = n;
            this.r = r;
            this.s = s;
            this.t = t;
            this.u = u;
            this.allowEditorOverflow = true;
            this.a = undefined;
            this.c = document.createElement('div');
            this.f = null;
            this.g = false;
            this.h = this.B(new event_1.$fd());
            this.onResult = this.h.event;
            this.m.set(true);
            this.b = _instantiationService.createInstance(colorHoverParticipant_1.$r3, this.j);
            this.a = this.j._getViewModel()?.getPrimaryCursorState().modelState.position;
            const editorSelection = this.j.getSelection();
            const selection = editorSelection ?
                {
                    startLineNumber: editorSelection.startLineNumber,
                    startColumn: editorSelection.startColumn,
                    endLineNumber: editorSelection.endLineNumber,
                    endColumn: editorSelection.endColumn
                } : { startLineNumber: 0, endLineNumber: 0, endColumn: 0, startColumn: 0 };
            const focusTracker = this.B(dom.$8O(this.c));
            this.B(focusTracker.onDidBlur(_ => {
                this.hide();
            }));
            this.B(focusTracker.onDidFocus(_ => {
                this.focus();
            }));
            // When the cursor position changes, hide the color picker
            this.B(this.j.onDidChangeCursorPosition(() => {
                // Do not hide the color picker when the cursor changes position due to the keybindings
                if (!this.g) {
                    this.hide();
                }
                else {
                    this.g = false;
                }
            }));
            this.B(this.j.onMouseMove((e) => {
                const classList = e.target.element?.classList;
                if (classList && classList.contains('colorpicker-color-decoration')) {
                    this.hide();
                }
            }));
            this.B(this.onResult((result) => {
                this.z(result.value, result.foundInEditor);
            }));
            this.w(selection);
            this.c.style.zIndex = '50';
            this.j.addContentWidget(this);
        }
        updateEditor() {
            if (this.f) {
                this.b.updateEditorModel(this.f);
            }
        }
        getId() {
            return $T6_1.ID;
        }
        getDomNode() {
            return this.c;
        }
        getPosition() {
            if (!this.a) {
                return null;
            }
            const positionPreference = this.j.getOption(60 /* EditorOption.hover */).above;
            return {
                position: this.a,
                secondaryPosition: this.a,
                preference: positionPreference ? [1 /* ContentWidgetPositionPreference.ABOVE */, 2 /* ContentWidgetPositionPreference.BELOW */] : [2 /* ContentWidgetPositionPreference.BELOW */, 1 /* ContentWidgetPositionPreference.ABOVE */],
                positionAffinity: 2 /* PositionAffinity.None */
            };
        }
        hide() {
            this.dispose();
            this.m.set(false);
            this.n.set(false);
            this.j.removeContentWidget(this);
            this.j.focus();
        }
        focus() {
            this.n.set(true);
            this.c.focus();
        }
        async w(selection) {
            const computeAsyncResult = await this.y(selection);
            if (!computeAsyncResult) {
                return;
            }
            this.h.fire(new StandaloneColorPickerResult(computeAsyncResult.result, computeAsyncResult.foundInEditor));
        }
        async y(range) {
            if (!this.j.hasModel()) {
                return null;
            }
            const colorInfo = {
                range: range,
                color: { red: 0, green: 0, blue: 0, alpha: 1 }
            };
            const colorHoverResult = await this.b.createColorHover(colorInfo, new defaultDocumentColorProvider_1.$a3(this.r, this.u), this.t.colorProvider);
            if (!colorHoverResult) {
                return null;
            }
            return { result: colorHoverResult.colorHover, foundInEditor: colorHoverResult.foundInEditor };
        }
        z(colorHover, foundInEditor) {
            const fragment = document.createDocumentFragment();
            const statusBar = this.B(new contentHover_1.$44(this.s));
            let colorPickerWidget;
            const context = {
                fragment,
                statusBar,
                setColorPicker: (widget) => colorPickerWidget = widget,
                onContentsChanged: () => { },
                hide: () => this.hide()
            };
            this.f = colorHover;
            this.B(this.b.renderHoverParts(context, [colorHover]));
            if (colorPickerWidget === undefined) {
                return;
            }
            this.c.classList.add('standalone-colorpicker-body');
            this.c.style.maxHeight = Math.max(this.j.getLayoutInfo().height / 4, 250) + 'px';
            this.c.style.maxWidth = Math.max(this.j.getLayoutInfo().width * 0.66, 500) + 'px';
            this.c.tabIndex = 0;
            this.c.appendChild(fragment);
            colorPickerWidget.layout();
            const colorPickerBody = colorPickerWidget.body;
            const saturationBoxWidth = colorPickerBody.saturationBox.domNode.clientWidth;
            const widthOfOriginalColorBox = colorPickerBody.domNode.clientWidth - saturationBoxWidth - CLOSE_BUTTON_WIDTH - PADDING;
            const enterButton = colorPickerWidget.body.enterButton;
            enterButton?.onClicked(() => {
                this.updateEditor();
                this.hide();
            });
            const colorPickerHeader = colorPickerWidget.header;
            const pickedColorNode = colorPickerHeader.pickedColorNode;
            pickedColorNode.style.width = saturationBoxWidth + PADDING + 'px';
            const originalColorNode = colorPickerHeader.originalColorNode;
            originalColorNode.style.width = widthOfOriginalColorBox + 'px';
            const closeButton = colorPickerWidget.header.closeButton;
            closeButton?.onClicked(() => {
                this.hide();
            });
            // When found in the editor, highlight the selection in the editor
            if (foundInEditor) {
                if (enterButton) {
                    enterButton.button.textContent = 'Replace';
                }
                this.g = true;
                this.j.setSelection(colorHover.range);
            }
            this.j.layoutContentWidget(this);
        }
    };
    exports.$T6 = $T6;
    exports.$T6 = $T6 = $T6_1 = __decorate([
        __param(3, instantiation_1.$Ah),
        __param(4, model_1.$yA),
        __param(5, keybinding_1.$2D),
        __param(6, languageFeatures_1.$hF),
        __param(7, languageConfigurationRegistry_1.$2t)
    ], $T6);
    class StandaloneColorPickerResult {
        // The color picker result consists of: an array of color results and a boolean indicating if the color was found in the editor
        constructor(value, foundInEditor) {
            this.value = value;
            this.foundInEditor = foundInEditor;
        }
    }
});
//# sourceMappingURL=standaloneColorPickerWidget.js.map