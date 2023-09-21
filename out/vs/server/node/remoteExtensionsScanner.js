/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/base/common/path", "vs/base/common/platform", "vs/base/common/process", "vs/base/common/uri", "vs/base/common/performance", "vs/base/common/uriIpc", "vs/platform/contextkey/common/contextkey", "vs/platform/extensionManagement/common/extensionsScannerService", "vs/workbench/services/extensions/common/extensionsUtil", "vs/base/common/network"], function (require, exports, path_1, platform, process_1, uri_1, performance, uriIpc_1, contextkey_1, extensionsScannerService_1, extensionsUtil_1, network_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.RemoteExtensionsScannerChannel = exports.RemoteExtensionsScannerService = void 0;
    class RemoteExtensionsScannerService {
        constructor(_extensionManagementCLI, environmentService, _userDataProfilesService, _extensionsScannerService, _logService, _extensionGalleryService, _languagePackService) {
            this._extensionManagementCLI = _extensionManagementCLI;
            this._userDataProfilesService = _userDataProfilesService;
            this._extensionsScannerService = _extensionsScannerService;
            this._logService = _logService;
            this._extensionGalleryService = _extensionGalleryService;
            this._languagePackService = _languagePackService;
            this._whenBuiltinExtensionsReady = Promise.resolve();
            this._whenExtensionsReady = Promise.resolve();
            const builtinExtensionsToInstall = environmentService.args['install-builtin-extension'];
            if (builtinExtensionsToInstall) {
                _logService.trace('Installing builtin extensions passed via args...');
                const installOptions = { isMachineScoped: !!environmentService.args['do-not-sync'], installPreReleaseVersion: !!environmentService.args['pre-release'] };
                performance.mark('code/server/willInstallBuiltinExtensions');
                this._whenExtensionsReady = this._whenBuiltinExtensionsReady = _extensionManagementCLI.installExtensions([], this._asExtensionIdOrVSIX(builtinExtensionsToInstall), installOptions, !!environmentService.args['force'])
                    .then(() => {
                    performance.mark('code/server/didInstallBuiltinExtensions');
                    _logService.trace('Finished installing builtin extensions');
                }, error => {
                    _logService.error(error);
                });
            }
            const extensionsToInstall = environmentService.args['install-extension'];
            if (extensionsToInstall) {
                _logService.trace('Installing extensions passed via args...');
                this._whenExtensionsReady = this._whenBuiltinExtensionsReady
                    .then(() => _extensionManagementCLI.installExtensions(this._asExtensionIdOrVSIX(extensionsToInstall), [], {
                    isMachineScoped: !!environmentService.args['do-not-sync'],
                    installPreReleaseVersion: !!environmentService.args['pre-release'],
                    isApplicationScoped: true // extensions installed during server startup are available to all profiles
                }, !!environmentService.args['force']))
                    .then(() => {
                    _logService.trace('Finished installing extensions');
                }, error => {
                    _logService.error(error);
                });
            }
        }
        _asExtensionIdOrVSIX(inputs) {
            return inputs.map(input => /\.vsix$/i.test(input) ? uri_1.URI.file((0, path_1.isAbsolute)(input) ? input : (0, path_1.join)((0, process_1.cwd)(), input)) : input);
        }
        whenExtensionsReady() {
            return this._whenExtensionsReady;
        }
        async scanExtensions(language, profileLocation, extensionDevelopmentLocations, languagePackId) {
            performance.mark('code/server/willScanExtensions');
            this._logService.trace(`Scanning extensions using UI language: ${language}`);
            await this._whenBuiltinExtensionsReady;
            const extensionDevelopmentPaths = extensionDevelopmentLocations ? extensionDevelopmentLocations.filter(url => url.scheme === network_1.Schemas.file).map(url => url.fsPath) : undefined;
            profileLocation = profileLocation ?? this._userDataProfilesService.defaultProfile.extensionsResource;
            const extensions = await this._scanExtensions(profileLocation, language ?? platform.language, extensionDevelopmentPaths, languagePackId);
            this._logService.trace('Scanned Extensions', extensions);
            this._massageWhenConditions(extensions);
            performance.mark('code/server/didScanExtensions');
            return extensions;
        }
        async scanSingleExtension(extensionLocation, isBuiltin, language) {
            await this._whenBuiltinExtensionsReady;
            const extensionPath = extensionLocation.scheme === network_1.Schemas.file ? extensionLocation.fsPath : null;
            if (!extensionPath) {
                return null;
            }
            const extension = await this._scanSingleExtension(extensionPath, isBuiltin, language ?? platform.language);
            if (!extension) {
                return null;
            }
            this._massageWhenConditions([extension]);
            return extension;
        }
        async _scanExtensions(profileLocation, language, extensionDevelopmentPath, languagePackId) {
            await this._ensureLanguagePackIsInstalled(language, languagePackId);
            const [builtinExtensions, installedExtensions, developedExtensions] = await Promise.all([
                this._scanBuiltinExtensions(language),
                this._scanInstalledExtensions(profileLocation, language),
                this._scanDevelopedExtensions(language, extensionDevelopmentPath)
            ]);
            return (0, extensionsUtil_1.dedupExtensions)(builtinExtensions, installedExtensions, developedExtensions, this._logService);
        }
        async _scanDevelopedExtensions(language, extensionDevelopmentPaths) {
            if (extensionDevelopmentPaths) {
                return (await Promise.all(extensionDevelopmentPaths.map(extensionDevelopmentPath => this._extensionsScannerService.scanOneOrMultipleExtensions(uri_1.URI.file((0, path_1.resolve)(extensionDevelopmentPath)), 1 /* ExtensionType.User */, { language }))))
                    .flat()
                    .map(e => (0, extensionsScannerService_1.toExtensionDescription)(e, true));
            }
            return [];
        }
        async _scanBuiltinExtensions(language) {
            const scannedExtensions = await this._extensionsScannerService.scanSystemExtensions({ language, useCache: true });
            return scannedExtensions.map(e => (0, extensionsScannerService_1.toExtensionDescription)(e, false));
        }
        async _scanInstalledExtensions(profileLocation, language) {
            const scannedExtensions = await this._extensionsScannerService.scanUserExtensions({ profileLocation, language, useCache: true });
            return scannedExtensions.map(e => (0, extensionsScannerService_1.toExtensionDescription)(e, false));
        }
        async _scanSingleExtension(extensionPath, isBuiltin, language) {
            const extensionLocation = uri_1.URI.file((0, path_1.resolve)(extensionPath));
            const type = isBuiltin ? 0 /* ExtensionType.System */ : 1 /* ExtensionType.User */;
            const scannedExtension = await this._extensionsScannerService.scanExistingExtension(extensionLocation, type, { language });
            return scannedExtension ? (0, extensionsScannerService_1.toExtensionDescription)(scannedExtension, false) : null;
        }
        async _ensureLanguagePackIsInstalled(language, languagePackId) {
            if (
            // No need to install language packs for the default language
            language === platform.LANGUAGE_DEFAULT ||
                // The extension gallery service needs to be available
                !this._extensionGalleryService.isEnabled()) {
                return;
            }
            try {
                const installed = await this._languagePackService.getInstalledLanguages();
                if (installed.find(p => p.id === language)) {
                    this._logService.trace(`Language Pack ${language} is already installed. Skipping language pack installation.`);
                    return;
                }
            }
            catch (err) {
                // We tried to see what is installed but failed. We can try installing anyway.
                this._logService.error(err);
            }
            if (!languagePackId) {
                this._logService.trace(`No language pack id provided for language ${language}. Skipping language pack installation.`);
                return;
            }
            this._logService.trace(`Language Pack ${languagePackId} for language ${language} is not installed. It will be installed now.`);
            try {
                await this._extensionManagementCLI.installExtensions([languagePackId], [], { isMachineScoped: true }, true);
            }
            catch (err) {
                // We tried to install the language pack but failed. We can continue without it thus using the default language.
                this._logService.error(err);
            }
        }
        _massageWhenConditions(extensions) {
            // Massage "when" conditions which mention `resourceScheme`
            const _mapResourceSchemeValue = (value, isRegex) => {
                // console.log(`_mapResourceSchemeValue: ${value}, ${isRegex}`);
                return value.replace(/file/g, 'vscode-remote');
            };
            const _mapResourceRegExpValue = (value) => {
                let flags = '';
                flags += value.global ? 'g' : '';
                flags += value.ignoreCase ? 'i' : '';
                flags += value.multiline ? 'm' : '';
                return new RegExp(_mapResourceSchemeValue(value.source, true), flags);
            };
            const _exprKeyMapper = new class {
                mapDefined(key) {
                    return contextkey_1.ContextKeyDefinedExpr.create(key);
                }
                mapNot(key) {
                    return contextkey_1.ContextKeyNotExpr.create(key);
                }
                mapEquals(key, value) {
                    if (key === 'resourceScheme' && typeof value === 'string') {
                        return contextkey_1.ContextKeyEqualsExpr.create(key, _mapResourceSchemeValue(value, false));
                    }
                    else {
                        return contextkey_1.ContextKeyEqualsExpr.create(key, value);
                    }
                }
                mapNotEquals(key, value) {
                    if (key === 'resourceScheme' && typeof value === 'string') {
                        return contextkey_1.ContextKeyNotEqualsExpr.create(key, _mapResourceSchemeValue(value, false));
                    }
                    else {
                        return contextkey_1.ContextKeyNotEqualsExpr.create(key, value);
                    }
                }
                mapGreater(key, value) {
                    return contextkey_1.ContextKeyGreaterExpr.create(key, value);
                }
                mapGreaterEquals(key, value) {
                    return contextkey_1.ContextKeyGreaterEqualsExpr.create(key, value);
                }
                mapSmaller(key, value) {
                    return contextkey_1.ContextKeySmallerExpr.create(key, value);
                }
                mapSmallerEquals(key, value) {
                    return contextkey_1.ContextKeySmallerEqualsExpr.create(key, value);
                }
                mapRegex(key, regexp) {
                    if (key === 'resourceScheme' && regexp) {
                        return contextkey_1.ContextKeyRegexExpr.create(key, _mapResourceRegExpValue(regexp));
                    }
                    else {
                        return contextkey_1.ContextKeyRegexExpr.create(key, regexp);
                    }
                }
                mapIn(key, valueKey) {
                    return contextkey_1.ContextKeyInExpr.create(key, valueKey);
                }
                mapNotIn(key, valueKey) {
                    return contextkey_1.ContextKeyNotInExpr.create(key, valueKey);
                }
            };
            const _massageWhenUser = (element) => {
                if (!element || !element.when || !/resourceScheme/.test(element.when)) {
                    return;
                }
                const expr = contextkey_1.ContextKeyExpr.deserialize(element.when);
                if (!expr) {
                    return;
                }
                const massaged = expr.map(_exprKeyMapper);
                element.when = massaged.serialize();
            };
            const _massageWhenUserArr = (elements) => {
                if (Array.isArray(elements)) {
                    for (const element of elements) {
                        _massageWhenUser(element);
                    }
                }
                else {
                    _massageWhenUser(elements);
                }
            };
            const _massageLocWhenUser = (target) => {
                for (const loc in target) {
                    _massageWhenUserArr(target[loc]);
                }
            };
            extensions.forEach((extension) => {
                if (extension.contributes) {
                    if (extension.contributes.menus) {
                        _massageLocWhenUser(extension.contributes.menus);
                    }
                    if (extension.contributes.keybindings) {
                        _massageWhenUserArr(extension.contributes.keybindings);
                    }
                    if (extension.contributes.views) {
                        _massageLocWhenUser(extension.contributes.views);
                    }
                }
            });
        }
    }
    exports.RemoteExtensionsScannerService = RemoteExtensionsScannerService;
    class RemoteExtensionsScannerChannel {
        constructor(service, getUriTransformer) {
            this.service = service;
            this.getUriTransformer = getUriTransformer;
        }
        listen(context, event) {
            throw new Error('Invalid listen');
        }
        async call(context, command, args) {
            const uriTransformer = this.getUriTransformer(context);
            switch (command) {
                case 'whenExtensionsReady': return this.service.whenExtensionsReady();
                case 'scanExtensions': {
                    const language = args[0];
                    const profileLocation = args[1] ? uri_1.URI.revive(uriTransformer.transformIncoming(args[1])) : undefined;
                    const extensionDevelopmentPath = Array.isArray(args[2]) ? args[2].map(u => uri_1.URI.revive(uriTransformer.transformIncoming(u))) : undefined;
                    const languagePackId = args[3];
                    const extensions = await this.service.scanExtensions(language, profileLocation, extensionDevelopmentPath, languagePackId);
                    return extensions.map(extension => (0, uriIpc_1.transformOutgoingURIs)(extension, uriTransformer));
                }
                case 'scanSingleExtension': {
                    const extension = await this.service.scanSingleExtension(uri_1.URI.revive(uriTransformer.transformIncoming(args[0])), args[1], args[2]);
                    return extension ? (0, uriIpc_1.transformOutgoingURIs)(extension, uriTransformer) : null;
                }
            }
            throw new Error('Invalid call');
        }
    }
    exports.RemoteExtensionsScannerChannel = RemoteExtensionsScannerChannel;
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicmVtb3RlRXh0ZW5zaW9uc1NjYW5uZXIuanMiLCJzb3VyY2VSb290IjoiZmlsZTovLy93b3Jrc3BhY2UvYXBwZmxvdy9zcmMvIiwic291cmNlcyI6WyJ2cy9zZXJ2ZXIvbm9kZS9yZW1vdGVFeHRlbnNpb25zU2Nhbm5lci50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7O2dHQUdnRzs7Ozs7SUF1QmhHLE1BQWEsOEJBQThCO1FBTzFDLFlBQ2tCLHVCQUErQyxFQUNoRSxrQkFBNkMsRUFDNUIsd0JBQWtELEVBQ2xELHlCQUFvRCxFQUNwRCxXQUF3QixFQUN4Qix3QkFBa0QsRUFDbEQsb0JBQTBDO1lBTjFDLDRCQUF1QixHQUF2Qix1QkFBdUIsQ0FBd0I7WUFFL0MsNkJBQXdCLEdBQXhCLHdCQUF3QixDQUEwQjtZQUNsRCw4QkFBeUIsR0FBekIseUJBQXlCLENBQTJCO1lBQ3BELGdCQUFXLEdBQVgsV0FBVyxDQUFhO1lBQ3hCLDZCQUF3QixHQUF4Qix3QkFBd0IsQ0FBMEI7WUFDbEQseUJBQW9CLEdBQXBCLG9CQUFvQixDQUFzQjtZQVYzQyxnQ0FBMkIsR0FBRyxPQUFPLENBQUMsT0FBTyxFQUFFLENBQUM7WUFDaEQseUJBQW9CLEdBQUcsT0FBTyxDQUFDLE9BQU8sRUFBRSxDQUFDO1lBV3pELE1BQU0sMEJBQTBCLEdBQUcsa0JBQWtCLENBQUMsSUFBSSxDQUFDLDJCQUEyQixDQUFDLENBQUM7WUFDeEYsSUFBSSwwQkFBMEIsRUFBRTtnQkFDL0IsV0FBVyxDQUFDLEtBQUssQ0FBQyxrREFBa0QsQ0FBQyxDQUFDO2dCQUN0RSxNQUFNLGNBQWMsR0FBbUIsRUFBRSxlQUFlLEVBQUUsQ0FBQyxDQUFDLGtCQUFrQixDQUFDLElBQUksQ0FBQyxhQUFhLENBQUMsRUFBRSx3QkFBd0IsRUFBRSxDQUFDLENBQUMsa0JBQWtCLENBQUMsSUFBSSxDQUFDLGFBQWEsQ0FBQyxFQUFFLENBQUM7Z0JBQ3pLLFdBQVcsQ0FBQyxJQUFJLENBQUMsMENBQTBDLENBQUMsQ0FB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