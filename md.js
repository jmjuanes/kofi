import {escape} from "./helpers.js";
import {element, stringify} from "./element.js";

//Default renderer
let defaultRenderer = function (tag, props, children) {
    return stringify(element(tag, props, children), "");
};

//List with all expressions
let expressions = {
    "pre": {
        "regex": /(?:^```(?:[^\n]*)\n([\s\S]*?)\n``` *$)/gm,
        "replacement": function (args, render) {
            return render("pre", {}, escape(args[1]));
        }
    },
    "heading": {
        "regex": /^(#+)\s+(.*)/gm,
        "replacement": function (args, render) {
            return render(`h${args[1].length}`, {}, args[2]);
        }
    },
    "blockquote": {
        "regex": /^[\s]*>\s(.*)/gm,
        "replacement": function (args, render) {
            return render("blockquote", {}, args[1]);
        }
    },
    "code": {
        "regex": /`([^`]*?)`/g,
        "replacement": function (args, render) {
            return render("code", {}, escape(args[1]));
        }
    },
    "image": {
        "regex": /!\[([^\]]*?)\]\(([^)]*?)\)/g,
        "replacement": function (args, render) {
            return render("img", {"alt": args[1], "src": args[2]});
        }
    },
    "table": {
        "regex": /^\|((?: +[^\n|]+ +\|?)+)\| *\n\|((?: *[:]?[-]+[:]? *\|?)+)\| *\n((?:^\|(?: +[^\n|]+ +\|?)+\| *\n)+)\n/gm,
        "replacement": function (args, render) {
            //args[1] --> table header
            //args[3] --> table body
            //Table header
            let headContent = render("tr", {}, args[1].trim().split("|").map(function (content) {
                return render("td", {}, content.trim());
            }));
            //Table body
            let bodyContent = args[3].replace(/\r/g, "").split("\n").map(function (line) {
                line = line.trim().replace(/^\|/m, "").replace(/\|$/m, "").trim();
                if (line.length === 0) {
                    return ""; //Empty line
                }
                //Build line content
                return render("tr", {}, line.split("|").map(function (col) {
                    return render("td", {}, col.trim());
                }));
            }).filter(function (value) {
                return value !== ""; //Remove empty rows
            });
            //Return table content
            return render("table", {}, [
                render("thead", {}, headContent), 
                render("tbody", {}, bodyContent)
            ]);
        }
    },
    "link": {
        "regex": /\[(.*?)\]\(([^\t\n\s]*?)\)/gm,
        "replacement": function (args, render) {
            return render("a", {"href": args[2]}, args[1]);
        }
    },
    "rule": {
        "regex2": /^.*?(?:---|\*\*\*|-\s-\s-|\*\s\*\s\*)/gm,
        "regex": /^.*?(?:---|-\s-\s-|\*\s\*\s\*)/gm,
        "replacement": function (args, render) {
            return render("hr", {});
        }
    },
    "list": {
        "regex": /^[\t\s]*?(?:-|\+|\*)\s(.*)/gm,
        "replacement": function (args, render) {
            return render("ul", {}, render("li", {}, args[1]));
        },
        "afterRegex": /(<\/ul>\n(?:.*)<ul>*)+/g
    },
    "orderedList": {
        "regex": /^[\t\s]*?(?:\d(?:\)|\.))\s(.*)/gm,
        "replacement": function (args, render) {
            return render("ol", {}, render("li", {}, args[1]));
        },
        "afterRegex": /(<\/ol>\n(?:.*)<ol>*)+/g
    },
    "strong": {
        "regex": /(?:\*\*|__)([^\n]+?)(?:\*\*|__)/g,
        "replacement": function (args, render) {
            return render("strong", {}, args[1]);
        }
    },
    "emphasis": {
        "regex": /(?:\*|_)([^\n]+?)(?:\*|_)/g,
        "replacement": function (args, render) {
            return render("em", {}, args[1]);
        }
    },
    "paragraph": {
        "regex": /^((?:.+(?:\n|$))+)/gm,
        "replacement": function (args, render) {
            let line = args[0].trim();
            //Check if the line starts with a block tag
            if (/^\<\/?(ul|ol|bl|h\d|p|div|sty|scr).*/.test(line.slice(0, 4)) === true) {
                return line;
            }
            //Return the paragraph
            return render("p", {}, line.replace(/\n/g, ""));
        }
    }
};

//Export the markdown parser
export function md (str, options) {
    options = options || {}; //Get options
    let renderer = options.renderer || defaultRenderer;
    let ignoreTokens = options.ignore || []; //Ignored tokens
    let ignoredBlocks = []; //Chunks to ignore
    //Replace all \r\n
    str = str.replace(/\r\n/g, "\n");
    //Replace all <script> tags
    //str = str.replace(/<script[^\0]*?>([^\0]*?)<\/script>/gmi, function (match, content) {
    //    return "&lt;script&gt;" + content + "&lt;/script&gt;";
    //});
    //Ignore specified blocks
    ignoreTokens.forEach(function (token) {
        str = str.replace(token, function (match) {
            ignoredBlocks.push(match); //Ignore this block
            return `<pre>{IGNORED%${(ignoredBlocks.length - 1)}}</pre>`;
        });
    });
    //Replace all expressions
    Object.keys(expressions).forEach(function (key) {
        //Replace this expression
        str = str.replace(expressions[key].regex, function () {
            let value = expressions[key].replacement([].slice.call(arguments), renderer);
            //Check for pre block
            if (key === "pre") {
                ignoredBlocks.push(value);
                return `<pre>{IGNORED%${(ignoredBlocks.length - 1)}}</pre>\n`;
            }
            //Other value --> return the value provided by the renderer
            return value;
        });
        //Check for regex to apply after the main refex
        if (typeof expressions[key].afterRegex !== "undefined") {
            str = str.replace(expressions[key].afterRegex, "");
        }
    });
    //Replace all line breaks expressions
    //str = str.replace(/^\n\n+/gm, function () {
    //    return renderer("br", {});
    //});
    //Replace all the ignored blocks
    for (let i = ignoredBlocks.length - 1; i >= 0; i--) {
        str = str.replace(`<pre>{IGNORED%${i}}</pre>`, ignoredBlocks[i]);
    }
    //Return the parsed markdown string
    return str;
}

