import React, {Component} from "react";
import {connect} from "react-redux";
import {withRouter} from "react-router-dom";

import {Button, Drawer, List} from "antd";
import "antd/es/button/style/css";
import "antd/es/drawer/style/css";
import "antd/es/list/style/css";

import {hideNotificationDrawer} from "../modules/notifications/actions";


const NOTIFICATION_WES_RUN_COMPLETED = "wes_run_completed";
const NOTIFICATION_WES_RUN_FAILED = "wes_run_failed";


const sortNotificationTimestamps = (a, b) => b.timestamp - a.timestamp;


class NotificationDrawer extends Component {
    constructor(props) {
        super(props);
        this.navigateToWESRun = this.navigateToWESRun.bind(this);
        this.getNotificationActions = this.getNotificationActions.bind(this);
    }

    navigateToWESRun(target) {
        this.props.hideNotificationDrawer();
        this.props.history.push(`/data/manager/runs/${target}/request`);
    }

    getNotificationActions(notification) {
        switch (notification.notification_type) {
            case NOTIFICATION_WES_RUN_COMPLETED:
            case NOTIFICATION_WES_RUN_FAILED:
                return [
                    <Button onClick={() => this.navigateToWESRun(notification.action_target)}>
                        Run Details
                    </Button>
                ];
            default:
                return [];
        }
    }

    render() {
        return <Drawer title={"Notifications"}
                       visible={this.props.notificationDrawerVisible}
                       width="auto"
                       onClose={() => this.props.hideNotificationDrawer()}>
            <List itemLayout="vertical" dataSource={[...this.props.notifications].sort(sortNotificationTimestamps)}
                  renderItem={n => (
                      <List.Item key={n.id} actions={[
                          ...this.getNotificationActions(n),
                          <Button type="link" icon="read" style={{padding: 0}}>Mark as Read</Button>
                      ]}>
                          <List.Item.Meta title={n.title} description={n.description} style={{marginBottom: "8px"}} />
                          {n.timestamp.toLocaleString()}
                      </List.Item>
                  )} />
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

export default withRouter(connect(mapStateToProps, mapDispatchToProps)(NotificationDrawer));
