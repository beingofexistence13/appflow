/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "child_process", "vs/base/common/platform"], function (require, exports, child_process_1, platform_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.resolveTerminalEncoding = void 0;
    const windowsTerminalEncodings = {
        '437': 'cp437',
        '850': 'cp850',
        '852': 'cp852',
        '855': 'cp855',
        '857': 'cp857',
        '860': 'cp860',
        '861': 'cp861',
        '863': 'cp863',
        '865': 'cp865',
        '866': 'cp866',
        '869': 'cp869',
        '936': 'cp936',
        '1252': 'cp1252' // West European Latin
    };
    function toIconvLiteEncoding(encodingName) {
        const normalizedEncodingName = encodingName.replace(/[^a-zA-Z0-9]/g, '').toLowerCase();
        const mapped = JSCHARDET_TO_ICONV_ENCODINGS[normalizedEncodingName];
        return mapped || normalizedEncodingName;
    }
    const JSCHARDET_TO_ICONV_ENCODINGS = {
        'ibm866': 'cp866',
        'big5': 'cp950'
    };
    const UTF8 = 'utf8';
    async function resolveTerminalEncoding(verbose) {
        let rawEncodingPromise;
        // Support a global environment variable to win over other mechanics
        const cliEncodingEnv = process.env['VSCODE_CLI_ENCODING'];
        if (cliEncodingEnv) {
            if (verbose) {
                console.log(`Found VSCODE_CLI_ENCODING variable: ${cliEncodingEnv}`);
            }
            rawEncodingPromise = Promise.resolve(cliEncodingEnv);
        }
        // Windows: educated guess
        else if (platform_1.isWindows) {
            rawEncodingPromise = new Promise(resolve => {
                if (verbose) {
                    console.log('Running "chcp" to detect terminal encoding...');
                }
                (0, child_process_1.exec)('chcp', (err, stdout, stderr) => {
                    if (stdout) {
                        if (verbose) {
                            console.log(`Output from "chcp" command is: ${stdout}`);
                        }
                        const windowsTerminalEncodingKeys = Object.keys(windowsTerminalEncodings);
                        for (const key of windowsTerminalEncodingKeys) {
                            if (stdout.indexOf(key) >= 0) {
                                return resolve(windowsTerminalEncodings[key]);
                            }
                        }
                    }
                    return resolve(undefined);
                });
            });
        }
        // Linux/Mac: use "locale charmap" command
        else {
            rawEncodingPromise = new Promise(resolve => {
                if (verbose) {
                    console.log('Running "locale charmap" to detect terminal encoding...');
                }
                (0, child_process_1.exec)('locale charmap', (err, stdout, stderr) => resolve(stdout));
            });
        }
        const rawEncoding = await rawEncodingPromise;
        if (verbose) {
            console.log(`Detected raw terminal encoding: ${rawEncoding}`);
        }
        if (!rawEncoding || rawEncoding.toLowerCase() === 'utf-8' || rawEncoding.toLowerCase() === UTF8) {
            return UTF8;
        }
        return toIconvLiteEncoding(rawEncoding);
    }
    exports.resolveTerminalEncoding = resolveTerminalEncoding;
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidGVybWluYWxFbmNvZGluZy5qcyIsInNvdXJjZVJvb3QiOiJmaWxlOi8vL3dvcmtzcGFjZS9hcHBmbG93L3NyYy8iLCJzb3VyY2VzIjpbInZzL2Jhc2Uvbm9kZS90ZXJtaW5hbEVuY29kaW5nLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOzs7Z0dBR2dHOzs7OztJQVFoRyxNQUFNLHdCQUF3QixHQUFHO1FBQ2hDLEtBQUssRUFBRSxPQUFPO1FBQ2QsS0FBSyxFQUFFLE9BQU87UUFDZCxLQUFLLEVBQUUsT0FBTztRQUNkLEtBQUssRUFBRSxPQUFPO1FBQ2QsS0FBSyxFQUFFLE9BQU87UUFDZCxLQUFLLEVBQUUsT0FBTztRQUNkLEtBQUssRUFBRSxPQUFPO1FBQ2QsS0FBSyxFQUFFLE9BQU87UUFDZCxLQUFLLEVBQUUsT0FBTztRQUNkLEtBQUssRUFBRSxPQUFPO1FBQ2QsS0FBSyxFQUFFLE9BQU87UUFDZCxLQUFLLEVBQUUsT0FBTztRQUNkLE1BQU0sRUFBRSxRQUFRLENBQUMsc0JBQXNCO0tBQ3ZDLENBQUM7SUFFRixTQUFTLG1CQUFtQixDQUFDLFlBQW9CO1FBQ2hELE1BQU0sc0JBQXNCLEdBQUcsWUFBWSxDQUFDLE9BQU8sQ0FBQyxlQUFlLEVBQUUsRUFBRSxDQUFDLENBQUMsV0FBVyxFQUFFLENBQUM7UUFDdkYsTUFBTSxNQUFNLEdBQUcsNEJBQTRCLENBQUMsc0JBQXNCLENBQUMsQ0FBQztRQUVwRSxPQUFPLE1BQU0sSUFBSSxzQkFBc0IsQ0FBQztJQUN6QyxDQUFDO0lBRUQsTUFBTSw0QkFBNEIsR0FBK0I7UUFDaEUsUUFBUSxFQUFFLE9BQU87UUFDakIsTUFBTSxFQUFFLE9BQU87S0FDZixDQUFDO0lBRUYsTUFBTSxJQUFJLEdBQUcsTUFBTSxDQUFDO0lBRWIsS0FBSyxVQUFVLHVCQUF1QixDQUFDLE9BQWlCO1FBQzlELElBQUksa0JBQStDLENBQUM7UUFFcEQsb0VBQW9FO1FBQ3BFLE1BQU0sY0FBYyxHQUFHLE9BQU8sQ0FBQyxHQUFHLENBQUMscUJBQXFCLENBQUMsQ0FBQztRQUMxRCxJQUFJLGNBQWMsRUFBRTtZQUNuQixJQUFJLE9BQU8sRUFBRTtnQkFDWixPQUFPLENBQUMsR0FBRyxDQUFDLHVDQUF1QyxjQUFjLEVBQUUsQ0FBQyxDQUFDO2FBQ3JFO1lBRUQsa0JBQWtCLEdBQUcsT0FBTyxDQUFDLE9BQU8sQ0FBQyxjQUFjLENBQUMsQ0FBQztTQUNyRDtRQUVELDBCQUEwQjthQUNyQixJQUFJLG9CQUFTLEVBQUU7WUFDbkIsa0JBQWtCLEdBQUcsSUFBSSxPQUFPLENBQXFCLE9BQU8sQ0FBQyxFQUFFO2dCQUM5RCxJQUFJLE9BQU8sRUFBRTtvQkFDWixPQUFPLENBQUMsR0FBRyxDQUFDLCtDQUErQyxDQUFDLENBQUM7aUJBQzdEO2dCQUVELElBQUEsb0JBQUksRUFBQyxNQUFNLEVBQUUsQ0FBQyxHQUFHLEVBQUUsTUFBTSxFQUFFLE1BQU0sRUFBRSxFQUFFO29CQUNwQyxJQUFJLE1BQU0sRUFBRTt3QkFDWCxJQUFJLE9BQU8sRUFBRTs0QkFDWixPQUFPLENBQUMsR0FBRyxDQUFDLGtDQUFrQyxNQUFNLEVBQUUsQ0FBQyxDQUFDO3lCQUN4RDt3QkFFRCxNQUFNLDJCQUEyQixHQUFHLE1BQU0sQ0FBQyxJQUFJLENBQUMsd0JBQXdCLENBQWlELENBQUM7d0JBQzFILEtBQUssTUFBTSxHQUFHLElBQUksMkJBQTJCLEVBQUU7NEJBQzlDLElBQUksTUFBTSxDQUFDLE9BQU8sQ0FBQyxHQUFHLENBQUMsSUFBSSxDQUFDLEVBQUU7Z0NBQzdCLE9BQU8sT0FBTyxDQUFDLHdCQUF3QixDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUM7NkJBQzlDO3lCQUNEO3FCQUNEO29CQUVELE9BQU8sT0FBTyxDQUFDLFNBQVMsQ0FBQyxDQUFDO2dCQUMzQixDQUFDLENBQUMsQ0FBQztZQUNKLENBQUMsQ0FBQyxDQUFDO1NBQ0g7UUFDRCwwQ0FBMEM7YUFDckM7WUFDSixrQkFBa0IsR0FBRyxJQUFJLE9BQU8sQ0FBUyxPQUFPLENBQUMsRUFBRTtnQkFDbEQsSUFBSSxPQUFPLEVBQUU7b0JBQ1osT0FBTyxDQUFDLEdBQUcsQ0FBQyx5REFBeUQsQ0FBQyxDQUFDO2lCQUN2RTtnQkFFRCxJQUFBLG9CQUFJLEVBQUMsZ0JBQWdCLEVBQUUsQ0FBQyxHQUFHLEVBQUUsTUFBTSxFQUFFLE1BQU0sRUFBRSxFQUFFLENBQUMsT0FBTyxDQUFDLE1BQU0sQ0FBQyxDQUFDLENBQUM7WUFDbEUsQ0FBQyxDQUFDLENBQUM7U0FDSDtRQUVELE1BQU0sV0FBVyxHQUFHLE1BQU0sa0JBQWtCLENBQUM7UUFDN0MsSUFBSSxPQUFPLEVBQUU7WUFDWixPQUFPLENBQUMsR0FBRyxDQUFDLG1DQUFtQyxXQUFXLEVBQUUsQ0FBQyxDQUFDO1NBQzlEO1FBRUQsSUFBSSxDQUFDLFdBQVcsSUFBSSxXQUFXLENBQUMsV0FBVyxFQUFFLEtBQUssT0FBTyxJQUFJLFdBQVcsQ0FBQyxXQUFXLEVBQUUsS0FBSyxJQUFJLEVBQUU7WUFDaEcsT0FBTyxJQUFJLENBQUM7U0FDWjtRQUVELE9BQU8sbUJBQW1CLENBQUMsV0FBVyxDQUFDLENBQUM7SUFDekMsQ0FBQztJQTNERCwwREEyREMifQ==