import React, {Component} from "react";

import {Col, List, Popover, Row, Tag, Typography} from "antd";
import "antd/es/col/style/css";
import "antd/es/list/style/css";
import "antd/es/popover/style/css";
import "antd/es/row/style/css";
import "antd/es/tag/style/css";
import "antd/es/typography/style/css";

import {StopOutlined} from '@ant-design/icons';

import {
    DUO_NOT_FOR_PROFIT_USE_ONLY,
    DATA_USE_KEYS,
    DATA_USE_INFO,
    DATA_USE_PROP_TYPE_SHAPE,
    PRIMARY_CONSENT_CODE_INFO,
    SECONDARY_CONSENT_CODE_INFO
} from "../duo";


const TAG_LABEL_STYLING = {
    fontSize: "0.65rem",
    color: "#777",
    marginTop: "-4px",
    marginBottom: "4px"
};

const TAG_STYLING = {
    fontFamily: "monospace"
};


class DataUseDisplay extends Component {
    render() {
        const primaryCode = this.props.dataUse.consent_code.primary_category.code;
        const uses = this.props.dataUse.data_use_requirements.map(u => u.code) || [];

        return (
            <>
                <div>
                    <Typography.Title level={4} style={{fontSize: "20px"}}>
                        Consent Code
                    </Typography.Title>
                    <Row gutter={10} type="flex">
                        <Col>
                            <div style={TAG_LABEL_STYLING}>Primary</div>
                            <Popover {...PRIMARY_CONSENT_CODE_INFO[primaryCode]}
                                     overlayStyle={{maxWidth: "576px"}}>
                                <Tag color="blue" style={TAG_STYLING}>
                                    {this.props.dataUse.consent_code.primary_category.code}
                                </Tag>
                            </Popover>
                        </Col>
                        <Col>
                            <div style={TAG_LABEL_STYLING}>Secondary</div>
                            {this.props.dataUse.consent_code.secondary_categories.length > 0
                                ? this.props.dataUse.consent_code.secondary_categories.map(sc =>
                                    <Popover {...SECONDARY_CONSENT_CODE_INFO[sc.code]}
                                             overlayStyle={{maxWidth: "576px"}}
                                             key={sc.code}>
                                        <Tag style={TAG_STYLING}>{sc.code}</Tag>
                                    </Popover>)
                                : <Tag style={{...TAG_STYLING, background: "white", borderStyle: "dashed"}}>N/A</Tag>}
                        </Col>
                    </Row>
                </div>
                <div style={{marginTop: "20px"}}>
                    <Typography.Title level={4}>
                        Restrictions and Conditions
                    </Typography.Title>
                    {/* TODO: Empty display when no restrictions present */}
                    <List itemLayout="horizontal" style={{maxWidth: "600px"}}
                          dataSource={DATA_USE_KEYS.filter(u => uses.includes(u))}
                          renderItem={u => {
                              const DataUseIcon = DATA_USE_INFO[u].icon;
                              return (
                                  <List.Item>
                                      <List.Item.Meta avatar={
                                          u === DUO_NOT_FOR_PROFIT_USE_ONLY ? (
                                              // Special case for non-profit use; stack two icons (dollar + stop) to
                                              // create a custom synthetic icon.
                                              <div style={{opacity: 0.65}}>
                                                  <DataUseIcon style={{fontSize: "24px", color: "black"}}
                                                               type={DATA_USE_INFO[u].icon} />
                                                  <StopOutlined style={{
                                                      fontSize: "24px",
                                                      marginLeft: "-24px",
                                                      color: "black"
                                                  }} />
                                              </div>
                                          ) : <DataUseIcon style={{fontSize: "24px"}} />
                                      } title={DATA_USE_INFO[u].title} description={DATA_USE_INFO[u].content} />
                                  </List.Item>
                              )
                          }} />
                </div>
            </>
        );
    }
}

DataUseDisplay.propTypes = {
    dataUse: DATA_USE_PROP_TYPE_SHAPE
};

export default DataUseDisplay;
