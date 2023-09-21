"use strict";
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
Object.defineProperty(exports, "__esModule", { value: true });
exports.pickRemoteSource = exports.getRemoteSourceActions = void 0;
const vscode_1 = require("vscode");
const decorators_1 = require("./decorators");
async function getQuickPickResult(quickpick) {
    const result = await new Promise(c => {
        quickpick.onDidAccept(() => c(quickpick.selectedItems[0]));
        quickpick.onDidHide(() => c(undefined));
        quickpick.show();
    });
    quickpick.hide();
    return result;
}
class RemoteSourceProviderQuickPick {
    constructor(provider) {
        this.provider = provider;
    }
    ensureQuickPick() {
        if (!this.quickpick) {
            this.quickpick = vscode_1.window.createQuickPick();
            this.quickpick.ignoreFocusOut = true;
            if (this.provider.supportsQuery) {
                this.quickpick.placeholder = this.provider.placeholder ?? vscode_1.l10n.t('Repository name (type to search)');
                this.quickpick.onDidChangeValue(this.onDidChangeValue, this);
            }
            else {
                this.quickpick.placeholder = this.provider.placeholder ?? vscode_1.l10n.t('Repository name');
            }
        }
    }
    onDidChangeValue() {
        this.query();
    }
    async query() {
        try {
            this.ensureQuickPick();
            this.quickpick.busy = true;
            this.quickpick.show();
            const remoteSources = await this.provider.getRemoteSources(this.quickpick?.value) || [];
            if (remoteSources.length === 0) {
                this.quickpick.items = [{
                        label: vscode_1.l10n.t('No remote repositories found.'),
                        alwaysShow: true
                    }];
            }
            else {
                this.quickpick.items = remoteSources.map(remoteSource => ({
                    label: remoteSource.icon ? `$(${remoteSource.icon}) ${remoteSource.name}` : remoteSource.name,
                    description: remoteSource.description || (typeof remoteSource.url === 'string' ? remoteSource.url : remoteSource.url[0]),
                    detail: remoteSource.detail,
                    remoteSource,
                    alwaysShow: true
                }));
            }
        }
        catch (err) {
            this.quickpick.items = [{ label: vscode_1.l10n.t('{0} Error: {1}', '$(error)', err.message), alwaysShow: true }];
            console.error(err);
        }
        finally {
            this.quickpick.busy = false;
        }
    }
    async pick() {
        await this.query();
        const result = await getQuickPickResult(this.quickpick);
        return result?.remoteSource;
    }
}
__decorate([
    (0, decorators_1.debounce)(300)
], RemoteSourceProviderQuickPick.prototype, "onDidChangeValue", null);
__decorate([
    decorators_1.throttle
], RemoteSourceProviderQuickPick.prototype, "query", null);
async function getRemoteSourceActions(model, url) {
    const providers = model.getRemoteProviders();
    const remoteSourceActions = [];
    for (const provider of providers) {
        const providerActions = await provider.getRemoteSourceActions?.(url);
        if (providerActions?.length) {
            remoteSourceActions.push(...providerActions);
        }
    }
    return remoteSourceActions;
}
exports.getRemoteSourceActions = getRemoteSourceActions;
async function pickRemoteSource(model, options = {}) {
    const quickpick = vscode_1.window.createQuickPick();
    quickpick.title = options.title;
    if (options.providerName) {
        const provider = model.getRemoteProviders()
            .filter(provider => provider.name === options.providerName)[0];
        if (provider) {
            return await pickProviderSource(provider, options);
        }
    }
    const remoteProviders = model.getRemoteProviders()
        .map(provider => ({ label: (provider.icon ? `$(${provider.icon}) ` : '') + (options.providerLabel ? options.providerLabel(provider) : provider.name), alwaysShow: true, provider }));
    const recentSources = [];
    if (options.showRecentSources) {
        for (const { provider } of remoteProviders) {
            const sources = (await provider.getRecentRemoteSources?.() ?? []).map((item) => {
                return {
                    ...item,
                    label: (item.icon ? `$(${item.icon}) ` : '') + item.name,
                    url: typeof item.url === 'string' ? item.url : item.url[0],
                };
            });
            recentSources.push(...sources);
        }
    }
    const items = [
        { kind: vscode_1.QuickPickItemKind.Separator, label: vscode_1.l10n.t('remote sources') },
        ...remoteProviders,
        { kind: vscode_1.QuickPickItemKind.Separator, label: vscode_1.l10n.t('recently opened') },
        ...recentSources.sort((a, b) => b.timestamp - a.timestamp)
    ];
    quickpick.placeholder = options.placeholder ?? (remoteProviders.length === 0
        ? vscode_1.l10n.t('Provide repository URL')
        : vscode_1.l10n.t('Provide repository URL or pick a repository source.'));
    const updatePicks = (value) => {
        if (value) {
            const label = (typeof options.urlLabel === 'string' ? options.urlLabel : options.urlLabel?.(value)) ?? vscode_1.l10n.t('URL');
            quickpick.items = [{
                    label: label,
                    description: value,
                    alwaysShow: true,
                    url: value
                },
                ...items
            ];
        }
        else {
            quickpick.items = items;
        }
    };
    quickpick.onDidChangeValue(updatePicks);
    updatePicks();
    const result = await getQuickPickResult(quickpick);
    if (result) {
        if (result.url) {
            return result.url;
        }
        else if (result.provider) {
            return await pickProviderSource(result.provider, options);
        }
    }
    return undefined;
}
exports.pickRemoteSource = pickRemoteSource;
async function pickProviderSource(provider, options = {}) {
    const quickpick = new RemoteSourceProviderQuickPick(provider);
    const remote = await quickpick.pick();
    let url;
    if (remote) {
        if (typeof remote.url === 'string') {
            url = remote.url;
        }
        else if (remote.url.length > 0) {
            url = await vscode_1.window.showQuickPick(remote.url, { ignoreFocusOut: true, placeHolder: vscode_1.l10n.t('Choose a URL to clone from.') });
        }
    }
    if (!url || !options.branch) {
        return url;
    }
    if (!provider.getBranches) {
        return { url };
    }
    const branches = await provider.getBranches(url);
    if (!branches) {
        return { url };
    }
    const branch = await vscode_1.window.showQuickPick(branches, {
        placeHolder: vscode_1.l10n.t('Branch name')
    });
    if (!branch) {
        return { url };
    }
    return { url, branch };
}
//# sourceMappingURL=remoteSource.js.map