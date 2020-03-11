import React, {Component} from "react";
import {connect} from "react-redux";
import PropTypes from "prop-types";

import {Layout, Typography} from "antd";
import "antd/es/layout/style/css";
import "antd/es/typography/style/css";

import {markNotificationAsRead, hideNotificationDrawer} from "../../modules/notifications/actions";

import NotificationList from "./NotificationList";
import SitePageHeader from "../SitePageHeader";

import {notificationPropTypesShape} from "../../utils";


class NotificationsContent extends Component {
    render() {
        return <>
            <SitePageHeader title="Notifications" />
            <Layout>
                <Layout.Content style={{background: "white", padding: "16px 24px"}}>
                    <Typography.Title level={3}>Unread</Typography.Title>
                    <NotificationList notifications={this.props.notifications.filter(n => !n.read)} />
                    <Typography.Title level={3} style={{marginTop: "1.5rem"}}>Read</Typography.Title>
                    <NotificationList notifications={this.props.notifications.filter(n => n.read)} />
                </Layout.Content>
            </Layout>
        </>;
    }
}

NotificationsContent.propTypes = {
    notifications: PropTypes.arrayOf(notificationPropTypesShape)
};

const mapStateToProps = state => ({
    notifications: state.notifications.items
});

const mapDispatchToProps = dispatch => ({
    markNotificationAsRead: nID => dispatch(markNotificationAsRead(nID)),
    hideNotificationDrawer: () => dispatch(hideNotificationDrawer())
});

export default connect(mapStateToProps, mapDispatchToProps)(NotificationsContent);
