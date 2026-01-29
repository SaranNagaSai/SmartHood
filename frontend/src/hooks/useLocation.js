// Fetches user geolocation from browser
// Used for nearest locality calculation

export default function useLocation() {
  const getLocation = () => navigator.geolocation.getCurrentPosition(() => {});
  return { getLocation };
}
