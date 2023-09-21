/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/base/common/event", "vs/base/common/lifecycle", "vs/editor/common/model", "vs/editor/common/languageSelector"], function (require, exports, event_1, lifecycle_1, model_1, languageSelector_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.$dF = void 0;
    function isExclusive(selector) {
        if (typeof selector === 'string') {
            return false;
        }
        else if (Array.isArray(selector)) {
            return selector.every(isExclusive);
        }
        else {
            return !!selector.exclusive; // TODO: microsoft/TypeScript#42768
        }
    }
    class MatchCandidate {
        constructor(uri, languageId, notebookUri, notebookType) {
            this.uri = uri;
            this.languageId = languageId;
            this.notebookUri = notebookUri;
            this.notebookType = notebookType;
        }
        equals(other) {
            return this.notebookType === other.notebookType
                && this.languageId === other.languageId
                && this.uri.toString() === other.uri.toString()
                && this.notebookUri?.toString() === other.notebookUri?.toString();
        }
    }
    class $dF {
        constructor(f) {
            this.f = f;
            this.c = 0;
            this.d = [];
            this.e = new event_1.$fd();
            this.onDidChange = this.e.event;
        }
        register(selector, provider) {
            let entry = {
                selector,
                provider,
                _score: -1,
                _time: this.c++
            };
            this.d.push(entry);
            this.h = undefined;
            this.e.fire(this.d.length);
            return (0, lifecycle_1.$ic)(() => {
                if (entry) {
                    const idx = this.d.indexOf(entry);
                    if (idx >= 0) {
                        this.d.splice(idx, 1);
                        this.h = undefined;
                        this.e.fire(this.d.length);
                        entry = undefined;
                    }
                }
            });
        }
        has(model) {
            return this.all(model).length > 0;
        }
        all(model) {
            if (!model) {
                return [];
            }
            this.i(model);
            const result = [];
            // from registry
            for (const entry of this.d) {
                if (entry._score > 0) {
                    result.push(entry.provider);
                }
            }
            return result;
        }
        ordered(model) {
            const result = [];
            this.g(model, entry => result.push(entry.provider));
            return result;
        }
        orderedGroups(model) {
            const result = [];
            let lastBucket;
            let lastBucketScore;
            this.g(model, entry => {
                if (lastBucket && lastBucketScore === entry._score) {
                    lastBucket.push(entry.provider);
                }
                else {
                    lastBucketScore = entry._score;
                    lastBucket = [entry.provider];
                    result.push(lastBucket);
                }
            });
            return result;
        }
        g(model, callback) {
            this.i(model);
            for (const entry of this.d) {
                if (entry._score > 0) {
                    callback(entry);
                }
            }
        }
        i(model) {
            const notebookInfo = this.f?.(model.uri);
            // use the uri (scheme, pattern) of the notebook info iff we have one
            // otherwise it's the model's/document's uri
            const candidate = notebookInfo
                ? new MatchCandidate(model.uri, model.getLanguageId(), notebookInfo.uri, notebookInfo.type)
                : new MatchCandidate(model.uri, model.getLanguageId(), undefined, undefined);
            if (this.h?.equals(candidate)) {
                // nothing has changed
                return;
            }
            this.h = candidate;
            for (const entry of this.d) {
                entry._score = (0, languageSelector_1.$cF)(entry.selector, candidate.uri, candidate.languageId, (0, model_1.$Gu)(model), candidate.notebookUri, candidate.notebookType);
                if (isExclusive(entry.selector) && entry._score > 0) {
                    // support for one exclusive selector that overwrites
                    // any other selector
                    for (const entry of this.d) {
                        entry._score = 0;
                    }
                    entry._score = 1000;
                    break;
                }
            }
            // needs sorting
            this.d.sort($dF.j);
        }
        static j(a, b) {
            if (a._score < b._score) {
                return 1;
            }
            else if (a._score > b._score) {
                return -1;
            }
            // De-prioritize built-in providers
            if (isBuiltinSelector(a.selector) && !isBuiltinSelector(b.selector)) {
                return 1;
            }
            else if (!isBuiltinSelector(a.selector) && isBuiltinSelector(b.selector)) {
                return -1;
            }
            if (a._time < b._time) {
                return 1;
            }
            else if (a._time > b._time) {
                return -1;
            }
            else {
                return 0;
            }
        }
    }
    exports.$dF = $dF;
    function isBuiltinSelector(selector) {
        if (typeof selector === 'string') {
            return false;
        }
        if (Array.isArray(selector)) {
            return selector.some(isBuiltinSelector);
        }
        return Boolean(selector.isBuiltin);
    }
});
//# sourceMappingURL=languageFeatureRegistry.js.map