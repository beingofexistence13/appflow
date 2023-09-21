/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/base/common/codicons", "vs/base/common/themables", "vs/nls", "vs/platform/accessibility/common/accessibility", "vs/platform/actions/common/actions", "vs/platform/audioCues/browser/audioCueService", "vs/platform/quickinput/common/quickInput", "vs/workbench/services/preferences/common/preferences"], function (require, exports, codicons_1, themables_1, nls_1, accessibility_1, actions_1, audioCueService_1, quickInput_1, preferences_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.ShowAudioCueHelp = void 0;
    class ShowAudioCueHelp extends actions_1.Action2 {
        static { this.ID = 'audioCues.help'; }
        constructor() {
            super({
                id: ShowAudioCueHelp.ID,
                title: {
                    value: (0, nls_1.localize)('audioCues.help', "Help: List Audio Cues"),
                    original: 'Help: List Audio Cues'
                },
                f1: true,
            });
        }
        async run(accessor) {
            const audioCueService = accessor.get(audioCueService_1.IAudioCueService);
            const quickPickService = accessor.get(quickInput_1.IQuickInputService);
            const preferencesService = accessor.get(preferences_1.IPreferencesService);
            const accessibilityService = accessor.get(accessibility_1.IAccessibilityService);
            const items = audioCueService_1.AudioCue.allAudioCues.map((cue, idx) => ({
                label: accessibilityService.isScreenReaderOptimized() ?
                    `${cue.name}${audioCueService.isEnabled(cue) ? '' : ' (' + (0, nls_1.localize)('disabled', "Disabled") + ')'}`
                    : `${audioCueService.isEnabled(cue) ? '$(check)' : '     '} ${cue.name}`,
                audioCue: cue,
                buttons: [{
                        iconClass: themables_1.ThemeIcon.asClassName(codicons_1.Codicon.settingsGear),
                        tooltip: (0, nls_1.localize)('audioCues.help.settings', 'Enable/Disable Audio Cue'),
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
                placeHolder: (0, nls_1.localize)('audioCues.help.placeholder', 'Select an audio cue to play'),
            });
            await quickPick;
        }
    }
    exports.ShowAudioCueHelp = ShowAudioCueHelp;
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY29tbWFuZHMuanMiLCJzb3VyY2VSb290IjoiZmlsZTovLy93b3Jrc3BhY2UvYXBwZmxvdy9zcmMvIiwic291cmNlcyI6WyJ2cy93b3JrYmVuY2gvY29udHJpYi9hdWRpb0N1ZXMvYnJvd3Nlci9jb21tYW5kcy50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7O2dHQUdnRzs7Ozs7SUFZaEcsTUFBYSxnQkFBaUIsU0FBUSxpQkFBTztpQkFDNUIsT0FBRSxHQUFHLGdCQUFnQixDQUFDO1FBRXRDO1lBQ0MsS0FBSyxDQUFDO2dCQUNMLEVBQUUsRUFBRSxnQkFBZ0IsQ0FBQyxFQUFFO2dCQUN2QixLQUFLLEVBQUU7b0JBQ04sS0FBSyxFQUFFLElBQUEsY0FBUSxFQUFDLGdCQUFnQixFQUFFLHVCQUF1QixDQUFDO29CQUMxRCxRQUFRLEVBQUUsdUJBQXVCO2lCQUNqQztnQkFDRCxFQUFFLEVBQUUsSUFBSTthQUNSLENBQUMsQ0FBQztRQUNKLENBQUM7UUFFUSxLQUFLLENBQUMsR0FBRyxDQUFDLFFBQTBCO1lBQzVDLE1BQU0sZUFBZSxHQUFHLFFBQVEsQ0FBQyxHQUFHLENBQUMsa0NBQWdCLENBQUMsQ0FBQztZQUN2RCxNQUFNLGdCQUFnQixHQUFHLFFBQVEsQ0FBQyxHQUFHLENBQUMsK0JBQWtCLENBQUMsQ0FBQztZQUMxRCxNQUFNLGtCQUFrQixHQUFHLFFBQVEsQ0FBQyxHQUFHLENBQUMsaUNBQW1CLENBQUMsQ0FBQztZQUM3RCxNQUFNLG9CQUFvQixHQUFHLFFBQVEsQ0FBQyxHQUFHLENBQUMscUNBQXFCLENBQUMsQ0FBQztZQUVqRSxNQUFNLEtBQUssR0FBZ0QsMEJBQVEsQ0FBQyxZQUFZLENBQUMsR0FBRyxDQUFDLENBQUMsR0FBRyxFQUFFLEdBQUcsRUFBRSxFQUFFLENBQUMsQ0FBQztnQkFDbkcsS0FBSyxFQUFFLG9CQUFvQixDQUFDLHVCQUF1QixFQUFFLENBQUMsQ0FBQztvQkFDdEQsR0FBRyxHQUFHLENBQUMsSUFBSSxHQUFHLGVBQWUsQ0FBQyxTQUFTLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUMsSUFBSSxHQUFHLElBQUEsY0FBUSxFQUFDLFVBQVUsRUFBRSxVQUFVLENBQUMsR0FBRyxHQUFHLEVBQUU7b0JBQ25HLENBQUMsQ0FBQyxHQUFHLGVBQWUsQ0FBQyxTQUFTLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLFVBQVUsQ0FBQyxDQUFDLENBQUMsT0FBTyxJQUFJLEdBQUcsQ0FBQyxJQUFJLEVBQUU7Z0JBQ3pFLFFBQVEsRUFBRSxHQUFHO2dCQUNiLE9BQU8sRUFBRSxDQUFDO3dCQUNULFNBQVMsRUFBRSxxQkFBUyxDQUFDLFdBQVcsQ0FBQyxrQkFBTyxDQUFDLFlBQVksQ0FBQzt3QkFDdEQsT0FBTyxFQUFFLElBQUEsY0FBUSxFQUFDLHlCQUF5QixFQUFFLDBCQUEwQixDQUFDO3FCQUN4RSxDQUFDO2FBQ0YsQ0FBQyxDQUFDLENBQUM7WUFFSixNQUFNLFNBQVMsR0FBRyxnQkFBZ0IsQ0FBQyxJQUFJLENBQ3RDLEtBQUssRUFDTDtnQkFDQyxVQUFVLEVBQUUsS0FBSyxDQUFDLENBQUMsQ0FBQztnQkFDcEIsVUFBVSxFQUFFLENBQUMsSUFBSSxFQUFFLEVBQUU7b0JBQ3BCLGVBQWUsQ0FBQyxTQUFTLENBQUMsSUFBSSxDQUFDLFFBQVEsQ0FBQyxLQUFLLENBQUMsUUFBUSxDQUFDLElBQUksQ0FBQyxFQUFFLElBQUksQ0FBQyxDQUFDO2dCQUNyRSxDQUFDO2dCQUNELHNCQUFzQixFQUFFLENBQUMsT0FBTyxFQUFFLEVBQUU7b0JBQ25DLGtCQUFrQixDQUFDLFlBQVksQ0FBQyxFQUFFLEtBQUssRUFBRSxPQUFPLENBQUMsSUFBSSxDQUFDLFFBQVEsQ0FBQyxXQUFXLEVBQUUsQ0FBQyxDQUFDO2dCQUMvRSxDQUFDO2dCQUNELFdBQVcsRUFBRSxJQUFBLGNBQVEsRUFBQyw0QkFBNEIsRUFBRSw2QkFBNkIsQ0FBQzthQUNsRixDQUNELENBQUM7WUFFRixNQUFNLFNBQVMsQ0FBQztRQUNqQixDQUFDOztJQTlDRiw0Q0ErQ0MifQ==