import React, {Component} from "react";
import {connect} from "react-redux";
import PropTypes from "prop-types";

import {Button, Card, Dropdown, Empty, Icon, Menu, Modal, Tabs, Typography} from "antd";
import "antd/es/button/style/css";
import "antd/es/card/style/css";
import "antd/es/dropdown/style/css";
import "antd/es/empty/style/css";
import "antd/es/icon/style/css";
import "antd/es/menu/style/css";
import "antd/es/modal/style/css";
import "antd/es/tabs/style/css";
import "antd/es/typography/style/css";

import DataTypeExplorationModal from "./DataTypeExplorationModal";
import DiscoverySearchForm from "./DiscoverySearchForm";
import {nop} from "../../utils";


class DiscoveryQueryBuilder extends Component {
    constructor(props) {
        super(props);

        this.state = {
            schemasModalShown: false
        };

        this.handleSubmit = this.handleSubmit.bind(this);

        this.handleFormChange = this.handleFormChange.bind(this);
        this.handleSchemasToggle = this.handleSchemasToggle.bind(this);

        this.handleAddDataTypeQueryForm = this.handleAddDataTypeQueryForm.bind(this);
        this.handleTabsEdit = this.handleTabsEdit.bind(this);

        this.forms = {};
    }

    async handleSubmit() {
        try {
            await Promise.all(Object.entries(this.forms).filter(f => f[1]).map(([_dt, f]) =>
                new Promise((resolve, reject) => {
                    f.props.form.validateFields({force: true}, err => {
                        if (err) {
                            // TODO: If error, switch to errored tab
                            reject(err);
                        }
                        resolve();  // TODO: data?
                    });
                })));

            (this.props.onSubmit || nop)();
        } catch (err) {
            console.error(err);
        }
    }

    handleFormChange(dataType, fields) {
        this.props.updateDataTypeQueryForm(dataType, fields);
    }

    handleSchemasToggle() {
        this.setState({schemasModalShown: !this.state.schemasModalShown});
    }

    handleAddDataTypeQueryForm(e) {
        this.props.addDataTypeQueryForm(this.props.dataTypesByID[e.key.split(":")[1]]);
    }

    handleTabsEdit(key, action) {
        if (action !== "remove") return;
        this.props.removeDataTypeQueryForm(this.props.dataTypesByID[key]);
    }

    render() {
        const dataTypeMenu = (
            <Menu onClick={this.handleAddDataTypeQueryForm}>
                {this.props.servicesInfo.filter(s => (this.props.dataTypes[s.id] || {items: null}).items)
                    .flatMap(s => this.props.dataTypes[s.id].items.map(dt =>
                        <Menu.Item key={`${s.id}:${dt.id}`}>{dt.id}</Menu.Item>
                    ))
                }
            </Menu>
        );

        const dataTypeTabPanes = this.props.dataTypeForms.map(d => (
            <Tabs.TabPane tab={d.dataType.id} key={d.dataType.id}>
                <DiscoverySearchForm conditionType="data-type"
                                     isInternal={this.props.isInternal || false}
                                     dataType={d.dataType}
                                     formValues={d.formValues}
                                     loading={this.props.searchLoading}
                                     wrappedComponentRef={form => this.forms[d.dataType.id] = form}
                                     onChange={fields => this.handleFormChange(d.dataType, fields)} />
            </Tabs.TabPane>
        ));

        const addConditionsOnDataType = (buttonProps = {style: {float: "right"}}) => (
            <Dropdown overlay={dataTypeMenu}
                      disabled={this.props.dataTypesLoading || this.props.searchLoading}>
                <Button {...buttonProps}>Add Conditions on Data Type <Icon type="down" /></Button>
            </Dropdown>
        );

        return (
            <Card style={{marginBottom: "1.5em"}}>
                <DataTypeExplorationModal dataTypes={this.props.dataTypes}
                                          visible={this.state.schemasModalShown}
                                          onCancel={this.handleSchemasToggle} />

                <Typography.Title level={3} style={{marginBottom: "1.5rem"}}>
                    Data Type Queries
                    {addConditionsOnDataType()}
                    <Button style={{float: "right", marginRight: "1em"}}
                            onClick={this.handleSchemasToggle}><Icon type="table" /> Explore Data Types</Button>
                    <Button style={{float: "right", marginRight: "1em"}} onClick={() => {
                        /** @type {object|null} */
                        let helpModal = null;

                        const destroyHelpModal = () => {
                            this.handleSchemasToggle();
                            if (helpModal) helpModal.destroy();
                        };

                        helpModal = Modal.info({
                            title: "Help",
                            content: <>
                                <Typography.Paragraph>
                                    CHORD defines multiple queryable data types for researchers to take advantage of to
                                    standardize their datasets and make them discoverable. Each of these data types is
                                    defined by a <strong>schema</strong>, which specifies all the components of a single
                                    object in a table of a given data type. Some of the fields of these objects are
                                    directly queryable, while others are not; this is determined in part by the
                                    sensitivity of the field.
                                </Typography.Paragraph>
                                <Typography.Paragraph>
                                    Data types and their schemas can be <a onClick={destroyHelpModal}>explored</a> in
                                    both a tree and a searchable table structure.
                                </Typography.Paragraph>
                                <Typography.Paragraph>
                                    If two or more data types are queried at the same time, the federated search system
                                    will look for datasets that have linked data objects matching both criteria. This
                                    first requires that researchers have correctly set up their datasets to link e.g.
                                    patients with their corresponding genomic variants.
                                </Typography.Paragraph>
                            </>,
                            maskClosable: true,
                            width: 720
                        });
                    }}><Icon type="question-circle" /> Help</Button>
                </Typography.Title>

                {this.props.dataTypeForms.length > 0
                    ? <Tabs type="editable-card" hideAdd onEdit={this.handleTabsEdit}>{dataTypeTabPanes}</Tabs>
                    : (
                        <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} description="No Data Types Added">
                            {addConditionsOnDataType({type: "primary"})}
                        </Empty>
                    )}

                {/* TODO: Allow this to be optionally specified for advanced users
                <Divider />

                <Typography.Title level={3}>Join Query</Typography.Title>

                <DiscoverySearchForm conditionType="join"
                                     formValues={this.props.joinFormValues}
                                     loading={this.props.searchLoading}
                                     onChange={fields => this.props.updateJoinForm(fields)} />
                */}

                <Button type="primary"
                        icon="search"
                        loading={this.props.searchLoading}
                        disabled={this.props.dataTypeForms.length === 0}
                        onClick={() => this.handleSubmit()}>Search</Button>
            </Card>
        );
    }
}

DiscoveryQueryBuilder.propTypes = {
    isInternal: PropTypes.bool,
    onSearchSelect: PropTypes.func,
    servicesInfo: PropTypes.arrayOf(PropTypes.object),
    dataTypes: PropTypes.object,
    dataTypesByID: PropTypes.object,
    serviceInfo: PropTypes.object,
    dataTypesLoading: PropTypes.bool,
    searchLoading: PropTypes.bool,
    formValues: PropTypes.object,
    dataTypeForms: PropTypes.arrayOf(PropTypes.object),
    joinFormValues: PropTypes.object,

    selectDataType: PropTypes.func,
    updateSearchForm: PropTypes.func,
    requestSearch: PropTypes.func,

    addDataTypeQueryForm: PropTypes.func,
    updateDataTypeQueryForm: PropTypes.func,
    removeDataTypeQueryForm: PropTypes.func,

    onSubmit: PropTypes.func,
};

const mapStateToProps = state => ({
    servicesInfo: state.services.items,
    dataTypes: state.serviceDataTypes.dataTypesByServiceID,
    dataTypesByID: state.serviceDataTypes.itemsByID,

    dataTypesLoading: state.services.isFetching || state.serviceDataTypes.isFetchingAll
        || Object.keys(state.serviceDataTypes.dataTypesByServiceID).length === 0,
});

export default connect(mapStateToProps)(DiscoveryQueryBuilder);
