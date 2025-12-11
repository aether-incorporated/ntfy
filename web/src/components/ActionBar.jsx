import { AppBar, Toolbar, Typography, Box, IconButton, useTheme } from "@mui/material";
import * as React from "react";
import { useState } from "react";
import { useLocation } from "react-router-dom";
import MoreVertIcon from "@mui/icons-material/MoreVert";
import NotificationsIcon from "@mui/icons-material/Notifications";
import NotificationsOffIcon from "@mui/icons-material/NotificationsOff";
import { useTranslation } from "react-i18next";
import logo from "../img/ntfy.png";
import subscriptionManager from "../app/SubscriptionManager";
import routes from "./routes";
import { topicDisplayName } from "../app/utils";
import { SubscriptionPopup } from "./SubscriptionPopup";
import { useIsLaunchedPWA } from "./hooks";

const ActionBar = (props) => {
  const theme = useTheme();
  const { t } = useTranslation();
  const location = useLocation();
  const isLaunchedPWA = useIsLaunchedPWA();

  let title = "ntfy";
  if (props.selected) {
    title = topicDisplayName(props.selected);
  } else if (location.pathname === routes.settings) {
    title = t("action_bar_settings");
  } else if (location.pathname === routes.account) {
    title = t("action_bar_account");
  }

  const getActionBarBackground = () => {
    if (isLaunchedPWA) {
      return "#317f6f";
    }

    switch (theme.palette.mode) {
      case "dark":
        return "linear-gradient(150deg, #203631 0%, #2a6e60 100%)";

      case "light":
      default:
        return "linear-gradient(150deg, #338574 0%, #56bda8 100%)";
    }
  };

  return (
    <AppBar
      position="fixed"
      sx={{
        width: "100%",
        zIndex: { sm: 1250 },
      }}
    >
      <Toolbar
        sx={{
          pr: "24px",
          background: getActionBarBackground(),
        }}
      >
        <Box
          component="img"
          src={logo}
          alt={t("action_bar_logo_alt")}
          sx={{
            display: "block",
            marginRight: "10px",
            height: "28px",
          }}
        />
        <Typography variant="h6" noWrap component="div" sx={{ flexGrow: 1 }}>
          {title}
        </Typography>
        {props.selected && <SettingsIcons subscription={props.selected} onUnsubscribe={props.onUnsubscribe} />}
      </Toolbar>
    </AppBar>
  );
};

const SettingsIcons = (props) => {
  const { t } = useTranslation();
  const [anchorEl, setAnchorEl] = useState(null);
  const { subscription } = props;

  const handleToggleMute = async () => {
    const mutedUntil = subscription.mutedUntil ? 0 : 1; // Make this a timestamp in the future
    await subscriptionManager.setMutedUntil(subscription.id, mutedUntil);
  };

  return (
    <>
      <IconButton color="inherit" size="large" edge="end" onClick={handleToggleMute} aria-label={t("action_bar_toggle_mute")}>
        {subscription.mutedUntil ? <NotificationsOffIcon /> : <NotificationsIcon />}
      </IconButton>
      <IconButton
        color="inherit"
        size="large"
        edge="end"
        onClick={(ev) => setAnchorEl(ev.currentTarget)}
        aria-label={t("action_bar_toggle_action_menu")}
      >
        <MoreVertIcon />
      </IconButton>
      <SubscriptionPopup subscription={subscription} anchor={anchorEl} placement="right" onClose={() => setAnchorEl(null)} />
    </>
  );
};

export default ActionBar;
