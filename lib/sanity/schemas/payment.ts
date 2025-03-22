export default {
    name: 'payment',
    title: 'Payment',
    type: 'document',
    fields: [
      {
        name: 'user',
        title: 'User',
        type: 'reference',
        to: [{type: 'user'}],
        description: 'User who made the payment',
        validation: Rule => Rule.required(),
      },
      {
        name: 'match',
        title: 'Match',
        type: 'reference',
        to: [{type: 'match'}],
        description: 'Match the payment is for',
        validation: Rule => Rule.required(),
      },
      {
        name: 'amount',
        title: 'Amount',
        type: 'number',
        description: 'Amount paid',
        validation: Rule => Rule.required().min(0),
      },
      {
        name: 'date',
        title: 'Date',
        type: 'datetime',
        description: 'When payment was made',
        validation: Rule => Rule.required(),
      },
      {
        name: 'method',
        title: 'Method',
        type: 'string',
        options: {
          list: [
            {title: 'Cash', value: 'cash'},
            {title: 'Transfer', value: 'transfer'},
            {title: 'Other', value: 'other'},
          ],
        },
        description: 'Payment method used',
        validation: Rule => Rule.required(),
      },
      {
        name: 'status',
        title: 'Status',
        type: 'string',
        options: {
          list: [
            {title: 'Pending', value: 'pending'},
            {title: 'Completed', value: 'completed'},
            {title: 'Refunded', value: 'refunded'},
          ],
        },
        description: 'Payment status',
        initialValue: 'completed',
        validation: Rule => Rule.required(),
      },
      {
        name: 'receiptImage',
        title: 'Receipt Image',
        type: 'image',
        description: 'Optional receipt image',
        options: {
          hotspot: true,
        },
      },
      {
        name: 'notes',
        title: 'Notes',
        type: 'text',
        description: 'Additional payment information',
      },
    ],
    preview: {
      select: {
        user: 'user.name',
        match: 'match.title',
        amount: 'amount',
        date: 'date',
      },
      prepare({user, match, amount, date}) {
        const formattedDate = date ? new Date(date).toLocaleDateString() : '';
        return {
          title: `${user || 'Unknown user'} - ${match || 'Unknown match'}`,
          subtitle: `$${amount} paid on ${formattedDate}`,
        };
      },
    },
  }