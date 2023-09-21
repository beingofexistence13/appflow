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
define(["require", "exports", "vs/editor/browser/editorExtensions", "vs/platform/theme/common/themeService", "vs/base/common/cancellation", "vs/platform/instantiation/common/instantiation", "vs/platform/contextkey/common/contextkey", "vs/editor/standalone/browser/standaloneLayoutService", "vs/editor/browser/services/codeEditorService", "vs/platform/quickinput/browser/quickInputService", "vs/base/common/functional", "vs/css!./standaloneQuickInput"], function (require, exports, editorExtensions_1, themeService_1, cancellation_1, instantiation_1, contextkey_1, standaloneLayoutService_1, codeEditorService_1, quickInputService_1, functional_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.QuickInputEditorWidget = exports.QuickInputEditorContribution = exports.StandaloneQuickInputService = void 0;
    let EditorScopedQuickInputService = class EditorScopedQuickInputService extends quickInputService_1.QuickInputService {
        constructor(editor, instantiationService, contextKeyService, themeService, codeEditorService) {
            super(instantiationService, contextKeyService, themeService, new standaloneLayoutService_1.EditorScopedLayoutService(editor.getContainerDomNode(), codeEditorService));
            this.host = undefined;
            // Use the passed in code editor as host for the quick input widget
            const contribution = QuickInputEditorContribution.get(editor);
            if (contribution) {
                const widget = contribution.widget;
                this.host = {
                    _serviceBrand: undefined,
                    get hasContainer() { return true; },
                    get container() { return widget.getDomNode(); },
                    get dimension() { return editor.getLayoutInfo(); },
                    get onDidLayout() { return editor.onDidLayoutChange; },
                    focus: () => editor.focus(),
                    offset: { top: 0, quickPickTop: 0 }
                };
            }
            else {
                this.host = undefined;
            }
        }
        createController() {
            return super.createController(this.host);
        }
    };
    EditorScopedQuickInputService = __decorate([
        __param(1, instantiation_1.IInstantiationService),
        __param(2, contextkey_1.IContextKeyService),
        __param(3, themeService_1.IThemeService),
        __param(4, codeEditorService_1.ICodeEditorService)
    ], EditorScopedQuickInputService);
    let StandaloneQuickInputService = class StandaloneQuickInputService {
        get activeService() {
            const editor = this.codeEditorService.getFocusedCodeEditor();
            if (!editor) {
                throw new Error('Quick input service needs a focused editor to work.');
            }
            // Find the quick input implementation for the focused
            // editor or create it lazily if not yet created
            let quickInputService = this.mapEditorToService.get(editor);
            if (!quickInputService) {
                const newQuickInputService = quickInputService = this.instantiationService.createInstance(EditorScopedQuickInputService, editor);
                this.mapEditorToService.set(editor, quickInputService);
                (0, functional_1.once)(editor.onDidDispose)(() => {
                    newQuickInputService.dispose();
                    this.mapEditorToService.delete(editor);
                });
            }
            return quickInputService;
        }
        get quickAccess() { return this.activeService.quickAccess; }
        get backButton() { return this.activeService.backButton; }
        get onShow() { return this.activeService.onShow; }
        get onHide() { return this.activeService.onHide; }
        constructor(instantiationService, codeEditorService) {
            this.instantiationService = instantiationService;
            this.codeEditorService = codeEditorService;
            this.mapEditorToService = new Map();
        }
        pick(picks, options = {}, token = cancellation_1.CancellationToken.None) {
            return this.activeService /* TS fail */.pick(picks, options, token);
        }
        input(options, token) {
            return this.activeService.input(options, token);
        }
        createQuickPick() {
            return this.activeService.createQuickPick();
        }
        createInputBox() {
            return this.activeService.createInputBox();
        }
        createQuickWidget() {
            return this.activeService.createQuickWidget();
        }
        focus() {
            return this.activeService.focus();
        }
        toggle() {
            return this.activeService.toggle();
        }
        navigate(next, quickNavigate) {
            return this.activeService.navigate(next, quickNavigate);
        }
        accept() {
            return this.activeService.accept();
        }
        back() {
            return this.activeService.back();
        }
        cancel() {
            return this.activeService.cancel();
        }
    };
    exports.StandaloneQuickInputService = StandaloneQuickInputService;
    exports.StandaloneQuickInputService = StandaloneQuickInputService = __decorate([
        __param(0, instantiation_1.IInstantiationService),
        __param(1, codeEditorService_1.ICodeEditorService)
    ], StandaloneQuickInputService);
    class QuickInputEditorContribution {
        static { this.ID = 'editor.controller.quickInput'; }
        static get(editor) {
            return editor.getContribution(QuickInputEditorContribution.ID);
        }
        constructor(editor) {
            this.editor = editor;
            this.widget = new QuickInputEditorWidget(this.editor);
        }
        dispose() {
            this.widget.dispose();
        }
    }
    exports.QuickInputEditorContribution = QuickInputEditorContribution;
    class QuickInputEditorWidget {
        static { this.ID = 'editor.contrib.quickInputWidget'; }
        constructor(codeEditor) {
            this.codeEditor = codeEditor;
            this.domNode = document.createElement('div');
            this.codeEditor.addOverlayWidget(this);
        }
        getId() {
            return QuickInputEditorWidget.ID;
        }
        getDomNode() {
            return this.domNode;
        }
        getPosition() {
            return { preference: 2 /* OverlayWidgetPositionPreference.TOP_CENTER */ };
        }
        dispose() {
            this.codeEditor.removeOverlayWidget(this);
        }
    }
    exports.QuickInputEditorWidget = QuickInputEditorWidget;
    (0, editorExtensions_1.registerEditorContribution)(QuickInputEditorContribution.ID, QuickInputEditorContribution, 4 /* EditorContributionInstantiation.Lazy */);
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoic3RhbmRhbG9uZVF1aWNrSW5wdXRTZXJ2aWNlLmpzIiwic291cmNlUm9vdCI6ImZpbGU6Ly8vd29ya3NwYWNlL2FwcGZsb3cvc3JjLyIsInNvdXJjZXMiOlsidnMvZWRpdG9yL3N0YW5kYWxvbmUvYnJvd3Nlci9xdWlja0lucHV0L3N0YW5kYWxvbmVRdWlja0lucHV0U2VydmljZS50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7O2dHQUdnRzs7Ozs7Ozs7Ozs7Ozs7SUFrQmhHLElBQU0sNkJBQTZCLEdBQW5DLE1BQU0sNkJBQThCLFNBQVEscUNBQWlCO1FBSTVELFlBQ0MsTUFBbUIsRUFDSSxvQkFBMkMsRUFDOUMsaUJBQXFDLEVBQzFDLFlBQTJCLEVBQ3RCLGlCQUFxQztZQUV6RCxLQUFLLENBQUMsb0JBQW9CLEVBQUUsaUJBQWlCLEVBQUUsWUFBWSxFQUFFLElBQUksbURBQXlCLENBQUMsTUFBTSxDQUFDLG1CQUFtQixFQUFFLEVBQUUsaUJBQWlCLENBQUMsQ0FBQyxDQUFDO1lBVHRJLFNBQUksR0FBMEMsU0FBUyxDQUFDO1lBVy9ELG1FQUFtRTtZQUNuRSxNQUFNLFlBQVksR0FBRyw0QkFBNEIsQ0FBQyxHQUFHLENBQUMsTUFBTSxDQUFDLENBQUM7WUFDOUQsSUFBSSxZQUFZLEVBQUU7Z0JBQ2pCLE1BQU0sTUFBTSxHQUFHLFlBQVksQ0FBQyxNQUFNLENBQUM7Z0JBQ25DLElBQUksQ0FBQyxJQUFJLEdBQUc7b0JBQ1gsYUFBYSxFQUFFLFNBQVM7b0JBQ3hCLElBQUksWUFBWSxLQUFLLE9BQU8sSUFBSSxDQUFDLENBQUMsQ0FBQztvQkFDbkMsSUFBSSxTQUFTLEtBQUssT0FBTyxNQUFNLENBQUMsVUFBVSxFQUFFLENBQUMsQ0FBQyxDQUFDO29CQUMvQyxJQUFJLFNBQVMsS0FBSyxPQUFPLE1BQU0sQ0FBQyxhQUFhLEVBQUUsQ0FBQyxDQUFDLENBQUM7b0JBQ2xELElBQUksV0FBVyxLQUFLLE9BQU8sTUFBTSxDQUFDLGlCQUFpQixDQUFDLENBQUMs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