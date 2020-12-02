//Default delimiter
let delimiter = "/";

//Export url manager
export const url = {
    //Resolves a target URL relative to a base URL
    //Inspired in: https://nodejs.org/api/url.html#url_url_resolve_from_to
    "resolve": function (from, to) {
        return new URL(to, from).href;
    },
    //Parse an url
    "parse": function (str) {
        return new URL(str);
    },
    //Join urls
    "join": function (base) {
        let joinedUrl = (base.charAt(base.length -1) !== delimiter) ? base + delimiter : base;
        //Append all urls
        for (let i = 1; i < arguments.length; i++) {
            let segment = arguments[i];
            //Check the segment initial value
            while (segment.charAt(0) === delimiter || segment.charAt(0) === ".") {
                segment = segment.substr(1);
            }
            //Check the final value
            if (segment.charAt(segment.length - 1) !== delimiter && i + 1 < arguments.length) {
                segment = segment + delimiter;
            }
            //Append to the joined url
            joinedUrl = joinedUrl + segment;
        }
        //Return the joined url
        return joinedUrl;
    },
    //Split an url
    "split": function (path) {
        return path.split(delimiter).filter(function (path) {
            return path.length !== 0;
        });
    }
};

