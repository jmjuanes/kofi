export function ready (fn) {
    //Resolve now if DOM has already loaded
    if (document.readyState !== "loading") {
        return fn(null);
    }
    //If not, wait for DOMContentLoaded event
    document.addEventListener("DOMContentLoaded", function () {
        return fn();
    });
}

