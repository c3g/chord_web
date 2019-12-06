import React, {Component} from "react";
import {connect} from "react-redux";

import {Drawer} from "antd";
import "antd/es/drawer/style/css";

import {hideNotificationDrawer} from "../modules/notifications/actions";

class NotificationDrawer extends Component {
    render() {
        return <Drawer title={"Notifications"} visible={this.props.notificationDrawerVisible}
                       closable={false}
                       onClose={() => this.props.hideNotificationDrawer()}>
            TODO
        </Drawer>;
    }
}

const mapStateToProps = state => ({
    notificationDrawerVisible: state.notifications.drawerVisible,
    notifications: state.notifications.items,
    fetchingNotifications: state.notifications.isFetching
});

const mapDispatchToProps = dispatch => ({
    hideNotificationDrawer: () => dispatch(hideNotificationDrawer())
});

export default connect(mapStateToProps, mapDispatchToProps)(NotificationDrawer);
