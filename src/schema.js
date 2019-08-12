import React from "react";

import {Typography} from "antd";
import "antd/es/typography/style/css";

const searchable = node => Object.keys(node).includes("search") && Object.keys(node.search).includes("operations")
    && node.search.operations.length > 0;

// TODO: Remove objects/arrays with exclusively unsearchable children, option to remove unsearchable children
export const generateSchemaTreeData = (node, name, prefix) => {
    const key = `${prefix}${name}`;
    const value = key;
    const title = (<span><Typography.Text code>{name}</Typography.Text> - {node.type}</span>);
    switch (node.type) {
        case "object":
            return {
                key,
                value,
                title,
                selectable: searchable(node),
                children: Object.entries(node.properties)
                    .sort((a, b) => {
                        if (Object.keys(a[1]).includes("search") && Object.keys(b[1]).includes("search")
                                && Object.keys(a[1].search).includes("order")
                                && Object.keys(b[1].search).includes("order")) {
                            return a[1].search.order - b[1].search.order;
                        }
                        return a[0].localeCompare(b[0]);
                    })
                    .map(p => generateSchemaTreeData(p[1], p[0], `${key}.`))
            };
        case "array":
            return {
                key,
                value,
                title,
                selectable: searchable(node),
                children: [generateSchemaTreeData(node.items, "[array item]", `${key}.`)]
            };
        default:
            return {
                key,
                value,
                title,
                selectable: searchable(node),
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
                if (!Object.keys(currentSchema).includes("properties")
                        || !Object.keys(currentSchema.properties).includes(components[currentComponent])) {
                    throw new Error("Invalid field specified in field string.");
                }
                currentSchema = currentSchema.properties[components[currentComponent]];
                break;

            case "array":
                currentComponent++;
                if (!Object.keys(currentSchema).includes("items") || components[currentComponent] !== "[array item]") {
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
    const treeData = generateSchemaTreeData(schema, "[dataset item]", "");
    console.log(treeData);
    const getFieldsFromTreeData = (node, acc) => {
        acc.push(node.key);
        node.children.map(c => getFieldsFromTreeData(c, acc));
    };
    const acc = [];
    getFieldsFromTreeData(treeData, acc);
    return acc;
};
