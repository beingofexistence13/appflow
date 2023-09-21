/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "assert", "vs/nls!vs/platform/environment/node/argvHelper", "vs/platform/environment/node/argv"], function (require, exports, assert, nls_1, argv_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.$Gl = exports.$Fl = exports.$El = exports.$Dl = void 0;
    function parseAndValidate(cmdLineArgs, reportWarnings) {
        const onMultipleValues = (id, val) => {
            console.warn((0, nls_1.localize)(0, null, id, val));
        };
        const onEmptyValue = (id) => {
            console.warn((0, nls_1.localize)(1, null, id));
        };
        const onDeprecatedOption = (deprecatedOption, message) => {
            console.warn((0, nls_1.localize)(2, null, deprecatedOption, message));
        };
        const getSubcommandReporter = (command) => ({
            onUnknownOption: (id) => {
                if (!argv_1.$xl.includes(command)) {
                    console.warn((0, nls_1.localize)(3, null, id, command));
                }
            },
            onMultipleValues,
            onEmptyValue,
            onDeprecatedOption,
            getSubcommandReporter: argv_1.$xl.includes(command) ? getSubcommandReporter : undefined
        });
        const errorReporter = {
            onUnknownOption: (id) => {
                console.warn((0, nls_1.localize)(4, null, id));
            },
            onMultipleValues,
            onEmptyValue,
            onDeprecatedOption,
            getSubcommandReporter
        };
        const args = (0, argv_1.$zl)(cmdLineArgs, argv_1.$yl, reportWarnings ? errorReporter : undefined);
        if (args.goto) {
            args._.forEach(arg => assert(/^(\w:)?[^:]+(:\d*){0,2}:?$/.test(arg), (0, nls_1.localize)(5, null)));
        }
        return args;
    }
    function stripAppPath(argv) {
        const index = argv.findIndex(a => !/^-/.test(a));
        if (index > -1) {
            return [...argv.slice(0, index), ...argv.slice(index + 1)];
        }
        return undefined;
    }
    /**
     * Use this to parse raw code process.argv such as: `Electron . --verbose --wait`
     */
    function $Dl(processArgv) {
        let [, ...args] = processArgv;
        // If dev, remove the first non-option argument: it's the app location
        if (process.env['VSCODE_DEV']) {
            args = stripAppPath(args) || [];
        }
        // If called from CLI, don't report warnings as they are already reported.
        const reportWarnings = !$Gl(process.env);
        return parseAndValidate(args, reportWarnings);
    }
    exports.$Dl = $Dl;
    /**
     * Use this to parse raw code CLI process.argv such as: `Electron cli.js . --verbose --wait`
     */
    function $El(processArgv) {
        let [, , ...args] = processArgv; // remove the first non-option argument: it's always the app location
        // If dev, remove the first non-option argument: it's the app location
        if (process.env['VSCODE_DEV']) {
            args = stripAppPath(args) || [];
        }
        return parseAndValidate(args, true);
    }
    exports.$El = $El;
    function $Fl(argv, ...args) {
        const endOfArgsMarkerIndex = argv.indexOf('--');
        if (endOfArgsMarkerIndex === -1) {
            argv.push(...args);
        }
        else {
            // if the we have an argument "--" (end of argument marker)
            // we cannot add arguments at the end. rather, we add
            // arguments before the "--" marker.
            argv.splice(endOfArgsMarkerIndex, 0, ...args);
        }
        return argv;
    }
    exports.$Fl = $Fl;
    function $Gl(env) {
        return env['VSCODE_CLI'] === '1';
    }
    exports.$Gl = $Gl;
});
//# sourceMappingURL=argvHelper.js.map