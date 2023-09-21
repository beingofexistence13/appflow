/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/workbench/contrib/audioCues/browser/commands", "vs/nls!vs/workbench/contrib/audioCues/browser/audioCues.contribution", "vs/platform/actions/common/actions", "vs/platform/configuration/common/configurationRegistry", "vs/platform/instantiation/common/extensions", "vs/platform/registry/common/platform", "vs/workbench/common/contributions", "vs/platform/audioCues/browser/audioCueService", "vs/workbench/contrib/audioCues/browser/audioCueDebuggerContribution", "vs/workbench/contrib/audioCues/browser/audioCueLineFeatureContribution"], function (require, exports, commands_1, nls_1, actions_1, configurationRegistry_1, extensions_1, platform_1, contributions_1, audioCueService_1, audioCueDebuggerContribution_1, audioCueLineFeatureContribution_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    (0, extensions_1.$mr)(audioCueService_1.$sZ, audioCueService_1.$tZ, 1 /* InstantiationType.Delayed */);
    platform_1.$8m.as(contributions_1.Extensions.Workbench).registerWorkbenchContribution(audioCueLineFeatureContribution_1.$R1b, 3 /* LifecyclePhase.Restored */);
    platform_1.$8m.as(contributions_1.Extensions.Workbench).registerWorkbenchContribution(audioCueDebuggerContribution_1.$Q1b, 3 /* LifecyclePhase.Restored */);
    const audioCueFeatureBase = {
        'type': 'string',
        'enum': ['auto', 'on', 'off'],
        'default': 'auto',
        'enumDescriptions': [
            (0, nls_1.localize)(0, null),
            (0, nls_1.localize)(1, null),
            (0, nls_1.localize)(2, null)
        ],
        tags: ['accessibility']
    };
    platform_1.$8m.as(configurationRegistry_1.$an.Configuration).registerConfiguration({
        'properties': {
            'audioCues.enabled': {
                markdownDeprecationMessage: 'Deprecated. Use the specific setting for each audio cue instead (`audioCues.*`).',
                tags: ['accessibility']
            },
            'audioCues.volume': {
                'description': (0, nls_1.localize)(3, null),
                'type': 'number',
                'minimum': 0,
                'maximum': 100,
                'default': 70,
                tags: ['accessibility']
            },
            'audioCues.debouncePositionChanges': {
                'description': (0, nls_1.localize)(4, null),
                'type': 'boolean',
                'default': false,
                tags: ['accessibility']
            },
            'audioCues.lineHasBreakpoint': {
                'description': (0, nls_1.localize)(5, null),
                ...audioCueFeatureBase
            },
            'audioCues.lineHasInlineSuggestion': {
                'description': (0, nls_1.localize)(6, null),
                ...audioCueFeatureBase
            },
            'audioCues.lineHasError': {
                'description': (0, nls_1.localize)(7, null),
                ...audioCueFeatureBase,
            },
            'audioCues.lineHasFoldedArea': {
                'description': (0, nls_1.localize)(8, null),
                ...audioCueFeatureBase,
            },
            'audioCues.lineHasWarning': {
                'description': (0, nls_1.localize)(9, null),
                ...audioCueFeatureBase,
                default: 'off',
            },
            'audioCues.onDebugBreak': {
                'description': (0, nls_1.localize)(10, null),
                ...audioCueFeatureBase,
            },
            'audioCues.noInlayHints': {
                'description': (0, nls_1.localize)(11, null),
                ...audioCueFeatureBase,
            },
            'audioCues.taskCompleted': {
                'description': (0, nls_1.localize)(12, null),
                ...audioCueFeatureBase,
            },
            'audioCues.taskFailed': {
                'description': (0, nls_1.localize)(13, null),
                ...audioCueFeatureBase,
            },
            'audioCues.terminalCommandFailed': {
                'description': (0, nls_1.localize)(14, null),
                ...audioCueFeatureBase,
            },
            'audioCues.terminalQuickFix': {
                'description': (0, nls_1.localize)(15, null),
                ...audioCueFeatureBase,
            },
            'audioCues.diffLineInserted': {
                'description': (0, nls_1.localize)(16, null),
                ...audioCueFeatureBase,
            },
            'audioCues.diffLineDeleted': {
                'description': (0, nls_1.localize)(17, null),
                ...audioCueFeatureBase,
            },
            'audioCues.diffLineModified': {
                'description': (0, nls_1.localize)(18, null),
                ...audioCueFeatureBase,
            },
            'audioCues.notebookCellCompleted': {
                'description': (0, nls_1.localize)(19, null),
                ...audioCueFeatureBase,
            },
            'audioCues.notebookCellFailed': {
                'description': (0, nls_1.localize)(20, null),
                ...audioCueFeatureBase,
            },
            'audioCues.chatRequestSent': {
                'description': (0, nls_1.localize)(21, null),
                ...audioCueFeatureBase,
                default: 'off'
            },
            'audioCues.chatResponsePending': {
                'description': (0, nls_1.localize)(22, null),
                ...audioCueFeatureBase,
                default: 'auto'
            },
            'audioCues.chatResponseReceived': {
                'description': (0, nls_1.localize)(23, null),
                ...audioCueFeatureBase,
                default: 'off'
            }
        }
    });
    (0, actions_1.$Xu)(commands_1.$P1b);
});
//# sourceMappingURL=audioCues.contribution.js.map