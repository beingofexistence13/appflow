/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/platform/registry/common/platform", "vs/platform/theme/common/colorRegistry", "vs/platform/request/common/request", "vs/base/node/pfs", "vs/base/common/path", "assert", "vs/base/common/cancellation", "vs/platform/request/node/requestService", "vs/platform/configuration/test/common/testConfigurationService", "vs/platform/log/common/log", "vs/base/test/common/mock", "vs/base/common/network", "vs/workbench/test/common/workbenchTestServices", "vs/workbench/workbench.desktop.main"], function (require, exports, platform_1, colorRegistry_1, request_1, pfs, path, assert, cancellation_1, requestService_1, testConfigurationService_1, log_1, mock_1, network_1, workbenchTestServices_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.experimental = void 0;
    exports.experimental = []; // 'settings.modifiedItemForeground', 'editorUnnecessary.foreground' ];
    const knwonVariablesFileName = 'vscode-known-variables.json';
    suite('Color Registry', function () {
        test(`update colors in ${knwonVariablesFileName}`, async function () {
            const varFilePath = network_1.FileAccess.asFileUri(`vs/../../build/lib/stylelint/${knwonVariablesFileName}`).fsPath;
            const content = (await pfs.Promises.readFile(varFilePath)).toString();
            const variablesInfo = JSON.parse(content);
            const colorsArray = variablesInfo.colors;
            assert.ok(colorsArray && colorsArray.length > 0, '${knwonVariablesFileName} contains no color descriptions');
            const colors = new Set(colorsArray);
            const updatedColors = [];
            const missing = [];
            const themingRegistry = platform_1.Registry.as(colorRegistry_1.Extensions.ColorContribution);
            for (const color of themingRegistry.getColors()) {
                const id = (0, colorRegistry_1.asCssVariableName)(color.id);
                if (!colors.has(id)) {
                    if (!color.deprecationMessage) {
                        missing.push(id);
                    }
                }
                else {
                    colors.delete(id);
                }
                updatedColors.push(id);
            }
            const superfluousKeys = [...colors.keys()];
            let errorText = '';
            if (missing.length > 0) {
                errorText += `\n\Adding the following colors:\n\n${JSON.stringify(missing, undefined, '\t')}\n`;
            }
            if (superfluousKeys.length > 0) {
                errorText += `\n\Removing the following colors:\n\n${superfluousKeys.join('\n')}\n`;
            }
            if (errorText.length > 0) {
                updatedColors.sort();
                variablesInfo.colors = updatedColors;
                await pfs.Promises.writeFile(varFilePath, JSON.stringify(variablesInfo, undefined, '\t'));
                assert.fail(`\n\Updating ${path.normalize(varFilePath)}.\nPlease verify and commit.\n\n${errorText}\n`);
            }
        });
        test('all colors listed in theme-color.md', async function () {
            // avoid importing the TestEnvironmentService as it brings in a duplicate registration of the file editor input factory.
            const environmentService = new class extends (0, mock_1.mock)() {
                constructor() {
                    super(...arguments);
                    this.args = { _: [] };
                }
            };
            const docUrl = 'https://raw.githubusercontent.com/microsoft/vscode-docs/main/api/references/theme-color.md';
            const reqContext = await new requestService_1.RequestService(new testConfigurationService_1.TestConfigurationService(), environmentService, new log_1.NullLogService(), new workbenchTestServices_1.TestLoggerService()).request({ url: docUrl }, cancellation_1.CancellationToken.None);
            const content = (await (0, request_1.asTextOrError)(reqContext));
            const expression = /-\s*\`([\w\.]+)\`: (.*)/g;
            let m;
            const colorsInDoc = Object.create(null);
            let nColorsInDoc = 0;
            while (m = expression.exec(content)) {
                colorsInDoc[m[1]] = { description: m[2], offset: m.index, length: m.length };
                nColorsInDoc++;
            }
            assert.ok(nColorsInDoc > 0, 'theme-color.md contains to color descriptions');
            const missing = Object.create(null);
            const descriptionDiffs = Object.create(null);
            const themingRegistry = platform_1.Registry.as(colorRegistry_1.Extensions.ColorContribution);
            for (const color of themingRegistry.getColors()) {
                if (!colorsInDoc[color.id]) {
                    if (!color.deprecationMessage) {
                        missing[color.id] = getDescription(color);
                    }
                }
                else {
                    const docDescription = colorsInDoc[color.id].description;
                    const specDescription = getDescription(color);
                    if (docDescription !== specDescription) {
                        descriptionDiffs[color.id] = { docDescription, specDescription };
                    }
                    delete colorsInDoc[color.id];
                }
            }
            const colorsInExtensions = await getColorsFromExtension();
            for (const colorId in colorsInExtensions) {
                if (!colorsInDoc[colorId]) {
                    missing[colorId] = colorsInExtensions[colorId];
                }
                else {
                    delete colorsInDoc[colorId];
                }
            }
            for (const colorId of exports.experimental) {
                if (missing[colorId]) {
                    delete missing[colorId];
                }
                if (colorsInDoc[colorId]) {
                    assert.fail(`Color ${colorId} found in doc but marked experimental. Please remove from experimental list.`);
                }
            }
            const superfluousKeys = Object.keys(colorsInDoc);
            const undocumentedKeys = Object.keys(missing).map(k => `\`${k}\`: ${missing[k]}`);
            let errorText = '';
            if (undocumentedKeys.length > 0) {
                errorText += `\n\nAdd the following colors:\n\n${undocumentedKeys.join('\n')}\n`;
            }
            if (superfluousKeys.length > 0) {
                errorText += `\n\Remove the following colors:\n\n${superfluousKeys.join('\n')}\n`;
            }
            if (errorText.length > 0) {
                assert.fail(`\n\nOpen https://github.dev/microsoft/vscode-docs/blob/vnext/api/references/theme-color.md#50${errorText}`);
            }
        });
    });
    function getDescription(color) {
        let specDescription = color.description;
        if (color.deprecationMessage) {
            specDescription = specDescription + ' ' + color.deprecationMessage;
        }
        return specDescription;
    }
    async function getColorsFromExtension() {
        const extPath = network_1.FileAccess.asFileUri('vs/../../extensions').fsPath;
        const extFolders = await pfs.Promises.readDirsInDir(extPath);
        const result = Object.create(null);
        for (const folder of extFolders) {
            try {
                const packageJSON = JSON.parse((await pfs.Promises.readFile(path.join(extPath, folder, 'package.json'))).toString());
                const contributes = packageJSON['contributes'];
                if (contributes) {
                    const colors = contributes['colors'];
                    if (colors) {
                        for (const color of colors) {
                            const colorId = color['id'];
                            if (colorId) {
                                result[colorId] = colorId['description'];
                            }
                        }
                    }
                }
            }
            catch (e) {
                // ignore
            }
        }
        return result;
    }
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY29sb3JSZWdpc3RyeS5yZWxlYXNlVGVzdC5qcyIsInNvdXJjZVJvb3QiOiJmaWxlOi8vL3dvcmtzcGFjZS9hcHBmbG93L3NyYy8iLCJzb3VyY2VzIjpbInZzL3dvcmtiZW5jaC9jb250cmliL3RoZW1lcy90ZXN0L25vZGUvY29sb3JSZWdpc3RyeS5yZWxlYXNlVGVzdC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7O2dHQUdnRzs7Ozs7SUE4Qm5GLFFBQUEsWUFBWSxHQUFhLEVBQUUsQ0FBQyxDQUFDLHVFQUF1RTtJQUdqSCxNQUFNLHNCQUFzQixHQUFHLDZCQUE2QixDQUFDO0lBRTdELEtBQUssQ0FBQyxnQkFBZ0IsRUFBRTtRQUV2QixJQUFJLENBQUMsb0JBQW9CLHNCQUFzQixFQUFFLEVBQUUsS0FBSztZQUN2RCxNQUFNLFdBQVcsR0FBRyxvQkFBVSxDQUFDLFNBQVMsQ0FBQyxnQ0FBZ0Msc0JBQXNCLEVBQUUsQ0FBQyxDQUFDLE1BQU0sQ0FBQztZQUMxRyxNQUFNLE9BQU8sR0FBRyxDQUFDLE1BQU0sR0FBRyxDQUFDLFFBQVEsQ0FBQyxRQUFRLENBQUMsV0FBVyxDQUFDLENBQUMsQ0FBQyxRQUFRLEVBQUUsQ0FBQztZQUV0RSxNQUFNLGFBQWEsR0FBRyxJQUFJLENBQUMsS0FBSyxDQUFDLE9BQU8sQ0FBQyxDQUFDO1lBRTFDLE1BQU0sV0FBVyxHQUFHLGFBQWEsQ0FBQyxNQUFrQixDQUFDO1lBRXJELE1BQU0sQ0FBQyxFQUFFLENBQUMsV0FBVyxJQUFJLFdBQVcsQ0FBQyxNQUFNLEdBQUcsQ0FBQyxFQUFFLDBEQUEwRCxDQUFDLENBQUM7WUFFN0csTUFBTSxNQUFNLEdBQUcsSUFBSSxHQUFHLENBQUMsV0FBVyxDQUFDLENBQUM7WUFFcEMsTUFBTSxhQUFhLEdBQUcsRUFBRSxDQUFDO1lBQ3pCLE1BQU0sT0FBTyxHQUFHLEVBQUUsQ0FBQztZQUNuQixNQUFNLGVBQWUsR0FBRyxtQkFBUSxDQUFDLEVBQUUsQ0FBaUIsMEJBQVUsQ0FBQyxpQkFBaUIsQ0FBQyxDQUFDO1lBQ2xGLEtBQUssTUFBTSxLQUFLLElBQUksZUFBZSxDQUFDLFNBQVMsRUFBRSxFQUFFO2dCQUNoRCxNQUFNLEVBQUUsR0FBRyxJQUFBLGlDQUFpQixFQUFDLEtBQUssQ0FBQyxFQUFFLENBQUMsQ0FBQztnQkFFdkMsSUFBSSxDQUFDLE1BQU0sQ0FBQyxHQUFHLENBQUMsRUFBRSxDQUFDLEVBQUU7b0JBQ3BCLElBQUksQ0FBQyxLQUFLLENBQUMsa0JBQWtCLEVBQUU7d0JBQzlCLE9BQU8sQ0FBQyxJQUFJLENBQUMsRUFBRSxDQUFDLENBQUM7cUJBQ2pCO2lCQUNEO3FCQUFNO29CQUNOLE1BQU0sQ0FBQyxNQUFNLENBQUMsRUFBRSxDQUFDLENBQUM7aUJBQ2xCO2dCQUNELGFBQWEsQ0FBQyxJQUFJLENBQUMsRUFBRSxDQUFDLENBQUM7YUFDdkI7WUFFRCxNQUFNLGVBQWUsR0FBRyxDQUFDLEdBQUcsTUFBTSxDQUFDLElBQUksRUFBRSxDQUFDLENBQUM7WUFFM0MsSUFBSSxTQUFTLEdBQUcsRUFBRSxDQUFDO1lBQ25CLElBQUksT0FBTyxDQUFDLE1BQU0sR0FBRyxDQUFDLEVBQUU7Z0JBQ3ZCLFNBQVMsSUFBSSxzQ0FBc0MsSUFBSSxDQUFDLFNBQVMsQ0FBQyxPQUFPLEVBQUUsU0FBUyxFQUFFLElBQUksQ0FBQyxJQUFJLENBQUM7YUFDaEc7WUFDRCxJQUFJLGVBQWUsQ0FBQyxNQUFNLEdBQUcsQ0FBQyxFQUFFO2dCQUMvQixTQUFTLElBQUksd0NBQXdDLGVBQWUsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQzthQUNwRjtZQUVELElBQUksU0FBUyxDQUFDLE1BQU0sR0FBRyxDQUFDLEVBQUU7Z0JBQ3pCLGFBQWEsQ0FBQyxJQUFJLEVBQUUsQ0FBQztnQkFDckIsYUFBYSxDQUFDLE1BQU0sR0FBRyxhQUFhLENBQUM7Z0JBQ3JDLE1BQU0sR0FBRyxDQUFDLFFBQVEsQ0FBQyxTQUFTLENBQUMsV0FBVyxFQUFFLElBQUksQ0FBQyxTQUFTLENBQUMsYUFBYSxFQUFFLFNBQVMsRUFBRSxJQUFJLENBQUMsQ0FBQyxDQUFDO2dCQUUxRixNQUFNLENBQUMsSUFBSSxDQUFDLGVBQWUsSUFBSSxDQUFDLFNBQVMsQ0FBQyxXQUFXLENBQUMsbUNBQW1DLFNBQVMsSUFBSSxDQUFDLENBQUM7YUFDeEc7UUFDRixDQUFDLENBQUMsQ0FBQztRQUVILElBQUksQ0FBQyxxQ0FBcUMsRUFBRSxLQUFLO1lBQ2hELHdIQUF3SDtZQUN4SCxNQUFNLGtCQUFrQixHQUFHLElBQUksS0FBTSxTQUFRLElBQUEsV0FBSSxHQUE2QjtnQkFBL0M7O29CQUEyRCxTQUFJLEdBQUcsRUFBRSxDQUFDLEVBQUUsRUFBRSxFQUFFLENBQUM7Z0JBQUMsQ0FBQzthQUFBLENBQUM7WUFFOUcsTUFBTSxNQUFNLEdBQUcsNEZBQTRGLENBQUM7WUFFNUcsTUFBTSxVQUFVLEdBQUcsTUFBTSxJQUFJLCtCQUFjLENBQUMsSUFBSSxtREFBd0IsRUFBRSxFQUFFLGtCQUFrQixFQUFFLElBQUksb0JBQWMsRUFBRSxFQUFFLElBQUkseUNBQWlCLEVBQUUsQ0FBQyxDQUFDLE9BQU8sQ0FBQyxFQUFFLEdBQUcsRUFBRSxNQUFNLEVBQUUsRUFBRSxnQ0FBaUIsQ0FBQyxJQUFJLENBQUMsQ0FBQztZQUNoTSxNQUFNLE9BQU8sR0FBRyxDQUFDLE1BQU0sSUFBQSx1QkFBYSxFQUFDLFVBQVUsQ0FBQyxDQUFFLENBQUM7WUFFbkQsTUFBTSxVQUFVLEdBQUcsMEJBQTBCLENBQUM7WUFFOUMsSUFBSSxDQUF5QixDQUFDO1lBQzlCLE1BQU0sV0FBVyxHQUFnQyxNQUFNLENBQUMsTUFBTSxDQUFDLElBQUksQ0FBQyxDQUFDO1lBQ3JFLElBQUksWUFBWSxHQUFHLENBQUMsQ0FBQztZQUNyQixPQUFPLENBQUMsR0FBRyxVQUFVLENBQUMsSUFBSSxDQUFDLE9BQU8sQ0FBQyxFQUFFO2dCQUNwQyxXQUFXLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLEdBQUcsRUFBRSxXQUFXLEVBQUUsQ0FBQyxDQUFDLENBQUMsQ0FBQyxFQUFFLE1BQU0sRUFBRSxDQUFDLENBQUMsS0FBSyxFQUFFLE1BQU0sRUFBRSxDQUFDLENBQUMsTUFBTSxFQUFFLENBQUM7Z0JBQzdFLFlBQVksRUFBRSxDQUFDO2FBQ2Y7WUFDRCxNQUFNLENBQUMsRUFBRSxDQUFDLFlBQVksR0FBRyxDQUFDLEVBQUUsK0NBQStDLENBQUMsQ0FBQztZQUU3RSxNQUFNLE9BQU8sR0FBRyxNQUFNLENBQUMsTUFBTSxDQUFDLElBQUksQ0FBQyxDQUFDO1lBQ3BDLE1BQU0sZ0JBQWdCLEdBQXNDLE1BQU0sQ0FBQyxNQUFNLENBQUMsSUFBSSxDQUFDLENBQUM7WUFFaEYsTUFBTSxlQUFlLEdBQUcsbUJBQVEsQ0FBQyxFQUFFLENBQWlCLDBCQUFVLENBQUMsaUJBQWlCLENBQUMsQ0FBQztZQUNsRixLQUFLLE1BQU0sS0FBSyxJQUFJLGVBQWUsQ0FBQyxTQUFTLEVBQUUsRUFBRTtnQkFDaEQsSUFBSSxDQUFDLFdBQVcsQ0FBQyxLQUFLLENBQUMsRUFBRSxDQUFDLEVBQUU7b0JBQzNCLElBQUksQ0FBQyxLQUFLLENBQUMsa0JBQWtCLEVBQUU7d0JBQzlCLE9BQU8sQ0FBQyxLQUFLLENBQUMsRUFBRSxDQUFDLEdBQUcsY0FBYyxDQUFDLEtBQUssQ0FBQyxDQUFDO3FCQUMxQztpQkFDRDtxQkFBTTtvQkFDTixNQUFNLGNBQWMsR0FBRyxXQUFXLENBQUMsS0FBSyxDQUFDLEVBQUUsQ0FBQyxDQUFDLFdBQVcsQ0FBQztvQkFDekQsTUFBTSxlQUFlLEdBQUcsY0FBYyxDQUFDLEtBQUssQ0FBQyxDQUFDO29CQUM5QyxJQUFJLGNBQWMsS0FBSyxlQUFlLEVBQUU7d0JBQ3ZDLGdCQUFnQixDQUFDLEtBQUssQ0FBQyxFQUFFLENBQUMsR0FBRyxFQUFFLGNBQWMsRUFBRSxlQUFlLEVBQUUsQ0FBQztxQkFDakU7b0JBQ0QsT0FBTyxXQUFXLENBQUMsS0FBSyxDQUFDLEVBQUUsQ0FBQyxDQUFDO2lCQUM3QjthQUNEO1lBQ0QsTUFBTSxrQkFBa0IsR0FBRyxNQUFNLHNCQUFzQixFQUFFLENBQUM7WUFDMUQsS0FBSyxNQUFNLE9BQU8sSUFBSSxrQkFBa0IsRUFBRTtnQkFDekMsSUFBSSxDQUFDLFdBQVcsQ0FBQyxPQUFPLENBQUMsRUFBRTtvQkFDMUIsT0FBTyxDQUFDLE9BQU8sQ0FBQyxHQUFHLGtCQUFrQixDQUFDLE9BQU8sQ0FBQyxDQUFDO2lCQUMvQztxQkFBTTtvQkFDTixPQUFPLFdBQVcsQ0FBQyxPQUFPLENBQUMsQ0FBQztpQkFDNUI7YUFDRDtZQUNELEtBQUssTUFBTSxPQUFPLElBQUksb0JBQVksRUFBRTtnQkFDbkMsSUFBSSxPQUFPLENBQUMsT0FBTyxDQUFDLEVBQUU7b0JBQ3JCLE9BQU8sT0FBTyxDQUFDLE9BQU8sQ0FBQyxDQUFDO2lCQUN4QjtnQkFDRCxJQUFJLFdBQVcsQ0FBQyxPQUFPLENBQUMsRUFBRTtvQkFDekIsTUFBTSxDQUFDLElBQUksQ0FBQyxTQUFTLE9BQU8sOEVBQThFLENBQUMsQ0FBQztpQkFDNUc7YUFDRDtZQUNELE1BQU0sZUFBZSxHQUFHLE1BQU0sQ0FBQyxJQUFJLENBQUMsV0FBVyxDQUFDLENBQUM7WUFDakQsTUFBTSxnQkFBZ0IsR0FBRyxNQUFNLENBQUMsSUFBSSxDQUFDLE9BQU8sQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsRUFBRSxDQUFDLEtBQUssQ0FBQyxPQUFPLE9BQU8sQ0FBQyxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUM7WUFHbEYsSUFBSSxTQUFTLEdBQUcsRUFBRSxDQUFDO1lBQ25CLElBQUksZ0JBQWdCLENBQUMsTUFBTSxHQUFHLENBQUMsRUFBRTtnQkFDaEMsU0FBUyxJQUFJLG9DQUFvQyxnQkFBZ0IsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQzthQUNqRjtZQUNELElBQUksZUFBZSxDQUFDLE1BQU0sR0FBRyxDQUFDLEVBQUU7Z0JBQy9CLFNBQVMsSUFBSSxzQ0FBc0MsZUFBZSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDO2FBQ2xGO1lBRUQsSUFBSSxTQUFTLENBQUMsTUFBTSxHQUFHLENBQUMsRUFBRTtnQkFDekIsTUFBTSxDQUFDLElBQUksQ0FBQyxnR0FBZ0csU0FBUyxFQUFFLENBQUMsQ0FBQzthQUN6SDtRQUNGLENBQUMsQ0FBQyxDQUFDO0lBQ0osQ0FBQyxDQUFDLENBQUM7SUFFSCxTQUFTLGNBQWMsQ0FBQyxLQUF3QjtRQUMvQyxJQUFJLGVBQWUsR0FBRyxLQUFLLENBQUMsV0FBVyxDQUFDO1FBQ3hDLElBQUksS0FBSyxDQUFDLGtCQUFrQixFQUFFO1lBQzdCLGVBQWUsR0FBRyxlQUFlLEdBQUcsR0FBRyxHQUFHLEtBQUssQ0FBQyxrQkFBa0IsQ0FBQztTQUNuRTtRQUNELE9BQU8sZUFBZSxDQUFDO0lBQ3hCLENBQUM7SUFFRCxLQUFLLFVBQVUsc0JBQXNCO1FBQ3BDLE1BQU0sT0FBTyxHQUFHLG9CQUFVLENBQUMsU0FBUyxDQUFDLHFCQUFxQixDQUFDLENBQUMsTUFBTSxDQUFDO1FBQ25FLE1BQU0sVUFBVSxHQUFHLE1BQU0sR0FBRyxDQUFDLFFBQVEsQ0FBQyxhQUFhLENBQUMsT0FBTyxDQUFDLENBQUM7UUFDN0QsTUFBTSxNQUFNLEdBQTZCLE1BQU0sQ0FBQyxNQUFNLENBQUMsSUFBSSxDQUFDLENBQUM7UUFDN0QsS0FBSyxNQUFNLE1BQU0sSUFBSSxVQUFVLEVBQUU7WUFDaEMsSUFBSTtnQkFDSCxNQUFNLFdBQVcsR0FBRyxJQUFJLENBQUMsS0FBSyxDQUFDLENBQUMsTUFBTSxHQUFHLENBQUMsUUFBUSxDQUFDLFFBQVEsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLE9BQU8sRUFBRSxNQUFNLEVBQUUsY0FBYyxDQUFDLENBQUMsQ0FBQyxDQUFDLFFBQVEsRUFBRSxDQUFDLENBQUM7Z0JBQ3JILE1BQU0sV0FBVyxHQUFHLFdBQVcsQ0FBQyxhQUFhLENBQUMsQ0FBQztnQkFDL0MsSUFBSSxXQUFXLEVBQUU7b0JBQ2hCLE1BQU0sTUFBTSxHQUFHLFdBQVcsQ0FBQyxRQUFRLENBQUMsQ0FBQztvQkFDckMsSUFBSSxNQUFNLEVBQUU7d0JBQ1gsS0FBSyxNQUFNLEtBQUssSUFBSSxNQUFNLEVBQUU7NEJBQzNCLE1BQU0sT0FBTyxHQUFHLEtBQUssQ0FBQyxJQUFJLENBQUMsQ0FBQzs0QkFDNUIsSUFBSSxPQUFPLEVBQUU7Z0NBQ1osTUFBTSxDQUFDLE9BQU8sQ0FBQyxHQUFHLE9BQU8sQ0FBQyxhQUFhLENBQUMsQ0FBQzs2QkFDekM7eUJBQ0Q7cUJBQ0Q7aUJBQ0Q7YUFDRDtZQUFDLE9BQU8sQ0FBQyxFQUFFO2dCQUNYLFNBQVM7YUFDVDtTQUVEO1FBQ0QsT0FBTyxNQUFNLENBQUM7SUFDZixDQUFDIn0=