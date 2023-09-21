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
define(["require", "exports", "vs/base/common/cancellation", "vs/base/common/errors", "vs/base/common/htmlContent", "vs/base/common/keybindingParser", "vs/base/common/strings", "vs/base/common/uri", "vs/base/common/uuid", "vs/editor/common/languages", "vs/editor/common/languages/supports/tokenization", "vs/editor/common/languages/language", "vs/nls", "vs/platform/environment/common/environment", "vs/platform/keybinding/common/keybinding", "vs/platform/opener/common/opener", "vs/platform/product/common/productService", "vs/platform/request/common/request", "vs/workbench/contrib/markdown/browser/markdownDocumentRenderer", "vs/workbench/contrib/webviewPanel/browser/webviewWorkbenchService", "vs/workbench/services/editor/common/editorGroupsService", "vs/workbench/services/editor/common/editorService", "vs/workbench/services/extensions/common/extensions", "vs/platform/telemetry/common/telemetryUtils", "vs/platform/configuration/common/configuration", "vs/base/common/lifecycle", "vs/css!./media/releasenoteseditor"], function (require, exports, cancellation_1, errors_1, htmlContent_1, keybindingParser_1, strings_1, uri_1, uuid_1, languages_1, tokenization_1, language_1, nls, environment_1, keybinding_1, opener_1, productService_1, request_1, markdownDocumentRenderer_1, webviewWorkbenchService_1, editorGroupsService_1, editorService_1, extensions_1, telemetryUtils_1, configuration_1, lifecycle_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.ReleaseNotesManager = void 0;
    let ReleaseNotesManager = class ReleaseNotesManager {
        constructor(_environmentService, _keybindingService, _languageService, _openerService, _requestService, _configurationService, _editorService, _editorGroupService, _webviewWorkbenchService, _extensionService, _productService) {
            this._environmentService = _environmentService;
            this._keybindingService = _keybindingService;
            this._languageService = _languageService;
            this._openerService = _openerService;
            this._requestService = _requestService;
            this._configurationService = _configurationService;
            this._editorService = _editorService;
            this._editorGroupService = _editorGroupService;
            this._webviewWorkbenchService = _webviewWorkbenchService;
            this._extensionService = _extensionService;
            this._productService = _productService;
            this._releaseNotesCache = new Map();
            this._currentReleaseNotes = undefined;
            this.disposables = new lifecycle_1.DisposableStore();
            languages_1.TokenizationRegistry.onDidChange(async () => {
                if (!this._currentReleaseNotes || !this._lastText) {
                    return;
                }
                const html = await this.renderBody(this._lastText);
                if (this._currentReleaseNotes) {
                    this._currentReleaseNotes.webview.setHtml(html);
                }
            });
            _configurationService.onDidChangeConfiguration(this.onDidChangeConfiguration, this, this.disposables);
            _webviewWorkbenchService.onDidChangeActiveWebviewEditor(this.onDidChangeActiveWebviewEditor, this, this.disposables);
        }
        async show(version) {
            const releaseNoteText = await this.loadReleaseNotes(version);
            this._lastText = releaseNoteText;
            const html = await this.renderBody(releaseNoteText);
            const title = nls.localize('releaseNotesInputName', "Release Notes: {0}", version);
            const activeEditorPane = this._editorService.activeEditorPane;
            if (this._currentReleaseNotes) {
                this._currentReleaseNotes.setName(title);
                this._currentReleaseNotes.webview.setHtml(html);
                this._webviewWorkbenchService.revealWebview(this._currentReleaseNotes, activeEditorPane ? activeEditorPane.group : this._editorGroupService.activeGroup, false);
            }
            else {
                this._currentReleaseNotes = this._webviewWorkbenchService.openWebview({
                    title,
                    options: {
                        tryRestoreScrollPosition: true,
                        enableFindWidget: true,
                        disableServiceWorker: true,
                    },
                    contentOptions: {
                        localResourceRoots: [],
                        allowScripts: true
                    },
                    extension: undefined
                }, 'releaseNotes', title, { group: editorService_1.ACTIVE_GROUP, preserveFocus: false });
                this._currentReleaseNotes.webview.onDidClickLink(uri => this.onDidClickLink(uri_1.URI.parse(uri)));
                const disposables = new lifecycle_1.DisposableStore();
                disposables.add(this._currentReleaseNotes.webview.onMessage(e => {
                    if (e.message.type === 'showReleaseNotes') {
                        this._configurationService.updateValue('update.showReleaseNotes', e.message.value);
                    }
                }));
                disposables.add(this._currentReleaseNotes.onWillDispose(() => {
                    disposables.dispose();
                    this._currentReleaseNotes = undefined;
                }));
                this._currentReleaseNotes.webview.setHtml(html);
            }
            return true;
        }
        async loadReleaseNotes(version) {
            const match = /^(\d+\.\d+)\./.exec(version);
            if (!match) {
                throw new Error('not found');
            }
            const versionLabel = match[1].replace(/\./g, '_');
            const baseUrl = 'https://code.visualstudio.com/raw';
            const url = `${baseUrl}/v${versionLabel}.md`;
            const unassigned = nls.localize('unassigned', "unassigned");
            const escapeMdHtml = (text) => {
                return (0, strings_1.escape)(text).replace(/\\/g, '\\\\');
            };
            const patchKeybindings = (text) => {
                const kb = (match, kb) => {
                    const keybinding = this._keybindingService.lookupKeybinding(kb);
                    if (!keybinding) {
                        return unassigned;
                    }
                    return keybinding.getLabel() || unassigned;
                };
                const kbstyle = (match, kb) => {
                    const keybinding = keybindingParser_1.KeybindingParser.parseKeybinding(kb);
                    if (!keybinding) {
                        return unassigned;
                    }
                    const resolvedKeybindings = this._keybindingService.resolveKeybinding(keybinding);
                    if (resolvedKeybindings.length === 0) {
                        return unassigned;
                    }
                    return resolvedKeybindings[0].getLabel() || unassigned;
                };
                const kbCode = (match, binding) => {
                    const resolved = kb(match, binding);
                    return resolved ? `<code title="${binding}">${escapeMdHtml(resolved)}</code>` : resolved;
                };
                const kbstyleCode = (match, binding) => {
                    const resolved = kbstyle(match, binding);
                    return resolved ? `<code title="${binding}">${escapeMdHtml(resolved)}</code>` : resolved;
                };
                return text
                    .replace(/`kb\(([a-z.\d\-]+)\)`/gi, kbCode)
                    .replace(/`kbstyle\(([^\)]+)\)`/gi, kbstyleCode)
                    .replace(/kb\(([a-z.\d\-]+)\)/gi, (match, binding) => (0, htmlContent_1.escapeMarkdownSyntaxTokens)(kb(match, binding)))
                    .replace(/kbstyle\(([^\)]+)\)/gi, (match, binding) => (0, htmlContent_1.escapeMarkdownSyntaxTokens)(kbstyle(match, binding)));
            };
            const fetchReleaseNotes = async () => {
                let text;
                try {
                    text = await (0, request_1.asTextOrError)(await this._requestService.request({ url }, cancellation_1.CancellationToken.None));
                }
                catch {
                    throw new Error('Failed to fetch release notes');
                }
                if (!text || !/^#\s/.test(text)) { // release notes always starts with `#` followed by whitespace
                    throw new Error('Invalid release notes');
                }
                return patchKeybindings(text);
            };
            if (!this._releaseNotesCache.has(version)) {
                this._releaseNotesCache.set(version, (async () => {
                    try {
                        return await fetchReleaseNotes();
                    }
                    catch (err) {
                        this._releaseNotesCache.delete(version);
                        throw err;
                    }
                })());
            }
            return this._releaseNotesCache.get(version);
        }
        onDidClickLink(uri) {
            this.addGAParameters(uri, 'ReleaseNotes')
                .then(updated => this._openerService.open(updated))
                .then(undefined, errors_1.onUnexpectedError);
        }
        async addGAParameters(uri, origin, experiment = '1') {
            if ((0, telemetryUtils_1.supportsTelemetry)(this._productService, this._environmentService) && (0, telemetryUtils_1.getTelemetryLevel)(this._configurationService) === 3 /* TelemetryLevel.USAGE */) {
                if (uri.scheme === 'https' && uri.authority === 'code.visualstudio.com') {
                    return uri.with({ query: `${uri.query ? uri.query + '&' : ''}utm_source=VsCode&utm_medium=${encodeURIComponent(origin)}&utm_content=${encodeURIComponent(experiment)}` });
                }
            }
            return uri;
        }
        async renderBody(text) {
            const nonce = (0, uuid_1.generateUuid)();
            const content = await (0, markdownDocumentRenderer_1.renderMarkdownDocument)(text, this._extensionService, this._languageService, false);
            const colorMap = languages_1.TokenizationRegistry.getColorMap();
            const css = colorMap ? (0, tokenization_1.generateTokensCSSForColorMap)(colorMap) : '';
            const showReleaseNotes = Boolean(this._configurationService.getValue('update.showReleaseNotes'));
            return `<!DOCTYPE html>
		<html>
			<head>
				<base href="https://code.visualstudio.com/raw/">
				<meta http-equiv="Content-type" content="text/html;charset=UTF-8">
				<meta http-equiv="Content-Security-Policy" content="default-src 'none'; img-src https: data:; media-src https:; style-src 'nonce-${nonce}' https://code.visualstudio.com; script-src 'nonce-${nonce}';">
				<style nonce="${nonce}">
					${markdownDocumentRenderer_1.DEFAULT_MARKDOWN_STYLES}
					${css}
					header { display: flex; align-items: center; padding-top: 1em; }
				</style>
			</head>
			<body>
				${content}
				<script nonce="${nonce}">
					const vscode = acquireVsCodeApi();
					const container = document.createElement('p');
					container.style.display = 'flex';
					container.style.alignItems = 'center';

					const input = document.createElement('input');
					input.type = 'checkbox';
					input.id = 'showReleaseNotes';
					input.checked = ${showReleaseNotes};
					container.appendChild(input);

					const label = document.createElement('label');
					label.htmlFor = 'showReleaseNotes';
					label.textContent = '${nls.localize('showOnUpdate', "Show release notes after an update")}';
					container.appendChild(label);

					const beforeElement = document.querySelector("body > h1")?.nextElementSibling;
					if (beforeElement) {
						document.body.insertBefore(container, beforeElement);
					} else {
						document.body.appendChild(container);
					}

					window.addEventListener('message', event => {
						if (event.data.type === 'showReleaseNotes') {
							input.checked = event.data.value;
						}
					});

					input.addEventListener('change', event => {
						vscode.postMessage({ type: 'showReleaseNotes', value: input.checked }, '*');
					});
				</script>
			</body>
		</html>`;
        }
        onDidChangeConfiguration(e) {
            if (e.affectsConfiguration('update.showReleaseNotes')) {
                this.updateWebview();
            }
        }
        onDidChangeActiveWebviewEditor(input) {
            if (input && input === this._currentReleaseNotes) {
                this.updateWebview();
            }
        }
        updateWebview() {
            if (this._currentReleaseNotes) {
                this._currentReleaseNotes.webview.postMessage({
                    type: 'showReleaseNotes',
                    value: this._configurationService.getValue('update.showReleaseNotes')
                });
            }
        }
    };
    exports.ReleaseNotesManager = ReleaseNotesManager;
    exports.ReleaseNotesManager = ReleaseNotesManager = __decorate([
        __param(0, environment_1.IEnvironmentService),
        __param(1, keybinding_1.IKeybindingService),
        __param(2, language_1.ILanguageService),
        __param(3, opener_1.IOpenerService),
        __param(4, request_1.IRequestService),
        __param(5, configuration_1.IConfigurationService),
        __param(6, editorService_1.IEditorService),
        __param(7, editorGroupsService_1.IEditorGroupsService),
        __param(8, webviewWorkbenchService_1.IWebviewWorkbenchService),
        __param(9, extensions_1.IExtensionService),
        __param(10, productService_1.IProductService)
    ], ReleaseNotesManager);
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicmVsZWFzZU5vdGVzRWRpdG9yLmpzIiwic291cmNlUm9vdCI6ImZpbGU6Ly8vd29ya3NwYWNlL2FwcGZsb3cvc3JjLyIsInNvdXJjZXMiOlsidnMvd29ya2JlbmNoL2NvbnRyaWIvdXBkYXRlL2Jyb3dzZXIvcmVsZWFzZU5vdGVzRWRpdG9yLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOzs7Z0dBR2dHOzs7Ozs7Ozs7Ozs7OztJQThCekYsSUFBTSxtQkFBbUIsR0FBekIsTUFBTSxtQkFBbUI7UUFRL0IsWUFDc0IsbUJBQXlELEVBQzFELGtCQUF1RCxFQUN6RCxnQkFBbUQsRUFDckQsY0FBK0MsRUFDOUMsZUFBaUQsRUFDM0MscUJBQTZELEVBQ3BFLGNBQStDLEVBQ3pDLG1CQUEwRCxFQUN0RCx3QkFBbUUsRUFDMUUsaUJBQXFELEVBQ3ZELGVBQWlEO1lBVjVCLHdCQUFtQixHQUFuQixtQkFBbUIsQ0FBcUI7WUFDekMsdUJBQWtCLEdBQWxCLGtCQUFrQixDQUFvQjtZQUN4QyxxQkFBZ0IsR0FBaEIsZ0JBQWdCLENBQWtCO1lBQ3BDLG1CQUFjLEdBQWQsY0FBYyxDQUFnQjtZQUM3QixvQkFBZSxHQUFmLGVBQWUsQ0FBaUI7WUFDMUIsMEJBQXFCLEdBQXJCLHFCQUFxQixDQUF1QjtZQUNuRCxtQkFBYyxHQUFkLGNBQWMsQ0FBZ0I7WUFDeEIsd0JBQW1CLEdBQW5CLG1CQUFtQixDQUFzQjtZQUNyQyw2QkFBd0IsR0FBeEIsd0JBQXdCLENBQTBCO1lBQ3pELHNCQUFpQixHQUFqQixpQkFBaUIsQ0FBbUI7WUFDdEMsb0JBQWUsR0FBZixlQUFlLENBQWlCO1lBakJsRCx1QkFBa0IsR0FBRyxJQUFJLEdBQUcsRUFBMkIsQ0FBQztZQUVqRSx5QkFBb0IsR0FBNkIsU0FBUyxDQUFDO1lBRWxELGdCQUFXLEdBQUcsSUFBSSwyQkFBZSxFQUFFLENBQUM7WUFlcEQsZ0NBQW9CLENBQUMsV0FBVyxDQUFDLEtBQUssSUFBSSxFQUFFO2dCQUMzQyxJQUFJLENBQUMsSUFB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