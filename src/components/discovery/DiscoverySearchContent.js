import React, {Component} from "react";
import {connect} from "react-redux";
import PropTypes from "prop-types";

import {
    Button,
    Card,
    Dropdown,
    Empty,
    Icon,
    Menu,
    Tabs,
    Typography
} from "antd";
import "antd/es/button/style/css";
import "antd/es/card/style/css";
import "antd/es/dropdown/style/css";
import "antd/es/empty/style/css";
import "antd/es/icon/style/css";
import "antd/es/menu/style/css";
import "antd/es/tabs/style/css";
import "antd/es/typography/style/css";

import DiscoverySearchForm from "./DiscoverySearchForm";
import SearchList from "./SearchList";

import {
    performFullSearchIfPossible,
    selectSearch,

    addDataTypeQueryForm,
    updateDataTypeQueryForm,
    removeDataTypeQueryForm,

    updateJoinQueryForm,
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
    }

    handleFormChange(dataType, fields) {
        this.props.updateDataTypeQueryForm(dataType, fields);
    }

    handleSubmit() {
        this.props.performFullSearchIfPossible();
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
                                     onChange={fields => this.handleFormChange(d.dataType, fields)} />
            </Tabs.TabPane>
        ));

        return (
            <>
                <Card style={{marginBottom: "1.5em"}}>
                    <Typography.Title level={3} style={{marginBottom: "1.5rem"}}>
                        Data Type Queries
                        <Dropdown overlay={dataTypeMenu}
                                  disabled={this.props.dataTypesLoading || this.props.searchLoading}>
                            <Button style={{float: "right"}}>Add Conditions on Data Type <Icon type="down" /></Button>
                        </Dropdown>
                        <Button style={{float: "right", marginRight: "1em"}}
                                onClick={this.handleSchemasToggle}>Explore Data Types</Button>
                    </Typography.Title>

                    {this.props.dataTypeForms.length > 0
                        ? <Tabs type="editable-card" hideAdd onEdit={this.handleTabsEdit}>{dataTypeTabPanes}</Tabs>
                        : <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} description="No Data Types Added" />}

                    {/* TODO: Allow this to be optionally specified for advanced users
                    <Divider />

                    <Typography.Title level={3}>Join Query</Typography.Title>

                    <DiscoverySearchForm conditionType="join"
                                         formValues={this.props.joinFormValues}
                                         loading={this.props.searchLoading}
                                         onChange={fields => this.props.updateJoinForm(fields)} />
                    */}

                    <Button type="primary" icon="search" loading={this.props.searchLoading}
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
    selectSearch: PropTypes.func,

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
    selectSearch: (serviceInfo, dataTypeID, searchIndex) =>
        dispatch(selectSearch(serviceInfo, dataTypeID, searchIndex)),

    performFullSearchIfPossible: () => dispatch(performFullSearchIfPossible()),

    addDataTypeQueryForm: dataType => dispatch(addDataTypeQueryForm(dataType)),
    updateDataTypeQueryForm: (dataType, fields) => dispatch(updateDataTypeQueryForm(dataType, fields)),
    removeDataTypeQueryForm: dataType => dispatch(removeDataTypeQueryForm(dataType)),

    updateJoinForm: fields => dispatch(updateJoinQueryForm(fields)),
});

export default connect(mapStateToProps, mapDispatchToProps)(DiscoverySearchContent);
