import React from "react";
import {Link} from "react-router-dom";
import PropTypes from "prop-types";

import {Menu} from "antd";
import "antd/es/menu/style/css";

import {SIGN_IN_URL} from "./constants";


export const EM_DASH = "⁠—";


// Functional utilities
export const id = x => x;  // id is a function that returns it's first passed parameter
export const nop = () => {};
export const constFn = x => () => x;  // constFn(null) creates a function that always returns null


export const urlPath = url => (new URL(url)).pathname;

// Allow embedding of CHORD_URL at build time
export const BASE_PATH = process.env.CHORD_URL ? urlPath(process.env.CHORD_URL) : "/";
export const withBasePath = path => `${BASE_PATH}${(path.length > 0 && path[0] === "/" ? path.slice(1) : path)}`;

export const signInURLWithRedirect = () => withBasePath(`${SIGN_IN_URL}?redirect=${window.location.href}`);


export const simpleDeepCopy = o => JSON.parse(JSON.stringify(o));

export const objectWithoutProps =(o, ps) => Object.fromEntries(Object.entries(o)
    .filter(([p2], _) => !ps.includes(p2)));
export const objectWithoutProp = (o, p) => objectWithoutProps(o, [p]);


// Custom menu renderer
export const renderMenuItem = i => {
    if (i.hasOwnProperty("children")) {
        return (
            <Menu.SubMenu style={i.style || {}} title={
                <span className="submenu-title-wrapper">
                    {i.icon || null}
                    {i.text || null}
                </span>
            } key={i.key || ""}>
                {(i.children || []).map(ii => renderMenuItem(ii))}
            </Menu.SubMenu>
        );
    }

    return (
        <Menu.Item key={i.key || i.url || ""}
                   onClick={i.onClick || undefined}
                   style={i.style || {}}
                   disabled={i.disabled || false}>
            {i.url && !i.onClick ?
                <Link to={i.url}>
                    {i.icon || null}
                    {i.text || null}
                </Link> : <span>
                    {i.icon || null}
                    {i.text || null}
                </span>}
        </Menu.Item>
    )
};

export const matchingMenuKeys = menuItems => menuItems
    .filter(i => (i.url && window.location.pathname.startsWith(i.url)) || (i.children || []).length > 0)
    .flatMap(i => [i.key || i.url || "", ...matchingMenuKeys(i.children || [])]);


export const FORM_MODE_ADD = "add";
export const FORM_MODE_EDIT = "edit";
export const propTypesFormMode = PropTypes.oneOf([FORM_MODE_ADD, FORM_MODE_EDIT]);


export const nodeInfoDataPropTypesShape = PropTypes.shape({
    CHORD_URL: PropTypes.string,
    OIDC_DISCOVERY_URI: PropTypes.string,
});


export const serviceInfoPropTypesShape = PropTypes.shape({
    id: PropTypes.string.required,
    name: PropTypes.string.required,
    type: PropTypes.shape({
        group: PropTypes.string.required,
        artifact: PropTypes.string.required,
        version: PropTypes.string.required,
    }).required,
    description: PropTypes.string,
    organization: PropTypes.shape({
        name: PropTypes.string.required,
        url: PropTypes.string.required,
    }),
    contactUrl: PropTypes.string,
    documentationUrl: PropTypes.string,
    createdAt: PropTypes.string,
    updatedAt: PropTypes.string,
    environment: PropTypes.string,
    version: PropTypes.string.required,
});

export const chordServicePropTypesMixin = {
    type: PropTypes.shape({
        organization: PropTypes.string,
        artifact: PropTypes.string,
        language: PropTypes.string,
    }),
    repository: PropTypes.string,
    data_service: PropTypes.bool,
    manageable_tables: PropTypes.bool,
    wsgi: PropTypes.bool,
};


// Gives components which include this in their state to props connection access to the drop box and loading status.
export const dropBoxTreeStateToPropsMixin = state => ({
    tree: state.dropBox.tree,
    treeLoading: state.dropBox.isFetching
});

// Any components which include dropBoxTreeStateToPropsMixin should include this as well in their prop types.
export const dropBoxTreeStateToPropsMixinPropTypes = {
    tree: PropTypes.arrayOf(PropTypes.shape({
        name: PropTypes.string,
        path: PropTypes.string
    })),  // TODO: This is going to change
    treeLoading: PropTypes.bool
};


export const linkedFieldSetPropTypesShape = PropTypes.shape({
    name: PropTypes.string,
    fields: PropTypes.objectOf(PropTypes.arrayOf(PropTypes.string)),  // TODO: Properties pattern?
});


// Prop types object shape for a single dataset object.
export const datasetPropTypesShape = PropTypes.shape({
    identifier: PropTypes.string,
    title: PropTypes.string,
    description: PropTypes.string,
    contact_info: PropTypes.string,
    data_use: PropTypes.object,  // TODO: Shape
    linked_field_sets: PropTypes.arrayOf(linkedFieldSetPropTypesShape),
    created: PropTypes.string,
    updated: PropTypes.string,

    // May not be present if nested (project ID)
    project: PropTypes.string,
});


// Prop types object shape for a single project object.
export const projectPropTypesShape = PropTypes.shape({
    identifier: PropTypes.string,
    title: PropTypes.string,
    description: PropTypes.string,
    datasets: PropTypes.arrayOf(datasetPropTypesShape),
    created: PropTypes.string,
    updated: PropTypes.string
});


// Gives components which include this in their state to props connection access to workflows and loading status.
export const workflowsStateToPropsMixin = state => ({
    workflows: Object.entries(state.serviceWorkflows.workflowsByServiceID)
        .filter(([_, s]) => !s.isFetching)
        .flatMap(([serviceID, s]) => Object.entries(s.workflows.ingestion).map(([k, v]) => ({
            ...v,
            id: k,
            serviceID
        }))),
    workflowsLoading: state.services.isFetchingAll || state.serviceWorkflows.isFetchingAll
});

// Prop types object shape for a single workflow object.
export const workflowPropTypesShape = PropTypes.shape({
    id: PropTypes.string,
    serviceID: PropTypes.string,

    // "Real" properties
    name: PropTypes.string,
    description: PropTypes.string,
    data_type: PropTypes.string,
    inputs: PropTypes.arrayOf(PropTypes.shape({
        type: PropTypes.string,
        id: PropTypes.string,
        extensions: PropTypes.arrayOf(PropTypes.string)  // File type only
    })),
    outputs: PropTypes.arrayOf(PropTypes.shape({
        type: PropTypes.string,
        value: PropTypes.string
    }))
});

// Any components which include workflowStateToPropsMixin should include this as well in their prop types.
export const workflowsStateToPropsMixinPropTypes = {
    workflows: PropTypes.arrayOf(workflowPropTypesShape),
    workflowsLoading: PropTypes.bool
};
