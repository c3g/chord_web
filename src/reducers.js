import {combineReducers} from "redux";

import {
    services,
    serviceMetadata,
    serviceDataTypes,
    serviceDatasets,
    serviceWorkflows
} from "./modules/services/reducers";
import {discovery} from "./modules/discovery/reducers";
import {projects, projectDatasets, manager, dropBox, runs} from "./modules/manager/reducers";

const rootReducer = combineReducers({
    services,
    serviceMetadata,
    serviceDataTypes,
    serviceDatasets,
    serviceWorkflows,
    discovery,
    projects,
    projectDatasets,
    manager,
    dropBox,
    runs
});

export default rootReducer;
