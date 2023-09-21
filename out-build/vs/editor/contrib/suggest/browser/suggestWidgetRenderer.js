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
define(["require", "exports", "vs/base/browser/dom", "vs/base/browser/ui/iconLabel/iconLabel", "vs/base/common/codicons", "vs/base/common/themables", "vs/base/common/event", "vs/base/common/filters", "vs/base/common/lifecycle", "vs/base/common/uri", "vs/editor/common/languages", "vs/editor/common/services/getIconClasses", "vs/editor/common/services/model", "vs/editor/common/languages/language", "vs/nls!vs/editor/contrib/suggest/browser/suggestWidgetRenderer", "vs/platform/files/common/files", "vs/platform/theme/common/iconRegistry", "vs/platform/theme/common/themeService", "./suggestWidgetDetails"], function (require, exports, dom_1, iconLabel_1, codicons_1, themables_1, event_1, filters_1, lifecycle_1, uri_1, languages_1, getIconClasses_1, model_1, language_1, nls, files_1, iconRegistry_1, themeService_1, suggestWidgetDetails_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.$A6 = exports.$z6 = void 0;
    function $z6(index) {
        return `suggest-aria-id:${index}`;
    }
    exports.$z6 = $z6;
    const suggestMoreInfoIcon = (0, iconRegistry_1.$9u)('suggest-more-info', codicons_1.$Pj.chevronRight, nls.localize(0, null));
    const _completionItemColor = new class ColorExtractor {
        static { this.a = /(#([\da-fA-F]{3}){1,2}|(rgb|hsl)a\(\s*(\d{1,3}%?\s*,\s*){3}(1|0?\.\d+)\)|(rgb|hsl)\(\s*\d{1,3}%?(\s*,\s*\d{1,3}%?){2}\s*\))/; }
        static { this.b = new RegExp(`^${ColorExtractor.a.source}$`, 'i'); }
        extract(item, out) {
            if (item.textLabel.match(ColorExtractor.b)) {
                out[0] = item.textLabel;
                return true;
            }
            if (item.completion.detail && item.completion.detail.match(ColorExtractor.b)) {
                out[0] = item.completion.detail;
                return true;
            }
            if (typeof item.completion.documentation === 'string') {
                const match = ColorExtractor.a.exec(item.completion.documentation);
                if (match && (match.index === 0 || match.index + match[0].length === item.completion.documentation.length)) {
                    out[0] = match[0];
                    return true;
                }
            }
            return false;
        }
    };
    let $A6 = class $A6 {
        constructor(b, c, d, f) {
            this.b = b;
            this.c = c;
            this.d = d;
            this.f = f;
            this.a = new event_1.$fd();
            this.onDidToggleDetails = this.a.event;
            this.templateId = 'suggestion';
        }
        dispose() {
            this.a.dispose();
        }
        renderTemplate(container) {
            const disposables = new lifecycle_1.$jc();
            const root = container;
            root.classList.add('show-file-icons');
            const icon = (0, dom_1.$0O)(container, (0, dom_1.$)('.icon'));
            const colorspan = (0, dom_1.$0O)(icon, (0, dom_1.$)('span.colorspan'));
            const text = (0, dom_1.$0O)(container, (0, dom_1.$)('.contents'));
            const main = (0, dom_1.$0O)(text, (0, dom_1.$)('.main'));
            const iconContainer = (0, dom_1.$0O)(main, (0, dom_1.$)('.icon-label.codicon'));
            const left = (0, dom_1.$0O)(main, (0, dom_1.$)('span.left'));
            const right = (0, dom_1.$0O)(main, (0, dom_1.$)('span.right'));
            const iconLabel = new iconLabel_1.$KR(left, { supportHighlights: true, supportIcons: true });
            disposables.add(iconLabel);
            const parametersLabel = (0, dom_1.$0O)(left, (0, dom_1.$)('span.signature-label'));
            const qualifierLabel = (0, dom_1.$0O)(left, (0, dom_1.$)('span.qualifier-label'));
            const detailsLabel = (0, dom_1.$0O)(right, (0, dom_1.$)('span.details-label'));
            const readMore = (0, dom_1.$0O)(right, (0, dom_1.$)('span.readMore' + themables_1.ThemeIcon.asCSSSelector(suggestMoreInfoIcon)));
            readMore.title = nls.localize(1, null);
            const configureFont = () => {
                const options = this.b.getOptions();
                const fontInfo = options.get(50 /* EditorOption.fontInfo */);
                const fontFamily = fontInfo.getMassagedFontFamily();
                const fontFeatureSettings = fontInfo.fontFeatureSettings;
                const fontSize = options.get(118 /* EditorOption.suggestFontSize */) || fontInfo.fontSize;
                const lineHeight = options.get(119 /* EditorOption.suggestLineHeight */) || fontInfo.lineHeight;
                const fontWeight = fontInfo.fontWeight;
                const letterSpacing = fontInfo.letterSpacing;
                const fontSizePx = `${fontSize}px`;
                const lineHeightPx = `${lineHeight}px`;
                const letterSpacingPx = `${letterSpacing}px`;
                root.style.fontSize = fontSizePx;
                root.style.fontWeight = fontWeight;
                root.style.letterSpacing = letterSpacingPx;
                main.style.fontFamily = fontFamily;
                main.style.fontFeatureSettings = fontFeatureSettings;
                main.style.lineHeight = lineHeightPx;
                icon.style.height = lineHeightPx;
                icon.style.width = lineHeightPx;
                readMore.style.height = lineHeightPx;
                readMore.style.width = lineHeightPx;
            };
            configureFont();
            disposables.add(this.b.onDidChangeConfiguration(e => {
                if (e.hasChanged(50 /* EditorOption.fontInfo */) || e.hasChanged(118 /* EditorOption.suggestFontSize */) || e.hasChanged(119 /* EditorOption.suggestLineHeight */)) {
                    configureFont();
                }
            }));
            return { root, left, right, icon, colorspan, iconLabel, iconContainer, parametersLabel, qualifierLabel, detailsLabel, readMore, disposables };
        }
        renderElement(element, index, data) {
            const { completion } = element;
            data.root.id = $z6(index);
            data.colorspan.style.backgroundColor = '';
            const labelOptions = {
                labelEscapeNewLines: true,
                matches: (0, filters_1.$Hj)(element.score)
            };
            const color = [];
            if (completion.kind === 19 /* CompletionItemKind.Color */ && _completionItemColor.extract(element, color)) {
                // special logic for 'color' completion items
                data.icon.className = 'icon customcolor';
                data.iconContainer.className = 'icon hide';
                data.colorspan.style.backgroundColor = color[0];
            }
            else if (completion.kind === 20 /* CompletionItemKind.File */ && this.f.getFileIconTheme().hasFileIcons) {
                // special logic for 'file' completion items
                data.icon.className = 'icon hide';
                data.iconContainer.className = 'icon hide';
                const labelClasses = (0, getIconClasses_1.$x6)(this.c, this.d, uri_1.URI.from({ scheme: 'fake', path: element.textLabel }), files_1.FileKind.FILE);
                const detailClasses = (0, getIconClasses_1.$x6)(this.c, this.d, uri_1.URI.from({ scheme: 'fake', path: completion.detail }), files_1.FileKind.FILE);
                labelOptions.extraClasses = labelClasses.length > detailClasses.length ? labelClasses : detailClasses;
            }
            else if (completion.kind === 23 /* CompletionItemKind.Folder */ && this.f.getFileIconTheme().hasFolderIcons) {
                // special logic for 'folder' completion items
                data.icon.className = 'icon hide';
                data.iconContainer.className = 'icon hide';
                labelOptions.extraClasses = [
                    (0, getIconClasses_1.$x6)(this.c, this.d, uri_1.URI.from({ scheme: 'fake', path: element.textLabel }), files_1.FileKind.FOLDER),
                    (0, getIconClasses_1.$x6)(this.c, this.d, uri_1.URI.from({ scheme: 'fake', path: completion.detail }), files_1.FileKind.FOLDER)
                ].flat();
            }
            else {
                // normal icon
                data.icon.className = 'icon hide';
                data.iconContainer.className = '';
                data.iconContainer.classList.add('suggest-icon', ...themables_1.ThemeIcon.asClassNameArray(languages_1.CompletionItemKinds.toIcon(completion.kind)));
            }
            if (completion.tags && completion.tags.indexOf(1 /* CompletionItemTag.Deprecated */) >= 0) {
                labelOptions.extraClasses = (labelOptions.extraClasses || []).concat(['deprecated']);
                labelOptions.matches = [];
            }
            data.iconLabel.setLabel(element.textLabel, undefined, labelOptions);
            if (typeof completion.label === 'string') {
                data.parametersLabel.textContent = '';
                data.detailsLabel.textContent = stripNewLines(completion.detail || '');
                data.root.classList.add('string-label');
            }
            else {
                data.parametersLabel.textContent = stripNewLines(completion.label.detail || '');
                data.detailsLabel.textContent = stripNewLines(completion.label.description || '');
                data.root.classList.remove('string-label');
            }
            if (this.b.getOption(117 /* EditorOption.suggest */).showInlineDetails) {
                (0, dom_1.$dP)(data.detailsLabel);
            }
            else {
                (0, dom_1.$eP)(data.detailsLabel);
            }
            if ((0, suggestWidgetDetails_1.$u6)(element)) {
                data.right.classList.add('can-expand-details');
                (0, dom_1.$dP)(data.readMore);
                data.readMore.onmousedown = e => {
                    e.stopPropagation();
                    e.preventDefault();
                };
                data.readMore.onclick = e => {
                    e.stopPropagation();
                    e.preventDefault();
                    this.a.fire();
                };
            }
            else {
                data.right.classList.remove('can-expand-details');
                (0, dom_1.$eP)(data.readMore);
                data.readMore.onmousedown = null;
                data.readMore.onclick = null;
            }
        }
        disposeTemplate(templateData) {
            templateData.disposables.dispose();
        }
    };
    exports.$A6 = $A6;
    exports.$A6 = $A6 = __decorate([
        __param(1, model_1.$yA),
        __param(2, language_1.$ct),
        __param(3, themeService_1.$gv)
    ], $A6);
    function stripNewLines(str) {
        return str.replace(/\r\n|\r|\n/g, '');
    }
});
//# sourceMappingURL=suggestWidgetRenderer.js.map