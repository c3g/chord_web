import React, {Component} from "react";
import {connect} from "react-redux";
import {Link, Redirect, Route, Switch, withRouter} from "react-router-dom";

import {Icon, Layout, Menu} from "antd";
import "antd/es/icon/style/css";
import "antd/es/layout/style/css";
import "antd/es/menu/style/css";

import DiscoveryHomeContent from "./discovery/DiscoveryHomeContent";

class DataDiscoveryContent extends Component {
    componentDidMount() {
        document.title = "CHORD - Discover Data";
    }

    render() {
        const dataMenus = this.props.services.filter(s => s.metadata["chordDataService"]).map(s => {
            const menuItems = Object.keys(this.props.datasets).includes(s.id)
                ? this.props.datasets[s.id].map(d => (
                    <Menu.SubMenu key={`${s.id}_dataset_${d.id}`} title={<span>{d.id}</span>}>
                        <Menu.Item key={`/data/discovery/${s.id}/datasets/${d.id}/search`}>
                            <span>
                                <Icon type="search" />
                                <span>Search</span>
                                <Link to={`/data/discovery/${s.id}/datasets/${d.id}/search`} />
                            </span>
                        </Menu.Item>
                        <Menu.Item key={`/data/discovery/${s.id}/datasets/${d.id}/schema}`}>
                            <span>
                                <Icon type="build" />
                                <span>Data Schema</span>
                                <Link to={`/data/discovery/${s.id}/datasets/${d.id}/schema`} />
                            </span>
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

        const selectedKey = this.props.location.pathname;

        return (
            <div>
                <Layout>
                    <Layout.Sider width="256" theme="light">
                        <Menu mode="inline" selectedKeys={[selectedKey]} style={{height: "100%", padding: "16px 0"}}>
                            <Menu.Item key="/data/discovery/home" style={{paddingLeft: "0"}}>
                                <Icon type="home" />
                                <span>Home</span>
                            </Menu.Item>
                            {dataMenus}
                        </Menu>
                    </Layout.Sider>
                    <Layout.Content style={{background: "white", padding: "24px 32px"}}>
                        <Switch>
                            <Route path="/data/discovery/home" component={DiscoveryHomeContent} />
                            <Route path="/data/discovery/:service_id/datasets/:dataset_id/search"
                                   component={DiscoveryHomeContent} /> {/* TODO */}
                            <Route path="/data/discovery/:service_id/datasets/:dataset_id/schema"
                                   component={DiscoveryHomeContent} /> {/* TODO */}
                            <Redirect from="/data/discovery" to="/data/discovery/home" />
                        </Switch>
                    </Layout.Content>
                </Layout>
            </div>
        );
    }
}

const mapStateToProps = state => ({
    services: state.services.items,
    datasets: state.serviceDatasets.datasets
});

export default connect(mapStateToProps)(withRouter(DataDiscoveryContent));
