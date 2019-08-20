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
    Icon,
    Modal,
    Popover,
    Row,
    Select,
    Spin,
    Table,
    Typography
} from "antd";
import "antd/es/button/style/css";
import "antd/es/col/style/css";
import "antd/es/collapse/style/css";
import "antd/es/divider/style/css";
import "antd/es/empty/style/css";
import "antd/es/form/style/css";
import "antd/es/icon/style/css";
import "antd/es/modal/style/css";
import "antd/es/popover/style/css";
import "antd/es/row/style/css";
import "antd/es/select/style/css";
import "antd/es/spin/style/css";
import "antd/es/table/style/css";
import "antd/es/typography/style/css";

import DiscoverySearchForm from "./DiscoverySearchForm";
import SchemaTree from "../SchemaTree";
import {
    toggleDiscoverySchemaModal,
    performSearch,
    selectDiscoveryServiceDataType,
    selectSearch,
    updateDiscoverySearchForm
} from "../../actions";

const DATA_USE_KEYS = ["COL", "IRB", "GS", "IS", "NPU", "PS", "MOR", "PUB", "RTN", "TS", "US"];

const DATA_USE_INFO = {
    COL: {
        icon: "team",
        title: "Collaboration Required",
        content: "This requirement indicates that the requester must agree to collaboration with the primary " +
            "study investigator(s)."
    },
    IRB: {
        icon: "reconciliation",
        title: "Ethics Approval Required",
        content: "This requirement indicates that the requester must provide documentation of local IRB/ERB approval."
    },
    GS: {
        icon: "global",
        title: "Geographical Restriction",
        content: "This requirement indicates that use is limited to within a specific geographic region."
    },
    IS: {
        icon: "bank",
        title: "Institution-Specific Restriction",
        content: "This requirement indicates that use is limited to use within an approved institution."
    },
    NPU: {
        icon: "dollar", // Gets modified below
        title: "Not-For-Profit Use Only",
        content: "This requirement indicates that use of the data is limited to not-for-profit organizations " +
            "and not-for-profit use, non-commercial use."
    },
    PS: {
        icon: "audit",
        title: "Project-Specific Restriction",
        content: "This requirement indicates that use is limited to use within an approved project."
    },
    MOR: {
        icon: "exception",
        title: "Publication Moratorium",
        content: "This requirement indicates that requester agrees not to publish results of studies until a " +
            "specific date"
    },
    PUB: {
        icon: "file-done",
        title: "Publication Required",
        content: "This requirement indicates that requester agrees to make results of studies using the data " +
            "available to the larger scientific community."
    },
    RTN: {
        icon: "database",
        title: "Return to Database or Resource",
        content: "This requirement indicates that the requester must return derived/enriched data to the " +
            "database/resource."
    },
    TS: {
        icon: "clock-circle",
        title: "Time Limit on Use",
        content: "This requirement indicates that use is approved for a specific number of months."
    },
    US: {
        icon: "user",
        title: "User-Specific Restriction",
        content: "This requirement indicates that use is limited to use by approved users."
    }
};

class DiscoverySearchContent extends Component {
    constructor(props) {
        super(props);

        this.handleSubmit = this.handleSubmit.bind(this);
        this.handleSearchSelect = this.handleSearchSelect.bind(this);
        this.renderSearches = this.renderSearches.bind(this);
        this.handleFormChange = this.handleFormChange.bind(this);
        this.handleDataTypeChange = this.handleDataTypeChange.bind(this);
        this.handleSchemaToggle = this.handleSchemaToggle.bind(this);
    }

    handleFormChange(fields) {
        if (this.props.dataType === null) return;
        this.props.updateSearchForm(this.props.service.id, this.props.dataType.id, fields);
    }

    handleSubmit(conditions) {
        if (this.props.dataType === null) return;
        this.props.requestSearch(this.props.service.id, this.props.dataType.id, conditions);
    }

    handleSearchSelect(searchIndex) {
        if (this.props.dataType === null) return;
        this.props.selectSearch(this.props.service.id, this.props.dataType.id, parseInt(searchIndex, 10));
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
                               dataSource={s.results.map(s => ({...s, dataUse: ["COL", "PS", "RTN", "US"]}))}
                               rowKey="id">
                            <Table.Column title="Dataset ID" dataIndex="id" />
                            <Table.Column title="Data Use Restrictions" dataIndex="dataUse" width={336} render={du => (
                                <Row gutter={8} type="flex">
                                    {/* TODO: REFACTOR INTO A COMPONENT */}
                                    {DATA_USE_KEYS.map(u => {
                                        let internalIcon = (
                                            <Icon style={{
                                                fontSize: "20px",
                                                color: `rgba(0, 0, 0, ${du.includes(u) ? 0.65 : 0.1})`
                                            }} type={DATA_USE_INFO[u].icon} />
                                        );

                                        if (u === "NPU") {
                                            // Special case for non-profit use; stack two icons (dollar + stop) to
                                            // create a custom synthetic icon.
                                            internalIcon = (
                                                <div style={{opacity: du.includes(u) ? 0.65 : 0.1}}>
                                                    <Icon style={{
                                                        fontSize: "20px",
                                                        color: "black"
                                                    }} type={DATA_USE_INFO[u].icon} />
                                                    <Icon style={{
                                                        fontSize: "20px",
                                                        marginLeft: "-20px",
                                                        mixBlendMode: "overlay",
                                                        color: "black"
                                                    }} type="stop" />
                                                </div>
                                            );
                                        }

                                        // noinspection HtmlDeprecatedAttribute
                                        return (
                                            <Col key={u}>
                                                {du.includes(u) ? (
                                                    <Popover title={DATA_USE_INFO[u].title}
                                                             content={DATA_USE_INFO[u].content}
                                                             trigger="hover"
                                                             placement="topRight"
                                                             align={{offset: [10, 0]}}>
                                                        {internalIcon}
                                                    </Popover>
                                                ) : internalIcon}
                                            </Col>
                                        );
                                    })}
                                </Row>
                            )} />
                            <Table.Column title="Actions" dataIndex="actions" width={136} render={() => (
                                <a href="#">{/* TODO: Real actions */}Request Access</a>
                            )} />
                        </Table>
                    </Collapse.Panel>
                ))}
            </Collapse>
        );
    }

    handleDataTypeChange(value) {
        const [sID, dtID] = value.split("_");
        this.props.selectDataType(sID, dtID);
    }

    handleSchemaToggle() {
        this.props.toggleSchemaModal();
    }

    render() {
        return (
            <div>
                <Form layout="inline">
                    <Form.Item label="Data Type">
                        <Select size="large" showSearch placeholder="Data Type" style={{width: 200}}
                                loading={this.props.dataTypesLoading}
                                value={this.props.dataType ? `${this.props.service.id}_${this.props.dataType.id}` : undefined}
                                onChange={this.handleDataTypeChange}>
                            {this.props.services.filter(s => this.props.dataTypes[s.id])
                                .flatMap(s => this.props.dataTypes[s.id].map(dt =>  {
                                    const key = `${s.id}_${dt.id}`;
                                    return (<Select.Option key={key} value={key}>{dt.id}</Select.Option>);
                                }))}
                        </Select>
                    </Form.Item>
                    {this.props.dataType ? (<Button size="large" onClick={this.handleSchemaToggle}>Schema</Button>)
                        : null}
                </Form>

                {this.props.dataType ? (
                    <div>
                        <Modal title={`${this.props.dataType.id} Schema`} visible={this.props.modalShown}
                               onCancel={this.handleSchemaToggle} footer={null}>
                            <SchemaTree schema={this.props.dataType.schema} />
                        </Modal>
                        <Divider />
                        <DiscoverySearchForm dataType={this.props.dataType} formValues={this.props.formValues}
                                             loading={this.props.searchLoading}
                                             onChange={this.handleFormChange} onSubmit={this.handleSubmit} />
                        <Divider />
                        <Typography.Title level={3}>Results</Typography.Title>
                        <Spin spinning={this.props.searchLoading}>
                            {this.renderSearches()}
                        </Spin>
                    </div>
                ) : null}
            </div>
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
    formValues: PropTypes.object
};

const mapStateToProps = state => {
    const sID = state.discovery.selectedServiceID;
    const dID = state.discovery.selectedDataTypeID;

    const dataTypeExists = sID && dID && sID in state.serviceDataTypes.dataTypesByServiceAndDataTypeID
        && dID in state.serviceDataTypes.dataTypesByServiceAndDataTypeID[sID];

    const searchesExist = state.discovery.searchesByServiceAndDataTypeID[sID] !== undefined
        && state.discovery.searchesByServiceAndDataTypeID[sID][dID] !== undefined;

    const selectedSearchExists = state.discovery.selectedSearchByServiceAndDataTypeID[sID] !== undefined
        && state.discovery.selectedSearchByServiceAndDataTypeID[sID][dID] !== undefined;

    return {
        services: state.services.items,
        dataTypes: state.serviceDataTypes.dataTypes,
        service: dataTypeExists
            ? state.services.itemsByID[sID]
            : null,
        dataType: dataTypeExists
            ? state.serviceDataTypes.dataTypesByServiceAndDataTypeID[sID][dID]
            : null,

        dataTypesLoading: state.services.isFetching || state.serviceDataTypes.isFetching
            || Object.keys(state.serviceDataTypes.dataTypes).length === 0,

        modalShown: state.discovery.modalShown,

        searches: dataTypeExists && searchesExist
            ? state.discovery.searchesByServiceAndDataTypeID[sID][dID]
            : [],
        selectedSearch: dataTypeExists && selectedSearchExists
            ? state.discovery.selectedSearchByServiceAndDataTypeID[sID][dID]
            : -1,

        searchLoading: state.discovery.isFetching,

        formValues: dataTypeExists ?
            state.discovery.searchFormsByServiceAndDataTypeID[sID][dID]
            : null
    };
};

const mapDispatchToProps = dispatch => ({
    selectDataType: (serviceID, dataTypeID) => dispatch(selectDiscoveryServiceDataType(serviceID, dataTypeID)),
    toggleSchemaModal: () => dispatch(toggleDiscoverySchemaModal()),
    updateSearchForm: (serviceID, dataTypeID, fields) =>
        dispatch(updateDiscoverySearchForm(serviceID, dataTypeID, fields)),
    requestSearch: (serviceID, dataTypeID, conditions) => dispatch(performSearch(serviceID, dataTypeID, conditions)),
    selectSearch: (serviceID, dataTypeID, searchIndex) => dispatch(selectSearch(serviceID, dataTypeID, searchIndex)),
});

export default connect(mapStateToProps, mapDispatchToProps)(DiscoverySearchContent);