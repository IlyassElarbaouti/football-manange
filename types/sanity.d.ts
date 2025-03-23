// Interface for User document
export interface User {
    _id: string;
    _type: 'user';
    clerkId: string;
    name: string;
    email: string;
    profileImage?: {
      _type: 'image';
      asset: {
        _ref: string;
        _type: 'reference';
      };
    };
    telegramUsername?: string;
    preferredPosition?: string;
    skillLevel?: number;
    isAdmin: boolean;
    matchesPlayed: number;
    matchesPaid: number;
    totalPayments: number;
    availableDays?: string[];
    achievements?: {
      _key: string;
      _ref: string;
      _type: 'reference';
    }[];
  }
  
  // Interface for Match document
 // types/sanity.d.ts - Updated Match interface
export interface Match {
  _id: string;
  _type: 'match';
  title: string;
  date: string;
  venue: {
    _ref: string;
    _type: 'reference';
  };
  matchType: string;
  totalSlots: number;
  filledSlots: number;
  totalCost?: number;
  costPerPlayer?: number;
  status: string;
  createdBy?: {
    _ref: string;
    _type: 'reference';
  };
  players?: {
    _key: string;
    user: {
      _ref: string;
      _type: 'reference';
    };
    confirmed: boolean;
    hasPaid: boolean;
    paymentAmount?: number;
    assignedPosition?: string;
  }[];
  queue?: {
    _key: string;
    user: {
      _ref: string;
      _type: 'reference';
    };
    timestamp: string;
  }[];
  weather?: {
    forecast?: string;
    temperature?: number;
    chanceOfRain?: number;
  };
  notes?: string;
  visibility?: 'public' | 'invite' | 'private';
  inviteCode?: string;
}
  // Interface for Venue document
  export interface Venue {
    _id: string;
    _type: 'venue';
    name: string;
    address: string;
    coordinates?: {
      _type: 'geopoint';
      lat: number;
      lng: number;
    };
    image?: {
      _type: 'image';
      asset: {
        _ref: string;
        _type: 'reference';
      };
    };
    hourlyRate?: number;
    supportedMatchTypes?: string[];
    amenities?: string[];
    indoorOutdoor: string;
    availableTimeSlots?: {
      _key: string;
      day: string;
      startTime: string;
      endTime: string;
    }[];
    contactInfo?: {
      phone?: string;
      email?: string;
      website?: string;
    };
  }
  
  // Interface for Payment document
  export interface Payment {
    _id: string;
    _type: 'payment';
    user: {
      _ref: string;
      _type: 'reference';
    };
    match: {
      _ref: string;
      _type: 'reference';
    };
    amount: number;
    date: string;
    method: string;
    status: string;
    receiptImage?: {
      _type: 'image';
      asset: {
        _ref: string;
        _type: 'reference';
      };
    };
    notes?: string;
  }
  
  // Interface for Achievement document
  export interface Achievement {
    _id: string;
    _type: 'achievement';
    title: string;
    description: string;
    icon: {
      _type: 'image';
      asset: {
        _ref: string;
        _type: 'reference';
      };
    };
    requirement?: {
      type: string;
      threshold?: number;
    };
    rarity: string;
    pointsValue: number;
  }
  
  // Interface for Notification document
  export interface Notification {
    _id: string;
    _type: 'notification';
    user: {
      _ref: string;
      _type: 'reference';
    };
    title: string;
    message: string;
    type: string;
    relatedMatch?: {
      _ref: string;
      _type: 'reference';
    };
    isRead: boolean;
    createdAt: string;
    action?: {
      type?: string;
      url?: string;
    };
  }
  
  // Interface for TelegramSettings document
  export interface TelegramSettings {
    _id: string;
    _type: 'telegramSettings';
    botToken: string;
    groupChatId: string;
    notificationTypes?: {
      _key: string;
      type: string;
      enabled: boolean;
      template?: string;
    }[];
    commandSettings?: {
      _key: string;
      command: string;
      description: string;
      enabled: boolean;
    }[];
  }