import React, { createContext, useContext, useEffect, useState } from "react";
import { supabase, TABLES, getSiteUrl } from "../lib/supabase";
import toast from "react-hot-toast";

const AuthContext = createContext({});

export const useAuth = () => {
  return useContext(AuthContext);
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [userProfile, setUserProfile] = useState(null);

  useEffect(() => {
    // Get initial session
    const getSession = async () => {
      console.log("[DEBUG] Calling getSession...");
      try {
        const {
          data: { session },
        } = await supabase.auth.getSession();
        console.log("[DEBUG] getSession result:", session);
        setUser(session?.user ?? null);
        if (session?.user) {
          console.log("[DEBUG] Session user found, fetching profile...");
          await fetchUserProfile(session.user.id, session.user);
        } else {
          console.log("[DEBUG] No session user, setting userProfile to null");
          setUserProfile(null);
        }
      } catch (err) {
        console.log("[DEBUG] getSession error:", err);
        setUser(null);
        setUserProfile(null);
      } finally {
        setLoading(false);
        console.log(
          "[DEBUG] AuthContext loading set to false (getSession finally), user:",
          user,
          "userProfile:",
          userProfile
        );
      }
    };
    getSession();
    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      console.log("[DEBUG] Auth state changed:", event, session);
      try {
        setUser(session?.user ?? null);
        if (session?.user) {
          console.log(
            "[DEBUG] Auth change: session user found, fetching profile..."
          );
          await fetchUserProfile(session.user.id, session.user);
        } else {
          console.log(
            "[DEBUG] Auth change: no session user, setting userProfile to null"
          );
          setUserProfile(null);
        }
      } catch (err) {
        console.log("[DEBUG] Auth state change error:", err);
        setUser(null);
        setUserProfile(null);
      } finally {
        setLoading(false);
        console.log(
          "[DEBUG] AuthContext loading set to false (auth change finally), user:",
          user,
          "userProfile:",
          userProfile
        );
      }
    });
    return () => subscription.unsubscribe();
  }, []);

  // Robust profile fetch: create row if missing, handle RLS errors
  const fetchUserProfile = async (userId, userObj) => {
    try {
      console.log("[DEBUG] fetchUserProfile called for userId:", userId);
      const { data, error } = await supabase
        .from(TABLES.USERS)
        .select("*")
        .eq("id", userId)
        .single();
      console.log("[DEBUG] fetchUserProfile result:", { data, error });

      if (error) {
        // If row not found, try to create it
        if (error.code === "PGRST116" || error.message?.includes("No rows")) {
          console.log(
            "[DEBUG] No user row found, attempting to create user row..."
          );
          const { error: insertError } = await supabase
            .from(TABLES.USERS)
            .insert([
              {
                id: userId,
                email: userObj?.email,
                name: userObj?.user_metadata?.name || "",
              },
            ]);
          if (insertError) {
            alert("Could not create user profile. Please contact support.");
            console.log(
              "[DEBUG] Profile fetch error (insertError):",
              insertError
            );
            setUserProfile(null);
            setLoading(false);
            await signOut();
            return;
          }
          // Try fetching again
          return await fetchUserProfile(userId, userObj);
        } else {
          alert("Error fetching user profile. Logging out.");
          console.log("[DEBUG] Profile fetch error:", error);
          setUserProfile(null);
          setLoading(false);
          await signOut();
          return;
        }
      }

      if (!data) {
        setUserProfile(null);
        alert("Error fetching user profile. Logging out.");
        await signOut();
        return;
      }

      // Map isadmin to isAdmin for consistency in JS
      setUserProfile({
        ...data,
        isAdmin: data.isadmin === true || data.isadmin === "true",
      });
      console.log("[DEBUG] userProfile set:", {
        ...data,
        isAdmin: data.isadmin === true || data.isadmin === "true",
      });
    } catch (error) {
      alert("Error fetching user profile. Logging out.");
      console.log("[DEBUG] Profile fetch error (catch):", error);
      setUserProfile(null);
      setLoading(false);
      await signOut();
    }
  };

  const signUp = async (email, password, name) => {
    try {
      // Use emailRedirectTo to ensure email confirmation links redirect to the deployed site
      // instead of localhost. This fixes the issue where users get redirected to localhost
      // when clicking email confirmation links.
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            name: name,
          },
          emailRedirectTo: `${getSiteUrl()}/dashboard`,
        },
      });

      if (error) throw error;

      // Create user profile
      if (data.user) {
        const { error: profileError } = await supabase
          .from(TABLES.USERS)
          .insert([
            {
              id: data.user.id,
              name: name,
              email: email,
              points: 100, // Starting points
              isAdmin: false,
            },
          ]);

        if (profileError) {
          console.error("Error creating user profile:", profileError);
        }
      }

      return { data, error: null };
    } catch (error) {
      return { data: null, error };
    }
  };

  const signIn = async (email, password) => {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) throw error;

      return { data, error: null };
    } catch (error) {
      return { data: null, error };
    }
  };

  // Robust signOut: always clear state, alert on error
  const signOut = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      setUser(null);
      setUserProfile(null);
      if (error) {
        toast.error("Error signing out. Forcing logout.");
      } else {
        toast.success("Signed out successfully.");
      }
    } catch (error) {
      setUser(null);
      setUserProfile(null);
      toast.error("Error signing out. Forcing logout.");
    } finally {
      window.location.href = "/login";
    }
  };

  const updateProfile = async (updates) => {
    try {
      const { error } = await supabase
        .from(TABLES.USERS)
        .update(updates)
        .eq("id", user.id);

      if (error) throw error;

      // Refresh user profile
      await fetchUserProfile(user.id, user);

      return { error: null };
    } catch (error) {
      return { error };
    }
  };

  const value = {
    user,
    userProfile,
    loading,
    signUp,
    signIn,
    signOut,
    updateProfile,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
