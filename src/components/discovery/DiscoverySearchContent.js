import React, {Component} from "react";
import {connect} from "react-redux";
import PropTypes from "prop-types";

import {Button, Card, Dropdown, Empty, Menu, Modal, Tabs, Typography} from "antd";
import "antd/es/button/style/css";
import "antd/es/card/style/css";
import "antd/es/dropdown/style/css";
import "antd/es/empty/style/css";
import "antd/es/menu/style/css";
import "antd/es/modal/style/css";
import "antd/es/tabs/style/css";
import "antd/es/typography/style/css";

import {DownOutlined, QuestionCircleOutlined, SearchOutlined, TableOutlined} from "@ant-design/icons";

import DiscoverySearchForm from "./DiscoverySearchForm";
import SearchList from "./SearchList";

import {
    performFullSearchIfPossible,

    addDataTypeQueryForm,
    updateDataTypeQueryForm,
    removeDataTypeQueryForm,

    // updateJoinQueryForm,
} from "../../modules/discovery/actions";
import DataTypeExplorationModal from "./DataTypeExplorationModal";


class DiscoverySearchContent extends Component {
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

    handleFormChange(dataType, fields) {
        this.props.updateDataTypeQueryForm(dataType, fields);
    }

    handleSubmit() {
        Object.entries(this.forms).filter(f => f[1]).forEach(([_dt, f]) => {
            f.props.form.validateFields({force: true}, err => {
                if (err) {
                    console.error(err);
                    // TODO: If error, switch to errored tab
                    return;
                }
                this.props.performFullSearchIfPossible();
            });
        });
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
                <Button {...buttonProps}>Add Conditions on Data Type <DownOutlined /></Button>
            </Dropdown>
        );

        return (
            <>
                <Card style={{marginBottom: "1.5em"}}>
                    <Typography.Title level={3} style={{marginBottom: "1.5rem"}}>
                        Data Type Queries
                        {addConditionsOnDataType()}
                        <Button style={{float: "right", marginRight: "1em"}}
                                onClick={this.handleSchemasToggle}><TableOutlined /> Explore Data Types</Button>
                        <Button style={{float: "right", marginRight: "1em"}} onClick={() => {
                            const helpModal = Modal.info({
                                title: "Help",
                                content: <>
                                    <Typography.Paragraph>
                                        CHORD defines multiple queryable data types for researchers to take advantage of
                                        to standardize their datasets and make them discoverable. Each of these data
                                        types is defined by a <strong>schema</strong>, which specifies all the
                                        components of a single object in a table of a given data type. Some of the
                                        fields of these objects are directly queryable, while others aren't; this is
                                        determined in part by the sensitivity of the field.
                                    </Typography.Paragraph>
                                    <Typography.Paragraph>
                                        Data types and their schemas can
                                        be <a href="#" onClick={() => {
                                            this.handleSchemasToggle();
                                            helpModal.destroy();
                                        }}>explored</a> in both a tree
                                        and a searchable table structure.
                                    </Typography.Paragraph>
                                    <Typography.Paragraph>
                                        If two or more data types are queried at the same time, the federated search
                                        system will look for datasets that have linked data objects matching both
                                        criteria. This first requires that researchers have correctly set up their
                                        datasets to link e.g. patients with their corresponding genomic variants.
                                    </Typography.Paragraph>
                                </>,
                                maskClosable: true,
                                width: 720
                            })
                        }}><QuestionCircleOutlined /> Help</Button>
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
                            icon={<SearchOutlined />}
                            loading={this.props.searchLoading}
                            disabled={this.props.dataTypeForms.length === 0}
                            onClick={this.handleSubmit}>Search</Button>
                </Card>

                <DataTypeExplorationModal dataTypes={this.props.dataTypes}
                                          visible={this.state.schemasModalShown}
                                          onCancel={this.handleSchemasToggle} />

                <Typography.Title level={3}>Results</Typography.Title>
                <SearchList />
            </>
        );
    }
}

DiscoverySearchContent.propTypes = {
    onSearchSelect: PropTypes.func,
    servicesInfo: PropTypes.arrayOf(PropTypes.object),
    dataTypes: PropTypes.object,
    dataTypesByID: PropTypes.object,
    serviceInfo: PropTypes.object,
    dataTypesLoading: PropTypes.bool,
    modalShown: PropTypes.bool,
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
};

const mapStateToProps = state => ({
    servicesInfo: state.services.items,
    dataTypes: state.serviceDataTypes.dataTypesByServiceID,
    dataTypesByID: state.serviceDataTypes.itemsByID,

    dataTypesLoading: state.services.isFetching || state.serviceDataTypes.isFetchingAll
        || Object.keys(state.serviceDataTypes.dataTypesByServiceID).length === 0,

    schemaModalShown: state.discovery.schemaModalShown,

    searchLoading: state.discovery.isFetching,

    dataTypeForms: state.discovery.dataTypeForms,
    joinFormValues: state.discovery.joinFormValues,
});

const mapDispatchToProps = dispatch => ({
    performFullSearchIfPossible: () => dispatch(performFullSearchIfPossible()),

    addDataTypeQueryForm: dataType => dispatch(addDataTypeQueryForm(dataType)),
    updateDataTypeQueryForm: (dataType, fields) => dispatch(updateDataTypeQueryForm(dataType, fields)),
    removeDataTypeQueryForm: dataType => dispatch(removeDataTypeQueryForm(dataType)),

    // updateJoinForm: fields => dispatch(updateJoinQueryForm(fields)),
});

export default connect(mapStateToProps, mapDispatchToProps)(DiscoverySearchContent);
