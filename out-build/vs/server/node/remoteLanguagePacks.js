/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "fs", "vs/base/common/network", "vs/base/common/path", "vs/base/node/languagePacks", "vs/platform/product/common/product"], function (require, exports, fs, network_1, path, lp, product_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.InternalNLSConfiguration = exports.$gl = void 0;
    const metaData = path.$9d(network_1.$2f.asFileUri('').fsPath, 'nls.metadata.json');
    const _cache = new Map();
    function exists(file) {
        return new Promise(c => fs.exists(file, c));
    }
    function $gl(language, userDataPath) {
        return exists(metaData).then((fileExists) => {
            if (!fileExists || !product_1.default.commit) {
                // console.log(`==> MetaData or commit unknown. Using default language.`);
                // The OS Locale on the remote side really doesn't matter, so we return the default locale
                return Promise.resolve({ locale: 'en', osLocale: 'en', availableLanguages: {} });
            }
            const key = `${language}||${userDataPath}`;
            let result = _cache.get(key);
            if (!result) {
                // The OS Locale on the remote side really doesn't matter, so we pass in the same language
                result = lp.getNLSConfiguration(product_1.default.commit, userDataPath, metaData, language, language).then(value => {
                    if (InternalNLSConfiguration.is(value)) {
                        value._languagePackSupport = true;
                    }
                    return value;
                });
                _cache.set(key, result);
            }
            return result;
        });
    }
    exports.$gl = $gl;
    var InternalNLSConfiguration;
    (function (InternalNLSConfiguration) {
        function is(value) {
            const candidate = value;
            return candidate && typeof candidate._languagePackId === 'string';
        }
        InternalNLSConfiguration.is = is;
    })(InternalNLSConfiguration || (exports.InternalNLSConfiguration = InternalNLSConfiguration = {}));
});
//# sourceMappingURL=remoteLanguagePacks.js.map