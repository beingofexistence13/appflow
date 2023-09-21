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
define(["require", "exports", "vs/base/common/lifecycle", "vs/workbench/services/filesConfiguration/common/filesConfigurationService", "vs/workbench/services/host/browser/host", "vs/workbench/services/editor/common/editorService", "vs/workbench/services/editor/common/editorGroupsService", "vs/workbench/services/workingCopy/common/workingCopyService", "vs/platform/log/common/log"], function (require, exports, lifecycle_1, filesConfigurationService_1, host_1, editorService_1, editorGroupsService_1, workingCopyService_1, log_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.$rxb = void 0;
    let $rxb = class $rxb extends lifecycle_1.$kc {
        constructor(h, j, m, n, r, s) {
            super();
            this.h = h;
            this.j = j;
            this.m = m;
            this.n = n;
            this.r = r;
            this.s = s;
            this.b = new Map();
            // Auto save: focus change & window change
            this.c = undefined;
            this.f = undefined;
            this.g = this.B(new lifecycle_1.$jc());
            // Figure out initial auto save config
            this.z(h.getAutoSaveConfiguration(), false);
            // Fill in initial dirty working copies
            for (const dirtyWorkingCopy of this.r.dirtyWorkingCopies) {
                this.D(dirtyWorkingCopy);
            }
            this.t();
        }
        t() {
            this.B(this.j.onDidChangeFocus(focused => this.u(focused)));
            this.B(this.m.onDidActiveEditorChange(() => this.w()));
            this.B(this.h.onAutoSaveConfigurationChange(config => this.z(config, true)));
            // Working Copy events
            this.B(this.r.onDidRegister(workingCopy => this.D(workingCopy)));
            this.B(this.r.onDidUnregister(workingCopy => this.F(workingCopy)));
            this.B(this.r.onDidChangeDirty(workingCopy => this.G(workingCopy)));
            this.B(this.r.onDidChangeContent(workingCopy => this.H(workingCopy)));
        }
        u(focused) {
            if (!focused) {
                this.y(4 /* SaveReason.WINDOW_CHANGE */);
            }
        }
        w() {
            // Treat editor change like a focus change for our last active editor if any
            if (this.c && typeof this.f === 'number') {
                this.y(3 /* SaveReason.FOCUS_CHANGE */, { groupId: this.f, editor: this.c });
            }
            // Remember as last active
            const activeGroup = this.n.activeGroup;
            const activeEditor = this.c = activeGroup.activeEditor ?? undefined;
            this.f = activeGroup.id;
            // Dispose previous active control listeners
            this.g.clear();
            // Listen to focus changes on control for auto save
            const activeEditorPane = this.m.activeEditorPane;
            if (activeEditor && activeEditorPane) {
                this.g.add(activeEditorPane.onDidBlur(() => {
                    this.y(3 /* SaveReason.FOCUS_CHANGE */, { groupId: activeGroup.id, editor: activeEditor });
                }));
            }
        }
        y(reason, editorIdentifier) {
            if (editorIdentifier?.editor.isReadonly() || editorIdentifier?.editor.hasCapability(4 /* EditorInputCapabilities.Untitled */)) {
                return; // no auto save for readonly or untitled editors
            }
            // Determine if we need to save all. In case of a window focus change we also save if
            // auto save mode is configured to be ON_FOCUS_CHANGE (editor focus change)
            const mode = this.h.getAutoSaveMode();
            if ((reason === 4 /* SaveReason.WINDOW_CHANGE */ && (mode === 3 /* AutoSaveMode.ON_FOCUS_CHANGE */ || mode === 4 /* AutoSaveMode.ON_WINDOW_CHANGE */)) ||
                (reason === 3 /* SaveReason.FOCUS_CHANGE */ && mode === 3 /* AutoSaveMode.ON_FOCUS_CHANGE */)) {
                this.s.trace(`[editor auto save] triggering auto save with reason ${reason}`);
                if (editorIdentifier) {
                    this.m.save(editorIdentifier, { reason });
                }
                else {
                    this.C({ reason });
                }
            }
        }
        z(config, fromEvent) {
            // Update auto save after delay config
            this.a = (typeof config.autoSaveDelay === 'number') && config.autoSaveDelay >= 0 ? config.autoSaveDelay : undefined;
            // Trigger a save-all when auto save is enabled
            if (fromEvent) {
                let reason = undefined;
                switch (this.h.getAutoSaveMode()) {
                    case 3 /* AutoSaveMode.ON_FOCUS_CHANGE */:
                        reason = 3 /* SaveReason.FOCUS_CHANGE */;
                        break;
                    case 4 /* AutoSaveMode.ON_WINDOW_CHANGE */:
                        reason = 4 /* SaveReason.WINDOW_CHANGE */;
                        break;
                    case 1 /* AutoSaveMode.AFTER_SHORT_DELAY */:
                    case 2 /* AutoSaveMode.AFTER_LONG_DELAY */:
                        reason = 2 /* SaveReason.AUTO */;
                        break;
                }
                if (reason) {
                    this.C({ reason });
                }
            }
        }
        C(options) {
            for (const workingCopy of this.r.dirtyWorkingCopies) {
                if (!(workingCopy.capabilities & 2 /* WorkingCopyCapabilities.Untitled */)) {
                    workingCopy.save(options);
                }
            }
        }
        D(workingCopy) {
            if (workingCopy.isDirty()) {
                this.I(workingCopy);
            }
        }
        F(workingCopy) {
            this.J(workingCopy);
        }
        G(workingCopy) {
            if (workingCopy.isDirty()) {
                this.I(workingCopy);
            }
            else {
                this.J(workingCopy);
            }
        }
        H(workingCopy) {
            if (workingCopy.isDirty()) {
                // this listener will make sure that the auto save is
                // pushed out for as long as the user is still changing
                // the content of the working copy.
                this.I(workingCopy);
            }
        }
        I(workingCopy) {
            if (typeof this.a !== 'number') {
                return; // auto save after delay must be enabled
            }
            if (workingCopy.capabilities & 2 /* WorkingCopyCapabilities.Untitled */) {
                return; // we never auto save untitled working copies
            }
            // Clear any running auto save operation
            this.J(workingCopy);
            this.s.trace(`[editor auto save] scheduling auto save after ${this.a}ms`, workingCopy.resource.toString(), workingCopy.typeId);
            // Schedule new auto save
            const handle = setTimeout(() => {
                // Clear disposable
                this.J(workingCopy);
                // Save if dirty
                if (workingCopy.isDirty()) {
                    this.s.trace(`[editor auto save] running auto save`, workingCopy.resource.toString(), workingCopy.typeId);
                    workingCopy.save({ reason: 2 /* SaveReason.AUTO */ });
                }
            }, this.a);
            // Keep in map for disposal as needed
            this.b.set(workingCopy, (0, lifecycle_1.$ic)(() => {
                this.s.trace(`[editor auto save] clearing pending auto save`, workingCopy.resource.toString(), workingCopy.typeId);
                clearTimeout(handle);
            }));
        }
        J(workingCopy) {
            (0, lifecycle_1.$fc)(this.b.get(workingCopy));
            this.b.delete(workingCopy);
        }
    };
    exports.$rxb = $rxb;
    exports.$rxb = $rxb = __decorate([
        __param(0, filesConfigurationService_1.$yD),
        __param(1, host_1.$VT),
        __param(2, editorService_1.$9C),
        __param(3, editorGroupsService_1.$5C),
        __param(4, workingCopyService_1.$TC),
        __param(5, log_1.$5i)
    ], $rxb);
});
//# sourceMappingURL=editorAutoSave.js.map