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
define(["require", "exports", "vs/editor/common/services/resolverService", "vs/base/common/filters", "vs/base/browser/ui/highlightedlabel/highlightedLabel", "vs/editor/common/core/range", "vs/base/browser/dom", "vs/base/common/lifecycle", "vs/editor/common/model/textModel", "vs/workbench/contrib/bulkEdit/browser/preview/bulkEditPreview", "vs/platform/files/common/files", "vs/nls!vs/workbench/contrib/bulkEdit/browser/preview/bulkEditTree", "vs/platform/label/common/label", "vs/base/browser/ui/iconLabel/iconLabel", "vs/base/common/resources", "vs/platform/theme/common/themeService", "vs/base/common/themables", "vs/base/common/strings", "vs/base/common/uri", "vs/platform/undoRedo/common/undoRedo", "vs/editor/browser/services/bulkEditService", "vs/editor/common/languages/languageConfigurationRegistry", "vs/editor/common/languages/language", "vs/editor/common/languages/modesRegistry", "vs/editor/contrib/snippet/browser/snippetParser"], function (require, exports, resolverService_1, filters_1, highlightedLabel_1, range_1, dom, lifecycle_1, textModel_1, bulkEditPreview_1, files_1, nls_1, label_1, iconLabel_1, resources_1, themeService_1, themables_1, strings_1, uri_1, undoRedo_1, bulkEditService_1, languageConfigurationRegistry_1, language_1, modesRegistry_1, snippetParser_1) {
    "use strict";
    var $sMb_1, $tMb_1, $uMb_1;
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.$wMb = exports.$vMb = exports.$uMb = exports.$tMb = exports.$sMb = exports.$rMb = exports.$qMb = exports.$pMb = exports.$oMb = exports.$nMb = exports.$mMb = exports.$lMb = void 0;
    class $lMb {
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
    exports.$lMb = $lMb;
    class $mMb {
        constructor(parent, edit) {
            this.parent = parent;
            this.edit = edit;
        }
        isChecked() {
            const model = this.parent instanceof $lMb ? this.parent.parent : this.parent;
            let checked = true;
            // only text edit children -> reflect children state
            if (this.edit.type === 1 /* BulkFileOperationType.TextEdit */) {
                checked = !this.edit.textEdits.every(edit => !model.checked.isChecked(edit.textEdit));
            }
            // multiple file edits -> reflect single state
            for (const edit of this.edit.originalEdits.values()) {
                if (edit instanceof bulkEditService_1.$q1) {
                    checked = checked && model.checked.isChecked(edit);
                }
            }
            // multiple categories and text change -> read all elements
            if (this.parent instanceof $lMb && this.edit.type === 1 /* BulkFileOperationType.TextEdit */) {
                for (const category of model.categories) {
                    for (const file of category.fileOperations) {
                        if (file.uri.toString() === this.edit.uri.toString()) {
                            for (const edit of file.originalEdits.values()) {
                                if (edit instanceof bulkEditService_1.$q1) {
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
            const model = this.parent instanceof $lMb ? this.parent.parent : this.parent;
            for (const edit of this.edit.originalEdits.values()) {
                model.checked.updateChecked(edit, value);
            }
            // multiple categories and file change -> update all elements
            if (this.parent instanceof $lMb && this.edit.type !== 1 /* BulkFileOperationType.TextEdit */) {
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
            if (this.parent instanceof $lMb && this.edit.type === 1 /* BulkFileOperationType.TextEdit */) {
                const model = this.parent.parent;
                let checked = true;
                for (const category of model.categories) {
                    for (const file of category.fileOperations) {
                        if (file.uri.toString() === this.edit.uri.toString()) {
                            for (const edit of file.originalEdits.values()) {
                                if (edit instanceof bulkEditService_1.$q1) {
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
    exports.$mMb = $mMb;
    class $nMb {
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
            if (model instanceof $lMb) {
                model = model.parent;
            }
            return model.checked.isChecked(this.edit.textEdit);
        }
        setChecked(value) {
            let model = this.parent.parent;
            if (model instanceof $lMb) {
                model = model.parent;
            }
            // check/uncheck this element
            model.checked.updateChecked(this.edit.textEdit, value);
            // make sure parent is checked when this element is checked...
            if (value) {
                for (const edit of this.parent.edit.originalEdits.values()) {
                    if (edit instanceof bulkEditService_1.$q1) {
                        model.checked.updateChecked(edit, value);
                    }
                }
            }
        }
        isDisabled() {
            return this.parent.isDisabled();
        }
    }
    exports.$nMb = $nMb;
    // --- DATA SOURCE
    let $oMb = class $oMb {
        constructor(c, d, f, g) {
            this.c = c;
            this.d = d;
            this.f = f;
            this.g = g;
            this.groupByFile = true;
        }
        hasChildren(element) {
            if (element instanceof $mMb) {
                return element.edit.textEdits.length > 0;
            }
            if (element instanceof $nMb) {
                return false;
            }
            return true;
        }
        async getChildren(element) {
            // root -> file/text edits
            if (element instanceof bulkEditPreview_1.$jMb) {
                return this.groupByFile
                    ? element.fileOperations.map(op => new $mMb(element, op))
                    : element.categories.map(cat => new $lMb(element, cat));
            }
            // category
            if (element instanceof $lMb) {
                return Array.from(element.category.fileOperations, op => new $mMb(element, op));
            }
            // file: text edit
            if (element instanceof $mMb && element.edit.textEdits.length > 0) {
                // const previewUri = BulkEditPreviewProvider.asPreviewUri(element.edit.resource);
                let textModel;
                let textModelDisposable;
                try {
                    const ref = await this.c.createModelReference(element.edit.uri);
                    textModel = ref.object.textEditorModel;
                    textModelDisposable = ref;
                }
                catch {
                    textModel = new textModel_1.$MC('', modesRegistry_1.$Yt, textModel_1.$MC.DEFAULT_CREATION_OPTIONS, null, this.d, this.f, this.g);
                    textModelDisposable = textModel;
                }
                const result = element.edit.textEdits.map((edit, idx) => {
                    const range = range_1.$ks.lift(edit.textEdit.textEdit.range);
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
                    return new $nMb(element, idx, edit, textModel.getValueInRange(new range_1.$ks(range.startLineNumber, range.startColumn - prefixLen, range.startLineNumber, range.startColumn)), textModel.getValueInRange(range), !edit.textEdit.textEdit.insertAsSnippet ? edit.textEdit.textEdit.text : snippetParser_1.$G5.asInsertText(edit.textEdit.textEdit.text), textModel.getValueInRange(new range_1.$ks(range.endLineNumber, range.endColumn, range.endLineNumber, range.endColumn + suffixLen)));
                });
                textModelDisposable.dispose();
                return result;
            }
            return [];
        }
    };
    exports.$oMb = $oMb;
    exports.$oMb = $oMb = __decorate([
        __param(0, resolverService_1.$uA),
        __param(1, undoRedo_1.$wu),
        __param(2, language_1.$ct),
        __param(3, languageConfigurationRegistry_1.$2t)
    ], $oMb);
    class $pMb {
        compare(a, b) {
            if (a instanceof $mMb && b instanceof $mMb) {
                return (0, strings_1.$Fe)(a.edit.uri.toString(), b.edit.uri.toString());
            }
            if (a instanceof $nMb && b instanceof $nMb) {
                return range_1.$ks.compareRangesUsingStarts(a.edit.textEdit.textEdit.range, b.edit.textEdit.textEdit.range);
            }
            return 0;
        }
    }
    exports.$pMb = $pMb;
    // --- ACCESSI
    let $qMb = class $qMb {
        constructor(c) {
            this.c = c;
        }
        getWidgetAriaLabel() {
            return (0, nls_1.localize)(0, null);
        }
        getRole(_element) {
            return 'checkbox';
        }
        getAriaLabel(element) {
            if (element instanceof $mMb) {
                if (element.edit.textEdits.length > 0) {
                    if (element.edit.type & 8 /* BulkFileOperationType.Rename */ && element.edit.newUri) {
                        return (0, nls_1.localize)(1, null, this.c.getUriLabel(element.edit.uri, { relative: true }), this.c.getUriLabel(element.edit.newUri, { relative: true }));
                    }
                    else if (element.edit.type & 2 /* BulkFileOperationType.Create */) {
                        return (0, nls_1.localize)(2, null, this.c.getUriLabel(element.edit.uri, { relative: true }));
                    }
                    else if (element.edit.type & 4 /* BulkFileOperationType.Delete */) {
                        return (0, nls_1.localize)(3, null, this.c.getUriLabel(element.edit.uri, { relative: true }));
                    }
                    else {
                        return (0, nls_1.localize)(4, null, this.c.getUriLabel(element.edit.uri, { relative: true }));
                    }
                }
                else {
                    if (element.edit.type & 8 /* BulkFileOperationType.Rename */ && element.edit.newUri) {
                        return (0, nls_1.localize)(5, null, this.c.getUriLabel(element.edit.uri, { relative: true }), this.c.getUriLabel(element.edit.newUri, { relative: true }));
                    }
                    else if (element.edit.type & 2 /* BulkFileOperationType.Create */) {
                        return (0, nls_1.localize)(6, null, this.c.getUriLabel(element.edit.uri, { relative: true }));
                    }
                    else if (element.edit.type & 4 /* BulkFileOperationType.Delete */) {
                        return (0, nls_1.localize)(7, null, this.c.getUriLabel(element.edit.uri, { relative: true }));
                    }
                }
            }
            if (element instanceof $nMb) {
                if (element.selecting.length > 0 && element.inserting.length > 0) {
                    // edit: replace
                    return (0, nls_1.localize)(8, null, element.edit.textEdit.textEdit.range.startLineNumber, element.selecting, element.inserting);
                }
                else if (element.selecting.length > 0 && element.inserting.length === 0) {
                    // edit: delete
                    return (0, nls_1.localize)(9, null, element.edit.textEdit.textEdit.range.startLineNumber, element.selecting);
                }
                else if (element.selecting.length === 0 && element.inserting.length > 0) {
                    // edit: insert
                    return (0, nls_1.localize)(10, null, element.edit.textEdit.textEdit.range.startLineNumber, element.selecting);
                }
            }
            return null;
        }
    };
    exports.$qMb = $qMb;
    exports.$qMb = $qMb = __decorate([
        __param(0, label_1.$Vz)
    ], $qMb);
    // --- IDENT
    class $rMb {
        getId(element) {
            if (element instanceof $mMb) {
                return element.edit.uri + (element.parent instanceof $lMb ? JSON.stringify(element.parent.category.metadata) : '');
            }
            else if (element instanceof $nMb) {
                return element.parent.edit.uri.toString() + element.idx;
            }
            else {
                return JSON.stringify(element.category.metadata);
            }
        }
    }
    exports.$rMb = $rMb;
    // --- RENDERER
    class CategoryElementTemplate {
        constructor(container) {
            container.classList.add('category');
            this.icon = document.createElement('div');
            container.appendChild(this.icon);
            this.label = new iconLabel_1.$KR(container);
        }
    }
    let $sMb = class $sMb {
        static { $sMb_1 = this; }
        static { this.id = 'CategoryElementRenderer'; }
        constructor(c) {
            this.c = c;
            this.templateId = $sMb_1.id;
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
                template.icon.style.color = metadata.iconPath.color ? this.c.getColorTheme().getColor(metadata.iconPath.color.id)?.toString() ?? '' : '';
            }
            else if (uri_1.URI.isUri(metadata.iconPath)) {
                // background-image
                template.icon.className = 'uri-icon';
                template.icon.style.setProperty('--background-dark', dom.$nP(metadata.iconPath));
                template.icon.style.setProperty('--background-light', dom.$nP(metadata.iconPath));
            }
            else if (metadata.iconPath) {
                // background-image
                template.icon.className = 'uri-icon';
                template.icon.style.setProperty('--background-dark', dom.$nP(metadata.iconPath.dark));
                template.icon.style.setProperty('--background-light', dom.$nP(metadata.iconPath.light));
            }
            template.label.setLabel(metadata.label, metadata.description, {
                descriptionMatches: (0, filters_1.$Hj)(node.filterData),
            });
        }
        disposeTemplate(template) {
            template.label.dispose();
        }
    };
    exports.$sMb = $sMb;
    exports.$sMb = $sMb = $sMb_1 = __decorate([
        __param(0, themeService_1.$gv)
    ], $sMb);
    let FileElementTemplate = class FileElementTemplate {
        constructor(container, resourceLabels, i) {
            this.i = i;
            this.c = new lifecycle_1.$jc();
            this.d = new lifecycle_1.$jc();
            this.f = document.createElement('input');
            this.f.className = 'edit-checkbox';
            this.f.type = 'checkbox';
            this.f.setAttribute('role', 'checkbox');
            container.appendChild(this.f);
            this.g = resourceLabels.create(container, { supportHighlights: true });
            this.h = document.createElement('span');
            this.h.className = 'details';
            container.appendChild(this.h);
        }
        dispose() {
            this.d.dispose();
            this.c.dispose();
            this.g.dispose();
        }
        set(element, score) {
            this.d.clear();
            this.f.checked = element.isChecked();
            this.f.disabled = element.isDisabled();
            this.d.add(dom.$nO(this.f, 'change', () => {
                element.setChecked(this.f.checked);
            }));
            if (element.edit.type & 8 /* BulkFileOperationType.Rename */ && element.edit.newUri) {
                // rename: oldName → newName
                this.g.setResource({
                    resource: element.edit.uri,
                    name: (0, nls_1.localize)(11, null, this.i.getUriLabel(element.edit.uri, { relative: true }), this.i.getUriLabel(element.edit.newUri, { relative: true })),
                }, {
                    fileDecorations: { colors: true, badges: false }
                });
                this.h.innerText = (0, nls_1.localize)(12, null);
            }
            else {
                // create, delete, edit: NAME
                const options = {
                    matches: (0, filters_1.$Hj)(score),
                    fileKind: files_1.FileKind.FILE,
                    fileDecorations: { colors: true, badges: false },
                    extraClasses: []
                };
                if (element.edit.type & 2 /* BulkFileOperationType.Create */) {
                    this.h.innerText = (0, nls_1.localize)(13, null);
                }
                else if (element.edit.type & 4 /* BulkFileOperationType.Delete */) {
                    this.h.innerText = (0, nls_1.localize)(14, null);
                    options.extraClasses.push('delete');
                }
                else {
                    this.h.innerText = '';
                }
                this.g.setFile(element.edit.uri, options);
            }
        }
    };
    FileElementTemplate = __decorate([
        __param(2, label_1.$Vz)
    ], FileElementTemplate);
    let $tMb = class $tMb {
        static { $tMb_1 = this; }
        static { this.id = 'FileElementRenderer'; }
        constructor(c, d) {
            this.c = c;
            this.d = d;
            this.templateId = $tMb_1.id;
        }
        renderTemplate(container) {
            return new FileElementTemplate(container, this.c, this.d);
        }
        renderElement(node, _index, template) {
            template.set(node.element, node.filterData);
        }
        disposeTemplate(template) {
            template.dispose();
        }
    };
    exports.$tMb = $tMb;
    exports.$tMb = $tMb = $tMb_1 = __decorate([
        __param(1, label_1.$Vz)
    ], $tMb);
    let TextEditElementTemplate = class TextEditElementTemplate {
        constructor(container, i) {
            this.i = i;
            this.c = new lifecycle_1.$jc();
            this.d = new lifecycle_1.$jc();
            container.classList.add('textedit');
            this.f = document.createElement('input');
            this.f.className = 'edit-checkbox';
            this.f.type = 'checkbox';
            this.f.setAttribute('role', 'checkbox');
            container.appendChild(this.f);
            this.g = document.createElement('div');
            container.appendChild(this.g);
            this.h = new highlightedLabel_1.$JR(container);
        }
        dispose() {
            this.d.dispose();
            this.c.dispose();
        }
        set(element) {
            this.d.clear();
            this.d.add(dom.$nO(this.f, 'change', e => {
                element.setChecked(this.f.checked);
                e.preventDefault();
            }));
            if (element.parent.isChecked()) {
                this.f.checked = element.isChecked();
                this.f.disabled = element.isDisabled();
            }
            else {
                this.f.checked = element.isChecked();
                this.f.disabled = element.isDisabled();
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
                title = (0, nls_1.localize)(15, null, metadata.label, metadata.description);
            }
            else if (metadata) {
                title = metadata.label;
            }
            const iconPath = metadata?.iconPath;
            if (!iconPath) {
                this.g.style.display = 'none';
            }
            else {
                this.g.style.display = 'block';
                this.g.style.setProperty('--background-dark', null);
                this.g.style.setProperty('--background-light', null);
                if (themables_1.ThemeIcon.isThemeIcon(iconPath)) {
                    // css
                    const className = themables_1.ThemeIcon.asClassName(iconPath);
                    this.g.className = className ? `theme-icon ${className}` : '';
                    this.g.style.color = iconPath.color ? this.i.getColorTheme().getColor(iconPath.color.id)?.toString() ?? '' : '';
                }
                else if (uri_1.URI.isUri(iconPath)) {
                    // background-image
                    this.g.className = 'uri-icon';
                    this.g.style.setProperty('--background-dark', dom.$nP(iconPath));
                    this.g.style.setProperty('--background-light', dom.$nP(iconPath));
                }
                else {
                    // background-image
                    this.g.className = 'uri-icon';
                    this.g.style.setProperty('--background-dark', dom.$nP(iconPath.dark));
                    this.g.style.setProperty('--background-light', dom.$nP(iconPath.light));
                }
            }
            this.h.set(value, [selectHighlight, insertHighlight], title, true);
            this.g.title = title || '';
        }
    };
    TextEditElementTemplate = __decorate([
        __param(1, themeService_1.$gv)
    ], TextEditElementTemplate);
    let $uMb = class $uMb {
        static { $uMb_1 = this; }
        static { this.id = 'TextEditElementRenderer'; }
        constructor(c) {
            this.c = c;
            this.templateId = $uMb_1.id;
        }
        renderTemplate(container) {
            return new TextEditElementTemplate(container, this.c);
        }
        renderElement({ element }, _index, template) {
            template.set(element);
        }
        disposeTemplate(_template) { }
    };
    exports.$uMb = $uMb;
    exports.$uMb = $uMb = $uMb_1 = __decorate([
        __param(0, themeService_1.$gv)
    ], $uMb);
    class $vMb {
        getHeight() {
            return 23;
        }
        getTemplateId(element) {
            if (element instanceof $mMb) {
                return $tMb.id;
            }
            else if (element instanceof $nMb) {
                return $uMb.id;
            }
            else {
                return $sMb.id;
            }
        }
    }
    exports.$vMb = $vMb;
    class $wMb {
        getKeyboardNavigationLabel(element) {
            if (element instanceof $mMb) {
                return (0, resources_1.$fg)(element.edit.uri);
            }
            else if (element instanceof $lMb) {
                return element.category.metadata.label;
            }
            return undefined;
        }
    }
    exports.$wMb = $wMb;
});
//# sourceMappingURL=bulkEditTree.js.map