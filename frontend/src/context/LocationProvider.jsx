// Provides user location data globally
// Used for nearest-to-farthest locality logic and context switching

import React, { useState, useContext } from "react";
import { LocationContext } from "./LocationContext";
import { AuthContext } from "./AuthContext";

export function LocationProvider({ children }) {
  const { user } = useContext(AuthContext);

  // Active context - where user is currently "posting from"
  // Defaults to user's home locality
  const [activeContext, setActiveContext] = useState({
    locality: null, // Will be set from user's home locality
    city: null,
    state: null,
    isHomeLocality: true
  });

  // Switch to a different locality context
  const switchContext = (locality, city, state) => {
    setActiveContext({
      locality,
      city,
      state,
      isHomeLocality: locality === user?.locality
    });
  };

  // Reset back to home locality
  const resetToHome = () => {
    if (user) {
      setActiveContext({
        locality: user.locality,
        city: user.city,
        state: user.state,
        isHomeLocality: true
      });
    }
  };

  // Get current posting context
  const getPostingContext = () => {
    if (activeContext.locality) {
      return activeContext;
    }
    // Default to user's home if not set
    return {
      locality: user?.locality,
      city: user?.city,
      state: user?.state,
      isHomeLocality: true
    };
  };

  return (
    <LocationContext.Provider value={{
      activeContext,
      switchContext,
      resetToHome,
      getPostingContext
    }}>
      {children}
    </LocationContext.Provider>
  );
}
