import React, {Component} from "react";
import {connect} from "react-redux";

import {Button, Layout, Menu, PageHeader} from "antd";

import "antd/es/button/style/css";
import "antd/es/layout/style/css";
import "antd/es/menu/style/css";
import "antd/es/page-header/style/css";

import Project from "./manager/Project";

import {fetchServicesWithMetadataAndDataTypesAndDatasetsIfNeeded} from "../modules/services/actions";

class DataManagerContent extends Component {
    componentDidMount() {
        document.title = "CHORD - Manage Your Data";
        this.props.fetchIfNeeded();
    }

    render() {
        const projectName = "Project 1";
        const projectDescription = "Lorem ipsum dolor sit amet, consectetur adipisicing elit. Corporis earum et " +
            "laboriosam laborum maxime reiciendis sunt temporibus. Alias, consectetur corporis cumque dignissimos " +
            "eius eveniet ipsa laudantium numquam quis, suscipit vero!";

        return (
            <div>
                <PageHeader title="Data Manager" subTitle="Share data with the CHORD federation"
                            style={{borderBottom: "1px solid rgb(232, 232, 232)"}}
                            extra={[<Button key="create_project" style={{marginTop: "-3px"}} type="primary"
                                            icon="plus">
                                Create Project
                            </Button>]} />
                <Layout>
                    <Layout.Sider style={{background: "white"}} width={256}>
                        <Menu style={{height: "100%"}} mode="inline">
                            <Menu.Item key="1">Project 1</Menu.Item>
                        </Menu>
                    </Layout.Sider>
                    <Layout.Content style={{background: "white", padding: "24px", position: "relative"}}>
                        <Project value={{name: projectName, description: projectDescription}}
                                 datasets={this.props.datasets}
                                 loadingDatasets={this.props.loadingDatasets} />
                    </Layout.Content>
                </Layout>
            </div>
        );
    }
}

const mapStateToProps = state => {
    const datasets = state.serviceDatasets.datasetsByServiceAndDataTypeID;
    const datasetList = Object.keys(datasets)
        .map(sID => Object.keys(datasets[sID])
            .map(dtID => datasets[sID][dtID].map(ds => ({...ds, dataTypeID: dtID})))
            .flat())
        .flat();
    return {
        loadingDatasets: state.services.isLoadingAllData,
        datasets: datasetList  // TODO
    };
};

const mapDispatchToProps = dispatch => ({
    fetchIfNeeded: () => dispatch(fetchServicesWithMetadataAndDataTypesAndDatasetsIfNeeded())
});

export default connect(mapStateToProps, mapDispatchToProps)(DataManagerContent);
