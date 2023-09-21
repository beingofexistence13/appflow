/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/base/common/glob", "vs/base/common/iterator", "vs/base/common/resources"], function (require, exports, glob, iterator_1, resources_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.NotebookStaticPreloadInfo = exports.NotebookOutputRendererInfo = void 0;
    class DependencyList {
        constructor(value) {
            this.value = new Set(value);
            this.defined = this.value.size > 0;
        }
        /** Gets whether any of the 'available' dependencies match the ones in this list */
        matches(available) {
            // For now this is simple, but this may expand to support globs later
            // @see https://github.com/microsoft/vscode/issues/119899
            return available.some(v => this.value.has(v));
        }
    }
    class NotebookOutputRendererInfo {
        constructor(descriptor) {
            this.id = descriptor.id;
            this.extensionId = descriptor.extension.identifier;
            this.extensionLocation = descriptor.extension.extensionLocation;
            this.isBuiltin = descriptor.extension.isBuiltin;
            if (typeof descriptor.entrypoint === 'string') {
                this.entrypoint = {
                    extends: undefined,
                    path: (0, resources_1.joinPath)(this.extensionLocation, descriptor.entrypoint)
                };
            }
            else {
                this.entrypoint = {
                    extends: descriptor.entrypoint.extends,
                    path: (0, resources_1.joinPath)(this.extensionLocation, descriptor.entrypoint.path)
                };
            }
            this.displayName = descriptor.displayName;
            this.mimeTypes = descriptor.mimeTypes;
            this.mimeTypeGlobs = this.mimeTypes.map(pattern => glob.parse(pattern));
            this.hardDependencies = new DependencyList(descriptor.dependencies ?? iterator_1.Iterable.empty());
            this.optionalDependencies = new DependencyList(descriptor.optionalDependencies ?? iterator_1.Iterable.empty());
            this.messaging = descriptor.requiresMessaging ?? "never" /* RendererMessagingSpec.Never */;
        }
        matchesWithoutKernel(mimeType) {
            if (!this.matchesMimeTypeOnly(mimeType)) {
                return 3 /* NotebookRendererMatch.Never */;
            }
            if (this.hardDependencies.defined) {
                return 0 /* NotebookRendererMatch.WithHardKernelDependency */;
            }
            if (this.optionalDependencies.defined) {
                return 1 /* NotebookRendererMatch.WithOptionalKernelDependency */;
            }
            return 2 /* NotebookRendererMatch.Pure */;
        }
        matches(mimeType, kernelProvides) {
            if (!this.matchesMimeTypeOnly(mimeType)) {
                return 3 /* NotebookRendererMatch.Never */;
            }
            if (this.hardDependencies.defined) {
                return this.hardDependencies.matches(kernelProvides)
                    ? 0 /* NotebookRendererMatch.WithHardKernelDependency */
                    : 3 /* NotebookRendererMatch.Never */;
            }
            return this.optionalDependencies.matches(kernelProvides)
                ? 1 /* NotebookRendererMatch.WithOptionalKernelDependency */
                : 2 /* NotebookRendererMatch.Pure */;
        }
        matchesMimeTypeOnly(mimeType) {
            if (this.entrypoint.extends) { // We're extending another renderer
                return false;
            }
            return this.mimeTypeGlobs.some(pattern => pattern(mimeType)) || this.mimeTypes.some(pattern => pattern === mimeType);
        }
    }
    exports.NotebookOutputRendererInfo = NotebookOutputRendererInfo;
    class NotebookStaticPreloadInfo {
        constructor(descriptor) {
            this.type = descriptor.type;
            this.entrypoint = (0, resources_1.joinPath)(descriptor.extension.extensionLocation, descriptor.entrypoint);
            this.extensionLocation = descriptor.extension.extensionLocation;
            this.localResourceRoots = descriptor.localResourceRoots.map(root => (0, resources_1.joinPath)(descriptor.extension.extensionLocation, root));
        }
    }
    exports.NotebookStaticPreloadInfo = NotebookStaticPreloadInfo;
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibm90ZWJvb2tPdXRwdXRSZW5kZXJlci5qcyIsInNvdXJjZVJvb3QiOiJmaWxlOi8vL3dvcmtzcGFjZS9hcHBmbG93L3NyYy8iLCJzb3VyY2VzIjpbInZzL3dvcmtiZW5jaC9jb250cmliL25vdGVib29rL2NvbW1vbi9ub3RlYm9va091dHB1dFJlbmRlcmVyLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOzs7Z0dBR2dHOzs7OztJQVNoRyxNQUFNLGNBQWM7UUFJbkIsWUFBWSxLQUF1QjtZQUNsQyxJQUFJLENBQUMsS0FBSyxHQUFHLElBQUksR0FBRyxDQUFDLEtBQUssQ0FBQyxDQUFDO1lBQzVCLElBQUksQ0FBQyxPQUFPLEdBQUcsSUFBSSxDQUFDLEtBQUssQ0FBQyxJQUFJLEdBQUcsQ0FBQyxDQUFDO1FBQ3BDLENBQUM7UUFFRCxtRkFBbUY7UUFDNUUsT0FBTyxDQUFDLFNBQWdDO1lBQzlDLHFFQUFxRTtZQUNyRSx5REFBeUQ7WUFDekQsT0FBTyxTQUFTLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUMsSUFBSSxDQUFDLEtBQUssQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQztRQUMvQyxDQUFDO0tBQ0Q7SUFFRCxNQUFhLDBCQUEwQjtRQWdCdEMsWUFBWSxVQVNYO1lBQ0EsSUFBSSxDQUFDLEVBQUUsR0FBRyxVQUFVLENBQUMsRUFBRSxDQUFDO1lBQ3hCLElBQUksQ0FBQyxXQUFXLEdBQUcsVUFBVSxDQUFDLFNBQVMsQ0FBQyxVQUFVLENBQUM7WUFDbkQsSUFBSSxDQUFDLGlCQUFpQixHQUFHLFVBQVUsQ0FBQyxTQUFTLENBQUMsaUJBQWlCLENBQUM7WUFDaEUsSUFBSSxDQUFDLFNBQVMsR0FBRyxVQUFVLENBQUMsU0FBUyxDQUFDLFNBQVMsQ0FBQztZQUVoRCxJQUFJLE9BQU8sVUFBVSxDQUFDLFVBQVUsS0FBSyxRQUFRLEVBQUU7Z0JBQzlDLElBQUksQ0FBQyxVQUFVLEdBQUc7b0JBQ2pCLE9BQU8sRUFBRSxTQUFT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