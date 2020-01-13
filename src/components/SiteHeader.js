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

const renderMenuItem = i => {
    if (i.hasOwnProperty("children")) {
        return (
            <Menu.SubMenu style={i.style || {}} title={
                <span className="submenu-title-wrapper">
                    {i.icon || null}
                    {i.text || null}
                </span>
            } key={i.key || ""}>
                {(i.children || []).map(ii => renderMenuItem(ii))}
            </Menu.SubMenu>
        );
    }

    return (
        <Menu.Item key={i.key || i.url || ""}
                   onClick={i.onClick || undefined}
                   style={i.style || {}}
                   disabled={i.disabled || false}>
            {i.url && !i.onClick ?
                <Link to={i.url}>
                    {i.icon || null}
                    {i.text || null}
                </Link> : <span>
                    {i.icon || null}
                    {i.text || null}
                </span>}
        </Menu.Item>
    )
};


class SiteHeader extends Component {
    render() {
        const menuItems = [
            {
                url: "/services",
                icon: <Icon type="cloud-server" />,
                text: <span className="nav-text">Services</span>,
            },
            {
                url: "/data/discovery",
                icon: <Icon type="file-search" />,
                text: <span className="nav-text">Data Discovery</span>,
            },
            {
                url: "/data/manager",
                icon: <Icon type="folder-open" />,
                text: <span className="nav-text">Data Manager</span>,
                disabled: !this.props.isOwner,
            },
            {
                url: "/peers",
                icon: <Icon type="apartment" />,
                text: <span className="nav-text">Peers</span>,
            },
            ...(this.props.user ? [{
                key: "user-menu",
                style: {float: "right"},
                icon: <Icon type="user" />,
                text: this.props.user.preferred_username,
                children: [{
                    key: "sign-out-link",
                    onClick: () => window.location.href = "/api/auth/sign-out",
                    icon: <Icon type="logout" />,
                    text: <span className="nav-text">Sign Out</span>
                }]
            }] : [{
                key: "sign-in",
                style: {float: "right"},
                icon: <Icon type="login" />,
                text: <span className="nav-text">{this.props.userFetching ? "Loading..." : "Sign In"}</span>,
            }]),
            {
                url: "/notifications",
                style: {float: "right"},
                disabled: !this.props.isOwner,
                icon: <Badge dot count={this.props.unreadNotifications.length}>
                    <Icon type="bell" style={{marginRight: "0"}}/>
                </Badge>,
                text: <span className="nav-text" style={{marginLeft: "10px"}}>
                    Notifications
                    {this.props.unreadNotifications.length > 0 ? (
                        <span> ({this.props.unreadNotifications.length})</span>
                    ) : null}
                </span>,
                onClick: () => this.props.dispatch(showNotificationDrawer())
            }
        ];

        const selectedKeys = menuItems.filter(i => i.url && this.props.location.pathname.startsWith(i.url))
            .map(i => i.key || i.url || "");

        return (
            <Layout.Header>
                <Link to="/"><h1 style={{
                    display: "inlineBlock",
                    color: "rgba(255, 255, 255, 0.95)",
                    margin: "0 30px 0 0",
                    float: "left"
                }}>CHORD</h1></Link>
                <Menu theme="dark"
                      mode="horizontal"
                      selectedKeys={selectedKeys}
                      style={{lineHeight: "64px"}}>
                    {menuItems.map(i => renderMenuItem(i))}
                </Menu>
            </Layout.Header>
        );
    }
}

SiteHeader.propTypes = {
    user: PropTypes.shape({
        chord_user_role: PropTypes.string.isRequired,
        email_verified: PropTypes.bool,
        preferred_username: PropTypes.string,
        sub: PropTypes.string.isRequired,
    }),
    userFetching: PropTypes.bool,
    unreadNotifications: PropTypes.array,
    isOwner: PropTypes.bool,
};

const mapStateToProps = state => ({
    unreadNotifications: state.notifications.items.filter(n => !n.read),
    user: state.auth.user,
    userFetching: state.auth.isFetching,
    isOwner: (state.auth.user || {}).chord_user_role === "owner"
});

export default withRouter(connect(mapStateToProps)(SiteHeader));
