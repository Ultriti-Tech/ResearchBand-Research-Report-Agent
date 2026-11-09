import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

const UserProtectedWrapper = ({ children }) => {
  const [userToken, setUserToken] = useState(false);
  const navigate = useNavigate();

  const axcessToken = localStorage.getItem("RHD_v1_dashed_t");

  useEffect(() => {
    if (axcessToken) {
      setUserToken(true);
    } else {
      setUserToken(false);
      alert("You must be login to axcess!");
      navigate("/login");
    }
  }, [axcessToken]);

  return axcessToken ? <>{children}</> : null;
};

export default UserProtectedWrapper;
