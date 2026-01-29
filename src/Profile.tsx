import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from './contexts/AuthContext';
import { supabase } from './lib/supabaseClient';
import {
  User,
  Mail,
  Shield,
  LogOut,
  Trash2,
  AlertTriangle,
  Calendar,
  Clock,
  Hash,
  LayoutDashboard
} from 'lucide-react';
import { useLanguage } from './contexts/LanguageContext';

function Profile() {
  const { t } = useLanguage();
  const { user, loading, signOut } = useAuth();
  const navigate = useNavigate();
  const [profile, setProfile] = useState<any>(null);
  const [profileLoading, setProfileLoading] = useState(true);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [deleteError, setDeleteError] = useState('');

  useEffect(() => {
    // Redirect to home if not logged in
    if (!loading && !user) {
      navigate('/');
    }
  }, [user, loading, navigate]);

  useEffect(() => {
    // Fetch profile data from Supabase
    const fetchProfile = async () => {
      if (user) {
        try {
          const { data, error } = await supabase
            .from('profiles')
            .select('avatar_url, role')
            .eq('id', user.id)
            .single();

          if (error) {
            console.error('Error fetching profile:', error);
          } else {
            setProfile(data);
          }
        } catch (error) {
          console.error('Error:', error);
        } finally {
          setProfileLoading(false);
        }
      }
    };

    fetchProfile();
  }, [user]);

  const handleLogout = async () => {
    await signOut();
    navigate('/');
  };

  const handleDeleteAccount = async () => {
    setDeleteError('');
    setDeleteLoading(true);

    try {
      // Delete the user account from Supabase Auth
      const { error } = await supabase
        .rpc('delete_user_account', { user_id: user.id });

      if (error) {
        console.error('Error deleting account:', error);
        setDeleteError(t('login.errorGeneric'));
        setDeleteLoading(false);
        return;
      }

      // Sign out and redirect
      await signOut();
      navigate('/');
    } catch (error) {
      console.error('Error deleting account:', error);
      setDeleteError(t('login.errorGeneric'));
      setDeleteLoading(false);
    }
  };

  if (loading || profileLoading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="w-10 h-10 border-4 border-slate-200 border-t-[#34aa56] rounded-full animate-spin" />
      </div>
    );
  }

  if (!user) {
    return null;
  }

  const avatarUrl = profile?.avatar_url || user.user_metadata?.avatar_url;
  const isAdmin = profile?.role === 'admin';

  return (
    <div className="min-h-screen bg-slate-50 pt-32 pb-24 font-sans text-slate-900 selection:bg-[#34aa56] selection:text-white">
      <div className="container mx-auto px-4 max-w-5xl">

        {/* Header Section */}
        <div className="flex flex-col md:flex-row items-center gap-8 mb-12">
          <div className="relative">
            <div className="w-32 h-32 md:w-40 md:h-40 rounded-full bg-white p-2 shadow-xl shadow-slate-200/50">
              {avatarUrl ? (
                <img
                  src={avatarUrl}
                  alt="Profile"
                  className="w-full h-full rounded-full object-cover border border-slate-100"
                />
              ) : (
                <div className="w-full h-full rounded-full bg-slate-100 flex items-center justify-center text-4xl font-bold text-slate-400">
                  {user.email?.charAt(0).toUpperCase()}
                </div>
              )}
            </div>
            {isAdmin && (
              <div className="absolute -bottom-2 -right-2 bg-slate-900 text-white px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider flex items-center gap-2 shadow-lg border-2 border-white">
                <Shield size={12} />
                Admin
              </div>
            )}
          </div>

          <div className="text-center md:text-left">
            <h1 className="text-3xl md:text-4xl font-extrabold text-slate-900 mb-2">
              {t('profile.greeting')}, {user.user_metadata?.full_name?.split(' ')[0] || 'Felhasználó'}!
            </h1>
            <p className="text-slate-500 font-medium">
              {t('profile.subtitle')}
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

          {/* Main Info Column */}
          <div className="lg:col-span-2 space-y-8">
            <div className="bg-white rounded-[2rem] p-8 shadow-xl shadow-slate-200/50 border border-slate-200">
              <div className="flex items-center gap-3 mb-8">
                <div className="w-10 h-10 bg-slate-100 rounded-xl flex items-center justify-center">
                  <User className="text-slate-600 w-5 h-5" />
                </div>
                <h2 className="text-xl font-bold text-slate-900">{t('profile.accountInfo')}</h2>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

                {user.user_metadata?.full_name && (
                  <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100">
                    <div className="flex items-center gap-3 mb-2">
                      <User size={16} className="text-slate-400" />
                      <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">{t('profile.fullName')}</span>
                    </div>
                    <div className="font-semibold text-slate-900">{user.user_metadata.full_name}</div>
                  </div>
                )}

                <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100">
                  <div className="flex items-center gap-3 mb-2">
                    <Mail size={16} className="text-slate-400" />
                    <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">{t('profile.email')}</span>
                  </div>
                  <div className="font-semibold text-slate-900 break-all">{user.email}</div>
                </div>

                {user.app_metadata?.provider && (
                  <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100">
                    <div className="flex items-center gap-3 mb-2">
                      <Shield size={16} className="text-slate-400" />
                      <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">{t('profile.loginMethod')}</span>
                    </div>
                    <div className="flex items-center gap-2 font-semibold text-slate-900">
                      {user.app_metadata.provider === 'google' ? (
                        <>
                          <svg className="w-4 h-4" viewBox="0 0 24 24"><path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" /><path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" /><path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" /><path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" /></svg>
                          Google
                        </>
                      ) : (
                        <>
                          <Mail size={16} className="text-slate-500" />
                          Email / Password
                        </>
                      )}
                    </div>
                  </div>
                )}

                <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100">
                  <div className="flex items-center gap-3 mb-2">
                    <Calendar size={16} className="text-slate-400" />
                    <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">{t('profile.registration')}</span>
                  </div>
                  <div className="font-semibold text-slate-900">
                    {new Date(user.created_at).toLocaleDateString('hu-HU', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                    })}
                  </div>
                </div>

                <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100">
                  <div className="flex items-center gap-3 mb-2">
                    <Clock size={16} className="text-slate-400" />
                    <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">{t('profile.lastLogin')}</span>
                  </div>
                  <div className="font-semibold text-slate-900">
                    {new Date(user.last_sign_in_at).toLocaleDateString('hu-HU', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </div>
                </div>

                <div className="md:col-span-2 p-4 rounded-2xl bg-slate-50 border border-slate-100">
                  <div className="flex items-center gap-3 mb-2">
                    <Hash size={16} className="text-slate-400" />
                    <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">ID</span>
                  </div>
                  <div className="font-mono text-sm text-slate-500 bg-white p-2 rounded border border-slate-200 select-all">
                    {user.id}
                  </div>
                </div>

              </div>
            </div>
          </div>

          {/* Actions Column */}
          <div className="space-y-6">

            {/* Action Card */}
            <div className="bg-white rounded-[2rem] p-6 shadow-xl shadow-slate-200/50 border border-slate-200">
              <h3 className="text-lg font-bold text-slate-900 mb-6">{t('profile.actions')}</h3>

              <div className="space-y-3">
                {isAdmin && (
                  <button
                    onClick={() => navigate('/admin')}
                    className="w-full flex items-center gap-3 p-4 rounded-xl bg-slate-50 hover:bg-slate-100 text-slate-900 font-bold transition-colors text-left group"
                  >
                    <div className="w-10 h-10 bg-white rounded-lg flex items-center justify-center shadow-sm border border-slate-200 group-hover:border-[#34aa56]/30 transition-colors">
                      <LayoutDashboard size={20} className="text-[#34aa56]" />
                    </div>
                    <span>{t('profile.adminPanel')}</span>
                  </button>
                )}

                <button
                  onClick={handleLogout}
                  className="w-full flex items-center gap-3 p-4 rounded-xl bg-slate-50 hover:bg-slate-100 text-slate-900 font-bold transition-colors text-left group"
                >
                  <div className="w-10 h-10 bg-white rounded-lg flex items-center justify-center shadow-sm border border-slate-200 group-hover:border-slate-300 transition-colors">
                    <LogOut size={20} className="text-slate-600" />
                  </div>
                  <span>{t('profile.logout')}</span>
                </button>
              </div>
            </div>

            {/* Danger Zone */}
            <div className="bg-red-50/50 rounded-[2rem] p-6 border border-red-100">
              <div className="flex items-center gap-2 mb-4 text-red-900">
                <AlertTriangle size={20} className="text-red-500" />
                <h3 className="font-bold">{t('profile.dangerZone')}</h3>
              </div>

              <p className="text-sm text-red-700/80 mb-6 leading-relaxed">
                {t('profile.deleteDesc')}
              </p>

              <button
                onClick={() => setShowDeleteModal(true)}
                className="w-full flex items-center justify-center gap-2 p-3 rounded-xl border-2 border-red-200 text-red-600 font-bold hover:bg-red-50 hover:border-red-300 transition-colors"
              >
                <Trash2 size={18} />
                {t('profile.deleteAccount')}
              </button>
            </div>

          </div>
        </div>

      </div>

      {/* Delete Account Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm" onClick={() => setShowDeleteModal(false)}>
          <div
            className="w-full max-w-lg bg-white rounded-[2rem] shadow-2xl p-8 animate-in fade-in zoom-in-95 duration-200"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-center w-16 h-16 bg-red-50 rounded-full mx-auto mb-6">
              <AlertTriangle className="w-8 h-8 text-red-500" />
            </div>

            <h2 className="text-2xl font-bold text-slate-900 text-center mb-4">
              {t('profile.deleteModalTitle')}
            </h2>

            <div className="bg-red-50 rounded-xl p-4 mb-6 border border-red-100">
              <p className="text-red-800 font-medium mb-2">{t('profile.deleteModalWarning')}</p>
              <ul className="text-sm text-red-700 space-y-1 list-disc list-inside">
                <li>Profilinformációk végleges törlése</li>
                <li>Bejelentkezési adatok eltávolítása</li>
                <li>Elmentett beállitások elvesztése</li>
              </ul>
            </div>

            <p className="text-center text-slate-500 mb-8">
              {t('profile.deleteModalConfirm')}
            </p>

            {deleteError && (
              <div className="mb-6 p-3 rounded-lg bg-red-100 text-red-700 text-sm font-medium text-center">
                {deleteError}
              </div>
            )}

            <div className="grid grid-cols-2 gap-4">
              <button
                onClick={() => setShowDeleteModal(false)}
                disabled={deleteLoading}
                className="py-3 px-4 rounded-xl font-bold text-slate-700 bg-slate-100 hover:bg-slate-200 transition-colors"
              >
                {t('profile.cancel')}
              </button>
              <button
                onClick={handleDeleteAccount}
                disabled={deleteLoading}
                className="py-3 px-4 rounded-xl font-bold text-white bg-red-500 hover:bg-red-600 shadow-lg shadow-red-500/20 transition-all hover:scale-[1.02] active:scale-[0.98]"
              >
                {deleteLoading ? t('profile.deleting') : t('profile.verify')}
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
}

export default Profile;
