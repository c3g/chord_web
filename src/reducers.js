import {combineReducers} from "redux";

import {
    services,
    serviceMetadata,
    serviceDataTypes,
    serviceTables,
    serviceWorkflows
} from "./modules/services/reducers";
import {discovery} from "./modules/discovery/reducers";
import {
    projects,
    projectDatasets,
    projectTables,

    phenopackets,
    biosamples,
    individuals
} from "./modules/metadata/reducers";
import {manager, dropBox} from "./modules/manager/reducers";
import {runs} from "./modules/wes/reducers";
import {peers} from "./modules/peers/reducers";

const rootReducer = combineReducers({
    services,
    serviceMetadata,
    serviceDataTypes,
    serviceTables,
    serviceWorkflows,

    discovery,

    projects,
    projectDatasets,
    projectTables,

    phenopackets,
    biosamples,
    individuals,

    manager,
    dropBox,
    runs,

    peers
});

export default rootReducer;
