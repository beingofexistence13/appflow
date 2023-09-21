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
define(["require", "exports", "vs/base/common/buffer", "vs/base/common/lifecycle", "vs/base/common/uri", "vs/nls", "vs/platform/action/common/actionCommonCategories", "vs/platform/configuration/common/configuration", "vs/platform/contextkey/common/contextkey", "vs/platform/files/common/files", "vs/platform/opener/common/opener", "vs/platform/quickinput/common/quickInput", "vs/platform/terminal/common/terminal", "vs/platform/workspace/common/workspace", "vs/workbench/contrib/terminal/browser/terminalActions", "vs/workbench/contrib/terminal/browser/terminalExtensions", "vs/workbench/contrib/terminal/common/terminalContextKey"], function (require, exports, buffer_1, lifecycle_1, uri_1, nls_1, actionCommonCategories_1, configuration_1, contextkey_1, files_1, opener_1, quickInput_1, terminal_1, workspace_1, terminalActions_1, terminalExtensions_1, terminalContextKey_1) {
    "use strict";
    var DevModeContribution_1;
    Object.defineProperty(exports, "__esModule", { value: true });
    (0, terminalActions_1.registerTerminalAction)({
        id: "workbench.action.terminal.showTextureAtlas" /* TerminalCommandId.ShowTextureAtlas */,
        title: { value: (0, nls_1.localize)('workbench.action.terminal.showTextureAtlas', "Show Terminal Texture Atlas"), original: 'Show Terminal Texture Atlas' },
        category: actionCommonCategories_1.Categories.Developer,
        precondition: contextkey_1.ContextKeyExpr.or(terminalContextKey_1.TerminalContextKeys.isOpen),
        run: async (c, accessor) => {
            const fileService = accessor.get(files_1.IFileService);
            const openerService = accessor.get(opener_1.IOpenerService);
            const workspaceContextService = accessor.get(workspace_1.IWorkspaceContextService);
            const bitmap = await c.service.activeInstance?.xterm?.textureAtlas;
            if (!bitmap) {
                return;
            }
            const cwdUri = workspaceContextService.getWorkspace().folders[0].uri;
            const fileUri = uri_1.URI.joinPath(cwdUri, 'textureAtlas.png');
            const canvas = document.createElement('canvas');
            canvas.width = bitmap.width;
            canvas.height = bitmap.height;
            const ctx = canvas.getContext('bitmaprenderer');
            if (!ctx) {
                return;
            }
            ctx.transferFromImageBitmap(bitmap);
            const blob = await new Promise((res) => canvas.toBlob(res));
            if (!blob) {
                return;
            }
            await fileService.writeFile(fileUri, buffer_1.VSBuffer.wrap(new Uint8Array(await blob.arrayBuffer())));
            openerService.open(fileUri);
        }
    });
    (0, terminalActions_1.registerTerminalAction)({
        id: "workbench.action.terminal.writeDataToTerminal" /* TerminalCommandId.WriteDataToTerminal */,
        title: { value: (0, nls_1.localize)('workbench.action.terminal.writeDataToTerminal', "Write Data to Terminal"), original: 'Write Data to Terminal' },
        category: actionCommonCategories_1.Categories.Developer,
        run: async (c, accessor) => {
            const quickInputService = accessor.get(quickInput_1.IQuickInputService);
            const instance = await c.service.getActiveOrCreateInstance();
            await c.service.revealActiveTerminal();
            await instance.processReady;
            if (!instance.xterm) {
                throw new Error('Cannot write data to terminal if xterm isn\'t initialized');
            }
            const data = await quickInputService.input({
                value: '',
                placeHolder: 'Enter data, use \\x to escape',
                prompt: (0, nls_1.localize)('workbench.action.terminal.writeDataToTerminal.prompt', "Enter data to write directly to the terminal, bypassing the pty"),
            });
            if (!data) {
                return;
            }
            let escapedData = data
                .replace(/\\n/g, '\n')
                .replace(/\\r/g, '\r');
            while (true) {
                const match = escapedData.match(/\\x([0-9a-fA-F]{2})/);
                if (match === null || match.index === undefined || match.length < 2) {
                    break;
                }
                escapedData = escapedData.slice(0, match.index) + String.fromCharCode(parseInt(match[1], 16)) + escapedData.slice(match.index + 4);
            }
            const xterm = instance.xterm;
            xterm._writeText(escapedData);
        }
    });
    (0, terminalActions_1.registerTerminalAction)({
        id: "workbench.action.terminal.restartPtyHost" /* TerminalCommandId.RestartPtyHost */,
        title: { value: (0, nls_1.localize)('workbench.action.terminal.restartPtyHost', "Restart Pty Host"), original: 'Restart Pty Host' },
        category: actionCommonCategories_1.Categories.Developer,
        run: async (c, accessor) => {
            const logService = accessor.get(terminal_1.ITerminalLogService);
            const backends = Array.from(c.instanceService.getRegisteredBackends());
            const unresponsiveBackends = backends.filter(e => !e.isResponsive);
            // Restart only unresponsive backends if there are any
            const restartCandidates = unresponsiveBackends.length > 0 ? unresponsiveBackends : backends;
            for (const backend of restartCandidates) {
                logService.warn(`Restarting pty host for authority "${backend.remoteAuthority}"`);
                backend.restartPtyHost();
            }
        }
    });
    let DevModeContribution = class DevModeContribution extends lifecycle_1.DisposableStore {
        static { DevModeContribution_1 = this; }
        static { this.ID = 'terminal.devMode'; }
        static get(instance) {
            return instance.getContribution(DevModeContribution_1.ID);
        }
        constructor(instance, processManager, widgetManager, _configurationService) {
            super();
            this._configurationService = _configurationService;
            this.add(this._configurationService.onDidChangeConfiguration(e => {
                if (e.affectsConfiguration("terminal.integrated.developer.devMode" /* TerminalSettingId.DevMode */)) {
                    this._updateDevMode();
                }
            }));
        }
        xtermReady(xterm) {
            this._xterm = xterm;
            this._updateDevMode();
        }
        _updateDevMode() {
            const devMode = this._configurationService.getValue("terminal.integrated.developer.devMode" /* TerminalSettingId.DevMode */) || false;
            this._xterm?.raw.element?.classList.toggle('dev-mode', devMode);
        }
    };
    DevModeContribution = DevModeContribution_1 = __decorate([
        __param(3, configuration_1.IConfigurationService)
    ], DevModeContribution);
    (0, terminalExtensions_1.registerTerminalContribution)(DevModeContribution.ID, DevModeContribution);
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidGVybWluYWwuZGV2ZWxvcGVyLmNvbnRyaWJ1dGlvbi5qcyIsInNvdXJjZVJvb3QiOiJmaWxlOi8vL3dvcmtzcGFjZS9hcHBmbG93L3NyYy8iLCJzb3VyY2VzIjpbInZzL3dvcmtiZW5jaC9jb250cmliL3Rlcm1pbmFsQ29udHJpYi9kZXZlbG9wZXIvYnJvd3Nlci90ZXJtaW5hbC5kZXZlbG9wZXIuY29udHJpYnV0aW9uLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOzs7Z0dBR2dHOzs7Ozs7Ozs7Ozs7OztJQXNCaEcsSUFBQSx3Q0FBc0IsRUFBQztRQUN0QixFQUFFLHVGQUFvQztRQUN0QyxLQUFLLEVBQUUsRUFBRSxLQUFLLEVBQUUsSUFBQSxjQUFRLEVBQUMsNENBQTRDLEVBQUUsNkJBQTZCLENBQUMsRUFBRSxRQUFRLEVBQUUsNkJBQTZCLEVBQUU7UUFDaEosUUFBUSxFQUFFLG1DQUFVLENBQUMsU0FBUztRQUM5QixZQUFZLEVBQUUsMkJBQWMsQ0FBQyxFQUFFLENBQUMsd0NBQW1CLENBQUMsTUFBTSxDQUFDO1FBQzNELEdBQUcsRUFBRSxLQUFLLEVBQUUsQ0FBQyxFQUFFLFFBQVEsRUFBRSxFQUFFO1lBQzFCLE1BQU0sV0FBVyxHQUFHLFFBQVEsQ0FBQyxHQUFHLENBQUMsb0JBQVksQ0FBQyxDQUFDO1lBQy9DLE1BQU0sYUFBYSxHQUFHLFFBQVEsQ0FBQyxHQUFHLENBQUMsdUJBQWMsQ0FBQyxDQUFDO1lBQ25ELE1BQU0sdUJBQXVCLEdBQUcsUUFBUSxDQUFDLEdBQUcsQ0FBQyxvQ0FBd0IsQ0FBQyxDQUFDO1lBQ3ZFLE1BQU0sTUFBTSxHQUFHLE1BQU0sQ0FBQyxDQUFDLE9BQU8sQ0FBQyxjQUFjLEVBQUUsS0FBSyxFQUFFLFlBQVksQ0FBQztZQUNuRSxJQUFJLENBQUMsTUFBTSxFQUFFO2dCQUNaLE9BQU87YUFDUDtZQUNELE1BQU0sTUFBTSxHQUFHLHVCQUF1QixDQUFDLFlBQVksRUFBRSxDQUFDLE9BQU8sQ0FBQyxDQUFDLENBQUMsQ0FB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