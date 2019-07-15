import React, {Component} from "react";
import {connect} from "react-redux";
import {Link, withRouter} from "react-router-dom";

import {Icon, Layout, Menu, Typography} from "antd";
import "antd/es/icon/style/css";
import "antd/es/layout/style/css";
import "antd/es/menu/style/css";
import "antd/es/typography/style/css";

class DataDiscoveryContent extends Component {
    componentDidMount() {
        document.title = "CHORD - Discover Data";
    }

    render() {
        const dataMenus = this.props.services.filter(s => s.metadata["chordDataService"]).map(s => {
            const menuItems = Object.keys(this.props.datasets).includes(s.id)
                ? this.props.datasets[s.id].map(d => (
                    <Menu.SubMenu key={`${s.id}_dataset_${d.id}`} title={<span>{d.id}</span>}>
                        <Menu.Item key={`${s.id}_dataset_${d.id}_search`}>
                            <span>
                                <Icon type="search" />
                                <span>Search</span>
                                <Link to={`/data/discovery/${s.id}/datasets/${d.id}/search`} />
                            </span>
                        </Menu.Item>
                        <Menu.Item key={`${s.id}_dataset_${d.id}_schema}`}>
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

        const selectedKey = "/data/discovery/home";

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
                        <Typography.Title level={2}>Data Discovery</Typography.Title>
                        <p>
                            Lorem ipsum dolor sit amet, consectetur adipisicing elit. Architecto consectetur dolores
                            earum in laboriosam provident quo voluptate. Accusamus accusantium ad aliquid at blanditiis
                            consequatur consequuntur cum cumque deserunt distinctio dolorum eaque eius eum eveniet
                            fugiat, id illum iste iusto laborum magnam maiores minima molestiae neque nihil omnis optio
                            placeat quibusdam quo quod recusandae reiciendis sunt tempore ullam vel veritatis vero
                            voluptate. Accusamus debitis deserunt eius nesciunt quisquam? Alias amet aut distinctio
                            earum esse expedita magni natus nisi quo voluptatem? Dolorum eius fuga iste iusto
                            laboriosam, nobis quisquam suscipit unde vel. Aliquam culpa deserunt eaque eligendi et
                            nesciunt, obcaecati quaerat voluptatibus?
                        </p>
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
