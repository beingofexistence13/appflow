/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/base/common/resources", "vs/base/common/severity", "vs/nls!vs/platform/extensions/common/extensionValidator", "vs/base/common/semver/semver"], function (require, exports, resources_1, severity_1, nls, semver) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.$Ho = exports.$Go = exports.$Fo = exports.$Eo = exports.$Do = exports.$Co = exports.$Bo = void 0;
    const VERSION_REGEXP = /^(\^|>=)?((\d+)|x)\.((\d+)|x)\.((\d+)|x)(\-.*)?$/;
    const NOT_BEFORE_REGEXP = /^-(\d{4})(\d{2})(\d{2})$/;
    function $Bo(version) {
        version = version.trim();
        return (version === '*' || VERSION_REGEXP.test(version));
    }
    exports.$Bo = $Bo;
    function $Co(version) {
        if (!$Bo(version)) {
            return null;
        }
        version = version.trim();
        if (version === '*') {
            return {
                hasCaret: false,
                hasGreaterEquals: false,
                majorBase: 0,
                majorMustEqual: false,
                minorBase: 0,
                minorMustEqual: false,
                patchBase: 0,
                patchMustEqual: false,
                preRelease: null
            };
        }
        const m = version.match(VERSION_REGEXP);
        if (!m) {
            return null;
        }
        return {
            hasCaret: m[1] === '^',
            hasGreaterEquals: m[1] === '>=',
            majorBase: m[2] === 'x' ? 0 : parseInt(m[2], 10),
            majorMustEqual: (m[2] === 'x' ? false : true),
            minorBase: m[4] === 'x' ? 0 : parseInt(m[4], 10),
            minorMustEqual: (m[4] === 'x' ? false : true),
            patchBase: m[6] === 'x' ? 0 : parseInt(m[6], 10),
            patchMustEqual: (m[6] === 'x' ? false : true),
            preRelease: m[8] || null
        };
    }
    exports.$Co = $Co;
    function $Do(version) {
        if (!version) {
            return null;
        }
        const majorBase = version.majorBase;
        const majorMustEqual = version.majorMustEqual;
        const minorBase = version.minorBase;
        let minorMustEqual = version.minorMustEqual;
        const patchBase = version.patchBase;
        let patchMustEqual = version.patchMustEqual;
        if (version.hasCaret) {
            if (majorBase === 0) {
                patchMustEqual = false;
            }
            else {
                minorMustEqual = false;
                patchMustEqual = false;
            }
        }
        let notBefore = 0;
        if (version.preRelease) {
            const match = NOT_BEFORE_REGEXP.exec(version.preRelease);
            if (match) {
                const [, year, month, day] = match;
                notBefore = Date.UTC(Number(year), Number(month) - 1, Number(day));
            }
        }
        return {
            majorBase: majorBase,
            majorMustEqual: majorMustEqual,
            minorBase: minorBase,
            minorMustEqual: minorMustEqual,
            patchBase: patchBase,
            patchMustEqual: patchMustEqual,
            isMinimum: version.hasGreaterEquals,
            notBefore,
        };
    }
    exports.$Do = $Do;
    function $Eo(_inputVersion, _inputDate, _desiredVersion) {
        let version;
        if (typeof _inputVersion === 'string') {
            version = $Do($Co(_inputVersion));
        }
        else {
            version = _inputVersion;
        }
        let productTs;
        if (_inputDate instanceof Date) {
            productTs = _inputDate.getTime();
        }
        else if (typeof _inputDate === 'string') {
            productTs = new Date(_inputDate).getTime();
        }
        let desiredVersion;
        if (typeof _desiredVersion === 'string') {
            desiredVersion = $Do($Co(_desiredVersion));
        }
        else {
            desiredVersion = _desiredVersion;
        }
        if (!version || !desiredVersion) {
            return false;
        }
        const majorBase = version.majorBase;
        const minorBase = version.minorBase;
        const patchBase = version.patchBase;
        let desiredMajorBase = desiredVersion.majorBase;
        let desiredMinorBase = desiredVersion.minorBase;
        let desiredPatchBase = desiredVersion.patchBase;
        const desiredNotBefore = desiredVersion.notBefore;
        let majorMustEqual = desiredVersion.majorMustEqual;
        let minorMustEqual = desiredVersion.minorMustEqual;
        let patchMustEqual = desiredVersion.patchMustEqual;
        if (desiredVersion.isMinimum) {
            if (majorBase > desiredMajorBase) {
                return true;
            }
            if (majorBase < desiredMajorBase) {
                return false;
            }
            if (minorBase > desiredMinorBase) {
                return true;
            }
            if (minorBase < desiredMinorBase) {
                return false;
            }
            if (productTs && productTs < desiredNotBefore) {
                return false;
            }
            return patchBase >= desiredPatchBase;
        }
        // Anything < 1.0.0 is compatible with >= 1.0.0, except exact matches
        if (majorBase === 1 && desiredMajorBase === 0 && (!majorMustEqual || !minorMustEqual || !patchMustEqual)) {
            desiredMajorBase = 1;
            desiredMinorBase = 0;
            desiredPatchBase = 0;
            majorMustEqual = true;
            minorMustEqual = false;
            patchMustEqual = false;
        }
        if (majorBase < desiredMajorBase) {
            // smaller major version
            return false;
        }
        if (majorBase > desiredMajorBase) {
            // higher major version
            return (!majorMustEqual);
        }
        // at this point, majorBase are equal
        if (minorBase < desiredMinorBase) {
            // smaller minor version
            return false;
        }
        if (minorBase > desiredMinorBase) {
            // higher minor version
            return (!minorMustEqual);
        }
        // at this point, minorBase are equal
        if (patchBase < desiredPatchBase) {
            // smaller patch version
            return false;
        }
        if (patchBase > desiredPatchBase) {
            // higher patch version
            return (!patchMustEqual);
        }
        // at this point, patchBase are equal
        if (productTs && productTs < desiredNotBefore) {
            return false;
        }
        return true;
    }
    exports.$Eo = $Eo;
    function $Fo(productVersion, productDate, extensionLocation, extensionManifest, extensionIsBuiltin) {
        const validations = [];
        if (typeof extensionManifest.publisher !== 'undefined' && typeof extensionManifest.publisher !== 'string') {
            validations.push([severity_1.default.Error, nls.localize(0, null)]);
            return validations;
        }
        if (typeof extensionManifest.name !== 'string') {
            validations.push([severity_1.default.Error, nls.localize(1, null, 'name')]);
            return validations;
        }
        if (typeof extensionManifest.version !== 'string') {
            validations.push([severity_1.default.Error, nls.localize(2, null, 'version')]);
            return validations;
        }
        if (!extensionManifest.engines) {
            validations.push([severity_1.default.Error, nls.localize(3, null, 'engines')]);
            return validations;
        }
        if (typeof extensionManifest.engines.vscode !== 'string') {
            validations.push([severity_1.default.Error, nls.localize(4, null, 'engines.vscode')]);
            return validations;
        }
        if (typeof extensionManifest.extensionDependencies !== 'undefined') {
            if (!isStringArray(extensionManifest.extensionDependencies)) {
                validations.push([severity_1.default.Error, nls.localize(5, null, 'extensionDependencies')]);
                return validations;
            }
        }
        if (typeof extensionManifest.activationEvents !== 'undefined') {
            if (!isStringArray(extensionManifest.activationEvents)) {
                validations.push([severity_1.default.Error, nls.localize(6, null, 'activationEvents')]);
                return validations;
            }
            if (typeof extensionManifest.main === 'undefined' && typeof extensionManifest.browser === 'undefined') {
                validations.push([severity_1.default.Error, nls.localize(7, null, 'activationEvents', 'main', 'browser')]);
                return validations;
            }
        }
        if (typeof extensionManifest.extensionKind !== 'undefined') {
            if (typeof extensionManifest.main === 'undefined') {
                validations.push([severity_1.default.Warning, nls.localize(8, null, 'extensionKind')]);
                // not a failure case
            }
        }
        if (typeof extensionManifest.main !== 'undefined') {
            if (typeof extensionManifest.main !== 'string') {
                validations.push([severity_1.default.Error, nls.localize(9, null, 'main')]);
                return validations;
            }
            else {
                const mainLocation = (0, resources_1.$ig)(extensionLocation, extensionManifest.main);
                if (!(0, resources_1.$cg)(mainLocation, extensionLocation)) {
                    validations.push([severity_1.default.Warning, nls.localize(10, null, mainLocation.path, extensionLocation.path)]);
                    // not a failure case
                }
            }
        }
        if (typeof extensionManifest.browser !== 'undefined') {
            if (typeof extensionManifest.browser !== 'string') {
                validations.push([severity_1.default.Error, nls.localize(11, null, 'browser')]);
                return validations;
            }
            else {
                const browserLocation = (0, resources_1.$ig)(extensionLocation, extensionManifest.browser);
                if (!(0, resources_1.$cg)(browserLocation, extensionLocation)) {
                    validations.push([severity_1.default.Warning, nls.localize(12, null, browserLocation.path, extensionLocation.path)]);
                    // not a failure case
                }
            }
        }
        if (!semver.valid(extensionManifest.version)) {
            validations.push([severity_1.default.Error, nls.localize(13, null)]);
            return validations;
        }
        const notices = [];
        const isValid = $Go(productVersion, productDate, extensionManifest, extensionIsBuiltin, notices);
        if (!isValid) {
            for (const notice of notices) {
                validations.push([severity_1.default.Error, notice]);
            }
        }
        return validations;
    }
    exports.$Fo = $Fo;
    function $Go(productVersion, productDate, extensionManifest, extensionIsBuiltin, notices) {
        if (extensionIsBuiltin || (typeof extensionManifest.main === 'undefined' && typeof extensionManifest.browser === 'undefined')) {
            // No version check for builtin or declarative extensions
            return true;
        }
        return isVersionValid(productVersion, productDate, extensionManifest.engines.vscode, notices);
    }
    exports.$Go = $Go;
    function $Ho(engine, version, date) {
        // TODO@joao: discuss with alex '*' doesn't seem to be a valid engine version
        return engine === '*' || isVersionValid(version, date, engine);
    }
    exports.$Ho = $Ho;
    function isVersionValid(currentVersion, date, requestedVersion, notices = []) {
        const desiredVersion = $Do($Co(requestedVersion));
        if (!desiredVersion) {
            notices.push(nls.localize(14, null, requestedVersion));
            return false;
        }
        // enforce that a breaking API version is specified.
        // for 0.X.Y, that means up to 0.X must be specified
        // otherwise for Z.X.Y, that means Z must be specified
        if (desiredVersion.majorBase === 0) {
            // force that major and minor must be specific
            if (!desiredVersion.majorMustEqual || !desiredVersion.minorMustEqual) {
                notices.push(nls.localize(15, null, requestedVersion));
                return false;
            }
        }
        else {
            // force that major must be specific
            if (!desiredVersion.majorMustEqual) {
                notices.push(nls.localize(16, null, requestedVersion));
                return false;
            }
        }
        if (!$Eo(currentVersion, date, desiredVersion)) {
            notices.push(nls.localize(17, null, currentVersion, requestedVersion));
            return false;
        }
        return true;
    }
    function isStringArray(arr) {
        if (!Array.isArray(arr)) {
            return false;
        }
        for (let i = 0, len = arr.length; i < len; i++) {
            if (typeof arr[i] !== 'string') {
                return false;
            }
        }
        return true;
    }
});
//# sourceMappingURL=extensionValidator.js.map