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

const renderContent = (Content, dataMenus, props) => route => {
    let routedProps = Object.assign({}, ...Object.keys(props).map(p => ({[p]: props[p](route)})));
    // Props might be undefined --> loading state for children...
    return (
        <Layout>
            <Layout.Sider width="384" theme="light">
                <Menu mode="inline"
                      defaultOpenKeys={Object.keys(route.match.params).includes("service_id")
                          ? [`${route.match.params["service_id"]}_menu`,
                              `${route.match.params["service_id"]}_dataset_${route.match.params["dataset_id"]}_menu`]
                          : []}
                      selectedKeys={[route.location.pathname]} style={{height: "100%", padding: "16px 0"}}>
                    <Menu.Item key="/data/discovery/home" style={{paddingLeft: "0"}}>
                        <Link to="/data/discovery/home">
                            <Icon type="home" />
                            <span>Home</span>
                        </Link>
                    </Menu.Item>
                    {dataMenus}
                </Menu>
            </Layout.Sider>
            <Layout.Content style={{background: "white", padding: "24px 32px"}}>
                <Content {...routedProps} />
            </Layout.Content>
        </Layout>
    );
};

class DataDiscoveryContent extends Component {
    componentDidMount() {
        document.title = "CHORD - Discover Data";
    }

    render() {
        const dataMenus = this.props.services.filter(s => s.metadata["chordDataService"]).map(s => {
            const menuItems = Object.keys(this.props.datasets).includes(s.id)
                ? this.props.datasets[s.id].map(d => (
                    <Menu.SubMenu key={`${s.id}_dataset_${d.id}_menu`} title={<span>{d.id}</span>}>
                        <Menu.Item key={`/data/discovery/${s.id}/datasets/${d.id}/search`}>
                            <Link to={`/data/discovery/${s.id}/datasets/${d.id}/search`}>
                                <Icon type="search" />
                                <span>Search</span>
                            </Link>
                        </Menu.Item>
                        <Menu.Item key={`/data/discovery/${s.id}/datasets/${d.id}/schema`}>
                            <Link to={`/data/discovery/${s.id}/datasets/${d.id}/schema`}>
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

        const datasetProps = {
            service: route => this.props.servicesByID[route.match.params["service_id"]],
            dataset: route => {
                const service = this.props.datasetsByServiceAndDatasetID
                    [route.match.params["service_id"]];

                return service ? service[route.match.params["dataset_id"]] : undefined;
            }
        };

        return (
            <div>
                <Switch>
                    <Route exact path="/data/discovery/home"
                           component={renderContent(DiscoveryHomeContent, dataMenus, {})} />
                    <Route path="/data/discovery/:service_id/datasets/:dataset_id/search"
                           component={renderContent(DiscoverySearchContent, dataMenus, datasetProps)} />
                    <Route path="/data/discovery/:service_id/datasets/:dataset_id/schema"
                           component={renderContent(DiscoverySchemaContent, dataMenus, datasetProps)} /> {/* TODO */}
                    <Redirect from="/data/discovery" to="/data/discovery/home" />
                </Switch>
            </div>
        );
    }
}

const mapStateToProps = state => ({
    services: state.services.items,
    servicesByID: state.services.itemsByID,
    datasets: state.serviceDatasets.datasets,
    datasetsByServiceAndDatasetID: state.serviceDatasets.datasetsByServiceAndDatasetID
});

export default connect(mapStateToProps)(withRouter(DataDiscoveryContent));
