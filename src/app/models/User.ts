export class User{

    id_utilisateur : string;
    nom : string;
    prenom : string;
    email : string;
    mot_de_passe : string;
    structure : string;
    
    public constructor(id_utilisateur : string, prenom : string, nom : string, email : string, mot_de_passe : string, structure : string){
        this.id_utilisateur = id_utilisateur;
        this.nom = nom;
        this.prenom = prenom;
        this.email = email;
        this.mot_de_passe = mot_de_passe;
        this.structure = structure;
    }
    
}