export default {
    name: 'venue',
    title: 'Venue',
    type: 'document',
    fields: [
      {
        name: 'name',
        title: 'Name',
        type: 'string',
        description: 'Name of the venue',
        validation: Rule => Rule.required(),
      },
      {
        name: 'address',
        title: 'Address',
        type: 'string',
        description: 'Physical address',
        validation: Rule => Rule.required(),
      },
      {
        name: 'coordinates',
        title: 'Coordinates',
        type: 'geopoint',
        description: 'GPS coordinates for map',
      },
      {
        name: 'image',
        title: 'Image',
        type: 'image',
        description: 'Image of the venue',
        options: {
          hotspot: true,
        },
      },
      {
        name: 'hourlyRate',
        title: 'Hourly Rate',
        type: 'number',
        description: 'Cost per hour',
        validation: Rule => Rule.min(0),
      },
      {
        name: 'supportedMatchTypes',
        title: 'Supported Match Types',
        type: 'array',
        of: [{type: 'string'}],
        options: {
          list: [
            {title: '5-aside', value: '5-aside'},
            {title: '7-aside', value: '7-aside'},
            {title: '11-aside', value: '11-aside'},
          ],
        },
        description: 'Match types venue can support',
      },
      {
        name: 'amenities',
        title: 'Amenities',
        type: 'array',
        of: [{type: 'string'}],
        options: {
          list: [
            {title: 'Changing Rooms', value: 'changing_rooms'},
            {title: 'Showers', value: 'showers'},
            {title: 'Parking', value: 'parking'},
            {title: 'Floodlights', value: 'floodlights'},
            {title: 'Refreshments', value: 'refreshments'},
            {title: 'Equipment Rental', value: 'equipment_rental'},
          ],
        },
        description: 'Available facilities',
      },
      {
        name: 'indoorOutdoor',
        title: 'Indoor/Outdoor',
        type: 'string',
        options: {
          list: [
            {title: 'Indoor', value: 'indoor'},
            {title: 'Outdoor', value: 'outdoor'},
            {title: 'Both', value: 'both'},
          ],
        },
        description: 'Venue type',
        validation: Rule => Rule.required(),
      },
      {
        name: 'availableTimeSlots',
        title: 'Available Time Slots',
        type: 'array',
        of: [
          {
            type: 'object',
            fields: [
              {
                name: 'day',
                title: 'Day',
                type: 'string',
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
                name: 'startTime',
                title: 'Start Time',
                type: 'string',
              },
              {
                name: 'endTime',
                title: 'End Time',
                type: 'string',
              },
            ],
          },
        ],
        description: 'When venue is typically available',
      },
      {
        name: 'contactInfo',
        title: 'Contact Info',
        type: 'object',
        fields: [
          {
            name: 'phone',
            title: 'Phone',
            type: 'string',
          },
          {
            name: 'email',
            title: 'Email',
            type: 'string',
          },
          {
            name: 'website',
            title: 'Website',
            type: 'url',
          },
        ],
        description: 'Venue contact information',
      },
    ],
    preview: {
      select: {
        title: 'name',
        subtitle: 'address',
        media: 'image',
      },
    },
  }