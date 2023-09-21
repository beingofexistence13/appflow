/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "assert", "vs/base/common/objects", "vs/base/test/common/utils", "vs/platform/extensionManagement/common/extensionNls", "vs/platform/log/common/log"], function (require, exports, assert, objects_1, utils_1, extensionNls_1, log_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    const manifest = {
        name: 'test',
        publisher: 'test',
        version: '1.0.0',
        engines: {
            vscode: '*'
        },
        contributes: {
            commands: [
                {
                    command: 'test.command',
                    title: '%test.command.title%',
                    category: '%test.command.category%'
                },
            ],
            authentication: [
                {
                    id: 'test.authentication',
                    label: '%test.authentication.label%',
                }
            ],
            configuration: {
                // to ensure we test another "title" property
                title: '%test.configuration.title%',
                properties: {
                    'test.configuration': {
                        type: 'string',
                        description: 'not important',
                    }
                }
            }
        }
    };
    suite('Localize Manifest', () => {
        const store = (0, utils_1.ensureNoDisposablesAreLeakedInTestSuite)();
        test('replaces template strings', function () {
            const localizedManifest = (0, extensionNls_1.localizeManifest)(store.add(new log_1.NullLogger()), (0, objects_1.deepClone)(manifest), {
                'test.command.title': 'Test Command',
                'test.command.category': 'Test Category',
                'test.authentication.label': 'Test Authentication',
                'test.configuration.title': 'Test Configuration',
            });
            assert.strictEqual(localizedManifest.contributes?.commands?.[0].title, 'Test Command');
            assert.strictEqual(localizedManifest.contributes?.commands?.[0].category, 'Test Category');
            assert.strictEqual(localizedManifest.contributes?.authentication?.[0].label, 'Test Authentication');
            assert.strictEqual((localizedManifest.contributes?.configuration).title, 'Test Configuration');
        });
        test('replaces template strings with fallback if not found in translations', function () {
            const localizedManifest = (0, extensionNls_1.localizeManifest)(store.add(new log_1.NullLogger()), (0, objects_1.deepClone)(manifest), {}, {
                'test.command.title': 'Test Command',
                'test.command.category': 'Test Category',
                'test.authentication.label': 'Test Authentication',
                'test.configuration.title': 'Test Configuration',
            });
            assert.strictEqual(localizedManifest.contributes?.commands?.[0].title, 'Test Command');
            assert.strictEqual(localizedManifest.contributes?.commands?.[0].category, 'Test Category');
            assert.strictEqual(localizedManifest.contributes?.authentication?.[0].label, 'Test Authentication');
            assert.strictEqual((localizedManifest.contributes?.configuration).title, 'Test Configuration');
        });
        test('replaces template strings - command title & categories become ILocalizedString', function () {
            const localizedManifest = (0, extensionNls_1.localizeManifest)(store.add(new log_1.NullLogger()), (0, objects_1.deepClone)(manifest), {
                'test.command.title': 'Befehl test',
                'test.command.category': 'Testkategorie',
                'test.authentication.label': 'Testauthentifizierung',
                'test.configuration.title': 'Testkonfiguration',
            }, {
                'test.command.title': 'Test Command',
                'test.command.category': 'Test Category',
                'test.authentication.label': 'Test Authentication',
                'test.configuration.title': 'Test Configuration',
            });
            const title = localizedManifest.contributes?.commands?.[0].title;
            const category = localizedManifest.contributes?.commands?.[0].category;
            assert.strictEqual(title.value, 'Befehl test');
            assert.strictEqual(title.original, 'Test Command');
            assert.strictEqual(category.value, 'Testkategorie');
            assert.strictEqual(category.original, 'Test Category');
            // Everything else stays as a string.
            assert.strictEqual(localizedManifest.contributes?.authentication?.[0].label, 'Testauthentifizierung');
            assert.strictEqual((localizedManifest.contributes?.configuration).title, 'Testkonfiguration');
        });
        test('replaces template strings - is best effort #164630', function () {
            const manifestWithTypo = {
                name: 'test',
                publisher: 'test',
                version: '1.0.0',
                engines: {
                    vscode: '*'
                },
                contributes: {
                    authentication: [
                        {
                            id: 'test.authentication',
                            // This not existing in the bundle shouldn't cause an error.
                            label: '%doesnotexist%',
                        }
                    ],
                    commands: [
                        {
                            command: 'test.command',
                            title: '%test.command.title%',
                            category: '%test.command.category%'
                        },
                    ],
                }
            };
            const localizedManifest = (0, extensionNls_1.localizeManifest)(store.add(new log_1.NullLogger()), (0, objects_1.deepClone)(manifestWithTypo), {
                'test.command.title': 'Test Command',
                'test.command.category': 'Test Category'
            });
            assert.strictEqual(localizedManifest.contributes?.commands?.[0].title, 'Test Command');
            assert.strictEqual(localizedManifest.contributes?.commands?.[0].category, 'Test Category');
            assert.strictEqual(localizedManifest.contributes?.authentication?.[0].label, '%doesnotexist%');
        });
    });
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZXh0ZW5zaW9uTmxzLnRlc3QuanMiLCJzb3VyY2VSb290IjoiZmlsZTovLy93b3Jrc3BhY2UvYXBwZmxvdy9zcmMvIiwic291cmNlcyI6WyJ2cy9wbGF0Zm9ybS9leHRlbnNpb25NYW5hZ2VtZW50L3Rlc3QvY29tbW9uL2V4dGVuc2lvbk5scy50ZXN0LnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOzs7Z0dBR2dHOzs7O0lBVWhHLE1BQU0sUUFBUSxHQUF1QjtRQUNwQyxJQUFJLEVBQUUsTUFBTTtRQUNaLFNBQVMsRUFBRSxNQUFNO1FBQ2pCLE9BQU8sRUFBRSxPQUFPO1FBQ2hCLE9BQU8sRUFBRTtZQUNSLE1BQU0sRUFBRSxHQUFHO1NBQ1g7UUFDRCxXQUFXLEVBQUU7WUFDWixRQUFRLEVBQUU7Z0JBQ1Q7b0JBQ0MsT0FBTyxFQUFFLGNBQWM7b0JBQ3ZCLEtBQUssRUFBRSxzQkFBc0I7b0JBQzdCLFFBQVEsRUFBRSx5QkFBeUI7aUJBQ25DO2FBQ0Q7WUFDRCxjQUFjLEVBQUU7Z0JBQ2Y7b0JBQ0MsRUFBRSxFQUFFLHFCQUFxQjtvQkFDekIsS0FBSyxFQUFFLDZCQUE2QjtpQkFDcEM7YUFDRDtZQUNELGFBQWEsRUFBRTtnQkFDZCw2Q0FBNkM7Z0JBQzdDLEtBQUssRUFBRSw0QkFBNEI7Z0JBQ25DLFVBQVUsRUFBRTtvQkFDWCxvQkFBb0IsRUFBRTt3QkFDckIsSUFBSSxFQUFFLFFBQVE7d0JBQ2QsV0FBVyxFQUFFLGVBQWU7cUJBQzVCO2lCQUNEO2FBQ0Q7U0FDRDtLQUNELENBQUM7SUFFRixLQUFLLENBQUMsbUJBQW1CLEVBQUUsR0FBRyxFQUFFO1FBQy9CLE1BQU0sS0FBSyxHQUFHLElBQUEsK0NBQXVDLEdBQUUsQ0FBQztRQUN4RCxJQUFJLENBQUMsMkJBQTJCLEVBQUU7WUFDakMsTUFBTSxpQkFBaUIsR0FBRyxJQUFBLCtCQUFnQixFQUN6QyxLQUFLLENBQUMsR0FBRyxDQUFDLElBQUksZ0JBQVUsRUFBRSxDQUFDLEVBQzNCLElBQUEsbUJBQVMs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