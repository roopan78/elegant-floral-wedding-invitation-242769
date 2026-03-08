const express = require('express');
const healthController = require('../controllers/health');

const router = express.Router();
// Health endpoint

/**
 * @swagger
 * /:
 *   get:
 *     tags: [Health]
 *     summary: Health endpoint
 *     responses:
 *       200:
 *         description: Service health check passed
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: ok
 *                 message:
 *                   type: string
 *                   example: Service is healthy
 *                 timestamp:
 *                   type: string
 *                   format: date-time
 *                 environment:
 *                   type: string
 *                   example: development
 */
router.get('/', healthController.check.bind(healthController));

/**
 * @swagger
 * /api/invitation/config:
 *   get:
 *     tags: [Invitation]
 *     summary: Get invitation configuration payload
 *     description: >
 *       Returns the invitation configuration used by the Next.js frontend to render the wedding invitation page.
 *       Values may be overridden via environment variables for deployment.
 *     responses:
 *       200:
 *         description: Invitation configuration payload
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/InvitationConfig'
 */
router.get('/api/invitation/config', (req, res) => {
  // Environment overrides (optional). Defaults are safe placeholders for development.
  const partnerOneName = process.env.INVITE_PARTNER_ONE_NAME || 'Ava';
  const partnerTwoName = process.env.INVITE_PARTNER_TWO_NAME || 'Noah';
  const dateISO =
    process.env.INVITE_EVENT_DATE_ISO || '2026-06-20T16:00:00-04:00';
  const venueName = process.env.INVITE_VENUE_NAME || 'Willow Garden';
  const address =
    process.env.INVITE_VENUE_ADDRESS || '123 Floral Lane, Charleston, SC';
  const timezone = process.env.INVITE_EVENT_TIMEZONE || 'America/New_York';

  const mapUrl =
    process.env.INVITE_MAP_URL ||
    'https://maps.google.com/?q=Willow+Garden';
  const calendarUrl = process.env.INVITE_CALENDAR_URL || '';

  // Feature flags may come from NEXT_PUBLIC_FEATURE_FLAGS as JSON string.
  // Example: {"rsvpEnabled":true}
  let featureFlags = { rsvpEnabled: false };
  if (process.env.NEXT_PUBLIC_FEATURE_FLAGS) {
    try {
      featureFlags = {
        ...featureFlags,
        ...JSON.parse(process.env.NEXT_PUBLIC_FEATURE_FLAGS),
      };
    } catch (e) {
      // Ignore malformed JSON; keep defaults to avoid breaking the frontend.
    }
  }

  return res.status(200).json({
    couple: { partnerOneName, partnerTwoName },
    event: { dateISO, venueName, address, timezone },
    links: { mapUrl, calendarUrl },
    assets: {
      heroImageUrl: process.env.INVITE_HERO_IMAGE_URL || '',
    },
    ui: {
      accentColor: process.env.INVITE_ACCENT_COLOR || '#16A34A',
      primaryColor: process.env.INVITE_PRIMARY_COLOR || '#0F172A',
    },
    featureFlags,
  });
});

/**
 * OPTIONAL RSVP:
 * This is a lightweight in-memory endpoint for development/demo purposes.
 * If persistence is needed later, swap the storage implementation for a DB.
 */

/**
 * @swagger
 * /api/rsvp:
 *   post:
 *     tags: [RSVP]
 *     summary: Submit an RSVP (optional)
 *     description: >
 *       Accepts an RSVP submission. This template implementation does not persist data.
 *       It only validates a minimal payload and responds with a receipt timestamp.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/RsvpRequest'
 *     responses:
 *       200:
 *         description: RSVP receipt
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/RsvpResponse'
 *       400:
 *         description: Invalid payload
 */
router.post('/api/rsvp', (req, res) => {
  const { name, attending } = req.body || {};

  if (!name || typeof name !== 'string') {
    return res.status(400).json({
      status: 'error',
      message: 'Invalid payload: name is required.',
    });
  }
  if (typeof attending !== 'boolean') {
    return res.status(400).json({
      status: 'error',
      message: 'Invalid payload: attending must be a boolean.',
    });
  }

  return res.status(200).json({
    status: 'received',
    receivedAt: new Date().toISOString(),
  });
});

module.exports = router;
