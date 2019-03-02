export function insertAndGetNewNodes<NodeType>(list: NodeType[], nodes: NodeType[]): NodeType[] {
    const newNodes: NodeType[] = [];
    for (let i = 0; i < nodes.length; i++) {
        const node = nodes[i];
        const index = list.indexOf(node);
        const isNodeNew = index < 0;
        if (isNodeNew) {
            list.push(node);
        } else {
            newNodes.push(node);
            list.splice(index, 1);
            list.push(node);
        }
    }
    return newNodes;
}