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
define(["require", "exports", "vs/base/common/event", "vs/base/common/lifecycle", "vs/nls!vs/workbench/contrib/webviewPanel/browser/webviewPanel.contribution", "vs/platform/actions/common/actions", "vs/platform/instantiation/common/descriptors", "vs/platform/instantiation/common/extensions", "vs/platform/registry/common/platform", "vs/workbench/browser/editor", "vs/workbench/common/contributions", "vs/workbench/common/editor", "vs/workbench/services/editor/common/editorGroupsService", "./webviewCommands", "./webviewEditor", "./webviewEditorInput", "./webviewEditorInputSerializer", "./webviewWorkbenchService"], function (require, exports, event_1, lifecycle_1, nls_1, actions_1, descriptors_1, extensions_1, platform_1, editor_1, contributions_1, editor_2, editorGroupsService_1, webviewCommands_1, webviewEditor_1, webviewEditorInput_1, webviewEditorInputSerializer_1, webviewWorkbenchService_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    (platform_1.$8m.as(editor_2.$GE.EditorPane)).registerEditorPane(editor_1.$_T.create(webviewEditor_1.$gfb, webviewEditor_1.$gfb.ID, (0, nls_1.localize)(0, null)), [new descriptors_1.$yh(webviewEditorInput_1.$cfb)]);
    let WebviewPanelContribution = class WebviewPanelContribution extends lifecycle_1.$kc {
        constructor(a) {
            super();
            this.a = a;
            // Add all the initial groups to be listened to
            this.a.whenReady.then(() => this.a.groups.forEach(group => {
                this.b(group);
            }));
            // Additional groups added should also be listened to
            this.B(this.a.onDidAddGroup(group => this.b(group)));
        }
        b(group) {
            const listener = group.onWillOpenEditor(e => this.c(e.editor, group));
            event_1.Event.once(group.onWillDispose)(() => {
                listener.dispose();
            });
        }
        c(editor, group) {
            if (!(editor instanceof webviewEditorInput_1.$cfb) || editor.typeId !== webviewEditorInput_1.$cfb.typeId) {
                return undefined;
            }
            if (group.contains(editor)) {
                return undefined;
            }
            let previousGroup;
            const groups = this.a.groups;
            for (const group of groups) {
                if (group.contains(editor)) {
                    previousGroup = group;
                    break;
                }
            }
            if (!previousGroup) {
                return undefined;
            }
            previousGroup.closeEditor(editor);
        }
    };
    WebviewPanelContribution = __decorate([
        __param(0, editorGroupsService_1.$5C)
    ], WebviewPanelContribution);
    const workbenchContributionsRegistry = platform_1.$8m.as(contributions_1.Extensions.Workbench);
    workbenchContributionsRegistry.registerWorkbenchContribution(WebviewPanelContribution, 1 /* LifecyclePhase.Starting */);
    platform_1.$8m.as(editor_2.$GE.EditorFactory).registerEditorSerializer(webviewEditorInputSerializer_1.$nlb.ID, webviewEditorInputSerializer_1.$nlb);
    (0, extensions_1.$mr)(webviewWorkbenchService_1.$hfb, webviewWorkbenchService_1.$jfb, 1 /* InstantiationType.Delayed */);
    (0, actions_1.$Xu)(webviewCommands_1.$GTb);
    (0, actions_1.$Xu)(webviewCommands_1.$HTb);
    (0, actions_1.$Xu)(webviewCommands_1.$ITb);
    (0, actions_1.$Xu)(webviewCommands_1.$JTb);
    (0, actions_1.$Xu)(webviewCommands_1.$KTb);
});
//# sourceMappingURL=webviewPanel.contribution.js.map