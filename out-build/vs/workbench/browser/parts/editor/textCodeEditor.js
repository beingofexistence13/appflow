/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/nls!vs/workbench/browser/parts/editor/textCodeEditor", "vs/base/common/types", "vs/workbench/common/editor/editorOptions", "vs/platform/contextkey/common/contextkey", "vs/base/common/resources", "vs/editor/browser/widget/codeEditorWidget", "vs/workbench/browser/parts/editor/textEditor"], function (require, exports, nls_1, types_1, editorOptions_1, contextkey_1, resources_1, codeEditorWidget_1, textEditor_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.$Cvb = void 0;
    /**
     * A text editor using the code editor widget.
     */
    class $Cvb extends textEditor_1.$oeb {
        constructor() {
            super(...arguments);
            this.a = undefined;
        }
        get scopedContextKeyService() {
            return this.a?.invokeWithinContext(accessor => accessor.get(contextkey_1.$3i));
        }
        getTitle() {
            if (this.input) {
                return this.input.getName();
            }
            return (0, nls_1.localize)(0, null);
        }
        Lb(parent, initialOptions) {
            this.a = this.B(this.m.createInstance(codeEditorWidget_1.$uY, parent, initialOptions, this.Sb()));
        }
        Sb() {
            return Object.create(null);
        }
        Mb(options) {
            this.a?.updateOptions(options);
        }
        Nb() {
            return this.a;
        }
        getControl() {
            return this.a;
        }
        nb(resource) {
            if (!this.a) {
                return undefined;
            }
            const model = this.a.getModel();
            if (!model) {
                return undefined; // view state always needs a model
            }
            const modelUri = model.uri;
            if (!modelUri) {
                return undefined; // model URI is needed to make sure we save the view state correctly
            }
            if (!(0, resources_1.$bg)(modelUri, resource)) {
                return undefined; // prevent saving view state for a model that is not the expected one
            }
            return this.a.saveViewState() ?? undefined;
        }
        setOptions(options) {
            super.setOptions(options);
            if (options) {
                (0, editorOptions_1.applyTextEditorOptions)(options, (0, types_1.$uf)(this.a), 0 /* ScrollType.Smooth */);
            }
        }
        focus() {
            this.a?.focus();
        }
        hasFocus() {
            return this.a?.hasTextFocus() || super.hasFocus();
        }
        bb(visible, group) {
            super.bb(visible, group);
            if (visible) {
                this.a?.onVisible();
            }
            else {
                this.a?.onHide();
            }
        }
        layout(dimension) {
            this.a?.layout(dimension);
        }
    }
    exports.$Cvb = $Cvb;
});
//# sourceMappingURL=textCodeEditor.js.map