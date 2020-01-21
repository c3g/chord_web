import React from "react";
import {Skeleton} from "antd";
import "antd/es/skeleton/style/css";

export default () =>
    <Skeleton title={{width: 300}}
              paragraph={{rows: 4, width: [600, 580, 600, 480]}} />;
