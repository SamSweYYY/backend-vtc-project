const express = require('express');
const Chauffeur = require('./chauffeurs'); 

const app = express();

// Middleware pour analyser les requêtes JSON
app.use(express.json());

// Middleware pour gérer les erreurs CORS
app.use((req, res, next) => {
    console.log('CORS middleware activé');
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content, Accept, Content-Type, Authorization');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, PATCH, OPTIONS');
    next();
});

// Route pour la racine
app.get('/', (req, res) => {
    console.log('Route GET / appelée');
    res.send('Bienvenue sur l\'API des chauffeurs !');
});

// Route pour créer un chauffeur
app.post('/chauffeurs', (req, res) => {
    console.log('Données reçues dans req.body:', req.body);  // Vérifie les données reçues

    // Vérifiez que toutes les données nécessaires sont présentes
    const { nom, prenom, email, telephone, vehicule, disponible } = req.body;
    console.log(req.body);
    if (!nom || !prenom || !email || !telephone || !vehicule || disponible === undefined) {
        return res.status(400).json({ error: 'Tous les champs sont requis' });
    }

    // Crée une instance de Chauffeur sans redéfinir la variable
    const nouveauChauffeur = new Chauffeur({
        nom,
        prenom,
        email,
        telephone,
        vehicule,
        disponible
    });

    nouveauChauffeur.save()
        .then(() => {
            console.log('Chauffeur créé avec succès');
            res.status(201).json({ message: 'Chauffeur créé', chauffeur: nouveauChauffeur });
        })
        .catch(error => {
            console.error('Erreur lors de la création du chauffeur:', error);
            res.status(400).json({ error });
        });
});

// Route pour récupérer la liste des chauffeurs
app.get('/chauffeurs', (req, res) => {
    console.log('Route GET /chauffeurs appelée');

    Chauffeur.find()
        .then(drivers => {
            console.log('Liste des chauffeurs récupérée:', drivers);
            res.status(200).json(drivers);
        })
        .catch(error => {
            console.error('Erreur lors de la récupération des chauffeurs:', error);
            res.status(400).json({ error: error.message });
        });
});

// Route pour remplacer complètement un chauffeur
app.put('/chauffeurs/:id', (req, res) => {
    const { id } = req.params;
    const updatedData = req.body;

    console.log(`Route PUT /chauffeurs/${id} appelée avec données:`, updatedData);

    // Vérifiez que toutes les données nécessaires sont présentes
    const { nom, prenom, email, telephone, vehicule, disponible } = updatedData;
    if (!nom || !prenom || !email || !telephone || !vehicule || disponible === undefined) {
        return res.status(400).json({ error: 'Tous les champs sont requis pour un remplacement complet' });
    }

    // Remplacer complètement le document
    Chauffeur.findByIdAndUpdate(id, updatedData, { new: true, overwrite: true, runValidators: true })
        .then(driver => {
            if (!driver) {
                console.log('Chauffeur non trouvé pour remplacement');
                return res.status(404).json({ message: 'Chauffeur non trouvé' });
            }
            console.log('Chauffeur remplacé avec succès:', driver);
            res.status(200).json(driver);
        })
        .catch(error => {
            console.error('Erreur lors du remplacement du chauffeur:', error);
            res.status(400).json({ error });
        });
});

// Route pour mettre à jour un chauffeur
app.patch('/chauffeurs/:id', (req, res) => {
    const { id } = req.params;
    const updatedData = req.body;

    console.log(`Route PATCH /chauffeurs/${id} appelée avec données:`, updatedData);

    if (updatedData._id) {
        delete updatedData._id;
    }

    Chauffeur.findByIdAndUpdate(id, updatedData, { new: true, runValidators: true })
        .then(driver => {
            if (!driver) {
                console.log('Chauffeur non trouvé pour mise à jour');
                return res.status(404).json({ message: 'Chauffeur non trouvé' });
            }
            console.log('Chauffeur mis à jour:', driver);
            res.status(200).json(driver);
        })
        .catch(error => {
            console.error('Erreur lors de la mise à jour du chauffeur:', error);
            res.status(400).json({ error });
        });
});

// Route pour supprimer un chauffeur
app.delete('/chauffeurs/:id', (req, res) => {
    const { id } = req.params;

    console.log(`Route DELETE /chauffeurs/${id} appelée`);

    Chauffeur.findByIdAndDelete(id)
        .then(driver => {
            if (!driver) {
                console.log('Chauffeur non trouvé pour suppression');
                return res.status(404).json({ message: 'Chauffeur non trouvé' });
            }
            console.log('Chauffeur supprimé avec succès');
            res.status(200).json({ message: 'Chauffeur supprimé' });
        })
        .catch(error => {
            console.error('Erreur lors de la suppression du chauffeur:', error);
            res.status(400).json({ error });
        });
});

// Exporter l'app
module.exports = app;
