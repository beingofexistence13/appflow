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
define(["require", "exports", "vs/base/common/cancellation", "vs/base/common/errors", "vs/base/common/htmlContent", "vs/base/common/keybindingParser", "vs/base/common/strings", "vs/base/common/uri", "vs/base/common/uuid", "vs/editor/common/languages", "vs/editor/common/languages/supports/tokenization", "vs/editor/common/languages/language", "vs/nls!vs/workbench/contrib/update/browser/releaseNotesEditor", "vs/platform/environment/common/environment", "vs/platform/keybinding/common/keybinding", "vs/platform/opener/common/opener", "vs/platform/product/common/productService", "vs/platform/request/common/request", "vs/workbench/contrib/markdown/browser/markdownDocumentRenderer", "vs/workbench/contrib/webviewPanel/browser/webviewWorkbenchService", "vs/workbench/services/editor/common/editorGroupsService", "vs/workbench/services/editor/common/editorService", "vs/workbench/services/extensions/common/extensions", "vs/platform/telemetry/common/telemetryUtils", "vs/platform/configuration/common/configuration", "vs/base/common/lifecycle", "vs/css!./media/releasenoteseditor"], function (require, exports, cancellation_1, errors_1, htmlContent_1, keybindingParser_1, strings_1, uri_1, uuid_1, languages_1, tokenization_1, language_1, nls, environment_1, keybinding_1, opener_1, productService_1, request_1, markdownDocumentRenderer_1, webviewWorkbenchService_1, editorGroupsService_1, editorService_1, extensions_1, telemetryUtils_1, configuration_1, lifecycle_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.$rYb = void 0;
    let $rYb = class $rYb {
        constructor(f, g, h, i, j, k, l, m, n, o, p) {
            this.f = f;
            this.g = g;
            this.h = h;
            this.i = i;
            this.j = j;
            this.k = k;
            this.l = l;
            this.m = m;
            this.n = n;
            this.o = o;
            this.p = p;
            this.a = new Map();
            this.b = undefined;
            this.d = new lifecycle_1.$jc();
            languages_1.$bt.onDidChange(async () => {
                if (!this.b || !this.c) {
                    return;
                }
                const html = await this.t(this.c);
                if (this.b) {
                    this.b.webview.setHtml(html);
                }
            });
            k.onDidChangeConfiguration(this.u, this, this.d);
            n.onDidChangeActiveWebviewEditor(this.v, this, this.d);
        }
        async show(version) {
            const releaseNoteText = await this.q(version);
            this.c = releaseNoteText;
            const html = await this.t(releaseNoteText);
            const title = nls.localize(0, null, version);
            const activeEditorPane = this.l.activeEditorPane;
            if (this.b) {
                this.b.setName(title);
                this.b.webview.setHtml(html);
                this.n.revealWebview(this.b, activeEditorPane ? activeEditorPane.group : this.m.activeGroup, false);
            }
            else {
                this.b = this.n.openWebview({
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
                }, 'releaseNotes', title, { group: editorService_1.$0C, preserveFocus: false });
                this.b.webview.onDidClickLink(uri => this.r(uri_1.URI.parse(uri)));
                const disposables = new lifecycle_1.$jc();
                disposables.add(this.b.webview.onMessage(e => {
                    if (e.message.type === 'showReleaseNotes') {
                        this.k.updateValue('update.showReleaseNotes', e.message.value);
                    }
                }));
                disposables.add(this.b.onWillDispose(() => {
                    disposables.dispose();
                    this.b = undefined;
                }));
                this.b.webview.setHtml(html);
            }
            return true;
        }
        async q(version) {
            const match = /^(\d+\.\d+)\./.exec(version);
            if (!match) {
                throw new Error('not found');
            }
            const versionLabel = match[1].replace(/\./g, '_');
            const baseUrl = 'https://code.visualstudio.com/raw';
            const url = `${baseUrl}/v${versionLabel}.md`;
            const unassigned = nls.localize(1, null);
            const escapeMdHtml = (text) => {
                return (0, strings_1.$pe)(text).replace(/\\/g, '\\\\');
            };
            const patchKeybindings = (text) => {
                const kb = (match, kb) => {
                    const keybinding = this.g.lookupKeybinding(kb);
                    if (!keybinding) {
                        return unassigned;
                    }
                    return keybinding.getLabel() || unassigned;
                };
                const kbstyle = (match, kb) => {
                    const keybinding = keybindingParser_1.$GS.parseKeybinding(kb);
                    if (!keybinding) {
                        return unassigned;
                    }
                    const resolvedKeybindings = this.g.resolveKeybinding(keybinding);
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
                    .replace(/kb\(([a-z.\d\-]+)\)/gi, (match, binding) => (0, htmlContent_1.$2j)(kb(match, binding)))
                    .replace(/kbstyle\(([^\)]+)\)/gi, (match, binding) => (0, htmlContent_1.$2j)(kbstyle(match, binding)));
            };
            const fetchReleaseNotes = async () => {
                let text;
                try {
                    text = await (0, request_1.$No)(await this.j.request({ url }, cancellation_1.CancellationToken.None));
                }
                catch {
                    throw new Error('Failed to fetch release notes');
                }
                if (!text || !/^#\s/.test(text)) { // release notes always starts with `#` followed by whitespace
                    throw new Error('Invalid release notes');
                }
                return patchKeybindings(text);
            };
            if (!this.a.has(version)) {
                this.a.set(version, (async () => {
                    try {
                        return await fetchReleaseNotes();
                    }
                    catch (err) {
                        this.a.delete(version);
                        throw err;
                    }
                })());
            }
            return this.a.get(version);
        }
        r(uri) {
            this.s(uri, 'ReleaseNotes')
                .then(updated => this.i.open(updated))
                .then(undefined, errors_1.$Y);
        }
        async s(uri, origin, experiment = '1') {
            if ((0, telemetryUtils_1.$ho)(this.p, this.f) && (0, telemetryUtils_1.$jo)(this.k) === 3 /* TelemetryLevel.USAGE */) {
                if (uri.scheme === 'https' && uri.authority === 'code.visualstudio.com') {
                    return uri.with({ query: `${uri.query ? uri.query + '&' : ''}utm_source=VsCode&utm_medium=${encodeURIComponent(origin)}&utm_content=${encodeURIComponent(experiment)}` });
                }
            }
            return uri;
        }
        async t(text) {
            const nonce = (0, uuid_1.$4f)();
            const content = await (0, markdownDocumentRenderer_1.$zUb)(text, this.o, this.h, false);
            const colorMap = languages_1.$bt.getColorMap();
            const css = colorMap ? (0, tokenization_1.$Rob)(colorMap) : '';
            const showReleaseNotes = Boolean(this.k.getValue('update.showReleaseNotes'));
            return `<!DOCTYPE html>
		<html>
			<head>
				<base href="https://code.visualstudio.com/raw/">
				<meta http-equiv="Content-type" content="text/html;charset=UTF-8">
				<meta http-equiv="Content-Security-Policy" content="default-src 'none'; img-src https: data:; media-src https:; style-src 'nonce-${nonce}' https://code.visualstudio.com; script-src 'nonce-${nonce}';">
				<style nonce="${nonce}">
					${markdownDocumentRenderer_1.$yUb}
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
					label.textContent = '${nls.localize(2, null)}';
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
        u(e) {
            if (e.affectsConfiguration('update.showReleaseNotes')) {
                this.w();
            }
        }
        v(input) {
            if (input && input === this.b) {
                this.w();
            }
        }
        w() {
            if (this.b) {
                this.b.webview.postMessage({
                    type: 'showReleaseNotes',
                    value: this.k.getValue('update.showReleaseNotes')
                });
            }
        }
    };
    exports.$rYb = $rYb;
    exports.$rYb = $rYb = __decorate([
        __param(0, environment_1.$Ih),
        __param(1, keybinding_1.$2D),
        __param(2, language_1.$ct),
        __param(3, opener_1.$NT),
        __param(4, request_1.$Io),
        __param(5, configuration_1.$8h),
        __param(6, editorService_1.$9C),
        __param(7, editorGroupsService_1.$5C),
        __param(8, webviewWorkbenchService_1.$hfb),
        __param(9, extensions_1.$MF),
        __param(10, productService_1.$kj)
    ], $rYb);
});
//# sourceMappingURL=releaseNotesEditor.js.map