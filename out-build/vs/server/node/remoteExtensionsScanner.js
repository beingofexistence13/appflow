/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/base/common/path", "vs/base/common/platform", "vs/base/common/process", "vs/base/common/uri", "vs/base/common/performance", "vs/base/common/uriIpc", "vs/platform/contextkey/common/contextkey", "vs/platform/extensionManagement/common/extensionsScannerService", "vs/workbench/services/extensions/common/extensionsUtil", "vs/base/common/network"], function (require, exports, path_1, platform, process_1, uri_1, performance, uriIpc_1, contextkey_1, extensionsScannerService_1, extensionsUtil_1, network_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.$rN = exports.$qN = void 0;
    class $qN {
        constructor(c, environmentService, d, f, g, h, i) {
            this.c = c;
            this.d = d;
            this.f = f;
            this.g = g;
            this.h = h;
            this.i = i;
            this.a = Promise.resolve();
            this.b = Promise.resolve();
            const builtinExtensionsToInstall = environmentService.args['install-builtin-extension'];
            if (builtinExtensionsToInstall) {
                g.trace('Installing builtin extensions passed via args...');
                const installOptions = { isMachineScoped: !!environmentService.args['do-not-sync'], installPreReleaseVersion: !!environmentService.args['pre-release'] };
                performance.mark('code/server/willInstallBuiltinExtensions');
                this.b = this.a = c.installExtensions([], this.j(builtinExtensionsToInstall), installOptions, !!environmentService.args['force'])
                    .then(() => {
                    performance.mark('code/server/didInstallBuiltinExtensions');
                    g.trace('Finished installing builtin extensions');
                }, error => {
                    g.error(error);
                });
            }
            const extensionsToInstall = environmentService.args['install-extension'];
            if (extensionsToInstall) {
                g.trace('Installing extensions passed via args...');
                this.b = this.a
                    .then(() => c.installExtensions(this.j(extensionsToInstall), [], {
                    isMachineScoped: !!environmentService.args['do-not-sync'],
                    installPreReleaseVersion: !!environmentService.args['pre-release'],
                    isApplicationScoped: true // extensions installed during server startup are available to all profiles
                }, !!environmentService.args['force']))
                    .then(() => {
                    g.trace('Finished installing extensions');
                }, error => {
                    g.error(error);
                });
            }
        }
        j(inputs) {
            return inputs.map(input => /\.vsix$/i.test(input) ? uri_1.URI.file((0, path_1.$8d)(input) ? input : (0, path_1.$9d)((0, process_1.cwd)(), input)) : input);
        }
        whenExtensionsReady() {
            return this.b;
        }
        async scanExtensions(language, profileLocation, extensionDevelopmentLocations, languagePackId) {
            performance.mark('code/server/willScanExtensions');
            this.g.trace(`Scanning extensions using UI language: ${language}`);
            await this.a;
            const extensionDevelopmentPaths = extensionDevelopmentLocations ? extensionDevelopmentLocations.filter(url => url.scheme === network_1.Schemas.file).map(url => url.fsPath) : undefined;
            profileLocation = profileLocation ?? this.d.defaultProfile.extensionsResource;
            const extensions = await this.k(profileLocation, language ?? platform.$v, extensionDevelopmentPaths, languagePackId);
            this.g.trace('Scanned Extensions', extensions);
            this.r(extensions);
            performance.mark('code/server/didScanExtensions');
            return extensions;
        }
        async scanSingleExtension(extensionLocation, isBuiltin, language) {
            await this.a;
            const extensionPath = extensionLocation.scheme === network_1.Schemas.file ? extensionLocation.fsPath : null;
            if (!extensionPath) {
                return null;
            }
            const extension = await this.o(extensionPath, isBuiltin, language ?? platform.$v);
            if (!extension) {
                return null;
            }
            this.r([extension]);
            return extension;
        }
        async k(profileLocation, language, extensionDevelopmentPath, languagePackId) {
            await this.q(language, languagePackId);
            const [builtinExtensions, installedExtensions, developedExtensions] = await Promise.all([
                this.m(language),
                this.n(profileLocation, language),
                this.l(language, extensionDevelopmentPath)
            ]);
            return (0, extensionsUtil_1.$nN)(builtinExtensions, installedExtensions, developedExtensions, this.g);
        }
        async l(language, extensionDevelopmentPaths) {
            if (extensionDevelopmentPaths) {
                return (await Promise.all(extensionDevelopmentPaths.map(extensionDevelopmentPath => this.f.scanOneOrMultipleExtensions(uri_1.URI.file((0, path_1.$0d)(extensionDevelopmentPath)), 1 /* ExtensionType.User */, { language }))))
                    .flat()
                    .map(e => (0, extensionsScannerService_1.$rp)(e, true));
            }
            return [];
        }
        async m(language) {
            const scannedExtensions = await this.f.scanSystemExtensions({ language, useCache: true });
            return scannedExtensions.map(e => (0, extensionsScannerService_1.$rp)(e, false));
        }
        async n(profileLocation, language) {
            const scannedExtensions = await this.f.scanUserExtensions({ profileLocation, language, useCache: true });
            return scannedExtensions.map(e => (0, extensionsScannerService_1.$rp)(e, false));
        }
        async o(extensionPath, isBuiltin, language) {
            const extensionLocation = uri_1.URI.file((0, path_1.$0d)(extensionPath));
            const type = isBuiltin ? 0 /* ExtensionType.System */ : 1 /* ExtensionType.User */;
            const scannedExtension = await this.f.scanExistingExtension(extensionLocation, type, { language });
            return scannedExtension ? (0, extensionsScannerService_1.$rp)(scannedExtension, false) : null;
        }
        async q(language, languagePackId) {
            if (
            // No need to install language packs for the default language
            language === platform.$f ||
                // The extension gallery service needs to be available
                !this.h.isEnabled()) {
                return;
            }
            try {
                const installed = await this.i.getInstalledLanguages();
                if (installed.find(p => p.id === language)) {
                    this.g.trace(`Language Pack ${language} is already installed. Skipping language pack installation.`);
                    return;
                }
            }
            catch (err) {
                // We tried to see what is installed but failed. We can try installing anyway.
                this.g.error(err);
            }
            if (!languagePackId) {
                this.g.trace(`No language pack id provided for language ${language}. Skipping language pack installation.`);
                return;
            }
            this.g.trace(`Language Pack ${languagePackId} for language ${language} is not installed. It will be installed now.`);
            try {
                await this.c.installExtensions([languagePackId], [], { isMachineScoped: true }, true);
            }
            catch (err) {
                // We tried to install the language pack but failed. We can continue without it thus using the default language.
                this.g.error(err);
            }
        }
        r(extensions) {
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
                    return contextkey_1.$Ni.create(key);
                }
                mapNot(key) {
                    return contextkey_1.$Si.create(key);
                }
                mapEquals(key, value) {
                    if (key === 'resourceScheme' && typeof value === 'string') {
                        return contextkey_1.$Oi.create(key, _mapResourceSchemeValue(value, false));
                    }
                    else {
                        return contextkey_1.$Oi.create(key, value);
                    }
                }
                mapNotEquals(key, value) {
                    if (key === 'resourceScheme' && typeof value === 'string') {
                        return contextkey_1.$Ri.create(key, _mapResourceSchemeValue(value, false));
                    }
                    else {
                        return contextkey_1.$Ri.create(key, value);
                    }
                }
                mapGreater(key, value) {
                    return contextkey_1.$Ti.create(key, value);
                }
                mapGreaterEquals(key, value) {
                    return contextkey_1.$Ui.create(key, value);
                }
                mapSmaller(key, value) {
                    return contextkey_1.$Vi.create(key, value);
                }
                mapSmallerEquals(key, value) {
                    return contextkey_1.$Wi.create(key, value);
                }
                mapRegex(key, regexp) {
                    if (key === 'resourceScheme' && regexp) {
                        return contextkey_1.$Xi.create(key, _mapResourceRegExpValue(regexp));
                    }
                    else {
                        return contextkey_1.$Xi.create(key, regexp);
                    }
                }
                mapIn(key, valueKey) {
                    return contextkey_1.$Pi.create(key, valueKey);
                }
                mapNotIn(key, valueKey) {
                    return contextkey_1.$Qi.create(key, valueKey);
                }
            };
            const _massageWhenUser = (element) => {
                if (!element || !element.when || !/resourceScheme/.test(element.when)) {
                    return;
                }
                const expr = contextkey_1.$Ii.deserialize(element.when);
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
    exports.$qN = $qN;
    class $rN {
        constructor(a, b) {
            this.a = a;
            this.b = b;
        }
        listen(context, event) {
            throw new Error('Invalid listen');
        }
        async call(context, command, args) {
            const uriTransformer = this.b(context);
            switch (command) {
                case 'whenExtensionsReady': return this.a.whenExtensionsReady();
                case 'scanExtensions': {
                    const language = args[0];
                    const profileLocation = args[1] ? uri_1.URI.revive(uriTransformer.transformIncoming(args[1])) : undefined;
                    const extensionDevelopmentPath = Array.isArray(args[2]) ? args[2].map(u => uri_1.URI.revive(uriTransformer.transformIncoming(u))) : undefined;
                    const languagePackId = args[3];
                    const extensions = await this.a.scanExtensions(language, profileLocation, extensionDevelopmentPath, languagePackId);
                    return extensions.map(extension => (0, uriIpc_1.$Dm)(extension, uriTransformer));
                }
                case 'scanSingleExtension': {
                    const extension = await this.a.scanSingleExtension(uri_1.URI.revive(uriTransformer.transformIncoming(args[0])), args[1], args[2]);
                    return extension ? (0, uriIpc_1.$Dm)(extension, uriTransformer) : null;
                }
            }
            throw new Error('Invalid call');
        }
    }
    exports.$rN = $rN;
});
//# sourceMappingURL=remoteExtensionsScanner.js.map