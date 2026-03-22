import React, { useEffect, useState } from "react";
import axios from "axios";
import Dashboard from "./Dashboard";
import TopBar from "./TopBar";

const Home = () => {
  const [isAuthorized, setIsAuthorized] = useState(false);

  useEffect(() => {
    const verifyUser = async () => {
      try {
        const { data } = await axios.post(
          `${import.meta.env.VITE_BACKEND_URL}`,
          {},
          { withCredentials: true },
        );

        if (data.status) {
          localStorage.setItem("username", data.user);
          localStorage.setItem("email", data.email);

          setIsAuthorized(true);
        } else {
          window.location.href = `${import.meta.env.VITE_FRONTEND_URL}/login`;
        }
      } catch (error) {
        console.log(error);
        window.location.href = `${import.meta.env.VITE_FRONTEND_URL}/login`;
      }
    };

    verifyUser();
  }, []);

  if (!isAuthorized) {
    return (
      <div
        style={{ display: "flex", justifyContent: "center", marginTop: "50px" }}
      >
        <h2>Loading Permissions...</h2>
      </div>
    );
  }

  return (
    <>
      <TopBar />
      <Dashboard />
    </>
  );
};

export default Home;
