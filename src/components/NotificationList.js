import React, {Component} from "react";
import {connect} from "react-redux";
import {withRouter} from "react-router-dom";

import {Button, List} from "antd";
import "antd/es/button/style/css";
import "antd/es/list/style/css";

import {hideNotificationDrawer, markNotificationAsRead} from "../modules/notifications/actions";

import {NOTIFICATION_WES_RUN_COMPLETED, NOTIFICATION_WES_RUN_FAILED, navigateToWESRun} from "../notifications";


const sortNotificationTimestamps = (a, b) => b.timestamp - a.timestamp;


class NotificationList extends Component {
    constructor(props) {
        super(props);
        this.getNotificationActions = this.getNotificationActions.bind(this);
    }

    getNotificationActions(notification) {
        switch (notification.notification_type) {
            case NOTIFICATION_WES_RUN_COMPLETED:
            case NOTIFICATION_WES_RUN_FAILED:
                return [
                    <Button onClick={() => this.props.navigateToWESRun(notification.action_target, this.props.history)}>
                        Run Details
                    </Button>
                ];
            default:
                return [];
        }
    };

    render() {
        const processedNotifications = this.props.notifications.map(n => ({
            ...n,
            timestamp: new Date(Date.parse(n.timestamp))
        })).sort(sortNotificationTimestamps);

        return (
            <List itemLayout="vertical"
                  dataSource={processedNotifications}
                  loading={this.props.fetchingNotifications}
                  renderItem={n => (
                      <List.Item key={n.id} actions={[
                          ...this.getNotificationActions(n),
                          <Button type="link" icon="read" style={{padding: 0}}
                                  onClick={() => this.props.markNotificationAsRead(n.id)}>
                              Mark as Read
                          </Button>
                      ]}>
                          <List.Item.Meta title={n.title} description={n.description}
                                          style={{marginBottom: "8px"}} />
                          {n.timestamp.toLocaleString()}
                      </List.Item>
                  )} />
        );
    }
}


const mapStateToProps = state => ({
    fetchingNotifications: state.notifications.isFetching
});

const mapDispatchToProps = dispatch => ({
    markNotificationAsRead: nID => dispatch(markNotificationAsRead(nID)),
    hideNotificationDrawer: () => dispatch(hideNotificationDrawer()),
    navigateToWESRun: async (target, history) => await navigateToWESRun(target, dispatch, history),
});

export default withRouter(connect(mapStateToProps, mapDispatchToProps)(NotificationList));
