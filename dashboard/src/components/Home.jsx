import React, { useEffect, useState } from "react";
import axios from "axios";
import Dashboard from "./Dashboard";
import TopBar from "./TopBar";

const Home = () => {
  const [isAuthorized, setIsAuthorized] = useState(false);

  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const tokenFromUrl = urlParams.get("token");

    if (tokenFromUrl) {
      localStorage.setItem("token", tokenFromUrl);
      window.history.replaceState({}, document.title, "/");
    }

    const verifyUser = async () => {
      try {
        const savedToken = localStorage.getItem("token");

        if (!savedToken) {
          window.location.href = `${import.meta.env.VITE_FRONTEND_URL}/login`;
          return;
        }

        const { data } = await axios.post(
          `${import.meta.env.VITE_BACKEND_URL}`,
          { token: savedToken } 
        );

        if (data.status) {
          localStorage.setItem("username", data.user);
          localStorage.setItem("email", data.email);
          setIsAuthorized(true);
        } else {
          localStorage.removeItem("token");
          window.location.href = `${import.meta.env.VITE_FRONTEND_URL}/login`;
        }
      } catch (error) {
        console.log(error);
        localStorage.removeItem("token");
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