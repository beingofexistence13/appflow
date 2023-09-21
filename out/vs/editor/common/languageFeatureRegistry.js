/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/base/common/event", "vs/base/common/lifecycle", "vs/editor/common/model", "vs/editor/common/languageSelector"], function (require, exports, event_1, lifecycle_1, model_1, languageSelector_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.LanguageFeatureRegistry = void 0;
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
    class LanguageFeatureRegistry {
        constructor(_notebookInfoResolver) {
            this._notebookInfoResolver = _notebookInfoResolver;
            this._clock = 0;
            this._entries = [];
            this._onDidChange = new event_1.Emitter();
            this.onDidChange = this._onDidChange.event;
        }
        register(selector, provider) {
            let entry = {
                selector,
                provider,
                _score: -1,
                _time: this._clock++
            };
            this._entries.push(entry);
            this._lastCandidate = undefined;
            this._onDidChange.fire(this._entries.length);
            return (0, lifecycle_1.toDisposable)(() => {
                if (entry) {
                    const idx = this._entries.indexOf(entry);
                    if (idx >= 0) {
                        this._entries.splice(idx, 1);
                        this._lastCandidate = undefined;
                        this._onDidChange.fire(this._entries.length);
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
            this._updateScores(model);
            const result = [];
            // from registry
            for (const entry of this._entries) {
                if (entry._score > 0) {
                    result.push(entry.provider);
                }
            }
            return result;
        }
        ordered(model) {
            const result = [];
            this._orderedForEach(model, entry => result.push(entry.provider));
            return result;
        }
        orderedGroups(model) {
            const result = [];
            let lastBucket;
            let lastBucketScore;
            this._orderedForEach(model, entry => {
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
        _orderedForEach(model, callback) {
            this._updateScores(model);
            for (const entry of this._entries) {
                if (entry._score > 0) {
                    callback(entry);
                }
            }
        }
        _updateScores(model) {
            const notebookInfo = this._notebookInfoResolver?.(model.uri);
            // use the uri (scheme, pattern) of the notebook info iff we have one
            // otherwise it's the model's/document's uri
            const candidate = notebookInfo
                ? new MatchCandidate(model.uri, model.getLanguageId(), notebookInfo.uri, notebookInfo.type)
                : new MatchCandidate(model.uri, model.getLanguageId(), undefined, undefined);
            if (this._lastCandidate?.equals(candidate)) {
                // nothing has changed
                return;
            }
            this._lastCandidate = candidate;
            for (const entry of this._entries) {
                entry._score = (0, languageSelector_1.score)(entry.selector, candidate.uri, candidate.languageId, (0, model_1.shouldSynchronizeModel)(model), candidate.notebookUri, candidate.notebookType);
                if (isExclusive(entry.selector) && entry._score > 0) {
                    // support for one exclusive selector that overwrites
                    // any other selector
                    for (const entry of this._entries) {
                        entry._score = 0;
                    }
                    entry._score = 1000;
                    break;
                }
            }
            // needs sorting
            this._entries.sort(LanguageFeatureRegistry._compareByScoreAndTime);
        }
        static _compareByScoreAndTime(a, b) {
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
    exports.LanguageFeatureRegistry = LanguageFeatureRegistry;
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibGFuZ3VhZ2VGZWF0dXJlUmVnaXN0cnkuanMiLCJzb3VyY2VSb290IjoiZmlsZTovLy93b3Jrc3BhY2UvYXBwZmxvdy9zcmMvIiwic291cmNlcyI6WyJ2cy9lZGl0b3IvY29tbW9uL2xhbmd1YWdlRmVhdHVyZVJlZ2lzdHJ5LnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOzs7Z0dBR2dHOzs7OztJQWVoRyxTQUFTLFdBQVcsQ0FBQyxRQUEwQjtRQUM5QyxJQUFJLE9BQU8sUUFBUSxLQUFLLFFBQVEsRUFBRTtZQUNqQyxPQUFPLEtBQUssQ0FBQztTQUNiO2FBQU0sSUFBSSxLQUFLLENBQUMsT0FBTyxDQUFDLFFBQVEsQ0FBQyxFQUFFO1lBQ25DLE9BQU8sUUFBUSxDQUFDLEtBQUssQ0FBQyxXQUFXLENBQUMsQ0FBQztTQUNuQzthQUFNO1lBQ04sT0FBTyxDQUFDLENBQUUsUUFBMkIsQ0FBQyxTQUFTLENBQUMsQ0FBQyxtQ0FBbUM7U0FDcEY7SUFDRixDQUFDO0lBV0QsTUFBTSxjQUFjO1FBQ25CLFlBQ1UsR0FBUSxFQUNSLFVBQWtCLEVBQ2xCLFdBQTRCLEVBQzVCLFlBQWdDO1lBSGhDLFFBQUcsR0FBSCxHQUFHLENBQUs7WUFDUixlQUFVLEdBQVYsVUFBVSxDQUFRO1lBQ2xCLGdCQUFXLEdBQVgsV0FBVyxDQUFpQjtZQUM1QixpQkFBWSxHQUFaLFlBQVksQ0FBb0I7UUFDdEMsQ0FBQztRQUVMLE1BQU0sQ0FBQyxLQUFxQjtZQUMzQixPQUFPLElBQUksQ0FBQyxZQUFZLEtBQUssS0FBSyxDQUFDLFlBQVk7bUJBQzNDLElBQUksQ0FBQyxVQUFVLEtBQUssS0FBSyxDQUFDLFVBQVU7bUJBQ3BDLElBQUksQ0FBQyxHQUFHLENBQUMsUUFBUSxFQUFFLEtBQUssS0FBSyxDQUFDLEdBQUcsQ0FBQyxRQUFRLEVBQUU7bUJBQzVDLElBQUksQ0FBQyxXQUFXLEVBQUUsUUFBUSxFQUFFLEtBQUssS0FBSyxDQUFDLFdBQVcsRUFBRSxRQUFRLEVBQUUsQ0FBQztRQUNw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