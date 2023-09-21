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
    exports.$K8b = exports.$J8b = exports.$I8b = void 0;
    let EditorScopedQuickInputService = class EditorScopedQuickInputService extends quickInputService_1.$IAb {
        constructor(editor, instantiationService, contextKeyService, themeService, codeEditorService) {
            super(instantiationService, contextKeyService, themeService, new standaloneLayoutService_1.$H8b(editor.getContainerDomNode(), codeEditorService));
            this.F = undefined;
            // Use the passed in code editor as host for the quick input widget
            const contribution = $J8b.get(editor);
            if (contribution) {
                const widget = contribution.widget;
                this.F = {
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
                this.F = undefined;
            }
        }
        u() {
            return super.u(this.F);
        }
    };
    EditorScopedQuickInputService = __decorate([
        __param(1, instantiation_1.$Ah),
        __param(2, contextkey_1.$3i),
        __param(3, themeService_1.$gv),
        __param(4, codeEditorService_1.$nV)
    ], EditorScopedQuickInputService);
    let $I8b = class $I8b {
        get b() {
            const editor = this.d.getFocusedCodeEditor();
            if (!editor) {
                throw new Error('Quick input service needs a focused editor to work.');
            }
            // Find the quick input implementation for the focused
            // editor or create it lazily if not yet created
            let quickInputService = this.a.get(editor);
            if (!quickInputService) {
                const newQuickInputService = quickInputService = this.c.createInstance(EditorScopedQuickInputService, editor);
                this.a.set(editor, quickInputService);
                (0, functional_1.$bb)(editor.onDidDispose)(() => {
                    newQuickInputService.dispose();
                    this.a.delete(editor);
                });
            }
            return quickInputService;
        }
        get quickAccess() { return this.b.quickAccess; }
        get backButton() { return this.b.backButton; }
        get onShow() { return this.b.onShow; }
        get onHide() { return this.b.onHide; }
        constructor(c, d) {
            this.c = c;
            this.d = d;
            this.a = new Map();
        }
        pick(picks, options = {}, token = cancellation_1.CancellationToken.None) {
            return this.b /* TS fail */.pick(picks, options, token);
        }
        input(options, token) {
            return this.b.input(options, token);
        }
        createQuickPick() {
            return this.b.createQuickPick();
        }
        createInputBox() {
            return this.b.createInputBox();
        }
        createQuickWidget() {
            return this.b.createQuickWidget();
        }
        focus() {
            return this.b.focus();
        }
        toggle() {
            return this.b.toggle();
        }
        navigate(next, quickNavigate) {
            return this.b.navigate(next, quickNavigate);
        }
        accept() {
            return this.b.accept();
        }
        back() {
            return this.b.back();
        }
        cancel() {
            return this.b.cancel();
        }
    };
    exports.$I8b = $I8b;
    exports.$I8b = $I8b = __decorate([
        __param(0, instantiation_1.$Ah),
        __param(1, codeEditorService_1.$nV)
    ], $I8b);
    class $J8b {
        static { this.ID = 'editor.controller.quickInput'; }
        static get(editor) {
            return editor.getContribution($J8b.ID);
        }
        constructor(a) {
            this.a = a;
            this.widget = new $K8b(this.a);
        }
        dispose() {
            this.widget.dispose();
        }
    }
    exports.$J8b = $J8b;
    class $K8b {
        static { this.a = 'editor.contrib.quickInputWidget'; }
        constructor(c) {
            this.c = c;
            this.b = document.createElement('div');
            this.c.addOverlayWidget(this);
        }
        getId() {
            return $K8b.a;
        }
        getDomNode() {
            return this.b;
        }
        getPosition() {
            return { preference: 2 /* OverlayWidgetPositionPreference.TOP_CENTER */ };
        }
        dispose() {
            this.c.removeOverlayWidget(this);
        }
    }
    exports.$K8b = $K8b;
    (0, editorExtensions_1.$AV)($J8b.ID, $J8b, 4 /* EditorContributionInstantiation.Lazy */);
});
//# sourceMappingURL=standaloneQuickInputService.js.map