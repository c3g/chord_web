import React, {Component} from "react";

import {Layout, Typography, Table, Divider} from "antd";
import "antd/es/layout/style/css";

import igv from "igv/js";
import variants from '../../utils/features2.json';
const ID_VARIANT = '71438220-d640-42f2-998d-e9c81adac710';

import {LAYOUT_CONTENT_STYLE} from "../../styles/layoutContent";

class ExplorerGenomeBrowserContent extends Component {
    constructor(props) {
        super(props);
        this.state = {
          igvContainer: null,
          browser: null,
          results: variants.results[ID_VARIANT],
          locus: null,
          columns: [],
          search_id: ID_VARIANT,
          matches: [],
          calls: []
        };
    }

    componentWillMount(){
      // Configure the locus depending on the variants found
      if(this.state.results){
        this.setState({
          matches: this.state.results.matches,
          calls: this.state.results.matches[0].calls,
        });
        var first_match = this.state.results.matches[0];
        this.setState({locus:`chr${first_match.chromosome}:${first_match.start}-${first_match.end}`});
      }else{
        this.setState({matches: [], calls: []});
      }
    }

    componentDidMount() {
        this.state.igvContainer = document.getElementById("igv-container");

        console.log(this.state.matches);
        console.log(this.state.calls);

        // Column configuration for match table
        this.state.columns = [
          {
            title: 'Chromosome',
            dataIndex: 'chromosome',
          },
          {
            title: 'Start',
            dataIndex: 'start',
          },
          {
            title: 'End',
            dataIndex: 'end',
          },
          {
            title: 'Reference Base',
            dataIndex: 'ref',
          },
          {
            title: 'Alternate Base',
            dataIndex: 'alt',
          },
          {
             title: 'Action',
             render: (text, variant) => ( <a onClick={() => this.changeLocus(variant)}> Show variant </a> )
          }
        ];

        // Configure IGV browser options
        const igvOptions = {
            genome: "hg19",
            locus: this.state.locus,
            minimumBases:40,
            tracks: [
              {
                type: "variant",
                sourceType: "ga4gh",
                format: 'vcf',
                variants: this.state.matches,
                variantSetId: this.state.search_id,
                calls: this.state.calls,
                name: "Variant Search",
                height: 100,
                squishedCallHeight: 1,
                expandedCallHeight: 10,
                displayMode: "expanded",
                visibilityWindow: 100
              }
            ]
        };
        igv.createBrowser(this.state.igvContainer, igvOptions).then(browser => this.setState({browser: browser}));
    }

    changeLocus(variant){
      const newLocus = `chr${variant.chromosome}:${variant.start}-${variant.end}`;
      this.setState({locus: newLocus});
      this.state.browser.search(newLocus);
    }

    render() {
        return <Layout>
            <Layout.Content style={LAYOUT_CONTENT_STYLE}>
                <Typography.Title level={4}> Variant Visualizer</Typography.Title>
                <div id="igv-container" />
                <Divider orientation="left"> Match List </Divider>
                <Table
                  columns={this.state.columns}
                  dataSource={this.state.matches}
                  pagination={{ pageSize:10}}
                  scroll={{ y:200 }}
                 />
            </Layout.Content>
        </Layout>;
    }
}

export default ExplorerGenomeBrowserContent;
