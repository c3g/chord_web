import {combineReducers} from "redux";

import {services, serviceMetadata, serviceDataTypes, serviceDatasets} from "./modules/services/reducers";
import {discovery} from "./modules/discovery/reducers";
import {projects, manager} from "./modules/manager/reducers";

const rootReducer = combineReducers({
    services,
    serviceMetadata,
    serviceDataTypes,
    serviceDatasets,
    discovery,
    projects,
    manager
});

export default rootReducer;
