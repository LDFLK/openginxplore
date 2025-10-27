import { createContext, useContext, useState } from "react";

const BadgeContext = createContext();

export const BadgeProvider = ({ children }) => {
  const [showMinistryBadge, setShowMinistryBadge] = useState(true);
  const [showPersonBadge, setShowPersonBadge] = useState(true);

  return (
    <BadgeContext.Provider
      value={{
        showMinistryBadge,
        setShowMinistryBadge,
        showPersonBadge,
        setShowPersonBadge,
      }}
    >
      {children}
    </BadgeContext.Provider>
  );
};

export const useBadgeContext = () => useContext(BadgeContext);
