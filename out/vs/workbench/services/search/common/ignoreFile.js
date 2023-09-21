/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/base/common/glob"], function (require, exports, glob) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.IgnoreFile = void 0;
    class IgnoreFile {
        constructor(contents, location, parent) {
            this.location = location;
            this.parent = parent;
            if (location[location.length - 1] === '\\') {
                throw Error('Unexpected path format, do not use trailing backslashes');
            }
            if (location[location.length - 1] !== '/') {
                location += '/';
            }
            this.isPathIgnored = this.parseIgnoreFile(contents, this.location, this.parent);
        }
        /**
         * Updates the contents of the ignorefile. Preservering the location and parent
         * @param contents The new contents of the gitignore file
         */
        updateContents(contents) {
            this.isPathIgnored = this.parseIgnoreFile(contents, this.location, this.parent);
        }
        /**
         * Returns true if a path in a traversable directory has not been ignored.
         *
         * Note: For performance reasons this does not check if the parent directories have been ignored,
         * so it should always be used in tandem with `shouldTraverseDir` when walking a directory.
         *
         * In cases where a path must be tested in isolation, `isArbitraryPathIncluded` should be used.
         */
        isPathIncludedInTraversal(path, isDir) {
            if (path[0] !== '/' || path[path.length - 1] === '/') {
                throw Error('Unexpected path format, expectred to begin with slash and end without. got:' + path);
            }
            const ignored = this.isPathIgnored(path, isDir);
            return !ignored;
        }
        /**
         * Returns true if an arbitrary path has not been ignored.
         * This is an expensive operation and should only be used ouside of traversals.
         */
        isArbitraryPathIgnored(path, isDir) {
            if (path[0] !== '/' || path[path.length - 1] === '/') {
                throw Error('Unexpected path format, expectred to begin with slash and end without. got:' + path);
            }
            const segments = path.split('/').filter(x => x);
            let ignored = false;
            let walkingPath = '';
            for (let i = 0; i < segments.length; i++) {
                const isLast = i === segments.length - 1;
                const segment = segments[i];
                walkingPath = walkingPath + '/' + segment;
                if (!this.isPathIncludedInTraversal(walkingPath, isLast ? isDir : true)) {
                    ignored = true;
                    break;
                }
            }
            return ignored;
        }
        gitignoreLinesToExpression(lines, dirPath, trimForExclusions) {
            const includeLines = lines.map(line => this.gitignoreLineToGlob(line, dirPath));
            const includeExpression = Object.create(null);
            for (const line of includeLines) {
                includeExpression[line] = true;
            }
            return glob.parse(includeExpression, { trimForExclusions });
        }
        parseIgnoreFile(ignoreContents, dirPath, parent) {
            const contentLines = ignoreContents
                .split('\n')
                .map(line => line.trim())
                .filter(line => line && line[0] !== '#');
            // Pull out all the lines that end with `/`, those only apply to directories
            const fileLines = contentLines.filter(line => !line.endsWith('/'));
            const fileIgnoreLines = fileLines.filter(line => !line.includes('!'));
            const isFileIgnored = this.gitignoreLinesToExpression(fileIgnoreLines, dirPath, true);
            // TODO: Slight hack... this naieve approach may reintroduce too many files in cases of weirdly complex .gitignores
            const fileIncludeLines = fileLines.filter(line => line.includes('!')).map(line => line.replace(/!/g, ''));
            const isFileIncluded = this.gitignoreLinesToExpression(fileIncludeLines, dirPath, false);
            // When checking if a dir is ignored we can use all lines
            const dirIgnoreLines = contentLines.filter(line => !line.includes('!'));
            const isDirIgnored = this.gitignoreLinesToExpression(dirIgnoreLines, dirPath, true);
            // Same hack.
            const dirIncludeLines = contentLines.filter(line => line.includes('!')).map(line => line.replace(/!/g, ''));
            const isDirIncluded = this.gitignoreLinesToExpression(dirIncludeLines, dirPath, false);
            const isPathIgnored = (path, isDir) => {
                if (!path.startsWith(dirPath)) {
                    return false;
                }
                if (isDir && isDirIgnored(path) && !isDirIncluded(path)) {
                    return true;
                }
                if (isFileIgnored(path) && !isFileIncluded(path)) {
                    return true;
                }
                if (parent) {
                    return parent.isPathIgnored(path, isDir);
                }
                return false;
            };
            return isPathIgnored;
        }
        gitignoreLineToGlob(line, dirPath) {
            const firstSep = line.indexOf('/');
            if (firstSep === -1 || firstSep === line.length - 1) {
                line = '**/' + line;
            }
            else {
                if (firstSep === 0) {
                    if (dirPath.slice(-1) === '/') {
                        line = line.slice(1);
                    }
                }
                else {
                    if (dirPath.slice(-1) !== '/') {
                        line = '/' + line;
                    }
                }
                line = dirPath + line;
            }
            return line;
        }
    }
    exports.IgnoreFile = IgnoreFile;
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaWdub3JlRmlsZS5qcyIsInNvdXJjZVJvb3QiOiJmaWxlOi8vL3dvcmtzcGFjZS9hcHBmbG93L3NyYy8iLCJzb3VyY2VzIjpbInZzL3dvcmtiZW5jaC9zZXJ2aWNlcy9zZWFyY2gvY29tbW9uL2lnbm9yZUZpbGUudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7OztnR0FHZ0c7Ozs7O0lBS2hHLE1BQWEsVUFBVTtRQUl0QixZQUNDLFFBQWdCLEVBQ0MsUUFBZ0IsRUFDaEIsTUFBbUI7WUFEbkIsYUFBUSxHQUFSLFFBQVEsQ0FBUTtZQUNoQixXQUFNLEdBQU4sTUFBTSxDQUFhO1lBQ3BDLElBQUksUUFBUSxDQUFDLFFBQVEsQ0FBQyxNQUFNLEdBQUcsQ0FBQyxDQUFDLEtBQUssSUFBSSxFQUFFO2dCQUMzQyxNQUFNLEtBQUssQ0FBQyx5REFBeUQsQ0FBQyxDQUFDO2FBQ3ZFO1lBQ0QsSUFBSSxRQUFRLENBQUMsUUFBUSxDQUFDLE1BQU0sR0FBRyxDQUFDLENBQUMsS0FBSyxHQUFHLEVBQUU7Z0JBQzFDLFFBQVEsSUFBSSxHQUFHLENBQUM7YUFDaEI7WUFDRCxJQUFJLENBQUMsYUFBYSxHQUFHLElBQUksQ0FBQyxlQUFlLENBQUMsUUFBUSxFQUFFLElBQUksQ0FBQyxRQUFRLEVBQUUsSUFBSSxDQUFDLE1BQU0sQ0FBQyxDQUFDO1FBQ2pGLENBQUM7UUFFRDs7O1dBR0c7UUFDSCxjQUFjLENBQUMsUUFBZ0I7WUFDOUIsSUFBSSxDQUFDLGFBQWEsR0FBRyxJQUFJLENBQUMsZUFBZSxDQUFDLFFBQVEsRUFBRSxJQUFJLENBQUMsUUFBUSxFQUFFLElBQUksQ0FBQyxNQUFNLENBQUMsQ0FBQztRQUNqRixDQUFDO1FBRUQ7Ozs7Ozs7V0FPRztRQUNILHlCQUF5QixDQUFDLElBQVksRUFBRSxLQUFjO1lBQ3JELElBQUksSUFBSSxDQUFDLENBQUMsQ0FBQyxLQUFLLEdBQUcsSUFBSSxJQUFJLENBQUMsSUFBSSxDQUFDLE1BQU0sR0FBRyxDQUFDLENBQUMsS0FBSyxH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