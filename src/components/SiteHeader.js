import React, {Component} from "react";
import {connect} from "react-redux";
import {Link, withRouter} from "react-router-dom";
import PropTypes from "prop-types";

import {Badge, Icon, Layout, Menu} from "antd";

import "antd/es/badge/style/css";
import "antd/es/icon/style/css";
import "antd/es/layout/style/css";
import "antd/es/menu/style/css";

import {showNotificationDrawer} from "../modules/notifications/actions";

class SiteHeader extends Component {
    render() {
        return (
            <Layout.Header>
                <Link to="/"><h1 style={{
                    display: "inlineBlock",
                    color: "rgba(255, 255, 255, 0.95)",
                    margin: "0 30px 0 0",
                    float: "left"
                }}>CHORD</h1></Link>
                <Menu theme="dark" mode="horizontal" selectedKeys={[this.props.match.path]}
                      style={{lineHeight: "64px"}}>
                    <Menu.Item key="/services">
                        <Link to="/services">
                            <Icon type="cloud-server" />
                            <span className="nav-text">Services</span>
                        </Link>
                    </Menu.Item>
                    <Menu.Item key="/data/discovery">
                        <Link to="/data/discovery">
                            <Icon type="file-search" />
                            <span className="nav-text">Data Discovery</span>
                        </Link>
                    </Menu.Item>
                    <Menu.Item key="/data/manager">
                        <Link to="/data/manager">
                            <Icon type="folder-open" />
                            <span className="nav-text">Data Manager</span>
                        </Link>
                    </Menu.Item>
                    <Menu.Item key="/peers">
                        <Link to="/peers">
                            <Icon type="apartment" />
                            <span className="nav-text">Peers</span>
                        </Link>
                    </Menu.Item>
                    <Menu.Item style={{float: "right"}}
                               onClick={() => this.props.user ? null : window.location.href = "/api/authenticate"}>
                        <Icon type="user" />
                        <span className="nav-text">
                            {this.props.user ? this.props.user.preferred_username : (
                                this.props.userFetching ? "Loading..." : "Sign In")}
                        </span>
                    </Menu.Item>
                    <Menu.Item key="/notifications" style={{float: "right"}}
                               onClick={() => this.props.dispatch(showNotificationDrawer())}>
                        <Badge dot count={this.props.unreadNotifications.length}>
                            <Icon type="bell" style={{marginRight: "0"}}/>
                        </Badge>
                        <span className="nav-text" style={{marginLeft: "10px"}}>Notifications
                            {this.props.unreadNotifications.length > 0 ? (
                                <span> ({this.props.unreadNotifications.length})</span>
                            ) : null}
                        </span>
                    </Menu.Item>
                </Menu>
            </Layout.Header>
        )
    }
}

SiteHeader.propTypes = {
    user: {
        email_verified: PropTypes.bool,
        preferred_username: PropTypes.string,
        sub: PropTypes.string,
    },
    userFetching: PropTypes.bool,
    unreadNotifications: PropTypes.array
};

const mapStateToProps = state => ({
    unreadNotifications: state.notifications.items.filter(n => !n.read),
    user: state.auth.user,
    userFetching: state.auth.isFetching
});

export default withRouter(connect(mapStateToProps)(SiteHeader));
