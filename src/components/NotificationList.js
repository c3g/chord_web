import React, {Component} from "react";
import {connect} from "react-redux";
import {withRouter} from "react-router-dom";

import {Button, List} from "antd";
import "antd/es/button/style/css";
import "antd/es/list/style/css";

import {hideNotificationDrawer, markNotificationAsRead} from "../modules/notifications/actions";

import {NOTIFICATION_WES_RUN_COMPLETED, NOTIFICATION_WES_RUN_FAILED} from "../notifications";


const sortNotificationTimestamps = (a, b) => b.timestamp - a.timestamp;


class NotificationList extends Component {
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
    };

    render() {
        return (
            <List itemLayout="vertical"
                  dataSource={this.props.notifications.sort(sortNotificationTimestamps)}
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
    hideNotificationDrawer: () => dispatch(hideNotificationDrawer())
});

export default withRouter(connect(mapStateToProps, mapDispatchToProps)(NotificationList));
