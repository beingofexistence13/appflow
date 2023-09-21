/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/base/browser/dom", "vs/base/browser/ui/iconLabel/iconLabel", "vs/base/common/codicons", "vs/base/common/event", "vs/base/common/filters", "vs/base/common/lifecycle", "vs/base/common/themables"], function (require, exports, dom_1, iconLabel_1, codicons_1, event_1, filters_1, lifecycle_1, themables_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.SimpleSuggestWidgetItemRenderer = exports.getAriaId = void 0;
    function getAriaId(index) {
        return `simple-suggest-aria-id:${index}`;
    }
    exports.getAriaId = getAriaId;
    class SimpleSuggestWidgetItemRenderer {
        constructor() {
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
            // const readMore = append(right, $('span.readMore' + ThemeIcon.asCSSSelector(suggestMoreInfoIcon)));
            // readMore.title = nls.localize('readMore', "Read More");
            const configureFont = () => {
                // TODO: Implement
                // const options = this._editor.getOptions();
                // const fontInfo = options.get(EditorOption.fontInfo);
                const fontFamily = 'Hack'; //fontInfo.getMassagedFontFamily();
                const fontFeatureSettings = ''; //fontInfo.fontFeatureSettings;
                const fontSize = '12'; // = options.get(EditorOption.suggestFontSize) || fontInfo.fontSize;
                const lineHeight = '20'; // options.get(EditorOption.suggestLineHeight) || fontInfo.lineHeight;
                const fontWeight = 'normal'; //fontInfo.fontWeight;
                const letterSpacing = '0'; // fontInfo.letterSpacing;
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
                // readMore.style.height = lineHeightPx;
                // readMore.style.width = lineHeightPx;
            };
            configureFont();
            // data.disposables.add(this._editor.onDidChangeConfiguration(e => {
            // 	if (e.hasChanged(EditorOption.fontInfo) || e.hasChanged(EditorOption.suggestFontSize) || e.hasChanged(EditorOption.suggestLineHeight)) {
            // 		configureFont();
            // 	}
            // }));
            return { root, left, right, icon, colorspan, iconLabel, iconContainer, parametersLabel, qualifierLabel, detailsLabel, disposables };
        }
        renderElement(element, index, data) {
            const { completion } = element;
            data.root.id = getAriaId(index);
            data.colorspan.style.backgroundColor = '';
            const labelOptions = {
                labelEscapeNewLines: true,
                matches: (0, filters_1.createMatches)(element.score)
            };
            // const color: string[] = [];
            // if (completion.kind === CompletionItemKind.Color && _completionItemColor.extract(element, color)) {
            // 	// special logic for 'color' completion items
            // 	data.icon.className = 'icon customcolor';
            // 	data.iconContainer.className = 'icon hide';
            // 	data.colorspan.style.backgroundColor = color[0];
            // } else if (completion.kind === CompletionItemKind.File && this._themeService.getFileIconTheme().hasFileIcons) {
            // 	// special logic for 'file' completion items
            // 	data.icon.className = 'icon hide';
            // 	data.iconContainer.className = 'icon hide';
            // 	const labelClasses = getIconClasses(this._modelService, this._languageService, URI.from({ scheme: 'fake', path: element.textLabel }), FileKind.FILE);
            // 	const detailClasses = getIconClasses(this._modelService, this._languageService, URI.from({ scheme: 'fake', path: completion.detail }), FileKind.FILE);
            // 	labelOptions.extraClasses = labelClasses.length > detailClasses.length ? labelClasses : detailClasses;
            // } else if (completion.kind === CompletionItemKind.Folder && this._themeService.getFileIconTheme().hasFolderIcons) {
            // 	// special logic for 'folder' completion items
            // 	data.icon.className = 'icon hide';
            // 	data.iconContainer.className = 'icon hide';
            // 	labelOptions.extraClasses = [
            // 		getIconClasses(this._modelService, this._languageService, URI.from({ scheme: 'fake', path: element.textLabel }), FileKind.FOLDER),
            // 		getIconClasses(this._modelService, this._languageService, URI.from({ scheme: 'fake', path: completion.detail }), FileKind.FOLDER)
            // 	].flat();
            // } else {
            // normal icon
            data.icon.className = 'icon hide';
            data.iconContainer.className = '';
            data.iconContainer.classList.add('suggest-icon', ...themables_1.ThemeIcon.asClassNameArray(completion.icon || codicons_1.Codicon.symbolText));
            // }
            // if (completion.tags && completion.tags.indexOf(CompletionItemTag.Deprecated) >= 0) {
            // 	labelOptions.extraClasses = (labelOptions.extraClasses || []).concat(['deprecated']);
            // 	labelOptions.matches = [];
            // }
            data.iconLabel.setLabel(completion.label, undefined, labelOptions);
            // if (typeof completion.label === 'string') {
            data.parametersLabel.textContent = '';
            data.detailsLabel.textContent = stripNewLines(completion.detail || '');
            data.root.classList.add('string-label');
            // } else {
            // 	data.parametersLabel.textContent = stripNewLines(completion.label.detail || '');
            // 	data.detailsLabel.textContent = stripNewLines(completion.label.description || '');
            // 	data.root.classList.remove('string-label');
            // }
            // if (this._editor.getOption(EditorOption.suggest).showInlineDetails) {
            (0, dom_1.show)(data.detailsLabel);
            // } else {
            // 	hide(data.detailsLabel);
            // }
            // if (canExpandCompletionItem(element)) {
            // 	data.right.classList.add('can-expand-details');
            // 	show(data.readMore);
            // 	data.readMore.onmousedown = e => {
            // 		e.stopPropagation();
            // 		e.preventDefault();
            // 	};
            // 	data.readMore.onclick = e => {
            // 		e.stopPropagation();
            // 		e.preventDefault();
            // 		this._onDidToggleDetails.fire();
            // 	};
            // } else {
            data.right.classList.remove('can-expand-details');
            // hide(data.readMore);
            // data.readMore.onmousedown = null;
            // data.readMore.onclick = null;
            // }
        }
        disposeTemplate(templateData) {
            templateData.disposables.dispose();
        }
    }
    exports.SimpleSuggestWidgetItemRenderer = SimpleSuggestWidgetItemRenderer;
    function stripNewLines(str) {
        return str.replace(/\r\n|\r|\n/g, '');
    }
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoic2ltcGxlU3VnZ2VzdFdpZGdldFJlbmRlcmVyLmpzIiwic291cmNlUm9vdCI6ImZpbGU6Ly8vd29ya3NwYWNlL2FwcGZsb3cvc3JjLyIsInNvdXJjZXMiOlsidnMvd29ya2JlbmNoL3NlcnZpY2VzL3N1Z2dlc3QvYnJvd3Nlci9zaW1wbGVTdWdnZXN0V2lkZ2V0UmVuZGVyZXIudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7OztnR0FHZ0c7Ozs7O0lBWWhHLFNBQWdCLFNBQVMsQ0FBQyxLQUFhO1FBQ3RDLE9BQU8sMEJBQTBCLEtBQUssRUFBRSxDQUFDO0lBQzFDLENBQUM7SUFGRCw4QkFFQztJQTJCRCxNQUFhLCtCQUErQjtRQUE1QztZQUVrQix3QkFBbUIsR0FBRyxJQUFJLGVBQU8sRUFBUSxDQUFDO1lBQ2xELHVCQUFrQixHQUFnQixJQUFJLENBQUMsbUJBQW1CLENBQUMsS0FBSyxDQUFDO1lBRWpFLGVBQVUsR0FBRyxZQUFZLENBQUM7UUEwSnBDLENBQUM7UUF4SkEsT0FBTztZQUNOLElBQUksQ0FBQyxtQkFBbUIsQ0FBQyxPQUFPLEVBQUUsQ0FBQztRQUNwQyxDQUFDO1FBRUQsY0FBYyxDQUFDLFNBQXNCO1lBQ3BDLE1BQU0sV0FBVyxHQUFHLElBQUksMkJBQWUsRUFBRSxDQUFDO1lBRTFDLE1BQU0sSUFBSSxHQUFHLFNBQVMsQ0FBQztZQUN2QixJQUFJLENBQUMsU0FBUyxDQUFDLEdBQUcsQ0FBQyxpQkFBaUIsQ0FBQyxDQUFDO1lBRXRDLE1BQU0sSUFBSSxHQUFHLElBQUEsWUFBTSxFQUFDLFNBQVMsRUFBRSxJQUFBLE9BQUMsRUFBQyxPQUFPLENBQUMsQ0FBQyxDQUFDO1lBQzNDLE1BQU0sU0FBUyxHQUFHLElBQUEsWUFBTSxFQUFDLElBQUksRUFBRSxJQUFBLE9BQUMsRUFBQyxnQkFBZ0IsQ0FBQyxDQUFDLENBQUM7WUFFcEQsTUFBTSxJQUFJLEdBQUcsSUFBQSxZQUFNLEVBQUMsU0FBUyxFQUFFLElBQUEsT0FBQyxFQUFDLFdBQVcsQ0FB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