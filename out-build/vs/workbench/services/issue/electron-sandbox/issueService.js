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
define(["require", "exports", "vs/platform/issue/common/issue", "vs/platform/theme/common/themeService", "vs/platform/theme/common/colorRegistry", "vs/workbench/common/theme", "vs/platform/extensionManagement/common/extensionManagement", "vs/workbench/services/extensionManagement/common/extensionManagement", "vs/base/browser/browser", "vs/workbench/services/issue/common/issue", "vs/workbench/services/environment/electron-sandbox/environmentService", "vs/base/common/process", "vs/platform/product/common/productService", "vs/workbench/services/assignment/common/assignmentService", "vs/workbench/services/authentication/common/authentication", "vs/platform/workspace/common/workspaceTrust", "vs/workbench/services/integrity/common/integrity", "vs/base/parts/sandbox/electron-sandbox/globals", "vs/base/common/cancellation", "vs/platform/instantiation/common/extensions"], function (require, exports, issue_1, themeService_1, colorRegistry_1, theme_1, extensionManagement_1, extensionManagement_2, browser_1, issue_2, environmentService_1, process_1, productService_1, assignmentService_1, authentication_1, workspaceTrust_1, integrity_1, globals_1, cancellation_1, extensions_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.$B_b = exports.$A_b = void 0;
    let $A_b = class $A_b {
        constructor(b, c, d, f, g, h, i, j, k, l) {
            this.b = b;
            this.c = c;
            this.d = d;
            this.f = f;
            this.g = g;
            this.h = h;
            this.i = i;
            this.j = j;
            this.k = k;
            this.l = l;
            this.a = new Map();
            globals_1.$M.on('vscode:triggerIssueUriRequestHandler', async (event, request) => {
                const result = await this.m(request.extensionId, cancellation_1.CancellationToken.None);
                globals_1.$M.send(request.replyChannel, result.toString());
            });
        }
        async openReporter(dataOverrides = {}) {
            const extensionData = [];
            try {
                const extensions = await this.d.getInstalled();
                const enabledExtensions = extensions.filter(extension => this.f.isEnabled(extension) || (dataOverrides.extensionId && extension.identifier.id === dataOverrides.extensionId));
                extensionData.push(...enabledExtensions.map((extension) => {
                    const { manifest } = extension;
                    const manifestKeys = manifest.contributes ? Object.keys(manifest.contributes) : [];
                    const isTheme = !manifest.main && !manifest.browser && manifestKeys.length === 1 && manifestKeys[0] === 'themes';
                    const isBuiltin = extension.type === 0 /* ExtensionType.System */;
                    return {
                        name: manifest.name,
                        publisher: manifest.publisher,
                        version: manifest.version,
                        repositoryUrl: manifest.repository && manifest.repository.url,
                        bugsUrl: manifest.bugs && manifest.bugs.url,
                        hasIssueUriRequestHandler: this.a.has(extension.identifier.id.toLowerCase()),
                        displayName: manifest.displayName,
                        id: extension.identifier.id,
                        isTheme,
                        isBuiltin,
                    };
                }));
            }
            catch (e) {
                extensionData.push({
                    name: 'Workbench Issue Service',
                    publisher: 'Unknown',
                    version: '0.0.0',
                    repositoryUrl: undefined,
                    bugsUrl: undefined,
                    displayName: `Extensions not loaded: ${e}`,
                    id: 'workbench.issue',
                    isTheme: false,
                    isBuiltin: true
                });
            }
            const experiments = await this.j.getCurrentExperiments();
            let githubAccessToken = '';
            try {
                const githubSessions = await this.k.getSessions('github');
                const potentialSessions = githubSessions.filter(session => session.scopes.includes('repo'));
                githubAccessToken = potentialSessions[0]?.accessToken;
            }
            catch (e) {
                // Ignore
            }
            // air on the side of caution and have false be the default
            let isUnsupported = false;
            try {
                isUnsupported = !(await this.l.isPure()).isPure;
            }
            catch (e) {
                // Ignore
            }
            const theme = this.c.getColorTheme();
            const issueReporterData = Object.assign({
                styles: $B_b(theme),
                zoomLevel: (0, browser_1.$YN)(),
                enabledExtensions: extensionData,
                experiments: experiments?.join('\n'),
                restrictedMode: !this.h.isWorkspaceTrusted(),
                isUnsupported,
                githubAccessToken
            }, dataOverrides);
            return this.b.openReporter(issueReporterData);
        }
        openProcessExplorer() {
            const theme = this.c.getColorTheme();
            const data = {
                pid: this.g.mainPid,
                zoomLevel: (0, browser_1.$YN)(),
                styles: {
                    backgroundColor: getColor(theme, colorRegistry_1.$ww),
                    color: getColor(theme, colorRegistry_1.$xw),
                    listHoverBackground: getColor(theme, colorRegistry_1.$Gx),
                    listHoverForeground: getColor(theme, colorRegistry_1.$Hx),
                    listFocusBackground: getColor(theme, colorRegistry_1.$ux),
                    listFocusForeground: getColor(theme, colorRegistry_1.$vx),
                    listFocusOutline: getColor(theme, colorRegistry_1.$wx),
                    listActiveSelectionBackground: getColor(theme, colorRegistry_1.$yx),
                    listActiveSelectionForeground: getColor(theme, colorRegistry_1.$zx),
                    listHoverOutline: getColor(theme, colorRegistry_1.$Bv),
                    scrollbarShadowColor: getColor(theme, colorRegistry_1.$fw),
                    scrollbarSliderActiveBackgroundColor: getColor(theme, colorRegistry_1.$iw),
                    scrollbarSliderBackgroundColor: getColor(theme, colorRegistry_1.$gw),
                    scrollbarSliderHoverBackgroundColor: getColor(theme, colorRegistry_1.$hw),
                },
                platform: process_1.$3d,
                applicationName: this.i.applicationName
            };
            return this.b.openProcessExplorer(data);
        }
        registerIssueUriRequestHandler(extensionId, handler) {
            this.a.set(extensionId.toLowerCase(), handler);
            return {
                dispose: () => this.a.delete(extensionId)
            };
        }
        async m(extensionId, token) {
            const handler = this.a.get(extensionId);
            if (!handler) {
                throw new Error(`No issue uri request handler registered for extension '${extensionId}'`);
            }
            return handler.provideIssueUrl(token);
        }
    };
    exports.$A_b = $A_b;
    exports.$A_b = $A_b = __decorate([
        __param(0, issue_1.$qtb),
        __param(1, themeService_1.$gv),
        __param(2, extensionManagement_1.$2n),
        __param(3, extensionManagement_2.$icb),
        __param(4, environmentService_1.$1$b),
        __param(5, workspaceTrust_1.$$z),
        __param(6, productService_1.$kj),
        __param(7, assignmentService_1.$drb),
        __param(8, authentication_1.$3I),
        __param(9, integrity_1.$b3b)
    ], $A_b);
    function $B_b(theme) {
        return {
            backgroundColor: getColor(theme, theme_1.$Iab),
            color: getColor(theme, colorRegistry_1.$uv),
            textLinkColor: getColor(theme, colorRegistry_1.$Ev),
            textLinkActiveForeground: getColor(theme, colorRegistry_1.$Fv),
            inputBackground: getColor(theme, colorRegistry_1.$Mv),
            inputForeground: getColor(theme, colorRegistry_1.$Nv),
            inputBorder: getColor(theme, colorRegistry_1.$Ov),
            inputActiveBorder: getColor(theme, colorRegistry_1.$Pv),
            inputErrorBorder: getColor(theme, colorRegistry_1.$3v),
            inputErrorBackground: getColor(theme, colorRegistry_1.$1v),
            inputErrorForeground: getColor(theme, colorRegistry_1.$2v),
            buttonBackground: getColor(theme, colorRegistry_1.$0v),
            buttonForeground: getColor(theme, colorRegistry_1.$8v),
            buttonHoverBackground: getColor(theme, colorRegistry_1.$$v),
            sliderActiveColor: getColor(theme, colorRegistry_1.$iw),
            sliderBackgroundColor: getColor(theme, colorRegistry_1.$gw),
            sliderHoverColor: getColor(theme, colorRegistry_1.$hw),
        };
    }
    exports.$B_b = $B_b;
    function getColor(theme, key) {
        const color = theme.getColor(key);
        return color ? color.toString() : undefined;
    }
    (0, extensions_1.$mr)(issue_2.$rtb, $A_b, 1 /* InstantiationType.Delayed */);
});
//# sourceMappingURL=issueService.js.map