const express = require('express');
const router = express.Router();
const {
  createTeam,
  getUserTeams,
  getTeam,
  joinTeam,
  removeMember,
  updateTeam,
  deleteTeam,
  regenerateInviteCode,
} = require('../controllers/TeamController');
const auth = require('../middleware/auth');

// All routes require authentication
router.use(auth);

// GET /api/teams - Get all teams for logged-in user
router.get('/', getUserTeams);

// POST /api/teams - Create a new team
router.post('/', createTeam);

// POST /api/teams/join - Join a team with invite code
router.post('/join', joinTeam);

// GET /api/teams/:teamId - Get team details
router.get('/:teamId', getTeam);

// PUT /api/teams/:teamId - Update team
router.put('/:teamId', updateTeam);

// DELETE /api/teams/:teamId - Delete team
router.delete('/:teamId', deleteTeam);

// DELETE /api/teams/:teamId/members/:memberId - Remove team member
router.delete('/:teamId/members/:memberId', removeMember);

// POST /api/teams/:teamId/regenerate-code - Regenerate invite code
router.post('/:teamId/regenerate-code', regenerateInviteCode);

module.exports = router;
