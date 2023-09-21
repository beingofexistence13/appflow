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
define(["require", "exports", "vs/base/common/event", "../common/decorations", "vs/base/common/ternarySearchTree", "vs/base/common/lifecycle", "vs/base/common/async", "vs/base/common/linkedList", "vs/base/browser/dom", "vs/platform/theme/common/themeService", "vs/base/common/themables", "vs/base/common/strings", "vs/nls", "vs/base/common/errors", "vs/base/common/cancellation", "vs/platform/instantiation/common/extensions", "vs/base/common/hash", "vs/platform/uriIdentity/common/uriIdentity", "vs/base/common/arrays", "vs/platform/theme/common/colorRegistry", "vs/platform/theme/common/iconRegistry"], function (require, exports, event_1, decorations_1, ternarySearchTree_1, lifecycle_1, async_1, linkedList_1, dom_1, themeService_1, themables_1, strings_1, nls_1, errors_1, cancellation_1, extensions_1, hash_1, uriIdentity_1, arrays_1, colorRegistry_1, iconRegistry_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.DecorationsService = void 0;
    class DecorationRule {
        static keyOf(data) {
            if (Array.isArray(data)) {
                return data.map(DecorationRule.keyOf).join(',');
            }
            else {
                const { color, letter } = data;
                if (themables_1.ThemeIcon.isThemeIcon(letter)) {
                    return `${color}+${letter.id}`;
                }
                else {
                    return `${color}/${letter}`;
                }
            }
        }
        static { this._classNamesPrefix = 'monaco-decoration'; }
        constructor(themeService, data, key) {
            this.themeService = themeService;
            this._refCounter = 0;
            this.data = data;
            const suffix = (0, hash_1.hash)(key).toString(36);
            this.itemColorClassName = `${DecorationRule._classNamesPrefix}-itemColor-${suffix}`;
            this.itemBadgeClassName = `${DecorationRule._classNamesPrefix}-itemBadge-${suffix}`;
            this.bubbleBadgeClassName = `${DecorationRule._classNamesPrefix}-bubbleBadge-${suffix}`;
            this.iconBadgeClassName = `${DecorationRule._classNamesPrefix}-iconBadge-${suffix}`;
        }
        acquire() {
            this._refCounter += 1;
        }
        release() {
            return --this._refCounter === 0;
        }
        appendCSSRules(element) {
            if (!Array.isArray(this.data)) {
                this._appendForOne(this.data, element);
            }
            else {
                this._appendForMany(this.data, element);
            }
        }
        _appendForOne(data, element) {
            const { color, letter } = data;
            // label
            (0, dom_1.createCSSRule)(`.${this.itemColorClassName}`, `color: ${getColor(color)};`, element);
            if (themables_1.ThemeIcon.isThemeIcon(letter)) {
                this._createIconCSSRule(letter, color, element);
            }
            else if (letter) {
                (0, dom_1.createCSSRule)(`.${this.itemBadgeClassName}::after`, `content: "${letter}"; color: ${getColor(color)};`, element);
            }
        }
        _appendForMany(data, element) {
            // label
            const { color } = data[0];
            (0, dom_1.createCSSRule)(`.${this.itemColorClassName}`, `color: ${getColor(color)};`, element);
            // badge or icon
            const letters = [];
            let icon;
            for (const d of data) {
                if (themables_1.ThemeIcon.isThemeIcon(d.letter)) {
                    icon = d.letter;
                    break;
                }
                else if (d.letter) {
                    letters.push(d.letter);
                }
            }
            if (icon) {
                this._createIconCSSRule(icon, color, element);
            }
            else {
                if (letters.length) {
                    (0, dom_1.createCSSRule)(`.${this.itemBadgeClassName}::after`, `content: "${letters.join(', ')}"; color: ${getColor(color)};`, element);
                }
                // bubble badge
                // TODO @misolori update bubble badge to adopt letter: ThemeIcon instead of unicode
                (0, dom_1.createCSSRule)(`.${this.bubbleBadgeClassName}::after`, `content: "\uea71"; color: ${getColor(color)}; font-family: codicon; font-size: 14px; margin-right: 14px; opacity: 0.4;`, element);
            }
        }
        _createIconCSSRule(icon, color, element) {
            const modifier = themables_1.ThemeIcon.getModifier(icon);
            if (modifier) {
                icon = themables_1.ThemeIcon.modify(icon, undefined);
            }
            const iconContribution = (0, iconRegistry_1.getIconRegistry)().getIcon(icon.id);
            if (!iconContribution) {
                return;
            }
            const definition = this.themeService.getProductIconTheme().getIcon(iconContribution);
            if (!definition) {
                return;
            }
            (0, dom_1.createCSSRule)(`.${this.iconBadgeClassName}::after`, `content: '${definition.fontCharacter}';
			color: ${icon.color ? getColor(icon.color.id) : getColor(color)};
			font-family: ${(0, dom_1.asCSSPropertyValue)(definition.font?.id ?? 'codicon')};
			font-size: 16px;
			margin-right: 14px;
			font-weight: normal;
			${modifier === 'spin' ? 'animation: codicon-spin 1.5s steps(30) infinite' : ''};
			`, element);
        }
        removeCSSRules(element) {
            (0, dom_1.removeCSSRulesContainingSelector)(this.itemColorClassName, element);
            (0, dom_1.removeCSSRulesContainingSelector)(this.itemBadgeClassName, element);
            (0, dom_1.removeCSSRulesContainingSelector)(this.bubbleBadgeClassName, element);
            (0, dom_1.removeCSSRulesContainingSelector)(this.iconBadgeClassName, element);
        }
    }
    class DecorationStyles {
        constructor(_themeService) {
            this._themeService = _themeService;
            this._styleElement = (0, dom_1.createStyleSheet)();
            this._decorationRules = new Map();
            this._dispoables = new lifecycle_1.DisposableStore();
        }
        dispose() {
            this._dispoables.dispose();
            this._styleElement.remove();
        }
        asDecoration(data, onlyChildren) {
            // sort by weight
            data.sort((a, b) => (b.weight || 0) - (a.weight || 0));
            const key = DecorationRule.keyOf(data);
            let rule = this._decorationRules.get(key);
            if (!rule) {
                // new css rule
                rule = new DecorationRule(this._themeService, data, key);
                this._decorationRules.set(key, rule);
                rule.appendCSSRules(this._styleElement);
            }
            rule.acquire();
            const labelClassName = rule.itemColorClassName;
            let badgeClassName = rule.itemBadgeClassName;
            const iconClassName = rule.iconBadgeClassName;
            let tooltip = (0, arrays_1.distinct)(data.filter(d => !(0, strings_1.isFalsyOrWhitespace)(d.tooltip)).map(d => d.tooltip)).join(' • ');
            const strikethrough = data.some(d => d.strikethrough);
            if (onlyChildren) {
                // show items from its children only
                badgeClassName = rule.bubbleBadgeClassName;
                tooltip = (0, nls_1.localize)('bubbleTitle', "Contains emphasized items");
            }
            return {
                labelClassName,
                badgeClassName,
                iconClassName,
                strikethrough,
                tooltip,
                dispose: () => {
                    if (rule?.release()) {
                        this._decorationRules.delete(key);
                        rule.removeCSSRules(this._styleElement);
                        rule = undefined;
                    }
                }
            };
        }
    }
    class FileDecorationChangeEvent {
        constructor(all) {
            this._data = ternarySearchTree_1.TernarySearchTree.forUris(_uri => true); // events ignore all path casings
            this._data.fill(true, (0, arrays_1.asArray)(all));
        }
        affectsResource(uri) {
            return this._data.hasElementOrSubtree(uri);
        }
    }
    class DecorationDataRequest {
        constructor(source, thenable) {
            this.source = source;
            this.thenable = thenable;
        }
    }
    function getColor(color) {
        return color ? (0, colorRegistry_1.asCssVariable)(color) : 'inherit';
    }
    let DecorationsService = class DecorationsService {
        constructor(uriIdentityService, themeService) {
            this._onDidChangeDecorationsDelayed = new event_1.DebounceEmitter({ merge: all => all.flat() });
            this._onDidChangeDecorations = new event_1.Emitter();
            this.onDidChangeDecorations = this._onDidChangeDecorations.event;
            this._provider = new linkedList_1.LinkedList();
            this._decorationStyles = new DecorationStyles(themeService);
            this._data = ternarySearchTree_1.TernarySearchTree.forUris(key => uriIdentityService.extUri.ignorePathCasing(key));
            this._onDidChangeDecorationsDelayed.event(event => { this._onDidChangeDecorations.fire(new FileDecorationChangeEvent(event)); });
        }
        dispose() {
            this._onDidChangeDecorations.dispose();
            this._onDidChangeDecorationsDelayed.dispose();
            this._data.clear();
        }
        registerDecorationsProvider(provider) {
            const rm = this._provider.unshift(provider);
            this._onDidChangeDecorations.fire({
                // everything might have changed
                affectsResource() { return true; }
            });
            // remove everything what came from this provider
            const removeAll = () => {
                const uris = [];
                for (const [uri, map] of this._data) {
                    if (map.delete(provider)) {
                        uris.push(uri);
                    }
                }
                if (uris.length > 0) {
                    this._onDidChangeDecorationsDelayed.fire(uris);
                }
            };
            const listener = provider.onDidChange(uris => {
                if (!uris) {
                    // flush event -> drop all data, can affect everything
                    removeAll();
                }
                else {
                    // selective changes -> drop for resource, fetch again, send event
                    for (const uri of uris) {
                        const map = this._ensureEntry(uri);
                        this._fetchData(map, uri, provider);
                    }
                }
            });
            return (0, lifecycle_1.toDisposable)(() => {
                rm();
                listener.dispose();
                removeAll();
            });
        }
        _ensureEntry(uri) {
            let map = this._data.get(uri);
            if (!map) {
                // nothing known about this uri
                map = new Map();
                this._data.set(uri, map);
            }
            return map;
        }
        getDecoration(uri, includeChildren) {
            const all = [];
            let containsChildren = false;
            const map = this._ensureEntry(uri);
            for (const provider of this._provider) {
                let data = map.get(provider);
                if (data === undefined) {
                    // sets data if fetch is sync
                    data = this._fetchData(map, uri, provider);
                }
                if (data && !(data instanceof DecorationDataRequest)) {
                    // having data
                    all.push(data);
                }
            }
            if (includeChildren) {
                // (resolved) children
                const iter = this._data.findSuperstr(uri);
                if (iter) {
                    for (const tuple of iter) {
                        for (const data of tuple[1].values()) {
                            if (data && !(data instanceof DecorationDataRequest)) {
                                if (data.bubble) {
                                    all.push(data);
                                    containsChildren = true;
                                }
                            }
                        }
                    }
                }
            }
            return all.length === 0
                ? undefined
                : this._decorationStyles.asDecoration(all, containsChildren);
        }
        _fetchData(map, uri, provider) {
            // check for pending request and cancel it
            const pendingRequest = map.get(provider);
            if (pendingRequest instanceof DecorationDataRequest) {
                pendingRequest.source.cancel();
                map.delete(provider);
            }
            const cts = new cancellation_1.CancellationTokenSource();
            const dataOrThenable = provider.provideDecorations(uri, cts.token);
            if (!(0, async_1.isThenable)(dataOrThenable)) {
                // sync -> we have a result now
                cts.dispose();
                return this._keepItem(map, provider, uri, dataOrThenable);
            }
            else {
                // async -> we have a result soon
                const request = new DecorationDataRequest(cts, Promise.resolve(dataOrThenable).then(data => {
                    if (map.get(provider) === request) {
                        this._keepItem(map, provider, uri, data);
                    }
                }).catch(err => {
                    if (!(0, errors_1.isCancellationError)(err) && map.get(provider) === request) {
                        map.delete(provider);
                    }
                }).finally(() => {
                    cts.dispose();
                }));
                map.set(provider, request);
                return null;
            }
        }
        _keepItem(map, provider, uri, data) {
            const deco = data ? data : null;
            const old = map.get(provider);
            map.set(provider, deco);
            if (deco || old) {
                // only fire event when something changed
                this._onDidChangeDecorationsDelayed.fire(uri);
            }
            return deco;
        }
    };
    exports.DecorationsService = DecorationsService;
    exports.DecorationsService = DecorationsService = __decorate([
        __param(0, uriIdentity_1.IUriIdentityService),
        __param(1, themeService_1.IThemeService)
    ], DecorationsService);
    (0, extensions_1.registerSingleton)(decorations_1.IDecorationsService, DecorationsService, 1 /* InstantiationType.Delayed */);
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZGVjb3JhdGlvbnNTZXJ2aWNlLmpzIiwic291cmNlUm9vdCI6ImZpbGU6Ly8vd29ya3NwYWNlL2FwcGZsb3cvc3JjLyIsInNvdXJjZXMiOlsidnMvd29ya2JlbmNoL3NlcnZpY2VzL2RlY29yYXRpb25zL2Jyb3dzZXIvZGVjb3JhdGlvbnNTZXJ2aWNlLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOzs7Z0dBR2dHOzs7Ozs7Ozs7Ozs7OztJQXVCaEcsTUFBTSxjQUFjO1FBRW5CLE1BQU0sQ0FBQyxLQUFLLENBQUMsSUFBeUM7WUFDckQsSUFBSSxLQUFLLENBQUMsT0FBTyxDQUFDLElBQUksQ0FBQyxFQUFFO2dCQUN4QixPQUFPLElBQUksQ0FBQyxHQUFHLENBQUMsY0FBYyxDQUFDLEtBQUssQ0FBQyxDQUFDLElBQUksQ0FBQyxHQUFHLENBQUMsQ0FBQzthQUNoRDtpQkFBTTtnQkFDTixNQUFNLEVBQUUsS0FBSyxFQUFFLE1BQU0sRUFBRSxHQUFHLElBQUksQ0FBQztnQkFDL0IsSUFBSSxxQkFBUyxDQUFDLFdBQVcsQ0FBQyxNQUFNLENBQUMsRUFBRTtvQkFDbEMsT0FBTyxHQUFHLEtBQUssSUFBSSxNQUFNLENBQUMsRUFBRSxFQUFFLENBQUM7aUJBQy9CO3FCQUFNO29CQUNOLE9BQU8sR0FBRyxLQUFLLElBQUksTUFBTSxFQUFFLENBQUM7aUJBQzVCO2FBQ0Q7UUFDRixDQUFDO2lCQUV1QixzQkFBaUIsR0FBRyxtQkFBbUIsQUFBdEIsQ0FBdUI7UUFVaEUsWUFBcUIsWUFBMkIsRUFBRSxJQUF5QyxFQUFFLEdBQVc7WUFBbkYsaUJBQVksR0FBWixZQUFZLENBQWU7WUFGeEMsZ0JBQVcsR0FBVyxDQUFDLENBQUM7WUFHL0IsSUFBSSxDQUFDLElBQUksR0FBRyxJQUFJLENBQUM7WUFDakIsTUFBTSxNQUFNLEdBQUcsSUFBQSxXQUFJLEVBQUMsR0FBRyxDQUFDLENBQUMsUUFBUSxDQUFDLEVBQUUsQ0FBQyxDQUFDO1lBQ3RDLElBQUksQ0FBQyxrQkFBa0Is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