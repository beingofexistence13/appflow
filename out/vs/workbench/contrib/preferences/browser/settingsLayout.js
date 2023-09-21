/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/base/common/platform", "vs/nls", "vs/workbench/contrib/preferences/common/preferences"], function (require, exports, platform_1, nls_1, preferences_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.knownTermMappings = exports.knownAcronyms = exports.tocData = exports.getCommonlyUsedData = void 0;
    const defaultCommonlyUsedSettings = [
        'files.autoSave',
        'editor.fontSize',
        'editor.fontFamily',
        'editor.tabSize',
        'editor.renderWhitespace',
        'editor.cursorStyle',
        'editor.multiCursorModifier',
        'editor.insertSpaces',
        'editor.wordWrap',
        'files.exclude',
        'files.associations',
        'workbench.editor.enablePreview'
    ];
    async function getCommonlyUsedData(workbenchAssignmentService, environmentService, productService) {
        const toggleData = await (0, preferences_1.getExperimentalExtensionToggleData)(workbenchAssignmentService, environmentService, productService);
        return {
            id: 'commonlyUsed',
            label: (0, nls_1.localize)('commonlyUsed', "Commonly Used"),
            settings: toggleData ? toggleData.commonlyUsed : defaultCommonlyUsedSettings
        };
    }
    exports.getCommonlyUsedData = getCommonlyUsedData;
    exports.tocData = {
        id: 'root',
        label: 'root',
        children: [
            {
                id: 'editor',
                label: (0, nls_1.localize)('textEditor', "Text Editor"),
                settings: ['editor.*'],
                children: [
                    {
                        id: 'editor/cursor',
                        label: (0, nls_1.localize)('cursor', "Cursor"),
                        settings: ['editor.cursor*']
                    },
                    {
                        id: 'editor/find',
                        label: (0, nls_1.localize)('find', "Find"),
                        settings: ['editor.find.*']
                    },
                    {
                        id: 'editor/font',
                        label: (0, nls_1.localize)('font', "Font"),
                        settings: ['editor.font*']
                    },
                    {
                        id: 'editor/format',
                        label: (0, nls_1.localize)('formatting', "Formatting"),
                        settings: ['editor.format*']
                    },
                    {
                        id: 'editor/diffEditor',
                        label: (0, nls_1.localize)('diffEditor', "Diff Editor"),
                        settings: ['diffEditor.*']
                    },
                    {
                        id: 'editor/minimap',
                        label: (0, nls_1.localize)('minimap', "Minimap"),
                        settings: ['editor.minimap.*']
                    },
                    {
                        id: 'editor/suggestions',
                        label: (0, nls_1.localize)('suggestions', "Suggestions"),
                        settings: ['editor.*suggest*']
                    },
                    {
                        id: 'editor/files',
                        label: (0, nls_1.localize)('files', "Files"),
                        settings: ['files.*']
                    }
                ]
            },
            {
                id: 'workbench',
                label: (0, nls_1.localize)('workbench', "Workbench"),
                settings: ['workbench.*'],
                children: [
                    {
                        id: 'workbench/appearance',
                        label: (0, nls_1.localize)('appearance', "Appearance"),
                        settings: ['workbench.activityBar.*', 'workbench.*color*', 'workbench.fontAliasing', 'workbench.iconTheme', 'workbench.sidebar.location', 'workbench.*.visible', 'workbench.tips.enabled', 'workbench.tree.*', 'workbench.view.*']
                    },
                    {
                        id: 'workbench/breadcrumbs',
                        label: (0, nls_1.localize)('breadcrumbs', "Breadcrumbs"),
                        settings: ['breadcrumbs.*']
                    },
                    {
                        id: 'workbench/editor',
                        label: (0, nls_1.localize)('editorManagement', "Editor Management"),
                        settings: ['workbench.editor.*']
                    },
                    {
                        id: 'workbench/settings',
                        label: (0, nls_1.localize)('settings', "Settings Editor"),
                        settings: ['workbench.settings.*']
                    },
                    {
                        id: 'workbench/zenmode',
                        label: (0, nls_1.localize)('zenMode', "Zen Mode"),
                        settings: ['zenmode.*']
                    },
                    {
                        id: 'workbench/screencastmode',
                        label: (0, nls_1.localize)('screencastMode', "Screencast Mode"),
                        settings: ['screencastMode.*']
                    }
                ]
            },
            {
                id: 'window',
                label: (0, nls_1.localize)('window', "Window"),
                settings: ['window.*'],
                children: [
                    {
                        id: 'window/newWindow',
                        label: (0, nls_1.localize)('newWindow', "New Window"),
                        settings: ['window.*newwindow*']
                    }
                ]
            },
            {
                id: 'features',
                label: (0, nls_1.localize)('features', "Features"),
                children: [
                    {
                        id: 'features/accessibility',
                        label: (0, nls_1.localize)('accessibility', "Accessibility"),
                        settings: ['accessibility.*']
                    },
                    {
                        id: 'features/explorer',
                        label: (0, nls_1.localize)('fileExplorer', "Explorer"),
                        settings: ['explorer.*', 'outline.*']
                    },
                    {
                        id: 'features/search',
                        label: (0, nls_1.localize)('search', "Search"),
                        settings: ['search.*']
                    },
                    {
                        id: 'features/debug',
                        label: (0, nls_1.localize)('debug', "Debug"),
                        settings: ['debug.*', 'launch']
                    },
                    {
                        id: 'features/testing',
                        label: (0, nls_1.localize)('testing', "Testing"),
                        settings: ['testing.*']
                    },
                    {
                        id: 'features/scm',
                        label: (0, nls_1.localize)('scm', "Source Control"),
                        settings: ['scm.*']
                    },
                    {
                        id: 'features/extensions',
                        label: (0, nls_1.localize)('extensions', "Extensions"),
                        settings: ['extensions.*']
                    },
                    {
                        id: 'features/terminal',
                        label: (0, nls_1.localize)('terminal', "Terminal"),
                        settings: ['terminal.*']
                    },
                    {
                        id: 'features/task',
                        label: (0, nls_1.localize)('task', "Task"),
                        settings: ['task.*']
                    },
                    {
                        id: 'features/problems',
                        label: (0, nls_1.localize)('problems', "Problems"),
                        settings: ['problems.*']
                    },
                    {
                        id: 'features/output',
                        label: (0, nls_1.localize)('output', "Output"),
                        settings: ['output.*']
                    },
                    {
                        id: 'features/comments',
                        label: (0, nls_1.localize)('comments', "Comments"),
                        settings: ['comments.*']
                    },
                    {
                        id: 'features/remote',
                        label: (0, nls_1.localize)('remote', "Remote"),
                        settings: ['remote.*']
                    },
                    {
                        id: 'features/timeline',
                        label: (0, nls_1.localize)('timeline', "Timeline"),
                        settings: ['timeline.*']
                    },
                    {
                        id: 'features/notebook',
                        label: (0, nls_1.localize)('notebook', 'Notebook'),
                        settings: ['notebook.*', 'interactiveWindow.*']
                    },
                    {
                        id: 'features/audioCues',
                        label: (0, nls_1.localize)('audioCues', 'Audio Cues'),
                        settings: ['audioCues.*']
                    },
                    {
                        id: 'features/mergeEditor',
                        label: (0, nls_1.localize)('mergeEditor', 'Merge Editor'),
                        settings: ['mergeEditor.*']
                    },
                    {
                        id: 'features/chat',
                        label: (0, nls_1.localize)('chat', 'Chat'),
                        settings: ['chat.*', 'inlineChat.*']
                    }
                ]
            },
            {
                id: 'application',
                label: (0, nls_1.localize)('application', "Application"),
                children: [
                    {
                        id: 'application/http',
                        label: (0, nls_1.localize)('proxy', "Proxy"),
                        settings: ['http.*']
                    },
                    {
                        id: 'application/keyboard',
                        label: (0, nls_1.localize)('keyboard', "Keyboard"),
                        settings: ['keyboard.*']
                    },
                    {
                        id: 'application/update',
                        label: (0, nls_1.localize)('update', "Update"),
                        settings: ['update.*']
                    },
                    {
                        id: 'application/telemetry',
                        label: (0, nls_1.localize)('telemetry', "Telemetry"),
                        settings: ['telemetry.*']
                    },
                    {
                        id: 'application/settingsSync',
                        label: (0, nls_1.localize)('settingsSync', "Settings Sync"),
                        settings: ['settingsSync.*']
                    },
                    {
                        id: 'application/experimental',
                        label: (0, nls_1.localize)('experimental', "Experimental"),
                        settings: ['application.experimental.*']
                    },
                    {
                        id: 'application/other',
                        label: (0, nls_1.localize)('other', "Other"),
                        settings: ['application.*']
                    }
                ]
            },
            {
                id: 'security',
                label: (0, nls_1.localize)('security', "Security"),
                settings: platform_1.isWindows ? ['security.*'] : undefined,
                children: [
                    {
                        id: 'security/workspace',
                        label: (0, nls_1.localize)('workspace', "Workspace"),
                        settings: ['security.workspace.*']
                    }
                ]
            }
        ]
    };
    exports.knownAcronyms = new Set();
    [
        'css',
        'html',
        'scss',
        'less',
        'json',
        'js',
        'ts',
        'ie',
        'id',
        'php',
        'scm',
    ].forEach(str => exports.knownAcronyms.add(str));
    exports.knownTermMappings = new Map();
    exports.knownTermMappings.set('power shell', 'PowerShell');
    exports.knownTermMappings.set('powershell', 'PowerShell');
    exports.knownTermMappings.set('javascript', 'JavaScript');
    exports.knownTermMappings.set('typescript', 'TypeScript');
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoic2V0dGluZ3NMYXlvdXQuanMiLCJzb3VyY2VSb290IjoiZmlsZTovLy93b3Jrc3BhY2UvYXBwZmxvdy9zcmMvIiwic291cmNlcyI6WyJ2cy93b3JrYmVuY2gvY29udHJpYi9wcmVmZXJlbmNlcy9icm93c2VyL3NldHRpbmdzTGF5b3V0LnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOzs7Z0dBR2dHOzs7OztJQWdCaEcsTUFBTSwyQkFBMkIsR0FBYTtRQUM3QyxnQkFBZ0I7UUFDaEIsaUJBQWlCO1FBQ2pCLG1CQUFtQjtRQUNuQixnQkFBZ0I7UUFDaEIseUJBQXlCO1FBQ3pCLG9CQUFvQjtRQUNwQiw0QkFBNEI7UUFDNUIscUJBQXFCO1FBQ3JCLGlCQUFpQjtRQUNqQixlQUFlO1FBQ2Ysb0JBQW9CO1FBQ3BCLGdDQUFnQztLQUNoQyxDQUFDO0lBRUssS0FBSyxVQUFVLG1CQUFtQixDQUFDLDBCQUF1RCxFQUFFLGtCQUF1QyxFQUFFLGNBQStCO1FBQzFLLE1BQU0sVUFBVSxHQUFHLE1BQU0sSUFBQSxnREFBa0MsRUFBQywwQkFBMEIsRUFBRSxrQkFBa0IsRUFBRSxjQUFjLENBQUMsQ0FBQztRQUM1SCxPQUFPO1lBQ04sRUFBRSxFQUFFLGNBQWM7WUFDbEIsS0FBSyxFQUFFLElBQUEsY0FBUSxFQUFDLGNBQWMsRUFBRSxlQUFlLENBQUM7WUFDaEQsUUFBUSxFQUFFLFVBQVUsQ0FBQyxDQUFDLENBQUMsVUFBVSxDQUFDLFlBQVksQ0FBQyxDQUFDLENBQUMsMkJBQTJCO1NBQzVFLENBQUM7SUFDSCxDQUFDO0lBUEQsa0RBT0M7SUFFWSxRQUFBLE9BQU8sR0FBc0I7UUFDekMsRUFBRSxFQUFFLE1BQU07UUFDVixLQUFLLEVBQUUsTUFBTTtRQUNiLFFBQVEsRUFBRTtZQUNUO2dCQUNDLEVBQUUsRUFBRSxRQUFRO2dCQUNaLEtBQUssRUFBRSxJQUFBLGNBQVEsRUFBQyxZQUFZLEVBQUUsYUFBYSxDQUFDO2dCQUM1QyxRQUFRLEVBQUUsQ0FBQyxVQUFVLENBQUM7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