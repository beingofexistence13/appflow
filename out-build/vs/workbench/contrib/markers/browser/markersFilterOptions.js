/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/base/common/filters", "vs/base/common/glob", "vs/base/common/strings", "vs/base/common/resources", "vs/base/common/ternarySearchTree"], function (require, exports, filters_1, glob_1, strings, resources_1, ternarySearchTree_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.$ESb = exports.$DSb = void 0;
    class $DSb {
        constructor(globalExpression, rootExpressions, uriIdentityService) {
            this.a = (0, glob_1.$rj)(globalExpression);
            this.b = ternarySearchTree_1.$Hh.forUris(uri => uriIdentityService.extUri.ignorePathCasing(uri));
            for (const expression of rootExpressions) {
                this.b.set(expression.root, { root: expression.root, expression: (0, glob_1.$rj)(expression.expression) });
            }
        }
        matches(resource) {
            const rootExpression = this.b.findSubstr(resource);
            if (rootExpression) {
                const path = (0, resources_1.$kg)(rootExpression.root, resource);
                if (path && !!rootExpression.expression(path)) {
                    return true;
                }
            }
            return !!this.a(resource.path);
        }
    }
    exports.$DSb = $DSb;
    class $ESb {
        static { this._filter = filters_1.$Fj; }
        static { this._messageFilter = filters_1.$Ej; }
        static EMPTY(uriIdentityService) { return new $ESb('', [], false, false, false, uriIdentityService); }
        constructor(filter, filesExclude, showWarnings, showErrors, showInfos, uriIdentityService) {
            this.filter = filter;
            this.showWarnings = false;
            this.showErrors = false;
            this.showInfos = false;
            filter = filter.trim();
            this.showWarnings = showWarnings;
            this.showErrors = showErrors;
            this.showInfos = showInfos;
            const filesExcludeByRoot = Array.isArray(filesExclude) ? filesExclude : [];
            const excludesExpression = Array.isArray(filesExclude) ? (0, glob_1.$mj)() : filesExclude;
            for (const { expression } of filesExcludeByRoot) {
                for (const pattern of Object.keys(expression)) {
                    if (!pattern.endsWith('/**')) {
                        // Append `/**` to pattern to match a parent folder #103631
                        expression[`${strings.$ve(pattern, '/')}/**`] = expression[pattern];
                    }
                }
            }
            const negate = filter.startsWith('!');
            this.textFilter = { text: (negate ? strings.$ue(filter, '!') : filter).trim(), negate };
            const includeExpression = (0, glob_1.$mj)();
            if (filter) {
                const filters = (0, glob_1.$pj)(filter, ',').map(s => s.trim()).filter(s => !!s.length);
                for (const f of filters) {
                    if (f.startsWith('!')) {
                        const filterText = strings.$ue(f, '!');
                        if (filterText) {
                            this.a(excludesExpression, filterText);
                        }
                    }
                    else {
                        this.a(includeExpression, f);
                    }
                }
            }
            this.excludesMatcher = new $DSb(excludesExpression, filesExcludeByRoot, uriIdentityService);
            this.includesMatcher = new $DSb(includeExpression, [], uriIdentityService);
        }
        a(expression, pattern) {
            if (pattern[0] === '.') {
                pattern = '*' + pattern; // convert ".js" to "*.js"
            }
            expression[`**/${pattern}/**`] = true;
            expression[`**/${pattern}`] = true;
        }
    }
    exports.$ESb = $ESb;
});
//# sourceMappingURL=markersFilterOptions.js.map