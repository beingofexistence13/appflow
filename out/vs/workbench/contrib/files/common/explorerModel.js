/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
define(["require", "exports", "vs/base/common/uri", "vs/base/common/extpath", "vs/base/common/path", "vs/base/common/map", "vs/base/common/strings", "vs/base/common/arrays", "vs/base/common/lifecycle", "vs/base/common/decorators", "vs/base/common/event", "vs/base/common/resources", "vs/workbench/contrib/files/common/explorerFileNestingTrie", "vs/base/common/types"], function (require, exports, uri_1, extpath_1, path_1, map_1, strings_1, arrays_1, lifecycle_1, decorators_1, event_1, resources_1, explorerFileNestingTrie_1, types_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.NewExplorerItem = exports.ExplorerItem = exports.ExplorerModel = void 0;
    class ExplorerModel {
        constructor(contextService, uriIdentityService, fileService, configService, filesConfigService) {
            this.contextService = contextService;
            this.uriIdentityService = uriIdentityService;
            this._onDidChangeRoots = new event_1.Emitter();
            const setRoots = () => this._roots = this.contextService.getWorkspace().folders
                .map(folder => new ExplorerItem(folder.uri, fileService, configService, filesConfigService, undefined, true, false, false, false, folder.name));
            setRoots();
            this._listener = this.contextService.onDidChangeWorkspaceFolders(() => {
                setRoots();
                this._onDidChangeRoots.fire();
            });
        }
        get roots() {
            return this._roots;
        }
        get onDidChangeRoots() {
            return this._onDidChangeRoots.event;
        }
        /**
         * Returns an array of child stat from this stat that matches with the provided path.
         * Starts matching from the first root.
         * Will return empty array in case the FileStat does not exist.
         */
        findAll(resource) {
            return (0, arrays_1.coalesce)(this.roots.map(root => root.find(resource)));
        }
        /**
         * Returns a FileStat that matches the passed resource.
         * In case multiple FileStat are matching the resource (same folder opened multiple times) returns the FileStat that has the closest root.
         * Will return undefined in case the FileStat does not exist.
         */
        findClosest(resource) {
            const folder = this.contextService.getWorkspaceFolder(resource);
            if (folder) {
                const root = this.roots.find(r => this.uriIdentityService.extUri.isEqual(r.resource, folder.uri));
                if (root) {
                    return root.find(resource);
                }
            }
            return null;
        }
        dispose() {
            (0, lifecycle_1.dispose)(this._listener);
        }
    }
    exports.ExplorerModel = ExplorerModel;
    class ExplorerItem {
        constructor(resource, fileService, configService, filesConfigService, _parent, _isDirectory, _isSymbolicLink, _readonly, _locked, _name = (0, resources_1.basenameOrAuthority)(resource), _mtime, _unknown = false) {
            this.resource = resource;
            this.fileService = fileService;
            this.configService = configService;
            this.filesConfigService = filesConfigService;
            this._parent = _parent;
            this._isDirectory = _isDirectory;
            this._isSymbolicLink = _isSymbolicLink;
            this._readonly = _readonly;
            this._locked = _locked;
            this._name = _name;
            this._mtime = _mtime;
            this._unknown = _unknown;
            this.error = undefined;
            this._isExcluded = false;
            this._isDirectoryResolved = false;
        }
        get isExcluded() {
            if (this._isExcluded) {
                return true;
            }
            if (!this._parent) {
                return false;
            }
            return this._parent.isExcluded;
        }
        set isExcluded(value) {
            this._isExcluded = value;
        }
        hasChildren(filter) {
            if (this.hasNests) {
                return this.nestedChildren?.some(c => filter(c)) ?? false;
            }
            else {
                return this.isDirectory;
            }
        }
        get hasNests() {
            return !!(this.nestedChildren?.length);
        }
        get isDirectoryResolved() {
            return this._isDirectoryResolved;
        }
        get isSymbolicLink() {
            return !!this._isSymbolicLink;
        }
        get isDirectory() {
            return !!this._isDirectory;
        }
        get isReadonly() {
            return this.filesConfigService.isReadonly(this.resource, { resource: this.resource, name: this.name, readonly: this._readonly, locked: this._locked });
        }
        get mtime() {
            return this._mtime;
        }
        get name() {
            return this._name;
        }
        get isUnknown() {
            return this._unknown;
        }
        get parent() {
            return this._parent;
        }
        get root() {
            if (!this._parent) {
                return this;
            }
            return this._parent.root;
        }
        get children() {
            return new Map();
        }
        updateName(value) {
            // Re-add to parent since the parent has a name map to children and the name might have changed
            this._parent?.removeChild(this);
            this._name = value;
            this._parent?.addChild(this);
        }
        getId() {
            return this.root.resource.toString() + '::' + this.resource.toString();
        }
        toString() {
            return `ExplorerItem: ${this.name}`;
        }
        get isRoot() {
            return this === this.root;
        }
        static create(fileService, configService, filesConfigService, raw, parent, resolveTo) {
            const stat = new ExplorerItem(raw.resource, fileService, configService, filesConfigService, parent, raw.isDirectory, raw.isSymbolicLink, raw.readonly, raw.locked, raw.name, raw.mtime, !raw.isFile && !raw.isDirectory);
            // Recursively add children if present
            if (stat.isDirectory) {
                // isDirectoryResolved is a very important indicator in the stat model that tells if the folder was fully resolved
                // the folder is fully resolved if either it has a list of children or the client requested this by using the resolveTo
                // array of resource path to resolve.
                stat._isDirectoryResolved = !!raw.children || (!!resolveTo && resolveTo.some((r) => {
                    return (0, resources_1.isEqualOrParent)(r, stat.resource);
                }));
                // Recurse into children
                if (raw.children) {
                    for (let i = 0, len = raw.children.length; i < len; i++) {
                        const child = ExplorerItem.create(fileService, configService, filesConfigService, raw.children[i], stat, resolveTo);
                        stat.addChild(child);
                    }
                }
            }
            return stat;
        }
        /**
         * Merges the stat which was resolved from the disk with the local stat by copying over properties
         * and children. The merge will only consider resolved stat elements to avoid overwriting data which
         * exists locally.
         */
        static mergeLocalWithDisk(disk, local) {
            if (disk.resource.toString() !== local.resource.toString()) {
                return; // Merging only supported for stats with the same resource
            }
            // Stop merging when a folder is not resolved to avoid loosing local data
            const mergingDirectories = disk.isDirectory || local.isDirectory;
            if (mergingDirectories && local._isDirectoryResolved && !disk._isDirectoryResolved) {
                return;
            }
            // Properties
            local.resource = disk.resource;
            if (!local.isRoot) {
                local.updateName(disk.name);
            }
            local._isDirectory = disk.isDirectory;
            local._mtime = disk.mtime;
            local._isDirectoryResolved = disk._isDirectoryResolved;
            local._isSymbolicLink = disk.isSymbolicLink;
            local.error = disk.error;
            // Merge Children if resolved
            if (mergingDirectories && disk._isDirectoryResolved) {
                // Map resource => stat
                const oldLocalChildren = new map_1.ResourceMap();
                local.children.forEach(child => {
                    oldLocalChildren.set(child.resource, child);
                });
                // Clear current children
                local.children.clear();
                // Merge received children
                disk.children.forEach(diskChild => {
                    const formerLocalChild = oldLocalChildren.get(diskChild.resource);
                    // Existing child: merge
                    if (formerLocalChild) {
                        ExplorerItem.mergeLocalWithDisk(diskChild, formerLocalChild);
                        local.addChild(formerLocalChild);
                        oldLocalChildren.delete(diskChild.resource);
                    }
                    // New child: add
                    else {
                        local.addChild(diskChild);
                    }
                });
                oldLocalChildren.forEach(oldChild => {
                    if (oldChild instanceof NewExplorerItem) {
                        local.addChild(oldChild);
                    }
                });
            }
        }
        /**
         * Adds a child element to this folder.
         */
        addChild(child) {
            // Inherit some parent properties to child
            child._parent = this;
            child.updateResource(false);
            this.children.set(this.getPlatformAwareName(child.name), child);
        }
        getChild(name) {
            return this.children.get(this.getPlatformAwareName(name));
        }
        fetchChildren(sortOrder) {
            const nestingConfig = this.configService.getValue({ resource: this.root.resource }).explorer.fileNesting;
            // fast path when the children can be resolved sync
            if (nestingConfig.enabled && this.nestedChildren) {
                return this.nestedChildren;
            }
            return (async () => {
                if (!this._isDirectoryResolved) {
                    // Resolve metadata only when the mtime is needed since this can be expensive
                    // Mtime is only used when the sort order is 'modified'
                    const resolveMetadata = sortOrder === "modified" /* SortOrder.Modified */;
                    this.error = undefined;
                    try {
                        const stat = await this.fileService.resolve(this.resource, { resolveSingleChildDescendants: true, resolveMetadata });
                        const resolved = ExplorerItem.create(this.fileService, this.configService, this.filesConfigService, stat, this);
                        ExplorerItem.mergeLocalWithDisk(resolved, this);
                    }
                    catch (e) {
                        this.error = e;
                        throw e;
                    }
                    this._isDirectoryResolved = true;
                }
                const items = [];
                if (nestingConfig.enabled) {
                    const fileChildren = [];
                    const dirChildren = [];
                    for (const child of this.children.entries()) {
                        child[1].nestedParent = undefined;
                        if (child[1].isDirectory) {
                            dirChildren.push(child);
                        }
                        else {
                            fileChildren.push(child);
                        }
                    }
                    const nested = this.fileNester.nest(fileChildren.map(([name]) => name), this.getPlatformAwareName(this.name));
                    for (const [fileEntryName, fileEntryItem] of fileChildren) {
                        const nestedItems = nested.get(fileEntryName);
                        if (nestedItems !== undefined) {
                            fileEntryItem.nestedChildren = [];
                            for (const name of nestedItems.keys()) {
                                const child = (0, types_1.assertIsDefined)(this.children.get(name));
                                fileEntryItem.nestedChildren.push(child);
                                child.nestedParent = fileEntryItem;
                            }
                            items.push(fileEntryItem);
                        }
                        else {
                            fileEntryItem.nestedChildren = undefined;
                        }
                    }
                    for (const [_, dirEntryItem] of dirChildren.values()) {
                        items.push(dirEntryItem);
                    }
                }
                else {
                    this.children.forEach(child => {
                        items.push(child);
                    });
                }
                return items;
            })();
        }
        get fileNester() {
            if (!this.root._fileNester) {
                const nestingConfig = this.configService.getValue({ resource: this.root.resource }).explorer.fileNesting;
                const patterns = Object.entries(nestingConfig.patterns)
                    .filter(entry => typeof (entry[0]) === 'string' && typeof (entry[1]) === 'string' && entry[0] && entry[1])
                    .map(([parentPattern, childrenPatterns]) => [
                    this.getPlatformAwareName(parentPattern.trim()),
                    childrenPatterns.split(',').map(p => this.getPlatformAwareName(p.trim().replace(/\u200b/g, '').trim()))
                        .filter(p => p !== '')
                ]);
                this.root._fileNester = new explorerFileNestingTrie_1.ExplorerFileNestingTrie(patterns);
            }
            return this.root._fileNester;
        }
        /**
         * Removes a child element from this folder.
         */
        removeChild(child) {
            this.nestedChildren = undefined;
            this.children.delete(this.getPlatformAwareName(child.name));
        }
        forgetChildren() {
            this.children.clear();
            this.nestedChildren = undefined;
            this._isDirectoryResolved = false;
            this._fileNester = undefined;
        }
        getPlatformAwareName(name) {
            return this.fileService.hasCapability(this.resource, 1024 /* FileSystemProviderCapabilities.PathCaseSensitive */) ? name : name.toLowerCase();
        }
        /**
         * Moves this element under a new parent element.
         */
        move(newParent) {
            this.nestedParent?.removeChild(this);
            this._parent?.removeChild(this);
            newParent.removeChild(this); // make sure to remove any previous version of the file if any
            newParent.addChild(this);
            this.updateResource(true);
        }
        updateResource(recursive) {
            if (this._parent) {
                this.resource = (0, resources_1.joinPath)(this._parent.resource, this.name);
            }
            if (recursive) {
                if (this.isDirectory) {
                    this.children.forEach(child => {
                        child.updateResource(true);
                    });
                }
            }
        }
        /**
         * Tells this stat that it was renamed. This requires changes to all children of this stat (if any)
         * so that the path property can be updated properly.
         */
        rename(renamedStat) {
            // Merge a subset of Properties that can change on rename
            this.updateName(renamedStat.name);
            this._mtime = renamedStat.mtime;
            // Update Paths including children
            this.updateResource(true);
        }
        /**
         * Returns a child stat from this stat that matches with the provided path.
         * Will return "null" in case the child does not exist.
         */
        find(resource) {
            // Return if path found
            // For performance reasons try to do the comparison as fast as possible
            const ignoreCase = !this.fileService.hasCapability(resource, 1024 /* FileSystemProviderCapabilities.PathCaseSensitive */);
            if (resource && this.resource.scheme === resource.scheme && (0, strings_1.equalsIgnoreCase)(this.resource.authority, resource.authority) &&
                (ignoreCase ? (0, strings_1.startsWithIgnoreCase)(resource.path, this.resource.path) : resource.path.startsWith(this.resource.path))) {
                return this.findByPath((0, strings_1.rtrim)(resource.path, path_1.posix.sep), this.resource.path.length, ignoreCase);
            }
            return null; //Unable to find
        }
        findByPath(path, index, ignoreCase) {
            if ((0, extpath_1.isEqual)((0, strings_1.rtrim)(this.resource.path, path_1.posix.sep), path, ignoreCase)) {
                return this;
            }
            if (this.isDirectory) {
                // Ignore separtor to more easily deduct the next name to search
                while (index < path.length && path[index] === path_1.posix.sep) {
                    index++;
                }
                let indexOfNextSep = path.indexOf(path_1.posix.sep, index);
                if (indexOfNextSep === -1) {
                    // If there is no separator take the remainder of the path
                    indexOfNextSep = path.length;
                }
                // The name to search is between two separators
                const name = path.substring(index, indexOfNextSep);
                const child = this.children.get(this.getPlatformAwareName(name));
                if (child) {
                    // We found a child with the given name, search inside it
                    return child.findByPath(path, indexOfNextSep, ignoreCase);
                }
            }
            return null;
        }
    }
    exports.ExplorerItem = ExplorerItem;
    __decorate([
        decorators_1.memoize
    ], ExplorerItem.prototype, "children", null);
    class NewExplorerItem extends ExplorerItem {
        constructor(fileService, configService, filesConfigService, parent, isDirectory) {
            super(uri_1.URI.file(''), fileService, configService, filesConfigService, parent, isDirectory);
            this._isDirectoryResolved = true;
        }
    }
    exports.NewExplorerItem = NewExplorerItem;
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZXhwbG9yZXJNb2RlbC5qcyIsInNvdXJjZVJvb3QiOiJmaWxlOi8vL3dvcmtzcGFjZS9hcHBmbG93L3NyYy8iLCJzb3VyY2VzIjpbInZzL3dvcmtiZW5jaC9jb250cmliL2ZpbGVzL2NvbW1vbi9leHBsb3Jlck1vZGVsLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOzs7Z0dBR2dHOzs7Ozs7Ozs7OztJQXNCaEcsTUFBYSxhQUFhO1FBTXpCLFlBQ2tCLGNBQXdDLEVBQ3hDLGtCQUF1QyxFQUN4RCxXQUF5QixFQUN6QixhQUFvQyxFQUNwQyxrQkFBOEM7WUFKN0IsbUJBQWMsR0FBZCxjQUFjLENBQTBCO1lBQ3hDLHVCQUFrQixHQUFsQixrQkFBa0IsQ0FBcUI7WUFKeEMsc0JBQWlCLEdBQUcsSUFBSSxlQUFPLEVBQVEsQ0FBQztZQVN4RCxNQUFNLFFBQVEsR0FBRyxHQUFHLEVBQUUsQ0FBQyxJQUFJLENBQUMsTUFBTSxHQUFHLElBQUksQ0FBQyxjQUFjLENBQUMsWUFBWSxFQUFFLENBQUMsT0FBTztpQkFDN0UsR0FBRyxDQUFDLE1BQU0sQ0FBQyxFQUFFLENBQUMsSUFBSSxZQUFZLENBQUMsTUFBTSxDQUFDLEdBQUcsRUFBRSxXQUFXLEVBQUUsYUFBYSxFQUFFLGtCQUFrQixFQUFFLFNBQVMsRUFBRSxJQUFJLEVBQUUsS0FBSyxFQUFFLEtBQUssRUFBRSxLQUFLLEVBQUUsTUFBTSxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUM7WUFDakosUUFBUSxFQUFFLENBQUM7WUFFWCxJQUFJLENBQUMsU0FBUyxHQUFHLElBQUksQ0FBQyxjQUFjLENBQUMsMkJBQTJCLENBQUMsR0FBRyxFQUFFO2dCQUNyRSxRQUFRLEVBQUUsQ0FBQztnQkFDWCxJQUFJLENBQUMsaUJBQWlCLENBQUMsSUFBSSxFQUFFLENBQUM7WUFDL0IsQ0FBQyxDQUFDLENBQUM7UUFDSixDQUFDO1FBRUQsSUFBSSxLQUFLO1lBQ1IsT0FBTyxJQUFJLENBQUMsTUFBTSxDQUFDO1FBQ3BCLENBQUM7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