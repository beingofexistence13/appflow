/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "fs", "vs/base/common/network", "vs/base/common/path", "vs/base/node/languagePacks", "vs/platform/product/common/product"], function (require, exports, fs, network_1, path, lp, product_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.InternalNLSConfiguration = exports.getNLSConfiguration = void 0;
    const metaData = path.join(network_1.FileAccess.asFileUri('').fsPath, 'nls.metadata.json');
    const _cache = new Map();
    function exists(file) {
        return new Promise(c => fs.exists(file, c));
    }
    function getNLSConfiguration(language, userDataPath) {
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
    exports.getNLSConfiguration = getNLSConfiguration;
    var InternalNLSConfiguration;
    (function (InternalNLSConfiguration) {
        function is(value) {
            const candidate = value;
            return candidate && typeof candidate._languagePackId === 'string';
        }
        InternalNLSConfiguration.is = is;
    })(InternalNLSConfiguration || (exports.InternalNLSConfiguration = InternalNLSConfiguration = {}));
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicmVtb3RlTGFuZ3VhZ2VQYWNrcy5qcyIsInNvdXJjZVJvb3QiOiJmaWxlOi8vL3dvcmtzcGFjZS9hcHBmbG93L3NyYy8iLCJzb3VyY2VzIjpbInZzL3NlcnZlci9ub2RlL3JlbW90ZUxhbmd1YWdlUGFja3MudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7OztnR0FHZ0c7Ozs7O0lBU2hHLE1BQU0sUUFBUSxHQUFHLElBQUksQ0FBQyxJQUFJLENBQUMsb0JBQVUsQ0FBQyxTQUFTLENBQUMsRUFBRSxDQUFDLENBQUMsTUFBTSxFQUFFLG1CQUFtQixDQUFDLENBQUM7SUFDakYsTUFBTSxNQUFNLEdBQThDLElBQUksR0FBRyxFQUFFLENBQUM7SUFFcEUsU0FBUyxNQUFNLENBQUMsSUFBWTtRQUMzQixPQUFPLElBQUksT0FBTyxDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLE1BQU0sQ0FBQyxJQUFJLEVBQUUsQ0FBQyxDQUFDLENBQUMsQ0FBQztJQUM3QyxDQUFDO0lBRUQsU0FBZ0IsbUJBQW1CLENBQUMsUUFBZ0IsRUFBRSxZQUFvQjtRQUN6RSxPQUFPLE1BQU0sQ0FBQyxRQUFRLENBQUMsQ0FBQyxJQUFJLENBQUMsQ0FBQyxVQUFVLEVBQUUsRUFBRTtZQUMzQyxJQUFJLENBQUMsVUFBVSxJQUFJLENBQUMsaUJBQU8sQ0FBQyxNQUFNLEVBQUU7Z0JBQ25DLDBFQUEwRTtnQkFDMUUsMEZBQTBGO2dCQUMxRixPQUFPLE9BQU8sQ0FBQyxPQUFPLENBQUMsRUFBRSxNQUFNLEVBQUUsSUFBSSxFQUFFLFFBQVEsRUFBRSxJQUFJLEVBQUUsa0JBQWtCLEVBQUUsRUFBRSxFQUFFLENBQUMsQ0FBQzthQUNqRjtZQUNELE1BQU0sR0FBRyxHQUFHLEdBQUcsUUFBUSxLQUFLLFlBQVksRUFBRSxDQUFDO1lBQzNDLElBQUksTUFBTSxHQUFHLE1BQU0sQ0FBQyxHQUFHLENBQUMsR0FBRyxDQUFDLENBQUM7WUFDN0IsSUFBSSxDQUFDLE1BQU0sRUFBRTtnQkFDWiwwRkFBMEY7Z0JBQzFGLE1BQU0sR0FBRyxFQUFFLENBQUMsbUJBQW1CLENBQUMsaUJBQU8sQ0FBQyxNQUFNLEVBQUUsWUFBWSxFQUFFLFFBQVEsRUFBRSxRQUFRLEVBQUUsUUFBUSxDQUFDLENBQUMsSUFBSSxDQUFDLEtBQUssQ0FBQyxFQUFFO29CQUN4RyxJQUFJLHdCQUF3QixDQUFDLEVBQUUsQ0FBQyxLQUFLLENBQUMsRUFBRTt3QkFDdkMsS0FBSyxDQUFDLG9CQUFvQixHQUFHLElBQUksQ0FBQztxQkFDbEM7b0JBQ0QsT0FBTyxLQUFLLENBQUM7Z0JBQ2QsQ0FBQyxDQUFDLENBQUM7Z0JBQ0gsTUFBTSxDQUFDLEdBQUcsQ0FBQyxHQUFHLEVBQUUsTUFBTSxDQUFDLENBQUM7YUFDeEI7WUFDRCxPQUFPLE1BQU0sQ0FBQztRQUNmLENBQUMsQ0FBQyxDQUFDO0lBQ0osQ0FBQztJQXJCRCxrREFxQkM7SUFFRCxJQUFpQix3QkFBd0IsQ0FLeEM7SUFMRCxXQUFpQix3QkFBd0I7UUFDeEMsU0FBZ0IsRUFBRSxDQUFDLEtBQTBCO1lBQzVDLE1BQU0sU0FBUyxHQUFnQyxLQUFvQyxDQUFDO1lBQ3BGLE9BQU8sU0FBUyxJQUFJLE9BQU8sU0FBUyxDQUFDLGVBQWUsS0FBSyxRQUFRLENBQUM7UUFDbkUsQ0FBQztRQUhlLDJCQUFFLEtBR2pCLENBQUE7SUFDRixDQUFDLEVBTGdCLHdCQUF3Qix3Q0FBeEIsd0JBQXdCLFFBS3hDIn0=