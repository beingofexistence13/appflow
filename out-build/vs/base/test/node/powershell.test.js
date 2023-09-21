define(["require", "exports", "assert", "fs", "vs/base/common/platform", "vs/base/node/powershell"], function (require, exports, assert, fs, platform, powershell_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    function checkPath(exePath) {
        // Check to see if the path exists
        let pathCheckResult = false;
        try {
            const stat = fs.statSync(exePath);
            pathCheckResult = stat.isFile();
        }
        catch {
            // fs.exists throws on Windows with SymbolicLinks so we
            // also use lstat to try and see if the file exists.
            try {
                pathCheckResult = fs.statSync(fs.readlinkSync(exePath)).isFile();
            }
            catch {
            }
        }
        assert.strictEqual(pathCheckResult, true);
    }
    if (platform.$i) {
        suite('PowerShell finder', () => {
            test('Can find first available PowerShell', async () => {
                const pwshExe = await (0, powershell_1.$rl)();
                const exePath = pwshExe?.exePath;
                assert.notStrictEqual(exePath, null);
                assert.notStrictEqual(pwshExe?.displayName, null);
                checkPath(exePath);
            });
            test('Can enumerate PowerShells', async () => {
                const pwshs = new Array();
                for await (const p of (0, powershell_1.$ql)()) {
                    pwshs.push(p);
                }
                const powershellLog = 'Found these PowerShells:\n' + pwshs.map(p => `${p.displayName}: ${p.exePath}`).join('\n');
                assert.strictEqual(pwshs.length >= 1, true, powershellLog);
                for (const pwsh of pwshs) {
                    checkPath(pwsh.exePath);
                }
                // The last one should always be Windows PowerShell.
                assert.strictEqual(pwshs[pwshs.length - 1].displayName, 'Windows PowerShell', powershellLog);
            });
        });
    }
});
//# sourceMappingURL=powershell.test.js.map