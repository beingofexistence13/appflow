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
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
define(["require", "exports", "vs/nls!vs/workbench/services/workingCopy/common/fileWorkingCopyManager", "vs/base/common/event", "vs/base/common/async", "vs/base/common/cancellation", "vs/base/common/lifecycle", "vs/base/common/resources", "vs/base/common/uri", "vs/platform/dialogs/common/dialogs", "vs/platform/files/common/files", "vs/workbench/common/editor", "vs/workbench/services/environment/common/environmentService", "vs/workbench/services/path/common/pathService", "vs/platform/uriIdentity/common/uriIdentity", "vs/workbench/services/workingCopy/common/storedFileWorkingCopyManager", "vs/workbench/services/workingCopy/common/untitledFileWorkingCopy", "vs/workbench/services/workingCopy/common/untitledFileWorkingCopyManager", "vs/workbench/services/workingCopy/common/workingCopyFileService", "vs/platform/label/common/label", "vs/platform/log/common/log", "vs/platform/notification/common/notification", "vs/workbench/services/editor/common/editorService", "vs/workbench/services/files/common/elevatedFileService", "vs/workbench/services/filesConfiguration/common/filesConfigurationService", "vs/workbench/services/lifecycle/common/lifecycle", "vs/workbench/services/workingCopy/common/workingCopyBackup", "vs/workbench/services/workingCopy/common/workingCopyEditorService", "vs/workbench/services/workingCopy/common/workingCopyService", "vs/base/common/network", "vs/workbench/services/decorations/common/decorations", "vs/base/common/codicons", "vs/platform/theme/common/colorRegistry"], function (require, exports, nls_1, event_1, async_1, cancellation_1, lifecycle_1, resources_1, uri_1, dialogs_1, files_1, editor_1, environmentService_1, pathService_1, uriIdentity_1, storedFileWorkingCopyManager_1, untitledFileWorkingCopy_1, untitledFileWorkingCopyManager_1, workingCopyFileService_1, label_1, log_1, notification_1, editorService_1, elevatedFileService_1, filesConfigurationService_1, lifecycle_2, workingCopyBackup_1, workingCopyEditorService_1, workingCopyService_1, network_1, decorations_1, codicons_1, colorRegistry_1) {
    "use strict";
    var $$rb_1;
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.$$rb = void 0;
    let $$rb = class $$rb extends lifecycle_1.$kc {
        static { $$rb_1 = this; }
        static { this.a = editor_1.$SE.registerSource('fileWorkingCopyCreate.source', (0, nls_1.localize)(0, null)); }
        static { this.b = editor_1.$SE.registerSource('fileWorkingCopyReplace.source', (0, nls_1.localize)(1, null)); }
        constructor(c, f, g, h, lifecycleService, labelService, j, m, workingCopyBackupService, n, r, filesConfigurationService, workingCopyService, notificationService, workingCopyEditorService, editorService, elevatedFileService, s, t, u, w) {
            super();
            this.c = c;
            this.f = f;
            this.g = g;
            this.h = h;
            this.j = j;
            this.m = m;
            this.n = n;
            this.r = r;
            this.s = s;
            this.t = t;
            this.u = u;
            this.w = w;
            // Stored file working copies manager
            this.stored = this.B(new storedFileWorkingCopyManager_1.$8rb(this.c, this.f, h, lifecycleService, labelService, j, m, workingCopyBackupService, n, filesConfigurationService, workingCopyService, notificationService, workingCopyEditorService, editorService, elevatedFileService));
            // Untitled file working copies manager
            this.untitled = this.B(new untitledFileWorkingCopyManager_1.$0rb(this.c, this.g, async (workingCopy, options) => {
                const result = await this.saveAs(workingCopy.resource, undefined, options);
                return result ? true : false;
            }, h, labelService, j, workingCopyBackupService, workingCopyService));
            // Events
            this.onDidCreate = event_1.Event.any(this.stored.onDidCreate, this.untitled.onDidCreate);
            // Decorations
            this.y();
        }
        //#region decorations
        y() {
            // File working copy decorations
            const provider = this.B(new class extends lifecycle_1.$kc {
                constructor(b) {
                    super();
                    this.b = b;
                    this.label = (0, nls_1.localize)(2, null);
                    this.a = this.B(new event_1.$fd());
                    this.onDidChange = this.a.event;
                    this.c();
                }
                c() {
                    // Creates
                    this.B(this.b.onDidResolve(workingCopy => {
                        if (workingCopy.isReadonly() || workingCopy.hasState(4 /* StoredFileWorkingCopyState.ORPHAN */)) {
                            this.a.fire([workingCopy.resource]);
                        }
                    }));
                    // Removals: once a stored working copy is no longer
                    // under our control, make sure to signal this as
                    // decoration change because from this point on we
                    // have no way of updating the decoration anymore.
                    this.B(this.b.onDidRemove(workingCopyUri => this.a.fire([workingCopyUri])));
                    // Changes
                    this.B(this.b.onDidChangeReadonly(workingCopy => this.a.fire([workingCopy.resource])));
                    this.B(this.b.onDidChangeOrphaned(workingCopy => this.a.fire([workingCopy.resource])));
                }
                provideDecorations(uri) {
                    const workingCopy = this.b.get(uri);
                    if (!workingCopy || workingCopy.isDisposed()) {
                        return undefined;
                    }
                    const isReadonly = workingCopy.isReadonly();
                    const isOrphaned = workingCopy.hasState(4 /* StoredFileWorkingCopyState.ORPHAN */);
                    // Readonly + Orphaned
                    if (isReadonly && isOrphaned) {
                        return {
                            color: colorRegistry_1.$Mx,
                            letter: codicons_1.$Pj.lockSmall,
                            strikethrough: true,
                            tooltip: (0, nls_1.localize)(3, null),
                        };
                    }
                    // Readonly
                    else if (isReadonly) {
                        return {
                            letter: codicons_1.$Pj.lockSmall,
                            tooltip: (0, nls_1.localize)(4, null),
                        };
                    }
                    // Orphaned
                    else if (isOrphaned) {
                        return {
                            color: colorRegistry_1.$Mx,
                            strikethrough: true,
                            tooltip: (0, nls_1.localize)(5, null),
                        };
                    }
                    return undefined;
                }
            }(this.stored));
            this.B(this.w.registerDecorationsProvider(provider));
        }
        //#endregin
        //#region get / get all
        get workingCopies() {
            return [...this.stored.workingCopies, ...this.untitled.workingCopies];
        }
        get(resource) {
            return this.stored.get(resource) ?? this.untitled.get(resource);
        }
        resolve(arg1, arg2) {
            if (uri_1.URI.isUri(arg1)) {
                // Untitled: via untitled manager
                if (arg1.scheme === network_1.Schemas.untitled) {
                    return this.untitled.resolve({ untitledResource: arg1 });
                }
                // else: via stored file manager
                else {
                    return this.stored.resolve(arg1, arg2);
                }
            }
            return this.untitled.resolve(arg1);
        }
        //#endregion
        //#region Save
        async saveAs(source, target, options) {
            // Get to target resource
            if (!target) {
                const workingCopy = this.get(source);
                if (workingCopy instanceof untitledFileWorkingCopy_1.$9rb && workingCopy.hasAssociatedFilePath) {
                    target = await this.G(source);
                }
                else {
                    target = await this.r.pickFileToSave(await this.G(options?.suggestedTarget ?? source), options?.availableFileSystems);
                }
            }
            if (!target) {
                return; // user canceled
            }
            // Just save if target is same as working copies own resource
            // and we are not saving an untitled file working copy
            if (this.h.hasProvider(source) && (0, resources_1.$bg)(source, target)) {
                return this.z(source, { ...options, force: true /* force to save, even if not dirty (https://github.com/microsoft/vscode/issues/99619) */ });
            }
            // If the target is different but of same identity, we
            // move the source to the target, knowing that the
            // underlying file system cannot have both and then save.
            // However, this will only work if the source exists
            // and is not orphaned, so we need to check that too.
            if (this.h.hasProvider(source) && this.n.extUri.isEqual(source, target) && (await this.h.exists(source))) {
                // Move via working copy file service to enable participants
                await this.m.move([{ file: { source, target } }], cancellation_1.CancellationToken.None);
                // At this point we don't know whether we have a
                // working copy for the source or the target URI so we
                // simply try to save with both resources.
                return (await this.z(source, options)) ?? (await this.z(target, options));
            }
            // Perform normal "Save As"
            return this.C(source, target, options);
        }
        async z(resource, options) {
            // Save is only possible with stored file working copies,
            // any other have to go via `saveAs` flow.
            const storedFileWorkingCopy = this.stored.get(resource);
            if (storedFileWorkingCopy) {
                const success = await storedFileWorkingCopy.save(options);
                if (success) {
                    return storedFileWorkingCopy;
                }
            }
            return undefined;
        }
        async C(source, target, options) {
            let sourceContents;
            // If the source is an existing file working copy, we can directly
            // use that to copy the contents to the target destination
            const sourceWorkingCopy = this.get(source);
            if (sourceWorkingCopy?.isResolved()) {
                sourceContents = await sourceWorkingCopy.model.snapshot(cancellation_1.CancellationToken.None);
            }
            // Otherwise we resolve the contents from the underlying file
            else {
                sourceContents = (await this.h.readFileStream(source)).value;
            }
            // Resolve target
            const { targetFileExists, targetStoredFileWorkingCopy } = await this.D(source, target);
            // Confirm to overwrite if we have an untitled file working copy with associated path where
            // the file actually exists on disk and we are instructed to save to that file path.
            // This can happen if the file was created after the untitled file was opened.
            // See https://github.com/microsoft/vscode/issues/67946
            if (sourceWorkingCopy instanceof untitledFileWorkingCopy_1.$9rb &&
                sourceWorkingCopy.hasAssociatedFilePath &&
                targetFileExists &&
                this.n.extUri.isEqual(target, (0, resources_1.$sg)(sourceWorkingCopy.resource, this.t.remoteAuthority, this.s.defaultUriScheme))) {
                const overwrite = await this.F(target);
                if (!overwrite) {
                    return undefined;
                }
            }
            // Take over content from source to target
            await targetStoredFileWorkingCopy.model?.update(sourceContents, cancellation_1.CancellationToken.None);
            // Set source options depending on target exists or not
            if (!options?.source) {
                options = {
                    ...options,
                    source: targetFileExists ? $$rb_1.b : $$rb_1.a
                };
            }
            // Save target
            const success = await targetStoredFileWorkingCopy.save({ ...options, force: true /* force to save, even if not dirty (https://github.com/microsoft/vscode/issues/99619) */ });
            if (!success) {
                return undefined;
            }
            // Revert the source
            try {
                await sourceWorkingCopy?.revert();
            }
            catch (error) {
                // It is possible that reverting the source fails, for example
                // when a remote is disconnected and we cannot read it anymore.
                // However, this should not interrupt the "Save As" flow, so
                // we gracefully catch the error and just log it.
                this.j.error(error);
            }
            return targetStoredFileWorkingCopy;
        }
        async D(source, target) {
            // Prefer an existing stored file working copy if it is already resolved
            // for the given target resource
            let targetFileExists = false;
            let targetStoredFileWorkingCopy = this.stored.get(target);
            if (targetStoredFileWorkingCopy?.isResolved()) {
                targetFileExists = true;
            }
            // Otherwise create the target working copy empty if
            // it does not exist already and resolve it from there
            else {
                targetFileExists = await this.h.exists(target);
                // Create target file adhoc if it does not exist yet
                if (!targetFileExists) {
                    await this.m.create([{ resource: target }], cancellation_1.CancellationToken.None);
                }
                // At this point we need to resolve the target working copy
                // and we have to do an explicit check if the source URI
                // equals the target via URI identity. If they match and we
                // have had an existing working copy with the source, we
                // prefer that one over resolving the target. Otherwise we
                // would potentially introduce a
                if (this.n.extUri.isEqual(source, target) && this.get(source)) {
                    targetStoredFileWorkingCopy = await this.stored.resolve(source);
                }
                else {
                    targetStoredFileWorkingCopy = await this.stored.resolve(target);
                }
            }
            return { targetFileExists, targetStoredFileWorkingCopy };
        }
        async F(resource) {
            const { confirmed } = await this.u.confirm({
                type: 'warning',
                message: (0, nls_1.localize)(6, null, (0, resources_1.$fg)(resource)),
                detail: (0, nls_1.localize)(7, null, (0, resources_1.$fg)(resource), (0, resources_1.$fg)((0, resources_1.$hg)(resource))),
                primaryButton: (0, nls_1.localize)(8, null)
            });
            return confirmed;
        }
        async G(resource) {
            // 1.) Just take the resource as is if the file service can handle it
            if (this.h.hasProvider(resource)) {
                return resource;
            }
            // 2.) Pick the associated file path for untitled working copies if any
            const workingCopy = this.get(resource);
            if (workingCopy instanceof untitledFileWorkingCopy_1.$9rb && workingCopy.hasAssociatedFilePath) {
                return (0, resources_1.$sg)(resource, this.t.remoteAuthority, this.s.defaultUriScheme);
            }
            const defaultFilePath = await this.r.defaultFilePath();
            // 3.) Pick the working copy name if valid joined with default path
            if (workingCopy) {
                const candidatePath = (0, resources_1.$ig)(defaultFilePath, workingCopy.name);
                if (await this.s.hasValidBasename(candidatePath, workingCopy.name)) {
                    return candidatePath;
                }
            }
            // 4.) Finally fallback to the name of the resource joined with default path
            return (0, resources_1.$ig)(defaultFilePath, (0, resources_1.$fg)(resource));
        }
        //#endregion
        //#region Lifecycle
        async destroy() {
            await async_1.Promises.settled([
                this.stored.destroy(),
                this.untitled.destroy()
            ]);
        }
    };
    exports.$$rb = $$rb;
    exports.$$rb = $$rb = $$rb_1 = __decorate([
        __param(3, files_1.$6j),
        __param(4, lifecycle_2.$7y),
        __param(5, label_1.$Vz),
        __param(6, log_1.$5i),
        __param(7, workingCopyFileService_1.$HD),
        __param(8, workingCopyBackup_1.$EA),
        __param(9, uriIdentity_1.$Ck),
        __param(10, dialogs_1.$qA),
        __param(11, filesConfigurationService_1.$yD),
        __param(12, workingCopyService_1.$TC),
        __param(13, notification_1.$Yu),
        __param(14, workingCopyEditorService_1.$AD),
        __param(15, editorService_1.$9C),
        __param(16, elevatedFileService_1.$CD),
        __param(17, pathService_1.$yJ),
        __param(18, environmentService_1.$hJ),
        __param(19, dialogs_1.$oA),
        __param(20, decorations_1.$Gcb)
    ], $$rb);
});
//# sourceMappingURL=fileWorkingCopyManager.js.map