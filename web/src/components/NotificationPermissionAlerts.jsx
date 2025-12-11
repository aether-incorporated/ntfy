import React from "react";
import { Alert, AlertTitle, Typography, Button, Link } from "@mui/material";
import { useTranslation, Trans } from "react-i18next";
import notifier from "../app/Notifier";
import { useNotificationPermissionListener } from "./hooks";

const NotificationPermissionRequired = () => {
  const { t } = useTranslation();
  const requestPermission = async () => {
    await notifier.maybeRequestPermission();
  };
  return (
    <Alert severity="warning" sx={{ paddingTop: 2 }}>
      <AlertTitle>{t("alert_notification_permission_required_title")}</AlertTitle>
      <Typography gutterBottom>{t("alert_notification_permission_required_description")}</Typography>
      <Button sx={{ float: "right" }} color="inherit" size="small" onClick={requestPermission}>
        {t("alert_notification_permission_required_button")}
      </Button>
    </Alert>
  );
};

const NotificationPermissionDeniedAlert = () => {
  const { t } = useTranslation();
  return (
    <Alert severity="warning" sx={{ paddingTop: 2 }}>
      <AlertTitle>{t("alert_notification_permission_denied_title")}</AlertTitle>
      <Typography gutterBottom>{t("alert_notification_permission_denied_description")}</Typography>
    </Alert>
  );
};

const NotificationIOSInstallRequiredAlert = () => {
  const { t } = useTranslation();
  return (
    <Alert severity="warning" sx={{ paddingTop: 2 }}>
      <AlertTitle>{t("alert_notification_ios_install_required_title")}</AlertTitle>
      <Typography gutterBottom>{t("alert_notification_ios_install_required_description")}</Typography>
    </Alert>
  );
};

const NotificationBrowserNotSupportedAlert = () => {
  const { t } = useTranslation();
  return (
    <Alert severity="warning" sx={{ paddingTop: 2 }}>
      <AlertTitle>{t("alert_not_supported_title")}</AlertTitle>
      <Typography gutterBottom>{t("alert_not_supported_description")}</Typography>
    </Alert>
  );
};

const NotificationContextNotSupportedAlert = () => {
  const { t } = useTranslation();
  return (
    <Alert severity="warning" sx={{ paddingTop: 2 }}>
      <AlertTitle>{t("alert_not_supported_title")}</AlertTitle>
      <Typography gutterBottom>
        <Trans
          i18nKey="alert_not_supported_context_description"
          components={{
            mdnLink: <Link href="https://developer.mozilla.org/en-US/docs/Web/API/notification" target="_blank" rel="noopener" />,
          }}
        />
      </Typography>
    </Alert>
  );
};

const NotificationPermissionAlerts = () => {
  const showNotificationPermissionRequired = useNotificationPermissionListener(() => notifier.notRequested());
  const showNotificationPermissionDenied = useNotificationPermissionListener(() => notifier.denied());
  const showNotificationIOSInstallRequired = notifier.iosSupportedButInstallRequired();
  const showNotificationBrowserNotSupportedBox = !showNotificationIOSInstallRequired && !notifier.browserSupported();
  const showNotificationContextNotSupportedBox = notifier.browserSupported() && !notifier.contextSupported();

  const alertVisible =
    showNotificationPermissionRequired ||
    showNotificationPermissionDenied ||
    showNotificationIOSInstallRequired ||
    showNotificationBrowserNotSupportedBox ||
    showNotificationContextNotSupportedBox;

  if (!alertVisible) return null;

  return (
    <>
      {showNotificationPermissionRequired && <NotificationPermissionRequired />}
      {showNotificationPermissionDenied && <NotificationPermissionDeniedAlert />}
      {showNotificationBrowserNotSupportedBox && <NotificationBrowserNotSupportedAlert />}
      {showNotificationContextNotSupportedBox && <NotificationContextNotSupportedAlert />}
      {showNotificationIOSInstallRequired && <NotificationIOSInstallRequiredAlert />}
    </>
  );
};

export default NotificationPermissionAlerts;
