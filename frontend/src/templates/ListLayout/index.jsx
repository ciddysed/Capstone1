import React from "react";
import EvaluatorNavigation from "../../components/Navigation/EvaluatorNavigation";

const ListLayout = ({ children }) => {
  return (
    <EvaluatorNavigation>
      {children}
    </EvaluatorNavigation>
  );
};

export default ListLayout;
