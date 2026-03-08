import {
  useState,
  useEffect,
  createContext,
  useContext,
  useCallback,
} from "react";
import { Routes, Route, Navigate, useNavigate } from "react-router-dom";
import type { User } from "./types";
import { api } from "./lib/api";
import Landing from "./pages/Landing";
import Login from "./pages/Login";
import Register from "./pages/Register";
import StudentDashboard from "./pages/StudentDashboard";
import WritingPage from "./pages/WritingPage";
import WritingResult from "./pages/WritingResult";
import MyStats from "./pages/MyStats";
import TeacherDashboard from "./pages/TeacherDashboard";
import AdminDashboard from "./pages/AdminDashboard";

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (data: any) => Promise<void>;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
  updateUser: (data: Partial<User>) => Promise<void>;
}

export const AuthContext = createContext<AuthContextType>({
  user: null,
  loading: true,
  login: async () => {},
  register: async () => {},
  logout: async () => {},
  refreshUser: async () => {},
  updateUser: async () => {},
});

export const useAuth = () => useContext(AuthContext);

function App() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  const refreshUser = useCallback(async () => {
    try {
      const { user: u } = await api.getMe();
      setUser(u);
    } catch {
      setUser(null);
    }
  }, []);

  useEffect(() => {
    refreshUser().finally(() => setLoading(false));
  }, [refreshUser]);

  const login = async (email: string, password: string) => {
    const { user: u } = await api.login({ email, password });
    setUser(u);
    if (u.role === "teacher") navigate("/teacher");
    else if (u.role === "super_admin") navigate("/admin");
    else navigate("/dashboard");
  };

  const register = async (data: any) => {
    const { user: u } = await api.register(data);
    setUser(u);
    if (u.role === "teacher") navigate("/teacher");
    else navigate("/dashboard");
  };

  const logout = async () => {
    await api.logout();
    setUser(null);
    navigate("/");
  };

  const updateUser = async (data: Partial<User>) => {
    const { user: u } = await api.updateUser(data);
    setUser(u);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <div className="text-center">
          <div className="text-5xl mb-4 animate-bounce-slow">🌱</div>
          <p className="text-gray-500 dark:text-gray-400">로딩 중...</p>
        </div>
      </div>
    );
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        login,
        register,
        logout,
        refreshUser,
        updateUser,
      }}
    >
      <Routes>
        <Route
          path="/"
          element={
            user ? (
              <Navigate
                to={
                  user.role === "teacher"
                    ? "/teacher"
                    : user.role === "super_admin"
                      ? "/admin"
                      : "/dashboard"
                }
              />
            ) : (
              <Landing />
            )
          }
        />
        <Route
          path="/login"
          element={user ? <Navigate to="/dashboard" /> : <Login />}
        />
        <Route
          path="/register"
          element={user ? <Navigate to="/dashboard" /> : <Register />}
        />
        <Route
          path="/dashboard"
          element={
            user?.role === "student" ? (
              <StudentDashboard />
            ) : (
              <Navigate to="/login" />
            )
          }
        />
        <Route
          path="/write"
          element={
            user?.role === "student" ? (
              <WritingPage />
            ) : (
              <Navigate to="/login" />
            )
          }
        />
        <Route
          path="/write/:assignmentId"
          element={
            user?.role === "student" ? (
              <WritingPage />
            ) : (
              <Navigate to="/login" />
            )
          }
        />
        <Route
          path="/result/:writingId"
          element={user ? <WritingResult /> : <Navigate to="/login" />}
        />
        <Route
          path="/stats"
          element={user ? <MyStats /> : <Navigate to="/login" />}
        />
        <Route
          path="/teacher"
          element={
            user?.role === "teacher" || user?.role === "super_admin" ? (
              <TeacherDashboard />
            ) : (
              <Navigate to="/login" />
            )
          }
        />
        <Route
          path="/admin"
          element={
            user?.role === "super_admin" ? (
              <AdminDashboard />
            ) : (
              <Navigate to="/login" />
            )
          }
        />
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </AuthContext.Provider>
  );
}

export default App;
