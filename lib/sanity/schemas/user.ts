const userSchema = {
    name: 'user',
    title: 'User',
    type: 'document',
    fields: [
      {
        name: 'clerkId',
        title: 'Clerk ID',
        type: 'string',
        description: 'Unique Clerk user ID',
        validation: Rule => Rule.required(),
      },
      {
        name: 'name',
        title: 'Name',
        type: 'string',
        description: 'User\'s full name',
        validation: Rule => Rule.required(),
      },
      {
        name: 'email',
        title: 'Email',
        type: 'string',
        description: 'User\'s email address',
        validation: Rule => Rule.required().email(),
      },
      {
        name: 'profileImage',
        title: 'Profile Image',
        type: 'image',
        description: 'User\'s profile picture',
        options: {
          hotspot: true,
        },
      },
      {
        name: 'telegramUsername',
        title: 'Telegram Username',
        type: 'string',
        description: 'User\'s Telegram username',
      },
      {
        name: 'preferredPosition',
        title: 'Preferred Position',
        type: 'string',
        description: 'User\'s preferred playing position',
        options: {
          list: [
            {title: 'Goalkeeper', value: 'goalkeeper'},
            {title: 'Defender', value: 'defender'},
            {title: 'Midfielder', value: 'midfielder'},
            {title: 'Forward', value: 'forward'},
            {title: 'Any Position', value: 'any'},
          ],
        },
      },
      {
        name: 'skillLevel',
        title: 'Skill Level',
        type: 'number',
        description: 'User\'s skill rating (1-100)',
        validation: Rule => Rule.min(1).max(100),
      },
      {
        name: 'isAdmin',
        title: 'Is Admin',
        type: 'boolean',
        description: 'Whether user has admin privileges',
        initialValue: false,
      },
      {
        name: 'matchesPlayed',
        title: 'Matches Played',
        type: 'number',
        description: 'Total number of matches played',
        initialValue: 0,
      },
      {
        name: 'matchesPaid',
        title: 'Matches Paid',
        type: 'number',
        description: 'Total number of matches paid for',
        initialValue: 0,
      },
      {
        name: 'totalPayments',
        title: 'Total Payments',
        type: 'number',
        description: 'Total amount paid by user',
        initialValue: 0,
      },
      {
        name: 'availableDays',
        title: 'Available Days',
        type: 'array',
        of: [{type: 'string'}],
        description: 'Days of the week user is typically available',
        options: {
          list: [
            {title: 'Monday', value: 'monday'},
            {title: 'Tuesday', value: 'tuesday'},
            {title: 'Wednesday', value: 'wednesday'},
            {title: 'Thursday', value: 'thursday'},
            {title: 'Friday', value: 'friday'},
            {title: 'Saturday', value: 'saturday'},
            {title: 'Sunday', value: 'sunday'},
          ],
        },
      },
      {
        name: 'achievements',
        title: 'Achievements',
        type: 'array',
        of: [{type: 'reference', to: [{type: 'achievement'}]}],
        description: 'Achievements earned by user',
      },
    ],
    preview: {
      select: {
        title: 'name',
        subtitle: 'email',
        media: 'profileImage',
      },
    },
  }

  export default userSchema