export function removeItemFromArrayIfExists<T>(item: T, array: Array<T>) {
    const index = array.indexOf(item);
    if (index >= 0) {
        array.splice(index, 1);
    }
}