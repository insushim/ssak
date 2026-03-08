import { useState, useEffect } from "react";
import { useAuth } from "../App";
import {
  LogOut,
  Users,
  CheckCircle,
  XCircle,
  Shield,
  ChevronDown,
} from "lucide-react";
import { api } from "../lib/api";
import { formatDate } from "../lib/utils";

export default function AdminDashboard() {
  const { user, logout } = useAuth();
  const [teachers, setTeachers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api
      .getTeachers()
      .then(({ teachers: t }) => setTeachers(t))
      .finally(() => setLoading(false));
  }, []);

  const handleApprove = async (teacherId: string) => {
    try {
      await api.approveTeacher(teacherId);
      setTeachers((prev) =>
        prev.map((t) => (t.id === teacherId ? { ...t, approved: 1 } : t)),
      );
    } catch (err: any) {
      alert(err.message);
    }
  };

  if (loading)
    return (
      <div className="page-container flex items-center justify-center">
        <div className="text-4xl animate-bounce-slow">🌱</div>
      </div>
    );

  const pending = teachers.filter((t) => !t.approved);
  const approved = teachers.filter((t) => t.approved);

  return (
    <div className="page-container">
      <header className="bg-white dark:bg-gray-800 border-b border-gray-100 dark:border-gray-700 px-4 py-3">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Shield className="w-6 h-6 text-ssak-600" />
            <div>
              <h1 className="font-bold text-gray-900 dark:text-white">
                관리자
              </h1>
              <p className="text-xs text-gray-500">{user?.name}</p>
            </div>
          </div>
          <button
            onClick={logout}
            className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700"
          >
            <LogOut size={20} className="text-gray-600" />
          </button>
        </div>
      </header>

      <div className="content-container space-y-6">
        {/* Pending Teachers */}
        {pending.length > 0 && (
          <div>
            <h2 className="section-title flex items-center gap-2">
              <Users size={16} /> 승인 대기 ({pending.length})
            </h2>
            <div className="space-y-2">
              {pending.map((t) => (
                <div
                  key={t.id}
                  className="card flex items-center justify-between"
                >
                  <div>
                    <p className="font-medium">{t.name}</p>
                    <p className="text-xs text-gray-400">
                      {t.email} · {formatDate(t.created_at)}
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleApprove(t.id)}
                      className="p-2 rounded-lg bg-green-100 hover:bg-green-200 text-green-600"
                    >
                      <CheckCircle size={18} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Approved Teachers */}
        <div>
          <h2 className="section-title">승인된 교사 ({approved.length})</h2>
          <div className="space-y-2">
            {approved.map((t) => (
              <div
                key={t.id}
                className="card flex items-center justify-between"
              >
                <div>
                  <p className="font-medium">{t.name}</p>
                  <p className="text-xs text-gray-400">{t.email}</p>
                </div>
                <span className="badge-green">승인됨</span>
              </div>
            ))}
            {approved.length === 0 && (
              <p className="text-sm text-gray-400 text-center py-4">
                아직 승인된 교사가 없습니다.
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
