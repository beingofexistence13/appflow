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
define(["require", "exports", "vs/editor/browser/editorBrowser", "vs/editor/browser/services/abstractCodeEditorService", "vs/platform/theme/common/themeService", "vs/workbench/services/editor/common/editorService", "vs/editor/browser/services/codeEditorService", "vs/platform/instantiation/common/extensions", "vs/base/common/resources", "vs/platform/configuration/common/configuration", "vs/workbench/common/editor/editorOptions"], function (require, exports, editorBrowser_1, abstractCodeEditorService_1, themeService_1, editorService_1, codeEditorService_1, extensions_1, resources_1, configuration_1, editorOptions_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.$zyb = void 0;
    let $zyb = class $zyb extends abstractCodeEditorService_1.$vyb {
        constructor(I, themeService, J) {
            super(themeService);
            this.I = I;
            this.J = J;
            this.B(this.registerCodeEditorOpenHandler(this.M.bind(this)));
            this.B(this.registerCodeEditorOpenHandler(this.L.bind(this)));
        }
        getActiveCodeEditor() {
            const activeTextEditorControl = this.I.activeTextEditorControl;
            if ((0, editorBrowser_1.$iV)(activeTextEditorControl)) {
                return activeTextEditorControl;
            }
            if ((0, editorBrowser_1.$jV)(activeTextEditorControl)) {
                return activeTextEditorControl.getModifiedEditor();
            }
            const activeControl = this.I.activeEditorPane?.getControl();
            if ((0, editorBrowser_1.$kV)(activeControl) && (0, editorBrowser_1.$iV)(activeControl.activeCodeEditor)) {
                return activeControl.activeCodeEditor;
            }
            return null;
        }
        async L(input, source, sideBySide) {
            // Special case: If the active editor is a diff editor and the request to open originates and
            // targets the modified side of it, we just apply the request there to prevent opening the modified
            // side as separate editor.
            const activeTextEditorControl = this.I.activeTextEditorControl;
            if (!sideBySide && // we need the current active group to be the target
                (0, editorBrowser_1.$jV)(activeTextEditorControl) && // we only support this for active text diff editors
                input.options && // we need options to apply
                input.resource && // we need a request resource to compare with
                source === activeTextEditorControl.getModifiedEditor() && // we need the source of this request to be the modified side of the diff editor
                activeTextEditorControl.getModel() && // we need a target model to compare with
                (0, resources_1.$bg)(input.resource, activeTextEditorControl.getModel()?.modified.uri) // we need the input resources to match with modified side
            ) {
                const targetEditor = activeTextEditorControl.getModifiedEditor();
                (0, editorOptions_1.applyTextEditorOptions)(input.options, targetEditor, 0 /* ScrollType.Smooth */);
                return targetEditor;
            }
            return null;
        }
        // Open using our normal editor service
        async M(input, source, sideBySide) {
            // Special case: we want to detect the request to open an editor that
            // is different from the current one to decide whether the current editor
            // should be pinned or not. This ensures that the source of a navigation
            // is not being replaced by the target. An example is "Goto definition"
            // that otherwise would replace the editor everytime the user navigates.
            const enablePreviewFromCodeNavigation = this.J.getValue().workbench?.editor?.enablePreviewFromCodeNavigation;
            if (!enablePreviewFromCodeNavigation && // we only need to do this if the configuration requires it
                source && // we need to know the origin of the navigation
                !input.options?.pinned && // we only need to look at preview editors that open
                !sideBySide && // we only need to care if editor opens in same group
                !(0, resources_1.$bg)(source.getModel()?.uri, input.resource) // we only need to do this if the editor is about to change
            ) {
                for (const visiblePane of this.I.visibleEditorPanes) {
                    if ((0, editorBrowser_1.$lV)(visiblePane.getControl()) === source) {
                        visiblePane.group.pinEditor();
                        break;
                    }
                }
            }
            // Open as editor
            const control = await this.I.openEditor(input, sideBySide ? editorService_1.$$C : editorService_1.$0C);
            if (control) {
                const widget = control.getControl();
                if ((0, editorBrowser_1.$iV)(widget)) {
                    return widget;
                }
                if ((0, editorBrowser_1.$kV)(widget) && (0, editorBrowser_1.$iV)(widget.activeCodeEditor)) {
                    return widget.activeCodeEditor;
                }
            }
            return null;
        }
    };
    exports.$zyb = $zyb;
    exports.$zyb = $zyb = __decorate([
        __param(0, editorService_1.$9C),
        __param(1, themeService_1.$gv),
        __param(2, configuration_1.$8h)
    ], $zyb);
    (0, extensions_1.$mr)(codeEditorService_1.$nV, $zyb, 1 /* InstantiationType.Delayed */);
});
//# sourceMappingURL=codeEditorService.js.map