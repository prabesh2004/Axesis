import { Navigate, useLocation } from "react-router-dom";
import { env } from "@/lib/env";
import { getAuthToken } from "@/services/authToken";

type RequireAuthProps = {
  children: React.ReactNode;
};

export default function RequireAuth({ children }: RequireAuthProps) {
  const location = useLocation();

  // In mock mode, we keep the app accessible for demo/dev.
  const isAuthed = env.useMockApi ? true : Boolean(getAuthToken());

  if (!isAuthed) {
    return <Navigate to="/login" replace state={{ from: location.pathname }} />;
  }

  return <>{children}</>;
}
