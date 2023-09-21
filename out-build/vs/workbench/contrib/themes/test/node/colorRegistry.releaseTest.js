/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/platform/registry/common/platform", "vs/platform/theme/common/colorRegistry", "vs/platform/request/common/request", "vs/base/node/pfs", "vs/base/common/path", "assert", "vs/base/common/cancellation", "vs/platform/request/node/requestService", "vs/platform/configuration/test/common/testConfigurationService", "vs/platform/log/common/log", "vs/base/test/common/mock", "vs/base/common/network", "vs/workbench/test/common/workbenchTestServices", "vs/workbench/workbench.desktop.main"], function (require, exports, platform_1, colorRegistry_1, request_1, pfs, path, assert, cancellation_1, requestService_1, testConfigurationService_1, log_1, mock_1, network_1, workbenchTestServices_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.$agc = void 0;
    exports.$agc = []; // 'settings.modifiedItemForeground', 'editorUnnecessary.foreground' ];
    const knwonVariablesFileName = 'vscode-known-variables.json';
    suite('Color Registry', function () {
        test(`update colors in ${knwonVariablesFileName}`, async function () {
            const varFilePath = network_1.$2f.asFileUri(`vs/../../build/lib/stylelint/${knwonVariablesFileName}`).fsPath;
            const content = (await pfs.Promises.readFile(varFilePath)).toString();
            const variablesInfo = JSON.parse(content);
            const colorsArray = variablesInfo.colors;
            assert.ok(colorsArray && colorsArray.length > 0, '${knwonVariablesFileName} contains no color descriptions');
            const colors = new Set(colorsArray);
            const updatedColors = [];
            const missing = [];
            const themingRegistry = platform_1.$8m.as(colorRegistry_1.$rv.ColorContribution);
            for (const color of themingRegistry.getColors()) {
                const id = (0, colorRegistry_1.$ov)(color.id);
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
                assert.fail(`\n\Updating ${path.$7d(varFilePath)}.\nPlease verify and commit.\n\n${errorText}\n`);
            }
        });
        test('all colors listed in theme-color.md', async function () {
            // avoid importing the TestEnvironmentService as it brings in a duplicate registration of the file editor input factory.
            const environmentService = new class extends (0, mock_1.$rT)() {
                constructor() {
                    super(...arguments);
                    this.args = { _: [] };
                }
            };
            const docUrl = 'https://raw.githubusercontent.com/microsoft/vscode-docs/main/api/references/theme-color.md';
            const reqContext = await new requestService_1.$Oq(new testConfigurationService_1.$G0b(), environmentService, new log_1.$fj(), new workbenchTestServices_1.$4dc()).request({ url: docUrl }, cancellation_1.CancellationToken.None);
            const content = (await (0, request_1.$No)(reqContext));
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
            const themingRegistry = platform_1.$8m.as(colorRegistry_1.$rv.ColorContribution);
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
            for (const colorId of exports.$agc) {
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
        const extPath = network_1.$2f.asFileUri('vs/../../extensions').fsPath;
        const extFolders = await pfs.Promises.readDirsInDir(extPath);
        const result = Object.create(null);
        for (const folder of extFolders) {
            try {
                const packageJSON = JSON.parse((await pfs.Promises.readFile(path.$9d(extPath, folder, 'package.json'))).toString());
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
//# sourceMappingURL=colorRegistry.releaseTest.js.map