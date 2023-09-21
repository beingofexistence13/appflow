define(["require", "exports", "vs/base/common/event", "vs/base/common/lifecycle", "vs/platform/files/common/files", "vs/base/common/stream", "vs/base/common/ternarySearchTree", "vs/base/common/buffer", "vs/base/common/types", "vs/base/common/map"], function (require, exports, event_1, lifecycle_1, files_1, stream_1, ternarySearchTree_1, buffer_1, types_1, map_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.FileUserDataProvider = void 0;
    /**
     * This is a wrapper on top of the local filesystem provider which will
     * 	- Convert the user data resources to file system scheme and vice-versa
     *  - Enforces atomic reads for user data
     */
    class FileUserDataProvider extends lifecycle_1.Disposable {
        get capabilities() { return this.fileSystemProvider.capabilities & ~4 /* FileSystemProviderCapabilities.FileOpenReadWriteClose */; }
        constructor(fileSystemScheme, fileSystemProvider, userDataScheme, userDataProfilesService, uriIdentityService, logService) {
            super();
            this.fileSystemScheme = fileSystemScheme;
            this.fileSystemProvider = fileSystemProvider;
            this.userDataScheme = userDataScheme;
            this.userDataProfilesService = userDataProfilesService;
            this.logService = logService;
            this.onDidChangeCapabilities = this.fileSystemProvider.onDidChangeCapabilities;
            this._onDidChangeFile = this._register(new event_1.Emitter());
            this.onDidChangeFile = this._onDidChangeFile.event;
            this.watchResources = ternarySearchTree_1.TernarySearchTree.forUris(() => !(this.capabilities & 1024 /* FileSystemProviderCapabilities.PathCaseSensitive */));
            this.atomicWritesResources = new map_1.ResourceSet((uri) => uriIdentityService.extUri.getComparisonKey(this.toFileSystemResource(uri)));
            this.updateAtomicWritesResources();
            this._register(userDataProfilesService.onDidChangeProfiles(() => this.updateAtomicWritesResources()));
            this._register(this.fileSystemProvider.onDidChangeFile(e => this.handleFileChanges(e)));
        }
        updateAtomicWritesResources() {
            this.atomicWritesResources.clear();
            for (const profile of this.userDataProfilesService.profiles) {
                this.atomicWritesResources.add(profile.settingsResource);
                this.atomicWritesResources.add(profile.keybindingsResource);
                this.atomicWritesResources.add(profile.tasksResource);
                this.atomicWritesResources.add(profile.extensionsResource);
            }
        }
        watch(resource, opts) {
            this.watchResources.set(resource, resource);
            const disposable = this.fileSystemProvider.watch(this.toFileSystemResource(resource), opts);
            return (0, lifecycle_1.toDisposable)(() => {
                this.watchResources.delete(resource);
                disposable.dispose();
            });
        }
        stat(resource) {
            return this.fileSystemProvider.stat(this.toFileSystemResource(resource));
        }
        mkdir(resource) {
            return this.fileSystemProvider.mkdir(this.toFileSystemResource(resource));
        }
        rename(from, to, opts) {
            return this.fileSystemProvider.rename(this.toFileSystemResource(from), this.toFileSystemResource(to), opts);
        }
        readFile(resource) {
            return this.fileSystemProvider.readFile(this.toFileSystemResource(resource), { atomic: true });
        }
        readFileStream(resource, opts, token) {
            const stream = (0, stream_1.newWriteableStream)(data => buffer_1.VSBuffer.concat(data.map(data => buffer_1.VSBuffer.wrap(data))).buffer);
            (async () => {
                try {
                    const contents = await this.readFile(resource);
                    stream.end(contents);
                }
                catch (error) {
                    stream.error(error);
                    stream.end();
                }
            })();
            return stream;
        }
        readdir(resource) {
            return this.fileSystemProvider.readdir(this.toFileSystemResource(resource));
        }
        writeFile(resource, content, opts) {
            if (this.atomicWritesResources.has(resource) && !(0, types_1.isObject)(opts.atomic) && (0, files_1.hasFileAtomicWriteCapability)(this.fileSystemProvider)) {
                opts = { ...opts, atomic: { postfix: '.vsctmp' } };
            }
            return this.fileSystemProvider.writeFile(this.toFileSystemResource(resource), content, opts);
        }
        delete(resource, opts) {
            return this.fileSystemProvider.delete(this.toFileSystemResource(resource), opts);
        }
        copy(from, to, opts) {
            if ((0, files_1.hasFileFolderCopyCapability)(this.fileSystemProvider)) {
                return this.fileSystemProvider.copy(this.toFileSystemResource(from), this.toFileSystemResource(to), opts);
            }
            throw new Error('copy not supported');
        }
        handleFileChanges(changes) {
            const userDataChanges = [];
            for (const change of changes) {
                if (change.resource.scheme !== this.fileSystemScheme) {
                    continue; // only interested in file schemes
                }
                const userDataResource = this.toUserDataResource(change.resource);
                if (this.watchResources.findSubstr(userDataResource)) {
                    userDataChanges.push({
                        resource: userDataResource,
                        type: change.type
                    });
                }
            }
            if (userDataChanges.length) {
                this.logService.debug('User data changed');
                this._onDidChangeFile.fire(userDataChanges);
            }
        }
        toFileSystemResource(userDataResource) {
            return userDataResource.with({ scheme: this.fileSystemScheme });
        }
        toUserDataResource(fileSystemResource) {
            return fileSystemResource.with({ scheme: this.userDataScheme });
        }
    }
    exports.FileUserDataProvider = FileUserDataProvider;
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZmlsZVVzZXJEYXRhUHJvdmlkZXIuanMiLCJzb3VyY2VSb290IjoiZmlsZTovLy93b3Jrc3BhY2UvYXBwZmxvdy9zcmMvIiwic291cmNlcyI6WyJ2cy9wbGF0Zm9ybS91c2VyRGF0YS9jb21tb24vZmlsZVVzZXJEYXRhUHJvdmlkZXIudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7OztJQWtCQTs7OztPQUlHO0lBQ0gsTUFBYSxvQkFBcUIsU0FBUSxzQkFBVTtRQU1uRCxJQUFJLFlBQVksS0FBSyxPQUFPLElBQUksQ0FBQyxrQkFBa0IsQ0FBQyxZQUFZLEdBQUcsOERBQXNELENBQUMsQ0FBQyxDQUFDO1FBUzVILFlBQ2tCLGdCQUF3QixFQUN4QixrQkFBME4sRUFDMU4sY0FBc0IsRUFDdEIsdUJBQWlELEVBQ2xFLGtCQUF1QyxFQUN0QixVQUF1QjtZQUV4QyxLQUFLLEVBQUUsQ0FBQztZQVBTLHFCQUFnQixHQUFoQixnQkFBZ0IsQ0FBUTtZQUN4Qix1QkFBa0IsR0FBbEIsa0JBQWtCLENBQXdNO1lBQzFOLG1CQUFjLEdBQWQsY0FBYyxDQUFRO1lBQ3RCLDRCQUF1QixHQUF2Qix1QkFBdUIsQ0FBMEI7WUFFakQsZUFBVSxHQUFWLFVBQVUsQ0FBYTtZQWRoQyw0QkFBdUIsR0FBZ0IsSUFBSSxDQUFDLGtCQUFrQixDQUFDLHVCQUF1QixDQUFDO1lBRS9FLHFCQUFnQixHQUFHLElBQUksQ0FBQyxTQUFTLENBQUMsSUFBSSxlQUFPLEVBQTBCLENBQUMsQ0FBQztZQUNqRixvQkFBZSxHQUFrQyxJQUFJLENBQUMsZ0JBQWdCLENBQUMsS0FBSyxDQUFDO1lBRXJFLG1CQUFjLEdBQUcscUNBQWlCLENBQUMsT0FBTyxDQUFNLEdBQUcsRUFBRSxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsWUFBWSw4REFBbUQsQ0FBQyxDQUFDLENBQUM7WUFZL0ksSUFBSSxDQUFDLHFCQUFxQixHQUFHLElBQUksaUJBQVcsQ0FBQyxDQUFDLEdBQUcsRUFBRSxFQUFFLENBQUMsa0JBQWtC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