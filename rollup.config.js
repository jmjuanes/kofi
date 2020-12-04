import {terser} from "rollup-plugin-terser";
import cleanup from "rollup-plugin-cleanup";
import {version} from "./package.json";

//Generate the banner
let banner = [];
banner.push("/*!*");
banner.push(" * @license kofi " + version);
banner.push(" *");
banner.push(" * This source code is licensed under the MIT license found in the");
banner.push(" * LICENSE file in the root directory of this source tree.");
banner.push(" */");
banner.push("");

//Output formats
let outputFormats = ["umd", "umd.min", "cjs", "cjs.min", "esm", "esm.min"];

//Initialize the configuration object
export default {
    "input": "src/index.js",
    "output": outputFormats.map(function (ext) {
        let output = {
            "file": `./dist/kofi.${ext}.js`,
            "format": ext.replace(".min", ""),
            "banner": banner.join("\n")
        };
        //Check for UMD format --> add export name
        if (ext.indexOf("umd") !== -1) {
            output["name"] = "kofi";
        }
        //Check for min format
        if (ext.indexOf(".min") !== -1) {
            output["plugins"] = [terser({
                "output": {
                    "comments": "all"
                }
            })];
        }
        //Return the output format config
        return output;
    }),
    "plugins": [cleanup()]
};

