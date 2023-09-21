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
define(["require", "exports", "vs/base/common/arrays", "vs/base/common/iterator", "vs/base/common/lifecycle", "vs/base/common/linkedList", "vs/base/common/platform", "vs/base/common/uri", "vs/editor/common/languages", "vs/nls", "vs/platform/configuration/common/configuration", "vs/platform/instantiation/common/instantiation", "vs/platform/log/common/log", "vs/platform/opener/common/opener", "vs/platform/quickinput/common/quickInput", "vs/workbench/contrib/externalUriOpener/common/configuration", "vs/workbench/contrib/url/common/urlGlob", "vs/workbench/services/preferences/common/preferences"], function (require, exports, arrays_1, iterator_1, lifecycle_1, linkedList_1, platform_1, uri_1, languages, nls, configuration_1, instantiation_1, log_1, opener_1, quickInput_1, configuration_2, urlGlob_1, preferences_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.ExternalUriOpenerService = exports.IExternalUriOpenerService = void 0;
    exports.IExternalUriOpenerService = (0, instantiation_1.createDecorator)('externalUriOpenerService');
    let ExternalUriOpenerService = class ExternalUriOpenerService extends lifecycle_1.Disposable {
        constructor(openerService, configurationService, logService, preferencesService, quickInputService) {
            super();
            this.configurationService = configurationService;
            this.logService = logService;
            this.preferencesService = preferencesService;
            this.quickInputService = quickInputService;
            this._providers = new linkedList_1.LinkedList();
            this._register(openerService.registerExternalOpener(this));
        }
        registerExternalOpenerProvider(provider) {
            const remove = this._providers.push(provider);
            return { dispose: remove };
        }
        async getOpeners(targetUri, allowOptional, ctx, token) {
            const allOpeners = await this.getAllOpenersForUri(targetUri);
            if (allOpeners.size === 0) {
                return [];
            }
            // First see if we have a preferredOpener
            if (ctx.preferredOpenerId) {
                if (ctx.preferredOpenerId === configuration_2.defaultExternalUriOpenerId) {
                    return [];
                }
                const preferredOpener = allOpeners.get(ctx.preferredOpenerId);
                if (preferredOpener) {
                    // Skip the `canOpen` check here since the opener was specifically requested.
                    return [preferredOpener];
                }
            }
            // Check to see if we have a configured opener
            const configuredOpener = this.getConfiguredOpenerForUri(allOpeners, targetUri);
            if (configuredOpener) {
                // Skip the `canOpen` check here since the opener was specifically requested.
                return configuredOpener === configuration_2.defaultExternalUriOpenerId ? [] : [configuredOpener];
            }
            // Then check to see if there is a valid opener
            const validOpeners = [];
            await Promise.all(Array.from(allOpeners.values()).map(async (opener) => {
                let priority;
                try {
                    priority = await opener.canOpen(ctx.sourceUri, token);
                }
                catch (e) {
                    this.logService.error(e);
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
            const preferred = (0, arrays_1.firstOrDefault)(validOpeners.filter(x => x.priority === languages.ExternalUriOpenerPriority.Preferred));
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
            const allOpeners = await this.getOpeners(targetUri, false, ctx, token);
            if (allOpeners.length === 0) {
                return false;
            }
            else if (allOpeners.length === 1) {
                return allOpeners[0].openExternalUri(targetUri, ctx, token);
            }
            // Otherwise prompt
            return this.showOpenerPrompt(allOpeners, targetUri, ctx, token);
        }
        async getOpener(targetUri, ctx, token) {
            const allOpeners = await this.getOpeners(targetUri, true, ctx, token);
            if (allOpeners.length >= 1) {
                return allOpeners[0];
            }
            return undefined;
        }
        async getAllOpenersForUri(targetUri) {
            const allOpeners = new Map();
            await Promise.all(iterator_1.Iterable.map(this._providers, async (provider) => {
                for await (const opener of provider.getOpeners(targetUri)) {
                    allOpeners.set(opener.id, opener);
                }
            }));
            return allOpeners;
        }
        getConfiguredOpenerForUri(openers, targetUri) {
            const config = this.configurationService.getValue(configuration_2.externalUriOpenersSettingId) || {};
            for (const [uriGlob, id] of Object.entries(config)) {
                if ((0, urlGlob_1.testUrlMatchesGlob)(targetUri, uriGlob)) {
                    if (id === configuration_2.defaultExternalUriOpenerId) {
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
        async showOpenerPrompt(openers, targetUri, ctx, token) {
            const items = openers.map((opener) => {
                return {
                    label: opener.label,
                    opener: opener
                };
            });
            items.push({
                label: platform_1.isWeb
                    ? nls.localize('selectOpenerDefaultLabel.web', 'Open in new browser window')
                    : nls.localize('selectOpenerDefaultLabel', 'Open in default browser'),
                opener: undefined
            }, { type: 'separator' }, {
                label: nls.localize('selectOpenerConfigureTitle', "Configure default opener..."),
                opener: 'configureDefault'
            });
            const picked = await this.quickInputService.pick(items, {
                placeHolder: nls.localize('selectOpenerPlaceHolder', "How would you like to open: {0}", targetUri.toString())
            });
            if (!picked) {
                // Still cancel the default opener here since we prompted the user
                return true;
            }
            if (typeof picked.opener === 'undefined') {
                return false; // Fallback to default opener
            }
            else if (picked.opener === 'configureDefault') {
                await this.preferencesService.openUserSettings({
                    jsonEditor: true,
                    revealSetting: { key: configuration_2.externalUriOpenersSettingId, edit: true }
                });
                return true;
            }
            else {
                return picked.opener.openExternalUri(targetUri, ctx, token);
            }
        }
    };
    exports.ExternalUriOpenerService = ExternalUriOpenerService;
    exports.ExternalUriOpenerService = ExternalUriOpenerService = __decorate([
        __param(0, opener_1.IOpenerService),
        __param(1, configuration_1.IConfigurationService),
        __param(2, log_1.ILogService),
        __param(3, preferences_1.IPreferencesService),
        __param(4, quickInput_1.IQuickInputService)
    ], ExternalUriOpenerService);
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZXh0ZXJuYWxVcmlPcGVuZXJTZXJ2aWNlLmpzIiwic291cmNlUm9vdCI6ImZpbGU6Ly8vd29ya3NwYWNlL2FwcGZsb3cvc3JjLyIsInNvdXJjZXMiOlsidnMvd29ya2JlbmNoL2NvbnRyaWIvZXh0ZXJuYWxVcmlPcGVuZXIvY29tbW9uL2V4dGVybmFsVXJpT3BlbmVyU2VydmljZS50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7O2dHQUdnRzs7Ozs7Ozs7Ozs7Ozs7SUFxQm5GLFFBQUEseUJBQXlCLEdBQUcsSUFBQSwrQkFBZSxFQUE0QiwwQkFBMEIsQ0FBQyxDQUFDO0lBOEJ6RyxJQUFNLHdCQUF3QixHQUE5QixNQUFNLHdCQUF5QixTQUFRLHNCQUFVO1FBTXZELFlBQ2lCLGFBQTZCLEVBQ3RCLG9CQUE0RCxFQUN0RSxVQUF3QyxFQUNoQyxrQkFBd0QsRUFDekQsaUJBQXNEO1lBRTFFLEtBQUssRUFBRSxDQUFDO1lBTGdDLHlCQUFvQixHQUFwQixvQkFBb0IsQ0FBdUI7WUFDckQsZUFBVSxHQUFWLFVBQVUsQ0FBYTtZQUNmLHVCQUFrQixHQUFsQixrQkFBa0IsQ0FBcUI7WUFDeEMsc0JBQWlCLEdBQWpCLGlCQUFpQixDQUFvQjtZQVAxRCxlQUFVLEdBQUcsSUFBSSx1QkFBVSxFQUEyQixDQUFDO1lBVXZFLElBQUksQ0FBQyxTQUFTLENBQUMsYUFBYSxDQUFDLHNCQUFzQixDQUFDLElBQUksQ0FBQyxDQUFDLENBQUM7UUFDNUQsQ0FBQztRQUVELDhCQUE4QixDQUFDLFFBQWlDO1lBQy9ELE1BQU0sTUFBTSxHQUFHLElBQUksQ0FBQyxVQUFVLENBQUMsSUFBSSxDQUFDLFFBQVEsQ0FBQyxDQUFDO1lBQzlDLE9BQU8sRUFBRSxPQUFPLEVBQUUsTUFBTSxFQUFFLENBQUM7UUFDNUIsQ0FBQztRQUVPLEtBQUssQ0FBQyxVQUFVLENBQUMsU0FBYyxFQUFFLGFBQXNCLEVBQUUsR0FBbUQsRUFBRSxLQUF3QjtZQUM3SSxNQUFNLFVBQVUsR0FBRyxNQUFNLElB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