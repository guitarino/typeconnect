export function removeItemFromArrayIfExists(item, array) {
    const index = array.indexOf(item);
    if (index >= 0) {
        array.splice(index, 1);
    }
}