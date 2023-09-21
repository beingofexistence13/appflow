/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "assert", "vs/base/common/path", "vs/base/node/pfs", "vs/base/common/network"], function (require, exports, assert, path, pfs_1, network_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.assertMapping = exports.readRawMapping = exports.assertResolveKeybinding = exports.assertResolveKeyboardEvent = void 0;
    function toIResolvedKeybinding(kb) {
        return {
            label: kb.getLabel(),
            ariaLabel: kb.getAriaLabel(),
            electronAccelerator: kb.getElectronAccelerator(),
            userSettingsLabel: kb.getUserSettingsLabel(),
            isWYSIWYG: kb.isWYSIWYG(),
            isMultiChord: kb.hasMultipleChords(),
            dispatchParts: kb.getDispatchChords(),
            singleModifierDispatchParts: kb.getSingleModifierDispatchChords()
        };
    }
    function assertResolveKeyboardEvent(mapper, keyboardEvent, expected) {
        const actual = toIResolvedKeybinding(mapper.resolveKeyboardEvent(keyboardEvent));
        assert.deepStrictEqual(actual, expected);
    }
    exports.assertResolveKeyboardEvent = assertResolveKeyboardEvent;
    function assertResolveKeybinding(mapper, keybinding, expected) {
        const actual = mapper.resolveKeybinding(keybinding).map(toIResolvedKeybinding);
        assert.deepStrictEqual(actual, expected);
    }
    exports.assertResolveKeybinding = assertResolveKeybinding;
    function readRawMapping(file) {
        return pfs_1.Promises.readFile(network_1.FileAccess.asFileUri(`vs/workbench/services/keybinding/test/node/${file}.js`).fsPath).then((buff) => {
            const contents = buff.toString();
            const func = new Function('define', contents); // CodeQL [SM01632] This is used in tests and we read the files as JS to avoid slowing down TS compilation
            let rawMappings = null;
            func(function (value) {
                rawMappings = value;
            });
            return rawMappings;
        });
    }
    exports.readRawMapping = readRawMapping;
    function assertMapping(writeFileIfDifferent, mapper, file) {
        const filePath = path.normalize(network_1.FileAccess.asFileUri(`vs/workbench/services/keybinding/test/node/${file}`).fsPath);
        return pfs_1.Promises.readFile(filePath).then((buff) => {
            const expected = buff.toString().replace(/\r\n/g, '\n');
            const actual = mapper.dumpDebugInfo().replace(/\r\n/g, '\n');
            if (actual !== expected && writeFileIfDifferent) {
                const destPath = filePath.replace(/[\/\\]out[\/\\]vs[\/\\]workbench/, '/src/vs/workbench');
                pfs_1.Promises.writeFile(destPath, actual);
            }
            assert.deepStrictEqual(actual, expected);
        });
    }
    exports.assertMapping = assertMapping;
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoia2V5Ym9hcmRNYXBwZXJUZXN0VXRpbHMuanMiLCJzb3VyY2VSb290IjoiZmlsZTovLy93b3Jrc3BhY2UvYXBwZmxvdy9zcmMvIiwic291cmNlcyI6WyJ2cy93b3JrYmVuY2gvc2VydmljZXMva2V5YmluZGluZy90ZXN0L25vZGUva2V5Ym9hcmRNYXBwZXJUZXN0VXRpbHMudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7OztnR0FHZ0c7Ozs7O0lBcUJoRyxTQUFTLHFCQUFxQixDQUFDLEVBQXNCO1FBQ3BELE9BQU87WUFDTixLQUFLLEVBQUUsRUFBRSxDQUFDLFFBQVEsRUFBRTtZQUNwQixTQUFTLEVBQUUsRUFBRSxDQUFDLFlBQVksRUFBRTtZQUM1QixtQkFBbUIsRUFBRSxFQUFFLENBQUMsc0JBQXNCLEVBQUU7WUFDaEQsaUJBQWlCLEVBQUUsRUFBRSxDQUFDLG9CQUFvQixFQUFFO1lBQzVDLFNBQVMsRUFBRSxFQUFFLENBQUMsU0FBUyxFQUFFO1lBQ3pCLFlBQVksRUFBRSxFQUFFLENBQUMsaUJBQWlCLEVBQUU7WUFDcEMsYUFBYSxFQUFFLEVBQUUsQ0FBQyxpQkFBaUIsRUFBRTtZQUNyQywyQkFBMkIsRUFBRSxFQUFFLENBQUMsK0JBQStCLEVBQUU7U0FDakUsQ0FBQztJQUNILENBQUM7SUFFRCxTQUFnQiwwQkFBMEIsQ0FBQyxNQUF1QixFQUFFLGFBQTZCLEVBQUUsUUFBNkI7UUFDL0gsTUFBTSxNQUFNLEdBQUcscUJBQXFCLENBQUMsTUFBTSxDQUFDLG9CQUFvQixDQUFDLGFBQWEsQ0FBQyxDQUFDLENBQUM7UUFDakYsTUFBTSxDQUFDLGVBQWUsQ0FBQyxNQUFNLEVBQUUsUUFBUSxDQUFDLENBQUM7SUFDMUMsQ0FBQztJQUhELGdFQUdDO0lBRUQsU0FBZ0IsdUJBQXVCLENBQUMsTUFBdUIsRUFBRSxVQUFzQixFQUFFLFFBQStCO1FBQ3ZILE1BQU0sTUFBTSxHQUEwQixNQUFNLENBQUMsaUJBQWlCLENBQUMsVUFBVSxDQUFDLENBQUMsR0FBRyxDQUFDLHFCQUFxQixDQUFDLENBQUM7UUFDdEcsTUFBTSxDQUFDLGVBQWUsQ0FBQyxNQUFNLEVBQUUsUUFBUSxDQUFDLENBQUM7SUFDMUMsQ0FBQztJQUhELDBEQUdDO0lBRUQsU0FBZ0IsY0FBYyxDQUFJLElBQVk7UUFDN0MsT0FBTyxjQUFRLENBQUMsUUFBUSxDQUFDLG9CQUFVLENBQUMsU0FBUyxDQUFDLDhDQUE4QyxJQUFJLEtBQUssQ0FBQyxDQUFDLE1BQU0sQ0FBQyxDQUFDLElBQUksQ0FBQyxDQUFDLElBQUksRUFBRSxFQUFFO1lBQzVILE1BQU0sUUFBUSxHQUFHLElBQUksQ0FBQyxRQUFRLEVBQUUsQ0FBQztZQUNqQyxNQUFNLElBQUksR0FBRyxJQUFJLFFBQVEsQ0FBQyxRQUFRLEVBQUUsUUFBUSxDQUFDLENBQUMsQ0FBQSwwR0FBMEc7WUFDeEosSUFBSSxXQUFXLEdBQWEsSUFBSSxDQUFDO1lBQ2pDLElBQUksQ0FBQyxVQUFVLEtBQVE7Z0JBQ3RCLFdBQVcsR0FBRyxLQUFLLENBQUM7WUFDckIsQ0FBQyxDQUFDLENBQUM7WUFDSCxPQUFPLFdBQVksQ0FBQztRQUNyQixDQUFDLENBQUMsQ0FBQztJQUNKLENBQUM7SUFWRCx3Q0FVQztJQUVELFNBQWdCLGFBQWEsQ0FBQyxvQkFBNkIsRUFBRSxNQUF1QixFQUFFLElBQVk7UUFDakcsTUFBTSxRQUFRLEdBQUcsSUFBSSxDQUFDLFNBQVMsQ0FBQyxvQkFBVSxDQUFDLFNBQVMsQ0FBQyw4Q0FBOEMsSUFBSSxFQUFFLENBQUMsQ0FBQyxNQUFNLENBQUMsQ0FBQztRQUVuSCxPQUFPLGNBQVEsQ0FBQyxRQUFRLENBQUMsUUFBUSxDQUFDLENBQUMsSUFBSSxDQUFDLENBQUMsSUFBSSxFQUFFLEVBQUU7WUFDaEQsTUFBTSxRQUFRLEdBQUcsSUFBSSxDQUFDLFFBQVEsRUFBRSxDQUFDLE9BQU8sQ0FBQyxPQUFPLEVBQUUsSUFBSSxDQUFDLENBQUM7WUFDeEQsTUFBTSxNQUFNLEdBQUcsTUFBTSxDQUFDLGFBQWEsRUFBRSxDQUFDLE9BQU8sQ0FBQyxPQUFPLEVBQUUsSUFBSSxDQUFDLENBQUM7WUFDN0QsSUFBSSxNQUFNLEtBQUssUUFBUSxJQUFJLG9CQUFvQixFQUFFO2dCQUNoRCxNQUFNLFFBQVEsR0FBRyxRQUFRLENBQUMsT0FBTyxDQUFDLGtDQUFrQyxFQUFFLG1CQUFtQixDQUFDLENBQUM7Z0JBQzNGLGNBQVEsQ0FBQyxTQUFTLENBQUMsUUFBUSxFQUFFLE1BQU0sQ0FBQyxDQUFDO2FBQ3JDO1lBQ0QsTUFBTSxDQUFDLGVBQWUsQ0FBQyxNQUFNLEVBQUUsUUFBUSxDQUFDLENBQUM7UUFDMUMsQ0FBQyxDQUFDLENBQUM7SUFDSixDQUFDO0lBWkQsc0NBWUMifQ==