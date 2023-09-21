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
define(["require", "exports", "vs/base/common/uuid", "vs/editor/common/languages/supports/tokenization", "vs/editor/common/languages", "vs/workbench/contrib/markdown/browser/markdownDocumentRenderer", "vs/base/common/platform", "vs/base/common/resources", "vs/base/common/types", "vs/workbench/contrib/webview/common/webview", "vs/base/common/map", "vs/platform/files/common/files", "vs/platform/notification/common/notification", "vs/editor/common/languages/language", "vs/workbench/services/extensions/common/extensions"], function (require, exports, uuid_1, tokenization_1, languages_1, markdownDocumentRenderer_1, platform_1, resources_1, types_1, webview_1, map_1, files_1, notification_1, language_1, extensions_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.$QYb = void 0;
    let $QYb = class $QYb {
        constructor(d, f, g, h) {
            this.d = d;
            this.f = f;
            this.g = g;
            this.h = h;
            this.a = new map_1.$zi();
            this.b = new map_1.$zi();
        }
        async renderMarkdown(path, base) {
            const content = await this.j(path, base);
            const nonce = (0, uuid_1.$4f)();
            const colorMap = languages_1.$bt.getColorMap();
            const css = colorMap ? (0, tokenization_1.$Rob)(colorMap) : '';
            const inDev = document.location.protocol === 'http:';
            const imgSrcCsp = inDev ? 'img-src https: data: http:' : 'img-src https: data:';
            return `<!DOCTYPE html>
		<html>
			<head>
				<meta http-equiv="Content-type" content="text/html;charset=UTF-8">
				<meta http-equiv="Content-Security-Policy" content="default-src 'none'; ${imgSrcCsp}; media-src https:; script-src 'nonce-${nonce}'; style-src 'nonce-${nonce}';">
				<style nonce="${nonce}">
					${markdownDocumentRenderer_1.$yUb}
					${css}
					body > img {
						align-self: flex-start;
					}
					body > img[centered] {
						align-self: center;
					}
					body {
						display: flex;
						flex-direction: column;
						padding: 0;
						height: inherit;
					}
					.theme-picker-row {
						display: flex;
						justify-content: center;
						gap: 32px;
					}
					checklist {
						display: flex;
						gap: 32px;
						flex-direction: column;
					}
					checkbox {
						display: flex;
						flex-direction: column;
						align-items: center;
						margin: 5px;
						cursor: pointer;
					}
					checkbox > img {
						margin-bottom: 8px !important;
					}
					checkbox.checked > img {
						box-sizing: border-box;
					}
					checkbox.checked > img {
						outline: 2px solid var(--vscode-focusBorder);
						outline-offset: 4px;
						border-radius: 4px;
					}
					.theme-picker-link {
						margin-top: 16px;
						color: var(--vscode-textLink-foreground);
					}
					blockquote > p:first-child {
						margin-top: 0;
					}
					body > * {
						margin-block-end: 0.25em;
						margin-block-start: 0.25em;
					}
					vertically-centered {
						padding-top: 5px;
						padding-bottom: 5px;
						display: flex;
						justify-content: center;
						flex-direction: column;
					}
					html {
						height: 100%;
						padding-right: 32px;
					}
					h1 {
						font-size: 19.5px;
					}
					h2 {
						font-size: 18.5px;
					}
				</style>
			</head>
			<body>
				<vertically-centered>
					${content}
				</vertically-centered>
			</body>
			<script nonce="${nonce}">
				const vscode = acquireVsCodeApi();

				document.querySelectorAll('[when-checked]').forEach(el => {
					el.addEventListener('click', () => {
						vscode.postMessage(el.getAttribute('when-checked'));
					});
				});

				let ongoingLayout = undefined;
				const doLayout = () => {
					document.querySelectorAll('vertically-centered').forEach(element => {
						element.style.marginTop = Math.max((document.body.clientHeight - element.scrollHeight) * 3/10, 0) + 'px';
					});
					ongoingLayout = undefined;
				};

				const layout = () => {
					if (ongoingLayout) {
						clearTimeout(ongoingLayout);
					}
					ongoingLayout = setTimeout(doLayout, 0);
				};

				layout();

				document.querySelectorAll('img').forEach(element => {
					element.onload = layout;
				})

				window.addEventListener('message', event => {
					if (event.data.layoutMeNow) {
						layout();
					}
					if (event.data.enabledContextKeys) {
						document.querySelectorAll('.checked').forEach(element => element.classList.remove('checked'))
						for (const key of event.data.enabledContextKeys) {
							document.querySelectorAll('[checked-on="' + key + '"]').forEach(element => element.classList.add('checked'))
						}
					}
				});
		</script>
		</html>`;
        }
        async renderSVG(path) {
            const content = await this.i(path);
            const nonce = (0, uuid_1.$4f)();
            const colorMap = languages_1.$bt.getColorMap();
            const css = colorMap ? (0, tokenization_1.$Rob)(colorMap) : '';
            return `<!DOCTYPE html>
		<html>
			<head>
				<meta http-equiv="Content-type" content="text/html;charset=UTF-8">
				<meta http-equiv="Content-Security-Policy" content="default-src 'none'; img-src data:; style-src 'nonce-${nonce}';">
				<style nonce="${nonce}">
					${markdownDocumentRenderer_1.$yUb}
					${css}
					svg {
						position: fixed;
						height: 100%;
						width: 80%;
						left: 50%;
						top: 50%;
						max-width: 530px;
						min-width: 350px;
						transform: translate(-50%,-50%);
					}
				</style>
			</head>
			<body>
				${content}
			</body>
		</html>`;
        }
        async i(path) {
            if (!this.b.has(path)) {
                const contents = await this.k(path, false);
                this.b.set(path, contents);
            }
            return (0, types_1.$uf)(this.b.get(path));
        }
        async j(path, base) {
            if (!this.a.has(path)) {
                const contents = await this.k(path);
                const markdownContents = await (0, markdownDocumentRenderer_1.$zUb)(transformUris(contents, base), this.g, this.h, true, true);
                this.a.set(path, markdownContents);
            }
            return (0, types_1.$uf)(this.a.get(path));
        }
        async k(path, useModuleId = true) {
            try {
                const moduleId = JSON.parse(path.query).moduleId;
                if (useModuleId && moduleId) {
                    const contents = await new Promise(c => {
                        require([moduleId], content => {
                            c(content.default());
                        });
                    });
                    return contents;
                }
            }
            catch { }
            try {
                const localizedPath = path.with({ path: path.path.replace(/\.md$/, `.nls.${platform_1.$v}.md`) });
                const generalizedLocale = platform_1.$v?.replace(/-.*$/, '');
                const generalizedLocalizedPath = path.with({ path: path.path.replace(/\.md$/, `.nls.${generalizedLocale}.md`) });
                const fileExists = (file) => this.d
                    .stat(file)
                    .then((stat) => !!stat.size) // Double check the file actually has content for fileSystemProviders that fake `stat`. #131809
                    .catch(() => false);
                const [localizedFileExists, generalizedLocalizedFileExists] = await Promise.all([
                    fileExists(localizedPath),
                    fileExists(generalizedLocalizedPath),
                ]);
                const bytes = await this.d.readFile(localizedFileExists
                    ? localizedPath
                    : generalizedLocalizedFileExists
                        ? generalizedLocalizedPath
                        : path);
                return bytes.value.toString();
            }
            catch (e) {
                this.f.error('Error reading markdown document at `' + path + '`: ' + e);
                return '';
            }
        }
    };
    exports.$QYb = $QYb;
    exports.$QYb = $QYb = __decorate([
        __param(0, files_1.$6j),
        __param(1, notification_1.$Yu),
        __param(2, extensions_1.$MF),
        __param(3, language_1.$ct)
    ], $QYb);
    const transformUri = (src, base) => {
        const path = (0, resources_1.$ig)(base, src);
        return (0, webview_1.$Yob)(path).toString(true);
    };
    const transformUris = (content, base) => content
        .replace(/src="([^"]*)"/g, (_, src) => {
        if (src.startsWith('https://')) {
            return `src="${src}"`;
        }
        return `src="${transformUri(src, base)}"`;
    })
        .replace(/!\[([^\]]*)\]\(([^)]*)\)/g, (_, title, src) => {
        if (src.startsWith('https://')) {
            return `![${title}](${src})`;
        }
        return `![${title}](${transformUri(src, base)})`;
    });
});
//# sourceMappingURL=gettingStartedDetailsRenderer.js.map