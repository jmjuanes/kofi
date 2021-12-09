import {terser} from "rollup-plugin-terser";
import cleanup from "rollup-plugin-cleanup";
import {version} from "./package.json";

//Generate the banner
const banner = [];
banner.push("/*!*");
banner.push(" * @license kofi " + version);
banner.push(" *");
banner.push(" * This source code is licensed under the MIT license found in the");
banner.push(" * LICENSE file in the root directory of this source tree.");
banner.push(" */");
banner.push("");

//Initialize the configuration object
export default {
    "input": "kofi.js",
    "output": ["umd", "esm"].map(format => ({
        "file": `./kofi.${format}.js`,
        "format": format, 
        // "banner": banner.join("\n"),
        "name": format === "umd" ? "kofi": undefined,
        "plugins": [
            terser(),
        ],
    })),
    "plugins": [
        cleanup(),
    ],
};
