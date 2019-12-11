import React, {Component} from "react";
import {connect} from "react-redux";

import {Layout, PageHeader, Typography} from "antd";
import "antd/es/layout/style/css";
import "antd/es/page-header/style/css";
import "antd/es/typography/style/css";

import {PAGE_HEADER_STYLE, PAGE_HEADER_TITLE_STYLE} from "../styles/pageHeader";

import {markNotificationAsRead, hideNotificationDrawer} from "../modules/notifications/actions";


import NotificationList from "./NotificationList";


class NotificationsContent extends Component {
    render() {
        return (
            <>
                <PageHeader title={<div style={PAGE_HEADER_TITLE_STYLE}>Notifications</div>}
                            style={PAGE_HEADER_STYLE} />
                <Layout>
                    <Layout.Content style={{background: "white", padding: "16px 24px"}}>
                        <Typography.Title level={3}>Unread</Typography.Title>
                        <NotificationList notifications={this.props.notifications.filter(n => !n.read)} />
                        <Typography.Title level={3} style={{marginTop: "1.5rem"}}>Read</Typography.Title>
                        <NotificationList notifications={this.props.notifications.filter(n => n.read)} />
                    </Layout.Content>
                </Layout>
              </>
        );
    }
}

const mapStateToProps = state => ({
    notifications: state.notifications.items
});

const mapDispatchToProps = dispatch => ({
    markNotificationAsRead: nID => dispatch(markNotificationAsRead(nID)),
    hideNotificationDrawer: () => dispatch(hideNotificationDrawer())
});

export default connect(mapStateToProps, mapDispatchToProps)(NotificationsContent);
