/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/base/common/platform", "vs/nls!vs/workbench/contrib/preferences/browser/settingsLayout", "vs/workbench/contrib/preferences/common/preferences"], function (require, exports, platform_1, nls_1, preferences_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.$pDb = exports.$oDb = exports.$nDb = exports.$mDb = void 0;
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
    async function $mDb(workbenchAssignmentService, environmentService, productService) {
        const toggleData = await (0, preferences_1.$UCb)(workbenchAssignmentService, environmentService, productService);
        return {
            id: 'commonlyUsed',
            label: (0, nls_1.localize)(0, null),
            settings: toggleData ? toggleData.commonlyUsed : defaultCommonlyUsedSettings
        };
    }
    exports.$mDb = $mDb;
    exports.$nDb = {
        id: 'root',
        label: 'root',
        children: [
            {
                id: 'editor',
                label: (0, nls_1.localize)(1, null),
                settings: ['editor.*'],
                children: [
                    {
                        id: 'editor/cursor',
                        label: (0, nls_1.localize)(2, null),
                        settings: ['editor.cursor*']
                    },
                    {
                        id: 'editor/find',
                        label: (0, nls_1.localize)(3, null),
                        settings: ['editor.find.*']
                    },
                    {
                        id: 'editor/font',
                        label: (0, nls_1.localize)(4, null),
                        settings: ['editor.font*']
                    },
                    {
                        id: 'editor/format',
                        label: (0, nls_1.localize)(5, null),
                        settings: ['editor.format*']
                    },
                    {
                        id: 'editor/diffEditor',
                        label: (0, nls_1.localize)(6, null),
                        settings: ['diffEditor.*']
                    },
                    {
                        id: 'editor/minimap',
                        label: (0, nls_1.localize)(7, null),
                        settings: ['editor.minimap.*']
                    },
                    {
                        id: 'editor/suggestions',
                        label: (0, nls_1.localize)(8, null),
                        settings: ['editor.*suggest*']
                    },
                    {
                        id: 'editor/files',
                        label: (0, nls_1.localize)(9, null),
                        settings: ['files.*']
                    }
                ]
            },
            {
                id: 'workbench',
                label: (0, nls_1.localize)(10, null),
                settings: ['workbench.*'],
                children: [
                    {
                        id: 'workbench/appearance',
                        label: (0, nls_1.localize)(11, null),
                        settings: ['workbench.activityBar.*', 'workbench.*color*', 'workbench.fontAliasing', 'workbench.iconTheme', 'workbench.sidebar.location', 'workbench.*.visible', 'workbench.tips.enabled', 'workbench.tree.*', 'workbench.view.*']
                    },
                    {
                        id: 'workbench/breadcrumbs',
                        label: (0, nls_1.localize)(12, null),
                        settings: ['breadcrumbs.*']
                    },
                    {
                        id: 'workbench/editor',
                        label: (0, nls_1.localize)(13, null),
                        settings: ['workbench.editor.*']
                    },
                    {
                        id: 'workbench/settings',
                        label: (0, nls_1.localize)(14, null),
                        settings: ['workbench.settings.*']
                    },
                    {
                        id: 'workbench/zenmode',
                        label: (0, nls_1.localize)(15, null),
                        settings: ['zenmode.*']
                    },
                    {
                        id: 'workbench/screencastmode',
                        label: (0, nls_1.localize)(16, null),
                        settings: ['screencastMode.*']
                    }
                ]
            },
            {
                id: 'window',
                label: (0, nls_1.localize)(17, null),
                settings: ['window.*'],
                children: [
                    {
                        id: 'window/newWindow',
                        label: (0, nls_1.localize)(18, null),
                        settings: ['window.*newwindow*']
                    }
                ]
            },
            {
                id: 'features',
                label: (0, nls_1.localize)(19, null),
                children: [
                    {
                        id: 'features/accessibility',
                        label: (0, nls_1.localize)(20, null),
                        settings: ['accessibility.*']
                    },
                    {
                        id: 'features/explorer',
                        label: (0, nls_1.localize)(21, null),
                        settings: ['explorer.*', 'outline.*']
                    },
                    {
                        id: 'features/search',
                        label: (0, nls_1.localize)(22, null),
                        settings: ['search.*']
                    },
                    {
                        id: 'features/debug',
                        label: (0, nls_1.localize)(23, null),
                        settings: ['debug.*', 'launch']
                    },
                    {
                        id: 'features/testing',
                        label: (0, nls_1.localize)(24, null),
                        settings: ['testing.*']
                    },
                    {
                        id: 'features/scm',
                        label: (0, nls_1.localize)(25, null),
                        settings: ['scm.*']
                    },
                    {
                        id: 'features/extensions',
                        label: (0, nls_1.localize)(26, null),
                        settings: ['extensions.*']
                    },
                    {
                        id: 'features/terminal',
                        label: (0, nls_1.localize)(27, null),
                        settings: ['terminal.*']
                    },
                    {
                        id: 'features/task',
                        label: (0, nls_1.localize)(28, null),
                        settings: ['task.*']
                    },
                    {
                        id: 'features/problems',
                        label: (0, nls_1.localize)(29, null),
                        settings: ['problems.*']
                    },
                    {
                        id: 'features/output',
                        label: (0, nls_1.localize)(30, null),
                        settings: ['output.*']
                    },
                    {
                        id: 'features/comments',
                        label: (0, nls_1.localize)(31, null),
                        settings: ['comments.*']
                    },
                    {
                        id: 'features/remote',
                        label: (0, nls_1.localize)(32, null),
                        settings: ['remote.*']
                    },
                    {
                        id: 'features/timeline',
                        label: (0, nls_1.localize)(33, null),
                        settings: ['timeline.*']
                    },
                    {
                        id: 'features/notebook',
                        label: (0, nls_1.localize)(34, null),
                        settings: ['notebook.*', 'interactiveWindow.*']
                    },
                    {
                        id: 'features/audioCues',
                        label: (0, nls_1.localize)(35, null),
                        settings: ['audioCues.*']
                    },
                    {
                        id: 'features/mergeEditor',
                        label: (0, nls_1.localize)(36, null),
                        settings: ['mergeEditor.*']
                    },
                    {
                        id: 'features/chat',
                        label: (0, nls_1.localize)(37, null),
                        settings: ['chat.*', 'inlineChat.*']
                    }
                ]
            },
            {
                id: 'application',
                label: (0, nls_1.localize)(38, null),
                children: [
                    {
                        id: 'application/http',
                        label: (0, nls_1.localize)(39, null),
                        settings: ['http.*']
                    },
                    {
                        id: 'application/keyboard',
                        label: (0, nls_1.localize)(40, null),
                        settings: ['keyboard.*']
                    },
                    {
                        id: 'application/update',
                        label: (0, nls_1.localize)(41, null),
                        settings: ['update.*']
                    },
                    {
                        id: 'application/telemetry',
                        label: (0, nls_1.localize)(42, null),
                        settings: ['telemetry.*']
                    },
                    {
                        id: 'application/settingsSync',
                        label: (0, nls_1.localize)(43, null),
                        settings: ['settingsSync.*']
                    },
                    {
                        id: 'application/experimental',
                        label: (0, nls_1.localize)(44, null),
                        settings: ['application.experimental.*']
                    },
                    {
                        id: 'application/other',
                        label: (0, nls_1.localize)(45, null),
                        settings: ['application.*']
                    }
                ]
            },
            {
                id: 'security',
                label: (0, nls_1.localize)(46, null),
                settings: platform_1.$i ? ['security.*'] : undefined,
                children: [
                    {
                        id: 'security/workspace',
                        label: (0, nls_1.localize)(47, null),
                        settings: ['security.workspace.*']
                    }
                ]
            }
        ]
    };
    exports.$oDb = new Set();
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
    ].forEach(str => exports.$oDb.add(str));
    exports.$pDb = new Map();
    exports.$pDb.set('power shell', 'PowerShell');
    exports.$pDb.set('powershell', 'PowerShell');
    exports.$pDb.set('javascript', 'JavaScript');
    exports.$pDb.set('typescript', 'TypeScript');
});
//# sourceMappingURL=settingsLayout.js.map