export default {
    name: 'telegramSettings',
    title: 'Telegram Settings',
    type: 'document',
    fields: [
      {
        name: 'botToken',
        title: 'Bot Token',
        type: 'string',
        description: 'Telegram bot API token',
        validation: Rule => Rule.required(),
      },
      {
        name: 'groupChatId',
        title: 'Group Chat ID',
        type: 'string',
        description: 'ID of the main Telegram group',
        validation: Rule => Rule.required(),
      },
      {
        name: 'notificationTypes',
        title: 'Notification Types',
        type: 'array',
        of: [
          {
            type: 'object',
            fields: [
              {
                name: 'type',
                title: 'Type',
                type: 'string',
                options: {
                  list: [
                    {title: 'New Match', value: 'newMatch'},
                    {title: 'Match Reminder', value: 'matchReminder'},
                    {title: 'Payment Reminder', value: 'paymentReminder'},
                    {title: 'Player Joined', value: 'playerJoined'},
                    {title: 'Player Left', value: 'playerLeft'},
                    {title: 'Match Cancelled', value: 'matchCancelled'},
                  ],
                },
                validation: Rule => Rule.required(),
              },
              {
                name: 'enabled',
                title: 'Enabled',
                type: 'boolean',
                initialValue: true,
              },
              {
                name: 'template',
                title: 'Template',
                type: 'text',
                description: 'Message template with placeholders like {{matchTitle}}',
              },
            ],
          },
        ],
        description: 'Configurable notification types and templates',
      },
      {
        name: 'commandSettings',
        title: 'Command Settings',
        type: 'array',
        of: [
          {
            type: 'object',
            fields: [
              {
                name: 'command',
                title: 'Command',
                type: 'string',
                validation: Rule => Rule.required(),
              },
              {
                name: 'description',
                title: 'Description',
                type: 'string',
                validation: Rule => Rule.required(),
              },
              {
                name: 'enabled',
                title: 'Enabled',
                type: 'boolean',
                initialValue: true,
              },
            ],
          },
        ],
        description: 'Bot command configurations',
      },
    ],
    preview: {
      select: {
        title: 'botToken',
        groupChatId: 'groupChatId',
      },
      prepare({title, groupChatId}) {
        return {
          title: 'Telegram Bot Settings',
          subtitle: `Group Chat ID: ${groupChatId || 'Not set'}`,
        };
      },
    },
  }