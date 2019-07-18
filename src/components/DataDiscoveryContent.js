import React, {Component} from "react";
import {connect} from "react-redux";
import {Link, Redirect, Route, Switch, withRouter} from "react-router-dom";

import {Icon, Layout, Menu} from "antd";
import "antd/es/icon/style/css";
import "antd/es/layout/style/css";
import "antd/es/menu/style/css";

import DiscoveryHomeContent from "./discovery/DiscoveryHomeContent";
import DiscoverySearchContent from "./discovery/DiscoverySearchContent";
import DiscoverySchemaContent from "./discovery/DiscoverySchemaContent";

import {selectDiscoveryServiceDataset, clearDiscoveryServiceDataset} from "../actions";

const searchURL = (sID, dID) => `/data/discovery/${sID}/datasets/${dID}/search`;
const schemaURL = (sID, dID) => `/data/discovery/${sID}/datasets/${dID}/schema`;

class DataDiscoveryContent extends Component {
    constructor(props) {
        super(props);
        this.renderContent = this.renderContent.bind(this);
    }

    componentDidMount() {
        document.title = "CHORD - Discover Data";
    }

    renderContent(Content) {
        const dataMenus = this.props.services.filter(s => s.metadata["chordDataService"]).map(s => {
            const menuItems = Object.keys(this.props.datasets).includes(s.id)
                ? this.props.datasets[s.id].map(d => (
                    <Menu.SubMenu key={`${s.id}_dataset_${d.id}_menu`} title={<span>{d.id}</span>}>
                        <Menu.Item key={searchURL(s.id, d.id)}>
                            <Link to={searchURL(s.id, d.id)}>
                                <Icon type="search" />
                                <span>Search</span>
                            </Link>
                        </Menu.Item>
                        <Menu.Item key={schemaURL(s.id, d.id)}>
                            <Link to={schemaURL(s.id, d.id)}>
                                <Icon type="build" />
                                <span>Data Schema</span>
                            </Link>
                        </Menu.Item>
                    </Menu.SubMenu>
                ))
                : (
                    <Menu.Item key={`${s.id}_loading_datasets`} disabled>
                        <span>
                            <Icon type="close" />
                            <span>No datasets loaded</span>
                        </span>
                    </Menu.Item>
                );

            return (
                <Menu.SubMenu key={`${s.id}_menu`} title={<span>
                    <Icon type="database" />
                    <span>{s.name} datasets</span>
                </span>}>{menuItems}</Menu.SubMenu>
            );
        });

        return route => {
            if (route.match.params["service_id"] && route.match.params["dataset_id"]) {
                // TODO: HANDLE WRONG IDs
                this.props.selectDataset(route.match.params["service_id"], route.match.params["dataset_id"]);
            } else if (this.props.selectedServiceID || this.props.selectedDatasetID) {
                this.props.clearSelectedDataset();
            }

            return (
                <Layout>
                    <Layout.Sider width="256" theme="light">
                        <Menu mode="inline"
                              defaultOpenKeys={Object.keys(route.match.params).includes("service_id")
                                  ? [`${route.match.params["service_id"]}_menu`,
                                      `${route.match.params["service_id"]}_dataset_${route.match.params["dataset_id"]}_menu`]
                                  : []}
                              selectedKeys={[route.location.pathname]} style={{height: "100%", padding: "16px 0"}}>
                            <Menu.Item key="/data/discovery/home" style={{paddingLeft: "0"}}>
                                <Link to="/data/discovery/home">
                                    <Icon type="home"/>
                                    <span>Home</span>
                                </Link>
                            </Menu.Item>
                            {dataMenus}
                        </Menu>
                    </Layout.Sider>
                    <Layout.Content style={{background: "white", padding: "24px 32px"}}>
                        <Content />
                    </Layout.Content>
                </Layout>
            );
        }
    }

    render() {
        return (
            <Switch>
                <Route exact path="/data/discovery/home"
                       component={this.renderContent(DiscoveryHomeContent)} />
                <Route path="/data/discovery/:service_id/datasets/:dataset_id/search"
                       component={this.renderContent(DiscoverySearchContent)} />
                <Route path="/data/discovery/:service_id/datasets/:dataset_id/schema"
                       component={this.renderContent(DiscoverySchemaContent)} />
                <Redirect from="/data/discovery" to="/data/discovery/home" />
            </Switch>
        );
    }
}

const mapStateToProps = state => ({
    services: state.services.items,
    datasets: state.serviceDatasets.datasets,
    selectedServiceID: state.discovery.selectedServiceID,
    selectedDatasetID: state.discovery.selectedDatasetID
});

const mapDispatchToProps = dispatch => ({
    selectDataset: (serviceID, datasetID) => dispatch(selectDiscoveryServiceDataset(serviceID, datasetID)),
    clearSelectedDataset: () => dispatch(clearDiscoveryServiceDataset())
});

export default connect(mapStateToProps, mapDispatchToProps)(withRouter(DataDiscoveryContent));
