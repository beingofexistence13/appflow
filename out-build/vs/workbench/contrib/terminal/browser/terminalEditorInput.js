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
define(["require", "exports", "vs/nls!vs/workbench/contrib/terminal/browser/terminalEditorInput", "vs/base/common/severity", "vs/base/common/lifecycle", "vs/platform/theme/common/themeService", "vs/base/common/themables", "vs/workbench/common/editor/editorInput", "vs/workbench/contrib/terminal/browser/terminal", "vs/workbench/contrib/terminal/browser/terminalIcon", "vs/platform/instantiation/common/instantiation", "vs/platform/terminal/common/terminal", "vs/workbench/services/lifecycle/common/lifecycle", "vs/platform/contextkey/common/contextkey", "vs/platform/configuration/common/configuration", "vs/workbench/contrib/terminal/common/terminalContextKey", "vs/platform/dialogs/common/dialogs", "vs/base/common/event"], function (require, exports, nls_1, severity_1, lifecycle_1, themeService_1, themables_1, editorInput_1, terminal_1, terminalIcon_1, instantiation_1, terminal_2, lifecycle_2, contextkey_1, configuration_1, terminalContextKey_1, dialogs_1, event_1) {
    "use strict";
    var $Zib_1;
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.$Zib = void 0;
    let $Zib = class $Zib extends editorInput_1.$tA {
        static { $Zib_1 = this; }
        static { this.ID = 'workbench.editors.terminal'; }
        setGroup(group) {
            this.s = group;
        }
        get group() {
            return this.s;
        }
        get typeId() {
            return $Zib_1.ID;
        }
        get editorId() {
            return terminal_1.$Sib;
        }
        get capabilities() {
            return 2 /* EditorInputCapabilities.Readonly */ | 8 /* EditorInputCapabilities.Singleton */ | 128 /* EditorInputCapabilities.CanDropIntoEditor */;
        }
        setTerminalInstance(instance) {
            if (this.u) {
                throw new Error('cannot set instance that has already been set');
            }
            this.u = instance;
            this.G();
        }
        copy() {
            const instance = this.y.createInstance(this.n || {}, terminal_2.TerminalLocation.Editor);
            instance.focusWhenReady();
            this.n = undefined;
            return this.z.createInstance($Zib_1, instance.resource, instance);
        }
        /**
         * Sets the launch config to use for the next call to EditorInput.copy, which will be used when
         * the editor's split command is run.
         */
        setCopyLaunchConfig(launchConfig) {
            this.n = launchConfig;
        }
        /**
         * Returns the terminal instance for this input if it has not yet been detached from the input.
         */
        get terminalInstance() {
            return this.c ? undefined : this.u;
        }
        showConfirm() {
            if (this.m) {
                return false;
            }
            const confirmOnKill = this.C.getValue("terminal.integrated.confirmOnKill" /* TerminalSettingId.ConfirmOnKill */);
            if (confirmOnKill === 'editor' || confirmOnKill === 'always') {
                return this.u?.hasChildProcesses || false;
            }
            return false;
        }
        async confirm(terminals) {
            const { confirmed } = await this.F.confirm({
                type: severity_1.default.Warning,
                message: (0, nls_1.localize)(0, null),
                primaryButton: (0, nls_1.localize)(1, null),
                detail: terminals.length > 1 ?
                    terminals.map(terminal => terminal.editor.getName()).join('\n') + '\n\n' + (0, nls_1.localize)(2, null) :
                    (0, nls_1.localize)(3, null)
            });
            return confirmed ? 1 /* ConfirmResult.DONT_SAVE */ : 2 /* ConfirmResult.CANCEL */;
        }
        async revert() {
            // On revert just treat the terminal as permanently non-dirty
            this.m = true;
        }
        constructor(resource, u, w, y, z, C, D, _contextKeyService, F) {
            super();
            this.resource = resource;
            this.u = u;
            this.w = w;
            this.y = y;
            this.z = z;
            this.C = C;
            this.D = D;
            this.F = F;
            this.closeHandler = this;
            this.c = false;
            this.j = false;
            this.m = false;
            this.t = this.B(new event_1.$fd());
            this.onDidRequestAttach = this.t.event;
            this.r = terminalContextKey_1.TerminalContextKeys.editorFocus.bindTo(_contextKeyService);
            if (u) {
                this.G();
            }
        }
        G() {
            const instance = this.u;
            if (!instance) {
                return;
            }
            const instanceOnDidFocusListener = instance.onDidFocus(() => this.r.set(true));
            const instanceOnDidBlurListener = instance.onDidBlur(() => this.r.reset());
            this.B((0, lifecycle_1.$ic)(() => {
                if (!this.c && !this.j) {
                    // Will be ignored if triggered by onExit or onDisposed terminal events
                    // as disposed was already called
                    instance.dispose(terminal_2.TerminalExitReason.User);
                }
                (0, lifecycle_1.$fc)([instanceOnDidFocusListener, instanceOnDidBlurListener]);
            }));
            const disposeListeners = [
                instance.onExit((e) => {
                    if (!instance.waitOnExit) {
                        this.dispose();
                    }
                }),
                instance.onDisposed(() => this.dispose()),
                instance.onTitleChanged(() => this.b.fire()),
                instance.onIconChanged(() => this.b.fire()),
                instanceOnDidFocusListener,
                instanceOnDidBlurListener,
                instance.statusList.onDidChangePrimaryStatus(() => this.b.fire())
            ];
            // Don't dispose editor when instance is torn down on shutdown to avoid extra work and so
            // the editor/tabs don't disappear
            this.D.onWillShutdown((e) => {
                this.j = true;
                (0, lifecycle_1.$fc)(disposeListeners);
                // Don't touch processes if the shutdown was a result of reload as they will be reattached
                const shouldPersistTerminals = this.C.getValue("terminal.integrated.enablePersistentSessions" /* TerminalSettingId.EnablePersistentSessions */) && e.reason === 3 /* ShutdownReason.RELOAD */;
                if (shouldPersistTerminals) {
                    instance.detachProcessAndDispose(terminal_2.TerminalExitReason.Shutdown);
                }
                else {
                    instance.dispose(terminal_2.TerminalExitReason.Shutdown);
                }
            });
        }
        getName() {
            return this.u?.title || this.resource.fragment;
        }
        getLabelExtraClasses() {
            if (!this.u) {
                return [];
            }
            const extraClasses = ['terminal-tab'];
            const colorClass = (0, terminalIcon_1.$Tib)(this.u);
            if (colorClass) {
                extraClasses.push(colorClass);
            }
            const uriClasses = (0, terminalIcon_1.$Xib)(this.u, this.w.getColorTheme().type);
            if (uriClasses) {
                extraClasses.push(...uriClasses);
            }
            if (themables_1.ThemeIcon.isThemeIcon(this.u.icon)) {
                extraClasses.push(`codicon-${this.u.icon.id}`);
            }
            return extraClasses;
        }
        /**
         * Detach the instance from the input such that when the input is disposed it will not dispose
         * of the terminal instance/process.
         */
        detachInstance() {
            if (!this.j) {
                this.u?.detachFromElement();
                this.c = true;
            }
        }
        getDescription() {
            return this.u?.description;
        }
        toUntyped() {
            return {
                resource: this.resource,
                options: {
                    override: terminal_1.$Sib,
                    pinned: true,
                    forceReload: true
                }
            };
        }
    };
    exports.$Zib = $Zib;
    exports.$Zib = $Zib = $Zib_1 = __decorate([
        __param(2, themeService_1.$gv),
        __param(3, terminal_1.$Pib),
        __param(4, instantiation_1.$Ah),
        __param(5, configuration_1.$8h),
        __param(6, lifecycle_2.$7y),
        __param(7, contextkey_1.$3i),
        __param(8, dialogs_1.$oA)
    ], $Zib);
});
//# sourceMappingURL=terminalEditorInput.js.map