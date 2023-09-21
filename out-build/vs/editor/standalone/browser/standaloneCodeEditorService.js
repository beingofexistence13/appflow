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
define(["require", "exports", "vs/base/browser/dom", "vs/base/common/network", "vs/editor/browser/services/abstractCodeEditorService", "vs/editor/browser/services/codeEditorService", "vs/platform/contextkey/common/contextkey", "vs/platform/instantiation/common/extensions", "vs/platform/theme/common/themeService"], function (require, exports, dom_1, network_1, abstractCodeEditorService_1, codeEditorService_1, contextkey_1, extensions_1, themeService_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.$G8b = void 0;
    let $G8b = class $G8b extends abstractCodeEditorService_1.$vyb {
        constructor(contextKeyService, themeService) {
            super(themeService);
            this.B(this.onCodeEditorAdd(() => this.L()));
            this.B(this.onCodeEditorRemove(() => this.L()));
            this.I = contextKeyService.createKey('editorIsOpen', false);
            this.J = null;
            this.B(this.registerCodeEditorOpenHandler(async (input, source, sideBySide) => {
                if (!source) {
                    return null;
                }
                return this.M(source, input);
            }));
        }
        L() {
            let hasCodeEditor = false;
            for (const editor of this.listCodeEditors()) {
                if (!editor.isSimpleWidget) {
                    hasCodeEditor = true;
                    break;
                }
            }
            this.I.set(hasCodeEditor);
        }
        setActiveCodeEditor(activeCodeEditor) {
            this.J = activeCodeEditor;
        }
        getActiveCodeEditor() {
            return this.J;
        }
        M(editor, input) {
            const model = this.N(editor, input.resource);
            if (!model) {
                if (input.resource) {
                    const schema = input.resource.scheme;
                    if (schema === network_1.Schemas.http || schema === network_1.Schemas.https) {
                        // This is a fully qualified http or https URL
                        (0, dom_1.$jP)(input.resource.toString());
                        return editor;
                    }
                }
                return null;
            }
            const selection = (input.options ? input.options.selection : null);
            if (selection) {
                if (typeof selection.endLineNumber === 'number' && typeof selection.endColumn === 'number') {
                    editor.setSelection(selection);
                    editor.revealRangeInCenter(selection, 1 /* ScrollType.Immediate */);
                }
                else {
                    const pos = {
                        lineNumber: selection.startLineNumber,
                        column: selection.startColumn
                    };
                    editor.setPosition(pos);
                    editor.revealPositionInCenter(pos, 1 /* ScrollType.Immediate */);
                }
            }
            return editor;
        }
        N(editor, resource) {
            const model = editor.getModel();
            if (model && model.uri.toString() !== resource.toString()) {
                return null;
            }
            return model;
        }
    };
    exports.$G8b = $G8b;
    exports.$G8b = $G8b = __decorate([
        __param(0, contextkey_1.$3i),
        __param(1, themeService_1.$gv)
    ], $G8b);
    (0, extensions_1.$mr)(codeEditorService_1.$nV, $G8b, 0 /* InstantiationType.Eager */);
});
//# sourceMappingURL=standaloneCodeEditorService.js.map