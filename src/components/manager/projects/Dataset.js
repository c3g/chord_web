import React, {Component} from "react";
import PropTypes from "prop-types";

import {Button, Card, Col, Row, Table, Typography} from "antd";
import "antd/es/button/style/css";
import "antd/es/card/style/css";
import "antd/es/col/style/css";
import "antd/es/row/style/css";
import "antd/es/table/style/css";
import "antd/es/typography/style/css";


const NA_TEXT = (<span style={{color: "#999", fontStyle: "italic"}}>N/A</span>);

class Dataset extends Component {
    // TODO: Editing

    static getDerivedStateFromProps(nextProps) {
        if ("value" in nextProps) {
            return {...(nextProps.value || {})};
        }
        return null;
    }

    constructor(props) {
        super(props);

        this.onAddTable = props.onAddTable || (() => {});
        this.onDatasetIngest = props.onDatasetIngest || (() => {});

        const value = props.value || {};
        this.state = {
            dataset_id: value.dataset_id || null,
            name: value.name || "",
            tables: value.tables || [],
            loadingTables: value.loadingTables || false
        };
    }

    render() {
        return (
            <Card key={this.state.dataset_id} title={this.state.name} extra={<>
                <Button icon="import" style={{marginRight: "24px"}}>
                    Ingest Metadata
                </Button>
                <Button icon="edit" style={{marginRight: "10px"}}>Edit</Button>
                <Button type="danger" icon="delete">Delete</Button>
                {/* TODO: Share button */}
            </>}>
                <Typography.Title level={4}>Individuals and Pools</Typography.Title>
                TODO

                <Typography.Title level={4}>
                    Tables
                    <div style={{float: "right"}}>
                        <Button icon="plus" style={{verticalAlign: "top"}} onClick={() => this.onAddTable()}>
                            Add Table
                        </Button>
                    </div>
                </Typography.Title>
                <Table bordered dataSource={this.state.tables.map(t => ({...t, name: t.name || null}))}
                       rowKey="table_id" expandedRowRender={() => (<span>TODO: List of files</span>)}
                       loading={this.state.loadingTables}>
                    <Table.Column dataIndex="table_id" title="ID" />
                    <Table.Column dataIndex="name" title="Name" render={n => (n ? n : NA_TEXT)} />
                    <Table.Column dataIndex="data_type" title="Data Type" />
                    <Table.Column key="actions" title="Actions" width={330} render={d => (
                        <Row gutter={10}>
                            <Col span={8}><Button icon="import" style={{width: "100%"}}
                                                  onClick={() => this.onDatasetIngest(d)}>Ingest</Button></Col>
                            <Col span={8}><Button icon="edit" style={{width: "100%"}}>Edit</Button></Col>
                            <Col span={8}><Button type="danger" icon="delete"
                                                  style={{width: "100%"}}>Delete</Button></Col>
                        </Row>
                    )} />
                </Table>
            </Card>
        );
    }
}

Dataset.propTypes = {
    value: PropTypes.shape({
        dataset_id: PropTypes.string,
        name: PropTypes.string,
        tables: PropTypes.arrayOf(PropTypes.object),
        loadingTables: PropTypes.bool
    }),

    onAddTable: PropTypes.func,
    onDatasetIngest: PropTypes.func
};

export default Dataset;
