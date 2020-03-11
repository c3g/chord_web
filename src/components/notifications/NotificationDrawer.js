import React, {Component} from "react";
import {connect} from "react-redux";
import {withRouter} from "react-router-dom";
import PropTypes from "prop-types";

import {Button, Divider, Drawer} from "antd";
import "antd/es/button/style/css";
import "antd/es/divider/style/css";
import "antd/es/drawer/style/css";

import NotificationList from "./NotificationList";

import {markNotificationAsRead, hideNotificationDrawer} from "../../modules/notifications/actions";
import {notificationPropTypesShape, withBasePath} from "../../utils";


class NotificationDrawer extends Component {
    constructor(props) {
        super(props);
        this.seeAllNotifications = this.seeAllNotifications.bind(this);
    }

    seeAllNotifications() {
        this.props.hideNotificationDrawer();
        this.props.history.push(withBasePath("notifications"));
    }

    render() {
        return <Drawer title={"Notifications"}
                       visible={this.props.notificationDrawerVisible}
                       width="auto"
                       onClose={() => this.props.hideNotificationDrawer()}>
            <NotificationList small={true} notifications={this.props.notifications.filter(n => !n.read)} />
              <Divider />
              <Button type="link" style={{width: "100%"}} onClick={() => this.seeAllNotifications()}>
                  See Read Notifications</Button>
        </Drawer>;
    }
}

NotificationDrawer.propTypes = {
    notificationDrawerVisible: PropTypes.bool,
    notifications: PropTypes.arrayOf(notificationPropTypesShape),

    markNotificationAsRead: PropTypes.func,
    hideNotificationDrawer: PropTypes.func,
};

const mapStateToProps = state => ({
    notificationDrawerVisible: state.notifications.drawerVisible,
    notifications: state.notifications.items,
});

const mapDispatchToProps = dispatch => ({
    markNotificationAsRead: nID => dispatch(markNotificationAsRead(nID)),
    hideNotificationDrawer: () => dispatch(hideNotificationDrawer())
});

export default withRouter(connect(mapStateToProps, mapDispatchToProps)(NotificationDrawer));
