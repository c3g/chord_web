import {combineReducers} from "redux";

import {
    chordServices,
    services,
    serviceDataTypes,
    serviceTables,
    serviceWorkflows
} from "./modules/services/reducers";
import {discovery} from "./modules/discovery/reducers";
import {
    projects,
    projectTables,

    phenopackets,
    biosamples,
    individuals
} from "./modules/metadata/reducers";
import {manager, dropBox} from "./modules/manager/reducers";
import {runs} from "./modules/wes/reducers";
import {peers} from "./modules/peers/reducers";

const rootReducer = combineReducers({
    // Services module
    chordServices,
    services,
    serviceDataTypes,
    serviceTables,
    serviceWorkflows,

    // Discovery module
    discovery,

    // Metadata module

    projects,
    projectTables,

    phenopackets,
    biosamples,
    individuals,

    // Manager module
    manager,
    dropBox,

    // WES module
    runs,

    // Peers module
    peers
});

export default rootReducer;
