const Team = require('../models/Team');
const User = require('../models/User');
const crypto = require('crypto');

// Create a new team
exports.createTeam = async (req, res) => {
  try {
    const { name, description, isPublic } = req.body;
    const userId = req.userId;
    const normalizedName = typeof name === 'string' ? name.trim() : '';

    if (!normalizedName) {
      return res.status(400).json({
        success: false,
        message: 'Team name is required',
      });
    }

    // Check if team with same name already exists for this user
    const existingTeam = await Team.findOne({ owner: userId, name: normalizedName });
    if (existingTeam) {
      return res.status(400).json({
        success: false,
        message: 'You already have a team with this name',
      });
    }

    // Generate unique invite code
    const inviteCode = crypto.randomBytes(6).toString('hex');

    const team = await Team.create({
      name: normalizedName,
      description: typeof description === 'string' ? description.trim() : '',
      owner: userId,
      isPublic: isPublic === true,
      inviteCode,
      members: [
        {
          userId,
          role: 'admin',
        },
      ],
    });

    await team.populate('members.userId', 'name email');

    res.status(201).json({
      success: true,
      message: 'Team created successfully',
      data: team,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error creating team: ' + error.message,
    });
  }
};

// Get all teams for a user
exports.getUserTeams = async (req, res) => {
  try {
    const userId = req.userId;

    const teams = await Team.find({
      $or: [{ owner: userId }, { 'members.userId': userId }],
    })
      .populate('owner', 'name email')
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      data: teams,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching teams: ' + error.message,
    });
  }
};

// Get team details
exports.getTeam = async (req, res) => {
  try {
    const { teamId } = req.params;
    const userId = req.userId;

    const team = await Team.findById(teamId).populate('owner', 'name email');

    if (!team) {
      return res.status(404).json({
        success: false,
        message: 'Team not found',
      });
    }

    // Check if user is member of team
    const isMember = team.members.some((m) => m.userId.toString() === userId);
    const isOwner = team.owner._id.toString() === userId;

    if (!isMember && !isOwner && !team.isPublic) {
      return res.status(403).json({
        success: false,
        message: 'You do not have access to this team',
      });
    }

    // Public teams may be viewed by non-members, but their member list and
    // contact details are private. Return only safe summary fields.
    if (!isMember && !isOwner) {
      return res.status(200).json({
        success: true,
        data: {
          _id: team._id,
          name: team.name,
          description: team.description,
          isPublic: team.isPublic,
          taskCount: team.taskCount,
          createdAt: team.createdAt,
          owner: team.owner ? { _id: team.owner._id, name: team.owner.name } : null,
          memberCount: team.members.length,
        },
      });
    }

    res.status(200).json({
      success: true,
      data: team,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching team: ' + error.message,
    });
  }
};

// Add member to team using invite code
exports.joinTeam = async (req, res) => {
  try {
    const { inviteCode } = req.body;
    const userId = req.userId;

    if (!inviteCode || inviteCode.trim() === '') {
      return res.status(400).json({
        success: false,
        message: 'Invite code is required',
      });
    }

    const team = await Team.findOne({ inviteCode });

    if (!team) {
      return res.status(404).json({
        success: false,
        message: 'Invalid invite code',
      });
    }

    // Check if user is already a member
    const isMember = team.members.some((m) => m.userId.toString() === userId);
    if (isMember) {
      return res.status(400).json({
        success: false,
        message: 'You are already a member of this team',
      });
    }

    // Add user to team
    team.members.push({
      userId,
      role: 'member',
    });

    await team.save();
    await team.populate('members.userId', 'name email');

    res.status(200).json({
      success: true,
      message: 'Successfully joined team',
      data: team,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error joining team: ' + error.message,
    });
  }
};

// Remove member from team
exports.removeMember = async (req, res) => {
  try {
    const { teamId, memberId } = req.params;
    const userId = req.userId;

    const team = await Team.findById(teamId);

    if (!team) {
      return res.status(404).json({
        success: false,
        message: 'Team not found',
      });
    }

    // Only owner can remove members
    if (team.owner.toString() !== userId) {
      return res.status(403).json({
        success: false,
        message: 'Only team owner can remove members',
      });
    }

    // The owner must remain an owner/member; prevent self-removal.
    if (team.owner.toString() === memberId) {
      return res.status(400).json({
        success: false,
        message: 'The team owner cannot be removed',
      });
    }

    const memberExists = team.members.some((m) => m.userId.toString() === memberId);
    if (!memberExists) {
      return res.status(404).json({
        success: false,
        message: 'Team member not found',
      });
    }

    team.members = team.members.filter(
      (m) => m.userId.toString() !== memberId
    );

    await team.save();
    await team.populate('members.userId', 'name email');

    res.status(200).json({
      success: true,
      message: 'Member removed from team',
      data: team,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error removing member: ' + error.message,
    });
  }
};

// Update team
exports.updateTeam = async (req, res) => {
  try {
    const { teamId } = req.params;
    const { name, description, isPublic } = req.body;
    const userId = req.userId;

    const team = await Team.findById(teamId);

    if (!team) {
      return res.status(404).json({
        success: false,
        message: 'Team not found',
      });
    }

    // Only owner can update team
    if (team.owner.toString() !== userId) {
      return res.status(403).json({
        success: false,
        message: 'Only team owner can update team',
      });
    }

    if (name !== undefined) {
      if (typeof name !== 'string' || !name.trim()) {
        return res.status(400).json({
          success: false,
          message: 'Team name cannot be empty',
        });
      }
      team.name = name.trim();
    }
    if (description !== undefined) {
      if (typeof description !== 'string') {
        return res.status(400).json({
          success: false,
          message: 'Team description must be text',
        });
      }
      team.description = description.trim();
    }
    if (isPublic !== undefined) {
      if (typeof isPublic !== 'boolean') {
        return res.status(400).json({
          success: false,
          message: 'isPublic must be a boolean',
        });
      }
      team.isPublic = isPublic;
    }

    await team.save();
    await team.populate('members.userId', 'name email');

    res.status(200).json({
      success: true,
      message: 'Team updated successfully',
      data: team,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error updating team: ' + error.message,
    });
  }
};

// Delete team
exports.deleteTeam = async (req, res) => {
  try {
    const { teamId } = req.params;
    const userId = req.userId;

    const team = await Team.findById(teamId);

    if (!team) {
      return res.status(404).json({
        success: false,
        message: 'Team not found',
      });
    }

    // Only owner can delete team
    if (team.owner.toString() !== userId) {
      return res.status(403).json({
        success: false,
        message: 'Only team owner can delete team',
      });
    }

    await Team.findByIdAndDelete(teamId);

    res.status(200).json({
      success: true,
      message: 'Team deleted successfully',
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error deleting team: ' + error.message,
    });
  }
};

// Regenerate invite code
exports.regenerateInviteCode = async (req, res) => {
  try {
    const { teamId } = req.params;
    const userId = req.userId;

    const team = await Team.findById(teamId);

    if (!team) {
      return res.status(404).json({
        success: false,
        message: 'Team not found',
      });
    }

    // Only owner can regenerate code
    if (team.owner.toString() !== userId) {
      return res.status(403).json({
        success: false,
        message: 'Only team owner can regenerate invite code',
      });
    }

    team.inviteCode = crypto.randomBytes(6).toString('hex');
    await team.save();

    res.status(200).json({
      success: true,
      message: 'Invite code regenerated',
      data: {
        inviteCode: team.inviteCode,
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error regenerating invite code: ' + error.message,
    });
  }
};
