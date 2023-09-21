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
    exports.$wHb = exports.$vHb = exports.$uHb = void 0;
    class $uHb {
        constructor(f, g, fileService, configService, filesConfigService) {
            this.f = f;
            this.g = g;
            this.d = new event_1.$fd();
            const setRoots = () => this.a = this.f.getWorkspace().folders
                .map(folder => new $vHb(folder.uri, fileService, configService, filesConfigService, undefined, true, false, false, false, folder.name));
            setRoots();
            this.b = this.f.onDidChangeWorkspaceFolders(() => {
                setRoots();
                this.d.fire();
            });
        }
        get roots() {
            return this.a;
        }
        get onDidChangeRoots() {
            return this.d.event;
        }
        /**
         * Returns an array of child stat from this stat that matches with the provided path.
         * Starts matching from the first root.
         * Will return empty array in case the FileStat does not exist.
         */
        findAll(resource) {
            return (0, arrays_1.$Fb)(this.roots.map(root => root.find(resource)));
        }
        /**
         * Returns a FileStat that matches the passed resource.
         * In case multiple FileStat are matching the resource (same folder opened multiple times) returns the FileStat that has the closest root.
         * Will return undefined in case the FileStat does not exist.
         */
        findClosest(resource) {
            const folder = this.f.getWorkspaceFolder(resource);
            if (folder) {
                const root = this.roots.find(r => this.g.extUri.isEqual(r.resource, folder.uri));
                if (root) {
                    return root.find(resource);
                }
            }
            return null;
        }
        dispose() {
            (0, lifecycle_1.$fc)(this.b);
        }
    }
    exports.$uHb = $uHb;
    class $vHb {
        constructor(resource, b, d, f, g, h, j, k, l, m = (0, resources_1.$eg)(resource), n, o = false) {
            this.resource = resource;
            this.b = b;
            this.d = d;
            this.f = f;
            this.g = g;
            this.h = h;
            this.j = j;
            this.k = k;
            this.l = l;
            this.m = m;
            this.n = n;
            this.o = o;
            this.error = undefined;
            this.a = false;
            this._isDirectoryResolved = false;
        }
        get isExcluded() {
            if (this.a) {
                return true;
            }
            if (!this.g) {
                return false;
            }
            return this.g.isExcluded;
        }
        set isExcluded(value) {
            this.a = value;
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
            return !!this.j;
        }
        get isDirectory() {
            return !!this.h;
        }
        get isReadonly() {
            return this.f.isReadonly(this.resource, { resource: this.resource, name: this.name, readonly: this.k, locked: this.l });
        }
        get mtime() {
            return this.n;
        }
        get name() {
            return this.m;
        }
        get isUnknown() {
            return this.o;
        }
        get parent() {
            return this.g;
        }
        get root() {
            if (!this.g) {
                return this;
            }
            return this.g.root;
        }
        get children() {
            return new Map();
        }
        q(value) {
            // Re-add to parent since the parent has a name map to children and the name might have changed
            this.g?.removeChild(this);
            this.m = value;
            this.g?.addChild(this);
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
            const stat = new $vHb(raw.resource, fileService, configService, filesConfigService, parent, raw.isDirectory, raw.isSymbolicLink, raw.readonly, raw.locked, raw.name, raw.mtime, !raw.isFile && !raw.isDirectory);
            // Recursively add children if present
            if (stat.isDirectory) {
                // isDirectoryResolved is a very important indicator in the stat model that tells if the folder was fully resolved
                // the folder is fully resolved if either it has a list of children or the client requested this by using the resolveTo
                // array of resource path to resolve.
                stat._isDirectoryResolved = !!raw.children || (!!resolveTo && resolveTo.some((r) => {
                    return (0, resources_1.$cg)(r, stat.resource);
                }));
                // Recurse into children
                if (raw.children) {
                    for (let i = 0, len = raw.children.length; i < len; i++) {
                        const child = $vHb.create(fileService, configService, filesConfigService, raw.children[i], stat, resolveTo);
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
                local.q(disk.name);
            }
            local.h = disk.isDirectory;
            local.n = disk.mtime;
            local._isDirectoryResolved = disk._isDirectoryResolved;
            local.j = disk.isSymbolicLink;
            local.error = disk.error;
            // Merge Children if resolved
            if (mergingDirectories && disk._isDirectoryResolved) {
                // Map resource => stat
                const oldLocalChildren = new map_1.$zi();
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
                        $vHb.mergeLocalWithDisk(diskChild, formerLocalChild);
                        local.addChild(formerLocalChild);
                        oldLocalChildren.delete(diskChild.resource);
                    }
                    // New child: add
                    else {
                        local.addChild(diskChild);
                    }
                });
                oldLocalChildren.forEach(oldChild => {
                    if (oldChild instanceof $wHb) {
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
            child.g = this;
            child.v(false);
            this.children.set(this.u(child.name), child);
        }
        getChild(name) {
            return this.children.get(this.u(name));
        }
        fetchChildren(sortOrder) {
            const nestingConfig = this.d.getValue({ resource: this.root.resource }).explorer.fileNesting;
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
                        const stat = await this.b.resolve(this.resource, { resolveSingleChildDescendants: true, resolveMetadata });
                        const resolved = $vHb.create(this.b, this.d, this.f, stat, this);
                        $vHb.mergeLocalWithDisk(resolved, this);
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
                    const nested = this.t.nest(fileChildren.map(([name]) => name), this.u(this.name));
                    for (const [fileEntryName, fileEntryItem] of fileChildren) {
                        const nestedItems = nested.get(fileEntryName);
                        if (nestedItems !== undefined) {
                            fileEntryItem.nestedChildren = [];
                            for (const name of nestedItems.keys()) {
                                const child = (0, types_1.$uf)(this.children.get(name));
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
        get t() {
            if (!this.root.s) {
                const nestingConfig = this.d.getValue({ resource: this.root.resource }).explorer.fileNesting;
                const patterns = Object.entries(nestingConfig.patterns)
                    .filter(entry => typeof (entry[0]) === 'string' && typeof (entry[1]) === 'string' && entry[0] && entry[1])
                    .map(([parentPattern, childrenPatterns]) => [
                    this.u(parentPattern.trim()),
                    childrenPatterns.split(',').map(p => this.u(p.trim().replace(/\u200b/g, '').trim()))
                        .filter(p => p !== '')
                ]);
                this.root.s = new explorerFileNestingTrie_1.$rHb(patterns);
            }
            return this.root.s;
        }
        /**
         * Removes a child element from this folder.
         */
        removeChild(child) {
            this.nestedChildren = undefined;
            this.children.delete(this.u(child.name));
        }
        forgetChildren() {
            this.children.clear();
            this.nestedChildren = undefined;
            this._isDirectoryResolved = false;
            this.s = undefined;
        }
        u(name) {
            return this.b.hasCapability(this.resource, 1024 /* FileSystemProviderCapabilities.PathCaseSensitive */) ? name : name.toLowerCase();
        }
        /**
         * Moves this element under a new parent element.
         */
        move(newParent) {
            this.nestedParent?.removeChild(this);
            this.g?.removeChild(this);
            newParent.removeChild(this); // make sure to remove any previous version of the file if any
            newParent.addChild(this);
            this.v(true);
        }
        v(recursive) {
            if (this.g) {
                this.resource = (0, resources_1.$ig)(this.g.resource, this.name);
            }
            if (recursive) {
                if (this.isDirectory) {
                    this.children.forEach(child => {
                        child.v(true);
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
            this.q(renamedStat.name);
            this.n = renamedStat.mtime;
            // Update Paths including children
            this.v(true);
        }
        /**
         * Returns a child stat from this stat that matches with the provided path.
         * Will return "null" in case the child does not exist.
         */
        find(resource) {
            // Return if path found
            // For performance reasons try to do the comparison as fast as possible
            const ignoreCase = !this.b.hasCapability(resource, 1024 /* FileSystemProviderCapabilities.PathCaseSensitive */);
            if (resource && this.resource.scheme === resource.scheme && (0, strings_1.$Me)(this.resource.authority, resource.authority) &&
                (ignoreCase ? (0, strings_1.$Ne)(resource.path, this.resource.path) : resource.path.startsWith(this.resource.path))) {
                return this.w((0, strings_1.$ve)(resource.path, path_1.$6d.sep), this.resource.path.length, ignoreCase);
            }
            return null; //Unable to find
        }
        w(path, index, ignoreCase) {
            if ((0, extpath_1.$Hf)((0, strings_1.$ve)(this.resource.path, path_1.$6d.sep), path, ignoreCase)) {
                return this;
            }
            if (this.isDirectory) {
                // Ignore separtor to more easily deduct the next name to search
                while (index < path.length && path[index] === path_1.$6d.sep) {
                    index++;
                }
                let indexOfNextSep = path.indexOf(path_1.$6d.sep, index);
                if (indexOfNextSep === -1) {
                    // If there is no separator take the remainder of the path
                    indexOfNextSep = path.length;
                }
                // The name to search is between two separators
                const name = path.substring(index, indexOfNextSep);
                const child = this.children.get(this.u(name));
                if (child) {
                    // We found a child with the given name, search inside it
                    return child.w(path, indexOfNextSep, ignoreCase);
                }
            }
            return null;
        }
    }
    exports.$vHb = $vHb;
    __decorate([
        decorators_1.$6g
    ], $vHb.prototype, "children", null);
    class $wHb extends $vHb {
        constructor(fileService, configService, filesConfigService, parent, isDirectory) {
            super(uri_1.URI.file(''), fileService, configService, filesConfigService, parent, isDirectory);
            this._isDirectoryResolved = true;
        }
    }
    exports.$wHb = $wHb;
});
//# sourceMappingURL=explorerModel.js.map