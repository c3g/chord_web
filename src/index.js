import React from "react";
import {render} from "react-dom";

import {applyMiddleware, createStore} from "redux";
import thunkMiddleware from "redux-thunk";

import {Provider} from 'react-redux';

import App from "./components/App";
import {fetchServices} from "./actions";
import rootReducer from "./reducers";

const store = createStore(rootReducer, applyMiddleware(thunkMiddleware));

document.addEventListener("DOMContentLoaded", () => {
    render(
        <Provider store={store}>
            <App />
        </Provider>,
        document.getElementById("root")
    );

    store.dispatch(fetchServices());
});
