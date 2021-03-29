const Sauce = require('../models/Sauce');
const fs = require('fs');


//Création d'une sauce
exports.createSauce = (req, res, next) => {
    const sauceObject = JSON.parse(req.body.sauce);
    delete sauceObject._id;
    const sauce = new Sauce({
        ...sauceObject,
        imageUrl: `${req.protocol}://${req.get('host')}/images/${req.file.filename}`,
        likes: 0,
        dislikes: 0,
        usersLiked: [],
        usersDisliked: []
    });
    sauce.save()
      .then(() => res.status(201).json({ message: 'Sauce enregistrée !'}))
      .catch(error => res.status(400).json({error}));
};

// Modification d'une sauce
exports.modifySauce = (req, res, next) => {
    const sauceObject = req.file ?
        {
            ...JSON.parse(req.body.sauce),
            imageUrl: `${req.protocol}://${req.get('host')}/images/${req.file.filename}`
        } : {...req.body};
    Sauce.updateOne({_id: req.params.id}, { ...req.body, _id: req.params.id})
        .then(() => res.status(200).json({ message: 'Sauce modifiée !'}))
        .catch(error => res.status(400).json({error}));
};

// Suppression d'une sauce
exports.deleteSauce = (req, res, next) => {
    Sauce.findOne({_id: req.params.id})
        .then(sauce => {
            const filename = sauce.imageUrl.split('/images/')[1];
            fs.unlink(`images/${filename}`, () => {
                Sauce.deleteOne({_id: req.params.id})
                    .then(() => res.status(200).json({message: 'Sauce supprimée !'}))
                    .catch(error => res.status(400).json({error}));
            });
        })
        .catch(error => res.status(500).json({error}));
};

// Récupération d'une sauce
exports.getOneSauce = (req, res, next) => {
    Sauce.findOne({_id: req.params.id})
        .then(sauce => res.status(200).json(sauce))
        .catch(error => res.status(404).json({error}));
};

// Récupération de toutes les sauces
exports.getAllSauces = (req, res, next) => {
    Sauce.find()
        .then(sauces => res.status(200).json(sauces))
        .catch(error => res.status(400).json({error}));
};

// Evaluation d'une sauce
exports.rateSauce = (req, res, next) => {
    switch (req.body.like) {
        // Annuler Like ou Dislike
        case 0:
            Sauce.findOne({_id: req.params.id})
                .then(sauce => {
                    //Annulation de Like
                    if(sauce.usersLiked.includes(req.body.userId)) {
                        Sauce.updateOne({_id: req.params.id},{
                            $pull : {usersLiked: req.body.userId},
                            $inc : {likes: -1}
                        })
                        .then(() => res.status(200).json({message: 'Like annulé'}))
                        .catch(error => res.status(400).json({error}));
                    }
                    //Annulation de Dislike
                    if(sauce.usersDisliked.includes(req.body.userId)) {
                        Sauce.updateOne({_id: req.params.id},{
                            $pull : {usersDisliked: req.body.userId},
                            $inc : {dislikes: -1}
                        })
                        .then(() => res.status(200).json({message: 'Dislike annulé'}))
                        .catch(error => res.status(400).json({error}));
                    }
                })
                .catch(error => res.status(404).json({error}));
            break;

        // Dislike
        case -1:
            Sauce.updateOne({_id: req.params.id}, {
                $push: {usersDisliked: req.body.userId},
                $inc : {dislikes: 1}
            })
                .then(() => res.status(200).json({message: 'Dislike !'}))
                .catch(error => res.status(400).json({error}));
            break;

        // Like
        case 1:
            Sauce.updateOne({_id: req.params.id}, {
                $push: {usersLiked: req.body.userId},
                $inc : {likes: 1}
            })
                .then(() => res.status(200).json({message: 'Like !'}))
                .catch(error => res.status(400).json({error}));
            break;
        default :
            console.error('Votre requête est incorrecte');
    }
}