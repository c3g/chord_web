import React from "react";

import {Col, Modal, Row, Statistic} from "antd";
import "antd/es/col/style/css";
import "antd/es/modal/style/css";
import "antd/es/row/style/css";
import "antd/es/statistic/style/css";

const SearchSummaryModal = ({searchResults, ...props}) => {
    return searchResults ? <Modal title="Search Results" {...props} width={960} footer={null}>
        <Row gutter={16}>
            <Col span={12}>
                <Statistic title="Individuals" value={(searchResults.searchFormattedResults || []).length} />
            </Col>
            <Col span={12}>
                <Statistic title="Biosamples"
                           value={(searchResults.searchFormattedResults || [])
                               .map(i => i.biosamples.length)
                               .reduce((s, v) => s + v, 0)} />
            </Col>
        </Row>
    </Modal> : null;
}

export default SearchSummaryModal;
