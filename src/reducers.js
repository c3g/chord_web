import {combineReducers} from "redux";

import {services, serviceMetadata, serviceDataTypes} from "./modules/services/reducers";
import {discovery} from "./modules/discovery/reducers";

const rootReducer = combineReducers({
    services,
    serviceMetadata,
    serviceDataTypes,
    discovery
});

export default rootReducer;
