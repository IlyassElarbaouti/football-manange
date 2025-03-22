export default {
    name: 'notification',
    title: 'Notification',
    type: 'document',
    fields: [
      {
        name: 'user',
        title: 'User',
        type: 'reference',
        to: [{type: 'user'}],
        description: 'User the notification is for',
        validation: Rule => Rule.required(),
      },
      {
        name: 'title',
        title: 'Title',
        type: 'string',
        description: 'Notification title',
        validation: Rule => Rule.required(),
      },
      {
        name: 'message',
        title: 'Message',
        type: 'text',
        description: 'Notification content',
        validation: Rule => Rule.required(),
      },
      {
        name: 'type',
        title: 'Type',
        type: 'string',
        options: {
          list: [
            {title: 'Match', value: 'match'},
            {title: 'Payment', value: 'payment'},
            {title: 'System', value: 'system'},
            {title: 'Achievement', value: 'achievement'},
          ],
        },
        description: 'Type of notification',
        validation: Rule => Rule.required(),
      },
      {
        name: 'relatedMatch',
        title: 'Related Match',
        type: 'reference',
        to: [{type: 'match'}],
        description: 'Related match if applicable',
      },
      {
        name: 'isRead',
        title: 'Is Read',
        type: 'boolean',
        description: 'Whether notification has been read',
        initialValue: false,
      },
      {
        name: 'createdAt',
        title: 'Created At',
        type: 'datetime',
        description: 'When notification was created',
        validation: Rule => Rule.required(),
      },
      {
        name: 'action',
        title: 'Action',
        type: 'object',
        fields: [
          {
            name: 'type',
            title: 'Type',
            type: 'string',
            options: {
              list: [
                {title: 'Link', value: 'link'},
                {title: 'Button', value: 'button'},
                {title: 'Dismiss', value: 'dismiss'},
              ],
            },
          },
          {
            name: 'url',
            title: 'URL',
            type: 'string',
            description: 'URL to navigate to if action is a link or button',
          },
        ],
        description: 'Optional action for the notification',
      },
    ],
    preview: {
      select: {
        title: 'title',
        user: 'user.name',
        type: 'type',
        date: 'createdAt',
      },
      prepare({title, user, type, date}) {
        const formattedDate = date ? new Date(date).toLocaleDateString() : '';
        return {
          title,
          subtitle: `To: ${user || 'Unknown user'} • Type: ${type} • ${formattedDate}`,
        };
      },
    },
  }