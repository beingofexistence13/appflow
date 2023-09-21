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
define(["require", "exports", "vs/base/common/buffer", "vs/base/common/lifecycle", "vs/base/common/uri", "vs/nls!vs/workbench/contrib/terminalContrib/developer/browser/terminal.developer.contribution", "vs/platform/action/common/actionCommonCategories", "vs/platform/configuration/common/configuration", "vs/platform/contextkey/common/contextkey", "vs/platform/files/common/files", "vs/platform/opener/common/opener", "vs/platform/quickinput/common/quickInput", "vs/platform/terminal/common/terminal", "vs/platform/workspace/common/workspace", "vs/workbench/contrib/terminal/browser/terminalActions", "vs/workbench/contrib/terminal/browser/terminalExtensions", "vs/workbench/contrib/terminal/common/terminalContextKey"], function (require, exports, buffer_1, lifecycle_1, uri_1, nls_1, actionCommonCategories_1, configuration_1, contextkey_1, files_1, opener_1, quickInput_1, terminal_1, workspace_1, terminalActions_1, terminalExtensions_1, terminalContextKey_1) {
    "use strict";
    var DevModeContribution_1;
    Object.defineProperty(exports, "__esModule", { value: true });
    (0, terminalActions_1.$HVb)({
        id: "workbench.action.terminal.showTextureAtlas" /* TerminalCommandId.ShowTextureAtlas */,
        title: { value: (0, nls_1.localize)(0, null), original: 'Show Terminal Texture Atlas' },
        category: actionCommonCategories_1.$Nl.Developer,
        precondition: contextkey_1.$Ii.or(terminalContextKey_1.TerminalContextKeys.isOpen),
        run: async (c, accessor) => {
            const fileService = accessor.get(files_1.$6j);
            const openerService = accessor.get(opener_1.$NT);
            const workspaceContextService = accessor.get(workspace_1.$Kh);
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
            await fileService.writeFile(fileUri, buffer_1.$Fd.wrap(new Uint8Array(await blob.arrayBuffer())));
            openerService.open(fileUri);
        }
    });
    (0, terminalActions_1.$HVb)({
        id: "workbench.action.terminal.writeDataToTerminal" /* TerminalCommandId.WriteDataToTerminal */,
        title: { value: (0, nls_1.localize)(1, null), original: 'Write Data to Terminal' },
        category: actionCommonCategories_1.$Nl.Developer,
        run: async (c, accessor) => {
            const quickInputService = accessor.get(quickInput_1.$Gq);
            const instance = await c.service.getActiveOrCreateInstance();
            await c.service.revealActiveTerminal();
            await instance.processReady;
            if (!instance.xterm) {
                throw new Error('Cannot write data to terminal if xterm isn\'t initialized');
            }
            const data = await quickInputService.input({
                value: '',
                placeHolder: 'Enter data, use \\x to escape',
                prompt: (0, nls_1.localize)(2, null),
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
    (0, terminalActions_1.$HVb)({
        id: "workbench.action.terminal.restartPtyHost" /* TerminalCommandId.RestartPtyHost */,
        title: { value: (0, nls_1.localize)(3, null), original: 'Restart Pty Host' },
        category: actionCommonCategories_1.$Nl.Developer,
        run: async (c, accessor) => {
            const logService = accessor.get(terminal_1.$Zq);
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
    let DevModeContribution = class DevModeContribution extends lifecycle_1.$jc {
        static { DevModeContribution_1 = this; }
        static { this.ID = 'terminal.devMode'; }
        static get(instance) {
            return instance.getContribution(DevModeContribution_1.ID);
        }
        constructor(instance, processManager, widgetManager, b) {
            super();
            this.b = b;
            this.add(this.b.onDidChangeConfiguration(e => {
                if (e.affectsConfiguration("terminal.integrated.developer.devMode" /* TerminalSettingId.DevMode */)) {
                    this.h();
                }
            }));
        }
        xtermReady(xterm) {
            this.a = xterm;
            this.h();
        }
        h() {
            const devMode = this.b.getValue("terminal.integrated.developer.devMode" /* TerminalSettingId.DevMode */) || false;
            this.a?.raw.element?.classList.toggle('dev-mode', devMode);
        }
    };
    DevModeContribution = DevModeContribution_1 = __decorate([
        __param(3, configuration_1.$8h)
    ], DevModeContribution);
    (0, terminalExtensions_1.$BKb)(DevModeContribution.ID, DevModeContribution);
});
//# sourceMappingURL=terminal.developer.contribution.js.map