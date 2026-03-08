const swaggerJSDoc = require('swagger-jsdoc');

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Wedding Invitation API',
      version: '1.0.0',
      description:
        'Backend API for the wedding invitation web app (configuration payload for the invitation page, plus optional RSVP).',
    },
    tags: [
      { name: 'Health', description: 'Service health and diagnostics' },
      {
        name: 'Invitation',
        description: 'Invitation configuration payload consumed by the frontend',
      },
      { name: 'RSVP', description: 'Optional RSVP endpoints' },
    ],
    components: {
      schemas: {
        InvitationConfig: {
          type: 'object',
          description:
            'Configuration payload used by the frontend to render the invitation.',
          properties: {
            couple: {
              type: 'object',
              properties: {
                partnerOneName: { type: 'string', example: 'Ava' },
                partnerTwoName: { type: 'string', example: 'Noah' },
              },
              required: ['partnerOneName', 'partnerTwoName'],
            },
            event: {
              type: 'object',
              properties: {
                dateISO: {
                  type: 'string',
                  format: 'date-time',
                  example: '2026-06-20T16:00:00-04:00',
                },
                venueName: { type: 'string', example: 'Willow Garden' },
                address: {
                  type: 'string',
                  example: '123 Floral Lane, Charleston, SC',
                },
                timezone: { type: 'string', example: 'America/New_York' },
              },
              required: ['dateISO', 'venueName'],
            },
            links: {
              type: 'object',
              properties: {
                mapUrl: {
                  type: 'string',
                  format: 'uri',
                  example: 'https://maps.google.com/?q=Willow+Garden',
                },
                calendarUrl: {
                  type: 'string',
                  format: 'uri',
                  example: 'https://example.com/calendar.ics',
                },
              },
            },
            assets: {
              type: 'object',
              properties: {
                heroImageUrl: { type: 'string', example: '/assets/hero.jpg' },
              },
            },
            ui: {
              type: 'object',
              properties: {
                accentColor: { type: 'string', example: '#16A34A' },
                primaryColor: { type: 'string', example: '#0F172A' },
              },
            },
            featureFlags: {
              type: 'object',
              additionalProperties: { type: 'boolean' },
              example: { rsvpEnabled: false },
            },
          },
          required: ['couple', 'event'],
        },
        RsvpRequest: {
          type: 'object',
          properties: {
            name: { type: 'string', example: 'Jordan Smith' },
            email: { type: 'string', format: 'email', example: 'jordan@email.com' },
            attending: { type: 'boolean', example: true },
            guests: { type: 'integer', minimum: 0, example: 1 },
            message: { type: 'string', example: 'So excited for you both!' },
          },
          required: ['name', 'attending'],
        },
        RsvpResponse: {
          type: 'object',
          properties: {
            status: { type: 'string', example: 'received' },
            receivedAt: { type: 'string', format: 'date-time' },
          },
          required: ['status', 'receivedAt'],
        },
      },
    },
  },
  apis: ['./src/routes/*.js'], // Path to the API docs
};

const swaggerSpec = swaggerJSDoc(options);
module.exports = swaggerSpec;
