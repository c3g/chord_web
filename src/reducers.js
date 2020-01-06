import {combineReducers} from "redux";

import {auth} from "./modules/auth/reducers";
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
import {notifications} from "./modules/notifications/reducers";
import {runs} from "./modules/wes/reducers";
import {peers} from "./modules/peers/reducers";

const rootReducer = combineReducers({
    // Auth module
    auth,

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

    // Notifications module
    notifications,

    // WES module
    runs,

    // Peers module
    peers
});

export default rootReducer;
