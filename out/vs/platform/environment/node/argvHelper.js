/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "assert", "vs/nls", "vs/platform/environment/node/argv"], function (require, exports, assert, nls_1, argv_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.isLaunchedFromCli = exports.addArg = exports.parseCLIProcessArgv = exports.parseMainProcessArgv = void 0;
    function parseAndValidate(cmdLineArgs, reportWarnings) {
        const onMultipleValues = (id, val) => {
            console.warn((0, nls_1.localize)('multipleValues', "Option '{0}' is defined more than once. Using value '{1}'.", id, val));
        };
        const onEmptyValue = (id) => {
            console.warn((0, nls_1.localize)('emptyValue', "Option '{0}' requires a non empty value. Ignoring the option.", id));
        };
        const onDeprecatedOption = (deprecatedOption, message) => {
            console.warn((0, nls_1.localize)('deprecatedArgument', "Option '{0}' is deprecated: {1}", deprecatedOption, message));
        };
        const getSubcommandReporter = (command) => ({
            onUnknownOption: (id) => {
                if (!argv_1.NATIVE_CLI_COMMANDS.includes(command)) {
                    console.warn((0, nls_1.localize)('unknownSubCommandOption', "Warning: '{0}' is not in the list of known options for subcommand '{1}'", id, command));
                }
            },
            onMultipleValues,
            onEmptyValue,
            onDeprecatedOption,
            getSubcommandReporter: argv_1.NATIVE_CLI_COMMANDS.includes(command) ? getSubcommandReporter : undefined
        });
        const errorReporter = {
            onUnknownOption: (id) => {
                console.warn((0, nls_1.localize)('unknownOption', "Warning: '{0}' is not in the list of known options, but still passed to Electron/Chromium.", id));
            },
            onMultipleValues,
            onEmptyValue,
            onDeprecatedOption,
            getSubcommandReporter
        };
        const args = (0, argv_1.parseArgs)(cmdLineArgs, argv_1.OPTIONS, reportWarnings ? errorReporter : undefined);
        if (args.goto) {
            args._.forEach(arg => assert(/^(\w:)?[^:]+(:\d*){0,2}:?$/.test(arg), (0, nls_1.localize)('gotoValidation', "Arguments in `--goto` mode should be in the format of `FILE(:LINE(:CHARACTER))`.")));
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
    function parseMainProcessArgv(processArgv) {
        let [, ...args] = processArgv;
        // If dev, remove the first non-option argument: it's the app location
        if (process.env['VSCODE_DEV']) {
            args = stripAppPath(args) || [];
        }
        // If called from CLI, don't report warnings as they are already reported.
        const reportWarnings = !isLaunchedFromCli(process.env);
        return parseAndValidate(args, reportWarnings);
    }
    exports.parseMainProcessArgv = parseMainProcessArgv;
    /**
     * Use this to parse raw code CLI process.argv such as: `Electron cli.js . --verbose --wait`
     */
    function parseCLIProcessArgv(processArgv) {
        let [, , ...args] = processArgv; // remove the first non-option argument: it's always the app location
        // If dev, remove the first non-option argument: it's the app location
        if (process.env['VSCODE_DEV']) {
            args = stripAppPath(args) || [];
        }
        return parseAndValidate(args, true);
    }
    exports.parseCLIProcessArgv = parseCLIProcessArgv;
    function addArg(argv, ...args) {
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
    exports.addArg = addArg;
    function isLaunchedFromCli(env) {
        return env['VSCODE_CLI'] === '1';
    }
    exports.isLaunchedFromCli = isLaunchedFromCli;
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYXJndkhlbHBlci5qcyIsInNvdXJjZVJvb3QiOiJmaWxlOi8vL3dvcmtzcGFjZS9hcHBmbG93L3NyYy8iLCJzb3VyY2VzIjpbInZzL3BsYXRmb3JtL2Vudmlyb25tZW50L25vZGUvYXJndkhlbHBlci50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7O2dHQUdnRzs7Ozs7SUFRaEcsU0FBUyxnQkFBZ0IsQ0FBQyxXQUFxQixFQUFFLGNBQXVCO1FBQ3ZFLE1BQU0sZ0JBQWdCLEdBQUcsQ0FBQyxFQUFVLEVBQUUsR0FBVyxFQUFFLEVBQUU7WUFDcEQsT0FBTyxDQUFDLElBQUksQ0FBQyxJQUFBLGNBQVEsRUFBQyxnQkFBZ0IsRUFBRSw0REFBNEQsRUFBRSxFQUFFLEVBQUUsR0FBRyxDQUFDLENBQUMsQ0FBQztRQUNqSCxDQUFDLENBQUM7UUFDRixNQUFNLFlBQVksR0FBRyxDQUFDLEVBQVUsRUFBRSxFQUFFO1lBQ25DLE9BQU8sQ0FBQyxJQUFJLENBQUMsSUFBQSxjQUFRLEVBQUMsWUFBWSxFQUFFLCtEQUErRCxFQUFFLEVBQUUsQ0FBQyxDQUFDLENBQUM7UUFDM0csQ0FBQyxDQUFDO1FBQ0YsTUFBTSxrQkFBa0IsR0FBRyxDQUFDLGdCQUF3QixFQUFFLE9BQWUsRUFBRSxFQUFFO1lBQ3hFLE9BQU8sQ0FBQyxJQUFJLENBQUMsSUFBQSxjQUFRLEVBQUMsb0JBQW9CLEVBQUUsaUNBQWlDLEVBQUUsZ0JBQWdCLEVBQUUsT0FBTyxDQUFDLENBQUMsQ0FBQztRQUM1RyxDQUFDLENBQUM7UUFDRixNQUFNLHFCQUFxQixHQUFHLENBQUMsT0FBZSxFQUFFLEVBQUUsQ0FBQyxDQUFDO1lBQ25ELGVBQWUsRUFBRSxDQUFDLEVBQVUsRUFBRSxFQUFFO2dCQUMvQixJQUFJLENBQUUsMEJBQXlDLENBQUMsUUFBUSxDQUFDLE9BQU8sQ0FBQyxFQUFFO29CQUNsRSxPQUFPLENBQUMsSUFBSSxDQUFDLElBQUEsY0FBUSxFQUFDLHlCQUF5QixFQUFFLHlFQUF5RSxFQUFFLEVBQUUsRUFBRSxPQUFPLENBQUMsQ0FBQyxDQUFDO2lCQUMxSTtZQUNGLENBQUM7WUFDRCxnQkFBZ0I7WUFDaEIsWUFBWTtZQUNaLGtCQUFrQjtZQUNsQixxQkFBcUIsRUFBRywwQkFBeUMsQ0FBQyxRQUFRLENBQUMsT0FBTyxDQUFDLENBQUMsQ0FBQyxDQUFDLHFCQUFxQixDQUFDLENBQUMsQ0FBQyxTQUFTO1NBQ3ZILENBQUMsQ0FBQztRQUNILE1BQU0sYUFBYSxHQUFrQjtZQUNwQyxlQUFlLEVBQUUsQ0FBQyxFQUFFLEVBQUUsRUFBRTtnQkFDdkIsT0FBTyxDQUFDLElBQUksQ0FBQyxJQUFBLGNBQVEsRUFBQyxlQUFlLEVBQUUsNEZBQTRGLEVBQUUsRUFBRSxDQUFDLENBQUMsQ0FBQztZQUMzSSxDQUFDO1lBQ0QsZ0JBQWdCO1lBQ2hCLFlBQVk7WUFDWixrQkFBa0I7WUFDbEIscUJBQXFCO1NBQ3JCLENBQUM7UUFFRixNQUFNLElBQUksR0FBRyxJQUFBLGdCQUFTLEVBQUMsV0FBVyxFQUFFLGNBQU8sRUFBRSxjQUFjLENBQUMsQ0FBQyxDQUFDLGFBQWEsQ0FBQyxDQUFDLENBQUMsU0FBUyxDQUFDLENBQUM7UUFDekYsSUFBSSxJQUFJLENBQUMsSUFBSSxFQUFFO1lBQ2QsSUFBSSxDQUFDLENBQUMsQ0FBQyxPQUFPLENBQUMsR0FBRyxDQUFDLEVBQUUsQ0FBQyxNQUFNLENBQUMsNEJBQTRCLENBQUMsSUFBSSxDQUFDLEdBQUcsQ0FBQyxFQUFFLElBQUEsY0FBUSxFQUFDLGdCQUFnQixFQUFFLGtGQUFrRixDQUFDLENBQUMsQ0FBQyxDQUFDO1NBQ3RMO1FBRUQsT0FBTyxJQUFJLENBQUM7SUFDYixDQUFDO0lBRUQsU0FBUyxZQUFZLENBQUMsSUFBYztRQUNuQyxNQUFNLEtBQUssR0FBRyxJQUFJLENBQUMsU0FBUyxDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUM7UUFFakQsSUFBSSxLQUFLLEdBQUcsQ0FBQyxDQUFDLEVBQUU7WUFDZixPQUFPLENBQUMsR0FBRyxJQUFJLENBQUMsS0FBSyxDQUFDLENBQUMsRUFBRSxLQUFLLENBQUMsRUFBRSxHQUFHLElBQUksQ0FBQyxLQUFLLENBQUMsS0FBSyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUM7U0FDM0Q7UUFDRCxPQUFPLFNBQVMsQ0FBQztJQUNsQixDQUFDO0lBRUQ7O09BRUc7SUFDSCxTQUFnQixvQkFBb0IsQ0FBQyxXQUFxQjtRQUN6RCxJQUFJLENBQUMsRUFBRSxHQUFHLElBQUksQ0FBQyxHQUFHLFdBQVcsQ0FBQztRQUU5QixzRUFBc0U7UUFDdEUsSUFBSSxPQUFPLENBQUMsR0FBRyxDQUFDLFlBQVksQ0FBQyxFQUFFO1lBQzlCLElBQUksR0FBRyxZQUFZLENBQUMsSUFBSSxDQUFDLElBQUksRUFBRSxDQUFDO1NBQ2hDO1FBRUQsMEVBQTBFO1FBQzFFLE1BQU0sY0FBYyxHQUFHLENBQUMsaUJBQWlCLENBQUMsT0FBTyxDQUFDLEdBQUcsQ0FBQyxDQUFDO1FBQ3ZELE9BQU8sZ0JBQWdCLENBQUMsSUFBSSxFQUFFLGNBQWMsQ0FBQyxDQUFDO0lBQy9DLENBQUM7SUFYRCxvREFXQztJQUVEOztPQUVHO0lBQ0gsU0FBZ0IsbUJBQW1CLENBQUMsV0FBcUI7UUFDeEQsSUFBSSxDQUFDLEVBQUUsQUFBRCxFQUFHLEdBQUcsSUFBSSxDQUFDLEdBQUcsV0FBVyxDQUFDLENBQUMscUVBQXFFO1FBRXRHLHNFQUFzRTtRQUN0RSxJQUFJLE9BQU8sQ0FBQyxHQUFHLENBQUMsWUFBWSxDQUFDLEVBQUU7WUFDOUIsSUFBSSxHQUFHLFlBQVksQ0FBQyxJQUFJLENBQUMsSUFBSSxFQUFFLENBQUM7U0FDaEM7UUFFRCxPQUFPLGdCQUFnQixDQUFDLElBQUksRUFBRSxJQUFJLENBQUMsQ0FBQztJQUNyQyxDQUFDO0lBVEQsa0RBU0M7SUFFRCxTQUFnQixNQUFNLENBQUMsSUFBYyxFQUFFLEdBQUcsSUFBYztRQUN2RCxNQUFNLG9CQUFvQixHQUFHLElBQUksQ0FBQyxPQUFPLENBQUMsSUFBSSxDQUFDLENBQUM7UUFDaEQsSUFBSSxvQkFBb0IsS0FBSyxDQUFDLENBQUMsRUFBRTtZQUNoQyxJQUFJLENBQUMsSUFBSSxDQUFDLEdBQUcsSUFBSSxDQUFDLENBQUM7U0FDbkI7YUFBTTtZQUNOLDJEQUEyRDtZQUMzRCxxREFBcUQ7WUFDckQsb0NBQW9DO1lBQ3BDLElBQUksQ0FBQyxNQUFNLENBQUMsb0JBQW9CLEVBQUUsQ0FBQyxFQUFFLEdBQUcsSUFBSSxDQUFDLENBQUM7U0FDOUM7UUFFRCxPQUFPLElBQUksQ0FBQztJQUNiLENBQUM7SUFaRCx3QkFZQztJQUVELFNBQWdCLGlCQUFpQixDQUFDLEdBQXdCO1FBQ3pELE9BQU8sR0FBRyxDQUFDLFlBQVksQ0FBQyxLQUFLLEdBQUcsQ0FBQztJQUNsQyxDQUFDO0lBRkQsOENBRUMifQ==