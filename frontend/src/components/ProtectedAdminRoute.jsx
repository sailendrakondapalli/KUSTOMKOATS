import { useEffect, useState } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import { supabase } from '../lib/supabase';
import toast from 'react-hot-toast';

const AdminLoader = () => (
  <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#111111' }}>
    <div className="text-center">
      <div className="w-12 h-12 mx-auto mb-4 rounded-full border-4 border-[#CA2A31] border-t-transparent animate-spin" />
      <p className="text-white text-sm">Verifying admin access...</p>
    </div>
  </div>
);

export default function ProtectedAdminRoute({ children }) {
  const { user, loading: authLoading } = useAuthStore();
  const [isAdmin, setIsAdmin] = useState(null);
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    const checkAdminAccess = async () => {
      if (!user) {
        setChecking(false);
        setIsAdmin(false);
        return;
      }

      try {
        // Check if user has admin role in user_metadata or app_metadata
        const isAdminUser = 
          user.user_metadata?.role === 'admin' || 
          user.app_metadata?.role === 'admin' ||
          user.email === 'sailendrakondapalli@gmail.com'; // Only this email has admin access

        // Optionally, verify against a database table
        // const { data, error } = await supabase
        //   .from('admin_users')
        //   .select('id')
        //   .eq('user_id', user.id)
        //   .single();

        if (isAdminUser) {
          setIsAdmin(true);
        } else {
          setIsAdmin(false);
          toast.error('Access denied. Admin privileges required.');
        }
      } catch (error) {
        console.error('Error checking admin access:', error);
        setIsAdmin(false);
        toast.error('Error verifying admin access');
      } finally {
        setChecking(false);
      }
    };

    checkAdminAccess();
  }, [user]);

  // Show loader while checking auth or admin status
  if (authLoading || checking) {
    return <AdminLoader />;
  }

  // Not logged in - redirect to login
  if (!user) {
    toast.error('Please login to access admin panel');
    return <Navigate to="/login" replace />;
  }

  // Logged in but not admin - redirect to home
  if (!isAdmin) {
    return <Navigate to="/" replace />;
  }

  // Admin verified - show admin content
  return children;
}
