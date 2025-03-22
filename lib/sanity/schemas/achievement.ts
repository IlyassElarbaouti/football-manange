export default {
    name: 'achievement',
    title: 'Achievement',
    type: 'document',
    fields: [
      {
        name: 'title',
        title: 'Title',
        type: 'string',
        description: 'Name of the achievement',
        validation: Rule => Rule.required(),
      },
      {
        name: 'description',
        title: 'Description',
        type: 'text',
        description: 'What the achievement represents',
        validation: Rule => Rule.required(),
      },
      {
        name: 'icon',
        title: 'Icon',
        type: 'image',
        description: 'Achievement badge icon',
        options: {
          hotspot: true,
        },
        validation: Rule => Rule.required(),
      },
      {
        name: 'requirement',
        title: 'Requirement',
        type: 'object',
        fields: [
          {
            name: 'type',
            title: 'Type',
            type: 'string',
            options: {
              list: [
                {title: 'Matches Played', value: 'matchesPlayed'},
                {title: 'Matches Paid', value: 'matchesPaid'},
                {title: 'Consecutive Matches', value: 'consecutive'},
                {title: 'Special Achievement', value: 'special'},
              ],
            },
            validation: Rule => Rule.required(),
          },
          {
            name: 'threshold',
            title: 'Threshold',
            type: 'number',
            description: 'Number required to earn the achievement',
            validation: Rule => Rule.min(1),
          },
        ],
        description: 'Requirements to earn achievement',
      },
      {
        name: 'rarity',
        title: 'Rarity',
        type: 'string',
        options: {
          list: [
            {title: 'Common', value: 'common'},
            {title: 'Uncommon', value: 'uncommon'},
            {title: 'Rare', value: 'rare'},
            {title: 'Legendary', value: 'legendary'},
          ],
        },
        description: 'How difficult the achievement is to earn',
        validation: Rule => Rule.required(),
      },
      {
        name: 'pointsValue',
        title: 'Points Value',
        type: 'number',
        description: 'Points added to leaderboard when earned',
        validation: Rule => Rule.required().min(0),
      },
    ],
    preview: {
      select: {
        title: 'title',
        rarity: 'rarity',
        media: 'icon',
      },
      prepare({title, rarity, media}) {
        return {
          title,
          subtitle: `${rarity ? rarity.charAt(0).toUpperCase() + rarity.slice(1) : ''} Achievement`,
          media,
        };
      },
    },
  }