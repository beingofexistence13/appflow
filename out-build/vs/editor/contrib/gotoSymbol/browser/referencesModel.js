/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/base/common/errors", "vs/base/common/event", "vs/base/common/idGenerator", "vs/base/common/lifecycle", "vs/base/common/map", "vs/base/common/resources", "vs/base/common/strings", "vs/editor/common/core/range", "vs/nls!vs/editor/contrib/gotoSymbol/browser/referencesModel"], function (require, exports, errors_1, event_1, idGenerator_1, lifecycle_1, map_1, resources_1, strings, range_1, nls_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.$B4 = exports.$A4 = exports.$z4 = exports.$y4 = void 0;
    class $y4 {
        constructor(isProviderFirst, parent, link, d) {
            this.isProviderFirst = isProviderFirst;
            this.parent = parent;
            this.link = link;
            this.d = d;
            this.id = idGenerator_1.$8L.nextId();
        }
        get uri() {
            return this.link.uri;
        }
        get range() {
            return this.c ?? this.link.targetSelectionRange ?? this.link.range;
        }
        set range(value) {
            this.c = value;
            this.d(this);
        }
        get ariaMessage() {
            const preview = this.parent.getPreview(this)?.preview(this.range);
            if (!preview) {
                return (0, nls_1.localize)(0, null, (0, resources_1.$fg)(this.uri), this.range.startLineNumber, this.range.startColumn);
            }
            else {
                return (0, nls_1.localize)(1, null, preview.value, (0, resources_1.$fg)(this.uri), this.range.startLineNumber, this.range.startColumn);
            }
        }
    }
    exports.$y4 = $y4;
    class $z4 {
        constructor(c) {
            this.c = c;
        }
        dispose() {
            this.c.dispose();
        }
        preview(range, n = 8) {
            const model = this.c.object.textEditorModel;
            if (!model) {
                return undefined;
            }
            const { startLineNumber, startColumn, endLineNumber, endColumn } = range;
            const word = model.getWordUntilPosition({ lineNumber: startLineNumber, column: startColumn - n });
            const beforeRange = new range_1.$ks(startLineNumber, word.startColumn, startLineNumber, startColumn);
            const afterRange = new range_1.$ks(endLineNumber, endColumn, endLineNumber, 1073741824 /* Constants.MAX_SAFE_SMALL_INTEGER */);
            const before = model.getValueInRange(beforeRange).replace(/^\s+/, '');
            const inside = model.getValueInRange(range);
            const after = model.getValueInRange(afterRange).replace(/\s+$/, '');
            return {
                value: before + inside + after,
                highlight: { start: before.length, end: before.length + inside.length }
            };
        }
    }
    exports.$z4 = $z4;
    class $A4 {
        constructor(parent, uri) {
            this.parent = parent;
            this.uri = uri;
            this.children = [];
            this.c = new map_1.$zi();
        }
        dispose() {
            (0, lifecycle_1.$fc)(this.c.values());
            this.c.clear();
        }
        getPreview(child) {
            return this.c.get(child.uri);
        }
        get ariaMessage() {
            const len = this.children.length;
            if (len === 1) {
                return (0, nls_1.localize)(2, null, (0, resources_1.$fg)(this.uri), this.uri.fsPath);
            }
            else {
                return (0, nls_1.localize)(3, null, len, (0, resources_1.$fg)(this.uri), this.uri.fsPath);
            }
        }
        async resolve(textModelResolverService) {
            if (this.c.size !== 0) {
                return this;
            }
            for (const child of this.children) {
                if (this.c.has(child.uri)) {
                    continue;
                }
                try {
                    const ref = await textModelResolverService.createModelReference(child.uri);
                    this.c.set(child.uri, new $z4(ref));
                }
                catch (err) {
                    (0, errors_1.$Y)(err);
                }
            }
            return this;
        }
    }
    exports.$A4 = $A4;
    class $B4 {
        constructor(links, title) {
            this.groups = [];
            this.references = [];
            this._onDidChangeReferenceRange = new event_1.$fd();
            this.onDidChangeReferenceRange = this._onDidChangeReferenceRange.event;
            this.c = links;
            this.d = title;
            // grouping and sorting
            const [providersFirst] = links;
            links.sort($B4.e);
            let current;
            for (const link of links) {
                if (!current || !resources_1.$$f.isEqual(current.uri, link.uri, true)) {
                    // new group
                    current = new $A4(this, link.uri);
                    this.groups.push(current);
                }
                // append, check for equality first!
                if (current.children.length === 0 || $B4.e(link, current.children[current.children.length - 1]) !== 0) {
                    const oneRef = new $y4(providersFirst === link, current, link, ref => this._onDidChangeReferenceRange.fire(ref));
                    this.references.push(oneRef);
                    current.children.push(oneRef);
                }
            }
        }
        dispose() {
            (0, lifecycle_1.$fc)(this.groups);
            this._onDidChangeReferenceRange.dispose();
            this.groups.length = 0;
        }
        clone() {
            return new $B4(this.c, this.d);
        }
        get title() {
            return this.d;
        }
        get isEmpty() {
            return this.groups.length === 0;
        }
        get ariaMessage() {
            if (this.isEmpty) {
                return (0, nls_1.localize)(4, null);
            }
            else if (this.references.length === 1) {
                return (0, nls_1.localize)(5, null, this.references[0].uri.fsPath);
            }
            else if (this.groups.length === 1) {
                return (0, nls_1.localize)(6, null, this.references.length, this.groups[0].uri.fsPath);
            }
            else {
                return (0, nls_1.localize)(7, null, this.references.length, this.groups.length);
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
                    prefixLen: strings.$Oe(ref.uri.toString(), resource.toString()),
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
                    if (range_1.$ks.containsPosition(ref.range, position)) {
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
        static e(a, b) {
            return resources_1.$$f.compare(a.uri, b.uri) || range_1.$ks.compareRangesUsingStarts(a.range, b.range);
        }
    }
    exports.$B4 = $B4;
});
//# sourceMappingURL=referencesModel.js.map