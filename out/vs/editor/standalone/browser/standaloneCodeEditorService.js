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
    exports.StandaloneCodeEditorService = void 0;
    let StandaloneCodeEditorService = class StandaloneCodeEditorService extends abstractCodeEditorService_1.AbstractCodeEditorService {
        constructor(contextKeyService, themeService) {
            super(themeService);
            this._register(this.onCodeEditorAdd(() => this._checkContextKey()));
            this._register(this.onCodeEditorRemove(() => this._checkContextKey()));
            this._editorIsOpen = contextKeyService.createKey('editorIsOpen', false);
            this._activeCodeEditor = null;
            this._register(this.registerCodeEditorOpenHandler(async (input, source, sideBySide) => {
                if (!source) {
                    return null;
                }
                return this.doOpenEditor(source, input);
            }));
        }
        _checkContextKey() {
            let hasCodeEditor = false;
            for (const editor of this.listCodeEditors()) {
                if (!editor.isSimpleWidget) {
                    hasCodeEditor = true;
                    break;
                }
            }
            this._editorIsOpen.set(hasCodeEditor);
        }
        setActiveCodeEditor(activeCodeEditor) {
            this._activeCodeEditor = activeCodeEditor;
        }
        getActiveCodeEditor() {
            return this._activeCodeEditor;
        }
        doOpenEditor(editor, input) {
            const model = this.findModel(editor, input.resource);
            if (!model) {
                if (input.resource) {
                    const schema = input.resource.scheme;
                    if (schema === network_1.Schemas.http || schema === network_1.Schemas.https) {
                        // This is a fully qualified http or https URL
                        (0, dom_1.windowOpenNoOpener)(input.resource.toString());
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
        findModel(editor, resource) {
            const model = editor.getModel();
            if (model && model.uri.toString() !== resource.toString()) {
                return null;
            }
            return model;
        }
    };
    exports.StandaloneCodeEditorService = StandaloneCodeEditorService;
    exports.StandaloneCodeEditorService = StandaloneCodeEditorService = __decorate([
        __param(0, contextkey_1.IContextKeyService),
        __param(1, themeService_1.IThemeService)
    ], StandaloneCodeEditorService);
    (0, extensions_1.registerSingleton)(codeEditorService_1.ICodeEditorService, StandaloneCodeEditorService, 0 /* InstantiationType.Eager */);
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoic3RhbmRhbG9uZUNvZGVFZGl0b3JTZXJ2aWNlLmpzIiwic291cmNlUm9vdCI6ImZpbGU6Ly8vd29ya3NwYWNlL2FwcGZsb3cvc3JjLyIsInNvdXJjZXMiOlsidnMvZWRpdG9yL3N0YW5kYWxvbmUvYnJvd3Nlci9zdGFuZGFsb25lQ29kZUVkaXRvclNlcnZpY2UudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7OztnR0FHZ0c7Ozs7Ozs7Ozs7Ozs7O0lBZ0J6RixJQUFNLDJCQUEyQixHQUFqQyxNQUFNLDJCQUE0QixTQUFRLHFEQUF5QjtRQUt6RSxZQUNxQixpQkFBcUMsRUFDMUMsWUFBMkI7WUFFMUMsS0FBSyxDQUFDLFlBQVksQ0FBQyxDQUFDO1lBQ3BCLElBQUksQ0FBQyxTQUFTLENBQUMsSUFBSSxDQUFDLGVBQWUsQ0FBQyxHQUFHLEVBQUUsQ0FBQyxJQUFJLENBQUMsZ0JBQWdCLEVBQUUsQ0FBQyxDQUFDLENBQUM7WUFDcEUsSUFBSSxDQUFDLFNBQVMsQ0FBQyxJQUFJLENBQUMsa0JBQWtCLENBQUMsR0FBRyxFQUFFLENBQUMsSUFBSSxDQUFDLGdCQUFnQixFQUFFLENBQUMsQ0FBQyxDQUFDO1lBQ3ZFLElBQUksQ0FBQyxhQUFhLEdBQUcsaUJBQWlCLENBQUMsU0FBUyxDQUFDLGNBQWMsRUFBRSxLQUFLLENBQUMsQ0FBQztZQUN4RSxJQUFJLENBQUMsaUJBQWlCLEdBQUcsSUFBSSxDQUFDO1lBRTlCLElBQUksQ0FBQyxTQUFTLENBQUMsSUFBSSxDQUFDLDZCQUE2QixDQUFDLEtBQUssRUFBRSxLQUFLLEVBQUUsTUFBTSxFQUFFLFVBQVUsRUFBRSxFQUFFO2dCQUNyRixJQUFJLENBQUMsTUFBTSxFQUFFO29CQUNaLE9BQU8sSUFBSSxDQUFDO2lCQUNaO2dCQUNELE9BQU8sSUFBSSxDQUFDLFlBQVksQ0FBQyxNQUFNLEVBQUUsS0FBSyxDQUFDLENBQUM7WUFDekMsQ0FBQyxDQUFDLENBQUMsQ0FBQztRQUNMLENBQUM7UUFFTyxnQkFBZ0I7WUFDdkIs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