import { useEffect, useState } from 'react';
import '../style/profile.css';

export default function Profile() {
    const [userData, setUserData] = useState(null);
    useEffect(() => {
        getProfile();
    }, []);

    const getProfile = async () => {
        let result = await fetch('http://localhost:3200/profile', {
            credentials: 'include'
        });
        result = await result.json();
        if (result.success) {
            setUserData(result.result);
        } else {
            alert("Unable to fetch profile");
        }
    };

    return (
        <div className="profile-container">
            <div className="profile-card">
                <div className="profile-avatar">
                    {userData?.name?.charAt(0).toUpperCase() ||
                        userData?.email?.charAt(0).toUpperCase()}
                </div>
                <h1>My Profile</h1>
                <p className="profile-subtitle">Your account information</p>
                {userData ? (
                    <div className="profile-details">
                        <div className="profile-field">
                            <label>Full Name</label>
                            <p>{userData.name || "Not available"}</p>
                        </div>

                        <div className="profile-field">
                            <label>Email Address</label>
                            <p>{userData.email}</p>
                        </div>

                        <div className="profile-field">
                            <label>Account Status</label>
                            <p>Active</p>
                        </div>
                    </div>
                ) : (
                    <p>Loading profile...</p>
                )}
            </div>
        </div>
    );
}