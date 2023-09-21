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
define(["require", "exports", "vs/base/common/lifecycle", "vs/base/common/platform", "vs/platform/keybinding/common/keybinding", "vs/platform/telemetry/common/telemetry", "vs/nls", "vs/platform/workspace/common/workspace", "vs/workbench/services/lifecycle/common/lifecycle", "vs/platform/configuration/common/configuration", "vs/base/browser/dom", "vs/base/browser/ui/keybindingLabel/keybindingLabel", "vs/platform/commands/common/commands", "vs/platform/contextkey/common/contextkey", "vs/platform/theme/browser/defaultStyles"], function (require, exports, lifecycle_1, platform_1, keybinding_1, telemetry_1, nls, workspace_1, lifecycle_2, configuration_1, dom_1, keybindingLabel_1, commands_1, contextkey_1, defaultStyles_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.EditorGroupWatermark = void 0;
    const showCommands = { text: nls.localize('watermark.showCommands', "Show All Commands"), id: 'workbench.action.showCommands' };
    const quickAccess = { text: nls.localize('watermark.quickAccess', "Go to File"), id: 'workbench.action.quickOpen' };
    const openFileNonMacOnly = { text: nls.localize('watermark.openFile', "Open File"), id: 'workbench.action.files.openFile', mac: false };
    const openFolderNonMacOnly = { text: nls.localize('watermark.openFolder', "Open Folder"), id: 'workbench.action.files.openFolder', mac: false };
    const openFileOrFolderMacOnly = { text: nls.localize('watermark.openFileFolder', "Open File or Folder"), id: 'workbench.action.files.openFileFolder', mac: true };
    const openRecent = { text: nls.localize('watermark.openRecent', "Open Recent"), id: 'workbench.action.openRecent' };
    const newUntitledFile = { text: nls.localize('watermark.newUntitledFile', "New Untitled Text File"), id: 'workbench.action.files.newUntitledFile' };
    const newUntitledFileMacOnly = Object.assign({ mac: true }, newUntitledFile);
    const findInFiles = { text: nls.localize('watermark.findInFiles', "Find in Files"), id: 'workbench.action.findInFiles' };
    const toggleTerminal = { text: nls.localize({ key: 'watermark.toggleTerminal', comment: ['toggle is a verb here'] }, "Toggle Terminal"), id: 'workbench.action.terminal.toggleTerminal', when: contextkey_1.ContextKeyExpr.equals('terminalProcessSupported', true) };
    const startDebugging = { text: nls.localize('watermark.startDebugging', "Start Debugging"), id: 'workbench.action.debug.start', when: contextkey_1.ContextKeyExpr.equals('terminalProcessSupported', true) };
    const toggleFullscreen = { text: nls.localize({ key: 'watermark.toggleFullscreen', comment: ['toggle is a verb here'] }, "Toggle Full Screen"), id: 'workbench.action.toggleFullScreen', when: contextkey_1.ContextKeyExpr.equals('terminalProcessSupported', true).negate() };
    const showSettings = { text: nls.localize('watermark.showSettings', "Show Settings"), id: 'workbench.action.openSettings', when: contextkey_1.ContextKeyExpr.equals('terminalProcessSupported', true).negate() };
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
    let EditorGroupWatermark = class EditorGroupWatermark extends lifecycle_1.Disposable {
        constructor(container, lifecycleService, keybindingService, contextService, contextKeyService, configurationService, telemetryService) {
            super();
            this.lifecycleService = lifecycleService;
            this.keybindingService = keybindingService;
            this.contextService = contextService;
            this.contextKeyService = contextKeyService;
            this.configurationService = configurationService;
            this.telemetryService = telemetryService;
            this.transientDisposables = this._register(new lifecycle_1.DisposableStore());
            this.enabled = false;
            const elements = (0, dom_1.h)('.editor-group-watermark', [
                (0, dom_1.h)('.letterpress'),
                (0, dom_1.h)('.shortcuts@shortcuts'),
            ]);
            (0, dom_1.append)(container, elements.root);
            this.shortcuts = elements.shortcuts;
            this.registerListeners();
            this.workbenchState = contextService.getWorkbenchState();
            this.render();
        }
        registerListeners() {
            this._register(this.lifecycleService.onDidShutdown(() => this.dispose()));
            this._register(this.configurationService.onDidChangeConfiguration(e => {
                if (e.affectsConfiguration('workbench.tips.enabled')) {
                    this.render();
                }
            }));
            this._register(this.contextService.onDidChangeWorkbenchState(workbenchState => {
                if (this.workbenchState === workbenchState) {
                    return;
                }
                this.workbenchState = workbenchState;
                this.render();
            }));
            const allEntriesWhenClauses = [...noFolderEntries, ...folderEntries].filter(entry => entry.when !== undefined).map(entry => entry.when);
            const allKeys = new Set();
            allEntriesWhenClauses.forEach(when => when.keys().forEach(key => allKeys.add(key)));
            this._register(this.contextKeyService.onDidChangeContext(e => {
                if (e.affectsSome(allKeys)) {
                    this.render();
                }
            }));
        }
        render() {
            const enabled = this.configurationService.getValue('workbench.tips.enabled');
            if (enabled === this.enabled) {
                return;
            }
            this.enabled = enabled;
            this.clear();
            if (!enabled) {
                return;
            }
            const box = (0, dom_1.append)(this.shortcuts, (0, dom_1.$)('.watermark-box'));
            const folder = this.workbenchState !== 1 /* WorkbenchState.EMPTY */;
            const selected = (folder ? folderEntries : noFolderEntries)
                .filter(entry => !('when' in entry) || this.contextKeyService.contextMatchesRules(entry.when))
                .filter(entry => !('mac' in entry) || entry.mac === (platform_1.isMacintosh && !platform_1.isWeb))
                .filter(entry => !!commands_1.CommandsRegistry.getCommand(entry.id));
            const update = () => {
                (0, dom_1.clearNode)(box);
                selected.map(entry => {
                    const dl = (0, dom_1.append)(box, (0, dom_1.$)('dl'));
                    const dt = (0, dom_1.append)(dl, (0, dom_1.$)('dt'));
                    dt.textContent = entry.text;
                    const dd = (0, dom_1.append)(dl, (0, dom_1.$)('dd'));
                    const keybinding = new keybindingLabel_1.KeybindingLabel(dd, platform_1.OS, { renderUnboundKeybindings: true, ...defaultStyles_1.defaultKeybindingLabelStyles });
                    keybinding.set(this.keybindingService.lookupKeybinding(entry.id));
                });
            };
            update();
            this.transientDisposables.add(this.keybindingService.onDidUpdateKeybindings(update));
            /* __GDPR__
            "watermark:open" : {
                "owner": "digitarald"
            }
            */
            this.telemetryService.publicLog('watermark:open');
        }
        clear() {
            (0, dom_1.clearNode)(this.shortcuts);
            this.transientDisposables.clear();
        }
        dispose() {
            super.dispose();
            this.clear();
        }
    };
    exports.EditorGroupWatermark = EditorGroupWatermark;
    exports.EditorGroupWatermark = EditorGroupWatermark = __decorate([
        __param(1, lifecycle_2.ILifecycleService),
        __param(2, keybinding_1.IKeybindingService),
        __param(3, workspace_1.IWorkspaceContextService),
        __param(4, contextkey_1.IContextKeyService),
        __param(5, configuration_1.IConfigurationService),
        __param(6, telemetry_1.ITelemetryService)
    ], EditorGroupWatermark);
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZWRpdG9yR3JvdXBXYXRlcm1hcmsuanMiLCJzb3VyY2VSb290IjoiZmlsZTovLy93b3Jrc3BhY2UvYXBwZmxvdy9zcmMvIiwic291cmNlcyI6WyJ2cy93b3JrYmVuY2gvYnJvd3Nlci9wYXJ0cy9lZGl0b3IvZWRpdG9yR3JvdXBXYXRlcm1hcmsudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7OztnR0FHZ0c7Ozs7Ozs7Ozs7Ozs7O0lBdUJoRyxNQUFNLFlBQVksR0FBbUIsRUFBRSxJQUFJLEVBQUUsR0FBRyxDQUFDLFFBQVEsQ0FBQyx3QkFBd0IsRUFBRSxtQkFBbUIsQ0FBQyxFQUFFLEVBQUUsRUFBRSwrQkFBK0IsRUFBRSxDQUFDO0lBQ2hKLE1BQU0sV0FBVyxHQUFtQixFQUFFLElBQUksRUFBRSxHQUFHLENBQUMsUUFBUSxDQUFDLHVCQUF1QixFQUFFLFlBQVksQ0FBQyxFQUFFLEVBQUUsRUFBRSw0QkFBNEIsRUFBRSxDQUFDO0lBQ3BJLE1BQU0sa0JBQWtCLEdBQW1CLEVBQUUsSUFBSSxFQUFFLEdBQUcsQ0FBQyxRQUFRLENBQUMsb0JBQW9CLEVBQUUsV0FBVyxDQUFDLEVBQUUsRUFBRSxFQUFFLGlDQUFpQyxFQUFFLEdBQUcsRUFBRSxLQUFLLEVBQUUsQ0FBQztJQUN4SixNQUFNLG9CQUFvQixHQUFtQixFQUFFLElBQUksRUFBRSxHQUFHLENBQUMsUUFBUSxDQUFDLHNCQUFzQixFQUFFLGFBQWEsQ0FBQyxFQUFFLEVBQUUsRUFBRSxtQ0FBbUMsRUFBRSxHQUFHLEVBQUUsS0FBSyxFQUFFLENBQUM7SUFDaEssTUFBTSx1QkFBdUIsR0FBbUIsRUFBRSxJQUFJLEVBQUUsR0FBRyxDQUFDLFFBQVEsQ0FBQywwQkFBMEIsRUFBRSxxQkFBcUIsQ0FBQyxFQUFFLEVBQUUsRUFBRSx1Q0FBdUMsRUFBRSxHQUFHLEVBQUUsSUFBSSxFQUFFLENBQUM7SUFDbEwsTUFBTSxVQUFVLEdBQW1CLEVBQUUsSUFBSSxFQUFFLEdBQUcsQ0FBQyxRQUFRLENBQUMsc0JB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