import React from "react";

import {Typography} from "antd";
import "antd/es/typography/style/css";


export const ROOT_SCHEMA_ID = "[dataset item]";
const ARRAY_ITEM_ID = "[array item]";


/**
 * Generates schema tree data and uses it to decide whether to include the current node in a searchable list fragment.
 * @param {object} node - The schema node to check.
 * @param {string} name - The node's ID (key fragment).
 * @param {string} prefix - The node's key prefix.
 * @param {string[]} excludedKeys - An array of keys to be disabled.
 * @returns {object} - A tree node for use in Ant Design components.
 */
const searchFragment = (node, name, prefix, excludedKeys) => {
    const result = generateSchemaTreeData(node, name, prefix, excludedKeys);
    return (node.hasOwnProperty("search") || node.type === "object" && result.children.length > 0 ||
        node.type === "array" && result.children.length > 0) ? [result] : [];
};

/**
 * Sorts two object entries representing schema nodes.
 * @param {array} a - The first schema node entry.
 * @param {array} b - The second schema node entry.
 * @returns {number}
 */
const sortSchemaEntries = (a, b) => {
    if (a[1].hasOwnProperty("search") && b[1].hasOwnProperty("search")
        && a[1].search.hasOwnProperty("order") && b[1].search.hasOwnProperty("order")) {
        return a[1].search.order - b[1].search.order;
    }
    return a[0].localeCompare(b[0]);
};

/**
 * Generates a schema tree for Ant Design components by recursively descending into schema nodes.
 * @param {object} node - Current schema node.
 * @param {string} name - The node's ID (key fragment).
 * @param {string} prefix - The node's key prefix.
 * @param {string[]} excludedKeys - An array of keys to be disabled.
 * @returns {{children, selectable, disabled, titleSelected, title, value, key}} - Ant tree node for the schema node.
 */
export const generateSchemaTreeData = (node, name, prefix, excludedKeys) => {
    const key = `${prefix}${name}`;
    const baseNode = {
        key,
        value: key,
        title: <span><Typography.Text code>{name}</Typography.Text> - {node.type}</span>,
        titleSelected: <Typography.Text style={{
            float: "right",
            fontFamily: "monospace",
            fontSize: "0.7rem",
            marginRight: "0.4rem"
        }}>{key.split(".").slice(1).join(".")}</Typography.Text>,
        selectable: node.hasOwnProperty("search") && node.search.hasOwnProperty("operations")
            && node.search.operations.length > 0 && !excludedKeys.includes(key),
        disabled: excludedKeys.includes(key)
    };

    // Only include fields that are searchable, objects that have all searchable properties, and arrays that have items
    // that are searchable in some way. This is done using searchFragment, which returns [] if a node and all its
    // children are not searchable.
    switch (node.type) {
        case "object":
            return {
                ...baseNode,
                children: Object.entries(node.properties || {})
                    .sort(sortSchemaEntries)
                    .flatMap(([name, node]) => searchFragment(node, name, `${key}.`, excludedKeys))
            };

        case "array":
            return {
                ...baseNode,
                children: searchFragment(node.items, ARRAY_ITEM_ID, `${key}.`, excludedKeys)
            };

        default:
            return {...baseNode, children: []};
    }
};

/**
 * Resolves a particular field's schema from the overall object schema and a dot-notation field string.
 * @param {object} schema - The overall schema for the data type.
 * @param {string} fieldString - String with dot notation representing the desired field.
 * @return {object} - Schema for the field.
 */
export const getFieldSchema = (schema, fieldString) => {
    const components = fieldString.split(".");
    if (components.length === 0 || components[0] !== ROOT_SCHEMA_ID) {
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
                if (!currentSchema.hasOwnProperty("items") || components[currentComponent] !== ARRAY_ITEM_ID) {
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

/**
 * Gets all fields (in their dot-delimited key representation) from a schema.
 * @param {object} schema - The schema to extract keys from.
 * @returns {string[]} - An array of fields in dot-delimited key representation.
 */
export const getFields = schema => {
    // TODO: Deduplicate with tree select
    if (!schema) return [];
    const treeData = generateSchemaTreeData(schema, ROOT_SCHEMA_ID, "", []);
    const getFieldsFromTreeData = (node, acc) => {
        acc.push(node.key);
        node.children.map(c => getFieldsFromTreeData(c, acc));
    };
    const acc = [];
    getFieldsFromTreeData(treeData, acc);
    return acc;
};
