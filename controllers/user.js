// Hachage de mot de passe
const bcrypt = require('bcrypt');

// Gestion de token
const jwt = require('jsonwebtoken');

const User = require('../models/User');

// Crpytage d'email
const CryptoJS = require('crypto-js');
function cryptEmail(email) {
  const key ="ky";
  const keyutf = CryptoJS.enc.Utf8.parse(key);
  const iv = CryptoJS.enc.Base64.parse(key);
  return CryptoJS.AES.encrypt(email, keyutf, { iv: iv }).toString();
}

//Création d'un compte
exports.signup = (req, res, next) => {
    bcrypt.hash(req.body.password, 10)
      .then(hash => {
        const user = new User({
          email: cryptEmail(req.body.email),
          password: hash
        });
        user.save()
          .then(() => res.status(201).json({message: 'Utilisateur a été créé !'}))
          .catch(error => res.status(400).json({error}));
      })
      .catch(error => res.status(500).json({error}));
};

// Login
exports.login = (req, res, next) => {
  User.findOne({email: cryptEmail(req.body.email)})
    .then(user => {
      if (!user) {
        return res.status(401).json({error: 'Utilisateur introuvable !'});
      }
      bcrypt.compare(req.body.password, user.password)
        .then(valid => {
          if (!valid) {
            return res.status(401).json({error: 'Mot de passe incorrect !'});
          }
          res.status(200).json({
            userId: user._id,
            token: jwt.sign(
              {userId: user._id},
              'RANDOM_TOKEN_SECRET',
              {expiresIn: '24h'}
            )
          });
        })
        .catch(error => res.status(500).json({error}));
    })
    .catch(error => res.status(500).json({error}));
};