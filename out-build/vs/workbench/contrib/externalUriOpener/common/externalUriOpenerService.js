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
define(["require", "exports", "vs/base/common/arrays", "vs/base/common/iterator", "vs/base/common/lifecycle", "vs/base/common/linkedList", "vs/base/common/platform", "vs/base/common/uri", "vs/editor/common/languages", "vs/nls!vs/workbench/contrib/externalUriOpener/common/externalUriOpenerService", "vs/platform/configuration/common/configuration", "vs/platform/instantiation/common/instantiation", "vs/platform/log/common/log", "vs/platform/opener/common/opener", "vs/platform/quickinput/common/quickInput", "vs/workbench/contrib/externalUriOpener/common/configuration", "vs/workbench/contrib/url/common/urlGlob", "vs/workbench/services/preferences/common/preferences"], function (require, exports, arrays_1, iterator_1, lifecycle_1, linkedList_1, platform_1, uri_1, languages, nls, configuration_1, instantiation_1, log_1, opener_1, quickInput_1, configuration_2, urlGlob_1, preferences_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.$glb = exports.$flb = void 0;
    exports.$flb = (0, instantiation_1.$Bh)('externalUriOpenerService');
    let $glb = class $glb extends lifecycle_1.$kc {
        constructor(openerService, b, c, f, g) {
            super();
            this.b = b;
            this.c = c;
            this.f = f;
            this.g = g;
            this.a = new linkedList_1.$tc();
            this.B(openerService.registerExternalOpener(this));
        }
        registerExternalOpenerProvider(provider) {
            const remove = this.a.push(provider);
            return { dispose: remove };
        }
        async h(targetUri, allowOptional, ctx, token) {
            const allOpeners = await this.j(targetUri);
            if (allOpeners.size === 0) {
                return [];
            }
            // First see if we have a preferredOpener
            if (ctx.preferredOpenerId) {
                if (ctx.preferredOpenerId === configuration_2.$_kb) {
                    return [];
                }
                const preferredOpener = allOpeners.get(ctx.preferredOpenerId);
                if (preferredOpener) {
                    // Skip the `canOpen` check here since the opener was specifically requested.
                    return [preferredOpener];
                }
            }
            // Check to see if we have a configured opener
            const configuredOpener = this.m(allOpeners, targetUri);
            if (configuredOpener) {
                // Skip the `canOpen` check here since the opener was specifically requested.
                return configuredOpener === configuration_2.$_kb ? [] : [configuredOpener];
            }
            // Then check to see if there is a valid opener
            const validOpeners = [];
            await Promise.all(Array.from(allOpeners.values()).map(async (opener) => {
                let priority;
                try {
                    priority = await opener.canOpen(ctx.sourceUri, token);
                }
                catch (e) {
                    this.c.error(e);
                    return;
                }
                switch (priority) {
                    case languages.ExternalUriOpenerPriority.Option:
                    case languages.ExternalUriOpenerPriority.Default:
                    case languages.ExternalUriOpenerPriority.Preferred:
                        validOpeners.push({ opener, priority });
                        break;
                }
            }));
            if (validOpeners.length === 0) {
                return [];
            }
            // See if we have a preferred opener first
            const preferred = (0, arrays_1.$Mb)(validOpeners.filter(x => x.priority === languages.ExternalUriOpenerPriority.Preferred));
            if (preferred) {
                return [preferred.opener];
            }
            // See if we only have optional openers, use the default opener
            if (!allowOptional && validOpeners.every(x => x.priority === languages.ExternalUriOpenerPriority.Option)) {
                return [];
            }
            return validOpeners.map(value => value.opener);
        }
        async openExternal(href, ctx, token) {
            const targetUri = typeof href === 'string' ? uri_1.URI.parse(href) : href;
            const allOpeners = await this.h(targetUri, false, ctx, token);
            if (allOpeners.length === 0) {
                return false;
            }
            else if (allOpeners.length === 1) {
                return allOpeners[0].openExternalUri(targetUri, ctx, token);
            }
            // Otherwise prompt
            return this.n(allOpeners, targetUri, ctx, token);
        }
        async getOpener(targetUri, ctx, token) {
            const allOpeners = await this.h(targetUri, true, ctx, token);
            if (allOpeners.length >= 1) {
                return allOpeners[0];
            }
            return undefined;
        }
        async j(targetUri) {
            const allOpeners = new Map();
            await Promise.all(iterator_1.Iterable.map(this.a, async (provider) => {
                for await (const opener of provider.getOpeners(targetUri)) {
                    allOpeners.set(opener.id, opener);
                }
            }));
            return allOpeners;
        }
        m(openers, targetUri) {
            const config = this.b.getValue(configuration_2.$alb) || {};
            for (const [uriGlob, id] of Object.entries(config)) {
                if ((0, urlGlob_1.$elb)(targetUri, uriGlob)) {
                    if (id === configuration_2.$_kb) {
                        return 'default';
                    }
                    const entry = openers.get(id);
                    if (entry) {
                        return entry;
                    }
                }
            }
            return undefined;
        }
        async n(openers, targetUri, ctx, token) {
            const items = openers.map((opener) => {
                return {
                    label: opener.label,
                    opener: opener
                };
            });
            items.push({
                label: platform_1.$o
                    ? nls.localize(0, null)
                    : nls.localize(1, null),
                opener: undefined
            }, { type: 'separator' }, {
                label: nls.localize(2, null),
                opener: 'configureDefault'
            });
            const picked = await this.g.pick(items, {
                placeHolder: nls.localize(3, null, targetUri.toString())
            });
            if (!picked) {
                // Still cancel the default opener here since we prompted the user
                return true;
            }
            if (typeof picked.opener === 'undefined') {
                return false; // Fallback to default opener
            }
            else if (picked.opener === 'configureDefault') {
                await this.f.openUserSettings({
                    jsonEditor: true,
                    revealSetting: { key: configuration_2.$alb, edit: true }
                });
                return true;
            }
            else {
                return picked.opener.openExternalUri(targetUri, ctx, token);
            }
        }
    };
    exports.$glb = $glb;
    exports.$glb = $glb = __decorate([
        __param(0, opener_1.$NT),
        __param(1, configuration_1.$8h),
        __param(2, log_1.$5i),
        __param(3, preferences_1.$BE),
        __param(4, quickInput_1.$Gq)
    ], $glb);
});
//# sourceMappingURL=externalUriOpenerService.js.map