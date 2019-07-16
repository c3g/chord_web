import React from "react";

import {Typography} from "antd";
import "antd/es/typography/style/css";

export const generateSchemaTreeData = (node, name, prefix) => {
    const key = `${prefix}.${name}`;
    const value = key;
    const title = (<span><Typography.Text code>{name}</Typography.Text> - {node.type}</span>);
    switch (node.type) {
        case "object":
            return {
                key,
                value,
                title,
                selectable: false,
                children: Object.keys(node.properties)
                    .sort()
                    .map(k => generateSchemaTreeData(node.properties[k], k, key))
            };
        case "array":
            return {
                key,
                value,
                title,
                selectable: false,
                children: [generateSchemaTreeData(node.items, "[array item]", key)]
            };
        default:
            return {key, value, title, children: []};
    }
};
