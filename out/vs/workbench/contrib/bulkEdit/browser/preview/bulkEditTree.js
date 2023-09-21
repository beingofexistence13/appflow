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
define(["require", "exports", "vs/editor/common/services/resolverService", "vs/base/common/filters", "vs/base/browser/ui/highlightedlabel/highlightedLabel", "vs/editor/common/core/range", "vs/base/browser/dom", "vs/base/common/lifecycle", "vs/editor/common/model/textModel", "vs/workbench/contrib/bulkEdit/browser/preview/bulkEditPreview", "vs/platform/files/common/files", "vs/nls", "vs/platform/label/common/label", "vs/base/browser/ui/iconLabel/iconLabel", "vs/base/common/resources", "vs/platform/theme/common/themeService", "vs/base/common/themables", "vs/base/common/strings", "vs/base/common/uri", "vs/platform/undoRedo/common/undoRedo", "vs/editor/browser/services/bulkEditService", "vs/editor/common/languages/languageConfigurationRegistry", "vs/editor/common/languages/language", "vs/editor/common/languages/modesRegistry", "vs/editor/contrib/snippet/browser/snippetParser"], function (require, exports, resolverService_1, filters_1, highlightedLabel_1, range_1, dom, lifecycle_1, textModel_1, bulkEditPreview_1, files_1, nls_1, label_1, iconLabel_1, resources_1, themeService_1, themables_1, strings_1, uri_1, undoRedo_1, bulkEditService_1, languageConfigurationRegistry_1, language_1, modesRegistry_1, snippetParser_1) {
    "use strict";
    var CategoryElementRenderer_1, FileElementRenderer_1, TextEditElementRenderer_1;
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.BulkEditNaviLabelProvider = exports.BulkEditDelegate = exports.TextEditElementRenderer = exports.FileElementRenderer = exports.CategoryElementRenderer = exports.BulkEditIdentityProvider = exports.BulkEditAccessibilityProvider = exports.BulkEditSorter = exports.BulkEditDataSource = exports.TextEditElement = exports.FileElement = exports.CategoryElement = void 0;
    class CategoryElement {
        constructor(parent, category) {
            this.parent = parent;
            this.category = category;
        }
        isChecked() {
            const model = this.parent;
            let checked = true;
            for (const file of this.category.fileOperations) {
                for (const edit of file.originalEdits.values()) {
                    checked = checked && model.checked.isChecked(edit);
                }
            }
            return checked;
        }
        setChecked(value) {
            const model = this.parent;
            for (const file of this.category.fileOperations) {
                for (const edit of file.originalEdits.values()) {
                    model.checked.updateChecked(edit, value);
                }
            }
        }
    }
    exports.CategoryElement = CategoryElement;
    class FileElement {
        constructor(parent, edit) {
            this.parent = parent;
            this.edit = edit;
        }
        isChecked() {
            const model = this.parent instanceof CategoryElement ? this.parent.parent : this.parent;
            let checked = true;
            // only text edit children -> reflect children state
            if (this.edit.type === 1 /* BulkFileOperationType.TextEdit */) {
                checked = !this.edit.textEdits.every(edit => !model.checked.isChecked(edit.textEdit));
            }
            // multiple file edits -> reflect single state
            for (const edit of this.edit.originalEdits.values()) {
                if (edit instanceof bulkEditService_1.ResourceFileEdit) {
                    checked = checked && model.checked.isChecked(edit);
                }
            }
            // multiple categories and text change -> read all elements
            if (this.parent instanceof CategoryElement && this.edit.type === 1 /* BulkFileOperationType.TextEdit */) {
                for (const category of model.categories) {
                    for (const file of category.fileOperations) {
                        if (file.uri.toString() === this.edit.uri.toString()) {
                            for (const edit of file.originalEdits.values()) {
                                if (edit instanceof bulkEditService_1.ResourceFileEdit) {
                                    checked = checked && model.checked.isChecked(edit);
                                }
                            }
                        }
                    }
                }
            }
            return checked;
        }
        setChecked(value) {
            const model = this.parent instanceof CategoryElement ? this.parent.parent : this.parent;
            for (const edit of this.edit.originalEdits.values()) {
                model.checked.updateChecked(edit, value);
            }
            // multiple categories and file change -> update all elements
            if (this.parent instanceof CategoryElement && this.edit.type !== 1 /* BulkFileOperationType.TextEdit */) {
                for (const category of model.categories) {
                    for (const file of category.fileOperations) {
                        if (file.uri.toString() === this.edit.uri.toString()) {
                            for (const edit of file.originalEdits.values()) {
                                model.checked.updateChecked(edit, value);
                            }
                        }
                    }
                }
            }
        }
        isDisabled() {
            if (this.parent instanceof CategoryElement && this.edit.type === 1 /* BulkFileOperationType.TextEdit */) {
                const model = this.parent.parent;
                let checked = true;
                for (const category of model.categories) {
                    for (const file of category.fileOperations) {
                        if (file.uri.toString() === this.edit.uri.toString()) {
                            for (const edit of file.originalEdits.values()) {
                                if (edit instanceof bulkEditService_1.ResourceFileEdit) {
                                    checked = checked && model.checked.isChecked(edit);
                                }
                            }
                        }
                    }
                }
                return !checked;
            }
            return false;
        }
    }
    exports.FileElement = FileElement;
    class TextEditElement {
        constructor(parent, idx, edit, prefix, selecting, inserting, suffix) {
            this.parent = parent;
            this.idx = idx;
            this.edit = edit;
            this.prefix = prefix;
            this.selecting = selecting;
            this.inserting = inserting;
            this.suffix = suffix;
        }
        isChecked() {
            let model = this.parent.parent;
            if (model instanceof CategoryElement) {
                model = model.parent;
            }
            return model.checked.isChecked(this.edit.textEdit);
        }
        setChecked(value) {
            let model = this.parent.parent;
            if (model instanceof CategoryElement) {
                model = model.parent;
            }
            // check/uncheck this element
            model.checked.updateChecked(this.edit.textEdit, value);
            // make sure parent is checked when this element is checked...
            if (value) {
                for (const edit of this.parent.edit.originalEdits.values()) {
                    if (edit instanceof bulkEditService_1.ResourceFileEdit) {
                        model.checked.updateChecked(edit, value);
                    }
                }
            }
        }
        isDisabled() {
            return this.parent.isDisabled();
        }
    }
    exports.TextEditElement = TextEditElement;
    // --- DATA SOURCE
    let BulkEditDataSource = class BulkEditDataSource {
        constructor(_textModelService, _undoRedoService, _languageService, _languageConfigurationService) {
            this._textModelService = _textModelService;
            this._undoRedoService = _undoRedoService;
            this._languageService = _languageService;
            this._languageConfigurationService = _languageConfigurationService;
            this.groupByFile = true;
        }
        hasChildren(element) {
            if (element instanceof FileElement) {
                return element.edit.textEdits.length > 0;
            }
            if (element instanceof TextEditElement) {
                return false;
            }
            return true;
        }
        async getChildren(element) {
            // root -> file/text edits
            if (element instanceof bulkEditPreview_1.BulkFileOperations) {
                return this.groupByFile
                    ? element.fileOperations.map(op => new FileElement(element, op))
                    : element.categories.map(cat => new CategoryElement(element, cat));
            }
            // category
            if (element instanceof CategoryElement) {
                return Array.from(element.category.fileOperations, op => new FileElement(element, op));
            }
            // file: text edit
            if (element instanceof FileElement && element.edit.textEdits.length > 0) {
                // const previewUri = BulkEditPreviewProvider.asPreviewUri(element.edit.resource);
                let textModel;
                let textModelDisposable;
                try {
                    const ref = await this._textModelService.createModelReference(element.edit.uri);
                    textModel = ref.object.textEditorModel;
                    textModelDisposable = ref;
                }
                catch {
                    textModel = new textModel_1.TextModel('', modesRegistry_1.PLAINTEXT_LANGUAGE_ID, textModel_1.TextModel.DEFAULT_CREATION_OPTIONS, null, this._undoRedoService, this._languageService, this._languageConfigurationService);
                    textModelDisposable = textModel;
                }
                const result = element.edit.textEdits.map((edit, idx) => {
                    const range = range_1.Range.lift(edit.textEdit.textEdit.range);
                    //prefix-math
                    const startTokens = textModel.tokenization.getLineTokens(range.startLineNumber);
                    let prefixLen = 23; // default value for the no tokens/grammar case
                    for (let idx = startTokens.findTokenIndexAtOffset(range.startColumn - 1) - 1; prefixLen < 50 && idx >= 0; idx--) {
                        prefixLen = range.startColumn - startTokens.getStartOffset(idx);
                    }
                    //suffix-math
                    const endTokens = textModel.tokenization.getLineTokens(range.endLineNumber);
                    let suffixLen = 0;
                    for (let idx = endTokens.findTokenIndexAtOffset(range.endColumn - 1); suffixLen < 50 && idx < endTokens.getCount(); idx++) {
                        suffixLen += endTokens.getEndOffset(idx) - endTokens.getStartOffset(idx);
                    }
                    return new TextEditElement(element, idx, edit, textModel.getValueInRange(new range_1.Range(range.startLineNumber, range.startColumn - prefixLen, range.startLineNumber, range.startColumn)), textModel.getValueInRange(range), !edit.textEdit.textEdit.insertAsSnippet ? edit.textEdit.textEdit.text : snippetParser_1.SnippetParser.asInsertText(edit.textEdit.textEdit.text), textModel.getValueInRange(new range_1.Range(range.endLineNumber, range.endColumn, range.endLineNumber, range.endColumn + suffixLen)));
                });
                textModelDisposable.dispose();
                return result;
            }
            return [];
        }
    };
    exports.BulkEditDataSource = BulkEditDataSource;
    exports.BulkEditDataSource = BulkEditDataSource = __decorate([
        __param(0, resolverService_1.ITextModelService),
        __param(1, undoRedo_1.IUndoRedoService),
        __param(2, language_1.ILanguageService),
        __param(3, languageConfigurationRegistry_1.ILanguageConfigurationService)
    ], BulkEditDataSource);
    class BulkEditSorter {
        compare(a, b) {
            if (a instanceof FileElement && b instanceof FileElement) {
                return (0, strings_1.compare)(a.edit.uri.toString(), b.edit.uri.toString());
            }
            if (a instanceof TextEditElement && b instanceof TextEditElement) {
                return range_1.Range.compareRangesUsingStarts(a.edit.textEdit.textEdit.range, b.edit.textEdit.textEdit.range);
            }
            return 0;
        }
    }
    exports.BulkEditSorter = BulkEditSorter;
    // --- ACCESSI
    let BulkEditAccessibilityProvider = class BulkEditAccessibilityProvider {
        constructor(_labelService) {
            this._labelService = _labelService;
        }
        getWidgetAriaLabel() {
            return (0, nls_1.localize)('bulkEdit', "Bulk Edit");
        }
        getRole(_element) {
            return 'checkbox';
        }
        getAriaLabel(element) {
            if (element instanceof FileElement) {
                if (element.edit.textEdits.length > 0) {
                    if (element.edit.type & 8 /* BulkFileOperationType.Rename */ && element.edit.newUri) {
                        return (0, nls_1.localize)('aria.renameAndEdit', "Renaming {0} to {1}, also making text edits", this._labelService.getUriLabel(element.edit.uri, { relative: true }), this._labelService.getUriLabel(element.edit.newUri, { relative: true }));
                    }
                    else if (element.edit.type & 2 /* BulkFileOperationType.Create */) {
                        return (0, nls_1.localize)('aria.createAndEdit', "Creating {0}, also making text edits", this._labelService.getUriLabel(element.edit.uri, { relative: true }));
                    }
                    else if (element.edit.type & 4 /* BulkFileOperationType.Delete */) {
                        return (0, nls_1.localize)('aria.deleteAndEdit', "Deleting {0}, also making text edits", this._labelService.getUriLabel(element.edit.uri, { relative: true }));
                    }
                    else {
                        return (0, nls_1.localize)('aria.editOnly', "{0}, making text edits", this._labelService.getUriLabel(element.edit.uri, { relative: true }));
                    }
                }
                else {
                    if (element.edit.type & 8 /* BulkFileOperationType.Rename */ && element.edit.newUri) {
                        return (0, nls_1.localize)('aria.rename', "Renaming {0} to {1}", this._labelService.getUriLabel(element.edit.uri, { relative: true }), this._labelService.getUriLabel(element.edit.newUri, { relative: true }));
                    }
                    else if (element.edit.type & 2 /* BulkFileOperationType.Create */) {
                        return (0, nls_1.localize)('aria.create', "Creating {0}", this._labelService.getUriLabel(element.edit.uri, { relative: true }));
                    }
                    else if (element.edit.type & 4 /* BulkFileOperationType.Delete */) {
                        return (0, nls_1.localize)('aria.delete', "Deleting {0}", this._labelService.getUriLabel(element.edit.uri, { relative: true }));
                    }
                }
            }
            if (element instanceof TextEditElement) {
                if (element.selecting.length > 0 && element.inserting.length > 0) {
                    // edit: replace
                    return (0, nls_1.localize)('aria.replace', "line {0}, replacing {1} with {2}", element.edit.textEdit.textEdit.range.startLineNumber, element.selecting, element.inserting);
                }
                else if (element.selecting.length > 0 && element.inserting.length === 0) {
                    // edit: delete
                    return (0, nls_1.localize)('aria.del', "line {0}, removing {1}", element.edit.textEdit.textEdit.range.startLineNumber, element.selecting);
                }
                else if (element.selecting.length === 0 && element.inserting.length > 0) {
                    // edit: insert
                    return (0, nls_1.localize)('aria.insert', "line {0}, inserting {1}", element.edit.textEdit.textEdit.range.startLineNumber, element.selecting);
                }
            }
            return null;
        }
    };
    exports.BulkEditAccessibilityProvider = BulkEditAccessibilityProvider;
    exports.BulkEditAccessibilityProvider = BulkEditAccessibilityProvider = __decorate([
        __param(0, label_1.ILabelService)
    ], BulkEditAccessibilityProvider);
    // --- IDENT
    class BulkEditIdentityProvider {
        getId(element) {
            if (element instanceof FileElement) {
                return element.edit.uri + (element.parent instanceof CategoryElement ? JSON.stringify(element.parent.category.metadata) : '');
            }
            else if (element instanceof TextEditElement) {
                return element.parent.edit.uri.toString() + element.idx;
            }
            else {
                return JSON.stringify(element.category.metadata);
            }
        }
    }
    exports.BulkEditIdentityProvider = BulkEditIdentityProvider;
    // --- RENDERER
    class CategoryElementTemplate {
        constructor(container) {
            container.classList.add('category');
            this.icon = document.createElement('div');
            container.appendChild(this.icon);
            this.label = new iconLabel_1.IconLabel(container);
        }
    }
    let CategoryElementRenderer = class CategoryElementRenderer {
        static { CategoryElementRenderer_1 = this; }
        static { this.id = 'CategoryElementRenderer'; }
        constructor(_themeService) {
            this._themeService = _themeService;
            this.templateId = CategoryElementRenderer_1.id;
        }
        renderTemplate(container) {
            return new CategoryElementTemplate(container);
        }
        renderElement(node, _index, template) {
            template.icon.style.setProperty('--background-dark', null);
            template.icon.style.setProperty('--background-light', null);
            template.icon.style.color = '';
            const { metadata } = node.element.category;
            if (themables_1.ThemeIcon.isThemeIcon(metadata.iconPath)) {
                // css
                const className = themables_1.ThemeIcon.asClassName(metadata.iconPath);
                template.icon.className = className ? `theme-icon ${className}` : '';
                template.icon.style.color = metadata.iconPath.color ? this._themeService.getColorTheme().getColor(metadata.iconPath.color.id)?.toString() ?? '' : '';
            }
            else if (uri_1.URI.isUri(metadata.iconPath)) {
                // background-image
                template.icon.className = 'uri-icon';
                template.icon.style.setProperty('--background-dark', dom.asCSSUrl(metadata.iconPath));
                template.icon.style.setProperty('--background-light', dom.asCSSUrl(metadata.iconPath));
            }
            else if (metadata.iconPath) {
                // background-image
                template.icon.className = 'uri-icon';
                template.icon.style.setProperty('--background-dark', dom.asCSSUrl(metadata.iconPath.dark));
                template.icon.style.setProperty('--background-light', dom.asCSSUrl(metadata.iconPath.light));
            }
            template.label.setLabel(metadata.label, metadata.description, {
                descriptionMatches: (0, filters_1.createMatches)(node.filterData),
            });
        }
        disposeTemplate(template) {
            template.label.dispose();
        }
    };
    exports.CategoryElementRenderer = CategoryElementRenderer;
    exports.CategoryElementRenderer = CategoryElementRenderer = CategoryElementRenderer_1 = __decorate([
        __param(0, themeService_1.IThemeService)
    ], CategoryElementRenderer);
    let FileElementTemplate = class FileElementTemplate {
        constructor(container, resourceLabels, _labelService) {
            this._labelService = _labelService;
            this._disposables = new lifecycle_1.DisposableStore();
            this._localDisposables = new lifecycle_1.DisposableStore();
            this._checkbox = document.createElement('input');
            this._checkbox.className = 'edit-checkbox';
            this._checkbox.type = 'checkbox';
            this._checkbox.setAttribute('role', 'checkbox');
            container.appendChild(this._checkbox);
            this._label = resourceLabels.create(container, { supportHighlights: true });
            this._details = document.createElement('span');
            this._details.className = 'details';
            container.appendChild(this._details);
        }
        dispose() {
            this._localDisposables.dispose();
            this._disposables.dispose();
            this._label.dispose();
        }
        set(element, score) {
            this._localDisposables.clear();
            this._checkbox.checked = element.isChecked();
            this._checkbox.disabled = element.isDisabled();
            this._localDisposables.add(dom.addDisposableListener(this._checkbox, 'change', () => {
                element.setChecked(this._checkbox.checked);
            }));
            if (element.edit.type & 8 /* BulkFileOperationType.Rename */ && element.edit.newUri) {
                // rename: oldName → newName
                this._label.setResource({
                    resource: element.edit.uri,
                    name: (0, nls_1.localize)('rename.label', "{0} → {1}", this._labelService.getUriLabel(element.edit.uri, { relative: true }), this._labelService.getUriLabel(element.edit.newUri, { relative: true })),
                }, {
                    fileDecorations: { colors: true, badges: false }
                });
                this._details.innerText = (0, nls_1.localize)('detail.rename', "(renaming)");
            }
            else {
                // create, delete, edit: NAME
                const options = {
                    matches: (0, filters_1.createMatches)(score),
                    fileKind: files_1.FileKind.FILE,
                    fileDecorations: { colors: true, badges: false },
                    extraClasses: []
                };
                if (element.edit.type & 2 /* BulkFileOperationType.Create */) {
                    this._details.innerText = (0, nls_1.localize)('detail.create', "(creating)");
                }
                else if (element.edit.type & 4 /* BulkFileOperationType.Delete */) {
                    this._details.innerText = (0, nls_1.localize)('detail.del', "(deleting)");
                    options.extraClasses.push('delete');
                }
                else {
                    this._details.innerText = '';
                }
                this._label.setFile(element.edit.uri, options);
            }
        }
    };
    FileElementTemplate = __decorate([
        __param(2, label_1.ILabelService)
    ], FileElementTemplate);
    let FileElementRenderer = class FileElementRenderer {
        static { FileElementRenderer_1 = this; }
        static { this.id = 'FileElementRenderer'; }
        constructor(_resourceLabels, _labelService) {
            this._resourceLabels = _resourceLabels;
            this._labelService = _labelService;
            this.templateId = FileElementRenderer_1.id;
        }
        renderTemplate(container) {
            return new FileElementTemplate(container, this._resourceLabels, this._labelService);
        }
        renderElement(node, _index, template) {
            template.set(node.element, node.filterData);
        }
        disposeTemplate(template) {
            template.dispose();
        }
    };
    exports.FileElementRenderer = FileElementRenderer;
    exports.FileElementRenderer = FileElementRenderer = FileElementRenderer_1 = __decorate([
        __param(1, label_1.ILabelService)
    ], FileElementRenderer);
    let TextEditElementTemplate = class TextEditElementTemplate {
        constructor(container, _themeService) {
            this._themeService = _themeService;
            this._disposables = new lifecycle_1.DisposableStore();
            this._localDisposables = new lifecycle_1.DisposableStore();
            container.classList.add('textedit');
            this._checkbox = document.createElement('input');
            this._checkbox.className = 'edit-checkbox';
            this._checkbox.type = 'checkbox';
            this._checkbox.setAttribute('role', 'checkbox');
            container.appendChild(this._checkbox);
            this._icon = document.createElement('div');
            container.appendChild(this._icon);
            this._label = new highlightedLabel_1.HighlightedLabel(container);
        }
        dispose() {
            this._localDisposables.dispose();
            this._disposables.dispose();
        }
        set(element) {
            this._localDisposables.clear();
            this._localDisposables.add(dom.addDisposableListener(this._checkbox, 'change', e => {
                element.setChecked(this._checkbox.checked);
                e.preventDefault();
            }));
            if (element.parent.isChecked()) {
                this._checkbox.checked = element.isChecked();
                this._checkbox.disabled = element.isDisabled();
            }
            else {
                this._checkbox.checked = element.isChecked();
                this._checkbox.disabled = element.isDisabled();
            }
            let value = '';
            value += element.prefix;
            value += element.selecting;
            value += element.inserting;
            value += element.suffix;
            const selectHighlight = { start: element.prefix.length, end: element.prefix.length + element.selecting.length, extraClasses: ['remove'] };
            const insertHighlight = { start: selectHighlight.end, end: selectHighlight.end + element.inserting.length, extraClasses: ['insert'] };
            let title;
            const { metadata } = element.edit.textEdit;
            if (metadata && metadata.description) {
                title = (0, nls_1.localize)('title', "{0} - {1}", metadata.label, metadata.description);
            }
            else if (metadata) {
                title = metadata.label;
            }
            const iconPath = metadata?.iconPath;
            if (!iconPath) {
                this._icon.style.display = 'none';
            }
            else {
                this._icon.style.display = 'block';
                this._icon.style.setProperty('--background-dark', null);
                this._icon.style.setProperty('--background-light', null);
                if (themables_1.ThemeIcon.isThemeIcon(iconPath)) {
                    // css
                    const className = themables_1.ThemeIcon.asClassName(iconPath);
                    this._icon.className = className ? `theme-icon ${className}` : '';
                    this._icon.style.color = iconPath.color ? this._themeService.getColorTheme().getColor(iconPath.color.id)?.toString() ?? '' : '';
                }
                else if (uri_1.URI.isUri(iconPath)) {
                    // background-image
                    this._icon.className = 'uri-icon';
                    this._icon.style.setProperty('--background-dark', dom.asCSSUrl(iconPath));
                    this._icon.style.setProperty('--background-light', dom.asCSSUrl(iconPath));
                }
                else {
                    // background-image
                    this._icon.className = 'uri-icon';
                    this._icon.style.setProperty('--background-dark', dom.asCSSUrl(iconPath.dark));
                    this._icon.style.setProperty('--background-light', dom.asCSSUrl(iconPath.light));
                }
            }
            this._label.set(value, [selectHighlight, insertHighlight], title, true);
            this._icon.title = title || '';
        }
    };
    TextEditElementTemplate = __decorate([
        __param(1, themeService_1.IThemeService)
    ], TextEditElementTemplate);
    let TextEditElementRenderer = class TextEditElementRenderer {
        static { TextEditElementRenderer_1 = this; }
        static { this.id = 'TextEditElementRenderer'; }
        constructor(_themeService) {
            this._themeService = _themeService;
            this.templateId = TextEditElementRenderer_1.id;
        }
        renderTemplate(container) {
            return new TextEditElementTemplate(container, this._themeService);
        }
        renderElement({ element }, _index, template) {
            template.set(element);
        }
        disposeTemplate(_template) { }
    };
    exports.TextEditElementRenderer = TextEditElementRenderer;
    exports.TextEditElementRenderer = TextEditElementRenderer = TextEditElementRenderer_1 = __decorate([
        __param(0, themeService_1.IThemeService)
    ], TextEditElementRenderer);
    class BulkEditDelegate {
        getHeight() {
            return 23;
        }
        getTemplateId(element) {
            if (element instanceof FileElement) {
                return FileElementRenderer.id;
            }
            else if (element instanceof TextEditElement) {
                return TextEditElementRenderer.id;
            }
            else {
                return CategoryElementRenderer.id;
            }
        }
    }
    exports.BulkEditDelegate = BulkEditDelegate;
    class BulkEditNaviLabelProvider {
        getKeyboardNavigationLabel(element) {
            if (element instanceof FileElement) {
                return (0, resources_1.basename)(element.edit.uri);
            }
            else if (element instanceof CategoryElement) {
                return element.category.metadata.label;
            }
            return undefined;
        }
    }
    exports.BulkEditNaviLabelProvider = BulkEditNaviLabelProvider;
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYnVsa0VkaXRUcmVlLmpzIiwic291cmNlUm9vdCI6ImZpbGU6Ly8vd29ya3NwYWNlL2FwcGZsb3cvc3JjLyIsInNvdXJjZXMiOlsidnMvd29ya2JlbmNoL2NvbnRyaWIvYnVsa0VkaXQvYnJvd3Nlci9wcmV2aWV3L2J1bGtFZGl0VHJlZS50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7O2dHQUdnRzs7Ozs7Ozs7Ozs7Ozs7O0lBdUNoRyxNQUFhLGVBQWU7UUFFM0IsWUFDVSxNQUEwQixFQUMxQixRQUFzQjtZQUR0QixXQUFNLEdBQU4sTUFBTSxDQUFvQjtZQUMxQixhQUFRLEdBQVIsUUFBUSxDQUFjO1FBQzVCLENBQUM7UUFFTCxTQUFTO1lBQ1IsTUFBTSxLQUFLLEdBQUcsSUFBSSxDQUFDLE1BQU0sQ0FBQztZQUMxQixJQUFJLE9BQU8sR0FBRyxJQUFJLENBQUM7WUFDbkIsS0FBSyxNQUFNLElBQUksSUFBSSxJQUFJLENBQUMsUUFBUSxDQUFDLGNBQWMsRUFBRTtnQkFDaEQsS0FBSyxNQUFNLElBQUksSUFBSSxJQUFJLENBQUMsYUFBYSxDQUFDLE1BQU0sRUFBRSxFQUFFO29CQUMvQyxPQUFPLEdBQUcsT0FBTyxJQUFJLEtBQUssQ0FBQyxPQUFPLENBQUMsU0FBUyxDQUFDLElBQUksQ0FBQyxDQUFDO2lCQUNuRDthQUNEO1lBQ0QsT0FBTyxPQUFPLENBQUM7UUFDaEIsQ0FBQztRQUVELFVBQVUsQ0FBQyxLQUFjO1lBQ3hCLE1BQU0sS0FBSyxHQUFHLElBQUksQ0FBQyxNQUFNLENBQUM7WUFDMUIsS0FBSyxNQUFNLElBQUksSUFBSSxJQUFJLENBQUMsUUFBUSxDQUFDLGNBQWMsRUFBRTtnQkFDaEQsS0FBSyxNQUFNLElBQUksSUFBSSxJQUFJLENBQUMsYUFBYSxDQUFDLE1BQU0sRUFBRSxFQUFFO29CQUMvQyxLQUFLLENBQUMsT0FBTyxDQUFDLGFBQWEsQ0FBQyxJQUFJLEVBQUUsS0FBSyxDQUFDLENBQUM7aUJBQ3pDO2FBQ0Q7UUFDRixDQUFDO0tB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