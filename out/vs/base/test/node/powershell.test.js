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
    if (platform.isWindows) {
        suite('PowerShell finder', () => {
            test('Can find first available PowerShell', async () => {
                const pwshExe = await (0, powershell_1.getFirstAvailablePowerShellInstallation)();
                const exePath = pwshExe?.exePath;
                assert.notStrictEqual(exePath, null);
                assert.notStrictEqual(pwshExe?.displayName, null);
                checkPath(exePath);
            });
            test('Can enumerate PowerShells', async () => {
                const pwshs = new Array();
                for await (const p of (0, powershell_1.enumeratePowerShellInstallations)()) {
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicG93ZXJzaGVsbC50ZXN0LmpzIiwic291cmNlUm9vdCI6ImZpbGU6Ly8vd29ya3NwYWNlL2FwcGZsb3cvc3JjLyIsInNvdXJjZXMiOlsidnMvYmFzZS90ZXN0L25vZGUvcG93ZXJzaGVsbC50ZXN0LnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7OztJQVNBLFNBQVMsU0FBUyxDQUFDLE9BQWU7UUFDakMsa0NBQWtDO1FBQ2xDLElBQUksZUFBZSxHQUFHLEtBQUssQ0FBQztRQUM1QixJQUFJO1lBQ0gsTUFBTSxJQUFJLEdBQUcsRUFBRSxDQUFDLFFBQVEsQ0FBQyxPQUFPLENBQUMsQ0FBQztZQUNsQyxlQUFlLEdBQUcsSUFBSSxDQUFDLE1BQU0sRUFBRSxDQUFDO1NBQ2hDO1FBQUMsTUFBTTtZQUNQLHVEQUF1RDtZQUN2RCxvREFBb0Q7WUFDcEQsSUFBSTtnQkFDSCxlQUFlLEdBQUcsRUFBRSxDQUFDLFFBQVEsQ0FBQyxFQUFFLENBQUMsWUFBWSxDQUFDLE9BQU8sQ0FBQyxDQUFDLENBQUMsTUFBTSxFQUFFLENBQUM7YUFDakU7WUFBQyxNQUFNO2FBRVA7U0FDRDtRQUVELE1BQU0sQ0FBQyxXQUFXLENBQUMsZUFBZSxFQUFFLElBQUksQ0FBQyxDQUFDO0lBQzNDLENBQUM7SUFFRCxJQUFJLFFBQVEsQ0FBQyxTQUFTLEVBQUU7UUFDdkIsS0FBSyxDQUFDLG1CQUFtQixFQUFFLEdBQUcsRUFBRTtZQUUvQixJQUFJLENBQUMscUNBQXFDLEVBQUUsS0FBSyxJQUFJLEVBQUU7Z0JBQ3RELE1BQU0sT0FBTyxHQUFHLE1BQU0sSUFBQSxvREFBdUMsR0FBRSxDQUFDO2dCQUNoRSxNQUFNLE9BQU8sR0FBRyxPQUFPLEVBQUUsT0FBTyxDQUFDO2dCQUNqQyxNQUFNLENBQUMsY0FBYyxDQUFDLE9BQU8sRUFBRSxJQUFJLENBQUMsQ0FBQztnQkFDckMsTUFBTSxDQUFDLGNBQWMsQ0FBQyxPQUFPLEVBQUUsV0FBVyxFQUFFLElBQUksQ0FBQyxDQUFDO2dCQUVsRCxTQUFTLENBQUMsT0FBUSxDQUFDLENBQUM7WUFDckIsQ0FBQyxDQUFDLENBQUM7WUFFSCxJQUFJLENBQUMsMkJBQTJCLEVBQUUsS0FBSyxJQUFJLEVBQUU7Z0JBQzVDLE1BQU0sS0FBSyxHQUFHLElBQUksS0FBSyxFQUF5QixDQUFDO2dCQUNqRCxJQUFJLEtBQUssRUFBRSxNQUFNLENBQUMsSUFBSSxJQUFBLDZDQUFnQyxHQUFFLEVBQUU7b0JBQ3pELEtBQUssQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUM7aUJBQ2Q7Z0JBRUQsTUFBTSxhQUFhLEdBQUcsNEJBQTRCLEdBQUcsS0FBSyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsRUFBRSxDQUFDLEdBQUcsQ0FBQyxDQUFDLFdBQVcsS0FBSyxDQUFDLENBQUMsT0FBTyxFQUFFLENBQUMsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLENBQUM7Z0JBQ2pILE1BQU0sQ0FBQyxXQUFXLENBQUMsS0FBSyxDQUFDLE1BQU0sSUFBSSxDQUFDLEVBQUUsSUFBSSxFQUFFLGFBQWEsQ0FBQyxDQUFDO2dCQUUzRCxLQUFLLE1BQU0sSUFBSSxJQUFJLEtBQUssRUFBRTtvQkFDekIsU0FBUyxDQUFDLElBQUksQ0FBQyxPQUFPLENBQUMsQ0FBQztpQkFDeEI7Z0JBRUQsb0RBQW9EO2dCQUNwRCxNQUFNLENBQUMsV0FBVyxDQUFDLEtBQUssQ0FBQyxLQUFLLENBQUMsTUFBTSxHQUFHLENBQUMsQ0FBQyxDQUFDLFdBQVcsRUFBRSxvQkFBb0IsRUFBRSxhQUFhLENBQUMsQ0FBQztZQUM5RixDQUFDLENBQUMsQ0FBQztRQUNKLENBQUMsQ0FBQyxDQUFDO0tBQ0gifQ==