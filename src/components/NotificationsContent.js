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
    notifications: [...state.notifications.items, ...[{
        id: 1,
        title: "WES Run Completed",
        description: "WES run '{str(run_id)}' completed successfully",
        notification_type: "wes_run_completed",
        action_target: "69698eff-551b-4486-82c1-c256d5f73a14",
        read: false,
        timestamp: new Date(Date.parse("2019-12-09T15:53:12.053590+00:00"))
    }, {
        id: 2,
        title: "WES Run Completed",
        description: "WES run '{str(run_id)}' completed successfully",
        notification_type: "wes_run_completed",
        action_target: "69698eff-551b-4486-82c1-c256d5f73a14",
        read: false,
        timestamp: new Date(Date.parse("2019-12-09T15:55:12.053590+00:00"))
    }]]
});

const mapDispatchToProps = dispatch => ({
    markNotificationAsRead: nID => dispatch(markNotificationAsRead(nID)),
    hideNotificationDrawer: () => dispatch(hideNotificationDrawer())
});

export default connect(mapStateToProps, mapDispatchToProps)(NotificationsContent);
