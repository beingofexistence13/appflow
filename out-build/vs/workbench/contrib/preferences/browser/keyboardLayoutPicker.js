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
define(["require", "exports", "vs/nls!vs/workbench/contrib/preferences/browser/keyboardLayoutPicker", "vs/workbench/services/statusbar/browser/statusbar", "vs/base/common/lifecycle", "vs/platform/keyboardLayout/common/keyboardLayout", "vs/platform/registry/common/platform", "vs/workbench/common/contributions", "vs/workbench/contrib/preferences/common/preferences", "vs/base/common/platform", "vs/platform/quickinput/common/quickInput", "vs/platform/actions/common/actions", "vs/platform/configuration/common/configuration", "vs/platform/environment/common/environment", "vs/platform/files/common/files", "vs/workbench/services/editor/common/editorService", "vs/base/common/buffer"], function (require, exports, nls, statusbar_1, lifecycle_1, keyboardLayout_1, platform_1, contributions_1, preferences_1, platform_2, quickInput_1, actions_1, configuration_1, environment_1, files_1, editorService_1, buffer_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.$Z4b = void 0;
    let $Z4b = class $Z4b extends lifecycle_1.$kc {
        constructor(f, g) {
            super();
            this.f = f;
            this.g = g;
            this.c = this.B(new lifecycle_1.$lc());
            const name = nls.localize(0, null);
            const layout = this.f.getCurrentKeyboardLayout();
            if (layout) {
                const layoutInfo = (0, keyboardLayout_1.$Vyb)(layout);
                const text = nls.localize(1, null, layoutInfo.label);
                this.c.value = this.g.addEntry({
                    name,
                    text,
                    ariaLabel: text,
                    command: preferences_1.$RCb
                }, 'status.workbench.keyboardLayout', 1 /* StatusbarAlignment.RIGHT */);
            }
            this.B(this.f.onDidChangeKeyboardLayout(() => {
                const layout = this.f.getCurrentKeyboardLayout();
                const layoutInfo = (0, keyboardLayout_1.$Vyb)(layout);
                if (this.c.value) {
                    const text = nls.localize(2, null, layoutInfo.label);
                    this.c.value.update({
                        name,
                        text,
                        ariaLabel: text,
                        command: preferences_1.$RCb
                    });
                }
                else {
                    const text = nls.localize(3, null, layoutInfo.label);
                    this.c.value = this.g.addEntry({
                        name,
                        text,
                        ariaLabel: text,
                        command: preferences_1.$RCb
                    }, 'status.workbench.keyboardLayout', 1 /* StatusbarAlignment.RIGHT */);
                }
            }));
        }
    };
    exports.$Z4b = $Z4b;
    exports.$Z4b = $Z4b = __decorate([
        __param(0, keyboardLayout_1.$Tyb),
        __param(1, statusbar_1.$6$)
    ], $Z4b);
    const workbenchContributionsRegistry = platform_1.$8m.as(contributions_1.Extensions.Workbench);
    workbenchContributionsRegistry.registerWorkbenchContribution($Z4b, 1 /* LifecyclePhase.Starting */);
    const DEFAULT_CONTENT = [
        `// ${nls.localize(4, null)}`,
        `// ${nls.localize(5, null)}`,
        ``,
        `// Once you have the keyboard layout info, please paste it below.`,
        '\n'
    ].join('\n');
    (0, actions_1.$Xu)(class extends actions_1.$Wu {
        constructor() {
            super({
                id: preferences_1.$RCb,
                title: { value: nls.localize(6, null), original: 'Change Keyboard Layout' },
                f1: true
            });
        }
        async run(accessor) {
            const keyboardLayoutService = accessor.get(keyboardLayout_1.$Tyb);
            const quickInputService = accessor.get(quickInput_1.$Gq);
            const configurationService = accessor.get(configuration_1.$8h);
            const environmentService = accessor.get(environment_1.$Ih);
            const editorService = accessor.get(editorService_1.$9C);
            const fileService = accessor.get(files_1.$6j);
            const layouts = keyboardLayoutService.getAllKeyboardLayouts();
            const currentLayout = keyboardLayoutService.getCurrentKeyboardLayout();
            const layoutConfig = configurationService.getValue('keyboard.layout');
            const isAutoDetect = layoutConfig === 'autodetect';
            const picks = layouts.map(layout => {
                const picked = !isAutoDetect && (0, keyboardLayout_1.$Uyb)(currentLayout, layout);
                const layoutInfo = (0, keyboardLayout_1.$Vyb)(layout);
                return {
                    layout: layout,
                    label: [layoutInfo.label, (layout && layout.isUserKeyboardLayout) ? '(User configured layout)' : ''].join(' '),
                    id: layout.text || layout.lang || layout.layout,
                    description: layoutInfo.description + (picked ? ' (Current layout)' : ''),
                    picked: !isAutoDetect && (0, keyboardLayout_1.$Uyb)(currentLayout, layout)
                };
            }).sort((a, b) => {
                return a.label < b.label ? -1 : (a.label > b.label ? 1 : 0);
            });
            if (picks.length > 0) {
                const platform = platform_2.$j ? 'Mac' : platform_2.$i ? 'Win' : 'Linux';
                picks.unshift({ type: 'separator', label: nls.localize(7, null, platform) });
            }
            const configureKeyboardLayout = { label: nls.localize(8, null) };
            picks.unshift(configureKeyboardLayout);
            // Offer to "Auto Detect"
            const autoDetectMode = {
                label: nls.localize(9, null),
                description: isAutoDetect ? `Current: ${(0, keyboardLayout_1.$Vyb)(currentLayout).label}` : undefined,
                picked: isAutoDetect ? true : undefined
            };
            picks.unshift(autoDetectMode);
            const pick = await quickInputService.pick(picks, { placeHolder: nls.localize(10, null), matchOnDescription: true });
            if (!pick) {
                return;
            }
            if (pick === autoDetectMode) {
                // set keymap service to auto mode
                configurationService.updateValue('keyboard.layout', 'autodetect');
                return;
            }
            if (pick === configureKeyboardLayout) {
                const file = environmentService.keyboardLayoutResource;
                await fileService.stat(file).then(undefined, () => {
                    return fileService.createFile(file, buffer_1.$Fd.fromString(DEFAULT_CONTENT));
                }).then((stat) => {
                    if (!stat) {
                        return undefined;
                    }
                    return editorService.openEditor({
                        resource: stat.resource,
                        languageId: 'jsonc',
                        options: { pinned: true }
                    });
                }, (error) => {
                    throw new Error(nls.localize(11, null, file.toString(), error));
                });
                return Promise.resolve();
            }
            configurationService.updateValue('keyboard.layout', (0, keyboardLayout_1.$Wyb)(pick.layout));
        }
    });
});
//# sourceMappingURL=keyboardLayoutPicker.js.map