/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/base/common/uri", "vs/base/common/extpath", "vs/base/common/resources", "vs/base/common/strings", "vs/editor/common/core/range", "vs/base/common/platform", "vs/base/common/network"], function (require, exports, uri_1, extpath, resources, strings, range_1, platform_1, network_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.create = exports.OutputLinkComputer = void 0;
    class OutputLinkComputer {
        constructor(ctx, createData) {
            this.ctx = ctx;
            this.patterns = new Map();
            this.computePatterns(createData);
        }
        computePatterns(createData) {
            // Produce patterns for each workspace root we are configured with
            // This means that we will be able to detect links for paths that
            // contain any of the workspace roots as segments.
            const workspaceFolders = createData.workspaceFolders
                .sort((resourceStrA, resourceStrB) => resourceStrB.length - resourceStrA.length) // longest paths first (for https://github.com/microsoft/vscode/issues/88121)
                .map(resourceStr => uri_1.URI.parse(resourceStr));
            for (const workspaceFolder of workspaceFolders) {
                const patterns = OutputLinkComputer.createPatterns(workspaceFolder);
                this.patterns.set(workspaceFolder, patterns);
            }
        }
        getModel(uri) {
            const models = this.ctx.getMirrorModels();
            return models.find(model => model.uri.toString() === uri);
        }
        computeLinks(uri) {
            const model = this.getModel(uri);
            if (!model) {
                return [];
            }
            const links = [];
            const lines = strings.splitLines(model.getValue());
            // For each workspace root patterns
            for (const [folderUri, folderPatterns] of this.patterns) {
                const resourceCreator = {
                    toResource: (folderRelativePath) => {
                        if (typeof folderRelativePath === 'string') {
                            return resources.joinPath(folderUri, folderRelativePath);
                        }
                        return null;
                    }
                };
                for (let i = 0, len = lines.length; i < len; i++) {
                    links.push(...OutputLinkComputer.detectLinks(lines[i], i + 1, folderPatterns, resourceCreator));
                }
            }
            return links;
        }
        static createPatterns(workspaceFolder) {
            const patterns = [];
            const workspaceFolderPath = workspaceFolder.scheme === network_1.Schemas.file ? workspaceFolder.fsPath : workspaceFolder.path;
            const workspaceFolderVariants = [workspaceFolderPath];
            if (platform_1.isWindows && workspaceFolder.scheme === network_1.Schemas.file) {
                workspaceFolderVariants.push(extpath.toSlashes(workspaceFolderPath));
            }
            for (const workspaceFolderVariant of workspaceFolderVariants) {
                const validPathCharacterPattern = '[^\\s\\(\\):<>"]';
                const validPathCharacterOrSpacePattern = `(?:${validPathCharacterPattern}| ${validPathCharacterPattern})`;
                const pathPattern = `${validPathCharacterOrSpacePattern}+\\.${validPathCharacterPattern}+`;
                const strictPathPattern = `${validPathCharacterPattern}+`;
                // Example: /workspaces/express/server.js on line 8, column 13
                patterns.push(new RegExp(strings.escapeRegExpCharacters(workspaceFolderVariant) + `(${pathPattern}) on line ((\\d+)(, column (\\d+))?)`, 'gi'));
                // Example: /workspaces/express/server.js:line 8, column 13
                patterns.push(new RegExp(strings.escapeRegExpCharacters(workspaceFolderVariant) + `(${pathPattern}):line ((\\d+)(, column (\\d+))?)`, 'gi'));
                // Example: /workspaces/mankala/Features.ts(45): error
                // Example: /workspaces/mankala/Features.ts (45): error
                // Example: /workspaces/mankala/Features.ts(45,18): error
                // Example: /workspaces/mankala/Features.ts (45,18): error
                // Example: /workspaces/mankala/Features Special.ts (45,18): error
                patterns.push(new RegExp(strings.escapeRegExpCharacters(workspaceFolderVariant) + `(${pathPattern})(\\s?\\((\\d+)(,(\\d+))?)\\)`, 'gi'));
                // Example: at /workspaces/mankala/Game.ts
                // Example: at /workspaces/mankala/Game.ts:336
                // Example: at /workspaces/mankala/Game.ts:336:9
                patterns.push(new RegExp(strings.escapeRegExpCharacters(workspaceFolderVariant) + `(${strictPathPattern})(:(\\d+))?(:(\\d+))?`, 'gi'));
            }
            return patterns;
        }
        /**
         * Detect links. Made static to allow for tests.
         */
        static detectLinks(line, lineIndex, patterns, resourceCreator) {
            const links = [];
            patterns.forEach(pattern => {
                pattern.lastIndex = 0; // the holy grail of software development
                let match;
                let offset = 0;
                while ((match = pattern.exec(line)) !== null) {
                    // Convert the relative path information to a resource that we can use in links
                    const folderRelativePath = strings.rtrim(match[1], '.').replace(/\\/g, '/'); // remove trailing "." that likely indicate end of sentence
                    let resourceString;
                    try {
                        const resource = resourceCreator.toResource(folderRelativePath);
                        if (resource) {
                            resourceString = resource.toString();
                        }
                    }
                    catch (error) {
                        continue; // we might find an invalid URI and then we dont want to loose all other links
                    }
                    // Append line/col information to URI if matching
                    if (match[3]) {
                        const lineNumber = match[3];
                        if (match[5]) {
                            const columnNumber = match[5];
                            resourceString = strings.format('{0}#{1},{2}', resourceString, lineNumber, columnNumber);
                        }
                        else {
                            resourceString = strings.format('{0}#{1}', resourceString, lineNumber);
                        }
                    }
                    const fullMatch = strings.rtrim(match[0], '.'); // remove trailing "." that likely indicate end of sentence
                    const index = line.indexOf(fullMatch, offset);
                    offset = index + fullMatch.length;
                    const linkRange = {
                        startColumn: index + 1,
                        startLineNumber: lineIndex,
                        endColumn: index + 1 + fullMatch.length,
                        endLineNumber: lineIndex
                    };
                    if (links.some(link => range_1.Range.areIntersectingOrTouching(link.range, linkRange))) {
                        return; // Do not detect duplicate links
                    }
                    links.push({
                        range: linkRange,
                        url: resourceString
                    });
                }
            });
            return links;
        }
    }
    exports.OutputLinkComputer = OutputLinkComputer;
    // Export this function because this will be called by the web worker for computing links
    function create(ctx, createData) {
        return new OutputLinkComputer(ctx, createData);
    }
    exports.create = create;
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoib3V0cHV0TGlua0NvbXB1dGVyLmpzIiwic291cmNlUm9vdCI6ImZpbGU6Ly8vd29ya3NwYWNlL2FwcGZsb3cvc3JjLyIsInNvdXJjZXMiOlsidnMvd29ya2JlbmNoL2NvbnRyaWIvb3V0cHV0L2NvbW1vbi9vdXRwdXRMaW5rQ29tcHV0ZXIudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7OztnR0FHZ0c7Ozs7O0lBb0JoRyxNQUFhLGtCQUFrQjtRQUc5QixZQUFvQixHQUFtQixFQUFFLFVBQXVCO1lBQTVDLFFBQUcsR0FBSCxHQUFHLENBQWdCO1lBRi9CLGFBQVEsR0FBRyxJQUFJLEdBQUcsRUFBa0MsQ0FBQztZQUc1RCxJQUFJLENBQUMsZUFBZSxDQUFDLFVBQVUsQ0FBQyxDQUFDO1FBQ2xDLENBQUM7UUFFTyxlQUFlLENBQUMsVUFBdUI7WUFFOUMsa0VBQWtFO1lBQ2xFLGlFQUFpRTtZQUNqRSxrREFBa0Q7WUFDbEQsTUFBTSxnQkFBZ0IsR0FBRyxVQUFVLENBQUMsZ0JBQWdCO2lCQUNsRCxJQUFJLENBQUMsQ0FBQyxZQUFZLEVBQUUsWUFBWSxFQUFFLEVBQUUsQ0FBQyxZQUFZLENBQUMsTUFBTSxHQUFHLFlBQVksQ0FBQyxNQUFNLENBQUMsQ0FBQyw2RUFBNkU7aUJBQzdKLEdBQUcsQ0FBQyxXQUFXLENBQUMsRUFBRSxDQUFDLFNBQUcsQ0FBQyxLQUFLLENBQUMsV0FBVyxDQUFDLENBQUMsQ0FBQztZQUU3QyxLQUFLLE1BQU0sZUFBZSxJQUFJLGdCQUFnQixFQUFFO2dCQUMvQyxNQUFNLFFBQVEsR0FBRyxrQkFBa0IsQ0FBQyxjQUFjLENBQUMsZUFBZSxDQUFDLENBQUM7Z0JBQ3BFLElBQUksQ0FBQyxRQUFRLENBQUMsR0FBRyxDQUFDLGVBQWUsRUFBRSxRQUFRLENBQUMsQ0FBQzthQUM3QztRQUNGLENBQUM7UUFFTyxRQUFRLENBQUMsR0FBVztZQUMzQixNQUFNLE1BQU0sR0FBRyxJQUFJLENBQUMsR0FBRyxDQUFDLGVBQWUsRUFBRSxDQUFDO1lB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