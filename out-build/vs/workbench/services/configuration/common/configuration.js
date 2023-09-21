/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/platform/configuration/common/configuration", "vs/platform/instantiation/common/instantiation"], function (require, exports, configuration_1, instantiation_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.$oE = exports.$nE = exports.$mE = exports.$lE = exports.$kE = exports.$jE = exports.$iE = exports.$hE = exports.$gE = exports.$fE = exports.$eE = exports.$dE = exports.$cE = exports.$bE = exports.$aE = exports.$_D = exports.$$D = exports.$0D = exports.$9D = exports.$8D = exports.$7D = exports.$6D = exports.$5D = exports.$4D = exports.$3D = void 0;
    exports.$3D = '.vscode';
    exports.$4D = 'settings';
    exports.$5D = `${exports.$3D}/${exports.$4D}.json`;
    exports.$6D = 'vscode://schemas/settings/default';
    exports.$7D = 'vscode://schemas/settings/user';
    exports.$8D = 'vscode://schemas/settings/profile';
    exports.$9D = 'vscode://schemas/settings/machine';
    exports.$0D = 'vscode://schemas/settings/workspace';
    exports.$$D = 'vscode://schemas/settings/folder';
    exports.$_D = 'vscode://schemas/launch';
    exports.$aE = 'vscode://schemas/tasks';
    exports.$bE = [1 /* ConfigurationScope.APPLICATION */];
    exports.$cE = [2 /* ConfigurationScope.MACHINE */, 3 /* ConfigurationScope.WINDOW */, 4 /* ConfigurationScope.RESOURCE */, 5 /* ConfigurationScope.LANGUAGE_OVERRIDABLE */, 6 /* ConfigurationScope.MACHINE_OVERRIDABLE */];
    exports.$dE = [3 /* ConfigurationScope.WINDOW */, 4 /* ConfigurationScope.RESOURCE */, 5 /* ConfigurationScope.LANGUAGE_OVERRIDABLE */];
    exports.$eE = [1 /* ConfigurationScope.APPLICATION */, ...exports.$dE];
    exports.$fE = [2 /* ConfigurationScope.MACHINE */, 3 /* ConfigurationScope.WINDOW */, 4 /* ConfigurationScope.RESOURCE */, 5 /* ConfigurationScope.LANGUAGE_OVERRIDABLE */, 6 /* ConfigurationScope.MACHINE_OVERRIDABLE */];
    exports.$gE = [3 /* ConfigurationScope.WINDOW */, 4 /* ConfigurationScope.RESOURCE */, 5 /* ConfigurationScope.LANGUAGE_OVERRIDABLE */, 6 /* ConfigurationScope.MACHINE_OVERRIDABLE */];
    exports.$hE = [4 /* ConfigurationScope.RESOURCE */, 5 /* ConfigurationScope.LANGUAGE_OVERRIDABLE */, 6 /* ConfigurationScope.MACHINE_OVERRIDABLE */];
    exports.$iE = 'tasks';
    exports.$jE = 'launch';
    exports.$kE = Object.create(null);
    exports.$kE[exports.$iE] = `${exports.$3D}/${exports.$iE}.json`;
    exports.$kE[exports.$jE] = `${exports.$3D}/${exports.$jE}.json`;
    exports.$lE = Object.create(null);
    exports.$lE[exports.$iE] = `${exports.$iE}.json`;
    exports.$mE = (0, instantiation_1.$Ch)(configuration_1.$8h);
    exports.$nE = '{\n\t\"version\": \"2.0.0\",\n\t\"tasks\": []\n}';
    exports.$oE = 'workbench.settings.applyToAllProfiles';
});
//# sourceMappingURL=configuration.js.map