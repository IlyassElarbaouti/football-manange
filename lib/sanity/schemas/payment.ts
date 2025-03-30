// lib/sanity/schemas/payment.ts
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
      description: 'When payment was recorded',
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
      initialValue: 'pending',
      validation: Rule => Rule.required(),
    },
    {
      name: 'notes',
      title: 'Notes',
      type: 'text',
      description: 'Additional payment information',
    },
    // New fields for match details
    {
      name: 'playDate',
      title: 'Play Date',
      type: 'date',
      description: 'The date when the match will be played',
    },
    {
      name: 'timeSlot',
      title: 'Time Slot',
      type: 'string',
      description: 'The time when the match will be played',
    },
    {
      name: 'matchDetails',
      title: 'Match Details',
      type: 'text',
      description: 'Additional details about the match provided by the person who paid',
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
  ],
  preview: {
    select: {
      user: 'user.name',
      match: 'match.title',
      amount: 'amount',
      date: 'date',
      status: 'status',
    },
    prepare({user, match, amount, date, status}) {
      const formattedDate = date ? new Date(date).toLocaleDateString() : '';
      const statusIcon = status === 'pending' ? '⏳' : status === 'completed' ? '✅' : '↩️';
      return {
        title: `${user || 'Unknown user'} - ${match || 'Unknown match'}`,
        subtitle: `${statusIcon} ${amount}₽ paid on ${formattedDate}`,
      };
    },
  },
}