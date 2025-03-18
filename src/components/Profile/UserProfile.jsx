
import { useState } from "react";
import { signOut, updateProfile } from "firebase/auth";
import { auth } from "../../firebase";
import { useAuthState } from "../../context/AuthContext";
import "./UserProfile.css";

export default function UserProfile() {
  const { user } = useAuthState();
  const [displayName, setDisplayName] = useState(user?.displayName || "");
  const [isEditing, setIsEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);
  
  const handleLogout = async () => {
    try {
      await signOut(auth);
    } catch (error) {
      console.error("Error signing out: ", error);
    }
  };
  
  const handleSaveProfile = async (e) => {
    e.preventDefault();
    setError(null);
    setSuccess(false);
    
    if (!displayName.trim()) {
      setError("Display name cannot be empty");
      return;
    }
    
    try {
      setSaving(true);
      await updateProfile(user, {
        displayName: displayName.trim()
      });
      setIsEditing(false);
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    } catch (err) {
      setError("Failed to update profile");
      console.error(err);
    } finally {
      setSaving(false);
    }
  };
  
  return (
    <div className="profile-container">
      <h1>Your Profile</h1>
      
      <div className="profile-card">
        <div className="profile-header">
          <div className="profile-avatar">
            {user?.photoURL ? (
              <img src={user.photoURL} alt="Profile" />
            ) : (
              <div className="avatar-placeholder">
                {user?.displayName ? user.displayName[0].toUpperCase() : 
                 user?.email ? user.email[0].toUpperCase() : '?'}
              </div>
            )}
          </div>
          
          <div className="profile-info">
            {isEditing ? (
              <form onSubmit={handleSaveProfile}>
                <input
                  type="text"
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                  placeholder="Display Name"
                  className="profile-name-input"
                />
                <div className="profile-actions">
                  <button type="submit" className="save-btn" disabled={saving}>
                    {saving ? "Saving..." : "Save"}
                  </button>
                  <button 
                    type="button" 
                    className="cancel-btn" 
                    onClick={() => {
                      setIsEditing(false);
                      setDisplayName(user?.displayName || "");
                    }}
                  >
                    Cancel
                  </button>
                </div>
              </form>
            ) : (
              <>
                <h2>{user?.displayName || user?.email?.split('@')[0]}</h2>
                <p className="user-email">{user?.email}</p>
                <div className="profile-actions">
                  <button onClick={() => setIsEditing(true)} className="edit-btn">
                    Edit Profile
                  </button>
                  <button onClick={handleLogout} className="logout-btn">
                    Logout
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
        
        {error && <div className="profile-error">{error}</div>}
        {success && <div className="profile-success">Profile updated successfully!</div>}
        
        <div className="profile-stats">
          <div className="stat-item">
            <h3>Account Created</h3>
            <p>{user?.metadata?.creationTime ? new Date(user.metadata.creationTime).toLocaleDateString() : "N/A"}</p>
          </div>
          <div className="stat-item">
            <h3>Last Login</h3>
            <p>{user?.metadata?.lastSignInTime ? new Date(user.metadata.lastSignInTime).toLocaleDateString() : "N/A"}</p>
          </div>
        </div>
      </div>
    </div>
  );
}
