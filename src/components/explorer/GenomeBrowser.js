import React, {Component, createRef} from "react";
import PropTypes from "prop-types";

import {Table, Divider} from "antd";
import "antd/es/divider/style/css";
import "antd/es/table/style/css";

import igv from "igv/js";

// TODO: This should be a service
const REFERENCE_GENOME_LOOKUP = {
    "ncbi36": "hg19",
    "grch37": "hg37",
    "grch38": "hg38",

    "hg19": "hg19",
    "hg37": "hg37",
    "hg38": "hg38",
};

class GenomeBrowser extends Component {
    constructor(props) {
        super(props);

        this.browser = null;
        this.igvContainer = createRef();
        this.igvOptions = this.igvOptions.bind(this);
        this.configureBrowser = this.configureBrowser.bind(this);
        this.getMatches = this.getMatches.bind(this);

        // Column configuration for match table
        this.columns = [
            {
                title: "Chromosome",
                dataIndex: "chromosome",
            },
            {
                title: "Start",
                dataIndex: "start",
            },
            {
                title: "End",
                dataIndex: "end",
            },
            {
                title: "Reference Bases",
                dataIndex: "ref",
            },
            {
                title: "Alternate Bases",
                dataIndex: "alt",
            },
            {
                title: "Action",
                render: (text, variant) => (<a onClick={() => this.changeLocus(variant)}>Show variant</a>)
            },
        ];
    }

    static formatMatchLocation(match) {
        return `chr${match.chromosome}:${match.start}-${match.end}`;
    }

    igvOptions() {
        const variants = this.props.variants;
        return {
            genome: REFERENCE_GENOME_LOOKUP[((variants || [])[0] || {}).assembly_id] || "hg19",
            locus: variants
                ? GenomeBrowser.formatMatchLocation(variants[0])
                : undefined,
            minimumBases: 40,
            tracks: [
                {
                    type: "variant",
                    sourceType: "bento",
                    format: "vcf",
                    variants,
                    variantSetId: "result_variants",
                    name: "Variant Result Set",
                    height: 100,
                    squishedCallHeight: 1,
                    expandedCallHeight: 10,
                    displayMode: "expanded",
                    visibilityWindow: 100,
                },
            ]  // TODO: Multiple tracks for different tables
        };
    }

    configureBrowser(containerNode) {
        igv.createBrowser(containerNode, this.igvOptions()).then(browser => this.browser = browser);
    }

    componentDidMount() {
        this.configureBrowser(this.igvContainer.current
            || document.getElementById("igv-container"));
    }

    changeLocus(variant) {
        if (!this.browser) return;
        this.browser.search(GenomeBrowser.formatMatchLocation(variant));
    }

    render() {
        return <>
            <div id="igv-container" />
            <Divider orientation="left">Variant List</Divider>
            <Table
                columns={this.columns}
                dataSource={this.getMatches()}
                pagination={{pageSize: 10}}
                scroll={{y: 200}}
            />
        </>;
    }
}

GenomeBrowser.propTypes = {
    variants: PropTypes.arrayOf(PropTypes.shape({
        alt: PropTypes.arrayOf(PropTypes.string),
        assembly_id: PropTypes.string,
        calls: PropTypes.arrayOf(PropTypes.shape({
            genotype_bases: PropTypes.arrayOf(PropTypes.string),
            genotype_type: PropTypes.string,  // TODO: oneOf
            sample_id: PropTypes.string,
            // TODO: phase_set
        })),
        chromosome: PropTypes.string,
    })),
};

export default GenomeBrowser;
