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
define(["require", "exports", "vs/base/browser/dom", "vs/base/browser/ui/iconLabel/iconLabel", "vs/base/common/codicons", "vs/base/common/themables", "vs/base/common/event", "vs/base/common/filters", "vs/base/common/lifecycle", "vs/base/common/uri", "vs/editor/common/languages", "vs/editor/common/services/getIconClasses", "vs/editor/common/services/model", "vs/editor/common/languages/language", "vs/nls", "vs/platform/files/common/files", "vs/platform/theme/common/iconRegistry", "vs/platform/theme/common/themeService", "./suggestWidgetDetails"], function (require, exports, dom_1, iconLabel_1, codicons_1, themables_1, event_1, filters_1, lifecycle_1, uri_1, languages_1, getIconClasses_1, model_1, language_1, nls, files_1, iconRegistry_1, themeService_1, suggestWidgetDetails_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.ItemRenderer = exports.getAriaId = void 0;
    function getAriaId(index) {
        return `suggest-aria-id:${index}`;
    }
    exports.getAriaId = getAriaId;
    const suggestMoreInfoIcon = (0, iconRegistry_1.registerIcon)('suggest-more-info', codicons_1.Codicon.chevronRight, nls.localize('suggestMoreInfoIcon', 'Icon for more information in the suggest widget.'));
    const _completionItemColor = new class ColorExtractor {
        static { this._regexRelaxed = /(#([\da-fA-F]{3}){1,2}|(rgb|hsl)a\(\s*(\d{1,3}%?\s*,\s*){3}(1|0?\.\d+)\)|(rgb|hsl)\(\s*\d{1,3}%?(\s*,\s*\d{1,3}%?){2}\s*\))/; }
        static { this._regexStrict = new RegExp(`^${ColorExtractor._regexRelaxed.source}$`, 'i'); }
        extract(item, out) {
            if (item.textLabel.match(ColorExtractor._regexStrict)) {
                out[0] = item.textLabel;
                return true;
            }
            if (item.completion.detail && item.completion.detail.match(ColorExtractor._regexStrict)) {
                out[0] = item.completion.detail;
                return true;
            }
            if (typeof item.completion.documentation === 'string') {
                const match = ColorExtractor._regexRelaxed.exec(item.completion.documentation);
                if (match && (match.index === 0 || match.index + match[0].length === item.completion.documentation.length)) {
                    out[0] = match[0];
                    return true;
                }
            }
            return false;
        }
    };
    let ItemRenderer = class ItemRenderer {
        constructor(_editor, _modelService, _languageService, _themeService) {
            this._editor = _editor;
            this._modelService = _modelService;
            this._languageService = _languageService;
            this._themeService = _themeService;
            this._onDidToggleDetails = new event_1.Emitter();
            this.onDidToggleDetails = this._onDidToggleDetails.event;
            this.templateId = 'suggestion';
        }
        dispose() {
            this._onDidToggleDetails.dispose();
        }
        renderTemplate(container) {
            const disposables = new lifecycle_1.DisposableStore();
            const root = container;
            root.classList.add('show-file-icons');
            const icon = (0, dom_1.append)(container, (0, dom_1.$)('.icon'));
            const colorspan = (0, dom_1.append)(icon, (0, dom_1.$)('span.colorspan'));
            const text = (0, dom_1.append)(container, (0, dom_1.$)('.contents'));
            const main = (0, dom_1.append)(text, (0, dom_1.$)('.main'));
            const iconContainer = (0, dom_1.append)(main, (0, dom_1.$)('.icon-label.codicon'));
            const left = (0, dom_1.append)(main, (0, dom_1.$)('span.left'));
            const right = (0, dom_1.append)(main, (0, dom_1.$)('span.right'));
            const iconLabel = new iconLabel_1.IconLabel(left, { supportHighlights: true, supportIcons: true });
            disposables.add(iconLabel);
            const parametersLabel = (0, dom_1.append)(left, (0, dom_1.$)('span.signature-label'));
            const qualifierLabel = (0, dom_1.append)(left, (0, dom_1.$)('span.qualifier-label'));
            const detailsLabel = (0, dom_1.append)(right, (0, dom_1.$)('span.details-label'));
            const readMore = (0, dom_1.append)(right, (0, dom_1.$)('span.readMore' + themables_1.ThemeIcon.asCSSSelector(suggestMoreInfoIcon)));
            readMore.title = nls.localize('readMore', "Read More");
            const configureFont = () => {
                const options = this._editor.getOptions();
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
            disposables.add(this._editor.onDidChangeConfiguration(e => {
                if (e.hasChanged(50 /* EditorOption.fontInfo */) || e.hasChanged(118 /* EditorOption.suggestFontSize */) || e.hasChanged(119 /* EditorOption.suggestLineHeight */)) {
                    configureFont();
                }
            }));
            return { root, left, right, icon, colorspan, iconLabel, iconContainer, parametersLabel, qualifierLabel, detailsLabel, readMore, disposables };
        }
        renderElement(element, index, data) {
            const { completion } = element;
            data.root.id = getAriaId(index);
            data.colorspan.style.backgroundColor = '';
            const labelOptions = {
                labelEscapeNewLines: true,
                matches: (0, filters_1.createMatches)(element.score)
            };
            const color = [];
            if (completion.kind === 19 /* CompletionItemKind.Color */ && _completionItemColor.extract(element, color)) {
                // special logic for 'color' completion items
                data.icon.className = 'icon customcolor';
                data.iconContainer.className = 'icon hide';
                data.colorspan.style.backgroundColor = color[0];
            }
            else if (completion.kind === 20 /* CompletionItemKind.File */ && this._themeService.getFileIconTheme().hasFileIcons) {
                // special logic for 'file' completion items
                data.icon.className = 'icon hide';
                data.iconContainer.className = 'icon hide';
                const labelClasses = (0, getIconClasses_1.getIconClasses)(this._modelService, this._languageService, uri_1.URI.from({ scheme: 'fake', path: element.textLabel }), files_1.FileKind.FILE);
                const detailClasses = (0, getIconClasses_1.getIconClasses)(this._modelService, this._languageService, uri_1.URI.from({ scheme: 'fake', path: completion.detail }), files_1.FileKind.FILE);
                labelOptions.extraClasses = labelClasses.length > detailClasses.length ? labelClasses : detailClasses;
            }
            else if (completion.kind === 23 /* CompletionItemKind.Folder */ && this._themeService.getFileIconTheme().hasFolderIcons) {
                // special logic for 'folder' completion items
                data.icon.className = 'icon hide';
                data.iconContainer.className = 'icon hide';
                labelOptions.extraClasses = [
                    (0, getIconClasses_1.getIconClasses)(this._modelService, this._languageService, uri_1.URI.from({ scheme: 'fake', path: element.textLabel }), files_1.FileKind.FOLDER),
                    (0, getIconClasses_1.getIconClasses)(this._modelService, this._languageService, uri_1.URI.from({ scheme: 'fake', path: completion.detail }), files_1.FileKind.FOLDER)
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
            if (this._editor.getOption(117 /* EditorOption.suggest */).showInlineDetails) {
                (0, dom_1.show)(data.detailsLabel);
            }
            else {
                (0, dom_1.hide)(data.detailsLabel);
            }
            if ((0, suggestWidgetDetails_1.canExpandCompletionItem)(element)) {
                data.right.classList.add('can-expand-details');
                (0, dom_1.show)(data.readMore);
                data.readMore.onmousedown = e => {
                    e.stopPropagation();
                    e.preventDefault();
                };
                data.readMore.onclick = e => {
                    e.stopPropagation();
                    e.preventDefault();
                    this._onDidToggleDetails.fire();
                };
            }
            else {
                data.right.classList.remove('can-expand-details');
                (0, dom_1.hide)(data.readMore);
                data.readMore.onmousedown = null;
                data.readMore.onclick = null;
            }
        }
        disposeTemplate(templateData) {
            templateData.disposables.dispose();
        }
    };
    exports.ItemRenderer = ItemRenderer;
    exports.ItemRenderer = ItemRenderer = __decorate([
        __param(1, model_1.IModelService),
        __param(2, language_1.ILanguageService),
        __param(3, themeService_1.IThemeService)
    ], ItemRenderer);
    function stripNewLines(str) {
        return str.replace(/\r\n|\r|\n/g, '');
    }
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoic3VnZ2VzdFdpZGdldFJlbmRlcmVyLmpzIiwic291cmNlUm9vdCI6ImZpbGU6Ly8vd29ya3NwYWNlL2FwcGZsb3cvc3JjLyIsInNvdXJjZXMiOlsidnMvZWRpdG9yL2NvbnRyaWIvc3VnZ2VzdC9icm93c2VyL3N1Z2dlc3RXaWRnZXRSZW5kZXJlci50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7O2dHQUdnRzs7Ozs7Ozs7Ozs7Ozs7SUF3QmhHLFNBQWdCLFNBQVMsQ0FBQyxLQUFhO1FBQ3RDLE9BQU8sbUJBQW1CLEtBQUssRUFBRSxDQUFDO0lBQ25DLENBQUM7SUFGRCw4QkFFQztJQUVELE1BQU0sbUJBQW1CLEdBQUcsSUFBQSwyQkFBWSxFQUFDLG1CQUFtQixFQUFFLGtCQUFPLENBQUMsWUFBWSxFQUFFLEdBQUcsQ0FBQyxRQUFRLENBQUMscUJBQXFCLEVBQUUsa0RBQWtELENBQUMsQ0FBQyxDQUFDO0lBRTdLLE1BQU0sb0JBQW9CLEdBQUcsSUFBSSxNQUFNLGNBQWM7aUJBRXJDLGtCQUFhLEdBQUcsNkhBQTZILENBQUM7aUJBQzlJLGlCQUFZLEdBQUcsSUFBSSxNQUFNLENBQUMsSUFBSSxjQUFjLENBQUMsYUFBYSxDQUFDLE1BQU0sR0FBRyxFQUFFLEdBQUcsQ0FBQyxDQUFDO1FBRTFGLE9BQU8sQ0FBQyxJQUFvQixFQUFFLEdBQWE7WUFDMUMsSUFBSSxJQUFJLENBQUMsU0FBUyxDQUFDLEtBQUssQ0FBQyxjQUFjLENBQUMsWUFBWSxDQUFDLEVBQUU7Z0JBQ3RELEdBQUcsQ0FBQyxDQUFDLENBQUMsR0FBRyxJQUFJLENBQUMsU0FBUyxDQUFDO2dCQUN4QixPQUFPLElBQUksQ0FBQzthQUNaO1lBQ0QsSUFBSSxJQUFJLENBQUMsVUFBVSxDQUFDLE1BQU0sSUFBSSxJQUFJLENBQUMsVUFBVSxDQUFDLE1BQU0sQ0FBQyxLQUFLLENBQUMsY0FBYyxDQUFDLFlBQVksQ0FBQyxFQUFFO2dCQUN4RixHQUFHLENBQUMsQ0FBQyxDQUFDLEdBQUcsSUFBSSxD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