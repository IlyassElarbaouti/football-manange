// lib/sanity/schemas/match.ts
 const match = {
  name: 'match',
  title: 'Match',
  type: 'document',
  fields: [
    {
      name: 'title',
      title: 'Title',
      type: 'string',
      description: 'Name/title of the match',
      validation: Rule => Rule.required(),
    },
    {
      name: 'date',
      title: 'Date',
      type: 'datetime',
      description: 'Date and time of the match',
      validation: Rule => Rule.required(),
    },
    {
      name: 'venue',
      title: 'Venue',
      type: 'reference',
      to: [{type: 'venue'}],
      description: 'Where the match will be played',
      validation: Rule => Rule.required(),
    },
    {
      name: 'matchType',
      title: 'Match Type',
      type: 'string',
      options: {
        list: [
          {title: '5-aside', value: '5-aside'},
          {title: '7-aside', value: '7-aside'},
          {title: '11-aside', value: '11-aside'},
        ],
      },
      description: 'Type of match',
      validation: Rule => Rule.required(),
    },
    {
      name: 'totalSlots',
      title: 'Total Slots',
      type: 'number',
      description: 'Total number of players needed',
      validation: Rule => Rule.required().min(1),
    },
    {
      name: 'filledSlots',
      title: 'Filled Slots',
      type: 'number',
      description: 'Current number of confirmed players',
      initialValue: 0,
      validation: Rule => Rule.min(0),
    },
    {
      name: 'totalCost',
      title: 'Total Cost',
      type: 'number',
      description: 'Total cost of the venue',
      validation: Rule => Rule.min(0),
    },
    {
      name: 'costPerPlayer',
      title: 'Cost Per Player',
      type: 'number',
      description: 'Cost divided by total players',
      validation: Rule => Rule.min(0),
    },
    {
      name: 'status',
      title: 'Status',
      type: 'string',
      options: {
        list: [
          {title: 'Scheduled', value: 'scheduled'},
          {title: 'In Progress', value: 'in-progress'},
          {title: 'Completed', value: 'completed'},
          {title: 'Cancelled', value: 'cancelled'},
        ],
      },
      description: 'Current status of the match',
      initialValue: 'scheduled',
    },
    {
      name: 'createdBy',
      title: 'Created By',
      type: 'reference',
      to: [{type: 'user'}],
      description: 'User who created the match',
    },
    {
      name: 'players',
      title: 'Players',
      type: 'array',
      of: [
        {
          type: 'object',
          fields: [
            {
              name: 'user',
              title: 'User',
              type: 'reference',
              to: [{type: 'user'}],
              validation: Rule => Rule.required(),
            },
            {
              name: 'confirmed',
              title: 'Confirmed',
              type: 'boolean',
              initialValue: false,
            },
            {
              name: 'hasPaid',
              title: 'Has Paid',
              type: 'boolean',
              initialValue: false,
            },
            {
              name: 'paymentAmount',
              title: 'Payment Amount',
              type: 'number',
              validation: Rule => Rule.min(0),
            },
            {
              name: 'assignedPosition',
              title: 'Assigned Position',
              type: 'string',
              options: {
                list: [
                  {title: 'Goalkeeper', value: 'goalkeeper'},
                  {title: 'Defender', value: 'defender'},
                  {title: 'Midfielder', value: 'midfielder'},
                  {title: 'Forward', value: 'forward'},
                  {title: 'Unassigned', value: 'unassigned'},
                ],
              },
              initialValue: 'unassigned',
            },
          ],
        },
      ],
      description: 'List of players and their status',
    },
    {
      name: 'queue',
      title: 'Waiting Queue',
      type: 'array',
      of: [
        {
          type: 'object',
          fields: [
            {
              name: 'user',
              title: 'User',
              type: 'reference',
              to: [{type: 'user'}],
              validation: Rule => Rule.required(),
            },
            {
              name: 'timestamp',
              title: 'Joined At',
              type: 'datetime',
              description: 'When user joined the queue',
              validation: Rule => Rule.required(),
            },
          ],
        },
      ],
      description: 'Users waiting to join if spots become available',
    },
    {
      name: 'weather',
      title: 'Weather',
      type: 'object',
      fields: [
        {
          name: 'forecast',
          title: 'Forecast',
          type: 'string',
        },
        {
          name: 'temperature',
          title: 'Temperature',
          type: 'number',
        },
        {
          name: 'chanceOfRain',
          title: 'Chance Of Rain',
          type: 'number',
          validation: Rule => Rule.min(0).max(100),
        },
      ],
      description: 'Weather forecast for match day',
    },
    {
      name: 'notes',
      title: 'Notes',
      type: 'text',
      description: 'Additional match information',
    },
    {
      name: 'visibility',
      title: 'Visibility',
      type: 'string',
      options: {
        list: [
          {title: 'Public', value: 'public'},
          {title: 'Invite Only', value: 'invite'},
          {title: 'Private', value: 'private'},
        ],
      },
      description: 'Who can see and join this match',
      initialValue: 'public',
    },
    {
      name: 'inviteCode',
      title: 'Invite Code',
      type: 'string',
      description: 'Code for invite-only matches',
    },
  ],
  preview: {
    select: {
      title: 'title',
      date: 'date',
      venue: 'venue.name',
    },
    prepare({title, date, venue}) {
      const formattedDate = date ? new Date(date).toLocaleDateString() : '';
      return {
        title,
        subtitle: `${formattedDate} at ${venue || 'Unknown venue'}`,
      };
    },
  },
}

export default match