import React, { useState } from "react";
import { useHistory, useLocation, Link } from "react-router-dom";
import api from "../api/axiosConfig";
import {
  AppBar,
  Toolbar,
  Box,
  CssBaseline,
  Typography,
  Drawer,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  IconButton,
  Button,
  ListItemButton,
} from "@mui/material";
import HomeIcon from "@mui/icons-material/Home";
import QuizIcon from "@mui/icons-material/FormatListBulleted";
import AssessmentIcon from "@mui/icons-material/Assessment";
import MenuIcon from "@mui/icons-material/Menu";
import LogoutIcon from "@mui/icons-material/Logout";
import KaplanLogoSource from "../assets/images/kaplan logo.png";
import "./styles/MainLayout.css";

interface MainLayoutProps {
  children: React.ReactNode;
}

const MainLayout: React.FC<MainLayoutProps> = ({ children }) => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const history = useHistory();
  const location = useLocation();
  const currentPath = location.pathname;

  const handleLogout = async () => {
    try {
      await api.post("/auth/logout");
      history.push("/login");
    } catch (error) {
      console.error("Logout failed:", error);
      history.push("/login");
    }
  };

  const navItems = [
    { text: "Home", icon: <HomeIcon />, path: "/" },
    { text: "Quiz List", icon: <QuizIcon />, path: "/quizzes" },
    { text: "Performance", icon: <AssessmentIcon />, path: "/performance" },
  ];

  const isActive = (path: string): boolean => {
    if (path === "/") return currentPath === "/";
    return currentPath.startsWith(path);
  };

  const getPageTitle = (): string => {
    const activeItem = navItems.find((item) => isActive(item.path));
    return activeItem ? activeItem.text : "Dashboard";
  };

  return (
    <Box className="main-layout-root">
      <CssBaseline />

      <AppBar position="fixed" className="main-appbar">
        <Toolbar>
          <IconButton
            color="inherit"
            onClick={() => setIsSidebarOpen(true)}
            edge="start"
            className="menu-button"
          >
            <MenuIcon />
          </IconButton>

          <Box className="appbar-content">
            <img
              src={KaplanLogoSource}
              alt="Kaplan Logo"
              className="appbar-logo"
            />
            <Typography variant="h6" className="appbar-title">
              {getPageTitle()}
            </Typography>
          </Box>

          <Button
            color="inherit"
            onClick={handleLogout}
            endIcon={<LogoutIcon />}
            className="logout-button"
          >
            Logout
          </Button>
        </Toolbar>
      </AppBar>

      <Drawer
        anchor="left"
        open={isSidebarOpen}
        onClose={() => setIsSidebarOpen(false)}
        variant="temporary"
        classes={{ paper: "sidebar-paper" }}
      >
        <List className="sidebar-list">
          {navItems.map((item) => (
            <ListItem key={item.text} disablePadding>
              <ListItemButton
                component={Link}
                to={item.path}
                onClick={() => setIsSidebarOpen(false)}
                className={`sidebar-list-item ${
                  isActive(item.path) ? "active" : ""
                }`}
                style={{ textDecoration: "none", color: "inherit" }}
              >
                <ListItemIcon
                  className={isActive(item.path) ? "icon-active" : "icon-default"}
                >
                  {item.icon}
                </ListItemIcon>
                <ListItemText primary={item.text} />
              </ListItemButton>
            </ListItem>
          ))}
        </List>
      </Drawer>

      <Box component="main" className="main-content">
        {children}
      </Box>
    </Box>
  );
};

export default MainLayout;
