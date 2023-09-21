/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/base/common/glob", "vs/base/common/iterator", "vs/base/common/resources"], function (require, exports, glob, iterator_1, resources_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.$rEb = exports.$qEb = void 0;
    class DependencyList {
        constructor(value) {
            this.a = new Set(value);
            this.defined = this.a.size > 0;
        }
        /** Gets whether any of the 'available' dependencies match the ones in this list */
        matches(available) {
            // For now this is simple, but this may expand to support globs later
            // @see https://github.com/microsoft/vscode/issues/119899
            return available.some(v => this.a.has(v));
        }
    }
    class $qEb {
        constructor(descriptor) {
            this.id = descriptor.id;
            this.extensionId = descriptor.extension.identifier;
            this.extensionLocation = descriptor.extension.extensionLocation;
            this.isBuiltin = descriptor.extension.isBuiltin;
            if (typeof descriptor.entrypoint === 'string') {
                this.entrypoint = {
                    extends: undefined,
                    path: (0, resources_1.$ig)(this.extensionLocation, descriptor.entrypoint)
                };
            }
            else {
                this.entrypoint = {
                    extends: descriptor.entrypoint.extends,
                    path: (0, resources_1.$ig)(this.extensionLocation, descriptor.entrypoint.path)
                };
            }
            this.displayName = descriptor.displayName;
            this.mimeTypes = descriptor.mimeTypes;
            this.a = this.mimeTypes.map(pattern => glob.$rj(pattern));
            this.hardDependencies = new DependencyList(descriptor.dependencies ?? iterator_1.Iterable.empty());
            this.optionalDependencies = new DependencyList(descriptor.optionalDependencies ?? iterator_1.Iterable.empty());
            this.messaging = descriptor.requiresMessaging ?? "never" /* RendererMessagingSpec.Never */;
        }
        matchesWithoutKernel(mimeType) {
            if (!this.b(mimeType)) {
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
            if (!this.b(mimeType)) {
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
        b(mimeType) {
            if (this.entrypoint.extends) { // We're extending another renderer
                return false;
            }
            return this.a.some(pattern => pattern(mimeType)) || this.mimeTypes.some(pattern => pattern === mimeType);
        }
    }
    exports.$qEb = $qEb;
    class $rEb {
        constructor(descriptor) {
            this.type = descriptor.type;
            this.entrypoint = (0, resources_1.$ig)(descriptor.extension.extensionLocation, descriptor.entrypoint);
            this.extensionLocation = descriptor.extension.extensionLocation;
            this.localResourceRoots = descriptor.localResourceRoots.map(root => (0, resources_1.$ig)(descriptor.extension.extensionLocation, root));
        }
    }
    exports.$rEb = $rEb;
});
//# sourceMappingURL=notebookOutputRenderer.js.map