/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/base/browser/dom", "vs/base/browser/ui/iconLabel/iconLabel", "vs/base/common/codicons", "vs/base/common/event", "vs/base/common/filters", "vs/base/common/lifecycle", "vs/base/common/themables"], function (require, exports, dom_1, iconLabel_1, codicons_1, event_1, filters_1, lifecycle_1, themables_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.$Hib = exports.$Gib = void 0;
    function $Gib(index) {
        return `simple-suggest-aria-id:${index}`;
    }
    exports.$Gib = $Gib;
    class $Hib {
        constructor() {
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
            data.root.id = $Gib(index);
            data.colorspan.style.backgroundColor = '';
            const labelOptions = {
                labelEscapeNewLines: true,
                matches: (0, filters_1.$Hj)(element.score)
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
            data.iconContainer.classList.add('suggest-icon', ...themables_1.ThemeIcon.asClassNameArray(completion.icon || codicons_1.$Pj.symbolText));
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
            (0, dom_1.$dP)(data.detailsLabel);
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
    exports.$Hib = $Hib;
    function stripNewLines(str) {
        return str.replace(/\r\n|\r|\n/g, '');
    }
});
//# sourceMappingURL=simpleSuggestWidgetRenderer.js.map