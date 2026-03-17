'use strict';

module.exports = ({ env }) => ({
  'users-permissions': {
    config: {
      jwt: {
        expiresIn: '2h',
      },
    },
  },
});
