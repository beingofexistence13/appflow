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
define(["require", "exports", "vs/base/common/lifecycle", "vs/base/common/platform", "vs/platform/keybinding/common/keybinding", "vs/platform/telemetry/common/telemetry", "vs/nls!vs/workbench/browser/parts/editor/editorGroupWatermark", "vs/platform/workspace/common/workspace", "vs/workbench/services/lifecycle/common/lifecycle", "vs/platform/configuration/common/configuration", "vs/base/browser/dom", "vs/base/browser/ui/keybindingLabel/keybindingLabel", "vs/platform/commands/common/commands", "vs/platform/contextkey/common/contextkey", "vs/platform/theme/browser/defaultStyles"], function (require, exports, lifecycle_1, platform_1, keybinding_1, telemetry_1, nls, workspace_1, lifecycle_2, configuration_1, dom_1, keybindingLabel_1, commands_1, contextkey_1, defaultStyles_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.$yxb = void 0;
    const showCommands = { text: nls.localize(0, null), id: 'workbench.action.showCommands' };
    const quickAccess = { text: nls.localize(1, null), id: 'workbench.action.quickOpen' };
    const openFileNonMacOnly = { text: nls.localize(2, null), id: 'workbench.action.files.openFile', mac: false };
    const openFolderNonMacOnly = { text: nls.localize(3, null), id: 'workbench.action.files.openFolder', mac: false };
    const openFileOrFolderMacOnly = { text: nls.localize(4, null), id: 'workbench.action.files.openFileFolder', mac: true };
    const openRecent = { text: nls.localize(5, null), id: 'workbench.action.openRecent' };
    const newUntitledFile = { text: nls.localize(6, null), id: 'workbench.action.files.newUntitledFile' };
    const newUntitledFileMacOnly = Object.assign({ mac: true }, newUntitledFile);
    const findInFiles = { text: nls.localize(7, null), id: 'workbench.action.findInFiles' };
    const toggleTerminal = { text: nls.localize(8, null), id: 'workbench.action.terminal.toggleTerminal', when: contextkey_1.$Ii.equals('terminalProcessSupported', true) };
    const startDebugging = { text: nls.localize(9, null), id: 'workbench.action.debug.start', when: contextkey_1.$Ii.equals('terminalProcessSupported', true) };
    const toggleFullscreen = { text: nls.localize(10, null), id: 'workbench.action.toggleFullScreen', when: contextkey_1.$Ii.equals('terminalProcessSupported', true).negate() };
    const showSettings = { text: nls.localize(11, null), id: 'workbench.action.openSettings', when: contextkey_1.$Ii.equals('terminalProcessSupported', true).negate() };
    const noFolderEntries = [
        showCommands,
        openFileNonMacOnly,
        openFolderNonMacOnly,
        openFileOrFolderMacOnly,
        openRecent,
        newUntitledFileMacOnly
    ];
    const folderEntries = [
        showCommands,
        quickAccess,
        findInFiles,
        startDebugging,
        toggleTerminal,
        toggleFullscreen,
        showSettings
    ];
    let $yxb = class $yxb extends lifecycle_1.$kc {
        constructor(container, g, j, m, n, r, s) {
            super();
            this.g = g;
            this.j = j;
            this.m = m;
            this.n = n;
            this.r = r;
            this.s = s;
            this.b = this.B(new lifecycle_1.$jc());
            this.c = false;
            const elements = (0, dom_1.h)('.editor-group-watermark', [
                (0, dom_1.h)('.letterpress'),
                (0, dom_1.h)('.shortcuts@shortcuts'),
            ]);
            (0, dom_1.$0O)(container, elements.root);
            this.a = elements.shortcuts;
            this.t();
            this.f = m.getWorkbenchState();
            this.u();
        }
        t() {
            this.B(this.g.onDidShutdown(() => this.dispose()));
            this.B(this.r.onDidChangeConfiguration(e => {
                if (e.affectsConfiguration('workbench.tips.enabled')) {
                    this.u();
                }
            }));
            this.B(this.m.onDidChangeWorkbenchState(workbenchState => {
                if (this.f === workbenchState) {
                    return;
                }
                this.f = workbenchState;
                this.u();
            }));
            const allEntriesWhenClauses = [...noFolderEntries, ...folderEntries].filter(entry => entry.when !== undefined).map(entry => entry.when);
            const allKeys = new Set();
            allEntriesWhenClauses.forEach(when => when.keys().forEach(key => allKeys.add(key)));
            this.B(this.n.onDidChangeContext(e => {
                if (e.affectsSome(allKeys)) {
                    this.u();
                }
            }));
        }
        u() {
            const enabled = this.r.getValue('workbench.tips.enabled');
            if (enabled === this.c) {
                return;
            }
            this.c = enabled;
            this.w();
            if (!enabled) {
                return;
            }
            const box = (0, dom_1.$0O)(this.a, (0, dom_1.$)('.watermark-box'));
            const folder = this.f !== 1 /* WorkbenchState.EMPTY */;
            const selected = (folder ? folderEntries : noFolderEntries)
                .filter(entry => !('when' in entry) || this.n.contextMatchesRules(entry.when))
                .filter(entry => !('mac' in entry) || entry.mac === (platform_1.$j && !platform_1.$o))
                .filter(entry => !!commands_1.$Gr.getCommand(entry.id));
            const update = () => {
                (0, dom_1.$lO)(box);
                selected.map(entry => {
                    const dl = (0, dom_1.$0O)(box, (0, dom_1.$)('dl'));
                    const dt = (0, dom_1.$0O)(dl, (0, dom_1.$)('dt'));
                    dt.textContent = entry.text;
                    const dd = (0, dom_1.$0O)(dl, (0, dom_1.$)('dd'));
                    const keybinding = new keybindingLabel_1.$TR(dd, platform_1.OS, { renderUnboundKeybindings: true, ...defaultStyles_1.$g2 });
                    keybinding.set(this.j.lookupKeybinding(entry.id));
                });
            };
            update();
            this.b.add(this.j.onDidUpdateKeybindings(update));
            /* __GDPR__
            "watermark:open" : {
                "owner": "digitarald"
            }
            */
            this.s.publicLog('watermark:open');
        }
        w() {
            (0, dom_1.$lO)(this.a);
            this.b.clear();
        }
        dispose() {
            super.dispose();
            this.w();
        }
    };
    exports.$yxb = $yxb;
    exports.$yxb = $yxb = __decorate([
        __param(1, lifecycle_2.$7y),
        __param(2, keybinding_1.$2D),
        __param(3, workspace_1.$Kh),
        __param(4, contextkey_1.$3i),
        __param(5, configuration_1.$8h),
        __param(6, telemetry_1.$9k)
    ], $yxb);
});
//# sourceMappingURL=editorGroupWatermark.js.map