import React, {Component} from "react";

import {Layout, Typography} from "antd";
import "antd/es/layout/style/css";

import igv from "igv";
import variants from "../../utils/features.json";
const ID_VARIANT = '71438220-d640-42f2-998d-e9c81adac710';

import {LAYOUT_CONTENT_STYLE} from "../../styles/layoutContent";

class ExplorerGenomeBrowserContent extends Component {
    constructor(props) {
        super(props);
        this.igvContainer = null;
    }

    componentDidMount() {
        this.igvContainer = document.getElementById("igv-container");
        const igvOptions = {
            genome: "hg19",
            locus: "chr17:41,242,509-41,245,509",
            tracks: [
              {
                type: "variant",
                sourceType: "ga4gh",
                features: JSON.parse(variants).results.${ID_VARIANT}.matches,
                variantSetId: ${ID_VARIANT},
                name: "Testing Variant",
                squishedCallHeight: 1,
                expandedCallHeight: 8,
                displayMode: "expanded",
                visibilityWindow: 100
              }
            ]
        };
        console.log(igvOptions);
        igv.createBrowser(this.igvContainer, igvOptions).then(browser => console.log(browser));
    }

    render() {
        return <Layout>
            <Layout.Content style={LAYOUT_CONTENT_STYLE}>
                <Typography.Title level={4}>Testing V</Typography.Title>
                <div id="igv-container" />
            </Layout.Content>
        </Layout>;
    }
}

export default ExplorerGenomeBrowserContent;
