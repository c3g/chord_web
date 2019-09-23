import React, {Component} from "react";

import {Checkbox, List, Icon, Radio, Typography} from "antd";

import "antd/es/checkbox/style/css";
import "antd/es/list/style/css";
import "antd/es/icon/style/css";
import "antd/es/radio/style/css";
import "antd/es/typography/style/css";

import {
    PRIMARY_CONSENT_CODE_KEYS,
    PRIMARY_CONSENT_CODE_INFO,

    SECONDARY_CONSENT_CODE_KEYS,
    SECONDARY_CONSENT_CODE_INFO,

    DATA_USE_KEYS,
    DATA_USE_INFO,
    DUO_NOT_FOR_PROFIT_USE_ONLY
} from "../duo";

export default class DataUseInput extends Component {
    render() {
        return (
            <>
                <div>
                    <Typography.Title level={4} style={{fontSize: "20px"}}>
                        Consent Code
                    </Typography.Title>

                    <div style={{fontWeight: "bold", marginBottom: "4px"}}>Primary</div>
                    <Radio.Group name="primary_consent_code">
                        <List itemLayout="horizontal" style={{maxWidth: "600px"}}>
                        {PRIMARY_CONSENT_CODE_KEYS.map(pcc =>
                            <Radio value={pcc} style={{display: "block"}}>
                                <List.Item style={{
                                    display: "inline-block",
                                    verticalAlign: "top",
                                    paddingTop: "2px",
                                    whiteSpace: "normal"
                                }}>
                                    <List.Item.Meta title={PRIMARY_CONSENT_CODE_INFO[pcc].title}
                                                    description={PRIMARY_CONSENT_CODE_INFO[pcc].content} />
                                </List.Item>
                            </Radio>
                        )}
                        </List>
                    </Radio.Group>

                    <div style={{fontWeight: "bold"}}>Secondary</div>
                    <List itemLayout="horizontal" style={{maxWidth: "600px"}}>
                        {SECONDARY_CONSENT_CODE_KEYS.map(pcc =>
                            <List.Item>
                                <List.Item.Meta title={<Checkbox>{SECONDARY_CONSENT_CODE_INFO[pcc].title}</Checkbox>}
                                                description={<div style={{marginLeft: "24px"}}>
                                                    {SECONDARY_CONSENT_CODE_INFO[pcc].content}
                                                </div>} />
                            </List.Item>
                        )}
                    </List>
                    {/* TODO */}
                </div>
                <div style={{marginTop: "20px"}}>
                    <Typography.Title level={4}>
                        Restrictions and Conditions
                    </Typography.Title>
                    <List itemLayout="horizontal" style={{maxWidth: "600px"}}
                          dataSource={DATA_USE_KEYS}
                          renderItem={u => (
                              <List.Item>
                                  <List.Item.Meta avatar={
                                      u === DUO_NOT_FOR_PROFIT_USE_ONLY ? (
                                          // Special case for non-profit use; stack two icons (dollar + stop) to
                                          // create a custom synthetic icon.
                                          <div style={{opacity: 0.65}}>
                                              <Icon style={{fontSize: "24px", color: "black"}}
                                                    type={DATA_USE_INFO[u].icon} />
                                              <Icon style={{fontSize: "24px", marginLeft: "-24px", color: "black"}}
                                                    type="stop" />
                                          </div>
                                      ) : <Icon style={{fontSize: "24px"}} type={DATA_USE_INFO[u].icon} />
                                  } title={
                                      <Checkbox>{DATA_USE_INFO[u].title}</Checkbox>
                                  } description={DATA_USE_INFO[u].content} />
                              </List.Item>
                          )} />
                </div>
            </>
        );
    }
}
