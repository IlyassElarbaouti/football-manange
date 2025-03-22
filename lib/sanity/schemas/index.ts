// Import all the schema types
import user from './user';
import match from './match';
import venue from './venue';
import payment from './payment';
import achievement from './achievement';
import notification from './notification';
import telegramSettings from './telegramSettings';

// Export as an array of schema types
export const schemaTypes = [
  user,
  match,
  venue,
  payment,
  achievement,
  notification,
  telegramSettings,
];