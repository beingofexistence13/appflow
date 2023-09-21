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
define(["require", "exports", "vs/base/common/event", "../common/decorations", "vs/base/common/ternarySearchTree", "vs/base/common/lifecycle", "vs/base/common/async", "vs/base/common/linkedList", "vs/base/browser/dom", "vs/platform/theme/common/themeService", "vs/base/common/themables", "vs/base/common/strings", "vs/nls!vs/workbench/services/decorations/browser/decorationsService", "vs/base/common/errors", "vs/base/common/cancellation", "vs/platform/instantiation/common/extensions", "vs/base/common/hash", "vs/platform/uriIdentity/common/uriIdentity", "vs/base/common/arrays", "vs/platform/theme/common/colorRegistry", "vs/platform/theme/common/iconRegistry"], function (require, exports, event_1, decorations_1, ternarySearchTree_1, lifecycle_1, async_1, linkedList_1, dom_1, themeService_1, themables_1, strings_1, nls_1, errors_1, cancellation_1, extensions_1, hash_1, uriIdentity_1, arrays_1, colorRegistry_1, iconRegistry_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.$ryb = void 0;
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
        static { this.c = 'monaco-decoration'; }
        constructor(themeService, data, key) {
            this.themeService = themeService;
            this.e = 0;
            this.data = data;
            const suffix = (0, hash_1.$pi)(key).toString(36);
            this.itemColorClassName = `${DecorationRule.c}-itemColor-${suffix}`;
            this.itemBadgeClassName = `${DecorationRule.c}-itemBadge-${suffix}`;
            this.bubbleBadgeClassName = `${DecorationRule.c}-bubbleBadge-${suffix}`;
            this.iconBadgeClassName = `${DecorationRule.c}-iconBadge-${suffix}`;
        }
        acquire() {
            this.e += 1;
        }
        release() {
            return --this.e === 0;
        }
        appendCSSRules(element) {
            if (!Array.isArray(this.data)) {
                this.f(this.data, element);
            }
            else {
                this.g(this.data, element);
            }
        }
        f(data, element) {
            const { color, letter } = data;
            // label
            (0, dom_1.$ZO)(`.${this.itemColorClassName}`, `color: ${getColor(color)};`, element);
            if (themables_1.ThemeIcon.isThemeIcon(letter)) {
                this.h(letter, color, element);
            }
            else if (letter) {
                (0, dom_1.$ZO)(`.${this.itemBadgeClassName}::after`, `content: "${letter}"; color: ${getColor(color)};`, element);
            }
        }
        g(data, element) {
            // label
            const { color } = data[0];
            (0, dom_1.$ZO)(`.${this.itemColorClassName}`, `color: ${getColor(color)};`, element);
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
                this.h(icon, color, element);
            }
            else {
                if (letters.length) {
                    (0, dom_1.$ZO)(`.${this.itemBadgeClassName}::after`, `content: "${letters.join(', ')}"; color: ${getColor(color)};`, element);
                }
                // bubble badge
                // TODO @misolori update bubble badge to adopt letter: ThemeIcon instead of unicode
                (0, dom_1.$ZO)(`.${this.bubbleBadgeClassName}::after`, `content: "\uea71"; color: ${getColor(color)}; font-family: codicon; font-size: 14px; margin-right: 14px; opacity: 0.4;`, element);
            }
        }
        h(icon, color, element) {
            const modifier = themables_1.ThemeIcon.getModifier(icon);
            if (modifier) {
                icon = themables_1.ThemeIcon.modify(icon, undefined);
            }
            const iconContribution = (0, iconRegistry_1.$0u)().getIcon(icon.id);
            if (!iconContribution) {
                return;
            }
            const definition = this.themeService.getProductIconTheme().getIcon(iconContribution);
            if (!definition) {
                return;
            }
            (0, dom_1.$ZO)(`.${this.iconBadgeClassName}::after`, `content: '${definition.fontCharacter}';
			color: ${icon.color ? getColor(icon.color.id) : getColor(color)};
			font-family: ${(0, dom_1.$oP)(definition.font?.id ?? 'codicon')};
			font-size: 16px;
			margin-right: 14px;
			font-weight: normal;
			${modifier === 'spin' ? 'animation: codicon-spin 1.5s steps(30) infinite' : ''};
			`, element);
        }
        removeCSSRules(element) {
            (0, dom_1.$1O)(this.itemColorClassName, element);
            (0, dom_1.$1O)(this.itemBadgeClassName, element);
            (0, dom_1.$1O)(this.bubbleBadgeClassName, element);
            (0, dom_1.$1O)(this.iconBadgeClassName, element);
        }
    }
    class DecorationStyles {
        constructor(g) {
            this.g = g;
            this.c = (0, dom_1.$XO)();
            this.e = new Map();
            this.f = new lifecycle_1.$jc();
        }
        dispose() {
            this.f.dispose();
            this.c.remove();
        }
        asDecoration(data, onlyChildren) {
            // sort by weight
            data.sort((a, b) => (b.weight || 0) - (a.weight || 0));
            const key = DecorationRule.keyOf(data);
            let rule = this.e.get(key);
            if (!rule) {
                // new css rule
                rule = new DecorationRule(this.g, data, key);
                this.e.set(key, rule);
                rule.appendCSSRules(this.c);
            }
            rule.acquire();
            const labelClassName = rule.itemColorClassName;
            let badgeClassName = rule.itemBadgeClassName;
            const iconClassName = rule.iconBadgeClassName;
            let tooltip = (0, arrays_1.$Kb)(data.filter(d => !(0, strings_1.$me)(d.tooltip)).map(d => d.tooltip)).join(' • ');
            const strikethrough = data.some(d => d.strikethrough);
            if (onlyChildren) {
                // show items from its children only
                badgeClassName = rule.bubbleBadgeClassName;
                tooltip = (0, nls_1.localize)(0, null);
            }
            return {
                labelClassName,
                badgeClassName,
                iconClassName,
                strikethrough,
                tooltip,
                dispose: () => {
                    if (rule?.release()) {
                        this.e.delete(key);
                        rule.removeCSSRules(this.c);
                        rule = undefined;
                    }
                }
            };
        }
    }
    class FileDecorationChangeEvent {
        constructor(all) {
            this.c = ternarySearchTree_1.$Hh.forUris(_uri => true); // events ignore all path casings
            this.c.fill(true, (0, arrays_1.$1b)(all));
        }
        affectsResource(uri) {
            return this.c.hasElementOrSubtree(uri);
        }
    }
    class DecorationDataRequest {
        constructor(source, thenable) {
            this.source = source;
            this.thenable = thenable;
        }
    }
    function getColor(color) {
        return color ? (0, colorRegistry_1.$pv)(color) : 'inherit';
    }
    let $ryb = class $ryb {
        constructor(uriIdentityService, themeService) {
            this.c = new event_1.$jd({ merge: all => all.flat() });
            this.e = new event_1.$fd();
            this.onDidChangeDecorations = this.e.event;
            this.f = new linkedList_1.$tc();
            this.g = new DecorationStyles(themeService);
            this.h = ternarySearchTree_1.$Hh.forUris(key => uriIdentityService.extUri.ignorePathCasing(key));
            this.c.event(event => { this.e.fire(new FileDecorationChangeEvent(event)); });
        }
        dispose() {
            this.e.dispose();
            this.c.dispose();
            this.h.clear();
        }
        registerDecorationsProvider(provider) {
            const rm = this.f.unshift(provider);
            this.e.fire({
                // everything might have changed
                affectsResource() { return true; }
            });
            // remove everything what came from this provider
            const removeAll = () => {
                const uris = [];
                for (const [uri, map] of this.h) {
                    if (map.delete(provider)) {
                        uris.push(uri);
                    }
                }
                if (uris.length > 0) {
                    this.c.fire(uris);
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
                        const map = this.i(uri);
                        this.j(map, uri, provider);
                    }
                }
            });
            return (0, lifecycle_1.$ic)(() => {
                rm();
                listener.dispose();
                removeAll();
            });
        }
        i(uri) {
            let map = this.h.get(uri);
            if (!map) {
                // nothing known about this uri
                map = new Map();
                this.h.set(uri, map);
            }
            return map;
        }
        getDecoration(uri, includeChildren) {
            const all = [];
            let containsChildren = false;
            const map = this.i(uri);
            for (const provider of this.f) {
                let data = map.get(provider);
                if (data === undefined) {
                    // sets data if fetch is sync
                    data = this.j(map, uri, provider);
                }
                if (data && !(data instanceof DecorationDataRequest)) {
                    // having data
                    all.push(data);
                }
            }
            if (includeChildren) {
                // (resolved) children
                const iter = this.h.findSuperstr(uri);
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
                : this.g.asDecoration(all, containsChildren);
        }
        j(map, uri, provider) {
            // check for pending request and cancel it
            const pendingRequest = map.get(provider);
            if (pendingRequest instanceof DecorationDataRequest) {
                pendingRequest.source.cancel();
                map.delete(provider);
            }
            const cts = new cancellation_1.$pd();
            const dataOrThenable = provider.provideDecorations(uri, cts.token);
            if (!(0, async_1.$tg)(dataOrThenable)) {
                // sync -> we have a result now
                cts.dispose();
                return this.k(map, provider, uri, dataOrThenable);
            }
            else {
                // async -> we have a result soon
                const request = new DecorationDataRequest(cts, Promise.resolve(dataOrThenable).then(data => {
                    if (map.get(provider) === request) {
                        this.k(map, provider, uri, data);
                    }
                }).catch(err => {
                    if (!(0, errors_1.$2)(err) && map.get(provider) === request) {
                        map.delete(provider);
                    }
                }).finally(() => {
                    cts.dispose();
                }));
                map.set(provider, request);
                return null;
            }
        }
        k(map, provider, uri, data) {
            const deco = data ? data : null;
            const old = map.get(provider);
            map.set(provider, deco);
            if (deco || old) {
                // only fire event when something changed
                this.c.fire(uri);
            }
            return deco;
        }
    };
    exports.$ryb = $ryb;
    exports.$ryb = $ryb = __decorate([
        __param(0, uriIdentity_1.$Ck),
        __param(1, themeService_1.$gv)
    ], $ryb);
    (0, extensions_1.$mr)(decorations_1.$Gcb, $ryb, 1 /* InstantiationType.Delayed */);
});
//# sourceMappingURL=decorationsService.js.map