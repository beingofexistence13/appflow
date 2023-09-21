/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/base/common/glob", "vs/base/common/path", "vs/workbench/contrib/notebook/common/notebookCommon"], function (require, exports, glob, path_1, notebookCommon_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.$tbb = void 0;
    class $tbb {
        get selectors() {
            return this.a;
        }
        get options() {
            return this.b;
        }
        constructor(descriptor) {
            this.extension = descriptor.extension;
            this.id = descriptor.id;
            this.displayName = descriptor.displayName;
            this.a = descriptor.selectors?.map(selector => ({
                include: selector.filenamePattern,
                exclude: selector.excludeFileNamePattern || ''
            })) || [];
            this.priority = descriptor.priority;
            this.providerDisplayName = descriptor.providerDisplayName;
            this.exclusive = descriptor.exclusive;
            this.b = {
                transientCellMetadata: {},
                transientDocumentMetadata: {},
                transientOutputs: false,
                cellContentMetadata: {}
            };
        }
        update(args) {
            if (args.selectors) {
                this.a = args.selectors;
            }
            if (args.options) {
                this.b = args.options;
            }
        }
        matches(resource) {
            return this.selectors?.some(selector => $tbb.selectorMatches(selector, resource));
        }
        static selectorMatches(selector, resource) {
            if (typeof selector === 'string') {
                // filenamePattern
                if (glob.$qj(selector.toLowerCase(), (0, path_1.$ae)(resource.fsPath).toLowerCase())) {
                    return true;
                }
            }
            if (glob.$sj(selector)) {
                if (glob.$qj(selector, (0, path_1.$ae)(resource.fsPath).toLowerCase())) {
                    return true;
                }
            }
            if (!(0, notebookCommon_1.$5H)(selector)) {
                return false;
            }
            const filenamePattern = selector.include;
            const excludeFilenamePattern = selector.exclude;
            if (glob.$qj(filenamePattern, (0, path_1.$ae)(resource.fsPath).toLowerCase())) {
                if (excludeFilenamePattern) {
                    if (glob.$qj(excludeFilenamePattern, (0, path_1.$ae)(resource.fsPath).toLowerCase())) {
                        return false;
                    }
                }
                return true;
            }
            return false;
        }
        static possibleFileEnding(selectors) {
            for (const selector of selectors) {
                const ending = $tbb.c(selector);
                if (ending) {
                    return ending;
                }
            }
            return undefined;
        }
        static c(selector) {
            const pattern = /^.*(\.[a-zA-Z0-9_-]+)$/;
            let candidate;
            if (typeof selector === 'string') {
                candidate = selector;
            }
            else if (glob.$sj(selector)) {
                candidate = selector.pattern;
            }
            else if (selector.include) {
                return $tbb.c(selector.include);
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
    exports.$tbb = $tbb;
});
//# sourceMappingURL=notebookProvider.js.map