export function createReactiveArray(callback) {
    const array = [];

    return new Proxy(array, {
        get(target, property) {
            if (property === "clear") {
                return function () {
                    const removedItems = target.slice(); // Copy all items
                    target.length = 0; // Clear the array
                    callback("remove", removedItems); // Notify callback
                };
            }
            const value = target[property];
            if (typeof value === "function") {
                return function (...args) {
                    const result = value.apply(target, args);
                    if (["push", "unshift", "splice"].includes(property)) {
                        callback("add", args);
                    } else if (["pop", "shift", "splice"].includes(property)) {
                        callback("remove", result);
                    }
                    return result;
                };
            }
            return value;
        },
        set(taget, property, value) {
            target[property] = value;
            if (property !== "length") {
                callback("add", [value]);
            }
            return true;
        },
    });
}
