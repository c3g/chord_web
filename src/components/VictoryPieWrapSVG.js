import React from "react";
import PropTypes from "prop-types";

const VictoryPieWrapSVG = ({children}) => <svg viewBox="0 0 400 250">{children}</svg>;
VictoryPieWrapSVG.propTypes = {children: PropTypes.any};

export default VictoryPieWrapSVG;
