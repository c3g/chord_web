import React, {Component} from "react";

import igv from "igv";

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
        return <div id="igv-container" />;
    }
}

export default ExplorerGenomeBrowserContent;
