import React from "react";

import {Typography} from "antd";
import "antd/es/typography/style/css";

// TODO: Remove objects/arrays with exclusively unsearchable children, option to remove unsearchable children
export const generateSchemaTreeData = (node, name, prefix, excludedKeys) => {
    const key = `${prefix}${name}`;
    const value = key;
    const title = (<span><Typography.Text code>{name}</Typography.Text> - {node.type}</span>);

    const baseNode = {
        key,
        value,
        title,
        selectable: node.hasOwnProperty("search") && node.search.hasOwnProperty("operations")
            && node.search.operations.length > 0 && !excludedKeys.includes(key),
        disabled: excludedKeys.includes(key)
    };

    switch (node.type) {
        // Want to filter here, but upon filtering children ant stops rendering them correctly
        case "object":
            return {
                ...baseNode,
                children: Object.entries(node.properties)
                    .sort((a, b) => {
                        if (a[1].hasOwnProperty("search") && b[1].hasOwnProperty("search")
                                && a[1].search.hasOwnProperty("order") && b[1].search.hasOwnProperty("order")) {
                            return a[1].search.order - b[1].search.order;
                        }
                        return a[0].localeCompare(b[0]);
                    })
                    .map(p => generateSchemaTreeData(p[1], p[0], `${key}.`, excludedKeys))
            };
        case "array":
            return {
                ...baseNode,
                children: [generateSchemaTreeData(node.items, "[array item]", `${key}.`, excludedKeys)]
            };
        default:
            return {
                ...baseNode,
                children: []
            };
    }
};

/**
 * @param {object} schema
 * @param {string} fieldString
 */
export const getFieldSchema = (schema, fieldString) => {
    const components = fieldString.split(".");
    if (components.length === 0 || components[0] !== "[dataset item]") {
        // Field string doesn't correspond to the format mandated by the CHORD front end.
        throw new Error("Invalid format for field string.");
    }

    let currentSchema = schema;
    let currentComponent = 0;
    while (currentComponent < components.length - 1) {
        switch (currentSchema.type) {
            case "object":
                currentComponent++;
                if (!currentSchema.hasOwnProperty("properties")
                        || !currentSchema.properties.hasOwnProperty(components[currentComponent])) {
                    throw new Error("Invalid field specified in field string.");
                }
                currentSchema = currentSchema.properties[components[currentComponent]];
                break;

            case "array":
                currentComponent++;
                if (!currentSchema.hasOwnProperty("items") || components[currentComponent] !== "[array item]") {
                    throw new Error("Invalid field specified in field string.");
                }
                currentSchema = currentSchema.items;
                break;

            default:
                throw new Error("Cannot access properties of primitives.");
        }
    }

    return currentSchema;
};

export const getFields = schema => {
    // TODO: Deduplicate with tree select
    if (!schema) return [];
    const treeData = generateSchemaTreeData(schema, "[dataset item]", "", []);
    const getFieldsFromTreeData = (node, acc) => {
        acc.push(node.key);
        node.children.map(c => getFieldsFromTreeData(c, acc));
    };
    const acc = [];
    getFieldsFromTreeData(treeData, acc);
    return acc;
};
