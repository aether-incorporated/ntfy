import * as React from "react";
import { Suspense, useEffect } from "react";
import { Box, CssBaseline, Backdrop, CircularProgress, ThemeProvider, createTheme } from "@mui/material";
import { useLiveQuery } from "dexie-react-hooks";
import { BrowserRouter, Outlet, Route, Routes, useParams } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { AllSubscriptions, SingleSubscription } from "./Notifications";
import { darkTheme } from "./theme";
import subscriptionManager from "../app/SubscriptionManager";
import userManager from "../app/UserManager";
import { expandUrl, getKebabCaseLangStr } from "../app/utils";
import ErrorBoundary from "./ErrorBoundary";
import routes from "./routes";
import { useBackgroundProcesses, useConnectionListeners, useWebPushTopics, useAccountListener } from "./hooks";
import initI18n from "../app/i18n"; // Translations!
import RTLCacheProvider from "./RTLCacheProvider";

export const AccountContext = React.createContext({ account: null, setAccount: () => {} });

initI18n();

const App = () => {
  const { i18n } = useTranslation();
  const languageDir = i18n.dir();
  //   const prefersDarkMode = useMediaQuery("(prefers-color-scheme: dark)");
  //   const themePreference = useLiveQuery(() => prefs.theme());
  //     const theme = React.useMemo(
  //       () => createTheme({ ...(darkModeEnabled(prefersDarkMode, themePreference) ? darkTheme : lightTheme), direction: languageDir }),
  //       [prefersDarkMode, themePreference, languageDir]
  //     );
  const theme = React.useMemo(() => createTheme({ ...darkTheme, direction: languageDir }), [languageDir]);

  useEffect(() => {
    document.documentElement.setAttribute("lang", getKebabCaseLangStr(i18n.language));
    document.dir = languageDir;
  }, [i18n.language, languageDir]);

  return (
    <Suspense fallback={<Loader />}>
      <RTLCacheProvider>
        <BrowserRouter>
          <ThemeProvider theme={theme}>
            <CssBaseline />
            <ErrorBoundary>
              <Routes>
                <Route element={<Layout />}>
                  <Route path={routes.app} element={<AllSubscriptions />} />
                  {/* <Route path={routes.settings} element={<Preferences />} /> */}
                  <Route path={routes.subscription} element={<SingleSubscription />} />
                  {/* <Route path={routes.subscriptionExternal} element={<SingleSubscription />} /> */}
                </Route>
              </Routes>
            </ErrorBoundary>
          </ThemeProvider>
        </BrowserRouter>
      </RTLCacheProvider>
    </Suspense>
  );
};

const updateTitle = (newNotificationsCount) => {
  window.navigator.setAppBadge?.(newNotificationsCount);
};

const Layout = () => {
  const params = useParams();
  const [account, setAccount] = React.useState(null);
  //   const [mobileDrawerOpen, setMobileDrawerOpen] = React.useState(false);
  const users = useLiveQuery(() => userManager.all());
  const subscriptions = useLiveQuery(() => subscriptionManager.all());
  const webPushTopics = useWebPushTopics();
  const subscriptionsWithoutInternal = subscriptions?.filter((s) => !s.internal);
  const newNotificationsCount = subscriptionsWithoutInternal?.reduce((prev, cur) => prev + cur.new, 0) || 0;
  const [selected] = (subscriptionsWithoutInternal || []).filter(
    (s) =>
      (params.baseUrl && expandUrl(params.baseUrl).includes(s.baseUrl) && params.topic === s.topic) ||
      (config.base_url === s.baseUrl && params.topic === s.topic)
  );

  useAccountListener(setAccount);
  useConnectionListeners(account, subscriptions, users, webPushTopics);
  useBackgroundProcesses();
  useEffect(() => updateTitle(newNotificationsCount), [newNotificationsCount]);
  useEffect(() => {
    const manifest = document?.querySelector('link[rel="manifest"]');
    if (manifest) {
      manifest.setAttribute("href", `/manifest.webmanifest?url=${encodeURIComponent(window.location.pathname)}`);
    }
  }, [params]);

  const contextValue = React.useMemo(() => ({ account, setAccount }), [account]);

  return (
    <AccountContext.Provider value={contextValue}>
      <Box sx={{ display: "flex" }}>
        {/* <ActionBar selected={selected} onMobileDrawerToggle={() => setMobileDrawerOpen(!mobileDrawerOpen)} />
        <Navigation
          subscriptions={subscriptionsWithoutInternal}
          selectedSubscription={selected}
          mobileDrawerOpen={mobileDrawerOpen}
          onMobileDrawerToggle={() => setMobileDrawerOpen(!mobileDrawerOpen)}
        /> */}
        <Main>
          {/* <Toolbar /> */}
          <Outlet
            context={{
              subscriptions: subscriptionsWithoutInternal,
              selected,
            }}
          />
        </Main>
      </Box>
    </AccountContext.Provider>
  );
};

const Main = (props) => (
  <Box
    id="main"
    component="main"
    sx={{
      display: "flex",
      flexGrow: 1,
      flexDirection: "column",
      padding: { xs: 0, md: 3 },
      width: "100%",
      height: "100dvh",
      overflow: "auto",
      backgroundColor: ({ palette }) => (palette.mode === "light" ? palette.grey[100] : palette.grey[900]),
    }}
  >
    {props.children}
  </Box>
);

const Loader = () => (
  <Backdrop
    open
    sx={{
      zIndex: 100000,
      backgroundColor: ({ palette }) => (palette.mode === "light" ? palette.grey[100] : palette.grey[900]),
    }}
  >
    <CircularProgress color="success" disableShrink />
  </Backdrop>
);

export default App;
