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
define(["require", "exports", "vs/base/common/lazy", "vs/base/common/lifecycle", "vs/editor/browser/editorExtensions", "vs/editor/common/editorContextKeys", "vs/editor/common/languages", "vs/editor/common/services/languageFeatures", "vs/editor/contrib/parameterHints/browser/parameterHintsModel", "vs/editor/contrib/parameterHints/browser/provideSignatureHelp", "vs/nls", "vs/platform/contextkey/common/contextkey", "vs/platform/instantiation/common/instantiation", "./parameterHintsWidget"], function (require, exports, lazy_1, lifecycle_1, editorExtensions_1, editorContextKeys_1, languages, languageFeatures_1, parameterHintsModel_1, provideSignatureHelp_1, nls, contextkey_1, instantiation_1, parameterHintsWidget_1) {
    "use strict";
    var ParameterHintsController_1;
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.TriggerParameterHintsAction = exports.ParameterHintsController = void 0;
    let ParameterHintsController = class ParameterHintsController extends lifecycle_1.Disposable {
        static { ParameterHintsController_1 = this; }
        static { this.ID = 'editor.controller.parameterHints'; }
        static get(editor) {
            return editor.getContribution(ParameterHintsController_1.ID);
        }
        constructor(editor, instantiationService, languageFeaturesService) {
            super();
            this.editor = editor;
            this.model = this._register(new parameterHintsModel_1.ParameterHintsModel(editor, languageFeaturesService.signatureHelpProvider));
            this._register(this.model.onChangedHints(newParameterHints => {
                if (newParameterHints) {
                    this.widget.value.show();
                    this.widget.value.render(newParameterHints);
                }
                else {
                    this.widget.rawValue?.hide();
                }
            }));
            this.widget = new lazy_1.Lazy(() => this._register(instantiationService.createInstance(parameterHintsWidget_1.ParameterHintsWidget, this.editor, this.model)));
        }
        cancel() {
            this.model.cancel();
        }
        previous() {
            this.widget.rawValue?.previous();
        }
        next() {
            this.widget.rawValue?.next();
        }
        trigger(context) {
            this.model.trigger(context, 0);
        }
    };
    exports.ParameterHintsController = ParameterHintsController;
    exports.ParameterHintsController = ParameterHintsController = ParameterHintsController_1 = __decorate([
        __param(1, instantiation_1.IInstantiationService),
        __param(2, languageFeatures_1.ILanguageFeaturesService)
    ], ParameterHintsController);
    class TriggerParameterHintsAction extends editorExtensions_1.EditorAction {
        constructor() {
            super({
                id: 'editor.action.triggerParameterHints',
                label: nls.localize('parameterHints.trigger.label', "Trigger Parameter Hints"),
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
            const controller = ParameterHintsController.get(editor);
            controller?.trigger({
                triggerKind: languages.SignatureHelpTriggerKind.Invoke
            });
        }
    }
    exports.TriggerParameterHintsAction = TriggerParameterHintsAction;
    (0, editorExtensions_1.registerEditorContribution)(ParameterHintsController.ID, ParameterHintsController, 2 /* EditorContributionInstantiation.BeforeFirstInteraction */);
    (0, editorExtensions_1.registerEditorAction)(TriggerParameterHintsAction);
    const weight = 100 /* KeybindingWeight.EditorContrib */ + 75;
    const ParameterHintsCommand = editorExtensions_1.EditorCommand.bindToContribution(ParameterHintsController.get);
    (0, editorExtensions_1.registerEditorCommand)(new ParameterHintsCommand({
        id: 'closeParameterHints',
        precondition: provideSignatureHelp_1.Context.Visible,
        handler: x => x.cancel(),
        kbOpts: {
            weight: weight,
            kbExpr: editorContextKeys_1.EditorContextKeys.focus,
            primary: 9 /* KeyCode.Escape */,
            secondary: [1024 /* KeyMod.Shift */ | 9 /* KeyCode.Escape */]
        }
    }));
    (0, editorExtensions_1.registerEditorCommand)(new ParameterHintsCommand({
        id: 'showPrevParameterHint',
        precondition: contextkey_1.ContextKeyExpr.and(provideSignatureHelp_1.Context.Visible, provideSignatureHelp_1.Context.MultipleSignatures),
        handler: x => x.previous(),
        kbOpts: {
            weight: weight,
            kbExpr: editorContextKeys_1.EditorContextKeys.focus,
            primary: 16 /* KeyCode.UpArrow */,
            secondary: [512 /* KeyMod.Alt */ | 16 /* KeyCode.UpArrow */],
            mac: { primary: 16 /* KeyCode.UpArrow */, secondary: [512 /* KeyMod.Alt */ | 16 /* KeyCode.UpArrow */, 256 /* KeyMod.WinCtrl */ | 46 /* KeyCode.KeyP */] }
        }
    }));
    (0, editorExtensions_1.registerEditorCommand)(new ParameterHintsCommand({
        id: 'showNextParameterHint',
        precondition: contextkey_1.ContextKeyExpr.and(provideSignatureHelp_1.Context.Visible, provideSignatureHelp_1.Context.MultipleSignatures),
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicGFyYW1ldGVySGludHMuanMiLCJzb3VyY2VSb290IjoiZmlsZTovLy93b3Jrc3BhY2UvYXBwZmxvdy9zcmMvIiwic291cmNlcyI6WyJ2cy9lZGl0b3IvY29udHJpYi9wYXJhbWV0ZXJIaW50cy9icm93c2VyL3BhcmFtZXRlckhpbnRzLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOzs7Z0dBR2dHOzs7Ozs7Ozs7Ozs7Ozs7SUFtQnpGLElBQU0sd0JBQXdCLEdBQTlCLE1BQU0sd0JBQXlCLFNBQVEsc0JBQVU7O2lCQUVoQyxPQUFFLEdBQUcsa0NBQWtDLEFBQXJDLENBQXNDO1FBRXhELE1BQU0sQ0FBQyxHQUFHLENBQUMsTUFBbUI7WUFDcEMsT0FBTyxNQUFNLENBQUMsZUFBZSxDQUEyQiwwQkFBd0IsQ0FBQyxFQUFFLENBQUMsQ0FBQztRQUN0RixDQUFDO1FBTUQsWUFDQyxNQUFtQixFQUNJLG9CQUEyQyxFQUN4Qyx1QkFBaUQ7WUFFM0UsS0FBSyxFQUFFLENBQUM7WUFFUixJQUFJLENBQUMsTUFBTSxHQUFHLE1BQU0sQ0FBQztZQUVyQixJQUFJLENBQUMsS0FBSyxHQUFHLElBQUksQ0FBQyxTQUFTLENBQUMsSUFBSSx5Q0FBbUIsQ0FBQyxNQUFNLEVBQUUsdUJBQXVCLENBQUMscUJBQXFCLENBQUMsQ0FBQyxDQUFDO1lBRTVHLElBQUksQ0FBQyxTQUFTLENBQUMsSUFBSSxDQUFDLEtBQUssQ0FBQyxjQUFjLENBQUMsaUJBQWlCLENBQUMsRUFBRTtnQkFDNUQsSUFBSSxpQkFBaUIsRUFBRTtvQkFDdEIsSUFBSSxDQUFDLE1BQU0sQ0FBQyxLQUFLLENBQUMsSUFBSSxFQUFFLENBQUM7b0JBQ3pCLElBQUksQ0FBQyxNQUFNLENBQUMsS0FBSyxDQUFDLE1BQU0sQ0FBQyxpQkFBaUIsQ0FBQyxDQUFDO2lCQUM1QztxQkFBTTtvQkFDTixJQUFJLENBQUMsTUFBTSxDQUFDLFFBQVEsRUFBRSxJQUFJLEVBQUUsQ0FBQztpQkFDN0I7WUFDRixDQUFDLENBQUMs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