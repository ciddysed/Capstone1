import React from "react";
import EvaluatorNavigation from "../../components/Navigation/EvaluatorNavigation";

const ListLayoutWithFilters = ({ children }) => {
  return (
    <EvaluatorNavigation>
      {children}
    </EvaluatorNavigation>
  );
};

export default ListLayoutWithFilters;
