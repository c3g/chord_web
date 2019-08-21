import React, {Component} from "react";
import {connect} from "react-redux";

import {Button, Empty, Layout, Menu, PageHeader,Typography} from "antd";

import "antd/es/button/style/css";
import "antd/es/empty/style/css";
import "antd/es/layout/style/css";
import "antd/es/menu/style/css";
import "antd/es/page-header/style/css";
import "antd/es/typography/style/css";

import Project from "./manager/Project";

import {fetchServicesWithMetadataAndDataTypesAndDatasetsIfNeeded} from "../modules/services/actions";
import {fetchProjects, createProject} from "../modules/manager/actions";

class DataManagerContent extends Component {
    componentDidMount() {
        document.title = "CHORD - Manage Your Data";
        this.props.fetchServiceDataIfNeeded();
        this.props.fetchProjects();  // TODO: If needed
    }

    render() {
        const projectMenuItems = this.props.projects.map(project => (
            <Menu.Item key={project.id}>{project.name}</Menu.Item>
        ));

        const projectName = "Project 1";
        const projectDescription = "Lorem ipsum dolor sit amet, consectetur adipisicing elit. Corporis earum et " +
            "laboriosam laborum maxime reiciendis sunt temporibus. Alias, consectetur corporis cumque dignissimos " +
            "eius eveniet ipsa laudantium numquam quis, suscipit vero!";

        const contentStyling = {
            background: "white",
            padding: "24px",
            position: "relative"
        };

        return (
            <>
                <PageHeader title="Data Manager" subTitle="Share data with the CHORD federation"
                            style={{borderBottom: "1px solid rgb(232, 232, 232)"}}
                            extra={[<Button key="create_project" style={{marginTop: "-3px"}} type="primary"
                                            icon="plus">
                                Create Project
                            </Button>]} />
                <Layout>
                    {projectMenuItems.length === 0 ? (
                        <Layout.Content style={contentStyling}>
                            <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} description={<>
                                <Typography.Title level={3}>No Projects</Typography.Title>
                                <Typography.Paragraph style={{maxWidth: "600px", margin: "0 auto"}}>
                                    To create datasets and ingest data, you have to create a CHORD project
                                    first. CHORD projects have a name and description, and let you group related
                                    datasets together. You can then specify project-wide consent codes and data use
                                    restrictions to control data access.
                                </Typography.Paragraph>
                            </>}>
                                <Button type="primary" icon="plus">Create Project</Button>
                            </Empty>
                        </Layout.Content>
                    ) : (
                        <>
                            <Layout.Sider style={{background: "white"}} width={256}>
                                <Menu style={{height: "100%"}} mode="inline">
                                    {projectMenuItems}
                                </Menu>
                            </Layout.Sider>
                            <Layout.Content style={contentStyling}>
                                <Project value={{name: projectName, description: projectDescription}}
                                         datasets={this.props.datasets}
                                         loadingDatasets={this.props.loadingDatasets} />
                            </Layout.Content>
                        </>
                    )}
                </Layout>
            </>
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
        projects: state.projects.items,
        loadingDatasets: state.services.isLoadingAllData,
        datasets: datasetList  // TODO
    };
};

const mapDispatchToProps = dispatch => ({
    fetchServiceDataIfNeeded: () => dispatch(fetchServicesWithMetadataAndDataTypesAndDatasetsIfNeeded()),
    fetchProjects: () => dispatch(fetchProjects()),
    createProject: project => dispatch(createProject(project))
});

export default connect(mapStateToProps, mapDispatchToProps)(DataManagerContent);
