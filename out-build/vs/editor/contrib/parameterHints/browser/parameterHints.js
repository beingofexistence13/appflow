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
define(["require", "exports", "vs/base/common/lazy", "vs/base/common/lifecycle", "vs/editor/browser/editorExtensions", "vs/editor/common/editorContextKeys", "vs/editor/common/languages", "vs/editor/common/services/languageFeatures", "vs/editor/contrib/parameterHints/browser/parameterHintsModel", "vs/editor/contrib/parameterHints/browser/provideSignatureHelp", "vs/nls!vs/editor/contrib/parameterHints/browser/parameterHints", "vs/platform/contextkey/common/contextkey", "vs/platform/instantiation/common/instantiation", "./parameterHintsWidget"], function (require, exports, lazy_1, lifecycle_1, editorExtensions_1, editorContextKeys_1, languages, languageFeatures_1, parameterHintsModel_1, provideSignatureHelp_1, nls, contextkey_1, instantiation_1, parameterHintsWidget_1) {
    "use strict";
    var $n0_1;
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.$o0 = exports.$n0 = void 0;
    let $n0 = class $n0 extends lifecycle_1.$kc {
        static { $n0_1 = this; }
        static { this.ID = 'editor.controller.parameterHints'; }
        static get(editor) {
            return editor.getContribution($n0_1.ID);
        }
        constructor(editor, instantiationService, languageFeaturesService) {
            super();
            this.a = editor;
            this.b = this.B(new parameterHintsModel_1.$l0(editor, languageFeaturesService.signatureHelpProvider));
            this.B(this.b.onChangedHints(newParameterHints => {
                if (newParameterHints) {
                    this.c.value.show();
                    this.c.value.render(newParameterHints);
                }
                else {
                    this.c.rawValue?.hide();
                }
            }));
            this.c = new lazy_1.$T(() => this.B(instantiationService.createInstance(parameterHintsWidget_1.$m0, this.a, this.b)));
        }
        cancel() {
            this.b.cancel();
        }
        previous() {
            this.c.rawValue?.previous();
        }
        next() {
            this.c.rawValue?.next();
        }
        trigger(context) {
            this.b.trigger(context, 0);
        }
    };
    exports.$n0 = $n0;
    exports.$n0 = $n0 = $n0_1 = __decorate([
        __param(1, instantiation_1.$Ah),
        __param(2, languageFeatures_1.$hF)
    ], $n0);
    class $o0 extends editorExtensions_1.$sV {
        constructor() {
            super({
                id: 'editor.action.triggerParameterHints',
                label: nls.localize(0, null),
                alias: 'Trigger Parameter Hints',
                precondition: editorContextKeys_1.EditorContextKeys.hasSignatureHelpProvider,
                kbOpts: {
                    kbExpr: editorContextKeys_1.EditorContextKeys.editorTextFocus,
                    primary: 2048 /* KeyMod.CtrlCmd */ | 1024 /* KeyMod.Shift */ | 10 /* KeyCode.Space */,
                    weight: 100 /* KeybindingWeight.EditorContrib */
                }
            });
        }
        run(accessor, editor) {
            const controller = $n0.get(editor);
            controller?.trigger({
                triggerKind: languages.SignatureHelpTriggerKind.Invoke
            });
        }
    }
    exports.$o0 = $o0;
    (0, editorExtensions_1.$AV)($n0.ID, $n0, 2 /* EditorContributionInstantiation.BeforeFirstInteraction */);
    (0, editorExtensions_1.$xV)($o0);
    const weight = 100 /* KeybindingWeight.EditorContrib */ + 75;
    const ParameterHintsCommand = editorExtensions_1.$rV.bindToContribution($n0.get);
    (0, editorExtensions_1.$wV)(new ParameterHintsCommand({
        id: 'closeParameterHints',
        precondition: provideSignatureHelp_1.$j0.Visible,
        handler: x => x.cancel(),
        kbOpts: {
            weight: weight,
            kbExpr: editorContextKeys_1.EditorContextKeys.focus,
            primary: 9 /* KeyCode.Escape */,
            secondary: [1024 /* KeyMod.Shift */ | 9 /* KeyCode.Escape */]
        }
    }));
    (0, editorExtensions_1.$wV)(new ParameterHintsCommand({
        id: 'showPrevParameterHint',
        precondition: contextkey_1.$Ii.and(provideSignatureHelp_1.$j0.Visible, provideSignatureHelp_1.$j0.MultipleSignatures),
        handler: x => x.previous(),
        kbOpts: {
            weight: weight,
            kbExpr: editorContextKeys_1.EditorContextKeys.focus,
            primary: 16 /* KeyCode.UpArrow */,
            secondary: [512 /* KeyMod.Alt */ | 16 /* KeyCode.UpArrow */],
            mac: { primary: 16 /* KeyCode.UpArrow */, secondary: [512 /* KeyMod.Alt */ | 16 /* KeyCode.UpArrow */, 256 /* KeyMod.WinCtrl */ | 46 /* KeyCode.KeyP */] }
        }
    }));
    (0, editorExtensions_1.$wV)(new ParameterHintsCommand({
        id: 'showNextParameterHint',
        precondition: contextkey_1.$Ii.and(provideSignatureHelp_1.$j0.Visible, provideSignatureHelp_1.$j0.MultipleSignatures),
        handler: x => x.next(),
        kbOpts: {
            weight: weight,
            kbExpr: editorContextKeys_1.EditorContextKeys.focus,
            primary: 18 /* KeyCode.DownArrow */,
            secondary: [512 /* KeyMod.Alt */ | 18 /* KeyCode.DownArrow */],
            mac: { primary: 18 /* KeyCode.DownArrow */, secondary: [512 /* KeyMod.Alt */ | 18 /* KeyCode.DownArrow */, 256 /* KeyMod.WinCtrl */ | 44 /* KeyCode.KeyN */] }
        }
    }));
});
//# sourceMappingURL=parameterHints.js.map