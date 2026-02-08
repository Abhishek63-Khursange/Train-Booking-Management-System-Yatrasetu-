import React from 'react';

// SVG icons for different train classes
export const ClassIcons = {
  // Sleeper Class Icon
  SL: () => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" width="100%" height="100%">
      <rect x="10" y="20" width="80" height="60" rx="5" fill="#e6f2ff" stroke="#0066cc" strokeWidth="2" />
      <rect x="15" y="30" width="70" height="15" rx="2" fill="#99ccff" />
      <rect x="15" y="55" width="70" height="15" rx="2" fill="#99ccff" />
      <text x="50" y="85" fontSize="12" textAnchor="middle" fill="#0066cc" fontWeight="bold">Sleeper (SL)</text>
    </svg>
  ),
  
  // AC First Class Icon
  AC1: () => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" width="100%" height="100%">
      <rect x="10" y="20" width="80" height="60" rx="5" fill="#ffe6e6" stroke="#cc0000" strokeWidth="2" />
      <rect x="15" y="30" width="70" height="40" rx="2" fill="#ffb3b3" />
      <text x="50" y="55" fontSize="14" textAnchor="middle" fill="#800000" fontWeight="bold">AC</text>
      <text x="50" y="85" fontSize="12" textAnchor="middle" fill="#cc0000" fontWeight="bold">First Class (1A)</text>
    </svg>
  ),
  
  // AC 2 Tier Icon
  AC2: () => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" width="100%" height="100%">
      <rect x="10" y="20" width="80" height="60" rx="5" fill="#e6ffe6" stroke="#006600" strokeWidth="2" />
      <rect x="15" y="30" width="70" height="15" rx="2" fill="#b3ffb3" />
      <rect x="15" y="55" width="70" height="15" rx="2" fill="#b3ffb3" />
      <text x="50" y="85" fontSize="12" textAnchor="middle" fill="#006600" fontWeight="bold">AC 2 Tier (2A)</text>
    </svg>
  ),
  
  // AC 3 Tier Icon
  AC3: () => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" width="100%" height="100%">
      <rect x="10" y="20" width="80" height="60" rx="5" fill="#e6e6ff" stroke="#000066" strokeWidth="2" />
      <rect x="15" y="28" width="70" height="12" rx="2" fill="#b3b3ff" />
      <rect x="15" y="44" width="70" height="12" rx="2" fill="#b3b3ff" />
      <rect x="15" y="60" width="70" height="12" rx="2" fill="#b3b3ff" />
      <text x="50" y="85" fontSize="12" textAnchor="middle" fill="#000066" fontWeight="bold">AC 3 Tier (3A)</text>
    </svg>
  ),
  
  // AC Chair Car Icon
  CC: () => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" width="100%" height="100%">
      <rect x="10" y="20" width="80" height="60" rx="5" fill="#fff2e6" stroke="#cc6600" strokeWidth="2" />
      <rect x="25" y="30" width="50" height="40" rx="5" fill="#ffd9b3" />
      <rect x="35" y="35" width="30" height="15" rx="2" fill="#ffb366" />
      <text x="50" y="85" fontSize="12" textAnchor="middle" fill="#cc6600" fontWeight="bold">Chair Car (CC)</text>
    </svg>
  ),
  
  // First Class Icon
  FC: () => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" width="100%" height="100%">
      <rect x="10" y="20" width="80" height="60" rx="5" fill="#f2e6ff" stroke="#660066" strokeWidth="2" />
      <rect x="15" y="30" width="70" height="40" rx="2" fill="#d9b3ff" />
      <text x="50" y="55" fontSize="14" textAnchor="middle" fill="#4d004d" fontWeight="bold">FC</text>
      <text x="50" y="85" fontSize="12" textAnchor="middle" fill="#660066" fontWeight="bold">First Class (FC)</text>
    </svg>
  ),
  
  // Executive Class Icon
  EC: () => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" width="100%" height="100%">
      <rect x="10" y="20" width="80" height="60" rx="5" fill="#ffffcc" stroke="#999900" strokeWidth="2" />
      <rect x="20" y="30" width="60" height="40" rx="5" fill="#ffff99" />
      <rect x="30" y="35" width="40" height="15" rx="2" fill="#ffff66" />
      <text x="50" y="85" fontSize="12" textAnchor="middle" fill="#999900" fontWeight="bold">Executive (EC)</text>
    </svg>
  ),
  
  // General Class Icon
  GN: () => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" width="100%" height="100%">
      <rect x="10" y="20" width="80" height="60" rx="5" fill="#f2f2f2" stroke="#666666" strokeWidth="2" />
      <rect x="15" y="30" width="70" height="40" rx="2" fill="#d9d9d9" />
      <text x="50" y="55" fontSize="14" textAnchor="middle" fill="#4d4d4d" fontWeight="bold">GN</text>
      <text x="50" y="85" fontSize="12" textAnchor="middle" fill="#666666" fontWeight="bold">General (GN)</text>
    </svg>
  )
};

// Function to get icon by class type
export const getClassIcon = (classType) => {
  const IconComponent = ClassIcons[classType];
  if (IconComponent) {
    return <IconComponent />;
  }
  return null;
};