import React, { useState, useEffect } from 'react';
import { teamAPI } from '../services/api';
import '../styles/Team.css';

function Team() {
  const [teams, setTeams] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [showJoinForm, setShowJoinForm] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    isPublic: false,
  });
  const [joinCode, setJoinCode] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    fetchTeams();
  }, []);

  const fetchTeams = async () => {
    try {
      setLoading(true);
      const response = await teamAPI.getAll();
      setTeams(response.data.data);
    } catch (err) {
      setError('Failed to load teams');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateTeam = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!formData.name.trim()) {
      setError('Team name is required');
      return;
    }

    try {
      const response = await teamAPI.create(formData);
      setTeams([response.data.data, ...teams]);
      setFormData({ name: '', description: '', isPublic: false });
      setShowCreateForm(false);
      setSuccess('Team created successfully!');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to create team');
    }
  };

  const handleJoinTeam = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!joinCode.trim()) {
      setError('Invite code is required');
      return;
    }

    try {
      const response = await teamAPI.join(joinCode);
      setTeams([response.data.data, ...teams]);
      setJoinCode('');
      setShowJoinForm(false);
      setSuccess('Joined team successfully!');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to join team');
    }
  };

  const handleDeleteTeam = async (teamId) => {
    if (window.confirm('Are you sure you want to delete this team?')) {
        try {
        await teamAPI.delete(teamId);
        setTeams(teams.filter((t) => t._id !== teamId));
        setSuccess('Team deleted successfully');
      } catch (err) {
        setError(err.response?.data?.message || 'Failed to delete team');
      }
    }
  };

  if (loading) {
    return (
      <div className="team-container">
        <div className="loading">Loading teams...</div>
      </div>
    );
  }

  return (
    <div className="team-container">
      <div className="team-header">
        <h1>Team Collaboration</h1>
        <p>Create or join teams to collaborate on tasks</p>
      </div>

      {error && <div className="alert alert-error">{error}</div>}
      {success && <div className="alert alert-success">{success}</div>}

      <div className="team-actions">
        <button
          className="btn btn-primary"
          onClick={() => setShowCreateForm(!showCreateForm)}
        >
          {showCreateForm ? 'Cancel' : '+ Create Team'}
        </button>
        <button
          className="btn btn-secondary"
          onClick={() => setShowJoinForm(!showJoinForm)}
        >
          {showJoinForm ? 'Cancel' : '+ Join Team'}
        </button>
      </div>

      {showCreateForm && (
        <div className="form-card">
          <h2>Create New Team</h2>
          <form onSubmit={handleCreateTeam}>
            <div className="form-group">
              <label>Team Name *</label>
              <input
                type="text"
                placeholder="Enter team name"
                value={formData.name}
                onChange={(e) =>
                  setFormData({ ...formData, name: e.target.value })
                }
                maxLength="100"
              />
            </div>
            <div className="form-group">
              <label>Description</label>
              <textarea
                placeholder="Team description"
                value={formData.description}
                onChange={(e) =>
                  setFormData({ ...formData, description: e.target.value })
                }
                maxLength="500"
                rows="3"
              />
            </div>
            <div className="form-group checkbox">
              <input
                type="checkbox"
                id="isPublic"
                checked={formData.isPublic}
                onChange={(e) =>
                  setFormData({ ...formData, isPublic: e.target.checked })
                }
              />
              <label htmlFor="isPublic">Make this team public</label>
            </div>
            <button type="submit" className="btn btn-primary">
              Create Team
            </button>
          </form>
        </div>
      )}

      {showJoinForm && (
        <div className="form-card">
          <h2>Join a Team</h2>
          <form onSubmit={handleJoinTeam}>
            <div className="form-group">
              <label>Invite Code *</label>
              <input
                type="text"
                placeholder="Enter 12-character invite code"
                value={joinCode}
                onChange={(e) => setJoinCode(e.target.value)}
                maxLength="12"
              />
              <small>Ask your team admin for the invite code</small>
            </div>
            <button type="submit" className="btn btn-primary">
              Join Team
            </button>
          </form>
        </div>
      )}

      <div className="teams-grid">
        {teams.length === 0 ? (
          <div className="empty-state">
            <p>No teams yet. Create or join a team to get started!</p>
          </div>
        ) : (
          teams.map((team) => (
            <div key={team._id} className="team-card">
              <div className="team-card-header">
                <h3>{team.name}</h3>
                <span className={`badge ${team.isPublic ? 'public' : 'private'}`}>
                  {team.isPublic ? 'Public' : 'Private'}
                </span>
              </div>
              {team.description && (
                <p className="team-description">{team.description}</p>
              )}
              <div className="team-info">
                <div className="info-item">
                  <span className="label">Members:</span>
                  <span className="value">{team.members.length}</span>
                </div>
                <div className="info-item">
                  <span className="label">Tasks:</span>
                  <span className="value">{team.taskCount}</span>
                </div>
              </div>
              <div className="team-members">
                <h4>Members</h4>
                <ul>
                  {team.members.slice(0, 3).map((member) => (
                    <li key={member.userId._id}>
                      <span className="member-name">{member.userId.name}</span>
                      <span className={`role ${member.role}`}>{member.role}</span>
                    </li>
                  ))}
                  {team.members.length > 3 && (
                    <li className="more">
                      +{team.members.length - 3} more
                    </li>
                  )}
                </ul>
              </div>
              <div className="invite-code">
                <label>Invite Code:</label>
                <code>{team.inviteCode}</code>
                <small>Share this code to invite members</small>
              </div>
              <div className="team-actions-card">
                <button
                  className="btn btn-secondary"
                  onClick={() => {
                    navigator.clipboard.writeText(team.inviteCode);
                    setSuccess('Invite code copied!');
                  }}
                >
                  Copy Code
                </button>
                {team.owner._id === localStorage.getItem('userId') && (
                  <button
                    className="btn btn-danger"
                    onClick={() => handleDeleteTeam(team._id)}
                  >
                    Delete
                  </button>
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

export default Team;
