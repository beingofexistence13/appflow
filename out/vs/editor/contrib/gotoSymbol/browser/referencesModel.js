/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/base/common/errors", "vs/base/common/event", "vs/base/common/idGenerator", "vs/base/common/lifecycle", "vs/base/common/map", "vs/base/common/resources", "vs/base/common/strings", "vs/editor/common/core/range", "vs/nls"], function (require, exports, errors_1, event_1, idGenerator_1, lifecycle_1, map_1, resources_1, strings, range_1, nls_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.ReferencesModel = exports.FileReferences = exports.FilePreview = exports.OneReference = void 0;
    class OneReference {
        constructor(isProviderFirst, parent, link, _rangeCallback) {
            this.isProviderFirst = isProviderFirst;
            this.parent = parent;
            this.link = link;
            this._rangeCallback = _rangeCallback;
            this.id = idGenerator_1.defaultGenerator.nextId();
        }
        get uri() {
            return this.link.uri;
        }
        get range() {
            return this._range ?? this.link.targetSelectionRange ?? this.link.range;
        }
        set range(value) {
            this._range = value;
            this._rangeCallback(this);
        }
        get ariaMessage() {
            const preview = this.parent.getPreview(this)?.preview(this.range);
            if (!preview) {
                return (0, nls_1.localize)('aria.oneReference', "in {0} on line {1} at column {2}", (0, resources_1.basename)(this.uri), this.range.startLineNumber, this.range.startColumn);
            }
            else {
                return (0, nls_1.localize)({ key: 'aria.oneReference.preview', comment: ['Placeholders are: 0: filename, 1:line number, 2: column number, 3: preview snippet of source code'] }, "{0} in {1} on line {2} at column {3}", preview.value, (0, resources_1.basename)(this.uri), this.range.startLineNumber, this.range.startColumn);
            }
        }
    }
    exports.OneReference = OneReference;
    class FilePreview {
        constructor(_modelReference) {
            this._modelReference = _modelReference;
        }
        dispose() {
            this._modelReference.dispose();
        }
        preview(range, n = 8) {
            const model = this._modelReference.object.textEditorModel;
            if (!model) {
                return undefined;
            }
            const { startLineNumber, startColumn, endLineNumber, endColumn } = range;
            const word = model.getWordUntilPosition({ lineNumber: startLineNumber, column: startColumn - n });
            const beforeRange = new range_1.Range(startLineNumber, word.startColumn, startLineNumber, startColumn);
            const afterRange = new range_1.Range(endLineNumber, endColumn, endLineNumber, 1073741824 /* Constants.MAX_SAFE_SMALL_INTEGER */);
            const before = model.getValueInRange(beforeRange).replace(/^\s+/, '');
            const inside = model.getValueInRange(range);
            const after = model.getValueInRange(afterRange).replace(/\s+$/, '');
            return {
                value: before + inside + after,
                highlight: { start: before.length, end: before.length + inside.length }
            };
        }
    }
    exports.FilePreview = FilePreview;
    class FileReferences {
        constructor(parent, uri) {
            this.parent = parent;
            this.uri = uri;
            this.children = [];
            this._previews = new map_1.ResourceMap();
        }
        dispose() {
            (0, lifecycle_1.dispose)(this._previews.values());
            this._previews.clear();
        }
        getPreview(child) {
            return this._previews.get(child.uri);
        }
        get ariaMessage() {
            const len = this.children.length;
            if (len === 1) {
                return (0, nls_1.localize)('aria.fileReferences.1', "1 symbol in {0}, full path {1}", (0, resources_1.basename)(this.uri), this.uri.fsPath);
            }
            else {
                return (0, nls_1.localize)('aria.fileReferences.N', "{0} symbols in {1}, full path {2}", len, (0, resources_1.basename)(this.uri), this.uri.fsPath);
            }
        }
        async resolve(textModelResolverService) {
            if (this._previews.size !== 0) {
                return this;
            }
            for (const child of this.children) {
                if (this._previews.has(child.uri)) {
                    continue;
                }
                try {
                    const ref = await textModelResolverService.createModelReference(child.uri);
                    this._previews.set(child.uri, new FilePreview(ref));
                }
                catch (err) {
                    (0, errors_1.onUnexpectedError)(err);
                }
            }
            return this;
        }
    }
    exports.FileReferences = FileReferences;
    class ReferencesModel {
        constructor(links, title) {
            this.groups = [];
            this.references = [];
            this._onDidChangeReferenceRange = new event_1.Emitter();
            this.onDidChangeReferenceRange = this._onDidChangeReferenceRange.event;
            this._links = links;
            this._title = title;
            // grouping and sorting
            const [providersFirst] = links;
            links.sort(ReferencesModel._compareReferences);
            let current;
            for (const link of links) {
                if (!current || !resources_1.extUri.isEqual(current.uri, link.uri, true)) {
                    // new group
                    current = new FileReferences(this, link.uri);
                    this.groups.push(current);
                }
                // append, check for equality first!
                if (current.children.length === 0 || ReferencesModel._compareReferences(link, current.children[current.children.length - 1]) !== 0) {
                    const oneRef = new OneReference(providersFirst === link, current, link, ref => this._onDidChangeReferenceRange.fire(ref));
                    this.references.push(oneRef);
                    current.children.push(oneRef);
                }
            }
        }
        dispose() {
            (0, lifecycle_1.dispose)(this.groups);
            this._onDidChangeReferenceRange.dispose();
            this.groups.length = 0;
        }
        clone() {
            return new ReferencesModel(this._links, this._title);
        }
        get title() {
            return this._title;
        }
        get isEmpty() {
            return this.groups.length === 0;
        }
        get ariaMessage() {
            if (this.isEmpty) {
                return (0, nls_1.localize)('aria.result.0', "No results found");
            }
            else if (this.references.length === 1) {
                return (0, nls_1.localize)('aria.result.1', "Found 1 symbol in {0}", this.references[0].uri.fsPath);
            }
            else if (this.groups.length === 1) {
                return (0, nls_1.localize)('aria.result.n1', "Found {0} symbols in {1}", this.references.length, this.groups[0].uri.fsPath);
            }
            else {
                return (0, nls_1.localize)('aria.result.nm', "Found {0} symbols in {1} files", this.references.length, this.groups.length);
            }
        }
        nextOrPreviousReference(reference, next) {
            const { parent } = reference;
            let idx = parent.children.indexOf(reference);
            const childCount = parent.children.length;
            const groupCount = parent.parent.groups.length;
            if (groupCount === 1 || next && idx + 1 < childCount || !next && idx > 0) {
                // cycling within one file
                if (next) {
                    idx = (idx + 1) % childCount;
                }
                else {
                    idx = (idx + childCount - 1) % childCount;
                }
                return parent.children[idx];
            }
            idx = parent.parent.groups.indexOf(parent);
            if (next) {
                idx = (idx + 1) % groupCount;
                return parent.parent.groups[idx].children[0];
            }
            else {
                idx = (idx + groupCount - 1) % groupCount;
                return parent.parent.groups[idx].children[parent.parent.groups[idx].children.length - 1];
            }
        }
        nearestReference(resource, position) {
            const nearest = this.references.map((ref, idx) => {
                return {
                    idx,
                    prefixLen: strings.commonPrefixLength(ref.uri.toString(), resource.toString()),
                    offsetDist: Math.abs(ref.range.startLineNumber - position.lineNumber) * 100 + Math.abs(ref.range.startColumn - position.column)
                };
            }).sort((a, b) => {
                if (a.prefixLen > b.prefixLen) {
                    return -1;
                }
                else if (a.prefixLen < b.prefixLen) {
                    return 1;
                }
                else if (a.offsetDist < b.offsetDist) {
                    return -1;
                }
                else if (a.offsetDist > b.offsetDist) {
                    return 1;
                }
                else {
                    return 0;
                }
            })[0];
            if (nearest) {
                return this.references[nearest.idx];
            }
            return undefined;
        }
        referenceAt(resource, position) {
            for (const ref of this.references) {
                if (ref.uri.toString() === resource.toString()) {
                    if (range_1.Range.containsPosition(ref.range, position)) {
                        return ref;
                    }
                }
            }
            return undefined;
        }
        firstReference() {
            for (const ref of this.references) {
                if (ref.isProviderFirst) {
                    return ref;
                }
            }
            return this.references[0];
        }
        static _compareReferences(a, b) {
            return resources_1.extUri.compare(a.uri, b.uri) || range_1.Range.compareRangesUsingStarts(a.range, b.range);
        }
    }
    exports.ReferencesModel = ReferencesModel;
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicmVmZXJlbmNlc01vZGVsLmpzIiwic291cmNlUm9vdCI6ImZpbGU6Ly8vd29ya3NwYWNlL2FwcGZsb3cvc3JjLyIsInNvdXJjZXMiOlsidnMvZWRpdG9yL2NvbnRyaWIvZ290b1N5bWJvbC9icm93c2VyL3JlZmVyZW5jZXNNb2RlbC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7O2dHQUdnRzs7Ozs7SUFrQmhHLE1BQWEsWUFBWTtRQU14QixZQUNVLGVBQXdCLEVBQ3hCLE1BQXNCLEVBQ3RCLElBQWtCLEVBQ25CLGNBQTJDO1lBSDFDLG9CQUFlLEdBQWYsZUFBZSxDQUFTO1lBQ3hCLFdBQU0sR0FBTixNQUFNLENBQWdCO1lBQ3RCLFNBQUksR0FBSixJQUFJLENBQWM7WUFDbkIsbUJBQWMsR0FBZCxjQUFjLENBQTZCO1lBUjNDLE9BQUUsR0FBVyw4QkFBZ0IsQ0FBQyxNQUFNLEVBQUUsQ0FBQztRQVM1QyxDQUFDO1FBRUwsSUFBSSxHQUFHO1lBQ04sT0FBTyxJQUFJLENBQUMsSUFBSSxDQUFDLEdBQUcsQ0FBQztRQUN0QixDQUFDO1FBRUQsSUFBSSxLQUFLO1lBQ1IsT0FBTyxJQUFJLENBQUMsTUFBTSxJQUFJLElBQUksQ0FBQyxJQUFJLENBQUMsb0JBQW9CLElBQUksSUFBSSxDQUFDLElBQUksQ0FBQyxLQUFLLENBQUM7UUFDekUsQ0FBQztRQUVELElBQUksS0FBSyxDQUFDLEtBQWE7WUFDdEIsSUFBSSxDQUFDLE1BQU0sR0FBRyxLQUFLLENBQUM7WUFDcEIsSUFBSSxDQUFDLGNBQWMsQ0FBQyxJQUFJLENBQUMsQ0FBQztRQUMzQixDQUFDO1FBRUQsSUFBSSxXQUFXO1lBRWQsTUFBTSxPQUFPLEdBQUcsSUFBSSxDQUFDLE1BQU0sQ0FBQyxVQUFVLENBQUMsSUFBSSxDQUFDLEVBQUUsT0FBTyxDQUFDLElBQUksQ0FBQyxLQUFLLENBQUMsQ0FBQztZQUVsRSxJQUFJLENBQUMsT0FBTyxFQUFFO2dCQUNiLE9BQU8sSUFBQSxjQUFRLEVBQ2QsbUJBQW1C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