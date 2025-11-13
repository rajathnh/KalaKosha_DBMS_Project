const createTokenUser = (user) => {
      return { name: user.username, userId: user.user_id, role: user.role };

  };
  
  module.exports = createTokenUser;
  