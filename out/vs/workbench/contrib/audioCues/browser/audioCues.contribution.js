/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/workbench/contrib/audioCues/browser/commands", "vs/nls", "vs/platform/actions/common/actions", "vs/platform/configuration/common/configurationRegistry", "vs/platform/instantiation/common/extensions", "vs/platform/registry/common/platform", "vs/workbench/common/contributions", "vs/platform/audioCues/browser/audioCueService", "vs/workbench/contrib/audioCues/browser/audioCueDebuggerContribution", "vs/workbench/contrib/audioCues/browser/audioCueLineFeatureContribution"], function (require, exports, commands_1, nls_1, actions_1, configurationRegistry_1, extensions_1, platform_1, contributions_1, audioCueService_1, audioCueDebuggerContribution_1, audioCueLineFeatureContribution_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    (0, extensions_1.registerSingleton)(audioCueService_1.IAudioCueService, audioCueService_1.AudioCueService, 1 /* InstantiationType.Delayed */);
    platform_1.Registry.as(contributions_1.Extensions.Workbench).registerWorkbenchContribution(audioCueLineFeatureContribution_1.AudioCueLineFeatureContribution, 3 /* LifecyclePhase.Restored */);
    platform_1.Registry.as(contributions_1.Extensions.Workbench).registerWorkbenchContribution(audioCueDebuggerContribution_1.AudioCueLineDebuggerContribution, 3 /* LifecyclePhase.Restored */);
    const audioCueFeatureBase = {
        'type': 'string',
        'enum': ['auto', 'on', 'off'],
        'default': 'auto',
        'enumDescriptions': [
            (0, nls_1.localize)('audioCues.enabled.auto', "Enable audio cue when a screen reader is attached."),
            (0, nls_1.localize)('audioCues.enabled.on', "Enable audio cue."),
            (0, nls_1.localize)('audioCues.enabled.off', "Disable audio cue.")
        ],
        tags: ['accessibility']
    };
    platform_1.Registry.as(configurationRegistry_1.Extensions.Configuration).registerConfiguration({
        'properties': {
            'audioCues.enabled': {
                markdownDeprecationMessage: 'Deprecated. Use the specific setting for each audio cue instead (`audioCues.*`).',
                tags: ['accessibility']
            },
            'audioCues.volume': {
                'description': (0, nls_1.localize)('audioCues.volume', "The volume of the audio cues in percent (0-100)."),
                'type': 'number',
                'minimum': 0,
                'maximum': 100,
                'default': 70,
                tags: ['accessibility']
            },
            'audioCues.debouncePositionChanges': {
                'description': (0, nls_1.localize)('audioCues.debouncePositionChanges', "Whether or not position changes should be debounced"),
                'type': 'boolean',
                'default': false,
                tags: ['accessibility']
            },
            'audioCues.lineHasBreakpoint': {
                'description': (0, nls_1.localize)('audioCues.lineHasBreakpoint', "Plays a sound when the active line has a breakpoint."),
                ...audioCueFeatureBase
            },
            'audioCues.lineHasInlineSuggestion': {
                'description': (0, nls_1.localize)('audioCues.lineHasInlineSuggestion', "Plays a sound when the active line has an inline suggestion."),
                ...audioCueFeatureBase
            },
            'audioCues.lineHasError': {
                'description': (0, nls_1.localize)('audioCues.lineHasError', "Plays a sound when the active line has an error."),
                ...audioCueFeatureBase,
            },
            'audioCues.lineHasFoldedArea': {
                'description': (0, nls_1.localize)('audioCues.lineHasFoldedArea', "Plays a sound when the active line has a folded area that can be unfolded."),
                ...audioCueFeatureBase,
            },
            'audioCues.lineHasWarning': {
                'description': (0, nls_1.localize)('audioCues.lineHasWarning', "Plays a sound when the active line has a warning."),
                ...audioCueFeatureBase,
                default: 'off',
            },
            'audioCues.onDebugBreak': {
                'description': (0, nls_1.localize)('audioCues.onDebugBreak', "Plays a sound when the debugger stopped on a breakpoint."),
                ...audioCueFeatureBase,
            },
            'audioCues.noInlayHints': {
                'description': (0, nls_1.localize)('audioCues.noInlayHints', "Plays a sound when trying to read a line with inlay hints that has no inlay hints."),
                ...audioCueFeatureBase,
            },
            'audioCues.taskCompleted': {
                'description': (0, nls_1.localize)('audioCues.taskCompleted', "Plays a sound when a task is completed."),
                ...audioCueFeatureBase,
            },
            'audioCues.taskFailed': {
                'description': (0, nls_1.localize)('audioCues.taskFailed', "Plays a sound when a task fails (non-zero exit code)."),
                ...audioCueFeatureBase,
            },
            'audioCues.terminalCommandFailed': {
                'description': (0, nls_1.localize)('audioCues.terminalCommandFailed', "Plays a sound when a terminal command fails (non-zero exit code)."),
                ...audioCueFeatureBase,
            },
            'audioCues.terminalQuickFix': {
                'description': (0, nls_1.localize)('audioCues.terminalQuickFix', "Plays a sound when terminal Quick Fixes are available."),
                ...audioCueFeatureBase,
            },
            'audioCues.diffLineInserted': {
                'description': (0, nls_1.localize)('audioCues.diffLineInserted', "Plays a sound when the focus moves to an inserted line in accessible diff viewer mode or to the next/previous change"),
                ...audioCueFeatureBase,
            },
            'audioCues.diffLineDeleted': {
                'description': (0, nls_1.localize)('audioCues.diffLineDeleted', "Plays a sound when the focus moves to a deleted line in accessible diff viewer mode or to the next/previous change"),
                ...audioCueFeatureBase,
            },
            'audioCues.diffLineModified': {
                'description': (0, nls_1.localize)('audioCues.diffLineModified', "Plays a sound when the focus moves to a modified line in accessible diff viewer mode or to the next/previous change"),
                ...audioCueFeatureBase,
            },
            'audioCues.notebookCellCompleted': {
                'description': (0, nls_1.localize)('audioCues.notebookCellCompleted', "Plays a sound when a notebook cell execution is successfully completed."),
                ...audioCueFeatureBase,
            },
            'audioCues.notebookCellFailed': {
                'description': (0, nls_1.localize)('audioCues.notebookCellFailed', "Plays a sound when a notebook cell execution fails."),
                ...audioCueFeatureBase,
            },
            'audioCues.chatRequestSent': {
                'description': (0, nls_1.localize)('audioCues.chatRequestSent', "Plays a sound when a chat request is made."),
                ...audioCueFeatureBase,
                default: 'off'
            },
            'audioCues.chatResponsePending': {
                'description': (0, nls_1.localize)('audioCues.chatResponsePending', "Plays a sound on loop while the response is pending."),
                ...audioCueFeatureBase,
                default: 'auto'
            },
            'audioCues.chatResponseReceived': {
                'description': (0, nls_1.localize)('audioCues.chatResponseReceived', "Plays a sound on loop while the response has been received."),
                ...audioCueFeatureBase,
                default: 'off'
            }
        }
    });
    (0, actions_1.registerAction2)(commands_1.ShowAudioCueHelp);
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYXVkaW9DdWVzLmNvbnRyaWJ1dGlvbi5qcyIsInNvdXJjZVJvb3QiOiJmaWxlOi8vL3dvcmtzcGFjZS9hcHBmbG93L3NyYy8iLCJzb3VyY2VzIjpbInZzL3dvcmtiZW5jaC9jb250cmliL2F1ZGlvQ3Vlcy9icm93c2VyL2F1ZGlvQ3Vlcy5jb250cmlidXRpb24udHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7OztnR0FHZ0c7Ozs7SUFjaEcsSUFBQSw4QkFBaUIsRUFBQyxrQ0FBZ0IsRUFBRSxpQ0FBZSxvQ0FBNEIsQ0FBQztJQUVoRixtQkFBUSxDQUFDLEVBQUUsQ0FBa0MsMEJBQW1CLENBQUMsU0FBUyxDQUFDLENBQUMsNkJBQTZCLENBQUMsaUVBQStCLGtDQUEwQixDQUFDO0lBQ3BLLG1CQUFRLENBQUMsRUFBRSxDQUFrQywwQkFBbUIsQ0FBQyxTQUFTLENBQUMsQ0FBQyw2QkFBNkIsQ0FBQywrREFBZ0Msa0NBQTBCLENBQUM7SUFFckssTUFBTSxtQkFBbUIsR0FBaUM7UUFDekQsTUFBTSxFQUFFLFFBQVE7UUFDaEIsTUFBTSxFQUFFLENBQUMsTUFBTSxFQUFFLElBQUksRUFBRSxLQUFLLENBQUM7UUFDN0IsU0FBUyxFQUFFLE1BQU07UUFDakIsa0JBQWtCLEVBQUU7WUFDbkIsSUFBQSxjQUFRLEVBQUMsd0JBQXdCLEVBQUUsb0RBQW9ELENBQUM7WUFDeEYsSUFBQSxjQUFRLEVBQUMsc0JBQXNCLEVBQUUsbUJBQW1CLENBQUM7WUFDckQsSUFBQSxjQUFRLEVBQUMsdUJBQXVCLEVBQUUsb0JBQW9CLENBQUM7U0FDdkQ7UUFDRCxJQUFJLEVBQUUsQ0FBQyxlQUFlLENBQUM7S0FDdkIsQ0FBQztJQUVGLG1CQUFRLENBQUMsRUFBRSxDQUF5QixrQ0FBdUIsQ0FBQyxhQUFhLENBQUMsQ0FBQyxxQkFBcUIsQ0FBQztRQUNoRyxZQUFZLEVBQUU7WUFDYixtQkFBbUIsRUFBRTtnQkFDcEIsMEJBQTBCLEVBQUUsa0ZBQWtGO2dCQUM5RyxJQUFJLEVBQUUsQ0FB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