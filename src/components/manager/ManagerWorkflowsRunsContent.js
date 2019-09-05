import React, {Component} from "react";

import {Icon, Layout, List, Tag, Typography} from "antd";

import "antd/es/icon/style/css";
import "antd/es/layout/style/css";
import "antd/es/list/style/css";
import "antd/es/tag/style/css";
import "antd/es/typography/style/css";

import {LAYOUT_CONTENT_STYLE} from "../../styles/layoutContent";

class ManagerWorkflowsRunsContent extends Component {
    render() {
        return (
            <Layout>
                <Layout.Content style={LAYOUT_CONTENT_STYLE}>
                    <Typography.Title level={3}>Ingestion Workflows</Typography.Title>
                    <List itemLayout="vertical">
                        <List.Item>
                            <List.Item.Meta
                                title={<span><Tag>variant</Tag> VCF Compression and TBI Generation</span>}
                                description={"Given a VCF file, this ingestion workflow will generate a .vcf.gz and " +
                                    "a .tbi file for the data."} />

                            <div style={{marginBottom: "12px"}}>
                                <span style={{fontWeight: "bold", marginRight: "1em"}}>Inputs:</span>
                                <Tag color="volcano"><Icon type="file" /> .vcf</Tag> {/* file */}
                                <Tag color="blue"><Icon type="menu" /> assembly ID</Tag> {/* enum */}
                                <Tag color="green"><Icon type="number" /> some number</Tag>
                                <Tag color="purple"><Icon type="font-size" /> some text</Tag>
                            </div>

                            <div>
                                <span style={{fontWeight: "bold", marginRight: "1em"}}>Outputs:</span>
                                <Tag color="volcano"><Icon type="file" /> .vcf.gz</Tag>
                                <Tag color="volcano"><Icon type="file" /> .tbi</Tag>
                                <Tag color="blue"><Icon type="menu" /> assembly ID</Tag>
                            </div>
                        </List.Item>
                        <List.Item>
                            <List.Item.Meta
                                title={<span><Tag>variant</Tag> TBI Generation</span>}
                                description={"Given a bgzip-compressed VCF file, this ingestion workflow will " +
                                "generate a .tbi file for the data."} />

                            <div style={{marginBottom: "12px"}}>
                                <span style={{fontWeight: "bold", marginRight: "1em"}}>Inputs:</span>
                                <Tag color="volcano"><Icon type="file" /> .vcf.gz</Tag> {/* file */}
                                <Tag color="blue"><Icon type="menu" /> assembly ID</Tag> {/* enum */}
                            </div>

                            <div>
                                <span style={{fontWeight: "bold", marginRight: "1em"}}>Outputs:</span>
                                <Tag color="volcano"><Icon type="file" /> .vcf.gz</Tag>
                                <Tag color="volcano"><Icon type="file" /> .tbi</Tag>
                                <Tag color="blue"><Icon type="menu" /> assembly ID</Tag>
                            </div>
                        </List.Item>
                    </List>
                </Layout.Content>
            </Layout>
        );
    }
}

export default ManagerWorkflowsRunsContent;
