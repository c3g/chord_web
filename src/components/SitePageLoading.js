import React from "react";
import SitePageHeader from "./SitePageHeader";

import {Skeleton} from "antd";
import "antd/es/skeleton/style/css";

const SitePageLoading = () => <>
    <SitePageHeader title={<Skeleton active={true} title={{width: 100}} paragraph={false} />} />
    <div style={{padding: "32px 24px", background: "white"}}>
        <Skeleton title={false} active={true} />
    </div>
</>;

export default SitePageLoading;
