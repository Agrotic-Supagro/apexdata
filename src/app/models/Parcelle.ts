export class Parcelle{

    id_parcelle : string;
    nom_parcelle  : string;
    nom_proprietaire? : string;
    prenom_proprietaire? : string;
    
    public constructor(id_parcelle : string, nom_parcelle : string, nom_proprietaire? : string, prenom_proprietaire? : string,){
        this.id_parcelle = id_parcelle;
        this.nom_parcelle = nom_parcelle;
        this.nom_proprietaire = nom_proprietaire;
        this.prenom_proprietaire = prenom_proprietaire;
    }
    
}