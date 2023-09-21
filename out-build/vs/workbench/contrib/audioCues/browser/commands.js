/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/base/common/codicons", "vs/base/common/themables", "vs/nls!vs/workbench/contrib/audioCues/browser/commands", "vs/platform/accessibility/common/accessibility", "vs/platform/actions/common/actions", "vs/platform/audioCues/browser/audioCueService", "vs/platform/quickinput/common/quickInput", "vs/workbench/services/preferences/common/preferences"], function (require, exports, codicons_1, themables_1, nls_1, accessibility_1, actions_1, audioCueService_1, quickInput_1, preferences_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.$P1b = void 0;
    class $P1b extends actions_1.$Wu {
        static { this.ID = 'audioCues.help'; }
        constructor() {
            super({
                id: $P1b.ID,
                title: {
                    value: (0, nls_1.localize)(0, null),
                    original: 'Help: List Audio Cues'
                },
                f1: true,
            });
        }
        async run(accessor) {
            const audioCueService = accessor.get(audioCueService_1.$sZ);
            const quickPickService = accessor.get(quickInput_1.$Gq);
            const preferencesService = accessor.get(preferences_1.$BE);
            const accessibilityService = accessor.get(accessibility_1.$1r);
            const items = audioCueService_1.$wZ.allAudioCues.map((cue, idx) => ({
                label: accessibilityService.isScreenReaderOptimized() ?
                    `${cue.name}${audioCueService.isEnabled(cue) ? '' : ' (' + (0, nls_1.localize)(1, null) + ')'}`
                    : `${audioCueService.isEnabled(cue) ? '$(check)' : '     '} ${cue.name}`,
                audioCue: cue,
                buttons: [{
                        iconClass: themables_1.ThemeIcon.asClassName(codicons_1.$Pj.settingsGear),
                        tooltip: (0, nls_1.localize)(2, null),
                    }],
            }));
            const quickPick = quickPickService.pick(items, {
                activeItem: items[0],
                onDidFocus: (item) => {
                    audioCueService.playSound(item.audioCue.sound.getSound(true), true);
                },
                onDidTriggerItemButton: (context) => {
                    preferencesService.openSettings({ query: context.item.audioCue.settingsKey });
                },
                placeHolder: (0, nls_1.localize)(3, null),
            });
            await quickPick;
        }
    }
    exports.$P1b = $P1b;
});
//# sourceMappingURL=commands.js.map