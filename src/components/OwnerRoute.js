import React from "react";
import {connect} from "react-redux";
import {Route} from "react-router-dom";

import {Button, Empty, Icon, Layout} from "antd";
import "antd/es/button/style/css";
import "antd/es/empty/style/css";
import "antd/es/icon/style/css";
import "antd/es/layout/style/css";

import SiteHeader from "./SiteHeader";

const signInIcon = (
    <div style={{textAlign: "center"}}>
        <Icon type="login" style={{fontSize: 48}} />
    </div>
);

const OwnerRoute = ({component: Component, isSignedIn, shouldRedirect, ...rest}) => {
    return (
        <Route {...rest} render={props => shouldRedirect
            ? (
                <>
                    <SiteHeader />
                    <Layout.Content style={{
                        margin: "50px",
                        background: "white",
                        padding: "32px 24px 4px",
                        display: "flex",
                        flexDirection: "column"
                    }}>
                        <div style={{flex: 1}} />
                            <Empty image={signInIcon}
                                   imageStyle={{height: "auto", marginBottom: "16px"}}
                                   description="You must sign in as an owner of this node to access this page.">
                                {isSignedIn
                                    ? <Button onClick={() => window.location.href = "/api/auth/sign-out"}>
                                        Sign Out</Button>
                                    : <Button type="primary" onClick={() => window.location.href = "/api/auth/sign-in"}>
                                        Sign In</Button>}
                            </Empty>
                        <div style={{flex: 1}} />
                    </Layout.Content>
                </>
            ) : <Component {...props} />} />
    );
};

const mapStateToProps = state => ({
    isSignedIn: state.auth.user !== null,
    shouldRedirect: state.auth.hasAttempted && (state.auth.user || {}).chord_user_role !== "owner"
});

export default connect(mapStateToProps)(OwnerRoute);
