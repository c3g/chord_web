import React, {Component} from "react";
import {connect} from "react-redux";

import {Redirect, Route, Switch} from "react-router-dom";

import {Layout, Menu} from "antd";
import "antd/es/layout/style/css";
import "antd/es/menu/style/css";

import ExplorerSearchContent from "./explorer/ExplorerSearchContent";
import ExplorerGenomeBrowserContent from "./explorer/ExplorerGenomeBrowserContent";

import SitePageHeader from "./SitePageHeader";
import {
    matchingMenuKeys,
    nodeInfoDataPropTypesShape,
    renderMenuItem,
    urlPath,
    withBasePath
} from "../utils";


const PAGE_MENU = [
    {url: withBasePath("data/explorer/search"), style: {marginLeft: "4px"}, text: "Search"},
    {url: withBasePath("data/explorer/genome"), text: "Genome Browser"},
];

const MENU_STYLE = {
    marginLeft: "-24px",
    marginRight: "-24px",
    marginTop: "-12px"
};


class DataExplorerContent extends Component {
    render() {
        if (!this.props.nodeInfo.CHORD_URL) return null;
        const selectedKeys = matchingMenuKeys(PAGE_MENU, urlPath(this.props.nodeInfo.CHORD_URL));
        return (
            <>
                <SitePageHeader title="Data Explorer" withTabBar={true} footer={
                    <Menu mode="horizontal" style={MENU_STYLE} selectedKeys={selectedKeys}>
                        {PAGE_MENU.map(renderMenuItem)}
                    </Menu>
                } />
                <Layout>
                    <Layout.Content style={{background: "white", padding: "24px"}}>
                        <Switch>
                            <Route path={withBasePath("data/explorer/search")}
                                   component={ExplorerSearchContent} />
                            <Route path={withBasePath("data/explorer/genome")}
                                   component={ExplorerGenomeBrowserContent} />
                            <Redirect from={withBasePath("data/explorer")}
                                      to={withBasePath("data/explorer/search")} />
                        </Switch>
                    </Layout.Content>
                </Layout>
            </>
        );
    }
}

DataExplorerContent.propTypes = {
    nodeInfo: nodeInfoDataPropTypesShape,
};

const mapStateToProps = state => ({
    nodeInfo: state.nodeInfo.data,
});

export default connect(mapStateToProps)(DataExplorerContent);
