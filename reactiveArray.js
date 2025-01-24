/**
 * Creates a reactive array that notifies subscribers of changes
 * @template T The type of elements in the array
 * @param {(action: 'add' | 'remove' | 'update', elements: T[]) => void} callback Function called when array changes
 * @returns {T[] & { clear(): void }} Proxy wrapped array with additional methods
 * @throws {Error} If callback is not a function
 */
export function createReactiveArray(callback) {
    // Validate callback
    if (typeof callback !== "function") {
        throw new Error("Callback must be a function");
    }

    const array = [];

    // Store original array methods to prevent infinite loops
    const originalMethods = {
        push: Array.prototype.push,
        pop: Array.prototype.pop,
        shift: Array.prototype.shift,
        unshift: Array.prototype.unshift,
        splice: Array.prototype.splice,
    };

    return new Proxy(array, {
        get(target, property) {
            // Handle clear method
            if (property === "clear") {
                return function () {
                    if (target.length === 0) return;
                    const removedItems = target.slice();
                    target.length = 0;
                    callback("remove", removedItems);
                };
            }

            // Handle complete/uncomplete methods
            if (property === "toggleComplete") {
                return function (index) {
                    if (index < 0 || index >= target.length) {
                        throw new Error("Index out of bounds");
                    }
                    const item = target[index];
                    if (typeof item === "object" && item !== null) {
                        item.completed = !item.completed;
                        callback("update", [item]);
                    }
                };
            }

            const value = target[property];
            if (typeof value === "function") {
                return function (...args) {
                    // Handle array mutations
                    if (property === "push") {
                        // Wrap items in objects with completed status
                        const wrappedArgs = args.map((arg) => ({
                            text: arg,
                            completed: false,
                            createdAt: new Date().toISOString(),
                        }));
                        const result = originalMethods.push.apply(
                            target,
                            wrappedArgs,
                        );
                        callback("add", wrappedArgs);
                        return result;
                    }

                    if (property === "pop") {
                        if (target.length === 0) return undefined;
                        const result = originalMethods.pop.apply(target);
                        callback("remove", [result]);
                        return result;
                    }

                    if (property === "shift") {
                        if (target.length === 0) return undefined;
                        const result = originalMethods.shift.apply(target);
                        callback("remove", [result]);
                        return result;
                    }

                    if (property === "unshift") {
                        const wrappedArgs = args.map((arg) => ({
                            text: arg,
                            completed: false,
                            createdAt: new Date().toISOString(),
                        }));
                        const result = originalMethods.unshift.apply(
                            target,
                            wrappedArgs,
                        );
                        callback("add", wrappedArgs);
                        return result;
                    }

                    if (property === "splice") {
                        const [start, deleteCount, ...items] = args;
                        const wrappedItems = items.map((item) => ({
                            text: item,
                            completed: false,
                            createdAt: new Date().toISOString(),
                        }));

                        // Handle deletions
                        const deleted = originalMethods.splice.apply(
                            target,
                            [start, deleteCount || 0],
                        );
                        if (deleted.length > 0) {
                            callback("remove", deleted);
                        }

                        // Handle additions
                        if (wrappedItems.length > 0) {
                            originalMethods.splice.apply(
                                target,
                                [start, 0, ...wrappedItems],
                            );
                            callback("add", wrappedItems);
                        }

                        return deleted;
                    }

                    // Pass through other array methods
                    return value.apply(target, args);
                };
            }
            return value;
        },

        set(target, property, value) {
            const oldValue = target[property];
            target[property] = value;

            // Only trigger for array indices, not length
            if (!isNaN(Number(property)) && oldValue !== value) {
                callback("update", [value]);
            }
            return true;
        },
    });
}
