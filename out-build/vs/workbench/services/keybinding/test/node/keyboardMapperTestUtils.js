/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "assert", "vs/base/common/path", "vs/base/node/pfs", "vs/base/common/network"], function (require, exports, assert, path, pfs_1, network_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.$ggc = exports.$fgc = exports.$egc = exports.$dgc = void 0;
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
    function $dgc(mapper, keyboardEvent, expected) {
        const actual = toIResolvedKeybinding(mapper.resolveKeyboardEvent(keyboardEvent));
        assert.deepStrictEqual(actual, expected);
    }
    exports.$dgc = $dgc;
    function $egc(mapper, keybinding, expected) {
        const actual = mapper.resolveKeybinding(keybinding).map(toIResolvedKeybinding);
        assert.deepStrictEqual(actual, expected);
    }
    exports.$egc = $egc;
    function $fgc(file) {
        return pfs_1.Promises.readFile(network_1.$2f.asFileUri(`vs/workbench/services/keybinding/test/node/${file}.js`).fsPath).then((buff) => {
            const contents = buff.toString();
            const func = new Function('define', contents); // CodeQL [SM01632] This is used in tests and we read the files as JS to avoid slowing down TS compilation
            let rawMappings = null;
            func(function (value) {
                rawMappings = value;
            });
            return rawMappings;
        });
    }
    exports.$fgc = $fgc;
    function $ggc(writeFileIfDifferent, mapper, file) {
        const filePath = path.$7d(network_1.$2f.asFileUri(`vs/workbench/services/keybinding/test/node/${file}`).fsPath);
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
    exports.$ggc = $ggc;
});
//# sourceMappingURL=keyboardMapperTestUtils.js.map