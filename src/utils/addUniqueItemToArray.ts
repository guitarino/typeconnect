export function addUniqueItemToArray(item, array) {
    const index = array.indexOf(item);
    if (index < 0) {
        array.push(item);
    }
}