import React from 'react';
import './BilingView.css';

const ViewBiling = () => {
    const user = {
        username: 'mani',
        referralCode: 'X5PHAN',
        planName: 'N/A',
        planType: 'N/A',
        trialStart: 'Sep 4, 2025, 05:37:43 PM',
        trialEnd: 'Sep 14, 2025, 05:37:43 PM',
        subscriptionStart: 'N/A',
        subscriptionEnd: 'N/A',
        joiningDate: 'Sep 4, 2025, 05:37:43 PM',
        status: 'Active',
        keywords: 'No Keywords',
        mobile: 'N/A',
        ip: '152.59.201.35'
    };

    const referrals = [
        { name: 'Alice Brown', date: '2024-02-01' },
        { name: 'Bob Wilson', date: '2024-02-15' },
        { name: 'Carol Davis', date: '2024-03-01' },
        { name: 'David Miller', date: '2024-03-10' }
    ];

    return (
        <div className="userpage-container">
            <div className="userpage-actions">
                <button className="btn btn-outline">Go to All Users</button>
                <button className="btn btn-primary">User Invoices</button>
            </div>

            <div className="userpage-grid">
                <div className="card profile-card">
                    <div className="card-header dark">
                        <h3>User Profile</h3>
                    </div>
                    <div className="card-body profile-body">
                        <div className="profile-row"><div className="label">User Name:</div><div className="value">{user.username}</div></div>
                        <div className="profile-row"><div className="label">Referral Code:</div><div className="value">{user.referralCode}</div></div>
                        <div className="profile-row"><div className="label">Plan Name:</div><div className="value">{user.planName}</div></div>
                        <div className="profile-row"><div className="label">Plan Type:</div><div className="value">{user.planType}</div></div>
                        <div className="profile-row"><div className="label">Trial Start Date:</div><div className="value">{user.trialStart}</div></div>
                        <div className="profile-row"><div className="label">Trial End Date:</div><div className="value">{user.trialEnd}</div></div>
                        <div className="profile-row"><div className="label">Current Subscription Start Date:</div><div className="value">{user.subscriptionStart}</div></div>
                        <div className="profile-row"><div className="label">Current Subscription End Date:</div><div className="value">{user.subscriptionEnd}</div></div>
                        <div className="profile-row"><div className="label">Joining Date:</div><div className="value">{user.joiningDate}</div></div>
                        <div className="profile-row"><div className="label">Status:</div><div className="value">{user.status}</div></div>
                        <div className="profile-row"><div className="label">Keywords:</div><div className="value">{user.keywords}</div></div>
                        <div className="profile-row"><div className="label">Mobile Number:</div><div className="value">{user.mobile}</div></div>
                        <div className="profile-row"><div className="label">IP Address:</div><div className="value">{user.ip}</div></div>
                    </div>
                </div>

                <div className="card referrals-card">
                    <div className="card-header green">
                        <h3>Referrals ({referrals.length})</h3>
                    </div>
                    <div className="card-body referrals-body">
                        <ul>
                            {referrals.map((r, idx) => (
                                <li key={idx} className="referral-row">
                                    <span className="ref-name">{r.name}</span>
                                    <span className="ref-date">{r.date}</span>
                                </li>
                            ))}
                        </ul>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ViewBiling;
