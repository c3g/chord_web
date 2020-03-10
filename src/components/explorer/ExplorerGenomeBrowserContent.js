import React, {Component} from "react";

import {Layout} from "antd";
import "antd/es/layout/style/css";

import igv from "igv";

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
        };

        igv.createBrowser(this.igvContainer, igvOptions).then(browser => console.log(browser));
    }

    render() {
        return <Layout>
            <Layout.Content style={LAYOUT_CONTENT_STYLE}>
                <div id="igv-container" />
            </Layout.Content>
        </Layout>;
    }
}

export default ExplorerGenomeBrowserContent;
