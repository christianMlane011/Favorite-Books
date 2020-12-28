const jwt = require('jsonwebtoken');
const { User } = require('../models/user');

const auth = (req, res, next) => {

  const token = req.cookies.jwt;

  

  if (!token) {
    return res.status(401).send({ error: 'You are not authenticated' });
  };

  jwt.verify(token, process.env.JWT_SECRET, async (err, decodedToken) => {

    if (err) {
      return res.status(401).send({ error: 'You are not authenticated' });
    } else {
      // console.log(decodedToken);
      const user = await User.findById(decodedToken.id);
      req.user = user;  
      next();
    };    
  });
};

module.exports = {
  auth
};