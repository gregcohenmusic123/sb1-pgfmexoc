import React, { useState } from "react";
import { BrowserRouter, Routes, Route, useRoutes } from "react-router-dom";
import { DynamicContextProvider } from "@dynamic-labs/sdk-react-core";
import { Toaster } from "react-hot-toast";
import { dynamicConfig } from "./lib/dynamic";
import { AuthProvider } from "./contexts/AuthContext";
import { SearchProvider } from "./contexts/SearchContext";
import { PlayerProvider } from "./contexts/PlayerContext";
import { ModalProvider } from "./contexts/ModalContext";
import { AnimatePresence } from "framer-motion";
import ProtectedRoute from "./components/ProtectedRoute";
import SplashScreen from "./components/SplashScreen/SplashScreen";
import MainLayout from "./components/Layout/MainLayout";
import HomePage from "./pages/HomePage";
import TopTracks from "./pages/TopTracks";
import MerchPage from "./pages/MerchPage";
import EventsPage from "./pages/EventsPage";
import ArtistProfile from "./pages/ArtistProfile";
import ProfilePage from "./pages/ProfilePage";
import AuthPage from "./pages/AuthPage";
import AuthCallback from "./pages/AuthCallback";
import PasswordReset from "./components/Auth/PasswordReset";
import MarketplacePage from "./pages/MarketplacePage";
import TradingTerminal from "./pages/TradingTerminal";
import NotificationsPage from "./pages/NotificationsPage";
// Import tempo routes
import routes from "tempo-routes";

export default function App() {
  const [showSplash, setShowSplash] = useState<boolean>(true);
  const [splashComplete, setSplashComplete] = useState<boolean>(false);

  const handleSplashComplete = () => {
    setShowSplash(false);
    setSplashComplete(true);
  };

  return (
    <BrowserRouter>
      <DynamicContextProvider settings={dynamicConfig}>
        <AuthProvider>
          <SearchProvider>
            <PlayerProvider>
              <ModalProvider>
                <AnimatePresence mode="wait">
                  {showSplash && (
                    <SplashScreen onComplete={handleSplashComplete} />
                  )}
                </AnimatePresence>

                {splashComplete && (
                  <>
                    <Routes>
                      {/* For the tempo routes */}
                      {import.meta.env.VITE_TEMPO &&
                        routes.map((route, index) => (
                          <Route
                            key={index}
                            path={route.path}
                            element={route.element}
                          />
                        ))}
                      <Route path="/auth" element={<AuthPage />} />
                      <Route path="/auth/callback" element={<AuthCallback />} />
                      <Route
                        path="/auth/reset-password"
                        element={<PasswordReset />}
                      />
                      <Route
                        path="/*"
                        element={
                          <ProtectedRoute>
                            <MainLayout>
                              <Routes>
                                <Route path="/" element={<HomePage />} />
                                <Route
                                  path="/top-tracks"
                                  element={<TopTracks />}
                                />
                                <Route
                                  path="/notifications"
                                  element={<NotificationsPage />}
                                />
                                <Route
                                  path="/marketplace"
                                  element={<MarketplacePage />}
                                />
                                <Route
                                  path="/terminal"
                                  element={<TradingTerminal />}
                                />
                                <Route path="/merch" element={<MerchPage />} />
                                <Route
                                  path="/events"
                                  element={<EventsPage />}
                                />
                                <Route
                                  path="/artist/:id"
                                  element={<ArtistProfile />}
                                />
                                <Route
                                  path="/profile"
                                  element={<ProfilePage />}
                                />
                                {/* Add this before any catchall route */}
                                {import.meta.env.VITE_TEMPO && (
                                  <Route path="/tempobook/*" />
                                )}
                              </Routes>
                            </MainLayout>
                          </ProtectedRoute>
                        }
                      />
                    </Routes>
                  </>
                )}
              </ModalProvider>
              <Toaster position="top-right" />
            </PlayerProvider>
          </SearchProvider>
        </AuthProvider>
      </DynamicContextProvider>
    </BrowserRouter>
  );
}
