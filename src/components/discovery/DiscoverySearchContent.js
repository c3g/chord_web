import React, {Component} from "react";
import {connect} from "react-redux";
import PropTypes from "prop-types";

import {
    Button,
    Col,
    Collapse,
    Divider,
    Empty,
    Form,
    Modal,
    Row,
    Select,
    Spin,
    Table,
    Typography
} from "antd";
import "antd/es/button/style/css";
import "antd/es/collapse/style/css";
import "antd/es/divider/style/css";
import "antd/es/empty/style/css";
import "antd/es/form/style/css";
import "antd/es/modal/style/css";
import "antd/es/select/style/css";
import "antd/es/spin/style/css";
import "antd/es/table/style/css";
import "antd/es/typography/style/css";

import DataUseDisplay from "../DataUseDisplay";
import DiscoverySearchForm from "./DiscoverySearchForm";
import SchemaTree from "../SchemaTree";

import {
    toggleDiscoverySchemaModal,
    selectDiscoveryServiceDataType,
    performSearch,
    selectSearch,
    updateDiscoverySearchForm
} from "../../modules/discovery/actions";


class DiscoverySearchContent extends Component {
    constructor(props) {
        super(props);

        // TODO: Redux?
        this.state = {
            dataUseTermsModalShown: false,
            dataset: null,
            dataUse: null
        };

        this.handleSubmit = this.handleSubmit.bind(this);
        this.handleSearchSelect = this.handleSearchSelect.bind(this);
        this.renderSearches = this.renderSearches.bind(this);
        this.handleFormChange = this.handleFormChange.bind(this);
        this.handleDataTypeChange = this.handleDataTypeChange.bind(this);
        this.handleSchemaToggle = this.handleSchemaToggle.bind(this);
        this.handleDatasetTermsClick = this.handleDatasetTermsClick.bind(this);
        this.handleDatasetTermsCancel = this.handleDatasetTermsCancel.bind(this);
    }

    handleFormChange(fields) {
        if (this.props.dataType === null) return;
        this.props.updateSearchForm(this.props.service.id, this.props.dataType.id, fields);
    }

    handleSubmit(conditions) {
        if (this.props.dataType === null) return;
        this.props.requestSearch(this.props.service, this.props.dataType.id, conditions);
    }

    handleSearchSelect(searchIndex) {
        if (this.props.dataType === null) return;
        this.props.selectSearch(this.props.service.id, this.props.dataType.id, parseInt(searchIndex, 10));
    }

    handleDatasetTermsClick(dataset) {
        this.setState({
            dataUseTermsModalShown: true,
            dataset: dataset.id,
            dataUse: dataset.dataUse
        });
    }

    handleDatasetTermsCancel() {
        this.setState({dataUseTermsModalShown: false});
    }

    handleDataTypeChange(value) {
        const [sID, dtID] = value.split(":");
        this.props.selectDataType(sID, dtID);
    }

    handleSchemaToggle() {
        this.props.toggleSchemaModal();
    }

    renderSearches() {
        // TODO: Group all searches, not data-type specific

        if (!this.props.dataType || !this.props.searches || this.props.searches.length === 0) return (
            <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} description="No Searches" />
        );

        return (
            <Collapse bordered={false} accordion={true} activeKey={this.props.selectedSearch.toString()}
                      onChange={this.handleSearchSelect}>
                {[...this.props.searches].reverse().map((s, i) => (
                    <Collapse.Panel header={`Search ${this.props.searches.length - i}`}
                                    key={this.props.searches.length - i - 1}>
                        <Table bordered={true}
                               dataSource={s.results.map(s => ({
                                   ...s,
                                   dataUse: {
                                       consent_code: {
                                           primary_category: {code: "GRU"},
                                           secondary_categories: [{code: "NGMR"}]
                                       },
                                       data_use_requirements: [{code: "COL"}, {code: "US"}]
                                   }
                               }))}
                               rowKey="id">
                            <Table.Column title="Dataset ID" dataIndex="id" />
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
        const dtKey = (sID, dtID) => `${sID}:${dtID}`;
        return (
            <>
                <Form layout="inline">
                    <Form.Item label="Data Type">
                        <Select size="large" showSearch placeholder="Data Type" style={{width: 200}}
                                loading={this.props.dataTypesLoading}
                                value={this.props.dataType ? dtKey(this.props.service.id, this.props.dataType.id)
                                    : undefined}
                                onChange={this.handleDataTypeChange}>
                            {this.props.services.filter(s => (this.props.dataTypes[s.id] || {items: null}).items)
                                .flatMap(s => this.props.dataTypes[s.id].items.map(dt =>
                                    <Select.Option key={dtKey(s.id, dt.id)}>{dt.id}</Select.Option>
                                ))}
                        </Select>
                    </Form.Item>
                    {this.props.dataType ? (<Button size="large" onClick={this.handleSchemaToggle}>Schema</Button>)
                        : null}
                </Form>

                {this.props.dataType ? (
                    <>
                        <Modal title={`${this.props.dataType.id} Schema`} visible={this.props.schemaModalShown}
                               onCancel={this.handleSchemaToggle} footer={null}>
                            <SchemaTree schema={this.props.dataType.schema} />
                        </Modal>

                        <Divider />

                        <DiscoverySearchForm dataType={this.props.dataType} formValues={this.props.formValues}
                                             loading={this.props.searchLoading}
                                             onChange={this.handleFormChange} onSubmit={this.handleSubmit} />

                        <Divider />

                        <Modal title={`Dataset ${(this.state.dataset || "").substr(0, 18)}…: Data Use Terms`}
                               visible={this.state.dataUseTermsModalShown}
                               onCancel={() => this.handleDatasetTermsCancel()} footer={null}>
                            <DataUseDisplay dataUse={this.state.dataUse} />
                        </Modal>

                        <Typography.Title level={3}>Results</Typography.Title>
                        <Spin spinning={this.props.searchLoading}>
                            {this.renderSearches()}
                        </Spin>
                    </>
                ) : null}
            </>
        );
    }
}

DiscoverySearchContent.propTypes = {
    onSearchSelect: PropTypes.func,
    services: PropTypes.arrayOf(PropTypes.object),
    dataTypes: PropTypes.object,
    service: PropTypes.object,
    dataType: PropTypes.object,
    dataTypesLoading: PropTypes.bool,
    modalShown: PropTypes.bool,
    searches: PropTypes.array,
    selectedSearch: PropTypes.number,
    searchLoading: PropTypes.bool,
    formValues: PropTypes.object,

    selectDataType: PropTypes.func,
    toggleSchemaModal: PropTypes.func,
    updateSearchForm: PropTypes.func,
    requestSearch: PropTypes.func,
    selectSearch: PropTypes.func
};

const mapStateToProps = state => {
    const sID = state.discovery.selectedServiceID;
    const dID = state.discovery.selectedDataTypeID;

    const dataTypeExists = sID && dID && sID in state.serviceDataTypes.dataTypesByServiceID
        && dID in state.serviceDataTypes.dataTypesByServiceID[sID].itemsByID;

    const searchesExist = state.discovery.searchesByServiceAndDataTypeID[sID] !== undefined
        && state.discovery.searchesByServiceAndDataTypeID[sID][dID] !== undefined;

    const selectedSearchExists = state.discovery.selectedSearchByServiceAndDataTypeID[sID] !== undefined
        && state.discovery.selectedSearchByServiceAndDataTypeID[sID][dID] !== undefined;

    return {
        services: state.services.items,
        dataTypes: state.serviceDataTypes.dataTypesByServiceID,
        service: dataTypeExists ? state.services.itemsByID[sID] : null,
        dataType: dataTypeExists ? state.serviceDataTypes.dataTypesByServiceID[sID].itemsByID[dID] : null,

        dataTypesLoading: state.services.isFetching || state.serviceDataTypes.isFetching
            || Object.keys(state.serviceDataTypes.dataTypesByServiceID).length === 0,

        schemaModalShown: state.discovery.schemaModalShown,

        searches: dataTypeExists && searchesExist ? state.discovery.searchesByServiceAndDataTypeID[sID][dID] : [],
        selectedSearch: dataTypeExists && selectedSearchExists
            ? state.discovery.selectedSearchByServiceAndDataTypeID[sID][dID]
            : -1,

        searchLoading: state.discovery.isFetching,

        formValues: dataTypeExists ? state.discovery.searchFormsByServiceAndDataTypeID[sID][dID] : null
    };
};

const mapDispatchToProps = dispatch => ({
    selectDataType: (serviceID, dataTypeID) => dispatch(selectDiscoveryServiceDataType(serviceID, dataTypeID)),
    toggleSchemaModal: () => dispatch(toggleDiscoverySchemaModal()),
    updateSearchForm: (serviceID, dataTypeID, fields) =>
        dispatch(updateDiscoverySearchForm(serviceID, dataTypeID, fields)),
    requestSearch: (service, dataTypeID, conditions) => dispatch(performSearch(service, dataTypeID, conditions)),
    selectSearch: (serviceID, dataTypeID, searchIndex) => dispatch(selectSearch(serviceID, dataTypeID, searchIndex)),
});

export default connect(mapStateToProps, mapDispatchToProps)(DiscoverySearchContent);
