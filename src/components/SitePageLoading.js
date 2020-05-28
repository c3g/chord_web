import React from "react";
import SitePageHeader from "./SitePageHeader";

import {Skeleton} from "antd";
import "antd/es/skeleton/style/css";

const SitePageLoading = () => <>
    <SitePageHeader title="" />
    <div style={{padding: "32px 24px", background: "white"}}>
        <Skeleton title={false} />
    </div>
</>;

export default SitePageLoading;
