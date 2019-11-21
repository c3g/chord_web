import React, {Component} from "react";
import {connect} from "react-redux";
import PropTypes from "prop-types";

import {
    Button,
    Card,
    Col,
    Collapse,
    Divider,
    Dropdown,
    Empty,
    Icon,
    Menu,
    Modal,
    Row,
    Spin,
    Table,
    Tabs,
    Typography
} from "antd";
import "antd/es/button/style/css";
import "antd/es/card/style/css";
import "antd/es/collapse/style/css";
import "antd/es/divider/style/css";
import "antd/es/dropdown/style/css";
import "antd/es/empty/style/css";
import "antd/es/icon/style/css";
import "antd/es/menu/style/css";
import "antd/es/modal/style/css";
import "antd/es/spin/style/css";
import "antd/es/table/style/css";
import "antd/es/tabs/style/css";
import "antd/es/typography/style/css";

import DataUseDisplay from "../DataUseDisplay";
import DiscoverySearchForm from "./DiscoverySearchForm";
// import SchemaTree from "../SchemaTree";

import {
    toggleDiscoverySchemaModal,
    performFullSearchIfPossible,
    selectSearch,

    addDataTypeQueryForm,
    updateDataTypeQueryForm,
    removeDataTypeQueryForm,

    updateJoinQueryForm,
} from "../../modules/discovery/actions";


class DiscoverySearchContent extends Component {
    constructor(props) {
        super(props);

        // TODO: Redux?
        this.state = {
            dataUseTermsModalShown: false,
            dataset: null
        };

        this.handleSubmit = this.handleSubmit.bind(this);
        this.handleSearchSelect = this.handleSearchSelect.bind(this);
        this.renderSearches = this.renderSearches.bind(this);
        this.handleFormChange = this.handleFormChange.bind(this);
        this.handleSchemaToggle = this.handleSchemaToggle.bind(this);
        this.handleDatasetTermsClick = this.handleDatasetTermsClick.bind(this);
        this.handleDatasetTermsCancel = this.handleDatasetTermsCancel.bind(this);

        this.handleAddDataTypeQueryForm = this.handleAddDataTypeQueryForm.bind(this);
        this.handleTabsEdit = this.handleTabsEdit.bind(this);
    }

    handleFormChange(dataType, fields) {
        this.props.updateDataTypeQueryForm(dataType, fields);
    }

    handleSubmit() {
        this.props.performFullSearchIfPossible();
    }

    handleSearchSelect(searchIndex) {
        if (this.props.dataType === null) return;
        this.props.selectSearch(this.props.serviceInfo, this.props.dataType.id, parseInt(searchIndex, 10));
    }

    handleDatasetTermsClick(dataset) {
        this.setState({
            dataUseTermsModalShown: true,
            dataset
        });
    }

    handleDatasetTermsCancel() {
        this.setState({dataUseTermsModalShown: false});
    }

    handleSchemaToggle() {
        this.props.toggleSchemaModal();
    }

    handleAddDataTypeQueryForm(e) {
        const dataTypeID = e.key.split(":")[1];
        const dataType = this.props.dataTypesByID[dataTypeID];
        this.props.addDataTypeQueryForm(dataType);
    }

    handleTabsEdit(key, action) {
        if (action !== "remove") return;
        const dataType = this.props.dataTypesByID[key];
        this.props.removeDataTypeQueryForm(dataType);
    }

    renderSearches() {
        if (!this.props.searches || this.props.searches.length === 0) return (
            <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} description="No Searches" />
        );

        return (
            <Collapse bordered={false} accordion={true} activeKey={(this.props.selectedSearch || 0).toString()}
                      onChange={this.handleSearchSelect}>
                {[...this.props.searches].reverse().map((s, i) => (
                    <Collapse.Panel header={`Search ${this.props.searches.length - i}`}
                                    key={this.props.searches.length - i - 1}>
                        <Table bordered={true} dataSource={s.results} rowKey="dataset_id">
                            <Table.Column title="Dataset ID" dataIndex="dataset_id" />
                            <Table.Column title="Name" dataIndex="name" />
                            <Table.Column title="Actions" dataIndex="actions" render={(_, dataset) => (
                                <Row type="flex">
                                    <Col>
                                        <Button type="link" onClick={() => this.handleDatasetTermsClick(dataset)}>
                                            Show Data Use Terms
                                        </Button>
                                    </Col>
                                    <Col>
                                        <Button type="link">{/* TODO: Real actions */}Request Access</Button>
                                    </Col>
                                </Row>
                            )} />
                        </Table>
                    </Collapse.Panel>
                ))}
            </Collapse>
        );
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
                    </Typography.Title>

                    {this.props.dataTypeForms.length > 0
                        ? <Tabs type="editable-card" hideAdd onEdit={this.handleTabsEdit}>{dataTypeTabPanes}</Tabs>
                        : <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} description="No Data Types Added" />}

                    <Divider />

                    <Typography.Title level={3}>Join Query</Typography.Title>

                    <DiscoverySearchForm conditionType="join"
                                         formValues={this.props.joinFormValues}
                                         loading={this.props.searchLoading}
                                         onChange={fields => this.props.updateJoinForm(fields)} />

                    <Button type="primary" icon="search" onClick={this.handleSubmit}>Search</Button>
                </Card>

                {/*<Modal title={`${(this.props.dataType || {id: ""}).id} Schema`}*/}
                {/*       visible={this.props.schemaModalShown}*/}
                {/*       onCancel={this.handleSchemaToggle} footer={null}>*/}
                {/*    <SchemaTree schema={(this.props.dataType || {schema: {}}).schema} />*/}
                {/*</Modal>*/}

                <Modal title={`Dataset ${((this.state.dataset || {}).name || (this.state.dataset || {}).id || "")
                    .substr(0, 18)}${((this.state.dataset || {}).name || "").length > 18 ? "…"
                    : ""}: Data Use Terms`}
                       visible={this.state.dataUseTermsModalShown}
                       onCancel={() => this.handleDatasetTermsCancel()} footer={null}>
                    <DataUseDisplay dataUse={(this.state.dataset || {}).data_use} />
                </Modal>

                <Typography.Title level={3}>Results</Typography.Title>
                <Spin spinning={this.props.searchLoading}>{this.renderSearches()}</Spin>
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
    searches: PropTypes.array,
    selectedSearch: PropTypes.number,
    searchLoading: PropTypes.bool,
    formValues: PropTypes.object,
    dataTypeForms: PropTypes.arrayOf(PropTypes.object),
    joinFormValues: PropTypes.object,

    selectDataType: PropTypes.func,
    toggleSchemaModal: PropTypes.func,
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

    searches: state.discovery.searches,
    selectedSearch: state.discovery.selectedSearch,

    searchLoading: state.discovery.isFetching,

    dataTypeForms: state.discovery.dataTypeForms,
    joinFormValues: state.discovery.joinFormValues,
});

const mapDispatchToProps = dispatch => ({
    toggleSchemaModal: () => dispatch(toggleDiscoverySchemaModal()),
    selectSearch: (serviceInfo, dataTypeID, searchIndex) =>
        dispatch(selectSearch(serviceInfo, dataTypeID, searchIndex)),

    performFullSearchIfPossible: () => dispatch(performFullSearchIfPossible()),

    addDataTypeQueryForm: dataType => dispatch(addDataTypeQueryForm(dataType)),
    updateDataTypeQueryForm: (dataType, fields) => dispatch(updateDataTypeQueryForm(dataType, fields)),
    removeDataTypeQueryForm: dataType => dispatch(removeDataTypeQueryForm(dataType)),

    updateJoinForm: fields => dispatch(updateJoinQueryForm(fields)),
});

export default connect(mapStateToProps, mapDispatchToProps)(DiscoverySearchContent);
