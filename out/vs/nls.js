/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports"], function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.load = exports.create = exports.setPseudoTranslation = exports.getConfiguredDefaultLocale = exports.localize = void 0;
    let isPseudo = (typeof document !== 'undefined' && document.location && document.location.hash.indexOf('pseudo=true') >= 0);
    const DEFAULT_TAG = 'i-default';
    function _format(message, args) {
        let result;
        if (args.length === 0) {
            result = message;
        }
        else {
            result = message.replace(/\{(\d+)\}/g, (match, rest) => {
                const index = rest[0];
                const arg = args[index];
                let result = match;
                if (typeof arg === 'string') {
                    result = arg;
                }
                else if (typeof arg === 'number' || typeof arg === 'boolean' || arg === void 0 || arg === null) {
                    result = String(arg);
                }
                return result;
            });
        }
        if (isPseudo) {
            // FF3B and FF3D is the Unicode zenkaku representation for [ and ]
            result = '\uFF3B' + result.replace(/[aouei]/g, '$&$&') + '\uFF3D';
        }
        return result;
    }
    function findLanguageForModule(config, name) {
        let result = config[name];
        if (result) {
            return result;
        }
        result = config['*'];
        if (result) {
            return result;
        }
        return null;
    }
    function endWithSlash(path) {
        if (path.charAt(path.length - 1) === '/') {
            return path;
        }
        return path + '/';
    }
    async function getMessagesFromTranslationsService(translationServiceUrl, language, name) {
        const url = endWithSlash(translationServiceUrl) + endWithSlash(language) + 'vscode/' + endWithSlash(name);
        const res = await fetch(url);
        if (res.ok) {
            const messages = await res.json();
            return messages;
        }
        throw new Error(`${res.status} - ${res.statusText}`);
    }
    function createScopedLocalize(scope) {
        return function (idx, defaultValue) {
            const restArgs = Array.prototype.slice.call(arguments, 2);
            return _format(scope[idx], restArgs);
        };
    }
    /**
     * @skipMangle
     */
    function localize(data, message, ...args) {
        return _format(message, args);
    }
    exports.localize = localize;
    /**
     * @skipMangle
     */
    function getConfiguredDefaultLocale(_) {
        // This returns undefined because this implementation isn't used and is overwritten by the loader
        // when loaded.
        return undefined;
    }
    exports.getConfiguredDefaultLocale = getConfiguredDefaultLocale;
    /**
     * @skipMangle
     */
    function setPseudoTranslation(value) {
        isPseudo = value;
    }
    exports.setPseudoTranslation = setPseudoTranslation;
    /**
     * Invoked in a built product at run-time
     * @skipMangle
     */
    function create(key, data) {
        return {
            localize: createScopedLocalize(data[key]),
            getConfiguredDefaultLocale: data.getConfiguredDefaultLocale ?? ((_) => undefined)
        };
    }
    exports.create = create;
    /**
     * Invoked by the loader at run-time
     * @skipMangle
     */
    function load(name, req, load, config) {
        const pluginConfig = config['vs/nls'] ?? {};
        if (!name || name.length === 0) {
            // TODO: We need to give back the mangled names here
            return load({
                localize: localize,
                getConfiguredDefaultLocale: () => pluginConfig.availableLanguages?.['*']
            });
        }
        const language = pluginConfig.availableLanguages ? findLanguageForModule(pluginConfig.availableLanguages, name) : null;
        const useDefaultLanguage = language === null || language === DEFAULT_TAG;
        let suffix = '.nls';
        if (!useDefaultLanguage) {
            suffix = suffix + '.' + language;
        }
        const messagesLoaded = (messages) => {
            if (Array.isArray(messages)) {
                messages.localize = createScopedLocalize(messages);
            }
            else {
                messages.localize = createScopedLocalize(messages[name]);
            }
            messages.getConfiguredDefaultLocale = () => pluginConfig.availableLanguages?.['*'];
            load(messages);
        };
        if (typeof pluginConfig.loadBundle === 'function') {
            pluginConfig.loadBundle(name, language, (err, messages) => {
                // We have an error. Load the English default strings to not fail
                if (err) {
                    req([name + '.nls'], messagesLoaded);
                }
                else {
                    messagesLoaded(messages);
                }
            });
        }
        else if (pluginConfig.translationServiceUrl && !useDefaultLanguage) {
            (async () => {
                try {
                    const messages = await getMessagesFromTranslationsService(pluginConfig.translationServiceUrl, language, name);
                    return messagesLoaded(messages);
                }
                catch (err) {
                    // Language is already as generic as it gets, so require default messages
                    if (!language.includes('-')) {
                        console.error(err);
                        return req([name + '.nls'], messagesLoaded);
                    }
                    try {
                        // Since there is a dash, the language configured is a specific sub-language of the same generic language.
                        // Since we were unable to load the specific language, try to load the generic language. Ex. we failed to find a
                        // Swiss German (de-CH), so try to load the generic German (de) messages instead.
                        const genericLanguage = language.split('-')[0];
                        const messages = await getMessagesFromTranslationsService(pluginConfig.translationServiceUrl, genericLanguage, name);
                        // We got some messages, so we configure the configuration to use the generic language for this session.
                        pluginConfig.availableLanguages ??= {};
                        pluginConfig.availableLanguages['*'] = genericLanguage;
                        return messagesLoaded(messages);
                    }
                    catch (err) {
                        console.error(err);
                        return req([name + '.nls'], messagesLoaded);
                    }
                }
            })();
        }
        else {
            req([name + suffix], messagesLoaded, (err) => {
                if (suffix === '.nls') {
                    console.error('Failed trying to load default language strings', err);
                    return;
                }
                console.error(`Failed to load message bundle for language ${language}. Falling back to the default language:`, err);
                req([name + '.nls'], messagesLoaded);
            });
        }
    }
    exports.load = load;
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibmxzLmpzIiwic291cmNlUm9vdCI6ImZpbGU6Ly8vd29ya3NwYWNlL2FwcGZsb3cvc3JjLyIsInNvdXJjZXMiOlsidnMvbmxzLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOzs7Z0dBR2dHOzs7OztJQUVoRyxJQUFJLFFBQVEsR0FBRyxDQUFDLE9BQU8sUUFBUSxLQUFLLFdBQVcsSUFBSSxRQUFRLENBQUMsUUFBUSxJQUFJLFFBQVEsQ0FBQyxRQUFRLENBQUMsSUFBSSxDQUFDLE9BQU8sQ0FBQyxhQUFhLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQztJQUM1SCxNQUFNLFdBQVcsR0FBRyxXQUFXLENBQUM7SUF3Q2hDLFNBQVMsT0FBTyxDQUFDLE9BQWUsRUFBRSxJQUFzRDtRQUN2RixJQUFJLE1BQWMsQ0FBQztRQUVuQixJQUFJLElBQUksQ0FBQyxNQUFNLEtBQUssQ0FBQyxFQUFFO1lBQ3RCLE1BQU0sR0FBRyxPQUFPLENBQUM7U0FDakI7YUFBTTtZQUNOLE1BQU0sR0FBRyxPQUFPLENBQUMsT0FBTyxDQUFDLFlBQVksRUFBRSxDQUFDLEtBQUssRUFBRSxJQUFJLEVBQUUsRUFBRTtnQkFDdEQsTUFBTSxLQUFLLEdBQUcsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDO2dCQUN0QixNQUFNLEdBQUcsR0FBRyxJQUFJLENBQUMsS0FBSyxDQUFDLENBQUM7Z0JBQ3hCLElBQUksTUFBTSxHQUFHLEtBQUssQ0FBQztnQkFDbkIsSUFBSSxPQUFPLEdBQUcsS0FBSyxRQUFRLEVBQUU7b0JBQzVCLE1BQU0sR0FBRyxHQUFHLENBQUM7aUJBQ2I7cUJBQU0sSUFBSSxPQUFPLEdBQUcsS0FBSyxRQUFRLElBQUksT0FBTyxHQUFHLEtBQUssU0FBUyxJQUFJLEdBQUcsS0FBSyxLQUFLLENBQUMsSUFBSSxHQUFHLEtBQUssSUFBSSxFQUFFO29CQUNqRyxNQUFNLEdBQUcsTUFBTSxDQUFDLEdBQUcsQ0FBQyxDQUFDO2lCQUNyQjtnQkFDRCxPQUFPLE1BQU0sQ0FBQztZQUNm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