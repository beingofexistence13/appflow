/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/base/common/filters", "vs/base/common/glob", "vs/base/common/strings", "vs/base/common/resources", "vs/base/common/ternarySearchTree"], function (require, exports, filters_1, glob_1, strings, resources_1, ternarySearchTree_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.FilterOptions = exports.ResourceGlobMatcher = void 0;
    class ResourceGlobMatcher {
        constructor(globalExpression, rootExpressions, uriIdentityService) {
            this.globalExpression = (0, glob_1.parse)(globalExpression);
            this.expressionsByRoot = ternarySearchTree_1.TernarySearchTree.forUris(uri => uriIdentityService.extUri.ignorePathCasing(uri));
            for (const expression of rootExpressions) {
                this.expressionsByRoot.set(expression.root, { root: expression.root, expression: (0, glob_1.parse)(expression.expression) });
            }
        }
        matches(resource) {
            const rootExpression = this.expressionsByRoot.findSubstr(resource);
            if (rootExpression) {
                const path = (0, resources_1.relativePath)(rootExpression.root, resource);
                if (path && !!rootExpression.expression(path)) {
                    return true;
                }
            }
            return !!this.globalExpression(resource.path);
        }
    }
    exports.ResourceGlobMatcher = ResourceGlobMatcher;
    class FilterOptions {
        static { this._filter = filters_1.matchesFuzzy2; }
        static { this._messageFilter = filters_1.matchesFuzzy; }
        static EMPTY(uriIdentityService) { return new FilterOptions('', [], false, false, false, uriIdentityService); }
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
            const excludesExpression = Array.isArray(filesExclude) ? (0, glob_1.getEmptyExpression)() : filesExclude;
            for (const { expression } of filesExcludeByRoot) {
                for (const pattern of Object.keys(expression)) {
                    if (!pattern.endsWith('/**')) {
                        // Append `/**` to pattern to match a parent folder #103631
                        expression[`${strings.rtrim(pattern, '/')}/**`] = expression[pattern];
                    }
                }
            }
            const negate = filter.startsWith('!');
            this.textFilter = { text: (negate ? strings.ltrim(filter, '!') : filter).trim(), negate };
            const includeExpression = (0, glob_1.getEmptyExpression)();
            if (filter) {
                const filters = (0, glob_1.splitGlobAware)(filter, ',').map(s => s.trim()).filter(s => !!s.length);
                for (const f of filters) {
                    if (f.startsWith('!')) {
                        const filterText = strings.ltrim(f, '!');
                        if (filterText) {
                            this.setPattern(excludesExpression, filterText);
                        }
                    }
                    else {
                        this.setPattern(includeExpression, f);
                    }
                }
            }
            this.excludesMatcher = new ResourceGlobMatcher(excludesExpression, filesExcludeByRoot, uriIdentityService);
            this.includesMatcher = new ResourceGlobMatcher(includeExpression, [], uriIdentityService);
        }
        setPattern(expression, pattern) {
            if (pattern[0] === '.') {
                pattern = '*' + pattern; // convert ".js" to "*.js"
            }
            expression[`**/${pattern}/**`] = true;
            expression[`**/${pattern}`] = true;
        }
    }
    exports.FilterOptions = FilterOptions;
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibWFya2Vyc0ZpbHRlck9wdGlvbnMuanMiLCJzb3VyY2VSb290IjoiZmlsZTovLy93b3Jrc3BhY2UvYXBwZmxvdy9zcmMvIiwic291cmNlcyI6WyJ2cy93b3JrYmVuY2gvY29udHJpYi9tYXJrZXJzL2Jyb3dzZXIvbWFya2Vyc0ZpbHRlck9wdGlvbnMudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7OztnR0FHZ0c7Ozs7O0lBVWhHLE1BQWEsbUJBQW1CO1FBSy9CLFlBQ0MsZ0JBQTZCLEVBQzdCLGVBQXlELEVBQ3pELGtCQUF1QztZQUV2QyxJQUFJLENBQUMsZ0JBQWdCLEdBQUcsSUFBQSxZQUFLLEVBQUMsZ0JBQWdCLENBQUMsQ0FBQztZQUNoRCxJQUFJLENBQUMsaUJBQWlCLEdBQUcscUNBQWlCLENBQUMsT0FBTyxDQUE4QyxHQUFHLENBQUMsRUFBRSxDQUFDLGtCQUFrQixDQUFDLE1BQU0sQ0FBQyxnQkFBZ0IsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDO1lBQ3hKLEtBQUssTUFBTSxVQUFVLElBQUksZUFBZSxFQUFFO2dCQUN6QyxJQUFJLENBQUMsaUJBQWlCLENBQUMsR0FBRyxDQUFDLFVBQVUsQ0FBQyxJQUFJLEVBQUUsRUFBRSxJQUFJLEVBQUUsVUFBVSxDQUFDLElBQUksRUFBRSxVQUFVLEVBQUUsSUFBQSxZQUFLLEVBQUMsVUFBVSxDQUFDLFVBQVUsQ0FBQyxFQUFFLENBQUMsQ0FBQzthQUNqSDtRQUNGLENBQUM7UUFFRCxPQUFPLENBQUMsUUFBYTtZQUNwQixNQUFNLGNBQWMsR0FBRyxJQUFJLENBQUMsaUJBQWlCLENBQUMsVUFBVSxDQUFDLFFBQVEsQ0FBQyxDQUFDO1lBQ25FLElBQUksY0FBYyxFQUFFO2dCQUNuQixNQUFNLElBQUksR0FBRyxJQUFBLHdCQUFZLEVBQUMsY0FBYyxDQUFDLElBQUksRUFBRSxRQUFRLENBQUMsQ0FBQztnQkFDekQsSUFBSSxJQUFJLElBQUksQ0FBQyxDQUFDLGNBQWMsQ0FBQyxVQUFVLENBQUMsSUFBSSxD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