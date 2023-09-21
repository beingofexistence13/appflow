/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "assert", "vs/base/common/codicons", "vs/base/test/common/utils", "vs/platform/terminal/common/terminalProfiles"], function (require, exports, assert_1, codicons_1, utils_1, terminalProfiles_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    suite('terminalProfiles', () => {
        (0, utils_1.ensureNoDisposablesAreLeakedInTestSuite)();
        suite('createProfileSchemaEnums', () => {
            test('should return an empty array when there are no profiles', () => {
                (0, assert_1.deepStrictEqual)((0, terminalProfiles_1.createProfileSchemaEnums)([]), {
                    values: [
                        null
                    ],
                    markdownDescriptions: [
                        'Automatically detect the default'
                    ]
                });
            });
            test('should return a single entry when there is one profile', () => {
                const profile = {
                    profileName: 'name',
                    path: 'path',
                    isDefault: true
                };
                (0, assert_1.deepStrictEqual)((0, terminalProfiles_1.createProfileSchemaEnums)([profile]), {
                    values: [
                        null,
                        'name'
                    ],
                    markdownDescriptions: [
                        'Automatically detect the default',
                        '$(terminal) name\n- path: path'
                    ]
                });
            });
            test('should show all profile information', () => {
                const profile = {
                    profileName: 'name',
                    path: 'path',
                    isDefault: true,
                    args: ['a', 'b'],
                    color: 'terminal.ansiRed',
                    env: {
                        c: 'd',
                        e: 'f'
                    },
                    icon: codicons_1.Codicon.zap,
                    overrideName: true
                };
                (0, assert_1.deepStrictEqual)((0, terminalProfiles_1.createProfileSchemaEnums)([profile]), {
                    values: [
                        null,
                        'name'
                    ],
                    markdownDescriptions: [
                        'Automatically detect the default',
                        `$(zap) name\n- path: path\n- args: ['a','b']\n- overrideName: true\n- color: terminal.ansiRed\n- env: {\"c\":\"d\",\"e\":\"f\"}`
                    ]
                });
            });
            test('should return a multiple entries when there are multiple profiles', () => {
                const profile1 = {
                    profileName: 'name',
                    path: 'path',
                    isDefault: true
                };
                const profile2 = {
                    profileName: 'foo',
                    path: 'bar',
                    isDefault: false
                };
                (0, assert_1.deepStrictEqual)((0, terminalProfiles_1.createProfileSchemaEnums)([profile1, profile2]), {
                    values: [
                        null,
                        'name',
                        'foo'
                    ],
                    markdownDescriptions: [
                        'Automatically detect the default',
                        '$(terminal) name\n- path: path',
                        '$(terminal) foo\n- path: bar'
                    ]
                });
            });
        });
    });
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidGVybWluYWxQcm9maWxlcy50ZXN0LmpzIiwic291cmNlUm9vdCI6ImZpbGU6Ly8vd29ya3NwYWNlL2FwcGZsb3cvc3JjLyIsInNvdXJjZXMiOlsidnMvcGxhdGZvcm0vdGVybWluYWwvdGVzdC9jb21tb24vdGVybWluYWxQcm9maWxlcy50ZXN0LnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOzs7Z0dBR2dHOzs7O0lBUWhHLEtBQUssQ0FBQyxrQkFBa0IsRUFBRSxHQUFHLEVBQUU7UUFDOUIsSUFBQSwrQ0FBdUMsR0FBRSxDQUFDO1FBRTFDLEtBQUssQ0FBQywwQkFBMEIsRUFBRSxHQUFHLEVBQUU7WUFDdEMsSUFBSSxDQUFDLHlEQUF5RCxFQUFFLEdBQUcsRUFBRTtnQkFDcEUsSUFBQSx3QkFBZSxFQUFDLElBQUEsMkNBQXdCLEVBQUMsRUFBRSxDQUFDLEVBQUU7b0JBQzdDLE1BQU0sRUFBRTt3QkFDUCxJQUFJO3FCQUNKO29CQUNELG9CQUFvQixFQUFFO3dCQUNyQixrQ0FBa0M7cUJBQ2xDO2lCQUNELENBQUMsQ0FBQztZQUNKLENBQUMsQ0FBQyxDQUFDO1lBQ0gsSUFBSSxDQUFDLHdEQUF3RCxFQUFFLEdBQUcsRUFBRTtnQkFDbkUsTUFBTSxPQUFPLEdBQXFCO29CQUNqQyxXQUFXLEVBQUUsTUFBTTtvQkFDbkIsSUFBSSxFQUFFLE1BQU07b0JBQ1osU0FBUyxFQUFFLElBQUk7aUJBQ2YsQ0FBQztnQkFDRixJQUFBLHdCQUFlLEVBQUMsSUFBQSwyQ0FBd0IsRUFBQyxDQUFDLE9BQU8sQ0FBQyxDQUFDLEVBQUU7b0JBQ3BELE1BQU0sRUFBRTt3QkFDUCxJQUFJO3dCQUNKLE1BQU07cUJBQ047b0JBQ0Qsb0JBQW9CLEVBQUU7d0JBQ3JCLGtDQUFrQzt3QkFDbEMsZ0NBQWdDO3FCQUNoQztpQkFDRCxDQUFDLENBQUM7WUFDSixDQUFDLENBQUMsQ0FBQztZQUNILElBQUksQ0FBQyxxQ0FBcUMsRUFBRSxHQUFHLEVBQUU7Z0JBQ2hELE1BQU0sT0FBTyxHQUFxQjtvQkFDakMsV0FBVyxFQUFFLE1BQU07b0JBQ25CLElBQUksRUFBRSxNQUFNO29CQUNaLFNBQVMsRUFBRSxJQUFJO29CQUNmLElBQUksRUFBRSxDQUFDLEdBQUcsRUFBRSxHQUFHLENBQUM7b0JBQ2hCLEtBQUssRUFBRSxrQkFBa0I7b0JBQ3pCLEdBQUcsRUFBRTt3QkFDSixDQUFDLEVBQUUsR0FBRzt3QkFDTixDQUFDLEVBQUUsR0FBRztxQkFDTjtvQkFDRCxJQUFJLEVBQUUsa0JBQU8sQ0FBQyxHQUFHO29CQUNqQixZQUFZLEVBQUUsSUFBSTtpQkFDbEIsQ0FBQztnQkFDRixJQUFBLHdCQUFlLEVBQUMsSUFBQSwyQ0FBd0IsRUFBQyxDQUFDLE9BQU8sQ0FBQyxDQUFDLEVBQUU7b0JBQ3BELE1BQU0sRUFBRTt3QkFDUCxJQUFJO3dCQUNKLE1BQU07cUJBQ047b0JBQ0Qsb0JBQW9CLEVBQUU7d0JBQ3JCLGtDQUFrQzt3QkFDbEMsaUlBQWlJO3FCQUNqSTtpQkFDRCxDQUFDLENBQUM7WUFDSixDQUFDLENBQUMsQ0FBQztZQUNILElBQUksQ0FBQyxtRUFBbUUsRUFBRSxHQUFHLEVBQUU7Z0JBQzlFLE1BQU0sUUFBUSxHQUFxQjtvQkFDbEMsV0FBVyxFQUFFLE1BQU07b0JBQ25CLElBQUksRUFBRSxNQUFNO29CQUNaLFNBQVMsRUFBRSxJQUFJO2lCQUNmLENBQUM7Z0JBQ0YsTUFBTSxRQUFRLEdBQXFCO29CQUNsQyxXQUFXLEVBQUUsS0FBSztvQkFDbEIsSUFBSSxFQUFFLEtBQUs7b0JBQ1gsU0FBUyxFQUFFLEtBQUs7aUJBQ2hCLENBQUM7Z0JBQ0YsSUFBQSx3QkFBZSxFQUFDLElBQUEsMkNBQXdCLEVBQUMsQ0FBQyxRQUFRLEVBQUUsUUFBUSxDQUFDLENBQUMsRUFBRTtvQkFDL0QsTUFBTSxFQUFFO3dCQUNQLElBQUk7d0JBQ0osTUFBTTt3QkFDTixLQUFLO3FCQUNMO29CQUNELG9CQUFvQixFQUFFO3dCQUNyQixrQ0FBa0M7d0JBQ2xDLGdDQUFnQzt3QkFDaEMsOEJBQThCO3FCQUM5QjtpQkFDRCxDQUFDLENBQUM7WUFDSixDQUFDLENBQUMsQ0FBQztRQUNKLENBQUMsQ0FBQyxDQUFDO0lBQ0osQ0FBQyxDQUFDLENBQUMifQ==