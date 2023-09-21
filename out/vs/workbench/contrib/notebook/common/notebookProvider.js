/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/base/common/glob", "vs/base/common/path", "vs/workbench/contrib/notebook/common/notebookCommon"], function (require, exports, glob, path_1, notebookCommon_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.NotebookProviderInfo = void 0;
    class NotebookProviderInfo {
        get selectors() {
            return this._selectors;
        }
        get options() {
            return this._options;
        }
        constructor(descriptor) {
            this.extension = descriptor.extension;
            this.id = descriptor.id;
            this.displayName = descriptor.displayName;
            this._selectors = descriptor.selectors?.map(selector => ({
                include: selector.filenamePattern,
                exclude: selector.excludeFileNamePattern || ''
            })) || [];
            this.priority = descriptor.priority;
            this.providerDisplayName = descriptor.providerDisplayName;
            this.exclusive = descriptor.exclusive;
            this._options = {
                transientCellMetadata: {},
                transientDocumentMetadata: {},
                transientOutputs: false,
                cellContentMetadata: {}
            };
        }
        update(args) {
            if (args.selectors) {
                this._selectors = args.selectors;
            }
            if (args.options) {
                this._options = args.options;
            }
        }
        matches(resource) {
            return this.selectors?.some(selector => NotebookProviderInfo.selectorMatches(selector, resource));
        }
        static selectorMatches(selector, resource) {
            if (typeof selector === 'string') {
                // filenamePattern
                if (glob.match(selector.toLowerCase(), (0, path_1.basename)(resource.fsPath).toLowerCase())) {
                    return true;
                }
            }
            if (glob.isRelativePattern(selector)) {
                if (glob.match(selector, (0, path_1.basename)(resource.fsPath).toLowerCase())) {
                    return true;
                }
            }
            if (!(0, notebookCommon_1.isDocumentExcludePattern)(selector)) {
                return false;
            }
            const filenamePattern = selector.include;
            const excludeFilenamePattern = selector.exclude;
            if (glob.match(filenamePattern, (0, path_1.basename)(resource.fsPath).toLowerCase())) {
                if (excludeFilenamePattern) {
                    if (glob.match(excludeFilenamePattern, (0, path_1.basename)(resource.fsPath).toLowerCase())) {
                        return false;
                    }
                }
                return true;
            }
            return false;
        }
        static possibleFileEnding(selectors) {
            for (const selector of selectors) {
                const ending = NotebookProviderInfo._possibleFileEnding(selector);
                if (ending) {
                    return ending;
                }
            }
            return undefined;
        }
        static _possibleFileEnding(selector) {
            const pattern = /^.*(\.[a-zA-Z0-9_-]+)$/;
            let candidate;
            if (typeof selector === 'string') {
                candidate = selector;
            }
            else if (glob.isRelativePattern(selector)) {
                candidate = selector.pattern;
            }
            else if (selector.include) {
                return NotebookProviderInfo._possibleFileEnding(selector.include);
            }
            if (candidate) {
                const match = pattern.exec(candidate);
                if (match) {
                    return match[1];
                }
            }
            return undefined;
        }
    }
    exports.NotebookProviderInfo = NotebookProviderInfo;
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibm90ZWJvb2tQcm92aWRlci5qcyIsInNvdXJjZVJvb3QiOiJmaWxlOi8vL3dvcmtzcGFjZS9hcHBmbG93L3NyYy8iLCJzb3VyY2VzIjpbInZzL3dvcmtiZW5jaC9jb250cmliL25vdGVib29rL2NvbW1vbi9ub3RlYm9va1Byb3ZpZGVyLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOzs7Z0dBR2dHOzs7OztJQXFCaEcsTUFBYSxvQkFBb0I7UUFVaEMsSUFBSSxTQUFTO1lBQ1osT0FBTyxJQUFJLENBQUMsVUFBVSxDQUFDO1FBQ3hCLENBQUM7UUFFRCxJQUFJLE9BQU87WUFDVixPQUFPLElBQUksQ0FBQyxRQUFRLENBQUM7UUFDdEIsQ0FBQztRQUVELFlBQVksVUFBb0M7WUFDL0MsSUFBSSxDQUFDLFNBQVMsR0FBRyxVQUFVLENBQUMsU0FBUyxDQUFDO1lBQ3RDLElBQUksQ0FBQyxFQUFFLEdBQUcsVUFBVSxDQUFDLEVBQUUsQ0FBQztZQUN4QixJQUFJLENBQUMsV0FBVyxHQUFHLFVBQVUsQ0FBQyxXQUFXLENBQUM7WUFDMUMsSUFBSSxDQUFDLFVBQVUsR0FBRyxVQUFVLENBQUMsU0FBUyxFQUFFLEdBQUcsQ0FBQyxRQUFRLENBQUMsRUFBRSxDQUFDLENBQUM7Z0JBQ3hELE9BQU8sRUFBRSxRQUFRLENBQUMsZUFBZTtnQkFDakMsT0FBTyxFQUFFLFFBQVEsQ0FBQyxzQkFBc0IsSUFBSSxFQUFFO2FBQzlDLENBQUMsQ0FBQyxJQUFJLEVBQUUsQ0FBQztZQUNWLElBQUksQ0FBQyxRQUFRLEdBQUcsVUFBVSxDQUFDLFFBQVEsQ0FBQztZQUNwQyxJQUFJLENBQUMsbUJBQW1CLEdBQUcsVUFBVSxDQUFDLG1CQUFtQixDQUFDO1lBQzFELElBQUksQ0FBQyxTQUFTLEdBQUcsVUFBVSxDQUFDLFNBQVMsQ0FBQztZQUN0QyxJQUFJLENBQUMsUUFBUSxHQUFHO2dCQUNmLHFCQUFxQixFQUFFLEVBQUU7Z0JBQ3pCLHlCQUF5QixFQUFFLEVBQUU7Z0JBQzdCLGdCQUFnQixFQUFFLEtBQUs7Z0JBQ3ZCLG1CQUFtQixFQUFFLEVBQUU7YUFDdkIsQ0FBQztRQUNILENBQUM7UUFFRCxNQUFNLENBQUMsSUFBb0U7WUFDMUUsSUFBSSxJQUFJLENBQUMsU0FBUyxFQUFFO2dCQUNuQixJQUFJLENBQUMsVUFBVSxHQUFHLElBQUksQ0FBQyxTQUFTLENBQUM7YUFDakM7WUFFRCxJQUFJLElBQUksQ0FBQyxPQUFPLEVBQUU7Z0JBQ2pCLElBQUksQ0FBQyxRQUFRLEdBQUcsSUFBSSxDQUFDLE9BQU8sQ0FBQzthQUM3QjtRQUNGLENBQUM7UUFFRCxPQUFPLENBQUMsUUFBYTtZQUNwQixPQUFPLElBQUksQ0FBQyxTQUFTLEVBQUUsSUFBSSxDQUFDLFFBQVEsQ0FBQyxFQUFFLENBQUMsb0JBQW9CLENBQUMsZUFBZSxDQUFDLFFBQVEsRUFBRSxRQUFRLENBQUMsQ0FBQyxDQUFDO1FBQ25HLENBQUM7UUFFRCxNQUFNLENBQUMsZUFBZSxDQUFDLFFBQTBCLEVBQUUsUUFBYTtZQUMvRCxJQUFJLE9BQU8sUUFBUSxLQUFLLFFBQVEsRUFBRTtnQkFDakMsa0JBQWtCO2dCQUNsQixJQUFJLElBQUksQ0FBQyxLQUFLLENBQUMsUUFBUSxDQUFDLFdBQVcsRUFBRSxFQUFFLElBQUEsZUFBUSxFQUFDLFFBQVEsQ0FBQyxNQUFNLENBQUMsQ0FBQyxXQUFXLEVBQUUsQ0FBQyxFQUFFO29CQUNoRixPQUFPLElBQUksQ0FBQztpQkFDWjthQUNEO1lBRUQsSUFBSSxJQUFJLENBQUMsaUJBQWlCLENBQUMsUUFBUSxDQUFDLEVBQUU7Z0JBQ3JDLElBQUksSUFBSSxDQUFDLEtBQUssQ0FBQyxRQUFRLEVBQUUsSUFBQSxlQUFRLEVBQUMsUUFBUSxDQUFDLE1BQU0sQ0FBQyxDQUFDLFdBQVcsRUFBRSxDQUFDLEVBQUU7b0JBQ2xFLE9BQU8sSUFBSSxDQUFDO2lCQUNaO2FBQ0Q7WUFFRCxJQUFJLENBQUMsSUFBQSx5Q0FBd0IsRUFBQyxRQUFRLENBQUMsRUFBRTtnQkFDeEMsT0FBTyxLQUFLLENBQUM7YUFDYjtZQUVELE1BQU0sZUFBZSxHQUFHLFFBQVEsQ0FBQyxPQUFPLENBQUM7WUFDekMsTUFBTSxzQkFBc0IsR0FBRyxRQUFRLENBQUMsT0FBTyxDQUFDO1lBRWhELElBQUksSUFBSSxDQUFDLEtBQUssQ0FBQyxlQUFlLEVBQUUsSUFBQSxlQUFRLEVBQUMsUUFBUSxDQUFDLE1BQU0sQ0FBQyxDQUFDLFdBQVcsRUFBRSxDQUFDLEVBQUU7Z0JBQ3pFLElBQUksc0JBQXNCLEVBQUU7b0JBQzNCLElBQUksSUFBSSxDQUFDLEtBQUssQ0FBQyxzQkFBc0IsRUFBRSxJQUFBLGVBQVEsRUFBQyxRQUFRLENBQUMsTUFBTSxDQUFDLENBQUMsV0FBVyxFQUFFLENBQUMsRUFBRTt3QkFDaEYsT0FBTyxLQUFLLENBQUM7cUJBQ2I7aUJBQ0Q7Z0JBQ0QsT0FBTyxJQUFJLENBQUM7YUFDWjtZQUVELE9BQU8sS0FBSyxDQUFDO1FBQ2QsQ0FBQztRQUVELE1BQU0sQ0FBQyxrQkFBa0IsQ0FBQyxTQUE2QjtZQUN0RCxLQUFLLE1BQU0sUUFBUSxJQUFJLFNBQVMsRUFBRTtnQkFDakMsTUFBTSxNQUFNLEdBQUcsb0JBQW9CLENBQUMsbUJBQW1CLENBQUMsUUFBUSxDQUFDLENBQUM7Z0JBQ2xFLElBQUksTUFBTSxFQUFFO29CQUNYLE9BQU8sTUFBTSxDQUFDO2lCQUNkO2FBQ0Q7WUFDRCxPQUFPLFNBQVMsQ0FBQztRQUNsQixDQUFDO1FBRU8sTUFBTSxDQUFDLG1CQUFtQixDQUFDLFFBQTBCO1lBRTVELE1BQU0sT0FBTyxHQUFHLHdCQUF3QixDQUFDO1lBRXpDLElBQUksU0FBNkIsQ0FBQztZQUVsQyxJQUFJLE9BQU8sUUFBUSxLQUFLLFFBQVEsRUFBRTtnQkFDakMsU0FBUyxHQUFHLFFBQVEsQ0FBQzthQUNyQjtpQkFBTSxJQUFJLElBQUksQ0FBQyxpQkFBaUIsQ0FBQyxRQUFRLENBQUMsRUFBRTtnQkFDNUMsU0FBUyxHQUFHLFFBQVEsQ0FBQyxPQUFPLENBQUM7YUFDN0I7aUJBQU0sSUFBSSxRQUFRLENBQUMsT0FBTyxFQUFFO2dCQUM1QixPQUFPLG9CQUFvQixDQUFDLG1CQUFtQixDQUFDLFFBQVEsQ0FBQyxPQUFPLENBQUMsQ0FBQzthQUNsRTtZQUVELElBQUksU0FBUyxFQUFFO2dCQUNkLE1BQU0sS0FBSyxHQUFHLE9BQU8sQ0FBQyxJQUFJLENBQUMsU0FBUyxDQUFDLENBQUM7Z0JBQ3RDLElBQUksS0FBSyxFQUFFO29CQUNWLE9BQU8sS0FBSyxDQUFDLENBQUMsQ0FBQyxDQUFDO2lCQUNoQjthQUNEO1lBRUQsT0FBTyxTQUFTLENBQUM7UUFDbEIsQ0FBQztLQUNEO0lBckhELG9EQXFIQyJ9