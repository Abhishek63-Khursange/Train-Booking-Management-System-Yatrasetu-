const getCoachTypeName = (type) => {
  const typeMap = {
    AC_CHAIR_CAR: 'AC Chair Car',
    AC_EXECUTIVE_CHAIR_CAR: 'AC Executive Chair Car',
    SLEEPER: 'Sleeper',
    SECOND_SITTING: 'Second Sitting',
    AC_FIRST_CLASS: 'AC First Class',
    AC_2_TIER: 'AC 2 Tier',
    AC_3_TIER: 'AC 3 Tier',
    AC_3_TIER_ECONOMY: 'AC 3 Tier Economy',
  };
  return typeMap[type] || type.replace(/_/g, ' ');
};

export default getCoachTypeName;
