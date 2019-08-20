import {combineReducers} from "redux";

import {services, serviceMetadata, serviceDataTypes, serviceDatasets} from "./modules/services/reducers";
import {discovery} from "./modules/discovery/reducers";

const rootReducer = combineReducers({
    services,
    serviceMetadata,
    serviceDataTypes,
    serviceDatasets,
    discovery
});

export default rootReducer;
