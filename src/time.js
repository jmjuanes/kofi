/**
 * @function delay(time, fn)
 * @description This is just [`setTimeout`](https://developer.mozilla.org/en-US/docs/Web/API/WindowOrWorkerGlobalScope/setTimeout) 
 * but with the arguments reverted (first the delay `time` in ms, then the callback `fn` function).
 * @example
 * delay(1000, function () {
 *     console.log("Hello after 1 second!!");
 * });
 */

export const delay = function (time, fn) {
    return setTimeout(fn, time);
};

/**
 * @function timer(time, fn)
 * @description This is just [`setInterval`](https://developer.mozilla.org/en-US/docs/Web/API/WindowOrWorkerGlobalScope/setInterval) 
 * but with the arguments reverted (first the delay `time` in ms and then the callback `fn` function).
 * @example 
 * let counter = 0;
 * timer(1000, function () {
 *     counter = counter + 1;
 *     console.log(counter);
 * });
 */

export const timer = function (time, fn) {
    return setInterval(fn, time);
};

