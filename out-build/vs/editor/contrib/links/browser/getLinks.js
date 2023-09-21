/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/base/common/arrays", "vs/base/common/cancellation", "vs/base/common/errors", "vs/base/common/lifecycle", "vs/base/common/types", "vs/base/common/uri", "vs/editor/common/core/range", "vs/editor/common/services/model", "vs/platform/commands/common/commands", "vs/editor/common/services/languageFeatures"], function (require, exports, arrays_1, cancellation_1, errors_1, lifecycle_1, types_1, uri_1, range_1, model_1, commands_1, languageFeatures_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.$39 = exports.$29 = exports.$19 = void 0;
    class $19 {
        constructor(link, provider) {
            this.a = link;
            this.b = provider;
        }
        toJSON() {
            return {
                range: this.range,
                url: this.url,
                tooltip: this.tooltip
            };
        }
        get range() {
            return this.a.range;
        }
        get url() {
            return this.a.url;
        }
        get tooltip() {
            return this.a.tooltip;
        }
        async resolve(token) {
            if (this.a.url) {
                return this.a.url;
            }
            if (typeof this.b.resolveLink === 'function') {
                return Promise.resolve(this.b.resolveLink(this.a, token)).then(value => {
                    this.a = value || this.a;
                    if (this.a.url) {
                        // recurse
                        return this.resolve(token);
                    }
                    return Promise.reject(new Error('missing'));
                });
            }
            return Promise.reject(new Error('missing'));
        }
    }
    exports.$19 = $19;
    class $29 {
        constructor(tuples) {
            this.a = new lifecycle_1.$jc();
            let links = [];
            for (const [list, provider] of tuples) {
                // merge all links
                const newLinks = list.links.map(link => new $19(link, provider));
                links = $29.b(links, newLinks);
                // register disposables
                if ((0, lifecycle_1.$ec)(list)) {
                    this.a.add(list);
                }
            }
            this.links = links;
        }
        dispose() {
            this.a.dispose();
            this.links.length = 0;
        }
        static b(oldLinks, newLinks) {
            // reunite oldLinks with newLinks and remove duplicates
            const result = [];
            let oldIndex;
            let oldLen;
            let newIndex;
            let newLen;
            for (oldIndex = 0, newIndex = 0, oldLen = oldLinks.length, newLen = newLinks.length; oldIndex < oldLen && newIndex < newLen;) {
                const oldLink = oldLinks[oldIndex];
                const newLink = newLinks[newIndex];
                if (range_1.$ks.areIntersectingOrTouching(oldLink.range, newLink.range)) {
                    // Remove the oldLink
                    oldIndex++;
                    continue;
                }
                const comparisonResult = range_1.$ks.compareRangesUsingStarts(oldLink.range, newLink.range);
                if (comparisonResult < 0) {
                    // oldLink is before
                    result.push(oldLink);
                    oldIndex++;
                }
                else {
                    // newLink is before
                    result.push(newLink);
                    newIndex++;
                }
            }
            for (; oldIndex < oldLen; oldIndex++) {
                result.push(oldLinks[oldIndex]);
            }
            for (; newIndex < newLen; newIndex++) {
                result.push(newLinks[newIndex]);
            }
            return result;
        }
    }
    exports.$29 = $29;
    function $39(providers, model, token) {
        const lists = [];
        // ask all providers for links in parallel
        const promises = providers.ordered(model).reverse().map((provider, i) => {
            return Promise.resolve(provider.provideLinks(model, token)).then(result => {
                if (result) {
                    lists[i] = [result, provider];
                }
            }, errors_1.$Z);
        });
        return Promise.all(promises).then(() => {
            const result = new $29((0, arrays_1.$Fb)(lists));
            if (!token.isCancellationRequested) {
                return result;
            }
            result.dispose();
            return new $29([]);
        });
    }
    exports.$39 = $39;
    commands_1.$Gr.registerCommand('_executeLinkProvider', async (accessor, ...args) => {
        let [uri, resolveCount] = args;
        (0, types_1.$tf)(uri instanceof uri_1.URI);
        if (typeof resolveCount !== 'number') {
            resolveCount = 0;
        }
        const { linkProvider } = accessor.get(languageFeatures_1.$hF);
        const model = accessor.get(model_1.$yA).getModel(uri);
        if (!model) {
            return [];
        }
        const list = await $39(linkProvider, model, cancellation_1.CancellationToken.None);
        if (!list) {
            return [];
        }
        // resolve links
        for (let i = 0; i < Math.min(resolveCount, list.links.length); i++) {
            await list.links[i].resolve(cancellation_1.CancellationToken.None);
        }
        const result = list.links.slice(0);
        list.dispose();
        return result;
    });
});
//# sourceMappingURL=getLinks.js.map